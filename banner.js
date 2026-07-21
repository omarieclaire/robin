
  const Banner = {
    text: "",
    color: C_PLAYER,
    timer: 0,
    seq: null, // active sequence state
    segs: [], // per-line colors, so a later line's color doesn't recolor earlier lines

    show(t, c, d, silent) {
      audio.play("trumpet");
      this.seq = null; // cancel any running sequence
      this.text = t;
      this.color = c || C_PLAYER;
      this.segs = [{ text: t, color: this.color }];
      this.timer = d || 3000;
    },

    showSequence(lines, silent, replace) {
      /* lines: [{t,c,d} | {pause,d}] */
      if (!lines || lines.length === 0) return;
      clickPending = false; // discard a stale click so the first line can't be skipped before it's seen
      this.seq = { lines: [...lines], idx: 0, lineTimer: 0, silent, replace };
      this.text = "";
      this.segs = [];
      this.timer = 99999; // kept open by sequence driver
      const first = lines.find((l) => !l.pause);
      this.color = first ? first.c || C_PLAYER : C_PLAYER;
      // No trumpet here — lineTimer starts at 0, so update() plays it next tick.
    },

    tapAdvance() {
      if (!this.seq) return false;
      const tapped = clickPending || input.justPressed("action");
      if (!tapped) return false;
      clickPending = false;

      const seq = this.seq;
      while (seq.idx < seq.lines.length) {
        const entry = seq.lines[seq.idx++];
        if (!entry.pause) {
          this.color = entry.c || this.color;
          this.text = seq.replace ? entry.t : this.text ? this.text + "\n\n" + entry.t : entry.t;
          this.segs = seq.replace ? [{ text: entry.t, color: this.color }] : [...this.segs, { text: entry.t, color: this.color }];
          audio.play("trumpet");
          seq.lineTimer = entry.d || 3000;
          return true; // one line per tap
        }
      }
      this.seq = null;
      this.timer = 400;
      return true;
    },

    update(dt) {
      if (this.seq) {
        this.seq.lineTimer -= dt;
        if (this.seq.lineTimer <= 0) {
          const seq = this.seq;
          if (seq.idx >= seq.lines.length) {
            this.seq = null;
            this.timer = 400; // brief hold then close
            return;
          }
          const entry = seq.lines[seq.idx];
          seq.idx++;
          if (entry.pause) {
            seq.lineTimer = entry.d || 800;
          } else {
            this.color = entry.c || this.color;
            if (seq.replace) this.text = entry.t;
            else if (this.text) this.text += "\n\n" + entry.t;
            else this.text = entry.t;
            this.segs = seq.replace ? [{ text: entry.t, color: this.color }] : [...this.segs, { text: entry.t, color: this.color }];
            seq.lineTimer = entry.d || 3000;
            audio.play("trumpet");
          }
        }
        return; // don't tick timer while sequence is running
      }
      if (this.timer > 0) this.timer -= dt;
    },

    render() {
      if (this.timer <= 0) return;
      const INTER_FRAME_RESERVE = phase === "inter" ? 6 : 0;
      const mxW = Math.max(10, W - 10 - INTER_FRAME_RESERVE * 2);
      const segs = this.segs.length ? this.segs : this.text ? [{ text: this.text, color: this.color }] : [];
      const lines = [];
      for (const seg of segs) {
        for (const segment of seg.text.split("\n")) {
          if (segment.trim() === "") {
            lines.push({ text: "", color: seg.color });
            continue;
          }
          for (const wrapped of wrapWords(segment, mxW)) lines.push({ text: wrapped, color: seg.color });
        }
      }
      const tH = lines.length + 2,
        startY = phase === "inter" ? Math.max(1, Math.floor(H * 0.43 - tH / 2)) : Math.max(1, Math.floor(H / 4 - tH / 2));
      let boxW = Math.min(W - 6 - INTER_FRAME_RESERVE * 2, Math.max(0, ...lines.map((l) => l.text.length)) + 8);
      if ((W - boxW) % 2) boxW += 1;
      const bx = (W - boxW) / 2;
      for (let y = startY - 1; y < startY + tH + 1 && y < H; y++)
        for (let x = bx - 1; x < bx + boxW + 1 && x < W; x++) if (x >= 0 && y >= 0) grid.set(x, y, " ", null);
      const by = startY + 1 + lines.length;
      {
        const oCol = dullColor(this.color, 0.45);
        const obx = bx - 1,
          oby = startY - 1,
          obw = boxW + 2,
          obh = by - startY + 3;
        if (oby >= 0) grid.text(BANNER_BOX.tl + BANNER_BOX.h.repeat(obw - 2) + BANNER_BOX.tr, obx, oby, oCol);
        for (let ory = 1; ory < obh - 1; ory++) {
          const ay = oby + ory;
          if (ay >= 0 && ay < H) {
            if (obx >= 0) grid.set(obx, ay, BANNER_BOX.v, oCol);
            if (obx + obw - 1 < W) grid.set(obx + obw - 1, ay, BANNER_BOX.v, oCol);
          }
        }
        if (oby + obh - 1 < H) grid.text(BANNER_BOX.bl + BANNER_BOX.h.repeat(obw - 2) + BANNER_BOX.br, obx, oby + obh - 1, oCol);
      }
      grid.text(BANNER_BOX.tl + BANNER_BOX.h.repeat(boxW - 2) + BANNER_BOX.tr, bx, startY, this.color);
      for (let i = 0; i < lines.length; i++) {
        const ly = startY + 1 + i;
        const textCol = brightenColor(lines[i].color, 0.55);
        const panelBg = darkenColor(lines[i].color, 0.82);
        grid.text(BANNER_BOX.v + " ".repeat(boxW - 2) + BANNER_BOX.v, bx, ly, this.color);
        for (let hx = bx + 1; hx < bx + boxW - 1; hx++) grid.setBg(hx, ly, panelBg);
        const txt = (boxW - lines[i].text.length) % 2 ? lines[i].text + " " : lines[i].text;
        grid.text(txt, bx + (boxW - txt.length) / 2, ly, textCol);
      }
      grid.text(BANNER_BOX.bl + BANNER_BOX.h.repeat(boxW - 2) + BANNER_BOX.br, bx, by, this.color);
      this.lastBottom = by + 1;
    },
  };

  function renderTapPrompt(msg, y, col1, col2) {
    const flash = Math.sin(Date.now() / 300) > 0;
    const c = flash ? col1 || "#fff" : col2 || C_PLAYER;
    const full = "\u25B6 " + msg + " \u25C0";
    // Dark backing panel so the prompt stays legible over busy scenes.
    const bx = Math.floor((W - full.length) / 2);
    // Row below clipped descenders (p/g tails) — text row only.
    for (let hx = bx - 1; hx <= bx + full.length; hx++) grid.setBg(hx, y, "rgba(0,0,0,0.7)");
    grid.textCenter(full, y, c);
  }

  let dialogStack = [];

  function dialogPush(text, color, side, ax, ay, duration) {
    audio.play("paper");
    dialogStack.push({
      text,
      color,
      side,
      ax,
      ay,
      timer: duration || 3000,
    });
  }
  function dialogUpdate(dt) {
    for (let i = dialogStack.length - 1; i >= 0; i--) {
      dialogStack[i].timer -= dt;
      if (dialogStack[i].timer <= 0) dialogStack.splice(i, 1);
    }
  }

  function dialogRender() {
    // Dialogue boxes narrower
    const maxBoxW = Math.min(Math.floor(W / 2), 26);
    let nextY = H;
    for (let i = dialogStack.length - 1; i >= 0; i--) {
      const d = dialogStack[i];
      const mxW = maxBoxW - 4;
      const lines = wrapWords(d.text, mxW);
      const boxH = lines.length + 2;
      const boxW = Math.min(maxBoxW, Math.max(...lines.map((l) => l.length)) + 4);
      let bx;
      if (d.side === "left") {
        bx = Util.clamp(d.ax - boxW + 3, 0, W - boxW);
      } else if (d.side === "right") {
        bx = Util.clamp(d.ax - 3, 0, W - boxW);
      } else {
        bx = Util.clamp(Math.floor(d.ax - boxW / 2), 0, W - boxW);
      }
      // Stack: keep boxes close together, 1 row gap
      let by;
      if (i === dialogStack.length - 1) {
        by = Util.clamp(d.ay - boxH, 1, H - boxH);
      } else {
        by = Util.clamp(nextY - boxH - 1, 1, H - boxH);
      }
      nextY = by;
      // Clear background behind box
      for (let y = by; y < by + boxH && y < H; y++) for (let x = bx; x < bx + boxW && x < W; x++) grid.set(x, y, " ", null);
      grid.text(DIALOG_BOX.tl + DIALOG_BOX.h.repeat(boxW - 2) + DIALOG_BOX.tr, bx, by, d.color);

      for (let j = 0; j < lines.length; j++) {
        grid.text(DIALOG_BOX.v + " ".repeat(boxW - 2) + DIALOG_BOX.v, bx, by + 1 + j, d.color);
        grid.text(lines[j], bx + 2, by + 1 + j, d.color);
      }
      grid.text(DIALOG_BOX.bl + DIALOG_BOX.h.repeat(boxW - 2) + DIALOG_BOX.br, bx, by + 1 + lines.length, d.color);
    }
  }
