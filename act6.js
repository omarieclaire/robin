
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
        const cellW = r.width / W; // actual pixel width per cell
        const cellH = r.height / H; // actual pixel height per cell
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
    if (phase === "act3") a2PY = a2RuY(a2PRu); // settle onto the exact lane row
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
          // iOS Safari sometimes drops pointercancel/up — recover after 2s of silence.
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
        // Engage holding as soon as finger moves half a cell
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
    if (convVisible) return; // don't let a drag move the player mid-conversation

    const r = gs.getBoundingClientRect();
    const cellW = r.width / W;
    const cellH = r.height / H;

    // Delta from last frame position — player mirrors finger movement exactly
    const dxPx = _mob.currentX - _mob.lastX;
    const dyPx = _mob.currentY - _mob.lastY;
    _mob.lastX = _mob.currentX;
    _mob.lastY = _mob.currentY;

    const dxCells = dxPx / cellW;
    const dyCells = dyPx / cellH;

    if (phase === "act3") {
      a2PX = Util.clamp(a2PX + dxCells, 4, W - 6);
      // Track the finger continuously (was snapping to lane every frame).
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
      // Horizontal finger drag scrolls the world; vertical moves the player in the lane.
      a2bWX += dxCells * 0.7;
      a2bPY += dyCells;
      a2bPY = Util.clamp(a2bPY, A2B_ROAD_Y1, a2bBotBoundAt(a2bWX + a2bPX));
    } else if (phase === "act6") {
      s4PX2 += dxCells;
      s4PY2 += dyCells;
      s4PY2 = Util.clamp(s4PY2, S4_WALK_TOP, S4_WALK_BOT - 1);
      s4PX2 = Util.clamp(s4PX2, 4, W - 6);
    } else if (phase === "act7") {
      s4RunPX += dxCells;
      s4RunPY += dyCells;
      s4RunPY = Util.clamp(s4RunPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
      s4RunPX = Util.clamp(s4RunPX, 4, W - 6);
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
  // ── END UNIFIED MOBILE CONTROLS ───────────────────────────────

  /* ══════════════════════════════════════════════════════════
               ACT 6: THE HEIST — side-scrolling grocery grab
               ══════════════════════════════════════════════════════════ */
  // Vibrant palette, matches Act 8's fridge (FC5).
  const FC = ["#f5b800", "#e8724a", "#5ec44a", "#4ac9e8", "#c65ce8", "#e8475c", "#8ee85c", "#f0a030", "#5c8ee8"];
  // Narc uniform palette, matches act3.js's narcCols.
  const S4_NARC_COLS = ["#ffdede", "#d9ffe5", "#dad7ff", "#fffbe0", "#ffe8d9"];
  const S4_BC_W = 20,
    S4_SLOT_W = 9,
    S4_BC_GAP = -1;
  // Grab flourish: squash toward the shelf, then yank up and fade.
  const S4_GRAB_ANIM_MS = 220,
    S4_GRAB_SQUASH_MS = 70;
  function drawGrabAnim(it, ix, rY) {
    const rows = it.food.a.length;
    const elapsed = S4_GRAB_ANIM_MS - it.grabT;
    if (elapsed < S4_GRAB_SQUASH_MS) {
      // Squash — compress and flash bright.
      const p = elapsed / S4_GRAB_SQUASH_MS;
      const keep = Math.max(1, Math.round(rows * (1 - 0.5 * p)));
      grid.art(it.food.a.slice(rows - keep), ix, rY + (rows - keep), brightenColor(it.color, 0.55 * p));
    } else {
      // Yank — rockets up, ease-in, fades to near-black.
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
  let s4Shoppers; // aisle bystanders — no hazard, just surprised reactions
  let s4DefectorDone; // gate: shoppers only enter after the guard defects
  let _s4GuardBubble = null; // guard speech, deferred so it draws over all sprites
  let s4ShopperT = 0; // cadence timer for post-conversion shopper arrivals
  let s4Alys, s4GE;
  let s4ExitPinned;
  let s4HasGrabbed;
  let s4LastGrabT;
  /* Combo system: consecutive grabs within window = multiplier */

  let s4GrabBursts;
  let s4TickerMsg, s4TickerNextIdx;
  /* ── LAYOUT — one aisle, shelving above/below ── */
  let S4_SHELF_ROWS /* total shelf rows */,
    S4_SHELF_ROW_H /* height per shelf row */,
    S4_ROWS_ABOVE /* rows above the aisle */,
    S4_ROWS_BELOW /* rows below the aisle */,
    S4_AISLE_Y /* aisle spine Y, exit anchor */,
    S4_ABOVE_TOP /* top edge, upper shelf block */,
    S4_ABOVE_BOT /* bottom edge, upper shelf block */,
    S4_BELOW_TOP /* Y, lower block's first row */,
    S4_BELOW_BOT /* bottom edge, lower shelf block */,
    S4_WALK_TOP /* topmost walkable Y */,
    S4_WALK_BOT; /* bottommost walkable Y */

  let s4ExitScreenX; /* exit's fixed screen X */

  /* Items on shelves */
  let s4Items, s4Bookcases, s4RobinFloats;

  /* Row index to screen Y, above/below aisle. */
  function _s4RowY(row) {
    if (row < S4_ROWS_ABOVE) return S4_ABOVE_TOP + 1 + row * S4_SHELF_ROW_H;
    return S4_BELOW_TOP + (row - S4_ROWS_ABOVE) * S4_SHELF_ROW_H;
  }

  function s4GenBookcases(from, to) {
    const ns = Math.floor((S4_BC_W - 2) / S4_SLOT_W);
    let bx = s4Bookcases.length > 0 ? Math.max(from, s4Bookcases[s4Bookcases.length - 1].wx + S4_BC_W + S4_BC_GAP) : from;
    // Shared shuffled bag — drawn down across rows and bookcases.
    if (!s4FoodBag) s4FoodBag = { deck: [], last: null };
    const drawFood = (forbidden) => {
      // Refill the bag if empty
      if (s4FoodBag.deck.length === 0) {
        s4FoodBag.deck = Util.shuffle(FOODS.slice());
      }
      // If the top card is forbidden (would repeat a neighbor), swap with a deeper card
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
      // Track what's directly above each column to avoid vertical repeats at bag seams
      const above = new Array(ns).fill(null);
      // Peek at rightmost column of previous bookcase to avoid horizontal seam repeats
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
    audio.play("level");
    Music.transition("music_act6"); // heist music
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
    s4UR = Math.max(0.004, 0.012 - a2CrewCount * 0.0003); // slower = longer scene ~50s base
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
    s4ExitScreenX = W - 7; /* room for wider arch */
    s4GrabBursts = []; /* per-grab starburst effects */
    s4HasGrabbed = false;
    s4LastGrabT = 0;

    /* ── Layout: one aisle, shelving above/below ── */
    S4_SHELF_ROW_H = 5;

    S4_SHELF_ROWS = H >= 40 || (Device.isMobile && H >= 38) ? 6 : 5;
    S4_ROWS_ABOVE = Math.ceil(S4_SHELF_ROWS / 2);
    S4_ROWS_BELOW = S4_SHELF_ROWS - S4_ROWS_ABOVE;
    // Padding matches other acts (A2_TOP_PAD, A2_GND).
    S4_ABOVE_TOP = Math.max(2, Math.floor(H * 0.06));
    S4_WALK_BOT = H - 1;
    S4_WALK_TOP = S4_ABOVE_TOP;
    S4_BELOW_BOT = S4_WALK_BOT;
    S4_BELOW_TOP = S4_BELOW_BOT - S4_ROWS_BELOW * S4_SHELF_ROW_H + 1;
    S4_ABOVE_BOT = S4_ABOVE_TOP + S4_ROWS_ABOVE * S4_SHELF_ROW_H;
    S4_AISLE_Y = Math.floor((S4_ABOVE_BOT + S4_BELOW_TOP) / 2);
    /* ── Generate initial bookcases ── */
    s4Items = [];
    s4Bookcases = [];
    s4FoodBag = null;
    s4GE = 0;
    s4GenBookcases(0, W + 80);

    /* ── Player starts on the aisle ── */
    s4PX2 = Math.floor(W * 0.5);
    s4PY2 = S4_AISLE_Y;


    s4Gs = [];
    s4Shoppers = [];
    const numG = 1;
    const GUARD_MIN_GAP = 35; // minimum world-x gap between guards at spawn
    const GUARD_MIN_LANE_GAP = 3; // minimum y-distance between guards' lanes
    let lastGuardWX = s4WX + W;
    for (let i = 0; i < numG; i++) {
      const wx = lastGuardWX + GUARD_MIN_GAP + Util.randInt(0, 25);
      /* Pick a y that's not too close to any existing guard's y */
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
    /* Pick one guard to defect — chosen at spawn but indistinguishable until trigger */
    if (s4Gs.length > 0) {
      const defIdx = Util.randInt(0, s4Gs.length - 1);
      s4Gs[defIdx].defector = true;
      s4Gs[defIdx].defectorState = "approaching"; // approaching → speaking → recruited
      s4Gs[defIdx].defectorT = 0;
      s4Gs[defIdx].chaseT = 0;
    }
    s4DefectorDone = false;
    s4ShopperT = 0;

    /* ── Ally robins — trail behind player in the aisle ── */
    s4Alys = [];
    const ac = Math.min(a2CrewCount, 6);
    for (let i = 0; i < ac; i++) {
      s4Alys.push({
        behindDist: 5 + i * 4,
        oy: Util.randInt(-2, 2),
        bobPhase: Math.random() * 6,
        grabCD: 0,
      });
    }

    /* Robin grab timer — crew hauls from OFFSCREEN stock only. */
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

    /* ── Remaining state ── */

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
  }

  /* ══════════════════════════════════════════════════════════
   ACT 6 EXIT:
   ══════════════════════════════════════════════════════════ */
  let s4ExitT, s4ExitDone, s4ExitDoneAt, s4ExitTargetX, s4ExitCrewX;
  function initAct6Exit() {
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
    audio.preload(["music_act4"]);
    Banner.show(window.LANG.bannerEscaped, C_TEAL, 1500);
  }

  function updateAct6Exit(dt) {
    s4ExitT += dt;
    Banner.update(dt);

    // Keep the world scrolling so shelves don't freeze
    s4WX += s4Sp * dt;
    while (s4GE < s4WX + W + 80) s4GenBookcases(s4GE, s4GE + 80);
    s4Bookcases = s4Bookcases.filter((bc) => bc.wx + S4_BC_W > s4WX - 20);

    s4PX2 = Util.lerp(s4PX2, s4ExitTargetX, 0.15);
    s4PY2 = Util.lerp(s4PY2, S4_AISLE_Y, 0.12);

    // Crew converges on door — staggered start so they flow in one by one
    let allIn = true;
    for (let i = 0; i < s4ExitCrewX.length; i++) {
      const c = s4ExitCrewX[i];
      const delay = i * 150;
      if (s4ExitT < delay) {
        allIn = false;
        continue;
      }
      c.x = Util.lerp(c.x, s4ExitTargetX, 0.06);
      c.y = Util.lerp(c.y, S4_AISLE_Y, 0.06);
      if (Math.abs(c.x - s4ExitTargetX) > 1 || Math.abs(c.y - S4_AISLE_Y) > 1) allIn = false;
    }

    // Guards aggressively chase toward the door — they realize what's happening
    for (const g of s4Gs) {
      const dxToDoor = s4ExitTargetX - (g.wx - s4WX);
      g.wx += dxToDoor > 0 ? 0.012 * dt : 0;
      g.wy = Util.lerp(g.wy, S4_AISLE_Y, 0.04);
    }

    // Burst of teal sparks at door, occasionally
    if (s4ExitT > 1500 && s4ExitT < 4000 && Math.random() < 0.12) {
      spark(s4ExitTargetX + Util.randInt(-2, 2), S4_AISLE_Y, C_TEAL, 6);
    }

    // Transition once all crew have reached the door — identical to Act 5
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

  /* ══════════════════════════════════════════════════════════
   ACT 7: crew runs back to community fridge through the
   neighbourhood 
   ══════════════════════════════════════════════════════════ */

  // Pacing ramp — gradual from frame 0, climbing to a capped cruise speed.
  const S4RUN_BASE_SPD = 0.008,
    S4RUN_MAX_SPD = 0.02,
    S4RUN_RAMP_MS = 8000,
    S4RUN_TOTAL_MS = 26000;
  let s4RunT, s4RunSpd, s4RunWX, s4RunFridgeX, s4RunDone, s4RunPX, s4RunPY, s4RunGiveupAt, s4RunGiveupFast, s4RunHits, s4RunHitCooldown;
  let s4RunAlignX, s4RunAlignY; // where the player glides to on arrival — exactly in front of the fridge
  let s4RunCoins;
  let s4RunTopParts, s4RunBotParts, s4RunKiosks, s4RunBannerShown;
  let s4RunCops, s4RunBystanders, s4RunSparkleT, s4RunTriumphShown;
  let s4RunParade; // bystanders who joined the run — screen-space tail members behind the crew
  function initAct6Run() {
    phase = "act7";
    Music.transition("music_act4"); // run-home music starts now
    audio.preload(["music_act8"]); // pre-warm act8 drop-off music
    a2bCalcLayout(); // reuse Act 4 layout helpers
    s4RunT = 0;
    s4RunSpd = S4RUN_BASE_SPD; // starts slow, ramps up
    s4RunWX = 0;
    s4RunDone = false;
    s4RunBannerShown = false;
    s4RunTriumphShown = false;
    s4RunGiveupAt = undefined;
    s4RunGiveupFast = false;
    s4RunHits = 0;
    s4RunHitCooldown = 0;
    s4RunPX = Math.floor(W * 0.28); // room to see cops coming
    s4RunPY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    // World distance to fridge = integral of the ramp over its duration.
    const _rampDist = ((S4RUN_BASE_SPD + S4RUN_MAX_SPD) / 2) * S4RUN_RAMP_MS;
    const _cruiseDist = S4RUN_MAX_SPD * (S4RUN_TOTAL_MS - S4RUN_RAMP_MS);
    s4RunFridgeX = Math.floor(_rampDist + _cruiseDist);
    s4RunTopParts = a2bGenRow(s4RunFridgeX + W);
    s4RunBotParts = a2bGenRow(s4RunFridgeX + W);
    // Give each building part a muted starting color; brightened as player passes
    for (const sp of s4RunTopParts) {
      sp._passedCol = null;
      sp._glitched = false;
    }
    for (const sp of s4RunBotParts) {
      sp._passedCol = null;
      sp._glitched = false;
    }

    // Mid-road blocks to weave around, like Act 4.
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
        for (let kx = 40; kx < s4RunFridgeX - 30; ) {
          const seg = _mkSeg(kx);
          if (kx + seg.w > s4RunFridgeX - 30) break;
          s4RunKiosks.push(seg);
          kx += seg.w + 1 + Util.randInt(10, 15);
        }
        s4RunKiosks.push(_mkSeg(s4RunFridgeX + 25)); // world keeps going past it
      }
    }


    s4RunCops = [];
    const numCops = 5;
    const midY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    for (let i = 0; i < numCops; i++) {
      s4RunCops.push({
        wx: Math.max(0, s4RunPX - 3 - i * 2), // right behind, on-screen
        wy: midY + Util.randInt(-2, 2),
        vx: 0.0065 + Math.random() * 0.0008,
        bobPhase: Math.random() * 6,
        laneOffset: Util.randInt(-3, 3),
        maxDistAdd: i * 3 + Util.randInt(0, 2),
        curSpd: S4RUN_BASE_SPD * 0.5,
      });
    }

    s4RunBystanders = [];
    const bystanderLines = window.LANG.runBystanderLines || ["didn't see a thing", "I saw nothing", "go go go!", "go robins go!", "never saw 'em", "good for you", "looking the other way", "not theft when it should be ours", "goooo!", "run!"];
    const numBystanders = 10;
    for (let i = 0; i < numBystanders; i++) {
      const wx = 35 + i * Math.floor(s4RunFridgeX / (numBystanders + 1));
      s4RunBystanders.push({
        wx,
        // Anchored to the rooftop line so tall buildings don't swallow them.
        wy: i % 2 === 0 ? A2B_ROAD_Y1 - 1 : A2B_ROAD_Y2 + 1,
        line: Util.pick(bystanderLines),
        col: Util.pick(window.GAME_DATA.npcColors),
        triggered: false,
        msgT: 0,
        msgMax: 2200,
        joins: false, // used to parade-join but lagged behind, confusing
      });
    }
    s4RunParade = [];

    s4RunSparkleT = 0;
    // Just a few coins now — the chase carries the scene.
    s4RunCoins = [];
    for (let cx = 20; cx < s4RunFridgeX - 10; cx += Util.randInt(70, 100)) {
      s4RunCoins.push({
        wx: cx,
        wy: Util.randInt(A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1),
        hit: false,
      });
    }
    // first celebration float fires ~1.5s in
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
    s4RunWX += s4RunSpd * dt;
    s4RunSpd = Math.min(S4RUN_MAX_SPD, S4RUN_BASE_SPD + (s4RunT / S4RUN_RAMP_MS) * (S4RUN_MAX_SPD - S4RUN_BASE_SPD));

    // Grace, close, hit, retreat, repeat.
    const GRACE_MS = 3500;
    const CLOSE_BOOST = 0.014;
    const RETREAT_MS = 2200;
    const GIVEUP_MS = 4000;
    const GIVEUP_FAST_MS = 500; // fridge is close, need them gone NOW
    const MAX_CHASE_MS = 20000;
    const MAX_DIST = 18; // hard ceiling, always visible
    const EASE_MS = 700; // speed change is a curve, not a snap
    const pwxNow = s4RunWX + s4RunPX;
    const fridgeNear = s4RunWX > s4RunFridgeX - W - 140;
    if (s4RunGiveupAt === undefined && (fridgeNear || s4RunHits >= 2 || s4RunT >= MAX_CHASE_MS)) {
      s4RunGiveupAt = s4RunT;
      s4RunGiveupFast = fridgeNear;
    }
    if (s4RunHitCooldown > 0) s4RunHitCooldown -= dt;

    for (let i = s4RunCops.length - 1; i >= 0; i--) {
      const c = s4RunCops[i];
      const dist = pwxNow - c.wx;
      let targetVx;
      if (s4RunGiveupAt !== undefined) {
        const giveupMs = s4RunGiveupFast ? GIVEUP_FAST_MS : GIVEUP_MS;
        const giveupT = Math.min(1, (s4RunT - s4RunGiveupAt) / giveupMs);
        targetVx = s4RunSpd * (1 - giveupT * 0.9);
      } else if (s4RunT < GRACE_MS) {
        targetVx = s4RunSpd * 0.5; // safe landing
      } else if (s4RunHitCooldown > 0) {
        targetVx = s4RunSpd * 0.7; // just hit, backing off
      } else {
        targetVx = s4RunSpd + CLOSE_BOOST + (c.vx - 0.007) * 0.3; // closing in
      }
      c.curSpd = Util.lerp(c.curSpd, targetVx, Math.min(1, dt / EASE_MS));
      c.wx += c.curSpd * dt;
      if (s4RunGiveupAt === undefined) c.wx = Util.clamp(c.wx, pwxNow - MAX_DIST - c.maxDistAdd, pwxNow); // never overtakes, never far
      if (s4RunGiveupAt === undefined) {
        c.wy = Util.lerp(c.wy, s4RunPY + c.laneOffset, Math.min(1, 0.0025 * dt));
        c.wy = Util.clamp(c.wy, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
      }

      if (s4RunHits < 2 && dist < 2 && Math.abs(c.wy - s4RunPY) < 4 && !(s4RunHitCooldown > 0)) {
        s4RunHits++;
        s4RunHitCooldown = RETREAT_MS;
        Effects.start("corrupt", { x: Math.round(s4RunPX), y: Math.round(s4RunPY), radius: 9, duration: 450, intensity: 0.75, swap: true });
        spark(Math.round(s4RunPX), Math.round(s4RunPY), C_DANGER, 14);
        Banner.show(window.LANG.bannerCopTouch || "so close!", C_DANGER, 900);
      }

      if (s4RunGiveupAt !== undefined && c.wx - s4RunWX < -20) s4RunCops.splice(i, 1);
    }

    if (!s4RunTriumphShown && (s4RunCops.length === 0 || (s4RunGiveupAt !== undefined && s4RunT - s4RunGiveupAt > GIVEUP_MS + 1500))) {
      s4RunTriumphShown = true;
      const triumphMsg = window.LANG.bannerWeLostThem || "we lost them!";
      Banner.show(triumphMsg, C_TEAL, 1800);
      // burst of teal sparks across the screen
      for (let _b = 0; _b < 8; _b++) {
        burstGood(s4RunPX + Util.randInt(-4, 4), s4RunPY + Util.randInt(-3, 3), C_TEAL, 8);
      }
      triggerFlashGood();
    }

    const pwxRun = s4RunWX + s4RunPX;
    for (const b of s4RunBystanders) {
      if (!b.triggered && Math.abs(b.wx - pwxRun) < 6) {
        b.triggered = true;
        b.msgT = b.msgMax;
        audio.play("paper");
        if (b.joins && !s4RunDone) b._joinIn = 1600 + Math.random() * 900;
      }
      // The cheer has had its moment — step off the sidewalk and trail the crew.
      if (b._joinIn !== undefined && !b.joined) {
        b._joinIn -= dt;
        if (b._joinIn <= 0) {
          b.joined = true;
          if (!b._art) b._art = window.GAME_DATA.npcArts[Math.floor(b.wx) % window.GAME_DATA.npcArts.length];
          burstGood(Math.round(b.wx - s4RunWX), b.wy, b.col, 6);
          s4RunParade.push({
            wx: b.wx, // world-anchored: they run WITH the flow, never at the player
            wy: b.wy,
            art: b._art,
            col: b.col,
            b: Math.random() * 6,
          });
        }
      }
      if (b.msgT > 0) b.msgT -= dt;
    }

    // ── Continuous sparkle trail on player + crew (only after triumph beat) ──
    if (s4RunTriumphShown) {
      s4RunSparkleT -= dt;
      if (s4RunSparkleT <= 0) {
        s4RunSparkleT = 90; // ms between spawns
        const sparkChars = ["*", "✦", "·", "+"];
        const sparkCols = ["#fff", "#ffd700", C_TEAL, C_PLAYER];
        // Player trail
        sparks.push({
          x: Math.round(s4RunPX) + Util.randInt(-1, 1),
          y: Math.round(s4RunPY) + Util.randInt(-1, 1),
          dx: -0.005 + (Math.random() - 0.5) * 0.004,
          dy: -0.008 - Math.random() * 0.004,
          ch: Util.pick(sparkChars),
          color: Util.pick(sparkCols),
          life: 600 + Math.random() * 300,
        });
        // One crew member at random
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

      // (Player celebration floats removed — bystanders + sparkles carry it)
    }

    // ── Player movement ──
    const ms = 0.025;
    const tapStep = 2;
    if (input.isDown("up")) s4RunPY -= ms * dt;
    else if (input.justPressed("up")) s4RunPY -= tapStep;
    if (input.isDown("down")) s4RunPY += ms * dt;
    else if (input.justPressed("down")) s4RunPY += tapStep;
    if (input.isDown("left")) s4RunPX -= ms * dt;
    else if (input.justPressed("left")) s4RunPX -= tapStep;
    // Same split as Act 4.
    if (input.isDown("right")) {
      s4RunWX += ms * dt * 0.6;
      s4RunPX += ms * dt * 0.25;
    } else if (input.justPressed("right")) {
      s4RunWX += tapStep * 0.6;
      s4RunPX += 1;
    }
    s4RunPY = Util.clamp(s4RunPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
    s4RunPX = Util.clamp(s4RunPX, 4, W - 6);

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

    // Desktop click nudge only — mobile drag is handled by _mobUpdate.
    if (clickPending && phase === "act7" && !Device.isMobile) {
      clickPending = false;
      if (clickSY < s4RunPY - 2) s4RunPY -= 3;
      else if (clickSY > s4RunPY + 2) s4RunPY += 3;
      if (clickSX < s4RunPX - 3) s4RunPX -= 3; // screen-only — the world never rewinds
      else if (clickSX > s4RunPX + 3) {
        s4RunWX += 2; // forward click keeps the world-scroll boost too
        s4RunPX += 1;
      }
    }

    const _runPWX = s4RunWX + s4RunPX;
    for (const coin of s4RunCoins) {
      if (!coin.hit && Math.abs(coin.wx - _runPWX) < 4 && Math.abs(coin.wy - s4RunPY) < 3) {
        coin.hit = true;
        playPitched("recruit", 8);
        spark(Math.round(coin.wx - s4RunWX), coin.wy, C_COIN, 8);
        burstGood(Math.round(coin.wx - s4RunWX), coin.wy, "#ffd700", 6);
      }
    }

    // Banner appears once mid-run (after triumph)
    if (!s4RunBannerShown && s4RunT > 7000) {
      s4RunBannerShown = true;
    }

    // Fridge collision only fires once it's fully visible on screen.
    const fridgeSX = s4RunFridgeX - s4RunWX;
    if (!s4RunDone) {

      if (fridgeSX < W - 4 && Math.round(s4RunPX) >= fridgeSX + 8) {
        s4RunDone = true;
        s4RunSpd = 0;
        const _aisleH = A2B_ROAD_Y2 - A2B_ROAD_Y1;
        s4RunAlignX = fridgeSX + 8; // centered on the fridge
        s4RunAlignY = A2B_ROAD_Y1 + Math.floor((_aisleH - 9) / 2) + 4; // fridge's vertical center (art is 9 tall)
        // Arrival celebration — warm but not overwhelming (big moment is next act)
        for (let _b = 0; _b < 8; _b++) {
          burstGood(Math.round(fridgeSX) + Util.randInt(0, 16), Util.randInt(A2B_ROAD_Y1 + 2, A2B_ROAD_Y2 - 1), C_TEAL, 10);
        }
     
        for (const sp of s4RunTopParts) {
          if (!sp._passedCol) sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
        }
        for (const sp of s4RunBotParts) {
          if (!sp._passedCol) sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
        }
        // Enough for the glide onto the fridge (~1s), no dead air after.
        setTimeout(() => {
          triggerFlashGood();
          audio.play("recruit");
        }, 500);
        setTimeout(() => {
          sparks.length = 0;
          _transitionAct6RunToAct8();
        }, 1100);
      }
    }
  }

  const GLITCH_TAG_RADIUS = 24;
  const GLITCH_FRACTION = 0.35; // partial, not whole building
  const GC_CHARS = "█▓▒░▄▀■◆●✕#@!?%$&*XZ╬╫┼±";
  const GC_COLS = ["#f44", "#0ff", "#ff0", "#f0f", "#fff", "#f80", "#cc6688"];
  // Glitches permanently once passed.
  function _s4RunTagGlitch(sp, sx, playerSX) {
    // Screen-space, not world-space (parallax).
    if (sp._glitched || sx >= playerSX || playerSX - sx >= GLITCH_TAG_RADIUS) return;
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
        if (line[i] === " ") continue;
        if (sp._glitchMask[r][i]) grid.set(sx + i, by + r, sp._glitchArt[r][i], sp._glitchCols[r][i]);
        else grid.set(sx + i, by + r, line[i], baseCol);
      }
    });
  }

  function renderAct6Run(opts = {}) {
    const camX = Math.round(s4RunWX);
    // Mountain parallax (same as Act 4)
    const mtScrollX = s4RunWX * 0.04;
    const mtBaseY = A2B_TOP_H - 1;
    let peakScreenX = -1,
      peakScreenY = 99999;
    const tallestBuilding = Math.max(...s4RunTopParts.map((sp) => sp.art.length));
    const hillFloor = A2B_TOP_H - tallestBuilding - 1;
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
      for (let dy = topY; dy <= Math.min(mtBaseY, hillFloor); dy++) {
        if (dy < 0 || dy >= H) continue;
        const depth = dy - topY;
        let ch, col;
        if (depth === 0) {
          ch = "\u0BF3";
          col = "#27371c";
        } else if (depth < 2) {
          ch = "\u0B70";
          col = "#213417";
        } else if (depth < 5) {
          ch = "\u2592";
          col = "#0e170a";
        } else {
          ch = "\u2591";
          col = "#12200c";
        }
        grid.set(x, dy, ch, col);
      }
    }
    if (peakScreenX >= 0) {
      const crossArt = [" | ", "-+-", " | "];
      grid.art(crossArt, peakScreenX - 1, peakScreenY - 3, "#f0e8c0");
    }

    // Top buildings — brighten as player passes
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
    // (no sidewalk lines — matches Act 4)

    // Mid-road blocks the player weaves around.
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

    // Bottom buildings — brighten as player passes
    for (const sp of s4RunBotParts) {
      const sx = Math.floor(sp.wx) - camX;
      if (sx + sp.w < -2 || sx > W + 2) continue;
      if (!sp._passedCol && sx < s4RunPX) {
        sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
      }
      _s4RunTagGlitch(sp, sx, s4RunPX);
      // Bottom-aligned to the screen edge, same as Act 4's bottom band.
      _s4RunDrawBuilding(sp, sx, Math.max(A2B_ROAD_Y2 + 1, H - sp.art.length));
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
      const _copCol = Math.floor(s4RunT / 120) % 2 === 0 ? C_DANGER : "#a44";
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

    // Bystanders + their mutters (joined ones run in the parade instead)
    for (const b of s4RunBystanders) {
      if (b.joined) continue;
      const bsx = Math.floor(b.wx) - camX;
      if (bsx < -3 || bsx > W + 3) continue;
      const npcArt = Util.pick(window.GAME_DATA.npcArts);
      // pick once and stash so the sprite doesn't flicker
      if (!b._art) b._art = window.GAME_DATA.npcArts[Math.floor(b.wx) % window.GAME_DATA.npcArts.length];
      grid.art(b._art, bsx, b.wy, b.col);
      // Mutter box
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

    // Community fridge — clean and readable, gentle teal
    if (s4RunWX > s4RunFridgeX - W - 10) {
      const fsx = Math.floor(s4RunFridgeX) - camX;
      if (fsx < W + 10) {
        const fridgeBody = [
          "╔═══════════════╗",
          "║  FRIGO COMMUN ║",
          "╠═══════════════╣",
          "║               ║",
          "║===============║",
          "║               ║",
          "║===============║",
          "║               ║",
          "╚═══════════════╝",
        ];
        const aisleH = A2B_ROAD_Y2 - A2B_ROAD_Y1;
        const fY = A2B_ROAD_Y1 + Math.floor((aisleH - fridgeBody.length) / 2);
        grid.art(fridgeBody, fsx, fY, C_TEAL);
      }
    }
    if (!opts.skipPlayerCrew) {

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
          // Cat pads alongside, no orbit, no vertical bob
          const prowl = Math.sin(s4RunT / 400 + (c.b || i)) * 1.4;
          const baseOX = -2 - Math.floor(i / 3) * 2;
          mx = Math.round(s4RunPX + baseOX + prowl);
          my = Math.round(s4RunPY);
        } else {
          const clusterR = 2;
          const angle = s4RunT / 600 + (c.b || i);
          const orbitX = Math.sin(angle + i) * clusterR;
          const orbitY = Math.cos(angle + i) * (clusterR * 0.35);
          const baseOX = -2 - Math.floor(i / 3) * 2;
          mx = Math.round(s4RunPX + baseOX + orbitX);
          my = Math.round(s4RunPY + orbitY);
        }

        if (mx >= 0 && mx < W && my > A2B_ROAD_Y1 - 3 && my < A2B_ROAD_Y2 + 3) {
          const _frame = [...(c.art || A2_ROB)];
          if (!c.isCat) {
            _frame[1] = Math.floor(s4RunT / 200 + (c.b || 0) * 30) % 2 === 0 ? _frame[1] : "\u20B3";
          }
          grid.art(_frame, mx, my, c.col || C_TEAL, c.isCat); // cat always faces forward — see the Act 3 crew-trail comment
        }
      }

      // The parade
      for (let i = 0; i < s4RunParade.length; i++) {
        const p = s4RunParade[i];
        const idx = a2Crew.length + i;
        if (!s4RunDone) {
          p.wx += (s4RunSpd + 0.0018) * 16;
          // Drift from the sidewalk into a loose road lane of their own.
          const _laneY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2) + ((i % 3) - 1) * 2 + Math.sin(s4RunT / 700 + p.b) * 0.4;
          p.wy += Util.clamp(_laneY - p.wy, -0.06, 0.06);
        } else {
    
          const _gx = s4RunWX + s4RunAlignX + (-4 - Math.floor(idx / 3) * 2) + Math.sin(p.b * 7.3) * 1.5;
          const _gy = s4RunAlignY + Math.cos(p.b * 4.1) * 0.9;
          const _pdx = _gx - p.wx,
            _pdy = _gy - p.wy;
          const _pd = Math.hypot(_pdx, _pdy);
          if (_pd > 0.05) {
            const _step = Math.min(_pd, 0.1);
            p.wx += (_pdx / _pd) * _step;
            p.wy += (_pdy / _pd) * _step;
          }
        }
        const mx = Math.round(p.wx - s4RunWX),
          my = Math.round(p.wy);
      
        if (mx >= -2 && mx < W && my > A2B_ROAD_Y1 - 3 && my < A2B_ROAD_Y2 + 3) {
          const _frame = [...(p.art || A2_ROB)];
          _frame[1] = Math.floor(s4RunT / 200 + p.b * 30) % 2 === 0 ? _frame[1] : "₳";
          grid.art(_frame, mx, my, p.col || C_TEAL);
        }
      }

 
      const _pFrame = [...(A2_PA[Math.floor((s4RunT || 0) / 10) % 2] || A2_PA[0])];
      _pFrame[1] = Math.floor(s4RunT / 180) % 2 === 0 ? _pFrame[1] : "₳";
      grid.art(_pFrame, Math.round(s4RunPX), Math.round(s4RunPY), playerPulseColor(s4RunT));
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
    // Reuse Act 6's renderer to keep the store visible during exit
    renderAct6(opts);

    if (!opts.skipPlayerCrew) {
      // Draw crew sliding toward door 
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
      // Pop player back on top only in the last stretch before the cut, not the whole 1.2s hold.
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

  /* Item hit-test, shared by click and walk-into grabbing. */
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
    audio.play("grab");
    state.set("score", state.get("score") + it.food.p);
    s4ItemsGrabbed++;
    s4GrabbedItems.push({ food: it.food, col: it.color });
    burstGood(ix + Math.floor(S4_SLOT_W / 2), aY, it.color, Device.isMobile ? 4 : 9);
    s4GrabBursts.push({ x: ix + Math.floor(S4_SLOT_W / 2), y: aY + 1, t: 400, max: 400, col: it.color });
    popupPush(it.food.n + " +$" + it.food.p, ix + Math.floor(S4_SLOT_W / 2) + Util.randInt(-2, 2), aY + Util.randInt(-2, -1), it.color, 500);
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

    /* Urgency stages */
    for (let i = SU.length - 1; i >= 0; i--)
      if (s4Ug >= SU[i].a && i > s4LM) {
        if (SU[i].a >= 0.35) Banner.show(SU[i].h, SU[i].c, 2000);
        if (SU[i].a === 0.55) audio.play("urgent");
        s4LM = i;
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
        intensity: (s4Ug - 0.7) * 0.8, // 0 at 0.7, 0.24 at 1.0
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

    /* Exit appears after x seconds. */
    if (!convVisible && !s4ExitPinned && s4GT > 30) {
      s4ExitPinned = true;
      audio.play("exit");
      Banner.show(window.LANG.bannerExitOpen, C_TEAL, 3000);
    }

    /* Robin floats */
    if (!convVisible)
      for (let i = s4RobinFloats.length - 1; i >= 0; i--) {
        s4RobinFloats[i].life -= dt;
        s4RobinFloats[i].y -= 0.002 * dt;
        if (s4RobinFloats[i].life <= 0) s4RobinFloats.splice(i, 1);
      }
    /* Grab bursts */
    if (!convVisible)
      for (let i = s4GrabBursts.length - 1; i >= 0; i--) {
        s4GrabBursts[i].t -= dt;
        if (s4GrabBursts[i].t <= 0) s4GrabBursts.splice(i, 1);
      }
    /* Grab-anim countdown — squash+yank flourish on freshly grabbed items */
    if (!convVisible)
      for (const bc of s4Bookcases) {
        for (const it of bc.items) {
          if (it.grabbed && it.grabT > 0) it.grabT -= dt;
        }
      }

    /* ── Auto-scroll — endless ── */
    if (!convVisible) {
      s4WX += s4Sp * dt;
      while (s4GE < s4WX + W + 80) s4GenBookcases(s4GE, s4GE + 80);
      s4Bookcases = s4Bookcases.filter((bc) => bc.wx + S4_BC_W > s4WX - 20);
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

    /* ── Click handling — always runs, independent of keyboard ── */
    // Skip while the defector conversation is up, or its taps get eaten here first.
    if (clickPending && phase === "act6" && !convVisible) {
      /* Check exit FIRST before anything else consumes the click */
      if (s4ExitPinned && clickSX >= s4ExitScreenX - 5 && clickSX <= s4ExitScreenX + 5 && clickSY >= S4_WALK_TOP && clickSY <= S4_WALK_BOT) {
        clickPending = false;
        s4TryExit();
        return;
      }

      clickPending = false;

      /* Check if clicking on a food item in a bookcase */
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

    /* Shelves are decorative — clamp to walkable band. */
    s4PY2 = Util.clamp(s4PY2, S4_WALK_TOP, S4_WALK_BOT - 1);

    /* Walking into food grabs it too. */
    if (!convVisible) {
      const _walkHit = _s4FindItemAt(Math.round(s4PX2), Math.round(s4PY2));
      if (_walkHit) _s4DoGrab(_walkHit.it, _walkHit.ix, _walkHit.aY);
    }

    /* Exit collision — walk into it OR click it to leave */

    if (s4ExitPinned) {
      if (Math.abs(s4PX2 - s4ExitScreenX) < 5) s4TryExit();
    }

    /* ── Guard movement + collision ── */
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

      /* Defector logic: approach → stop → speak → recruit */
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
            /* Snap adjacent, always to the player's right. */
            g.wy = s4PY2;
            g.wx = _pwx4 + 2;
            const _snapSX = Math.round(g.wx - s4WX);
            g.lockedScreenX = _snapSX;
            // Same tap-to-advance conversation panel as Act 2/2.
            convReset();
            convAnchorPX = Math.round(s4PX2);
            convAnchorNX = _snapSX;
            convAnchorY = Math.round(s4PY2);
            convPlayerColor = C_PLAYER;
            convNPCColor = g.col || C_DANGER; // still in uniform for these lines
            convVisible = true;
            convAddLine(window.LANG.act6DefectorLine1 || "hold it right there!", "them", g.col || C_DANGER);
            g.convStep = 0;
            g.convStepT = 0;
            // Light touch, like any Act 3 NPC bump — not a penalty collision.
            audio.play("bump");
            spark(Math.round(s4PX2), Math.round(s4PY2), g.col || C_DANGER, 6);
          }
        } else if (g.defectorState === "speaking") {
          /* Pin to a fixed screen X by riding the world scroll */
          if (g.lockedScreenX !== undefined) {
            g.wx = s4WX + g.lockedScreenX;
          }
          convAnchorPX = Math.round(s4PX2);
          convAnchorNX = gsxNow;
          convAnchorY = Math.round(s4PY2);

          g.convStepT += dt;
          // Tap guard: a click can sit banked in clickPending 
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
              s4DefectorDone = true; // shoppers may enter now — the big beat has landed
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
                behindDist: 5 + s4Alys.length * 4,
                oy: Util.randInt(-2, 2),
                bobPhase: Math.random() * 6,
                grabCD: 0,
                targetY: Math.round(g.wy),
                followY: Math.round(g.wy),
                followX: gsxNow,
                wanderT: 0,
                wanderXT: 0,
                xOffset: -(5 + s4Alys.length * 4),
                dodgeY: 0,
              };
              s4Alys.push(newAlly);
              a2CrewCount++;
              /* Remove the guard now that they've joined */
              s4Gs.splice(i, 1);
              continue;
            }
          }
        }
        /* Skip normal movement & collision for the defector */
        continue;
      }
      if (convVisible) continue; // other guards freeze too while the world's paused

      g.wx += g.vx * dt;
      /* Guards scroll with the world but also move on their own */
      const gsx = Math.round(g.wx - s4WX);
      if (gsx < -10) {
        s4Gs.splice(i, 1);
        continue;
      }
      if (s4St2 <= 0 && Math.abs(g.wx - worldPX) < 2 && Math.abs(g.wy - s4PY2) < 2) {
        audio.play("bump");
        audio.play("security");
        spark(Math.round(s4PX2), Math.round(s4PY2), C_DANGER, 10);
        triggerChromatic(380);
        state.set("score", Math.max(0, state.get("score") - 20));
        s4St2 = 500; // reduced stun so keyboard still feels responsive quickly
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
    if (!convVisible && s4DefectorDone && s4ShopperT > 6000 + Math.random() * 3000 && s4Shoppers.length < 3) {
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
    /* Shopper drift + surprised reactions near the player */
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
        audio.play("paper");
      }
      if (sh.msgT > 0) sh.msgT -= dt;
    }
    const INTERCOM_INTERVAL_MS = 16000;
    if (Math.floor((s4GT * 1000) / INTERCOM_INTERVAL_MS) > Math.floor((s4GT * 1000 - dt) / INTERCOM_INTERVAL_MS)) {
      s4TickerMsg = D_INTERCOM_TICKER[s4TickerNextIdx % D_INTERCOM_TICKER.length];
      s4TickerNextIdx++;

      Banner.show(s4TickerMsg, "#3fd8ff", 2200, true);
    }

    if (s4ExitPinned && Banner.timer <= 0 && s4GT > 25 && Math.floor(s4GT / 25) > Math.floor((s4GT - dt / 1000) / 25)) {
      Banner.show(window.LANG.bannerExitOpen, C_TEAL, 2500, true);
    }

    /* ── HUD ── */
    const my = state.get("score");
    _updateDomHud();
  }
  function renderAct6(opts = {}) {
    const ox = Math.floor(s4WX);
    // Shelves flatten to a washed-out red during the defector conversation.
    const _defectorTalking = s4Gs.some((g) => g.defector && g.defectorState === "speaking");
    const _defectorRed = dullColor(C_DANGER, 0.5);
    /* ── BOOKCASES — open-front shelving, no enclosing boxes ── */
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
        grid.text("\u2500".repeat(S4_BC_W), sx, sY, "#444");
      }
    }

    /* Exit doorway is background, drawn before characters. */
    if (s4ExitPinned) {
      const exSX = s4ExitScreenX;
      const _ef = Math.floor(Date.now() / 800) % 2 === 0;
      const _exitCol = C_TEAL;
      const _dimCol = "#1a5a4a";

      const archTop = Math.min(S4_ABOVE_BOT + 1, S4_AISLE_Y);
      const archBot = Math.max(S4_BELOW_TOP - 2, S4_AISLE_Y);
      const archW = 4;
      const lx = exSX - archW;
      const rx = exSX + archW;

      // Clear interior so items don't poke through.
      for (let y = archTop; y <= archBot; y++) {
        for (let x = lx + 1; x < rx; x++) {
          if (x >= 0 && x < W) grid.set(x, y, " ", null);
        }
      }

      // Doorway \u2014 open at the bottom
      for (let x = lx; x <= rx; x++) {
        if (x >= 0 && x < W) grid.set(x, archTop, "\u2550", _exitCol);
      }
      if (lx >= 0 && lx < W) grid.set(lx, archTop, "\u2554", _exitCol);
      if (rx >= 0 && rx < W) grid.set(rx, archTop, "\u2557", _exitCol);

      // Pillars — stop short of shelf ledge
      for (let y = archTop + 1; y < archBot; y++) {
        if (lx >= 0 && lx < W) grid.set(lx, y, "\u2551", _exitCol);
        if (lx + 1 >= 0 && lx + 1 < W) grid.set(lx + 1, y, "\u2502", _dimCol);
        if (rx >= 0 && rx < W) grid.set(rx, y, "\u2551", _exitCol);
        if (rx - 1 >= 0 && rx - 1 < W) grid.set(rx - 1, y, "\u2502", _dimCol);
      }

      const _label = window.LANG.act6ExitLabel;
      grid.text(_label, exSX - Math.floor(_label.length / 2), archTop + 2, _ef ? "#fff" : _exitCol);
    }

    /* ── Shoppers — harmless aisle life ── */
    for (const sh of s4Shoppers) {
      const shx = Math.round(sh.wx - s4WX),
        shy = Math.round(sh.wy);
      if (shx < -3 || shx > W + 3) continue;
      grid.art(["▬▬", "oo"], shx - 3, shy, "#666"); // low rectangle hugs the wheels
      grid.art(sh.art, shx, shy, sh.col);
      if (sh.msgT > 0 && sh.msg) {
        const _shTxt = sh.msg;
        grid.text(_shTxt, Util.clamp(shx - Math.floor(_shTxt.length / 2), 0, W - _shTxt.length), Math.max(0, shy - 1), sh.col);
      }
    }

    /* ── Security guards — 2 chars wide, same scale as player/NPCs ── */
    _s4GuardBubble = null;
    for (const g of s4Gs) {
      const sx = Math.round(g.wx - s4WX),
        sy = Math.round(g.wy);
      if (sx < -3 || sx > W + 3) continue;
      const _guardFlash = Math.floor(Date.now() / 400) % 2 === 0;
      const _guardLeg = Math.floor(Date.now() / 200 + g.wx * 0.3) % 2 === 0 ? "\u03C6" : "\u20B3";
      grid.art([_guardFlash ? "\u00A7" : "!", _guardLeg], sx, sy, g.col || C_DANGER);

      /* Generic guard-arrival shout — defector's own convo is separate. */
      if (g.announceT > 0 && !(g.defector && g.defectorState === "speaking")) {
        _s4GuardBubble = { sx, sy, line: window.LANG.act6SecurityArrives || "SECURITY! stop right there!", col: g.col || C_DANGER };
      }
    }

    if (!opts.skipPlayerCrew) {
      /* ── Robins trailing behind player — independent, organic ── */
      for (let i = 0; i < s4Alys.length; i++) {
        const al = s4Alys[i];
        const src = a2Crew[i];
        const isCat = src && src.isCat;
        const baseDist = 9 + i * 5; // wider trail spacing — the crew was blurring into the player
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
        /* New target, small radius around player. */
        if (al.wanderT > 2500 + Math.random() * 2000) {
          al.wanderT = 0;
          al.targetY = Util.clamp(s4PY2 + (Math.random() - 0.5) * 6, S4_WALK_TOP, S4_WALK_BOT - 1);
        }
        /* Occasionally pick a new x-offset relative to player (drift forward/back) */
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
          /* Wider detection window — give them time to react */
          if (gdx < 10 && gdy < 3 && gdx < nearestGuardDist) {
            nearestGuard = g;
            nearestGuardDist = gdx;
          }
        }
        if (nearestGuard) {
          if (al.dodgeY === 0) {
            /* Pick a direction — prefer the side with more aisle room */
            const guardScreenY = nearestGuard.wy;
            const upRoom = guardScreenY - S4_WALK_TOP;
            const downRoom = S4_WALK_BOT - guardScreenY;
            const dodgeAmount = 2 + Math.floor(Math.random() * 2); /* 2 or 3 cells */
            al.dodgeY = upRoom > downRoom ? -dodgeAmount : dodgeAmount;
          }
        } else {
          /* Relax dodge back to 0 when no guard is near */
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
        /* Keep dodges inside the walkable band */
        al.followY = Util.clamp(al.followY, S4_WALK_TOP, S4_WALK_BOT - 1);
        /* X follows the player loosely with each robin's own offset */
        const targetX = s4PX2 + al.xOffset;
        al.followX = Util.lerp(al.followX, targetX, 0.025);
        if (isCat) {
          // Cat prowls beside the player, no vertical bob, no leg toggle
          const prowl = Math.sin(s4GT * 2.5 + al.bobPhase) * 1.4;
          rx = Math.round(al.followX + prowl);
          ry = Math.round(al.followY);
          _a4RFrame = [...rArt];
        } else {
          /* Independent x-drift per robin layered on top of their followX */
          const xDrift = Math.sin(s4GT * 1.5 + al.bobPhase * 1.3) * 1.2;
          rx = Math.round(al.followX + xDrift);
          /* Light bob on top of the independent target */
          const yBob = Math.sin(s4GT * 2.5 + al.bobPhase) * 0.8;
          ry = Math.round(al.followY + yBob);
          _a4RFrame = [...rArt];
          _a4RFrame[1] = Math.floor((s4GT * 1000) / 200 + i * 1.7) % 2 === 0 ? _a4RFrame[1] : "\u20B3";
        }
        if (rx >= 0 && rx < W && ry >= S4_WALK_TOP && ry <= S4_WALK_BOT) {
          grid.art(_a4RFrame, rx, ry, rCol, isCat); // cat always faces forward — see the Act 3 crew-trail comment
        }
      }

      /* ── Player ── */
      if (s4St2 <= 0 || Math.floor(s4St2 / 80) % 2 === 0) {
        // Keep urgency flash when heat is high, otherwise use normal pulse
        let pc = s4Ug > 0.7 ? (Math.floor(Date.now() / 200) % 2 ? C_WARN : C_PLAYER) : playerPulseColor(s4GT * 1000);
        const _a4PFrame = [...(A2_PA[Math.floor(s4GT * 4) % 2] || A2_PA[0])];
        _a4PFrame[1] = Math.floor((s4GT * 1000) / 180) % 2 === 0 ? _a4PFrame[1] : "\u20B3";
        grid.art(_a4PFrame, Math.round(s4PX2), Math.round(s4PY2), pc);
      }
    }

    /* Guard speech bubble — deferred so it renders on top of robins/player. */
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

    /* ── Urgency border flash ── */
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

    // (intercom ticker replaced by banner messages)
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
    // Defector conversation panel — same box/anchor/color system as Act 2/2.
    convRender();
  }

  function _transitionAct6ExitToAct6Run() {
    const excludeXY = _excludeByDiff(
      () => render(true),
      () => renderAct6Exit({ skipPlayerCrew: true }),
    );
    // No banner, so no staging — player+crew walk straight to chase positions.
    const keepCells = excludeXY.map((p) => ({ x: p.x, y: p.y, ch: grid.c[p.y][p.x].ch, co: grid.c[p.y][p.x].co }));
    runActBoundary({
      outro: (done) => streamOut(done, { edge: "left", excludeXY, render: false }),
      setupNext: initAct6Run,
      intro: (done) => {
        const targetXY = _excludeByDiff(
          () => render(true),
          () => renderAct6Run({ skipPlayerCrew: true }),
        );
        streamIn(done, { edge: "right", render: false, excludeXY: targetXY, overlay: _walkCellsOverlay(keepCells, targetXY) });
      },
    });
  }

  function _transitionAct6RunToAct8() {
    const camX = Math.round(s4RunWX);
    const fsx = Math.floor(s4RunFridgeX) - camX;
    const aisleH = A2B_ROAD_Y2 - A2B_ROAD_Y1;
    const fY = A2B_ROAD_Y1 + Math.floor((aisleH - 9) / 2);
    const cx = fsx + 8;
    const cy = fY + 4;
    let _pool = null;
    runActBoundary({
      outro: (done) =>
        collapseToCenter(
          (pool) => {
            _pool = pool;
            done();
          },
          { cx, cy },
        ),
      setupNext: initAct8,
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
