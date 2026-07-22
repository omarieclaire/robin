
  const RA2 = ["@", "\u0126"];
  let a3T, a3CrewOffsets, a3Entering, a3PlayerX, a3PlayerY, a3CrewBannerShown, a3RallyStarted;

  let a3PlayerFrom = false;
  function initAct5(opts = {}) {
    audio.play("level");
    Music.transition("music_act5"); // storefront tension
    audio.preload(["music_act6"]);
    phase = "act5";
    ensureCrew();
    a3T = 0;
    Banner.timer = 0;
    dialogStack = [];

    a3PlayerAppearAt = 0;
    a3CrewStartAt = 0; // when crew animation begins (ms, in a3T frame)
    a3PlayerAppearAt = 0; // already added previously

    a3T = 0;
    a3Entering = false;
    a3PlayerX = 0;
    a3CrewBannerShown = false;
    a3PlayerFrom = !!opts.playerFrom;
    if (opts.playerFrom) {
      a3PlayerX = opts.playerFrom.x;
      a3PlayerY = opts.playerFrom.y;
    }
    a3EntryBurst = false;
    a3HatsOn = false;
    a3HatQueue = [];
    a3HatQueueT = 0;
    a3PlayerHatted = false;
    if (_originalPlayerHead) removeHats();

    hudLabel.textContent = "";
    hudScore.textContent = "";
    hudStatus.textContent = "";
    a3RallyStarted = false;

    // Build walk-in animation: robins slide in from off-screen edges
    {
      const sY = Math.floor(H * 0.62);
      const scx = Math.floor((W - STO_W) / 2);
      const dc = scx + Math.floor(STO_W / 2);
      const ly = sY + 3;
      const rc = a2CrewCount;
      // Original-style spacing — robins arc out from center on each side. Wrap to new row when too wide.
      const slotW = 3; // horizontal cells per robin (tweak: bigger = more spread out)
      const usableW = W - 6;
      const slotsPerSide = Math.max(1, Math.floor(usableW / 2 / slotW));
      const slotsPerRow = slotsPerSide * 2; // both sides combined
      a3CrewOffsets = [];
      for (let i = 0; i < rc; i++) {
        const row = Math.floor(i / slotsPerRow);
        const idxInRow = i % slotsPerRow;
        const side = idxInRow % 2 === 0 ? -1 : 1;
        const slot = Math.floor((idxInRow + 2) / 2);
        const tx = Util.clamp(dc + side * slot * slotW, 2, W - 5);
        const ty = ly + row * 2;
        const startX = side < 0 ? -4 - row : W + 4 + row;
     
        const from = opts.crewFrom && opts.crewFrom[i];
        a3CrewOffsets.push({
          cx: from ? from.x : startX,
          tx,
          cy: from ? from.y : ty,
          ty,
          delay: 1000 + i * 280,
        });
      }
    }
  }

  function updateAct5(dt) {
    a3T += dt;
  
    if (!a3RallyStarted) {
      a3RallyStarted = true;
      Banner.showSequence(
        [
          { t: a2CrewCount + 1 + " Robins", c: C_PLAYER, d: 2000 },
          { pause: true, d: 700 },
          { t: window.LANG.bannerOneStore.trim(), c: C_PLAYER, d: 2000 },
          { pause: true, d: 700 },
          { t: window.LANG.bannerLetsEat.trim(), c: C_PLAYER, d: 2500 },
        ],
        false,
      );
    }
    Banner.update(dt);

    if (Banner.tapAdvance()) return;

    if (!a3PlayerAppearAt && !Banner.seq && Banner.timer <= 0) {
      a3PlayerAppearAt = a3T;
      a3CrewStartAt = a3T + 1000; // crew starts walking in 1s after player appears
      audio.play("recruit"); // arrival chime — feels like "you're here"
    }


    if (a3PlayerFrom && a3PlayerAppearAt && !a3Entering) {
      const _sY3 = Math.floor(H * 0.62),
        _scx3 = Math.floor((W - STO_W) / 2);
      a3PlayerX = Util.lerp(a3PlayerX, _scx3 + Math.floor(STO_W / 2), 0.06);
      a3PlayerY = Util.lerp(a3PlayerY, _sY3 + 3, 0.06);
    }

    // Animate robins walking in
    if (a3CrewOffsets && !a3Entering) {
      for (const c of a3CrewOffsets) {
        if (a3CrewStartAt && a3T - a3CrewStartAt > c.delay) {
          c.cx = Util.lerp(c.cx, c.tx, 0.07);
          c.cy = Util.lerp(c.cy, c.ty, 0.07); // vertical too — handoff starts can be off the lineup row
          if (!c.arrived && Math.abs(c.cx - c.tx) < 0.8) {
            c.arrived = true;
    
            burstGood(Math.round(c.tx), Math.floor(H * 0.62) + 3, a2Crew[a3CrewOffsets.indexOf(c)]?.col || C_TEAL, 6);
          }
        }
      }
      // The lineup completing is its own beat: "crew assembled".
      if (!a3CrewBannerShown && a3CrewStartAt && a3CrewOffsets.length > 0 && a3CrewOffsets.every((c) => c.arrived)) {
        a3CrewBannerShown = true;
        Banner.show(window.LANG.bannerCrewAssembled || "crew assembled", C_TEAL, 2200);
      }
    }

    if (a3HatQueue.length > 0) {
      a3HatQueueT--;
      if (a3HatQueueT <= 0) {
        const next = a3HatQueue.shift();
        if (next.type === "crew") {
          applyCrewHat(next.idx);
          if (_renderFrameSkip === 0) audio.play("click");
      
          const off = a3CrewOffsets && a3CrewOffsets[next.idx];
          const tx = off ? off.tx : Math.floor(W / 2);
          const ty = off ? off.ty : Math.floor(H * 0.62) + 3;
          spark(tx, ty, C_ORANGE, 4);
        } else {
          // Player — bigger burst, banner
          applyPlayerHat();
          a3PlayerHatted = true;
          burstGood(Math.floor(W / 2), Math.floor(H * 0.62) + 3, C_ORANGE, 10);
          Banner.show(window.LANG.bannerHatsOn || "hats on.", C_ORANGE, 2000, true);
        }
        // ~80ms, snapped to a whole number of rendered frames for this device.
        const renderMs = (_renderFrameSkip + 1) * (1000 / 60);
        a3HatQueueT = Math.max(1, Math.round(80 / renderMs)) * (_renderFrameSkip + 1);
      }
    }

    if (a3Entering) {
      a3T += 0; // just keep ticking
      const sY = Math.floor(H * 0.62);
      const scx = Math.floor((W - STO_W) / 2);
      const dc = scx + Math.floor(STO_W / 2);
      // Move all crew toward door
      let allIn = true;
      for (const c of a3CrewOffsets) {
        c.cx = Util.lerp(c.cx, dc, 0.06);
        c.cy = Util.lerp(c.cy, sY - 2, 0.06);
        if (Math.abs(c.cx - dc) > 1 || Math.abs(c.cy - (sY - 2)) > 1) allIn = false;
      }
      // Move player toward door

      a3PlayerX = Util.lerp(a3PlayerX, dc, 0.15);
      a3PlayerY = Util.lerp(a3PlayerY || Math.floor(H * 0.62) + 3, sY - 2, 0.15);
      if (allIn && Math.abs(a3PlayerX - dc) < 1) {
        if (!a3EntryBurst) {
          a3EntryBurst = true;
          audio.play("exit");
          // Particle burst as crew enters store
          const _entryStY = Math.floor(H * 0.62);
          for (let _b = 0; _b < 10; _b++) {
            burstGood(dc + Util.randInt(-3, 3), _entryStY - 1, a2Crew[_b % a2Crew.length]?.col || C_TEAL, 8);
          }
          triggerFlashGood();
          setTimeout(() => _transitionAct5ToAct6(), 1200);
        }
        return;
      }
    }
   
    if (clickPending || input.justPressed("action")) {
      const _allArrived2 = a3CrewOffsets && a3CrewOffsets.every((c) => c.arrived);
      const _bannerClear2 = Banner.timer <= 0 && !Banner.seq;
      // Wait a beat after everyone arrives before showing the hat prompt — gives the moment time to land
      const _allArrivedAt = a3CrewStartAt && _allArrived2 ? a3CrewStartAt + (a3CrewOffsets[a3CrewOffsets.length - 1]?.delay || 0) + 1800 : 0;
      const _hatPromptVisible = _allArrived2 && _bannerClear2 && !a3Entering && a3T > _allArrivedAt;
      if (_hatPromptVisible && !a3HatsOn && a3HatQueue.length === 0 && a3T > _allArrivedAt + 1000) {
        clickPending = false;
        a3HatsOn = true;
        a3HatQueue = a2Crew.map((_, i) => ({ type: "crew", idx: i }));
        a3HatQueue.push({ type: "player" });
        a3HatQueueT = 0;
        a3PlayerHatted = false;
        const _renderMs = (_renderFrameSkip + 1) * (1000 / 60);
        const _popMs = Math.max(1, Math.round(80 / _renderMs)) * (_renderFrameSkip + 1) * (1000 / 60);
        if (_renderFrameSkip > 0) scheduleClicks(a3HatQueue.length, _popMs);
      } else if (a3HatsOn && a3PlayerHatted && _bannerClear2) {
        clickPending = false;
        burstGood(Math.floor(W / 2), Math.floor(H * 0.62) + 3, C_PLAYER, 8);
        a3Entering = true;
        const sY = Math.floor(H * 0.62);
        const scx = Math.floor((W - STO_W) / 2);
        const dc = scx + Math.floor(STO_W / 2);
        a3PlayerX = dc;
        Banner.timer = 0;
      } else {
        // Input before the prompt is visible — discard it
        clickPending = false;
      }
    }
  }
  function renderAct5(opts = {}) {
    const sY = Math.floor(H * 0.62);
    for (let x = 0; x < W; x++) {
      grid.set(x, sY, "\u2550", "#444");
      grid.set(x, sY + 1, "\u2550", "#444");
    }
    /* No dots on ground */
    const sb = [
      "\u250C\u2500\u2500\u2500\u2500\u2510",
      "\u2502 [] \u2502",
      "\u2502    \u2502",
      "\u2502 [] \u2502",
      "\u2514\u2500\u2500\u2500\u2500\u2518",
    ];
    const scx = Math.floor((W - STO_W) / 2),
      stY = sY - STO_H;
    if (scx > 8) grid.art(sb, scx - 7, sY - sb.length, "#555");
    if (scx + STO_W + 8 < W) grid.art(sb, scx + STO_W + 1, sY - sb.length, "#555");
    // Render STORE row by row: structure in dim, label rows bright
    const storeFlash = Math.sin(Date.now() / 500) > 0;
    const _treeChars = new Set(["^", "/", "\\", "|"]);
    const _rawStoreW = STO_W - (Device.isMobile ? 4 : 0); // 2 tree chars on each side
    const _treeOffset = Device.isMobile ? 2 : 0;
    for (let ri = 0; ri < STORE.length; ri++) {
      let row = STORE[ri];
      if (!(a3HatsOn && a3PlayerHatted)) row = row.replace(/ENTER!|ENTRE!/, (m) => " ".repeat(m.length));
      const hasLetter = /[A-Za-z]/.test(row);
   
      const rowCol = hasLetter ? (storeFlash ? "#fff" : C_ORANGE) : storeFlash ? C_PLAYER : C_ORANGE;
      for (let ci = 0; ci < row.length; ci++) {
        if (row[ci] === " ") continue;
        if (Device.isMobile && (ci < _treeOffset || ci >= _treeOffset + _rawStoreW)) {
          // tree character — draw in green
          const treeDepth = ri < 2 ? 0 : 1;
          grid.set(scx + ci, stY + ri, row[ci], treeDepth === 0 ? "#3a7a3a" : "#2a5a2a");
        } else {
          grid.set(scx + ci, stY + ri, row[ci], rowCol);
        }
      }
    }
    const dc = scx + Math.floor(STO_W / 2),
      ly = sY + 3,
      rc = a2CrewCount;
    if (!opts.skipPlayerCrew) {
      
      if (a3PlayerFrom || (a3PlayerAppearAt && a3T > a3PlayerAppearAt)) {
        const plX = a3Entering || a3PlayerFrom ? Math.round(a3PlayerX) : dc;
        const plY = a3Entering || a3PlayerFrom ? Math.round(a3PlayerY || ly) : ly;
        const _appearAge = a3T - a3PlayerAppearAt;
        const _appearFlash = !a3PlayerFrom && _appearAge < 600 ? (Math.floor(_appearAge / 100) % 2 === 0 ? "#fff" : C_PLAYER) : playerPulseColor(a3T);
        grid.art(A2_PA[Math.floor(a3T / 250) % 2] || A2_PA[0], plX, plY, _appearFlash);
        if (!a3PlayerFrom && _appearAge < 50) burstGood(plX, plY, C_PLAYER, 8);
      }
      /* Robins on either side — use their preserved art + color */
      const maxSlots = Math.max(1, Math.ceil(rc / 2));
      const spacing = Math.max(2, Math.floor((W / 2 - 3) / maxSlots));

      for (let i = 0; i < rc; i++) {
        if (!a3CrewOffsets[i]) continue;
        const rx = Math.round(a3CrewOffsets[i].cx);
        const baseTY = a3CrewOffsets[i].ty || ly;
        const crewArt = a2Crew[i] && a2Crew[i].art ? a2Crew[i].art : RA2;
        const crewCol = (a2Crew[i] && a2Crew[i].col) || C_TEAL;
        const isCat = a2Crew[i] && a2Crew[i].isCat;
        if (rx >= 0 && rx + 3 < W && baseTY + 3 < H) {
   
          const cyR = Math.round(a3CrewOffsets[i].cy);
          const ry = a3Entering || isCat ? cyR : cyR + Math.round(Math.sin(Date.now() / 400 + i * 0.7) * 0.3);
     
          const _catFlip = isCat && rx < dc;
          grid.art(crewArt, _catFlip ? rx + 1 : rx, ry, crewCol, _catFlip);
        }
      }
    }

    // ─────────────────────────────────────────────
    // Ground reference (shared by store, trees, buildings)
    const storeBottom = stY + STORE.length;

    // ─────────────────────────────────────────────
    // BUILDINGS (background layer)

    const buildings = window.GAME_DATA.buildings;
    function pickBuilding(i) {
      return buildings[i % buildings.length];
    }

    function drawBuilding(b, x, col, depthOffset = 0) {
      const art = b.art;
      const h = art.length;

      // bottom-align + slight lift for depth
      const y = storeBottom - h - 1 - depthOffset;

      for (let ri = 0; ri < art.length; ri++) {
        const row = art[ri];
        for (let ci = 0; ci < row.length; ci++) {
          const ch = row[ci];
          if (ch !== " ") {
            grid.set(x + ci, y + ri, ch, col);
          }
        }
      }
    }

    // LEFT building
    if (scx > 18) {
      const b = pickBuilding(a2CrewCount);
      const bw = b.art[0].length;
      const bx = scx - (bw + 10);

      // ensure no overlap with store
      if (bx + bw < scx) {
        drawBuilding(b, bx, "#160f3e", 0);
      }
    }

    // RIGHT building
    if (scx + STO_W + 18 < W) {
      const b = pickBuilding(a2CrewCount + 1);
      const bx = scx + STO_W + 10;

      drawBuilding(b, bx, "#3a2f4f", 1); // slight depth variation
    }

    // ─────────────────────────────────────────────
    // TREES (foreground layer — AFTER buildings)

    const treeCol = "#3a7a3a";
    const treeArt = ["  ^  ", " /^\\ ", "/_|_\\", "  |  "];

    // bottom-aligned trees
    const treeY = storeBottom - treeArt.length;

    if (scx > 6) grid.art(treeArt, scx - 6, treeY, treeCol);
    if (scx > 11) grid.art(treeArt, scx - 11, treeY + 1, "#2a6a2a");

    if (scx + STO_W + 6 < W) grid.art(treeArt, scx + STO_W + 2, treeY, treeCol);
    if (scx + STO_W + 11 < W) grid.art(treeArt, scx + STO_W + 7, treeY + 1, "#2a6a2a");

    // Wait until robins have arrived AND banner has cleared before any prompt
    const _allArrived = a3CrewOffsets && a3CrewOffsets.every((c) => c.arrived);
    const _bannerClear = Banner.timer <= 0 && !Banner.seq;
    const _allArrivedAt = a3CrewStartAt && _allArrived ? a3CrewStartAt + (a3CrewOffsets[a3CrewOffsets.length - 1]?.delay || 0) + 1800 : 0;
    if (_allArrived && _bannerClear && !a3Entering && a3T > _allArrivedAt) {
      const tapY = Math.min(H - 2, ly + 5);
      const hatsAnimating = a3HatQueue && a3HatQueue.length > 0;
      if (!a3HatsOn && !hatsAnimating) {
        renderTapPrompt(ctrl("act5TapHat"), tapY, "#fff", C_ORANGE);
      } else if (hatsAnimating) {
        grid.textCenter(window.LANG.act5HattingInProgress, tapY, C_DIM);
      } else if (a3HatsOn && !a3PlayerHatted) {
        grid.textCenter(window.LANG.act5HattingWait, tapY, C_DIM);
      } else {
        renderTapPrompt(ctrl("act5TapEnter"), tapY, "#fff", C_PLAYER);
      }
    }
    Banner.render();
  }


  function _transitionAct5ToAct6() {
    const doorX = Math.round(a3PlayerX);
    const doorY = Math.round(a3PlayerY);
    // Player never vanishes through this transition, unlike the crew.
    const playerCells = [
      { x: doorX, y: doorY, ch: A2_PA[0][0], co: C_PLAYER },
      { x: doorX, y: doorY + 1, ch: A2_PA[0][1], co: C_PLAYER },
    ];
    const staged = _stageKeepCells(playerCells);
    let _pool = null;
    runActBoundary({
      outro: (done) =>
        collapseToCenter(
          (pool) => {
            _pool = pool;
            done();
          },
          { cx: doorX, cy: doorY, excludeXY: playerCells.map((c) => ({ x: c.x, y: c.y })) },
        ),
      setupNext: initAct6,
      banner: {
        lines: [
          { t: ctrl("bannerGrabEverything"), c: C_WARN, d: 9999 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerAvoidSecurity, c: C_WARN, d: 9999 },
        ],
        frameIdx: 3,
        keepCells: staged,
      },
      intro: (done) => {
        const to = [
          { x: Math.round(s4PX2), y: Math.round(s4PY2) },
          { x: Math.round(s4PX2), y: Math.round(s4PY2) + 1 },
        ];
        riseFromPile(done, { spawnPool: _pool, peppersMs: 700, excludeXY: to, overlay: _walkCellsOverlay(staged, to), simmer: true });
      },
    });
  }
