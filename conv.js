
  const CONV_CHUNK_PAUSE_MS = 1400;
  const CONV_NPC_REPLY_DELAY_MS = 2200; // delay before NPC first replies
  const CONV_INVITE_DELAY_MS = 3000; // delay before invite/filler beat
  const CONV_READ_MIN_MS = 3500; // minimum read time for NPC lines
  const CONV_READ_MS_PER_WORD = 220; // ms per word for dynamic read delay
  const CONV_CLOSE_MS = 2500; // delay before conv closes after final line
  const CONV_BAIL_MS = 2200; // delay after bail/walk away responses
  const CONV_TYPING_ENABLED = false;

  const CONV_TYPE_MS = 65; // ms per character
  const CONV_TYPE_PUNCT_MS = 120; // ms extra pause after . ? !
  const CONV_TYPE_COMMA_MS = 60; // ms extra pause after ,




  function convTypingDone() {
    if (_convChunkQueue.length > 0) return false;
    const li = convLog.length - 1;
    if (li < 0) return true;
    return (convReveal[li] ?? 0) >= convLog[li].text.length;
  }

  let _convChunkQueue = [];
  let _convChunkTimer = 0;
  let convLog = [];
  let convChoices = null;
  let convPlayerColor = C_PLAYER;

  let convNPCColor = C_DIM;
  let convVisible = false;
  let convFading = false;
  let convFadeTimer = 0;
  const convFadeDuration = 180; // ms to fade out - fast and snappy for retro feel
  let convAnchorPX = 0;
  let convAnchorNX = 10;
  let convAnchorY = 10;
  let convEncounterIndex = 0; // Track which encounter this is for positioning adjustments
  let convChoiceY1 = 0,
    convChoiceY2 = 0,
    convChoiceHover = -1,
    convChoicePicked = -1,
    convChoiceYs = []; // start row of each choice
  let convReveal = [];
  let _convTypeTimer = 0;

  function convReset() {
    convLog = [];
    convChoices = null;
    convVisible = false;
    convFading = false;
    convFadeTimer = 0;
    convChoiceY1 = 0;
    convChoiceY2 = 0;
    convChoiceHover = -1;
    convChoicePicked = -1;

    _convChunkQueue = [];
    _convChunkTimer = 0;
    convReveal = [];
    _convTypeTimer = 0;
  }

  function convStartFade() {
    if (!convVisible) return;
    convFading = true;
    convFadeTimer = 0;
  }

  function convEndWhenDone(extraMs, thenFn) {
    // waits for typing AND chunks to finish, holds extraMs, then calls thenFn
    const extra = extraMs || 1200;
    const startPhase = phase;
    const check = setInterval(() => {
      if (phase !== startPhase) {
        clearInterval(check);
        return;
      }
      if (_convChunkQueue.length > 0) return;
      const li = convLog.length - 1;
      if (li < 0 || convReveal[li] >= convLog[li].text.length) {
        clearInterval(check);
        setTimeout(() => {
          if (phase === startPhase) thenFn();
        }, extra);
      }
    }, 50);
  }

  function _convChunkFlush() {
    const q = _convChunkQueue[0];
    if (!q) return;
    const chunk = q.chunks[q.idx];
    audio.play(q.side === "you" ? "playertxtbox" : "npctxtbox");
    const last = convLog[convLog.length - 1];
    if (last && last.side === q.side) {
      const sep = chunk.startsWith("\n") ? "" : " ";
      last.text = last.text + sep + chunk;
    } else {
      convLog.push({ text: chunk, side: q.side, color: q.color });
      convReveal.push(0);
    }
    q.idx++;
    if (q.idx >= q.chunks.length) {
      _convChunkQueue.shift();
    }
  }

  function convAddLine(text, side, color) {
    const normalized = text.replace(/\n\n/g, "|pause|__BREAK2__").replace(/\n/g, "|pause|__BREAK1__");
    const rawChunks = normalized.split("|pause|").map((s) => s.trim());
    const restored = rawChunks.map((s) => s.replace(/__BREAK2__/g, "\n\n").replace(/__BREAK1__/g, "\n"));
    const chunks = [];
    let pendingPrefix = "";
    for (let i = 0; i < restored.length; i++) {
      const c = restored[i];
      const isPureBreak = /^\n+$/.test(c) || c === "";
      if (isPureBreak && i < restored.length - 1) {
        pendingPrefix += c;
        continue;
      }
      chunks.push(pendingPrefix + c);
      pendingPrefix = "";
    }
    if (pendingPrefix && chunks.length > 0) {
      chunks[chunks.length - 1] = chunks[chunks.length - 1] + pendingPrefix;
    }
    if (chunks.length === 1) {
      audio.play(side === "you" ? "playertxtbox" : "npctxtbox");
      const last = convLog[convLog.length - 1];
      if (last && last.side === side) {
        last.text = last.text + "\n\n" + chunks[0];
      } else {
        convLog.push({ text: chunks[0], side, color });
        convReveal.push(0);
      }
      return;
    }
    audio.play(side === "you" ? "playertxtbox" : "npctxtbox");
    const last = convLog[convLog.length - 1];
    if (last && last.side === side) {
      last.text = last.text + "\n\n" + chunks[0];
    } else {
      convLog.push({ text: chunks[0], side, color });
      convReveal.push(0);
    }
    _convChunkQueue.push({ chunks, idx: 1, side, color });
    _convChunkTimer = 0;
  }

  function convShowChoices(labels) {
    convChoices = labels;

    convChoiceHover = 0;
  }

  function convHideChoices() {
    convChoices = null;
  }

  function convRender() {
    if (!convVisible || (convLog.length === 0 && !convChoices)) return;

    // Calculate opacity for fade-out animation - BOXES fade first, text stays visible longer
    let boxOpacity = 1.0;
    let textOpacity = 1.0;
    if (convFading) {
      const progress = convFadeTimer / convFadeDuration;
      // Boxes fade out in first 60% of animation
      boxOpacity = Math.max(0, 1.0 - progress / 0.6);
      // Text fades out in last 70% of animation
      textOpacity = progress < 0.3 ? 1.0 : Math.max(0, 1.0 - (progress - 0.3) / 0.7);
    }

    // Helper function to apply opacity to box borders
    function applyBoxOpacity(hexColor) {
      if (!hexColor || boxOpacity === 1.0) return hexColor;
      const hex = hexColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
    }

    // Helper function to apply opacity to text
    function applyTextOpacity(hexColor) {
      if (!hexColor || textOpacity === 1.0) return hexColor;
      const hex = hexColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${textOpacity})`;
    }

    //dialogue box conversation box
    const boxW = Math.min(W - (Device.isMobile ? 8 : 16), 30);
    const innerW = boxW - 4;
    // Measure total height first so we can anchor from the bottom
    const allBoxes = [];
    const visibleLog = convLog.slice(-2);
    const visibleOffset = Math.max(0, convLog.length - 2);
    for (let i = 0; i < visibleLog.length; i++) {
      const entry = visibleLog[i];
      const paragraphs = entry.text.split("\n\n");
      const lines = [];
      for (let p = 0; p < paragraphs.length; p++) {
        if (p > 0) lines.push(""); // blank line between paragraphs
        lines.push(...wrapWords(paragraphs[p], innerW));
      }
      const age = visibleLog.length - 1 - i;
      const dimmed = age > 1;
      const baseColor = dimmed ? "#444" : entry.color;
      const revealed =
        age === 0 ? (convReveal[i + visibleOffset] !== undefined ? entry.text.substring(0, convReveal[i + visibleOffset]) : entry.text) : entry.text; // older boxes always fully shown
      // re-wrap using revealed text
      const revealedLines = [];
      for (const segment of revealed.split("\n")) {
        if (segment.trim() === "") {
          revealedLines.push("");
          continue;
        }
        revealedLines.push(...wrapWords(segment, innerW));
      }
      allBoxes.push({
        lines: revealedLines,
        color: baseColor,
        side: entry.side,
        isChoice: false,
      });
    }
    let perChoiceLines = null;
    if (convChoices) {
      perChoiceLines = convChoices.map((c) => wrapWords("\u25B6 " + c, innerW, "  "));
      // Mobile only: one extra row below the text keeps a bigger tap target.
      if (Device.isMobile) {
        for (const lines of perChoiceLines) {
          lines.unshift("");
        }
      }
      const choiceLines = [];
      for (let ci = 0; ci < perChoiceLines.length; ci++) {
        choiceLines.push(...perChoiceLines[ci]);
        if (ci < perChoiceLines.length - 1) choiceLines.push("");
      }
      allBoxes.push({
        lines: choiceLines,
        color: convPlayerColor,
        side: "you",
        isChoice: true,
      });
    }
    const charY = convAnchorY;
    const lastBox = allBoxes[allBoxes.length - 1];
    const lastBoxH = lastBox.lines.length + 2; // top border + lines + bottom border


    // Standard offset for all conversations now that camera settling is fixed
    const yOffset = 2;
    const lastBoxBottom = charY - yOffset;

    const lastBoxTop = lastBoxBottom - (lastBoxH - 1); // -1 because bottom border is inclusive

    // Older boxes stack above it without affecting its position
    const boxesToShow = allBoxes;

    // Work backwards from lastBoxTop
    let totalPriorHeight = 0;
    for (let i = 0; i < boxesToShow.length - 1; i++) {
      totalPriorHeight += boxesToShow[i].lines.length + 2; // height of each prior box (no gap between boxes)
    }

    // clamp topY so it never goes above row 2
    const rawTopY = lastBoxTop - totalPriorHeight;
    const topY = phase === "act2" || phase === "act3" ? Math.max(2, rawTopY) : rawTopY;


    const psx = convAnchorPX;
    const nsx = convAnchorNX;
    const centerX = Device.isMobile ? Math.floor(W / 2) : Math.floor((psx + nsx) / 2);
    const bx = Util.clamp(Math.floor(centerX - boxW / 2), 0, W - boxW);

    // Draw boxes top to bottom, offset by speaker
    const offset = Math.min(5, Math.floor(boxW / 5));
    const bxL = Util.clamp(bx - offset, 0, W - boxW);
    const bxR = Util.clamp(bx + offset, 0, W - boxW);

    {
      const padX = 1;
      let cyClear = topY; // Start from topY even if negative
      for (const box of boxesToShow) {
        const xPos = box.side === "them" ? bxR : bxL;
        const boxH = box.lines.length + 2;
        const x0 = Math.max(0, xPos - padX);
        const x1 = Math.min(W, xPos + boxW + padX);

        // Only clear if this box is at least partially visible
        const boxStartY = cyClear;
        const boxEndY = cyClear + boxH;
        if (boxEndY > 0) {
          // Clear only the visible portion
          const clearStartY = Math.max(0, boxStartY);
          const clearEndY = Math.min(H, boxEndY);
          for (let y = clearStartY; y < clearEndY; y++) {
            for (let x = x0; x < x1; x++) {
              grid.set(x, y, " ", null);
            }
          }
        }
        cyClear += boxH;
      }
    }
    let cy = topY; // Start from topY even if negative, don't clamp
    for (const box of boxesToShow) {
      if (cy + box.lines.length + 2 > H) break;
      const xPos = box.side === "them" ? bxR : bxL;

      // Only draw if this box would be visible (cy >= 0)
      const boxStartY = cy;
      const boxEndY = cy + box.lines.length + 2;
      const isVisible = boxEndY > 0; // At least part of the box is on-screen

      if (box.isChoice && isVisible) {
        convChoiceY1 = Math.max(0, cy);
        convChoiceYs = [];
        let tempCount = 0;
        for (let ci = 0; ci < perChoiceLines.length; ci++) {
          convChoiceYs.push(Math.max(0, cy + 1 + tempCount));
          tempCount += perChoiceLines[ci].length + 1;
        }
      }

      // Draw top border only if visible
      if (cy >= 0 && isVisible) {
        const _boxStyle = box.isChoice ? DIALOG_BOX : CONV_BOX;
        const borderCol = box.isChoice ? applyBoxOpacity(convChoicePicked >= 0 ? C_GOLD : C_PLAYER) : applyBoxOpacity(box.color);
        grid.text(_boxStyle.tl + _boxStyle.h.repeat(boxW - 2) + _boxStyle.tr, xPos, cy, borderCol);
      }
      cy++;

      for (let li = 0; li < box.lines.length; li++) {
        if (cy >= 0 && isVisible) {
          const sideBorderCol = box.isChoice ? applyBoxOpacity(convChoicePicked >= 0 ? C_GOLD : C_PLAYER) : applyBoxOpacity(box.color);
          grid.text(box.isChoice ? DIALOG_BOX.v : CONV_BOX.v, xPos, cy, sideBorderCol);
          grid.text(box.isChoice ? DIALOG_BOX.v : CONV_BOX.v, xPos + boxW - 1, cy, sideBorderCol);

          if (box.isChoice) {
            /* -1 = separator row, owned by no choice. */
            const choiceMutedColors = ["#607898", "#6a8a60", "#886070", "#7a6a98"];
            let choiceIdx = -1,
              linesCount = 0;
            for (let ci = 0; ci < (perChoiceLines || []).length; ci++) {
              const cLen = perChoiceLines[ci].length;
              if (li >= linesCount && li < linesCount + cLen) {
                choiceIdx = ci;
                break;
              }
              linesCount += cLen + 1;
            }
            if (choiceIdx >= 0) {
              let lineCol;
              if (convChoicePicked === choiceIdx) {
                lineCol = Math.floor(Date.now() / 150) % 2 === 0 ? "#fff" : "#f5a032";
              } else if (convChoicePicked >= 0) {
                lineCol = "#444";
              } else {
                lineCol =
                  phase === "act2"
                    ? convChoiceHover === choiceIdx
                      ? "#fff"
                      : choiceIdx === 0
                        ? "#c8a070"
                        : "#8a9ab0"
                    : convChoiceHover === choiceIdx
                      ? "#fff"
                      : "#888";
              }
              if (box.lines[li] !== "") {
                const bulletCol = choiceMutedColors[choiceIdx % choiceMutedColors.length];
                const rendered = box.lines[li];
                const bulletIdx = rendered.indexOf("\u25B6");
                if (bulletIdx !== -1) {
                  const bulletX = (Device.isMobile ? xPos + 2 : xPos + 3) + bulletIdx; // desktop keeps a small inset off the left border, mobile sits flush with normal text
                  grid.set(bulletX, cy, "\u25B6", applyTextOpacity(bulletCol));
                  const face = rendered.substring(bulletIdx + 2); // drop "\u25B6 "
                  grid.text(face, bulletX + 2, cy, applyTextOpacity(lineCol)); // single space after the bullet
                } else {
                  grid.text(rendered, xPos + 2, cy, applyTextOpacity(lineCol));
                }
              }
              /* Highlight spans the whole choice incl. its padding row. */
              const _hlBg = convChoicePicked === choiceIdx ? "#4a3a10" : convChoicePicked < 0 && convChoiceHover === choiceIdx ? "#14505f" : null;
              if (_hlBg) for (let hx = xPos + 1; hx < xPos + boxW - 1; hx++) grid.setBg(hx, cy, applyBoxOpacity(_hlBg));
            }
          } else if (box.lines[li] !== "") {
            const pad = Math.floor((innerW - box.lines[li].length) / 2);
            grid.text(box.lines[li], xPos + 2 + Math.max(0, pad), cy, applyTextOpacity(box.color));
          }
        }
        cy++;
      }

      // Draw bottom border only if visible
      if (cy >= 0 && isVisible) {
        const bottomBorderCol = box.isChoice ? applyBoxOpacity(convChoicePicked >= 0 ? C_GOLD : C_PLAYER) : applyBoxOpacity(box.color);
        grid.text(
          (box.isChoice ? DIALOG_BOX.bl : CONV_BOX.bl) +
            (box.isChoice ? DIALOG_BOX.h : CONV_BOX.h).repeat(boxW - 2) +
            (box.isChoice ? DIALOG_BOX.br : CONV_BOX.br),
          xPos,
          cy,
          bottomBorderCol,
        );
      }
      if (box.isChoice && isVisible) {
        convChoiceY2 = Math.max(0, cy);
      }
      // remove to remove  extra gap — boxes stack tight for comic-book feel */
      cy++;
    }

    // Short tails pointing to characters - only show tail for most recent speaker
    if (cy < H && boxesToShow.length > 0) {
      // Find the most recent non-dimmed box (the active speaker)
      const lastBox = boxesToShow[boxesToShow.length - 1];

      if (lastBox.side === "you") {
        // Player speaking: tail from left-offset box toward player
        const tailX = Util.clamp(psx, bxL + 1, bxL + boxW - 2);
        // Only draw if tail won't overlap player position
        if (tailX !== psx || cy !== convAnchorY) {
          grid.set(tailX, cy, "ᐯ", convPlayerColor); // Canadian syllabics down triangle
        }
      } else if (lastBox.side === "them") {
        // NPC speaking: tail from right-offset box toward NPC
        const tailX = Util.clamp(nsx, bxR + 1, bxR + boxW - 2);
        // Only draw if tail won't overlap NPC position
        if (tailX !== nsx || cy !== convAnchorY) {
          grid.set(tailX, cy, "ᐯ", convNPCColor); // Canadian syllabics down triangle
        }
      }
    }
  }

  function convUpdate(dt) {
      // Drive chunked dialogue queue.

  
      if (_convChunkQueue.length > 0) {
        if (phase === "act2" || phase === "act3") {
          // tap-driven: do nothing here. The state machine drains chunks via _convChunkFlush() on tap.
        } else {
          _convChunkTimer -= dt;
          if (_convChunkTimer <= 0) {
            _convChunkTimer = CONV_CHUNK_PAUSE_MS;
            _convChunkFlush();
          }
        }
      } else {
        _convChunkTimer = CONV_CHUNK_PAUSE_MS;
      }
      // Typing reveal driver — only advances the last (active) box
      if (convLog.length > 0) {
        const li = convLog.length - 1;
        const full = convLog[li].text;
        if (convReveal[li] === undefined) convReveal[li] = 0;
        if (!CONV_TYPING_ENABLED) convReveal[li] = full.length; // instant reveal
        if (convReveal[li] < full.length) {
          _convTypeTimer += dt;
          const ch = full[convReveal[li]];
          const delay =
            ch === "." || ch === "?" || ch === "!" ? CONV_TYPE_MS + CONV_TYPE_PUNCT_MS : ch === "," ? CONV_TYPE_MS + CONV_TYPE_COMMA_MS : CONV_TYPE_MS;
          if (_convTypeTimer >= delay) {
            _convTypeTimer = 0;
            convReveal[li]++;
          }
        }
      }
      // Update conversation fade timer
      if (convFading) {
        convFadeTimer += dt;
        if (convFadeTimer >= convFadeDuration) {
          // Fade complete, reset conversation
          convReset();
        }
      } else if (phase === "inter") updateInter(dt);
  }
