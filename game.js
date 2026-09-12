(function () {
  const { GameLoop, Input, State, Timer, Util, Device } = OMC;



  const DEBUG = /[?&]debug/.test(location.search) || location.hash === "#debug"; // Shows FPS, frame time, span count.
  const perfEl = document.getElementById("perf-overlay");
  const perfVisible = DEBUG;
  let perfFrameTimes = [];
  let perfLastSpanCount = 0;
  let _perfPrevGrid = null;
  let _perfChangeCount = 0;
  let _perfChangeRatio = 0;


  let _renderFrameCounter = 0;
  let _renderAvgWindow = []; // For adaptive render throttling.
  const _forceSlowRender = Device.isMobile || /[?&]slow/.test(location.search);
  if (_forceSlowRender) _renderFrameSkip = 2; // ~20fps
  if (perfEl && perfVisible) perfEl.style.display = "block";

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



  if (Device.isMobile) document.body.classList.add("is-mobile");

  const quitBtn = document.getElementById("quit-btn");
  quitBtn.textContent = ctrl("quitBtn");
  quitBtn.addEventListener("click", () => {
    audio.play("uiButton");
    location.reload();
  });

  const langBtn = document.getElementById("lang-btn");

  langBtn.textContent = window.LANG === window.LANG_FR ? "EN" : "FR";

  langBtn.addEventListener("click", () => {
    audio.play("click");
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

  const helpBtn = document.getElementById("help-btn");
  const helpModal = document.getElementById("help-modal");
  const helpCloseBtn = document.getElementById("help-close");

  helpBtn.addEventListener("click", () => {
    audio.play("click");
    helpOverlay.classList.add("open");
  });
  helpCloseBtn.addEventListener("click", () => helpOverlay.classList.remove("open"));
  helpOverlay.addEventListener("click", (e) => {
    if (!helpModal.contains(e.target)) helpOverlay.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") helpOverlay.classList.remove("open");
  });



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

  input.mapActions({
    left: ["ArrowLeft", "a"],
    right: ["ArrowRight", "d"],
    up: ["ArrowUp", "w"],
    down: ["ArrowDown", "s"],
    action: ["Enter", " ", "ArrowRight"],
  });

  let _perfUpdateMs = 0;
  function update(dt) {
    _lastDt = dt;
    const _perfUpdateStart = perfVisible ? performance.now() : 0;
    _mobUpdate(dt);
    convUpdate(dt);

    updateParticles(dt);
    _updateDomHud(); // Crew header persists across acts.
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
    // Distinguishes force flag from dt arg.
    if (force !== true && _renderFrameSkip > 0 && _renderFrameCounter % (_renderFrameSkip + 1) !== 0) {
      return; // Skip this render entirely.
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
    // Feeds adaptive throttling, even without overlay.
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
        _renderAvgWindow = []; // Reset window after change.
      }
    }

    if (perfVisible) {
      // Approximates span count for perf.
      const html = gs.innerHTML;
      let count = 0,
        idx = 0;
      while ((idx = html.indexOf("<span", idx)) !== -1) {
        count++;
        idx += 5;
      }
      perfLastSpanCount = count;

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

  // Dev buttons reuse hotkey act-jump path.
  document.querySelectorAll("#scene-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      jumpToAct(btn.dataset.act);
    });
  });

 
  const ACT_JUMPS = {
    1: () => location.reload(),
    2: () => {
      Music.play("music_act1");
      initAct2();
    },
    m: () => ACT_JUMPS[3](), // kept as a muscle-memory alias
    3: () => {
      Music.play("music_act1");
      initAct2();
      let lastRealIdx = 0;
      for (let i = 0; i < NQ.length; i++) if (!NQ[i].pause) lastRealIdx = i;
      a1St = "outro";
      a1NP = lastRealIdx;
      Banner.timer = 0;
    },
    4: () => {
      Music.transition("music_act4");
      initInter(
        [
          { t: window.LANG.bannerRallyNeighbourhood, c: C_VIOLET, d: 9999 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerAvoidNarcs, c: C_VIOLET, d: 9999 },
        ],
        initAct4,
        1,
      );
    },
    5: () => {
      Music.transitionStretched("music_act5");
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initAct5();
    },
    6: () => {
      Music.transition("music_act6");
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initInter(
        [
          { t: ctrl("bannerGrabEverything"), c: C_WARN, d: 9999 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerAvoidSecurity, c: C_WARN, d: 9999 },
        ],
        initAct6,
        3,
      );
    },
    7: () => {
      // First half of chase; see MUSIC_STRETCH.
      Music.transition(MUSIC_STRETCH ? "music_act6" : "music_act7");
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initAct6();
      initAct6Run();
      s4ItemsGrabbed = Math.max(s4ItemsGrabbed, 12);
      state.set("score", Math.max(state.get("score") || 0, 60));
    },
    8: () => {
      // Act7 music carries over until fridge drop-off.
      Music.transition("music_act7");
      a2CrewCount = Math.max(a2CrewCount, 5);
      s4AlyScore = s4AlyScore || 0;
      ensureCrew();
      // Hotkey skips heist; seeds plausible haul.
      s4ItemsGrabbed = Math.max(s4ItemsGrabbed || 0, 12);
      state.set("score", Math.max(state.get("score") || 0, 60));
      initAct8();
    },
    9: () => {
      Music.transitionStretched("music_act9");
      a2CrewCount = Math.max(a2CrewCount, 5);
      s4AlyScore = s4AlyScore || 0;
      ensureCrew();
      state.reset({ score: 80 });
      initEnd();
    },
    // Five distinct fail-state / lose treatments.
    g: () => triggerMirrorBust("caught", initAct4, Math.floor(W / 2), Math.floor(H / 2)), // Cops or urgency maxed: mirror-fold bust.
    h: () => triggerBrokenHeart(), // Act2: too many give-ups, manual retry.
    j: () => triggerCorruptBust("busted", initAct3), // Narc-heat maxed: corrupt-glitch bust.
    k: () => quickBust("emptyHanded", initAct5, { keepCrew: true }), // Act6 exit empty-handed: crew kept.
    l: () => triggerMirrorBust("timeout", initAct3, Math.floor(W / 2), Math.floor(H / 2)), // Cop-timer/urgency expired: mirror-fold bust.
    e: () => {
      // Act6 exit -> Act7 transition test
      Music.transition("music_act6");
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initAct6();
      initAct6Exit();
      _transitionAct6ExitToAct6Run();
      return true; // Signals it starts its own loop.
    },
  };

  function jumpToAct(key) {
    if (!ACT_JUMPS[key]) return;
    if (!_langDataReady) setupLangData(); // Hotkeys can fire before PLAY clicked.
    _stopLandingAnim(); // May fire straight from title screen.
    _transitionGen++; // Invalidates any in-flight transition loop.
    try {
      loop.stop();
    } catch (_) {}
    Music.stop();
    Footsteps.stop();
    Ambience.stop();
    overlay.classList.add("hidden");
    floats.length = 0;
    sparks.length = 0;
    dialogStack = [];
    convReset();
    Banner.timer = 0;
    Banner.text = "";
    clickPending = false;
    a2TN = null;
    const _ownsOwnLoop = ACT_JUMPS[key]();
    if (!_ownsOwnLoop) loop.start();
  }

  const TRANSITION_JUMPS = {
    e: () => Effects.start("ringSnapFinal", { x: Math.floor(W / 2), y: Math.floor(H / 2), duration: 1800 }), // final narc takedown
    r: () => Effects.start("ringSnapLocal", { x: Math.floor(W / 2), y: Math.floor(H / 2), duration: 600 }), // regular narc hit — ring cascade
    t: () => Effects.start("colorPulseHit", { x: Math.floor(W / 2), y: Math.floor(H / 2), duration: 500 }), // regular narc hit — color pulse
    y: () => Effects.start("scalePulseGrocery", { x: Math.floor(W / 2), y: Math.floor(H / 2), duration: 20000 }), // grocery store shelves
    u: () => Effects.start("densityRampFinal", { x: Math.floor(W / 2), y: Math.floor(H / 2), duration: 1800 }), // final ~10s before death
    i: () => Effects.start("glitchOrbChase", { x: Math.floor(W / 2), y: Math.floor(H / 2), duration: 999999 }), // chase scene — follows player
    o: () => Effects.start("typewriterReveal", { x: Math.floor(W / 2), y: Math.floor(H / 2), duration: 2000 }), // Act 2 opening reveal
    p: () => Effects.start("magnetLean", { x: Math.floor(W / 2), y: Math.floor(H / 2), duration: 3000 }), // magnet lean, full-screen, unassigned for now
    b: () => collapseToCenter((pool) => holdBlob(pool), {}), // collapses screen into a held pile
  };

  function jumpToTransition(key) {
    if (!TRANSITION_JUMPS[key]) return;
    TRANSITION_JUMPS[key]();
  }

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return; // Avoids double-firing on key repeat.
    if (ACT_JUMPS[e.key]) jumpToAct(e.key);
    else if (DEBUG && TRANSITION_JUMPS[e.key]) jumpToTransition(e.key);
  });

  const pauseOverlay = document.getElementById("pause-overlay");
  function setPaused(paused) {
    if (!loop || !loop.isRunning) return;
    if (paused) {
      loop.pause();
      Music.pause();
      Footsteps.pause();
      Ambience.pause();
    } else {
      loop.resume();
      Music.resume();
      Footsteps.resume();
      Ambience.resume();
    }
    pauseOverlay.classList.toggle("show", paused);
  }
  pauseOverlay.addEventListener("pointerup", () => setPaused(false));
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (e.key === "p" || e.key === "P") setPaused(!loop.isPaused);
    else if (e.key === "r" || e.key === "R") location.reload();
  });

  const IDLE_TIMEOUT_MS = 60000; // 55s idle + 5s countdown
  const IDLE_WARNING_MS = 5000;
  const idleWarningEl = document.getElementById("idle-warning");
  const idleBackdropEl = document.getElementById("idle-backdrop");
  let _lastActivity = performance.now();
  let _idleWarningShown = false;
  window._markActivity = () => {
    _lastActivity = performance.now();
    _idleWarningShown = false;
    idleWarningEl.classList.remove("show");
    idleBackdropEl.classList.remove("show");
  };
  window.addEventListener("keydown", () => window._markActivity());
  setInterval(() => {
    if (loop && loop.isPaused) return; // Skip reload while paused.
    const idleMs = performance.now() - _lastActivity;
    if (idleMs > IDLE_TIMEOUT_MS) {
      location.reload();
    } else if (idleMs > IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
      if (!_idleWarningShown) {
        _idleWarningShown = true;
        audio.play("idleWarning");
      }
      idleBackdropEl.classList.add("show");
      const secs = Math.ceil((IDLE_TIMEOUT_MS - idleMs) / 1000);
      idleWarningEl.textContent = ctrl("idleRestartWarning").replace("{s}", secs);
      idleWarningEl.classList.add("show");
    }
  }, 250);

  function boot() {
    measureGrid();
    grid = new Grid(W, H);
    loop = new GameLoop({
      update,
      render,
    });
    overlay.classList.add("grid-landing");
    renderLandingToGrid();
    audio.preload(["titleFall"], { blob: true });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else setTimeout(boot, 200);
  let rTO;
  window.addEventListener("resize", () => {
    clearTimeout(rTO);
    rTO = setTimeout(() => {
      measureGrid();
      grid = new Grid(W, H);
      _landingLayout = null; // Forces landing relayout after resize.
      if (!phase) renderLandingToGrid();
    }, 200);
  });
})();

