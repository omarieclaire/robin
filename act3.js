

  const A2_MIN = 3,
    A2_MH = 3;
  const A2_DESKTOP_SPD_MULT = Device.isMobile ? 1 : 2; // desktop walks faster than mobile
  const A2_MAYBE_LATER_CHANCE = 0.35;
  const A2_RETURN_SPAWN_OFFSET = 30; // spawn distance behind camera
  const A2_RETURN_SPEED_MULT = 1.8; // walks faster than scroll
  const A2_RETURN_REACH_DIST = 4; // close enough to open conv
  const A2_RETURN_BUSY_RADIUS = 18; // skip return near another NPC
  const A2_RETURN_CALM_MS = 2500; // quiet beat after a conv ends
  const A2_RETURN_RECHECK_MS = 2500; // recheck interval when blocked
  const A2_RETURN_BANG_MS = 1500; // "!" indicator duration
  const A2_TIME_LIMIT_MS = 90000;
  const A2_TIME_WARN_MS = 70000;

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
  let a2PXSnapTo = null; // eased target for NPC line-up
  let a2Blocks, a2Roads, a2NPCs, a2Clouds;
  let a2NPCsSpawned;
  let a2CatSpawned; // any cat NPC generated yet
  let a2CatRecruited; // player  has a cat
  let a2ConvsCompleted = 0;
  let a3PropWill = {},
    a3PropDone = {};
  const A3_PROPS = [
    { key: "pylon", art: "Δ", cols: ["#ff8c1a", "#ff7a1a", "#e8760f", "#ffa040"], sound: "propPylon", lines: "pylonLines", chance: 0.5, jitter: true },
    { key: "bagel", art: "o", cols: ["#d9a441", "#c8923a", "#e0b45a", "#d6a038"], sound: "propBagel", lines: "bagelLines", chance: 0.34, pitched: true },
    { key: "serviceberry", art: "↭", cols: ["#7d5fa8", "#6a5a9c", "#5566a0", "#6a8f5a"], sound: "propServiceberry", lines: "serviceberryLines", guaranteed: true, pitched: true },
    { key: "mulberry", art: "⥉", cols: ["#b25a9c", "#9c3a6f", "#7d2f5a", "#a83a6a"], sound: "propMulberry", lines: "mulberryLines", chance: 0.5, pitched: true },
    { key: "nasturtium", art: "❀", cols: ["#ff7a3d", "#ff5a2a", "#ffab30", "#ff9040", "#e8402a"], sound: "propNasturtium", lines: "nasturtiumLines", chance: 0.5, pitched: true },
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
  let a2SV, a2SW, a2SD, a2SDT, a2SDFired, a2ForcedTimeout;
  let a2Busted;
  let _a2RecruitProgressTO; // crew-count float, cancelled at wrap-up
  let a2Gen;
  let a2HudFlashT, a2HudFlashMsg;
  let a2TimeWarned, a2TimeoutFired;
  let a2HasTalked, a2HasHopped, a2HasMoved;
  let a2PromptCooldown;
  let a2HasAdvancedDialogue; 

  const A2 = {
    GREET_DELAY: T.reply, // 1800ms
    CHOICE_LOCK: 100, // min ms before click registers
    INVITE_DELAY: T.hold, // 1500ms, after filler before invite
    BAIL_CLOSE: T.linger, // 2400ms — after bail response
    // beat before the box closes
    RECRUIT_HOLD: 500, // after a recruit confirms
    CLOSE_HOLD: 300, // after decline/defer/walk-away closure
    MISMATCH_CLOSE: T.npcMin, // 2800ms — after mismatch rejection
  };

  function a2Layout() {
    A2_GND = H - 1;
    const numRoads = 3,
      numBands = numRoads + 1;
    // pad sprite rows if screen height allows
    let rowPad = 1;
    A2_RU_H = 2 + rowPad * 2;
    let bhPer = Math.floor((A2_GND - numRoads * A2_RU_H) / numBands);
    if (bhPer < 4) {
      rowPad = 0;
      A2_RU_H = 2;
      bhPer = Math.floor((A2_GND - numRoads * A2_RU_H) / numBands);
    }
    A2_BH_PER = Math.max(4, bhPer);
    A2_TOP_PAD = Math.floor(H * 0.06);
    A2_LANE_YS = [];
    for (let road = 0; road < numRoads; road++) {
      const roadY = A2_TOP_PAD + (road + 1) * A2_BH_PER + road * A2_RU_H + rowPad;
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

    const MIN_NPC_GAP = 22,
      MAX_NPC_GAP = 34;

    // gap from player start, not chunk origin
    const npcFrom = Math.max(from, a2WX + a2PX);

    const playerLane = typeof a2PRu === "number" ? a2PRu : null;
    const firstSpawnLane = a2NPCsSpawned === 0 && playerLane !== null && playerLane >= mobileMinLane ? playerLane : null;
    const laneOrder = [];
    if (firstSpawnLane !== null) laneOrder.push(firstSpawnLane);
    for (let ri = mobileMinLane; ri < A2_NUM_LANES; ri++) {
      if (ri !== firstSpawnLane) laneOrder.push(ri);
    }
    for (let ri = 0; ri < mobileMinLane; ri++) laneOrder.push(ri);
    const mainLaneOrder = laneOrder.filter((ri) => ri >= mobileMinLane);
    const topLaneOrder = laneOrder.filter((ri) => ri < mobileMinLane);

    // interleave lanes so neither starves
    const mainCandidates = [];
    for (const ri of mainLaneOrder) {
      const laneOffset = (ri - mobileMinLane) * 18;
      for (let nx = npcFrom + MIN_NPC_GAP + laneOffset; nx < to; nx += Util.randInt(MIN_NPC_GAP, MAX_NPC_GAP)) mainCandidates.push({ ri, nx });
    }
    mainCandidates.sort((a, b) => a.nx - b.nx);

    const topCandidates = [];
    for (const ri of topLaneOrder) {
      const laneOffset = (ri - mobileMinLane) * 18;
      for (let nx = npcFrom + MIN_NPC_GAP + laneOffset; nx < to; nx += Util.randInt(MIN_NPC_GAP, MAX_NPC_GAP)) topCandidates.push({ ri, nx });
    }

    for (const { ri, nx } of [...mainCandidates, ...topCandidates]) {
      {
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
          else if (_r < 0.29) tp = "coin";
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
          // missed the last cat — guarantee another
          tp = "cat";
          tl = 0;
        } else {
          // recruitable people get the biggest share
          const r = Math.random();
          if (r < 0.22) {
            tp = "narc";
            tl = 0;
          } else if (r < 0.26) {
            tp = "cat";
            tl = 0;
          } else if (r < 0.4) {
            tp = "coin";
            tl = 0;
          } else {
            tp = "norm";
            tl = 1;
          }
        }
        const SPACING_X = 80; // nearby range for same-type rule
        const ADJACENT_LANE_MIN_GAP = 10;
        const nearbyNPCs = a2NPCs.filter((other) => Math.abs(other.wx - nx) < SPACING_X);

        const tooCloseAdjacent = a2NPCs.some(
          (other) => Math.abs(other.ru - ri) <= 1 && other.ru !== ri && Math.abs(other.wx - nx) < ADJACENT_LANE_MIN_GAP,
        );
        if (tooCloseAdjacent) continue;

        if (tp === "narc") {
          // never two narcs this close
          if (nearbyNPCs.some((other) => other.tp === "narc")) {
            tp = "norm";
            tl = 1;
          }
        } else if (tp === "cat") {
          // never two cats this close
          if (nearbyNPCs.some((other) => other.tp === "cat")) {
            tp = "norm";
            tl = 1;
          }
        } else if (tp === "coin") {
          // allow two coins nearby, not three
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

        const narcCols = ["#ffdede", "#d9ffe5", "#dad7ff", "#fffbe0", "#ffe8d9"];

        // several cat coats: tabby, cream, grey, ginger
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
    if (_rem <= 0) return; // celebration banner covers this case
    const _lastCrew = a2Crew[a2Crew.length - 1];
    const _wasCat = _lastCrew && _lastCrew.isCat;
    let _progressMsg;
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
    if (!_progressMsg || _progressMsg.trim() === "") _progressMsg = a2CrewCount + "/" + A2_MIN;
    _a2RecruitProgressTO = setTimeout(() => addFloat(_progressMsg, 0, 0, _wasCat ? C_CAT : C_ORANGE), delayMs);
  }

  const A2_REVEAL_PAUSE_MS = 1800;

  function _a2TriggerNarcReveal(n) {
    if (a2Busted) return;
    audio.play("narc");
    n.st = "angry";
    n.col = C_DANGER;
    a2Ht++;

    const _narcSX = Math.round(n.wx - a2WX);
    const _narcSY = Math.round(a2NpcY(n)); // body row
    const _isFatal = a2Ht >= A2_MH;

    if (!_isFatal) {
      Effects.start("corrupt", { x: _narcSX, y: _narcSY, radius: 3, duration: 1400, intensity: 1.4, swap: true });
      setTimeout(() => {
        if (phase !== "act3") return;
        Effects.start("corrupt", { x: Math.round(a2PX), y: Math.round(a2PY), radius: 5, duration: 1000, intensity: 1.0, swap: true });
      }, 400);
      triggerChromatic(500);
    }

    spark(Math.round(a2PX), Math.round(a2PY), C_DANGER, 14);
    for (let _nb = 0; _nb < 5; _nb++) spark(Math.round(a2PX) + Util.randInt(-4, 4), Math.round(a2PY) + Util.randInt(-2, 2), C_DANGER, 14);
    spark(_narcSX, _narcSY, C_DANGER, 16);
    if (_isFatal) {
      a2Busted = true;
      setTimeout(() => triggerCorruptBust("busted", initAct3), A2_REVEAL_PAUSE_MS);
    }
  }

  // Tier 2 — regular recruit
  function _a2TriggerRecruitAnim(n, isCat) {
    n.st = "rec";
    a2CrewCount++;
    audio.play("recruit");
    a2Crew.push({ b: Math.random() * 6, ru: n.ru, art: n.art, col: n.col, isCat: !!isCat, jwx: n.wx, jny: a2NpcY(n), j0: null });
    triggerFlashGood();
    triggerFlashGold();
    if (isCat) {
      burstGood(Math.round(a2PX), Math.round(a2PY), n.col || C_CAT, 16);
      burstGood(Math.round(a2PX) - 3, Math.round(a2PY), n.col || C_CAT, 10);
      burstGood(Math.round(a2PX) + 3, Math.round(a2PY), n.col || C_CAT, 10);
    } else {
      for (let _bi = 0; _bi < 6; _bi++) spark(Math.round(a2PX) + Util.randInt(-4, 4), Math.round(a2PY) + Util.randInt(-2, 2), C_TEAL, 16);
    }
  }

  // Tier 3 — non-recruit closures
  function _a2ClosureSparkle(color) {
    spark(Math.round(a2PX), Math.round(a2PY), color, 6);
  }

  function _a2ReadDelay() {
    const lastLine = convLog[convLog.length - 1];
    const words = lastLine ? lastLine.text.trim().split(/\s+/).filter(Boolean).length : 0;
    return Math.max(T.hold, words * CONV_READ_MS_PER_WORD);
  }


  function initAct3() {
    Footsteps.stop();
    Ambience.stop();
    convVisible = false;
    audio.play("level");
    audio.preload(["music_act4"]);
    phase = "act3";
    hasPlayed = true;
    a2Layout();
    a2CrewCount = 0;
    a2Ht = 0;
    a2Busted = false;
    clearTimeout(_a2RecruitProgressTO);
    _a2RecruitProgressTO = null;
    _hudPopPrev.crew = 0;
    _hudPopT.crew = 0;
    _hudPopPrev.narcs2 = 0;
    _hudPopT.narcs2 = 0;
    a2T = 0;
    a2Spd = 0.006 * A2_DESKTOP_SPD_MULT;
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
    a2HasTalked = false; // has the player started a conversation
    a2HasHopped = false; // has the player switched lanes
    a2HasMoved = false; // has the player moved horizontally
    a2PromptCooldown = 0;
    a2HasAdvancedDialogue = false;
    a2HudFlashMsg = "";
    a2TimeWarned = false;
    a2TimeoutFired = false;
    a2PRu = Math.max(0, A2_NUM_LANES - 2);
    a2PX = Math.floor(W / 2);
    a2PXSnapTo = null;
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
    a2ForcedTimeout = false;
    dialogStack = [];
    _convChunkTimer = 0;
    a2GenChunk(0, W * 3);
    _updateDomHud();
    Banner.timer = 0;
  }


  const A2_WAITING_TPS = new Set([2, 12, 13, 141, 142, 14, 15, 24, 25, 251, 7, 8, 9, 10, 11, 30, 31, 32]);

  function updateAct3(dt) {
    if (a2PXSnapTo !== null) {
      const _d = a2PXSnapTo - a2PX;
      if (Math.abs(_d) < 0.15) {
        a2PX = a2PXSnapTo;
        a2PXSnapTo = null;
      } else {
        a2PX += _d * Math.min(1, dt / 120);
      }
    }
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
    const A2_REVEAL_MIN_MS = 1200;

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

    // approaching NPCs track player, turn back
    if (!a2TN) {
      for (const n of a2NPCs) {
        if (n.st !== "approaching") continue;
        const _calm = a2T - a2LastConvEndT > A2_RETURN_CALM_MS;
        if (!_calm || a2SV) {
          n.wx += a2Spd * dt; // matches scroll, holds screen position
          continue;
        }
        // walk toward player, forward or back
        const _pwxNow = a2WX + a2PX;
        n.wx += (_pwxNow - 2 - n.wx >= 0 ? 1 : -1) * a2Spd * A2_RETURN_SPEED_MULT * dt;
        // lane-snap toward player at a gap
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
            // step one lane per frame at gap
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

    /* Conversation state machine, tracked via a2TP */

    if (a2TN) {
      Footsteps.stop();
      const _lastFullyTyped = convLog.length === 0 || convReveal[convLog.length - 1] >= convLog[convLog.length - 1].text.length;
      if (_lastFullyTyped) a2TT += dt;

      const psx = Math.round(a2PX),
        nsx = Math.round(a2TN.wx - a2WX),
        psy = Math.round(a2PY);
      convAnchorPX = psx;
      convAnchorNX = nsx;
      convAnchorY = psy;

      // TP 0: open conv, fire greet (auto)
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
        // greet must match the NPC's hello tags
        const npcHelloDeck = a2TN.tp === "narc" ? DECK_NARC_HELLO : a2TN.kind === "angry" ? DECK_ANGRY_HELLO : DECK_HUNGRY_HELLO;
        const npcTagPool = [...new Set(npcHelloDeck.src.flatMap((c) => c.tags || []))];
        const greetResult = DM.drawWithTags(DECK_GREET, npcTagPool);
        a2TN.greetTags = greetResult.tags;
        convAddLine(greetResult.text, "you", convPlayerColor);
        a2TP = 12;
        a2TT = 0;
      }

      // TP 2: immediate join after match (tap)
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

      // TP 12: NPC replies (tap)
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

      // TP 13: show first pitch choices (tap)
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

      // TP 1: wait for first pitch choice
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

      // TP 141: route after first pitch (tap)
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

      // TP 142: invite/walk-away choice (tap)
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

      // TP 143: wait for invite/walk away input
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

      // TP 144: NPC responds to invite (tap)
      else if (a2TP === 144 && _a2DialogueTap) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            if (a2TN.tp === "narc") {
              // narc feels safe enough — reveal
              convNPCColor = C_DANGER;
              convAddLine(DM.draw(DECK_NARC_REV, a2TN.inviteTags ?? []), "them", C_DANGER);
              _a2TriggerNarcReveal(a2TN);
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

      // TP 14: check match, route (tap)
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
              audio.play("wrongChoice");
              convAddLine(DM.draw(mismatchDeck, badReadTags) + " " + DM.draw(DECK_NO_BYE, badReadTags), "them", convNPCColor);
              a2TP = 7;
            } else {
              // roll: join, say-more, or maybe-later
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

      // TP 15: show second round choices (tap)
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

      // TP 23: wait for second choice
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

      // TP 24: resolve second choice (tap)
      else if (a2TP === 24 && (_a2DialogueTap || (!_a2HasChunks && a2Choice === 1 && a2TT > _a2ReadDelay()))) {
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
              a2TalkCD = 150;
              if (wasNarc) {
                _a2ClosureSparkle(C_SUCCESS);
                setTimeout(() => {
                  audio.play("goodCall");
                  Banner.show(window.LANG.bannerGoodCallNarc, C_SUCCESS, T.bannerHold, true);
                }, A2.CLOSE_HOLD + convFadeDuration);
              } else {
                _a2ClosureSparkle(C_WARN);
                setTimeout(
                  () => addFloat(Util.pick([window.LANG.floatTooCautious, window.LANG.floatGiveChance, window.LANG.floatNeverChange]), 0, 0, C_WARN, false, "giveItAShot"),
                  A2.CLOSE_HOLD + convFadeDuration,
                );
              }
              convEndWhenDone(A2.CLOSE_HOLD, () => {
                dialogStack = [];
                convStartFade();
              });
            } else if (a2TN.tp === "narc") {
              convNPCColor = C_DANGER;
              convAddLine(DM.draw(DECK_NARC_REV, a2TN.strongerTags ?? []), "them", C_DANGER);
              _a2TriggerNarcReveal(a2TN);
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

      // TP 25: player bailed first round (tap)
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

      // TP 251: close after bail (tap)
      else if (a2TP === 251 && (_a2DialogueTap || (!_a2HasChunks && a2TT > _a2ReadDelay()))) {
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
            a2TalkCD = 150;
            _a2ClosureSparkle(wasNarc ? C_SUCCESS : C_WARN);
            setTimeout(() => {
              if (wasNarc) {
                addFloat(Util.pick([window.LANG.floatGoodCallSmelled]), 0, 0, C_SUCCESS, false, "goodCall");
              } else {
                addFloat(Util.pick([window.LANG.floatTooCautious, window.LANG.floatGiveChance, window.LANG.floatNeverChange]), 0, 0, C_WARN, false, "giveItAShot");
              }
            }, A2.CLOSE_HOLD + convFadeDuration);
            convEndWhenDone(A2.CLOSE_HOLD, () => {
              dialogStack = [];
              convStartFade();
            });
          }
        }
      }

      // TP 7: NPC declined (tap)
      else if (a2TP === 7 && (_a2DialogueTap || (!_a2HasChunks && a2TT > _a2ReadDelay()))) {
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
            a2TalkCD = 150;
            _a2ClosureSparkle(C_WARN);
            setTimeout(
              () => addFloat(Util.pick([window.LANG.floatReadTheRoom, window.LANG.floatListenBetter, window.LANG.floatWrongEnergy]), 0, 0, C_WARN, false, "tryHarder"),
              A2.CLOSE_HOLD + convFadeDuration,
            );
            convEndWhenDone(A2.CLOSE_HOLD, () => {
              dialogStack = [];
              convStartFade();
            });
          }
        }
      }

      // TP 8: recruit! (tap)
      else if (a2TP === 8 && (_a2DialogueTap || (!_a2HasChunks && a2TT > _a2ReadDelay()))) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            DM.endConv();
            _a2TriggerRecruitAnim(a2TN);
            _a2ShowRecruitProgress(A2.RECRUIT_HOLD + convFadeDuration);
            a2TN.cd = 1000;
            a2TN = null;
            a2TalkCD = 150;
            convEndWhenDone(A2.RECRUIT_HOLD, () => {
              dialogStack = [];
              convStartFade();
            });
          }
        }
      }

      // TP 9: narc reveal (tap or auto)
      else if (a2TP === 9 && (_a2DialogueTap || (!_a2HasChunks && a2TT > _a2ReadDelay()))) {
        if (a2TT > A2_REVEAL_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            DM.endConv();
            const n = a2TN;
            if (!a2Busted) setTimeout(() => addFloat(window.LANG.floatNarcRecruited || window.LANG.floatNarc, 0, 0, C_DANGER), T.exit + convFadeDuration);
            n.cd = 1000;
            a2TN = null;
            a2TalkCD = 150;
            convEndWhenDone(T.exit, () => {
              dialogStack = [];
              convReset();
            });
          }
        }
      }

      // TP 10: NPC defers (tap)
      else if (a2TP === 10 && (_a2DialogueTap || (!_a2HasChunks && a2TT > _a2ReadDelay()))) {
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
            setTimeout(() => {
              addFloat(Util.pick([window.LANG.floatNotYet, window.LANG.floatNeedTime]), 0, 0, C_THINKING);
            }, A2.CLOSE_HOLD + convFadeDuration);
            n.thinkLine = Util.pick(window.LANG.act3Undecided);
            a2TN = null;
            a2TalkCD = 150;
            convEndWhenDone(A2.CLOSE_HOLD, () => {
              dialogStack = [];
              convStartFade();
            });
            const _returnPhase = phase;
            const _returnStartT = a2T; // track total time spent waiting to return
            const A2_RETURN_MAX_WAIT_MS = 30000; // give up after 30s
        
            const _tryReturn = () => {
              if (n.st !== "maybe") return;
              if (phase !== _returnPhase) return;
              if (a2T - _returnStartT > A2_RETURN_MAX_WAIT_MS) {
                n.st = "done";
                n.cd = 9999;
                return;
              }
              // wait and retry if player is talking
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
              // spawn off-screen left in player's lane
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

      // TP 11: returning NPC, tap to recruit
      else if (a2TP === 11 && (_a2DialogueTap || (!_a2HasChunks && a2TT > _a2ReadDelay()))) {
        if (a2TT > A2_TAP_MIN_MS) {
          clickPending = false;
          if (_a2HasChunks) {
            _convChunkFlush();
            _convChunkTimer = 999999;
            a2TT = 0;
          } else {
            DM.endConv();
            _a2TriggerRecruitAnim(a2TN);
            _a2ShowRecruitProgress(A2.RECRUIT_HOLD + convFadeDuration);
            a2TN.cd = 1000;
            a2TN = null;
            a2TalkCD = 150;
            convEndWhenDone(A2.RECRUIT_HOLD, () => {
              dialogStack = [];
              convStartFade();
            });
          }
        }
      }

      // TP 30: cat miaou, tap for reply
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

      // TP 32: tap to show recruit choice
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

      // TP 33: cat recruit/walk-away choice
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
          const n = a2TN;
          if (_picked === 0) {
            a2CatRecruited = true;
            _a2TriggerRecruitAnim(n, true);
            _a2ShowRecruitProgress(A2.RECRUIT_HOLD + convFadeDuration);
            n.cd = 1000;
          } else {
            n.st = "done";
            n.cd = 9999;
            _a2ClosureSparkle(C_WARN);
            setTimeout(() => addFloat(Util.pick(window.LANG.floatCatDeclined), 0, 0, C_WARN, false, "catDeclined"), A2.CLOSE_HOLD + convFadeDuration);
          }
          const _startPhase = phase;
          setTimeout(() => {
            if (phase !== _startPhase || !a2TN) return;
            convChoicePicked = -1;
            convHideChoices();
            a2TN = null;
            a2TalkCD = 150;
            convEndWhenDone(_picked === 0 ? A2.RECRUIT_HOLD : A2.CLOSE_HOLD, () => {
              dialogStack = [];
              convStartFade();
            });
          }, 400);
          a2TT = -600;
        }
      }

      return;
    }
    /* end a2TN block */

    if (a2SD) {
      Footsteps.stop();
      if (a2SDT === null) {
        a2SDT = 0;
        // wait for conv panel to fade
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
          // burst each crew member, hop in place
          for (let _ci = 0; _ci < a2Crew.length; _ci++) {
            const _cx = Math.round(ppx - 3 - _ci * 3);
            const _cy = Math.round(ppy + (_ci % 2 === 0 ? -1 : 1));
            burstGood(_cx, _cy, a2Crew[_ci].col || C_TEAL, 8);
            a2Crew[_ci].cheerT0 = a2T;
          }
          triggerFlashGood();
          audio.play("recruit");
        }, 700);
        setTimeout(() => {
          // final flourish near player and crew
          const _crewSpan = Math.min(a2Crew.length * 3, 12);
          for (let _bi = 0; _bi < 3; _bi++) {
            burstGood(ppx + Util.randInt(-_crewSpan, 2), ppy + Util.randInt(-2, 2), C_TEAL, 8);
          }
          triggerFlashGold();
        }, 1100);
        setTimeout(() => {
          // climax — crew hops together, biggest burst
          for (let _ci = 0; _ci < a2Crew.length; _ci++) {
            const _cx = Math.round(ppx - 3 - _ci * 3);
            const _cy = Math.round(ppy + (_ci % 2 === 0 ? -1 : 1));
            burstGood(_cx, _cy, a2Crew[_ci].col || C_TEAL, 10);
            a2Crew[_ci].cheerT0 = a2T;
          }
          burstGood(ppx, ppy, C_PLAYER, 16);
          triggerFlashGood();
          triggerFlashGold();
          audio.play("trumpet");
        }, 1650);
        Banner.show(a2ForcedTimeout ? window.LANG.bannerCrewTimeout : window.LANG.bannerYouHaveACrew, C_PLAYER, 99999);
      }
      // hold through climax, then auto-cut to inter
      if (a2SDFired && a2SDT > convFadeDuration + 200 + 3600) {
        Banner.timer = 0;
        _transitionAct3ToAct4();
      }
      return;
    }

    if (!a2SV && a2CrewCount >= A2_MIN) {
      a2SV = true;
      a2SD = true;
      clearTimeout(_a2RecruitProgressTO); // avoids stale crew-count float
    }

    a2Spd = (0.004 + a2T * 0.00000015) * A2_DESKTOP_SPD_MULT;
    const a2Frozen = convVisible || !!a2TN || a2Busted;
    if (a2Frozen) Footsteps.stop();
    else {
      Footsteps.start();
      Footsteps.setRate(a2Spd / (0.004 * A2_DESKTOP_SPD_MULT));
    }
    if (!a2Frozen && !convFading) a2WX += a2Spd * dt;
    while (a2Gen < a2WX + W + 150) a2GenChunk(a2Gen, a2Gen + 80);

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
      // mobile taps need a looser zone
      const tapZone = Device.isMobile ? 1 : 2;
      const py = Math.round(a2PY);
      if (clickSY < py - tapZone) {
        a2HopIntent = -1;
        a2HopTimer = 3000;
      } else if (clickSY > py + tapZone) {
        a2HopIntent = 1;
        a2HopTimer = 3000;
      }
    }

    if (a2HopTimer > 0) a2HopTimer -= dt;
    if (a2HopTimer <= 0) a2HopIntent = 0;

    if (a2HopIntent !== 0 && !a2Hopping) {
      const pwx = Math.round(a2WX + a2PX);
      const newRu = Util.clamp(a2PRu + a2HopIntent, 0, A2_NUM_LANES - 1);
      // mobile touch needs more gap tolerance
      const gapGrace = Device.isMobile ? 9 : 4;
      let atGap = false;
      for (const rd of a2Roads)
        if (pwx >= rd.wx - gapGrace && pwx <= rd.wx + A2_VRW + gapGrace) {
          atGap = true;
          break;
        }
      if (atGap && newRu !== a2PRu) {
        audio.play("rowSwitch");
        a2PRu = newRu;
        a2PY = a2RuY(a2PRu);
        a2Hopping = false;
        a2HopIntent = 0;
        a2HopTimer = 0;
        a2TalkCD = Math.max(a2TalkCD, 100);
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

        const _catchDist = n.tp === "norm" ? 6 : 3; // non-norm types need a tighter catch
        if (Math.abs(n.wx - pwx) < _catchDist) {
          a2PXSnapTo = n.wx - a2WX - 3;

          const _pc = A3_PROPS.find((p) => p.key === n.tp);
          if (_pc) {
            n.st = "gone";
            n.cd = 9999;
            if (_pc.pitched) playPitched(_pc.sound, 12);
            else if (_pc.jitter) audio.play(_pc.sound, { rate: 0.9 + Math.random() * 0.2 });
            else audio.play(_pc.sound);
            spark(Math.round(a2PX), Math.round(a2PY), n.col, 5);
            addFloat(drawDeck(_pc.key, window.LANG[_pc.lines]), Math.round(a2PX), Math.round(a2PY) - 2, n.col, true);
            a2TalkCD = 250;
            break;
          }

          if (n.tp === "coin") {
            n.st = "gone";
            n.cd = 9999;
            playPitched("coin", 8);
            spark(Math.round(a2PX), Math.round(a2PY), C_COIN, 6);
            const coinMsg = drawDeck("coins", window.LANG.coinPickups);
            addFloat(coinMsg, Math.round(a2PX), Math.round(a2PY) - 2, C_COIN, true);
            a2TalkCD = 250;
            break;
          }

          if (n.tp === "cat") {
            audio.play("catMeow");
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
            a2TN._catLine = catLine; // for the reply in TP 30
            a2TP = 30; // crews can have many cats
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
        audio.play("copsCircling");
        Banner.show(window.LANG.bannerCopsCircling, C_WARN, T.bannerHold, true);
      }
      if (a2T > A2_TIME_LIMIT_MS) {
        if (a2CrewCount >= 1) {
          a2SV = true;
          a2SD = true;
          clearTimeout(_a2RecruitProgressTO); // avoids stale crew-count float
          a2ForcedTimeout = a2CrewCount < A2_MIN;
        } else if (!a2TimeoutFired) {
          a2TimeoutFired = true;
          a2Busted = true;
          triggerMirrorBust("timeout", initAct3, Math.round(a2PX), Math.round(a2PY));
        }
        return;
      }
    }

    _updateDomHud();
  }

 
  function _renderAct3Scenery() {
    // blocks: sidewalk bottom, buildings above
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
        const maxH = blk.h - 1; // leaves room for sidewalk row
        const artToRender = b.art.length > maxH ? b.art.slice(b.art.length - maxH) : b.art;
        const bsy = by2 - artToRender.length;
        grid.art(artToRender, bsx, bsy, b.color);
      }
    }
    // vertical roads: open gaps between blocks
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
      /* Brief narc color blip rewards attention */
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
      // crew trail: per-robin phase, y-offset
      const ppx = Math.round(a2PX),
        ppy = Math.round(a2PY);
      for (let i = 0; i < a2Crew.length; i++) {
        const r = a2Crew[i];
        const phase = r.b;
        let cx2, cy2;
        if (r.isCat) {
          const prowl = Math.sin(Date.now() / 400 + phase) * 1.4;
          cx2 = Math.round(ppx - 3 - i * 3 + prowl);
          cy2 = Math.round(ppy);
        } else {
          const yOff = (i % 2 === 0 ? -1 : 1) * 0.6;
          const xJit = Math.sin(Date.now() / 700 + phase * 1.7) * 0.5;
          const bob = Math.sin(Date.now() / 350 + phase) * 0.6;
          cx2 = Math.round(ppx - 3 - i * 3 + xJit);
          cy2 = Math.round(ppy + yOff + bob);
        }
        if (r.jwx != null) {
          const npcSX = Math.round(r.jwx - a2WX);
          if (r.j0 == null) {
            /* Stands put until player walks past */
            if (npcSX < ppx - 2) r.j0 = a2T;
            else {
              cx2 = npcSX;
              cy2 = r.jny;
            }
          }
          if (r.j0 != null) {
            const k = Math.min(1, (a2T - r.j0) / 1400);
            const e = k * k * (3 - 2 * k);
            cx2 = Math.round(npcSX * (1 - e) + cx2 * e);
            cy2 = Math.round(r.jny * (1 - e) + cy2 * e);
            if (k >= 1) r.jwx = null;
          }
        }
        if (r.cheerT0 != null) {
          // celebration hop, timed to burst wave
          const ct = (a2T - r.cheerT0) / 380;
          if (ct >= 0 && ct <= 1) cy2 = Math.round(cy2 - Math.sin(ct * Math.PI) * 2.4);
          else r.cheerT0 = null;
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

    // "wait for me" mutters from maybe/approaching NPCs
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

    dialogRender();
    convRender();

    if (!convVisible && !a2SD && a2PromptCooldown <= 0) {
      const pwx = a2WX + a2PX;
      const nearestSameLane = a2NPCs.find((n) => n.st === "idle" && n.ru === a2PRu && Math.abs(n.wx - pwx) < 16);
      const nearestOtherLane = a2NPCs.find((n) => n.st === "idle" && n.ru !== a2PRu && Math.abs(n.wx - pwx) < 16);
      if (!a2HasMoved && a2T > 1500) {
        renderTapPrompt(ctrl("act3Move"), H - 2, "#fff", C_PLAYER, true);
      } else if (a2HasMoved && !a2HasTalked && nearestSameLane) {
        // teach walking into a same-lane NPC
        renderTapPrompt(ctrl("act3WalkInto"), H - 2, "#fff", C_PLAYER, true);
      } else if (a2HasMoved && !a2HasHopped && nearestOtherLane) {
        // teach lane-hopping to reach other lanes
        renderTapPrompt(ctrl("act3HopLane"), H - 2, "#fff", C_PLAYER, true);
      }
    }

    if (a2TN && convVisible) {
      const _hasChunks = _convChunkQueue.length > 0;
      if (_hasChunks || A2_WAITING_TPS.has(a2TP)) {
        const lastLine = convLog[convLog.length - 1];
        const lineLen = lastLine ? lastLine.text.length : 0;
        const isLongLine = lineLen > 60;
        const dwell = !a2HasAdvancedDialogue ? 1500 : isLongLine ? 9000 : 8000;
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
    const staged = _stageKeepCells(keepCells); // also where Act 4 starts
    runActBoundary({
      outro: (done) => streamOut(done, { edge: "left", excludeXY, render: false }),
      setupNext: initAct4,
      banner: {
        lines: [
          { t: window.LANG.bannerRallyNeighbourhood, c: C_VIOLET, d: 9999 },
          { pause: true, d: T.bannerBeat },
          { t: window.LANG.bannerAvoidNarcs, c: C_VIOLET, d: 9999 },
        ],
        frameIdx: 1, 
        keepCells: staged,
      },
      intro: (done) => {
        const targetXY = _excludeByDiff(
          () => render(true),
          () => renderAct4({ skipPlayerCrew: true }),
        );
        streamIn(
          () => {
            Music.transition("music_act4");
            Footsteps.start();
            done();
          },
          {
            edge: "right",
            render: false,
            excludeXY: targetXY,
            overlay: _walkCellsOverlay(staged, targetXY),
            holdMs: 150,
            jitterMs: 650,
            flyMsMin: 650,
            flyMsMax: 1150,
            overshootChance: 0,
            wobAmpMin: 0.15,
            wobAmpMax: 0.5,
          },
        );
      },
    });
  }

