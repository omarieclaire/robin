

  let a5NeighboursStarted, a5NeighboursArrivedAt, a5ArrivalFallbackT; // gates overlap between food-drop, neighbours
  let a5NeighboursStartedAt; // snapshot for per-neighbour stagger delay
  let a5ThanksIdx, a5ThanksCadenceT; // sequential one-at-a-time thank-you reveal
  let a5FoodBurstDone;
  let a5FridgeAura;
  const AURA_CHARS = "✦★✧✩✺✹❋✵⁂☆*+°";
  const AURA_COLS = ["#ffd700", "#ff69b4", "#00e5ff", "#ff8c00", "#ffec8b", "#c8a2ff", "#7fffd4"];
  const MAX_FRIDGE_ITEMS = 40; // cap on items flying in
  const A5_TAP_GATE_MS = 2200; // must match tap-accept check in updateAct8

  function fridgeBoxWidth() {
    const SLOTS_PER_SHELF = Device.isMobile ? 3 : 6;
    return Math.min(W - 6, SLOTS_PER_SHELF * (Device.isMobile ? 10 : 8) + 2);
  }

  // Anchored to old box, grows upward only
  function fridgeShelfGeometry(fy) {
    const LEGACY_NUM_SHELVES = Device.isMobile ? 2 : 3;
    const SHELF_H = 6;
    const bottomAnchor = fy - 4 + 3 + LEGACY_NUM_SHELVES * SHELF_H + 1;
    const frameBot = bottomAnchor;

    const tallShelvesTop = frameBot - (LEGACY_NUM_SHELVES + 1) * SHELF_H;
    const tall = tallShelvesTop - 1 - 2 >= 0; // crest, top border must fit on-screen
    const NUM_SHELVES = tall ? LEGACY_NUM_SHELVES + 1 : LEGACY_NUM_SHELVES;
    const shelvesBot = frameBot;
    const shelvesTop = shelvesBot - NUM_SHELVES * SHELF_H;
    const frameTop = shelvesTop - 1;
    return { LEGACY_NUM_SHELVES, NUM_SHELVES, SHELF_H, bottomAnchor, frameTop, frameBot, shelvesTop, shelvesBot, tall };
  }

  function initAct8() {
    audio.play("level");
    audio.preload(["music_act9"]);
    Footsteps.stop();
    Ambience.stop();
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
    a5FoodRealTotal = 0;
    a5FoodItemCap = 0;
    a5LastCounterValue = 0;
    a5LastCounterFlash = 0;
    a5FridgeAura = [];
    Banner.timer = 0;
    dialogStack = [];
    hudLabel.textContent = "";
    hudScore.textContent = "";
    hudStatus.textContent = "";
    a5Crew = [];
    const rc = a2CrewCount; // shows all crew; cats already counted
    // wraps crew into rows when needed
    const slotW = 3;
    const usableW = W - 4;
    const slotsPerRow = Math.max(3, Math.floor(usableW / slotW));
    const totalSlots = rc + 1; // crew + player

    const crewRowsNeeded = Math.max(1, Math.ceil(totalSlots / slotsPerRow));
    const extraCrewRows = Device.isMobile ? crewRowsNeeded - 1 : 0;
    const fy = Math.max(6, Math.floor(H / 2) - 10 - extraCrewRows * 3) + (Device.isMobile ? 2 : 0);
    a5FridgeY = fy;

    const lineY = fridgeShelfGeometry(fy).bottomAnchor + 3; // crew sits 2 rows below fridge
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
    // player X for render, stays first row
    const firstRowItems = Math.min(slotsPerRow, totalSlots);
    const firstRowStart = Math.floor((W - firstRowItems * slotW) / 2);
    a5Crew._playerX = Util.clamp(firstRowStart + playerSlot * slotW, 2, W - 5);
    a5Crew._playerY = lineY;
    // neighbours arrive after food, centred at fridge
    const shuffled = Util.shuffle(END_NAMES.slice());
    a5Neighbours = [];
    const fridgeWidth = fridgeBoxWidth();
    const fridgeCX = Math.floor(W / 2);
    const numNeighbours = Math.min(4, shuffled.length);
  
    const nbRowStep = Device.isMobile ? 4 : 2;
    const nbBaseOffset = Device.isMobile ? 8 : 4;
    const nbMaxPairIdx = Math.floor((numNeighbours - 1) / 2);
    const nbLastTy = lineY + nbBaseOffset + nbMaxPairIdx * nbRowStep;
    const nbSafeBottom = H - 5; // leaves room above tap-to-continue prompt
    const nbOverflow = Math.max(0, nbLastTy + 1 - nbSafeBottom);
    const nbBaseOffsetAdj = nbBaseOffset - nbOverflow;
    for (let i = 0; i < numNeighbours; i++) {
      const nm = shuffled[i];
      const fromRight = i % 2 === 0;
      const nx = fromRight ? W + 3 + i * 6 : -3 - i * 6;
      const ty = lineY + nbBaseOffsetAdj + Math.floor(i / 2) * nbRowStep; /* symmetric distribution around fridge center */
      const pairIdx = Math.floor(i / 2); /* 0,0,1,1 */
      const side = fromRight ? 1 : -1;

      const offset = Device.isMobile
        ? 9 + pairIdx * 4 // a bit wider spread on mobile
        : Math.floor(fridgeWidth / 2) + 2 + pairIdx * 9; // avoids clumping on wide desktop windows
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
        Music.transitionStretched("music_act8"); // music starts here, not at init
        audio.play("crewAtFridge");
        triggerFlashGood();
        const _crew = a5Crew.filter((c) => typeof c === "object");
        const _crewXs = _crew.map((c) => c.tx);
        const _crewMinX = Math.min(..._crewXs),
          _crewMaxX = Math.max(..._crewXs);
        const _crewTopY = a5Crew._playerY - 2; // just above the robins' heads
        for (const bx of [_crewMinX, Math.round((_crewMinX + _crewMaxX) / 2), _crewMaxX]) {
          burstGood(bx, _crewTopY, C_TEAL, Device.isMobile ? 10 : 7);
        }
        for (const c of _crew) burstGood(Math.round(c.tx), c.ty - 1, c.col || C_TEAL, 6);
        a5P = 1;
        a5T = 0;
      }
    }
    if (a5P === 1 && a5T > 1200) {
      a5P = 2;
      a5T = 0;
      clickPending = false;
    }
    if ((clickPending || input.justPressed("action")) && a5P === 2 && a5T > 350) {
      clickPending = false;
      audio.play("drop");
      if (_originalPlayerHead) removeHats();

      const _geo = fridgeShelfGeometry(a5FridgeY);
      const _fTop = _geo.frameTop;
      const _fBot = _geo.bottomAnchor;
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
          dialogPush(_nextNb.msg, _nextNb.col || C_TEAL, "center", Math.round(_nextNb.tx), _nextNb.ty - 2, 3600, "neighbourThanks");
          a5ThanksIdx++;
        }
      }
      const allThanked = a5ThanksIdx >= a5Neighbours.length;

      if (allThanked && a5NeighboursArrivedAt === null) a5NeighboursArrivedAt = 0;
      else if (allThanked) a5NeighboursArrivedAt += dt;
      // ignores stale or already-used clicks
      if (clickPending && (a5P >= 5 || !(a5NeighboursArrivedAt !== null && a5NeighboursArrivedAt > A5_TAP_GATE_MS))) {
        clickPending = false;
      }
      if (a5P < 5 && a5NeighboursArrivedAt !== null && a5NeighboursArrivedAt > A5_TAP_GATE_MS && (clickPending || input.justPressed("action"))) {
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

  function drawCommunityFridge(fy) {
    const SLOTS_PER_SHELF = Device.isMobile ? 3 : 6;
    const geo = fridgeShelfGeometry(fy);
    const { NUM_SHELVES, SHELF_H, frameTop, frameBot, shelvesTop, shelvesBot } = geo;

    const desktopW = fridgeBoxWidth();
    const slotW = Math.floor((desktopW - 2) / SLOTS_PER_SHELF);
    const frameLeft = Math.floor((W - desktopW) / 2);
    const frameRight = frameLeft + desktopW - 1;

    // slimmer posts on mobile for narrow frames
    const POST_W = Device.isMobile ? 2 : 4;
    const postDecor = frameLeft >= POST_W && W - 1 - frameRight >= POST_W;

    const dividerYs = new Set([frameTop, frameBot]);
    for (let s = 1; s < NUM_SHELVES; s++) dividerYs.add(shelvesTop + s * SHELF_H);

    for (let y = frameTop; y <= frameBot; y++) {
      if (frameLeft >= 0 && frameLeft < W) grid.set(frameLeft, y, "║", C_TEAL);
      if (frameRight >= 0 && frameRight < W) grid.set(frameRight, y, "║", C_TEAL);
    }
    // ends get closed corners, middle gets ╠╣
    for (const dy of dividerYs) {
      if (dy < 0 || dy >= H) continue;
      const isTop = dy === frameTop,
        isBot = dy === frameBot;
      grid.set(frameLeft, dy, isTop ? "╔" : isBot ? "╚" : "╠", C_TEAL);
      grid.set(frameRight, dy, isTop ? "╗" : isBot ? "╝" : "╣", C_TEAL);
      for (let x = frameLeft + 1; x < frameRight; x++) grid.set(x, dy, "═", C_TEAL);
    }

    // skipped on narrow widths, box still works
    if (postDecor) {
      for (let y = frameTop; y <= frameBot; y++) {
        if (y < 0 || y >= H) continue;
        const isDiv = dividerYs.has(y);
        const isTop = y === frameTop,
          isBot = y === frameBot;
        const flip = (y - frameTop) % 2 === 0;
        const a = isDiv ? "═" : flip ? "▚" : "▞";
        const mid = isDiv ? (isTop ? "╦" : isBot ? "╩" : "╬") : "│";
        const b = isDiv ? "═" : flip ? "▞" : "▚";
        const cornerL = isDiv ? (isTop ? "╔" : isBot ? "╚" : "╠") : "║";
        const cornerR = isDiv ? (isTop ? "╗" : isBot ? "╝" : "╣") : "║";
        const leftCols = POST_W === 4 ? [cornerL, a, mid, b] : [cornerL, a];
        for (let k = 0; k < leftCols.length; k++) {
          const x = frameLeft - POST_W + k;
          if (x >= 0) grid.set(x, y, leftCols[k], C_TEAL);
        }
        grid.set(frameLeft, y, isDiv ? mid : "║", C_TEAL);
        const rightCols = POST_W === 4 ? [b, mid, a, cornerR] : [a, cornerR];
        for (let k = 0; k < rightCols.length; k++) {
          const x = frameRight + 1 + k;
          if (x < W) grid.set(x, y, rightCols[k], C_TEAL);
        }
        grid.set(frameRight, y, isDiv ? mid : "║", C_TEAL);
      }
    }

    // ornate label if posts/height allow
    if (frameTop - 1 >= 0) {
      const headerCore = window.LANG === window.LANG_FR ? "FRIGO COMMUNAUTAIRE" : "COMMUNITY FRIDGE";
      if (postDecor && geo.tall) {
        const label = `❖ ${headerCore} ❖`;
        const swooshW = Device.isMobile ? 6 : 16,
          gap = Device.isMobile ? " " : "  ";
        const leftPart = "▄".repeat(swooshW) + "╯" + gap;
        const rightPart = gap + "╰" + "▄".repeat(swooshW);
        const textRow = leftPart + label + rightPart;
        const tx = Math.floor((frameLeft + frameRight - textRow.length) / 2) + 1;
        grid.text(textRow, tx, frameTop - 1, C_TEAL);
        // arch corners align above ╯/╰
        const leftCornerX = tx + swooshW;
        const rightCornerX = tx + leftPart.length + label.length + gap.length;
        if (rightCornerX - leftCornerX > 1) {
          grid.set(leftCornerX, frameTop - 2, "╭", C_TEAL);
          for (let x = leftCornerX + 1; x < rightCornerX; x++) grid.set(x, frameTop - 2, "─", C_TEAL);
          grid.set(rightCornerX, frameTop - 2, "╮", C_TEAL);
        }
      } else {
        const tx = Math.floor((frameLeft + frameRight - headerCore.length) / 2) + 1;
        grid.text(headerCore, tx, frameTop - 1, C_TEAL);
        // mobile gets plain cap, not arch
        if (Device.isMobile && frameTop - 2 >= 0) {
          const capW = frameRight - frameLeft + 1;
          let cap = "";
          while (cap.length < capW) cap += "▛▀▜";
          cap = cap.slice(0, capW);
          grid.text(cap, frameLeft, frameTop - 2, C_TEAL);
        }
      }
    }

    return {
      frameLeft,
      frameRight,
      frameTop: shelvesTop, // food layout treats shelvesTop as top
      frameBot: shelvesBot, // and shelvesBot as bottom
      slotW,
      SLOTS_PER_SHELF,
      NUM_SHELVES,
      SHELF_H,
    };
  }

  function renderAct8(opts = {}) {
    const fy = a5FridgeY ?? Math.floor(H / 2) - 10; // may shift up for big crew

    const fridgeMetrics = drawCommunityFridge(fy);

    for (let _si = (a5FridgeAura || []).length - 1; _si >= 0; _si--) {
      const sp = a5FridgeAura[_si];
      const age = performance.now() - sp.born;
      const t = Math.min(1, age / sp.dur);
      const ease = 1 - Math.pow(1 - t, 3);
      let px = sp.sx + (sp.x - sp.sx) * ease;
      let py = sp.sy + (sp.y - sp.sy) * ease;
      if (t >= 1) {
        // keeps drifting/spinning after arrival
        const settleS = (age - sp.dur) / 1000;
        px += sp.driftDX * settleS;
        py += sp.driftDY * settleS;
      }
      const cx = Math.round(px);
      const cy = Math.round(py);
      if (t >= 1 && (cx < -2 || cx > W + 2 || cy < -2 || cy > H + 2)) {
        a5FridgeAura.splice(_si, 1);
        continue;
      }
      const rot = t >= 1 ? ((age / 12) % 360) * sp.spinDir : 0;
      grid.set(cx, cy, sp.ch, sp.col, false, false, false, rot);
    }
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
      const plY = a5Crew._playerY || fridgeShelfGeometry(fy).bottomAnchor + 1;
      grid.art(A2_PA[Math.floor(a5T / 250) % 2] || A2_PA[0], plX, plY + (a5P >= 3 ? -1 : 0), playerPulseColor(a5T));
    }

    // only shown during the deposit window
    if (a5P === 2) {
      renderTapPrompt(ctrl("act8TapDeposit"), H - 2, "#fff", C_PLAYER, true);
    }

    if (a5P >= 3) {
      const isDesktop = !Device.isMobile;

      // must match drawCommunityFridge's SLOTS_PER_SHELF/NUM_SHELVES
      const SLOTS_PER_SHELF = Device.isMobile ? 3 : 6;
      const { NUM_SHELVES, SHELF_H } = fridgeShelfGeometry(fy);
      const TOTAL_SLOTS = SLOTS_PER_SHELF * NUM_SHELVES;

      if (!a5FoodPlacements) {
        a5FoodPlacements = [];
        for (let i = 0; i < TOTAL_SLOTS; i++) {
          const FC5 = ["#f5b800", "#e8724a", "#5ec44a", "#f0a030", "#d4602a", "#e83030", "#ff4444", "#ff8800", "#3399ff"];
          a5FoodPlacements.push({ food: null, col: FC5[i % FC5.length], placedAt: -1 });
        }
        a5FlyingItems = [];
        a5FoodCycleT = 0;
        a5FoodTotalPlaced = 0;
        a5FoodRealTotal = (s4GrabbedItems || []).length;
        a5FoodItemCap = Math.min(a5FoodRealTotal, MAX_FRIDGE_ITEMS);
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
        // bottom shelf sits just above frameBot
        const shelfBot = frameBot - 2 - shelf * SHELF_H;
        const left = frameLeft + 1 + col * slotW;
        const right = left + slotW;
        return { left, right, shelfBot };
      }

      // Spawn items
      if (a5P === 3) {
        a5FoodCycleT += 1;

        const _grabbed = s4GrabbedItems || [];
        const itemCap = a5FoodItemCap;
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
          const startY = _m && _m.ty != null ? Math.round(_m.ty) : fridgeShelfGeometry(fy).bottomAnchor + 2;

          // fill first empty slot, else replace
          const claimed = new Set(a5FlyingItems.map((f) => f.slotIdx));
          let slotIdx = a5FoodPlacements.findIndex((s, i) => !s.food && !claimed.has(i));
          if (slotIdx === -1) {
            // fallback: replace a random full slot
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

      // flying items replace slot contents on arrival
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
          playBank(["foodLand1", "foodLand2", "foodLand3"]);
          if (a5FoodTotalPlaced % 5 === 0) {
            audio.play("dropBonus"); // bigger chime + pop every 5th
            burstGood(Math.round(fi.tx) + 2, Math.round(fi.ty), fi.col, 6);
          }
          // fireworks toward margins and above fridge
          const _big = a5FoodTotalPlaced % 5 === 0 ? 14 : 5;
          const _boxTop = fridgeShelfGeometry(fy).frameTop; // differs from fridgeMetrics.frameTop by one row
          const _aboveNear = Math.max(0, _boxTop - 3); // clears the cap/header decoration
          const _aboveFar = Math.max(0, _boxTop - (Device.isMobile ? 7 : 6));
          for (let k = 0; k < _big; k++) {
            const roll = Math.random();
            const goAbove = roll < 0.3;
            let ax, ay, driftDX, driftDY;
            if (goAbove) {
              ax = Util.randInt(fridgeMetrics.frameLeft, fridgeMetrics.frameRight);
              ay = Util.randInt(_aboveFar, Math.max(_aboveFar, _aboveNear));
              driftDX = (Math.random() - 0.5) * 1.5;
              driftDY = -(1 + Math.random() * 1.5);
            } else {
              const onLeft = roll < 0.65;
              ax = onLeft ? Util.randInt(0, Math.max(0, fridgeMetrics.frameLeft - 2)) : Util.randInt(Math.min(W - 1, fridgeMetrics.frameRight + 2), W - 1);
              ay = Util.randInt(fy - 6, fridgeMetrics.frameBot + 3);
              driftDX = (ax - (onLeft ? fridgeMetrics.frameLeft : fridgeMetrics.frameRight)) * (0.4 + Math.random() * 0.3);
              driftDY = -(2 + Math.random() * 3);
            }
            a5FridgeAura.push({
              sx: Math.round(fi.tx) + 2,
              sy: Math.round(fi.ty),
              x: ax,
              y: ay,
              born: performance.now(),
              dur: 500 + Math.random() * 500,
              ch: AURA_CHARS[Math.floor(Math.random() * AURA_CHARS.length)],
              col: AURA_COLS[Math.floor(Math.random() * AURA_COLS.length)],
              spinDir: Math.random() < 0.5 ? 1 : -1,
              // keeps drifting/rising after arrival
              driftDX,
              driftDY,
            });
          }
          a5FlyingItems.splice(i, 1);
        }
      }

      // clipped to slot bounds, no overlap
      for (let i = 0; i < a5FoodPlacements.length; i++) {
        const fp = a5FoodPlacements[i];
        if (!fp.food) continue;
        const { left, right, shelfBot } = slotBounds(i);
        const artH = fp.food.a.length;
        const slotInteriorW = right - left;
        let widestRow = 0;
        for (const row of fp.food.a) widestRow = Math.max(widestRow, row.length);
        // effective width clips wider rows
        const effW = Math.min(widestRow, slotInteriorW);
        const ix = left + Math.max(0, Math.floor((slotInteriorW - effW) / 2));
        const iy = shelfBot - artH + 1;

        for (let cy = iy; cy < iy + artH; cy++) {
          for (let cx = left; cx < right; cx++) {
            if (cx >= 0 && cx < W && cy >= 0 && cy < H) grid.set(cx, cy, " ", null);
          }
        }

        const age = performance.now() - fp.placedAt;
        const col = age < 200 ? "#ffffff" : age < 400 ? "#ffee88" : fp.col;

        // no bounce — grid lacks sub-cell motion
        const SQUASH_MS = 90;
        let rowsToShow = artH,
          rowOffset = 0;
        if (age < SQUASH_MS) {
          const p = age / SQUASH_MS;
          rowsToShow = Math.max(1, Math.round(artH * (0.35 + 0.65 * p)));
          rowOffset = artH - rowsToShow;
        }

        for (let r = 0; r < rowsToShow; r++) {
          // truncates row so it never spills
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
          // clips overhang past fridge's right wall
          const maxW = Math.max(0, frameRight - drawX);
          if (maxW <= 0) continue;
          grid.text(fi.food.a[r].substring(0, maxW), drawX, drawY + r, fi.col);
        }
      }

      if (a5FoodTotalPlaced > 0) {
        // scales up to the real haul total
        const displayCount = a5FoodItemCap > 0 ? Math.round((a5FoodTotalPlaced / a5FoodItemCap) * a5FoodRealTotal) : a5FoodTotalPlaced;
        const counterTxt = "+" + displayCount + window.LANG.foodCounterSuffix;
        const cx = Math.floor((frameLeft + frameRight) / 2) - Math.floor(counterTxt.length / 2);
        // one row clear above box's top
        const cy = Math.max(1, isDesktop ? frameTop - 4 : fy - 5);
        const flashCol = a5T - a5LastCounterFlash < 150 ? "#2abff5" : C_TEAL;
        grid.text(counterTxt, cx, cy, flashCol);
        if (displayCount !== a5LastCounterValue) {
          a5LastCounterValue = displayCount;
          a5LastCounterFlash = a5T;
        }
      }
    }

    // reuses NPC art pool, keeps custom color
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
        riseFromPile(() => {
          Music.transitionStretched("music_act9");
          done();
        }, {
          spawnPool: _pool,
          peppersMs: 300,
          jitterMs: 500,
          flyMsMin: 600,
          flyMsMax: 1000,
          simmer: true,
        }),
    });
  }
