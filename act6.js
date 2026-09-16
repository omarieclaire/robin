
  const MOBILE_DEAD_ZONE_CELLS = 3;
  const MOBILE_SWIPE_PX = 22;

  const _mob = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    dir: null,
    swiped: false,
    tapped: false,
    holding: false,
    hopTimer: 0,
    pendingUp: false,
    pendingDown: false,
    pendingLeft: false,
    pendingRight: false,
  };

  function _mobResolveDir(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "left" : "right";
    return dy < 0 ? "up" : "down";
  }

  function _mobFireStep(dir) {
    if (dir === "up") _mob.pendingUp = true;
    if (dir === "down") _mob.pendingDown = true;
    if (dir === "left") _mob.pendingLeft = true;
    if (dir === "right") _mob.pendingRight = true;
  }

  function _mobEnd(ex, ey) {
    if (!_mob.active) return;
    if (!_mob.swiped && !_mob.holding && !convVisible) {
      const dx = ex - _mob.startX;
      const dy = ey - _mob.startY;
      if (Math.sqrt(dx * dx + dy * dy) < MOBILE_SWIPE_PX) {
        const r = gs.getBoundingClientRect();
        const cellW = r.width / W;
        const cellH = r.height / H;
        const tapCX = (ex - r.left) / cellW;
        const tapCY = (ey - r.top) / cellH;
        if (phase === "act3") {
          const pl = { x: Math.round(a2PX), y: Math.round(a2PY) };
          const ddx = tapCX - pl.x,
            ddy = tapCY - pl.y;
          if (Math.abs(ddx) > MOBILE_DEAD_ZONE_CELLS || Math.abs(ddy) > MOBILE_DEAD_ZONE_CELLS) _mobFireStep(_mobResolveDir(ddx, ddy));
        }
        if (phase === "act4") {
          const pl = { x: Math.round(a2bPX), y: Math.round(a2bPY) };
          const ddx = tapCX - pl.x,
            ddy = tapCY - pl.y;
          if (Math.abs(ddx) > MOBILE_DEAD_ZONE_CELLS || Math.abs(ddy) > MOBILE_DEAD_ZONE_CELLS) _mobFireStep(_mobResolveDir(ddx, ddy));
        }
        if (phase === "act6") {
          const pl = { x: Math.round(s4PX2), y: Math.round(s4PY2) };
          const ddx = tapCX - pl.x,
            ddy = tapCY - pl.y;
          if (tapCY >= S4_WALK_TOP && tapCY <= S4_WALK_BOT) {
            if (Math.abs(ddx) > MOBILE_DEAD_ZONE_CELLS || Math.abs(ddy) > MOBILE_DEAD_ZONE_CELLS) _mobFireStep(_mobResolveDir(ddx, ddy));
          }
        }
        if (phase === "act7") {
          const pl = { x: Math.round(s4RunPX), y: Math.round(s4RunPY) };
          const ddx = tapCX - pl.x,
            ddy = tapCY - pl.y;
          if (Math.abs(ddx) > MOBILE_DEAD_ZONE_CELLS || Math.abs(ddy) > MOBILE_DEAD_ZONE_CELLS) _mobFireStep(_mobResolveDir(ddx, ddy));
        }
      }
    }
    if (phase === "act3") a2PY = a2RuY(a2PRu); // Snaps to exact lane row.
    _mob.active = false;
    _mob.pointerId = null;
    _mob.dir = null;
    _mob.holding = false;
  }

  if (Device.isMobile) {
    gs.addEventListener(
      "pointerdown",
      (e) => {
        if (phase !== "act3" && phase !== "act4" && phase !== "act6" && phase !== "act7") return;
        if (_mob.pointerId !== null) {
          if (performance.now() - _mob.startTime < 2000) return;
          _mob.active = false;
          _mob.pointerId = null;
          _mob.holding = false;
        }
        _mob.active = true;
        _mob.pointerId = e.pointerId;
        _mob.startX = e.clientX;
        _mob.startY = e.clientY;
        _mob.currentX = e.clientX;
        _mob.currentY = e.clientY;
        _mob.startTime = performance.now();
        _mob.dir = null;
        _mob.swiped = false;
        _mob.tapped = false;
        _mob.holding = false;
        _mob.hopTimer = 0;

        _mob.lastX = e.clientX;
        _mob.lastY = e.clientY;
      },
      { passive: true },
    );

    gs.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerId !== _mob.pointerId) return;
        _mob.currentX = e.clientX;
        _mob.currentY = e.clientY;
        const fingerMovedX = Math.abs(e.clientX - _mob.startX) > 8;
        const fingerMovedY = Math.abs(e.clientY - _mob.startY) > 8;
        if ((fingerMovedX || fingerMovedY) && !_mob.holding) {
          _mob.holding = true;
          _mob.lastX = e.clientX;
          _mob.lastY = e.clientY;
        }
      },
      { passive: true },
    );

    gs.addEventListener(
      "pointerup",
      (e) => {
        if (e.pointerId === _mob.pointerId) _mobEnd(e.clientX, e.clientY);
      },
      { passive: true },
    );
    gs.addEventListener(
      "pointercancel",
      (e) => {
        if (e.pointerId === _mob.pointerId) _mobEnd(e.clientX, e.clientY);
      },
      { passive: true },
    );
  }

  function _mobUpdate(dt) {
    if (!Device.isMobile || !_mob.active) return;
    if (phase !== "act3" && phase !== "act4" && phase !== "act6" && phase !== "act7") return;
    if (!_mob.holding) return;
    if (convVisible) return; // no drag movement mid-conversation

    const r = _measureRectCached();
    const cellW = r.width / W;
    const cellH = r.height / H;

    const dxPx = _mob.currentX - _mob.lastX;
    const dyPx = _mob.currentY - _mob.lastY;
    _mob.lastX = _mob.currentX;
    _mob.lastY = _mob.currentY;

    const dxCells = dxPx / cellW;
    const dyCells = dyPx / cellH;

    if (phase === "act3") {
      a2PX = Util.clamp(a2PX + dxCells, 4, W - 6);
      a2PY = Util.clamp(a2PY + dyCells, A2_LANE_YS[0], A2_LANE_YS[A2_LANE_YS.length - 1]);

      let closestLane = 0;
      let closestDist = Infinity;
      for (let i = 0; i < A2_LANE_YS.length; i++) {
        const d = Math.abs(A2_LANE_YS[i] - a2PY);
        if (d < closestDist) {
          closestDist = d;
          closestLane = i;
        }
      }
      a2PRu = closestLane;
    } else if (phase === "act4") {
      // horizontal drags world, vertical moves player
      a2bWX += dxCells * 0.7;
      a2bPY += dyCells;
      a2bPY = Util.clamp(a2bPY, A2B_ROAD_Y1, a2bBotBoundAt(a2bWX + a2bPX));
    } else if (phase === "act6") {
      s4PX2 += dxCells;
      s4PY2 += dyCells;
      s4PY2 = Util.clamp(s4PY2, S4_WALK_TOP, S4_WALK_BOT - 1);
      s4PX2 = Util.clamp(s4PX2, 4, W - 6);
    } else if (phase === "act7") {
      if (dxCells > 0) s4RunWX += dxCells * 0.6; // Forward drag only; no rewind.
      s4RunPY += dyCells;
      s4RunPY = Util.clamp(s4RunPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
    }
  }

  if (Device.isMobile) {
    const _origJP = input.justPressed.bind(input);
    input.justPressed = function (keyOrAction) {
      if (phase === "act3" || phase === "act4" || phase === "act6" || phase === "act7") {
        if (keyOrAction === "up" && _mob.pendingUp) {
          _mob.pendingUp = false;
          return true;
        }
        if (keyOrAction === "down" && _mob.pendingDown) {
          _mob.pendingDown = false;
          return true;
        }
        if (keyOrAction === "left" && _mob.pendingLeft) {
          _mob.pendingLeft = false;
          return true;
        }
        if (keyOrAction === "right" && _mob.pendingRight) {
          _mob.pendingRight = false;
          return true;
        }
      }
      return _origJP(keyOrAction);
    };
  }

  const FC = ["#f5b800", "#e8724a", "#5ec44a", "#4ac9e8", "#c65ce8", "#8ee85c", "#f0a030", "#5c8ee8"];
  const S4_NARC_COLS = ["#ffdede", "#d9ffe5", "#dad7ff", "#fffbe0", "#ffe8d9"];
  const S4_BC_W = 29,
    S4_SLOT_W = 9,
    S4_BC_GAP = -1,
    S4_COLS = Math.floor((S4_BC_W - 2) / S4_SLOT_W);
  const S4_GRAB_ANIM_MS = 220,
    S4_GRAB_SQUASH_MS = 70;
  function drawGrabAnim(it, ix, rY) {
    const rows = it.food.a.length;
    const elapsed = S4_GRAB_ANIM_MS - it.grabT;
    if (elapsed < S4_GRAB_SQUASH_MS) {
      const p = elapsed / S4_GRAB_SQUASH_MS;
      const keep = Math.max(1, Math.round(rows * (1 - 0.5 * p)));
      grid.art(it.food.a.slice(rows - keep), ix, rY + (rows - keep), brightenColor(it.color, 0.55 * p));
    } else {
      // Yank 
      const p = (elapsed - S4_GRAB_SQUASH_MS) / (S4_GRAB_ANIM_MS - S4_GRAB_SQUASH_MS);
      const eased = p * p;
      const riseY = rY - eased * 3;
      const col = p < 0.5 ? brightenColor(it.color, 0.55 * (1 - p * 2)) : darkenColor(it.color, (p - 0.5) * 1.7);
      grid.art(it.food.a, ix, riseY, col);
    }
  }

  let s4WX, s4Sp, s4CaughtFired, s4UR, s4GT, s4LM, s4IT, s4ItemsGrabbed;
  let s4GrabbedItems;
  let s4As, s4Gs, s4St2, s4FoodBag;
  let s4Shoppers; // Bystanders, harmless, just surprised reactions.
  let s4DefectorDone; // Gates shopper entry until guard defects.
  let _s4GuardBubble = null; // Deferred so it draws above sprites.
  let s4ShopperT = 0; // Timer for shopper arrivals post-defection.
  let s4Alys, s4GE;
  let s4ExitPinned;
  let s4HasGrabbed;
  let s4LastGrabT;

  let s4GrabBursts;
  let s4TickerMsg, s4TickerNextIdx, s4TickerFireCount;
  let S4_SHELF_ROWS,
    S4_SHELF_ROW_H,
    S4_ROWS_ABOVE,
    S4_ROWS_BELOW,
    S4_AISLE_Y /* Aisle spine Y; exit anchor. */,
    S4_ABOVE_TOP,
    S4_ABOVE_BOT,
    S4_BELOW_TOP,
    S4_BELOW_BOT,
    S4_WALK_TOP,
    S4_WALK_BOT;

  let s4ExitScreenX;

  let s4Items, s4Bookcases, s4RobinFloats;

  /* Maps row index to screen Y. */
  function _s4RowY(row) {
    if (row < S4_ROWS_ABOVE) return S4_ABOVE_TOP + 1 + row * S4_SHELF_ROW_H;
    return S4_BELOW_TOP + (row - S4_ROWS_ABOVE) * S4_SHELF_ROW_H;
  }

  function s4GenBookcases(from, to) {
    const ns = S4_COLS;
    let bx = s4Bookcases.length > 0 ? Math.max(from, s4Bookcases[s4Bookcases.length - 1].wx + S4_BC_W + S4_BC_GAP) : from;
    // Bag shared across rows and bookcases.
    if (!s4FoodBag) s4FoodBag = { deck: [], last: null };
    const drawFood = (forbidden) => {
      if (s4FoodBag.deck.length === 0) {
        s4FoodBag.deck = Util.shuffle(FOODS.slice());
      }
      // Swaps forbidden top card with deeper one.
      if (forbidden && forbidden.size > 0 && s4FoodBag.deck.length > 1 && forbidden.has(s4FoodBag.deck[0])) {
        for (let i = 1; i < s4FoodBag.deck.length; i++) {
          if (!forbidden.has(s4FoodBag.deck[i])) {
            [s4FoodBag.deck[0], s4FoodBag.deck[i]] = [s4FoodBag.deck[i], s4FoodBag.deck[0]];
            break;
          }
        }
      }
      const food = s4FoodBag.deck.shift();
      s4FoodBag.last = food;
      return food;
    };
    while (bx < to) {
      const items = [];
      // Avoids vertical repeats at bag seams.
      const above = new Array(ns).fill(null);
      // Avoids horizontal repeats at seams.
      const prevBC = s4Bookcases[s4Bookcases.length - 1];
      for (let row = 0; row < S4_SHELF_ROWS; row++) {
        for (let col = 0; col < ns; col++) {
          const forbidden = new Set();
          if (above[col]) forbidden.add(above[col]);
          if (col === 0 && prevBC) {
            const prevItem = prevBC.items.find((it) => it.row === row && it.col === ns - 1);
            if (prevItem) forbidden.add(prevItem.food);
          }
          const chosenFood = drawFood(forbidden);
          above[col] = chosenFood;
          items.push({
            row,
            col,
            food: chosenFood,
            color: Util.pick(FC),
            grabbed: false,
          });
        }
      }
      s4Bookcases.push({
        wx: bx,
        items,
      });
      bx += S4_BC_W + S4_BC_GAP;
    }
    s4GE = to;
  }

  function initAct6() {
    Footsteps.stop();
    Ambience.stop();
    audio.play("level");
    audio.preload(["music_act8"]);

    phase = "act6";
    ensureCrew();
    // a3HatsOn = false; // uncomment to remove hats in drop-off scene

    Banner.timer = 0;
    tmr.clear();
    dialogStack = [];
    s4WX = 0;
    s4Sp = 0.006;
    s4Ug = 0;
    s4CaughtFired = false;
    s4ItemsGrabbed = 0;
    s4GrabbedItems = [];
    window._debugGrabs = { player: 0, robinReal: 0, robinFake: 0 };
    s4UR = Math.max(0.004, 0.012 - a2CrewCount * 0.0003); // More crew slows scene; ~50s base.
    s4GT = 0;
    s4LM = -1;
    s4IT = 0;
    s4St2 = 0;
    s4RobinFloats = [];
    state.reset({ score: 0 });
    s4AlyScore = 0;
    _hudPopPrev.haul = 0;
    _hudPopT.haul = 0;
    s4ExitPinned = false;
    s4ExitScreenX = W - 7; /* Room for wider arch. */
    s4GrabBursts = [];
    s4HasGrabbed = false;
    s4LastGrabT = 0;

    S4_SHELF_ROW_H = 5;

    S4_SHELF_ROWS = H >= 40 || (Device.isMobile && H >= 38) ? 6 : 5;
    S4_ROWS_ABOVE = Math.ceil(S4_SHELF_ROWS / 2);
    S4_ROWS_BELOW = S4_SHELF_ROWS - S4_ROWS_ABOVE;
    // Matches padding from other acts.
    S4_ABOVE_TOP = Math.max(2, Math.floor(H * 0.06));
    S4_WALK_BOT = H - 1;
    S4_WALK_TOP = S4_ABOVE_TOP;
    S4_BELOW_BOT = S4_WALK_BOT;
    S4_BELOW_TOP = S4_BELOW_BOT - S4_ROWS_BELOW * S4_SHELF_ROW_H + 1;
    S4_ABOVE_BOT = S4_ABOVE_TOP + S4_ROWS_ABOVE * S4_SHELF_ROW_H;
    S4_AISLE_Y = Math.floor((S4_ABOVE_BOT + S4_BELOW_TOP) / 2);
    s4Items = [];
    s4Bookcases = [];
    s4FoodBag = null;
    s4GE = 0;
    s4GenBookcases(0, W + 80);

    s4PX2 = Math.floor(W * 0.5);
    s4PY2 = S4_AISLE_Y;


    s4Gs = [];
    s4Shoppers = [];
    const numG = 1;
    const GUARD_MIN_GAP = 35;
    const GUARD_MIN_LANE_GAP = 3;
    let lastGuardWX = s4WX + W;
    for (let i = 0; i < numG; i++) {
      const wx = lastGuardWX + GUARD_MIN_GAP + Util.randInt(0, 25);
      /* Avoids spawning guards too close. */
      let wy,
        tries = 0;
      do {
        wy = Util.randInt(S4_WALK_TOP, S4_WALK_BOT - 1);
        tries++;
      } while (tries < 10 && s4Gs.some((g) => Math.abs(g.wy - wy) < GUARD_MIN_LANE_GAP && Math.abs(g.wx - wx) < GUARD_MIN_GAP * 1.5));
      s4Gs.push({
        wx,
        wy,
        vx: -0.004 - Math.random() * 0.004,
        col: Util.pick(S4_NARC_COLS),
      });
      lastGuardWX = wx;
    }
    /* Defector chosen early, stays hidden. */
    if (s4Gs.length > 0) {
      const defIdx = Util.randInt(0, s4Gs.length - 1);
      s4Gs[defIdx].defector = true;
      s4Gs[defIdx].defectorState = "approaching"; // approaching → speaking → recruited
      s4Gs[defIdx].defectorT = 0;
      s4Gs[defIdx].chaseT = 0;
    }
    s4DefectorDone = false;
    s4ShopperT = 0;

    s4Alys = [];
    const ac = Math.min(a2CrewCount, 6);
    for (let i = 0; i < ac; i++) {
      s4Alys.push({
        oy: Util.randInt(-4, 4),
        bobPhase: Math.random() * 6,
        grabCD: 0,
      });
    }

    /* Crew hauls from offscreen stock only. */
    tmr.every(500 + Math.random() * 600, () => {
      if (s4Alys.length === 0) return;
      if (Math.random() > 0.3 + s4Alys.length * 0.1) return;
      const food = Util.pick(FOODS);
      s4AlyScore += food.p;
      s4ItemsGrabbed++;
      s4GrabbedItems.push({ food, col: Util.pick(FC) });
      s4RobinFloats.push({
        text: "+$" + food.p,
        x: Math.round(s4PX2 - Util.randInt(4, 10)),
        y: Math.round(s4PY2) - 1,
        life: 1200,
        max: 1200,
        col: C_TEAL,
      });
    });

    s4As = [
      {
        y: S4_AISLE_Y,
        items: [],
        isExit: false,
        aisleH: S4_WALK_BOT - S4_WALK_TOP,
      },
    ];
    s4GE = 0;

    s4TickerMsg = D_INTERCOM_TICKER[0];
    s4TickerNextIdx = 1;
    s4TickerFireCount = 0;
  }

  let s4ExitT, s4ExitDone, s4ExitDoneAt, s4ExitTargetX, s4ExitCrewX;
  function initAct6Exit() {
    Footsteps.stop();
    phase = "act6exit";
    s4ExitT = 0;
    s4ExitDone = false;
    s4ExitDoneAt = 0;
    s4ExitTargetX = s4ExitScreenX;
    s4ExitCrewX = [];

    for (let i = 0; i < a2Crew.length; i++) {
      s4ExitCrewX.push({ x: s4PX2 - 5 - i * 4, y: s4PY2 });
    }
    s4Alys = [];
    audio.play("exit");
    Ambience.stop();
    audio.preload(["music_act7"]);
    Banner.show(window.LANG.bannerEscaped, C_TEAL, 1500, true);
  }

  function updateAct6Exit(dt) {
    s4ExitT += dt;
    Banner.update(dt);

    // Keeps shelves scrolling during exit.
    s4WX += s4Sp * dt;
    while (s4GE < s4WX + W + 80) s4GenBookcases(s4GE, s4GE + 80);
    s4Bookcases = s4Bookcases.filter((bc) => bc.wx + S4_BC_W > s4WX - 20);

    s4PX2 = Util.lerp(s4PX2, s4ExitTargetX, 0.15);
    s4PY2 = Util.lerp(s4PY2, S4_AISLE_Y, 0.12);

    // Staggered so crew enters one-by-one.
    let allIn = true;
    for (let i = 0; i < s4ExitCrewX.length; i++) {
      const c = s4ExitCrewX[i];
      const delay = i * 150;
      if (s4ExitT < delay) {
        allIn = false;
        continue;
      }
      if (!c._exitSoundPlayed) {
        c._exitSoundPlayed = true;
        audio.play("robinExit");
      }
      c.x = Util.lerp(c.x, s4ExitTargetX, 0.06);
      c.y = Util.lerp(c.y, S4_AISLE_Y, 0.06);
      if (Math.abs(c.x - s4ExitTargetX) > 1 || Math.abs(c.y - S4_AISLE_Y) > 1) allIn = false;
    }

    // Guards chase harder, realizing escape.
    for (const g of s4Gs) {
      const dxToDoor = s4ExitTargetX - (g.wx - s4WX);
      g.wx += dxToDoor > 0 ? 0.012 * dt : 0;
      g.wy = Util.lerp(g.wy, S4_AISLE_Y, 0.04);
    }

    if (s4ExitT > 1500 && s4ExitT < 4000 && Math.random() < 0.12) {
      spark(s4ExitTargetX + Util.randInt(-2, 2), S4_AISLE_Y, C_TEAL, 6);
    }

    // Mirrors Act 5's transition trigger.
    if (!s4ExitDone && allIn && Math.abs(s4PX2 - s4ExitTargetX) < 1) {
      s4ExitDone = true;
      s4ExitDoneAt = s4ExitT;
      for (let _b = 0; _b < 10; _b++) {
        burstGood(s4ExitTargetX + Util.randInt(-3, 3), S4_AISLE_Y, a2Crew[_b % a2Crew.length]?.col || C_TEAL, 8);
      }
      triggerFlashGood();
      setTimeout(() => _transitionAct6ExitToAct6Run(), 1200);
    }
  }

  // Act 7: crew races to fridge.

  // Speed ramps from start to cap.
  const S4RUN_BASE_SPD = 0.008,
    S4RUN_MAX_SPD = 0.02,
    S4RUN_RAMP_MS = 8000,
    S4RUN_TOTAL_MS = 36000
    S4RUN_INTRO_MS = 2400;
  let s4RunT, s4RunSpd, s4RunWX, s4RunFridgeX, s4RunDone, s4RunPX, s4RunPY, s4RunGiveupAt, s4RunGiveupFast, s4RunHits, s4RunHitCooldown, s4RunObservedSpd, s4RunStoreX;
  let s4RunClosingInStarted;
  let s4RunAlignX, s4RunAlignY; // Where player glides to, at fridge.
  let s4RunCoins;
  let s4RunTopParts, s4RunBotParts, s4RunKiosks, s4RunBannerShown;
  let s4RunCops, s4RunBystanders, s4RunSparkleT, s4RunTriumphShown, s4RunTriumphAt;
  function _s4RunFridgeCrestText() {
    const label = window.LANG === window.LANG_FR ? "COMMUN" : "COMMUNITY";
    const swoosh = "▄▄▄";
    return `${swoosh}╯ ❖ ${label} ❖ ╰${swoosh}`;
  }

  function initAct6Run() {
    Footsteps.stop();
    Ambience.stop();
    phase = "act7";
    audio.preload(["music_act8"]); // Pre-warms next act's music.
    a2bCalcLayout(); // reuse Act 4 layout helpers
    s4RunT = 0;
    s4RunSpd = S4RUN_BASE_SPD;
    s4RunObservedSpd = S4RUN_BASE_SPD;
    s4RunClosingInStarted = false;
    s4RunWX = 0;
    s4RunDone = false;
    s4RunBannerShown = false;
    s4RunTriumphShown = false;
    s4RunTriumphAt = undefined;
    s4RunGiveupAt = undefined;
    s4RunGiveupFast = false;
    s4RunHits = 0;
    s4RunHitCooldown = 0;
    s4RunPX = Math.floor(W * 0.4); // Fixed position, left of center.
    s4RunPY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    s4RunStoreX = s4RunPX - Math.floor(STO_W / 2) - 24;
    // Distance = integral of speed ramp.
    const _rampDist = ((S4RUN_BASE_SPD + S4RUN_MAX_SPD) / 2) * S4RUN_RAMP_MS;
    const _cruiseDist = S4RUN_MAX_SPD * (S4RUN_TOTAL_MS - S4RUN_RAMP_MS);
    s4RunFridgeX = Math.floor(_rampDist + _cruiseDist);
    s4RunTopParts = a2bGenRow(s4RunFridgeX + W);
    s4RunBotParts = a2bGenRow(s4RunFridgeX + W);
    // Colors dim now, brighten as passed.
    for (const sp of s4RunTopParts) {
      sp._passedCol = null;
      sp._glitched = false;
    }
    for (const sp of s4RunBotParts) {
      sp._passedCol = null;
      sp._glitched = false;
    }

    // Weave-around obstacles, like Act 4.
    s4RunKiosks = [];
    const _roadH6 = A2B_ROAD_Y2 - A2B_ROAD_Y1;
    if (_roadH6 >= 10) {
      const _maxH = Math.min(4, _roadH6 - 6);
      const _segPool = window.GAME_DATA.buildings.filter((b) => b.art.length <= _maxH && b.art.length >= 2);
      if (_segPool.length > 0) {
        const _baseY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2) + 2;
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
        for (let kx = Math.max(40, s4RunStoreX + STO_W + 10); kx < s4RunFridgeX - 12; ) {
          const seg = _mkSeg(kx);
          if (kx + seg.w > s4RunFridgeX - 12) break; // Avoids crowding fridge approach.
          s4RunKiosks.push(seg);
          kx += seg.w + 1 + Util.randInt(10, 15);
        }
        s4RunKiosks.push(_mkSeg(s4RunFridgeX + _s4RunFridgeCrestText().length + 6)); // Avoids overlapping fridge crest art.
      }
    }


    s4RunCops = [];
    const numCops = 5;
    const midY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    for (let i = 0; i < numCops; i++) {
      const maxDistAdd = i * 3 + Util.randInt(0, 2);
      s4RunCops.push({
        wx: s4RunStoreX + Math.floor(STO_W / 2) - 6 - maxDistAdd * 2,
        wy: midY + Util.randInt(-2, 2),
        vx: 0.0065 + Math.random() * 0.0008,
        bobPhase: Math.random() * 6,
        laneOffset: Util.randInt(-3, 3),
        maxDistAdd,
        curSpd: S4RUN_BASE_SPD * 0.5,
      });
    }
    audio.play("copsChase");

    s4RunBystanders = [];
    const bystanderLines = window.LANG.runBystanderLines || ["didn't see a thing", "I saw nothing", "go go go!", "go robins go!", "never saw 'em", "good for you", "looking the other way", "not theft when it should be ours", "goooo!", "run!"];
    const numBystanders = 10;
    for (let i = 0; i < numBystanders; i++) {
      const wx = 35 + i * Math.floor(s4RunFridgeX / (numBystanders + 1));
      s4RunBystanders.push({
        wx,
        // Anchored above rooftops, stays visible.
        wy: i % 2 === 0 ? A2B_ROAD_Y1 - 1 : A2B_ROAD_Y2 + 1,
        line: Util.pick(bystanderLines),
        col: Util.pick(window.GAME_DATA.npcColors),
        triggered: false,
        msgT: 0,
        msgMax: 2200,
        joined: false,
      });
    }

    s4RunSparkleT = 0;
    s4RunCoins = [];
  }

  function updateAct6Run(dt) {
    s4RunT += dt;
    Banner.update(dt);
    if (s4RunDone) {
      const _k = Math.min(1, 0.005 * dt);
      s4RunPX = Util.lerp(s4RunPX, s4RunAlignX, _k);
      s4RunPY = Util.lerp(s4RunPY, s4RunAlignY, _k);
      return;
    }
    const _wxAtFrameStart = s4RunWX;
    s4RunWX += s4RunSpd * dt;
    s4RunSpd = Math.min(S4RUN_MAX_SPD, S4RUN_BASE_SPD + (s4RunT / S4RUN_RAMP_MS) * (S4RUN_MAX_SPD - S4RUN_BASE_SPD));
    Footsteps.setRate(s4RunSpd / S4RUN_BASE_SPD);

    // Grace, close, hit, retreat, repeat.
    const GRACE_MS = 6000;
    const CLOSE_BOOST = 0.014; // Margin above player's observed speed.
    const RETREAT_MS = 2200;
    const GIVEUP_MS = 4000;
    const GIVEUP_FAST_MS = 2600; // Eases out, doesn't snap.
    const MAX_CHASE_MS = 50000;
    const MAX_DIST = 18; // hard ceiling, always visible
    const EASE_MS = 700; // Eases speed changes, no snapping.
    const CLOSE_EASE_MS = 220; // quicker, but still a curve
    const fridgeNear = s4RunWX > s4RunFridgeX - W - 50;
    if (s4RunGiveupAt === undefined && (s4RunHits >= 2 || s4RunT >= MAX_CHASE_MS)) {
      s4RunGiveupAt = s4RunT;
      s4RunGiveupFast = fridgeNear;
    }
    const _s4WasBackingOff = s4RunHitCooldown > 0;
    if (s4RunHitCooldown > 0) s4RunHitCooldown -= dt;

    if (s4RunGiveupAt === undefined && s4RunT >= GRACE_MS) {
      if (!s4RunClosingInStarted) {
        s4RunClosingInStarted = true;
        audio.play("copsSiren");
      } else if (_s4WasBackingOff && s4RunHitCooldown <= 0) {
        audio.play("copsSiren");
      }
    }

    // Cops always chase rearmost crew member.
    let packRearOX = 0;
    for (let i = 0; i < a2Crew.length; i++) {
      const _ox = -2 - Math.floor(i / 3) * 2 - 2; // Extra -2 covers orbit wobble.
      if (_ox < packRearOX) packRearOX = _ox;
    }
    const packRearWX = s4RunWX + s4RunPX + packRearOX;

    for (let i = s4RunCops.length - 1; i >= 0; i--) {
      const c = s4RunCops[i];
      const dist = packRearWX - c.wx;
      let targetVx, easeMs;
      if (s4RunGiveupAt !== undefined) {
        const giveupMs = s4RunGiveupFast ? GIVEUP_FAST_MS : GIVEUP_MS;
        const giveupT = Math.min(1, (s4RunT - s4RunGiveupAt) / giveupMs);
        targetVx = s4RunSpd * (1 - giveupT * 0.9);
        easeMs = EASE_MS;
      } else if (s4RunT < GRACE_MS) {
        targetVx = s4RunSpd * 0.5; // safe landing
        easeMs = EASE_MS;
      } else if (s4RunHitCooldown > 0) {
        targetVx = s4RunSpd * 0.7; // just hit, backing off
        easeMs = EASE_MS;
      } else {
        targetVx = Math.max(s4RunSpd, s4RunObservedSpd) + CLOSE_BOOST + (c.vx - 0.007) * 0.3; // closing in
        easeMs = CLOSE_EASE_MS;
      }
      c.curSpd = Util.lerp(c.curSpd, targetVx, Math.min(1, dt / easeMs));
      c.wx += c.curSpd * dt;
      c.wx = Math.min(c.wx, packRearWX); // Never overtakes rear of pack.
      if (s4RunGiveupAt === undefined) c.wx = Math.max(c.wx, packRearWX - MAX_DIST - c.maxDistAdd); // Stays close while still chasing.
      if (s4RunGiveupAt === undefined) {
        c.wy = Util.lerp(c.wy, s4RunPY + c.laneOffset, Math.min(1, 0.0025 * dt));
        c.wy = Util.clamp(c.wy, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
      }

      if (s4RunHits < 2 && dist < 2 && Math.abs(c.wy - s4RunPY) < 4 && !(s4RunHitCooldown > 0)) {
        s4RunHits++;
        s4RunHitCooldown = RETREAT_MS;
        audio.play("copsHit");
        const _tapX = Math.round(packRearWX - s4RunWX);
        Effects.start("corrupt", { x: _tapX, y: Math.round(s4RunPY), radius: 9, duration: 450, intensity: 0.75, swap: true });
        spark(_tapX, Math.round(s4RunPY), C_DANGER, 14);
        Banner.show(window.LANG.bannerCopTouch[s4RunHits - 1] || "freeze!", C_DANGER, 900, true);
      }

      if (s4RunGiveupAt !== undefined && c.wx - s4RunWX < -14) s4RunCops.splice(i, 1);
    }

    if (!s4RunTriumphShown && (s4RunCops.length === 0 || (s4RunGiveupAt !== undefined && s4RunT - s4RunGiveupAt > GIVEUP_MS + 1000))) {
      s4RunTriumphShown = true;
      s4RunTriumphAt = s4RunT;
      audio.play("lostThem");
      // TEMPORARY: reuses chase song; see MUSIC_STRETCH.
      if (MUSIC_STRETCH) Music.transition("music_act7");
      audio.play("sparkleStart");
      const triumphMsg = window.LANG.bannerWeLostThem || "we lost them!";
      Banner.show(triumphMsg, C_TEAL, 3800, true);
      for (let _b = 0; _b < 8; _b++) {
        burstGood(s4RunPX + Util.randInt(-4, 4), s4RunPY + Util.randInt(-3, 3), C_TEAL, 8);
      }
      triggerFlashGood();
    }

    const pwxRun = s4RunWX + s4RunPX;
    for (const b of s4RunBystanders) {
      const aheadDist = b.wx - pwxRun;
      if (!b.triggered && aheadDist > 0 && aheadDist < 16) {
        b.triggered = true;
        b.msgT = b.msgMax;
        audio.play("paper");
      }
      if (!b.joined && !s4RunDone && Math.abs(aheadDist) < 2) {
        b.joined = true;
        audio.play("bump");
        audio.play("recruit");
        burstGood(Math.round(b.wx - s4RunWX), b.wy, b.col, 8);
        triggerFlashGood();
        a2CrewCount++;
        a2Crew.push({
          b: Math.random() * 6,
          ru: 0,
          art: window.GAME_DATA.npcArts[Math.floor(b.wx) % window.GAME_DATA.npcArts.length],
          col: b.col,
        });
      }
      if (b.msgT > 0) b.msgT -= dt;
    }

    // Sparkle trail only after triumph.
    if (s4RunTriumphShown) {
      s4RunSparkleT -= dt;
      if (s4RunSparkleT <= 0) {
        s4RunSparkleT = 90; // ms between spawns
        const sparkChars = ["*", "✦", "·", "+"];
        const sparkCols = ["#fff", "#ffd700", C_TEAL, C_PLAYER];
        sparks.push({
          x: Math.round(s4RunPX) + Util.randInt(-1, 1),
          y: Math.round(s4RunPY) + Util.randInt(-1, 1),
          dx: -0.005 + (Math.random() - 0.5) * 0.004,
          dy: -0.008 - Math.random() * 0.004,
          ch: Util.pick(sparkChars),
          color: Util.pick(sparkCols),
          life: 600 + Math.random() * 300,
        });
        if (a2Crew.length > 0) {
          const ci = Util.randInt(0, a2Crew.length - 1);
          const baseOX = -2 - Math.floor(ci / 3) * 2;
          const cx = Math.round(s4RunPX + baseOX);
          const cy = Math.round(s4RunPY);
          const crewCol = (a2Crew[ci] && a2Crew[ci].col) || C_TEAL;
          sparks.push({
            x: cx,
            y: cy + Util.randInt(-1, 1),
            dx: -0.006 + (Math.random() - 0.5) * 0.004,
            dy: -0.007 - Math.random() * 0.004,
            ch: Util.pick(sparkChars),
            color: crewCol,
            life: 500 + Math.random() * 300,
          });
        }
      }

    }

    const ms = 0.025;
    const tapStep = 2;
    if (input.isDown("up")) s4RunPY -= ms * dt;
    else if (input.justPressed("up")) s4RunPY -= tapStep;
    if (input.isDown("down")) s4RunPY += ms * dt;
    else if (input.justPressed("down")) s4RunPY += tapStep;
    if (input.isDown("right")) s4RunWX += ms * dt * 0.6;
    else if (input.justPressed("right")) s4RunWX += tapStep * 0.6;
    input.justPressed("left"); // Drains left tap; no backing up.
    s4RunPY = Util.clamp(s4RunPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);

    if (s4RunKiosks) {
      const _pwxRun6 = s4RunWX + s4RunPX;
      for (const k of s4RunKiosks) {
        if (_pwxRun6 < k.wx - 1 || _pwxRun6 > k.wx + k.w) continue;
        if (s4RunPY + 1 >= k.top && s4RunPY <= k.bot) {
          s4RunPY = s4RunPY + 0.5 < (k.top + k.bot) / 2 ? k.top - 2 : k.baseY;
          s4RunPY = Util.clamp(s4RunPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
        }
      }
    }

    // Desktop only; mobile uses _mobUpdate.
    if (clickPending && phase === "act7" && !Device.isMobile) {
      clickPending = false;
      if (clickSY < s4RunPY - 2) s4RunPY -= 3;
      else if (clickSY > s4RunPY + 2) s4RunPY += 3;
      if (clickSX > s4RunPX + 3) s4RunWX += 2; // Forward click gives sprint boost.
    }

    const _runPWX = s4RunWX + s4RunPX;
    for (const coin of s4RunCoins) {
      if (!coin.hit && Math.abs(coin.wx - _runPWX) < 4 && Math.abs(coin.wy - s4RunPY) < 3) {
        coin.hit = true;
        playPitched("coin", 8);
        spark(Math.round(coin.wx - s4RunWX), coin.wy, C_COIN, 8);
        burstGood(Math.round(coin.wx - s4RunWX), coin.wy, "#ffd700", 6);
      }
    }

    // Marks banner shown once mid-run.
    if (!s4RunBannerShown && s4RunT > 7000) {
      s4RunBannerShown = true;
    }

    const MIN_GLITCH_MS = 2500;
    const GLITCH_CUSHION = 20; // World units to taper before cap.
    if (!s4RunTriumphShown || s4RunT - s4RunTriumphAt < MIN_GLITCH_MS) {
      const _capX = s4RunFridgeX - (W - 4);
      const _distBefore = _capX - _wxAtFrameStart; // Room left when frame began.
      if (_distBefore <= 0) {
        s4RunWX = _capX;
      } else if (_distBefore < GLITCH_CUSHION) {
        const _attempted = s4RunWX - _wxAtFrameStart;
        s4RunWX = Math.min(_capX, _wxAtFrameStart + _attempted * (_distBefore / GLITCH_CUSHION));
      } else {
        s4RunWX = Math.min(s4RunWX, _capX);
      }
    }

    // Smoothed against single-tap spikes.
    const _observedThisFrame = dt > 0 ? Math.max(0, (s4RunWX - _wxAtFrameStart) / dt) : s4RunObservedSpd;
    s4RunObservedSpd = Util.lerp(s4RunObservedSpd, _observedThisFrame, 0.25);

    // Fires only once fridge fully visible.
    const fridgeSX = s4RunFridgeX - s4RunWX;
    if (!s4RunDone) {

      if (fridgeSX < W - 4 && Math.round(s4RunPX) >= fridgeSX + 18) {
        s4RunDone = true;
        s4RunSpd = 0;
        const _aisleH = A2B_ROAD_Y2 - A2B_ROAD_Y1;
        s4RunAlignX = fridgeSX + 18; // centered on the fridge
        s4RunAlignY = A2B_ROAD_Y1 + Math.floor((_aisleH - 9) / 2) + 4; // Centers on fridge; art is 9 tall.
        // Restrained; bigger moment comes next act.
        for (let _b = 0; _b < 8; _b++) {
          burstGood(Math.round(fridgeSX) + Util.randInt(0, 16), Util.randInt(A2B_ROAD_Y1 + 2, A2B_ROAD_Y2 - 1), C_TEAL, 10);
        }
     
        for (const sp of s4RunTopParts) {
          if (!sp._passedCol) sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
        }
        for (const sp of s4RunBotParts) {
          if (!sp._passedCol) sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
        }
        // Times glide in, avoids dead air.
        setTimeout(() => {
          triggerFlashGood();
          audio.play("hitFridge");
        }, 500);
        setTimeout(() => {
          sparks.length = 0;
          _transitionAct6RunToAct8();
        }, 1100);
      }
    }
  }

  const GLITCH_TAG_RADIUS = 24;
  const GLITCH_FRACTION = 0.35; // Partial, not whole building.
  const GC_CHARS = "█▓▒░▄▀■◆●✕#@!?%$&*XZ╬╫┼±";
  const GC_COLS = ["#f44", "#0ff", "#ff0", "#f0f", "#fff", "#f80", "#cc6688"];
  // Glitches permanently once passed.
  function _s4RunTagGlitch(sp, sx, playerSX) {
    // Screen-space. Held off until cops are lost.
    if (!s4RunTriumphShown || sp._glitched || sx >= playerSX || playerSX - sx >= GLITCH_TAG_RADIUS) return;
    sp._glitched = true;
    sp._glitchMask = sp.art.map((line) => [...line].map(() => Math.random() < GLITCH_FRACTION));
    sp._glitchArt = sp.art.map((line) => [...line].map(() => GC_CHARS[Math.floor(Math.random() * GC_CHARS.length)]));
    sp._glitchCols = sp.art.map((line) => [...line].map(() => GC_COLS[Math.floor(Math.random() * GC_COLS.length)]));
  }
  function _s4RunDrawBuilding(sp, sx, by) {
    const baseCol = sp._passedCol || sp.col;
    if (!sp._glitched) {
      grid.art(sp.art, sx, by, baseCol);
      return;
    }
    sp.art.forEach((line, r) => {
      for (let i = 0; i < line.length; i++) {
        if (line[i] === " ") {
          grid.set(sx + i, by + r, " ", "#000"); // block mountain bleed
          continue;
        }
        if (sp._glitchMask[r][i]) grid.set(sx + i, by + r, sp._glitchArt[r][i], sp._glitchCols[r][i]);
        else grid.set(sx + i, by + r, line[i], baseCol);
      }
    });
  }

  // Same tiling as Act 4, sparser
  // Exclude zone bars cloud spawns.
  function _a6RunSkyClouds(scrollX, tile = 300, perTile = 1, exclude = null) {
    const shapes = window.GAME_DATA.cloudShapes;
    const palette = ["#a4b0d1", "#7d8aa8", "#8f9ac0", "#93a0c4"];
    const t0 = Math.floor(scrollX / tile) - 1;
    const t1 = Math.floor((scrollX + W) / tile) + 1;
    for (let t = t0; t <= t1; t++) {
      let seed = (t * 2654435761) >>> 0;
      const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
      for (let k = 0; k < perTile; k++) {
        const art = shapes[Math.floor(rand() * shapes.length)];
        const sx = Math.floor(t * tile + rand() * tile - scrollX);
        const row = -1 + Math.floor(rand() * 3);
        const col = palette[Math.floor(rand() * palette.length)];
        if (sx < -20 || sx > W + 20) continue;
        const cw = art[0].length,
          ch = art.length;
        if (exclude && sx < exclude.x1 && sx + cw > exclude.x0 && row < exclude.y1 && row + ch > exclude.y0) continue;
        grid.art(art, sx, row, col);
      }
    }
  }

  function renderAct6Run(opts = {}) {
    const camX = Math.round(s4RunWX);
    // Mountain parallax (same as Act 4)
    const mtScrollX = s4RunWX * 0.04;
    const mtBaseY = A2B_TOP_H - 1;

    let peakScreenX = -1,
      peakScreenY = 99999;
    for (let x = 0; x < W; x++) {
      const wx = x + mtScrollX;
      const period = 220;
      const phase2 = ((wx % period) + period) % period;
      const norm = phase2 / period;
      const dome = Math.exp(-Math.pow((norm - 0.3) * 3.0, 2));
      const shoulder = Math.exp(-Math.pow((norm - 0.62) * 5.0, 2)) * 0.35;
      const hillH = Math.round((dome + shoulder) * (A2B_TOP_H * 0.6));
      const topY = mtBaseY - hillH;
      if (topY < peakScreenY) {
        peakScreenY = topY;
        peakScreenX = x;
      }
      for (let dy = topY; dy <= mtBaseY; dy++) {
        if (dy < 0 || dy >= H) continue;
        const depth = dy - topY;
        let ch, col;
        if (depth === 0) {
          ch = "\u0BF3";
          col = "#3d5230"; // ridge
        } else if (depth < 2) {
          ch = "\u0B70";
          col = "#2e4025";
        } else if (depth < 5) {
          ch = "\u0b70";
          col = "#23311c";
        } else {
          ch = "\u0b70";
          col = "#182212"; // hazy base
        }
        grid.set(x, dy, ch, col);
      }
    }
    // Drawn after mountain for correct occlusion.
    const crossZone = peakScreenX >= 0 ? { x0: peakScreenX - 3, x1: peakScreenX + 3, y0: peakScreenY - 5, y1: peakScreenY + 1 } : null;
    _a6RunSkyClouds(mtScrollX, 300, 1, crossZone);
    // Sun drawn last; stays uncovered.
grid.art([
    " ⟍  │ ⟋ ",
    "⎯(^‿^)⎯",
    " ⟋  │ ⟍ "
], W - 8, 1, C_COIN);

    //  grid.art([
    //     "   ︵     ", 
    //     "༺⸨^⸩༻",
    //     "   ︶     ",
    //   ], W - 8, 1, C_COIN);  

    // Cross drawn last; stays visible.
    if (peakScreenX >= 0) {
      const crossArt = [" | ", "-+-", " | "];
      grid.art(crossArt, peakScreenX - 1, peakScreenY - 3, "#f0e8c0");
    }

    const topScrollX = Math.round(s4RunWX * 0.85);
    for (const sp of s4RunTopParts) {
      const sx = Math.floor(sp.wx) - topScrollX;
      if (sx + sp.w < -2 || sx > W + 2) continue;
      if (!sp._passedCol && sx < s4RunPX) {
        sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
      }
      _s4RunTagGlitch(sp, sx, s4RunPX);
      _s4RunDrawBuilding(sp, sx, Math.max(0, A2B_TOP_H - sp.art.length));
    }
    // No sidewalks, matches Act 4.

    if (s4RunKiosks) {
      for (const k of s4RunKiosks) {
        const ksx = Math.floor(k.wx) - camX;
        if (ksx + k.w < -2 || ksx > W + 2) continue;
        for (const b of k.bldgs) {
          const bsx = ksx + b.dx;
          if (!b._passedCol && bsx < s4RunPX) {
            b._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
          }
          _s4RunTagGlitch(b, bsx, s4RunPX);
          _s4RunDrawBuilding(b, bsx, k.baseY - b.art.length);
        }
      }
    }

    for (const sp of s4RunBotParts) {
      const sx = Math.floor(sp.wx) - camX;
      if (sx + sp.w < -2 || sx > W + 2) continue;
      if (!sp._passedCol && sx < s4RunPX) {
        sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
      }
      _s4RunTagGlitch(sp, sx, s4RunPX);
      // Bottom-aligned, matches Act 4's band.
      _s4RunDrawBuilding(sp, sx, Math.max(A2B_ROAD_Y2 + 1, H - sp.art.length));
    }

    {
      const stsx = Math.floor(s4RunStoreX) - camX;
      if (stsx > -STO_W - 5 && stsx < W + 5) {
        const stY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2) - Math.floor(STO_H / 2);
        const _stFlash = Math.sin(Date.now() / 400) > 0;
        for (let _ri = 0; _ri < STORE.length; _ri++) {
          const _row = STORE[_ri];
          const _rowCol = _stFlash ? storeSignColorFlash(_ri) : storeSignColor(_ri);
          for (let _ci = 0; _ci < _row.length; _ci++) {
            if (_row[_ci] !== " ") grid.set(stsx + _ci, stY + _ri, _row[_ci], _rowCol);
            else grid.set(stsx + _ci, stY + _ri, " ", "#000");
          }
        }
      }
    }

    let _closestCop = null;
    let _closestCopDist = Infinity;
    for (const c of s4RunCops) {
      const d = Math.abs(c.wx - (s4RunWX + s4RunPX));
      if (d < _closestCopDist) {
        _closestCopDist = d;
        _closestCop = c;
      }
    }

    for (let i = s4RunCops.length - 1; i >= 0; i--) {
      const c = s4RunCops[i];
      const csx = Math.round(c.wx - s4RunWX);
      if (csx < -3 || csx > W + 3) continue;
      const _copLeg = Math.floor(s4RunT / 160 + c.bobPhase * 30) % 2 === 0 ? "\u03C6" : "\u20B3";
      const _copHead = Math.floor(s4RunT / 200) % 2 === 0 ? "!" : "\u00A7";
      const _copCol = Math.floor(s4RunT / 120) % 2 === 0 ? C_DANGER : "#fff";
      grid.art([_copHead, _copLeg], csx, Math.round(c.wy), _copCol);
      // Shout bubble — only closest cop shouts
      if (c !== _closestCop) continue;
      const _shouts = window.LANG.act6RunCopShouts || ["get back here!", "stop!", "hey!", "freeze!"];
      const _shoutIdx = Math.floor(s4RunT / 2000 + c.bobPhase * 2) % _shouts.length;
      const _shout = _shouts[_shoutIdx];
      const _bw = _shout.length + 4;
      const _bx = Util.clamp(csx - Math.floor(_bw / 2), 0, W - _bw);
      const _by = Math.round(c.wy) - 3;
      if (_by >= 0 && _by + 2 < H && csx >= 0 && csx < W) {
        for (let _y = _by; _y <= _by + 2; _y++) for (let _x = _bx; _x < _bx + _bw; _x++) if (_x >= 0 && _x < W) grid.set(_x, _y, " ", null);
        grid.text(DIALOG_BOX.tl + DIALOG_BOX.h.repeat(_bw - 2) + DIALOG_BOX.tr, _bx, _by, C_DANGER);
        grid.text(DIALOG_BOX.v + " " + _shout + " " + DIALOG_BOX.v, _bx, _by + 1, C_DANGER);
        grid.text(DIALOG_BOX.bl + DIALOG_BOX.h.repeat(_bw - 2) + DIALOG_BOX.br, _bx, _by + 2, C_DANGER);
      }
    }

    // Joined bystanders parade elsewhere instead.
    for (const b of s4RunBystanders) {
      if (b.joined) continue;
      const bsx = Math.floor(b.wx) - camX;
      if (bsx < -3 || bsx > W + 3) continue;
      const npcArt = Util.pick(window.GAME_DATA.npcArts);
      // Cached once, prevents sprite flicker.
      if (!b._art) b._art = window.GAME_DATA.npcArts[Math.floor(b.wx) % window.GAME_DATA.npcArts.length];
      grid.art(b._art, bsx, b.wy, b.col);
      if (b.msgT > 0) {
        const txt = b.line;
        const bw = txt.length + 4;
        const bx = Util.clamp(bsx - Math.floor(bw / 2), 0, W - bw);
        const by = b.wy - 3;
        if (by >= 0 && by + 2 < H) {
          for (let yy = by; yy <= by + 2; yy++) for (let xx = bx; xx < bx + bw; xx++) if (xx >= 0 && xx < W) grid.set(xx, yy, " ", null);
          grid.text(DIALOG_BOX.tl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.tr, bx, by, b.col);
          grid.text(DIALOG_BOX.v + " " + txt + " " + DIALOG_BOX.v, bx, by + 1, b.col);
          grid.text(DIALOG_BOX.bl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.br, bx, by + 2, b.col);
        }
      }
    }

    // Mini preview of Act 8's ornate shelf.
    if (s4RunWX > s4RunFridgeX - W - 10) {
      const fsx = Math.floor(s4RunFridgeX) - camX;
      if (fsx < W + 10) {
        const swoosh = "▄▄▄";
        const crestText = _s4RunFridgeCrestText();
        const leftCornerIdx = swoosh.length;
        const rightCornerIdx = crestText.length - 1 - swoosh.length;
        const archInner = rightCornerIdx - leftCornerIdx - 1;
        const archRow = " ".repeat(leftCornerIdx) + "╭" + "─".repeat(Math.max(0, archInner)) + "╮";

        const contentW = Math.max(1, crestText.length - 6); // Minus post block each side.
        const top = "╔═╦" + "═".repeat(contentW) + "╦═╗";
        const div = "╠═╬" + "═".repeat(contentW) + "╬═╣";
        const bot = "╚═╩" + "═".repeat(contentW) + "╩═╝";
        const rowA = "║▚║" + " ".repeat(contentW) + "║▞║";
        const rowB = "║▞║" + " ".repeat(contentW) + "║▚║";
        const fridgeBody = [archRow, crestText, top, rowA, rowB, div, rowA, rowB, bot];

        const aisleH = A2B_ROAD_Y2 - A2B_ROAD_Y1;
        const fY = A2B_ROAD_Y1 + Math.floor((aisleH - fridgeBody.length) / 2);
        grid.art(fridgeBody, fsx, fY, C_TEAL);
      }
    }
    if (!opts.skipPlayerCrew) {
      const _runPX = Util.ease(s4RunStoreX + Math.floor(STO_W / 2), s4RunPX, Math.min(1, s4RunT / S4RUN_INTRO_MS));

      for (let i = 0; i < a2Crew.length; i++) {
        const c = a2Crew[i];
        let mx, my;
        if (s4RunDone) {

          if (c._gatherX === undefined) c._gatherX = s4RunPX + (-2 - Math.floor(i / 3) * 2);
          if (c._gatherY === undefined) c._gatherY = s4RunPY;
          c._gatherX = Util.lerp(c._gatherX, s4RunAlignX + (-3 - Math.floor(i / 3) * 2), 0.06);
          c._gatherY = Util.lerp(c._gatherY, s4RunAlignY + Math.sin(c.b * 4.1) * 0.9, 0.06);
          mx = Math.round(c._gatherX);
          my = Math.round(c._gatherY);
        } else if (c.isCat) {
          // Cat pads alongside, no orbit or bob.
          const prowl = Math.sin(s4RunT / 400 + (c.b || i)) * 1.4;
          const baseOX = -2 - Math.floor(i / 3) * 2;
          mx = Math.round(_runPX + baseOX + prowl);
          my = Math.round(s4RunPY);
        } else {
          const clusterR = 2;
          const angle = s4RunT / 600 + (c.b || i);
          const orbitX = Math.sin(angle + i) * clusterR;
          const orbitY = Math.cos(angle + i) * (clusterR * 0.35);
          const baseOX = -2 - Math.floor(i / 3) * 2;
          mx = Math.round(_runPX + baseOX + orbitX);
          my = Math.round(s4RunPY + orbitY);
        }

        if (mx >= 0 && mx < W && my > A2B_ROAD_Y1 - 3 && my < A2B_ROAD_Y2 + 3) {
          const _frame = [...(c.art || A2_ROB)];
          if (!c.isCat) {
            _frame[1] = Math.floor(s4RunT / 200 + (c.b || 0) * 30) % 2 === 0 ? _frame[1] : "\u20B3";
          }
          grid.art(_frame, mx, my, c.col || C_TEAL, c.isCat); // isCat forces forward-facing art always.
        }
      }

      const _pFrame = [...(A2_PA[Math.floor((s4RunT || 0) / 10) % 2] || A2_PA[0])];
      _pFrame[1] = Math.floor(s4RunT / 180) % 2 === 0 ? _pFrame[1] : "₳";
      grid.art(_pFrame, Math.round(_runPX), Math.round(s4RunPY), playerPulseColor(s4RunT));
    }

    for (const coin of s4RunCoins) {
      if (coin.hit) continue;
      const csx = Math.round(coin.wx - s4RunWX);
      if (csx < 0 || csx >= W) continue;
      grid.set(csx, coin.wy, "◎", C_COIN);
    }

    if (s4RunT < 4000 && !s4RunDone) {
      renderTapPrompt(ctrl("act6Run"), H - 2, "#fff", C_PLAYER, true);
    }

    Banner.render();
  }

  function renderAct6Exit(opts = {}) {
    // Reuses Act 6 renderer for continuity.
    renderAct6(opts);

    if (!opts.skipPlayerCrew) {
      for (let i = 0; i < s4ExitCrewX.length; i++) {
        const cx = Math.round(s4ExitCrewX[i].x);
        const cy = Math.round(s4ExitCrewX[i].y);
        const src = a2Crew[i];
        const rArt = (src && src.art) || A2_ROB;
        const rCol = (src && src.col) || C_TEAL;
        if (cx >= 0 && cx < W && cy >= 0 && cy < H) {
          grid.art(rArt, cx, cy, rCol);
        }
      }
      // Player reappears late, before the cut.
      if (s4ExitDone && s4ExitT - s4ExitDoneAt > 850) {
        const _a4ePFrame = [...(A2_PA[Math.floor(s4GT * 4) % 2] || A2_PA[0])];
        _a4ePFrame[1] = Math.floor((s4GT * 1000) / 180) % 2 === 0 ? _a4ePFrame[1] : "₳";
        grid.art(_a4ePFrame, Math.round(s4PX2), Math.round(s4PY2), playerPulseColor(s4GT * 1000));
      }
    }
  }

  const SU = [
    {
      a: 0.15,
      h: window.LANG.urgencyCopsCalled,
      c: "#a80",
    },
    {
      a: 0.35,
      h: window.LANG.urgencyHurry,
      c: C_WARN,
    },
    {
      a: 0.55,
      h: window.LANG.urgencyClose,
      c: "#c60",
    },
    {
      a: 0.75,
      h: window.LANG.urgencyGetOut,
      c: C_DANGER,
    },
    {
      a: 0.9,
      h: window.LANG.urgencyLastChance,
      c: "#a00",
    },
    {
      a: 1,
      h: window.LANG.urgencyTooLate,
      c: "#800",
    },
  ];

  /* Shared hit-test: click and walk-into. */
  function _s4FindItemAt(sx, sy) {
    for (const bc of s4Bookcases) {
      const bsx = Math.round(bc.wx - s4WX);
      if (bsx + S4_BC_W < 0 || bsx > W) continue;
      for (const it of bc.items) {
        if (it.grabbed) continue;
        const ix = bsx + 1 + it.col * S4_SLOT_W + 1;
        const aY = _s4RowY(it.row);
        if (sx >= ix - 1 && sx < ix + S4_SLOT_W && sy >= aY && sy <= aY + it.food.a.length) {
          return { it, ix, aY };
        }
      }
    }
    return null;
  }

  function _s4DoGrab(it, ix, aY) {
    it.grabbed = true;
    it.grabT = S4_GRAB_ANIM_MS;
    playBank(["grab", "grab2", "grab3"]);
    state.set("score", state.get("score") + it.food.p);
    s4ItemsGrabbed++;
    s4GrabbedItems.push({ food: it.food, col: it.color });
    burstGood(ix + Math.floor(S4_SLOT_W / 2), aY, it.color, Device.isMobile ? 4 : 9);
    s4GrabBursts.push({ x: ix + Math.floor(S4_SLOT_W / 2), y: aY + 1, t: 400, max: 400, col: it.color });
    popupPush(it.food.n + " +$" + it.food.p, ix + Math.floor(S4_SLOT_W / 2) + Util.randInt(-2, 2), aY, it.color, 500);
    s4HasGrabbed = true;
    s4LastGrabT = s4GT;
    if (s4Alys.length && Math.random() < 0.35) {
      s4RobinFloats.push({
        text: drawDeck("cheers", window.LANG.robinCheers),
        x: Math.round(s4PX2 - Util.randInt(3, 9)),
        y: Math.round(s4PY2) - 1,
        life: 1100,
        max: 1100,
        col: a2Crew[Util.randInt(0, a2Crew.length - 1)]?.col || C_TEAL,
      });
    }
  }

  // Reaching the exit isn't automatically a win
  function s4TryExit() {

    if (!s4HasGrabbed || s4ItemsGrabbed <= 0) {
      quickBust("emptyHanded", initAct5, { keepCrew: true });
    } else {
      initAct6Exit();
    }
  }

  function updateAct6(dt) {

    if (!convVisible) tmr.update(dt);
    if (!convVisible) s4GT += dt / 1000;
    if (!convVisible) s4Ug = Math.min(1, s4Ug + (s4UR * 1.4 * dt) / 1000);
    s4Sp = 0.006 + s4Ug * 0.008;
    if (!convVisible) Banner.update(dt);

    for (let i = SU.length - 1; i >= 0; i--)
      if (s4Ug >= SU[i].a && i > s4LM) {
        if (SU[i].a >= 0.35) Banner.show(SU[i].h, SU[i].c, 2000);
        if (SU[i].a === 0.55) audio.play("urgent");
        s4LM = i;
      }

    /* Random ambience until urgency rises. */
    const AMBIANCE_STORE_INTERVAL_MS = 30000;
    if (
      s4Ug < 0.55 &&
      Math.floor((s4GT * 1000) / AMBIANCE_STORE_INTERVAL_MS) > Math.floor((s4GT * 1000 - dt) / AMBIANCE_STORE_INTERVAL_MS)
    ) {
      playBank(["ambianceStore1", "ambianceStore2", "ambianceStore3"]);
    }
    if (!convVisible && !s4CaughtFired && s4GT - s4LastGrabT > 8 && Banner.timer <= 0 && !Banner.seq) {
      s4LastGrabT = s4GT;
      Banner.show(ctrl("act6Grab"), C_WARN, 2200);
    }
 
    if (s4Ug > 0.7 && !s4CaughtFired && Math.random() < 0.008) {
      const _edge = Math.random();
      const _ex = _edge < 0.5 ? Util.randInt(2, 8) : W - Util.randInt(2, 8);
      const _ey = Util.randInt(2, H - 3);
      Effects.start("corrupt", {
        x: _ex,
        y: _ey,
        radius: 4,
        duration: 350,
        intensity: (s4Ug - 0.7) * 0.8, // Ranges 0 to 0.24 intensity.
        swap: false,
      });
    }

    if (s4Ug >= 1) {
      if (!s4CaughtFired) {
        s4CaughtFired = true;
   
        triggerMirrorBust("caught", initAct4, Math.round(s4PX2), Math.round(s4PY2));
      }
      return;
    }

    if (!convVisible && !s4ExitPinned && s4GT > 30) {
      s4ExitPinned = true;
      audio.play("exitAvailable");
      Banner.show(window.LANG.bannerExitOpen, C_TEAL, 3000, true);
    }

    if (!convVisible)
      for (let i = s4RobinFloats.length - 1; i >= 0; i--) {
        s4RobinFloats[i].life -= dt;
        s4RobinFloats[i].y -= 0.002 * dt;
        if (s4RobinFloats[i].life <= 0) s4RobinFloats.splice(i, 1);
      }
    if (!convVisible)
      for (let i = s4GrabBursts.length - 1; i >= 0; i--) {
        s4GrabBursts[i].t -= dt;
        if (s4GrabBursts[i].t <= 0) s4GrabBursts.splice(i, 1);
      }
    if (!convVisible)
      for (const bc of s4Bookcases) {
        for (const it of bc.items) {
          if (it.grabbed && it.grabT > 0) it.grabT -= dt;
        }
      }

    if (!convVisible) {
      s4WX += s4Sp * dt;
      while (s4GE < s4WX + W + 80) s4GenBookcases(s4GE, s4GE + 80);
      s4Bookcases = s4Bookcases.filter((bc) => bc.wx + S4_BC_W > s4WX - 20);
      Footsteps.start();
      Footsteps.setRate(s4Sp / 0.006);
    } else {
      Footsteps.stop();
    }

    if (s4St2 > 0) s4St2 -= dt;
    if (s4St2 <= 0 && !convVisible) {
      const s4TapStep = 2;
      if (input.isDown("up")) s4PY2 -= 0.02 * dt;
      else if (input.justPressed("up")) s4PY2 -= s4TapStep;
      if (input.isDown("down")) s4PY2 += 0.02 * dt;
      else if (input.justPressed("down")) s4PY2 += s4TapStep;
      if (input.isDown("left")) s4PX2 -= 0.02 * dt;
      else if (input.justPressed("left")) s4PX2 -= s4TapStep;
      if (input.isDown("right")) s4PX2 += 0.02 * dt;
      else if (input.justPressed("right")) s4PX2 += s4TapStep;
    }

    /* Runs regardless of keyboard input. */
    // Skipped during conversation; taps consumed there.
    if (clickPending && phase === "act6" && !convVisible) {
      /* Exit check happens first. */
      if (s4ExitPinned && clickSX >= s4ExitScreenX - 5 && clickSX <= s4ExitScreenX + 5 && clickSY >= S4_WALK_TOP && clickSY <= S4_WALK_BOT) {
        clickPending = false;
        s4TryExit();
        return;
      }

      clickPending = false;

      let grabbedItem = false;
      const _clickHit = _s4FindItemAt(clickSX, clickSY);
      if (_clickHit) {
        _s4DoGrab(_clickHit.it, _clickHit.ix, _clickHit.aY);
        grabbedItem = true;
      }

      if (!grabbedItem && clickSY >= S4_WALK_TOP && clickSY <= S4_WALK_BOT) {
        if (clickSY < s4PY2 - 1) s4PY2 -= 2;
        else if (clickSY > s4PY2 + 1) s4PY2 += 2;
      }
    }

    /* Shelves decorative; clamps to walk-band. */
    s4PY2 = Util.clamp(s4PY2, S4_WALK_TOP, S4_WALK_BOT - 1);

    /* Walking into food grabs it too. */
    if (!convVisible) {
      const _walkHit = _s4FindItemAt(Math.round(s4PX2), Math.round(s4PY2));
      if (_walkHit) _s4DoGrab(_walkHit.it, _walkHit.ix, _walkHit.aY);
    }

    /* Exit works via walk or click. */

    if (s4ExitPinned) {
      if (Math.abs(s4PX2 - s4ExitScreenX) < 5) s4TryExit();
    }

    const worldPX = s4WX + s4PX2;
    for (let i = s4Gs.length - 1; i >= 0; i--) {
      const g = s4Gs[i];

      {
        const _gsxA = Math.round(g.wx - s4WX);
        if (!g.announced && _gsxA < W - 2 && _gsxA > 0) {
          g.announced = true;
          g.announceT = 2400;
          audio.play("security");
        }
        if (g.announceT > 0) g.announceT -= dt;
      }

      if (g.defector) {
        g.defectorT += dt;
        const gsxNow = Math.round(g.wx - s4WX);

        if (g.defectorState === "approaching") {

          const _pwx4 = s4WX + s4PX2;

          /* Chases the player, ramping up speed. */
          if (g.announced) g.chaseT += dt;
          const _speedMul = 1 + Math.min(g.chaseT / 8000, 2.5);
          const _baseSpeed = Math.abs(g.vx) || 0.006;
          const _dx = _pwx4 - g.wx,
            _dy = s4PY2 - g.wy;
          const _dist = Math.hypot(_dx, _dy) || 1;
          const _moveAmt = Math.min(_dist, _baseSpeed * _speedMul * dt);
          g.wx += (_dx / _dist) * _moveAmt;
          g.wy += (_dy / _dist) * _moveAmt;

          const _metPlayer = Math.abs(g.wx - _pwx4) < 4 && Math.abs(g.wy - s4PY2) < 4;

          const _readyToMeet = s4HasGrabbed || s4GT > 6;
          if (_metPlayer && _readyToMeet) {
            g.defectorState = "speaking";
            g.defectorT = 0;
            /* Nudge down, avoid clipping the dialogue box. */
            s4PY2 = Math.max(s4PY2, S4_WALK_TOP + 6);
            /* Snaps adjacent, always to player's right. */
            g.wy = s4PY2;
            g.wx = _pwx4 + 2;
            const _snapSX = Math.round(g.wx - s4WX);
            g.lockedScreenX = _snapSX;
            // Same tap-to-advance panel as Act 2.
            convReset();
            convAnchorPX = Math.round(s4PX2);
            convAnchorNX = _snapSX;
            convAnchorY = Math.round(s4PY2);
            convPlayerColor = C_PLAYER;
            convNPCColor = g.col || C_DANGER; // Still in uniform for these lines.
            convVisible = true;
            convAddLine(window.LANG.act6DefectorLine1 || "hold it right there!", "them", g.col || C_DANGER);
            g.convStep = 0;
            g.convStepT = 0;
            // Light touch, not a penalty.
            audio.play("bump");
            spark(Math.round(s4PX2), Math.round(s4PY2), g.col || C_DANGER, 6);
          }
        } else if (g.defectorState === "speaking") {
          /* Pins to fixed screen X via scroll. */
          if (g.lockedScreenX !== undefined) {
            g.wx = s4WX + g.lockedScreenX;
          }
          convAnchorPX = Math.round(s4PX2);
          convAnchorNX = gsxNow;
          convAnchorY = Math.round(s4PY2);

          g.convStepT += dt;
          // Guards against stale banked clicks.
          const _convTapReady = g.convStepT > 300;
          if (!_convTapReady && clickPending) clickPending = false;
          const _tapped = _convTapReady && (clickPending || input.justPressed("action"));
          if (_tapped) {
            clickPending = false;
            if (g.convStep === 0) {
              convAddLine(window.LANG.act6DefectorPlayerLine || "you gonna tase me over a bag of pasta?", "you", C_PLAYER);
              g.convStep = 1;
              g.convStepT = 0;
            } else if (g.convStep === 1) {
              convAddLine(window.LANG.act6DefectorLine2 || "uh", "them", g.col || C_DANGER);
              g.convStep = 2;
              g.convStepT = 0;
            } else if (g.convStep === 2) {
              convAddLine(window.LANG.act6DefectorPlayerLine2 || "local hero defends $2 rigatoni to the death?", "you", C_PLAYER);
              g.convStep = 3;
              g.convStepT = 0;
            } else if (g.convStep === 3) {
              convAddLine(window.LANG.act6DefectorLine3 || "ugh they don't pay me enough for this", "them", g.col || C_DANGER);
              g.convStep = 4;
              g.convStepT = 0;
            } else if (g.convStep === 4) {
              convAddLine(window.LANG.act6DefectorPlayerLine3 || "so?", "you", C_PLAYER);
              g.convStep = 5;
              g.convStepT = 0;
            } else if (g.convStep === 5) {
              convAddLine(window.LANG.act6DefectorLine4 || "so the good pasta is two aisles over", "them", g.col || C_DANGER);
              g.convStep = 6;
              g.convStepT = 0;
            } else if (g.convStep === 6) {
              convAddLine(window.LANG.floatGuardDefects || "c'mon. I'll show you", "them", g.col || C_DANGER);
              g.convStep = 7;
              g.convStepT = 0;
            } else if (g.convStep === 7) {
              convStartFade();
              g.defectorState = "recruited";
              s4DefectorDone = true; // Unlocks shopper spawns after this beat.
              audio.play("recruit");
              burstGood(gsxNow, Math.round(g.wy), C_TEAL, 12);
              triggerFlashGood();
              const defectorArt = [HAT_CHAR, "§"];
              const defectorEntry = {
                b: Math.random() * 6,
                ru: 0,
                art: defectorArt,

                col: C_TEAL,
                _hatColor: HAT_COLOR,
                isDefector: true,
              };
              a2Crew.push(defectorEntry);
              const newAlly = {
                oy: Util.randInt(-4, 4),
                bobPhase: Math.random() * 6,
                grabCD: 0,
                targetY: Math.round(g.wy),
                followY: Math.round(g.wy),
                followX: gsxNow,
                wanderT: 0,
                wanderXT: 0,
                xOffset: -(9 + s4Alys.length * 5),
                dodgeY: 0,
              };
              s4Alys.push(newAlly);
              a2CrewCount++;
              s4Gs.splice(i, 1);
              continue;
            }
          }
        }
        /* Skips normal movement for defector. */
        continue;
      }
      if (convVisible) continue; // Freezes other guards during conversation.

      g.wx += g.vx * dt;
      /* Guards scroll with world, plus own motion. */
      const gsx = Math.round(g.wx - s4WX);
      if (gsx < -10) {
        s4Gs.splice(i, 1);
        continue;
      }
      if (s4St2 <= 0 && Math.abs(g.wx - worldPX) < 2 && Math.abs(g.wy - s4PY2) < 2) {
        audio.play("guardCollide");
        spark(Math.round(s4PX2), Math.round(s4PY2), C_DANGER, 10);
        triggerChromatic(380);
        state.set("score", Math.max(0, state.get("score") - 20));
        s4St2 = 500; // Short stun keeps keyboard responsive.
        Banner.show(window.LANG.bannerSecurityGrabbed, C_DANGER, 1000, true);


        const _gcx = Math.round(s4PX2);
        const _gcy = Math.round(s4PY2);
        Effects.start("corrupt", {
          x: _gcx,
          y: _gcy,
          radius: 12,
          duration: 700,
          intensity: 1.0,
          swap: true,
        });
      }
    }

    s4ShopperT += dt;
    if (!convVisible && s4DefectorDone && s4ShopperT > 9000 + Math.random() * 4000 && s4Shoppers.length < 1) {
      s4ShopperT = 0;
      const spawnWX = s4WX + W + 5;
      if (!s4Shoppers.some((s) => Math.abs(s.wx - spawnWX) < 25)) {
        s4Shoppers.push({
          wx: spawnWX,
          wy: S4_AISLE_Y + Util.randInt(-2, 0),
          vx: -0.002 - Math.random() * 0.002,
          art: Util.pick(window.GAME_DATA.npcArts),
          col: Util.pick(window.GAME_DATA.npcColors),
          msgT: 0,
          reacted: false,
        });
      }
    }
    for (let i = s4Shoppers.length - 1; i >= 0 && !convVisible; i--) {
      const sh = s4Shoppers[i];
      sh.wx += sh.vx * dt;
      if (Math.round(sh.wx - s4WX) < -6) {
        s4Shoppers.splice(i, 1);
        continue;
      }
      if (!sh.reacted && Math.abs(sh.wx - worldPX) < 6 && Math.abs(sh.wy - s4PY2) < 4) {
        sh.reacted = true;
        sh.msgT = 1600;
        sh.msg = Util.pick(window.LANG.act6ShopperGasps);
        playBank(["shopperBump1", "shopperBump2", "shopperBump3"]);
      }
      if (sh.msgT > 0) sh.msgT -= dt;
    }
    const INTERCOM_INTERVAL_MS = 28000;
    const INTERCOM_MAX_FIRES = 3;
    if (
      s4TickerFireCount < INTERCOM_MAX_FIRES &&
      Math.floor((s4GT * 1000) / INTERCOM_INTERVAL_MS) > Math.floor((s4GT * 1000 - dt) / INTERCOM_INTERVAL_MS)
    ) {
      s4TickerMsg = D_INTERCOM_TICKER[s4TickerNextIdx % D_INTERCOM_TICKER.length];
      s4TickerNextIdx++;
      s4TickerFireCount++;

      audio.play("storeAnnounce");
      Banner.show(s4TickerMsg, "#3fd8ff", 2200, true);
    }

    if (s4ExitPinned && Banner.timer <= 0 && s4GT > 25 && Math.floor(s4GT / 25) > Math.floor((s4GT - dt / 1000) / 25)) {
      Banner.show(window.LANG.bannerExitOpen, C_TEAL, 2500, true);
    }

    const my = state.get("score");
    _updateDomHud();
  }
  function renderAct6(opts = {}) {
    const ox = Math.floor(s4WX);
    const _defectorTalking = s4Gs.some((g) => g.defector && g.defectorState === "speaking");
    const _defectorRed = dullColor(C_DANGER, 0.5);
    for (const bc of s4Bookcases) {
      const sx = Math.round(bc.wx - s4WX);
      if (sx + S4_BC_W < -1 || sx > W + 1) continue;
      grid.text("\u2500".repeat(S4_BC_W), sx, S4_ABOVE_TOP, "#444");
      grid.text("\u2500".repeat(S4_BC_W), sx, S4_BELOW_TOP - 1, "#444");
      for (let row = 0; row < S4_SHELF_ROWS; row++) {
        const rY = _s4RowY(row);
        const sY = rY + S4_SHELF_ROW_H - 1;
        for (const it of bc.items) {
          if (it.row !== row) continue;
          const ix = sx + 1 + it.col * S4_SLOT_W + 1;
          if (it.grabbed) {
            if (it.grabT > 0) drawGrabAnim(it, ix, rY);
            continue;
          }
          const aH = it.food.a.length;

          const _hov = _mouseSX >= ix - 1 && _mouseSX < ix + S4_SLOT_W && _mouseSY >= rY && _mouseSY <= rY + aH;
          grid.art(it.food.a, ix, rY, _defectorTalking ? _defectorRed : _hov ? brightenColor(it.color, 0.8) : it.color, false, _hov);
        }
        for (let col = 1; col < S4_COLS; col++) {
          const vx = sx + 1 + col * S4_SLOT_W;
          for (let y = rY; y <= sY; y++) grid.set(vx, y, "\u2502", "#444");
        }
        grid.text("\u2500".repeat(S4_BC_W), sx, sY, "#444");
      }
    }

    if (s4ExitPinned) {
      const exSX = s4ExitScreenX;
      const _ef = Math.floor(Date.now() / 800) % 2 === 0;
      const _exitCol = C_TEAL;
      const _dimCol = "#1a5a4a";

      const _label = window.LANG.act6ExitLabel;
      const archTop = Math.min(S4_ABOVE_BOT + 1, S4_AISLE_Y);
      const archBot = Math.max(S4_BELOW_TOP - 2, S4_AISLE_Y);
      const archW = Math.ceil(_label.length / 2) + 1; // Width hugs label, not fixed.
      const lx = exSX - archW;
      const rx = exSX + archW;

      for (let y = archTop; y <= archBot; y++) {
        for (let x = lx + 1; x < rx; x++) {
          if (x >= 0 && x < W) grid.set(x, y, " ", null);
        }
      }

      for (let x = lx; x <= rx; x++) {
        if (x >= 0 && x < W) grid.set(x, archTop, "\u2550", _exitCol);
      }
      if (lx >= 0 && lx < W) grid.set(lx, archTop, "\u2554", _exitCol);
      if (rx >= 0 && rx < W) grid.set(rx, archTop, "\u2557", _exitCol);

      for (let y = archTop + 1; y < archBot; y++) {
        if (lx >= 0 && lx < W) grid.set(lx, y, "\u2551", _exitCol);
        if (lx + 1 >= 0 && lx + 1 < W) grid.set(lx + 1, y, "\u2502", _dimCol);
        if (rx >= 0 && rx < W) grid.set(rx, y, "\u2551", _exitCol);
        if (rx - 1 >= 0 && rx - 1 < W) grid.set(rx - 1, y, "\u2502", _dimCol);
      }

      grid.text(_label, exSX - Math.floor(_label.length / 2), archTop + 2, _ef ? "#fff" : _exitCol);
    }

    for (const sh of s4Shoppers) {
      const shx = Math.round(sh.wx - s4WX),
        shy = Math.round(sh.wy);
      if (shx < -3 || shx > W + 3) continue;
      grid.art(["▬▬", "oo"], shx - 3, shy, "#666"); // Cart shape: rectangle plus wheels.
      grid.art(sh.art, shx, shy, sh.col);
      if (sh.msgT > 0 && sh.msg) {
        const _shTxt = sh.msg;
        grid.text(_shTxt, Util.clamp(shx - Math.floor(_shTxt.length / 2), 0, W - _shTxt.length), Math.max(0, shy - 1), sh.col);
      }
    }

    _s4GuardBubble = null;
    for (const g of s4Gs) {
      const sx = Math.round(g.wx - s4WX),
        sy = Math.round(g.wy);
      if (sx < -3 || sx > W + 3) continue;
      const _guardFlash = Math.floor(Date.now() / 400) % 2 === 0;
      const _guardLeg = Math.floor(Date.now() / 200 + g.wx * 0.3) % 2 === 0 ? "\u03C6" : "\u20B3";
      grid.art([_guardFlash ? "\u00A7" : "!", _guardLeg], sx, sy, g.col || C_DANGER);

      if (g.announceT > 0 && !(g.defector && g.defectorState === "speaking")) {
        _s4GuardBubble = { sx, sy, line: window.LANG.act6SecurityArrives || "SECURITY! stop right there!", col: g.col || C_DANGER };
      }
    }

    if (!opts.skipPlayerCrew) {
      for (let i = 0; i < s4Alys.length; i++) {
        const al = s4Alys[i];
        const src = a2Crew[i];
        const isCat = src && src.isCat;
        const baseDist = 9 + i * 5; // Spacing increases per trailing robin.
        let rx, ry, _a4RFrame;
        const rArt = (src && src.art) || A2_ROB;
        const rCol = (src && src.col) || C_TEAL;
        if (al.targetY === undefined) {
          al.targetY = s4PY2 + al.oy * 1.2;
          al.followY = al.targetY;
          al.followX = s4PX2 - baseDist;
          al.wanderT = Math.random() * 4000;
          al.wanderXT = Math.random() * 3000;
          al.xOffset = -baseDist + (Math.random() - 0.5) * 4;
          al.dodgeY = 0;
        }
        al.wanderT += 16;
        al.wanderXT += 16;
        if (al.wanderT > 2500 + Math.random() * 2000) {
          al.wanderT = 0;
          al.targetY = Util.clamp(s4PY2 + (Math.random() - 0.5) * 10, S4_WALK_TOP, S4_WALK_BOT - 1);
        }
        if (al.wanderXT > 1800 + Math.random() * 2200) {
          al.wanderXT = 0;
          al.xOffset = -baseDist + (Math.random() - 0.5) * 6;
        }
        let nearestGuard = null;
        let nearestGuardDist = 999;
        for (const g of s4Gs) {
          const gScreenX = g.wx - s4WX;
          const gdx = Math.abs(gScreenX - al.followX);
          const gdy = Math.abs(g.wy - al.followY);
          /* Wide window gives reaction time. */
          if (gdx < 10 && gdy < 3 && gdx < nearestGuardDist) {
            nearestGuard = g;
            nearestGuardDist = gdx;
          }
        }
        if (nearestGuard) {
          if (al.dodgeY === 0) {
            /* Dodges toward side with more room. */
            const guardScreenY = nearestGuard.wy;
            const upRoom = guardScreenY - S4_WALK_TOP;
            const downRoom = S4_WALK_BOT - guardScreenY;
            const dodgeAmount = 2 + Math.floor(Math.random() * 2); // 2 or 3 cells
            al.dodgeY = upRoom > downRoom ? -dodgeAmount : dodgeAmount;
          }
        } else {
          al.dodgeY = al.dodgeY * 0.92;
          if (Math.abs(al.dodgeY) < 0.05) al.dodgeY = 0;
        }
        const playerPullY = 0.003;
        const wanderPullY = 0.02;
        const effectiveTargetY = al.targetY + al.dodgeY;
        const dodgeUrgency = nearestGuard && nearestGuardDist < 5 ? 0.35 : nearestGuard ? 0.12 : wanderPullY;
        al.followY = Util.lerp(al.followY, effectiveTargetY, dodgeUrgency);
        if (!nearestGuard) {
          al.followY = Util.lerp(al.followY, s4PY2 + al.dodgeY, playerPullY);
        }
        al.followY = Util.clamp(al.followY, S4_WALK_TOP, S4_WALK_BOT - 1);
        const targetX = s4PX2 + al.xOffset;
        al.followX = Util.lerp(al.followX, targetX, 0.015);
        if (isCat) {
          // Cat prowls, no bob or toggle.
          const prowl = Math.sin(s4GT * 2.5 + al.bobPhase) * 1.4;
          rx = Math.round(al.followX + prowl);
          ry = Math.round(al.followY);
          _a4RFrame = [...rArt];
        } else {
          const xDrift = Math.sin(s4GT * 1.5 + al.bobPhase * 1.3) * 1.2;
          rx = Math.round(al.followX + xDrift);
          const yBob = Math.sin(s4GT * 2.5 + al.bobPhase) * 0.8;
          ry = Math.round(al.followY + yBob);
          _a4RFrame = [...rArt];
          _a4RFrame[1] = Math.floor((s4GT * 1000) / 200 + i * 1.7) % 2 === 0 ? _a4RFrame[1] : "\u20B3";
        }
        if (rx >= 0 && rx < W && ry >= S4_WALK_TOP && ry <= S4_WALK_BOT) {
          grid.art(_a4RFrame, rx, ry, rCol, isCat); // isCat forces forward-facing art always.
        }
      }

      if (s4St2 <= 0 || Math.floor(s4St2 / 80) % 2 === 0) {
        // Flashes warn color when urgency high.
        let pc = s4Ug > 0.7 ? (Math.floor(Date.now() / 200) % 2 ? C_WARN : C_PLAYER) : playerPulseColor(s4GT * 1000);
        const _a4PFrame = [...(A2_PA[Math.floor(s4GT * 4) % 2] || A2_PA[0])];
        _a4PFrame[1] = Math.floor((s4GT * 1000) / 180) % 2 === 0 ? _a4PFrame[1] : "\u20B3";
        grid.art(_a4PFrame, Math.round(s4PX2), Math.round(s4PY2), pc);
      }
    }

    if (_s4GuardBubble) {
      const { sx, sy, line, col: _bubbleCol = C_TEAL } = _s4GuardBubble;
      const _maxInner = Math.min(20, W - 6);
      const _words = line.split(" ");
      const _lines = [];
      let _cur = "";
      for (const _w of _words) {
        if (_cur.length + _w.length + 1 > _maxInner) {
          _lines.push(_cur);
          _cur = _w;
        } else _cur = _cur ? _cur + " " + _w : _w;
      }
      if (_cur) _lines.push(_cur);
      const _lineW = Math.max(..._lines.map((l) => l.length));
      const _bw = _lineW + 4;
      const _bh = _lines.length + 2;
      const _bx = Util.clamp(sx - Math.floor(_bw / 2) + 1, 0, W - _bw);
      const _by = Math.max(0, sy - _bh - 1);
      for (let _y = _by; _y < _by + _bh && _y < H; _y++)
        for (let _x = _bx; _x < _bx + _bw && _x < W; _x++) if (_x >= 0) grid.set(_x, _y, " ", null);
      grid.text(DIALOG_BOX.tl + DIALOG_BOX.h.repeat(_bw - 2) + DIALOG_BOX.tr, _bx, _by, _bubbleCol);
      for (let _li = 0; _li < _lines.length; _li++) {
        grid.text(DIALOG_BOX.v + " ".repeat(_bw - 2) + DIALOG_BOX.v, _bx, _by + 1 + _li, _bubbleCol);
        const _pad = Math.floor((_lineW - _lines[_li].length) / 2);
        grid.text(_lines[_li], _bx + 2 + _pad, _by + 1 + _li, _bubbleCol);
      }
      grid.text(DIALOG_BOX.bl + DIALOG_BOX.h.repeat(_bw - 2) + DIALOG_BOX.br, _bx, _by + 1 + _lines.length, _bubbleCol);
    }

    if (s4Ug > 0.5) {
      const bc = Math.floor(Date.now() / 300) % 2 ? C_DANGER : "#a00";
      for (let x = 0; x < W; x++) {
        grid.set(x, 0, "\u2550", bc);
        grid.set(x, H - 1, "\u2550", bc);
      }
      for (let y = 0; y < H; y++) {
        grid.set(0, y, "\u2551", bc);
        grid.set(W - 1, y, "\u2551", bc);
      }
      grid.textCenter([window.LANG.urgencyCopsEnRoute, window.LANG.urgencyFindExit][Math.floor(Date.now() / 800) % 2], 0, C_DANGER);
    }

    popupRender();


    if (!convVisible && !s4HasGrabbed && s4GT > 2) {
      renderTapPrompt(ctrl("act6Grab"), H - 2, "#fff", C_PLAYER, true);
    }

    if (convVisible) {
      const _defector = s4Gs.find((gg) => gg.defector);
      if (_defector && _defector.convStepT > 5000) {
        renderTapPrompt(ctrl("tapToContinueConv"), H - 2, "#fff", C_PLAYER);
      }
    }

    Banner.render();
    // Same panel system as Act 2.
    convRender();
  }

  function _transitionAct6ExitToAct6Run() {
    const cx = s4ExitScreenX;
    const cy = S4_AISLE_Y;
    let _pool = null;
    runActBoundary({
      outro: (done) =>
        collapseToCenter(
          (pool) => {
            // migrates left before the burst
            driftBlob(
              (newPool) => {
                _pool = newPool;
                done();
              },
              { pool, fromCx: cx, fromCy: cy, toCx: Math.floor(W * 0.35), toCy: cy, growFrom: 1, growTo: 2.6, durMs: 950 },
            );
          },
          { cx, cy, spread: Math.max(10, Math.min(Math.floor(H * 0.55), Math.floor(W * 0.6))) },
        ),
      setupNext: initAct6Run,
      intro: (done) =>
        riseFromPile(done, {
          spawnPool: _pool,
          holdMs: 0,
          peppersMs: 300,
          jitterMs: 500,
          flyMsMin: 600,
          flyMsMax: 1000,
          simmer: true,
          colorOnLand: true,
        }),
    });
  }

  function _transitionAct6RunToAct8() {
    let _pool = null;
    runActBoundary({
      outro: (done) => {
        // captures pixels directly, no blob
        render(true);
        const pool = [];
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) {
            const c = grid.c[y][x];
            if (c.ch !== " ") pool.push({ x, y, ch: c.ch, co: c.co });
          }
        _pool = pool;
        setTimeout(done, 350); // brief hold before the pieces reorganize
      },
      setupNext: initAct8,
      intro: (done) =>
        riseFromPile(done, {
          spawnPool: _pool,
          peppersMs: 300,
          jitterMs: 500,
          flyMsMin: 800,
          flyMsMax: 1400,
          wobAmpMin: 1.5,
          wobAmpMax: 4,
          wobFreqMin: 2,
          wobFreqMax: 6,
          simmer: true,
          colorOnLand: true,
        }),
    });
  }
