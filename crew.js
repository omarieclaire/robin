/* The robins — crew roster, player art, hats. */
let a2Crew;
let a2CrewCount = 0;

  const A2_PA = window.GAME_DATA.playerArt;

  let _originalPlayerHead = null;
  let _originalCrewHeads = [];

  function applyCrewHat(i) {
    const c = a2Crew[i];
    if (!c || !c.art || c.art.length === 0) return;
    if (_originalCrewHeads[i] === undefined) _originalCrewHeads[i] = c.art[0][0];
    c.art = [HAT_CHAR + c.art[0].slice(1), ...c.art.slice(1)];
    c._hatColor = HAT_COLOR;
  }

  function applyPlayerHat() {
    if (_originalPlayerHead) return; // already hatted
    _originalPlayerHead = [A2_PA[0][0][0], A2_PA[1][0][0]];
    for (let frame = 0; frame < A2_PA.length; frame++) {
      A2_PA[frame] = [HAT_CHAR + A2_PA[frame][0].slice(1), ...A2_PA[frame].slice(1)];
    }
  }

  function removeHats() {
    // Restore player
    if (_originalPlayerHead) {
      for (let frame = 0; frame < A2_PA.length; frame++) {
        A2_PA[frame] = [_originalPlayerHead[frame] + A2_PA[frame][0].slice(1), ...A2_PA[frame].slice(1)];
      }
      _originalPlayerHead = null;
    } // Restore crew
    for (let i = 0; i < a2Crew.length; i++) {
      const orig = _originalCrewHeads[i];
      if (orig && a2Crew[i] && a2Crew[i].art) {
        a2Crew[i].art = [orig + a2Crew[i].art[0].slice(1), ...a2Crew[i].art.slice(1)];
        delete a2Crew[i]._hatColor;
      }
    }
    _originalCrewHeads = [];
  }

  function ensureCrew() {
    /* Dev scaffolding: pads a2Crew to a2CrewCount when jumping to act via keyboard shortcuts */
    if (!a2Crew) a2Crew = [];
    while (a2Crew.length < a2CrewCount) {
      const ai = a2Crew.length;
      a2Crew.push({
        b: Math.random() * 6,
        ru: 0,
        art: window.GAME_DATA.npcArts[ai % window.GAME_DATA.npcArts.length],
        col: window.GAME_DATA.npcColors[ai % window.GAME_DATA.npcColors.length],
      });
    }
  }
