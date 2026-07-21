/* Interstitial screens + game-over flows (quickBust and friends). */
  const INTER_HINT_MS = 2200;
  let interT, interLines, interLI, interNext, interDone, interFrameIdx, interTapMinMs;
  // Cells kept visible on the interstitial's black screen (e.g. the player).
  let _interKeepCells = null;

  function initInter(lines, nextFn, frameIdx, silent, tapMinMs) {
    if (!lines || lines.length === 0) {
      if (nextFn) nextFn();
      return;
    }
    phase = "inter";
    _interKeepCells = null; // stale keep-cells never leak into an unrelated interstitial
    interFrameIdx = frameIdx || 0;
    interT = 0;
    interLines = lines;
    interLI = 0;
    interNext = nextFn;
    interDone = false;
    interTapMinMs = tapMinMs ?? 350;
    Banner.timer = 0;
    dialogStack = [];
    clickPending = false;
    Banner.showSequence(lines, silent);
  }

  function updateInter(dt) {
    if (phase !== "inter") return;
    interT += dt;
    Banner.update(dt);

    // Keep banner alive once sequence finishes (don't let it auto-close)
    if (!Banner.seq && Banner.text && Banner.timer <= 0) Banner.timer = 1;

    // Tap guard: don't let an early click bank and auto-fire once the gate opens.
    if (interT <= interTapMinMs && clickPending) clickPending = false;
    const _tapped = (clickPending || input.justPressed("action")) && interT > interTapMinMs;
    if (_tapped) clickPending = false;

    const seqDone = !Banner.seq;

    // Tap while sequence running → fast-forward all remaining lines at once
    if (_tapped && !seqDone) {
      const seq = Banner.seq;
      let _revealedAny = false;
      while (seq && seq.idx < seq.lines.length) {
        const entry = seq.lines[seq.idx++];
        if (!entry.pause) {
          Banner.color = entry.c || Banner.color;
          Banner.text = Banner.text ? Banner.text + "\n\n" + entry.t : entry.t;
          Banner.segs = [...Banner.segs, { text: entry.t, color: Banner.color }];
          _revealedAny = true;
        }
      }
      // One chime for the whole fast-forward, not one per skipped line.
      if (_revealedAny && !seq.silent) audio.play("trumpet");
      Banner.seq = null;
      Banner.timer = 1;
      return; // require a separate fresh tap to actually proceed
    }

    if (!interDone && seqDone && _tapped && interT > INTER_HINT_MS) {
      interDone = true;
      Banner.timer = 0;
      Banner.seq = null;
      interNext();
      Banner.timer = 0; // zero again after initAct3 may have reset state
    }
  }

  // frame
  const MIRROR_H = {
    "╠": "╣",
    "╣": "╠",
    "╔": "╗",
    "╗": "╔",
    "╚": "╝",
    "╝": "╚",
    "╒": "╕",
    "╕": "╒",
    "╓": "╖",
    "╖": "╓",
    "╟": "╢",
    "╢": "╟",
    "╭": "╮",
    "╮": "╭",
    "╰": "╯",
    "╯": "╰",
    "╲": "╱",
    "╱": "╲",
    "┤": "├",
    "├": "┤",
    "┐": "┌",
    "┌": "┐",
    "┘": "└",
    "└": "┘",
  };

  function mirrorChar(ch) {
    return MIRROR_H[ch] || ch;
  }

  function renderInterFrame() {
    const f = INTER_FRAMES[interFrameIdx];
    const colW = Math.min(f.colW, Math.floor((W - 2) / 2));
    // Dimmed so the eye lands on the banner message, not the frame texture.
    const color = dullColor(Banner.color || C_DIM, 0.5);

    // corners
    grid.text(f.tl, 0, 0, color);
    grid.text(f.tr, W - 1, 0, color);
    grid.text(f.bl, 0, H - 1, color);
    grid.text(f.br, W - 1, H - 1, color);

    // top / bottom rails
    for (let x = 1; x < W - 1; x++) grid.set(x, 0, f.top, color);
    for (let x = 1; x < W - 1; x++) grid.set(x, H - 1, f.bot, color);

    // side columns — original right-side logic, untouched
    for (let y = 1; y < H - 1; y++) {
      const rowIdx = (y - 1) % f.left.length;
      const leftStr = f.left[rowIdx].substring(0, colW);
      grid.text(leftStr, 0, y, color);
      for (let i = 0; i < colW; i++) {
        grid.set(W - 1 - i, y, mirrorChar(leftStr[i]), color);
      }
    }
  }

  function renderInter() {
    // Solid dark background so banner reads over any game art
    for (let iy = 0; iy < H; iy++) for (let ix = 0; ix < W; ix++) grid.set(ix, iy, " ", "#0d0d0d");

    Banner.render();
    renderInterFrame();
    Banner.render();
    const _allLinesDone = interLines && interLI >= interLines.length;
    // Same position as in-game prompts (bottom of screen) for consistency.
    if (interT > INTER_HINT_MS) {
      renderTapPrompt(window.LANG.tapToContinue, H - 3, "#fff", C_PLAYER);
    }
    if (_interKeepCells) {
      // Glide kept cells from their outro spot (fx/fy) to staged spot (x/y).
      const gk = _easeCurve(Math.min(1, interT / 1800), "inOutCubic");
      let kdy = 0;
      if (Banner.timer > 0 && Banner.lastBottom != null) {
        let minY = Infinity;
        for (const k of _interKeepCells) minY = Math.min(minY, k.y);
        if (minY <= Banner.lastBottom + 1) kdy = Math.min(Banner.lastBottom + 2 - minY, H - 2 - minY);
      }
      for (const k of _interKeepCells) {
        const kx = Math.round((k.fx ?? k.x) + (k.x - (k.fx ?? k.x)) * gk);
        const ky = Math.round((k.fy ?? k.y) + (k.y + kdy - (k.fy ?? k.y)) * gk);
        if (kx >= 0 && kx < W && ky >= 0 && ky < H && grid.c[ky][kx].ch === " ") grid.set(kx, ky, k.ch, k.co);
      }
    }
  }

  function triggerBrokenHeart() {
    triggerCorruptBust("brokenHeart", () => startGame());
  }

  const QUICKBUST_MSG = {
    timeout: [window.LANG.endGameTimedOutTitle, window.LANG.endGameTimedOutSub],
    busted: [window.LANG.endGameBustedTitle, window.LANG.endGameBustedSub],
    caught: [window.LANG.endGameCaughtTitle, window.LANG.endGameCaughtSub],
    emptyHanded: [window.LANG.endGameEmptyHandedTitle, window.LANG.endGameEmptyHandedSub],
    brokenHeart: [window.LANG.brokenHeartTitle, window.LANG.brokenHeartSub],
  };


  const QUICKBUST_FRAME = {
    timeout: 5, // spiral — time running out
    busted: 8, // corrupted static — same glitch vocabulary as the corrupt-bust effect
    caught: 6, // arch — cornered/caged
    emptyHanded: 2, // braided — calmer weave; the one fail state with no glitch, no crew wipe
    brokenHeart: 4, // geometric — its "@" glyphs echo the player symbol for Act2's own personal ending
  };

  // opts.keepCrew — true for fail states that shouldn't cost the crew.
  let _busting = false;
  function quickBust(result, restartFn, opts = {}) {
    if (_busting) return;
    _busting = true;
    loop.stop();
    Effects.clear();
    if (!opts.skipBustSound) audio.play("bust");
    triggerChromatic(1500);

    const [msg, sub] = QUICKBUST_MSG[result] || QUICKBUST_MSG.caught;

    initInter(
      [
        { t: msg, c: C_DANGER, d: 9999 },
        { pause: true, d: 800 },
        { t: sub, c: C_DANGER, d: 9999 },
      ],
      () => {
        floats.length = 0;
        sparks.length = 0;
        dialogStack = [];
        convReset();
        Banner.timer = 0;
        Banner.text = "";
        clickPending = false;
        a2TN = null;
        if (!opts.keepCrew) {
          a2CrewCount = 0;
          a2Crew = [];
        }
        if (typeof _removeEndButtons === "function") _removeEndButtons();
        _busting = false;
        restartFn();
      },
      opts.frameIdx ?? QUICKBUST_FRAME[result] ?? 8,
      true,
      1200,
    );
    loop.start();
  }


  function triggerCorruptBust(result, restartFn, effectMs = 2200) {
    Music.stop();
    Effects.start("corrupt", {
      duration: effectMs,
      intensity: 0.55,
      swap: true,
      toBlack: true,
      onDone: () => quickBust(result, restartFn, { skipBustSound: true }),
    });
    audio.play("bust");
  }

  function triggerMirrorBust(result, restartFn, cx, cy, effectMs = 3500, opts = {}) {
    Music.stop();
    Effects.start("mirror", {
      x: cx,
      y: cy,
      duration: effectMs,
      intensity: 0.9,
      toBlack: true,
      onDone: () => quickBust(result, restartFn, { ...opts, skipBustSound: true }),
    });
    audio.play("bust");
  }
