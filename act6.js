
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
          // Give aisle a 5-row buffer above S4_AISLE_TOP so taps near the shelf edge still move player
          if (tapCY >= S4_AISLE_TOP && tapCY <= S4_FLOOR_Y) {
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
      s4PY2 = Util.clamp(s4PY2, S4_AISLE_TOP + 1, S4_AISLE_BOT - 1);
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
  /* ── LAYOUT CONSTANTS (computed in init from H) ── */
  let S4_SHELF_ROWS /* how many shelf rows in the unit */,
    S4_SHELF_ROW_H /* height per shelf row (food art height + divider) */,
    S4_SHELF_TOP /* Y of top of shelving unit */,
    S4_SHELF_BOT /* Y of bottom of shelving unit */,
    S4_AISLE_TOP /* Y of top of aisle */,
    S4_AISLE_BOT /* Y of bottom of aisle */,
    S4_FLOOR_Y; /* Y of the floor line */

  let s4ExitScreenX; /* exit is pinned to a screen position, not world */

  /* Items on shelves */
  let s4Items, s4Bookcases, s4RobinFloats;

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

    /* ── Compute layout from screen height ── */
    S4_SHELF_ROW_H = 5;
   
    S4_SHELF_ROWS = H >= 40 || (Device.isMobile && H >= 38) ? 6 : 5;
    S4_SHELF_TOP = Device.isMobile && H >= 38 && H < 40 ? 1 : 2;
    S4_SHELF_BOT = S4_SHELF_TOP + S4_SHELF_ROWS * S4_SHELF_ROW_H + 1;
    S4_AISLE_TOP = S4_SHELF_BOT + 1;
    S4_FLOOR_Y = H - 2;
    S4_AISLE_BOT = S4_FLOOR_Y - 1;
    /* ── Generate initial bookcases ── */
    s4Items = [];
    s4Bookcases = [];
    s4FoodBag = null;
    s4GE = 0;
    s4GenBookcases(0, W + 80);

    /* ── Player starts left-center of aisle ── */
    s4PX2 = Math.floor(W * 0.5);
    s4PY2 = Math.floor((S4_AISLE_TOP + S4_AISLE_BOT) / 2);


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
        wy = Util.randInt(S4_AISLE_TOP + 1, S4_AISLE_BOT - 1);
        tries++;
      } while (tries < 10 && s4Gs.some((g) => Math.abs(g.wy - wy) < GUARD_MIN_LANE_GAP && Math.abs(g.wx - wx) < GUARD_MIN_GAP * 1.5));
      s4Gs.push({
        wx,
        wy,
        vx: -0.004 - Math.random() * 0.004,
      });
      lastGuardWX = wx;
    }
    /* Pick one guard to defect — chosen at spawn but indistinguishable until trigger */
    if (s4Gs.length > 0) {
      const defIdx = Util.randInt(0, s4Gs.length - 1);
      s4Gs[defIdx].defector = true;
      s4Gs[defIdx].defectorState = "approaching"; // approaching → speaking → recruited
      s4Gs[defIdx].defectorT = 0;
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
        y: S4_AISLE_TOP - 1,
        life: 1200,
        max: 1200,
        col: C_TEAL,
      });
    });

    /* ── Remaining state ── */

    s4As = [
      {
        y: S4_AISLE_TOP,
        items: [],
        isExit: false,
        aisleH: S4_AISLE_BOT - S4_AISLE_TOP,
      },
    ];
    s4GE = 0;

    s4TickerMsg = D_INTERCOM_TICKER[0];
    s4TickerNextIdx = 1;
  }

  /* ══════════════════════════════════════════════════════════
   ACT 6 EXIT: brief cinematic — player walks to door, crew converges,
   then transitions into the run home
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
    s4PY2 = Util.lerp(s4PY2, S4_FLOOR_Y - 2, 0.12);

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
      c.y = Util.lerp(c.y, S4_FLOOR_Y - 2, 0.06);
      if (Math.abs(c.x - s4ExitTargetX) > 1 || Math.abs(c.y - (S4_FLOOR_Y - 2)) > 1) allIn = false;
    }

    // Guards aggressively chase toward the door — they realize what's happening
    for (const g of s4Gs) {
      const dxToDoor = s4ExitTargetX - (g.wx - s4WX);
      g.wx += dxToDoor > 0 ? 0.012 * dt : 0;
      g.wy = Util.lerp(g.wy, S4_FLOOR_Y - 2, 0.04);
    }

    // Burst of teal sparks at door, occasionally
    if (s4ExitT > 1500 && s4ExitT < 4000 && Math.random() < 0.12) {
      spark(s4ExitTargetX + Util.randInt(-2, 2), S4_AISLE_BOT - 1, C_TEAL, 6);
    }

    // Transition once all crew have reached the door — identical to Act 5
    if (!s4ExitDone && allIn && Math.abs(s4PX2 - s4ExitTargetX) < 1) {
      s4ExitDone = true;
      s4ExitDoneAt = s4ExitT;
      for (let _b = 0; _b < 10; _b++) {
        burstGood(s4ExitTargetX + Util.randInt(-3, 3), S4_AISLE_BOT - 1, a2Crew[_b % a2Crew.length]?.col || C_TEAL, 8);
      }
      triggerFlashGood();
      setTimeout(() => _transitionAct6ExitToAct6Run(), 1200);
    }
  }

  /* ══════════════════════════════════════════════════════════
   ACT 7: crew runs back to community fridge through the
   neighbourhood — visual callback to Act 4 but wordless and fast
   ══════════════════════════════════════════════════════════ */

  // Pacing ramp — gradual from frame 0, climbing to a capped cruise speed.
  const S4RUN_BASE_SPD = 0.008,
    S4RUN_MAX_SPD = 0.02,
    S4RUN_RAMP_MS = 8000,
    S4RUN_TOTAL_MS = 22000;
  let s4RunT, s4RunSpd, s4RunWX, s4RunFridgeX, s4RunDone, s4RunPX, s4RunPY;
  let s4RunAlignX, s4RunAlignY; // where the player glides to on arrival — exactly in front of the fridge
  let s4RunCoins;
  let s4RunTopParts, s4RunBotParts, s4RunBannerShown;
  let s4RunCops, s4RunBystanders, s4RunSparkleT, s4RunTriumphShown;
  let s4RunParade; // bystanders who joined the run — screen-space tail members behind the crew
  function initAct6Run() {
    phase = "act7";
    Music.transition("music_act4"); // run-home music starts now
    audio.preload(["music_act8"]); // pre-warm act8 drop-off music
    a2bCalcLayout(); // reuse Act 4 layout helpers
    s4RunT = 0;
    s4RunSpd = S4RUN_BASE_SPD; // slower so the run feels more substantial, at least until the ramp kicks in
    s4RunWX = 0;
    s4RunDone = false;
    s4RunBannerShown = false;
    s4RunTriumphShown = false;
    s4RunPX = Math.floor(W * 0.38);
    s4RunPY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    // World distance to fridge = integral of the ramp over its duration.
    const _rampDist = ((S4RUN_BASE_SPD + S4RUN_MAX_SPD) / 2) * S4RUN_RAMP_MS;
    const _cruiseDist = S4RUN_MAX_SPD * (S4RUN_TOTAL_MS - S4RUN_RAMP_MS);
    s4RunFridgeX = Math.floor(_rampDist + _cruiseDist);
    s4RunTopParts = a2bGenRow(s4RunFridgeX + W);
    s4RunBotParts = a2bGenRow(s4RunFridgeX + W);
    // Give each building part a muted starting color; brightened as player passes
    for (const sp of s4RunTopParts) sp._passedCol = null;
    for (const sp of s4RunBotParts) sp._passedCol = null;

 
    s4RunCops = [];
    const numCops = 5;
    const midY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    for (let i = 0; i < numCops; i++) {
      s4RunCops.push({
        wx: 2 + i * 1.5, // visible on screen at start
        wy: midY + Util.randInt(-2, 2),
        vx: 0.0065 + Math.random() * 0.0008, // slightly slower than s4RunSpd (0.008) — they linger but eventually fall behind
        bobPhase: Math.random() * 6,
      });
    }
    triggerChromatic(400);

    s4RunBystanders = [];
    const bystanderLines = window.LANG.runBystanderLines || ["didn't see a thing", "never saw 'em", "good for you"];
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
        joins: Math.random() < 0.2,
      });
    }
    s4RunParade = [];

    s4RunSparkleT = 0;
    // Scatter gold coins along the road
    s4RunCoins = [];
    for (let cx = 20; cx < s4RunFridgeX - 10; cx += Util.randInt(8, 18)) {
      s4RunCoins.push({
        wx: cx,
        wy: Util.randInt(A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1),
        hit: false,
      });
    } // first celebration float fires ~1.5s in
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
    // Overridden by the fridge-approach slowdown once it's on screen.
    s4RunSpd = Math.min(S4RUN_MAX_SPD, S4RUN_BASE_SPD + (s4RunT / S4RUN_RAMP_MS) * (S4RUN_MAX_SPD - S4RUN_BASE_SPD));

    const CHASE_DURATION_MS = 6000;
    const FALL_BEHIND_DURATION_MS = 5000;
    for (let i = s4RunCops.length - 1; i >= 0; i--) {
      const c = s4RunCops[i];
      let effectiveVx;
      if (s4RunT < CHASE_DURATION_MS) {
        effectiveVx = s4RunSpd + (c.vx - 0.007) * 0.3;
      } else {
        const fallProgress = Math.min(1, (s4RunT - CHASE_DURATION_MS) / FALL_BEHIND_DURATION_MS);
        // Eases from world speed (1.0×) down to 0.2× world speed
        effectiveVx = s4RunSpd * (1 - fallProgress * 0.8);
      }
      c.wx += effectiveVx * dt;
      // Once they're off-screen left (relative to world scroll), drop them
      if (c.wx - s4RunWX < -20) s4RunCops.splice(i, 1);
    }

    // Triumph beat fires once cops are ACTUALLY gone (or after a 12s safety fallback).
    if (!s4RunTriumphShown && (s4RunCops.length === 0 || s4RunT > 12000)) {
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
    if (input.isDown("right")) s4RunPX += ms * dt;
    else if (input.justPressed("right")) s4RunPX += tapStep;
    s4RunPY = Util.clamp(s4RunPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
    s4RunPX = Util.clamp(s4RunPX, 4, W - 6);

    // Desktop click nudge only — mobile drag is handled by _mobUpdate.
    if (clickPending && phase === "act7" && !Device.isMobile) {
      clickPending = false;
      if (clickSY < s4RunPY - 2) s4RunPY -= 3;
      else if (clickSY > s4RunPY + 2) s4RunPY += 3;
      if (clickSX < s4RunPX - 3) s4RunPX -= 3;
      else if (clickSX > s4RunPX + 3) s4RunPX += 3;
    }

    // Coin collision — a forgiving box, easy to miss otherwise at this speed.
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
    const pwxRun4 = s4RunWX + s4RunPX;
    for (const sp of s4RunTopParts) {
      const sx = Math.floor(sp.wx) - topScrollX;
      if (sx + sp.w < -2 || sx > W + 2) continue;
      // Once player has passed this building, assign it a warm bright color
      if (!sp._passedCol && sp.wx < pwxRun4) {
        sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
      }
      const drawCol = sp._passedCol || sp.col;
      const by = A2B_TOP_H - sp.art.length;
      grid.art(sp.art, sx, Math.max(0, by), drawCol);
    }
    // (no sidewalk lines — matches Act 4)

    // Bottom buildings — brighten as player passes
    for (const sp of s4RunBotParts) {
      const sx = Math.floor(sp.wx) - camX;
      if (sx + sp.w < -2 || sx > W + 2) continue;
      if (!sp._passedCol && sp.wx < pwxRun4) {
        sp._passedCol = Util.pick(["#e8944a", "#f5a032", "#5cbdbd", "#c8a800", "#9ab89a"]);
      }
      const drawCol = sp._passedCol || sp.col;
      // Bottom-aligned to the screen edge, same as Act 4's bottom band.
      grid.art(sp.art, sx, Math.max(A2B_ROAD_Y2 + 1, H - sp.art.length), drawCol);
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

    // Draw coins
    for (const coin of s4RunCoins) {
      if (coin.hit) continue;
      const csx = Math.round(coin.wx - s4RunWX);
      if (csx < 0 || csx >= W) continue;
      grid.set(csx, coin.wy, "\u25CE", C_COIN);
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
      if (s4ExitPinned && clickSX >= s4ExitScreenX - 5 && clickSX <= s4ExitScreenX + 5 && clickSY >= S4_AISLE_TOP && clickSY <= S4_FLOOR_Y) {
        clickPending = false;
        s4TryExit();
        return;
      }

      clickPending = false;

      /* Check if clicking on a food item in a bookcase */
      let grabbedItem = false;
      outer4: for (const bc of s4Bookcases) {
        const bsx = Math.round(bc.wx - s4WX);
        if (bsx + S4_BC_W < 0 || bsx > W) continue;
        for (const it of bc.items) {
          if (it.grabbed) continue;
          const ix = bsx + 1 + it.col * S4_SLOT_W + 1;
          const rY = S4_SHELF_TOP + 1 + it.row * S4_SHELF_ROW_H;
          // Hitbox matches where the art is actually DRAWN
          const aY = rY;
          if (clickSX >= ix - 1 && clickSX < ix + S4_SLOT_W && clickSY >= aY && clickSY <= aY + it.food.a.length) {
            it.grabbed = true;
            it.grabT = S4_GRAB_ANIM_MS;
            audio.play("grab");
            state.set("score", state.get("score") + it.food.p);
            s4ItemsGrabbed++;
            s4GrabbedItems.push({ food: it.food, col: it.color });
            burstGood(ix + Math.floor(S4_SLOT_W / 2), aY, it.color, Device.isMobile ? 4 : 9);
            s4GrabBursts.push({ x: ix + Math.floor(S4_SLOT_W / 2), y: aY + 1, t: 400, max: 400, col: it.color });
            popupPush(it.food.n + " +$" + it.food.p, ix + Math.floor(S4_SLOT_W / 2) + Util.randInt(-2, 2), aY + Util.randInt(-2, -1), it.color, 500);
            grabbedItem = true;
            s4HasGrabbed = true;
            s4LastGrabT = s4GT;
            if (s4Alys.length && Math.random() < 0.35) {
              s4RobinFloats.push({
                text: drawDeck("cheers", window.LANG.robinCheers),
                x: Math.round(s4PX2 - Util.randInt(3, 9)),
                y: S4_AISLE_TOP - 1,
                life: 1100,
                max: 1100,
                col: a2Crew[Util.randInt(0, a2Crew.length - 1)]?.col || C_TEAL,
              });
            }
            break outer4;
          }
        }
      }

      if (!grabbedItem && clickSY >= S4_AISLE_TOP && clickSY <= S4_FLOOR_Y) {
        if (clickSY < s4PY2 - 1) s4PY2 -= 2;
        else if (clickSY > s4PY2 + 1) s4PY2 += 2;
      }
    }

    /* Clamp player to aisle */
    s4PY2 = Util.clamp(s4PY2, S4_AISLE_TOP + 1, S4_AISLE_BOT - 1);

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

          g.wx += g.vx * dt;
  
          const _pwx4 = s4WX + s4PX2;
          const _metPlayer = Math.abs(g.wx - _pwx4) < 4 && Math.abs(g.wy - s4PY2) < 4;
 
          const _readyToMeet = s4HasGrabbed || s4GT > 6;
          if ((_metPlayer && _readyToMeet) || gsxNow < Math.floor(W * 0.12)) {
            g.defectorState = "speaking";
            g.defectorT = 0;
            g.lockedScreenX = gsxNow;
            // Same tap-to-advance conversation panel as Act 2/2.
            convReset();
            convAnchorPX = Math.round(s4PX2);
            convAnchorNX = gsxNow;
            convAnchorY = Math.round(s4PY2);
            convPlayerColor = C_PLAYER;
            convNPCColor = C_DANGER; // still in uniform for these lines
            convVisible = true;
            convAddLine(window.LANG.act6DefectorLine1 || "hold it right there!", "them", C_DANGER);
            g.convStep = 0;
            g.convStepT = 0;
            // Light touch, like any Act 3 NPC bump — not a penalty collision.
            audio.play("bump");
            spark(Math.round(s4PX2), Math.round(s4PY2), C_DANGER, 6);
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
              convAddLine(window.LANG.act6DefectorLine2 || "uh", "them", C_DANGER);
              g.convStep = 2;
              g.convStepT = 0;
            } else if (g.convStep === 2) {
              convAddLine(window.LANG.act6DefectorPlayerLine2 || "local hero defends $2 rigatoni to the death?", "you", C_PLAYER);
              g.convStep = 3;
              g.convStepT = 0;
            } else if (g.convStep === 3) {
              convAddLine(window.LANG.act6DefectorLine3 || "ugh they don't pay me enough for this", "them", C_DANGER);
              g.convStep = 4;
              g.convStepT = 0;
            } else if (g.convStep === 4) {
              convAddLine(window.LANG.act6DefectorPlayerLine3 || "so?", "you", C_PLAYER);
              g.convStep = 5;
              g.convStepT = 0;
            } else if (g.convStep === 5) {
              convAddLine(window.LANG.act6DefectorLine4 || "so the good pasta is two aisles over", "them", C_DANGER);
              g.convStep = 6;
              g.convStepT = 0;
            } else if (g.convStep === 6) {
              convAddLine(window.LANG.floatGuardDefects || "c'mon. I'll show you", "them", C_DANGER);
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
          wy: Util.randInt(S4_AISLE_TOP + 1, S4_AISLE_BOT - 1),
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
    /* ── BOOKCASES — discrete units scrolling with world ── */
    for (const bc of s4Bookcases) {
      const sx = Math.round(bc.wx - s4WX);
      if (sx + S4_BC_W < -1 || sx > W + 1) continue;
      const iW = S4_BC_W - 2;
      grid.text("\u2554" + "\u2550".repeat(iW) + "\u2557", sx, S4_SHELF_TOP, C_DIM);
      for (let row = 0; row < S4_SHELF_ROWS; row++) {
        const rY = S4_SHELF_TOP + 1 + row * S4_SHELF_ROW_H;
        const sY = rY + S4_SHELF_ROW_H - 1;
        const ns = Math.floor(iW / S4_SLOT_W);
        for (let y = rY; y < sY; y++) {
          if (sx >= 0 && sx < W) grid.set(sx, y, "\u2551", "#666");
          if (sx + S4_BC_W - 1 >= 0 && sx + S4_BC_W - 1 < W) grid.set(sx + S4_BC_W - 1, y, "\u2551", "#666");
          for (let c = 1; c < ns; c++) {
            const dvx = sx + 1 + c * S4_SLOT_W;
            if (dvx >= 0 && dvx < W) grid.set(dvx, y, "\u2502", "#333");
          }
        }
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
        const sym = row < S4_SHELF_ROWS - 1 ? "\u2560" + "\u2550".repeat(iW) + "\u2563" : "\u255a" + "\u2550".repeat(iW) + "\u255d";
        grid.text(sym, sx, sY, "#666");
      }
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
      grid.art([_guardFlash ? "\u00A7" : "!", _guardLeg], sx, sy, C_DANGER);

      /* Generic guard-arrival shout — defector's own convo is separate. */
      if (g.announceT > 0 && !(g.defector && g.defectorState === "speaking")) {
        _s4GuardBubble = { sx, sy, line: window.LANG.act6SecurityArrives || "SECURITY! stop right there!", col: C_DANGER };
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
          const aisleMid = (S4_AISLE_TOP + S4_AISLE_BOT) / 2;
          al.targetY = aisleMid + al.oy * 1.2;
          al.followY = al.targetY;
          al.followX = s4PX2 - baseDist;
          al.wanderT = Math.random() * 4000;
          al.wanderXT = Math.random() * 3000;
          al.xOffset = -baseDist + (Math.random() - 0.5) * 4;
          al.dodgeY = 0;
        }
        al.wanderT += 16;
        al.wanderXT += 16;
        /* Occasionally pick a new target lane within the aisle */
        if (al.wanderT > 2500 + Math.random() * 2000) {
          al.wanderT = 0;
          const aisleMid = (S4_AISLE_TOP + S4_AISLE_BOT) / 2;
          al.targetY = aisleMid + (Math.random() - 0.5) * (S4_AISLE_BOT - S4_AISLE_TOP - 2);
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
            const upRoom = guardScreenY - S4_AISLE_TOP;
            const downRoom = S4_AISLE_BOT - guardScreenY;
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
        /* Clamp followY so dodges don't push them out of the aisle */
        al.followY = Util.clamp(al.followY, S4_AISLE_TOP + 1, S4_AISLE_BOT - 1);
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
        if (rx >= 0 && rx < W && ry >= S4_AISLE_TOP && ry <= S4_AISLE_BOT) {
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

    /* ── Floor line ── */
    for (let x = 0; x < W; x++) {
      grid.set(x, S4_FLOOR_Y, "\u2550", "#444");
    }

    if (s4ExitPinned) {
      const exSX = s4ExitScreenX;
      const _ef = Math.floor(Date.now() / 800) % 2 === 0;
      const _exitCol = C_TEAL;
      const _dimCol = "#1a5a4a";

      // Door-sized, not aisle-sized — a full-height arch dwarfed everything.
      const archTop = Math.max(S4_AISLE_TOP, S4_FLOOR_Y - 6); // beam may touch the aisle top — still below the shelves, and tight layouts get a real door instead of a stub
      const archBot = S4_FLOOR_Y;
      const archW = 3;
      const lx = exSX - archW;
      const rx = exSX + archW;

      // Top beam
      for (let x = lx; x <= rx; x++) {
        if (x >= 0 && x < W) grid.set(x, archTop, "\u2550", _exitCol);
      }
      if (lx >= 0 && lx < W) grid.set(lx, archTop, "\u2554", _exitCol);
      if (rx >= 0 && rx < W) grid.set(rx, archTop, "\u2557", _exitCol);

      // Pillars
      for (let y = archTop + 1; y < archBot; y++) {
        if (lx >= 0 && lx < W) grid.set(lx, y, "\u2551", _exitCol);
        if (lx + 1 >= 0 && lx + 1 < W) grid.set(lx + 1, y, "\u2502", _dimCol);
        if (rx >= 0 && rx < W) grid.set(rx, y, "\u2551", _exitCol);
        if (rx - 1 >= 0 && rx - 1 < W) grid.set(rx - 1, y, "\u2502", _dimCol);
      }

      // Floor gap
      for (let x = lx; x <= rx; x++) {
        if (x >= 0 && x < W) grid.set(x, S4_FLOOR_Y, " ", null);
      }

      // EXIT label in beam
      const _label = window.LANG.act6ExitLabel;
      grid.text(_label, exSX - Math.floor(_label.length / 2), archTop, _ef ? "#fff" : _exitCol);
    }

    /* ── Urgency border flash ── */
    if (s4Ug > 0.5) {
      const bc = Math.floor(Date.now() / 300) % 2 ? C_DANGER : "#a00";
      for (let x = 0; x < W; x++) grid.set(x, 0, "\u2550", bc);
      for (let y = 0; y < H; y++) {
        grid.set(0, y, "\u2551", bc);
        grid.set(W - 1, y, "\u2551", bc);
      }
      grid.textCenter([window.LANG.urgencyCopsEnRoute, window.LANG.urgencyFindExit][Math.floor(Date.now() / 800) % 2], 0, C_DANGER);
    }

    // (intercom ticker replaced by banner messages)
    popupRender();


    if (!convVisible && !s4HasGrabbed && s4GT > 2) {
      renderTapPrompt(ctrl("act6Grab"), S4_FLOOR_Y - 1, "#fff", C_PLAYER, true);
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
      intro: (done) => riseFromPile(done, { spawnPool: _pool, peppersMs: 700, simmer: true }),
    });
  }
