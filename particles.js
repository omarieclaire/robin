/* Sparks, floats, and screen-flash triggers — particles drawn onto the grid. */
  /* ── SPARKS + CHROMATIC ────────────────────────────────── */
  const SPARK_CH = ["*", "+", "·", "×", "◦"];
  function spark(cx, cy, color, n) {
    for (let i = 0; i < (n || 8); i++) {
      const a = (Math.PI * 2 * i) / (n || 8) + Math.random() * 0.6;
      const sp = 0.01 + Math.random() * 0.02;
      sparks.push({
        x: cx,
        y: cy,
        dx: Math.cos(a) * sp,
        dy: Math.sin(a) * sp * 0.45,
        ch: SPARK_CH[i % SPARK_CH.length],
        color,
        life: 280 + Math.random() * 220,
      });
    }
  }
  function triggerChromatic(ms) {
    chromaticT = ms || 420;
  }
  function triggerFlashGood() {
    flashGoodT = 350;
  }
  function triggerFlashGold() {
    flashGoldT = 600;
  }
  function triggerFlashWarn() {
    flashWarnT = 400;
  }
  function triggerFlashDanger() {
    flashDangerT = 400;
  }
  function triggerChoiceConfirm() {
    audio.play("click");
  }
  function burstGood(cx, cy, color, n) {
    /* Fan upward — celebration shape */
    for (let i = 0; i < (n || 10); i++) {
      const a = Math.PI + (Math.PI * i) / ((n || 10) - 1); // upward arc
      const sp = 0.012 + Math.random() * 0.022;
      sparks.push({
        x: cx,
        y: cy,
        dx: Math.cos(a) * sp,
        dy: Math.sin(a) * sp * 0.55,
        ch: ["✦", "*", "·", "◦", "+", "★"][i % 6],
        color,
        life: 320 + Math.random() * 280,
      });
    }
  }

  function addFloat(t, x, y, co, local) {
    // food floats to disappear slightly faster
    const life = phase === "act6" ? 550 : FLOAT_STYLE.life;
    if (!local && phase !== "act6") audio.play("paper");
    floats.push({
      text: t,
      color: co,
      life,
      max: life,
      boxed: local ? false : FLOAT_STYLE.boxed,
      local: !!local,
      lx: x,
      ly: y,
    });
  }

  function updateParticles(dt) {
    for (let i = floats.length - 1; i >= 0; i--) {
      floats[i].life -= dt;
      if (floats[i].life <= 0) floats.splice(i, 1);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.dx * dt;
      s.y += s.dy * dt;
      s.dy += 0.000025 * dt; // gravity
      s.life -= dt;
      if (s.life <= 0) sparks.splice(i, 1);
    }
    if (chromaticT > 0) chromaticT -= dt;
  }

  function renderFloats() {
    const floatMaxW = W - 6;
    const floatBaseY =
      phase === "act4"
        ? Math.floor(H * 0.15)
        : phase === "act6"
          ? Math.floor(H * 0.08)
          : phase === "act3"
            ? Math.floor(H * 0.15)
            : Math.floor(H * 0.25);
    const playful = phase === "act6" || phase === "act4";
    const fBox = {
      tl: "┌",
      tr: "┐",
      bl: "└",
      br: "┘",
      h: "─",
      v: "│",
    };
    for (let fi = 0; fi < floats.length; fi++) {
      const f = floats[fi];
      if (f.life / f.max < FLOAT_STYLE.fadeStart) continue;
      if (f.local) {
        const maxW = W - 4;
        const localLines = wrapWords(f.text, maxW);
        const fx = f.lx ?? Math.floor(W / 2);
        const fy = f.ly ?? Math.floor(H * 0.25);
        for (let li = 0; li < localLines.length; li++) {
          const line = localLines[li];
          const tx = Util.clamp(fx - Math.floor(line.length / 2), 0, Math.max(0, W - line.length));
          const ty = fy - localLines.length + 1 + li;
          if (ty >= 0 && ty < H) grid.text(line, tx, ty, f.color);
        }
        continue;
      }
      const boxed = f.boxed;
      const innerMax = floatMaxW - FLOAT_STYLE.padX * 2 - (boxed ? 2 : 0);
      /* Word wrap */
      const lines = wrapWords(f.text, innerMax);
      const lineW = Math.max(...lines.map((l) => l.length));
      const bw = lineW + FLOAT_STYLE.padX * 2 + (boxed ? 2 : 0);
      const bh = boxed ? lines.length + 2 : lines.length;
      let bx, by;
      if (playful) {
        /* Stable per-float position jitter — set once on first render */
        if (f.jx === undefined) {
          f.jx = Math.floor((Math.random() - 0.5) * 8);
          f.jy = Math.floor((Math.random() - 0.5) * 3);
        }
        bx = Util.clamp(Math.floor((W - bw) / 2) + f.jx, Math.floor(W / 4), Math.floor((W * 3) / 4) - bw);
        by = Util.clamp(floatBaseY + f.jy, floatBaseY - 3, floatBaseY + 3);
      } else {
        bx = Math.floor((W - bw) / 2);
        const stackOff = fi * (bh + 1);
        by = Math.max(1, floatBaseY - stackOff);
      }
      if (boxed) {
        if (!playful) {
          for (let y = by; y < by + bh && y < H; y++) for (let x = bx; x < bx + bw && x < W; x++) if (x >= 0) grid.set(x, y, " ", null);
        }
        const _doubleOutline = phase === "act3" || phase === "act4";
        if (_doubleOutline) {
          const obx = bx - 1,
            oby = by - 1,
            obw = bw + 2,
            obh = bh + 2;
          const oCol = dullColor(f.color, 0.45);
          // Top
          if (oby >= 0) grid.text(fBox.tl + fBox.h.repeat(obw - 2) + fBox.tr, obx, oby, oCol);
          // Sides
          for (let ory = 1; ory < obh - 1; ory++) {
            const ay = oby + ory;
            if (ay >= 0 && ay < H) {
              if (obx >= 0) grid.set(obx, ay, fBox.v, oCol);
              if (obx + obw - 1 < W) grid.set(obx + obw - 1, ay, fBox.v, oCol);
            }
          }
          // Bottom
          if (oby + obh - 1 < H) grid.text(fBox.bl + fBox.h.repeat(obw - 2) + fBox.br, obx, oby + obh - 1, oCol);
        }
        grid.text(fBox.tl + fBox.h.repeat(bw - 2) + fBox.tr, bx, by, f.color);

        const _floatTextCol = brightenColor(f.color, 0.55);
        const _floatPanelBg = darkenColor(f.color, 0.82);
        for (let li = 0; li < lines.length; li++) {
          grid.text(fBox.v + " ".repeat(bw - 2) + fBox.v, bx, by + 1 + li, f.color);
          for (let hx = bx + 1; hx < bx + bw - 1; hx++) grid.setBg(hx, by + 1 + li, _floatPanelBg);
          const pad = Math.floor((lineW - lines[li].length) / 2);
          grid.text(lines[li], bx + 1 + FLOAT_STYLE.padX + pad, by + 1 + li, _floatTextCol); // no bold — smears glyphs at small grid sizes, reads as unreadable "bold banners"
        }
        grid.text(fBox.bl + fBox.h.repeat(bw - 2) + fBox.br, bx, by + 1 + lines.length, f.color);
      } else {
        for (let li = 0; li < lines.length; li++) {
          const pad = Math.floor((lineW - lines[li].length) / 2);
          grid.text(lines[li], bx + FLOAT_STYLE.padX + pad, by + li, f.color); // no bold — smears glyphs at small grid sizes, reads as unreadable "bold banners"
        }
      }
    }
  }

  function renderSparks() {
    for (const s of sparks) {
      const sx = Math.round(s.x),
        sy = Math.round(s.y);
      if (sx >= 0 && sx < W && sy >= 0 && sy < H) grid.set(sx, sy, s.ch, s.color);
    }
  }

  const _inlinePopups = [];
  function popupPush(text, x, y, color, duration) {
    _inlinePopups.push({ text, x, y: y - 3, color, life: duration || 1000, max: duration || 1000 });
  }
  function popupUpdate(dt) {
    for (let i = _inlinePopups.length - 1; i >= 0; i--) {
      _inlinePopups[i].life -= dt;
      if (_inlinePopups[i].life <= 0) _inlinePopups.splice(i, 1);
    }
  }
  function popupRender() {
    for (const p of _inlinePopups) {
      if (p.life < 80) continue;
      const bw = p.text.length + 4;
      const bx = Util.clamp(Math.round(p.x) - Math.floor(bw / 2), 0, W - bw);
      const by = Util.clamp(Math.round(p.y), 1, H - 4);
      // Clear background
      for (let y = by; y <= by + 2; y++) for (let x = bx; x < bx + bw; x++) if (x >= 0 && x < W) grid.set(x, y, " ", null);
      // Box using same style as act 2 dialog
      grid.text(DIALOG_BOX.tl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.tr, bx, by, p.color);
      grid.text(DIALOG_BOX.v + " " + p.text + " " + DIALOG_BOX.v, bx, by + 1, p.color);
      grid.text(DIALOG_BOX.bl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.br, bx, by + 2, p.color);
    }
  }
