

  const A2_MIN = 3,
    A2_MH = 3;
  const A2_MAYBE_LATER_CHANCE = 0.35;
  // Returning-NPC tuning.
  const A2_RETURN_SPAWN_OFFSET = 30; // how far behind camera-left to spawn returning NPC
  const A2_RETURN_SPEED_MULT = 1.8; // world-units/ms multiplier on a2Spd (walks faster than scroll)
  const A2_RETURN_REACH_DIST = 4; // world units — close enough to open conv
  const A2_RETURN_BUSY_RADIUS = 18; // don't return if another NPC is within this many world units of player
  const A2_RETURN_CALM_MS = 2500; // quiet beat required after any conversation ends before a returner may open theirs
  const A2_RETURN_RECHECK_MS = 2500; // if blocked by busy radius, recheck after this many ms
  const A2_RETURN_BANG_MS = 1500; // how long the "!" indicator shows above approaching NPC
  // how long you have to play act 2
  const A2_TIME_LIMIT_MS = 60000;
  const A2_TIME_WARN_MS = 40000;

  const A2_BCOL = ["#b9a89a", "#9ab89a", "#9a9ab8", "#b8a09a", "#9aa8b0", "#a89ab0", "#b0a898", "#98a8b0"];
  const A2_NPC_ARTS = window.GAME_DATA.npcArts;
  const A2_NPC_COLORS = window.GAME_DATA.npcColors;
  const A2_NPC = window.GAME_DATA.npcArts[0];
  const A2_ROB = window.GAME_DATA.robinArt;

  const A2_NUM_LANES = 3;
  let A2_RU_H = 3,
    A2_VRW = 7;
  let A2_BH_PER, A2_LANE_YS, A2_GND, A2_TOP_PAD;

  let a2WX, a2T, a2Ht, a2Spd;
  let a2Blocks, a2Roads, a2NPCs, a2Clouds;
  let a2NPCsSpawned;
  let a2CatSpawned; // has any cat NPC been generated yet
  let a2CatRecruited; // does the player already have a cat companion
  let a2ConvsCompleted = 0;
  let a3PropWill = {},
    a3PropDone = {};
  const A3_PROPS = [
    { key: "pylon", art: "Δ", cols: ["#ff8c1a", "#ff7a1a", "#e8760f", "#ffa040"], sound: "bump", lines: "pylonLines", chance: 0.5, jitter: true },
    { key: "bagel", art: "o", cols: ["#d9a441", "#c8923a", "#e0b45a", "#d6a038"], sound: "recruit", lines: "bagelLines", chance: 0.34, pitched: true },
    { key: "serviceberry", art: "↭", cols: ["#7d5fa8", "#6a5a9c", "#5566a0", "#6a8f5a"], sound: "recruit", lines: "serviceberryLines", guaranteed: true, pitched: true },
    { key: "mulberry", art: "⥉", cols: ["#b25a9c", "#9c3a6f", "#7d2f5a", "#a83a6a"], sound: "recruit", lines: "mulberryLines", chance: 0.5, pitched: true },
    { key: "nasturtium", art: "❀", cols: ["#ff7a3d", "#ff5a2a", "#ffab30", "#ff9040", "#e8402a"], sound: "recruit", lines: "nasturtiumLines", chance: 0.5, pitched: true },
  ];
  const _isProp = (k) => A3_PROPS.some((p) => p.key === k);
  function _a3PendingPropKey() {
    const pending = A3_PROPS.filter((p) => a3PropWill[p.key] && !a3PropDone[p.key]);
    if (!pending.length) return null;
    return pending[Math.floor(Math.random() * pending.length)].key;
  }

  let a2LastCatSpawnX;
  let a2PRu, a2PAnim, a2PAnimT, a2TargetY, a2Hopping;
  let a2HopIntent, a2HopTimer;
  let a2TP, a2TT, a2TalkCD;
  let a2LastConvEndT, _a2TNWas; 
  let a2Choice,
    a2ChoiceLabels,
    a2ChoiceOrder = [0, 1, 2],
    a2ChoiceDisplayPicked, 
    a2PitchLines = [],
    a2ChoiceTags = [];
  let a2SV, a2SW, a2SD, a2SDT, a2SDFired;
  let a2Gen;
  let a2HudFlashT, a2HudFlashMsg;
  let a2TimeWarned, a2TimeoutFired;
  let a2HasTalked, a2HasHopped, a2HasMoved;
  let a2PromptCooldown;
  let a2HasAdvancedDialogue; 

  const A2 = {
    GREET_DELAY: T.reply, // 1800ms
    CHOICE_LOCK: 100, // min ms before click registers
    INVITE_DELAY: T.hold, // 1500ms — after filler before invite
    BAIL_CLOSE: T.linger, // 2400ms — after bail response
    RECRUIT_CLOSE: T.linger, // 2400ms — after recruit confirm
    NARC_PAUSE: T.hold, // 1500ms — before narc consequence
    MISMATCH_CLOSE: T.npcMin, // 2800ms — after mismatch rejection
  };

  function a2Layout() {
    A2_GND = H - 1;
    A2_RU_H = 2;
    const numRoads = 3,
      numBands = numRoads + 1;
    const totalStreetH = numRoads * A2_RU_H;
    A2_BH_PER = Math.max(4, Math.floor((A2_GND - totalStreetH) / numBands));
    A2_TOP_PAD = Math.floor(H * 0.06);
    A2_LANE_YS = [];
    for (let road = 0; road < numRoads; road++) {
      const roadY = A2_TOP_PAD + (road + 1) * A2_BH_PER + road * A2_RU_H;
      A2_LANE_YS.push(roadY);
    }
  }

  function a2RuY(ri) {
    return A2_LANE_YS[ri] || A2_LANE_YS[0];
  }
  function a2NpcY(n) {
    return a2RuY(n.ru);
  }
  function a2BandY(bi) {
    if (bi <= 3) {
      const y = A2_TOP_PAD + bi * (A2_BH_PER + A2_RU_H);
      return { y, h: A2_BH_PER };
    }
    return { y: A2_GND - 2, h: 2 };
  }

  function a2GenChunk(from, to) {
    const usedBuildingNames = new Set();
    for (const b of a2Blocks) for (const bd of b.bldgs) if (bd.name && b.wx + b.w > from - W * 1.5) usedBuildingNames.add(bd.name);
    const lastRoadX = a2Roads.length > 0 ? a2Roads[a2Roads.length - 1].wx : -999;
    let rx = Math.max(from, lastRoadX + Util.randInt(30, 50));
    while (rx < to) {
      a2Roads.push({ wx: rx });
      rx += Util.randInt(30, 50);
    }
    a2Roads.sort((a, b) => a.wx - b.wx);

    const nearRoads = a2Roads.filter((r) => r.wx + A2_VRW > from - 80 && r.wx < to + 40);
    const roadXs = [-999, ...nearRoads.map((r) => r.wx), 99999];

    for (let ri = 0; ri < roadXs.length - 1; ri++) {
      const leftE = roadXs[ri] + (roadXs[ri] === -999 ? 999 : A2_VRW);
      if (roadXs[ri + 1] === 99999) continue;
      const rightE = roadXs[ri + 1];
      if (leftE >= to || rightE - leftE < 8) continue;
      const overlap = a2Blocks.find((b) => b.band === 0 && b.wx < rightE && b.wx + b.w > leftE);
      if (overlap) continue;
      for (let band = 0; band <= 3; band++) {
        const { y: bandY, h: bandH } = a2BandY(band);
        if (bandH < 2) continue;
        a2Blocks.push({ wx: leftE, y: bandY, w: rightE - leftE, h: bandH, band, bldgs: [] });
        const blk = a2Blocks[a2Blocks.length - 1];
        const availW = rightE - leftE - 2;
        const tiles = tileBuildings(availW, usedBuildingNames);
        let bx2 = leftE + 1;
        for (const tile of tiles) {
          blk.bldgs.push({ dx: bx2 - leftE, art: tile.art, color: Util.pick(A2_BCOL), w: tile.w, name: tile.name });
          bx2 += tile.w;
        }
      }
    }

    const mobileMinLane = 1;

    const MIN_NPC_GAP = 38,
      MAX_NPC_GAP = 62;

    const playerLane = typeof a2PRu === "number" ? a2PRu : null;
    const firstSpawnLane = a2NPCsSpawned === 0 && playerLane !== null && playerLane >= mobileMinLane ? playerLane : null;
    const laneOrder = [];
    if (firstSpawnLane !== null) laneOrder.push(firstSpawnLane);
    for (let ri = mobileMinLane; ri < A2_NUM_LANES; ri++) {
      if (ri !== firstSpawnLane) laneOrder.push(ri);
    }
    for (let ri = 0; ri < mobileMinLane; ri++) laneOrder.push(ri);
    for (const ri of laneOrder) {
      const laneOffset = (ri - mobileMinLane) * 18;
      for (let nx = from + MIN_NPC_GAP + laneOffset; nx < to; nx += Util.randInt(MIN_NPC_GAP, MAX_NPC_GAP)) {
        let onRoad = false;
        for (const rd of a2Roads) if (nx >= rd.wx - 1 && nx <= rd.wx + A2_VRW + 1) onRoad = true;
        if (onRoad) continue;

        const _pend = _a3PendingPropKey();
        const topLane = ri < mobileMinLane;

        let tp, tl;
        if (topLane) {
          const _r = Math.random();
          if (_pend && _r < 0.15) tp = _pend;
          else if (_r < 0.19) tp = "cat";
          else if (_r < 0.45) tp = "coin";
          else continue;
          tl = 0;
        } else if (a2NPCsSpawned === 0) {
          tp = "narc";
          tl = 0;
        } else if (a2NPCsSpawned === 1) {
          tp = Math.random() < 0.5 ? "norm" : "coin";
          tl = tp === "norm" ? 1 : 0;
        } else if (!a2CatSpawned && a2ConvsCompleted >= 1) {
          tp = "cat";
          tl = 0;
        } else if (a2NPCsSpawned >= 4 && _pend && (a2NPCsSpawned > 8 || Math.random() < 0.22)) {
          tp = _pend;
          tl = 0;
        } else if (!a2CatRecruited && a2CatSpawned && nx - a2LastCatSpawnX > 100) {
          // Missed the last cat — guarantee another shot instead of leaving it to chance.
          tp = "cat";
          tl = 0;
        } else {
          // Recruitable people get the biggest share — they're the point of the act.
          const r = Math.random();
          if (r < 0.2) {
            tp = "narc";
            tl = 0;
          } else if (r < 0.24) {
            tp = "cat";
            tl = 0;
          } else if (r < 0.5) {
            tp = "coin";
            tl = 0;
          } else {
            tp = "norm";
            tl = 1;
          }
        }
        const SPACING_X = 80; // world units to consider "nearby" (same-type rule)
        const ADJACENT_LANE_MIN_GAP = 15; // min world-x gap between NPCs in adjacent lanes
        const nearbyNPCs = a2NPCs.filter((other) => Math.abs(other.wx - nx) < SPACING_X);

        const tooCloseAdjacent = a2NPCs.some(
          (other) => Math.abs(other.ru - ri) <= 1 && other.ru !== ri && Math.abs(other.wx - nx) < ADJACENT_LANE_MIN_GAP,
        );
        if (tooCloseAdjacent) continue; // skip this spawn position entirely

        if (tp === "narc") {
          // Never two narcs within SPACING_X of each other.
          if (nearbyNPCs.some((other) => other.tp === "narc")) {
            tp = "norm";
            tl = 1;
          }
        } else if (tp === "cat") {
          // Never two cats within SPACING_X of each other.
          if (nearbyNPCs.some((other) => other.tp === "cat")) {
            tp = "norm";
            tl = 1;
          }
        } else if (tp === "coin") {
          // Allow two coins near each other but not three.
          const nearbyCoins = nearbyNPCs.filter((other) => other.tp === "coin").length;
          if (nearbyCoins >= 2) {
            tp = "norm";
            tl = 1;
          }
        }

        if (tp === "cat" && nx < 80) {
          tp = "norm";
          tl = 1;
        }
        if (topLane && (tp === "norm" || tp === "narc")) continue;
        if (tp === "cat") {
          a2CatSpawned = true;
          a2LastCatSpawnX = nx;
        }
        if (A3_PROPS.some((p) => p.key === tp)) a3PropDone[tp] = true;
        a2NPCsSpawned++;

        const npcKind = Math.random() < 0.5 ? "hungry" : "angry";

        const ambLine =
          tp === "narc"
            ? drawAmb(DECK_AMB_NARC)
            : tp === "cat"
              ? drawDeck("catAmb", window.LANG.act3CatAmb || ["miaou...", "prrrr", "mrrrow"])
              : tp === "coin" || _isProp(tp)
                ? ""
                : npcKind === "hungry"
                  ? drawAmb(DECK_AMB_HUNGRY)
                  : drawAmb(DECK_AMB_ANGRY);

        const narcHeads = ["$", "€", "£", "¥", "₿", "₽"];
        const narcHead = Util.pick(narcHeads);
        const narcBody = Util.pick(["\u03C6", "ψ", "Ω", "\u00A7"]);
        const _propCfg = A3_PROPS.find((p) => p.key === tp);
        const npcArt =
          tp === "narc"
            ? [narcHead, narcBody]
            : tp === "cat"
              ? [" ", Util.pick(CAT_GLYPHS)]
              : tp === "coin"
                ? [" ", "\u25CE"]
                : _propCfg
                  ? [" ", _propCfg.art]
                  : Util.pick(A2_NPC_ARTS);

        const narcCols = ["#ff9d9d", "#8fe6ab", "#a8a0ff", "#f5e05a", "#ffab73"];

        // Cats come in several coats — orange tabby, cream, grey, ginger.
        const npcCol =
          tp === "narc"
            ? Util.pick(narcCols)
            : tp === "cat"
              ? Util.pick(["#ee8833", "#c8b090", "#a8703a", "#e8c44a"])
              : tp === "coin"
                ? C_COIN
                : _propCfg
                  ? Util.pick(_propCfg.cols)
                  : Util.pick(A2_NPC_COLORS);
        a2NPCs.push({
          wx: nx,
          ru: ri,
          tp,
          tl,
          st: "idle",
          sp: "",
          spT: 0,
          col: npcCol,
          cd: 0,
          kind: npcKind,
          amb: ambLine,
          ambShow: false,
          art: npcArt,
          helloTags: [],
          sayMoreTags: null,
        });
      }
    }

    for (let cx = from + Util.randInt(8, 20); cx < to; cx += Util.randInt(20, 40))
      a2Clouds.push({
        wx: cx,
        y: Util.randInt(0, 1),
        art: Util.pick([
          [".-~~~-.", "(      )", " `~~~' "],
          [".-~~-.", "(     )", " `~~' "],
        ]),
      });

    a2Gen = to;
  }

  function _a2ShowRecruitProgress(delayMs) {
    const _rem = A2_MIN - a2CrewCount;
    // Detect cat recruit: most recent crew member was a cat
    const _lastCrew = a2Crew[a2Crew.length - 1];
    const _wasCat = _lastCrew && _lastCrew.isCat;
    let _progressMsg;
    if (_rem > 0) {
      if (_wasCat) {
        const _catMsg = window.LANG.recruitProgressCat || "a cat joins the crew — {rem} {noun} to go!";
        const _ordinals = window.LANG.recruitOrdinals;
        const _remOrd = _ordinals[_rem - 1] || String(_rem);
        const _catNoun = _rem === 1 ? window.LANG.recruitNounSingular : window.LANG.recruitNounPlural;
        _progressMsg = _catMsg.replace("{rem}", _remOrd).replace("{noun}", _catNoun);
      } else {
        const _ordinals = window.LANG.recruitOrdinals;
        const _haveOrd = _ordinals[a2CrewCount - 1] || String(a2CrewCount);
        const _remOrd = _ordinals[_rem - 1] || String(_rem);
        const _firstChar = _remOrd.charAt(0).toLowerCase();
        const _isVowel = /[aeiouhàâéèêëîïôùûüœ]/.test(_firstChar);
        const _que = window.LANG === window.LANG_FR ? (_isVowel ? "PLUS QU'" : "PLUS QUE ") : "";
        _progressMsg = window.LANG.recruitProgress1
          .replace("{ord}", _haveOrd)
          .replace("{que} ", _que)
          .replace("{que}", _que.trim())
          .replace("{rem}", _remOrd)
          .replace("{remaining}", window.LANG.recruitProgressRemaining);
      }
    } else {
      _progressMsg = _wasCat ? window.LANG.recruitProgressCompleteCat || "★ CREW COMPLETE (with cat) ★" : window.LANG.recruitProgressComplete;
    }
    if (!_progressMsg || _progressMsg.trim() === "") _progressMsg = a2CrewCount + "/" + A2_MIN;
    if (_rem > 0) {
      setTimeout(() => addFloat(_progressMsg, 0, 0, _wasCat ? C_CAT : C_ORANGE), delayMs);
    }
  }


  function initAct3() {
    audio.play("level");
    Music.transition("music_act3");
    audio.preload(["music_act4"]);
    phase = "act3";
    hasPlayed = true;
    a2Layout();
    a2CrewCount = 0;
    a2Ht = 0;
    _hudPopPrev.crew = 0;
    _hudPopT.crew = 0;
    _hudPopPrev.narcs2 = 0;
    _hudPopT.narcs2 = 0;
    a2T = 0;
    a2Spd = 0.006;
    a2WX = 0;
    a2Blocks = [];
    a2Roads = [];
    a2NPCs = [];
    a2Crew = [];
    a2Clouds = [];
    a2Gen = 0;
    a2NPCsSpawned = 0;
    a2CatSpawned = false;
    a3PropWill = {};
    a3PropDone = {};
    for (const p of A3_PROPS) a3PropWill[p.key] = p.guaranteed || Math.random() < p.chance;
    a2ConvsCompleted = 0;
    a2CatRecruited = false;
    a2LastCatSpawnX = 0;
    a2HudFlashT = 0;
    a2HasTalked = false; // has the player started any conversation yet
    a2HasHopped = false; // has the player switched lanes yet
    a2HasMoved = false; // has the player moved horizontally at all
    a2PromptCooldown = 0;
    a2HasAdvancedDialogue = false;
    a2HudFlashMsg = "";
    a2TimeWarned = false;
    a2TimeoutFired = false;
    a2PRu = Math.max(0, A2_NUM_LANES - 2);
    a2PX = Math.floor(W / 2);
    a2PY = a2RuY(a2PRu);
    a2TargetY = a2PY;
    a2Hopping = false;
    a2HopIntent = 0;
    a2HopTimer = 0;
    a2PAnim = 0;
    a2PAnimT = 0;
    a2TN = null;
    a2TP = 0;
    a2TT = 0;
    a2TalkCD = 0;
    a2LastConvEndT = -99999;
    _a2TNWas = false;

    a2SV = false;
    a2SW = 500;
    a2SD = false;
    a2SDT = null;
    a2SDFired = false;
    dialogStack = [];
    _convChunkTimer = 0;
    a2GenChunk(0, W * 3);
    _updateDomHud();
    Banner.timer = 0;
  }


  const A2_WAITING_TPS = new Set([2, 12, 13, 141, 142, 14, 15, 24, 25, 251, 7, 8, 9, 10, 11, 30, 31, 32]);

  function updateAct3(dt) {
    if (!a2TN) a2T += dt;
    Banner.update(dt);
    dialogUpdate(dt);

    if (_a2TNWas && !a2TN) {
      a2LastConvEndT = a2T;
      a2ConvsCompleted++;
      if (!a2CatSpawned) {
        const _px = a2WX + a2PX;
        const _cand = a2NPCs.filter((n) => n.tp === "norm" && n.st === "idle" && n.wx > _px + 15 && n.wx < _px + 100).sort((x, y) => x.wx - y.wx)[0];
        if (_cand) {
          _cand.tp = "cat";
          _cand.tl = 0;
          _cand.art = [" ", Util.pick(CAT_GLYPHS)];
          _cand.col = Util.pick(["#ee8833", "#c8b090", "#a8703a", "#e8c44a"]);
          _cand.amb = drawDeck("catAmb", window.LANG.act3CatAmb || ["miaou...", "prrrr", "mrrrow"]);
          a2CatSpawned = true;
          a2LastCatSpawnX = _cand.wx;
        }
      }
    }
    _a2TNWas = !!a2TN;
    if (a2TalkCD > 0) a2TalkCD -= dt;
    if (a2HudFlashT > 0) a2HudFlashT -= dt;
    if (a2PromptCooldown > 0) a2PromptCooldown -= dt;

    const A2_TAP_MIN_MS = 250;

    const _a2ChoicePending = convChoices && convChoicePicked >= 0;
    const _a2DialogueTap =
      (clickPending || input.justPressed("action")) && !(convChoices && !_a2ChoicePending && clickSY >= convChoiceY1 && clickSY <= convChoiceY2);
    const _a2HasChunks = _convChunkQueue.length > 0;

    if (_a2DialogueTap && A2_WAITING_TPS.has(a2TP)) {
      a2HasAdvancedDialogue = true;
    }
    for (const n of a2NPCs) {
      if (n.spT > 0) n.spT -= dt;
      if (n.cd > 0) n.cd -= dt;
      if (n.bangT > 0) n.bangT -= dt;
    }

    // Approaching NPCs track the player and turn back if they overshoot.
    if (!a2TN) {
      for (const n of a2NPCs) {
        if (n.st !== "approaching") continue;
        const _calm = a2T - a2LastConvEndT > A2_RETURN_CALM_MS;
        if (!_calm || a2SV) {
          n.wx += a2Spd * dt; // match the scroll: hold screen position
          continue;
        }
        // Walk toward the player at world-scroll-plus — forward or back.
        const _pwxNow = a2WX + a2PX;
        n.wx += (_pwxNow - 2 - n.wx >= 0 ? 1 : -1) * a2Spd * A2_RETURN_SPEED_MULT * dt;
        // Lane-snap toward the player's lane when we're at a gap.
        if (n.ru !== a2PRu) {
          let atGap = false;
          for (const rd of a2Roads)
            if (n.wx >= rd.wx - 2 && n.wx <= rd.wx + A2_VRW + 2) {
              atGap = true;
              break;
            }
          if (!atGap)
            for (const blk of a2Blocks)
              if (Math.abs(n.wx - blk.wx) <= 3 || Math.abs(n.wx - (blk.wx + blk.w)) <= 3) {
                atGap = true;
                break;
              }
          if (atGap) {
            // Step one lane toward player per frame the NPC is at a gap.
            n.ru += n.ru < a2PRu ? 1 : -1;
          }
        }
      
        const pwx = a2WX + a2PX;
        if (n.ru === a2PRu && Math.abs(n.wx - pwx) < A2_RETURN_REACH_DIST) {
          const nearOther = a2NPCs.some((o) => o !== n && o.ru === a2PRu && o.st === "idle" && Math.abs(o.wx - pwx) < A2_RETURN_BUSY_RADIUS);
          if (nearOther) {
            continue;
          }
          convReset();
          convAnchorPX = Math.round(a2PX);
          convAnchorNX = Math.round(n.wx - a2WX);
          convAnchorY = Math.round(a2PY);
          convPlayerColor = C_PLAYER;
          convNPCColor = n.col;
          convVisible = true;
          DM.startConv();
          convAddLine(DM.draw(DECK_RETURN, n.notNowTags ?? []), "them", n.col);
          a2TN = n;
          a2TP = 11;
          a2TT = 0;
          a2Choice = -1;
          break; // only one conv at a time
        }
      }
    }
    a2PAnimT += dt;
    if (a2PAnimT > 250) {
      a2PAnimT = 0;
      a2PAnim = 1 - a2PAnim;
    }

    /* ── CONVERSATION STATE MACHINE (a2TP) ──────────────────────
     ─────────────────────────────────────────────────────────── */

    if (a2TN) {
      const _lastFullyTyped = convLog.length === 0 || convReveal[convLog.length - 1] >= convLog[convLog.length - 1].text.length;
      if (_lastFullyTyped) a2TT += dt;

      const psx = Math.round(a2PX),
        nsx = Math.round(a2TN.wx - a2WX),
        psy = Math.round(a2PY);
      convAnchorPX = psx;
      convAnchorNX = nsx;
      convAnchorY = psy;

      // ── TP 0: open conv, fire greet (auto)
      if (a2TP === 0 && a2TT > T.beat) {
        dialogStack = [];
        convReset();
        convAnchorPX = psx;
        convAnchorNX = nsx;
        convAnchorY = psy;
        convPlayerColor = C_PLAYER;
        convNPCColor = a2TN.col || C_CONV_NPC;
        convVisible = true;
        DM.startConv();
        // Constrain the greet to one whose tag exists in the spawned NPC's

        const npcHelloDeck = a2TN.tp === "narc" ? DECK_NARC_HELLO : a2TN.kind === "angry" ? DECK_ANGRY_HELLO : DECK_HUNGRY_HELLO;
        const npcTagPool = [...new Set(npcHelloDeck.src.flatMap((c) => c.tags || []))];
        const greetResult = DM.drawWithTags(DECK_GREET, npcTagPool);
        a2TN.greetTags = greetResult.tags;
        convAddLine(greetResult.text, "you", convPlayerColor);
        a2TP = 12;
        a2TT = 0;
      }

      // ── TP 2: immediate join after match (tap) ───────────────
      else if (a2TP === 2 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            const joinLine = DM.draw(DECK_JOIN_CONSENT, a2TN.helloTags ?? []);
            convAddLine(joinLine, "them", convNPCColor);
            a2TP = 8;
            a2TT = 0;
          }
        }
      }

      // ── TP 12: NPC replies (tap) ─────────────────────────────
      else if (a2TP === 12 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            let helloDeck;
            if (a2TN.tp === "narc") helloDeck = DECK_NARC_HELLO;
            else if (a2TN.kind === "angry") helloDeck = DECK_ANGRY_HELLO;
            else helloDeck = DECK_HUNGRY_HELLO;

            DM.clearLastTags();
            const { text: line, tags } = DM.drawWithTags(helloDeck, a2TN.greetTags ?? []);
            a2TN.helloTags = tags;

            convAddLine(line, "them", convNPCColor);
            a2TP = 13;
            a2TT = 0;
          }
        }
      }

      // ── TP 13: show first pitch choices (tap) ────────────────
      else if (a2TP === 13 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            const matchResult = DM.drawWithTags(
              a2TN.tp === "narc" ? DECK_NARC_AGREE : a2TN.kind === "angry" ? DECK_ANGRY_PITCH : DECK_HUNGRY_PITCH,
              a2TN.helloTags ?? [],
            );
            const badReadResult = DM.drawWithTags(DECK_BAD_READ, a2TN.helloTags ?? []);
            const bailResult = DM.drawWithTags(DECK_BACK_OFF_EARLY, a2TN.helloTags ?? []);
            a2ChoiceTags = [matchResult.tags, badReadResult.tags, bailResult.tags];
            a2PitchLines = [matchResult.text, badReadResult.text, bailResult.text];
            DM.clearLastTags();
            const commiserateOptions = a2TN.kind === "angry" ? window.LANG.choiceCommiserateAngry : window.LANG.choiceCommiserateHungry;
            const semanticLabels = [Util.pick(commiserateOptions), Util.pick(window.LANG.choiceTalkOver), window.LANG.choiceRun];
            a2ChoiceOrder = Util.shuffle([0, 1, 2]);
            a2ChoiceLabels = a2ChoiceOrder.map((i) => semanticLabels[i]);
            convShowChoices(a2ChoiceLabels);
            a2Choice = -1;
            a2TP = 1;
            a2TT = 0;
          }
        }
      }

      // ── TP 1: wait for first pitch choice ────────────────────
      else if (a2TP === 1 && a2TT > A2.CHOICE_LOCK) {
        if (clickPending) {
          clickPending = false;
          if (clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
            let picked = convChoices.length - 1;
            for (let ci = 0; ci < convChoiceYs.length - 1; ci++) {
              if (clickSY < convChoiceYs[ci + 1]) {
                picked = ci;
                break;
              }
            }
            const lastChoiceStart = convChoiceYs[convChoiceYs.length - 1] ?? convChoiceY1;
            if (picked < convChoices.length - 1 || clickSY >= lastChoiceStart) {
              a2ChoiceDisplayPicked = picked;
              a2Choice = a2ChoiceOrder[picked];
            }
          }
        }
        if (input.justPressed("up")) convChoiceHover = Math.max(0, (convChoiceHover < 0 ? 0 : convChoiceHover) - 1);
        if (input.justPressed("down")) convChoiceHover = Math.min((convChoices?.length ?? 1) - 1, (convChoiceHover < 0 ? -1 : convChoiceHover) + 1);
        if (input.justPressed("action") && convChoiceHover >= 0) {
          a2ChoiceDisplayPicked = convChoiceHover;
          a2Choice = a2ChoiceOrder[convChoiceHover];
        }

        if (a2Choice >= 0 && a2TP === 1) {
          triggerChoiceConfirm();
          convChoicePicked = a2ChoiceDisplayPicked;
          const _line = a2PitchLines[a2Choice];
          const _picked = a2Choice;
          const _startPhase = phase;
          setTimeout(() => {
            if (phase !== _startPhase || !a2TN) return;
            convChoicePicked = -1;
            convHideChoices();
            convAddLine(_line, "you", convPlayerColor);
          }, 400);

          if (_picked === 2) a2TP = 25;
          else if (_picked === 1 && a2TN.tp !== "narc") a2TP = 14;
          else a2TP = 141;
          a2TT = -600;
        }
      }

      // ── TP 141: route after first pitch (tap) ────────────────
      else if (a2TP === 141 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            const matched = a2Choice === 0;
            if (matched) {
              const fillerResult = DM.drawWithTags(DECK_FILLER, a2ChoiceTags[a2Choice] ?? []);
              a2TN.fillerTags = fillerResult.tags;
              convAddLine(fillerResult.text, "them", convNPCColor);
              a2TP = 142;
            } else {
              a2TP = 14;
            }
            a2TT = 0;
          }
        }
      }

      // ── TP 142: wait for invite/walk away choice (tap) ───────
      else if (a2TP === 142 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            const inviteLabel = a2TN.kind === "angry" ? window.LANG.choiceRecruitAngry : window.LANG.choiceRecruitHungry;
            a2ChoiceLabels = [inviteLabel, window.LANG.choiceWalkAwayShort];
            const inviteResult = DM.drawWithTags(DECK_F_INVITE, a2TN.fillerTags ?? []);
            a2TN.inviteTags = inviteResult.tags;
            const bailLateResult = DM.drawWithTags(DECK_BACK_OFF_EARLY, a2TN.fillerTags ?? []);
            a2TN.bailLateTags = bailLateResult.tags;
            a2PitchLines = [inviteResult.text, bailLateResult.text];
            convShowChoices(a2ChoiceLabels);
            a2Choice = -1;
            a2TP = 143;
            a2TT = 0;
          }
        }
      }

      // ── TP 143: wait for invite/walk away input ───────────────
      else if (a2TP === 143 && a2TT > A2.CHOICE_LOCK) {
        if (clickPending) {
          clickPending = false;
          if (clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
            const half = Math.floor((convChoiceY1 + convChoiceY2) / 2);
            a2Choice = clickSY < half ? 0 : 1;
          }
        }
        if (input.justPressed("up")) convChoiceHover = Math.max(0, (convChoiceHover < 0 ? 0 : convChoiceHover) - 1);
        if (input.justPressed("down")) convChoiceHover = Math.min((convChoices?.length ?? 1) - 1, (convChoiceHover < 0 ? -1 : convChoiceHover) + 1);
        if (input.justPressed("action") && convChoiceHover >= 0) a2Choice = convChoiceHover;

        if (a2Choice >= 0 && a2TP === 143) {
          triggerChoiceConfirm();
          convChoicePicked = a2Choice;
          const _line = a2PitchLines[a2Choice];
          const _picked = a2Choice;
          const _startPhase = phase;
          setTimeout(() => {
            if (phase !== _startPhase || !a2TN) return;
            convChoicePicked = -1;
            convHideChoices();
            convAddLine(_line, "you", convPlayerColor);
          }, 400);
          if (_picked === 1) a2ChoiceTags[2] = a2TN.bailLateTags ?? [];
          a2TP = _picked === 1 ? 25 : 144;
          a2TT = -600;
        }
      }

      // ── TP 144: NPC responds to invite (tap) ─────────────────
      else if (a2TP === 144 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            if (a2TN.tp === "narc") {
              // Narc was invited — they've heard enough to feel safe. Reveal.
              convAddLine(DM.draw(DECK_NARC_REV, a2TN.inviteTags ?? []), "them", C_DANGER);
              a2TP = 9;
            } else {
              const hasSayMore = DM.hasTaggedMatch(DECK_SAY_MORE_WARM, a2TN.inviteTags ?? []);
              const r = Math.random();
              if (r < A2_MAYBE_LATER_CHANCE) {
                const notNowResult = DM.drawWithTags(DECK_NOT_NOW, a2TN.inviteTags ?? []);
                a2TN.notNowTags = notNowResult.tags.length > 0 ? notNowResult.tags : (a2TN.inviteTags ?? []);
                convAddLine(notNowResult.text, "them", convNPCColor);
                a2TP = 10;
              } else if (!hasSayMore || r < A2_MAYBE_LATER_CHANCE + 0.8 * (1 - A2_MAYBE_LATER_CHANCE)) {
                const joinLine = DM.draw(DECK_JOIN_CONSENT, a2TN.inviteTags ?? []);
                convAddLine(joinLine, "them", convNPCColor);
                a2TP = 8;
              } else {
                const warmResult = DM.drawWithTags(DECK_SAY_MORE_WARM, a2TN.inviteTags ?? []);
                a2TN.sayMoreTags = warmResult.tags.length > 0 ? warmResult.tags : (a2TN.inviteTags ?? []);
                convAddLine(warmResult.text, "them", convNPCColor);
                a2TP = 15;
              }
            }
            a2TT = 0;
          }
        }
      }

      // ── TP 14: check match, route (tap) ──────────────────────
      else if (a2TP === 14 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            const matched = a2Choice === 0;
            if (a2TN.tp === "narc") {
              const skeptResult = DM.drawWithTags(DECK_SAY_MORE_SKEPTICAL, a2TN.inviteTags ?? a2ChoiceTags[a2Choice] ?? []);
              a2TN.sayMoreTags = skeptResult.tags.length > 0 ? skeptResult.tags : (a2TN.inviteTags ?? a2ChoiceTags[a2Choice] ?? []);
              convAddLine(skeptResult.text, "them", convNPCColor);
              a2TP = 15;
            } else if (!matched) {
              const mismatchDeck = a2TN.kind === "hungry" ? DECK_MISMATCH_TOO_STRUCTURAL : DECK_MISMATCH_TOO_LITERAL;
              const badReadTags = a2ChoiceTags[1] ?? [];
              convAddLine(DM.draw(mismatchDeck, badReadTags) + " " + DM.draw(DECK_NO_BYE, badReadTags), "them", convNPCColor);
              setTimeout(
                () => addFloat(Util.pick([window.LANG.floatReadTheRoom, window.LANG.floatListenBetter, window.LANG.floatWrongEnergy]), 0, 0, C_WARN),
                convFadeDuration + 800,
              );
              a2TP = 7;
            } else {
              // Roll for: immediate join (TP 8), say-more (TP 15), or maybe-later (TP 10).
              const r = Math.random();
              if (r < A2_MAYBE_LATER_CHANCE) {
                const notNowResult = DM.drawWithTags(DECK_NOT_NOW, a2TN.inviteTags ?? a2ChoiceTags[a2Choice] ?? []);
                a2TN.notNowTags = notNowResult.tags.length > 0 ? notNowResult.tags : (a2TN.inviteTags ?? []);
                convAddLine(notNowResult.text, "them", convNPCColor);
                a2TP = 10;
              } else if (r < A2_MAYBE_LATER_CHANCE + 0.8 * (1 - A2_MAYBE_LATER_CHANCE)) {
                const joinLine = DM.draw(DECK_JOIN_CONSENT, a2TN.inviteTags ?? []);
                convAddLine(joinLine, "them", convNPCColor);
                a2TP = 8;
              } else {
                const warmResult = DM.drawWithTags(DECK_SAY_MORE_WARM, a2TN.inviteTags ?? []);
                a2TN.sayMoreTags = warmResult.tags.length > 0 ? warmResult.tags : (a2TN.inviteTags ?? []);
                convAddLine(warmResult.text, "them", convNPCColor);
                a2TP = 15;
              }
            }
            a2TT = 0;
          }
        }
      }

      // ── TP 15: show second round choices (tap) ───────────────
      else if (a2TP === 15 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            const pitchTags = a2TN.sayMoreTags ?? [];
            const strongerResult = DM.drawWithTags(DECK_STRONGER_PITCH, pitchTags);
            a2TN.strongerTags = strongerResult.tags.length > 0 ? strongerResult.tags : pitchTags;
            a2PitchLines = [strongerResult.text, DM.draw(DECK_BACK_OFF_LATE, pitchTags)];
            const tryHarderLabel = a2TN.kind === "angry" ? window.LANG.choiceTryHarderAngry : window.LANG.choiceTryHarderHungry;
            a2ChoiceLabels = [tryHarderLabel, window.LANG.choiceWalkAway];
            convShowChoices(a2ChoiceLabels);
            a2Choice = -1;
            a2TP = 23;
            a2TT = 0;
          }
        }
      }

      // ── TP 23: wait for second choice ────────────────────────
      else if (a2TP === 23 && a2TT > A2.CHOICE_LOCK) {
        if (clickPending) {
          clickPending = false;
          if (clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
            const half = Math.floor((convChoiceY1 + convChoiceY2) / 2);
            a2Choice = clickSY < half ? 0 : 1;
          }
        }
        if (input.justPressed("up")) convChoiceHover = Math.max(0, (convChoiceHover < 0 ? 0 : convChoiceHover) - 1);
        if (input.justPressed("down")) convChoiceHover = Math.min((convChoices?.length ?? 1) - 1, (convChoiceHover < 0 ? -1 : convChoiceHover) + 1);
        if (input.justPressed("action") && convChoiceHover >= 0) a2Choice = convChoiceHover;

        if (a2Choice >= 0 && a2TP === 23) {
          triggerChoiceConfirm();
          convChoicePicked = a2Choice;
          const _line = a2PitchLines[a2Choice];
          const _startPhase = phase;
          setTimeout(() => {
            if (phase !== _startPhase || !a2TN) return;
            convChoicePicked = -1;
            convHideChoices();
            convAddLine(_line, "you", convPlayerColor);
          }, 400);
          a2TP = 24;
          a2TT = -600;
        }
      }

      // ── TP 24: resolve second choice (tap) ───────────────────
      else if (a2TP === 24 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            if (a2Choice === 1) {
              DM.endConv();
              const wasNarc = a2TN.tp === "narc";
              a2TN.st = "done";
              a2TN.cd = 9999;
              a2TN = null;
              a2TalkCD = 500;
              if (wasNarc) Banner.show(window.LANG.bannerGoodCallNarc, C_SUCCESS, T.bannerHold);
              else addFloat(Util.pick([window.LANG.floatTooCautious, window.LANG.floatGiveChance, window.LANG.floatNeverChange]), 0, 0, C_WARN);
              convEndWhenDone(A2.RECRUIT_CLOSE, () => {
                dialogStack = [];
                convStartFade();
              });
            } else if (a2TN.tp === "narc") {
              convAddLine(DM.draw(DECK_NARC_REV, a2TN.strongerTags ?? []), "them", C_DANGER);
              a2TP = 9;
              a2TT = 0;
            } else {
              if (Math.random() < 0.6) {
                const joinLine = DM.draw(DECK_JOIN_CONSENT, a2TN.strongerTags ?? []);
                convAddLine(joinLine, "them", convNPCColor);
                a2TP = 8;
              } else {
                const notNowResult = DM.drawWithTags(DECK_NOT_NOW, a2TN.strongerTags ?? []);
                a2TN.notNowTags = notNowResult.tags.length > 0 ? notNowResult.tags : (a2TN.strongerTags ?? []);
                convAddLine(notNowResult.text, "them", convNPCColor);
                a2TP = 10;
              }
              a2TT = 0;
            }
          }
        }
      }

      // ── TP 25: player bailed first round (tap) ───────────────
      else if (a2TP === 25 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            convAddLine(DM.draw(DECK_BAIL_RESPONSE, a2ChoiceTags[2] ?? []), "them", convNPCColor);
            a2TP = 251;
            a2TT = 0;
          }
        }
      }

      // ── TP 251: close after bail (tap) ───────────────────────
      else if (a2TP === 251 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            DM.endConv();
            const wasNarc = a2TN.tp === "narc";
            a2TN.st = "done";
            a2TN.cd = 9999;
            a2TN = null;
            a2TalkCD = 500;
            if (wasNarc) addFloat(Util.pick([window.LANG.floatGoodCallSmelled]), 0, 0, C_SUCCESS);
            else addFloat(Util.pick([window.LANG.floatTooCautious, window.LANG.floatGiveChance, window.LANG.floatNeverChange]), 0, 0, C_WARN);
            convEndWhenDone(T.exit, () => {
              dialogStack = [];
              convStartFade();
            });
          }
        }
      }

      // ── TP 7: NPC declined (tap) ─────────────────────────────
      else if (a2TP === 7 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            DM.endConv();
            a2TN.st = "done";
            a2TN.cd = 9999;
            a2TN = null;
            a2TalkCD = 500;
            convEndWhenDone(T.exit, () => {
              dialogStack = [];
              convStartFade();
            });
          }
        }
      }

      // ── TP 8: recruit! (tap) ─────────────────────────────────
      else if (a2TP === 8 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            DM.endConv();
            const n = a2TN;
            n.st = "rec";
            a2CrewCount++;
            audio.play("recruit");
            for (let _bi = 0; _bi < 4; _bi++) spark(Math.round(a2PX) + Util.randInt(-3, 3), Math.round(a2PY) + Util.randInt(-2, 2), C_TEAL, 12);
            triggerFlashGood();
            a2Crew.push({ b: Math.random() * 6, ru: n.ru, art: n.art, col: n.col, jwx: n.wx, jny: a2NpcY(n), j0: a2T });
            _a2ShowRecruitProgress(A2.RECRUIT_CLOSE + convFadeDuration);
            a2TN.cd = 1000;
            a2TN = null;
            a2TalkCD = 500;
            convEndWhenDone(A2.RECRUIT_CLOSE, () => {
              dialogStack = [];
              convStartFade();
            });
          }
        }
      }

      // ── TP 9: narc reveal consequence (auto — the reveal line already told you; tap only skips the pause) ──
      else if (a2TP === 9 && (a2TT > A2.NARC_PAUSE || (_a2DialogueTap && a2TT > A2_TAP_MIN_MS))) {
        clickPending = false;
        if (_a2HasChunks) {
          _convChunkFlush();
          _convChunkTimer = 999999;
          a2TT = 0;
        } else {
          DM.endConv();
          const n = a2TN;
          n.st = "angry";
          n.col = C_DANGER;
          a2Ht++;
          audio.play("narc");
          addFloat(window.LANG.floatNarcRecruited || window.LANG.floatNarc, 0, 0, C_DANGER);

          const _narcSX = Math.round(a2TN.wx - a2WX);
          const _narcSY = Math.round(a2NpcY(a2TN)); // body row
          Effects.start("corrupt", { x: _narcSX, y: _narcSY - 1, radius: 5, duration: 1100, intensity: 1.4, swap: true });
          setTimeout(() => {
            if (phase !== "act3") return;
            Effects.start("corrupt", { x: Math.round(a2PX), y: Math.round(a2PY) - 1, radius: 10, duration: 800, intensity: 1.0, swap: true });
          }, 400);

          spark(Math.round(a2PX), Math.round(a2PY), C_DANGER, 14);
          triggerChromatic(500);
          for (let _nb = 0; _nb < 5; _nb++) spark(Math.round(a2PX) + Util.randInt(-4, 4), Math.round(a2PY) + Util.randInt(-2, 2), C_DANGER, 14);
          spark(Math.round(a2TN.wx - a2WX), Math.round(a2NpcY(a2TN)), C_DANGER, 16);
          if (a2Ht >= A2_MH) {
            setTimeout(() => triggerCorruptBust("busted", initAct3), 1100);
          }
          a2TN.cd = 1000;
          a2TN = null;
          a2TalkCD = 500;
          convEndWhenDone(T.exit, () => {
            dialogStack = [];
            convReset();
          });
        }
      }

      // ── TP 10: NPC defers (tap) ──────────────────────────────
      else if (a2TP === 10 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            DM.endConv();
            const n = a2TN;
            n.st = "maybe";
            n.cd = 9999;
            addFloat(Util.pick([window.LANG.floatNotYet, window.LANG.floatNeedTime]), 0, 0, C_THINKING);
            n.thinkLine = Util.pick(window.LANG.act3Undecided);
            a2TN = null;
            a2TalkCD = 500;
            convEndWhenDone(T.exit, () => {
              dialogStack = [];
              convStartFade();
            });
            const _returnPhase = phase;
            const _returnStartT = a2T; // track total time spent waiting to return
            const A2_RETURN_MAX_WAIT_MS = 30000; // hard ceiling — give up after 30s of trying
        
            const _tryReturn = () => {
              if (n.st !== "maybe") return;
              if (phase !== _returnPhase) return;
              if (a2T - _returnStartT > A2_RETURN_MAX_WAIT_MS) {
                n.st = "done";
                n.cd = 9999;
                return;
              }
              // Temporary block 1: player is in another conversation. Wait and retry.
              if (a2TN) {
                setTimeout(_tryReturn, A2_RETURN_RECHECK_MS);
                return;
              }
              const pwx = a2WX + a2PX;
              const busyNPC = a2NPCs.find(
                (o) => o !== n && o.ru === a2PRu && (o.st === "idle" || o.st === "approaching") && Math.abs(o.wx - pwx) < A2_RETURN_BUSY_RADIUS,
              );
              if (busyNPC) {
                setTimeout(_tryReturn, A2_RETURN_RECHECK_MS);
                return;
              }
              // All clear — spawn off-screen left in the player's current lane.
              n.st = "approaching";
              n.wx = a2WX - A2_RETURN_SPAWN_OFFSET;
              n.ru = a2PRu;
              n.bangT = A2_RETURN_BANG_MS;
              n.cd = 0;
              n.thinkLine = Util.pick(window.LANG.act3Wait);
            };
            // wait before NPC chases to catch up
            setTimeout(_tryReturn, 12000 + Math.random() * 3000);
          }
        }
      }

      // ── TP 11: returning NPC — tap to recruit (mirrors TP 8) ──
      else if (a2TP === 11 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            DM.endConv();
            const n = a2TN;
            n.st = "rec";
            a2CrewCount++;
            audio.play("recruit");
            for (let _bi = 0; _bi < 4; _bi++) spark(Math.round(a2PX) + Util.randInt(-3, 3), Math.round(a2PY) + Util.randInt(-2, 2), C_TEAL, 12);
            triggerFlashGood();
            a2Crew.push({ b: Math.random() * 6, ru: n.ru, art: n.art, col: n.col, jwx: n.wx, jny: a2NpcY(n), j0: a2T });
            _a2ShowRecruitProgress(A2.RECRUIT_CLOSE + convFadeDuration);
            n.cd = 1000;
            a2TN = null;
            a2TalkCD = 500;
            convEndWhenDone(A2.RECRUIT_CLOSE, () => {
              dialogStack = [];
              convStartFade();
            });
          }
        }
      }

      // ── TP 30: cat said miaou; tap reveals player's response ──
      else if (a2TP === 30 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            const _catLine = a2TN._catLine;
            convAddLine(_catLine.you, "you", C_PLAYER);
            a2TP = 32;
            a2TT = 0;
          }
        }
      }

      // ── TP 32: player responded to cat; tap to show recruit choice ──
      else if (a2TP === 32 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            a2ChoiceLabels = [window.LANG.choiceRecruitCat, window.LANG.choiceWalkAwayShort];
            convShowChoices(a2ChoiceLabels);
            a2Choice = -1;
            a2TP = 33;
            a2TT = 0;
          }
        }
      }

      // ── TP 33: wait for recruit/walk away choice on cat ──
      else if (a2TP === 33 && a2TT > A2.CHOICE_LOCK) {
        if (clickPending) {
          clickPending = false;
          if (clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
            const half = Math.floor((convChoiceY1 + convChoiceY2) / 2);
            a2Choice = clickSY < half ? 0 : 1;
          }
        }
        if (input.justPressed("up")) convChoiceHover = Math.max(0, (convChoiceHover < 0 ? 0 : convChoiceHover) - 1);
        if (input.justPressed("down")) convChoiceHover = Math.min((convChoices?.length ?? 1) - 1, (convChoiceHover < 0 ? -1 : convChoiceHover) + 1);
        if (input.justPressed("action") && convChoiceHover >= 0) a2Choice = convChoiceHover;

        if (a2Choice >= 0 && a2TP === 33) {
          triggerChoiceConfirm();
          convChoicePicked = a2Choice;
          const _picked = a2Choice;
          const _startPhase = phase;
          setTimeout(() => {
            if (phase !== _startPhase || !a2TN) return;
            convChoicePicked = -1;
            convHideChoices();
            const n = a2TN;
            if (_picked === 0) {
              a2CatRecruited = true;
              n.st = "rec";
              a2CrewCount++;
              a2Crew.push({
                b: Math.random() * 6,
                ru: n.ru,
                art: n.art,
                col: n.col,
                isCat: true,
                jwx: n.wx,
                jny: a2NpcY(n),
                j0: a2T,
              });
              audio.play("recruit");
              burstGood(Math.round(a2PX), Math.round(a2PY), n.col || C_CAT, 10);
              triggerFlashGood();
              _a2ShowRecruitProgress(A2.RECRUIT_CLOSE + convFadeDuration);
              n.cd = 1000;
            } else {
              n.st = "done";
              n.cd = 9999;
              addFloat(Util.pick(window.LANG.floatCatDeclined), 0, 0, C_WARN);
            }
            a2TN = null;
            a2TalkCD = 500;
            convEndWhenDone(A2.RECRUIT_CLOSE, () => {
              dialogStack = [];
              convStartFade();
            });
          }, 400);
          a2TT = -600;
        }
      }

      return;
    }
    /* ── end a2TN block ───────────────────────────────────────── */

    if (a2SD) {
      if (a2SDT === null) {
        a2SDT = 0;
        // Wait for any open conv panel to fade before celebrating
        convStartFade();
      }
      a2SDT += dt;
      // After fade completes, fire the celebration
      if (!a2SDFired && a2SDT > convFadeDuration + 200) {
        a2SDFired = true;
        const ppx = Math.round(a2PX),
          ppy = Math.round(a2PY);
        // Big simultaneous burst centered on the player
        for (let _bi = 0; _bi < 5; _bi++) {
          burstGood(ppx + Util.randInt(-6, 6), ppy + Util.randInt(-3, 3), C_TEAL, 14);
        }
        burstGood(ppx, ppy, C_PLAYER, 18);
        triggerFlashGood();
        triggerFlashGold();
        audio.play("recruit");
        audio.play("trumpet");
        setTimeout(() => {
          burstGood(ppx - 8, ppy, C_TEAL, 10);
          burstGood(ppx + 8, ppy, C_TEAL, 10);
          triggerFlashGold();
          audio.play("recruit");
        }, 350);
        setTimeout(() => {
          // Burst around each crew member
          for (let _ci = 0; _ci < a2Crew.length; _ci++) {
            const _cx = Math.round(ppx - 3 - _ci * 3);
            const _cy = Math.round(ppy + (_ci % 2 === 0 ? -1 : 1));
            burstGood(_cx, _cy, a2Crew[_ci].col || C_TEAL, 8);
          }
          triggerFlashGood();
        }, 700);
        setTimeout(() => {
          // Final flourish — tight around player and nearest crew
          const _crewSpan = Math.min(a2Crew.length * 3, 12);
          for (let _bi = 0; _bi < 3; _bi++) {
            burstGood(ppx + Util.randInt(-_crewSpan, 2), ppy + Util.randInt(-2, 2), C_TEAL, 8);
          }
          triggerFlashGold();
        }, 1100);
        Banner.show(window.LANG.bannerYouHaveACrew, C_PLAYER, 99999);
      }
      // Hold the celebration ~3s total, then auto-cut to inter (no tap needed)
      if (a2SDFired && a2SDT > convFadeDuration + 200 + 3000) {
        Banner.timer = 0;
        _transitionAct3ToAct4();
      }
      return;
    }

    if (!a2SV && a2CrewCount >= A2_MIN) {
      a2SV = true;
      a2SD = true;
    }

    const _pwxForSpd = a2WX + a2PX;
    const _narcBubbleNearby = a2NPCs.some((n) => n.tp === "narc" && n.st === "idle" && Math.abs(n.wx - _pwxForSpd) < 26 && Math.abs(n.wx - _pwxForSpd) > 3);
    a2Spd = (0.004 + a2T * 0.00000015) * (_narcBubbleNearby ? 0.6 : 1);
    const a2Frozen = convVisible || !!a2TN;
    if (!a2Frozen && !convFading) a2WX += a2Spd * dt;
    while (a2Gen < a2WX + W + 150) a2GenChunk(a2Gen, a2Gen + 80);

    // was 500ms — too tight to reach a gap in time
    if (!a2Frozen && input.justPressed("up")) {
      a2HopIntent = -1;
      a2HopTimer = 1500;
    }
    if (!a2Frozen && input.justPressed("down")) {
      a2HopIntent = 1;
      a2HopTimer = 1500;
    }

    if (clickPending && phase === "act3" && !a2Frozen) {
      clickPending = false;
      if (!Device.isMobile) {
        const py = Math.round(a2PY);
        if (clickSY < py - 2) {
          a2HopIntent = -1;
          a2HopTimer = 3000;
        } else if (clickSY > py + 2) {
          a2HopIntent = 1;
          a2HopTimer = 3000;
        }
      }
    }

    if (a2HopTimer > 0) a2HopTimer -= dt;
    if (a2HopTimer <= 0) a2HopIntent = 0;

    if (a2HopIntent !== 0 && !a2Hopping) {
      const pwx = Math.round(a2WX + a2PX);
      const newRu = Util.clamp(a2PRu + a2HopIntent, 0, A2_NUM_LANES - 1);
      let atGap = false;
      for (const rd of a2Roads)
        if (pwx >= rd.wx - 4 && pwx <= rd.wx + A2_VRW + 4) {
          atGap = true;
          break;
        }
      if (atGap && newRu !== a2PRu) {
        a2PRu = newRu;
        a2PY = a2RuY(a2PRu);
        a2Hopping = false;
        a2HopIntent = 0;
        a2HopTimer = 0;
        a2TalkCD = Math.max(a2TalkCD, 300);
        if (!a2HasHopped) a2PromptCooldown = 800;
        a2HasHopped = true;
      }
    }

    if (!a2Frozen) {
      const a2TapStep = 2;
      const _a2PXBefore = a2PX;
      if (input.isDown("left")) a2PX -= 0.02 * dt;
      else if (input.justPressed("left")) a2PX -= a2TapStep;
      if (input.isDown("right")) a2PX += 0.02 * dt;
      else if (input.justPressed("right")) a2PX += a2TapStep;
      a2PX = Util.clamp(a2PX, 4, W - 6);
      if (Math.abs(a2PX - _a2PXBefore) > 0.05) {
        if (!a2HasMoved) a2PromptCooldown = 800;
        a2HasMoved = true;
      }
    }

    a2Blocks = a2Blocks.filter((b) => b.wx + b.w > a2WX - W);
    a2Roads = a2Roads.filter((r) => r.wx + A2_VRW > a2WX - W - 10);
    a2NPCs = a2NPCs.filter((n) => n.wx > a2WX - 20 || n.st === "maybe" || n.st === "approaching");
    a2Clouds = a2Clouds.filter((c) => c.wx + 10 > a2WX - W);

    const pwx2 = a2WX + a2PX;
    for (const n of a2NPCs) {
      if (n.st !== "idle") continue;
      const dist = Math.abs(n.wx - pwx2);
      n.ambShow = dist < 26 && dist > 3 && a2T > 3000;
    }


    if (a2TalkCD <= 0 && a2T > 1000 && !a2Frozen) {
      const pwx = a2WX + a2PX;
      for (const n of a2NPCs) {
        if (n.st !== "idle" || n.cd > 0 || n.ru !== a2PRu) continue;

        if (Math.abs(n.wx - pwx) < 3) {
          a2PX = n.wx - a2WX - 3;

          const _pc = A3_PROPS.find((p) => p.key === n.tp);
          if (_pc) {
            n.st = "gone";
            n.cd = 9999;
            if (_pc.pitched) playPitched(_pc.sound, 12);
            else if (_pc.jitter) audio.play(_pc.sound, { rate: 0.9 + Math.random() * 0.2 });
            else audio.play(_pc.sound);
            spark(Math.round(a2PX), Math.round(a2PY), n.col, 5);
            addFloat(drawDeck(_pc.key, window.LANG[_pc.lines]), Math.round(a2PX), Math.round(a2PY) - 2, n.col, true);
            a2TalkCD = 800;
            break;
          }

          if (n.tp === "coin") {
            n.st = "gone";
            n.cd = 9999;
            playPitched("recruit", 8);
            spark(Math.round(a2PX), Math.round(a2PY), C_COIN, 6);
            const coinMsg = drawDeck("coins", window.LANG.coinPickups);
            addFloat(coinMsg, Math.round(a2PX), Math.round(a2PY) - 2, C_COIN, true);
            a2TalkCD = 800;
            break;
          }

          if (n.tp === "cat") {
            audio.play("bump");
            spark(Math.round(a2PX), Math.round(a2PY), n.col, 4);
            convReset();
            convAnchorPX = Math.round(a2PX);
            convAnchorNX = Math.round(n.wx - a2WX);
            convAnchorY = Math.round(a2PY);
            convPlayerColor = C_PLAYER;
            convNPCColor = n.col;
            convVisible = true;
            const catLine = drawDeck("catLines", window.LANG.catLines);
            a2TN = n;
            a2TN._catLine = catLine; // stash for the player's reply in TP 30
            a2TP = 30; // every cat is recruitable — a crew can have many cats
            a2TT = 0;
            convAddLine(catLine.cat, "them", n.col);
            break;
          }
          // regular NPC conversation
          audio.play("bump");
          spark(Math.round(a2PX), Math.round(a2PY), C_DIM, 6);
          a2TN = n;
          a2TP = 0;
          a2TT = 0;
          a2Choice = -1;
          if (!a2HasTalked) a2PromptCooldown = 800;
          a2HasTalked = true;
          break;
        }
      }
    }

    if (!a2SV) {
      if (!a2TimeWarned && a2T > A2_TIME_WARN_MS) {
        a2TimeWarned = true;
        Banner.show(window.LANG.bannerCopsCircling, C_WARN, T.bannerHold);
      }
      if (a2T > A2_TIME_LIMIT_MS) {
        if (a2CrewCount >= 1) {
          a2SV = true;
          a2SD = true;
        } else if (!a2TimeoutFired) {
          a2TimeoutFired = true;
          triggerMirrorBust("timeout", initAct3, Math.round(a2PX), Math.round(a2PY));
        }
        return;
      }
    }

    _updateDomHud();
  }

 
  function _renderAct3Scenery() {
    // Blocks — bottom sidewalk only, buildings bottom-aligned above it
    for (const blk of a2Blocks) {
      const sx = Math.round(blk.wx - a2WX);
      if (sx + blk.w < -1 || sx > W + 1) continue;
      const bx1 = sx,
        bx2 = sx + blk.w - 1,
        by2 = blk.y + blk.h - 1;
      // Bottom sidewalk: ╚═══════════╝
      if (by2 >= 0 && by2 < H) {
        if (bx1 >= 0 && bx1 < W) grid.set(bx1, by2, "\u255A", "#ccc");
        if (bx2 >= 0 && bx2 < W) grid.set(bx2, by2, "\u255D", "#ccc");
        for (let x = bx1 + 1; x < bx2; x++) {
          if (x >= 0 && x < W) grid.set(x, by2, "\u2550", "#ccc");
        }
      }
      // Buildings bottom-aligned just above the sidewalk
      for (const b of blk.bldgs) {
        const bsx = sx + b.dx;
        const maxH = blk.h - 1; // leave room for sidewalk row
        const artToRender = b.art.length > maxH ? b.art.slice(b.art.length - maxH) : b.art;
        const bsy = by2 - artToRender.length;
        grid.art(artToRender, bsx, bsy, b.color);
      }
    }
    // Vertical roads — clean open gaps between block columns
    for (const rd of a2Roads) {
      const sx = Math.round(rd.wx - a2WX);
      if (sx + A2_VRW < -1 || sx > W + 2) continue;
      for (let y = 0; y < A2_GND; y++)
        for (let rx = 0; rx < A2_VRW; rx++) {
          const xx = sx + rx;
          if (xx >= 0 && xx < W) grid.set(xx, y, " ", null);
        }
    }
  }

  function renderAct3(opts = {}) {
    for (let ri = 0; ri < A2_NUM_LANES; ri++) {
      const ry = a2RuY(ri);
    }
    _renderAct3Scenery();

    for (const n of a2NPCs) {
      if (n.st === "rec" || n.st === "gone") continue;
      const sx = Math.round(n.wx - a2WX),
        sy = a2NpcY(n);
      if (sx < -3 || sx > W + 3) continue;
      let col = n.st === "angry" ? C_DANGER : n.st === "done" ? "#333" : n.col;
      /* Narcs: one brief colour blip every ~4 s — subtle, rewards attention */
      if (n.st === "idle" && n.tp === "narc" && Math.floor(a2T / 80) % 52 === 0) col = C_DANGER;
      if (n.st === "approaching") {
        col = Math.floor(a2T / 200) % 2 === 0 ? n.col : C_TEAL;
      }
      const art = n.art || A2_NPC;
      grid.art(art, sx, sy, col);
      if (n.st === "approaching" && n.bangT > 0 && sx >= 0 && sx < W && sy - 1 >= 0) {
        const blink = Math.floor(a2T / 120) % 2 === 0;
        if (blink) grid.set(sx + 1, sy - 1, "!", C_TEAL);
      }
    }
    if (!opts.skipPlayerCrew) {
      // Crew trailing — slightly organic: per-robin phase + small y-offset
      const ppx = Math.round(a2PX),
        ppy = Math.round(a2PY);
      for (let i = 0; i < a2Crew.length; i++) {
        const r = a2Crew[i];
        const phase = r.b;
        let cx2, cy2;
        if (r.isCat) {
          /* Cat prowls side-to-side, no vertical bob */
          const prowl = Math.sin(Date.now() / 400 + phase) * 1.4;
          cx2 = Math.round(ppx - 3 - i * 3 + prowl);
          cy2 = Math.round(ppy);
        } else {
          /* Small y-offset alternates robins above/below the line (±1) */
          const yOff = (i % 2 === 0 ? -1 : 1) * 0.6;
          /* Gentle x-jitter so spacing isn't perfectly uniform */
          const xJit = Math.sin(Date.now() / 700 + phase * 1.7) * 0.5;
          const bob = Math.sin(Date.now() / 350 + phase) * 0.6;
          cx2 = Math.round(ppx - 3 - i * 3 + xJit);
          cy2 = Math.round(ppy + yOff + bob);
        }
        if (r.jwx != null) {
          const k = Math.min(1, (a2T - r.j0) / 1400);
          const e = k * k * (3 - 2 * k);
          cx2 = Math.round((r.jwx - a2WX) * (1 - e) + cx2 * e);
          cy2 = Math.round(r.jny * (1 - e) + cy2 * e);
          if (k >= 1) r.jwx = null;
        }
        const crewCol = r.col || C_CREW;

        if (cx2 >= 0 && cx2 + 3 < W) grid.art(r.art || A2_ROB, cx2, cy2, crewCol, r.isCat);
      }
      // Player — glow effect at start
      const _a2PFrame = [...A2_PA[a2PAnim]];
      const _a2PWalk = a2TN === null; // only animate when not in conversation
      _a2PFrame[1] = _a2PWalk ? (Math.floor(a2T / 160) % 2 === 0 ? A2_PA[a2PAnim][0] : "\u20B3") : A2_PA[a2PAnim][1];
      grid.art(_a2PFrame, ppx, ppy, playerPulseColor(a2T));
    }

    // Ambient mutters above nearby NPCs
    for (const n of a2NPCs) {
      if (!n.ambShow || n.st !== "idle") continue;
      const nsx = Math.round(n.wx - a2WX),
        nsy = a2NpcY(n);
      if (nsx >= 0 && nsx < W - 5) {
        const txt = n.amb.substring(0, Math.min(n.amb.length, W - nsx - 1));
        const _ambY = n.tp === "cat" ? nsy : nsy - 2;
        grid.text(txt, nsx - Math.floor(txt.length / 2), _ambY, dullColor(n.col, 0.5));
      }
    }

    // "Hmm" / "wait for me" — quiet mutterings from NPCs in maybe/approaching states.
    for (const n of a2NPCs) {
      if (!n.thinkLine) continue;
      if (n.st !== "maybe" && n.st !== "approaching") continue;
      const nsx = Math.round(n.wx - a2WX),
        nsy = a2NpcY(n);
      if (nsx < 0 || nsx >= W) continue;
      const txt = n.thinkLine.substring(0, Math.min(n.thinkLine.length, W - nsx - 1));
      const visible = Math.floor(a2T / 600) % 2 === 0 || n.st === "approaching";
      if (visible) {
        grid.text(txt, nsx - Math.floor(txt.length / 2), nsy - 2, dullColor(n.col, 0.5));
      }
    }

    // Dialogue
    dialogRender();
    // Conversation panel (replaces old choice UI)
    convRender();

    if (!convVisible && !a2SD && a2PromptCooldown <= 0) {
      const pwx = a2WX + a2PX;
      const nearestSameLane = a2NPCs.find((n) => n.st === "idle" && n.ru === a2PRu && Math.abs(n.wx - pwx) < 16);
      const nearestOtherLane = a2NPCs.find((n) => n.st === "idle" && n.ru !== a2PRu && Math.abs(n.wx - pwx) < 16);
      if (!a2HasMoved && a2T > 1500) {
        renderTapPrompt(ctrl("act3Move"), H - 2, "#fff", C_PLAYER);
      } else if (a2HasMoved && !a2HasTalked && nearestSameLane) {
        // NPC in same lane — teach walking into them.
        renderTapPrompt(ctrl("act3WalkInto"), H - 2, "#fff", C_PLAYER);
      } else if (a2HasMoved && !a2HasHopped && nearestOtherLane) {
        // NPC in a different lane — teach lane-hopping to reach them.
        renderTapPrompt(ctrl("act3HopLane"), H - 2, "#fff", C_PLAYER);
      }
    }

    if (a2TN && convVisible) {
      const _hasChunks = _convChunkQueue.length > 0;
      if (_hasChunks || A2_WAITING_TPS.has(a2TP)) {
        const lastLine = convLog[convLog.length - 1];
        const lineLen = lastLine ? lastLine.text.length : 0;
        const isLongLine = lineLen > 60;
        const dwell = !a2HasAdvancedDialogue ? 1500 : isLongLine ? 7000 : 5000;
        if (a2TT > dwell || _hasChunks) {
          renderTapPrompt(ctrl("tapToContinueConv"), H - 2, "#fff", C_PLAYER);
        }
      }
    }

    Banner.render();
  }


  function _transitionAct3ToAct4() {
    const excludeXY = _excludeByDiff(
      () => render(true),
      () => renderAct3({ skipPlayerCrew: true }),
    );
    const keepCells = excludeXY.map((p) => ({ x: p.x, y: p.y, ch: grid.c[p.y][p.x].ch, co: grid.c[p.y][p.x].co }));
    const staged = _stageKeepCells(keepCells); // banner-screen spot; also where the Act 4 walk starts from
    runActBoundary({
      outro: (done) => streamOut(done, { edge: "left", excludeXY, render: false }),
      setupNext: initAct4,
      banner: {
        lines: [
          // C_TEAL (not C_ORANGE, already used by Act2→Act3) — also this game's "crew" color.
          { t: window.LANG.bannerRallyNeighbourhood, c: C_TEAL, d: 9999 },
          { pause: true, d: T.bannerBeat },
          { t: window.LANG.bannerAvoidNarcs, c: C_TEAL, d: 9999 },
        ],
        frameIdx: 1, // was missing (silently defaulted to blank frame 0); matches the dev jump table's guess
        keepCells: staged,
      },
      intro: (done) => {
        const targetXY = _excludeByDiff(
          () => render(true),
          () => renderAct4({ skipPlayerCrew: true }),
        );
        streamIn(done, { edge: "right", render: false, excludeXY: targetXY, overlay: _walkCellsOverlay(staged, targetXY) });
      },
    });
  }

