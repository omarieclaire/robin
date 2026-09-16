/* Interstitial screens and game-over flows. */
  const INTER_HINT_MS = 2200;
  let interT, interLines, interLI, interNext, interDone, interFrameIdx, interTapMinMs, interTapKey, interHintMs;
  // kept visible on interstitial's black screen
  let _interKeepCells = null;

  function initInter(lines, nextFn, frameIdx, silent, tapMinMs, tapKey, hintMs) {
    if (!lines || lines.length === 0) {
      if (nextFn) nextFn();
      return;
    }
    phase = "inter";
    _interKeepCells = null; // prevents stale cells leaking into new interstitial
    interFrameIdx = frameIdx || 0;
    interT = 0;
    interLines = lines;
    interLI = 0;
    interNext = nextFn;
    interDone = false;
    interTapMinMs = tapMinMs ?? 350;
    interTapKey = tapKey || "tapToContinue";
    interHintMs = hintMs ?? INTER_HINT_MS;
    Banner.timer = 0;
    dialogStack = [];
    clickPending = false;
    Banner.showSequence(lines, silent);
  }

  function updateInter(dt) {
    if (phase !== "inter") return;
    interT += dt;
    Banner.update(dt);

    // keeps banner open after sequence ends
    if (!Banner.seq && Banner.text && Banner.timer <= 0) Banner.timer = 1;

    // blocks early clicks from banking
    if (interT <= interTapMinMs && clickPending) clickPending = false;
    const _tapped = (clickPending || input.justPressed("action")) && interT > interTapMinMs;
    if (_tapped) clickPending = false;

    const seqDone = !Banner.seq;

    // tap fast-forwards all remaining lines
    if (_tapped && !seqDone) {
      const seq = Banner.seq;
      let _revealedAny = false;
      while (seq && seq.idx < seq.lines.length) {
        const entry = seq.lines[seq.idx++];
        if (!entry.pause) {
          Banner.color = entry.c || Banner.color;
          Banner.text = Banner.text ? Banner.text + "\n\n" + entry.t : entry.t;
          Banner.segs = [...Banner.segs, { text: (Banner.segs.length ? "\n" : "") + entry.t, color: Banner.color }];
          _revealedAny = true;
        }
      }
      // one chime, not one per line
      if (_revealedAny && !seq.silent) audio.play("trumpet");
      Banner.seq = null;
      Banner.timer = 1;
      return; // needs a fresh tap to proceed
    }

    if (!interDone && seqDone && _tapped && interT > interHintMs) {
      interDone = true;
      Banner.timer = 0;
      Banner.seq = null;
      interNext();
      Banner.timer = 0; // guards against initAct3 resetting it
    }
  }

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

  const INTER_FRAME_BUILD_MS = 1500;
  const INTER_FRAME_MAX_LEAN = 30; // degrees, at the corners

  function renderInterFrame() {
    const f = INTER_FRAMES[interFrameIdx];
    const colW = Math.min(f.colW, Math.floor((W - 2) / 2));
    // darkened, not grayed, for depth
    const color = darkenColor(Banner.color || C_DIM, 0.55);
    const cx = (W - 1) / 2;
    // eases from leaned to flat
    const settle = 1 - _easeCurve(Math.min(1, (interT || 0) / INTER_FRAME_BUILD_MS), "outCubic");
    const leanAt = (x) => (settle <= 0 ? 0 : Util.clamp(((x - cx) / (W / 2)) * INTER_FRAME_MAX_LEAN, -INTER_FRAME_MAX_LEAN, INTER_FRAME_MAX_LEAN) * settle);

    grid.set(0, 0, f.tl, color, false, false, false, leanAt(0));
    grid.set(W - 1, 0, f.tr, color, false, false, false, leanAt(W - 1));
    grid.set(0, H - 1, f.bl, color, false, false, false, leanAt(0));
    grid.set(W - 1, H - 1, f.br, color, false, false, false, leanAt(W - 1));

    for (let x = 1; x < W - 1; x++) {
      const rot = leanAt(x);
      grid.set(x, 0, f.top, color, false, false, false, rot);
      grid.set(x, H - 1, f.bot, color, false, false, false, rot);
    }

    for (let y = 1; y < H - 1; y++) {
      const rowIdx = (y - 1) % f.left.length;
      const leftStr = f.left[rowIdx].substring(0, colW);
      for (let i = 0; i < colW; i++) {
        grid.set(i, y, leftStr[i], color, false, false, false, leanAt(i));
        grid.set(W - 1 - i, y, mirrorChar(leftStr[i]), color, false, false, false, leanAt(W - 1 - i));
      }
    }
  }

  function renderInter() {
    // keeps banner readable over game art
    for (let iy = 0; iy < H; iy++) for (let ix = 0; ix < W; ix++) grid.set(ix, iy, " ", "#0d0d0d");

    Banner.render();
    renderInterFrame();
    Banner.render();
    const _allLinesDone = interLines && interLI >= interLines.length;
    // matches in-game prompt position
    if (interT > interHintMs) {
      renderTapPrompt(ctrl(interTapKey), Device.isMobile ? H - 3 : H - 5, "#fff", C_PLAYER);
    }
    if (_interKeepCells) {
      // glides cells from outro to staged spot
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

  const QUICKBUST_TAP = {
    timeout: "deathTapTimedOut",
    busted: "deathTapBusted",
    caught: "deathTapCaught",
    emptyHanded: "deathTapEmptyHanded",
    brokenHeart: "deathTapBrokenHeart",
  };

  const QUICKBUST_FRAME = {
    timeout: 5, // spiral — time running out
    busted: 8, // corrupted static, matches corrupt-bust glitch
    caught: 6, // arch — cornered/caged
    emptyHanded: 2, // calmer weave; no glitch, no wipe
    brokenHeart: 4, // geometric; echoes player's @ glyph
  };

  // opts.keepCrew: true skips crew loss
  let _busting = false;
  function quickBust(result, restartFn, opts = {}) {
    if (_busting) return;
    _busting = true;
    loop.stop();
    if (!opts.keepEffect) Effects.clear();
    Footsteps.stop();
    Ambience.stop();
    if (!opts.skipBustSound) audio.play("death");

    const [msg, sub] = QUICKBUST_MSG[result] || QUICKBUST_MSG.caught;

    initInter(
      [{ t: msg + "\n\n" + sub, c: C_DANGER, d: 1500 }],
      () => {
        Effects.clear();
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
      QUICKBUST_TAP[result] || QUICKBUST_TAP.caught,
      1500,
    );
    if (opts.borderGlitch) {
      Effects.start("corrupt", {
        borderW: Device.isMobile ? 4 : 6,
        borderH: 2,
        intensity: 0.9,
        duration: 30000,
        redDelayMs: 500,
        redRampMs: 1800,
        cols: DEATH_GLITCH_COLS,
      });
    }
    loop.start();
  }


  const BUST_PEAK_AT = 0.65; // clear-up faster than build-up
  const BUST_HOLD_MS = 2000; // stay fully glitched-out before clearing
  // alarming palette; no cyan/magenta/white
  const DEATH_GLITCH_COLS = ["#ff3b30", "#ff6a00", "#ffcc33", "#cc2222", "#ff8800", "#e8a33d"];

  function triggerCorruptBust(result, restartFn, effectMs = 3200) {
    Music.stop();
    triggerChromatic(1500);
    audio.play("death");
    Effects.start("corrupt", { duration: effectMs, intensity: 0.6, swap: true, peakAt: BUST_PEAK_AT, holdMs: BUST_HOLD_MS, cols: DEATH_GLITCH_COLS });
    // waits for glitch to finish
    setTimeout(() => quickBust(result, restartFn, { skipBustSound: true, keepEffect: true, borderGlitch: true }), effectMs + BUST_HOLD_MS);
  }

  function triggerMirrorBust(result, restartFn, cx, cy, effectMs = 3500, opts = {}) {
    Music.stop();
    triggerChromatic(1500);
    audio.play("death");
    Effects.start("mirror", { x: cx, y: cy, duration: effectMs, intensity: 0.9, peakAt: BUST_PEAK_AT, holdMs: BUST_HOLD_MS, cols: DEATH_GLITCH_COLS });
    setTimeout(() => quickBust(result, restartFn, { ...opts, skipBustSound: true, keepEffect: true, borderGlitch: true }), effectMs + BUST_HOLD_MS);
  }
