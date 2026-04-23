(function () {
  const { GameLoop, Input, State, Timer, Util, Device } = OMC;
  const gs = document.getElementById("game-screen");
  const hudScore = document.getElementById("hud-score"),
    hudStatus = document.getElementById("hud-status"),
    hudLabel = document.getElementById("hud-label");
  const overlay = document.getElementById("overlay"),
    ovTitle = document.getElementById("ov-title"),
    ovArt = document.getElementById("ov-art"),
    ovSub = document.getElementById("ov-sub"),
    ovHint = document.getElementById("ov-hint"),
    startBtn = document.getElementById("start-btn");
  const input = new Input();

  const muteBtn = document.getElementById("mute-btn");
  muteBtn.addEventListener("click", () => {
    const muted = audio.toggleMute();
    muteBtn.textContent = muted ? window.LANG.muteMuted : window.LANG.muteMute;
    muteBtn.style.color = muted ? "#444" : C_DIM;
  });

  const langBtn = document.getElementById("lang-btn");

  langBtn.textContent = window.LANG === window.LANG_FR ? "EN" : "FR";

  langBtn.addEventListener("click", () => {
    if (window.LANG === window.LANG_EN) {
      localStorage.setItem("lang", "fr");
    } else {
      localStorage.setItem("lang", "en");
    }
    location.reload();
  });

  let _lastPhaseForBtn = null;
  function syncLangBtn() {
    langBtn.style.display = !phase || phase === "done" ? "" : "none";
  }

  const audio = new Audio_({
    basePath: "sounds/",
    poolSize: 8,
    volume: 0.7,
  });
  audio.register({
    click: "click.mp3",
    music: "music.mp3",
    music_act1: "music_act1.mp3",
    music_act2: "music_act2.mp3",
    music_act3: "music_act3.mp3",
    music_act4: "music_act4.mp3",
    music_act5: "music_act5.mp3",
    music_act6: "music_act6.mp3",

    music_act7: "music_act7.mp3",
    music_act8: "music_act8.mp3",

    bump: "bump.mp3",
    level: "level.mp3",
    maybe: "maybe.mp3",
    drop: "drop.mp3",
    paper: "paper.mp3",
    urgent: "urgent.mp3",
    exit: "exit.mp3",
    playertxtbox: "playertxtbox.mp3",
    npctxtbox: "npctxtbox.mp3",
    trumpet: "trumpet.mp3",
    recruit: "recruit.mp3", // crew +1
    security: "narc.mp3", // narc reveal
    narc: "narc.mp3", // narc reveal
    grab: "grab.mp3", // Act 4 food grab
    bust: "bust.mp3", // game over
  });

  const Music = {
    current: null,
    volume: 0.3,
    fadeOutMs: 1200, // old track fades out over this long UNDERNEATH the new one

    play(name) {
      this.current = audio.play(name, {
        loop: true,
        volume: this.volume,
      });
    },

    transition(name) {
      // Fade out old track underneath — fire and forget
      const old = this.current;
      this.current = null;
      if (old) {
        audio.fade(old, 0, this.fadeOutMs, () => audio.stop(old));
      }
      // New music starts immediately, no waiting
      this.play(name);
    },

    stop() {
      if (!this.current) return;
      audio.stop(this.current);
      this.current = null;
    },
  };

  /* ── REPLAY TRACKING ─────────────────────────────────────── */
  let hasPlayed = false;

  /* ── RESPONSIVE SIZING ─────────────────────────────────── */
  let W, H;
  function measureGrid() {
    const wrap = document.getElementById("game-wrap"),
      r = wrap.getBoundingClientRect();
    const probe = document.createElement("span");
    probe.style.cssText =
      "font-family:'Courier New','Consolas','Monaco',monospace;white-space:pre;line-height:1;position:absolute;visibility:hidden;font-size:16px;letter-spacing:0";
    probe.textContent = "MMMMMMMMMMMMMMMMMMMM";
    gs.appendChild(probe);
    const cw16 = probe.getBoundingClientRect().width / 20;
    gs.removeChild(probe);
    const targetW = r.width > 800 ? 72 : r.width > 600 ? 60 : r.width > 480 ? 48 : r.width > 360 ? 38 : 32;
    const fs = r.width / ((targetW * cw16) / 16);
    const finalFS = Math.max(9, Math.min(Math.floor(fs), 24));
    const charW = finalFS * (cw16 / 16);
    W = Math.floor(r.width / charW);
    H = Math.floor(r.height / finalFS);
    W = Math.max(28, W);
    H = Math.max(16, Math.min(H, 40));
    gs.style.fontSize = finalFS + "px";
  }
  /* ── GRID ──────────────────────────────────────────────── */
  let grid;
  class Grid {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.c = [];
      for (let y = 0; y < h; y++) {
        this.c[y] = [];
        for (let x = 0; x < w; x++)
          this.c[y][x] = {
            ch: " ",
            co: null,
          };
      }
    }
    clear() {
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.w; x++) {
          this.c[y][x].ch = " ";
          this.c[y][x].co = null;
        }
    }
    set(x, y, ch, co) {
      x = Math.floor(x);
      y = Math.floor(y);
      if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
        this.c[y][x].ch = ch;
        this.c[y][x].co = co || null;
      }
    }
    text(s, x, y, co) {
      for (let i = 0; i < s.length; i++) this.set(x + i, y, s[i], co);
    }
    textCenter(s, y, co) {
      this.text(s, Math.floor((this.w - s.length) / 2), y, co);
    }
    art(a, px, py, co) {
      if (!Array.isArray(a)) {
        console.warn("Grid.art: undefined art passed from", new Error().stack.split("\n")[2]);
        return;
      }
      px = Math.round(px);
      py = Math.round(py);
      a.forEach((l, r) => {
        for (let i = 0; i < l.length; i++) if (l[i] !== " ") this.set(px + i, py + r, l[i], co);
      });
    }
    html() {
      let o = "";
      for (let y = 0; y < this.h; y++) {
        let lc = null;
        for (let x = 0; x < this.w; x++) {
          const c = this.c[y][x];
          if (c.co !== lc) {
            if (lc) o += "</span>";
            if (c.co) o += '<span style="color:' + c.co + '">';
            lc = c.co;
          }
          o += c.ch === "<" ? "&lt;" : c.ch === ">" ? "&gt;" : c.ch === "&" ? "&amp;" : c.ch;
        }
        if (lc) o += "</span>";
        o += "\n";
      }
      return o;
    }
  }
  /* ── CENTRALIZED STYLE CONFIG ──────────────────────────
                       convRender() uses CONV_BOX for conversation panels.
                       renderBanner() uses BANNER_BOX for announcements.
                       dialogRender() uses DIALOG_BOX for floating speech. */

  /* Three visually distinct box styles, ranked by visual weight:
                       BANNER (biggest moment) > CONV (conversation) > DIALOG (incidental speech).
                       FLOAT uses its own bold style defined in FLOAT_STYLE. */

  // const BANNER_BOX = { tl: "╓", tr: "╖", bl: "╙", br: "╜", h: "═", v: "║" };
  const BANNER_BOX = {
    tl: "╔",
    tr: "╗",
    bl: "╚",
    br: "╝",
    h: "═",
    v: "║",
  };
  // const BANNER_BOX = { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" };
  /* CONV: clean double-lines — structured conversation */
  const CONV_BOX = {
    tl: "\u2554",
    tr: "\u2557",
    bl: "\u255A",
    br: "\u255D",
    h: "\u2550",
    v: "\u2551",
  };
  /* DIALOG: light single-lines — quiet, ambient */
  const DIALOG_BOX = {
    tl: "\u256D",
    tr: "\u256E",
    bl: "\u2570",
    br: "\u256F",
    h: "\u2500",
    v: "\u2502",
  };
  /* Main character color COLOURS */
  const C_PLAYER = "#f5a032";
  const C_DANGER = "#c44"; // narcs, heat, bust, security
  const C_TEAL = "#5cbdbd"; // crew, fridge, info, success moments
  const C_ORANGE = "#e8944a"; // rally banners, CTA accent
  const C_WARN = "#da0"; // urgency warnings
  const C_SUCCESS = "#2a7a2a"; // HUD status green
  const C_DIM = "#888"; // muted text, tap prompts
  const C_MID = "#aaa"; // medium text

  function playerPulseColor(t) {
    // Gentle 1.4Hz white glow — works in any act, just pass the act timer
    return Math.sin(t / 0.01) > 0.3 ? "#e69224" : C_PLAYER;
  }

  const state = new State({
    score: 0,
  });
  const tmr = new Timer();
  input.mapActions({
    left: ["ArrowLeft", "a"],
    right: ["ArrowRight", "d"],
    up: ["ArrowUp", "w"],
    down: ["ArrowDown", "s"],
  });
  let loop, phase;
  const floats = [];
  let a2CrewCount = 0,
    s4AlyScore = 0;
  const sparks = [];
  let chromaticT = 0;

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
  let flashGoodT = 0,
    flashGoldT = 0;
  function triggerFlashGood() {
    flashGoodT = 350;
  }
  function triggerFlashGold() {
    flashGoldT = 300;
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
  /* ── BANNER ────────────────────────────────────────────── */
  let bannerText = "",
    bannerColor = C_PLAYER,
    bannerTimer = 0;
  function showBanner(t, c, d, silent) {
    if (!silent) audio.play("trumpet");
    bannerText = t;
    bannerColor = c || C_PLAYER;
    bannerTimer = d || 3000;
  }
  function updateBanner(dt) {
    if (bannerTimer > 0) bannerTimer -= dt;
  }
  function renderBanner() {
    if (bannerTimer <= 0) return;
    const mxW = W - 6;
    const lines = [];
    for (const segment of bannerText.split("\n")) {
      const words = segment.split(" ");
      let cur = "";
      for (const w of words) {
        if (cur.length + w.length + 1 > mxW) {
          lines.push(cur);
          cur = w;
        } else cur = cur ? cur + " " + w : w;
      }
      if (cur) lines.push(cur);
    }
    const tH = lines.length + 2,
      startY = phase === "inter" ? Math.max(1, Math.floor(H / 3 - tH / 2)) : Math.max(1, Math.floor(H / 6 - tH / 2));
    const boxW = Math.min(W, Math.max(...lines.map((l) => l.length)) + 8),
      bx = Math.floor((W - boxW) / 2);
    // Clear behind banner area
    for (let y = startY - 1; y < startY + tH + 1 && y < H; y++)
      for (let x = bx - 1; x < bx + boxW + 1 && x < W; x++) if (x >= 0 && y >= 0) grid.set(x, y, " ", null);
    // Top border
    grid.text(BANNER_BOX.tl + BANNER_BOX.h.repeat(boxW - 2) + BANNER_BOX.tr, bx, startY, bannerColor);
    // Text lines with side borders
    for (let i = 0; i < lines.length; i++) {
      const ly = startY + 1 + i;
      grid.text(BANNER_BOX.v + " ".repeat(boxW - 2) + BANNER_BOX.v, bx, ly, bannerColor);
      grid.text(lines[i], bx + Math.floor((boxW - lines[i].length) / 2), ly, bannerColor);
    }
    // Bottom border
    const by = startY + 1 + lines.length;
    grid.text(BANNER_BOX.bl + BANNER_BOX.h.repeat(boxW - 2) + BANNER_BOX.br, bx, by, bannerColor);
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
  /* ── CONVERSATION PANEL (Act 2) ────────────────────── */
  let convLog = [];
  let convChoices = null;
  let convPlayerColor = C_PLAYER;
  let convNPCColor = C_DIM;
  let convVisible = false;
  let convFading = false;
  let convFadeTimer = 0;
  const convFadeDuration = 180; // ms to fade out - fast and snappy for retro feel
  let convAnchorPX = 0;
  let convAnchorNX = 10;
  let convAnchorY = 10;
  let convEncounterIndex = 0; // Track which encounter this is for positioning adjustments
  let convChoiceY1 = 0,
    convChoiceY2 = 0,
    convChoiceBX = 0,
    convChoiceBW = 0,
    convChoiceHover = -1,
    convChoiceYs = []; // start row of each choice
  function convReset() {
    convLog = [];
    convChoices = null;
    convVisible = false;
    convFading = false;
    convFadeTimer = 0;
    convChoiceY1 = 0;
    convChoiceY2 = 0;
    convChoiceHover = -1;
  }

  let interT, interLines, interLI, interNext, interDone, interFrameIdx;
  function initInter(lines, nextFn, frameIdx) {
    phase = "inter";
    interFrameIdx = frameIdx || 0;

    interT = 0;
    interLines = lines;
    interLI = 0;
    interNext = nextFn;
    interDone = false;
    bannerTimer = 0;
    dialogStack = [];
    clickPending = false;
    // show first line immediately
    showBanner(interLines[0].t, interLines[0].c, 99999, true);
    interLI = 1;
  }

  function updateInter(dt) {
    interT += dt;
    updateBanner(dt);

    // append next line to existing banner box
    if (interLI < interLines.length && interT > interLines[interLI - 1].d) {
      console.log("appending line", interLI, interLines[interLI].t, "after", interT, "ms");

      bannerText += "\n" + interLines[interLI].t;
      bannerTimer = 99999;
      interLI++;
      interT = 0;
    }
    console.log("interLI", interLI, "interLines.length", interLines.length, "interT", Math.round(interT), "interDone", interDone);
    // auto-advance after last line
    if (!interDone && interLI >= interLines.length && interT > 2500) {
      interDone = true;
      bannerTimer = 0;
      interNext();
    }
    // tap to skip
    if (clickPending && interT > 500) {
      clickPending = false;
      if (!interDone) {
        interDone = true;
        bannerTimer = 0;
        interNext();
      }
    }
  }

  // frame
  const MIRROR_H = {
    "╠": "╣",
    "╣": "╠",
    "╔": "╗",
    "╗": "╔",
    "╚": "╝",
    "╝": "╚",
    "╒": "╕",
    "╕": "╒",
    "╓": "╖",
    "╖": "╓",
    "╟": "╢",
    "╢": "╟",
    "╭": "╮",
    "╮": "╭",
    "╰": "╯",
    "╯": "╰",
    "╲": "╱",
    "╱": "╲",
    "┤": "├",
    "├": "┤",
    "┐": "┌",
    "┌": "┐",
    "┘": "└",
    "└": "┘",
  };

  function mirrorChar(ch) {
    return MIRROR_H[ch] || ch;
  }

  // function renderInterFrame() {
  //   const f = INTER_FRAMES[interFrameIdx];
  //   const colW = W < 36 ? Math.min(3, f.colW) : f.colW;
  //   const color = bannerColor || C_DIM;
  //   grid.text(f.tl, 0, 0, color);
  //   for (let x = 1; x < W - 1; x++) grid.set(x, 0, f.top, color);
  //   grid.text(f.tr, W - 1, 0, color);
  //   grid.text(f.bl, 0, H - 1, color);
  //   for (let x = 1; x < W - 1; x++) grid.set(x, H - 1, f.bot, color);
  //   grid.text(f.br, W - 1, H - 1, color);
  //   for (let y = 1; y < H - 1; y++) {
  //     const rowIdx = (y - 1) % f.left.length;
  //     const row = f.left[rowIdx];
  //     const leftStr = row.substring(0, colW);
  //     grid.text(leftStr, 0, y, color);
  //     // place right column right-to-left from screen edge
  //     for (let i = 0; i < colW; i++) {
  //       grid.set(W - 1 - i, y, mirrorChar(leftStr[i]), color);
  //     }
  //   }
  // }
  function renderInterFrame() {
    const f = INTER_FRAMES[interFrameIdx];
    // Fall back to single rail on narrow screens so patterns aren't
    // sliced mid-glyph. Also clamp so the two sides never collide.
    const colW = Math.min(W < 50 ? 1 : f.colW, Math.floor((W - 2) / 2));
    const color = bannerColor || C_DIM;

    // corners
    grid.text(f.tl, 0, 0, color);
    grid.text(f.tr, W - 1, 0, color);
    grid.text(f.bl, 0, H - 1, color);
    grid.text(f.br, W - 1, H - 1, color);

    // top / bottom rails
    for (let x = 1; x < W - 1; x++) grid.set(x, 0, f.top, color);
    for (let x = 1; x < W - 1; x++) grid.set(x, H - 1, f.bot, color);

    // side columns — your original right-side logic, untouched
    for (let y = 1; y < H - 1; y++) {
      const rowIdx = (y - 1) % f.left.length;
      const leftStr = f.left[rowIdx].substring(0, colW);
      grid.text(leftStr, 0, y, color);
      for (let i = 0; i < colW; i++) {
        grid.set(W - 1 - i, y, mirrorChar(leftStr[i]), color);
      }
    }
  }

  function renderInter() {
    console.log("W=", W, "H=", H);
    renderInterFrame();
    renderBanner();
  }

  function convStartFade() {
    if (!convVisible) return;
    convFading = true;
    convFadeTimer = 0;
  }

  function convResetLater(ms) {
    const p = phase;
    setTimeout(() => {
      if (phase !== p) return;
      dialogStack = [];
      convStartFade();
    }, ms);
  }

  function convAddLine(text, side, color) {
    audio.play(side === "you" ? "playertxtbox" : "npctxtbox");
    const last = convLog[convLog.length - 1];
    if (last && last.side === side) {
      last.text = last.text + "\n\n" + text;
    } else {
      convLog.push({
        text,
        side,
        color,
      });
    }
    // console.log(">>> LINE:", text.substring(0, 30), "| side:", side, "| convLog.length:", convLog.length, "| convAnchorY:", convAnchorY);
  }
  function convShowChoices(labels) {
    convChoices = labels;
  }

  function convHideChoices() {
    convChoices = null;
  }

  function convRender() {
    if (!convVisible || (convLog.length === 0 && !convChoices)) return;

    // Calculate opacity for fade-out animation - BOXES fade first, text stays visible longer
    let boxOpacity = 1.0;
    let textOpacity = 1.0;
    if (convFading) {
      const progress = convFadeTimer / convFadeDuration;
      // Boxes fade out in first 60% of animation
      boxOpacity = Math.max(0, 1.0 - progress / 0.6);
      // Text fades out in last 70% of animation
      textOpacity = progress < 0.3 ? 1.0 : Math.max(0, 1.0 - (progress - 0.3) / 0.7);
    }

    // Helper function to apply opacity to box borders
    function applyBoxOpacity(hexColor) {
      if (!hexColor || boxOpacity === 1.0) return hexColor;
      const hex = hexColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
    }

    // Helper function to apply opacity to text
    function applyTextOpacity(hexColor) {
      if (!hexColor || textOpacity === 1.0) return hexColor;
      const hex = hexColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${textOpacity})`;
    }

    //dialogue box conversation box
    const boxW = Math.min(W - 12, 36);
    const innerW = boxW - 4;
    // Measure total height first so we can anchor from the bottom
    const allBoxes = [];
    for (let i = 0; i < convLog.length; i++) {
      const entry = convLog[i];
      const paragraphs = entry.text.split("\n\n");
      const lines = [];
      for (let p = 0; p < paragraphs.length; p++) {
        if (p > 0) lines.push(""); // blank line between paragraphs
        const words = paragraphs[p].split(" ");
        let cur = "";
        for (const w of words) {
          if (cur.length + w.length + 1 > innerW) {
            lines.push(cur);
            cur = w;
          } else cur = cur ? cur + " " + w : w;
        }
        if (cur) lines.push(cur);
      }
      const age = convLog.length - 1 - i;
      const dimmed = age > 1; // Keep the last 2 boxes vivid
      const baseColor = dimmed ? "#444" : entry.color;
      allBoxes.push({
        lines,
        color: baseColor,
        side: entry.side,
        isChoice: false,
      });
    }
    if (convChoices) {
      const choiceLines = [];
      for (let ci = 0; ci < convChoices.length; ci++) {
        const words = ("\u25B6 " + convChoices[ci]).split(" "),
          lines = [];
        let cur = "";
        for (const w of words) {
          if (cur.length + w.length + 1 > innerW) {
            lines.push(cur);
            cur = "  " + w;
          } else cur = cur ? cur + " " + w : w;
        }
        if (cur) lines.push(cur);
        choiceLines.push(...lines);
        if (ci < convChoices.length - 1) choiceLines.push("");
      }
      allBoxes.push({
        lines: choiceLines,
        color: convPlayerColor,
        side: "you",
        isChoice: true,
      });
    }
    const charY = convAnchorY;
    const lastBox = allBoxes[allBoxes.length - 1];
    const lastBoxH = lastBox.lines.length + 2; // top border + lines + bottom border

    // Keep last box's BOTTOM at a fixed position relative to character
    // ALWAYS draw last box at same position, show previous box above it
    // Adjust for encounters 1 and 2 (conv 2 and 3) due to camera lerp

    // Standard offset for all conversations now that camera settling is fixed
    const yOffset = 2;
    const lastBoxBottom = charY - yOffset;

    const lastBoxTop = lastBoxBottom - (lastBoxH - 1); // -1 because bottom border is inclusive

    // Show ALL boxes, with the LAST box at a fixed position
    // Older boxes stack above it without affecting its position
    const boxesToShow = allBoxes;

    // Calculate where to start drawing so the LAST box ends at lastBoxBottom
    // Work backwards from lastBoxTop
    let totalPriorHeight = 0;
    for (let i = 0; i < boxesToShow.length - 1; i++) {
      totalPriorHeight += boxesToShow[i].lines.length + 2; // height of each prior box (no gap between boxes)
    }
    const topY = lastBoxTop - totalPriorHeight;

    // if (convLog.length <= 3) {
    //   console.log(
    //     "RENDER: charY=" +
    //       charY +
    //       " lastBoxH=" +
    //       lastBoxH +
    //       " boxes=" +
    //       boxesToShow.length +
    //       " -> topY=" +
    //       topY +
    //       " lastBoxTop=" +
    //       lastBoxTop +
    //       " lastBoxBottom=" +
    //       lastBoxBottom,
    //   );
    // }
    // Center horizontally between player and NPC
    const psx = convAnchorPX;
    const nsx = convAnchorNX;
    const centerX = Math.floor((psx + nsx) / 2);
    const bx = Util.clamp(Math.floor(centerX - boxW / 2), 0, W - boxW);

    // Draw boxes top to bottom, offset by speaker
    const offset = Math.min(3, Math.floor(boxW / 6));
    const bxL = Util.clamp(bx - offset, 0, W - boxW);
    const bxR = Util.clamp(bx + offset, 0, W - boxW);
    /* Clear each box's rectangle + 1 cell of padding on all sides.
                         Gaps between stacked boxes can still show background art where
                         adjacent paddings don't overlap. */
    {
      const padX = 1;
      let cyClear = topY; // Start from topY even if negative
      for (const box of boxesToShow) {
        const xPos = box.side === "them" ? bxR : bxL;
        const boxH = box.lines.length + 2;
        const x0 = Math.max(0, xPos - padX);
        const x1 = Math.min(W, xPos + boxW + padX);

        // Only clear if this box is at least partially visible
        const boxStartY = cyClear;
        const boxEndY = cyClear + boxH;
        if (boxEndY > 0) {
          // Clear only the visible portion
          const clearStartY = Math.max(0, boxStartY);
          const clearEndY = Math.min(H, boxEndY);
          for (let y = clearStartY; y < clearEndY; y++) {
            for (let x = x0; x < x1; x++) {
              grid.set(x, y, " ", null);
            }
          }
        }
        cyClear += boxH;
      }
    }
    let cy = topY; // Start from topY even if negative, don't clamp
    for (const box of boxesToShow) {
      if (cy + box.lines.length + 2 > H) break;
      const xPos = box.side === "them" ? bxR : bxL;

      // Only draw if this box would be visible (cy >= 0)
      const boxStartY = cy;
      const boxEndY = cy + box.lines.length + 2;
      const isVisible = boxEndY > 0; // At least part of the box is on-screen

      if (box.isChoice && isVisible) {
        convChoiceY1 = Math.max(0, cy);
        convChoiceBX = xPos;
        convChoiceBW = boxW;
        convChoiceYs = [];
        let tempCount = 0;
        for (let ci = 0; ci < convChoices.length; ci++) {
          convChoiceYs.push(Math.max(0, cy + 1 + tempCount));
          const cWords = ("\u25B6 " + convChoices[ci]).split(" ");
          let cLines = [],
            cc = "";
          for (const w of cWords) {
            if (cc.length + w.length + 1 > innerW) {
              cLines.push(cc);
              cc = "  " + w;
            } else cc = cc ? cc + " " + w : w;
          }
          if (cc) cLines.push(cc);
          tempCount += cLines.length + 1;
        }
      }

      // Draw top border only if visible
      if (cy >= 0 && isVisible) {
        grid.text(CONV_BOX.tl + CONV_BOX.h.repeat(boxW - 2) + CONV_BOX.tr, xPos, cy, applyBoxOpacity(box.color));
      }
      cy++;

      for (let li = 0; li < box.lines.length; li++) {
        if (cy >= 0 && isVisible) {
          grid.text(CONV_BOX.v + " ".repeat(boxW - 2) + CONV_BOX.v, xPos, cy, applyBoxOpacity(box.color));
          if (box.lines[li] !== "") {
            /* Choices: left-aligned with two shades + hover. Regular: centered. */
            const pad = box.isChoice ? 0 : Math.floor((innerW - box.lines[li].length) / 2);
            let lineCol = box.color;
            if (box.isChoice) {
              /* Figure out which choice this line belongs to */
              let choiceIdx = 0,
                linesCount = 0;
              for (let ci = 0; ci < (convChoices || []).length; ci++) {
                const cWords = ("\u25B6 " + convChoices[ci]).split(" ");
                let cLines = [];
                let cc = "";
                for (const w of cWords) {
                  if (cc.length + w.length + 1 > innerW) {
                    cLines.push(cc);
                    cc = "  " + w;
                  } else cc = cc ? cc + " " + w : w;
                }
                if (cc) cLines.push(cc);
                if (li >= linesCount && li < linesCount + cLines.length) {
                  choiceIdx = ci;
                  break;
                }
                linesCount += cLines.length + 1;
              }
              lineCol = phase === "act1" ? (choiceIdx === 0 ? "#c8a070" : "#8a9ab0") : convPlayerColor;
              if (convChoiceHover === choiceIdx) lineCol = "#fff";
            }
            grid.text(box.lines[li], xPos + 2 + Math.max(0, pad), cy, applyTextOpacity(lineCol));
          }
        }
        cy++;
      }

      // Draw bottom border only if visible
      if (cy >= 0 && isVisible) {
        grid.text(CONV_BOX.bl + CONV_BOX.h.repeat(boxW - 2) + CONV_BOX.br, xPos, cy, applyBoxOpacity(box.color));
      }
      if (box.isChoice && isVisible) {
        convChoiceY2 = Math.max(0, cy);
      }
      // remove to remove  extra gap — boxes stack tight for comic-book feel */
      cy++;
    }

    // Short tails pointing to characters - only show tail for most recent speaker
    if (cy < H && boxesToShow.length > 0) {
      // Find the most recent non-dimmed box (the active speaker)
      const lastBox = boxesToShow[boxesToShow.length - 1];

      if (lastBox.side === "you") {
        // Player speaking: tail from left-offset box toward player
        const tailX = Util.clamp(psx, bxL + 1, bxL + boxW - 2);
        // Only draw if tail won't overlap player position
        if (tailX !== psx || cy !== convAnchorY) {
          grid.set(tailX, cy, "ᐯ", convPlayerColor); // Canadian syllabics down triangle
        }
      } else if (lastBox.side === "them") {
        // NPC speaking: tail from right-offset box toward NPC
        const tailX = Util.clamp(nsx, bxR + 1, bxR + boxW - 2);
        // Only draw if tail won't overlap NPC position
        if (tailX !== nsx || cy !== convAnchorY) {
          grid.set(tailX, cy, "ᐯ", convNPCColor); // Canadian syllabics down triangle
        }
      }
    }
  }

  function dialogRender() {
    // Dialogue boxes narrower
    const maxBoxW = Math.min(Math.floor(W / 2), 26);
    let nextY = H;
    for (let i = dialogStack.length - 1; i >= 0; i--) {
      const d = dialogStack[i];
      const mxW = maxBoxW - 4;
      const words = d.text.split(" "),
        lines = [];
      let cur = "";
      for (const w of words) {
        if (cur.length + w.length + 1 > mxW) {
          lines.push(cur);
          cur = w;
        } else cur = cur ? cur + " " + w : w;
      }
      if (cur) lines.push(cur);
      const boxH = lines.length + 2;
      const boxW = Math.min(maxBoxW, Math.max(...lines.map((l) => l.length)) + 4);
      // Left speaker: box anchored near left side of screen, close to anchor
      // Right speaker: box anchored near right side, close to anchor
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

  const HH = 2,
    HW = 2,
    RUH = 1,
    RDW = 3,
    RDH = 3,
    HPS = 5;
  const BW = HPS * HW,
    BH = HH * 2 + RUH,
    CW = BW + RDW,
    CH = BH + RDH;

  function renderCity(cx, cy) {
    for (let sy = 0; sy < H; sy++)
      for (let sx = 0; sx < W; sx++) {
        const mx = Math.floor(cx) + sx,
          my = Math.floor(cy) + sy;
        const lx = ((mx % CW) + CW) % CW,
          ly = ((my % CH) + CH) % CH;
        const inB = lx < BW && ly < BH;
        const inRuelle = inB && ly >= HH && ly < HH + RUH;
        if (!inB) {
          if (ly === BH && lx < BW) grid.set(sx, sy, "\u2550", "#333");
          else if (ly === CH - 1 && lx < BW) grid.set(sx, sy, "\u2550", "#333");
          else if (lx === BW && ly < BH) grid.set(sx, sy, "\u2551", "#333");
          else if (lx === CW - 1 && ly < BH) grid.set(sx, sy, "\u2551", "#333");
          else if (lx === BW && ly === BH) grid.set(sx, sy, "\u255D", "#333");
          else if (lx === CW - 1 && ly === BH) grid.set(sx, sy, "\u255A", "#333");
          else if (lx === BW && ly === CH - 1) grid.set(sx, sy, "\u2557", "#333");
          else if (lx === CW - 1 && ly === CH - 1) grid.set(sx, sy, "\u2554", "#333");
        } else if (inRuelle) {
          /* Clean ruelles — no dots */
        } else {
          const hr = ly < HH ? 0 : 1,
            hly = hr === 0 ? ly : ly - HH - RUH;
          const bc = ((Math.floor(mx / CW) % 30) + 30) % 30,
            br = ((Math.floor(my / CH) % 30) + 30) % 30;
          const hi = Math.floor(lx / HW),
            ai = (bc + br + hi + hr * 2) % HA.length,
            ci = (bc * 3 + br * 7 + hi * 5 + hr) % HC.length;
          if (hly < HA[ai].length) {
            const ch = HA[ai][hly];
            if (ch !== " ") grid.set(sx, sy, ch, HC[ci]);
          }
        }
      }
  }

  function isRoad(wx, wy) {
    const lx = ((wx % CW) + CW) % CW,
      ly = ((wy % CH) + CH) % CH;
    if (lx >= BW || ly >= BH) return true;
    if (ly >= HH && ly < HH + RUH) return true;
    return false;
  }
  function hRoadY(row) {
    return row * CH + BH + 1;
  }
  function vRoadX(col) {
    return col * CW + BW + 1;
  }

  /* ── INPUT ─────────────────────────────────────────────── */
  let clickSX = -1,
    clickSY = -1,
    clickPending = false;
  gs.addEventListener("pointermove", (e) => {
    if (!convChoices) return;
    const r = gs.getBoundingClientRect();
    const fontSize = parseFloat(gs.style.fontSize);
    const probe = document.createElement("span");
    probe.style.cssText =
      "font-family:'Courier New','Consolas','Monaco',monospace;white-space:pre;line-height:1;position:absolute;visibility:hidden;font-size:" +
      fontSize +
      "px;letter-spacing:0";
    probe.textContent = "M";
    gs.appendChild(probe);
    const cellH = probe.getBoundingClientRect().height;
    gs.removeChild(probe);
    const my = Math.floor((e.clientY - r.top) / cellH);

    if (my >= convChoiceY1 && my <= convChoiceY2) {
      convChoiceHover = convChoices.length - 1;
      for (let ci = 0; ci < convChoiceYs.length - 1; ci++) {
        if (my < convChoiceYs[ci + 1]) {
          convChoiceHover = ci;
          break;
        }
      }
    } else {
      convChoiceHover = -1;
    }
  });
  gs.addEventListener("pointerup", (e) => {
    const r = gs.getBoundingClientRect();
    const fontSize = parseFloat(gs.style.fontSize);
    const probe = document.createElement("span");
    probe.style.cssText =
      "font-family:'Courier New','Consolas','Monaco',monospace;white-space:pre;line-height:1;position:absolute;visibility:hidden;font-size:" +
      fontSize +
      "px;letter-spacing:0";
    probe.textContent = "M";
    gs.appendChild(probe);
    const cellW = probe.getBoundingClientRect().width;
    const cellH = probe.getBoundingClientRect().height;
    gs.removeChild(probe);
    clickSX = Math.floor((e.clientX - r.left) / cellW);
    clickSY = Math.floor((e.clientY - r.top) / cellH);
    clickPending = true;
  });

  /* ══════════════════════════════════════════════════════════
               ACT 1: THE SPARK — automated top-down walk
               ══════════════════════════════════════════════════════════ */
  let a1PX, a1PY, a1CX, a1CY, a1T, a1St, a1NPCs, a1Amb, a1AmbNPCs, a1StartX, a1StartY;
  let a1EncNPC, a1EI, a1ES, a1ST2;
  let a1Path, a1PI, a1PA, a1NP;
  let a1IdleTimer, a1LoopCount; // for auto-advance on inactivity
  let a1DescPath, a1DescPI; // for road-following descent
  let a1PauseT; // for silent pauses between narrative banners
  const A1_PSX_RATIO = 0.5,
    A1_PSY_RATIO = 0.55;

  /* Array-of-turns encounter format */
  // ACT 1 TIMING: Add 'delay: <milliseconds>' to any turn to customize timing for that specific line
  // Example: { who: "n", text: "I use a coupon app", delay: 2500 }
  let A1E = window.LANG.a1Encounters;

  let A1_LOOP_MSGS = window.LANG.a1LoopMsgs;

  let FOODS = window.GAME_DATA.foods;

  let STORE = window.LANG === window.LANG_FR ? window.GAME_DATA.storeArtFR : window.GAME_DATA.storeArtEN;

  let D_INTERCOM_TICKER = window.LANG.intercoms;

  let NQ = window.LANG === window.LANG_FR ? window.GAME_DATA.narrativeQuotesFR : window.GAME_DATA.narrativeQuotesEN;

  //  A1_LOOP_MSGS = window.LANG === window.LANG_FR
  //   ? A1_LOOP_MSGS_FR
  //   : A1_LOOP_MSGS_EN;

  function initAct1() {
    audio.play("level");
    audio.preload(["music_act2"]); // background preload for next act
    phase = "act1";
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
        col: "#0ff",
      },
      {
        x: ex1,
        y: ry1,
        enc: 1,
        ch: "$",
        col: "#f0f",
      },
      {
        x: ex2,
        y: ry2,
        enc: 2,
        ch: "&",
        col: "#ff0",
      },
    ];
    a1Path = [
      { x: vRoadX(sc), y: ry0 },
      { x: ex0 - 2, y: ry0 },
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
        { x: ex2 + 15, y: ry2 },
      ],
    ];
    a1Amb = [];
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
    dialogStack = [];
    // Ambient NPCs
    a1AmbNPCs = [];

    let placed = 0,
      attempts = 0;
    while (placed < 14 && attempts < 200) {
      attempts++;
      const row = Util.randInt(0, 5),
        col = Util.randInt(0, 6);
      let nx, ny;
      if (Math.random() > 0.5) {
        /* Horizontal road: pick Y from hRoadY, X can be anywhere along that road */
        ny = hRoadY(row);
        nx = col * CW + Util.randInt(0, BW - 1);
      } else {
        /* Vertical road: pick X from vRoadX, Y can be anywhere along that road */
        nx = vRoadX(col);
        ny = row * CH + Util.randInt(0, BH - 1);
      }
      /* Verify — isRoad is the source of truth */
      if (!isRoad(nx, ny)) continue;
      /* Don't overlap encounter NPCs */
      let tooClose = false;
      for (const en of a1NPCs) {
        if (Math.abs(en.x - nx) < 3 && Math.abs(en.y - ny) < 2) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;
      placed++;
      const msg = Util.pick(["ugh", "merde", ":(", "sigh", "...", "pfft", "crisse", "oy", "bruh", "why", "$$$", "tired"]);
      const startShowing = Math.random() < 0.4;
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
        msgCD: Util.randInt(8000, 22000) + placed * 400,
      });
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
      // showBanner(window.LANG.bannerIsThisALife, "#9ab0cc", 3000, true);
      hudLabel.textContent = "";
      hudScore.textContent = "";
      hudStatus.textContent = "";
    }
  }
  function updateAct1(dt) {
    a1T += dt;
    a1CX = Util.lerp(a1CX, a1PX - Math.floor(W * A1_PSX_RATIO), 0.06);
    if (a1St !== "descend") a1CY = Util.lerp(a1CY, a1PY - Math.floor(H * A1_PSY_RATIO), 0.06);
    updateBanner(dt);
    dialogUpdate(dt);
    if (clickPending && phase === "act1" && a1St !== "tap") clickPending = false;
    // Update ambient NPCs
    for (const an of a1AmbNPCs) {
      an.x += an.dx * an.sp * dt;
      an.y += an.dy * an.sp * dt;
      an.msgCD -= dt;
      if (an.msgCD <= 0) {
        an.msgT = an.msgMax;
        an.msgCD = Util.randInt(8000, 18000);
        an.msg = Util.pick(["ugh", "merde", ":(", "sigh", "...", "pfft", "crisse", "oy", "bruh", "why", "$$$", "tired"]);
      }
      if (an.msgT > 0) an.msgT -= dt;
    }
    if (a1St === "pause") {
      a1ST2 += dt;
      if (a1ST2 > 1000) {
        a1St = "walk";
        a1ST2 = 0;
        a1IdleTimer = 0;
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
          audio.play("bump");
          a1ES = 0;
          a1ST2 = 0;
          a1EncNPC = a1NPCs[a1EI];
        } else if (a1NP === 0 && a1St !== "tap") {
          a1St = "tap";
          a1ST2 = 0;
          a1IdleTimer = 0;
        } else if (a1NP < NQ.length) {
          showBanner(NQ[a1NP].t, NQ[a1NP].c, NQ[a1NP].d);
          a1NP++;
          a1ST2 = 0;
          a1St = "nar";
        } else {
          a1St = "done";
          a1ST2 = 0;
        }
        return;
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
        a1PX += (dx / d) * s;
        a1PY += (dy / d) * s;
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
          a1PX += (dx / d) * s;
          a1PY += (dy / d) * s;
        }
      }
      // Track pause delay separately — not tied to bannerTimer
      if (a1PauseT > 0) {
        a1PauseT -= dt;
        return;
      }
      if (bannerTimer <= 0) {
        if (a1PI >= a1Path.length - 1) {
          if (a1NP < NQ.length) {
            const q = NQ[a1NP];
            if (q.pause) {
              a1PauseT = q.d;
            } else {
              showBanner(q.t, q.c, q.d);
            }
            a1NP++;
            a1ST2 = 0;
          } else {
            a1St = "done";
            a1ST2 = 0;
          }
        } else a1St = "walk";
      }
    } else if (a1St === "enc") {
      /* Array-of-turns encounter engine using conv panel */
      a1ST2 += dt;
      // Update conv anchors X as camera moves, but freeze Y once set
      if (convVisible && a1EncNPC) {
        convAnchorPX = psx;
        convAnchorNX = a1EncNPC.x - ox;
        // Y is set once at conversation start and never changes
      }
      const e = A1E[a1EI];
      const turns = e.turns;
      if (a1ES < turns.length) {
        if (a1ES === 0 && !convVisible && a1ST2 > 600) {
          // Wait 600ms for camera to settle before showing first dialogue
          dialogStack = [];
          convReset();
          convAnchorPX = psx;
          convAnchorNX = a1EncNPC.x - ox;
          convAnchorY = psy;
          convEncounterIndex = a1EI; // Store encounter index for render adjustments
          convPlayerColor = C_PLAYER;
          convNPCColor = a1EncNPC.col || "#7a8aaa";
          convVisible = true;
          const t = turns[0];
          const side = t.who === "p" ? "you" : "them";
          const col = t.who === "p" ? C_PLAYER : convNPCColor;
          const txt = t.texts ? t.texts[Math.min(a1LoopCount - 1, t.texts.length - 1)] : t.text;
          convAddLine(txt, side, col);
          a1ES = 1;
          a1ST2 = 0;
        } else if (a1ST2 > (turns[a1ES]?.delay ?? 3500)) {
          // ACT 1 TIMING: Default delay between text boxes (in ms)
          const t = turns[a1ES];
          const side = t.who === "p" ? "you" : "them";
          const col = t.who === "p" ? C_PLAYER : convNPCColor;
          const txt = t.texts ? t.texts[Math.min(a1LoopCount - 1, t.texts.length - 1)] : t.text;
          convAddLine(txt, side, col);
          a1ES++;
          a1ST2 = 0;
        }
      } else if (a1ST2 > 2000) {
        // All turns done, move on
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
      }
    } else if (a1St === "tap") {
      a1ST2 += dt;
      a1IdleTimer += dt;
      if (a1IdleTimer > 15000) {
        convStartFade();
        a1St = "outro";
        a1ST2 = 0;
        a1NP = 0;
        showBanner(NQ[0].t, NQ[0].c, NQ[0].d);
        a1NP = 1;
        return;
      }
      if (a1ST2 > 800 && clickPending) {
        clickPending = false;
        /* Only act on clicks within the choice box Y range. Clicks outside = ignore. */
        if (convChoiceY2 > 0 && clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
          const splitY = Math.floor((convChoiceY1 + convChoiceY2) / 2);
          audio.play("click");
          convStartFade();
          a1ST2 = 0;
          if (clickSY < splitY) {
            // "I've had enough"
            a1St = "outro";
            // burst from player position
            const ox = Math.floor(a1CX),
              oy = Math.floor(a1CY);
            const px = Math.round(a1PX) - ox,
              py = Math.round(a1PY) - oy;
            burstGood(px, py, C_PLAYER, 16);
            triggerFlashGood();
            a1NP = 0;
            setTimeout(() => {
              showBanner(NQ[0].t, NQ[0].c, NQ[0].d);
            }, 1200);
            a1NP = 1;
          } else {
            // "keep living like this"
            const lm = A1_LOOP_MSGS[Math.min(a1LoopCount, A1_LOOP_MSGS.length - 1)];
            console.log("loop #" + a1LoopCount, lm);
            showBanner(lm.t, lm.c, 2000, true);
            a1LoopCount++;
            if (a1LoopCount > 5) {
              Music.stop();
              phase = "done";
              loop.stop();
              overlay.classList.remove("hidden");
              ovTitle.textContent = ".";
              ovTitle.style.color = C_DANGER;
              ovSub.textContent = window.LANG.bannerKeepLivingLike;
              ovHint.textContent = "";
              startBtn.textContent = window.LANG.endScreenTryAgain;
              overlay.querySelectorAll(".final").forEach((e) => e.remove());
              overlay.querySelectorAll(".give-up-btn").forEach((e) => e.remove());
              return;
            }
            if (!a1StartX) {
              a1StartX = a1Path[0].x;
              a1StartY = a1Path[0].y;
            }
            a1St = "loop";
            a1Path = [
              {
                x: Math.round(a1PX),
                y: Math.round(a1PY),
              },
              {
                x: a1StartX,
                y: Math.round(a1PY),
              },
              {
                x: a1StartX,
                y: a1StartY,
              },
            ];
            a1PI = 0;
          }
        }
        /* else: click outside choice — ignore, keep box visible */
      }
      // Keyboard: up = "I've had enough", down = "keep living"
      if (a1ST2 > 800) {
        if (input.justPressed("up")) {
          convStartFade();
          const lm = A1_LOOP_MSGS[Math.min(a1LoopCount, A1_LOOP_MSGS.length - 1)];
          showBanner(lm.t, lm.c, 2000, true);
          a1LoopCount++;
          if (a1LoopCount > 5) {
            Music.stop();
            phase = "done";
            loop.stop();
            overlay.classList.remove("hidden");
            ovTitle.textContent = "no";
            ovTitle.style.color = C_DANGER;
            ovSub.textContent = "you kept living like this\nuntil you couldn't anymore";
            ovHint.textContent = "";
            startBtn.textContent = "try again?";
            overlay.querySelectorAll(".final").forEach((e) => e.remove());
            overlay.querySelectorAll(".give-up-btn").forEach((e) => e.remove());
            return;
          }
          if (!a1StartX) {
            a1StartX = a1Path[0].x;
            a1StartY = a1Path[0].y;
          }
          a1St = "loop";
          a1ST2 = 0;
          a1Path = [
            {
              x: Math.round(a1PX),
              y: Math.round(a1PY),
            },
            {
              x: a1StartX,
              y: Math.round(a1PY),
            },
            {
              x: a1StartX,
              y: a1StartY,
            },
          ];
          a1PI = 0;
        }
      }
    } else if (a1St === "outro") {
      a1ST2 += dt;
      a1PX += 0.005 * dt;
      if (a1PauseT > 0) {
        a1PauseT -= dt;
        return;
      }
      if (bannerTimer <= 0) {
        if (a1NP < NQ.length) {
          const q = NQ[a1NP];
          if (q.pause) {
            a1PauseT = q.d;
          } else {
            showBanner(q.t, q.c, q.d);
          }
          a1NP++;
        } else {
          // a1St = "descend";
          a1St = "done";

          a1ST2 = 0;
        }
      }
    } else if (a1St === "descend") {
      /* Walk along roads to reach a lower Y before transitioning to Act 2 */
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
          a1PX += (dx / d) * s;
          a1PY += (dy / d) * s;
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
          a1PX += (dx / d) * s;
          a1PY += (dy / d) * s;
        }
      }
    } else if (a1St === "done") {
      a1ST2 += dt;
      if (a1ST2 > 800)
        initInter(
          [
            // { t: window.LANG.bannerRecruitCrew, c: C_ORANGE, d: 2000 },
            // { t: window.LANG.bannerWatchNarcs, c: C_ORANGE, d: 2000 },
          ],
          initAct2,
        );
    }
  }

  function renderAct1() {
    renderCity(a1CX, a1CY);
    const ox = Math.floor(a1CX),
      oy = Math.floor(a1CY);
    for (const n of a1NPCs) {
      const sx = n.x - ox,
        sy = n.y - oy;
      if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
        // flashing npc
        // let c = n.enc < a1EI ? "#555" : n.enc === a1EI ? (Math.sin(a1T / 10000) > 0 ? n.col : C_PLAYER) : "#444";
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
          // npc text
          // if (asy - 1 >= 0) grid.text(txt, tx, asy - 1, "#778");
          // darker
          if (asy - 1 >= 0) grid.text(txt, tx, asy - 1, "#556");
        }
      }
    }
    const px = Math.round(a1PX) - ox,
      py = Math.round(a1PY) - oy;
    if (px >= 0 && px < W && py >= 0 && py < H) grid.set(px, py, "@", playerPulseColor(a1T));
    dialogRender();
    convRender();

    /* Act 1 choice uses the shared convRender system.
                         Safety: if we've left the tap state, ensure conv is hidden. */
    if (a1St !== "tap" && a1St !== "enc" && convVisible) convReset();
    if (a1St === "tap" && a1ST2 > 800 && !convVisible) {
      convReset();
      convAnchorPX = px;
      convAnchorNX = px;
      convAnchorY = py;
      convEncounterIndex = 3; // Choice screen is after 3 encounters
      convPlayerColor = C_PLAYER;
      convVisible = true;
      convShowChoices(window.LANG.act1Choices);
    }
    renderBanner();
  }

  // act 2

  const A2_MIN = 3,
    A2_MH = 3;
  /* Time-based lose condition for Act 2.
                       If the player takes too long to recruit A2_MIN robins, they lose.
                       A2_TIME_LIMIT_MS = total ms allowed in Act 2 before failure.
                       A2_TIME_WARN_MS = ms at which the warning banner appears. */
  const A2_TIME_LIMIT_MS = 50000; /* 50 seconds  */
  const A2_TIME_WARN_MS = 30000; /* 30 seconds  */
  const BUILDINGS = window.GAME_DATA.buildings;
  function tileBuildings(blockW) {
    const pieces = [];
    let remain = blockW;
    let iter = 0;
    while (remain > 0 && iter++ < 20) {
      const fits = BUILDINGS.filter((b) => b.size <= remain);
      if (fits.length === 0) break;
      const canClean = fits.filter((b) => {
        const r = remain - b.size;
        return r === 0 || r >= 6;
      });
      const pool = canClean.length > 0 ? canClean : fits;
      const b = pool[Math.floor(Math.random() * pool.length)];
      pieces.push({
        art: b.art,
        w: b.size,
      });
      remain -= b.size;
    }
    return pieces;
  }
  /* Washed-out building colors — muted pastels so avatars pop */
  const A2_BCOL = ["#b9a89a", "#9ab89a", "#9a9ab8", "#b8a09a", "#9aa8b0", "#a89ab0", "#b0a898", "#98a8b0"];
  const A2_PA = window.GAME_DATA.playerArt;
  const A2_NPC_ARTS = window.GAME_DATA.npcArts;
  const A2_NPC_COLORS = window.GAME_DATA.npcColors;
  const A2_NPC = window.GAME_DATA.npcArts[0];
  const A2_NARC = window.GAME_DATA.narcArt;
  const A2_ROB = window.GAME_DATA.robinArt;

  /* 6 lanes */
  const A2_NUM_LANES = 6;
  let A2_RU_H = 3,
    A2_VRW = 7;

  let A2_BH_PER, A2_LANE_YS, A2_GND, A2_TOP_PAD;
  let a2WX, a2T, a2Ht, a2Spd;
  let a2Blocks, a2Roads, a2NPCs, a2Crew, a2Clouds;
  let a2PX, a2PY, a2PRu, a2PAnim, a2PAnimT, a2TargetY, a2Hopping;
  let a2HopIntent, a2HopTimer;
  let a2TN,
    a2TP,
    a2TT,
    a2TalkCD,
    a2Choice,
    a2ChoiceLabels,
    a2ChoiceTags = [],
    a2LastGreetTone;
  let a2SV, a2SW, a2SD, a2SDT;
  let a2Gen;
  let a2HudFlashT, a2HudFlashMsg; // HUD flash
  let a2TimeWarned; // has the "too slow" warning fired yet?

  function a2Layout() {
    A2_GND = H - 1;
    A2_RU_H = 2;
    const numRoads = 3;
    const numBands = numRoads + 1;
    const totalStreetH = numRoads * A2_RU_H * 2;
    // Don't reduce A2_BH_PER — keep spacing identical, just shift origin down
    A2_BH_PER = Math.max(4, Math.floor((A2_GND - totalStreetH) / numBands));
    A2_TOP_PAD = Math.floor(H * 0.06);
    A2_LANE_YS = [];
    for (let road = 0; road < numRoads; road++) {
      const roadY = A2_TOP_PAD + (road + 1) * A2_BH_PER + road * A2_RU_H * 2;
      A2_LANE_YS.push(roadY);
      A2_LANE_YS.push(roadY + A2_RU_H);
    }
  }

  function a2RuY(ri) {
    return A2_LANE_YS[ri] || A2_LANE_YS[0];
  }
  function a2NpcY(n) {
    // return a2RuY(n.ru);
    return a2RuY(n.ru) + 0;
  }

  function a2BandY(bi) {
    if (bi <= 3) {
      const y = A2_TOP_PAD + bi * (A2_BH_PER + A2_RU_H * 2);
      return { y, h: A2_BH_PER };
    }
    return { y: A2_GND - 2, h: 2 };
  }

  function a2GenChunk(from, to) {
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
      const rightE = Math.min(roadXs[ri + 1], to);
      if (rightE <= from || leftE >= to || rightE - leftE < 8) continue;
      const overlap = a2Blocks.find((b) => b.band === 0 && b.wx < rightE && b.wx + b.w > leftE);
      if (overlap) continue;
      /* Building bands for 6+1 bands */
      for (let band = 0; band <= 3; band++) {
        const { y: bandY, h: bandH } = a2BandY(band);
        if (bandH < 2) continue;
        a2Blocks.push({
          wx: leftE,
          y: bandY,
          w: rightE - leftE,
          h: bandH,
          band,
          bldgs: [],
        });
        const blk = a2Blocks[a2Blocks.length - 1];
        const availW = rightE - leftE - 2;
        const tiles = tileBuildings(availW);
        let bx = leftE + 1;
        for (const tile of tiles) {
          blk.bldgs.push({
            dx: bx - leftE,
            art: tile.art,
            color: Util.pick(A2_BCOL),
            w: tile.w,
          });
          bx += tile.w;
        }
      }
    }
    /* NPCs across all 6 lanes (skip top road - lanes 0-1 - to avoid dialogue cutoff) */
    for (let ri = 2; ri < A2_NUM_LANES; ri++) {
      // density
      // reduce npc density
      for (let nx = from + Util.randInt(55, 80); nx < to; nx += Util.randInt(70, 110)) {
        let onRoad = false;
        for (const rd of a2Roads) if (nx >= rd.wx - 1 && nx <= rd.wx + A2_VRW + 1) onRoad = true;
        if (onRoad) continue;
        const r = Math.random();
        let tp, tl;
        if (r < 0.13) {
          tp = "narc";
          tl = 0;
        } else if (r < 0.42) {
          tp = "resist";
          tl = 1;
        } else {
          tp = "norm";
          tl = 1;
        }
        const npcKind = Math.random() < 0.5 ? "hungry" : "angry";
        /* Narc ambient tells */
        const ambLine = tp === "narc" ? drawAmb(DECK_AMB_NARC) : npcKind === "hungry" ? drawAmb(DECK_AMB_HUNGRY) : drawAmb(DECK_AMB_ANGRY);

        // Narcs use currency-symbol heads — bright, varied, same 2-row structure as NPCs
        // Player won't know on sight, but will feel the pattern after a few hits
        const narcHeads = ["$", "€", "£", "¥", "₿", "₽"];
        const narcHead = Util.pick(narcHeads);
        const narcBody = Util.pick(["\u03C6", "ψ", "Ω", "\u00A7"]); // φ ψ Ω §
        const npcArt = tp === "narc" ? [narcHead, narcBody] : Util.pick(A2_NPC_ARTS);
        // Narcs are vivid like regulars but skew toward warm/alert tones
        const narcCols = ["#ffaa44", "#ff8866", "#ffcc33", "#ff9955", "#ffbb55"];
        const npcCol = tp === "narc" ? Util.pick(narcCols) : Util.pick(A2_NPC_COLORS);

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
    // Clouds
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

  function initAct2() {
    audio.play("level");
    Music.transition("music_act2"); // fades out act1 if still playing, starts act2
    audio.preload(["music_act3"]); // preload for act2b
    phase = "act2";
    hasPlayed = true;
    a2Layout();
    a2CrewCount = 0;
    a2Ht = 0;
    a2T = 0;
    a2Spd = 0.006;
    a2WX = 0;
    a2Blocks = [];
    a2Roads = [];
    a2NPCs = [];
    a2Crew = [];
    a2Clouds = [];
    a2Gen = 0;
    a2HudFlashT = 0;
    a2HudFlashMsg = "";
    a2TimeWarned = false;
    a2PRu = Math.max(0, A2_NUM_LANES - 2);
    a2PX = Math.floor(W / 2);
    a2PY = a2RuY(a2PRu) + 0;

    a2TargetY = a2PY;

    a2Hopping = false;
    a2HopIntent = 0;
    a2HopTimer = 0;
    a2PAnim = 0;
    a2PAnimT = 0;
    a2TN = null;
    a2TP = 0;
    a2TT = 0;
    a2TalkCD = 3000;
    a2SV = false;
    a2SW = 500;
    a2SD = false;
    a2SDT = null;
    dialogStack = [];
    a2GenChunk(0, W * 3);
    hudLabel.textContent = window.LANG.hudCrewLabel;
    hudScore.textContent = "0";
    hudStatus.textContent = window.LANG.hudAct2Status;
    hudStatus.style.color = C_SUCCESS;
    bannerTimer = 0;
    // showBanner(window.LANG.bannerRecruitCrew, C_ORANGE, 5000);

    setTimeout(() => {
      if (phase === "act2") {
        bannerText += "\n\n" + window.LANG.bannerWatchNarcs;

        bannerTimer = Math.max(bannerTimer, 3500); // reset timer after appending line
      }
    }, 1800);
  }

  function updateAct2(dt) {
    if (!a2TN) a2T += dt; /* freeze game clock during conversations */
    updateBanner(dt);
    dialogUpdate(dt);
    if (a2TalkCD > 0) a2TalkCD -= dt;
    if (a2HudFlashT > 0) a2HudFlashT -= dt;
    for (const n of a2NPCs) {
      if (n.spT > 0) n.spT -= dt;
      if (n.cd > 0) n.cd -= dt;
    }
    a2PAnimT += dt;
    if (a2PAnimT > 250) {
      a2PAnimT = 0;
      a2PAnim = 1 - a2PAnim;
    }

    if (a2TN) {
      a2TT += dt;
      const psx = Math.round(a2PX),
        nsx = Math.round(a2TN.wx - a2WX);
      const psy = Math.round(a2PY);

      // Update conv anchors
      convAnchorPX = psx;
      convAnchorNX = nsx;
      convAnchorY = psy;

      // ── TP 0: open conv panel, player greets ──

      if (a2TP === 0 && a2TT > 400) {
        dialogStack = [];
        convReset();
        convAnchorPX = psx;
        convAnchorNX = nsx;
        convAnchorY = psy;
        convPlayerColor = C_PLAYER;
        convNPCColor = a2TN.col || "#7a8aaa";
        convVisible = true;

        DM.startConv(); // ← ONLY call. Removed from TP 12.

        const greetResult = DM.drawWithTags(DECK_GREET);
        a2LastGreetTone = greetResult.tags[0] ?? "casual";
        convAddLine(greetResult.text, "you", convPlayerColor);
        a2TP = 12;
        a2TT = 0;
      }

      // ── TP 2: immediate join after match ──
      else if (a2TP === 2 && a2TT > 2000) {
        const pair = DM.draw(DECK_JOIN_CONSENT);
        convAddLine(pair.join, "them", convNPCColor);
        a2TN._line2 = pair.consent;
        a2TP = 21;
        a2TT = 0;
      }

      // ── TP 12: NPC replies based on type ──
      else if (a2TP === 12 && a2TT > 2500) {
        // DM.startConv() — REMOVED. Do not add back.

        let helloDeck;
        if (a2TN.tp === "narc") helloDeck = DECK_NARC_HELLO;
        else if (a2TN.kind === "angry") helloDeck = DECK_ANGRY_HELLO;
        else helloDeck = DECK_HUNGRY_HELLO;

        const { text: line, tags } = DM.drawWithTags(helloDeck);
        a2TN.helloTags = tags;

        const tone = a2LastGreetTone ?? "casual";
        const npcType = a2TN.tp === "narc" ? "narc" : a2TN.kind;
        const prefixPool = HELLO_PREFIX[tone]?.[npcType] ?? [];
        const prefix = prefixPool.length > 0 ? prefixPool[Math.floor(Math.random() * prefixPool.length)] + " " : "";

        convAddLine(prefix + line, "them", convNPCColor);
        a2TP = 13;
        a2TT = 0;
      }

      // ── TP 13: show first pitch choices ──
      else if (a2TP === 13 && a2TT > 2000) {
        for (const t of a2TN.helloTags ?? []) {
          DM._seedConvTag(t);
        }

        const prefix = a2TN.tp === "narc" ? DM.draw(DECK_ACK_NARC) + " " : "";

        let angryResult, hungryResult;

        if (a2TN.helloTags && a2TN.helloTags.length > 0) {
          // Hello had a topic — pitch follows it.
          angryResult = DM.drawNoRecord(DECK_ANGRY_PITCH, {
            boost: true,
            follows: a2TN.helloTags,
          });
          hungryResult = DM.drawNoRecord(DECK_HUNGRY_PITCH, {
            boost: true,
            follows: a2TN.helloTags,
          });
        } else {
          // Hello was untagged — pitch should be register-only, no new topic.
          angryResult = DM.drawForEmpty(DECK_ANGRY_PITCH);
          hungryResult = DM.drawForEmpty(DECK_HUNGRY_PITCH);
        }

        a2ChoiceTags = [angryResult.tags, hungryResult.tags, []];
        a2ChoiceLabels = [prefix + angryResult.text, prefix + hungryResult.text, DM.draw(DECK_BACK_OFF_EARLY)];
        convShowChoices(a2ChoiceLabels);
        a2Choice = -1;
        a2TP = 1;
        a2TT = 0;
      }

      // ── TP 1: wait for first pitch choice ──
      else if (a2TP === 1 && a2TT > 1100) {
        if (clickPending) {
          clickPending = false;
          const splitY = Math.floor((convChoiceY1 + convChoiceY2) / 2);

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
              a2Choice = picked;
            }
          }
        }
        if (input.isDown("up")) a2Choice = 0;
        if (input.isDown("down")) a2Choice = 1;
        if (input.isDown("action")) a2Choice = 2;
        if (a2Choice >= 0) {
          audio.play("click");
          convHideChoices();
          convAddLine(a2ChoiceLabels[a2Choice], "you", convPlayerColor);
          // record tags for chosen pitch only
          if (a2Choice < 2) {
            for (const t of a2ChoiceTags[a2Choice] ?? []) DM._seedConvTag(t);
          }
          if (a2Choice === 2) {
            a2TP = 25;
          } else {
            a2TP = 14;
          }
          a2TT = 0;
        }
      }
      // ── TP 14: check match, route accordingly ──
      else if (a2TP === 14 && a2TT > 1600) {
        const matched = (a2Choice === 0 && a2TN.kind === "angry") || (a2Choice === 1 && a2TN.kind === "hungry");
        if (a2TN.tp === "narc") {
          const skeptResult = DM.drawWithTags(DECK_SAY_MORE_SKEPTICAL, {
            follows: a2ChoiceTags?.[a2Choice] ?? [],
            boost: false,
          });
          a2TN.sayMoreTags = skeptResult.tags.length > 0 ? skeptResult.tags : (a2ChoiceTags?.[a2Choice] ?? []);
          convAddLine(skeptResult.text, "them", convNPCColor);
          a2TP = 15;
        } else if (!matched) {
          let mismatchDeck;
          if (a2Choice === 0 && a2TN.kind === "hungry") {
            mismatchDeck = DECK_MISMATCH_TOO_STRUCTURAL;
          } else if (a2Choice === 1 && a2TN.kind === "angry") {
            mismatchDeck = DECK_MISMATCH_TOO_LITERAL;
          } else {
            mismatchDeck = DECK_MISMATCH_GENERIC;
          }
          convAddLine(DM.draw(mismatchDeck) + " " + DM.draw(DECK_NO_BYE), "them", convNPCColor);

          addFloat(Util.pick([window.LANG.floatReadTheRoom, window.LANG.floatListenBetter, window.LANG.floatWrongEnergy]), 0, 0, C_WARN);

          a2TP = 7;
        } else {
          const warmResult = DM.drawWithTags(DECK_SAY_MORE_WARM, {
            follows: a2ChoiceTags?.[a2Choice] ?? [],
            boost: true,
          });
          a2TN.sayMoreTags = warmResult.tags.length > 0 ? warmResult.tags : (a2ChoiceTags?.[a2Choice] ?? []);
          convAddLine(warmResult.text, "them", convNPCColor);
          a2TP = 15;
        }
        a2TT = 0;
      }

      // ── TP 15: show second round choices ──
      else if (a2TP === 15 && a2TT > 1800) {
        const pitchFollows = a2TN.sayMoreTags ?? a2ChoiceTags?.[a2Choice] ?? a2TN.helloTags ?? [];
        const strongerLine = DM.draw(DECK_STRONGER_PITCH, {
          boost: true,
          follows: pitchFollows,
        });
        a2ChoiceLabels = [strongerLine, DM.draw(DECK_BACK_OFF_LATE)];
        convShowChoices(a2ChoiceLabels);
        a2Choice = -1;
        a2TP = 23;
        a2TT = 0;
      }

      // ── TP 21: immediate join — jp first, now add cp ──
      else if (a2TP === 21 && a2TT > 1800) {
        convAddLine(a2TN._line2, "them", convNPCColor);
        a2TP = 8;
        a2TT = 0;
      }

      // ── TP 23: wait for second choice ──
      else if (a2TP === 23 && a2TT > 1100) {
        if (clickPending) {
          clickPending = false;
          if (clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
            const half = Math.floor((convChoiceY1 + convChoiceY2) / 2);
            a2Choice = clickSY < half ? 0 : 1;
          }
        }
        if (input.justPressed("up")) a2Choice = 0;
        if (input.justPressed("down")) a2Choice = 1;
        if (a2Choice >= 0) {
          audio.play("click");
          convHideChoices();
          convAddLine(a2ChoiceLabels[a2Choice], "you", convPlayerColor);
          if (a2Choice === 0) {
            setTimeout(() => {
              if (a2TP === 24) convAddLine(DM.draw(DECK_INVITE), "you", convPlayerColor);
            }, 1500);
          }
          a2TP = 24;
          a2TT = 0;
        }
      }

      // ── TP 24: resolve second choice ──
      else if (a2TP === 24 && a2TT > 2000) {
        if (a2Choice === 1) {
          // Backed off late
          DM.endConv();
          const wasNarc = a2TN.tp === "narc";
          a2TN.st = "done";
          a2TN.cd = 9999;
          a2TN = null;
          a2TalkCD = 500;
          if (wasNarc) {
            showBanner(window.LANG.bannerGoodCallNarc, C_SUCCESS, 3000);
          } else {
            addFloat(Util.pick([window.LANG.floatTooCautious, window.LANG.floatGiveChance, window.LANG.floatNeverChange]), 0, 0, C_WARN);
          }
          setTimeout(() => {
            dialogStack = [];
            convStartFade();
          }, 800);
        } else if (a2TN.tp === "narc") {
          convAddLine(DM.draw(DECK_NARC_REV), "them", C_DANGER);
          a2TP = 9;
          a2TT = 0;
        } else {
          if (Math.random() < 0.6) {
            const pair = DM.draw(DECK_JOIN_CONSENT);
            convAddLine(pair.join, "them", convNPCColor);
            a2TN._line2 = pair.consent;
            a2TP = 21;
          } else {
            convAddLine(DM.draw(DECK_NOT_NOW), "them", convNPCColor);
            a2TP = 10;
          }
          a2TT = 0;
        }
      }

      // ── TP 25: player bailed at first round ──
      else if (a2TP === 25 && a2TT > 1100) {
        DM.endConv();
        const wasNarc = a2TN.tp === "narc";
        a2TN.st = "done";
        a2TN.cd = 9999;
        a2TN = null;
        a2TalkCD = 500;
        if (wasNarc) {
          // showBanner("good call. that was a narc.", C_SUCCESS, 3000);
          addFloat(Util.pick([window.LANG.floatGoodCallSmelled]), 0, 0, C_SUCCESS);
        } else {
          addFloat(Util.pick([window.LANG.floatTooCautious, window.LANG.floatGiveChance, window.LANG.floatNeverChange]), 0, 0, C_WARN);
        }
        setTimeout(() => {
          dialogStack = [];
          convStartFade();
        }, 800);
      }
      // ── TP 30: mismatch — NPC adds noBye then leaves ──
      // else if (a2TP === 30 && a2TT > 1100) {
      //   convAddLine(Util.pick(D_NO_BYE), "them", convNPCColor);
      //   a2TP = 7;
      //   a2TT = 0;
      // }

      // ── TP 7: NPC declined, close conv ──
      else if (a2TP === 7 && a2TT > 3000) {
        DM.endConv();

        a2TN.st = "done";
        a2TN.cd = 9999;
        a2TN = null;
        a2TalkCD = 500;
        setTimeout(() => {
          dialogStack = [];
          convStartFade();
        }, 1000);
      }

      // ── TP 8: recruit ──
      else if (a2TP === 8 && a2TT > 2500) {
        DM.endConv();
        const n = a2TN;
        n.st = "rec";
        a2CrewCount++;
        audio.play("recruit");
        spark(Math.round(a2PX), Math.round(a2PY), C_TEAL, 10);
        a2Crew.push({
          b: Math.random() * 6,
          ru: n.ru,
          art: n.art,
          col: n.col,
        });
        console.log("float test:", window.LANG.floatNewRobin, window.LANG.floatTheyreIn, window.LANG.floatCrewGrows);
        addFloat(Util.pick([window.LANG.floatNewRobin, window.LANG.floatTheyreIn, window.LANG.floatCrewGrows]), 0, 0, C_TEAL);

        addFloat(Util.pick([window.LANG.floatNewRobin, window.LANG.floatTheyreIn, window.LANG.floatCrewGrows]), 0, 0, C_TEAL);
        a2TN.cd = 1000;
        a2TN = null;
        a2TalkCD = 500;
        setTimeout(() => {
          dialogStack = [];
          convStartFade();
        }, 1000);
      }

      // ── TP 9: narc reveal consequence ──
      else if (a2TP === 9 && a2TT > 3000) {
        DM.endConv();

        const n = a2TN;
        n.st = "angry";
        n.col = C_DANGER;
        a2Ht++;
        audio.play("narc");
        spark(Math.round(a2PX), Math.round(a2PY), C_DANGER, 14);
        triggerChromatic(500);
        // Higher float for narc reveal — negative jy so it renders above center
        // const narcFloat = { text: "⚠ NARC ALERT ⚠", color: C_DANGER, life: 2400, max: 2400, boxed: true, jx: 0, jy: -6 };
        // floats.push(narcFloat);
        // spark(Math.round(a2PX), Math.round(a2PY), C_DANGER, 18); // big red burst
        // spark(Math.round(a2TN.wx - a2WX), Math.round(a2NpcY(a2TN)), C_DANGER, 12);

        // try banner instead to see if it's more visible <-- this seemed to do nothing diff than above? look into it later
        // showBanner(window.LANG.bannerNarc, C_DANGER, 2200, true);
        for (let _nb = 0; _nb < 5; _nb++) spark(Math.round(a2PX) + Util.randInt(-4, 4), Math.round(a2PY) + Util.randInt(-2, 2), C_DANGER, 14);
        spark(Math.round(a2TN.wx - a2WX), Math.round(a2NpcY(a2TN)), C_DANGER, 16);

        if (a2Ht >= A2_MH) setTimeout(() => endGame("busted"), 2000);
        a2TN.cd = 1000;
        a2TN = null;
        a2TalkCD = 500;
        setTimeout(() => {
          dialogStack = [];
          convReset();
        }, 1500);
      }

      // ── TP 10: NPC defers — maybe returns later ──
      else if (a2TP === 10 && a2TT > 3000) {
        DM.endConv();

        const n = a2TN;
        n.st = "maybe";
        n.cd = 9999;
        addFloat(Util.pick([window.LANG.floatNotYet, window.LANG.floatNeedTime]), 0, 0, "#a80");
        a2TN = null;
        a2TalkCD = 500;
        setTimeout(() => {
          dialogStack = [];
          convStartFade();
        }, 1000);
        // Return of the mack — only fires if player isn't in conversation
        setTimeout(
          () => {
            if (n.st === "maybe" && !a2TN) {
              n.st = "rec";
              a2CrewCount++;
              audio.play("recruit");
              a2Crew.push({
                b: Math.random() * 6,
                ru: n.ru,
                art: n.art,
                col: n.col,
              });
              convReset();
              convAnchorPX = Math.round(a2PX);
              convAnchorNX = Math.round(n.wx - a2WX);
              convAnchorY = Math.round(a2PY);
              convPlayerColor = C_PLAYER;
              convNPCColor = n.col;
              convVisible = true;
              convAddLine(DM.draw(DECK_RETURN), "them", n.col);
              setTimeout(() => {
                dialogStack = [];
                convReset();
              }, 3000);
              hudScore.textContent = a2CrewCount;
            }
          },
          4000 + Math.random() * 3000,
        );
      }

      hudScore.textContent = a2CrewCount;
      return;
    }
    // Slow down the SD banners

    if (a2SD) {
      if (a2SDT === null) {
        a2SDT = 0;
        showBanner(window.LANG.bannerYouHaveACrew, C_PLAYER, 2400);
      }
      a2SDT += dt;
      if (a2SDT > 3600 && a2SDT - dt <= 3600) {
        showBanner(window.LANG.bannerTimeToRally, C_ORANGE, 999999);
      }
      if (a2SDT > 5000 && clickPending) {
        clickPending = false;
        initInter(
          [
            {
              t: window.LANG.bannerRallyNeighbourhood,
              c: C_ORANGE,
              d: 2000,
            },
            {
              t: window.LANG.bannerAvoidNarcs,
              c: C_ORANGE,
              d: 2000,
            },
          ],
          initAct2b,
        );
      }
      return;
    }

    if (!a2SV && a2CrewCount >= A2_MIN) {
      a2SV = true;
      setTimeout(() => {
        a2SD = true;
      }, 1800);
    }

    // Scroll
    a2Spd = 0.004 + a2T * 0.00000015;
    a2WX += a2Spd * dt;
    while (a2Gen < a2WX + W + 150) a2GenChunk(a2Gen, a2Gen + 80);

    /* Hop between lanes — queued, executes at gaps */
    if (input.justPressed("up")) {
      a2HopIntent = -1;
      a2HopTimer = 500;
    }
    if (input.justPressed("down")) {
      a2HopIntent = 1;
      a2HopTimer = 500;
    }

    if (clickPending && phase === "act2") {
      clickPending = false;
      const py = Math.round(a2PY);
      if (clickSY < py - 2) {
        a2HopIntent = -1;
        a2HopTimer = 3000;
      } else if (clickSY > py + 2) {
        a2HopIntent = 1;
        a2HopTimer = 3000;
      }
    }
    if (a2HopTimer > 0) a2HopTimer -= dt;
    if (a2HopTimer <= 0) a2HopIntent = 0;

    if (a2HopIntent !== 0 && !a2Hopping) {
      const pwx = Math.round(a2WX + a2PX);
      const newRu = Util.clamp(a2PRu + a2HopIntent, 0, A2_NUM_LANES - 1);
      const sameRoad = Math.floor(a2PRu / 2) === Math.floor(newRu / 2);

      let atGap = sameRoad; // always allow within same road
      if (!atGap) {
        for (const rd of a2Roads) {
          if (pwx >= rd.wx - 2 && pwx <= rd.wx + A2_VRW + 2) {
            atGap = true;
            break;
          }
        }
      }
      if (!atGap) {
        for (const blk of a2Blocks) {
          if (Math.abs(pwx - blk.wx) <= 3 || Math.abs(pwx - (blk.wx + blk.w)) <= 3) {
            atGap = true;
            break;
          }
        }
      }
      if (atGap && newRu !== a2PRu) {
        a2PRu = newRu;
        a2PY = a2RuY(a2PRu) + 0;

        a2Hopping = false;
        a2HopIntent = 0;
        a2HopTimer = 0;
        a2TalkCD = Math.max(a2TalkCD, 300);
      }
    }
    if (input.isDown("left")) a2PX -= 0.02 * dt;
    if (input.isDown("right")) a2PX += 0.02 * dt;
    a2PX = Util.clamp(a2PX, 4, W - 6);

    // Cleanup
    a2Blocks = a2Blocks.filter((b) => b.wx + b.w > a2WX - W);
    a2Roads = a2Roads.filter((r) => r.wx + A2_VRW > a2WX - W - 10);
    a2NPCs = a2NPCs.filter((n) => n.wx > a2WX - 20);
    a2Clouds = a2Clouds.filter((c) => c.wx + 10 > a2WX - W);

    // Show ambient mutters for nearby NPCs (suppress first 3s)
    const pwx2 = a2WX + a2PX;
    for (const n of a2NPCs) {
      if (n.st !== "idle") continue;
      // if (n.ru !== a2PRu) continue;
      const dist = Math.abs(n.wx - pwx2);
      if (dist < 18 && dist > 3 && a2T > 3000) {
        n.ambShow = true;
      } else {
        n.ambShow = false;
      }
    }
    // Collision with NPCs — 1s grace period at start
    if (a2TalkCD <= 0 && a2T > 1000 && !convVisible) {
      const pwx = a2WX + a2PX;
      for (const n of a2NPCs) {
        if (n.st !== "idle") continue;
        if (n.cd > 0) continue;
        if (n.ru !== a2PRu) continue;

        if (Math.abs(n.wx - pwx) < 3) {
          audio.play("bump");
          // Snap/move player to just-before NPC so they don't overlap
          a2PX = n.wx - a2WX - 3;
          a2TN = n;
          a2TP = 0;
          a2TT = 0;
          a2Choice = -1;
          break;
        }
      }
    }

    /* Time-based lose: only applies if you haven't yet reached the store transition */
    if (!a2SV) {
      if (!a2TimeWarned && a2T > A2_TIME_WARN_MS) {
        a2TimeWarned = true;
        showBanner(window.LANG.bannerCopsCircling, C_WARN, 3000);
      }
      if (a2T > A2_TIME_LIMIT_MS) {
        endGame("busted");
        return;
      }
    }

    hudLabel.textContent = window.LANG.hudCrewLabel; /* Flash HUD on recruit */
    if (a2HudFlashT > 0) {
      hudScore.textContent = a2HudFlashMsg;
      hudScore.style.color = C_SUCCESS;
    } else {
      hudScore.textContent = a2CrewCount;
      hudScore.style.color = C_DANGER;
    }
    if (a2SV) hudStatus.textContent = "Store: " + Math.max(0, Math.floor((a2SW - a2WX) / 3)) + "m";
    else if (a2CrewCount < A2_MIN) {
      const timeLeft = Math.max(0, Math.floor((A2_TIME_LIMIT_MS - a2T) / 1000));
      hudStatus.textContent = "Need " + (A2_MIN - a2CrewCount) + " | " + timeLeft + "s";
    } else hudStatus.textContent = "Keep going!";
    if (a2Ht > 0) hudStatus.textContent += " | HEAT:" + a2Ht + "/" + A2_MH;
    hudStatus.style.color = a2Ht >= 2 || (a2TimeWarned && !a2SV) ? C_DANGER : C_SUCCESS;
  }

  function renderAct2() {
    for (let ri = 0; ri < A2_NUM_LANES; ri++) {
      const ry = a2RuY(ri);
    }
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

    // NPCs — hide recruited ones (they're now in the crew trail)
    for (const n of a2NPCs) {
      if (n.st === "rec") continue;
      const sx = Math.round(n.wx - a2WX),
        sy = a2NpcY(n);
      if (sx < -3 || sx > W + 3) continue;
      let col = n.st === "angry" ? C_DANGER : n.st === "done" ? "#333" : n.col;
      /* Narcs fidget too (don't stand still / stiff) */

      let fidget = 0;
      if (n.st === "idle") {
        const speed = n.tp === "narc" ? 200 : 400;
        const amp = n.tp === "narc" ? 1.2 : 0.6;
        fidget = Math.round(Math.sin(a2T / speed + n.wx * 3) * amp);
      } /* Warning flash during narc bail-out window */
      if (a2TN === n && a2TP === 11) {
        col = Math.floor(a2TT / 150) % 2 === 0 ? "#c88" : "#f66";
      }
      const art = n.art || A2_NPC;
      grid.art(art, sx + fidget, sy, col);
    }
    // Crew trailing — slightly organic: per-robin phase + small y-offset
    const ppx = Math.round(a2PX),
      ppy = Math.round(a2PY);
    for (let i = 0; i < a2Crew.length; i++) {
      const r = a2Crew[i];
      /* Per-robin phase so they bob independently */
      const phase = r.b;
      /* Small y-offset alternates robins above/below the line (±1) */
      const yOff = (i % 2 === 0 ? -1 : 1) * 0.6;
      /* Gentle x-jitter so spacing isn't perfectly uniform */
      const xJit = Math.sin(Date.now() / 700 + phase * 1.7) * 0.5;
      const bob = Math.sin(Date.now() / 350 + phase) * 0.6;
      const cx2 = Math.round(ppx - 3 - i * 3 + xJit);
      const cy2 = Math.round(ppy + yOff + bob);
      const crewCol = r.col || "#3a9a3a";
      if (cx2 >= 0 && cx2 + 3 < W) grid.art(r.art || A2_ROB, cx2, cy2, crewCol);
    }
    // Player — glow effect at start
    grid.art(A2_PA[a2PAnim], ppx, ppy, playerPulseColor(a2T));

    // Ambient mutters above nearby NPCs
    for (const n of a2NPCs) {
      if (!n.ambShow || n.st !== "idle") continue;
      const nsx = Math.round(n.wx - a2WX),
        nsy = a2NpcY(n);
      if (nsx >= 0 && nsx < W - 5) {
        const txt = n.amb.substring(0, Math.min(n.amb.length, W - nsx - 1));
        grid.text(txt, nsx - Math.floor(txt.length / 2), nsy - 3, "#bbb");
      }
    }
    // Dialogue
    dialogRender();
    // Conversation panel (replaces old choice UI)
    convRender();
    if (a2SD && a2SDT !== null && a2SDT > 4500) grid.textCenter(window.LANG.tapToContinue, H - 2, Math.sin(Date.now() / 400) > 0 ? C_DIM : "#666");
    /* Heat is shown in the HUD — no in-game overlay needed */
    renderBanner();
  }

  /* ══════════════════════════════════════════════════════════
               ACT 2b: THE RALLY — mob building
               ══════════════════════════════════════════════════════════ */

  const A2B_BUILDINGS = window.GAME_DATA.buildings2b;

  /* Washed-out building colours for 2b */
  const A2B_BCOL = ["#b9a89a", "#9ab89a", "#9a9ab8", "#b8a09a", "#9aa8b0", "#a89ab0", "#b0a898", "#98a8b0"];
  /* Vivid NPC colours for 2b */
  const A2B_NPC_COL = ["#0ff", "#f0f", "#ff0", "#0f8", "#f80", "#8f0", "#80f", "#f08", "#08f"];

  let a2bWX, a2bT, a2bSpd, a2bPX, a2bPY, a2bNPCs, a2bMob, a2bHt;

  let a2bTopParts, a2bBotParts;
  let a2bStoreX, a2bDone, a2bFloats;
  let a2bBursts; /* expanding ring effects on collision */
  const A2B_MH = 3;

  /* Layout constants — computed from H */
  let A2B_TOP_H, A2B_BOT_H, A2B_ROAD_Y1, A2B_ROAD_Y2;

  function a2bCalcLayout() {
    /* Top buildings: rows 1 to ~25% of H
                         Road: ~25% to ~75% of H
                         Bottom buildings: ~75% to ~95% of H
                         Last row: ground/heat display */
    A2B_TOP_H = Math.max(5, Math.floor(H * 0.22));
    A2B_BOT_H = Math.max(5, Math.floor(H * 0.22));
    A2B_ROAD_Y1 = A2B_TOP_H + 1; /* top sidewalk line */
    A2B_ROAD_Y2 = H - A2B_BOT_H - 2; /* bottom sidewalk line */
  }

  function a2bGenRow(totalWX) {
    /* Generate a row of buildings to fill totalWX pixels */
    const parts = [];
    let sx = 0;
    while (sx < totalWX) {
      const bldg = Util.pick(A2B_BUILDINGS);
      parts.push({
        wx: sx,
        art: bldg.art,
        w: bldg.size,
        col: Util.pick(A2B_BCOL),
      });
      sx += bldg.size + Util.randInt(1, 3);
    }
    return parts;
  }

  function a2bGenNPCs() {
    a2bNPCs = []; /* NPCs only in the road zone */
    const midY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    const roadH = A2B_ROAD_Y2 - A2B_ROAD_Y1;
    const spacing = Math.max(7, Math.floor((a2bStoreX - 50) / 45));
    for (let nx = 20; nx < a2bStoreX - 20; nx += Util.randInt(spacing, spacing + 6)) {
      const isNarc = Math.random() < 0.15;
      const ny = Util.randInt(A2B_ROAD_Y1 + 2, A2B_ROAD_Y2 - 2);
      const narcHeads = ["$", "€", "£", "¥", "₿", "₽"];
      const narcHead = Util.pick(narcHeads);
      const narcBody = Util.pick(["\u03C6", "ψ", "Ω", "\u00A7"]);
      const npcArt = isNarc ? [narcHead, narcBody] : Util.pick(A2_NPC_ARTS);
      const narcCols = ["#ffaa44", "#ff8866", "#ffcc33", "#ff9955", "#ffbb55"];
      const npcCol = isNarc ? Util.pick(narcCols) : Util.pick(A2B_NPC_COL);
      a2bNPCs.push({
        wx: nx + Util.randInt(-3, 3),
        wy: ny,
        narc: isNarc,
        st: "idle",
        ch: npcArt[0],
        art: npcArt,
        col: npcCol,
        shoutT: 0,
        shoutMsg: "",
        amb: isNarc ? Util.pick(window.LANG.act2bAmbNarc) : Util.pick(window.LANG.act2bAmbCrowd),
      });
    }
  }

  function initAct2b() {
    audio.play("level");
    Music.transition("music_act3"); // act2b feels like a rally escalation — new track
    audio.preload(["music_act4"]);
    phase = "act2b";
    if (!a2Crew) a2Crew = [];
    a2bCalcLayout();
    a2bT = 0;
    a2bSpd = 0.007;
    a2bWX = 0;
    /* Player starts in the middle of the road */
    a2bPX = 10;
    a2bPY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    /* Carry over existing crew from Act 2 */
    a2bMob = [];
    for (let i = 0; i < a2Crew.length; i++) {
      const c = a2Crew[i];

      a2bMob.push({
        ox: -Util.randInt(2, 4 + Math.floor(i / 3)),
        oy: Util.randInt(-2, 2),
        ch: (c.art && c.art[0]) || "@",
        art: c.art || A2_NPC,
        /* Preserve original color from Act 2 recruit */
        col: c.col || A2B_NPC_COL[i % A2B_NPC_COL.length],
        b: c.b || Math.random() * 6,
      });
    }
    a2bHt = 0;
    a2bFloats = [];
    a2bBursts = [];
    a2bDone = false;
    a2bStoreX = Math.floor(45000 * 0.007) + W; // ~45s at base speed 0.007

    /* Generate building rows — enough for the whole level */
    a2bTopParts = a2bGenRow(a2bStoreX + W);
    a2bBotParts = a2bGenRow(a2bStoreX + W);
    a2bGenNPCs();
    dialogStack = [];
    bannerTimer = 0;
    // showBanner(window.LANG.bannerRallyNeighbourhood, C_ORANGE, 6000);

    // setTimeout(() => {
    //   if (phase === "act2b") {
    //     bannerText += "\n\n" + window.LANG.bannerAvoidNarcs;
    //     bannerTimer = Math.max(bannerTimer, 4000);
    //   }
    // }, 2000);

    hudLabel.textContent = window.LANG.hudCrewLabel;
    hudScore.textContent = String(a2CrewCount);
    hudStatus.textContent = "";
    hudStatus.style.color = C_SUCCESS;
  }

  function updateAct2b(dt) {
    a2bT += dt;
    updateBanner(dt);
    /* Scroll */
    a2bWX += a2bSpd * dt;
    a2bSpd = 0.007 + a2bT * 0.0000003;
    /* Player movement — constrained to road */
    const ms = 0.025;
    if (input.isDown("up")) a2bPY -= ms * dt;
    if (input.isDown("down")) a2bPY += ms * dt;
    if (input.isDown("left")) a2bPX -= ms * dt;
    if (input.isDown("right")) a2bPX += ms * dt;
    if (clickPending && phase === "act2b") {
      clickPending = false;
      if (clickSY < a2bPY - 2) a2bPY -= 3;
      else if (clickSY > a2bPY + 2) a2bPY += 3;
      if (clickSX < a2bPX - 3) a2bPX -= 3;
      else if (clickSX > a2bPX + 3) a2bPX += 3;
    }
    a2bPY = Util.clamp(a2bPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
    a2bPX = Util.clamp(a2bPX, 3, W - 4);
    /* Floats */
    for (let i = a2bFloats.length - 1; i >= 0; i--) {
      a2bFloats[i].life -= dt;
      a2bFloats[i].y -= 0.002 * dt;
      if (a2bFloats[i].life <= 0) a2bFloats.splice(i, 1);
    }
    /* Shout timers */
    for (const n of a2bNPCs) {
      if (n.shoutT > 0) n.shoutT -= dt;
    }

    //* Collision — 1s grace period. */
    const pwx = a2bWX + a2bPX;
    if (a2bT > 1000) {
      for (const n of a2bNPCs) {
        if (n.st !== "idle") continue;
        /* Wider trigger: 6 in X, 4 in Y. */
        if (Math.abs(n.wx - pwx) < 6 && Math.abs(n.wy - a2bPY) < 4) {
          if (n.narc) {
            n.st = "narc";
            audio.play("bump");
            audio.play("narc");
            // big burst from both player AND narc position
            spark(Math.round(a2bPX), Math.round(a2bPY), C_DANGER, 36);
            spark(Math.round(n.wx - a2bWX), Math.round(n.wy), C_DANGER, 36);
            // extra burst from center screen
            spark(Math.round(W / 2), Math.round(H / 2), C_DANGER, 24);
            triggerChromatic(600);
            a2bHt++;
            addFloat(Util.pick([window.LANG.floatNarc, window.LANG.floatNarc, window.LANG.floatOops]), 0, 0, C_DANGER);
            showBanner(window.LANG.bannerNarc, C_DANGER, 1800, true);
            if (a2bHt >= A2B_MH) {
              setTimeout(() => endGame("busted"), 1500);
              return;
            }
          } else {
            n.st = "joined";
            audio.play("bump");
            a2CrewCount++;
            audio.play("recruit");
            burstGood(Math.round(n.wx - a2bWX), n.wy, n.col, 12);
            triggerFlashGood();
            const newBob = Math.random() * 6;
            a2bMob.push({
              ox: -Util.randInt(2, 4 + Math.floor(a2bMob.length / 3)),
              oy: Util.randInt(-2, 2),
              ch: n.ch,
              art: n.art,
              col: n.col,
              b: newBob,
            });
            a2Crew.push({
              b: newBob,
              ru: 0,
              art: n.art,
              col: n.col,
            });
            addFloat(
              Util.pick([
                window.LANG.floatOui,
                window.LANG.floatLetsGo,
                window.LANG.floatAllonsY,
                window.LANG.floatCountMeIn,
                window.LANG.floatYeah,
                window.LANG.floatForReal,
              ]),
              0,
              0,
              n.col,
            );
          }
        }
      }
    }
    /* Update join animations */
    for (const m of a2bMob) {
      if (m.joinAnimT > 0) m.joinAnimT -= dt;
    }

    /* Trigger as soon as the store's left edge enters the screen (right side).
                         store_screen_x = a2bStoreX - a2bWX. We want that <= W (just appeared). */
    if (a2bStoreX - a2bWX <= W - 4 && !a2bDone) {
      a2bDone = true;
      a2bSpd = 0;

      // showBanner(a2CrewCount + " Robins.", C_DANGER, 999999);
      // setTimeout(() => {
      //   if (phase === "act3") {
      //     bannerText += window.LANG.bannerOneStore;
      //     bannerTimer = 999999;
      //   }
      // }, 1200);
      // setTimeout(() => {
      //   if (phase === "act3") {
      //     bannerText += window.LANG.bannerLetsEat;
      //     bannerTimer = 999999;
      //   }
      // }, 2400);

      setTimeout(
        () =>
          initInter(
            [
              {
                t: a2CrewCount + " Robins.",
                c: C_DANGER,
                d: 1200,
              },
              {
                t: window.LANG.bannerOneStore.trim(),
                c: C_DANGER,
                d: 1200,
              },
              {
                t: window.LANG.bannerLetsEat.trim(),
                c: C_DANGER,
                d: 1200,
              },
            ],
            initAct3,
          ),
        1500,
      );
    }
    /* HUD */
    hudScore.textContent = String(a2CrewCount);
    if (a2bHt > 0) {
      hudStatus.textContent = "HEAT: " + a2bHt + "/" + A2B_MH;
      hudStatus.style.color = a2bHt >= 2 ? C_DANGER : "#a80";
    } else {
      hudStatus.textContent = "";
    }
  }

  function renderAct2b() {
    /* ── Top building row (slight parallax 0.85×) ── */
    const topScrollX = a2bWX * 0.85;
    for (const sp of a2bTopParts) {
      const sx = Math.round(sp.wx - topScrollX);
      if (sx + sp.w < -2 || sx > W + 2) continue;
      /* Bottom-align art within the top band */
      const artH = sp.art.length;
      const by = A2B_TOP_H - artH;
      grid.art(sp.art, sx, Math.max(0, by), sp.col);
    }
    /* Top sidewalk */
    for (let x = 0; x < W; x++) {
      grid.set(x, A2B_ROAD_Y1, "\u2550", "#b0a898");
    }

    /* ── Road zone — clean, no dots ── */
    /* Centre dashes — lane markings */
    const roadMidY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    for (let x = 0; x < W; x++) {
      const wx = x + Math.floor(a2bWX);
      if (wx % 8 < 4) grid.set(x, roadMidY, "\u2500", "#ddd");
    }

    /* ── Bottom sidewalk ── */
    for (let x = 0; x < W; x++) {
      grid.set(x, A2B_ROAD_Y2, "\u2550", "#b0a898");
    }

    /* ── Bottom building row (1× scroll) ── */
    for (const sp of a2bBotParts) {
      const sx = Math.round(sp.wx - a2bWX);
      if (sx + sp.w < -2 || sx > W + 2) continue;
      /* Top-align art just below bottom sidewalk */
      grid.art(sp.art, sx, A2B_ROAD_Y2 + 1, sp.col);
    }

    /* ── NPCs (just the sprites — only idle ones; joined/narc are gone) ── */
    for (const n of a2bNPCs) {
      if (n.st !== "idle") continue;
      const sx = Math.round(n.wx - a2bWX);
      if (sx < -2 || sx > W + 2) continue;
      const art = n.art || [n.ch, "\u03C6"];
      grid.art(art, sx, n.wy, n.col);
    }

    /* ── Bursts (expanding rings of glyphs) ── */
    for (const b of a2bBursts) {
      const progress = 1 - b.t / b.max;
      const radius = Math.floor(progress * 6) + 1;
      const steps = 8 + radius * 2;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        const bx = Math.round(b.x + Math.cos(a) * radius);
        const by = Math.round(b.y + Math.sin(a) * radius * 0.6);
        if (bx >= 0 && bx < W && by >= 0 && by < H) grid.set(bx, by, b.glyph, b.col);
      }
    }

    /* ── Mob trailing player ── */
    const ppx = Math.round(a2bPX),
      ppy = Math.round(a2bPY);
    for (let i = 0; i < a2bMob.length; i++) {
      const m = a2bMob[i];
      const mx = ppx + m.ox + Math.round(Math.sin(a2bT / 300 + m.b) * 0.8);
      const my = ppy + m.oy + Math.round(Math.sin(a2bT / 400 + m.b + 1) * 0.5);
      if (mx >= 0 && mx < W && my > A2B_ROAD_Y1 && my < A2B_ROAD_Y2) {
        const art = m.art || [m.ch, "\u03C6"];
        let col = m.col || "#3a9a3a";
        /* Pop animation: flash white for first 100ms, then their color */
        if (m.popT && m.popT > 100) col = "#fff";
        grid.art(art, mx, my, col);
      }
    }

    /* ── Player — same 2-row art as Act 2 ── */
    grid.art(A2_PA[Math.floor(a2bT / 250) % 2], ppx, ppy, playerPulseColor(a2bT));

    /* ── NPC ambient text boxes ── */
    for (const n of a2bNPCs) {
      const sx = Math.round(n.wx - a2bWX);
      if (sx < -2 || sx > W + 2) continue;
      if (n.st !== "idle") continue;
      if (a2bT <= 3000) continue;
      const dist = Math.abs(n.wx - (a2bWX + a2bPX));
      if (dist >= 15 || dist <= 4) continue;
      const maxInner = 16;
      const words = n.amb.split(" "),
        lines = [];
      let cur = "";
      for (const w of words) {
        if (cur.length + w.length + 1 > maxInner) {
          lines.push(cur);
          cur = w;
        } else cur = cur ? cur + " " + w : w;
      }
      if (cur) lines.push(cur);
      const bw = Math.min(maxInner + 2, Math.max(...lines.map((l) => l.length)) + 2);
      const bh = lines.length + 2;
      const tx = Util.clamp(sx - Math.floor(bw / 2), 0, W - bw);
      const ty = n.wy - bh - 1;
      if (ty >= A2B_ROAD_Y1 && ty + bh < A2B_ROAD_Y2) {
        for (let by = ty; by < ty + bh && by < H; by++)
          for (let bx2 = tx; bx2 < tx + bw && bx2 < W; bx2++) if (bx2 >= 0) grid.set(bx2, by, " ", null);
        grid.text(DIALOG_BOX.tl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.tr, tx, ty, n.col);
        for (let li = 0; li < lines.length; li++) {
          grid.text(DIALOG_BOX.v + " ".repeat(bw - 2) + DIALOG_BOX.v, tx, ty + 1 + li, n.col);
          grid.text(lines[li], tx + 1, ty + 1 + li, n.col);
        }
        grid.text(DIALOG_BOX.bl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.br, tx, ty + 1 + lines.length, n.col);
      }
    }

    /* ── Floats ── */
    for (const f of a2bFloats) {
      if (f.life < 100) continue;
      for (let i = 0; i < f.text.length; i++) {
        const fx = Math.round(f.x) + i,
          fy = Math.round(f.y);
        if (fx >= 0 && fx < W && fy >= 0 && fy < H) grid.set(fx, fy, f.text[i], f.col);
      }
    }

    /* ── Heat indicator ── */
    // if (a2bHt > 0) {
    //   grid.text("HEAT", W - 6, A2B_ROAD_Y1 + 1, C_DANGER);
    //   for (let i = 0; i < a2bHt; i++) grid.set(W - 1 - i, A2B_ROAD_Y1 + 1, "!", C_DANGER);
    // }

    /* ── Store at far right — in the middle of the road ── */
    if (a2bWX > a2bStoreX - W - 20) {
      const stsx = Math.round(a2bStoreX - a2bWX);
      if (stsx < W + 10) {
        const stY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2) - Math.floor(STO_H / 2);
        const fl = Math.sin(Date.now() / 400) > 0 ? C_PLAYER : "#a22";
        const _stFlash = Math.sin(Date.now() / 400) > 0;
        for (let _ri = 0; _ri < STORE.length; _ri++) {
          const _row = STORE[_ri];
          const _hasLetter = /[A-Za-z]/.test(_row);
          const _rowCol = _hasLetter ? (_stFlash ? "#fff" : C_ORANGE) : _stFlash ? C_PLAYER : "#a44";
          for (let _ci = 0; _ci < _row.length; _ci++) {
            if (_row[_ci] !== " ") grid.set(stsx + _ci, stY + _ri, _row[_ci], _rowCol);
          }
        }
      }
    }

    renderBanner();
  }

  /* ══════════════════════════════════════════════════════════
               ACT 3: STOREFRONT — static scene, click to enter
               ══════════════════════════════════════════════════════════ */
  const RA2 = ["@", "\u0126"];
  let a3T, a3CrewOffsets, a3Entering, a3PlayerX, a3PlayerY;
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
  function initAct3() {
    audio.play("level");
    Music.transition("music_act4"); // storefront tension
    audio.preload(["music_act5"]);
    phase = "act3";
    ensureCrew();
    a3T = 0;
    bannerTimer = 0;
    dialogStack = [];

    a3T = 0;
    a3Entering = false;
    a3PlayerX = 0;

    // showBanner(a2CrewCount + " Robins.", C_DANGER, 999999);
    // setTimeout(() => {
    //   if (phase === "act3") {
    //     bannerText += " One store.";
    //     bannerTimer = 999999;
    //   }
    // }, 1200);
    // setTimeout(() => {
    //   if (phase === "act3") {
    //     bannerText += " Let's eat.";
    //     bannerTimer = 999999;
    //   }
    // }, 2400);

    hudLabel.textContent = window.LANG.hudCrewLabel;
    hudScore.textContent = a2CrewCount;
    hudStatus.textContent = "";
    // Build walk-in animation: robins slide in from off-screen edges
    {
      const sY = Math.floor(H * 0.62);
      const scx = Math.floor((W - STO_W) / 2);
      const dc = scx + Math.floor(STO_W / 2);
      const ly = sY + 3;
      const rc = Math.min(a2CrewCount, 12);
      const maxSlots = Math.max(1, Math.ceil(rc / 2));
      const spacing = Math.max(2, Math.floor((W / 2 - 3) / maxSlots));
      a3CrewOffsets = [];
      for (let i = 0; i < rc; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const slot = Math.floor((i + 2) / 2);
        const tx = Util.clamp(dc + side * slot * spacing, 2, W - 5);
        const startX = side < 0 ? -4 : W + 4; // enter from left or right edge
        a3CrewOffsets.push({
          cx: startX,
          tx,
          cy: Math.floor(H * 0.62) + 3,
          delay: 300 + i * 180,
        });
      }
    }
  }

  function updateAct3(dt) {
    a3T += dt;
    updateBanner(dt);
    // Animate robins walking in
    if (a3CrewOffsets && !a3Entering) {
      for (const c of a3CrewOffsets) {
        if (a3T > c.delay) {
          c.cx = Util.lerp(c.cx, c.tx, 0.07);
          if (!c.arrived && Math.abs(c.cx - c.tx) < 0.8) {
            c.arrived = true;
            burstGood(Math.round(c.tx), Math.floor(H * 0.62) + 3, a2Crew[a3CrewOffsets.indexOf(c)]?.col || C_TEAL, 6);
          }
        }
      }
    }
    if (a3Entering) {
      a3T += 0; // just keep ticking
      const sY = Math.floor(H * 0.62);
      const scx = Math.floor((W - STO_W) / 2);
      const dc = scx + Math.floor(STO_W / 2);
      // Move all crew toward door
      let allIn = true;
      for (const c of a3CrewOffsets) {
        c.cx = Util.lerp(c.cx, dc, 0.06);
        c.cy = Util.lerp(c.cy, sY - 2, 0.06);
        if (Math.abs(c.cx - dc) > 1 || Math.abs(c.cy - (sY - 2)) > 1) allIn = false;
      }
      // Move player toward door

      a3PlayerX = Util.lerp(a3PlayerX, dc, 0.15);
      a3PlayerY = Util.lerp(a3PlayerY || Math.floor(H * 0.62) + 3, sY - 2, 0.15);
      if (allIn && Math.abs(a3PlayerX - dc) < 1) {
        initInter(
          [
            {
              t: window.LANG.bannerGrabEverything,
              c: C_PLAYER,
              d: 2500,
            },
          ],
          initAct4,
          4,
        );
        return;
      }
    }
    if (clickPending) {
      clickPending = false;
      if (a3T > 1200) {
        a3Entering = true;
        const sY = Math.floor(H * 0.62);
        const scx = Math.floor((W - STO_W) / 2);
        const dc = scx + Math.floor(STO_W / 2);
        a3PlayerX = dc; // start from current player position
        bannerTimer = 0;
      }
    }
  }
  function renderAct3() {
    const sY = Math.floor(H * 0.62);
    for (let x = 0; x < W; x++) {
      grid.set(x, sY, "\u2550", "#444");
      grid.set(x, sY + 1, "\u2550", "#444");
    }
    /* No dots on ground */
    const sb = [
      "\u250C\u2500\u2500\u2500\u2500\u2510",
      "\u2502 [] \u2502",
      "\u2502    \u2502",
      "\u2502 [] \u2502",
      "\u2514\u2500\u2500\u2500\u2500\u2518",
    ];
    const scx = Math.floor((W - STO_W) / 2),
      stY = sY - STO_H;
    if (scx > 8) grid.art(sb, scx - 7, sY - sb.length, "#555");
    if (scx + STO_W + 8 < W) grid.art(sb, scx + STO_W + 1, sY - sb.length, "#555");
    // Render STORE row by row: structure in dim, label rows bright
    const storeFlash = Math.sin(Date.now() / 500) > 0;
    for (let ri = 0; ri < STORE.length; ri++) {
      const row = STORE[ri];
      // Heuristic: rows with letters A-Z are label rows
      const hasLetter = /[A-Za-z]/.test(row);
      const rowCol = hasLetter
        ? storeFlash
          ? "#fff"
          : C_ORANGE // label: white <-> orange
        : storeFlash
          ? C_PLAYER
          : "#a44"; // structure: orange <-> red
      for (let ci = 0; ci < row.length; ci++) {
        if (row[ci] !== " ") grid.set(scx + ci, stY + ri, row[ci], rowCol);
      }
    }
    const dc = scx + Math.floor(STO_W / 2),
      ly = sY + 3,
      rc = Math.min(a2CrewCount, 12);
    /* Player in middle — draw FIRST so robins don't overlap */
    const plX = a3Entering ? Math.round(a3PlayerX) : dc;
    const plY = a3Entering ? Math.round(a3PlayerY || ly) : ly;
    grid.art(A2_PA[Math.floor(a3T / 250) % 2], plX, plY, playerPulseColor(a3T)); // const plGlow = a3T < 3000 ? (Math.floor(a3T / 150) % 2 === 0 ? "#fff" : C_PLAYER) : C_PLAYER;
    // grid.art(A2_PA[Math.floor(a3T / 250) % 2], plX, plY + (a5P >= 3 ? -1 : 0), plGlow);
    /* Robins on either side — use their preserved art + color */
    const maxSlots = Math.max(1, Math.ceil(rc / 2));
    const spacing = Math.max(2, Math.floor((W / 2 - 3) / maxSlots));
    for (let i = 0; i < rc; i++) {
      const rx = a3CrewOffsets
        ? Math.round(a3CrewOffsets[i].cx)
        : (() => {
            const side = i % 2 === 0 ? -1 : 1;
            const slot = Math.floor((i + 2) / 2);
            return dc + side * slot * spacing;
          })();
      const crewArt = a2Crew[i] && a2Crew[i].art ? a2Crew[i].art : RA2;
      const crewCol = (a2Crew[i] && a2Crew[i].col) || C_TEAL;
      if (rx >= 0 && rx + 3 < W && ly + 3 < H) {
        const ry = a3Entering ? Math.round(a3CrewOffsets[i].cy) : ly + Math.round(Math.sin(Date.now() / 400 + i * 0.7) * 0.3);
        grid.art(crewArt, rx, ry, crewCol);
      }
    }
    if (a3T > 1500) grid.textCenter(window.LANG.tapToContinue, Math.min(H - 2, ly + 5), Math.sin(Date.now() / 300) > 0 ? C_PLAYER : C_DIM);
    renderBanner();
  }

  /* ══════════════════════════════════════════════════════════
               ACT 4: THE HEIST — side-scrolling grocery grab
               ══════════════════════════════════════════════════════════ */
  const FC = ["#b90", "#a86", "#8a6", "#ca8", "#a97", "#c66", C_DANGER, "#c70", "#48a"];
  const S4_BC_W = 20,
    S4_SLOT_W = 9,
    S4_BC_GAP = -1;
  const AH = 6;
  const SLH = 3;

  let s4WX, s4Sp, s4Ug, s4UR, s4GT, s4LM, s4IT;
  let s4As, s4Gs, s4Ex, s4PX2, s4PY2, s4St2;
  let s4Alys, s4GE, s4CM;
  let s4ExitPinned, s4ExitAisle, s4PlayerAisle;
  /* Combo system: consecutive grabs within window = multiplier */

  let s4GrabBursts, s4RobinCheerT;
  let s4TickerX, s4TickerMsg, s4TickerNextIdx;
  /* ── LAYOUT CONSTANTS (computed in init from H) ── */
  let S4_SHELF_ROWS /* how many shelf rows in the unit */,
    S4_SHELF_ROW_H /* height per shelf row (food art height + divider) */,
    S4_SHELF_TOP /* Y of top of shelving unit */,
    S4_SHELF_BOT /* Y of bottom of shelving unit */,
    S4_AISLE_TOP /* Y of top of aisle */,
    S4_AISLE_BOT /* Y of bottom of aisle */,
    S4_FLOOR_Y /* Y of the floor line */,
    S4_BAY_W; /* width of each shelf bay (visual column) */

  let s4ExitScreenX; /* exit is pinned to a screen position, not world */

  /* Items on shelves */
  let s4Items, s4Bookcases, s4RobinFloats;

  function s4GenBookcases(from, to) {
    const ns = Math.floor((S4_BC_W - 2) / S4_SLOT_W);
    let bx = s4Bookcases.length > 0 ? Math.max(from, s4Bookcases[s4Bookcases.length - 1].wx + S4_BC_W + S4_BC_GAP) : from;
    while (bx < to) {
      const items = [];
      for (let row = 0; row < S4_SHELF_ROWS; row++)
        for (let col = 0; col < ns; col++)
          items.push({
            row,
            col,
            food: Util.pick(FOODS),
            color: Util.pick(FC),
            grabbed: false,
          });
      s4Bookcases.push({
        wx: bx,
        items,
      });
      bx += S4_BC_W + S4_BC_GAP;
    }
    s4GE = to;
  }

  function initAct4() {
    audio.play("level");
    Music.transition("music_act5"); // heist music
    audio.preload(["music_act6"]);

    phase = "act4";
    ensureCrew();
    bannerTimer = 0;
    tmr.clear();
    dialogStack = [];
    s4WX = 0;
    s4Sp = 0.006;
    s4Ug = 0;
    s4UR = Math.max(0.005, 0.015 - a2CrewCount * 0.0004);
    s4GT = 0;
    s4LM = -1;
    s4IT = 0;
    s4St2 = 0;
    s4CM = [];
    s4RobinFloats = [];
    state.reset({ score: 0 });
    s4AlyScore = 0;
    s4ExitPinned = false;
    s4ExitScreenX = W - 8; /* pinned to right side of screen */
    s4GrabBursts = []; /* per-grab starburst effects */
    s4RobinCheerT = 4000; /* countdown to next robin cheer */

    /* ── Compute layout from screen height ──
                         Top of screen: shelving unit (~60% of H)
                         Below that: aisle (~25% of H, min 5 rows)
                         Bottom: floor line + exit row */
    const aisleH = Math.max(5, Math.floor(H * 0.22));
    S4_FLOOR_Y = H - 2;
    S4_AISLE_BOT = S4_FLOOR_Y - 1;
    S4_AISLE_TOP = S4_AISLE_BOT - aisleH + 1;
    S4_SHELF_BOT = S4_AISLE_TOP - 1; /* bottom border of shelving unit */
    S4_SHELF_TOP = 1;

    /* Shelf rows: each row is 4 chars tall (3 food + 1 divider) */
    S4_SHELF_ROW_H = 5;
    const shelfInner = S4_SHELF_BOT - S4_SHELF_TOP - 1;
    S4_SHELF_ROWS = Math.max(2, Math.floor(shelfInner / S4_SHELF_ROW_H));

    /* ── Generate initial bookcases ── */
    s4Items = [];
    s4Bookcases = [];
    s4GE = 0;
    s4GenBookcases(0, W + 80);

    /* ── Player starts left-center of aisle ── */
    s4PX2 = Math.floor(W * 0.35);
    s4PY2 = Math.floor((S4_AISLE_TOP + S4_AISLE_BOT) / 2);
    s4PlayerAisle = 0;

    /* ── Security guards — spawn ahead off-screen ── */
    s4Gs = [];
    const numG = Math.max(1, 3 - Math.floor(a2CrewCount * 0.3));
    for (let i = 0; i < numG; i++) {
      s4Gs.push({
        wx: s4WX + W + Util.randInt(20, 60),
        wy: Util.randInt(S4_AISLE_TOP + 1, S4_AISLE_BOT - 1),
        vx: -0.004 - Math.random() * 0.004,
      });
    }

    /* ── Ally robins — trail behind player in the aisle ── */
    s4Alys = [];
    const ac = Math.min(a2CrewCount - 1, 6);
    for (let i = 0; i < ac; i++) {
      s4Alys.push({
        behindDist: 5 + i * 4,
        oy: Util.randInt(-2, 2),
        bobPhase: Math.random() * 6,
        grabCD: 0,
      });
    }

    /* Robin grab timer — fires frequently, grabs real or imaginary items */
    tmr.every(500 + Math.random() * 600, () => {
      if (s4Alys.length === 0) return;
      /* Only grab if enough robins */
      if (Math.random() > 0.3 + s4Alys.length * 0.1) return;
      const robinWX = s4WX + s4PX2 - 8;
      /* 40% chance: invent an offscreen item */
      if (Math.random() < 0.4) {
        const food = Util.pick(FOODS);
        s4AlyScore += food.p;
        s4RobinFloats.push({
          text: "+$" + food.p,
          x: Math.round(s4PX2 - Util.randInt(4, 10)),
          y: S4_AISLE_TOP - 1,
          life: 1200,
          max: 1200,
          col: C_TEAL,
        });
        return;
      }
      /* Otherwise find a real ungrabbed item in a wide radius */
      let best = null,
        bestD = 999,
        bestWX = 0;
      for (const bc of s4Bookcases) {
        for (const it of bc.items) {
          if (it.grabbed) continue;
          const itWX = bc.wx + 1 + it.col * S4_SLOT_W;
          const d = Math.abs(itWX - robinWX);
          if (d < 60 && d < bestD) {
            bestD = d;
            best = it;
            bestWX = itWX;
          }
        }
      }
      if (best) {
        best.grabbed = true;
        s4AlyScore += best.food.p;
        s4RobinFloats.push({
          text: "+$" + best.food.p,
          x: Math.round(bestWX - s4WX),
          y: S4_AISLE_TOP - 1,
          life: 1200,
          max: 1200,
          col: C_TEAL,
        });
      }
    });

    // findme
    /* ── Remaining state ── */
    // s4Ex = [];
    // s4ExitPinned = false;
    // s4ExitScreenX = W - 8; /* pinned to right side of screen */
    // s4ExitAisle = -1;

    s4As = [
      {
        y: S4_AISLE_TOP,
        items: [],
        isExit: false,
        aisleH: S4_AISLE_BOT - S4_AISLE_TOP,
      },
    ];
    s4GE = 0;

    hudLabel.textContent = window.LANG.hudHaulLabel;
    hudScore.textContent = "$0";
    hudScore.style.color = C_PLAYER;
    hudStatus.textContent = window.LANG.hudAct4Status;
    hudStatus.style.color = C_TEAL;
    // showBanner(window.LANG.bannerGrabEverything, C_PLAYER, 2500);

    s4TickerMsg = D_INTERCOM_TICKER[0];
    s4TickerX = W; // starts off right edge
    s4TickerNextIdx = 1;
  }

  const SU = [
    {
      a: 0.15,
      h: window.LANG.urgencyCopsCalled,
      c: "#a80",
    },
    {
      a: 0.35,
      h: window.LANG.urgencyHurry,
      c: C_WARN,
    },
    {
      a: 0.55,
      h: window.LANG.urgencyClose,
      c: "#c60",
    },
    {
      a: 0.75,
      h: window.LANG.urgencyGetOut,
      c: C_DANGER,
    },
    {
      a: 0.9,
      h: window.LANG.urgencyLastChance,
      c: "#a00",
    },
    {
      a: 1,
      h: window.LANG.urgencyTooLate,
      c: "#800",
    },
  ];

  function updateAct4(dt) {
    tmr.update(dt);
    s4GT += dt / 1000;
    // Shorten from ~50s to ~30s
    s4Ug = Math.min(1, s4Ug + (s4UR * 1.6 * dt) / 1000);
    s4Sp = 0.006 + s4Ug * 0.008;
    updateBanner(dt);

    /* Urgency stages */
    for (let i = SU.length - 1; i >= 0; i--)
      if (s4Ug >= SU[i].a && i > s4LM) {
        if (SU[i].a >= 0.35) showBanner(SU[i].h, SU[i].c, 2000);
        if (SU[i].a === 0.55) audio.play("urgent");
        s4LM = i;
      }
    if (s4Ug >= 1) {
      endGame("caught");
      return;
    }

    /* Exit appears after 8 seconds */
    if (!s4ExitPinned && s4GT > 6) {
      s4ExitPinned = true;
      audio.play("exit");
      showBanner(window.LANG.bannerExitOpen, C_TEAL, 3000);
    }

    /* Intercom */
    // s4IT += dt;
    // if (s4IT > 20000 && s4Ug > 0.1) {
    //   s4IT = 0;
    //   showBanner(Util.pick(D_INTERCOM), C_DANGER, 2000, true);
    // }

    /* Robin floats */
    for (let i = s4RobinFloats.length - 1; i >= 0; i--) {
      s4RobinFloats[i].life -= dt;
      s4RobinFloats[i].y -= 0.002 * dt;
      if (s4RobinFloats[i].life <= 0) s4RobinFloats.splice(i, 1);
    }
    /* Grab bursts */
    for (let i = s4GrabBursts.length - 1; i >= 0; i--) {
      s4GrabBursts[i].t -= dt;
      if (s4GrabBursts[i].t <= 0) s4GrabBursts.splice(i, 1);
    }

    /* ── Auto-scroll — endless ── */
    s4WX += s4Sp * dt;
    while (s4GE < s4WX + W + 80) s4GenBookcases(s4GE, s4GE + 80);
    s4Bookcases = s4Bookcases.filter((bc) => bc.wx + S4_BC_W > s4WX - 20);

    /* ── Player movement — up/down only + click to move ── */
    if (s4St2 > 0) s4St2 -= dt;
    if (s4St2 <= 0) {
      if (input.isDown("up")) s4PY2 -= 0.02 * dt;
      if (input.isDown("down")) s4PY2 += 0.02 * dt;
    }

    /* ── Click handling ── */
    if (clickPending && phase === "act4") {
      clickPending = false;

      /* Check if clicking on a food item in a bookcase */
      let grabbedItem = false;
      outer4: for (const bc of s4Bookcases) {
        const bsx = Math.round(bc.wx - s4WX);
        if (bsx + S4_BC_W < 0 || bsx > W) continue;
        for (const it of bc.items) {
          if (it.grabbed) continue;
          const ix = bsx + 1 + it.col * S4_SLOT_W + 1;
          const rY = S4_SHELF_TOP + 1 + it.row * S4_SHELF_ROW_H;
          const sY = rY + S4_SHELF_ROW_H - 1;
          const aY = sY - it.food.a.length;
          if (clickSX >= ix - 1 && clickSX < ix + S4_SLOT_W && clickSY >= aY && clickSY < sY) {
            it.grabbed = true;
            audio.play("grab");
            state.set("score", state.get("score") + it.food.p);
            burstGood(ix + Math.floor(S4_SLOT_W / 2), aY, it.color, 9);
            s4GrabBursts.push({
              x: ix + Math.floor(S4_SLOT_W / 2),
              y: aY + 1,
              t: 400,
              max: 400,
              col: it.color,
            });
            addFloat(it.food.n + " +$" + it.food.p, 0, 0, it.color);
            grabbedItem = true;
            break outer4;
          }
        }
      }
      if (!grabbedItem && clickSY >= S4_AISLE_TOP && clickSY <= S4_FLOOR_Y) {
        /* Click in aisle area — move player vertically toward click */
        if (clickSY < s4PY2 - 1) s4PY2 -= 2;
        else if (clickSY > s4PY2 + 1) s4PY2 += 2;
        /* Check if clicking the EXIT */
        if (s4ExitPinned) {
          if (Math.abs(clickSX - s4ExitScreenX) < 8 && clickSY >= S4_FLOOR_Y - 2) {
            endGame("escaped");
            return;
          }
        }
      }
    }

    /* Clamp player to aisle */
    s4PY2 = Util.clamp(s4PY2, S4_AISLE_TOP, S4_AISLE_BOT - 1);

    /* ── Guard movement + collision ── */
    const worldPX = s4WX + s4PX2;
    for (let i = s4Gs.length - 1; i >= 0; i--) {
      const g = s4Gs[i];
      g.wx += g.vx * dt;
      /* Guards scroll with the world but also move on their own */
      const gsx = Math.round(g.wx - s4WX);
      if (gsx < -10) {
        s4Gs.splice(i, 1);
        continue;
      }
      if (s4St2 <= 0 && Math.abs(g.wx - worldPX) < 2 && Math.abs(g.wy - s4PY2) < 2) {
        audio.play("bump");
        audio.play("security");
        spark(Math.round(s4PX2), Math.round(s4PY2), C_DANGER, 10);
        triggerChromatic(380);
        state.set("score", Math.max(0, state.get("score") - 20));
        s4St2 = 800;
        showBanner(window.LANG.bannerSecurityGrabbed, C_DANGER, 1000, true);
      }
    }
    /* Spawn new guards periodically */
    if (Math.random() < 0.0003 * dt && s4Ug > 0.15) {
      s4Gs.push({
        wx: s4WX + W + 5,
        wy: Util.randInt(S4_AISLE_TOP + 1, S4_AISLE_BOT - 1),
        vx: -0.006 - Math.random() * 0.004,
      });
    }

    // Scroll ticker -- slow it down
    s4TickerX -= 0.01 * dt;
    if (s4TickerX + s4TickerMsg.length < 0) {
      s4TickerMsg = D_INTERCOM_TICKER[s4TickerNextIdx % D_INTERCOM_TICKER.length];
      s4TickerNextIdx++;
      s4TickerX = W + 2;
    }

    /* ── HUD ── */
    const my = state.get("score");
    hudLabel.textContent = window.LANG.hudHaulLabel;
    hudScore.textContent = "$" + (my + s4AlyScore);
    hudStatus.textContent = window.LANG.hudAct4Haul(my, s4AlyScore);
    hudStatus.style.color = s4Ug < 0.35 ? C_TEAL : s4Ug < 0.7 ? C_WARN : C_DANGER;
  }
  function renderAct4() {
    const ox = Math.floor(s4WX);
    /* ── BOOKCASES — discrete units scrolling with world ── */
    for (const bc of s4Bookcases) {
      const sx = Math.round(bc.wx - s4WX);
      if (sx + S4_BC_W < -1 || sx > W + 1) continue;
      const iW = S4_BC_W - 2;
      grid.text("\u2554" + "\u2550".repeat(iW) + "\u2557", sx, S4_SHELF_TOP, C_DIM);
      for (let row = 0; row < S4_SHELF_ROWS; row++) {
        const rY = S4_SHELF_TOP + 1 + row * S4_SHELF_ROW_H;
        const sY = rY + S4_SHELF_ROW_H - 1;
        const ns = Math.floor(iW / S4_SLOT_W);
        for (let y = rY; y < sY; y++) {
          if (sx >= 0 && sx < W) grid.set(sx, y, "\u2551", "#666");
          if (sx + S4_BC_W - 1 >= 0 && sx + S4_BC_W - 1 < W) grid.set(sx + S4_BC_W - 1, y, "\u2551", "#666");
          for (let c = 1; c < ns; c++) {
            const dvx = sx + 1 + c * S4_SLOT_W;
            if (dvx >= 0 && dvx < W) grid.set(dvx, y, "\u2502", "#333");
          }
        }
        for (const it of bc.items) {
          if (it.row !== row || it.grabbed) continue;
          const ix = sx + 1 + it.col * S4_SLOT_W + 1;
          const aH = it.food.a.length;
          grid.art(it.food.a, ix, sY - aH, it.color);
        }
        const sym = row < S4_SHELF_ROWS - 1 ? "\u2560" + "\u2550".repeat(iW) + "\u2563" : "\u255a" + "\u2550".repeat(iW) + "\u255d";
        grid.text(sym, sx, sY, "#666");
      }
    }

    /* ── AISLE — floor tiles scroll with world ── */
    // for (let y = S4_AISLE_TOP; y <= S4_AISLE_BOT; y++) {
    //   for (let x = 0; x < W; x++) {
    //     const wx = x + ox;
    //     if (wx % 4 === 0) grid.set(x, y, "\u2502", "#1a1a1a");
    //   }
    // }

    /* ── Security guards ── */
    for (const g of s4Gs) {
      const sx = Math.round(g.wx - s4WX),
        sy = Math.round(g.wy);
      if (sx < -3 || sx > W + 3) continue;
      grid.art(["[S]", "/!\\"], sx, sy, C_DANGER);
    }

    /* ── Robins trailing behind player — spread out, organic ── */
    for (let i = 0; i < s4Alys.length; i++) {
      const al = s4Alys[i];
      /* Wider spacing so individual robins read clearly */
      const baseDist = 5 + i * 4;
      /* Independent x-drift per robin */
      const xDrift = Math.sin(s4GT * 1.5 + al.bobPhase * 1.3) * 1.2;
      const rx = Math.round(s4PX2 - baseDist + xDrift);
      /* More varied y-offset — each robin finds its own lane */
      const yBase = al.oy * 1.5;
      const yBob = Math.sin(s4GT * 2.5 + al.bobPhase) * 0.8;
      const ry = Math.round(s4PY2 + yBase + yBob);
      if (rx >= 0 && rx < W && ry >= S4_AISLE_TOP && ry <= S4_AISLE_BOT) {
        const src = a2Crew[i];
        const rArt = (src && src.art) || A2_ROB;
        const rCol = (src && src.col) || C_TEAL;
        grid.art(rArt, rx, ry, rCol);
      }
    }

    /* ── Robin grab floats ── */
    for (const f of s4RobinFloats) {
      if (f.life < 100) continue;
      for (let i = 0; i < f.text.length; i++) {
        const fx = Math.round(f.x) + i,
          fy = Math.round(f.y);
        if (fx >= 0 && fx < W && fy >= 0 && fy < H) grid.set(fx, fy, f.text[i], f.col);
      }
    }

    /* ── Player ── */
    if (s4St2 <= 0 || Math.floor(s4St2 / 80) % 2 === 0) {
      // Keep urgency flash when heat is high, otherwise use normal pulse
      let pc = s4Ug > 0.7 ? (Math.floor(Date.now() / 200) % 2 ? C_WARN : C_PLAYER) : playerPulseColor(s4GT * 1000);
      grid.art(A2_PA[Math.floor(s4GT * 4) % 2], Math.round(s4PX2), Math.round(s4PY2), pc);
    }

    /* ── Floor line ── */
    for (let x = 0; x < W; x++) {
      grid.set(x, S4_FLOOR_Y, "\u2550", "#444");
    }

    /* ── EXIT — pinned to bottom-right of screen ── */
    if (s4ExitPinned) {
      const exSX = s4ExitScreenX;
      const fl = Math.sin(Date.now() / 300) > 0 ? C_TEAL : "#3a9a8a";
      /* Door gap in floor line */
      for (let x = exSX - 7; x <= exSX + 7; x++) {
        if (x >= 0 && x < W) grid.set(x, S4_FLOOR_Y, " ", null);
      }
      // if (exSX - 8 >= 0) grid.set(exSX - 8, S4_FLOOR_Y, "\u2551", C_DANGER);
      if (exSX + 8 < W) grid.set(exSX + 8, S4_FLOOR_Y, "\u2551", C_DANGER);
      const _ef = Math.sin(Date.now() / 220) > 0;
      grid.text("[ >> EXIT >> ]", Util.clamp(exSX - 7, 0, W - 14), S4_FLOOR_Y, _ef ? "#fff" : "#e60008");
      // if (S4_FLOOR_Y - 1 >= 0) grid.text("EXIT ↓", Util.clamp(exSX - 2, 0, W - 6), S4_FLOOR_Y - 1, C_TEAL);
    }

    /* ── Urgency border flash ── */
    if (s4Ug > 0.5) {
      const bc = Math.floor(Date.now() / 300) % 2 ? C_DANGER : "#a00";
      for (let x = 0; x < W; x++) grid.set(x, 0, "\u2550", bc);
      for (let y = 0; y < H; y++) {
        grid.set(0, y, "\u2551", bc);
        grid.set(W - 1, y, "\u2551", bc);
      }
      grid.textCenter([window.LANG.urgencyCopsEnRoute, window.LANG.urgencyFindExit][Math.floor(Date.now() / 800) % 2], 0, C_DANGER);
    }

    // Intercom ticker — one row above the bookcase top
    const tickerY = S4_SHELF_TOP - 1;
    if (tickerY >= 0) {
      // Clear the row first
      for (let x = 0; x < W; x++) grid.set(x, tickerY, " ", null);
      // Draw scrolling text
      const tx = Math.round(s4TickerX);
      const tickerColor = s4Ug > 0.5 ? C_DANGER : "#6a8a9a";
      for (let i = 0; i < s4TickerMsg.length; i++) {
        const cx = tx + i;
        if (cx >= 0 && cx < W) grid.set(cx, tickerY, s4TickerMsg[i], tickerColor);
      }
      // Left label
      if (tickerY >= 0) grid.text("", 0, tickerY, "#555"); // fallback: use ">>" if emoji breaks
    }

    renderBanner();
  }
  /* ══════════════════════════════════════════════════════════
               ACT 5: THE DROP-OFF — community fridge
               ══════════════════════════════════════════════════════════ */

  let FRIDGE = window.LANG === window.LANG_FR ? window.GAME_DATA.fridgeArtFR : window.GAME_DATA.fridgeArtEN;

  function initAct5() {
    audio.play("level");
    Music.transition("music_act6"); // drop-off, warmth
    audio.preload(["music_act7"]);
    phase = "act5";
    ensureCrew();
    a5T = 0;
    a5P = 0;
    a5NI = 0;
    a5FoodPlacements = null;
    bannerTimer = 0;
    dialogStack = [];
    hudLabel.textContent = "";
    hudScore.textContent = "";
    hudStatus.textContent = "";
    a5Crew = [];
    const rc = Math.min(a2CrewCount, 8);
    // Fridge higher
    const fridgeW = FRIDGE[0].length;
    const fx = Math.floor((W - fridgeW) / 2);
    const fy = Math.floor(H / 2) - 10;
    const lineY = fy + FRIDGE.length + 1;
    const totalSlots = rc + 1; // crew + player
    const playerSlot = Math.floor(totalSlots / 2);
    const lineStartX = Math.floor(W / 2) - Math.floor((totalSlots * 3) / 2);
    let crewIdx = 0;
    for (let slot = 0; slot < totalSlots; slot++) {
      if (slot === playerSlot) continue; // player slot, handled in render
      const targetX = lineStartX + slot * 3;
      // Store crew art/col directly on a5Crew elements
      const cs = a2Crew[crewIdx] || {};
      a5Crew.push({
        x: crewIdx % 2 === 0 ? -3 - crewIdx * 5 : W + 3 + crewIdx * 5,
        y: lineY,
        tx: Util.clamp(targetX, 2, W - 5),
        ty: lineY,
        arrived: false,
        item: Util.pick(window.LANG.crewItems),
        art: cs.art,
        col: cs.col,
      });
      crewIdx++;
    }
    // Store player X for render
    a5Crew._playerX = Util.clamp(lineStartX + playerSlot * 3, 2, W - 5);
    a5Crew._playerY = lineY;
    // Neighbours arrive after food is placed — centred around the fridge
    const shuffled = Util.shuffle(END_NAMES.slice());
    a5Neighbours = [];
    const fridgeWidth = FRIDGE[0].length;
    const fridgeCX = Math.floor(W / 2);
    const numNeighbours = Math.min(4, shuffled.length);
    for (let i = 0; i < numNeighbours; i++) {
      const nm = shuffled[i];
      const fromRight = i % 2 === 0;
      const nx = fromRight ? W + 3 + i * 6 : -3 - i * 6;
      const ty = lineY + 4 + Math.floor(i / 2);
      /* Symmetrically distribute around fridge center */
      const pairIdx = Math.floor(i / 2); /* 0,0,1,1 */
      const side = fromRight ? 1 : -1;
      // Neighbours: mobile-safe positioning + pre-assign colour -- no good because it changes the neighbour position on desktop too
      // const offset = Math.min(3 + pairIdx * 3, Math.floor(W * 0.2));
      // const tx = fridgeCX + side * offset;
      // const nCol = window.GAME_DATA.npcColors[(i + 3) % window.GAME_DATA.npcColors.length];
      // a5Neighbours.push({
      //   x: nx,
      //   y: ty,
      //   tx: Util.clamp(tx, 6, W - 10),
      //   ty,
      //   name: nm.n,
      //   col: nCol,
      //   msg: Util.pick(["merci", "my kids eat tonight", "finally", "love!", "merci beaucoup", "thank you"]),
      //   arrived: false,
      //   msgShow: false,
      // });

      const offset = Math.floor(fridgeWidth / 2) + 2 + pairIdx * 4;
      const tx = fridgeCX + side * offset;
      a5Neighbours.push({
        x: nx,
        y: ty,
        tx: Util.clamp(tx, 2, W - 6),
        ty,
        name: nm.n,
        msg: Util.pick(window.LANG.neighbourMsgs),
        arrived: false,
        msgShow: false,
        col: window.GAME_DATA.npcColors[(i + 3) % window.GAME_DATA.npcColors.length],
        art: window.GAME_DATA.npcArts[i % window.GAME_DATA.npcArts.length],
      });
    }
  }
  function updateAct5(dt) {
    a5T += dt;
    updateBanner(dt);
    dialogUpdate(dt);
    if (a5P === 0) {
      let allArrived = true;
      for (const c of a5Crew) {
        if (typeof c === "object" && !c.arrived) {
          c.x = Util.lerp(c.x, c.tx, 0.04);
          if (Math.abs(c.x - c.tx) < 0.5) {
            c.x = c.tx;
            c.arrived = true;
          } else allArrived = false;
        }
      }
      if (allArrived && a5T > 1500) {
        // showBanner(window.LANG.bannerShareBounty, "#d4a030  ", 3000);
        a5P = 1;
        a5T = 0;
      }
    }
    // r  rigger the food drop earlier
    if (a5P === 1 && a5T > 1200) a5P = 2;
    if (clickPending && a5P === 2) {
      clickPending = false;
      audio.play("drop");
      a5P = 3;
      const _fw = FRIDGE[0].length,
        _fx = Math.floor((W - _fw) / 2),
        _fy = Math.floor(H / 2) - 7;
      for (let _i = 0; _i < 6; _i++) burstGood(_fx + Math.floor(Math.random() * _fw), _fy + Math.floor(Math.random() * FRIDGE.length), C_TEAL, 7);
      triggerFlashGood();
      a5T = 0;
      showBanner(window.LANG.bannerFoodGloriousFood, C_SUCCESS, 2000);
    }
    if (a5P === 3 && a5T > 4000) {
      // longer to let the full fill animation play
      a5P = 4;
      a5T = 0;
    }
    if (a5P === 4) {
      let allArrived = true;
      for (const nb of a5Neighbours) {
        if (!nb.arrived) {
          nb.x = Util.lerp(nb.x, nb.tx, 0.018);
          if (Math.abs(nb.x - nb.tx) < 0.5) {
            nb.x = nb.tx;
            nb.arrived = true;
            nb.msgShow = true;
            dialogPush(nb.msg, nb.col || C_TEAL, "center", Math.round(nb.tx), nb.ty - 2, 6000);
          } else allArrived = false;
        }
      }
      if (allArrived && a5T > 7000 && clickPending) {
        clickPending = false;
        a5P = 5;
        a5T = 0;
      }
    }
    if (a5P === 5 && a5T > 2000) initEnd();
  }
  function renderAct5() {
    // Fridge higher
    const fridgeW = FRIDGE[0].length;
    const fx = Math.floor((W - fridgeW) / 2),
      fy = Math.floor(H / 2) - 10;
    grid.art(FRIDGE, fx, fy, C_TEAL);
    let crewDrawIdx = 0;
    for (const c of a5Crew) {
      if (typeof c !== "object" || c._playerX !== undefined) continue;
      const cx = Math.round(c.x);
      if (cx >= -2 && cx < W + 2) {
        const crewArt = c.art || (a2Crew[crewDrawIdx] && a2Crew[crewDrawIdx].art) || A2_NPC_ARTS[crewDrawIdx % A2_NPC_ARTS.length];
        const crewCol = c.col || (a2Crew[crewDrawIdx] && a2Crew[crewDrawIdx].col) || A2_NPC_COLORS[crewDrawIdx % A2_NPC_COLORS.length];
        grid.art(crewArt, cx, c.ty + (a5P >= 3 ? -1 : 0), crewCol);
      }
      crewDrawIdx++;
    }
    const plX = a5Crew._playerX || Math.floor(W / 2);
    const plY = a5Crew._playerY || fy + FRIDGE.length + 1;
    grid.art(A2_PA[Math.floor(a5T / 250) % 2], plX, plY + (a5P >= 3 ? -1 : 0), playerPulseColor(a5T));

    // Tap prompt
    if (a5P === 2) grid.textCenter(window.LANG.promptTapToPlaceFood, plY + 4, Math.sin(Date.now() / 300) > 0 ? C_TEAL : C_DIM);
    // Food appearing in fridge — real food art reused from Act 4
    if (a5P >= 3) {
      /* New fridge layout (width 37, height 18):
                           Rows 0-3 = header + divider
                           Rows 4-8 = top shelf (interior rows 4,5,6,7,8)
                           Row 9 = divider
                           Rows 10-14 = bottom shelf
                           Row 15-17 = divider + footer + border
                           4 slots per shelf. */
      if (!a5FoodPlacements) {
        a5FoodPlacements = [];

        const numToPlace = 8; // always fill both shelves regardless of crew count

        for (let i = 0; i < numToPlace; i++)
          a5FoodPlacements.push({
            food: Util.pick(FOODS),
            col: Util.pick(FC),
          });
      }
      let showCount;
      if (a5P === 3) {
        if (a5T < 2400) {
          showCount = Math.min(a5FoodPlacements.length, Math.floor(a5T / 300));
        } else {
          // Fast second pass — flash all items in
          showCount = a5FoodPlacements.length;
        }
      } else {
        showCount = a5FoodPlacements.length;
      }

      const slotsPerShelf = 4;
      const shelfInnerW = fridgeW - 2;
      const slotW = Math.floor(shelfInnerW / slotsPerShelf);
      for (let i = 0; i < showCount; i++) {
        const fp = a5FoodPlacements[i];
        const shelf = Math.floor(i / slotsPerShelf);
        const slotCol = i % slotsPerShelf;
        if (shelf > 1) break;
        const ix = fx + 1 + slotCol * slotW + Math.floor((slotW - 7) / 2);
        const shelfBot = shelf === 0 ? fy + 8 : fy + 14;
        const artH = fp.food.a.length;
        const iy = shelfBot - artH + 1;
        // console.log("I get an error here that food is not defined");
        for (let r = 0; r < artH; r++) {
          const line = fp.food.a[r].substring(0, slotW - 1);
          grid.text(line, ix, iy + r, FC[i % FC.length]);
        }
      }
    }
    // Neighbours — use NPC art pool for visual variety, preserve color
    if (a5P >= 4) {
      for (let i = 0; i < a5Neighbours.length; i++) {
        const nb = a5Neighbours[i];
        const nx = Math.round(nb.x);
        if (nx >= -2 && nx < W + 2) {
          if (!nb.art) nb.art = window.GAME_DATA.npcArts[i % window.GAME_DATA.npcArts.length];
          grid.art(nb.art, nx, nb.ty, nb.col || C_TEAL);
          if (nb.arrived) {
            grid.text(nb.name, Util.clamp(nx - 1, 0, W - nb.name.length), nb.ty - 1, nb.col || C_TEAL);
          }
        }
      }
    }
    if (a5P === 4 && a5Neighbours.length > 0 && a5Neighbours.every((nb) => nb.arrived) && a5T > 6000)
      grid.textCenter(window.LANG.tapToEnter, H - 2, Math.sin(Date.now() / 400) > 0 ? C_DIM : "#666");
    dialogRender();
    renderBanner();
  }

  /* ══════════════════════════════════════════════════════════
               act 6 END SCREEN — collective-focused
               ══════════════════════════════════════════════════════════ */

  let endT,
    endD = {};
  let END_NAMES = window.LANG.endNames;

  function initEnd() {
    Music.transition("music_act7"); // drop-off, warmth
    audio.preload(["music_act8"]);
    phase = "end";

    endT = 0;
    bannerTimer = 0;
    dialogStack = [];
    const my = state.get("score") || 0,
      tot = my + s4AlyScore;

    const VIG_TEMPLATES = window.LANG.vigTemplates;

    const vig = [];
    const shuffled = Util.shuffle(END_NAMES);
    const templates = Util.shuffle(VIG_TEMPLATES.slice());
    for (let i = 0; i < Math.min(4, a2CrewCount); i++) vig.push(templates[i % templates.length](shuffled[i % shuffled.length]));
    const fed = Math.max(20, a2CrewCount * 12 + Math.floor(tot / 6));
    endD = {
      tot,
      my,
      as: s4AlyScore,
      crew: a2CrewCount,
      vig,
      fed,
    };

    // Build flat timed line list — positions computed at render time for stability
    let t = 0;
    const GAP = 950;
    endD.lines = [];
    endD.lines.push({
      t,
      text: window.LANG.endCrewBrought(tot),
      col: C_DANGER,
    });
    t += GAP;
    endD.lines.push({
      t,
      text: window.LANG.endYouCarried(my || 0),
      col: "#bbb",
    });
    t += GAP + 400;
    for (let i = 0; i < vig.length; i++) {
      endD.lines.push({
        t,
        text: vig[i],
        col: C_DIM,
      });
      t += GAP;
    }
    t += 400;
    endD.lines.push({
      t,
      text: window.LANG.endPeopleAte(fed || 68),
      col: C_SUCCESS,
    });
    t += 1100;
    endD.lines.push({
      t,
      text: window.LANG.endYouAte,
      col: "#bbb",
      extraGap: 1,
    });
    endD.doneT = t + 1600;
  }

  function updateEnd(dt) {
    endT += dt;
    updateBanner(dt);
    if (clickPending && endT > (endD.doneT || 9999)) {
      clickPending = false;
      initCTA();
    }
  }

  function renderEnd() {
    const lines = endD.lines || [];
    function wrap(text) {
      const words = text.split(" "),
        ls = [];
      let cur = "";
      for (const w of words) {
        if (cur.length + w.length + 1 > W - 4) {
          ls.push(cur);
          cur = w;
        } else cur = cur ? cur + " " + w : w;
      }
      if (cur) ls.push(cur);
      return ls;
    }
    // Pre-compute all wrapped heights for stable centering
    const wrapped = lines.map((l) => wrap(l.text));
    const totalH = wrapped.reduce((sum, ls, i) => sum + ls.length + (lines[i].extraGap || 0), 0) + lines.length - 1;
    let y = Math.max(2, Math.floor((H - totalH) / 2));
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (endT >= l.t) wrapped[i].forEach((ln, j) => grid.textCenter(ln, y + j, l.col));
      y += wrapped[i].length + 1 + (l.extraGap || 0);
    }
    if (endT >= (endD.doneT || 9999)) grid.textCenter(window.LANG.promptTap, H - 3, Math.sin(Date.now() / 400) > 0 ? C_DIM : "#bbb");
    renderBanner();
  }

  /* ══════════════════════════════════════════════════════════
                       CTA: This really happened. Post-game epilogue.
                       ══════════════════════════════════════════════════════════ */
  let ctaT, ctaDone, ctaChoice, ctaEndLine, ctaEndCol;
  function initCTA() {
    Music.transition("music_act8"); // drop-off, warmth
    phase = "cta";

    ctaT = 0;
    ctaDone = false;
    ctaChoice = null;
    ctaEndLine = "";
    ctaEndCol = C_DIM;

    bannerTimer = 0;
    dialogStack = [];
    hudLabel.textContent = "";
    hudScore.textContent = "";
    hudStatus.textContent = "";
  }

  function updateCTA(dt) {
    ctaT += dt;
    const endAt = 999999;
    const canTap = ctaT > 14000;

    if (ctaT > 12500 && !ctaChoice) {
      if (!convVisible) {
        convReset();
        convAnchorY = Math.floor(H * 0.75);
        convAnchorPX = Math.floor(W / 2);
        convAnchorNX = Math.floor(W / 2);
        convVisible = true;
        convShowChoices(["yes — tell me how", "maybe someday"]);
      }
      if (clickPending && convChoiceY2 > 0 && clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
        clickPending = false;
        ctaChoice = clickSY < Math.floor((convChoiceY1 + convChoiceY2) / 2) ? "yes" : "maybe";
        convStartFade();
        if (ctaChoice === "yes") {
          burstGood(Math.floor(W / 2), Math.floor(H / 2), C_TEAL, 16);
          triggerFlashGood();
          ctaEndLine = "then it starts with you.";
          ctaEndCol = C_TEAL;
        } else {
          ctaEndLine = "the neighbourhood will wait.";
          ctaEndCol = C_DIM;
        }
      }
    }

    if (!ctaDone && (ctaT > endAt || (clickPending && canTap))) {
      clickPending = false;
      ctaDone = true;
      Music.stop();
      phase = "done";
      loop.stop();
      overlay.classList.remove("hidden");
      ovTitle.textContent = "ROBINS DES RUELLES";
      ovTitle.style.color = C_PLAYER;
      ovSub.innerHTML = "The neighbourhood remembers.<br><br>Will you join them?";
      ovHint.textContent = "";
      startBtn.textContent = "PLAY AGAIN";
      overlay.querySelectorAll(".final").forEach((e) => e.remove());
      overlay.querySelectorAll(".give-up-btn").forEach((e) => e.remove());
      startBtn.onclick = () => {
        hasPlayed = false;
        startGame();
        startBtn.onclick = null;
      };
    }
  }

  function renderCTA() {
    const _hcOrig = HC.splice(0, HC.length, ...HC_CTA);
    renderCity(ctaT * 0.004, 0);
    HC.splice(0, HC.length, ..._hcOrig);

    const CTA_STORY = window.LANG.ctaStory.map((s, i) => ({
      ...s,
      col: [C_PLAYER, C_TEAL, C_DANGER, "#4dbb88", C_MID, "#e06060", C_MID, C_DIM, C_PLAYER, C_MID, C_ORANGE][i],
      ...(i === 8
        ? {
            flash: true,
          }
        : {}),
      ...(i === 4 || i === 6 || i === 9
        ? {
            extraGap: 1,
          }
        : {}),
    }));

    function wrap(text) {
      if (!text) return [""];
      const words = text.split(" "),
        ls = [];
      let cur = "";
      for (const w of words) {
        if (cur.length + w.length + 1 > W - 6) {
          ls.push(cur);
          cur = w;
        } else cur = cur ? cur + " " + w : w;
      }
      if (cur) ls.push(cur);
      return ls;
    }

    const wrapped = CTA_STORY.map((l) => wrap(l.text));
    const totalH = wrapped.reduce((sum, ls, i) => sum + ls.length + (CTA_STORY[i].extraGap || 0), 0) + CTA_STORY.length - 1;
    const blockY = Math.max(2, Math.floor((H - totalH) / 2));

    // Dark rectangle behind all text
    for (let ry = Math.max(0, blockY - 2); ry < Math.min(H, blockY + totalH + 2); ry++) {
      for (let rx = 4; rx < W - 4; rx++) {
        grid.set(rx, ry, " ", "#111");
      }
    }

    let y = blockY;

    for (let i = 0; i < CTA_STORY.length; i++) {
      const seg = CTA_STORY[i];
      if (ctaT >= seg.t) {
        if (seg.flash) {
          const flick = ["#fff", "#ffd700", C_ORANGE];
          const fc = flick[Math.floor(Date.now() / 400) % flick.length];
          wrapped[i].forEach((ln, j) => {
            if (y + j < H - 2) grid.textCenter(ln, y + j, fc);
          });
        } else {
          wrapped[i].forEach((ln, j) => {
            if (y + j < H - 2) grid.textCenter(ln, y + j, seg.col);
          });
        }
      }
      y += wrapped[i].length + 1 + (seg.extraGap || 0);
    }

    if (ctaChoice && ctaEndLine) grid.textCenter(ctaEndLine, H - 4, ctaEndCol);
    if (ctaT > 12500 && !ctaChoice) grid.textCenter(window.LANG.promptTap, H - 2, Math.sin(Date.now() / 400) > 0 ? C_DIM : "#bbb");
  }

  /* ── END GAME (failure) ────────────────────────────────── */
  function endGame(result) {
    if (phase === "done") return;
    if (result === "escaped") {
      initInter(
        [
          {
            t: window.LANG.bannerShareBounty,
            c: C_SUCCESS,
            d: 2500,
          },
        ],
        initAct5,
        5,
      );
      return;
    }
    Music.stop();
    phase = "done";
    audio.play("bust");
    loop.stop();
    const my = state.get("score") || 0,
      tot = my + s4AlyScore;
    let title, sub, color;
    if (result === "busted") {
      color = C_DANGER;
      title = window.LANG.endGameBustedTitle;
      sub = window.LANG.endGameBustedSub;
    } else {
      color = C_DANGER;
      title = tot > 0 ? window.LANG.endGameCaughtTitle : window.LANG.endGameCaughtEmpty;
      sub = tot > 0 ? window.LANG.endGameCaughtSub + s4AlyScore + "." : window.LANG.endGameCaughtSubEmpty;
    }
    overlay.classList.remove("hidden");
    ovTitle.textContent = title;
    ovTitle.style.color = color;
    ovSub.textContent = sub;
    ovHint.textContent = "";
    startBtn.textContent = window.LANG.endGameTryAgain;
    overlay.querySelectorAll(".final").forEach((e) => e.remove());
    overlay.querySelectorAll(".give-up-btn").forEach((e) => e.remove());
    const gu = document.createElement("button");
    gu.className = "give-up-btn";
    gu.textContent = window.LANG.endGameGiveUp;
    gu.style.background = C_DIM;
    gu.style.marginTop = "4px";
    gu.addEventListener("click", () => {
      hasPlayed = false;
      startGame();
    });
    startBtn.after(gu);
    if (tot > 0) {
      const f = document.createElement("div");
      f.className = "final";
      f.textContent = "$" + tot;
      ovSub.after(f);
    }
    ovArt.style.color = color;
  }

  /* ── MAIN ──────────────────────────────────────────────── */
  /* ── FLOAT STYLE CONFIG ─────────────────────────────────
                       Used for big moments (recruit, narc, maybe-later). */
  const FLOAT_STYLE = {
    yRatio: 0.78 /* vertical position: 0=top, 1=bottom */,
    boxed: true /* draw border box around text? */,
    life: 2000 /* ms on screen */,
    fadeStart: 0.15 /* fraction of life at which it fades */,
    padX: 1 /* horizontal padding inside box */,
  };
  function addFloat(t, x, y, co) {
    /* x, y args are ignored — floats auto-position by phase. */
    /* Act 4 grocery grabs fire rapidly → shorter life so they don't pile */
    const life = phase === "act4" ? 1200 : FLOAT_STYLE.life;
    floats.push({
      text: t,
      color: co,
      life,
      max: life,
      boxed: FLOAT_STYLE.boxed,
    });
  }
  function update(dt) {
    // Update conversation fade timer
    if (convFading) {
      convFadeTimer += dt;
      if (convFadeTimer >= convFadeDuration) {
        // Fade complete, reset conversation
        convReset();
      }
    } else if (phase === "inter") updateInter(dt);

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
    if (phase === "act1") updateAct1(dt);
    else if (phase === "act2") updateAct2(dt);
    else if (phase === "act2b") updateAct2b(dt);
    else if (phase === "act3") updateAct3(dt);
    else if (phase === "act4") updateAct4(dt);
    else if (phase === "act5") updateAct5(dt);
    else if (phase === "end") updateEnd(dt);
    else if (phase === "cta") updateCTA(dt);
    input.endFrame();
  }
  function render() {
    grid.clear();
    if (phase === "act1") renderAct1();
    else if (phase === "act2") renderAct2();
    else if (phase === "act2b") renderAct2b();
    else if (phase === "act3") renderAct3();
    else if (phase === "act4") renderAct4();
    else if (phase === "act5") renderAct5();
    else if (phase === "end") renderEnd();
    else if (phase === "cta") renderCTA();
    else if (phase === "inter") renderInter();

    /* Floats: Act 2b + Act 4 = playful overlap with per-float position jitter.
                         Other phases = tidy vertical stack.
                         Uses thin double-line borders instead of heavy block chars. */
    const floatBaseY = Math.floor(H * FLOAT_STYLE.yRatio);
    const floatMaxW = W - 6;
    const playful = phase === "act4" || phase === "act2b";
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
      const boxed = f.boxed;
      const innerMax = floatMaxW - FLOAT_STYLE.padX * 2 - (boxed ? 2 : 0);
      /* Word wrap */
      const words = f.text.split(" "),
        lines = [];
      let cur = "";
      for (const w of words) {
        if (cur.length + w.length + 1 > innerMax) {
          lines.push(cur);
          cur = w;
        } else cur = cur ? cur + " " + w : w;
      }
      if (cur) lines.push(cur);
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
        grid.text(fBox.tl + fBox.h.repeat(bw - 2) + fBox.tr, bx, by, f.color);
        for (let li = 0; li < lines.length; li++) {
          grid.text(fBox.v + " ".repeat(bw - 2) + fBox.v, bx, by + 1 + li, f.color);
          const pad = Math.floor((lineW - lines[li].length) / 2);
          grid.text(lines[li], bx + 1 + FLOAT_STYLE.padX + pad, by + 1 + li, f.color);
        }
        grid.text(fBox.bl + fBox.h.repeat(bw - 2) + fBox.br, bx, by + 1 + lines.length, f.color);
      } else {
        for (let li = 0; li < lines.length; li++) {
          const pad = Math.floor((lineW - lines[li].length) / 2);
          grid.text(lines[li], bx + FLOAT_STYLE.padX + pad, by + li, f.color);
        }
      }
    }
    for (const s of sparks) {
      const sx = Math.round(s.x),
        sy = Math.round(s.y);
      if (sx >= 0 && sx < W && sy >= 0 && sy < H) grid.set(sx, sy, s.ch, s.color);
    }

    gs.innerHTML = grid.html();
    if (phase !== _lastPhaseForBtn) {
      _lastPhaseForBtn = phase;
      syncLangBtn();
    }

    if (chromaticT > 0) {
      chromaticT -= 16;
      gs.classList.add("chroma");
    } else gs.classList.remove("chroma");
    if (flashGoodT > 0) {
      flashGoodT -= 16;
      gs.classList.add("flash-good");
    } else gs.classList.remove("flash-good");
    if (flashGoldT > 0) {
      flashGoldT -= 16;
      gs.classList.add("flash-gold");
    } else gs.classList.remove("flash-gold");
  }

  function startGame() {
    // re-read language-dependent art now that language is chosen
    STORE = window.LANG === window.LANG_FR ? window.GAME_DATA.storeArtFR : window.GAME_DATA.storeArtEN;
    FRIDGE = window.LANG === window.LANG_FR ? window.GAME_DATA.fridgeArtFR : window.GAME_DATA.fridgeArtEN;
    NQ = window.LANG === window.LANG_FR ? window.GAME_DATA.narrativeQuotesFR : window.GAME_DATA.narrativeQuotesEN;

    A1E = window.LANG.a1Encounters;
    END_NAMES = window.LANG.endNames;
    D_INTERCOM_TICKER = window.LANG.intercoms;

    FOODS = window.LANG === window.LANG_FR ? window.GAME_DATA.foodsFR : window.GAME_DATA.foods;

    A1_LOOP_MSGS = window.LANG.a1LoopMsgs;
    // Music.stop(); // ← any edge case
    floats.length = 0;
    s4AlyScore = 0;
    a2CrewCount = 0;
    dialogStack = [];
    overlay.classList.add("hidden");
    if (hasPlayed) {
      initAct2();
    } else {
      initInter(
        [
          {
            t: window.LANG.bannerIsThisALife,
            c: "#9ab0cc",
            d: 3000,
          },
        ],
        initAct1,
        0,
      );
    }
    loop.start();
    // hasPlayed is set to true when the player reaches Act 2
  }
  ovTitle.textContent = window.LANG.overlayTitle;
  ovSub.innerHTML = window.LANG.overlaySub;
  ovHint.innerHTML = window.LANG.overlayHint;
  startBtn.textContent = window.LANG.playBtn;
  // startBtn.addEventListener("click", startGame);

  // startBtn handler — already have this, just add preload:
  startBtn.addEventListener("click", async () => {
    await audio.unlock();
    await audio.preload(["click", "music_act1"]);

    Music.play("music_act1");
    startGame();
  });
  // DEV: number keys jump between acts
  document.querySelectorAll("#scene-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      try {
        loop.stop();
      } catch (_) {}
      overlay.classList.add("hidden");
      floats.length = 0;
      sparks.length = 0;
      dialogStack = [];
      bannerTimer = 0;
      clickPending = false;
      const jmp = {
        1: () => initAct1(),
        2: () => initAct2(),
        3: () => initAct2b(),
        4: () => {
          a2CrewCount = Math.max(a2CrewCount, 5);
          initAct3();
        },
        5: () => {
          a2CrewCount = Math.max(a2CrewCount, 5);
          initAct4();
        },
        6: () => {
          a2CrewCount = Math.max(a2CrewCount, 5);
          s4AlyScore = s4AlyScore || 0;
          initAct5();
        },
        7: () => {
          a2CrewCount = Math.max(a2CrewCount, 5);
          s4AlyScore = s4AlyScore || 0;
          state.reset({
            score: 80,
          });
          initEnd();
        },
        8: () => initCTA(),
      };
      if (jmp[act]) {
        jmp[act]();
        loop.start();
      }
    });
  });

  window.addEventListener("keydown", function (e) {
    // const jumps = {
    //   1: function () {
    //     Music.stop();
    //     initAct1();
    //   },
    //   2: function () {
    //     Music.stop();
    //     initAct2();
    //   },
    //   3: function () {
    //     Music.stop();
    //     initAct2b();
    //   },
    //   4: function () {
    //     Music.stop();
    //     a2CrewCount = Math.max(a2CrewCount, 5);
    //     initAct3();
    //   },
    //   5: function () {
    //     Music.stop();
    //     a2CrewCount = Math.max(a2CrewCount, 5);
    //     initAct4();
    //   },
    //   6: function () {
    //     Music.stop();
    //     a2CrewCount = Math.max(a2CrewCount, 5);
    //     s4AlyScore = s4AlyScore || 0;
    //     initAct5();
    //   },
    //   7: function () {
    //     Music.stop();
    //     a2CrewCount = Math.max(a2CrewCount, 5);
    //     s4AlyScore = s4AlyScore || 0;
    //     state.reset({ score: 80 });
    //     initEnd();
    //   },
    //   8: function () {
    //     Music.stop();
    //     initCTA();
    //   },
    // };

    const jumps = {
      1: () =>
        initInter(
          [
            {
              t: window.LANG.bannerIsThisALife,
              c: "#9ab0cc",
              d: 3000,
            },
          ],
          initAct1,
        ),
      2: () =>
        initInter(
          [
            {
              t: window.LANG.bannerRecruitCrew,
              c: C_ORANGE,
              d: 2000,
            },
            {
              t: window.LANG.bannerWatchNarcs,
              c: C_ORANGE,
              d: 2000,
            },
          ],
          initAct2,
        ),
      3: () =>
        initInter(
          [
            {
              t: window.LANG.bannerRallyNeighbourhood,
              c: C_ORANGE,
              d: 2000,
            },
            {
              t: window.LANG.bannerAvoidNarcs,
              c: C_ORANGE,
              d: 2000,
            },
          ],
          initAct2b,
        ),
      4: () => {
        a2CrewCount = Math.max(a2CrewCount, 5);
        initInter(
          [
            {
              t: a2CrewCount + " Robins.",
              c: C_DANGER,
              d: 1200,
            },
            {
              t: window.LANG.bannerOneStore.trim(),
              c: C_DANGER,
              d: 1200,
            },
            {
              t: window.LANG.bannerLetsEat.trim(),
              c: C_DANGER,
              d: 1200,
            },
          ],
          initAct3,
          3,
        );
      },
      5: () => {
        a2CrewCount = Math.max(a2CrewCount, 5);
        initInter(
          [
            {
              t: window.LANG.bannerGrabEverything,
              c: C_PLAYER,
              d: 2500,
            },
          ],
          initAct4,
          4,
        );
      },
      6: () => {
        a2CrewCount = Math.max(a2CrewCount, 5);
        s4AlyScore = s4AlyScore || 0;
        initInter(
          [
            {
              t: window.LANG.bannerShareBounty,
              c: C_SUCCESS,
              d: 2500,
            },
          ],
          initAct5,
          5,
        );
      },
      7: () => {
        a2CrewCount = Math.max(a2CrewCount, 5);
        s4AlyScore = s4AlyScore || 0;
        state.reset({
          score: 80,
        });
        initEnd();
      },
      8: () => initCTA(),
    };
    if (!jumps[e.key]) return;
    try {
      loop.stop();
    } catch (_) {}
    overlay.classList.add("hidden");
    floats.length = 0;
    dialogStack = [];
    bannerTimer = 0;
    clickPending = false;
    jumps[e.key]();
    loop.start();
  });

  function boot() {
    measureGrid();
    grid = new Grid(W, H);
    loop = new GameLoop({
      update,
      render,
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else setTimeout(boot, 200);
  let rTO;
  window.addEventListener("resize", () => {
    clearTimeout(rTO);
    rTO = setTimeout(() => {
      measureGrid();
      grid = new Grid(W, H);
    }, 200);
  });
})();
