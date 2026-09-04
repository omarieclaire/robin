
  let _langDataReady = false;
  function setupLangData() {
    _langDataReady = true;
    const _rawStore = window.LANG === window.LANG_FR ? window.GAME_DATA.storeArtFR : window.GAME_DATA.storeArtEN;
    if (Device.isMobile) {
      const _treeL = ["^ ", "/\\", "||"];
      const _treeR = [" ^", "/\\", "||"];
      const _storeH = _rawStore.length;
      STORE = _rawStore.map((row, i) => {
        const fromBottom = _storeH - 1 - i;
        if (fromBottom >= 3) return "  " + row + "  ";
        const tL = _treeL[2 - fromBottom];
        const tR = _treeR[2 - fromBottom];
        return tL + row + tR;
      });
    } else {
      STORE = _rawStore;
    }
    STO_W = STORE[0].length;
    STO_H = STORE.length;

    FRIDGE = window.LANG === window.LANG_FR ? window.GAME_DATA.fridgeArtFR : window.GAME_DATA.fridgeArtEN;
    NQ = window.LANG === window.LANG_FR ? window.GAME_DATA.narrativeQuotesFR : window.GAME_DATA.narrativeQuotesEN;

    A1E = window.LANG.a1Encounters;
    END_NAMES = window.LANG.endNames;
    D_INTERCOM_TICKER = Util.shuffle(window.LANG.intercoms);
    s4TickerNextIdx = 0;

    FOODS = window.LANG === window.LANG_FR ? window.GAME_DATA.foodsFR : window.GAME_DATA.foods;

    A1_LOOP_MSGS = window.LANG.a1LoopMsgs;
  }

  function startGame() {
    setupLangData();
    floats.length = 0;
    s4AlyScore = 0;
    a2CrewCount = 0;
    dialogStack = [];
    overlay.classList.add("hidden");
    if (hasPlayed) {
      initAct3();
      loop.start();
    } else {
      Banner.text = "";
      Banner.timer = 0;
      loop.stop();
      initAct2();
      riseFromPile(
        () => {
          loop.start();
          Banner.showSequence(
            [
              // One color for all three beats
              { t: window.LANG.bannerIsThisALife, c: "#7c94b2", d: 99999 },
              { pause: true, d: 500 },
              { t: window.LANG.bannerWhoIsInControl, c: "#7c94b2", d: 99999 },
              { pause: true, d: 2000 },
              { t: window.LANG.bannerYouControlNothing || "(it sure isn't you)", c: "#7c94b2", d: 99999 },
            ],
          );
        },
        { spawnPool: _titlePileSpawnPool },
      );
      _titlePileSpawnPool = null; // one-time reuse — later restarts fall back to the normal random heap
    }
    // hasPlayed is set to true when the player reaches Act 3
  }

  ovTitle.textContent = window.LANG.overlayTitle;
  ovSub.innerHTML = window.LANG.overlaySub;
  ovHint.textContent = window.LANG.overlayHint || "";
  startBtn.textContent = window.LANG.playBtn;
  
  const helpTitleEl = document.getElementById("help-title");
  const helpMusicLabelEl = document.getElementById("help-music-label");
  if (helpTitleEl) helpTitleEl.textContent = window.LANG.helpCreditsTitle || "Credits";
  if (helpMusicLabelEl) helpMusicLabelEl.textContent = window.LANG.helpMusicLabel || "Music:";

  // Facebook/Messenger's in-app browser -> point players at the native "open in browser" option once per device.
  const fbHint = document.getElementById("fb-hint");
  if (fbHint && Device.isFacebookInApp && !localStorage.getItem("fbHintDismissed")) {
    document.getElementById("fb-hint-text").textContent = window.LANG.fbInAppHint;
    fbHint.classList.remove("hidden");
    document.getElementById("fb-hint-close").addEventListener("click", () => {
      fbHint.classList.add("hidden");
      localStorage.setItem("fbHintDismissed", "true");
    });
  }

  let _startInFlight = false;
  startBtn.addEventListener("click", async () => {
    if (_startInFlight) return;
    _startInFlight = true;
 
    _stopLandingAnim();
    await audio.unlock();
  
    await audio.preload(["click"], { blob: true });
    audio.play("click");
    Music.play("music_act1");
    audio.preload(["trumpet", "paper", "playertxtbox", "npctxtbox"], { blob: true }).then(() => {
      audio.preload(["bump", "level", "maybe", "drop", "urgent", "exit", "recruit", "narc", "grab", "bust"], { blob: true });
    });

    // Hide the overlay immediately — content is already on the grid, no jump
    overlay.classList.add("hidden");

    const cyFallback = Math.floor(H / 2);
    const LR = _landingRows || { courtyardTop: cyFallback - 2, courtyardBot: cyFallback + 2, midTop: cyFallback - 2, midBot: cyFallback + 2 };

    const GROUP_DELAY = 420;
    const JITTER = 260;

    const rowsBot = [],
      rowsMid = [],
      rowsTop = [];
    for (let r = LR.courtyardTop; r <= LR.courtyardBot; r++) {
      if (r > LR.midBot) rowsBot.push(r);
      else if (r < LR.midTop) rowsTop.push(r);
      else rowsMid.push(r);
    }
    const groups = [rowsBot, rowsMid, rowsTop].filter((g) => g.length > 0 && g.every((r) => r >= 0 && r < H));
    const rowGroup = {};
    groups.forEach((rows, gi) => rows.forEach((r) => (rowGroup[r] = gi)));
    const lastReleaseAt = Math.max(0, groups.length - 1) * GROUP_DELAY + JITTER;

    
    const _crossX = Math.floor(W / 2);

   
    collapseGravity(
      () => {
    
        const pool = [];
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) if (grid.c[y][x].ch !== " ") pool.push({ x, y, ch: grid.c[y][x].ch, co: grid.c[y][x].co });
        _titlePileSpawnPool = pool;

      
        const _genAtSettle = _transitionGen;
        setTimeout(() => {
          if (_genAtSettle !== _transitionGen) return;
          overlay.classList.remove("grid-landing");
          startGame();
        }, 800);
      },
      {
        render: false,
        jitter: JITTER,
        lastReleaseAt,
       
        edgeDrain: 0.85,
        dropArt: { art: [" | ", "-+-", " | "], x: _crossX, releaseAt: lastReleaseAt + 80, co: "#8a8468" },
        releaseAt: (x, y) => {
          const gi = rowGroup[y];
          return gi === undefined ? 0 : gi * GROUP_DELAY + Math.random() * JITTER;
        },
      },
    );
  });


  startBtn.addEventListener("mouseenter", () => {
    if (!overlay.classList.contains("grid-landing")) return;
    _playBtnHover = true; // the landing anim loop redraws with this each frame
  });
  startBtn.addEventListener("mouseleave", () => {
    if (!overlay.classList.contains("grid-landing")) return;
    _playBtnHover = false;
  });


  window.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (overlay.classList.contains("hidden")) return; // in-game — Space is the action key there
    if (helpOverlay.classList.contains("open")) return;
    if (startBtn.style.display === "none") return;
    if (document.activeElement === startBtn) return; // focused button fires click natively — don't double it
    if (phase && phase !== "done") return; // only on landing (phase unset) or quit screen (phase "done")
    e.preventDefault();
    startBtn.click();
  });

  let _landingRows = null;

  let _titlePileSpawnPool = null;


  let _playBtnGeom = null;
  function _drawPlayBox(hover) {
    if (!grid || !_playBtnGeom) return;
    const { x, top, mid, bot, w, label } = _playBtnGeom;
    const box = hover ? CONV_BOX : SHARP_BOX;
    const baseCol = _playBtnGeom.color || C_PLAYER;
    const color = hover ? brightenColor(baseCol, 0.55) : baseCol;
    grid.text(box.tl + box.h.repeat(w - 2) + box.tr, x, top, color);
    grid.text(box.v + label + box.v, x, mid, color);
    grid.text(box.bl + box.h.repeat(w - 2) + box.br, x, bot, color);
  }

  const LANDING_GAP = 1;
  function _pickUniqueRow(targetW, usedNames) {
    const pool = BUILDINGS.filter((b) => !usedNames.has(b.name));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const pieces = [];
    let usedW = 0;
    for (const b of pool) {
      const addW = b.size + (pieces.length > 0 ? LANDING_GAP : 0);
      if (usedW + addW > targetW) continue;
      pieces.push(b);
      usedNames.add(b.name);
      usedW += addW;
    }
    return pieces;
  }


  const LANDING_BCOL = ["#5cbdbd", "#e8944a", "#d4b050", "#7c94d4", "#9ab89a", "#b08ad0"];
  function _drawGroundedRow(pieces, groundY, startX) {
    const totalW = pieces.reduce((s, b, i) => s + b.size + (i > 0 ? LANDING_GAP : 0), 0);
    let x = startX ?? Math.floor((W - totalW) / 2);
    const rowStart = x;
    let maxH = 0;
    for (const b of pieces) {
      grid.art(b.art, x, groundY - b.art.length + 1, b.color || Util.pick(LANDING_BCOL));
      maxH = Math.max(maxH, b.art.length);
      x += b.size + LANDING_GAP;
    }
    if (groundY + 1 < H) {
      const sx = Math.max(0, rowStart - 2);
      const ex = Math.min(W - 1, rowStart + totalW + 1);
      for (let gx = sx; gx <= ex; gx++) grid.set(gx, groundY + 1, "═", "#3a3f4a");
    }
    return maxH;
  }

  function _wrapText(str, maxW) {
    if (!str) return [];
    if (str.length <= maxW) return [str];
    const words = str.split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      const cand = cur ? cur + " " + w : w;
      if (cand.length > maxW) {
        if (cur) lines.push(cur);
        cur = w.length > maxW ? w.slice(0, maxW) : w;
      } else {
        cur = cand;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }


  const LANDING_FRAME_PAD_X = 4;
  const LANDING_FRAME_PAD_Y = 1;

  let _landingLayout = null;
  let _landingAmb = null; // ambient state: the wandering people + cats
  let _landingAnimOn = false;
  let _landingLastT = 0;
  let _playBtnHover = false;

  function _layoutLanding() {
    const title = window.LANG.overlayTitle;
    const subRaw = (window.LANG.overlaySub || "")
      .replace(/<[^>]+>/g, "")
      .split("\n")[0]
      .trim();
    const hintRaw = window.LANG.overlayHint || "";
    const maxTextW = Math.max(10, W - 4 - (LANDING_FRAME_PAD_X + 1) * 2);

    const titleLines = _wrapText(title, maxTextW);
    const subLines = subRaw ? _wrapText(subRaw, maxTextW) : [];
    const hintLines = hintRaw ? _wrapText(hintRaw, maxTextW) : [];

    const textRows = titleLines.length + (subLines.length ? subLines.length + 1 : 0) + (hintLines.length ? hintLines.length + 1 : 0);
    let textTop = Math.floor(H / 2) - Math.floor(textRows / 2);

    const btnLabel = " " + (window.LANG.playBtn || "PLAY") + " ";
    const btnW = btnLabel.length + 2;
    const btnX = Math.floor((W - btnW) / 2);

    let ty = textTop + titleLines.length;
    if (subLines.length) ty += 1 + subLines.length;
    if (hintLines.length) ty += 1 + hintLines.length;
    let btnTop = ty - 1 + 2;

    const allLines = [...titleLines, ...subLines, ...hintLines];
    const widestLine = allLines.reduce((w, l) => Math.max(w, l.length), 0);
    const frameW = Math.min(W - 2, Math.max(widestLine, btnW) + (LANDING_FRAME_PAD_X + 1) * 2);
    const frameX = Math.floor((W - frameW) / 2);
    let frameTop = textTop - 1 - LANDING_FRAME_PAD_Y;
    let frameBot = btnTop + 2 + 1 + LANDING_FRAME_PAD_Y;

    const usedNames = new Set();
    const pickRow = () => _pickUniqueRow(W - 2, usedNames).map((b) => ({ art: b.art, size: b.size, color: Util.pick(LANDING_BCOL) }));
    const bandH = (p) => (p.length ? Math.max(...p.map((b) => b.art.length)) : 0);


    const topPieces = pickRow();
    const b1Pieces = pickRow();
    const b2Pieces = pickRow();
    const hTop = bandH(topPieces),
      hB1 = bandH(b1Pieces),
      hB2 = bandH(b2Pieces);
    const frameOuterH = frameBot - frameTop + 3; // includes the outer ring rows


    let showTop = topPieces.length > 0,
      showB1 = b1Pieces.length > 0,
      showB2 = b2Pieces.length > 0;
    const calcFree = () => H - 2 - frameOuterH - (showTop ? hTop + 1 : 0) - (showB1 ? hB1 + 1 : 0) - (showB2 ? hB2 + 1 : 0);
    const nGaps = () => 1 + (showTop ? 1 : 0) + (showB1 ? 1 : 0) + (showB2 ? 1 : 0) - 1;
    if (calcFree() < nGaps() * 2) showB2 = false;
    if (calcFree() < nGaps() * 2) showTop = false;
    if (calcFree() < nGaps() * 2) showB1 = false;

    const bands = [];
    let courtyardTop = frameTop,
      courtyardBot = frameBot;
    if (nGaps() >= 1 && calcFree() >= 0) {
      const free = calcFree(),
        n = nGaps();
      const base = Math.floor(free / n),
        rem = free % n;
      const gap = (i) => base + (i < rem ? 1 : 0);
      let cursor = 1; // top margin
      let gi = 0;
      if (showTop) {
        const ground = cursor + hTop - 1;
        bands.push({ pieces: topPieces, ground });
        courtyardTop = cursor;
        cursor = ground + 2 + gap(gi++); // past sidewalk + gap
      }
   
      const delta = cursor + 1 - frameTop; // cursor = outer ring top row
      textTop += delta;
      btnTop += delta;
      frameTop += delta;
      frameBot += delta;
      cursor = frameBot + 2 + (gi <= n - 1 ? gap(gi++) : 0); // past outer ring + gap
      if (showB1) {
        const ground = cursor + hB1 - 1;
        bands.push({ pieces: b1Pieces, ground });
        courtyardBot = ground + 1;
        cursor = ground + 2 + (gi <= n - 1 ? gap(gi++) : 0);
      }
      if (showB2) {
        const ground = cursor + hB2 - 1;
        bands.push({ pieces: b2Pieces, ground });
        courtyardBot = ground + 1;
      }
    }

   
    const sideStrips = [];
    if (!Device.isMobile) {
      const topBandGround = showTop && bands.length ? bands[0].ground : null;
      const minRoof = topBandGround !== null ? topBandGround + 4 : 2; // keep clear of the top band's sidewalk + walking row
      const sideDefs = [
        { x0: 2, x1: frameX - 5 },
        { x0: frameX + frameW + 4, x1: W - 3 },
      ];
      const stripX = (s, pieces) => {
        const totalW = pieces.reduce((sum, b, i) => sum + b.size + (i > 0 ? LANDING_GAP : 0), 0);
        return s.x0 + Math.floor((s.x1 - s.x0 + 1 - totalW) / 2);
      };
      for (const s of sideDefs) {
        const gapW = s.x1 - s.x0 + 1;
        if (gapW < 8) continue;
        const p1 = _pickUniqueRow(gapW, usedNames).map((b) => ({ art: b.art, size: b.size, color: Util.pick(LANDING_BCOL) }));
        if (p1.length === 0) continue;
        const h1 = Math.max(...p1.map((b) => b.art.length));
        if (frameBot - h1 + 1 < minRoof) continue; // gutter too short for even one row
        sideStrips.push({ pieces: p1, ground: frameBot, x: stripX(s, p1) });
        // Second row above — positioned so the gutter's leftover rows split
        const p2 = _pickUniqueRow(gapW, usedNames).map((b) => ({ art: b.art, size: b.size, color: Util.pick(LANDING_BCOL) }));
        if (p2.length === 0) continue;
        const h2 = Math.max(...p2.map((b) => b.art.length));
        const free = frameBot - minRoof + 1 - (h1 + h2 + 1); // gutter rows minus both rows' art + upper sidewalk
        if (free < 2) continue;
        const gMid = Math.floor(free / 2);
        sideStrips.push({ pieces: p2, ground: frameBot - h1 - gMid - 1, x: stripX(s, p2) });
      }
    }

    // People + cats wander one row BELOW each band's sidewalk line 
    const walkRows = bands.map((b) => b.ground + 2).filter((r) => r < H);

    _landingLayout = {
      titleLines,
      subLines,
      hintLines,
      textTop,
      titleCol: C_PLAYER, // cyan — the game's own identity color
      subCol: PAL.landingSub || "#9fb3d9",
      hintCol: PAL.landingHint || "#8a92ac",
      frameCol: dullColor(PAL.landingFrame || "#f5a032", 0.25), // warm, slightly settled orange
      btnCol: PAL.landingBtn || "#53ffaf", // mint — the single loud accent on the screen
      frame: { x: frameX, top: frameTop, bot: frameBot, w: frameW },
      btn: { x: btnX, top: btnTop, w: btnW, label: btnLabel },
      bands,
      sideStrips,
      walkRows,
      courtyardTop,
      courtyardBot,
    };

    _landingAmb = { walkers: [], nextWalkerIn: 0 };
    _spawnLandingWalker(true);
  }


  function _spawnLandingWalker(midScreen) {
    const L = _landingLayout,
      A = _landingAmb;
    if (!L || !A || L.walkRows.length === 0) return;
    const isCat = Math.random() < 0.3;
    const dir = Math.random() < 0.5 ? 1 : -1;
    A.walkers.push({
      y: Util.pick(L.walkRows),
      x: midScreen ? W * (0.3 + Math.random() * 0.4) : dir === 1 ? -3 : W + 2,
      dir,
      spd: (isCat ? 4.5 : 3) + Math.random() * 2, // cells/sec — cats trot
      art: isCat ? [Util.pick(CAT_GLYPHS)] : Util.pick(window.GAME_DATA.npcArts),
      co: isCat ? Util.pick(["#ee8833", "#c8b090", "#a8703a", "#e8c44a"]) : Util.pick(window.GAME_DATA.npcColors), // same warm palette as the Act 3 cat — no gray
      isCat,
    });
    A.nextWalkerIn = 4000 + Math.random() * 6000;
  }

  function _drawLandingFrame(nowMs) {
    const L = _landingLayout;
    if (!grid || !L) return;
    grid.clear();

    // Text block
    let y = L.textTop;
    for (const line of L.titleLines) grid.textCenter(line, y++, L.titleCol);
    if (L.subLines.length) {
      y++;
      for (const line of L.subLines) grid.textCenter(line, y++, L.subCol);
    }
    if (L.hintLines.length) {
      y++;
      for (const line of L.hintLines) grid.textCenter(line, y++, L.hintCol);
    }

    // PLAY button (grid-drawn; the real invisible <button> sits on top)
    _playBtnGeom = { x: L.btn.x, top: L.btn.top, mid: L.btn.top + 1, bot: L.btn.top + 2, w: L.btn.w, label: L.btn.label, color: L.btnCol };
    _drawPlayBox(_playBtnHover);

    // Nested banner-style frame (same language as the game's own banners)
    const { x: frameX, top: frameTop, bot: frameBot, w: frameW } = L.frame;
    if (frameTop - 1 >= 0 && frameBot + 1 < H) {
      grid.text(BANNER_BOX.tl + BANNER_BOX.h.repeat(frameW - 2) + BANNER_BOX.tr, frameX, frameTop, L.frameCol);
      for (let fy = frameTop + 1; fy < frameBot; fy++) {
        grid.set(frameX, fy, BANNER_BOX.v, L.frameCol);
        grid.set(frameX + frameW - 1, fy, BANNER_BOX.v, L.frameCol);
      }
      grid.text(BANNER_BOX.bl + BANNER_BOX.h.repeat(frameW - 2) + BANNER_BOX.br, frameX, frameBot, L.frameCol);
      const oCol = dullColor(L.frameCol, 0.45);
      const obx = frameX - 1,
        oby = frameTop - 1,
        obw = frameW + 2,
        obh = frameBot - frameTop + 3;
      grid.text(BANNER_BOX.tl + BANNER_BOX.h.repeat(obw - 2) + BANNER_BOX.tr, obx, oby, oCol);
      for (let ory = 1; ory < obh - 1; ory++) {
        grid.set(obx, oby + ory, BANNER_BOX.v, oCol);
        grid.set(obx + obw - 1, oby + ory, BANNER_BOX.v, oCol);
      }
      grid.text(BANNER_BOX.bl + BANNER_BOX.h.repeat(obw - 2) + BANNER_BOX.br, obx, oby + obh - 1, oCol);
    }

    // Building bands + their sidewalks
    for (const band of L.bands) _drawGroundedRow(band.pieces, band.ground);
    // Desktop side strips flanking the title frame (no walkers on these)
    for (const strip of L.sideStrips) _drawGroundedRow(strip.pieces, strip.ground, strip.x);

    // The people + cats — wandering the ruelle rows, a row below each sidewalk line
    if (_landingAmb) {
      for (const wk of _landingAmb.walkers) {
        const wx = Math.round(wk.x);
        if (wx < -3 || wx > W + 3) continue;
        const frame = [...wk.art];
        if (!wk.isCat && frame.length > 1) {
          frame[1] = Math.floor(nowMs / 220) % 2 === 0 ? frame[1] : "₳";
        }
        grid.art(frame, wx, wk.y - frame.length + 1, wk.co, wk.isCat && wk.dir === 1);
      }
    }

    gs.innerHTML = grid.html();
  }

  function _stopLandingAnim() {
    _landingAnimOn = false;
  }

  function _landingTick(now) {
    if (!_landingAnimOn) return;
    if (phase || overlay.classList.contains("hidden") || !overlay.classList.contains("grid-landing")) {
      _landingAnimOn = false;
      return;
    }
    const dt = Math.max(0, Math.min(now - _landingLastT, 100));
    _landingLastT = now;
    const A = _landingAmb;
    if (A) {
      for (let i = A.walkers.length - 1; i >= 0; i--) {
        const wk = A.walkers[i];
        wk.x += (wk.dir * wk.spd * dt) / 1000;
        if ((wk.dir === 1 && wk.x > W + 3) || (wk.dir === -1 && wk.x < -4)) A.walkers.splice(i, 1);
      }
      A.nextWalkerIn -= dt;
      if (A.nextWalkerIn <= 0 && A.walkers.length < 3) _spawnLandingWalker(false);
    }
    _drawLandingFrame(now);
    requestAnimationFrame(_landingTick);
  }

  function renderLandingToGrid() {
    if (!grid) return;
    if (!_landingLayout) _layoutLanding();
    const L = _landingLayout;
    _drawLandingFrame(performance.now());
    _landingRows = { courtyardTop: L.courtyardTop, courtyardBot: L.courtyardBot, midTop: L.frame.top, midBot: L.frame.bot };
    _positionStartBtn(L.btn.x, L.btn.top, L.btn.w, 3);
    if (!_landingAnimOn) {
      _landingAnimOn = true;
      _landingLastT = performance.now();
      requestAnimationFrame(_landingTick);
    }
  }

  // The PLAY button.
  function _positionStartBtn(col, row, wCells, hCells) {
    if (!startBtn) return;
    const gsRect = gs.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    const { cellW, cellH } = _measureCell();
    startBtn.style.left = gsRect.left - overlayRect.left + col * cellW + "px";
    startBtn.style.top = gsRect.top - overlayRect.top + row * cellH + "px";
    startBtn.style.right = "auto";
    startBtn.style.bottom = "auto";
    startBtn.style.transform = "none";
    startBtn.style.width = wCells * cellW + "px";
    startBtn.style.height = hCells * cellH + "px";
  }

