

  let endT,
    endD = {};
  let END_NAMES = window.LANG.endNames;
  let _endBtnGeoms = {}; // Grid box position for DOM hit-targets.
  let _endHoveredBtn = null; // Hovered button id, or null.
  let _endShareFeedbackUntil = 0; // Timestamp: show 'copied' label until.

  function initEnd() {
    Footsteps.stop();
    Ambience.stop();
    phase = "end";

    endT = 0;
    _endHoveredBtn = null;
    _endShareFeedbackUntil = 0;
    Banner.timer = 0;

    dialogStack = [];
    const my = state.get("score") || 0,
      tot = my + s4AlyScore;
    const fed = Math.floor(tot / 6) + a2CrewCount;
    const narcsDodged = Math.max(0, 3 - (a2Ht || 0));

    // ~$13M/hr: Loblaw+Metro+Sobeys combined revenue.
    const WESTON_PER_MS = 13000000 / 3600000;
    const _westonStartT = Date.now();

    endD = {
      tot,
      my,
      fed,
      crew: a2CrewCount,
      narcsDodged,
      westonStart: _westonStartT,
      westonPerMs: WESTON_PER_MS,
      lineGroups: [
        // Historical.
        {
          col: C_ORANGE,
          chunks: window.LANG.endHistorical.split("|pause|").map((s) => s.trim()),
        },
        // Escalation.
        {
          col: C_PLAYER,
          chunks: window.LANG.endHistoricalAgain.split("|pause|").map((s) => s.trim()),
        },
        // Personal warmth.
        {
          col: C_TEAL,
          chunks: [window.LANG.endYouFed(fed || 18)],
        },
        // Collective.
        {
          col: "#b4dbff",
          chunks: ["__community__"],
        },
        // Weston ticker.
        {
          col: C_DANGER,
          chunks: ["__weston__"],
        },
      ],
      currentLine: 0, // index into lineGroups
      currentChunk: 0, // 1-based: count of chunks revealed.
      lastActionT: 0,
      finalTapReady: false,
      buttonsReady: false,
    };

    endD.currentChunk = 1;

    if (typeof bumpSharedTotals === "function") bumpSharedTotals(tot, fed);

    hudLabel.textContent = "";
    hudScore.textContent = "";
    hudStatus.textContent = "";
  }

  const END_AUTO_ADVANCE_MS = 5000; // Auto-advances since people stop tapping.
  const END_BUTTONS_AUTO_ADVANCE_MS = 3000; // Shorter idle before buttons appear.
  const END_TAP_GUARD_MS = 500; // matches Banner's tap guard

  function _advanceEnd() {
    const lg = endD.lineGroups;
    const lastLineIdx = lg.length - 1;
    const lastLine = lg[lastLineIdx];
    const allRevealed = endD.currentLine === lastLineIdx && endD.currentChunk >= lastLine.chunks.length;

    if (allRevealed && !endD.finalTapReady) {
      endD.finalTapReady = true;
      endD.lastActionT = endT;
      audio.play("paper");
      return;
    }

    if (endD.finalTapReady && !endD.buttonsReady) {
      endD.buttonsReady = true;
      endD.lastActionT = endT;
      audio.play("paper");
      _endHoveredBtn = "play";
      return;
    }

    const curLine = lg[endD.currentLine];
    if (endD.currentChunk < curLine.chunks.length) {
      endD.currentChunk++;
    } else if (endD.currentLine < lastLineIdx) {
      endD.currentLine++;
      endD.currentChunk = 1;
    }
    endD.lastActionT = endT;
    audio.play("paper");

    if (endD.currentLine === 2 && endD.currentChunk === 1) {
      spark(Math.floor(W / 2), Math.floor(H / 2), C_DANGER, 6);
    }
  }

  function updateEnd(dt) {
    endT += dt;
    Banner.update(dt);

    const idle = endT - (endD.lastActionT || 0);

    // Blocks stale clicks and double-taps.
    const guardReady = idle > END_TAP_GUARD_MS;
    if (!guardReady && clickPending) clickPending = false;

    // Enter/Space advances same as a tap
    const acted = guardReady && (clickPending || input.justPressed("action"));
    const advanceMs = endD.finalTapReady ? END_BUTTONS_AUTO_ADVANCE_MS : END_AUTO_ADVANCE_MS;
    const autoAdvance = !endD.buttonsReady && idle >= advanceMs;

    if (endD.buttonsReady) {
      const order = ["play", "mp", "share"];
      let idx = Math.max(0, order.indexOf(_endHoveredBtn));
      if (input.justPressed("up")) idx = Math.max(0, idx - 1);
      if (input.justPressed("down")) idx = Math.min(order.length - 1, idx + 1);
      _endHoveredBtn = order[idx];
      if (input.justPressed("action")) document.getElementById("end-btn-" + _endHoveredBtn)?.click();
      if (acted) clickPending = false;
      return;
    }

    if (!acted && !autoAdvance) return;
    if (acted) clickPending = false;

    _advanceEnd();
  }

  function _endWrap(text, maxW) {
    const words = text.split(" "),
      ls = [];
    let cur = "";
    for (const w of words) {
      const cand = cur ? cur + " " + w : w;
      if (cand.length > maxW) {
        if (cur) ls.push(cur);
        cur = w.length > maxW ? w.slice(0, maxW) : w;
      } else cur = cand;
    }
    if (cur) ls.push(cur);
    return ls;
  }

  function _packButtonRows(defs, maxW, gap) {
    const rows = [];
    let row = [],
      rowW = 0;
    for (const b of defs) {
      const addW = b.w + (row.length ? gap : 0);
      if (row.length && rowW + addW > maxW) {
        rows.push(row);
        row = [];
        rowW = 0;
      }
      row.push(b);
      rowW += b.w + (row.length > 1 ? gap : 0);
    }
    if (row.length) rows.push(row);
    return rows;
  }

  function _drawEndButtonRow(row, y) {
    const BTN_GAP_X = 2;
    const rowW = row.reduce((s, b, i) => s + b.w + (i > 0 ? BTN_GAP_X : 0), 0);
    let x = Math.floor((W - rowW) / 2);
    for (const b of row) {
      const hovered = _endHoveredBtn === b.id;
      const box = hovered ? CONV_BOX : SHARP_BOX;
      const col = hovered ? brightenColor(b.color, 0.55) : b.color;
      grid.text(box.tl + box.h.repeat(b.w - 2) + box.tr, x, y, col);
      grid.text(box.v + b.label + box.v, x, y + 1, col);
      grid.text(box.bl + box.h.repeat(b.w - 2) + box.br, x, y + 2, col);
      _endBtnGeoms[b.id] = { x, y, w: b.w, h: 3 };
      x += b.w + BTN_GAP_X;
    }
  }

  function renderEnd() {
    const _hcOrig = HC.splice(0, HC.length, ...HC_CTA);
    renderCity(endT * 0.004, 0);
    HC.splice(0, HC.length, ..._hcOrig);

    function resolveChunk(rawChunk) {
      if (rawChunk === "__community__") {
        const communityFed = typeof getSharedTotal === "function" ? getSharedTotal("fed") : 12847;
        return window.LANG.endCommunityFedText(communityFed);
      }
      if (rawChunk === "__weston__") {
        const elapsedMs = Date.now() - endD.westonStart;
        const revenue = Math.round(endD.westonPerMs * elapsedMs);
        return window.LANG.endWestonTicker(revenue.toLocaleString());
      }
      return rawChunk;
    }

    const lg = endD.lineGroups;
    const lastLineIdx = lg.length - 1;
    const allRevealed = endD.currentLine === lastLineIdx && endD.currentChunk >= lg[lastLineIdx].chunks.length;

    const FRAME1 = [0, 1];
    const FRAME2 = [2, 3, 4];
    const inFrame2 = endD.currentLine >= FRAME2[0];
    const activeIdx = inFrame2 ? FRAME2 : FRAME1;

    const BOX_PAD_Y = 2;
    const LINE_GAP = 1;
    const boxW = Math.max(20, Math.min(W - 8, 64));
    const maxTextW = boxW - 6;
    const bx = Math.floor((W - boxW) / 2);

    const isFR = window.LANG === window.LANG_FR;
    const NPC_COLORS = window.GAME_DATA.npcColors;
    const shareFeedback = Date.now() < _endShareFeedbackUntil;
    const BTN_DEFS = inFrame2
      ? [
          { id: "play", label: " " + (isFR ? "rejouer" : "play again") + " ", color: NPC_COLORS[3] },
          { id: "mp", label: " " + (isFR ? "voler une épicerie" : "rob a grocery store") + " ", color: NPC_COLORS[1] },
          {
            id: "share",
            label: " " + (shareFeedback ? (isFR ? "✓ copié" : "✓ copied") : isFR ? "partager" : "share") + " ",
            color: shareFeedback ? NPC_COLORS[5] : NPC_COLORS[2],
          },
        ]
      : [];
    for (const b of BTN_DEFS) b.w = b.label.length + 2;
    const btnRows = _packButtonRows(BTN_DEFS, boxW - 6, 2);
    const btnRowsH = btnRows.length ? btnRows.length * 3 + (btnRows.length - 1) : 0;

    const EXTRA_GAP_BEFORE = { 4: 1 };
    function measureLines(idx) {
      let h = 0;
      let first = true;
      for (const i of idx) {
        if (!first) h += LINE_GAP + (EXTRA_GAP_BEFORE[i] || 0);
        first = false;
        const fullText = lg[i].chunks.map(resolveChunk).join(" ");
        h += Math.max(1, _endWrap(fullText, maxTextW).length);
      }
      return h;
    }

    const reservedBottom = inFrame2 ? LINE_GAP + 1 + LINE_GAP + btnRowsH : 0;
    const boxInnerH = BOX_PAD_Y + measureLines(activeIdx) + reservedBottom + BOX_PAD_Y;
    const boxTotalH = boxInnerH + 2;
    const boxTop = Math.max(1, Math.floor((H - boxTotalH) / 2) - 1);

    for (let ry = boxTop; ry < boxTop + boxTotalH && ry < H; ry++) for (let rx = bx; rx < bx + boxW && rx < W; rx++) grid.set(rx, ry, " ", "#080a0a");

    grid.text(CONV_BOX.tl + CONV_BOX.h.repeat(boxW - 2) + CONV_BOX.tr, bx, boxTop, C_TEAL);
    grid.text(CONV_BOX.bl + CONV_BOX.h.repeat(boxW - 2) + CONV_BOX.br, bx, boxTop + boxTotalH - 1, C_TEAL);
    for (let ry = boxTop + 1; ry < boxTop + boxTotalH - 1; ry++) {
      grid.set(bx, ry, CONV_BOX.v, C_TEAL);
      grid.set(bx + boxW - 1, ry, CONV_BOX.v, C_TEAL);
    }

    let cy = boxTop + 1 + BOX_PAD_Y;
    let first = true;
    for (const idx of activeIdx) {
      if (idx > endD.currentLine) break;
      if (!first) cy += LINE_GAP + (EXTRA_GAP_BEFORE[idx] || 0);
      first = false;

      const group = lg[idx];
      const isCurrent = idx === endD.currentLine;
      const chunksToShow = isCurrent ? endD.currentChunk : group.chunks.length;
      const text = group.chunks.slice(0, chunksToShow).map(resolveChunk).join(" ");
      const wl = _endWrap(text, maxTextW);
      for (const ln of wl) {
        if (cy >= boxTop + boxTotalH - 1 || cy >= H) break;
        grid.textCenter(ln, cy, group.col);
        cy++;
      }
    }

    const showBridge = inFrame2 && allRevealed && endD.finalTapReady;

    if (showBridge) {
      cy += LINE_GAP;
      const pulse = Math.sin(Date.now() / 600) > 0 ? "#fff" : C_TEAL;
      if (cy < boxTop + boxTotalH - 1 && cy < H) grid.textCenter(window.LANG.endCTABridge || "your turn?", cy, pulse);
      cy += LINE_GAP + 1;
    }

    if (showBridge && endD.buttonsReady) {
      _endBtnGeoms = {};
      btnRows.forEach((row, i) => {
        if (i > 0) cy += 1;
        _drawEndButtonRow(row, cy);
        cy += 3;
      });
      _ensureEndButtonDom();
      _positionEndButtons();
    } else {
      _removeEndButtons();
      const _endIdle = endT - (endD.lastActionT || 0);
      if (_endIdle > 1200) {
        renderTapPrompt(ctrl("tapToContinue"), H - 2, "#fff", C_DIM);
      }
    }

    Banner.render();
  }


  function _ensureEndButtonDom() {
    if (document.getElementById("end-btn-play")) return;
    const wrapEl = document.getElementById("game-wrap");
    if (!wrapEl) return;
    const isFR = window.LANG === window.LANG_FR;

    const mk = (id) => {
      const el = document.createElement("button");
      el.id = "end-btn-" + id;
      el.style.cssText =
        "position:absolute;background:none;border:none;color:transparent;font-size:1px;padding:0;margin:0;cursor:pointer;z-index:30;";
      el.addEventListener("mouseenter", () => {
        _endHoveredBtn = id;
      });
      el.addEventListener("mouseleave", () => {
        if (_endHoveredBtn === id) _endHoveredBtn = null;
      });
      wrapEl.appendChild(el);
      return el;
    };

    mk("play").addEventListener("click", () => {
      audio.play("uiButton");
      _removeEndButtons();
      hasPlayed = false;
      Music.stop();
      try {
        loop.stop();
      } catch (_) {}
   
      phase = null;
      floats.length = 0;
      sparks.length = 0;
      dialogStack = [];
      Banner.timer = 0;
      Banner.text = "";
      _startInFlight = false; // Reset so PLAY works again.
      overlay.classList.remove("hidden");
      overlay.classList.add("grid-landing");
      _landingLayout = null; // Forces fresh layout on return.
      renderLandingToGrid();
    });

    mk("share").addEventListener("click", async () => {
      audio.play("uiButton");
      const elapsedMs = Date.now() - endD.westonStart;
      const revenue = Math.round(endD.westonPerMs * elapsedMs);
      const text = isFR
        ? `J'ai volé $${endD.tot} de nourriture et nourri ${endD.fed} voisins imaginaires dans Robins des Ruelles. Les géants de l'épicerie ont encaissé $${revenue.toLocaleString()} pendant que je jouais.`
        : `I stole $${endD.tot} of food and fed ${endD.fed} imaginary neighbours in Robins des Ruelles. The corporate grocery giants brought in $${revenue.toLocaleString()} in the time it took me to play.`;
      const url = "https://omarieclaire.github.io/robin/";
      const fullText = text + " " + url;
      try {
        if (navigator.share) {
          await navigator.share({ text, url });
        } else {
          await navigator.clipboard.writeText(fullText);
          _endShareFeedbackUntil = Date.now() + 1800;
        }
      } catch (e) {}
    });

    mk("mp").addEventListener("click", () => {
      audio.play("uiButton");
      const mpHref = isFR ? "https://www.noscommunes.ca/Members/fr/search" : "https://www.ourcommons.ca/Members/en/search";
      window.open(mpHref, "_blank", "noopener");
    });
  }

  let _wrapRectCache = null;
  window.addEventListener("resize", () => {
    _wrapRectCache = null;
  });
  function _positionEndButtons() {
    const wrapEl = document.getElementById("game-wrap");
    if (!wrapEl) return;
    const gsRect = _measureRectCached();
    if (!_wrapRectCache) _wrapRectCache = wrapEl.getBoundingClientRect();
    const wrapRect = _wrapRectCache;
    const { cellW, cellH } = _measureCellCached();
    for (const id in _endBtnGeoms) {
      const g = _endBtnGeoms[id];
      const el = document.getElementById("end-btn-" + id);
      if (!el) continue;
      el.style.left = gsRect.left - wrapRect.left + g.x * cellW + "px";
      el.style.top = gsRect.top - wrapRect.top + g.y * cellH + "px";
      el.style.width = g.w * cellW + "px";
      el.style.height = g.h * cellH + "px";
    }
  }

  function _removeEndButtons() {
    for (const id of ["play", "share", "mp"]) {
      const el = document.getElementById("end-btn-" + id);
      if (el) el.remove();
    }
  }

  let _sharedTotals = { food: 12847, fed: 4923 }; // Fallback values if storage unavailable.
  let _sharedTotalsLoaded = false;
  function getSharedTotal(key) {
    return _sharedTotals[key] ?? 0;
  }
  async function loadSharedTotals() {
    if (_sharedTotalsLoaded) return;
    try {
      const food = await window.storage.get("rdr_total_food", true);
      const fed = await window.storage.get("rdr_total_fed", true);
      if (food) _sharedTotals.food = Math.max(_sharedTotals.food, parseInt(food.value, 10) || 0);
      if (fed) _sharedTotals.fed = Math.max(_sharedTotals.fed, parseInt(fed.value, 10) || 0);
    } catch (e) {
      /* not in artifact context — keep fallback */
    }
    _sharedTotalsLoaded = true;
  }
  async function bumpSharedTotals(addFood, addFed) {
    try {
      _sharedTotals.food += addFood;
      _sharedTotals.fed += addFed;
      await window.storage.set("rdr_total_food", String(_sharedTotals.food), true);
      await window.storage.set("rdr_total_fed", String(_sharedTotals.fed), true);
    } catch (e) {
      /* Ignore; local-only fallback. */
    }
  }

 

