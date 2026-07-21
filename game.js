(function () {
  const { GameLoop, Input, State, Timer, Util, Device } = OMC;



  const DEBUG = /[?&]debug/.test(location.search) || location.hash === "#debug"; // ── PERF OVERLAY ──────────────────────────────────────────────
  // Auto-shows when URL contains ?debug. Shows FPS, frame time, span count.
  const perfEl = document.getElementById("perf-overlay");
  const perfVisible = DEBUG;
  let perfFrameTimes = [];
  let perfLastSpanCount = 0;
  let _perfPrevGrid = null;
  let _perfChangeCount = 0;
  let _perfChangeRatio = 0;


  let _renderFrameCounter = 0;
  let _renderAvgWindow = []; // recent render times for adaptation
  const _forceSlowRender = Device.isMobile || /[?&]slow/.test(location.search);
  if (_forceSlowRender) _renderFrameSkip = 2; // ~20fps
  if (perfEl && perfVisible) perfEl.style.display = "block";

  // Debug: expose perf state to console
  if (DEBUG) {
    window._perf = {
      get visible() {
        return perfVisible;
      },
      get el() {
        return perfEl;
      },
      get loop() {
        return loop;
      },
      get phase() {
        return phase;
      },
    };
  }

  function perfTick(frameMs) {
    if (!perfVisible || !perfEl) {
      if (DEBUG && !window._perfWarned) {
        window._perfWarned = true;
        console.warn("perfTick blocked — visible:", perfVisible, "el:", !!perfEl);
      }
      return;
    }
    perfFrameTimes.push(frameMs);
    if (perfFrameTimes.length > 60) perfFrameTimes.shift();
    const avg = perfFrameTimes.reduce((a, b) => a + b, 0) / perfFrameTimes.length;
    const max = Math.max(...perfFrameTimes);
    const fps = loop ? loop.fps : 0;
    const _targetFps = 60 / (_renderFrameSkip + 1);
    perfEl.textContent =
      `FPS ${fps}/${_targetFps}  upd ${_perfUpdateMs.toFixed(1)}ms  rnd ${avg.toFixed(1)}ms ` +
      `max ${max.toFixed(1)}ms  spans ${perfLastSpanCount}  ` +
      `Δ ${_perfChangeCount} (${(_perfChangeRatio * 100).toFixed(0)}%)  phase ${phase || "-"}`;
    perfEl.style.color = avg < 17 ? "#0f0" : avg < 25 ? "#ff0" : "#f44";
  }


  // ── DOM REFS ────────────────────────────────────────────────────

  if (Device.isMobile) document.body.classList.add("is-mobile");

  const quitBtn = document.getElementById("quit-btn");
  quitBtn.textContent = ctrl("quitBtn");
  quitBtn.addEventListener("click", () => {
    location.reload();
  });

  const langBtn = document.getElementById("lang-btn");

  langBtn.textContent = window.LANG === window.LANG_FR ? "EN" : "FR";

  langBtn.addEventListener("click", () => {
    if (window.LANG === window.LANG_EN) {
      localStorage.setItem("lang", "fr");
    } else {
      localStorage.setItem("lang", "en");
    }
    location.reload();
  });

  let _lastPhaseForBtn = null;
  function syncLangBtn() {
    langBtn.style.display = !phase || phase === "done" ? "" : "none";
  }

  // ── HELP MODAL ───────────────────────────────────────────────
  const helpBtn = document.getElementById("help-btn");
  const helpModal = document.getElementById("help-modal");

  helpBtn.addEventListener("click", () => helpOverlay.classList.add("open"));
  helpOverlay.addEventListener("click", (e) => {
    if (!helpModal.contains(e.target)) helpOverlay.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") helpOverlay.classList.remove("open");
  });



  /* ── RESPONSIVE SIZING ─────────────────────────────────── */
  function measureGrid() {
    const wrap = document.getElementById("game-wrap"),
      r = wrap.getBoundingClientRect();
    const probe = document.createElement("span");
    probe.style.cssText =
      "font-family:'Courier New','Consolas','Monaco',monospace;white-space:pre;line-height:1;position:absolute;visibility:hidden;font-size:16px;letter-spacing:0";
    probe.textContent = "MMMMMMMMMMMMMMMMMMMM";
    gs.appendChild(probe);
    const cw16 = probe.getBoundingClientRect().width / 20;
    gs.removeChild(probe);
    const fontW = Math.min(r.width, 900);
    const targetW = fontW > 800 ? 72 : fontW > 600 ? 60 : fontW > 480 ? 48 : fontW > 360 ? 38 : 32;
    const fs = fontW / ((targetW * cw16) / 16);
    const finalFS = Math.max(9, Math.min(Math.floor(fs), 24));
    const charW = finalFS * (cw16 / 16);
    W = Math.floor(r.width / charW);
    H = Math.floor(r.height / finalFS);
    W = Math.max(28, W);
    H = Math.max(16, Math.min(H, 40));
    gs.style.fontSize = finalFS + "px";

    gs.style.width = Math.round(W * charW) + "px";
    gs.style.height = Math.round(H * finalFS) + "px";
  }


  // ── GAME STATE ──────────────────────────────────────────────────
  input.mapActions({
    left: ["ArrowLeft", "a"],
    right: ["ArrowRight", "d"],
    up: ["ArrowUp", "w"],
    down: ["ArrowDown", "s"],
    action: ["Enter", " "],
  });

  /* ── MAIN ──────────────────────────────────────────────── */

  // ── MAIN LOOP ───────────────────────────────────────────────────
  let _perfUpdateMs = 0;
  function update(dt) {
    _lastDt = dt;
    const _perfUpdateStart = perfVisible ? performance.now() : 0;
    _mobUpdate(dt);
    convUpdate(dt);

    updateParticles(dt);
    _updateDomHud(); // one place, every frame — the crew header persists across acts until the drop-off
    if (phase === "act2") updateAct2(dt);
    else if (phase === "act3") updateAct3(dt);
    else if (phase === "act4") {
      updateAct4(dt);
      popupUpdate(dt);
    } else if (phase === "act5") updateAct5(dt);
    else if (phase === "act6") {
      updateAct6(dt);
      popupUpdate(dt);
    } else if (phase === "act6exit") updateAct6Exit(dt);
    else if (phase === "act7") updateAct6Run(dt);
    else if (phase === "act8") updateAct8(dt);
    else if (phase === "end") updateEnd(dt);
    input.endFrame();
    if (perfVisible) _perfUpdateMs = performance.now() - _perfUpdateStart;
  }
  let _rowEls = null,
    _rowCache = null;
  function _paintRows() {
    const rows = grid.htmlRows();
    if (!_rowEls || _rowEls.length !== rows.length || _rowEls[0].parentNode !== gs) {
      gs.innerHTML = "";
      _rowEls = rows.map(() => gs.appendChild(document.createElement("div")));
      _rowCache = new Array(rows.length).fill(null);
    }
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] !== _rowCache[i]) {
        _rowEls[i].innerHTML = rows[i];
        _rowCache[i] = rows[i];
      }
    }
  }
  function render(force) {
    _renderFrameCounter++;
    // strict check: GameLoop passes delta as the first arg
    if (force !== true && _renderFrameSkip > 0 && _renderFrameCounter % (_renderFrameSkip + 1) !== 0) {
      return; // skip this render entirely
    }
    const _perfStart = performance.now();
    grid.clear();
    if (phase === "act2") renderAct2();
    else if (phase === "act3") renderAct3();
    else if (phase === "act4") renderAct4();
    else if (phase === "act5") renderAct5();
    else if (phase === "act6") renderAct6();
    else if (phase === "act6exit") renderAct6Exit();
    else if (phase === "act7") renderAct6Run();
    else if (phase === "act8") renderAct8();
    else if (phase === "end") renderEnd();
    else if (phase === "inter") renderInter();


    renderFloats();
    renderSparks();

    // Apply visual effects on top of the rendered scene
    Effects.update(_lastDt, grid);
    _paintRows();

    if (phase !== _lastPhaseForBtn) {
      _lastPhaseForBtn = phase;
      syncLangBtn();
    }

    if (chromaticT > 0) {
      chromaticT -= 16;
      gs.classList.add("chroma");
    } else gs.classList.remove("chroma");
    if (flashGoodT > 0) {
      gs.classList.remove("flash-good");
      void gs.offsetWidth;
      gs.classList.add("flash-good");
      flashGoodT = 0;
    }
    if (flashGoldT > 0) {
      gs.classList.remove("flash-gold");
      void gs.offsetWidth;
      gs.classList.add("flash-gold");
      flashGoldT = 0;
    }
    // Track render time for adaptive throttling (runs even without overlay)
    const _renderMs = performance.now() - _perfStart;
    _renderAvgWindow.push(_renderMs);
    if (_renderAvgWindow.length > 120) _renderAvgWindow.shift();
    // Adapt every ~2 seconds
    if (_renderAvgWindow.length >= 120 && !_forceSlowRender) {
      const avgMs = _renderAvgWindow.reduce((a, b) => a + b, 0) / _renderAvgWindow.length;
      let newSkip = _renderFrameSkip;
      if (avgMs > 20) newSkip = 2;
      else if (avgMs > 12) newSkip = 1;
      else if (avgMs < 6) newSkip = 0;
      if (newSkip !== _renderFrameSkip) {
        _renderFrameSkip = newSkip;
        _renderAvgWindow = []; // reset window after change
      }
    }

    if (perfVisible) {
      // Approximate span count by counting <span in the rendered HTML
      const html = gs.innerHTML;
      let count = 0,
        idx = 0;
      while ((idx = html.indexOf("<span", idx)) !== -1) {
        count++;
        idx += 5;
      }
      perfLastSpanCount = count;

      // Count cells that changed since last frame
      if (grid) {
        let changed = 0;
        const total = grid.w * grid.h;
        if (!_perfPrevGrid || _perfPrevGrid.length !== grid.h || _perfPrevGrid[0].length !== grid.w) {
          _perfPrevGrid = [];
          for (let y = 0; y < grid.h; y++) _perfPrevGrid.push(new Array(grid.w).fill(null));
          changed = total;
        } else {
          for (let y = 0; y < grid.h; y++) {
            for (let x = 0; x < grid.w; x++) {
              const c = grid.c[y][x];
              const key = c.ch + "|" + (c.co || "");
              if (_perfPrevGrid[y][x] !== key) {
                changed++;
                _perfPrevGrid[y][x] = key;
              }
            }
          }
        }
        _perfChangeCount = changed;
        _perfChangeRatio = changed / total;
      }

      perfTick(_renderMs);
    }
  }
  window.render = render;

  // DEV: scene-nav buttons jump to any act using the same path as hotkeys
  document.querySelectorAll("#scene-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      jumpToAct(btn.dataset.act);
    });
  });

  // ── ACT JUMP TABLE ────────────────────────────────────────────
 
  const ACT_JUMPS = {
    1: () => location.reload(),
    2: () => {
      Music.play("music_act1");
      initAct2();
    },
    3: () =>
      initInter(
        [
          { t: window.LANG.bannerRecruitCrew, c: C_ORANGE, d: 9999 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerWatchNarcs, c: C_ORANGE, d: 9999 },
        ],
        initAct3,
        7, // must match _transitionAct2ToAct3's frameIdx
      ),
    4: () =>
      initInter(
        [
          { t: window.LANG.bannerRallyNeighbourhood, c: C_TEAL, d: 9999 }, // C_TEAL, matches _transitionAct3ToAct4 — see its comment
          { pause: true, d: 800 },
          { t: window.LANG.bannerAvoidNarcs, c: C_TEAL, d: 9999 },
        ],
        initAct4,
        1,
      ),
    5: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initAct5();
    },
    6: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initInter(
        [
          { t: window.LANG.bannerGrabEverything, c: C_WARN, d: 9999 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerAvoidSecurity, c: C_WARN, d: 9999 },
        ],
        initAct6,
        3,
      );
    },
    7: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initAct6();
      initAct6Run();
      s4ItemsGrabbed = Math.max(s4ItemsGrabbed, 12);
      state.set("score", Math.max(state.get("score") || 0, 60));
    },
    8: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      s4AlyScore = s4AlyScore || 0;
      ensureCrew();
      // Hotkey skipped the heist — seed a plausible haul (see key 6).
      s4ItemsGrabbed = Math.max(s4ItemsGrabbed || 0, 12);
      state.set("score", Math.max(state.get("score") || 0, 60));
      initAct8();
    },
    9: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      s4AlyScore = s4AlyScore || 0;
      ensureCrew();
      state.reset({ score: 80 });
      initEnd();
    },
    // Fail-state previews — the five distinct "lose" treatments 
    g: () => triggerMirrorBust("caught", initAct4, Math.floor(W / 2), Math.floor(H / 2)), // cops/urgency-maxed: mirror-fold collapse, crew wiped -> Act4
    h: () => triggerBrokenHeart(), // Act2 "gave up too many times": drain effect, manual "Try Again"
    j: () => triggerCorruptBust("busted", initAct3), // narc-heat maxed: full-screen corrupt glitch, crew wiped -> Act3
    k: () => quickBust("emptyHanded", initAct5, { keepCrew: true }), // Act6 exit with nothing grabbed: no glitch, crew kept -> Act5
    l: () => triggerMirrorBust("timeout", initAct3, Math.floor(W / 2), Math.floor(H / 2)), // Act3 cop-timer/Act6 urgency ran out: mirror-fold collapse, crew wiped -> Act3
  };

  function jumpToAct(key) {
    if (!ACT_JUMPS[key]) return;
    if (!_langDataReady) setupLangData(); // dev hotkeys can fire before PLAY is ever clicked
    _stopLandingAnim(); // hotkey may fire straight off the title screen
    _transitionGen++; // kill any in-flight transition rAF loop before cutting away
    try {
      loop.stop();
    } catch (_) {}
    Music.stop();
    overlay.classList.add("hidden");
    floats.length = 0;
    sparks.length = 0;
    dialogStack = [];
    convReset();
    Banner.timer = 0;
    Banner.text = "";
    clickPending = false;
    a2TN = null;
    ACT_JUMPS[key]();
    loop.start();
  }

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return; // ignore OS key-repeat, avoids double-firing
    if (ACT_JUMPS[e.key]) jumpToAct(e.key);
  });

  function boot() {
    measureGrid();
    grid = new Grid(W, H);
    loop = new GameLoop({
      update,
      render,
    });
    overlay.classList.add("grid-landing");
    renderLandingToGrid();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else setTimeout(boot, 200);
  let rTO;
  window.addEventListener("resize", () => {
    clearTimeout(rTO);
    rTO = setTimeout(() => {
      measureGrid();
      grid = new Grid(W, H);
      _landingLayout = null; // grid dimensions changed — re-lay-out the landing
      if (!phase) renderLandingToGrid();
    }, 200);
  });
})();

