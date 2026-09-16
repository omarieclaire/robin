  function _measureCell() {
    const fontSize = parseFloat(gs.style.fontSize);
    const probe = document.createElement("span");
    probe.style.cssText =
      "font-family:'Courier New','Consolas','Monaco',monospace;white-space:pre;line-height:1;position:absolute;visibility:hidden;font-size:" +
      fontSize +
      "px;letter-spacing:0";
    probe.textContent = "M";
    gs.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    gs.removeChild(probe);
    return { cellW: rect.width, cellH: rect.height };
  }


  let _cellMetricsCache = null;
  function _measureCellCached() {
    const fs = gs.style.fontSize;
    if (!_cellMetricsCache || _cellMetricsCache.fs !== fs) {
      const m = _measureCell();
      _cellMetricsCache = { fs, cellW: m.cellW, cellH: m.cellH };
    }
    return _cellMetricsCache;
  }

  let _rectCache = null;
  function _measureRectCached() {
    if (!_rectCache) _rectCache = gs.getBoundingClientRect();
    return _rectCache;
  }
  window.addEventListener("resize", () => {
    _rectCache = null;
  });

  let _mouseSX = -1,
    _mouseSY = -1;
  gs.addEventListener("pointermove", (e) => {
    e.preventDefault();
    // No hover on touch — skip on mobile
    if (phase === "act6" && !Device.isMobile) {
      const r4 = _measureRectCached();
      const cell4 = _measureCellCached();
      _mouseSX = Math.floor((e.clientX - r4.left) / cell4.cellW);
      _mouseSY = Math.floor((e.clientY - r4.top) / cell4.cellH);
    }
    if (!convChoices) return;
    const r = _measureRectCached();
    const { cellH } = _measureCellCached();
    const my = Math.floor((e.clientY - r.top) / cellH);

    if (my >= convChoiceY1 && my <= convChoiceY2) {
      convChoiceHover = convChoices.length - 1;
      for (let ci = 0; ci < convChoiceYs.length - 1; ci++) {
        if (my < convChoiceYs[ci + 1]) {
          convChoiceHover = ci;
          break;
        }
      }
    }

  });
  gs.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
    },
    { passive: false },
  );
  gs.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      window._markActivity();
    },
    { passive: false },
  );
  gs.addEventListener("pointerup", (e) => {
    e.preventDefault();
    window._markActivity();
    const r = _measureRectCached();
    const { cellW, cellH } = _measureCellCached();
    clickSX = Math.floor((e.clientX - r.left) / cellW);
    clickSY = Math.floor((e.clientY - r.top) / cellH);
    clickPending = true;
    spark(clickSX, clickSY, "#9c9c9ca0", 4);
  });
