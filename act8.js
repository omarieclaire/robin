

  let FRIDGE = window.LANG === window.LANG_FR ? window.GAME_DATA.fridgeArtFR : window.GAME_DATA.fridgeArtEN;
  let a5NeighboursStarted, a5NeighboursArrivedAt, a5ArrivalFallbackT; // gate the overlap between the food-drop and the neighbours walking in
  let a5NeighboursStartedAt; // a5T snapshot at the moment they started — lets each neighbour's per-index stagger delay be measured from a fixed point
  let a5ThanksIdx, a5ThanksCadenceT; // sequential one-at-a-time thank-you reveal
  let a5FoodBurstDone;
  const A5_TAP_GATE_MS = 2200; // shared by the render prompt and the tap-accept check — must match, see updateAct8

  function initAct8() {
    audio.play("level");
    audio.preload(["music_act9"]);
    _inlinePopups.length = 0;
    phase = "act8";
    ensureCrew();
   
    for (const c of a2Crew) {
      if (c.isDefector) {
        c.art = [HAT_CHAR, "Ħ"];
        c.col = C_TEAL;
      }
    }
    a5T = 0;
    a5P = 0;
    a5NeighboursStarted = false;
    a5NeighboursStartedAt = 0;
    a5ThanksIdx = 0;
    a5ThanksCadenceT = 0;
    a5NeighboursArrivedAt = null;
    a5ArrivalFallbackT = 0;

    a5FoodPlacements = null;
    a5FlyingItems = null;
    a5FoodBurstDone = false;
    a5FoodCycleT = 0;
    a5FoodTotalPlaced = 0;
    a5LastCounterValue = 0;
    a5LastCounterFlash = 0;
    Banner.timer = 0;
    dialogStack = [];
    hudLabel.textContent = "";
    hudScore.textContent = "";
    hudStatus.textContent = "";
    a5Crew = [];
    const rc = a2CrewCount; // show ALL crew, no cap (cats are already counted — every recruit, cat or human, increments a2CrewCount)
    // Fridge higher
    const fridgeW = FRIDGE[0].length;
    const fx = Math.floor((W - fridgeW) / 2);
    // Wrap into rows if too many for one row
    const slotW = 3; // horizontal cells per character
    const usableW = W - 4;
    const slotsPerRow = Math.max(3, Math.floor(usableW / slotW));
    const totalSlots = rc + 1; // crew + player

    const crewRowsNeeded = Math.max(1, Math.ceil(totalSlots / slotsPerRow));
    const extraCrewRows = Device.isMobile ? crewRowsNeeded - 1 : 0;
    const fy = Math.max(6, Math.floor(H / 2) - 10 - extraCrewRows * 3);
    a5FridgeY = fy;

    const _numShelves = Device.isMobile ? 2 : 3;
    const _shelfH = 6;
    const _fridgeBot = fy - 4 + 3 + _numShelves * _shelfH + 1;
    const lineY = _fridgeBot + 3; // crew sits 2 rows below fridge
    const playerSlot = Math.floor(Math.min(slotsPerRow, totalSlots) / 2); // player roughly centered in first row
    let crewIdx = 0;
    for (let slot = 0; slot < totalSlots; slot++) {
      if (slot === playerSlot) continue; // player slot, handled in render
      const row = Math.floor(slot / slotsPerRow);
      const idxInRow = slot % slotsPerRow;
      const itemsInRow = Math.min(slotsPerRow, totalSlots - row * slotsPerRow);
      const rowStartX = Math.floor((W - itemsInRow * slotW) / 2);
      const targetX = rowStartX + idxInRow * slotW;
 
      const targetY = lineY + row * (Device.isMobile ? 3 : 2);
      const cs = a2Crew[crewIdx] || {};
      a5Crew.push({
        x: crewIdx % 2 === 0 ? -3 - crewIdx * 4 : W + 3 + crewIdx * 4,
        y: targetY,
        tx: Util.clamp(targetX, 2, W - 5),
        ty: targetY,
        arrived: false,
        art: cs.art,
        col: cs.col,
      });
      crewIdx++;
    }
    // Store player X for render — player stays in first row
    const firstRowItems = Math.min(slotsPerRow, totalSlots);
    const firstRowStart = Math.floor((W - firstRowItems * slotW) / 2);
    a5Crew._playerX = Util.clamp(firstRowStart + playerSlot * slotW, 2, W - 5);
    a5Crew._playerY = lineY;
    // Neighbours arrive after food is placed — centred around the fridge
    const shuffled = Util.shuffle(END_NAMES.slice());
    a5Neighbours = [];
    const fridgeWidth = FRIDGE[0].length;
    const fridgeCX = Math.floor(W / 2);
    const numNeighbours = Math.min(4, shuffled.length);
  
    const nbRowStep = Device.isMobile ? 4 : 2;
    const nbBaseOffset = Device.isMobile ? 8 : 4;
    const nbMaxPairIdx = Math.floor((numNeighbours - 1) / 2);
    const nbLastTy = lineY + nbBaseOffset + nbMaxPairIdx * nbRowStep;
    const nbSafeBottom = H - 5; // leave room above the tap-to-continue prompt at H-2
    const nbOverflow = Math.max(0, nbLastTy + 1 - nbSafeBottom);
    const nbBaseOffsetAdj = nbBaseOffset - nbOverflow;
    for (let i = 0; i < numNeighbours; i++) {
      const nm = shuffled[i];
      const fromRight = i % 2 === 0;
      const nx = fromRight ? W + 3 + i * 6 : -3 - i * 6;
      const ty = lineY + nbBaseOffsetAdj + Math.floor(i / 2) * nbRowStep; /* Symmetrically distribute around fridge center */
      const pairIdx = Math.floor(i / 2); /* 0,0,1,1 */
      const side = fromRight ? 1 : -1;

      const offset = Device.isMobile
        ? 9 + pairIdx * 4 // a bit wider spread on mobile
        : Math.floor(fridgeWidth / 2) + 2 + pairIdx * 9; // was +4 — on a wide desktop window that read as clumped tight next to the fridge instead of using the extra room
      const tx = fridgeCX + side * offset;
      a5Neighbours.push({
        x: nx,
        y: ty,
  
        tx: Util.clamp(tx, 2, W - 4),
        ty,
        name: nm.n,
        msg: Util.pick(window.LANG.neighbourMsgs),
        arrived: false,
        col: window.GAME_DATA.npcColors[(i + 3) % window.GAME_DATA.npcColors.length],
        art: window.GAME_DATA.npcArts[i % window.GAME_DATA.npcArts.length],
        // staggered walk-in start
        delay: i * 400,
      });
    }
  }
  function updateAct8(dt) {
    a5T += dt;
    Banner.update(dt);
    dialogUpdate(dt);
    if (a5P === 0) {
      let allArrived = true;
      for (const c of a5Crew) {
        if (typeof c === "object" && !c.arrived) {
          c.x = Util.lerp(c.x, c.tx, 0.04);
          if (Math.abs(c.x - c.tx) < 0.5) {
            c.x = c.tx;
            c.arrived = true;
          } else allArrived = false;
        }
      }
      if (allArrived && a5T > 1500) {
        Music.transition("music_act8"); // drop-off music starts now, not on init
        // Arriving at the fridge 
        audio.play("recruit");
        triggerFlashGood();
        const _celebY = Math.floor(H / 2) - 4;
        burstGood(Math.floor(W / 2), _celebY, C_TEAL, 14);
        for (const c of a5Crew) {
          if (typeof c === "object") burstGood(Math.round(c.tx), _celebY, c.col || C_TEAL, 6);
        }
        a5P = 1;
        a5T = 0;
      }
    }
    // r  rigger the food drop earlier
    if (a5P === 1 && a5T > 1200) {
      a5P = 2;
      a5T = 0;
      clickPending = false;
    }
    if ((clickPending || input.justPressed("action")) && a5P === 2 && a5T > 350) {
      clickPending = false;
      audio.play("drop");
      if (_originalPlayerHead) removeHats();

      const _numShelves = Device.isMobile ? 2 : 3,
        _shelfH = 6;
      const _fTop = a5FridgeY - 4;
      const _fBot = _fTop + 3 + _numShelves * _shelfH + 1;
      burstGood(Math.floor(W / 2), Math.floor((_fTop + _fBot) / 2), C_TEAL, 10);
      a5P = 3;
      for (let _i = 0; _i < 6; _i++) burstGood(Math.floor(W / 2) + Util.randInt(-8, 8), Util.randInt(_fTop + 2, _fBot - 2), C_TEAL, 7);
      triggerFlashGood();
      a5T = 0;

    }
    if (a5P > 3 && (!a5FlyingItems || !a5FlyingItems.length) && !a5NeighboursStarted) {
      a5NeighboursStarted = true;
      a5NeighboursStartedAt = a5T;
    }
    if (a5P === 3 && a5T > 9500) {
      a5P = 4;
      a5T = 0;
    }

    if (a5NeighboursStarted) {
      let allArrived = true;
      for (const nb of a5Neighbours) {
        if (!nb.arrived) {
          if (a5T - a5NeighboursStartedAt < nb.delay) {
            allArrived = false;
            continue;
          }
          nb.x = Util.lerp(nb.x, nb.tx, 0.045);
          if (Math.abs(nb.x - nb.tx) < 0.5) {
            nb.x = nb.tx;
            nb.arrived = true;
          } else allArrived = false;
        }
      }
   
      if (!allArrived) {
        a5ArrivalFallbackT += dt;
        if (a5ArrivalFallbackT > 12000) {
          for (const nb of a5Neighbours) {
            nb.x = nb.tx;
            nb.arrived = true;
          }
          allArrived = true;
        }
      }

      a5ThanksCadenceT += dt;
      const _foodAllLanded = a5P > 3 && (!a5FlyingItems || a5FlyingItems.length === 0);
      if (_foodAllLanded && !a5FoodBurstDone) {
        a5FoodBurstDone = true;
        for (let _b = 0; _b < 5; _b++) burstGood(Math.floor(W / 2) + Util.randInt(-6, 6), Math.floor(H / 2), C_GOLD, 8);
        triggerFlashGold();
      }
      const _nextNb = a5Neighbours[a5ThanksIdx];
      if (_nextNb && _nextNb.arrived && _foodAllLanded) {
        const _tapAccel = clickPending || input.justPressed("action");
        if (a5ThanksCadenceT > 750 || _tapAccel) {
          if (_tapAccel) clickPending = false;
          a5ThanksCadenceT = 0;
          dialogPush(_nextNb.msg, _nextNb.col || C_TEAL, "center", Math.round(_nextNb.tx), _nextNb.ty - 2, 1500);
          a5ThanksIdx++;
        }
      }
      const allThanked = a5ThanksIdx >= a5Neighbours.length;

      if (allThanked && a5NeighboursArrivedAt === null) a5NeighboursArrivedAt = 0;
      else if (allThanked) a5NeighboursArrivedAt += dt;
      // Tap guard: discard a click banked before the continue gate opens.
      if (clickPending && !(a5NeighboursArrivedAt !== null && a5NeighboursArrivedAt > A5_TAP_GATE_MS)) {
        clickPending = false;
      }
      if (a5NeighboursArrivedAt !== null && a5NeighboursArrivedAt > A5_TAP_GATE_MS && (clickPending || input.justPressed("action"))) {
        clickPending = false;
        audio.play("click");
        triggerFlashGood();
        spark(Math.floor(W / 2), H - 2, C_TEAL, 5);
        a5P = 5;
        a5T = 0;
      }
    }
    if (a5P === 5 && a5T > 900) _transitionAct8ToEnd();
  }

  function drawCommunityFridge(fx, fy) {
    const SLOTS_PER_SHELF = Device.isMobile ? 3 : 6;
    const NUM_SHELVES = Device.isMobile ? 2 : 3;
    const SHELF_H = 6;

    const desktopW = Math.min(W - 6, SLOTS_PER_SHELF * (Device.isMobile ? 10 : 8) + 2);
    const slotW = Math.floor((desktopW - 2) / SLOTS_PER_SHELF);
    const frameLeft = Math.floor((W - desktopW) / 2);
    const frameRight = frameLeft + desktopW - 1;
    const innerW = desktopW - 2;
    const headerH = 3; // rows for ╠ ... ╣ header band: top border + 2 text rows
    const heartsH = 2; // rows for hearts band: hearts row + ╠ divider
    const frameTop = fy - 4; // your value
    const shelvesTop = frameTop + headerH;
    const shelvesBot = shelvesTop + NUM_SHELVES * SHELF_H;
    const heartsRowY = shelvesBot;
    const frameBot = heartsRowY + 1; // ╚════╝ closing row

    // Side walls
    for (let y = frameTop; y <= frameBot; y++) {
      if (frameLeft >= 0 && frameLeft < W) grid.set(frameLeft, y, "║", C_TEAL);
      if (frameRight >= 0 && frameRight < W) grid.set(frameRight, y, "║", C_TEAL);
    }
    // Top border
    if (frameTop >= 0 && frameTop < H) {
      grid.set(frameLeft, frameTop, "╔", C_TEAL);
      grid.set(frameRight, frameTop, "╗", C_TEAL);
      for (let x = frameLeft + 1; x < frameRight; x++) grid.set(x, frameTop, "═", C_TEAL);
    }
    // Header band — tilde padding sized to available width, not a fixed string.
    const headerCore =
      window.LANG === window.LANG_FR ? ["FRIGO COMMUNAUTAIRE", "nourrissez vos voisins"] : ["COMMUNITY FRIDGE", "feed your neighbours"];
    const headerMaxW = Math.max(4, innerW - 4);
    const headerLines = headerCore.map((core) => {
      if (core.length >= headerMaxW) return core.slice(0, headerMaxW);
      const avail = headerMaxW - core.length - 2;
      const tildesEachSide = Math.max(0, Math.floor(avail / 4));
      const side = Array(tildesEachSide).fill("~").join(" ");
      return side ? `${side} ${core} ${side}` : core;
    });
    for (let i = 0; i < headerLines.length; i++) {
      const txt = headerLines[i];
      const tx = frameLeft + 2 + Math.max(0, Math.floor((innerW - 4 - txt.length) / 2));
      const ty = frameTop + 1 + i;
      if (ty < H) grid.text(txt, tx, ty, C_TEAL);
    }
    // Divider below header
    const headerDivY = frameTop + headerH;
    if (headerDivY < H) {
      grid.set(frameLeft, headerDivY, "╠", C_TEAL);
      grid.set(frameRight, headerDivY, "╣", C_TEAL);
      for (let x = frameLeft + 1; x < frameRight; x++) grid.set(x, headerDivY, "═", C_TEAL);
    }
    // Internal shelf dividers (between shelves only — top one is the header div above)
    for (let s = 1; s < NUM_SHELVES; s++) {
      const dy = shelvesTop + s * SHELF_H;
      if (dy >= shelvesTop && dy < H) {
        grid.set(frameLeft, dy, "╠", C_TEAL);
        grid.set(frameRight, dy, "╣", C_TEAL);
        for (let x = frameLeft + 1; x < frameRight; x++) grid.set(x, dy, "═", C_TEAL);
      }
    }
    // Divider above hearts row
    if (heartsRowY < H) {
      grid.set(frameLeft, heartsRowY - 1, "╠", C_TEAL);
      grid.set(frameRight, heartsRowY - 1, "╣", C_TEAL);
      for (let x = frameLeft + 1; x < frameRight; x++) grid.set(x, heartsRowY - 1, "═", C_TEAL);
    }
    // Hearts band — row of ♥ ♥ ♥ between dividers
    if (heartsRowY < H) {
      const heartCount = Math.max(3, Math.floor(innerW / 4));
      const heartLine = Array(heartCount).fill("♥").join("  ");
      const hx = frameLeft + 2 + Math.max(0, Math.floor((innerW - 4 - heartLine.length) / 2));
      grid.text(heartLine, hx, heartsRowY, C_TEAL);
    }
    // Bottom border
    if (frameBot < H) {
      grid.set(frameLeft, frameBot, "╚", C_TEAL);
      grid.set(frameRight, frameBot, "╝", C_TEAL);
      for (let x = frameLeft + 1; x < frameRight; x++) grid.set(x, frameBot, "═", C_TEAL);
    }


    return {
      frameLeft,
      frameRight,
      frameTop: shelvesTop, // food layout uses shelvesTop as its top
      frameBot: shelvesBot, // and shelvesBot as its bottom
      slotW,
      SLOTS_PER_SHELF,
      NUM_SHELVES,
      SHELF_H,
    };
  }

  function renderAct8(opts = {}) {
    // Fridge higher
    const fridgeW = FRIDGE[0].length;
    const fx = Math.floor((W - fridgeW) / 2),
      fy = a5FridgeY ?? Math.floor(H / 2) - 10; // set by initAct8 -- may be shifted up for a big crew

    const fridgeMetrics = drawCommunityFridge(fx, fy);
    if (!opts.skipPlayerCrew) {
      let crewDrawIdx = 0;
      for (const c of a5Crew) {
        if (typeof c !== "object" || c._playerX !== undefined) continue;
        const cx = Math.round(c.x);
        if (cx >= -2 && cx < W + 2) {
          const crewArt = c.art || (a2Crew[crewDrawIdx] && a2Crew[crewDrawIdx].art) || A2_NPC_ARTS[crewDrawIdx % A2_NPC_ARTS.length];
          const crewCol = c.col || (a2Crew[crewDrawIdx] && a2Crew[crewDrawIdx].col) || A2_NPC_COLORS[crewDrawIdx % A2_NPC_COLORS.length];

          if (c.arrived) {
            const breathe = Math.sin(a5T / 600 + crewDrawIdx * 0.7) * 0.3;
            const finalY = c.ty + (a5P >= 3 ? -1 : 0) + Math.round(breathe);
            grid.art(crewArt, cx, finalY, crewCol);
          } else {
            /* Still walking in — keep the normal frame */
            grid.art(crewArt, cx, c.ty + (a5P >= 3 ? -1 : 0), crewCol);
          }
        }
        crewDrawIdx++;
      }
      const plX = a5Crew._playerX || Math.floor(W / 2);
      const plY = a5Crew._playerY || fy + FRIDGE.length + 1;
      grid.art(A2_PA[Math.floor(a5T / 250) % 2] || A2_PA[0], plX, plY + (a5P >= 3 ? -1 : 0), playerPulseColor(a5T));
    }

    // Tap-to-deposit prompt — only shows during the deposit window (a5P === 2)
    if (a5P === 2) {
      renderTapPrompt(ctrl("act8TapDeposit"), H - 2, "#fff", C_PLAYER, true);
    }

    if (a5P >= 3) {
      const isDesktop = !Device.isMobile;

      // Must match drawCommunityFridge's SLOTS_PER_SHELF/NUM_SHELVES.
      const SLOTS_PER_SHELF = Device.isMobile ? 3 : 6;
      const NUM_SHELVES = Device.isMobile ? 2 : 3;
      const TOTAL_SLOTS = SLOTS_PER_SHELF * NUM_SHELVES;
      const SHELF_H = 6; // rows per shelf

      // First-time setup
      if (!a5FoodPlacements) {
        a5FoodPlacements = [];
        for (let i = 0; i < TOTAL_SLOTS; i++) {
          const FC5 = ["#f5b800", "#e8724a", "#5ec44a", "#f0a030", "#d4602a", "#e83030", "#ff4444", "#ff8800", "#3399ff"];
          a5FoodPlacements.push({ food: null, col: FC5[i % FC5.length], placedAt: -1 });
        }
        a5FlyingItems = [];
        a5FoodCycleT = 0;
        a5FoodTotalPlaced = 0;
      }

      let frameLeft, frameRight, frameTop, frameBot, slotW;

      const m = fridgeMetrics;
      frameLeft = m.frameLeft;
      frameRight = m.frameRight;
      frameTop = m.frameTop;
      frameBot = m.frameBot;
      slotW = m.slotW;

      function slotBounds(idx) {
        const shelf = Math.floor(idx / SLOTS_PER_SHELF); // 0 = bottom shelf
        const col = idx % SLOTS_PER_SHELF;
        // Bottom shelf bottom row sits just above frameBot
        const shelfBot = frameBot - 2 - shelf * SHELF_H;
        const left = frameLeft + 1 + col * slotW;
        const right = left + slotW;
        return { left, right, shelfBot };
      }

      // Spawn items
      if (a5P === 3) {
        a5FoodCycleT += 1;

        const MAX_FRIDGE_ITEMS = 40;
        const _grabbed = s4GrabbedItems || [];
        const itemCap = Math.min(_grabbed.length, MAX_FRIDGE_ITEMS);
        const rampT = Math.min(1, Math.max(0, (a5T - 2500) / 4000));
        const spawnEvery = Math.round(8 - rampT * 6);
        if (a5FoodCycleT >= spawnEvery && a5T < 8500 && a5FoodTotalPlaced + a5FlyingItems.length < itemCap) {
          a5FoodCycleT = 0;

          const _nextIdx = a5FoodTotalPlaced + a5FlyingItems.length;
          const _grabbedItem = _grabbed[_nextIdx];
          const food = _grabbedItem ? _grabbedItem.food : Util.pick(FOODS);
          const col = _grabbedItem ? _grabbedItem.col : Util.pick(FC);
          const _members = (a5Crew || []).filter((c) => typeof c === "object" && c.arrived);
          const _m = _members.length ? _members[Math.floor(Math.random() * _members.length)] : null;
          const startX = _m ? Math.round(_m.tx ?? _m.x) : Math.floor(W / 2);
          const startY = _m && _m.ty != null ? Math.round(_m.ty) : fy + FRIDGE.length + 2;

          // Fill phase: first empty slot. Otherwise: random replace.
          const claimed = new Set(a5FlyingItems.map((f) => f.slotIdx));
          let slotIdx = a5FoodPlacements.findIndex((s, i) => !s.food && !claimed.has(i));
          if (slotIdx === -1) {
            // All full (or all claimed) — pick a random slot to replace
            slotIdx = Math.floor(Math.random() * TOTAL_SLOTS);
          }

          const { left, right, shelfBot } = slotBounds(slotIdx);
          const artW = food.a[0].length;
          let targetX = left + Math.max(0, Math.floor((slotW - artW) / 2));
          targetX = Math.min(targetX, right - artW);
          targetX = Math.max(targetX, left);
          const targetY = shelfBot - food.a.length + 1;

          a5FlyingItems.push({
            food,
            col,
            x: startX,
            y: startY,
            sx: startX,
            sy: startY,
            tx: targetX,
            ty: targetY,
            slotIdx,
            born: a5T,
            ms: 950 - rampT * 500,
            arc: 3 + Math.random() * 3,
          });
        }
      }

      // Flying items instantly replace the slot's contents on arrival.
      for (let i = a5FlyingItems.length - 1; i >= 0; i--) {
        const fi = a5FlyingItems[i];
        const t = Math.min(1, (a5T - fi.born) / fi.ms);
        const te = t * (2 - t);
        fi.x = fi.sx + (fi.tx - fi.sx) * te;
        fi.y = fi.sy + (fi.ty - fi.sy) * te - fi.arc * 4 * t * (1 - t);
        if (t >= 1) {
   
          a5FoodPlacements[fi.slotIdx].food = fi.food;
          a5FoodPlacements[fi.slotIdx].col = fi.col;
          a5FoodPlacements[fi.slotIdx].placedAt = performance.now();
          a5FoodTotalPlaced++;
          spark(Math.round(fi.tx) + 2, Math.round(fi.ty), fi.col, 8);
          audio.play("click", { volume: 0.5, rate: 0.92 + Math.random() * 0.16 });
          if (a5FoodTotalPlaced % 5 === 0) {
            audio.play("drop"); // bigger chime every 5th, plus a small celebration pop
            burstGood(Math.round(fi.tx) + 2, Math.round(fi.ty), fi.col, 6);
          }
          a5FlyingItems.splice(i, 1);
        }
      }

      // Draw food in slots — strictly clipped to slot bounds so neighbouring items never overlap
      for (let i = 0; i < a5FoodPlacements.length; i++) {
        const fp = a5FoodPlacements[i];
        if (!fp.food) continue;
        const { left, right, shelfBot } = slotBounds(i);
        const artH = fp.food.a.length;
        const slotInteriorW = right - left; // cells available for art (interior of slot)
        // Find widest row of this art
        let widestRow = 0;
        for (const row of fp.food.a) widestRow = Math.max(widestRow, row.length);
        // Effective draw width = min(art width, slot interior). Anything wider gets truncated per-row.
        const effW = Math.min(widestRow, slotInteriorW);
        const ix = left + Math.max(0, Math.floor((slotInteriorW - effW) / 2));
        const iy = shelfBot - artH + 1;

        // Clear strictly inside slot bounds before drawing
        for (let cy = iy; cy < iy + artH; cy++) {
          for (let cx = left; cx < right; cx++) {
            if (cx >= 0 && cx < W && cy >= 0 && cy < H) grid.set(cx, cy, " ", null);
          }
        }

        const age = performance.now() - fp.placedAt;
        const col = age < 200 ? "#ffffff" : age < 400 ? "#ffee88" : fp.col;

        // Landing squash. No bounce after — a grid can't do sub-cell motion.
        const SQUASH_MS = 90;
        let rowsToShow = artH,
          rowOffset = 0;
        if (age < SQUASH_MS) {
          const p = age / SQUASH_MS;
          rowsToShow = Math.max(1, Math.round(artH * (0.35 + 0.65 * p)));
          rowOffset = artH - rowsToShow;
        }

        for (let r = 0; r < rowsToShow; r++) {
          // Truncate this row to fit inside the slot — never spills past `right - 1`
          const maxW = Math.max(0, right - ix);
          if (maxW <= 0) continue;
          const srcRow = artH - rowsToShow + r; // bottom-anchored during the squash
          const line = fp.food.a[srcRow].substring(0, maxW);
          grid.text(line, ix, iy + rowOffset + r, col);
        }
      }

      const ARC_HEIGHT = 2;
      for (const fi of a5FlyingItems) {
        const artH = fi.food.a.length;
        const drawX = Math.round(fi.x);
        const drawY = Math.round(fi.y);
        for (let r = 0; r < artH; r++) {
          // Clip rightmost overhang based on fridge frame's right wall
          const maxW = Math.max(0, frameRight - drawX);
          if (maxW <= 0) continue;
          grid.text(fi.food.a[r].substring(0, maxW), drawX, drawY + r, fi.col);
        }
      }

      // Counter — above the fridge
      if (a5FoodTotalPlaced > 0) {
        const counterTxt = "+" + a5FoodTotalPlaced + window.LANG.foodCounterSuffix;
        const cx = Math.floor((frameLeft + frameRight) / 2) - Math.floor(counterTxt.length / 2);
        // fy-5 sits one row clear above the box's actual top.
        const cy = Math.max(1, isDesktop ? frameTop - 4 : fy - 5);
        const flashCol = a5T - a5LastCounterFlash < 150 ? "#2abff5" : C_TEAL;
        grid.text(counterTxt, cx, cy, flashCol);
        if (a5FoodTotalPlaced !== a5LastCounterValue) {
          a5LastCounterValue = a5FoodTotalPlaced;
          a5LastCounterFlash = a5T;
        }
      }
    }

    // Neighbours — use NPC art pool for visual variety, preserve color
    if (a5NeighboursStarted) {
      for (let i = 0; i < a5Neighbours.length; i++) {
        const nb = a5Neighbours[i];
        const nx = Math.round(nb.x);
        if (nx >= -2 && nx < W + 2) {
          if (!nb.art) nb.art = window.GAME_DATA.npcArts[i % window.GAME_DATA.npcArts.length];
          grid.art(nb.art, nx, nb.ty, nb.col || C_TEAL);
          if (nb.arrived) {
            grid.text(nb.name, Util.clamp(nx - Math.floor(nb.name.length / 2), 0, W - nb.name.length), nb.ty - 1, nb.col || C_TEAL);
          }
        }
      }
    }
    if (a5NeighboursArrivedAt !== null && a5NeighboursArrivedAt > A5_TAP_GATE_MS)
      renderTapPrompt(ctrl("act8TapContinue"), H - 2, "#fff", C_TEAL);
    popupRender();
    dialogRender();

    Banner.render();
  }


  function _transitionAct8ToEnd() {
    let _pool = null;
    runActBoundary({
      outro: (done) =>
        collapseToCenter((pool) => {
          _pool = pool;
          done();
        }, {}),
      setupNext: initEnd,
      intro: (done) =>
        riseFromPile(done, {
          spawnPool: _pool,
          peppersMs: 300,
          jitterMs: 500,
          flyMsMin: 600,
          flyMsMax: 1000,
          simmer: true,
        }),
    });
  }
