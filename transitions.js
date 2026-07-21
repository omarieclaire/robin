
  let _transitionGen = 0;

  function _shuffledIndices(n) {
    const xs = Array.from({ length: n }, (_, i) => i);
    for (let i = xs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [xs[i], xs[j]] = [xs[j], xs[i]];
    }
    return xs;
  }


  function _easeCurve(p, mode) {
    if (mode === "inOutCubic") return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    if (mode === "inCubic") return p * p * p;
    return 1 - Math.pow(1 - p, 3);
  }


  function collapseGravity(onComplete, opts = {}) {
    const axis = opts.axis || "y";
    const jitter = opts.jitter ?? 500;
    const gravityStep = opts.gravityStep ?? 75;
    const settleMs = opts.settleMs ?? 350;
    const maxMs = opts.maxMs ?? 6000;
    const releaseAtFn = opts.releaseAt || null;
    const lastReleaseAt = opts.lastReleaseAt ?? jitter;

    const edgeDrain = opts.edgeDrain ?? 0;
    const _halfW = (W - 1) / 2;

    const dropArt = opts.dropArt || null;
    let _daY = dropArt ? -dropArt.art.length : 0;
    let _daLanded = false;
    const _myGen = ++_transitionGen;
    if (opts.render !== false) render(true);

    const vertical = axis === "y";
    const _cells = Array.from({ length: H }, (_, y) =>
      Array.from({ length: W }, (_, x) => ({
        ch: grid.c[y][x].ch,
        co: grid.c[y][x].co,
        origin: vertical ? y : x,
        releaseAt: releaseAtFn ? releaseAtFn(x, y) : Math.random() * jitter,
   
        drain: edgeDrain > 0 && Math.random() < edgeDrain * Math.pow(Math.min(1, Math.abs(x - _halfW) / (_halfW * 0.55)), 1.6),
      })),
    );

    let elapsed = 0,
      gravAccum = 0,
      quietMs = 0;
    let last = performance.now();
    function _tick(now) {
      if (_myGen !== _transitionGen) return; // superseded — stop painting
      const dt = Math.min(now - last, 100);
      last = now;
      elapsed += dt;

      let moved = false;
      gravAccum += dt;
      while (gravAccum >= gravityStep) {
        gravAccum -= gravityStep;
        if (vertical && edgeDrain > 0) {
    
          for (let x = 0; x < W; x++) {
            const c = _cells[H - 1][x];
            if (c.ch !== " " && c.drain && elapsed >= c.releaseAt) {
              _cells[H - 1][x] = { ch: " ", co: null, origin: H - 1, releaseAt: 0 };
              moved = true;
            }
          }
        }
       
        if (vertical && dropArt && elapsed >= dropArt.releaseAt && !_daLanded) {
          let _blocked = _daY + dropArt.art.length >= H;
          if (!_blocked) {
            outer: for (let r = 0; r < dropArt.art.length; r++) {
              const _dRow = dropArt.art[r];
              for (let i = 0; i < _dRow.length; i++) {
                if (_dRow[i] === " ") continue;
                const ax = dropArt.x - Math.floor(_dRow.length / 2) + i;
                const ay = _daY + r + 1; // where this glyph would be after the step
                if (ay >= 0 && ax >= 0 && ax < W && (ay >= H || _cells[ay][ax].ch !== " ")) {
                  _blocked = true;
                  break outer;
                }
              }
            }
          }
          if (_blocked) {
            _daLanded = true;
          } else {
            _daY++;
            moved = true;
          }
        }
        if (vertical) {
          for (let y = H - 2; y >= 0; y--) {
            for (const x of _shuffledIndices(W)) {
              const c = _cells[y][x];
              if (c.ch === " ") continue;
              if (y === c.origin && elapsed < c.releaseAt) continue;
              if (_cells[y + 1][x].ch === " ") {
                _cells[y + 1][x] = c;
                _cells[y][x] = { ch: " ", co: null, origin: y, releaseAt: 0 };
                moved = true;
                continue;
              }
              const canL = x > 0 && _cells[y + 1][x - 1].ch === " ";
              const canR = x < W - 1 && _cells[y + 1][x + 1].ch === " ";
              if (canL || canR) {
                let nx;
                if (canL && canR) {
                  if (edgeDrain > 0) {
                    const _outward = x >= _halfW ? x + 1 : x - 1;
                    const _inward = x >= _halfW ? x - 1 : x + 1;
                    nx = Math.random() < 0.8 ? _outward : _inward;
                  } else {
                    nx = Math.random() < 0.5 ? x + 1 : x - 1;
                  }
                } else {
                  nx = canR ? x + 1 : x - 1;
                }
                _cells[y + 1][nx] = c;
                _cells[y][x] = { ch: " ", co: null, origin: y, releaseAt: 0 };
                moved = true;
              }
            }
          }
        } else {
          for (let x = W - 2; x >= 0; x--) {
            for (const y of _shuffledIndices(H)) {
              const c = _cells[y][x];
              if (c.ch === " ") continue;
              if (x === c.origin && elapsed < c.releaseAt) continue;
              if (_cells[y][x + 1].ch === " ") {
                _cells[y][x + 1] = c;
                _cells[y][x] = { ch: " ", co: null, origin: x, releaseAt: 0 };
                moved = true;
                continue;
              }
              const canU = y > 0 && _cells[y - 1][x + 1].ch === " ";
              const canD = y < H - 1 && _cells[y + 1][x + 1].ch === " ";
              if (canU || canD) {
                const ny = canD && (!canU || Math.random() < 0.5) ? y + 1 : y - 1;
                _cells[ny][x + 1] = c;
                _cells[y][x] = { ch: " ", co: null, origin: x, releaseAt: 0 };
                moved = true;
              }
            }
          }
        }
      }

      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) grid.set(x, y, _cells[y][x].ch, _cells[y][x].co);
      if (dropArt && elapsed >= dropArt.releaseAt) {
        dropArt.art.forEach((row, r) => {
          for (let i = 0; i < row.length; i++) {
            if (row[i] === " ") continue;
            const ax = dropArt.x - Math.floor(row.length / 2) + i,
              ay = _daY + r;
            if (ax >= 0 && ax < W && ay >= 0 && ay < H) grid.set(ax, ay, row[i], dropArt.co || null);
          }
        });
      }
      gs.innerHTML = grid.html();

      if (!moved && elapsed >= lastReleaseAt) quietMs += dt;
      else quietMs = 0;

      if (quietMs > settleMs || elapsed > maxMs) {
        onComplete();
      } else {
        requestAnimationFrame(_tick);
      }
    }
    // Synchronous first frame — avoids a one-frame flash of the pre-collapse snapshot.
    _tick(performance.now());
  }


  function streamIn(onComplete, opts = {}) {
    const edge = opts.edge || "right";
    const holdMs = opts.holdMs ?? 250;
    const ease = opts.ease || "outCubic";
    const flyMsMin = opts.flyMsMin ?? 900;
    const flyMsMax = opts.flyMsMax ?? 1800;
    const jitterMs = opts.jitterMs ?? 1400;
    const overshootChance = opts.overshootChance ?? 0.35;
    const wobAmpMin = opts.wobAmpMin ?? 0.4;
    const wobAmpMax = opts.wobAmpMax ?? 2.0;
    const wobFreqMin = opts.wobFreqMin ?? 1;
    const wobFreqMax = opts.wobFreqMax ?? 4;
    const extraMin = opts.extraMin ?? 15;
    const extraMax = opts.extraMax ?? 60;
    const overshootStrength = opts.overshootStrength ?? 1; // scales the back-ease bounce
    const excludeSet = new Set((opts.excludeXY || []).map((p) => p.y * W + p.x));
    const _myGen = ++_transitionGen;
    if (opts.render !== false) render(true);

    const target = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => ({ ch: grid.c[y][x].ch, co: grid.c[y][x].co })));
    const horizontal = edge === "right" || edge === "left";

    const cells = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = target[y][x];
        if (c.ch === " ") continue;
        if (excludeSet.has(y * W + x)) continue; // arrives via the final settled frame, not a flight
        const extra = extraMin + Math.random() * (extraMax - extraMin);
        let sx = x,
          sy = y;
        if (edge === "right") sx = x + (W - x) + extra;
        else if (edge === "left") sx = x - (x + extra);
        else if (edge === "bottom") sy = y + (H - y) + extra;
        else sy = y - (y + extra); // top
        cells.push({
          tx: x,
          ty: y,
          sx,
          sy,
          ch: c.ch,
          co: c.co,
          delay: holdMs + Math.random() * jitterMs,
          dur: flyMsMin + Math.random() * (flyMsMax - flyMsMin),
          overshoot: Math.random() < overshootChance,
          wobAmp: wobAmpMin + Math.random() * (wobAmpMax - wobAmpMin),
          wobFreq: wobFreqMin + Math.random() * (wobFreqMax - wobFreqMin),
          wobPhase: Math.random() * Math.PI * 2,
        });
      }
    }

    let elapsed = 0;
    let last = performance.now();
    function _tick(now) {
      if (_myGen !== _transitionGen) return; // superseded — stop painting
      const dt = Math.min(now - last, 100);
      last = now;
      elapsed += dt;

      grid.clear();
      let allDone = true;
      for (const c of cells) {
        const t = elapsed - c.delay;
        if (t <= 0) {
          allDone = false;
          grid.set(Math.round(c.sx), Math.round(c.sy), c.ch, c.co); // hold, visible, at the stacked start position
          continue;
        }
        const p = Math.min(1, t / c.dur);
        if (p < 1) allDone = false;
        const ep = c.overshoot
          ? 1 + 2.7 * overshootStrength * Math.pow(p - 1, 3) + 1.7 * overshootStrength * Math.pow(p - 1, 2)
          : _easeCurve(p, ease);
        const wob = Math.sin(p * Math.PI * c.wobFreq + c.wobPhase) * c.wobAmp * (1 - p);
        const cx = horizontal ? c.sx + (c.tx - c.sx) * ep : c.tx + wob;
        const cy = horizontal ? c.ty + wob : c.sy + (c.ty - c.sy) * ep;
        grid.set(Math.round(cx), Math.round(cy), c.ch, c.co);
      }
      if (opts.overlay) opts.overlay(elapsed);
      gs.innerHTML = grid.html();

      if (!allDone) {
        requestAnimationFrame(_tick);
      } else {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (target[y][x].ch !== " ") grid.set(x, y, target[y][x].ch, target[y][x].co);
        gs.innerHTML = grid.html();
        onComplete();
      }
    }
   
    _tick(performance.now());
  }


  function streamOut(onComplete, opts = {}) {
    const edge = opts.edge || "left";
    const ease = opts.ease || "inCubic";
    const jitterMs = opts.jitterMs ?? 1400;
    const flyMsMin = opts.flyMsMin ?? 900;
    const flyMsMax = opts.flyMsMax ?? 1800;
    const wobAmpMin = opts.wobAmpMin ?? 0.4;
    const wobAmpMax = opts.wobAmpMax ?? 2.0;
    const wobFreqMin = opts.wobFreqMin ?? 1;
    const wobFreqMax = opts.wobFreqMax ?? 4;
    const extraMin = opts.extraMin ?? 15;
    const extraMax = opts.extraMax ?? 60;
    const excludeSet = new Set((opts.excludeXY || []).map((p) => p.y * W + p.x));
    const _myGen = ++_transitionGen;
    if (opts.render !== false) render(true);

    const source = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => ({ ch: grid.c[y][x].ch, co: grid.c[y][x].co })));
    const horizontal = edge === "left" || edge === "right";

    const cells = [];
    const keepCells = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = source[y][x];
        if (c.ch === " ") continue;
        if (excludeSet.has(y * W + x)) {
          keepCells.push({ x, y, ch: c.ch, co: c.co });
          continue;
        }
        const extra = extraMin + Math.random() * (extraMax - extraMin);
        let ex = x,
          ey = y; // exit destination, off past the edge
        if (edge === "left") ex = x - (x + extra);
        else if (edge === "right") ex = x + (W - x) + extra;
        else if (edge === "top") ey = y - (y + extra);
        else ey = y + (H - y) + extra; // bottom
        cells.push({
          sx: x,
          sy: y,
          ex,
          ey,
          ch: c.ch,
          co: c.co,
          delay: Math.random() * jitterMs,
          dur: flyMsMin + Math.random() * (flyMsMax - flyMsMin),
          wobAmp: wobAmpMin + Math.random() * (wobAmpMax - wobAmpMin),
          wobFreq: wobFreqMin + Math.random() * (wobFreqMax - wobFreqMin),
          wobPhase: Math.random() * Math.PI * 2,
        });
      }
    }

    let elapsed = 0;
    let last = performance.now();
    function _tick(now) {
      if (_myGen !== _transitionGen) return; // superseded — stop painting
      const dt = Math.min(now - last, 100);
      last = now;
      elapsed += dt;

      grid.clear();
      let allDone = true;
      for (const c of cells) {
        const t = elapsed - c.delay;
        if (t <= 0) {
          allDone = false;
          grid.set(c.sx, c.sy, c.ch, c.co); // still sitting where it always was
          continue;
        }
        const p = Math.min(1, t / c.dur);
        if (p < 1) allDone = false;
        else continue; // fully departed — nothing to draw
        const ep = _easeCurve(p, ease);
        const wob = Math.sin(p * Math.PI * c.wobFreq + c.wobPhase) * c.wobAmp * (1 - p);
        const cx = horizontal ? c.sx + (c.ex - c.sx) * ep : c.sx + wob;
        const cy = horizontal ? c.sy + wob : c.sy + (c.ey - c.sy) * ep;
        grid.set(Math.round(cx), Math.round(cy), c.ch, c.co);
      }
      for (const k of keepCells) grid.set(k.x, k.y, k.ch, k.co); // excluded spots (e.g. the player) — always fresh, untouched
      gs.innerHTML = grid.html();

      if (!allDone) {
        requestAnimationFrame(_tick);
      } else {
        grid.clear();
        for (const k of keepCells) grid.set(k.x, k.y, k.ch, k.co);
        gs.innerHTML = grid.html();
        onComplete();
      }
    }
    _tick(performance.now());
  }

  function riseFromPile(onComplete, opts = {}) {
    const peppersMs = opts.peppersMs ?? 1000;
    const holdMs = opts.holdMs ?? Math.max(400, peppersMs);
    const ease = opts.ease || "outCubic";
    const flyMsMin = opts.flyMsMin ?? 900;
    const flyMsMax = opts.flyMsMax ?? 2000;
    const jitterMs = opts.jitterMs ?? 1100;
    const pileDepth = opts.pileDepth ?? Math.min(H * 0.4, 12);
    const overshootChance = opts.overshootChance ?? 0.4;
    const wobAmpMin = opts.wobAmpMin ?? 0.5;
    const wobAmpMax = opts.wobAmpMax ?? 3.0;
    const wobFreqMin = opts.wobFreqMin ?? 1;
    const wobFreqMax = opts.wobFreqMax ?? 5;
    const overshootStrength = opts.overshootStrength ?? 1; 
    const keep = opts.keepCells || null;
    const _rExcludeSet = new Set((opts.excludeXY || []).map((p) => p.y * W + p.x));
   
    const simmer = opts.simmer ?? false;
    const pool = opts.spawnPool && opts.spawnPool.length ? _shuffledIndices(opts.spawnPool.length).map((i) => opts.spawnPool[i]) : null;
    const _myGen = ++_transitionGen;
    if (opts.render !== false) render(true);

    
    let poolMinX, poolMaxX, poolMinY, poolMaxY;
    if (pool) {
      poolMinX = Math.min(...pool.map((p) => p.x));
      poolMaxX = Math.max(...pool.map((p) => p.x));
      poolMinY = Math.min(...pool.map((p) => p.y));
      poolMaxY = Math.max(...pool.map((p) => p.y));
    }

    const target = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => ({ ch: grid.c[y][x].ch, co: grid.c[y][x].co })));

    const cells = [];
    let poolIdx = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = target[y][x];
        if (c.ch === " ") continue;
        if (_rExcludeSet.has(y * W + x)) continue; // arrives via the final settled frame, not a rise
        let sx, sy, fromPool, fromCh, fromCo;
        if (pool && poolIdx < pool.length) {
          sx = pool[poolIdx].x;
          sy = pool[poolIdx].y;
          fromCh = pool[poolIdx].ch;
          fromCo = pool[poolIdx].co;
          poolIdx++;
          fromPool = true;
        } else if (pool) {
          sx = poolMinX + Math.random() * (poolMaxX - poolMinX + 1);
          sy = poolMinY + Math.random() * (poolMaxY - poolMinY + 1);
          fromPool = false;
        } else {
          // No pool at all — original default heap distribution.
          sx = Math.random() * W;
          sy = H - 1 - Math.pow(Math.random(), 1.6) * pileDepth;
          fromPool = true; // nothing to hide when there's no reused pile to protect
        }
        cells.push({
          tx: x,
          ty: y,
          sx,
          sy,
          ch: c.ch,
          co: c.co,
          fromCh,
          fromCo,
         
          holdVisible: !pool || fromPool,
         
          swapAt: Math.random() * peppersMs,
          delay: holdMs + Math.random() * jitterMs,
          dur: flyMsMin + Math.random() * (flyMsMax - flyMsMin),
          overshoot: Math.random() < overshootChance,
          wobAmp: wobAmpMin + Math.random() * (wobAmpMax - wobAmpMin),
          wobFreq: wobFreqMin + Math.random() * (wobFreqMax - wobFreqMin),
          wobPhase: Math.random() * Math.PI * 2,
        });
      }
    }

    let elapsed = 0;
    let last = performance.now();
    function _tick(now) {
      if (_myGen !== _transitionGen) return; // superseded — stop painting
      const dt = Math.min(now - last, 100);
      last = now;
      elapsed += dt;

      grid.clear();
      let allDone = true;
      for (const c of cells) {
        const t = elapsed - c.delay;
        if (t <= 0) {
          allDone = false;
          if (c.holdVisible) {
            const _hx = simmer ? c.sx + Math.sin(elapsed / 280 + c.wobPhase) * 0.7 : c.sx;
            const _hy = simmer ? c.sy + Math.cos(elapsed / 340 + c.wobPhase) * 0.4 : c.sy;
            if (c.fromCh && elapsed < c.swapAt) grid.set(Math.round(_hx), Math.round(_hy), c.fromCh, c.fromCo);
            else grid.set(Math.round(_hx), Math.round(_hy), c.ch, c.co);
          }
          continue;
        }
        const p = Math.min(1, t / c.dur);
        if (p < 1) allDone = false;
        const ep = c.overshoot
          ? 1 + 2.7 * overshootStrength * Math.pow(p - 1, 3) + 1.7 * overshootStrength * Math.pow(p - 1, 2)
          : _easeCurve(p, ease);
        const dx = c.tx - c.sx,
          dy = c.ty - c.sy;
        const dist = Math.hypot(dx, dy) || 1;
        const wob = Math.sin(p * Math.PI * c.wobFreq + c.wobPhase) * c.wobAmp * (1 - p);
        const cx = c.sx + dx * ep + (-dy / dist) * wob;
        const cy = c.sy + dy * ep + (dx / dist) * wob;
        grid.set(Math.round(cx), Math.round(cy), c.ch, c.co);
      }
      if (keep) for (const k of keep) grid.set(k.x, k.y, k.ch, k.co);
      if (opts.overlay) opts.overlay(elapsed);
      gs.innerHTML = grid.html();

      if (!allDone) {
        requestAnimationFrame(_tick);
      } else {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) grid.set(x, y, target[y][x].ch, target[y][x].co);
        if (keep) for (const k of keep) grid.set(k.x, k.y, k.ch, k.co);
        gs.innerHTML = grid.html();
        onComplete();
      }
    }
  
    _tick(performance.now());
  }

  function collapseToCenter(onComplete, opts = {}) {
    const cx = opts.cx ?? W / 2;
    const cy = opts.cy ?? H / 2;
    const spread = opts.spread ?? Math.max(5, Math.floor(Math.min(W, H) * 0.2));
    const ease = opts.ease || "inCubic";
    const jitterMs = opts.jitterMs ?? 300;
    const flyMsMin = opts.flyMsMin ?? 500;
    const flyMsMax = opts.flyMsMax ?? 900;
    const wobAmpMin = opts.wobAmpMin ?? 0.3;
    const wobAmpMax = opts.wobAmpMax ?? 1.2;
    const wobFreqMin = opts.wobFreqMin ?? 1;
    const wobFreqMax = opts.wobFreqMax ?? 4;
    const _myGen = ++_transitionGen;
    if (opts.render !== false) render(true);

    const _cExcludeSet = new Set((opts.excludeXY || []).map((p) => p.y * W + p.x));
    const source = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => ({ ch: grid.c[y][x].ch, co: grid.c[y][x].co })));
    const cells = [];
    const keepCells = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = source[y][x];
        if (c.ch === " ") continue;
        if (_cExcludeSet.has(y * W + x)) {
          keepCells.push({ x, y, ch: c.ch, co: c.co });
          continue;
        }
        const ang = Math.random() * Math.PI * 2;
        const r = Math.random() * spread;
        cells.push({
          sx: x,
          sy: y,
          ex: cx + Math.cos(ang) * r,
          ey: cy + Math.sin(ang) * r,
          ch: c.ch,
          co: c.co,
          delay: Math.random() * jitterMs,
          dur: flyMsMin + Math.random() * (flyMsMax - flyMsMin),
          wobAmp: wobAmpMin + Math.random() * (wobAmpMax - wobAmpMin),
          wobFreq: wobFreqMin + Math.random() * (wobFreqMax - wobFreqMin),
          wobPhase: Math.random() * Math.PI * 2,
        });
      }
    }

    let elapsed = 0;
    let last = performance.now();
    function _tick(now) {
      if (_myGen !== _transitionGen) return; // superseded — stop painting
      const dt = Math.min(now - last, 100);
      last = now;
      elapsed += dt;

      grid.clear();
      let allDone = true;
      for (const c of cells) {
        const t = elapsed - c.delay;
        if (t <= 0) {
          allDone = false;
          grid.set(c.sx, c.sy, c.ch, c.co);
          continue;
        }
        const p = Math.min(1, t / c.dur);
        if (p < 1) allDone = false;
        if (p >= 1) {
          const _sx2 = c.ex + Math.sin(elapsed / 280 + c.wobPhase) * 0.7;
          const _sy2 = c.ey + Math.cos(elapsed / 340 + c.wobPhase) * 0.4;
          grid.set(Math.round(_sx2), Math.round(_sy2), c.ch, c.co);
          continue;
        }
        const ep = _easeCurve(p, ease);
        const dx = c.ex - c.sx,
          dy = c.ey - c.sy;
        const dist = Math.hypot(dx, dy) || 1;
        const wob = Math.sin(p * Math.PI * c.wobFreq + c.wobPhase) * c.wobAmp * (1 - p);
        const px = c.sx + dx * ep + (-dy / dist) * wob;
        const py = c.sy + dy * ep + (dx / dist) * wob;
        grid.set(Math.round(px), Math.round(py), c.ch, c.co);
      }
      for (const k of keepCells) grid.set(k.x, k.y, k.ch, k.co); // excluded spots (e.g. player+crew) — always fresh, untouched
      gs.innerHTML = grid.html();

      if (!allDone) {
        requestAnimationFrame(_tick);
      } else {
  
        const pool = cells.map((c) => ({ x: Math.round(c.ex), y: Math.round(c.ey), ch: c.ch, co: c.co }));
        onComplete(pool);
      }
    }

    _tick(performance.now());
  }


  function _excludeByDiff(fullRenderFn, skipRenderFn) {
    fullRenderFn();
    const full = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => ({ ch: grid.c[y][x].ch, co: grid.c[y][x].co })));
    grid.clear();
    skipRenderFn();
    const excludeXY = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (full[y][x].ch !== grid.c[y][x].ch) excludeXY.push({ x, y });
      }
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) grid.set(x, y, full[y][x].ch, full[y][x].co);
    return excludeXY;
  }

  function runActBoundary({ outro, setupNext, banner, intro }) {
    try {
      loop.stop();
    } catch (_) {}

    outro(() => {
      setupNext();
      const targetPhase = phase; // setupNext() (e.g. initAct3) sets this

      const startIntro = () => {
        try {
          loop.stop();
        } catch (_) {}
        requestAnimationFrame(() => {
          phase = targetPhase;
          intro(() => loop.start());
        });
      };

      if (banner && banner.lines && banner.lines.length) {
        initInter(banner.lines, startIntro, banner.frameIdx || 0);
        _interKeepCells = banner.keepCells || null; // after initInter — it resets this
        loop.start();
      } else {
        startIntro();
      }
    });
  }


  function _stageKeepCells(cells) {
    if (!cells || !cells.length) return cells;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const c of cells) {
      minX = Math.min(minX, c.x);
      maxX = Math.max(maxX, c.x);
      minY = Math.min(minY, c.y);
      maxY = Math.max(maxY, c.y);
    }
    const gw = maxX - minX + 1,
      gh = maxY - minY + 1;
    const ox = Math.floor(W * A1_PSX_RATIO - gw / 2) - minX;
    const oy = Math.min(Math.floor(H * A1_PSY_RATIO - gh / 2), H - 3 - gh) - minY;
    return cells.map((c) => ({ x: c.x + ox, y: c.y + oy, fx: c.x, fy: c.y, ch: c.ch, co: c.co }));
  }

 
  function _walkCellsOverlay(fromCells, toXY) {
    let maxDist = 0;
    const pairs = fromCells.map((c, i) => {
      const t = toXY[Math.min(i, toXY.length - 1)] || { x: c.x, y: c.y };
      maxDist = Math.max(maxDist, Math.hypot(t.x - c.x, t.y - c.y));
      return { c, t };
    });
    const walkMs = maxDist < 2 ? 1 : Util.clamp(maxDist * 90, 1000, 2600);
    return (elapsed) => {
      const k = _easeCurve(Math.min(1, elapsed / walkMs), "inOutCubic");
      for (const p of pairs) {
        grid.set(Math.round(p.c.x + (p.t.x - p.c.x) * k), Math.round(p.c.y + (p.t.y - p.c.y) * k), p.c.ch, p.c.co);
      }
    };
  }
