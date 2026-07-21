

  const A2B_BUILDINGS = window.GAME_DATA.buildings2b;

  /* Washed-out building colours for 2b */
  const A2B_BCOL = ["#b9a89a", "#9ab89a", "#9a9ab8", "#b8a09a", "#9aa8b0", "#a89ab0", "#b0a898", "#98a8b0"];
  /* Vivid NPC colours for 2b */
  const A2B_NPC_COL = ["#0ff", "#f0f", "#ff0", "#0f8", "#f80", "#8f0", "#80f", "#f08", "#08f"];

  let a2bWX, a2bT, a2bSpd, a2bPX, a2bPY, a2bNPCs, a2bMob, a2bHt;
  let a2bHasDodged, a2bHasRun, a2bStartY;

  let a2bTopParts, a2bBotParts;

  let a2bStoreX, a2bDone;
  const A2B_MH = 3;
  const A2B_HIT_W = Device.isMobile ? 1.5 : 2.5;
  const A2B_HIT_H = Device.isMobile ? 1.0 : 1.5;


  let a2bKiosks;

  /* Layout constants — computed from H */
  let A2B_TOP_H, A2B_BOT_H, A2B_ROAD_Y1, A2B_ROAD_Y2;

  function a2bCalcLayout() {
    A2B_TOP_H = Math.max(7, Math.floor(H * 0.45));
    A2B_BOT_H = Math.max(5, Math.floor(H * 0.18)); // was 0.32 — let buildings sit near true bottom
    // Road starts exactly at the buildings' visible bottom edge, no buffer row.
    A2B_ROAD_Y1 = A2B_TOP_H;
    A2B_ROAD_Y2 = H - A2B_BOT_H - 2;
  }


  function a2bBotBoundAt(wx) {
    for (const sp of a2bBotParts) {
      if (wx >= sp.wx && wx < sp.wx + sp.w) {
        return Math.max(A2B_ROAD_Y2 + 1, H - sp.art.length) - 1;
      }
    }
    return A2B_ROAD_Y2 - 1;
  }

  function a2bGenRow(totalWX) {
    const parts = [];
    let sx = 0;
    let shuffled = [];
    while (sx < totalWX) {
      if (shuffled.length === 0) {
        shuffled = [...A2B_BUILDINGS].sort(() => Math.random() - 0.5);
      }
      const bldg = shuffled.pop();
      parts.push({
        wx: sx,
        art: bldg.art,
        w: bldg.size,
        col: Util.pick(A2B_BCOL),
      });
      sx += bldg.size; // no gap
    }
    return parts;
  }

  function a2bGenNPCs() {
    a2bNPCs = []; /* NPCs only in the road zone */
    if (a2bKiosks) {
      for (const k of a2bKiosks) {
        if (k.wx > a2bStoreX - 40) continue; // the post-store bookend is decorative
        const nCount = Util.randInt(2, 3);
        for (let i = 0; i < nCount; i++) {
          const knx = Math.round(k.wx - 2 + Math.random() * (k.w + 4));
          const kAbove = Math.random() < 0.5;
          const kny = kAbove
            ? Util.randInt(A2B_ROAD_Y1, Math.max(A2B_ROAD_Y1, k.top - 2))
            : Util.randInt(Math.min(k.baseY, A2B_ROAD_Y2 - 2), A2B_ROAD_Y2 - 2);
          _a2bPushNPC(knx, kny);
        }
      }
    }
    const spacing = Math.max(9, Math.floor((a2bStoreX - 50) / 36));
    for (let nx = 60; nx < a2bStoreX - 20; nx += Util.randInt(spacing * 2, spacing * 2 + 8)) {
      if (a2bKiosks && a2bKiosks.some((k) => nx > k.wx - 6 && nx < k.wx + k.w + 6)) continue;
      _a2bPushNPC(nx, Util.randInt(A2B_ROAD_Y1 + 2, A2B_ROAD_Y2 - 2));
    }
  }

  function _a2bPushNPC(nx, ny) {
    {
      const isNarc = Math.random() < 0.15;
      const narcHeads = ["$", "€", "£", "¥", "₿", "₽"];
      const narcHead = Util.pick(narcHeads);
      const narcBody = Util.pick(["\u03C6", "ψ", "Ω", "\u00A7"]);
      const npcArt = isNarc ? [narcHead, narcBody] : Util.pick(A2_NPC_ARTS);
      const narcCols = ["#cc6688", "#bb5577", "#dd5599", "#aa4488", "#cc4477"];
      const npcCol = isNarc ? Util.pick(narcCols) : Util.pick(A2B_NPC_COL);
      a2bNPCs.push({
        wx: nx + Util.randInt(-3, 3),
        wy: ny,
        narc: isNarc,
        st: "idle",
        ch: npcArt[0],
        art: npcArt,
        col: npcCol,
        shoutT: 0,
        shoutMsg: "",
        amb: isNarc ? Util.pick(window.LANG.act4AmbNarc) : Util.pick(window.LANG.act4AmbCrowd),
      });
    }
  }

  function initAct4() {
    audio.play("level");
    Music.transition("music_act4"); // act4 feels like a rally escalation — new track
    audio.preload(["music_act5"]);
    phase = "act4";
    if (!a2Crew) a2Crew = [];
    a2bCalcLayout();
    a2bT = 0;
    a2bSpd = 0.009; // matches the update loop's ramp base
    a2bWX = 0;
    /* Player starts in the middle of the road */
    a2bPX = Math.floor(W * 0.3);

    a2bPY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    /* Carry over existing crew from Act 3 */
    a2bMob = [];
    for (let i = 0; i < a2Crew.length; i++) {
      const c = a2Crew[i];

      a2bMob.push({
        ox: -Util.randInt(2, 4 + Math.floor(i / 3)),
        oy: Util.randInt(-2, 2),
        ch: (c.art && c.art[0]) || "@",
        art: c.art || A2_NPC,
        /* Preserve original color from Act 3 recruit */
        col: c.col || A2B_NPC_COL[i % A2B_NPC_COL.length],
        b: c.b || Math.random() * 6,
        isCat: !!c.isCat,
      });
    }

    a2bHt = 0;
    _hudPopPrev.narcs2b = 0;
    _hudPopT.narcs2b = 0;
    a2bHasDodged = false;
    a2bHasRun = false;
    a2bStartY = a2bPY;

    a2bDone = false;
    a2bStoreX = Math.floor(96000 * 0.007) + W; // ~20% shorter than the 120s cut; the faster base + ramp bring real time to ~60-70s // ~60s at base speed 0.007 (was 45s — more room to weave)

    /* Generate building rows — enough for the whole level */
    a2bTopParts = a2bGenRow(a2bStoreX + W);
    a2bBotParts = a2bGenRow(a2bStoreX + W);

    a2bKiosks = [];
    const _roadH2b = A2B_ROAD_Y2 - A2B_ROAD_Y1;
    if (_roadH2b >= 10) {
      const _maxH = Math.min(4, _roadH2b - 6);
      const _segPool = window.GAME_DATA.buildings.filter((b) => b.art.length <= _maxH && b.art.length >= 2);
      if (_segPool.length > 0) {
        const _baseY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2) + 2; // segment ground line (buildings bottom-align to it)
        const _mkSeg = (kx) => {
          const _count = Util.randInt(4, 6);
          let segW = 0,
            segMaxH = 0;
          const bldgs = [];
          for (let bi = 0; bi < _count; bi++) {
            const b = Util.pick(_segPool);
            bldgs.push({ dx: segW, art: b.art, col: Util.pick(A2B_BCOL) });
            segMaxH = Math.max(segMaxH, b.art.length);
            segW += b.art[0].length + 1;
          }
          return { wx: kx, w: segW - 1, top: _baseY - segMaxH, bot: _baseY - 1, baseY: _baseY, bldgs };
        };
        for (let kx = 20; kx < a2bStoreX - 5; ) {
          const seg = _mkSeg(kx);
          if (kx + seg.w > a2bStoreX - 25) break; // would crowd the approach
          a2bKiosks.push(seg);
          kx += seg.w + 1 + Util.randInt(10, 15); // the weaving gap between blocks
        }
        a2bKiosks.push(_mkSeg(a2bStoreX + STO_W + 4));
      }
    }
    a2bGenNPCs();
    dialogStack = [];
    Banner.timer = 0;
    _updateDomHud();
  }

  function updateAct4(dt) {
    if (!Number.isFinite(dt)) {
      console.error("[A2b] bad dt:", dt, "a2bT was:", a2bT);
      dt = 16;
    }
    a2bT += dt;
    if (!Number.isFinite(a2bT)) {
      console.error("[A2b] a2bT corrupted, resetting to 0. Previous:", a2bT);
      a2bT = 0;
    }
    Banner.update(dt);

    if (a2bDone) {
      const _k = Math.min(1, 0.005 * dt);
      // Settle with the player centered on the store — right on the door.
      a2bWX = Util.lerp(a2bWX, a2bStoreX + Math.floor(STO_W / 2) - a2bPX, _k);
      a2bPY = Util.lerp(a2bPY, Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2), _k);
      _updateDomHud();
      return;
    }
    /* Scroll */
    a2bWX += a2bSpd * dt;

    a2bSpd = a2bT < 4000 ? 0.009 : Math.min(0.025, 0.009 + ((a2bT - 4000) / 9000) * 0.016);
    /* Player movement — constrained to road */
    const ms = 0.025;
    const tapStep = 2; // cells to move per tap — adjust to feel right
    const _a2bPYBefore = a2bPY;
    if (input.isDown("up")) a2bPY -= ms * dt;
    else if (input.justPressed("up")) a2bPY -= tapStep;
    if (input.isDown("down")) a2bPY += ms * dt;
    else if (input.justPressed("down")) a2bPY += tapStep;
    if (Math.abs(a2bPY - a2bStartY) > 1.5) a2bHasDodged = true;

    if (input.isDown("right")) {
      a2bWX += ms * dt * 0.6;
      a2bPX += ms * dt * 0.25;
      a2bHasRun = true;
    } else if (input.justPressed("right")) {
      a2bWX += tapStep * 0.6;
      a2bPX += 1;
      a2bHasRun = true;
    }
   
    if (input.isDown("left")) {
      a2bPX -= ms * dt;
    } else if (input.justPressed("left")) {
      a2bPX -= tapStep;
    }
    if (clickPending && phase === "act4") {
      clickPending = false;
      if (!Device.isMobile) {
        if (clickSY < a2bPY - 2) a2bPY -= 3;
        else if (clickSY > a2bPY + 2) a2bPY += 3;
        if (clickSX < a2bPX - 3) a2bPX -= 2; // screen-only — the world never rewinds
        else if (clickSX > a2bPX + 3) {
          a2bWX += 2; // forward click keeps the "hurry" boost
          a2bPX += 1;
        }
      }
    }
    // Mobile left/right from hold — no mobileMoveX needed

    a2bPY = Util.clamp(a2bPY, A2B_ROAD_Y1, a2bBotBoundAt(a2bWX + a2bPX));
    a2bPX = Util.clamp(a2bPX, 3, W - 4);

    if (a2bKiosks) {
      const _pwx2b = a2bWX + a2bPX;
      for (const k of a2bKiosks) {
        if (_pwx2b < k.wx - 1 || _pwx2b > k.wx + k.w) continue;
        if (a2bPY + 1 >= k.top && a2bPY <= k.bot) {
          a2bPY = a2bPY + 0.5 < (k.top + k.bot) / 2 ? k.top - 2 : k.baseY;
          a2bPY = Util.clamp(a2bPY, A2B_ROAD_Y1, a2bBotBoundAt(_pwx2b));
        }
      }
    }

    /* Shout timers */
    for (const n of a2bNPCs) {
      if (n.shoutT > 0) n.shoutT -= dt;
    }

    //* Collision — 1s grace period. */
    const pwx = a2bWX + a2bPX;
    if (a2bT > 1000) {
      for (const n of a2bNPCs) {
        if (n.st !== "idle") continue;
        if (Math.abs(n.wx - pwx) < A2B_HIT_W && Math.abs(n.wy - a2bPY) < A2B_HIT_H) {
          if (n.narc) {
            n.st = "narc";
            audio.play("bump");
            audio.play("narc");
            spark(Math.round(a2bPX), Math.round(a2bPY), C_DANGER, 36);
            spark(Math.round(n.wx - a2bWX), Math.round(n.wy), C_DANGER, 36);
            spark(Math.round(W / 2), Math.round(H / 2), C_DANGER, 24);
            triggerChromatic(600);
            a2bHt++;

            const _hitCenterX = Math.round((a2bPX + (n.wx - a2bWX)) / 2);
            const _hitCenterY = Math.round((a2bPY + n.wy) / 2);
            Effects.start("corrupt", {
              x: _hitCenterX,
              y: _hitCenterY,
              radius: a2bHt === 1 ? 10 : 14,
              duration: a2bHt === 1 ? 500 : 650,
              intensity: 0.95,
              swap: true,
            });

            Banner.show(window.LANG.bannerHitNarc, C_DANGER, 1800);
            popupPush(window.LANG.floatNarcHit || window.LANG.floatNarc, Math.round(n.wx - a2bWX), n.wy, C_DANGER, 700);
            popupPush(
              Util.pick([window.LANG.floatOops, window.LANG.floatOhNo, window.LANG.floatExclaim]),
              Math.round(a2bPX),
              Math.round(a2bPY),
              C_PLAYER,
              600,
            );
            if (a2bHt >= A2B_MH) {
              // Final hit — heavier feedback, faster bust.
              Banner.show(window.LANG.bannerTooManyNarcs || "TOO MANY NARCS", C_DANGER, 1500);
              triggerChromatic(1200);
              const _ppx = Math.round(a2bPX),
                _ppy = Math.round(a2bPY);
              for (let _b = 0; _b < 6; _b++) {
                spark(_ppx + Util.randInt(-4, 4), _ppy + Util.randInt(-2, 2), C_DANGER, 18);
              }
              spark(Math.round(W / 2), Math.round(H / 2), C_DANGER, 36);
              a2bSpd = 0; // freeze the world
              triggerCorruptBust("busted", initAct4);
              return;
            }
          } else {
            n.st = "joined";
            audio.play("bump");
            a2CrewCount++;
            audio.play("recruit");
            const _hitSX = Math.round(n.wx - a2bWX);
            burstGood(_hitSX, n.wy, n.col, 12);
            triggerFlashGood();
            const newBob = Math.random() * 6;
            a2bMob.push({
              ox: -Util.randInt(2, 4 + Math.floor(a2bMob.length / 3)),
              oy: Util.randInt(-2, 2),
              ch: n.ch,
              art: n.art,
              col: n.col,
              b: newBob,
            });
            a2Crew.push({
              b: newBob,
              ru: 0,
              art: n.art,
              col: n.col,
            });
            popupPush(
              Util.pick([
                window.LANG.floatOui,
                window.LANG.floatLetsGo,
                window.LANG.floatAllonsY,
                window.LANG.floatCountMeIn,
                window.LANG.floatYeah,
                window.LANG.floatForReal,
              ]),
              _hitSX,
              n.wy,
              n.col,
              400,
            );
          }
        }
      }
    }
    /* Update join animations */
    for (const m of a2bMob) {
      if (m.joinAnimT > 0) m.joinAnimT -= dt;
    }

 
    if (a2bStoreX + Math.floor(STO_W / 2) - a2bWX <= Math.round(a2bPX) && !a2bDone) {
      a2bDone = true;
      a2bSpd = 0;
      audio.play("recruit");
      triggerFlashGood();
      const _stMidY2b = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
      for (let _b = 0; _b < 6; _b++) {
        burstGood(Math.round(a2bPX) + Util.randInt(-5, 7), _stMidY2b + Util.randInt(-3, 3), C_TEAL, 8);
      }

      const _restMidY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2); // player glides here post-done — cluster around where they'll STOP, not where they are now
      for (let i = 0; i < a2bMob.length; i++) {
        const m = a2bMob[i];
        const baseOX = -3 - Math.floor(i / 3) * 2;
        const jitterX = Math.sin(m.b * 7.3) * 1.5;
        const jitterY = Math.cos(m.b * 4.1) * 0.9;
        m._restX = a2bPX + baseOX + jitterX;
        m._restY = _restMidY + jitterY;
        m._settling = true;
        m._settleT = 0;
        m._settleDur = 600 + (i % 3) * 120; // staggered arrival 600–840ms
      }
     
      setTimeout(() => _transitionAct4ToAct5(), 800);
    }
    /* HUD */
    _updateDomHud();
  }

  function renderAct4(opts = {}) {
 
    const camX = Math.round(a2bWX);
    /* ── very slow parallax 0.04× ── */
    const mtScrollX = a2bWX * 0.04;
    const mtBaseY = A2B_TOP_H - 1; // mountain base sits at top-band floor

    let peakScreenX = -1;
    let peakScreenY = 99999;
    const tallestBuilding = Math.max(...a2bTopParts.map((sp) => sp.art.length));
    const hillFloor = A2B_TOP_H - tallestBuilding - 1;

    for (let x = 0; x < W; x++) {
      const wx = x + mtScrollX; // world x (float OK for smooth scroll)

      const period = 220;
      const phase = ((wx % period) + period) % period; // 0..220
      const norm = phase / period; // 0..1

      const dome = Math.exp(-Math.pow((norm - 0.3) * 3.0, 2)); // Secondary shoulder to the right (Outremont side)
      const shoulder = Math.exp(-Math.pow((norm - 0.62) * 5.0, 2)) * 0.35;
      const hillH = Math.round((dome + shoulder) * (A2B_TOP_H * 0.6));

      const topY = mtBaseY - hillH;
      if (topY < peakScreenY) {
        peakScreenY = topY;
        peakScreenX = x;
      }

      for (let dy = topY; dy <= Math.min(mtBaseY, hillFloor); dy++) {
        if (dy < 0 || dy >= H) continue;
        const depth = dy - topY; // 0 at peak
        let ch, col;
        if (depth === 0) {
          ch = "\u0BF3";
          col = "#27371c"; // ridgeline
        } else if (depth < 2) {
          ch = "\u0B70";
          col = "#213417"; // dense treeline
        } else if (depth < 5) {
          ch = "\u2592";
          col = "#0e170a";
        } else {
          ch = "\u2591";
          col = "#12200c"; // deep hillside
        }

        grid.set(x, dy, ch, col);
      }
    }

    if (peakScreenX >= 0) {
      const crossArt = [" | ", "-+-", " | "];
      const cx = peakScreenX - 1; // offset left by 1 so center char aligns with peak
      const cy = peakScreenY - 3; // place art above the peak
      grid.art(crossArt, cx, cy, "#f0e8c0");
    }

    /* ── Top building row (slight parallax 0.85×) ── */
    const topScrollX = Math.round(a2bWX * 0.85);
    for (const sp of a2bTopParts) {
      const sx = Math.floor(sp.wx) - topScrollX;
      if (sx + sp.w < -2 || sx > W + 2) continue;
      /* Bottom-align art within the top band */
      const artH = sp.art.length;
      const by = A2B_TOP_H - artH;
      grid.art(sp.art, sx, Math.max(0, by), sp.col);
    }



    /* ── Mid-road building segments — the blocks the player weaves around ── */
    if (a2bKiosks) {
      for (const k of a2bKiosks) {
        const ksx = Math.floor(k.wx) - camX;
        if (ksx + k.w < -2 || ksx > W + 2) continue;
        for (const b of k.bldgs) grid.art(b.art, ksx + b.dx, k.baseY - b.art.length, b.col);
      }
    }

    
    for (const sp of a2bBotParts) {
      const sx = Math.floor(sp.wx) - camX;
      if (sx + sp.w < -2 || sx > W + 2) continue;
      grid.art(sp.art, sx, Math.max(A2B_ROAD_Y2 + 1, H - sp.art.length), sp.col);
    }


    for (const n of a2bNPCs) {
      if (n.st !== "idle") continue;
      const sx = Math.floor(n.wx) - camX;
      if (sx < -2 || sx > W + 2) continue;
      const _a2bNpcFrame = n.art || [n.ch, "\u03C6"];
      const _a2bNpcCol = n.narc && Math.floor(a2bT / 80) % 52 === 0 ? C_DANGER : n.col;
      grid.art(_a2bNpcFrame, sx, n.wy, _a2bNpcCol);
    }

  
    if (a2bWX > a2bStoreX - W - 20) {
      const stsx = Math.floor(a2bStoreX) - camX;
      if (stsx < W + 10) {
        const stY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2) - Math.floor(STO_H / 2);
        const _stFlash = Math.sin(Date.now() / 400) > 0;
        for (let _ri = 0; _ri < STORE.length; _ri++) {
          const _row = STORE[_ri];
          const _hasLetter = /[A-Za-z]/.test(_row);
          // Matches the Act 5 storefront's palette (white/orange/cyan, no red).
          const _rowCol = _hasLetter ? (_stFlash ? "#fff" : C_ORANGE) : _stFlash ? C_PLAYER : C_ORANGE;
          for (let _ci = 0; _ci < _row.length; _ci++) {
            if (_row[_ci] !== " ") grid.set(stsx + _ci, stY + _ri, _row[_ci], _rowCol);
          }
        }
      }
    }

    if (!opts.skipPlayerCrew) {
      /* ── Mob trailing player ── */
      const ppx = Math.round(a2bPX),
        ppy = Math.round(a2bPY);
      for (let i = 0; i < a2bMob.length; i++) {
        const m = a2bMob[i];
        let mx, my, _mobFrame;
        if (m._settling) {
     
          m._settleT += 16; // approx ms per frame; close enough for visual easing
          const t = Util.clamp(m._settleT / m._settleDur, 0, 1);
          /* Ease-out cubic — fast at start, gentle landing */
          const e = 1 - Math.pow(1 - t, 3);

          /* Where the orbit had them */
          const clusterR = 2;
          const angle = a2bT / 600 + m.b;
          const orbitX = Math.sin(angle + i) * clusterR;
          const orbitY = Math.cos(angle + i) * (clusterR * 0.35);
          const baseOX = -4 - Math.floor(i / 3) * 2; // matches the resting orbit's baseOX below
          const orbitFinalX = ppx + baseOX + orbitX;
          const orbitFinalY = ppy + orbitY;

          /* Lerp from orbit to rest */
          const restY = m._restY + Math.sin(a2bT / 700 + m.b) * 0.35; // breathe once arrived
          const finalX = orbitFinalX + (m._restX - orbitFinalX) * e;
          const finalY = orbitFinalY + (restY - orbitFinalY) * e;
          mx = Math.round(finalX);
          my = Math.round(finalY);

          /* Legs cycle while still moving (t < 0.7), then standing */
          _mobFrame = [...(m.art || [m.ch, "\u03C6"])];
          if (t < 0.7) {
            _mobFrame[1] = Math.floor(a2bT / 200 + m.b * 30) % 2 === 0 ? _mobFrame[1] : "\u20B3";
          }
        } else if (m.isCat) {
          // Cat doesn't tumble — it pads alongside the mob
          const prowl = Math.sin(a2bT / 400 + m.b) * 1.4;
          const baseOX = -4 - Math.floor(i / 3) * 2; // matches the resting orbit's baseOX
          mx = Math.round(ppx + baseOX + prowl);
          my = Math.round(ppy);
          _mobFrame = [...(m.art || [m.ch, "\u03C6"])];
          // No leg toggle for cat
        } else {
          // Katamari-style: tight orbit around a rolling cluster center
          const clusterR = 2;
          const angle = a2bT / 600 + m.b;
          const orbitX = Math.sin(angle + i) * clusterR;
          const orbitY = Math.cos(angle + i) * (clusterR * 0.35);
          // -4 keeps the orbit's closest approach clear of the player.
          const baseOX = -4 - Math.floor(i / 3) * 2;
          mx = Math.round(ppx + baseOX + orbitX);
          my = Math.round(ppy + orbitY);
          _mobFrame = [...(m.art || [m.ch, "\u03C6"])];
          _mobFrame[1] = Math.floor(a2bT / 200 + m.b * 30) % 2 === 0 ? _mobFrame[1] : "\u20B3";
        }
 
        if (mx >= 0 && mx < W && my >= 0 && my < H) {
          let col = m.col || "#3a9a3a";
          if (m.popT && m.popT > 100) col = "#fff";
          grid.art(_mobFrame, mx, my, col, m.isCat); // cat always faces forward — see the Act 3 crew-trail comment
        }
      }

      /* ── Player — same 2-row art as Act 3 ── */
      const _a2bPFrame = [...(A2_PA[Math.floor(a2bT / 10) % 2] || A2_PA[0])];
      _a2bPFrame[1] = Math.floor(a2bT / 180) % 2 === 0 ? _a2bPFrame[1] : "\u20B3";
      grid.art(_a2bPFrame, ppx, ppy, playerPulseColor(a2bT));
    }

    /* ── NPC ambient text boxes ── */
    for (const n of a2bNPCs) {
      const sx = Math.floor(n.wx) - camX;
      if (sx < -2 || sx > W + 2) continue;
      if (n.st !== "idle") continue;
      if (a2bT <= 800) continue;
      const dist = Math.abs(n.wx - (a2bWX + a2bPX));
      if (dist >= 15 || dist <= 4) continue;
      const maxInner = 16;
      const lines = wrapWords(n.amb, maxInner);
      const bw = Math.min(maxInner + 2, Math.max(...lines.map((l) => l.length)) + 2);
      const bh = lines.length + 2;
      const tx = Util.clamp(sx - Math.floor(bw / 2), 0, W - bw);
      const ty = n.wy - bh - 0;
      if (ty >= A2B_ROAD_Y1 && ty + bh < A2B_ROAD_Y2) {
        for (let by = ty; by < ty + bh && by < H; by++)
          for (let bx2 = tx; bx2 < tx + bw && bx2 < W; bx2++) if (bx2 >= 0) grid.set(bx2, by, " ", null);
        grid.text(DIALOG_BOX.tl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.tr, tx, ty, n.col);
        for (let li = 0; li < lines.length; li++) {
          grid.text(DIALOG_BOX.v + " ".repeat(bw - 2) + DIALOG_BOX.v, tx, ty + 1 + li, n.col);
          grid.text(lines[li], tx + 1, ty + 1 + li, n.col);
        }
        grid.text(DIALOG_BOX.bl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.br, tx, ty + 1 + lines.length, n.col);
      }
    }

    popupRender();

    // In-context prompts — only one at a time, fading once satisfied.
    if (!a2bDone) {
    
      if (!Device.isMobile && !a2bHasRun && a2bT > 2500) {
        renderTapPrompt(ctrl("act4Run"), H - 2, "#fff", C_PLAYER);
      } else if ((Device.isMobile || a2bHasRun) && !a2bHasDodged) {
        // Show dodge prompt only when a narc is approaching on screen
        const pwxB = a2bWX + a2bPX;
        const nearNarc = a2bNPCs.find((n) => n.narc && n.st === "idle" && n.wx > pwxB && n.wx - pwxB < 22 && Math.abs(n.wy - a2bPY) < 3);
        if (nearNarc) renderTapPrompt(ctrl("act4Dodge"), H - 2, "#fff", C_WARN);
      }
    }

    Banner.render();
  }


  function _transitionAct4ToAct5() {
    try {
      loop.stop();
    } catch (_) {}
    const excludeXY = _excludeByDiff(
      () => render(true),
      () => renderAct4({ skipPlayerCrew: true }),
    );
    const keepCells = excludeXY.map((p) => ({ x: p.x, y: p.y, ch: grid.c[p.y][p.x].ch, co: grid.c[p.y][p.x].co }));
    const playerFrom = { x: Math.round(a2bPX), y: Math.round(a2bPY) };
    const crewFrom = a2bMob.map((m) => ({ x: Math.round(m._restX ?? a2bPX - 3), y: Math.round(m._restY ?? a2bPY) }));
    collapseToCenter(
      (pool) => {
        initAct5({ playerFrom, crewFrom });
        riseFromPile(() => loop.start(), { spawnPool: pool, peppersMs: 700, keepCells, simmer: true });
      },
      { excludeXY, render: false },
    );
  }

