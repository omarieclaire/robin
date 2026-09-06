
  let a1PX, a1PY, a1CX, a1CY, a1T, a1St, a1NPCs, a1AmbNPCs, a1StartX, a1StartY;
  let a1Pokes = [];
  let a1EncNPC, a1EI, a1ES, a1ST2;
  let a1Path, a1PI, a1PA, a1NP;
  let a1IdleTimer, a1LoopCount; // auto-advance on inactivity
  let a1DescPath, a1DescPI; //  road-following descent
  let a1PauseT; // silent pauses between narrative banners
  let a1WalkArmed; // true while walk is actively playing; false while waiting for tap
  let a1WalkPromptT; // ms accumulator so the prompt only appears after a brief settle
  let a1HasAdvancedDialogue; // has the player tapped to advance any encounter line yet
  let a1NoControlTries; // escalates the "no steering" banner copy each time the player tries an arrow key

  let a1DecayWaves, a1DecayClaimed;

  /* Array-of-turns encounter format */
  let A1E = window.LANG.a1Encounters;

  let A1_LOOP_MSGS = window.LANG.a1LoopMsgs;

  let NQ = window.LANG === window.LANG_FR ? window.GAME_DATA.narrativeQuotesFR : window.GAME_DATA.narrativeQuotesEN;

  function initAct2() {
    audio.play("level");
    audio.preload(["music_act3"]); // background preload for next act
    phase = "act2";
    a1DecayWaves = [];
    a1DecayClaimed = new Set();
    const sr = 2,
      sc = 2;
    const ry0 = hRoadY(sr),
      ry1 = hRoadY(sr + 1),
      ry2 = hRoadY(sr + 2);
    const ex0 = vRoadX(sc + 2) + 3,
      ex1 = vRoadX(sc + 3) + 3,
      ex2 = vRoadX(sc + 4) + 3;
    a1NPCs = [
      {
        x: ex0,
        y: ry0,
        enc: 0,
        ch: "&",
        col: "rgb(255, 0, 242)",
      },
      {
        x: ex1,
        y: ry1,
        enc: 1,
        ch: "!",
        col: "rgb(47, 255, 0)",
      },
      {
        x: ex2,
        y: ry2,
        enc: 2,
        ch: "?",
        col: "#ff0",
      },
    ];
    a1Path = [
      { x: vRoadX(sc), y: ry0 },
      { x: ex0 - 4, y: ry0 },
    ];
    a1PA = [
      [
        { x: ex0 + 2, y: ry0 },
        {
          x: vRoadX(sc + 3),
          y: ry0,
        },
        {
          x: vRoadX(sc + 3),
          y: ry1,
        },
        { x: ex1 - 2, y: ry1 },
      ],
      [
        { x: ex1 + 2, y: ry1 },
        {
          x: vRoadX(sc + 4),
          y: ry1,
        },
        {
          x: vRoadX(sc + 4),
          y: ry2,
        },
        { x: ex2 - 2, y: ry2 },
      ],
      [
        { x: ex2 + 3, y: ry2 },
        { x: ex2 + 30, y: ry2 },
      ],
    ];
    a1PX = a1Path[0].x;
    a1PY = a1Path[0].y;
    a1PI = 0;
    a1CX = a1PX - Math.floor(W * A1_PSX_RATIO);
    a1CY = a1PY - Math.floor(H * A1_PSY_RATIO);
    a1T = 0;
    a1EI = 0;
    a1ST2 = 0;
    a1ES = 0;
    a1EncNPC = null;
    a1NP = 0;
    a1IdleTimer = 0;
    a1LoopCount = 1;
    a1DescPath = null;
    a1DescPI = 0;
    a1PauseT = 0;
    a1WalkArmed = false;
    a1WalkPromptT = 0;
    a1HasAdvancedDialogue = false;
    a1NoControlTries = 0;
    dialogStack = [];
    // Ambient NPCs
    a1AmbNPCs = [];
    a1Pokes = [];

    const TARGET_NPC_COUNT = 28; // doubled from 14 — denser ambient world
    const MIN_SPACING = 6; // minimum distance between any two ambient NPCs

    const playerRowMin = 2; // sr from above
    const playerRowMax = 4; // sr+2
    const onPathTarget = Math.floor(TARGET_NPC_COUNT * 0.6);
    const offPathTarget = TARGET_NPC_COUNT - onPathTarget;

    const takenSlots = new Set();

    /* Also reserve slots already occupied by encounter NPCs */
    for (const en of a1NPCs) {
      /* Encounter NPCs sit on horizontal roads at specific (row, col) */
      const enRow = Math.floor((en.y - BH - 1) / CH);
      const enCol = Math.floor(en.x / CW);
      takenSlots.add(enRow + "," + enCol + ",h");
    }

    function tryPlaceNPC(rowMin, rowMax, colMin, colMax) {
      let attempts = 0;
      while (attempts < 40) {
        attempts++;
        const row = Util.randInt(rowMin, rowMax),
          col = Util.randInt(colMin, colMax);
        let nx, ny, slotKey;
        const useHRoad = Math.random() > 0.5;
        if (useHRoad) {
          ny = hRoadY(row);
          nx = col * CW + Util.randInt(0, BW - 1);
          slotKey = row + "," + col + ",h";
        } else {
          nx = vRoadX(col);
          ny = row * CH + Util.randInt(0, BH - 1);
          slotKey = row + "," + col + ",v";
        }
        if (!isRoad(nx, ny)) continue;

        /* Block already has an NPC in this row+orientation — skip */
        if (takenSlots.has(slotKey)) continue;

        /* Don't overlap encounter NPCs (extra safety on actual pixel distance) */
        let tooClose = false;
        for (const en of a1NPCs) {
          if (Math.abs(en.x - nx) < 3 && Math.abs(en.y - ny) < 2) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;

        for (const other of a1AmbNPCs) {
          if (Math.abs(other.x - nx) < MIN_SPACING && Math.abs(other.y - ny) < 3) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;

        takenSlots.add(slotKey);

        const msg = Util.pick(window.LANG.act2AmbMutters);
        a1AmbNPCs.push({
          x: nx,
          y: ny,
          dx: 0,
          dy: 0,
          sp: 0,
          ch: Util.pick(["&", "$", "%"]),
          col: Util.pick(["#445", "#454", "#544", "#455", "#545", "#554"]),
          msg,
          msgT: 0,
          msgMax: 3000,
          msgCD: Util.randInt(8000, 22000) + a1AmbNPCs.length * 400,
        });
        return true;
      }
      return false;
    }

    /* Place NPCs along the player's path first (denser, more interesting) */
    for (let i = 0; i < onPathTarget; i++) {
      tryPlaceNPC(playerRowMin, playerRowMax, 0, 6);
    }
    /* Place remaining NPCs in the rest of the world (above/below path) */
    for (let i = 0; i < offPathTarget; i++) {
      /* Alternate between rows above and below the player path */
      const useUpper = i % 2 === 0;
      const rowMin = useUpper ? 0 : playerRowMax + 1;
      const rowMax = useUpper ? Math.max(0, playerRowMin - 1) : 5;
      if (rowMin > rowMax) continue;
      tryPlaceNPC(rowMin, rowMax, 0, 6);
    }

    if (hasPlayed) {
      // Skip encounters, jump to choice prompt
      a1PX = a1NPCs[2].x + 15;
      a1PY = a1NPCs[2].y;
      a1CX = a1PX - Math.floor(W * A1_PSX_RATIO);
      a1CY = a1PY - Math.floor(H * A1_PSY_RATIO);
      a1EI = a1NPCs.length;
      a1St = "tap";
      a1ST2 = 0;
      hudLabel.textContent = "";
      hudScore.textContent = "";
      hudStatus.textContent = "";
    } else {
      a1St = "pause";
      hudLabel.textContent = "";
      hudScore.textContent = "";
      hudStatus.textContent = "";
    }
  }
  function _a1ResolveEndingChoice(idx, delayGaveUp, delayKeepLiving) {
    if (idx === 0) {
      // "I've had enough"
      const ox = Math.floor(a1CX),
        oy = Math.floor(a1CY);
      const px = Math.round(a1PX) - ox,
        py = Math.round(a1PY) - oy;
  
      Effects.start("mirror", { x: px, y: py, radius: 7, duration: delayGaveUp + convFadeDuration, intensity: 0.3 });
      setTimeout(() => {
        convStartFade();
        a1St = "outro";
        burstGood(px, py, C_PLAYER, 16);
        triggerFlashGood();
        a1NP = 0;
        a1ST2 = 0;
        a1PauseT = 1200;
        setTimeout(() => {
          Banner.show(NQ[0].t, NQ[0].c, NQ[0].d);
          a1NP = 1;
        }, 1200);
      }, delayGaveUp);
    } else {
      // "keep living like this"
      setTimeout(() => {
        convStartFade();
        const lm = A1_LOOP_MSGS[Math.min(a1LoopCount, A1_LOOP_MSGS.length - 1)];
        Banner.show(lm.t, lm.c, 2000, true);
        a1LoopCount++;
        if (a1LoopCount > 3) {
          triggerBrokenHeart();
          return;
        }
        if (!a1StartX) {
          a1StartX = a1Path[0].x;
          a1StartY = a1Path[0].y;
        }
        a1St = "loop";
        a1Path = [
          { x: Math.round(a1PX), y: Math.round(a1PY) },
          { x: a1StartX, y: Math.round(a1PY) },
          { x: a1StartX, y: a1StartY },
        ];
        a1PI = 0;
      }, delayKeepLiving);
    }
  }
  function _a1Walkable(x, y) {
    const lx = ((Math.round(x) % CW) + CW) % CW,
      ly = ((Math.round(y) % CH) + CH) % CH;
    const inB = lx < BW && ly < BH;
    return !inB || (ly >= HH && ly < HH + RUH);
  }
  function _a1Move(nx, ny) {
    if (_a1Walkable(nx, ny) || !_a1Walkable(a1PX, a1PY)) {
      a1PX = nx;
      a1PY = ny;
    } else if (_a1Walkable(nx, a1PY)) {
      a1PX = nx;
    } else if (_a1Walkable(a1PX, ny)) {
      a1PY = ny;
    }
  }
  function updateAct2(dt) {
    a1T += dt;
    if (clickPending) {
    }
    a1CX = a1PX - Math.floor(W * A1_PSX_RATIO);
    if (a1St !== "descend") a1CY = a1PY - Math.floor(H * A1_PSY_RATIO);
    Banner.update(dt);
    dialogUpdate(dt);

  
    if (a1St === "walk" && !convVisible && Banner.timer <= 0) {
      if (input.justPressed("left") || input.justPressed("right") || input.justPressed("up") || input.justPressed("down")) {
        const _noControlLines = window.LANG.act1NoControl;
        const _msg = a1NoControlTries < _noControlLines.length ? _noControlLines[a1NoControlTries] : Util.pick(window.LANG.act1NoControlRepeat);
        a1NoControlTries++;
        Banner.show(_msg, "#7c94b2", 1800, true);
      }
    }

    if (a1St === "pause") {
      if (Banner.tapAdvance()) {
        if (!Banner.seq) {
          // That tap closed the final banner line — let the same tap start walking,
          // instead of asking for a second one.
          a1St = "walk";
          a1ST2 = 0;
          a1IdleTimer = 0;
          a1WalkArmed = true;
          a1WalkPromptT = 0;
          Banner.timer = 0;
        }
        return;
      }
    }

    if (clickPending && phase === "act2" && a1St !== "tap" && a1St !== "enc" && a1St !== "walk") clickPending = false;

    
    if (clickPending && a1St === "walk") {
      const _pox = Math.floor(a1CX),
        _poy = Math.floor(a1CY);
      const _hit1 = (sx, sy) => Math.abs(clickSX - sx) <= 1 && Math.abs(clickSY - sy) <= 1;
      if (_hit1(Math.round(a1PX) - _pox, Math.round(a1PY) - _poy)) {
        clickPending = false;
        audio.play("bump");
        a1Pokes.push({ x: Math.round(a1PX), y: Math.round(a1PY), msg: Util.pick(window.LANG.act2PokePlayer), t: 1500, col: C_PLAYER });
      } else {
        for (const n of a1NPCs) {
          if (_hit1(n.x - _pox, n.y - _poy)) {
            clickPending = false;
            a1Pokes.push({ x: n.x, y: n.y, msg: drawDeck("pokeNpc", window.LANG.act2PokeNpc), t: 1500, col: "#778" });
            break;
          }
        }
        if (clickPending)
          for (const an of a1AmbNPCs) {
            if (_hit1(Math.round(an.x) - _pox, Math.round(an.y) - _poy)) {
              clickPending = false;
              // Reuse their own mutter display — fresh line, shown now.
              an.msg = drawDeck("pokeNpc", window.LANG.act2PokeNpc);
              an.msgT = an.msgMax;
              an.msgCD = Util.randInt(8000, 18000);
              break;
            }
          }
      }
    }
    for (const pk of a1Pokes) pk.t -= dt;
    a1Pokes = a1Pokes.filter((pk) => pk.t > 0);

    // Update ambient NPCs
    for (const an of a1AmbNPCs) {
      an.x += an.dx * an.sp * dt;
      an.y += an.dy * an.sp * dt;
      an.msgCD -= dt;
      if (an.msgCD <= 0) {
        an.msgT = an.msgMax;
        an.msgCD = Util.randInt(8000, 18000);
        an.msg = Util.pick(window.LANG.act2AmbMutters);
      }
      if (an.msgT > 0) an.msgT -= dt;
    }
    if (a1St === "pause") {
      a1ST2 += dt;
      // wait for all intro banners to finish before walking
      if (Banner.timer <= 0 && a1ST2 > 800) {
        a1St = "walk";
        a1ST2 = 0;
        a1IdleTimer = 0;
        a1WalkArmed = false;
        a1WalkPromptT = 0;
      }
      return;
    }
    const ox = Math.floor(a1CX),
      oy = Math.floor(a1CY);
    const psx = Math.round(a1PX) - ox,
      psy = Math.round(a1PY) - oy;

    if (a1St === "walk") {
      if (a1PI >= a1Path.length - 1) {
        if (a1EI < a1NPCs.length) {
          a1St = "enc";
          clickPending = false;
          audio.play("bump");
          const _encOX = Math.floor(a1CX),
            _encOY = Math.floor(a1CY);
          spark(Math.round(a1PX) - _encOX, Math.round(a1PY) - _encOY, C_DIM, 2);
          a1ES = 0;
          a1ST2 = 0;
          a1EncNPC = a1NPCs[a1EI];
          a1WalkArmed = false;
        } else if (a1NP === 0 && a1St !== "tap") {
          a1St = "tap";
          a1ST2 = 0;
          a1IdleTimer = 0;
          clickPending = false;
        } else if (a1NP < NQ.length) {
          Banner.show(NQ[a1NP].t, NQ[a1NP].c, NQ[a1NP].d);
          a1NP++;
          a1ST2 = 0;
          a1St = "nar";
        } else {
          a1St = "done";
          a1ST2 = 0;
        }
        return;
      }
      // Wait for the player to tap before walking. Tapping during the walk is ignored.
      if (!a1WalkArmed) {
        a1WalkPromptT += dt;
        if ((clickPending || input.justPressed("action")) && a1WalkPromptT > 200) {
          clickPending = false;
          a1WalkArmed = true;
          a1WalkPromptT = 0;
          audio.play("click");
        } else {
          return;
        }
      }
      const tg = a1Path[a1PI + 1],
        dx = tg.x - a1PX,
        dy = tg.y - a1PY,
        d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.3) {
        a1PX = tg.x;
        a1PY = tg.y;
        a1PI++;
      } else {
        const s = 0.008 * dt;
        _a1Move(a1PX + (dx / d) * s, a1PY + (dy / d) * s);
      }
    } else if (a1St === "nar") {
      a1ST2 += dt;
      if (a1PI < a1Path.length - 1) {
        const tg = a1Path[a1PI + 1],
          dx = tg.x - a1PX,
          dy = tg.y - a1PY,
          d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.3) {
          a1PX = tg.x;
          a1PY = tg.y;
          a1PI++;
        } else {
          const s = 0.005 * dt;
          _a1Move(a1PX + (dx / d) * s, a1PY + (dy / d) * s);
        }
      }
      // Track pause delay separately — not tied to Banner.timer
      if (a1PauseT > 0) {
        a1PauseT -= dt;
        return;
      }

      if (Banner.timer <= 0) {
        if (a1NP < NQ.length) {
          const q = NQ[a1NP];
          if (q.pause) {
            a1PauseT = q.d;
          } else if (q.seq) {
            Banner.showSequence(q.seq, true);
          } else {
            Banner.show(q.t, q.c, q.d, true);
          }
          a1NP++;
        } else {
          a1St = "done";
          a1ST2 = 0;
        }
      }
    } else if (a1St === "enc") {
      a1ST2 += dt;
      // Update conv anchors X as camera moves, but freeze Y once set
      if (convVisible && a1EncNPC) {
        convAnchorPX = psx;
        convAnchorNX = a1EncNPC.x - ox;
        // Y is set once at conversation start and never changes
      }
      const e = A1E[a1EI];
      const turns = a1LoopCount <= 1 ? e.turns : e.loopTurns;
      // Minimum dwell so a fast tapper can't skip a line before it's typed
      const A1_TAP_MIN_MS = 250;
      const _tapped = clickPending || input.justPressed("action");
      const _hasChunksPending = _convChunkQueue.length > 0;
      if (a1ES < turns.length) {
        // Wait for the camera to actually settle on the NPC before opening dialogue. Hard timeout at 1400ms
        const _camTargetX = a1PX - Math.floor(W * A1_PSX_RATIO);
        const _camTargetY = a1PY - Math.floor(H * A1_PSY_RATIO);
        const _camSettled = Math.abs(a1CX - _camTargetX) < 0.5 && Math.abs(a1CY - _camTargetY) < 0.5;
        const _camTimeout = a1ST2 > 1400;
        if (a1ES === 0 && !convVisible && (_camSettled || _camTimeout)) {
          dialogStack = [];
          convReset();
          convAnchorPX = psx;
          convAnchorNX = a1EncNPC.x - ox;
          convAnchorY = psy;
          convEncounterIndex = a1EI; // Store encounter index for render adjustments
          convPlayerColor = C_PLAYER;
          convNPCColor = a1EncNPC.col || C_CONV_NPC;
          convVisible = true;
          const t = turns[0];
          const side = t.who === "p" ? "you" : "them";
          const col = t.who === "p" ? C_PLAYER : convNPCColor;
          const txt = t.texts ? t.texts[Math.max(0, Math.min(a1LoopCount - 2, t.texts.length - 1))] : t.text;
          convAddLine(txt, side, col);
          a1ES = 1;
          a1ST2 = 0;
        } else if (_tapped && a1ES > 0) {
          clickPending = false;
          if (a1ST2 > A1_TAP_MIN_MS) {
            if (_hasChunksPending) {
              _convChunkFlush();
              _convChunkTimer = 999999; // disable auto-flush; tap drives it now
            } else {
              const t = turns[a1ES];
              const side = t.who === "p" ? "you" : "them";
              const col = t.who === "p" ? C_PLAYER : convNPCColor;
              const txt = t.texts ? t.texts[Math.max(0, Math.min(a1LoopCount - 2, t.texts.length - 1))] : t.text;
              convAddLine(txt, side, col);
              a1ES++;
              a1HasAdvancedDialogue = true;
            }
            a1ST2 = 0;
          }
        }
        // pause after last conversational line — wait for tap to walk on
      } else if (_tapped) {
        clickPending = false;
        if (a1ST2 > A1_TAP_MIN_MS) {
          if (_hasChunksPending) {
            // Final line still has chunks pending — drain them first.
            _convChunkFlush();
            _convChunkTimer = 999999;
            a1ST2 = 0;
          } else {
            const np = a1PA[a1EI];
            a1EI++;
            a1EncNPC = null;
            dialogStack = [];
            convStartFade();
            a1Path = [
              {
                x: a1PX,
                y: a1PY,
              },
              ...np,
            ];
            a1PI = 0;
            if (a1EI >= a1NPCs.length) a1NP = 0;
            a1St = "walk";
            a1WalkArmed = true;
            a1WalkPromptT = 0;
          }
        }
      }
    } else if (a1St === "tap") {
      a1ST2 += dt;
      // Idle timeout removed — the choice waits as long as the player needs.
      if (a1ST2 > 800 && clickPending) {
        clickPending = false;
        /* Only act on clicks within the choice box Y range. Clicks outside = ignore. */

        if (convChoicePicked < 0 && convChoiceY2 > 0 && clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
          triggerChoiceConfirm();
          let picked = convChoiceYs.length - 1;
          for (let ci = 0; ci < convChoiceYs.length - 1; ci++) {
            if (clickSY < convChoiceYs[ci + 1]) {
              picked = ci;
              break;
            }
          }
          convChoicePicked = picked;
          a2ST2 = 0;
          _a1ResolveEndingChoice(picked, 400, 600);
        }
        /* else: click outside choice — ignore, keep box visible */
      }
      // Keyboard: up/down moves hover, action/space confirms
      if (a1ST2 > 800) {
        if (input.justPressed("up")) {
          convChoiceHover = Math.max(0, (convChoiceHover < 0 ? 0 : convChoiceHover) - 1);
        }
        if (input.justPressed("down")) {
          convChoiceHover = Math.min((convChoices?.length ?? 2) - 1, (convChoiceHover < 0 ? -1 : convChoiceHover) + 1);
        }
        if (input.justPressed("action") && convChoiceHover >= 0 && convChoicePicked < 0) {
          triggerChoiceConfirm();
          convChoicePicked = convChoiceHover;
          a1ST2 = 0;
          _a1ResolveEndingChoice(convChoiceHover, 600, 400);
        }
      }
    } else if (a1St === "outro") {
      a1ST2 += dt;
      a1PX += 0.005 * dt;
      if (a1PauseT > 0) {
        a1PauseT -= dt;
        return;
      }

      if (!Banner.seq && Banner.timer <= 0) {
        if (a1NP < NQ.length) {
          const q = NQ[a1NP];
          a1NP++;
          if (q.pause) {
            a1PauseT = q.d;
          } else if (q.seq) {
            Banner.showSequence(q.seq, true);
            _a1SpawnDecayWave(0.5); // last banner beat — most of what's left goes now, so the final sweep only has to catch a small remainder
          } else {
            Banner.show(q.t, q.c, q.d, true);
 
            if (a1NP - 1 >= 2) _a1SpawnDecayWave(0.35);
          }
        } else {
          a1St = "done";
          a1ST2 = 0;
        }
      }
    } else if (a1St === "descend") {
      /* Walk along roads to reach a lower Y before transitioning to Act 3 */
      a1ST2 += dt;
      if (!a1DescPath) {
        // Build a path: go right to nearest vertical road, then down, then right a bit
        const curX = Math.round(a1PX);
        const curY = Math.round(a1PY);
        const nextVRoad = vRoadX(Math.floor(curX / CW) + 1);
        const targetRow = Math.floor(curY / CH) + 2;
        const targetHRoad = hRoadY(targetRow);
        a1DescPath = [
          {
            x: nextVRoad,
            y: curY,
          },
          {
            x: nextVRoad,
            y: targetHRoad,
          },
          {
            x: nextVRoad + 12,
            y: targetHRoad,
          },
        ];
        a1DescPI = 0;
      }
      if (a1DescPI < a1DescPath.length) {
        const tg = a1DescPath[a1DescPI];
        const dx = tg.x - a1PX,
          dy = tg.y - a1PY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.5) {
          a1PX = tg.x;
          a1PY = tg.y;
          a1DescPI++;
        } else {
          const s = 0.012 * dt;
          _a1Move(a1PX + (dx / d) * s, a1PY + (dy / d) * s);
        }
      } else {
        a1St = "done";
        a1ST2 = 0;
      }
    } else if (a1St === "loop") {
      if (a1PI >= a1Path.length - 1) {
        a1EI = 0;
        a1EncNPC = null;
        a1NP = 0;
        dialogStack = [];
        a1Path = [
          {
            x: a1PX,
            y: a1PY,
          },
          {
            x: a1NPCs[0].x - 2,
            y: a1NPCs[0].y,
          },
        ];
        a1PI = 0;
        a1St = "walk";
        a1ST2 = 0;
      } else {
        const tg = a1Path[a1PI + 1],
          dx = tg.x - a1PX,
          dy = tg.y - a1PY,
          d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.3) {
          a1PX = tg.x;
          a1PY = tg.y;
          a1PI++;
        } else {
          const s = 0.02 * dt;
          _a1Move(a1PX + (dx / d) * s, a1PY + (dy / d) * s);
        }
      }
    } else if (a1St === "done") {
      a1ST2 += dt;

      if (a1ST2 > 150) {
        a1St = "handoff"; // guard against re-entering this branch
        _transitionAct2ToAct3();
      }
    }
  }

  function _a1SpawnDecayWave(fraction, minCount = 6) {
    if (!grid) return;
    const ox = Math.floor(a1CX),
      oy = Math.floor(a1CY);
    const px = Math.round(a1PX) - ox,
      py = Math.round(a1PY) - oy;
    const candidates = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (x === px && y === py) continue; // never the player
        if (a1DecayClaimed.has(y * W + x)) continue; // already claimed by an earlier wave
        const cell = grid.c[y][x];
        if (cell.ch === " ") continue;
        candidates.push({ x, y, ch: cell.ch, co: cell.co });
      }
    }
    if (candidates.length === 0) return;
    const count = Math.max(minCount, Math.ceil(candidates.length * fraction));
    const picked = _shuffledIndices(candidates.length)
      .slice(0, count)
      .map((i) => candidates[i]);

    const cells = picked.map((c) => {
      a1DecayClaimed.add(c.y * W + c.x);
      const extra = 15 + Math.random() * 45;
      return {
        x: c.x,
        y: c.y,
        ch: c.ch,
        co: c.co,
        ex: c.x - (c.x + extra),
        delay: Math.random() * 500,
        dur: 900 + Math.random() * 900,
        wobAmp: 0.4 + Math.random() * 1.6,
        wobFreq: 1 + Math.random() * 3,
        wobPhase: Math.random() * Math.PI * 2,
      };
    });
    a1DecayWaves.push({ startT: a1T, cells });
  }

  function _a1RenderDecayWaves() {
    for (const wave of a1DecayWaves) {
      const elapsed = a1T - wave.startT;
      for (const c of wave.cells) {
        const t = elapsed - c.delay;
        if (t <= 0) {
          grid.set(c.x, c.y, c.ch, c.co); // still resting where it always was
          continue;
        }
        const p = Math.min(1, t / c.dur);
        grid.set(c.x, c.y, " ", null); // clear the original spot either way
        if (p >= 1) continue; // fully departed
        const ep = _easeCurve(p, "inCubic");
        const wob = Math.sin(p * Math.PI * c.wobFreq + c.wobPhase) * c.wobAmp * (1 - p);
        grid.set(Math.round(c.x + (c.ex - c.x) * ep), Math.round(c.y + wob), c.ch, c.co);
      }
    }
  }

  function renderAct2() {
    renderCity(a1CX, a1CY);
    const ox = Math.floor(a1CX),
      oy = Math.floor(a1CY);
    for (const n of a1NPCs) {
      const sx = n.x - ox,
        sy = n.y - oy;
      if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
        let c = n.enc < a1EI ? "#555" : n.enc === a1EI ? n.col : "#444";

        grid.set(sx, sy, n.ch, c);
      }
    }
    for (const an of a1AmbNPCs) {
      const asx = Math.round(an.x) - ox,
        asy = Math.round(an.y) - oy;
      if (asx >= 0 && asx < W && asy >= 0 && asy < H) {
        grid.set(asx, asy, an.ch, an.col);
        if (an.msgT > 0) {
          const txt = an.msg.substring(0, Math.min(an.msg.length, W - 2));
          const tx = Util.clamp(asx - Math.floor(txt.length / 2), 0, W - txt.length);
          if (asy - 1 >= 0) grid.text(txt, tx, asy - 1, "#556");
        }
      }
    }
    // Poke reaction lines — same quiet style as the ambient mutters.
    for (const pk of a1Pokes) {
      const pksx = pk.x - ox,
        pksy = pk.y - oy - 1;
      if (pksy >= 0 && pksy < H) {
        const txt = pk.msg.substring(0, Math.min(pk.msg.length, W - 2));
        grid.text(txt, Util.clamp(pksx - Math.floor(txt.length / 2), 0, W - txt.length), pksy, pk.col);
      }
    }

    _a1RenderDecayWaves(); // world erosion waves, if the player has chosen to leave — must run before the player is drawn, below, so it's never affected

    const px = Math.round(a1PX) - ox,
      py = Math.round(a1PY) - oy;
    const _walking = a1St === "walk" || a1St === "outro" || a1St === "loop" || a1St === "descend" || a1St === "done";
    const _pChar = _walking ? (Math.floor(a1T / 2) % 2 === 0 ? "@" : "\u0398") : "@";
    if (px >= 0 && px < W && py >= 0 && py < H) grid.set(px, py, _pChar, playerPulseColor(a1T));

    dialogRender();
    convRender();

    if (a1St !== "tap" && a1St !== "enc" && convVisible) convReset();
    if (a1St === "tap" && !convVisible) {
      const _camTargetX = a1PX - Math.floor(W * A1_PSX_RATIO);
      const _camTargetY = a1PY - Math.floor(H * A1_PSY_RATIO);
      const _camSettled = Math.abs(a1CX - _camTargetX) < 0.5 && Math.abs(a1CY - _camTargetY) < 0.5;
      const _camTimeout = a1ST2 > 1400;
      if (a1ST2 > 800 && (_camSettled || _camTimeout)) {
        convReset();
        convAnchorPX = px;
        convAnchorNX = px;
        convAnchorY = py;
        convEncounterIndex = 3; // Choice screen is after 3 encounters
        convPlayerColor = C_PLAYER;
        convVisible = true;
        convShowChoices(window.LANG.act2Choices);
      }
    }

    if (a1St === "pause" && Banner.seq && Banner.seq.idx >= Banner.seq.lines.length && 99999 - Banner.seq.lineTimer > 3000) {
      renderTapPrompt(ctrl("tapToWalk"), H - 2, "#fff", C_PLAYER, true);
    }

    if (a1St === "walk" && !a1WalkArmed && Banner.timer <= 0) {
      const isFirstWalk = a1EI === 0;
      const dwell = isFirstWalk ? 0 : 6000;
      if (a1WalkPromptT > dwell) {
        renderTapPrompt(ctrl("tapToWalk"), H - 2, "#fff", C_PLAYER, true);
      }
    }

    if (a1St === "enc" && convVisible && a1ES > 0) {
      const isFirstAdvance = !a1HasAdvancedDialogue;
      const dwell = isFirstAdvance ? 1500 : 8000;
      if (a1ST2 > dwell) {
        renderTapPrompt(ctrl("tapToContinueConv"), H - 2, "#fff", C_PLAYER);
      }
    }
    Banner.render();
  }

  // ══════════════════════════════════════════════════════════════


  function _transitionAct2ToAct3() {

    const ox = Math.floor(a1CX),
      oy = Math.floor(a1CY);
    const playerXY = [{ x: Math.round(a1PX) - ox, y: Math.round(a1PY) - oy }];

    runActBoundary({
      outro: (done) => streamOut(done, { edge: "left", excludeXY: playerXY }),
      setupNext: initAct3,
      banner: {
        lines: [
          { t: window.LANG.bannerRecruitCrew, c: C_ORANGE, d: 99999 },
          { t: window.LANG.bannerWatchNarcs, c: C_ORANGE, d: 99999 },
        ],
        frameIdx: 7, // rooflines frame — blank frame 0 read as unfinished here
        keepCells: [{ x: playerXY[0].x, y: playerXY[0].y, ch: "@", co: C_PLAYER }],
      },

      intro: (done) => {
        const excludeXY = _excludeByDiff(
          () => render(true),
          () => renderAct3({ skipPlayerCrew: true }),
        );
        const from = playerXY[0];
        const to = { x: Math.round(a2PX), y: Math.round(a2PY) };
        const dist = Math.hypot(to.x - from.x, to.y - from.y);
    
        const walkMs = dist < 2 ? 1 : Util.clamp(dist * 90, 1000, 2600);
        streamIn(done, {
          edge: "right",
          render: false,
          excludeXY,
          overshootChance: 0.08,
          overshootStrength: 0.5,
          wobAmpMin: 0.2,
          wobAmpMax: 0.7,
          wobFreqMax: 2,
          flyMsMin: 1100,
          flyMsMax: 2100,
          jitterMs: 1600,
          overlay: (elapsed) => {
            const p = Math.min(1, elapsed / walkMs);
            const wx = Math.round(from.x + (to.x - from.x) * p);
            const wy = Math.round(from.y + (to.y - from.y) * p);
            const ch = p < 1 && Math.floor(elapsed / 160) % 2 === 0 ? "Θ" : "@";
            grid.set(wx, wy, ch, C_PLAYER);
          },
        });
      },
    });
  }
