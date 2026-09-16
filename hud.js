  const hudScore = document.getElementById("hud-score"),
    hudStatus = document.getElementById("hud-status"),
    hudLabel = document.getElementById("hud-label");


  function _pips(n, max) {
    return "◆".repeat(Math.max(0, Math.min(n, max))) + "◇".repeat(Math.max(0, max - n));
  }
  function _timeBarHud(fracLeft, jitter) {
    // 8 blocks was too wide for mobile
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

  let _hudLabelCache = null,
    _hudScoreCache = null,
    _hudStatusCache = null,
    _hudStatusColorCache = null;
  function _setHudLabel(html) {
    if (html !== _hudLabelCache) {
      _hudLabelCache = html;
      hudLabel.innerHTML = html;
    }
  }
  function _setHudScore(text) {
    if (text !== _hudScoreCache) {
      _hudScoreCache = text;
      hudScore.textContent = text;
    }
  }
  function _setHudStatus(text, color) {
    if (text !== _hudStatusCache) {
      _hudStatusCache = text;
      hudStatus.textContent = text;
    }
    if (color !== undefined && color !== _hudStatusColorCache) {
      _hudStatusColorCache = color;
      hudStatus.style.color = color;
    }
  }

  function _updateDomHud() {
    if (phase === "act2") {
      _setHudLabel(_hudSeg(window.LANG.hudCrew || "CREW", _pips(0, A2_MIN), C_TEAL));
      _setHudScore("");
      _setHudStatus("");
    } else if (phase === "act3") {
      const tl = Math.max(0, Math.floor((A2_TIME_LIMIT_MS - a2T) / 1000));
      _setHudLabel(
        _hudSeg(window.LANG.hudCrew || "CREW", _pips(a2CrewCount, A2_MIN), a2CrewCount >= A2_MIN ? C_SUCCESS : C_TEAL, _hudPop("crew", a2CrewCount)) +
          _hudSeg(window.LANG.hudNarcs || "NARCS", _pips(a2Ht, A2_MH), C_WARN, _hudPop("narcs2", a2Ht)) +
          _hudSeg(window.LANG.hudTime || "TIME LEFT", _timeBarHud(1 - a2T / A2_TIME_LIMIT_MS), tl < 15 ? C_DANGER : C_DIM),
      );
      _setHudScore("");
      _setHudStatus("");
    } else if (phase === "act4") {
      _setHudLabel(
        _hudSeg(window.LANG.hudCrew || "CREW", a2CrewCount, C_TEAL, _hudPop("crew", a2CrewCount)) +
          _hudSeg(window.LANG.hudNarcs || "NARCS", _pips(a2bHt, A2B_MH), C_WARN, _hudPop("narcs2b", a2bHt)),
      );
      _setHudScore("");
      _setHudStatus(a2bHt > 0 ? "" : window.LANG.hudAvoidNarcs, C_DIM);
    } else if (phase === "act5" || phase === "act6exit" || phase === "act7") {
      _setHudLabel(_hudSeg(window.LANG.hudCrew || "CREW", a2CrewCount, C_TEAL, _hudPop("crew", a2CrewCount)));
      _setHudScore("");
      _setHudStatus("");
    } else if (phase === "act6") {
      const my = state.get("score") || 0;
      const haul = my + s4AlyScore;
      const _jitter = s4Ug > 0.2 ? (Math.random() < 0.15 ? 1 : 0) : 0;
      _setHudLabel(
        _hudSeg(window.LANG.hudCrew || "CREW", a2CrewCount, C_TEAL, _hudPop("crew", a2CrewCount)) +
          _hudSeg(window.LANG.hudHaul, "$" + haul, C_PLAYER, _hudPop("haul", haul)) +
          _hudSeg(window.LANG.hudTime || "TIME LEFT", _timeBarHud(1 - s4Ug, _jitter), s4Ug < 0.35 ? C_DIM : s4Ug < 0.7 ? C_WARN : C_DANGER),
      );
      _setHudScore("");
      _setHudStatus("");
    } else {
      _setHudLabel("");
      _setHudScore("");
      _setHudStatus("");
    }
  }
