/* DOM hud — score/status/label segments. */
  const hudScore = document.getElementById("hud-score"),
    hudStatus = document.getElementById("hud-status"),
    hudLabel = document.getElementById("hud-label");


  function _pips(n, max) {
    return "◆".repeat(Math.max(0, Math.min(n, max))) + "◇".repeat(Math.max(0, max - n));
  }
  function _timeBarHud(fracLeft, jitter) {
    // 7 blocks — 8 was exactly one block too wide for the mobile row
    const filled = Math.max(0, Math.min(7, Math.round(fracLeft * 7) - (jitter || 0)));
    return "█".repeat(filled) + "░".repeat(7 - filled);
  }

  function _hudSeg(label, value, color, valueStyle) {
    return '<span class="seg" style="color:' + color + '"><span>' + label + "</span><span" + (valueStyle ? ' style="' + valueStyle + '"' : "") + ">" + value + "</span></span>";
  }

  const _hudPopPrev = {},
    _hudPopT = {};
  function _hudPop(key, value) {
    if (!(key in _hudPopPrev)) _hudPopPrev[key] = value;
    if (value !== _hudPopPrev[key]) {
      _hudPopT[key] = 220;
      _hudPopPrev[key] = value;
    } else if (_hudPopT[key] > 0) {
      _hudPopT[key] -= _lastDt;
    }
    return _hudPopT[key] > 0 ? "display:inline-block;transform:scale(" + (1 + 0.3 * (_hudPopT[key] / 220)).toFixed(3) + ")" : "";
  }

  function _updateDomHud() {
    if (phase === "act2") {
      hudLabel.innerHTML = _hudSeg(window.LANG.hudCrew || "CREW", _pips(0, A2_MIN), C_TEAL);
      hudScore.textContent = "";
      hudStatus.textContent = "";
    } else if (phase === "act3") {
      const tl = Math.max(0, Math.floor((A2_TIME_LIMIT_MS - a2T) / 1000));
      hudLabel.innerHTML =
        _hudSeg(window.LANG.hudCrew || "CREW", _pips(a2CrewCount, A2_MIN), a2CrewCount >= A2_MIN ? C_SUCCESS : C_TEAL, _hudPop("crew", a2CrewCount)) +
        _hudSeg(window.LANG.hudNarcs || "NARCS", _pips(a2Ht, A2_MH), C_WARN, _hudPop("narcs2", a2Ht)) +
        _hudSeg(window.LANG.hudTime || "TIME LEFT", _timeBarHud(1 - a2T / A2_TIME_LIMIT_MS), tl < 15 ? C_DANGER : C_DIM);
      hudScore.textContent = "";
      hudStatus.textContent = "";
    } else if (phase === "act4") {
      hudLabel.innerHTML =
        _hudSeg(window.LANG.hudCrew || "CREW", a2CrewCount, C_TEAL, _hudPop("crew", a2CrewCount)) +
        _hudSeg(window.LANG.hudNarcs || "NARCS", _pips(a2bHt, A2B_MH), C_WARN, _hudPop("narcs2b", a2bHt));
      hudScore.textContent = "";
      hudStatus.textContent = a2bHt > 0 ? "" : window.LANG.hudAvoidNarcs;
      hudStatus.style.color = C_DIM;
    } else if (phase === "act5" || phase === "act6exit" || phase === "act7") {
      hudLabel.innerHTML = _hudSeg(window.LANG.hudCrew || "CREW", a2CrewCount, C_TEAL, _hudPop("crew", a2CrewCount));
      hudScore.textContent = "";
      hudStatus.textContent = "";
    } else if (phase === "act6") {
      const my = state.get("score") || 0;
      const haul = my + s4AlyScore;
      const _jitter = s4Ug > 0.2 ? (Math.random() < 0.15 ? 1 : 0) : 0;
      hudLabel.innerHTML =
        _hudSeg(window.LANG.hudCrew || "CREW", a2CrewCount, C_TEAL, _hudPop("crew", a2CrewCount)) +
        _hudSeg(window.LANG.hudHaul, "$" + haul, C_PLAYER, _hudPop("haul", haul)) +
        _hudSeg(window.LANG.hudTime || "TIME LEFT", _timeBarHud(1 - s4Ug, _jitter), s4Ug < 0.35 ? C_DIM : s4Ug < 0.7 ? C_WARN : C_DANGER);
      hudScore.textContent = "";
      hudStatus.textContent = "";
    } else {
      hudLabel.textContent = "";
      hudScore.textContent = "";
      hudStatus.textContent = "";
    }
  }
