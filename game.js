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

  // ── UNIFIED MOBILE CONTROLS ───────────────────────────────────
  const MOBILE_DEAD_ZONE_CELLS = 3;
  const MOBILE_SWIPE_PX = 22;
  const MOBILE_LANE_HOP_REPEAT_MS = 350;

  const _mob = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    dir: null,
    swiped: false,
    tapped: false,
    holding: false,
    hopTimer: 0,
    pendingUp: false,
    pendingDown: false,
    pendingLeft: false,
    pendingRight: false,
  };

  function _mobResolveDir(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "left" : "right";
    return dy < 0 ? "up" : "down";
  }

  function _mobFireStep(dir) {
    if (dir === "up") _mob.pendingUp = true;
    if (dir === "down") _mob.pendingDown = true;
    if (dir === "left") _mob.pendingLeft = true;
    if (dir === "right") _mob.pendingRight = true;
  }

  function _mobEnd(ex, ey) {
    if (!_mob.active) return;
    if (!_mob.swiped && !_mob.holding) {
      const dx = ex - _mob.startX;
      const dy = ey - _mob.startY;
      if (Math.sqrt(dx * dx + dy * dy) < MOBILE_SWIPE_PX) {
        const r = gs.getBoundingClientRect();
        const cellW = r.width / W; // actual pixel width per cell
        const cellH = r.height / H; // actual pixel height per cell
        const tapCX = (ex - r.left) / cellW;
        const tapCY = (ey - r.top) / cellH;
        if (phase === "act2") {
          const pl = { x: Math.round(a2PX), y: Math.round(a2PY) };
          const ddx = tapCX - pl.x,
            ddy = tapCY - pl.y;
          if (Math.abs(ddx) > MOBILE_DEAD_ZONE_CELLS || Math.abs(ddy) > MOBILE_DEAD_ZONE_CELLS) _mobFireStep(_mobResolveDir(ddx, ddy));
        }
        if (phase === "act2b") {
          const pl = { x: Math.round(a2bPX), y: Math.round(a2bPY) };
          const ddx = tapCX - pl.x,
            ddy = tapCY - pl.y;
          if (Math.abs(ddx) > MOBILE_DEAD_ZONE_CELLS || Math.abs(ddy) > MOBILE_DEAD_ZONE_CELLS) _mobFireStep(_mobResolveDir(ddx, ddy));
        }
        if (phase === "act4") {
          const pl = { x: Math.round(s4PX2), y: Math.round(s4PY2) };
          const ddx = tapCX - pl.x,
            ddy = tapCY - pl.y;
          // Give aisle a 5-row buffer above S4_AISLE_TOP so taps near the shelf edge still move player
          if (tapCY >= S4_AISLE_TOP && tapCY <= S4_FLOOR_Y) {
            if (Math.abs(ddx) > MOBILE_DEAD_ZONE_CELLS || Math.abs(ddy) > MOBILE_DEAD_ZONE_CELLS) _mobFireStep(_mobResolveDir(ddx, ddy));
          }
        }
      }
    }
    _mob.active = false;
    _mob.pointerId = null;
    _mob.dir = null;
    _mob.holding = false;
  }

  if (Device.isMobile) {
    gs.addEventListener(
      "pointerdown",
      (e) => {
        if (phase !== "act2" && phase !== "act2b" && phase !== "act4") return;
        if (_mob.pointerId !== null) return;
        _mob.active = true;
        _mob.pointerId = e.pointerId;
        _mob.startX = e.clientX;
        _mob.startY = e.clientY;
        _mob.currentX = e.clientX;
        _mob.currentY = e.clientY;
        _mob.startTime = performance.now();
        _mob.dir = null;
        _mob.swiped = false;
        _mob.tapped = false;
        _mob.holding = false;
        _mob.hopTimer = 0;

        _mob.lastX = e.clientX;
        _mob.lastY = e.clientY;
      },
      { passive: true },
    );

    gs.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerId !== _mob.pointerId) return;
        _mob.currentX = e.clientX;
        _mob.currentY = e.clientY;
        // Engage holding as soon as finger moves half a cell
        const fingerMovedX = Math.abs(e.clientX - _mob.startX) > 8;
        const fingerMovedY = Math.abs(e.clientY - _mob.startY) > 8;
        if ((fingerMovedX || fingerMovedY) && !_mob.holding) {
          _mob.holding = true;
          _mob.lastX = e.clientX;
          _mob.lastY = e.clientY;
        }
      },
      { passive: true },
    );

    gs.addEventListener(
      "pointerup",
      (e) => {
        if (e.pointerId === _mob.pointerId) _mobEnd(e.clientX, e.clientY);
      },
      { passive: true },
    );
    gs.addEventListener(
      "pointercancel",
      (e) => {
        if (e.pointerId === _mob.pointerId) _mobEnd(e.clientX, e.clientY);
      },
      { passive: true },
    );
  }

  function _mobUpdate(dt) {
    if (!Device.isMobile || !_mob.active) return;
    if (phase !== "act2" && phase !== "act2b" && phase !== "act4") return;
    if (!_mob.holding) return;

    const r = gs.getBoundingClientRect();
    const cellW = r.width / W;
    const cellH = r.height / H;

    // Delta from last frame position — player mirrors finger movement exactly
    const dxPx = _mob.currentX - _mob.lastX;
    const dyPx = _mob.currentY - _mob.lastY;
    _mob.lastX = _mob.currentX;
    _mob.lastY = _mob.currentY;

    const dxCells = dxPx / cellW;
    const dyCells = dyPx / cellH;

    if (phase === "act2") {
      const newX = a2PX + dxCells;
      const newY = a2PY + dyCells;
      const worldNewX = Math.round(a2WX + newX);
      const worldNewY = Math.round(newY);
      // Move freely if on road, slide along one axis if blocked
      if (isRoad(worldNewX, worldNewY)) {
        a2PX = newX;
        a2PY = newY;
      } else if (isRoad(worldNewX, Math.round(a2PY))) {
        a2PX = newX;
      } else if (isRoad(Math.round(a2WX + a2PX), worldNewY)) {
        a2PY = newY;
      }
    } else if (phase === "act2b") {
      // Horizontal finger drag scrolls the world; vertical moves the player in the lane.
      a2bWX += dxCells * 0.7;
      a2bPY += dyCells;
      a2bPY = Util.clamp(a2bPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
    } else if (phase === "act4") {
      s4PX2 += dxCells;
      s4PY2 += dyCells;
      s4PY2 = Util.clamp(s4PY2, S4_AISLE_TOP + 1, S4_AISLE_BOT - 1);
      s4PX2 = Util.clamp(s4PX2, 4, W - 6);
    }
  }

  if (Device.isMobile) {
    const _origJP = input.justPressed.bind(input);
    input.justPressed = function (keyOrAction) {
      if (phase === "act2" || phase === "act2b" || phase === "act4") {
        if (keyOrAction === "up" && _mob.pendingUp) {
          _mob.pendingUp = false;
          return true;
        }
        if (keyOrAction === "down" && _mob.pendingDown) {
          _mob.pendingDown = false;
          return true;
        }
        if (keyOrAction === "left" && _mob.pendingLeft) {
          _mob.pendingLeft = false;
          return true;
        }
        if (keyOrAction === "right" && _mob.pendingRight) {
          _mob.pendingRight = false;
          return true;
        }
      }
      return _origJP(keyOrAction);
    };
  }
  // ── END UNIFIED MOBILE CONTROLS ───────────────────────────────

  const quitBtn = document.getElementById("quit-btn");
  quitBtn.textContent = window.LANG.quitBtn;
  quitBtn.addEventListener("click", () => {
    try {
      loop.stop();
    } catch (_) {}
    floats.length = 0;
    sparks.length = 0;
    dialogStack = [];
    convReset();
    bannerTimer = 0;
    bannerText = "";
    clickPending = false;
    a2TN = null;
    a2CrewCount = 0;
    a2Crew = [];
    phase = "done";
    overlay.classList.remove("hidden");
    ovTitle.textContent = window.LANG.overlayTitle;
    ovTitle.style.color = C_PLAYER;
    ovSub.innerHTML = window.LANG.overlaySub;
    startBtn.textContent = window.LANG.playBtn;
    startBtn.style.display = "";
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
    prompt: "click.mp3", // subtle chime when tap-prompts appear; swap file later
    hint: "click.mp3", // softer chime when control-hints appear; swap file later
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
  /* Detects characters that may render wider than 1 monospace cell.
     Covers: CJK ideographs, hiragana/katakana, hangul, fullwidth forms,
     emoji-range symbols, and a few stray wide symbols (e.g. Tamil ஹ).
     Returns true for characters that need rigid per-cell rendering. */
  function isWideChar(ch) {
    if (!ch || ch.length === 0) return false;
    const code = ch.charCodeAt(0);
    /* Fast reject for common ASCII + Latin */
    if (code < 0x0300) return false;
    /* Known problem ranges */
    return (
      (code >= 0x0b80 && code <= 0x0bff) /* Tamil (cat ஹ) */ ||
      (code >= 0x1100 && code <= 0x115f) /* Hangul Jamo */ ||
      (code >= 0x2e80 && code <= 0x303e) /* CJK Radicals, Kangxi */ ||
      (code >= 0x3041 && code <= 0x33ff) /* Hiragana, Katakana, CJK symbols */ ||
      (code >= 0x3400 && code <= 0x4dbf) /* CJK Extension A */ ||
      (code >= 0x4e00 && code <= 0x9fff) /* CJK Unified Ideographs */ ||
      (code >= 0xa000 && code <= 0xa4cf) /* Yi */ ||
      (code >= 0xac00 && code <= 0xd7a3) /* Hangul Syllables */ ||
      (code >= 0xf900 && code <= 0xfaff) /* CJK Compatibility Ideographs */ ||
      (code >= 0xfe30 && code <= 0xfe4f) /* CJK Compatibility Forms */ ||
      (code >= 0xff00 && code <= 0xff60) /* Fullwidth Forms */ ||
      (code >= 0xffe0 && code <= 0xffe6) /* Fullwidth Signs */ ||
      code >= 0xd800 /* Surrogates (emoji + supplementary planes) */
    );
  }

  let grid;
  class Grid {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.c = [];
      this.wideRows = new Set();
      this.wideRows = new Set();
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
      this.wideRows.clear();
    }
    set(x, y, ch, co) {
      x = Math.floor(x);
      y = Math.floor(y);
      if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
        this.c[y][x].ch = ch;
        this.c[y][x].co = co || null;
        if (isWideChar(ch)) this.wideRows.add(y);
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
        for (let i = 0; i < l.length; i++) {
          if (l[i] !== " ") {
            this.set(px + i, py + r, l[i], co);
          } else {
            this.set(px + i, py + r, " ", "#000"); // block mountain bleed
          }
        }
      });
    }
    html() {
      let o = "";
      for (let y = 0; y < this.h; y++) {
        if (this.wideRows.has(y)) {
          /* Rigid per-cell rendering for rows containing wide chars.
             Each cell is a fixed-width inline-block; wide glyphs overflow
             visually into neighbours but don't push the column grid. */
          for (let x = 0; x < this.w; x++) {
            const c = this.c[y][x];
            const ch = c.ch === "<" ? "&lt;" : c.ch === ">" ? "&gt;" : c.ch === "&" ? "&amp;" : c.ch;
            if (c.co) {
              o += '<span class="cell" style="color:' + c.co + '">' + ch + "</span>";
            } else {
              o += '<span class="cell">' + ch + "</span>";
            }
          }
          o += "\n";
        } else {
          /* Fast path: run-length color merging for normal rows. */
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

  const HAT_CHAR = "ƛ";
  const HAT_COLOR = C_ORANGE;
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

  function playerPulseColor(t) {
    // Gentle 1.4Hz white glow — works in any act, just pass the act timer
    return Math.sin(t / 0.01) > 0.3 ? "#e69224" : C_PLAYER;
  }

  function dullColor(hex, amount) {
    // amount 0..1 — 0 = original, 1 = full gray
    amount = amount ?? 0.55;
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const gray = 140;
    const mr = Math.round(r * (1 - amount) + gray * amount);
    const mg = Math.round(g * (1 - amount) + gray * amount);
    const mb = Math.round(b * (1 - amount) + gray * amount);
    return "#" + mr.toString(16).padStart(2, "0") + mg.toString(16).padStart(2, "0") + mb.toString(16).padStart(2, "0");
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
    action: ["Enter", " "],
  });
  let loop, phase;
  const floats = [];
  let a2CrewCount = 0,
    s4AlyScore = 0,
    a5FoodCycleT = 0,
    a5FoodTotalPlaced = 0,
    a5FlyingItems = null,
    a5GroundPile = null,
    a5LastCounterValue = 0,
    a5LastCounterFlash = 0;
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
    flashGoldT = 600;
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
  /* ── BANNER SYSTEM ─────────────────────────────────────────
     showBanner(text, color, duration, silent)
       text supports \n for hard line breaks.

     showBannerSequence(lines, silent)
       lines = array of:
         { t, c, d }          — print this line (appended to box), show for d ms
         { pause: true, d }   — silent beat before next line (box stays open)
       Each line is appended to the same box. The box stays open until
       the last line's timer expires.

     To tweak inter-line pause, edit the `d` on a { pause } entry.
     To tweak how long a line shows before the next, edit its `d`.
  ─────────────────────────────────────────────────────────── */
  let bannerText = "",
    bannerColor = C_PLAYER,
    bannerTimer = 0;
  let _bannerSeq = null; // active sequence state

  function showBanner(t, c, d, silent) {
    audio.play("trumpet");
    _bannerSeq = null; // cancel any running sequence
    bannerText = t;
    bannerColor = c || C_PLAYER;
    bannerTimer = d || 3000;
  }

  function showBannerSequence(lines, silent) {
    /* lines: [{t,c,d} | {pause,d}] */
    if (!lines || lines.length === 0) return;
    _bannerSeq = { lines: [...lines], idx: 0, lineTimer: 0, silent };
    bannerText = "";
    bannerTimer = 99999; // kept open by sequence driver
    // Seed color from first non-pause line
    const first = lines.find((l) => !l.pause);
    bannerColor = first ? first.c || C_PLAYER : C_PLAYER;
    if (!silent) audio.play("trumpet");
  }

  function updateBanner(dt) {
    if (_bannerSeq) {
      _bannerSeq.lineTimer -= dt;
      if (_bannerSeq.lineTimer <= 0) {
        const seq = _bannerSeq;
        if (seq.idx >= seq.lines.length) {
          // All lines done — start countdown to close
          _bannerSeq = null;
          bannerTimer = 400; // brief hold then close
          return;
        }
        const entry = seq.lines[seq.idx];
        seq.idx++;
        if (entry.pause) {
          // Silent beat — box stays, no new text
          seq.lineTimer = entry.d || 800;
        } else {
          if (bannerText) bannerText += "\n\n" + entry.t;
          else bannerText = entry.t;
          if (entry.c) bannerColor = entry.c;
          seq.lineTimer = entry.d || 3000;
          audio.play("trumpet"); // always play per-line sound
        }
      }
      return; // don't tick bannerTimer while sequence is running
    }
    if (bannerTimer > 0) bannerTimer -= dt;
  }
  function renderBanner() {
    if (bannerTimer <= 0) return;
    const mxW = W - 6;
    const lines = [];
    for (const segment of bannerText.split("\n")) {
      if (segment.trim() === "") {
        lines.push(""); // preserve blank lines as empty rows
        continue;
      }
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

  let _lastPromptKey = null;
  let _lastHintShown = null;
  function renderTapPrompt(msg, y, col1, col2) {
    // Play a one-time chime when a NEW prompt appears (not every frame).
    // Key combines phase + message so a different prompt in the same phase
    // re-chimes, but the same prompt held on screen does not.
    const key = phase + "::" + msg;
    if (_lastPromptKey !== key) {
      _lastPromptKey = key;
      audio.play("prompt", { volume: 0.4 });
    }
    const flash = Math.sin(Date.now() / 300) > 0;
    const c = flash ? col1 || "#fff" : col2 || C_PLAYER;
    grid.textCenter("\u25B6 " + msg + " \u25C0", y, c);
  }

  function handleTapWithParticles(condition, onTap, particleCol, particleX, particleY, big) {
    if (clickPending && condition) {
      clickPending = false;
      if (big) burstGood(particleX, particleY, particleCol || C_PLAYER, 10);
      else spark(particleX, particleY, particleCol || C_PLAYER, 5);
      onTap();
      return true;
    }
    return false;
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

  const CONV_CHUNK_PAUSE_MS = 1400;
  const CONV_NPC_REPLY_DELAY_MS = 2200; // delay before NPC first replies
  const CONV_INVITE_DELAY_MS = 3000; // delay before invite/filler beat
  const CONV_READ_MIN_MS = 3500; // minimum read time for NPC lines
  const CONV_READ_MS_PER_WORD = 220; // ms per word for dynamic read delay
  const CONV_CLOSE_MS = 2500; // delay before conv closes after final line
  const CONV_BAIL_MS = 2200; // delay after bail/walk away responses
  const CONV_TYPING_ENABLED = false;

  const CONV_TYPE_MS = 65; // ms per character
  const CONV_TYPE_PUNCT_MS = 120; // ms extra pause after . ? !
  const CONV_TYPE_COMMA_MS = 60; // ms extra pause after ,

  const T = {
    tap: 180, // comma beat — barely there
    beat: 420, // breath between thoughts
    pause: 850, // dramatic pause — let it breathe
    hold: 1500, // heavy line — wait for it to land
    linger: 2400, // dense/long line — full read time

    exit: 700, // before conv panel closes after final line
    reply: 2400, // delay before NPC first speaks (thinking)
    npcMin: 3600, // minimum ms to show an NPC line
    npcPer: 260, // ms per word added on top of npcMin
    chunk: 900, // gap between |pause| chunks (unchanged)

    // Banner-specific
    bannerBeat: 600, // pause between banner sequence entries
    bannerHold: 3000, // default banner display duration
  };

  /* ─────────────────────────────────────────────────────────────────
   parseBeats(str)
   Splits a string on [tag] or [ms] markers into an array of
   { text: string, after: ms } objects.

   "Hello.[beat] How are you?" →
     [ { text: "Hello.", after: 420 }, { text: "How are you?", after: 0 } ]

   Used by convAddLine — the Seq and banner helpers call it internally.
   ───────────────────────────────────────────────────────────────── */
  function parseBeats(str) {
    const TAG = /\[(tap|beat|pause|hold|linger|\d+)\]/g;
    const segments = [];
    let last = 0,
      m;
    while ((m = TAG.exec(str)) !== null) {
      const text = str.slice(last, m.index).trim();
      const key = m[1];
      const ms = isNaN(key) ? (T[key] ?? T.beat) : parseInt(key, 10);
      segments.push({ text, after: ms });
      last = m.index + m[0].length;
    }
    const tail = str.slice(last).trim();
    if (tail || segments.length === 0) segments.push({ text: tail, after: 0 });
    return segments;
  }

  /* ─────────────────────────────────────────────────────────────────
   readDelay(text, min?)
   Dynamic read time based on word count. Replaces the old
   readDelay() that was defined inside updateAct2.
   ───────────────────────────────────────────────────────────────── */
  function readDelay(text, min) {
    const words = (text || "").trim().split(/\s+/).length;
    return Math.max(min ?? T.npcMin, words * T.npcPer);
  }

  /* ══════════════════════════════════════════════════════════════════
   Seq — lightweight in-update sequencer
   ══════════════════════════════════════════════════════════════════

   Replaces all timing-sensitive setTimeout chains. Runs inside
   your existing update(dt) loop — just call seq.update(dt).

   STEP TYPES
   ─────────────────────────────────────────────────────────────────
   () => { ... }            — run immediately, advance
   { wait: ms }             — hold for N milliseconds
   { waitFor: () => bool }  — hold until predicate returns true
   { waitFor: () => bool, timeout: ms } — same, with a fallback
   [ step, step, ... ]      — nested array runs all in parallel
                              (advances when ALL sub-steps done)

   USAGE
   ─────────────────────────────────────────────────────────────────
   const mySeq = new Seq([
     () => showBanner("Hello.", C_PLAYER, T.hold),
     { waitFor: () => bannerTimer <= 0 },
     { wait: T.beat },
     () => convAddLine("Ready?", "you", C_PLAYER),
     { wait: T.reply },
     () => convAddLine("Always.", "them", C_TEAL),
     { waitFor: () => convTypingDone() },
     { wait: T.exit },
     () => convStartFade(),
   ]);

   // In update(dt):
   mySeq.update(dt);

   // Check if done:
   if (mySeq.done) { ... }

   // Cancel early:
   mySeq.cancel();
   ══════════════════════════════════════════════════════════════════ */

  class Seq {
    constructor(steps) {
      this._steps = steps;
      this._idx = 0;
      this._timer = 0;
      this._pred = null;
      this._timeout = 0;
      this.done = false;
      this._cancelled = false;
    }

    cancel() {
      this._cancelled = true;
      this.done = true;
    }

    update(dt) {
      if (this.done || this._cancelled) return;

      while (this._idx < this._steps.length) {
        const step = this._steps[this._idx];

        // ── wait: ms ──────────────────────────────────────────────
        if (step && typeof step === "object" && "wait" in step) {
          this._timer += dt;
          if (this._timer < step.wait) return;
          this._timer = 0;
          this._idx++;
          continue;
        }

        // ── waitFor: predicate ────────────────────────────────────
        if (step && typeof step === "object" && "waitFor" in step) {
          if (step.timeout) {
            this._timer += dt;
            if (this._timer >= step.timeout || step.waitFor()) {
              this._timer = 0;
              this._idx++;
              continue;
            }
            return;
          }
          if (!step.waitFor()) return;
          this._idx++;
          continue;
        }

        // ── function: run immediately ─────────────────────────────
        if (typeof step === "function") {
          step();
          this._idx++;
          continue;
        }

        // ── unknown: skip ─────────────────────────────────────────
        this._idx++;
      }

      this.done = true;
    }
  }

  /* Helper — true when the last convLog entry is fully revealed
   and no chunks are pending. Used in waitFor predicates. */
  function convTypingDone() {
    if (_convChunkQueue.length > 0) return false;
    const li = convLog.length - 1;
    if (li < 0) return true;
    return (convReveal[li] ?? 0) >= convLog[li].text.length;
  }

  let _convChunkQueue = [];
  let _convChunkTimer = 0;
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
    convChoicePicked = -1,
    convChoiceYs = []; // start row of each choice
  ((convChoiceSelected = -1), (convChoiceSelectedT = 0));
  let convReveal = [];
  let _convTypeTimer = 0;

  function convReset() {
    convLog = [];
    convChoices = null;
    convVisible = false;
    convFading = false;
    convFadeTimer = 0;
    convChoiceY1 = 0;
    convChoiceY2 = 0;
    convChoiceHover = -1;
    convChoicePicked = -1;
    convChoiceSelected = -1;
    convChoiceSelectedT = 0;
    _convChunkQueue = [];
    _convChunkTimer = 0;
    convReveal = [];
    _convTypeTimer = 0;
  }

  let interT, interLines, interLI, interNext, interDone, interFrameIdx;
  let interControlsHint = null;
  function initInter(lines, nextFn, frameIdx, controlsHint) {
    if (!lines || lines.length === 0) {
      if (nextFn) nextFn();
      return;
    }
    phase = "inter";
    interFrameIdx = frameIdx || 0;
    interT = 0;
    interLines = lines;
    interLI = 0;
    interNext = nextFn;
    interDone = false;
    interControlsHint = controlsHint || null;
    bannerTimer = 0;
    dialogStack = [];
    clickPending = false;
    // skip any leading pause entries
    let _firstReal = 0;
    while (_firstReal < interLines.length && interLines[_firstReal].pause) _firstReal++;
    if (_firstReal >= interLines.length) {
      if (nextFn) nextFn();
      return;
    }
    showBanner(interLines[_firstReal].t, interLines[_firstReal].c, 99999, true);
    interLI = _firstReal + 1;
  }

  function updateInter(dt) {
    interT += dt;
    updateBanner(dt);

    // append next line to existing banner box
    if (interLI < interLines.length && interT > interLines[interLI - 1].d) {
      const nextLine = interLines[interLI];
      if (nextLine.pause) {
        // silent beat — just wait, don't append anything
        interLI++;
        interT = 0;
      } else {
        bannerText += "\n\n" + nextLine.t;
        bannerTimer = 99999;
        interLI++;
        interT = 0;
        audio.play("trumpet");
      }
    }
    // auto-advance after last line
    if (!interDone && interLI >= interLines.length && interT > 25000) {
      interDone = true;
      bannerTimer = 0;
      interNext();
    }
    // tap to skip
    const _tapAllowed = interLI >= interLines.length && interT > 5000;
    if (clickPending && _tapAllowed) {
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

    // side columns — original right-side logic, untouched
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
    // Solid dark background so banner reads over any game art
    for (let iy = 0; iy < H; iy++) for (let ix = 0; ix < W; ix++) grid.set(ix, iy, " ", "#0d0d0d");

    renderInterFrame();
    renderBanner();
    const _allLinesDone = interLines && interLI >= interLines.length;
    if (interControlsHint && _allLinesDone && interT > 2500) {
      // Play hint chime once, on first appearance
      if (!_lastHintShown || _lastHintShown !== interControlsHint) {
        _lastHintShown = interControlsHint;
        audio.play("hint", { volume: 0.3 });
      }
      // Word-wrap the hint
     
      // Word-wrap the hint — split on · into phrases, blank line between each
      const innerW = Math.min(W - 10, 32);
      const phrases = interControlsHint.split(" · ");
      const hintLines = [];
      for (let pi = 0; pi < phrases.length; pi++) {
        const words = phrases[pi].split(" ");
        let cur = "";
        for (const w of words) {
          if (cur.length + w.length + 1 > innerW) {
            hintLines.push(cur);
            cur = w;
          } else cur = cur ? cur + " " + w : w;
        }
        if (cur) hintLines.push(cur);
        if (pi < phrases.length - 1) hintLines.push(""); // blank line between phrases
      }

      // Render as a bordered card — distinct from banner (double-line) and dialog (round corners).
      // Single-line square corners says "instructions" / "system message".
      const hintLabel = window.LANG.hintLabel || "controls";
      const labelLen = hintLabel.length + 2; // " controls "
      const contentW = Math.max(...hintLines.map((l) => l.length), labelLen);
      const boxW = Math.min(W - 4, contentW + 6);
      const boxH = hintLines.length + 4; // top + label + line + lines + bottom
      const bx = Math.floor((W - boxW) / 2);
      const by = Math.floor(H * 0.72) - Math.floor(boxH / 2);
      const borderCol = "#7a8aaa";
      const labelCol = "#aab8cc";
      const hintCol = Math.sin(Date.now() / 600) > 0 ? "#fff" : "#dde4f0";

      // Clear background
      for (let y = by; y < by + boxH && y < H; y++) for (let x = bx; x < bx + boxW && x < W; x++) if (x >= 0) grid.set(x, y, " ", null);

      // // Top border with embedded label: ┌─ controls ─────┐
      // const topLeft = "\u250C\u2500 ";
      // const topAfter = " \u2500";
      // const fillLen = boxW - topLeft.length - hintLabel.length - topAfter.length - 1;
      // const topRow = topLeft + hintLabel + topAfter + "\u2500".repeat(Math.max(0, fillLen)) + "\u2510";
      // grid.text(topRow.substring(0, boxW), bx, by, borderCol);
      // // Re-color just the label bright
      // grid.text(hintLabel, bx + topLeft.length, by, labelCol);

 
      const KEY_COL  = "#dde4f0"; // arrows — slightly brighter
      const TEXT_COL = "#ffef7a";    // everything else — calm, understated
      const KEY_TOKENS = new Set(["←", "↑", "→", "↓"]);

      function tokenColor(word) {
        if (KEY_TOKENS.has(word)) return KEY_COL;
        return TEXT_COL;
      }

      for (let i = 0; i < hintLines.length; i++) {
        const ly = by + 2 + i;
        // grid.text("│" + " ".repeat(boxW - 2) + "│", bx, ly, borderCol);
        if (hintLines[i] === "") {
          continue;
        }
        const pad = Math.floor((boxW - hintLines[i].length) / 2);
        let cx = bx + pad;
        const parts = hintLines[i].split(" ");
        for (let j = 0; j < parts.length; j++) {
          const word = parts[j];
          const col = tokenColor(word);
          grid.text(word, cx, ly, col);
          cx += word.length;
          if (j < parts.length - 1) {
            grid.text(" ", cx, ly, TEXT_COL);
            cx += 1;
          }
        }
      }

      // Bottom border
      // grid.text("\u2514" + "\u2500".repeat(boxW - 2) + "\u2518", bx, by + boxH - 1, borderCol);

      if (interT > 10000) {
        renderTapPrompt(window.LANG.tapToContinue, by + boxH + 2, "#fff", C_PLAYER);
      }
    } else if (!interControlsHint && _allLinesDone && interT > 10000) {
      renderTapPrompt(window.LANG.tapToContinue, Math.floor(H * 0.78), "#fff", C_PLAYER);
    }
  }

  function convStartFade() {
    if (!convVisible) return;
    convFading = true;
    convFadeTimer = 0;
  }

  function convStartFadeWhenDone(extraMs) {
    const extra = extraMs || 1200;
    const startPhase = phase;
    const check = setInterval(() => {
      if (phase !== startPhase) {
        clearInterval(check);
        return;
      }
      if (_convChunkQueue.length > 0) return; // still chunks pending
      const li = convLog.length - 1;
      if (li < 0 || convReveal[li] >= convLog[li].text.length) {
        clearInterval(check);
        setTimeout(() => {
          if (phase === startPhase) convStartFade();
        }, extra);
      }
    }, 50);
  }

  function convEndWhenDone(extraMs, thenFn) {
    // waits for typing AND chunks to finish, holds extraMs, then calls thenFn
    const extra = extraMs || 1200;
    const startPhase = phase;
    const check = setInterval(() => {
      if (phase !== startPhase) {
        clearInterval(check);
        return;
      }
      if (_convChunkQueue.length > 0) return;
      const li = convLog.length - 1;
      if (li < 0 || convReveal[li] >= convLog[li].text.length) {
        clearInterval(check);
        setTimeout(() => {
          if (phase === startPhase) thenFn();
        }, extra);
      }
    }, 50);
  }

  function convResetLater(ms) {
    const p = phase;
    setTimeout(() => {
      if (phase !== p) return;
      dialogStack = [];
      convStartFade();
    }, ms);
  }

  function _convChunkFlush() {
    const q = _convChunkQueue[0];
    if (!q) return;
    const chunk = q.chunks[q.idx];
    if (!q.skipFirstSound) audio.play(q.side === "you" ? "playertxtbox" : "npctxtbox");
    q.skipFirstSound = false;
    const last = convLog[convLog.length - 1];
    if (last && last.side === q.side) {
      const sep = chunk.startsWith("\n") ? "" : " ";
      last.text = last.text + sep + chunk;
    } else {
      convLog.push({ text: chunk, side: q.side, color: q.color });
      convReveal.push(0);
    }
    q.idx++;
    if (q.idx >= q.chunks.length) {
      _convChunkQueue.shift();
    }
  }

  function convAddLine(text, side, color) {
    // Treat \n and \n\n as implicit pause markers, same as |pause|.
    // Preserve them in the output by inserting a sentinel that survives the trim.
    // Chunks that come from a \n boundary are marked silent (pause but no sound).
    const normalized = text.replace(/\n\n/g, "|pause|__BREAK2__").replace(/\n/g, "|pause|__BREAK1__");
    const rawChunks = normalized.split("|pause|").map((s) => s.trim());
    const restored = rawChunks.map((s) => s.replace(/^__BREAK2__/, "\n\n").replace(/^__BREAK1__/, "\n"));
    // Fold any pure-newline chunks (just \n or \n\n with nothing else) onto the
    // FRONT of the next chunk, so the line break appears together with the next
    // text after the pause — not by itself before the pause. Trailing pure-break
    // chunks get appended to the last real chunk so they still render.
    const chunks = [];
    let pendingPrefix = "";
    for (let i = 0; i < restored.length; i++) {
      const c = restored[i];
      const isPureBreak = /^\n+$/.test(c) || c === "";
      if (isPureBreak && i < restored.length - 1) {
        pendingPrefix += c;
        continue;
      }
      chunks.push(pendingPrefix + c);
      pendingPrefix = "";
    }
    if (pendingPrefix && chunks.length > 0) {
      chunks[chunks.length - 1] = chunks[chunks.length - 1] + pendingPrefix;
    }
    if (chunks.length === 1) {
      audio.play(side === "you" ? "playertxtbox" : "npctxtbox");
      const last = convLog[convLog.length - 1];
      if (last && last.side === side) {
        last.text = last.text + "\n\n" + chunks[0];
      } else {
        convLog.push({ text: chunks[0], side, color });
        convReveal.push(0);
      }
      return;
    }
    // Chunked path — sound fires immediately; queue handles subsequent chunks
    audio.play(side === "you" ? "playertxtbox" : "npctxtbox");
    _convChunkQueue.push({ chunks, idx: 0, side, color, skipFirstSound: true });
    _convChunkTimer = 0;
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
    const boxW = Math.min(W - 16, 30);
    const innerW = boxW - 4;
    // Measure total height first so we can anchor from the bottom
    const allBoxes = [];
    const visibleLog = convLog.slice(-2);
    const visibleOffset = Math.max(0, convLog.length - 2);
    for (let i = 0; i < visibleLog.length; i++) {
      const entry = visibleLog[i];
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
      const age = visibleLog.length - 1 - i;
      const dimmed = age > 1;
      const baseColor = dimmed ? "#444" : entry.color;
      const revealed =
        age === 0 ? (convReveal[i + visibleOffset] !== undefined ? entry.text.substring(0, convReveal[i + visibleOffset]) : entry.text) : entry.text; // older boxes always fully shown
      // re-wrap using revealed text
      const revealedLines = [];
      for (const segment of revealed.split("\n")) {
        if (segment.trim() === "") {
          revealedLines.push("");
          continue;
        }
        const words = segment.split(" ");
        let cur = "";
        for (const w of words) {
          if (cur.length + w.length + 1 > innerW) {
            revealedLines.push(cur);
            cur = w;
          } else cur = cur ? cur + " " + w : w;
        }
        if (cur) revealedLines.push(cur);
      }
      allBoxes.push({
        lines: revealedLines,
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

    // clamp topY so it never goes above row 2
    const rawTopY = lastBoxTop - totalPriorHeight;
    const topY = phase === "act2" ? Math.max(2, rawTopY) : rawTopY;
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
    const offset = Math.min(5, Math.floor(boxW / 5));
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
        const _boxStyle = box.isChoice ? DIALOG_BOX : CONV_BOX;
        const borderCol = box.isChoice ? applyBoxOpacity(C_PLAYER) : applyBoxOpacity(box.color);
        grid.text(_boxStyle.tl + _boxStyle.h.repeat(boxW - 2) + _boxStyle.tr, xPos, cy, borderCol);
      }
      cy++;

      for (let li = 0; li < box.lines.length; li++) {
        if (cy >= 0 && isVisible) {
          const sideBorderCol = box.isChoice ? applyBoxOpacity(C_PLAYER) : applyBoxOpacity(box.color);
          grid.text(box.isChoice ? DIALOG_BOX.v : CONV_BOX.v, xPos, cy, sideBorderCol);
          grid.text(box.isChoice ? DIALOG_BOX.v : CONV_BOX.v, xPos + boxW - 1, cy, sideBorderCol);

          if (box.lines[li] !== "") {
            const pad = box.isChoice ? 0 : Math.floor((innerW - box.lines[li].length) / 2);
            let lineCol = box.color;
            if (box.isChoice) {
              const choiceMutedColors = ["#607898", "#6a8a60", "#886070", "#7a6a98"];
              /* Figure out which choice this line belongs to */
              let choiceIdx = 0,
                linesCount = 0;
              for (let ci = 0; ci < (convChoices || []).length; ci++) {
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
                if (li >= linesCount && li < linesCount + cLines.length) {
                  choiceIdx = ci;
                  break;
                }
                linesCount += cLines.length + 1;
              }
              if (convChoicePicked === choiceIdx) {
                lineCol = Math.floor(Date.now() / 600) % 2 === 0 ? "#ffd700" : "rgb(150, 112, 9)";
              } else {
                lineCol = phase === "act1" ? (choiceIdx === 0 ? "#c8a070" : "#8a9ab0") : convChoiceHover === choiceIdx ? "#fff" : "#888";
              }
              const bulletCol = choiceMutedColors[choiceIdx % choiceMutedColors.length];
              const rendered = box.lines[li];
              const bulletIdx = rendered.indexOf("\u25B6");
              if (bulletIdx !== -1) {
                grid.set(xPos + 2 + bulletIdx, cy, "\u25B6", applyTextOpacity(bulletCol));
                grid.text(rendered.substring(bulletIdx + 1), xPos + 3 + bulletIdx, cy, applyTextOpacity(lineCol));
              } else {
                grid.text(rendered, xPos + 2, cy, applyTextOpacity(lineCol));
              }
            } else {
              grid.text(box.lines[li], xPos + 2 + Math.max(0, pad), cy, applyTextOpacity(lineCol));
            }
          }
        }
        cy++;
      }

      // Draw bottom border only if visible
      if (cy >= 0 && isVisible) {
        const bottomBorderCol = box.isChoice ? applyBoxOpacity(C_PLAYER) : applyBoxOpacity(box.color);
        grid.text(
          (box.isChoice ? DIALOG_BOX.bl : CONV_BOX.bl) +
            (box.isChoice ? DIALOG_BOX.h : CONV_BOX.h).repeat(boxW - 2) +
            (box.isChoice ? DIALOG_BOX.br : CONV_BOX.br),
          xPos,
          cy,
          bottomBorderCol,
        );
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

  /* Simple one-liner popup — renders directly above a screen position, no stacking.
     duration: how long it shows in ms. To adjust vertical offset, change the - 3. */
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
          /* Clean ruelles */
        } else {
          const hr = ly < HH ? 0 : 1,
            hly = hr === 0 ? ly : ly - HH - RUH;
          const bc = ((Math.floor(mx / CW) % 30) + 30) % 30,
            br = ((Math.floor(my / CH) % 30) + 30) % 30;
          const hi = Math.floor(lx / HW),
            ai = (bc + br + hi + hr * 2) % HA.length,
            ci = (bc * 3 + br * 7 + hi * 5 + hr) % HC.length;
          // Top row of each house block = roof
          if (hly === 0) {
            const roofW = HW;
            const col = lx % roofW;
            let roofCh;
            if (col === 0) roofCh = "/";
            else if (col === roofW - 1) roofCh = "\\";
            else roofCh = "\u2584"; // ▄ filled lower half = flat roof cap
            grid.set(sx, sy, roofCh, HC[ci]);
          } else {
            // Everything else: original HA art + HC colors
            if (hly < HA[ai].length) {
              const ch = HA[ai][hly];
              if (ch !== " ") grid.set(sx, sy, ch, HC[ci]);
            }
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

  gs.addEventListener("pointermove", (e) => {
    e.preventDefault();
    if (!convChoices) return;
    const r = gs.getBoundingClientRect();
    const { cellH } = _measureCell();
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
    },
    { passive: false },
  );
  gs.addEventListener("pointerup", (e) => {
    e.preventDefault();
    const r = gs.getBoundingClientRect();
    const { cellW, cellH } = _measureCell();
    clickSX = Math.floor((e.clientX - r.left) / cellW);
    clickSY = Math.floor((e.clientY - r.top) / cellH);
    clickPending = true;
    // Universal click feedback — small spark wherever you tap
    spark(clickSX, clickSY, "#9c9c9ca0", 4);
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
      { x: ex0 - 4, y: ry0 },
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
      const msg = Util.pick(window.LANG.act1AmbMutters);
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
        an.msg = Util.pick(window.LANG.act1AmbMutters);
      }
      if (an.msgT > 0) an.msgT -= dt;
    }
    if (a1St === "pause") {
      a1ST2 += dt;
      // wait for all intro banners to finish before walking
      if (bannerTimer <= 0 && a1ST2 > 800) {
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
          const _encOX = Math.floor(a1CX),
            _encOY = Math.floor(a1CY);
          spark(Math.round(a1PX) - _encOX, Math.round(a1PY) - _encOY, C_DIM, 2);
          a1ES = 0;
          a1ST2 = 0;
          a1EncNPC = a1NPCs[a1EI];
        } else if (a1NP === 0 && a1St !== "tap") {
          a1St = "tap";
          a1ST2 = 0;
          a1IdleTimer = 0;
          clickPending = false;
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
        if (a1NP < NQ.length) {
          const q = NQ[a1NP];
          if (q.pause) {
            a1PauseT = q.d;
          } else if (q.seq) {
            showBannerSequence(q.seq, true);
          } else {
            showBanner(q.t, q.c, q.d, true);
          }
          a1NP++;
        } else {
          a1St = "done";
          a1ST2 = 0;
        }
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
        } else if (a1ST2 > (turns[a1ES - 1]?.hold ?? 3500)) {
          // ACT 1 TIMING: how long the previous line stays on screen
          // before this one appears. Set per-line via `hold:` in lang data.
          // Default (no `hold` set) = 3500ms.
          const t = turns[a1ES];
          const side = t.who === "p" ? "you" : "them";
          const col = t.who === "p" ? C_PLAYER : convNPCColor;
          const txt = t.texts ? t.texts[Math.min(a1LoopCount - 1, t.texts.length - 1)] : t.text;
          convAddLine(txt, side, col);
          a1ES++;
          a1ST2 = 0;
        }
        // pause after last conversational line
      } else if (a1ST2 > (turns[turns.length - 1]?.hold ?? 3500)) {
        // ACT 1 TIMING: how long the LAST line stays before the conversation
        // closes and the player walks on. Uses the last turn's `hold:` value.
        // Default (no `hold` set) = 3500ms.
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
          triggerFlashGold();
          convChoicePicked = clickSY < splitY ? 0 : 1;
          a1ST2 = 0;
          if (clickSY < splitY) {
            // "I've had enough"
            const ox = Math.floor(a1CX),
              oy = Math.floor(a1CY);
            const px = Math.round(a1PX) - ox,
              py = Math.round(a1PY) - oy;
            // Hold for flash, then fade conv and advance
            setTimeout(() => {
              convStartFade();
              a1St = "outro";
              burstGood(px, py, C_PLAYER, 16);
              triggerFlashGood();
              a1NP = 0;
              a1ST2 = 0;
              a1PauseT = 1200;
              setTimeout(() => {
                showBanner(NQ[0].t, NQ[0].c, NQ[0].d);
                a1NP = 1;
              }, 1200);
            }, 600);
          } else {
            // "keep living like this"
            const lm = A1_LOOP_MSGS[Math.min(a1LoopCount, A1_LOOP_MSGS.length - 1)];
            // Hold for flash, then advance
            setTimeout(() => {
              convStartFade();
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
                { x: Math.round(a1PX), y: Math.round(a1PY) },
                { x: a1StartX, y: Math.round(a1PY) },
                { x: a1StartX, y: a1StartY },
              ];
              a1PI = 0;
            }, 600);
          }
        }
        /* else: click outside choice — ignore, keep box visible */
      }
      // Keyboard: down = "keep living" → loop, up = "I've had enough" → outro
      if (a1ST2 > 800) {
        if (input.justPressed("up")) {
          audio.play("click");
          triggerFlashGold();
          convChoicePicked = 0;
          a1ST2 = 0;
          setTimeout(() => {
            convStartFade();
            a1St = "outro";
            a1NP = 0;
            a1ST2 = 0;
            a1PauseT = 1200;
            setTimeout(() => {
              showBanner(NQ[0].t, NQ[0].c, NQ[0].d);
              a1NP = 1;
            }, 1200);
          }, 600);
        }
        if (input.justPressed("down")) {
          audio.play("click");
          triggerFlashGold();
          convChoicePicked = 1;
          a1ST2 = 0;
          setTimeout(() => {
            convStartFade();
            const lm = A1_LOOP_MSGS[Math.min(a1LoopCount, A1_LOOP_MSGS.length - 1)];
            showBanner(lm.t, lm.c, 2000, true);
            a1LoopCount++;
            if (a1LoopCount > 5) {
              Music.stop();
              phase = "done";
              loop.stop();
              overlay.classList.remove("hidden");
              ovTitle.textContent = window.LANG.loopGiveUpTitle;
              ovTitle.style.color = C_DANGER;
              ovSub.textContent = window.LANG.loopGiveUpSub;
              ovHint.textContent = "";
              startBtn.textContent = window.LANG.loopTryAgain;
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
              { x: Math.round(a1PX), y: Math.round(a1PY) },
              { x: a1StartX, y: Math.round(a1PY) },
              { x: a1StartX, y: a1StartY },
            ];
            a1PI = 0;
          }, 600);
        }
      }
    } else if (a1St === "outro") {
      a1ST2 += dt;
      a1PX += 0.005 * dt;
      if (a1PauseT > 0) {
        a1PauseT -= dt;
        return;
      }

      if (!_bannerSeq && bannerTimer <= 0) {
        if (a1NP < NQ.length) {
          const q = NQ[a1NP];
          a1NP++;
          if (q.pause) {
            a1PauseT = q.d;
          } else if (q.seq) {
            showBannerSequence(q.seq, true);
          } else {
            showBanner(q.t, q.c, q.d, true);
          }
        } else {
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
            { t: window.LANG.bannerRecruitCrew, c: C_ORANGE, d: 2000 },
            { pause: true, d: 800 }, // ← pause before narcs warning
            { t: window.LANG.bannerWatchNarcs, c: C_ORANGE, d: 2500 },
          ],
          initAct2,
          0,
          Device.isMobile ? window.LANG.controlsAct2Mobile : window.LANG.controlsAct2,
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
    const _walking = a1St === "walk" || a1St === "outro" || a1St === "loop" || a1St === "descend";
    const _pChar = _walking ? (Math.floor(a1T / 2) % 2 === 0 ? "@" : "\u0398") : "@";
    if (px >= 0 && px < W && py >= 0 && py < H) grid.set(px, py, _pChar, playerPulseColor(a1T));

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
  /////////////////////
  // act 2
  /////////////////////

  /* ══════════════════════════════════════════════════════════════════
   ACT 2: RECRUIT
   ══════════════════════════════════════════════════════════════════ */

  const A2_MIN = 3,
    A2_MH = 3;
  // how long you have to play act 2
  const A2_TIME_LIMIT_MS = 100000;
  const A2_TIME_WARN_MS = 70000;
  const BUILDINGS = window.GAME_DATA.buildings;

  function tileBuildings(blockW) {
    const pieces = [];
    let remain = blockW,
      iter = 0,
      lastArt = null;
    while (remain > 0 && iter++ < 20) {
      const fits = BUILDINGS.filter((b) => b.size <= remain);
      if (fits.length === 0) break;
      const canClean = fits.filter((b) => {
        const r = remain - b.size;
        return r === 0 || r >= 6;
      });
      const pool = canClean.length > 0 ? canClean : fits;
      const noRepeat = pool.filter((b) => b.art !== lastArt);
      const chosen = (noRepeat.length > 0 ? noRepeat : pool)[Math.floor(Math.random() * (noRepeat.length > 0 ? noRepeat.length : pool.length))];
      lastArt = chosen.art;
      pieces.push({ art: chosen.art, w: chosen.size });
      remain -= chosen.size;
    }
    return pieces;
  }

  const A2_BCOL = ["#b9a89a", "#9ab89a", "#9a9ab8", "#b8a09a", "#9aa8b0", "#a89ab0", "#b0a898", "#98a8b0"];
  const A2_PA = window.GAME_DATA.playerArt;
  const A2_NPC_ARTS = window.GAME_DATA.npcArts;
  const A2_NPC_COLORS = window.GAME_DATA.npcColors;
  const A2_NPC = window.GAME_DATA.npcArts[0];
  const A2_NARC = window.GAME_DATA.narcArt;
  const A2_ROB = window.GAME_DATA.robinArt;

  const A2_NUM_LANES = 6;
  let A2_RU_H = 3,
    A2_VRW = 7;
  let A2_BH_PER, A2_LANE_YS, A2_GND, A2_TOP_PAD;

  let a2WX, a2T, a2Ht, a2Spd;
  let a2Blocks, a2Roads, a2NPCs, a2Crew, a2Clouds;
  let a2PX, a2PY, a2PRu, a2PAnim, a2PAnimT, a2TargetY, a2Hopping;
  let a2HopIntent, a2HopTimer;
  let a2TN, a2TP, a2TT, a2TalkCD;
  let a2Choice,
    a2ChoiceLabels,
    a2PitchLines = [],
    a2ChoiceTags = [],
    a2LastGreetTone;
  let a2SV, a2SW, a2SD, a2SDT, a2SDFired;
  let a2Gen;
  let a2HudFlashT, a2HudFlashMsg;
  let a2TimeWarned;
  let a2MobileMoveX, a2MobileMoveT;
  let a2bMobileMoveX, a2bMobileMoveT;

  /* ── Act 2: conversation timing constants ────────────────────────
   All expressed through T.* — change T values above to retune.

   A2_GREET_DELAY    how long before the NPC first replies after
                     the player opens with a greeting
   A2_CHOICE_LOCK    minimum ms before a choice registers a click
                     (prevents accidental double-taps)
   A2_INVITE_DELAY   after filler line — before invite choices appear
   A2_BAIL_CLOSE     after NPC bail response — before panel closes
   A2_RECRUIT_CLOSE  after recruit confirmation — before panel closes
   A2_NARC_PAUSE     after narc reveal — before consequence fires
   ─────────────────────────────────────────────────────────────── */
  const A2 = {
    GREET_DELAY: T.reply, // 1800ms
    CHOICE_LOCK: 900, // min ms before click registers
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
    const totalStreetH = numRoads * A2_RU_H * 2;
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
    return a2RuY(n.ru);
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
      for (let band = 0; band <= 3; band++) {
        const { y: bandY, h: bandH } = a2BandY(band);
        if (bandH < 2) continue;
        a2Blocks.push({ wx: leftE, y: bandY, w: rightE - leftE, h: bandH, band, bldgs: [] });
        const blk = a2Blocks[a2Blocks.length - 1];
        const availW = rightE - leftE - 2;
        const tiles = tileBuildings(availW);
        let bx2 = leftE + 1;
        for (const tile of tiles) {
          blk.bldgs.push({ dx: bx2 - leftE, art: tile.art, color: Util.pick(A2_BCOL), w: tile.w });
          bx2 += tile.w;
        }
      }
    }

    const mobileMinLane = Device.isMobile ? Math.max(2, A2_NUM_LANES - 4) : 2;
    const MIN_NPC_GAP = 55,
      MAX_NPC_GAP = 90;
    for (let ri = mobileMinLane; ri < A2_NUM_LANES; ri++) {
      const laneOffset = (ri - mobileMinLane) * 18;
      for (let nx = from + MIN_NPC_GAP + laneOffset; nx < to; nx += Util.randInt(MIN_NPC_GAP, MAX_NPC_GAP)) {
        let onRoad = false;
        for (const rd of a2Roads) if (nx >= rd.wx - 1 && nx <= rd.wx + A2_VRW + 1) onRoad = true;
        if (onRoad) continue;

        // how likely you are to encounter a narc
        const r = Math.random();
        let tp, tl;
        if (r < 0.25) {
          tp = "narc";
          tl = 0;
        } else if (r < 0.32) {
          tp = "cat";
          tl = 0;
        } else if (r < 0.48) {
          tp = "coin";
          tl = 0;
        } else if (r < 0.55) {
          tp = "resist";
          tl = 1;
        } else {
          tp = "norm";
          tl = 1;
        }
        // Prevent same interactable type appearing 3+ times in a row
        if (tp === "cat" || tp === "coin" || tp === "narc") {
          const recent = a2NPCs.slice(-2).map((n) => n.tp);
          if (recent.length === 2 && recent[0] === tp && recent[1] === tp) {
            tp = "norm";
            tl = 1;
          }
        }
        const npcKind = Math.random() < 0.5 ? "hungry" : "angry";

        const ambLine =
          tp === "narc"
            ? drawAmb(DECK_AMB_NARC)
            : tp === "cat"
              ? Util.pick(["miaou...", "prrrr", "mrrrow"])
              : tp === "coin"
                ? ""
                : npcKind === "hungry"
                  ? drawAmb(DECK_AMB_HUNGRY)
                  : drawAmb(DECK_AMB_ANGRY);

        const narcHeads = ["$", "€", "£", "¥", "₿", "₽"];
        const narcHead = Util.pick(narcHeads);
        const narcBody = Util.pick(["\u03C6", "ψ", "Ω", "\u00A7"]);
        const npcArt = tp === "narc" ? [narcHead, narcBody] : tp === "cat" ? [" ", "ஹ"] : tp === "coin" ? [" ", "\u25CE"] : Util.pick(A2_NPC_ARTS);

        //  const narcCols = ["#ffaa44", "#ff8866", "#ffcc33", "#ff9955", "#ffbb55"];
        const narcCols = ["#cc6688", "#bb5577", "#dd5599", "#aa4488", "#cc4477"];
        const npcCol = tp === "narc" ? Util.pick(narcCols) : tp === "cat" ? "#ee8833" : tp === "coin" ? "#c8a800" : Util.pick(A2_NPC_COLORS);
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

  function _updateDomHud() {
    if (phase === "act2") {
      const pips = [];
      for (let i = 0; i < A2_MIN; i++) pips.push(i < a2CrewCount ? "\u25C6" : "\u25C7");
      const tl = Math.max(0, Math.floor((A2_TIME_LIMIT_MS - a2T) / 1000));
      const heatStr = a2Ht > 0 ? "  ! NARCS: " + a2Ht + "/" + A2_MH : "";
      hudLabel.textContent = window.LANG.hudRecruit + " " + pips.join("") + " " + a2CrewCount + "/" + A2_MIN;
      hudLabel.style.color = a2CrewCount >= A2_MIN ? C_SUCCESS : C_TEAL;
      hudScore.textContent = "";
      hudStatus.textContent = window.LANG.hudTime + ": " + tl + "s" + heatStr;
      hudStatus.style.color = a2Ht > 0 ? C_DANGER : tl < 15 ? C_WARN : C_DIM;
    } else if (phase === "act2b") {
      hudLabel.textContent = window.LANG.hudRally + "  " + window.LANG.hudMob + ": " + a2CrewCount;
      hudLabel.style.color = C_TEAL;
      hudScore.textContent = "";
      hudStatus.textContent = a2bHt > 0 ? "! " + window.LANG.hudNarcs + ": " + a2bHt + "/" + A2B_MH : window.LANG.hudAvoidNarcs;
      hudStatus.style.color = a2bHt > 0 ? C_DANGER : C_DIM;
    } else if (phase === "act4") {
      const my = state.get("score") || 0;
      const _jitter = s4Ug > 0.2 ? (Math.random() < 0.15 ? 1 : 0) : 0;
      const _ugFilled = Math.min(8, Math.round(s4Ug * 8) + _jitter);
      const _bar = "\u2588".repeat(_ugFilled) + "\u2591".repeat(8 - _ugFilled);

      // hudLabel.textContent = "HAUL: $" + (my + s4AlyScore);

      hudLabel.textContent = window.LANG.hudHaul + ": $" + (my + s4AlyScore);

      window.LANG.hudRally + "  ";
      hudLabel.style.color = C_PLAYER;
      hudScore.textContent = "";
      // hudStatus.textContent = "COPS: " + _bar;
      hudStatus.textContent = window.LANG.hudCops + ": " + _bar;

      hudStatus.style.color = s4Ug < 0.35 ? C_TEAL : s4Ug < 0.7 ? C_WARN : C_DANGER;
    } else {
      hudLabel.textContent = "";
      hudScore.textContent = "";
      hudStatus.textContent = "";
    }
  }

  function initAct2() {
    audio.play("level");
    Music.transition("music_act2");
    audio.preload(["music_act3"]);
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
    a2MobileMoveX = 0;
    a2MobileMoveT = 0;
    a2SV = false;
    a2SW = 500;
    a2SD = false;
    a2SDT = null;
    a2SDFired = false;
    dialogStack = [];
    a2GenChunk(0, W * 3);
    _updateDomHud();
    bannerTimer = 0;
  }

  /* Pick a prefix from a pool, preferring entries whose vibes overlap
     with the hello line's vibes. Backwards-compatible: plain strings
     in the pool are treated as untagged (always eligible).
     - pool: array of strings or {t, vibes:[...]} objects
     - helloVibes: array of vibe strings from the hello line's tags
     Returns the prefix text (no trailing space), or "" if pool empty. */
  function pickPrefix(pool, helloVibes) {
    if (!pool || pool.length === 0) return "";
    const norm = pool.map((p) => (typeof p === "string" ? { t: p, vibes: [] } : p));
    let matching = norm.filter((p) => p.vibes.length === 0 || p.vibes.some((v) => (helloVibes || []).includes(v)));
    if (matching.length === 0) matching = norm;
    return matching[Math.floor(Math.random() * matching.length)].t;
  }

  function updateAct2(dt) {
    if (!a2TN) a2T += dt;
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

    /* ── CONVERSATION STATE MACHINE (a2TP) ──────────────────────
     The core logic is unchanged — only the timing comparisons
     now read from T.* and A2.* instead of scattered literals.
     ─────────────────────────────────────────────────────────── */
    if (a2TN) {
      const _lastFullyTyped = convLog.length === 0 || convReveal[convLog.length - 1] >= convLog[convLog.length - 1].text.length;
      if (_convChunkQueue.length === 0 && _lastFullyTyped) a2TT += dt;

      const psx = Math.round(a2PX),
        nsx = Math.round(a2TN.wx - a2WX),
        psy = Math.round(a2PY);
      convAnchorPX = psx;
      convAnchorNX = nsx;
      convAnchorY = psy;

      // ── TP 0: open conv, fire greet ───────────────────────────
      if (a2TP === 0 && a2TT > T.beat) {
        dialogStack = [];
        convReset();
        convAnchorPX = psx;
        convAnchorNX = nsx;
        convAnchorY = psy;
        convPlayerColor = C_PLAYER;
        convNPCColor = a2TN.col || "#7a8aaa";
        convVisible = true;
        DM.startConv();
        const greetResult = DM.drawWithTags(DECK_GREET);
        a2TN.greetTone = greetResult.tags[0] ?? "casual";
        convAddLine(greetResult.text, "you", convPlayerColor);
        a2TP = 12;
        a2TT = 0;
      }

      // ── TP 2: immediate join after match ──────────────────────
      else if (a2TP === 2 && a2TT > readDelay(convLog[convLog.length - 1]?.text) && _convChunkQueue.length === 0) {
        const joinLine = DM.draw(DECK_JOIN_CONSENT, a2TN.helloTags ?? []);
        convAddLine(joinLine, "them", convNPCColor);
        a2TP = 8;
        a2TT = 0;
      }

      // ── TP 12: wait before NPC replies ───────────────────────
      else if (a2TP === 12 && a2TT > A2.GREET_DELAY && _convChunkQueue.length === 0) {
        let helloDeck;
        if (a2TN.tp === "narc") helloDeck = DECK_NARC_HELLO;
        else if (a2TN.kind === "angry") helloDeck = DECK_ANGRY_HELLO;
        else helloDeck = DECK_HUNGRY_HELLO;

        DM.clearLastTags();
        const { text: line, tags } = DM.drawWithTags(helloDeck);
        a2TN.helloTags = tags;

        const tone = a2TN.greetTone ?? "casual";
        const npcType = a2TN.tp === "narc" ? "narc" : a2TN.kind;
        const prefixPool = HELLO_PREFIX[tone]?.[npcType] ?? [];
        const prefixText = pickPrefix(prefixPool, tags);
        const prefix = prefixText ? prefixText + " " : "";
        convAddLine(prefix + line, "them", convNPCColor);
        a2TP = 13;
        a2TT = 0;
      }

      // ── TP 13: show first pitch choices ──────────────────────
      else if (a2TP === 13 && a2TT > readDelay(convLog[convLog.length - 1]?.text) && _convChunkQueue.length === 0) {
        // const prefix = a2TN.tp === "narc" ? DM.draw(DECK_ACK_NARC) + " " : "";
        const matchResult = DM.drawWithTags(
          a2TN.tp === "narc" ? DECK_NARC_AGREE : a2TN.kind === "angry" ? DECK_ANGRY_PITCH : DECK_HUNGRY_PITCH,
          a2TN.helloTags ?? [],
        );
        const badReadResult = DM.drawWithTags(DECK_BAD_READ, a2TN.helloTags ?? []);
        const bailResult = DM.drawWithTags(DECK_BACK_OFF_EARLY, a2TN.helloTags ?? []);
        a2ChoiceTags = [matchResult.tags, badReadResult.tags, bailResult.tags];
        a2PitchLines = [matchResult.text, badReadResult.text, bailResult.text];
        DM.clearLastTags();
        const commiserateLabel = a2TN.kind === "angry" ? window.LANG.choiceCommiserateAngry : window.LANG.choiceCommiserateHungry;
        a2ChoiceLabels = [commiserateLabel, window.LANG.choiceTalkOver, window.LANG.choiceRun];
        convShowChoices(a2ChoiceLabels);
        a2Choice = -1;
        a2TP = 1;
        a2TT = 0;
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
            if (picked < convChoices.length - 1 || clickSY >= lastChoiceStart) a2Choice = picked;
          }
        }
        if (input.justPressed("up")) convChoiceHover = Math.max(0, (convChoiceHover < 0 ? 0 : convChoiceHover) - 1);
        if (input.justPressed("down")) convChoiceHover = Math.min((convChoices?.length ?? 1) - 1, (convChoiceHover < 0 ? -1 : convChoiceHover) + 1);
        if (input.justPressed("action") && convChoiceHover >= 0) a2Choice = convChoiceHover;

        if (a2Choice >= 0 && a2TP === 1) {
          audio.play("click");
          triggerFlashGold();
          convChoicePicked = a2Choice;
          const _line = a2PitchLines[a2Choice];
          const _picked = a2Choice;
          const _startPhase = phase;
          setTimeout(() => {
            if (phase !== _startPhase || !a2TN) return;
            convChoicePicked = -1;
            convHideChoices();
            convAddLine(_line, "you", convPlayerColor);
          }, 600);
          if (_picked === 2) a2TP = 25;
          else if (_picked === 1 && a2TN.tp !== "narc") a2TP = 14;
          else a2TP = 141;
          a2TT = -600;
        }
      }

      // ── TP 141: route after first pitch ──────────────────────
      // ACT 2 TIMING: how long the player's pitch line holds before the NPC's filler reply appears.
      // Raise the number to give the player's punchline more room. Default min 3000ms.
      else if (a2TP === 141 && a2TT > readDelay(convLog[convLog.length - 1]?.text, 3000) && _convChunkQueue.length === 0) {
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

      // ── TP 142: wait for invite/walk away choice ──────────────
      // ACT 2 TIMING: how long the NPC's filler line holds before recruit/walk-away choices appear.
      // Raise the number to give the player time to read the filler. Default min 5000ms.
      else if (a2TP === 142 && a2TT > readDelay(convLog[convLog.length - 1]?.text, 6000) && _convChunkQueue.length === 0) {
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
          audio.play("click");
          triggerFlashGold();
          convChoicePicked = a2Choice;
          const _line = a2PitchLines[a2Choice];
          const _picked = a2Choice;
          const _startPhase = phase;
          setTimeout(() => {
            if (phase !== _startPhase || !a2TN) return;
            convChoicePicked = -1;
            convHideChoices();
            convAddLine(_line, "you", convPlayerColor);
          }, 600);
          if (_picked === 1) a2ChoiceTags[2] = a2TN.bailLateTags ?? [];
          a2TP = _picked === 1 ? 25 : 14;
          a2TT = -600;
        }
      }

      // ── TP 14: check match, route ─────────────────────────────
      // ACT 2 TIMING: how long the player's invite line holds before the NPC's say-more reply appears.
      // Raise the number to give the invite room to land. Default min 2400ms.
      else if (a2TP === 14 && a2TT > readDelay(convLog[convLog.length - 1]?.text, 2400) && _convChunkQueue.length === 0) {
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
          if (Math.random() < 0.8) {
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

      // ── TP 15: show second round choices ─────────────────────
      // ACT 2 TIMING: how long the NPC's say-more line holds before try-harder/walk-away choices appear.
      // Raise the number to give the player time to read the NPC's deeper question. Default min 3000ms.
      else if (a2TP === 15 && a2TT > readDelay(convLog[convLog.length - 1]?.text, 3000) && _convChunkQueue.length === 0) {
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
          audio.play("click");
          triggerFlashGold();
          convChoicePicked = a2Choice;
          const _line = a2PitchLines[a2Choice];
          const _startPhase = phase;
          setTimeout(() => {
            if (phase !== _startPhase || !a2TN) return;
            convChoicePicked = -1;
            convHideChoices();
            convAddLine(_line, "you", convPlayerColor);
          }, 600);
          a2TP = 24;
          a2TT = -600;
        }
      }

      // ── TP 24: resolve second choice ─────────────────────────
      else if (a2TP === 24 && a2TT > readDelay(convLog[convLog.length - 1]?.text) && _convChunkQueue.length === 0) {
        if (a2Choice === 1) {
          DM.endConv();
          const wasNarc = a2TN.tp === "narc";
          a2TN.st = "done";
          a2TN.cd = 9999;
          a2TN = null;
          a2TalkCD = 500;
          if (wasNarc) showBanner(window.LANG.bannerGoodCallNarc, C_SUCCESS, T.bannerHold);
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

      // ── TP 25: player bailed first round ─────────────────────
      else if (a2TP === 25 && a2TT > T.hold && _convChunkQueue.length === 0) {
        convAddLine(DM.draw(DECK_BAIL_RESPONSE, a2ChoiceTags[2] ?? []), "them", convNPCColor);
        a2TP = 251;
        a2TT = 0;
      }

      // ── TP 251: close after bail ──────────────────────────────
      else if (a2TP === 251 && a2TT > readDelay(convLog[convLog.length - 1]?.text, A2.BAIL_CLOSE) && _convChunkQueue.length === 0) {
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

      // ── TP 7: NPC declined ────────────────────────────────────
      else if (a2TP === 7 && a2TT > readDelay(convLog[convLog.length - 1]?.text, A2.MISMATCH_CLOSE) && _convChunkQueue.length === 0) {
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

      // ── TP 8: recruit! ────────────────────────────────────────────
      else if (a2TP === 8 && a2TT > readDelay(convLog[convLog.length - 1]?.text) && _convChunkQueue.length === 0) {
        DM.endConv();
        const n = a2TN;
        n.st = "rec";
        a2CrewCount++;
        audio.play("recruit");
        // addFloat(Util.pick([window.LANG.floatNewRobin, window.LANG.floatTheyreIn, window.LANG.floatCrewGrows]), 0, 0, C_TEAL);

        // Big celebration sparks
        for (let _bi = 0; _bi < 4; _bi++) spark(Math.round(a2PX) + Util.randInt(-3, 3), Math.round(a2PY) + Util.randInt(-2, 2), C_TEAL, 12);
        triggerFlashGood();
        a2Crew.push({ b: Math.random() * 6, ru: n.ru, art: n.art, col: n.col });
        // Progress message
        const _rem = A2_MIN - a2CrewCount;
        let _progressMsg;
        if (_rem > 0) {
          const _ordinals = window.LANG.recruitOrdinals;
          const _haveOrd = _ordinals[a2CrewCount - 1] || String(a2CrewCount);
          const _remOrd = _ordinals[_rem - 1] || String(_rem);
          // French elision: "plus que une" → "plus qu'une" before vowel-initial words
          const _firstChar = _remOrd.charAt(0).toLowerCase();
          const _isVowel = /[aeiouhàâéèêëîïôùûüœ]/.test(_firstChar);
          const _que = window.LANG === window.LANG_FR ? (_isVowel ? "PLUS QU'" : "PLUS QUE ") : "";
          _progressMsg = window.LANG.recruitProgress1
            .replace("{ord}", _haveOrd.toUpperCase())
            .replace("{que} ", _que)
            .replace("{que}", _que.trim())
            .replace("{rem}", _remOrd.toUpperCase())
            .replace("{remaining}", window.LANG.recruitProgressRemaining);
        } else {
          _progressMsg = window.LANG.recruitProgressComplete;
        }

        if (!_progressMsg || _progressMsg.trim() === "") _progressMsg = a2CrewCount + "/" + A2_MIN;
        // Only show progress float for non-final recruits — final recruit gets the big celebration instead
        if (_rem > 0) {
          setTimeout(() => addFloat(_progressMsg, 0, 0, C_ORANGE), convFadeDuration + 400);
        }
        a2TN.cd = 1000;
        a2TN = null;
        a2TalkCD = 500;
        convEndWhenDone(A2.RECRUIT_CLOSE, () => {
          dialogStack = [];
          convStartFade();
        });
      }

      // ── TP 9: narc reveal consequence ─────────────────────────
      else if (a2TP === 9 && a2TT > readDelay(convLog[convLog.length - 1]?.text, A2.NARC_PAUSE) && _convChunkQueue.length === 0) {
        DM.endConv();
        const n = a2TN;
        n.st = "angry";
        n.col = C_DANGER;
        a2Ht++;
        audio.play("narc");
        addFloat(window.LANG.floatNarc, 0, 0, C_DANGER);

        spark(Math.round(a2PX), Math.round(a2PY), C_DANGER, 14);
        triggerChromatic(500);
        for (let _nb = 0; _nb < 5; _nb++) spark(Math.round(a2PX) + Util.randInt(-4, 4), Math.round(a2PY) + Util.randInt(-2, 2), C_DANGER, 14);
        spark(Math.round(a2TN.wx - a2WX), Math.round(a2NpcY(a2TN)), C_DANGER, 16);
        if (a2Ht >= A2_MH) setTimeout(() => quickBust("busted", initAct2), 2000);
        a2TN.cd = 1000;
        a2TN = null;
        a2TalkCD = 500;
        convEndWhenDone(T.exit, () => {
          dialogStack = [];
          convReset();
        });
      }

      // ── TP 10: NPC defers ─────────────────────────────────────
      else if (a2TP === 10 && a2TT > readDelay(convLog[convLog.length - 1]?.text) && _convChunkQueue.length === 0) {
        DM.endConv();
        const n = a2TN;
        n.st = "maybe";
        n.cd = 9999;
        addFloat(Util.pick([window.LANG.floatNotYet, window.LANG.floatNeedTime]), 0, 0, "#a80");
        a2TN = null;
        a2TalkCD = 500;
        convEndWhenDone(T.exit, () => {
          dialogStack = [];
          convStartFade();
        });
        setTimeout(
          () => {
            if (n.st === "maybe" && !a2TN) {
              n.st = "rec";
              a2CrewCount++;
              audio.play("recruit");
              a2Crew.push({ b: Math.random() * 6, ru: n.ru, art: n.art, col: n.col });
              convReset();
              convAnchorPX = Math.round(a2PX);
              convAnchorNX = Math.round(n.wx - a2WX);
              convAnchorY = Math.round(a2PY);
              convPlayerColor = C_PLAYER;
              convNPCColor = n.col;
              convVisible = true;
              convAddLine(DM.draw(DECK_RETURN, n.notNowTags ?? []), "them", n.col);
              convEndWhenDone(T.exit, () => {
                dialogStack = [];
                convStartFade();
              });
              hudScore.textContent = a2CrewCount;
            }
          },
          4000 + Math.random() * 3000,
        );
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
          for (let _bi = 0; _bi < 4; _bi++) {
            burstGood(Util.randInt(4, W - 4), Util.randInt(2, H - 4), C_TEAL, 8);
          }
          triggerFlashGood();
        }, 700);
        setTimeout(() => {
          for (let _bi = 0; _bi < 3; _bi++) {
            burstGood(ppx + Util.randInt(-10, 10), ppy + Util.randInt(-3, 3), C_TEAL, 8);
          }
          triggerFlashGold();
        }, 1100);
        showBanner(window.LANG.bannerYouHaveACrew, C_PLAYER, 99999);
      }
      // Hold the celebration ~3s total, then auto-cut to inter (no tap needed)
      if (a2SDFired && a2SDT > convFadeDuration + 200 + 3000) {
        bannerTimer = 0;
        initInter(
          [
            { t: window.LANG.bannerRallyNeighbourhood, c: C_ORANGE, d: 2000 },
            { pause: true, d: T.bannerBeat },
            { t: window.LANG.bannerAvoidNarcs, c: C_ORANGE, d: 2500 },
          ],
          initAct2b,
          1,
          Device.isMobile ? window.LANG.controlsAct2bMobile : window.LANG.controlsAct2b,
        );
      }
      return;
    }

    if (!a2SV && a2CrewCount >= A2_MIN) {
      a2SV = true;
      a2SD = true;
    }

    a2Spd = 0.004 + a2T * 0.00000015;
    // Pause world scroll while conversation panel is visible or fading out
    if (!convVisible && !convFading) a2WX += a2Spd * dt;
    while (a2Gen < a2WX + W + 150) a2GenChunk(a2Gen, a2Gen + 80);

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
      const sameRoad = Math.floor(a2PRu / 2) === Math.floor(newRu / 2);
      let atGap = sameRoad;
      if (!atGap)
        for (const rd of a2Roads)
          if (pwx >= rd.wx - 2 && pwx <= rd.wx + A2_VRW + 2) {
            atGap = true;
            break;
          }
      if (!atGap)
        for (const blk of a2Blocks)
          if (Math.abs(pwx - blk.wx) <= 3 || Math.abs(pwx - (blk.wx + blk.w)) <= 3) {
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
      }
    }

    if (!convVisible) {
      const a2TapStep = 2;
      if (input.isDown("left")) a2PX -= 0.02 * dt;
      else if (input.justPressed("left")) a2PX -= a2TapStep;
      if (input.isDown("right")) a2PX += 0.02 * dt;
      else if (input.justPressed("right")) a2PX += a2TapStep;
      a2PX = Util.clamp(a2PX, 4, W - 6);
    }

    a2Blocks = a2Blocks.filter((b) => b.wx + b.w > a2WX - W);
    a2Roads = a2Roads.filter((r) => r.wx + A2_VRW > a2WX - W - 10);
    a2NPCs = a2NPCs.filter((n) => n.wx > a2WX - 20);
    a2Clouds = a2Clouds.filter((c) => c.wx + 10 > a2WX - W);

    const pwx2 = a2WX + a2PX;
    for (const n of a2NPCs) {
      if (n.st !== "idle") continue;
      const dist = Math.abs(n.wx - pwx2);
      n.ambShow = dist < 18 && dist > 3 && a2T > 3000;
    }

    if (a2TalkCD <= 0 && a2T > 1000 && !convVisible) {
      const pwx = a2WX + a2PX;
      for (const n of a2NPCs) {
        if (n.st !== "idle" || n.cd > 0 || n.ru !== a2PRu) continue;
        if (Math.abs(n.wx - pwx) < 3) {
          a2PX = n.wx - a2WX - 3;

          if (n.tp === "coin") {
            n.st = "gone";
            n.cd = 9999;
            audio.play("click");
            spark(Math.round(a2PX), Math.round(a2PY), "#c8a800", 6);
            const coin = Util.pick(window.LANG.coinPickups);
            addFloat(coin.amount + " — " + coin.quip, 0, 0, "#c8a800");
            a2TalkCD = 800;
            break;
          }
          if (n.tp === "cat") {
            n.cd = 9999;
            // Don't set n.st = "done" — keep cat visible in its color
            audio.play("bump");
            spark(Math.round(a2PX), Math.round(a2PY), "#ee8833", 4);
            convReset();
            convAnchorPX = Math.round(a2PX);
            convAnchorNX = Math.round(n.wx - a2WX);
            convAnchorY = Math.round(a2PY);
            convNPCColor = "#ee8833";
            convVisible = true;
            const catLine = Util.pick(window.LANG.catLines);
            convAddLine(catLine.cat, "them", "#ee8833");
            setTimeout(() => {
              if (convVisible) convAddLine(catLine.you, "you", C_PLAYER);
            }, 1800);
            convResetLater(4500);
            a2TalkCD = 4800;
            break;
          }
          // regular NPC conversation
          audio.play("bump");
          spark(Math.round(a2PX), Math.round(a2PY), C_DIM, 6);
          a2TN = n;
          a2TP = 0;
          a2TT = 0;
          a2Choice = -1;
          break;
        }
      }
    }

    if (!a2SV) {
      if (!a2TimeWarned && a2T > A2_TIME_WARN_MS) {
        a2TimeWarned = true;
        showBanner(window.LANG.bannerCopsCircling, C_WARN, T.bannerHold);
      }
      if (a2T > A2_TIME_LIMIT_MS) {
        quickBust("timeout", initAct2);
        return;
      }
    }

    _updateDomHud();
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

    // NPCs — hide recruited ones (they're now in the crew trail) and picked-up coins
    for (const n of a2NPCs) {
      if (n.st === "rec" || n.st === "gone") continue;
      const sx = Math.round(n.wx - a2WX),
        sy = a2NpcY(n);
      if (sx < -3 || sx > W + 3) continue;
      // Cats keep their color even after interaction (n.st stays "idle")
      let col = n.st === "angry" ? C_DANGER : n.st === "done" ? "#333" : n.col;
      /* Narcs fidget too (don't stand still / stiff) */

      let fidget = 0;
      if (n.st === "idle" && n.tp !== "coin") {
        const speed = n.tp === "narc" ? 200 : 400;
        const amp = n.tp === "narc" ? 1.2 : 0.6;
        fidget = Math.round(Math.sin(a2T / speed + n.wx * 3) * amp);
        /* Narcs: one brief colour blip every ~4 s — subtle, rewards attention */
        if (n.tp === "narc" && Math.floor(a2T / 80) % 52 === 0) col = C_DANGER;
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
    const _a2PFrame = [...A2_PA[a2PAnim]];
    const _a2PWalk = a2TN === null; // only animate when not in conversation
    _a2PFrame[1] = _a2PWalk ? (Math.floor(a2T / 160) % 2 === 0 ? A2_PA[a2PAnim][0] : "\u20B3") : A2_PA[a2PAnim][1];
    grid.art(_a2PFrame, ppx, ppy, playerPulseColor(a2T));

    // Ambient mutters above nearby NPCs
    for (const n of a2NPCs) {
      if (!n.ambShow || n.st !== "idle") continue;
      const nsx = Math.round(n.wx - a2WX),
        nsy = a2NpcY(n);
      if (nsx >= 0 && nsx < W - 5) {
        const txt = n.amb.substring(0, Math.min(n.amb.length, W - nsx - 1));
        // make ambient text more visible
        grid.text(txt, nsx - Math.floor(txt.length / 2), nsy - 2, dullColor(n.col, 0.5));
      }
    }
    // Dialogue
    dialogRender();
    // Conversation panel (replaces old choice UI)
    convRender();
    // No tap prompt — auto-advances after celebration holds
    // if (Device.isMobile && a2T < 5000 && !a2TN) {
    //   const fade = a2T > 3500 ? 1 - (a2T - 3500) / 1500 : 1;
    //   const hintCol = fade > 0.6 ? C_DIM : "#444";
    //   // Position hints just above and below the player
    //   const px = Math.round(a2PX),
    //     py = Math.round(a2PY);
    //   grid.textCenter("swipe ↑↓ to change lane", Math.max(1, py - 4), hintCol);
    //   grid.textCenter("hold ◀ ▶ sides to move", Math.min(H - 2, py + 4), hintCol);
    // }

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
    A2B_TOP_H = Math.max(7, Math.floor(H * 0.45));
    A2B_BOT_H = Math.max(5, Math.floor(H * 0.18)); // was 0.32 — let buildings sit near true bottom
    A2B_ROAD_Y1 = A2B_TOP_H + 1;
    A2B_ROAD_Y2 = H - A2B_BOT_H - 2;
  }

  function a2bGenRow(totalWX) {
    const parts = [];
    let sx = 0;
    let shuffled = [];
    while (sx < totalWX) {
      if (shuffled.length === 0) {
        shuffled = [...A2B_BUILDINGS].sort(() => Math.random() - 0.5);
      }
      const bldg = shuffled.pop();
      parts.push({
        wx: sx,
        art: bldg.art,
        w: bldg.size,
        col: Util.pick(A2B_BCOL),
      });
      sx += bldg.size; // no gap
    }
    return parts;
  }

  function a2bGenNPCs() {
    a2bNPCs = []; /* NPCs only in the road zone */
    const midY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    const roadH = A2B_ROAD_Y2 - A2B_ROAD_Y1;
    const spacing = Math.max(7, Math.floor((a2bStoreX - 50) / 45));
    for (let nx = 60; nx < a2bStoreX - 20; nx += Util.randInt(spacing, spacing + 6)) {
      const isNarc = Math.random() < 0.15;
      const ny = Util.randInt(A2B_ROAD_Y1 + 2, A2B_ROAD_Y2 - 2);
      const narcHeads = ["$", "€", "£", "¥", "₿", "₽"];
      const narcHead = Util.pick(narcHeads);
      const narcBody = Util.pick(["\u03C6", "ψ", "Ω", "\u00A7"]);
      const npcArt = isNarc ? [narcHead, narcBody] : Util.pick(A2_NPC_ARTS);
      // const narcCols = ["#ffaa44", "#ff8866", "#ffcc33", "#ff9955", "#ffbb55"];
      const narcCols = ["#cc6688", "#bb5577", "#dd5599", "#aa4488", "#cc4477"];
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
    // a2bPX = 10;
    a2bPX = Math.floor(W * 0.3);

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
    a2bMobileMoveX = 0;
    a2bMobileMoveT = 0;
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

    _updateDomHud();
  }

  function updateAct2b(dt) {
    a2bT += dt;
    updateBanner(dt);
    /* Scroll */
    a2bWX += a2bSpd * dt;
    a2bSpd = 0.007 + a2bT * 0.0000003;
    /* Player movement — constrained to road */
    const ms = 0.025;
    const tapStep = 2; // cells to move per tap — adjust to feel right
    if (input.isDown("up")) a2bPY -= ms * dt;
    else if (input.justPressed("up")) a2bPY -= tapStep;
    if (input.isDown("down")) a2bPY += ms * dt;
    else if (input.justPressed("down")) a2bPY += tapStep;
    // Horizontal input scrolls the WORLD, not just the player's screen position.
    // Pressing right = run forward (everything rushes at you faster).
    // Pressing left = slow down (and slightly back up if held).
    if (input.isDown("right")) a2bWX += ms * dt * 0.6;
    else if (input.justPressed("right")) a2bWX += tapStep * 0.6;
    if (input.isDown("left")) a2bWX -= ms * dt * 0.4;
    else if (input.justPressed("left")) a2bWX -= tapStep * 0.4;

    if (clickPending && phase === "act2b") {
      clickPending = false;
      if (!Device.isMobile) {
        if (clickSY < a2bPY - 2) a2bPY -= 3;
        else if (clickSY > a2bPY + 2) a2bPY += 3;
        if (clickSX < a2bPX - 3) a2bWX -= 2;
        else if (clickSX > a2bPX + 3) a2bWX += 2;
      }
    }
    // Mobile left/right from hold — no mobileMoveX needed

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
        const hitW = Device.isMobile ? 3 : 6;
        const hitH = Device.isMobile ? 1.5 : 3;
        if (Math.abs(n.wx - pwx) < hitW && Math.abs(n.wy - a2bPY) < hitH) {
          if (n.narc) {
            n.st = "narc";
            audio.play("bump");
            audio.play("narc");
            spark(Math.round(a2bPX), Math.round(a2bPY), C_DANGER, 36);
            spark(Math.round(n.wx - a2bWX), Math.round(n.wy), C_DANGER, 36);
            spark(Math.round(W / 2), Math.round(H / 2), C_DANGER, 24);
            triggerChromatic(600);
            a2bHt++;
            showBanner(window.LANG.bannerHitNarc, C_DANGER, 1800);
            popupPush(window.LANG.floatNarc, Math.round(n.wx - a2bWX), n.wy, C_DANGER, 700);
            popupPush(
              Util.pick([window.LANG.floatOops, window.LANG.floatOhNo, window.LANG.floatExclaim]),
              Math.round(a2bPX),
              Math.round(a2bPY),
              C_PLAYER,
              600,
            );
            if (a2bHt >= A2B_MH) {
              setTimeout(() => quickBust("busted", initAct2b), 1500);
              return;
            }
          } else {
            n.st = "joined";
            audio.play("bump");
            a2CrewCount++;
            audio.play("recruit");
            const _hitSX = Math.round(n.wx - a2bWX);
            burstGood(_hitSX, n.wy, n.col, 12);
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
            popupPush(
              Util.pick([
                window.LANG.floatOui,
                window.LANG.floatLetsGo,
                window.LANG.floatAllonsY,
                window.LANG.floatCountMeIn,
                window.LANG.floatYeah,
                window.LANG.floatForReal,
              ]),
              _hitSX,
              n.wy,
              n.col,
              400,
            );
          }
        }
      }
    }
    /* Update join animations */
    for (const m of a2bMob) {
      if (m.joinAnimT > 0) m.joinAnimT -= dt;
    }

    if (a2bStoreX - a2bWX <= Math.floor(W * 0.7) && !a2bDone) {
      a2bDone = true;
      a2bSpd = 0;
      setTimeout(() => initAct3(), 2500);
    }
    /* HUD */
    _updateDomHud();
  }

  function renderAct2b() {
    /* ── very slow parallax 0.04× ── */
    const mtScrollX = a2bWX * 0.04;
    const mtBaseY = A2B_TOP_H - 1; // mountain base sits at top-band floor

    let peakScreenX = -1;
    let peakScreenY = 99999;

    for (let x = 0; x < W; x++) {
      const wx = x + mtScrollX; // world x (float OK for smooth scroll)

      const period = 220;
      const phase = ((wx % period) + period) % period; // 0..220
      const norm = phase / period; // 0..1

      const dome = Math.exp(-Math.pow((norm - 0.3) * 3.0, 2)); // Secondary shoulder to the right (Outremont side)
      const shoulder = Math.exp(-Math.pow((norm - 0.62) * 5.0, 2)) * 0.35;
      const hillH = Math.round((dome + shoulder) * (A2B_TOP_H * 0.6));

      const topY = mtBaseY - hillH;
      if (topY < peakScreenY) {
        peakScreenY = topY;
        peakScreenX = x;
      }

      const tallestBuilding = Math.max(...a2bTopParts.map((sp) => sp.art.length));

      const hillFloor = A2B_TOP_H - tallestBuilding - 1;
      for (let dy = topY; dy <= Math.min(mtBaseY, hillFloor); dy++) {
        if (dy < 0 || dy >= H) continue;
        const depth = dy - topY; // 0 at peak
        let ch, col;
        if (depth === 0) {
          ch = "\u0BF3";
          col = "#27371c"; // ridgeline
        } else if (depth < 2) {
          ch = "\u0B70";
          col = "#213417"; // dense treeline
        } else if (depth < 5) {
          ch = "\u2592";
          col = "#0e170a";
        } else {
          ch = "\u2591";
          col = "#12200c"; // deep hillside
        }

        grid.set(x, dy, ch, col);
      }
    }

    if (peakScreenX >= 0) {
      const crossArt = [" | ", "-+-", " | "];
      const cx = peakScreenX - 1; // offset left by 1 so center char aligns with peak
      const cy = peakScreenY - 3; // place art above the peak
      grid.art(crossArt, cx, cy, "#f0e8c0");
    }

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
    // const roadMidY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    // for (let x = 0; x < W; x++) {
    //   const wx = x + Math.floor(a2bWX);
    //   if (wx % 8 < 4) grid.set(x, roadMidY, "\u2500", "#ddd");
    // }

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
      const _a2bNpcFrame = [...(n.art || [n.ch, "\u03C6"])];
      if (n.st === "joined") {
        _a2bNpcFrame[1] = Math.floor(a2bT / 200 + n.wx * 0.3) % 2 === 0 ? _a2bNpcFrame[1] : "\u20B3";
      }
      const _a2bNpcCol = n.narc && Math.floor(a2bT / 80) % 52 === 0 ? C_DANGER : n.col;
      grid.art(_a2bNpcFrame, sx, n.wy, _a2bNpcCol);
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
      // Katamari-style: tight orbit around a rolling cluster center
      // Each robin has its own phase so they tumble independently
      const clusterR = 2; // tight cluster radius — increase to spread out
      const angle = a2bT / 600 + m.b; // slow tumble — increase divisor to slow further
      const orbitX = Math.sin(angle + i) * clusterR;
      const orbitY = Math.cos(angle + i) * (clusterR * 0.35);
      const baseOX = -2 - Math.floor(i / 3) * 2;
      const mx = Math.round(ppx + baseOX + orbitX);
      const my = Math.round(ppy + orbitY);
      if (mx >= 0 && mx < W && my > A2B_ROAD_Y1 && my < A2B_ROAD_Y2) {
        const _mobFrame = [...(m.art || [m.ch, "\u03C6"])];
        _mobFrame[1] = Math.floor(a2bT / 200 + m.b * 30) % 2 === 0 ? _mobFrame[1] : "\u20B3";
        let col = m.col || "#3a9a3a";
        if (m.popT && m.popT > 100) col = "#fff";
        grid.art(_mobFrame, mx, my, col);
      }
    }

    /* ── Player — same 2-row art as Act 2 ── */
    const _a2bPFrame = [...A2_PA[Math.floor(a2bT / 10) % 2]];
    _a2bPFrame[1] = Math.floor(a2bT / 180) % 2 === 0 ? _a2bPFrame[1] : "\u20B3";
    grid.art(_a2bPFrame, ppx, ppy, playerPulseColor(a2bT));

    /* ── NPC ambient text boxes ── */
    for (const n of a2bNPCs) {
      const sx = Math.round(n.wx - a2bWX);
      if (sx < -2 || sx > W + 2) continue;
      if (n.st !== "idle") continue;
      if (a2bT <= 800) continue;
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
      const ty = n.wy - bh - 0;
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
    popupRender();

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
    a3EntryBurst = false;
    a3HatsOn = false;
    a3HatQueue = [];
    a3HatQueueT = 0;
    a3PlayerHatted = false;
    if (_originalPlayerHead) removeHats();

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

    hudLabel.textContent = "";
    hudScore.textContent = "";
    hudStatus.textContent = "";
    // Show the rally summary as a banner sequence over the storefront
    showBannerSequence(
      [
        { t: a2CrewCount + " Robins", c: C_PLAYER, d: 2000 },
        { pause: true, d: 700 },
        { t: window.LANG.bannerOneStore.trim(), c: C_PLAYER, d: 2000 },
        { pause: true, d: 700 },
        { t: window.LANG.bannerLetsEat.trim(), c: C_PLAYER, d: 2500 },
      ],
      false,
    );

    // Build walk-in animation: robins slide in from off-screen edges
    {
      const sY = Math.floor(H * 0.62);
      const scx = Math.floor((W - STO_W) / 2);
      const dc = scx + Math.floor(STO_W / 2);
      const ly = sY + 3;
      const rc = a2CrewCount;
      // Original-style spacing — robins arc out from center on each side. Wrap to new row when too wide.
      const slotW = 3; // horizontal cells per robin (tweak: bigger = more spread out)
      const usableW = W - 6;
      const slotsPerSide = Math.max(1, Math.floor(usableW / 2 / slotW));
      const slotsPerRow = slotsPerSide * 2; // both sides combined
      a3CrewOffsets = [];
      for (let i = 0; i < rc; i++) {
        const row = Math.floor(i / slotsPerRow);
        const idxInRow = i % slotsPerRow;
        const side = idxInRow % 2 === 0 ? -1 : 1;
        const slot = Math.floor((idxInRow + 2) / 2);
        const tx = Util.clamp(dc + side * slot * slotW, 2, W - 5);
        const ty = ly + row * 2;
        const startX = side < 0 ? -4 - row : W + 4 + row;
        a3CrewOffsets.push({
          cx: startX,
          tx,
          cy: ty,
          ty,
          delay: 9500 + i * 280,
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
    // Hat queue — apply one hat every 120ms, player last gets a burst
    if (a3HatQueue.length > 0) {
      a3HatQueueT -= dt;
      if (a3HatQueueT <= 0) {
        const next = a3HatQueue.shift();
        if (next.type === "crew") {
          applyCrewHat(next.idx);
          audio.play("click");
          // Tiny spark at that robin's screen position
          const sY = Math.floor(H * 0.62);
          const scx = Math.floor((W - (window.GAME_DATA.storeArtEN[0] || "").length) / 2);
          const dc = scx + Math.floor((window.GAME_DATA.storeArtEN[0] || "").length / 2);
          const rc = a2CrewCount;
          const maxSlots = Math.max(1, Math.ceil(rc / 2));
          const spacing = Math.max(2, Math.floor((W / 2 - 3) / maxSlots));
          const side = next.idx % 2 === 0 ? -1 : 1;
          const slot = Math.floor((next.idx + 2) / 2);
          const tx = Util.clamp(dc + side * slot * spacing, 2, W - 5);
          spark(tx, sY + 3, C_ORANGE, 4);
        } else {
          // Player — bigger burst, banner
          applyPlayerHat();
          a3PlayerHatted = true;
          burstGood(Math.floor(W / 2), Math.floor(H * 0.62) + 3, C_ORANGE, 10);
          showBanner(window.LANG.bannerHatsOn || "hats on.", C_ORANGE, 2000, true);
        }
        a3HatQueueT = 80; // ms between each hat — slow enough to read put on those hats! hat timing
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
        if (!a3EntryBurst) {
          a3EntryBurst = true;
          audio.play("exit");
          // Particle burst as crew enters store
          const _entryStY = Math.floor(H * 0.62);
          for (let _b = 0; _b < 10; _b++) {
            burstGood(dc + Util.randInt(-3, 3), _entryStY - 1, a2Crew[_b % a2Crew.length]?.col || C_TEAL, 8);
          }
          triggerFlashGood();
          setTimeout(() => {
            initInter(
              [
                { t: window.LANG.bannerGrabEverything, c: C_PLAYER, d: 2500 },
                { pause: true, d: 800 },
                { t: window.LANG.bannerAvoidSecurity, c: C_WARN, d: 2500 },
              ],
              initAct4,
              3,
              Device.isMobile ? window.LANG.controlsAct4Mobile : window.LANG.controlsAct4,
            );
          }, 1200);
        }
        return;
      }
    }
    if (clickPending) {
      const _allArrived2 = a3CrewOffsets && a3CrewOffsets.every((c) => c.arrived);
      const _bannerClear2 = bannerTimer <= 0 && !_bannerSeq;
      const _hatPromptVisible = _allArrived2 && _bannerClear2 && a3T > 12000 && !a3Entering;
      if (_hatPromptVisible && !a3HatsOn && a3HatQueue.length === 0) {
        clickPending = false;
        a3HatsOn = true;
        a3HatQueue = a2Crew.map((_, i) => ({ type: "crew", idx: i }));
        a3HatQueue.push({ type: "player" });
        a3HatQueueT = 0;
        a3PlayerHatted = false;
      } else if (a3HatsOn && a3PlayerHatted && _bannerClear2) {
        clickPending = false;
        burstGood(Math.floor(W / 2), Math.floor(H * 0.62) + 3, C_PLAYER, 8);
        a3Entering = true;
        const sY = Math.floor(H * 0.62);
        const scx = Math.floor((W - STO_W) / 2);
        const dc = scx + Math.floor(STO_W / 2);
        a3PlayerX = dc;
        bannerTimer = 0;
      } else {
        // Click before the prompt is visible — discard it
        clickPending = false;
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
      rc = a2CrewCount;
    /* Player appears after the full banner sequence (~8500ms) — fade in with a brief flash, before crew walks in */
    const _playerAppearT = 8500;
    if (a3T > _playerAppearT) {
      const plX = a3Entering ? Math.round(a3PlayerX) : dc;
      const plY = a3Entering ? Math.round(a3PlayerY || ly) : ly;
      const _appearAge = a3T - _playerAppearT;
      const _appearFlash = _appearAge < 600 ? (Math.floor(_appearAge / 100) % 2 === 0 ? "#fff" : C_PLAYER) : playerPulseColor(a3T);
      grid.art(A2_PA[Math.floor(a3T / 250) % 2], plX, plY, _appearFlash);
      if (_appearAge < 50) burstGood(plX, plY, C_PLAYER, 8);
    }
    // grid.art(A2_PA[Math.floor(a3T / 250) % 2], plX, plY + (a5P >= 3 ? -1 : 0), plGlow);
    /* Robins on either side — use their preserved art + color */
    const maxSlots = Math.max(1, Math.ceil(rc / 2));
    const spacing = Math.max(2, Math.floor((W / 2 - 3) / maxSlots));
    for (let i = 0; i < rc; i++) {
      if (!a3CrewOffsets[i]) continue;
      const rx = Math.round(a3CrewOffsets[i].cx);
      const baseTY = a3CrewOffsets[i].ty || ly;
      const crewArt = a2Crew[i] && a2Crew[i].art ? a2Crew[i].art : RA2;
      const crewCol = (a2Crew[i] && a2Crew[i].col) || C_TEAL;
      if (rx >= 0 && rx + 3 < W && baseTY + 3 < H) {
        const ry = a3Entering ? Math.round(a3CrewOffsets[i].cy) : baseTY + Math.round(Math.sin(Date.now() / 400 + i * 0.7) * 0.3);
        grid.art(crewArt, rx, ry, crewCol);
      }
    }

    // if (a3T > 1500) {
    //   const tapFlash = Math.sin(Date.now() / 300) > 0;
    //   const tapY = Math.min(H - 2, ly + 5);
    //   const hatsAnimating = a3HatQueue && a3HatQueue.length > 0;
    //   const tapMsg = a3HatsOn && a3PlayerHatted ? "[ tap to enter store ]" : hatsAnimating ? "" : "[ tap to put on hats ]";
    //   const tapCol = a3HatsOn && a3PlayerHatted ? (tapFlash ? "#fff" : C_PLAYER) : tapFlash ? "#fff" : C_ORANGE;
    //   grid.textCenter(tapMsg, tapY, tapCol);
    // }

    // Trees flanking store
    const treeCol = "#3a7a3a";
    const treeArt = ["  ^  ", " /^\\ ", "/_|_\\", "  |  "];
    if (scx > 6) grid.art(treeArt, scx - 6, stY, treeCol);
    if (scx > 11) grid.art(treeArt, scx - 11, stY + 1, "#2a6a2a");
    if (scx + STO_W + 6 < W) grid.art(treeArt, scx + STO_W + 2, stY, treeCol);
    if (scx + STO_W + 11 < W) grid.art(treeArt, scx + STO_W + 7, stY + 1, "#2a6a2a");

    // Wait until robins have arrived AND banner has cleared before any prompt
    const _allArrived = a3CrewOffsets && a3CrewOffsets.every((c) => c.arrived);
    const _bannerClear = bannerTimer <= 0 && !_bannerSeq;
    if (_allArrived && _bannerClear && a3T > 12000 && !a3Entering) {
      const tapY = Math.min(H - 2, ly + 5);
      const hatsAnimating = a3HatQueue && a3HatQueue.length > 0;
      if (!a3HatsOn && !hatsAnimating) {
        renderTapPrompt(window.LANG.act3TapHat, tapY, "#fff", C_ORANGE);
      } else if (hatsAnimating) {
        grid.textCenter(window.LANG.act3HattingInProgress, tapY, C_DIM);
      } else if (a3HatsOn && !a3PlayerHatted) {
        grid.textCenter(window.LANG.act3HattingWait, tapY, C_DIM);
      } else {
        renderTapPrompt(window.LANG.act3TapEnter, tapY, "#fff", C_PLAYER);
      }
    }
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
      for (let row = 0; row < S4_SHELF_ROWS; row++) {
        let lastFood = null;
        for (let col = 0; col < ns; col++) {
          const foodPool = FOODS.filter((f) => f !== lastFood);
          const chosenFood = Util.pick(foodPool.length > 0 ? foodPool : FOODS);
          lastFood = chosenFood;
          items.push({
            row,
            col,
            food: chosenFood,
            color: Util.pick(FC),
            grabbed: false,
          });
        }
      }
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
    // a3HatsOn = false; // uncomment to remove hats in drop-off scene

    bannerTimer = 0;
    tmr.clear();
    dialogStack = [];
    s4WX = 0;
    s4Sp = 0.006;
    s4Ug = 0;
    s4UR = Math.max(0.004, 0.012 - a2CrewCount * 0.0003); // slower = longer scene ~50s base
    s4GT = 0;
    s4LM = -1;
    s4IT = 0;
    s4St2 = 0;
    s4CM = [];
    s4RobinFloats = [];
    state.reset({ score: 0 });
    s4AlyScore = 0;
    s4ExitPinned = false;
    s4ExitScreenX = W - 7; /* room for wider arch */
    s4GrabBursts = []; /* per-grab starburst effects */
    s4RobinCheerT = 4000; /* countdown to next robin cheer */

    /* ── Compute layout from screen height ──
                         Shelf area sized to fit exactly 4 rows of food.
                         Aisle gets all remaining vertical space.
                         Bottom: floor line + exit row */
    S4_SHELF_ROW_H = 5;
    S4_SHELF_ROWS = 5;
    S4_SHELF_TOP = 2;
    S4_SHELF_BOT = S4_SHELF_TOP + S4_SHELF_ROWS * S4_SHELF_ROW_H + 1;
    S4_AISLE_TOP = S4_SHELF_BOT + 1;
    S4_FLOOR_Y = H - 2;
    S4_AISLE_BOT = S4_FLOOR_Y - 1;
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
    // s4ExitScreenX = W - 7; /* room for wider arch */
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

    // hudLabel.textContent = window.LANG.hudHaulLabel;
    // hudScore.textContent = "$0";
    // hudScore.style.color = C_PLAYER;
    // hudStatus.textContent = window.LANG.hudAct4Status;
    // hudStatus.style.color = C_TEAL;
    // showBanner(window.LANG.bannerGrabEverything, C_PLAYER, 2500);

    s4TickerMsg = D_INTERCOM_TICKER[0];
    s4TickerX = W; // starts off right edge
    s4TickerNextIdx = 1;
  }

  /* ══════════════════════════════════════════════════════════
   ACT 4 EXIT: brief cinematic — player walks to door, crew converges,
   then transitions into the run home
   ══════════════════════════════════════════════════════════ */
  let s4ExitT, s4ExitDone, s4ExitTargetX, s4ExitCrewX;
  function initAct4Exit() {
    phase = "act4exit";
    s4ExitT = 0;
    s4ExitDone = false;
    s4ExitTargetX = s4ExitScreenX;
    s4ExitCrewX = [];
    for (let i = 0; i < s4Alys.length; i++) {
      s4ExitCrewX.push({ x: s4PX2 - 5 - i * 4, y: s4PY2 });
    }
    s4Alys = [];
    audio.play("exit");
    Music.transition("music_act3"); // run-home music
    audio.preload(["music_act6"]); // preload act5 music for smooth transition later
    showBanner(window.LANG.bannerEscaped, C_TEAL, 1500);
  }

  function updateAct4Exit(dt) {
    s4ExitT += dt;
    updateBanner(dt);

    // Keep the world scrolling so shelves don't freeze
    s4WX += s4Sp * dt;
    while (s4GE < s4WX + W + 80) s4GenBookcases(s4GE, s4GE + 80);
    s4Bookcases = s4Bookcases.filter((bc) => bc.wx + S4_BC_W > s4WX - 20);

    // Move player toward exit (slower lerp for more deliberate walk)
    s4PX2 = Util.lerp(s4PX2, s4ExitTargetX, 0.05);
    s4PY2 = Util.lerp(s4PY2, S4_AISLE_BOT - 2, 0.04);

    // Crew converges on door — staggered start so they flow in one by one
    let allIn = true;
    for (let i = 0; i < s4ExitCrewX.length; i++) {
      const c = s4ExitCrewX[i];
      const delay = i * 300;
      if (s4ExitT < delay) {
        allIn = false;
        continue;
      }
      c.x = Util.lerp(c.x, s4ExitTargetX, 0.03);
      c.y = Util.lerp(c.y, S4_AISLE_BOT - 2, 0.03);
      if (Math.abs(c.x - s4ExitTargetX) > 1 || Math.abs(c.y - (S4_AISLE_BOT - 2)) > 1) allIn = false;
    }

    // Guards aggressively chase toward the door — they realize what's happening
    for (const g of s4Gs) {
      const dxToDoor = s4ExitTargetX - (g.wx - s4WX);
      g.wx += dxToDoor > 0 ? 0.012 * dt : 0;
      g.wy = Util.lerp(g.wy, S4_AISLE_BOT - 2, 0.04);
    }

    // Burst of teal sparks at door, occasionally
    if (s4ExitT > 1500 && s4ExitT < 4000 && Math.random() < 0.12) {
      spark(s4ExitTargetX + Util.randInt(-2, 2), S4_AISLE_BOT - 1, C_TEAL, 6);
    }

    // Transition once all crew have reached the door — identical to Act 3
    if (!s4ExitDone && allIn && Math.abs(s4PX2 - s4ExitTargetX) < 1) {
      s4ExitDone = true;
      for (let _b = 0; _b < 10; _b++) {
        burstGood(s4ExitTargetX + Util.randInt(-3, 3), S4_AISLE_BOT - 1, a2Crew[_b % a2Crew.length]?.col || C_TEAL, 8);
      }
      triggerFlashGood();
      setTimeout(() => initAct4Run(), 1200);
    }
  }

  /* ══════════════════════════════════════════════════════════
   ACT 4 RUN: crew runs back to community fridge through the
   neighbourhood — visual callback to Act 2b but wordless and fast
   ══════════════════════════════════════════════════════════ */
  let s4RunT, s4RunSpd, s4RunWX, s4RunFridgeX, s4RunDone, s4RunPX, s4RunPY;
  let s4RunTopParts, s4RunBotParts, s4RunBannerShown;
  let s4RunCops, s4RunBystanders, s4RunSparkleT, s4RunFloatT, s4RunTriumphShown;
  function initAct4Run() {
    phase = "act4run";
    audio.preload(["music_act6"]); // pre-warm act5 drop-off music
    a2bCalcLayout(); // reuse Act 2b layout helpers
    s4RunT = 0;
    s4RunSpd = 0.008; // slower so the run feels more substantial
    s4RunWX = 0;
    s4RunDone = false;
    s4RunBannerShown = false;
    s4RunTriumphShown = false;
    s4RunPX = 12;
    s4RunPY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    s4RunFridgeX = Math.floor(s4RunSpd * 16000); // fridge appears after ~16s
    s4RunTopParts = a2bGenRow(s4RunFridgeX + W);
    s4RunBotParts = a2bGenRow(s4RunFridgeX + W);

    // Cops chasing — spawn ON screen behind the player so we actually see them.
    // They have positive vx (running right), but slower than the world scrolls,
    // so they visibly fall behind and exit screen-left.
    s4RunCops = [];
    const numCops = 5;
    const midY = Math.floor((A2B_ROAD_Y1 + A2B_ROAD_Y2) / 2);
    for (let i = 0; i < numCops; i++) {
      // Player is at screen x ~12, world wx = s4RunWX + 12 ≈ 12 at t=0.
      // Spawn cops at screen x 2..8 (behind & around the player), staggered.
      s4RunCops.push({
        wx: 2 + i * 1.5, // visible on screen at start
        wy: midY + Util.randInt(-2, 2),
        vx: 0.0058 + Math.random() * 0.0008, // slower than s4RunSpd (0.008) — they fall behind, but not too fast
        bobPhase: Math.random() * 6,
      });
    }
    triggerChromatic(400);

    // Bystanders along the route — sit on the top sidewalk, mutter as player passes.
    // Bystanders are 2 rows tall (head + body), so they need rows A2B_ROAD_Y1 - 2 and -1.
    s4RunBystanders = [];
    const bystanderLines = window.LANG.runBystanderLines || ["didn't see a thing", "never saw 'em", "good for you"];
    const numBystanders = 4;
    for (let i = 0; i < numBystanders; i++) {
      const wx = 35 + i * Math.floor(s4RunFridgeX / (numBystanders + 1));
      const wy = A2B_ROAD_Y1 - 2; // top of head sits 2 above the top road line; body lands at -1
      s4RunBystanders.push({
        wx,
        wy,
        line: Util.pick(bystanderLines),
        col: Util.pick(window.GAME_DATA.npcColors),
        triggered: false,
        msgT: 0,
        msgMax: 2200,
      });
    }

    s4RunSparkleT = 0;
    s4RunFloatT = 1500; // first celebration float fires ~1.5s in
  }

  function updateAct4Run(dt) {
    s4RunT += dt;
    updateBanner(dt);
    s4RunWX += s4RunSpd * dt;

    // ── Cops chase: they move forward but slower than scroll, so they fall behind ──
    for (let i = s4RunCops.length - 1; i >= 0; i--) {
      const c = s4RunCops[i];
      c.wx += c.vx * dt;
      // Once they're off-screen left (relative to world scroll), drop them
      if (c.wx - s4RunWX < -4) s4RunCops.splice(i, 1);
    }

    // ── Triumph beat: when all cops are gone (or after 4.5s as fallback), show banner ──
    if (!s4RunTriumphShown && (s4RunCops.length === 0 || s4RunT > 4500)) {
      s4RunTriumphShown = true;
      const triumphMsg = window.LANG.bannerWeLostThem || "we lost them!";
      showBanner(triumphMsg, C_TEAL, 1800);
      // burst of teal sparks across the screen
      for (let _b = 0; _b < 8; _b++) {
        burstGood(Util.randInt(4, W - 4), Util.randInt(A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1), C_TEAL, 8);
      }
      triggerFlashGood();
    }

    // ── Bystander triggers: when player passes one, mutter for 2.2s ──
    const pwxRun = s4RunWX + s4RunPX;
    for (const b of s4RunBystanders) {
      if (!b.triggered && Math.abs(b.wx - pwxRun) < 6) {
        b.triggered = true;
        b.msgT = b.msgMax;
        audio.play("paper");
      }
      if (b.msgT > 0) b.msgT -= dt;
    }

    // ── Continuous sparkle trail on player + crew (only after triumph beat) ──
    if (s4RunTriumphShown) {
      s4RunSparkleT -= dt;
      if (s4RunSparkleT <= 0) {
        s4RunSparkleT = 90; // ms between spawns
        const sparkChars = ["*", "✦", "·", "+"];
        const sparkCols = ["#fff", "#ffd700", C_TEAL, C_PLAYER];
        // Player trail
        sparks.push({
          x: Math.round(s4RunPX) + Util.randInt(-1, 1),
          y: Math.round(s4RunPY) + Util.randInt(-1, 1),
          dx: -0.005 + (Math.random() - 0.5) * 0.004,
          dy: -0.008 - Math.random() * 0.004,
          ch: Util.pick(sparkChars),
          color: Util.pick(sparkCols),
          life: 600 + Math.random() * 300,
        });
        // One crew member at random
        if (a2Crew.length > 0) {
          const ci = Util.randInt(0, a2Crew.length - 1);
          const baseOX = -2 - Math.floor(ci / 3) * 2;
          const cx = Math.round(s4RunPX + baseOX);
          const cy = Math.round(s4RunPY);
          const crewCol = (a2Crew[ci] && a2Crew[ci].col) || C_TEAL;
          sparks.push({
            x: cx,
            y: cy + Util.randInt(-1, 1),
            dx: -0.006 + (Math.random() - 0.5) * 0.004,
            dy: -0.007 - Math.random() * 0.004,
            ch: Util.pick(sparkChars),
            color: crewCol,
            life: 500 + Math.random() * 300,
          });
        }
      }

      // (Player celebration floats removed — bystanders + sparkles carry it)
    }

    // ── Player movement ──
    const ms = 0.025;
    const tapStep = 2;
    if (input.isDown("up")) s4RunPY -= ms * dt;
    else if (input.justPressed("up")) s4RunPY -= tapStep;
    if (input.isDown("down")) s4RunPY += ms * dt;
    else if (input.justPressed("down")) s4RunPY += tapStep;
    if (input.isDown("left")) s4RunPX -= ms * dt;
    else if (input.justPressed("left")) s4RunPX -= tapStep;
    if (input.isDown("right")) s4RunPX += ms * dt;
    else if (input.justPressed("right")) s4RunPX += tapStep;

    if (clickPending && phase === "act4run") {
      clickPending = false;
      if (!Device.isMobile) {
        if (clickSY < s4RunPY - 2) s4RunPY -= 3;
        else if (clickSY > s4RunPY + 2) s4RunPY += 3;
        if (clickSX < s4RunPX - 3) s4RunPX -= 3;
        else if (clickSX > s4RunPX + 3) s4RunPX += 3;
      }
    }

    s4RunPY = Util.clamp(s4RunPY, A2B_ROAD_Y1 + 1, A2B_ROAD_Y2 - 1);
    s4RunPX = Util.clamp(s4RunPX, 3, W - 4);

    // Banner appears once mid-run (after triumph)
    if (!s4RunBannerShown && s4RunT > 7000) {
      s4RunBannerShown = true;
      showBanner(window.LANG.bannerBackToHood, C_TEAL, 2500);
    }

    // ── Fridge collision: only fire when player is actually next to fridge ──
    // Slow scroll once fridge is fully on screen so the player can catch up to it.
    const fridgeSX = s4RunFridgeX - s4RunWX;
    if (!s4RunDone) {
      if (fridgeSX <= W - 12) {
        // fridge is visible — slow the world to a crawl so player can run up to it
        s4RunSpd = 0.0015;
      }
      // Only complete when the player is within ~4 cells of the fridge horizontally
      if (Math.abs(s4RunPX - fridgeSX - 8) < 5 && fridgeSX < W - 6) {
        s4RunDone = true;
        s4RunSpd = 0;
        // Big celebration on arrival
        for (let _b = 0; _b < 6; _b++) {
          burstGood(Math.round(fridgeSX) + Util.randInt(0, 16), Util.randInt(A2B_ROAD_Y1 + 2, A2B_ROAD_Y2 - 1), C_TEAL, 10);
        }
        triggerFlashGood();
        setTimeout(() => initAct5(), 2400);
      }
    }
  }

  function renderAct4Run() {
    // Mountain parallax (same as Act 2b)
    const mtScrollX = s4RunWX * 0.04;
    const mtBaseY = A2B_TOP_H - 1;
    let peakScreenX = -1,
      peakScreenY = 99999;
    for (let x = 0; x < W; x++) {
      const wx = x + mtScrollX;
      const period = 220;
      const phase2 = ((wx % period) + period) % period;
      const norm = phase2 / period;
      const dome = Math.exp(-Math.pow((norm - 0.3) * 3.0, 2));
      const shoulder = Math.exp(-Math.pow((norm - 0.62) * 5.0, 2)) * 0.35;
      const hillH = Math.round((dome + shoulder) * (A2B_TOP_H * 0.6));
      const topY = mtBaseY - hillH;
      if (topY < peakScreenY) {
        peakScreenY = topY;
        peakScreenX = x;
      }
      const tallestBuilding = Math.max(...s4RunTopParts.map((sp) => sp.art.length));
      const hillFloor = A2B_TOP_H - tallestBuilding - 1;
      for (let dy = topY; dy <= Math.min(mtBaseY, hillFloor); dy++) {
        if (dy < 0 || dy >= H) continue;
        const depth = dy - topY;
        let ch, col;
        if (depth === 0) {
          ch = "\u0BF3";
          col = "#27371c";
        } else if (depth < 2) {
          ch = "\u0B70";
          col = "#213417";
        } else if (depth < 5) {
          ch = "\u2592";
          col = "#0e170a";
        } else {
          ch = "\u2591";
          col = "#12200c";
        }
        grid.set(x, dy, ch, col);
      }
    }
    if (peakScreenX >= 0) {
      const crossArt = [" | ", "-+-", " | "];
      grid.art(crossArt, peakScreenX - 1, peakScreenY - 3, "#f0e8c0");
    }

    // Top buildings
    const topScrollX = s4RunWX * 0.85;
    for (const sp of s4RunTopParts) {
      const sx = Math.round(sp.wx - topScrollX);
      if (sx + sp.w < -2 || sx > W + 2) continue;
      const by = A2B_TOP_H - sp.art.length;
      grid.art(sp.art, sx, Math.max(0, by), sp.col);
    }
    for (let x = 0; x < W; x++) grid.set(x, A2B_ROAD_Y1, "\u2550", "#b0a898");
    for (let x = 0; x < W; x++) grid.set(x, A2B_ROAD_Y2, "\u2550", "#b0a898");

    // Bottom buildings
    for (const sp of s4RunBotParts) {
      const sx = Math.round(sp.wx - s4RunWX);
      if (sx + sp.w < -2 || sx > W + 2) continue;
      grid.art(sp.art, sx, A2B_ROAD_Y2 + 1, sp.col);
    }

    // Crew running alongside — keep hats on
    // When run is done (at fridge), crew clusters in front of fridge
    for (let i = 0; i < a2Crew.length; i++) {
      const c = a2Crew[i];
      let mx, my;
      if (s4RunDone) {
        // Freeze where they stopped — no movement
        if (c._gatherX === undefined) c._gatherX = mx ?? s4RunPX + (-2 - Math.floor(i / 3) * 2);
        if (c._gatherY === undefined) c._gatherY = my ?? s4RunPY;
        mx = Math.round(c._gatherX);
        my = Math.round(c._gatherY);
        // Cluster in front of fridge: spread out symmetrically
        // const fridgeSX = Math.round(s4RunFridgeX - s4RunWX);
        // const sideSign = i % 2 === 0 ? -1 : 1;
        // const slot = Math.floor(i / 2);
        // const targetX = fridgeSX - 3 - i * 2;
        // const targetY = A2B_ROAD_Y2 - 1;
        // // Lerp toward gather position
        // if (c._gatherX === undefined) c._gatherX = s4RunPX + (-2 - Math.floor(i / 3) * 2);
        // if (c._gatherY === undefined) c._gatherY = s4RunPY;
        // c._gatherX = Util.lerp(c._gatherX, targetX, 0.08);
        // c._gatherY = Util.lerp(c._gatherY, targetY, 0.06);
        // mx = Math.round(c._gatherX);
        // my = Math.round(c._gatherY);
      } else {
        const clusterR = 2;
        const angle = s4RunT / 600 + (c.b || i);
        const orbitX = Math.sin(angle + i) * clusterR;
        const orbitY = Math.cos(angle + i) * (clusterR * 0.35);
        const baseOX = -2 - Math.floor(i / 3) * 2;
        mx = Math.round(s4RunPX + baseOX + orbitX);
        my = Math.round(s4RunPY + orbitY);
      }
      if (mx >= 0 && mx < W && my > A2B_ROAD_Y1 && my < A2B_ROAD_Y2) {
        const _frame = [...(c.art || A2_ROB)];
        _frame[1] = Math.floor(s4RunT / 200 + (c.b || 0) * 30) % 2 === 0 ? _frame[1] : "\u20B3";
        grid.art(_frame, mx, my, c.col || C_TEAL);
      }
    }

    // Player running
    const _pFrame = [...A2_PA[Math.floor(s4RunT / 10) % 2]];
    _pFrame[1] = Math.floor(s4RunT / 180) % 2 === 0 ? _pFrame[1] : "\u20B3";
    grid.art(_pFrame, Math.round(s4RunPX), Math.round(s4RunPY), playerPulseColor(s4RunT));

    // Cops chasing — visibly falling behind
    for (const c of s4RunCops) {
      const csx = Math.round(c.wx - s4RunWX);
      if (csx < -3 || csx > W + 3) continue;
      const _copLeg = Math.floor(s4RunT / 160 + c.bobPhase * 30) % 2 === 0 ? "\u03C6" : "\u20B3";
      const _copHead = Math.floor(s4RunT / 200) % 2 === 0 ? "!" : "\u00A7";
      const _copCol = Math.floor(s4RunT / 120) % 2 === 0 ? C_DANGER : "#a44";
      grid.art([_copHead, _copLeg], csx, Math.round(c.wy), _copCol);
    }

    // Bystanders + their mutters
    for (const b of s4RunBystanders) {
      const bsx = Math.round(b.wx - s4RunWX);
      if (bsx < -3 || bsx > W + 3) continue;
      const npcArt = Util.pick(window.GAME_DATA.npcArts);
      // pick once and stash so the sprite doesn't flicker
      if (!b._art) b._art = window.GAME_DATA.npcArts[Math.floor(b.wx) % window.GAME_DATA.npcArts.length];
      grid.art(b._art, bsx, b.wy, b.col);
      // Mutter box
      if (b.msgT > 0) {
        const txt = b.line;
        const bw = txt.length + 4;
        const bx = Util.clamp(bsx - Math.floor(bw / 2), 0, W - bw);
        const by = b.wy - 3;
        if (by >= 0 && by + 2 < H) {
          for (let yy = by; yy <= by + 2; yy++) for (let xx = bx; xx < bx + bw; xx++) if (xx >= 0 && xx < W) grid.set(xx, yy, " ", null);
          grid.text(DIALOG_BOX.tl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.tr, bx, by, b.col);
          grid.text(DIALOG_BOX.v + " " + txt + " " + DIALOG_BOX.v, bx, by + 1, b.col);
          grid.text(DIALOG_BOX.bl + DIALOG_BOX.h.repeat(bw - 2) + DIALOG_BOX.br, bx, by + 2, b.col);
        }
      }
    }

    // Community fridge — clean and readable, gentle teal
    if (s4RunWX > s4RunFridgeX - W - 10) {
      const fsx = Math.round(s4RunFridgeX - s4RunWX);
      if (fsx < W + 10) {
        const fridgeBody = [
          "╔═══════════════╗",
          "║  FRIGO        ║",
          "║  COMMUN       ║",
          "╠═══════════════╣",
          "║ ◉   ◉   ◉   ◉ ║",
          "║               ║",
          "║ ◉   ◉   ◉   ◉ ║",
          "╚═══════════════╝",
        ];
        const aisleH = A2B_ROAD_Y2 - A2B_ROAD_Y1;
        const fY = A2B_ROAD_Y1 + Math.floor((aisleH - fridgeBody.length) / 2);
        grid.art(fridgeBody, fsx, fY, C_TEAL);
      }
    }

    renderBanner();
  }

  function renderAct4Exit() {
    // Reuse Act 4's renderer to keep the store visible during exit
    renderAct4();

    // Draw crew sliding toward door
    for (let i = 0; i < s4ExitCrewX.length; i++) {
      const cx = Math.round(s4ExitCrewX[i].x);
      const cy = Math.round(s4ExitCrewX[i].y);
      const src = a2Crew[i];
      const rArt = (src && src.art) || A2_ROB;
      const rCol = (src && src.col) || C_TEAL;
      if (cx >= 0 && cx < W && cy >= 0 && cy < H) {
        grid.art(rArt, cx, cy, rCol);
      }
    }
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
      quickBust("caught", initAct4);
      return;
    }

    /* Exit appears after x seconds */
    if (!s4ExitPinned && s4GT > 18) {
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

    if (s4St2 > 0) s4St2 -= dt;
    if (s4St2 <= 0) {
      const s4TapStep = 2;
      if (input.isDown("up")) s4PY2 -= 0.02 * dt;
      else if (input.justPressed("up")) s4PY2 -= s4TapStep;
      if (input.isDown("down")) s4PY2 += 0.02 * dt;
      else if (input.justPressed("down")) s4PY2 += s4TapStep;
      if (input.isDown("left")) s4PX2 -= 0.02 * dt;
      else if (input.justPressed("left")) s4PX2 -= s4TapStep;
      if (input.isDown("right")) s4PX2 += 0.02 * dt;
      else if (input.justPressed("right")) s4PX2 += s4TapStep;
    }

    /* ── Click handling — always runs, independent of keyboard ── */

    if (clickPending && phase === "act4") {
      /* Check exit FIRST before anything else consumes the click */
      if (s4ExitPinned && clickSX >= s4ExitScreenX - 5 && clickSX <= s4ExitScreenX + 5 && clickSY >= S4_AISLE_TOP && clickSY <= S4_FLOOR_Y) {
        clickPending = false;
        endGame("escaped");
        return;
      }

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
            s4GrabBursts.push({ x: ix + Math.floor(S4_SLOT_W / 2), y: aY + 1, t: 400, max: 400, col: it.color });
            popupPush(it.food.n + " +$" + it.food.p, ix + Math.floor(S4_SLOT_W / 2) + Util.randInt(-2, 2), aY + Util.randInt(-2, -1), it.color, 500);
            grabbedItem = true;
            break outer4;
          }
        }
      }

      if (!grabbedItem && clickSY >= S4_AISLE_TOP && clickSY <= S4_FLOOR_Y) {
        if (clickSY < s4PY2 - 1) s4PY2 -= 2;
        else if (clickSY > s4PY2 + 1) s4PY2 += 2;
      }
    }

    /* Clamp player to aisle */
    s4PY2 = Util.clamp(s4PY2, S4_AISLE_TOP + 1, S4_AISLE_BOT - 1);

    /* Exit collision — walk into it OR click it to leave */

    if (s4ExitPinned) {
      if (Math.abs(s4PX2 - s4ExitScreenX) < 5) endGame("escaped");
    }

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
        s4St2 = 500; // reduced stun so keyboard still feels responsive quickly
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

    // Intercom messages fire as banners — ticker removed
    s4TickerX -= 0.01 * dt;
    if (s4TickerX + s4TickerMsg.length < 0) {
      s4TickerMsg = D_INTERCOM_TICKER[s4TickerNextIdx % D_INTERCOM_TICKER.length];
      s4TickerNextIdx++;
      s4TickerX = W + 2;
      if (bannerTimer <= 0) showBanner(s4TickerMsg, "#6a8a9a", 2200, true);
    }
    /* Re-fire exit reminder once per 12-second window after it opens */
    if (s4ExitPinned && bannerTimer <= 0 && s4GT > 12 && Math.floor(s4GT / 12) > Math.floor((s4GT - dt / 1000) / 12)) {
      showBanner(window.LANG.bannerExitOpen, C_TEAL, 2500, true);
    }

    /* ── HUD ── */
    const my = state.get("score");
    _updateDomHud();
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
          // Render food art centered vertically in the slot rather than bottom-aligned
          grid.art(it.food.a, ix, rY, it.color);
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

    /* ── Security guards — 2 chars wide, same scale as player/NPCs ── */
    for (const g of s4Gs) {
      const sx = Math.round(g.wx - s4WX),
        sy = Math.round(g.wy);
      if (sx < -3 || sx > W + 3) continue;
      const _guardFlash = Math.floor(Date.now() / 400) % 2 === 0;
      const _guardLeg = Math.floor(Date.now() / 200 + g.wx * 0.3) % 2 === 0 ? "\u03C6" : "\u20B3";
      grid.art([_guardFlash ? "\u00A7" : "!", _guardLeg], sx, sy, C_DANGER);
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
        const _a4RFrame = [...rArt];
        _a4RFrame[1] = Math.floor((s4GT * 1000) / 200 + i * 1.7) % 2 === 0 ? _a4RFrame[1] : "\u20B3";
        grid.art(_a4RFrame, rx, ry, rCol);
      }
    }

    /* ── Robin grab floats ── */
    // for (const f of s4RobinFloats) {
    //   if (f.life < 100) continue;
    //   for (let i = 0; i < f.text.length; i++) {
    //     const fx = Math.round(f.x) + i,
    //       fy = Math.round(f.y);
    //     if (fx >= 0 && fx < W && fy >= 0 && fy < H) grid.set(fx, fy, f.text[i], f.col);
    //   }
    // }

    /* ── Player ── */
    if (s4St2 <= 0 || Math.floor(s4St2 / 80) % 2 === 0) {
      // Keep urgency flash when heat is high, otherwise use normal pulse
      let pc = s4Ug > 0.7 ? (Math.floor(Date.now() / 200) % 2 ? C_WARN : C_PLAYER) : playerPulseColor(s4GT * 1000);
      const _a4PFrame = [...A2_PA[Math.floor(s4GT * 4) % 2]];
      _a4PFrame[1] = Math.floor((s4GT * 1000) / 180) % 2 === 0 ? _a4PFrame[1] : "\u20B3";
      grid.art(_a4PFrame, Math.round(s4PX2), Math.round(s4PY2), pc);
    }

    /* ── Floor line ── */
    for (let x = 0; x < W; x++) {
      grid.set(x, S4_FLOOR_Y, "\u2550", "#444");
    }

    if (s4ExitPinned) {
      const exSX = s4ExitScreenX;
      const _ef = Math.floor(Date.now() / 800) % 2 === 0;
      const _exitCol = C_TEAL;
      const _dimCol = "#1a5a4a";

      const archTop = S4_AISLE_TOP + 1;
      const archBot = S4_FLOOR_Y;
      const archW = 4;
      const lx = exSX - archW;
      const rx = exSX + archW;

      // Top beam
      for (let x = lx; x <= rx; x++) {
        if (x >= 0 && x < W) grid.set(x, archTop, "\u2550", _exitCol);
      }
      if (lx >= 0 && lx < W) grid.set(lx, archTop, "\u2554", _exitCol);
      if (rx >= 0 && rx < W) grid.set(rx, archTop, "\u2557", _exitCol);

      // Pillars
      for (let y = archTop + 1; y < archBot; y++) {
        if (lx >= 0 && lx < W) grid.set(lx, y, "\u2551", _exitCol);
        if (lx + 1 >= 0 && lx + 1 < W) grid.set(lx + 1, y, "\u2502", _dimCol);
        if (rx >= 0 && rx < W) grid.set(rx, y, "\u2551", _exitCol);
        if (rx - 1 >= 0 && rx - 1 < W) grid.set(rx - 1, y, "\u2502", _dimCol);
      }

      // Floor gap
      for (let x = lx; x <= rx; x++) {
        if (x >= 0 && x < W) grid.set(x, S4_FLOOR_Y, " ", null);
      }

      // EXIT label in beam
      const _label = window.LANG.act4ExitLabel;
      grid.text(_label, exSX - Math.floor(_label.length / 2), archTop, _ef ? "#fff" : _exitCol);
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

    // (intercom ticker replaced by banner messages)
    popupRender();

    renderBanner();
  }
  /* ══════════════════════════════════════════════════════════
               ACT 5: THE DROP-OFF — community fridge
               ══════════════════════════════════════════════════════════ */

  let FRIDGE = window.LANG === window.LANG_FR ? window.GAME_DATA.fridgeArtFR : window.GAME_DATA.fridgeArtEN;

  function initAct5() {
    audio.play("level");
    audio.preload(["music_act7"]);
    phase = "act5";
    ensureCrew();
    a5T = 0;
    a5P = 0;
    a5NI = 0;
    a5FoodPlacements = null;
    a5FlyingItems = null;
    a5GroundPile = null;
    a5FoodCycleT = 0;
    a5FoodTotalPlaced = 0;
    a5LastCounterValue = 0;
    a5LastCounterFlash = 0;
    bannerTimer = 0;
    dialogStack = [];
    hudLabel.textContent = "";
    hudScore.textContent = "";
    hudStatus.textContent = "";
    a5Crew = [];
    const rc = a2CrewCount; // show ALL crew, no cap
    // Fridge higher
    const fridgeW = FRIDGE[0].length;
    const fx = Math.floor((W - fridgeW) / 2);
    const fy = Math.floor(H / 2) - 10;
    const lineY = fy + FRIDGE.length + 6;
    // Wrap into rows if too many for one row
    const slotW = 3; // horizontal cells per character
    const usableW = W - 4;
    const slotsPerRow = Math.max(3, Math.floor(usableW / slotW));
    const totalSlots = rc + 1; // crew + player
    const playerSlot = Math.floor(Math.min(slotsPerRow, totalSlots) / 2); // player roughly centered in first row
    let crewIdx = 0;
    for (let slot = 0; slot < totalSlots; slot++) {
      if (slot === playerSlot) continue; // player slot, handled in render
      const row = Math.floor(slot / slotsPerRow);
      const idxInRow = slot % slotsPerRow;
      const itemsInRow = Math.min(slotsPerRow, totalSlots - row * slotsPerRow);
      const rowStartX = Math.floor((W - itemsInRow * slotW) / 2);
      const targetX = rowStartX + idxInRow * slotW;
      const targetY = lineY + row * 2; // rows stack downward; change to `lineY - row * 2` to stack upward (gang behind leader)
      const cs = a2Crew[crewIdx] || {};
      a5Crew.push({
        x: crewIdx % 2 === 0 ? -3 - crewIdx * 4 : W + 3 + crewIdx * 4,
        y: targetY,
        tx: Util.clamp(targetX, 2, W - 5),
        ty: targetY,
        arrived: false,
        item: Util.pick(window.LANG.crewItems),
        art: cs.art,
        col: cs.col,
      });
      crewIdx++;
    }
    // Store player X for render — player stays in first row
    const firstRowItems = Math.min(slotsPerRow, totalSlots);
    const firstRowStart = Math.floor((W - firstRowItems * slotW) / 2);
    a5Crew._playerX = Util.clamp(firstRowStart + playerSlot * slotW, 2, W - 5);
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
        Music.transition("music_act6"); // drop-off music starts now, not on init
        a5P = 1;
        a5T = 0;
      }
    }
    // r  rigger the food drop earlier
    if (a5P === 1 && a5T > 1200) a5P = 2;
    if (clickPending && a5P === 2) {
      clickPending = false;
      audio.play("drop");
      if (_originalPlayerHead) removeHats();
      burstGood(Math.floor(W / 2), Math.floor(H / 2) - 4, C_TEAL, 10);
      a5P = 3;
      const _fw = FRIDGE[0].length,
        _fx = Math.floor((W - _fw) / 2),
        _fy = Math.floor(H / 2) - 7;
      for (let _i = 0; _i < 6; _i++) burstGood(_fx + Math.floor(Math.random() * _fw), _fy + Math.floor(Math.random() * FRIDGE.length), C_TEAL, 7);
      triggerFlashGood();
      a5T = 0;
      showBanner(window.LANG.bannerFoodGloriousFood, C_SUCCESS, 2000);
    }
    if (a5P === 3 && a5T > 7500) {
      // longer — lets the fridge fill, then re-fill multiple times
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
            const _nbIdx = a5Neighbours.indexOf(nb);
            dialogPush(nb.msg, nb.col || C_TEAL, "center", Math.round(nb.tx), nb.ty - 2, 1200 + _nbIdx * 150);
          } else allArrived = false;
        }
      }
      if (allArrived && a5T > 7000 && clickPending) {
        clickPending = false;
        spark(Math.floor(W / 2), H - 2, C_TEAL, 5);
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

    // Tap-to-deposit prompt — only shows during the deposit window (a5P === 2)
    if (a5P === 2) {
      renderTapPrompt(window.LANG.act5TapDeposit, H - 2, "#fff", C_PLAYER);
    }
    // Food appearing in fridge — real food art reused from Act 4

    if (a5P >= 3) {
      // First-time setup: 8 fridge slots + flying items pool + ground pile
      if (!a5FoodPlacements) {
        a5FoodPlacements = [];
        for (let i = 0; i < 8; i++) {
          a5FoodPlacements.push({ food: null, col: FC[i % FC.length], placedAt: -1 });
        }
        a5FlyingItems = []; // items in flight from offscreen → fridge
        a5GroundPile = []; // overflow items resting on the floor
        a5FoodCycleT = 0;
        a5FoodTotalPlaced = 0;
      }

      // Phase 3: spawn flying items rapidly. Each one targets either a fridge slot
      // or a spot on the ground (once fridge is "full enough").
      if (a5P === 3) {
        a5FoodCycleT += 1;

        const fridgeFilled = a5FoodPlacements.filter((s) => s.food).length;
        const claimedSlots = new Set(a5FlyingItems.filter((f) => !f.isGround).map((f) => f.slotIdx));
        const freeSlot = a5FoodPlacements.findIndex((s, i) => !s.food && !claimedSlots.has(i));
        const wantGround = freeSlot === -1;
        const spawnEvery = fridgeFilled < 8 ? 22 : 6;
        if (a5FoodCycleT >= spawnEvery && a5T < 6500) {
          a5FoodCycleT = 0;
          const food = Util.pick(FOODS);
          const col = Util.pick(FC);
          const fromLeft = Math.random() < 0.5;
          const startX = fromLeft ? -3 : W + 3;
          const startY = fy + Util.randInt(-2, FRIDGE.length + 2);

          let targetX,
            targetY,
            slotIdx = -1;
          if (wantGround) {
            const groundY = fy + FRIDGE.length + 1;
            targetX = Util.clamp(fx + Util.randInt(0, fridgeW - 2), fx, fx + fridgeW - 2);
            targetY = groundY + Util.randInt(0, 2);
          } else {
            slotIdx = freeSlot;
            const slotsPerShelf = 4;
            const shelfInnerW = fridgeW - 2;
            const slotW = Math.floor(shelfInnerW / slotsPerShelf);
            const shelf = Math.floor(slotIdx / slotsPerShelf);
            const slotCol = slotIdx % slotsPerShelf;
            targetX = fx + 1 + slotCol * slotW + Math.floor((slotW - 7) / 2);
            targetY = (shelf === 0 ? fy + 8 : fy + 14) - food.a.length + 1;
          }
          a5FlyingItems.push({
            food,
            col,
            x: startX,
            y: startY,
            tx: targetX,
            ty: targetY,
            slotIdx,
            isGround: wantGround,
            life: 600,
          });
        }
      }

      // Update flying items — fast lerp, then commit on arrival
      for (let i = a5FlyingItems.length - 1; i >= 0; i--) {
        const fi = a5FlyingItems[i];
        fi.x = Util.lerp(fi.x, fi.tx, 0.08);
        fi.y = Util.lerp(fi.y, fi.ty, 0.08);
        fi.life -= 16;
        if (Math.abs(fi.x - fi.tx) < 0.6 && Math.abs(fi.y - fi.ty) < 0.6) {
          if (fi.isGround) {
            a5GroundPile.push({ food: fi.food, col: fi.col, x: fi.tx, y: fi.ty, placedAt: performance.now() });
          } else if (fi.slotIdx >= 0) {
            a5FoodPlacements[fi.slotIdx].food = fi.food;
            a5FoodPlacements[fi.slotIdx].col = fi.col;
            a5FoodPlacements[fi.slotIdx].placedAt = performance.now();
          }
          a5FoodTotalPlaced++;
          spark(Math.round(fi.tx) + 2, Math.round(fi.ty), fi.col, 3);
          if (a5FoodTotalPlaced % 5 === 0) audio.play("drop");
          a5FlyingItems.splice(i, 1);
        }
      }

      const slotsPerShelf = 4;
      const shelfInnerW = fridgeW - 2;
      const slotW = Math.floor(shelfInnerW / slotsPerShelf);

      // Draw settled fridge contents
      for (let i = 0; i < a5FoodPlacements.length; i++) {
        const fp = a5FoodPlacements[i];
        if (!fp.food) continue;
        const shelf = Math.floor(i / slotsPerShelf);
        const slotCol = i % slotsPerShelf;
        if (shelf > 1) break;
        const ix = fx + 1 + slotCol * slotW + Math.floor((slotW - 7) / 2);
        const shelfBot = shelf === 0 ? fy + 8 : fy + 14;
        const artH = fp.food.a.length;
        const iy = shelfBot - artH + 1;
        const age = performance.now() - fp.placedAt;
        const col = age < 80 ? "#fff" : fp.col;
        for (let r = 0; r < artH; r++) {
          const line = fp.food.a[r].substring(0, slotW - 1);
          grid.text(line, ix, iy + r, col);
        }
      }

      // Draw ground overflow pile
      for (const gp of a5GroundPile) {
        const age = performance.now() - gp.placedAt;
        const col = age < 80 ? "#fff" : gp.col;
        const artH = gp.food.a.length;
        for (let r = 0; r < artH; r++) {
          const line = gp.food.a[r];
          grid.text(line, Math.round(gp.x), Math.round(gp.y) - artH + 1 + r, col);
        }
      }

      // Draw flying items (last so they're on top)
      for (const fi of a5FlyingItems) {
        const artH = fi.food.a.length;
        for (let r = 0; r < artH; r++) {
          const line = fi.food.a[r];
          grid.text(line, Math.round(fi.x), Math.round(fi.y) + r, fi.col);
        }
      }

      // Big counter — scales with total placed, cleanly readable above fridge
      if (a5FoodTotalPlaced > 0) {
        const counterTxt = "+" + a5FoodTotalPlaced + window.LANG.foodCounterSuffix;
        const cx = fx + Math.floor(fridgeW / 2) - Math.floor(counterTxt.length / 2);
        const cy = Math.max(1, fy - 2);
        const flashCol = a5T - a5LastCounterFlash < 150 ? "#fff" : C_TEAL;
        grid.text(counterTxt, cx, cy, flashCol);
        if (a5FoodTotalPlaced !== a5LastCounterValue) {
          a5LastCounterValue = a5FoodTotalPlaced;
          a5LastCounterFlash = a5T;
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
            grid.text(nb.name, Util.clamp(nx - Math.floor(nb.name.length / 2), 0, W - nb.name.length), nb.ty - 1, nb.col || C_TEAL);
          }
        }
      }
    }
    if (a5P === 4 && a5Neighbours.length > 0 && a5Neighbours.every((nb) => nb.arrived) && a5T > 6000)
      renderTapPrompt(window.LANG.act5TapContinue, H - 2, "#fff", C_TEAL);
    popupRender();
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
      spark(Math.floor(W / 2), H - 3, C_DIM, 5);
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
    if (endT >= (endD.doneT || 9999)) renderTapPrompt(window.LANG.tapToContinue, H - 3, "#fff", C_PLAYER);

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
        convShowChoices([window.LANG.ctaChoiceYes, window.LANG.ctaChoiceMaybe]);
      }
      if (clickPending && convChoiceY2 > 0 && clickSY >= convChoiceY1 && clickSY <= convChoiceY2) {
        clickPending = false;
        ctaChoice = clickSY < Math.floor((convChoiceY1 + convChoiceY2) / 2) ? "yes" : "maybe";
        convStartFade();
        if (ctaChoice === "yes") {
          burstGood(Math.floor(W / 2), Math.floor(H / 2), C_TEAL, 16);
          triggerFlashGood();
          ctaEndLine = window.LANG.ctaEndYes;
          ctaEndCol = C_TEAL;
        } else {
          ctaEndLine = window.LANG.ctaEndMaybe;
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
      ovTitle.textContent = window.LANG.ctaGameTitle;
      ovTitle.style.color = C_PLAYER;
      ovSub.innerHTML = window.LANG.ctaFinalSub;
      ovHint.textContent = "";
      startBtn.textContent = window.LANG.ctaPlayAgain;
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
    if (ctaT > 12500 && !ctaChoice) renderTapPrompt("tap", H - 2, "#fff", C_PLAYER);
  }

  function quickBust(result, restartFn) {
    if (phase === "done") return;
    phase = "done";
    loop.stop();
    audio.play("bust");
    triggerChromatic(1500);

    const isTimeout = result === "timeout";
    const msg = isTimeout ? window.LANG.endGameTimedOutTitle : result === "busted" ? window.LANG.endGameBustedTitle : window.LANG.endGameCaughtTitle;
    const col = C_DANGER;

    // Show a brief full-screen message without buttons
    overlay.classList.remove("hidden");
    ovTitle.textContent = msg;
    ovTitle.style.color = col;
    ovSub.textContent = isTimeout
      ? window.LANG.endGameTimedOutSub
      : result === "busted"
        ? window.LANG.endGameBustedSub
        : window.LANG.endGameCaughtSub;

    ovHint.textContent = "";
    startBtn.style.display = "none";
    overlay.querySelectorAll(".final").forEach((e) => e.remove());
    overlay.querySelectorAll(".give-up-btn").forEach((e) => e.remove());

    // Auto-restart after 2 seconds
    setTimeout(() => {
      overlay.classList.add("hidden");
      startBtn.style.display = "";
      floats.length = 0;
      sparks.length = 0;
      dialogStack = [];
      convReset();
      bannerTimer = 0;
      bannerText = "";
      clickPending = false;
      a2TN = null;
      a2CrewCount = 0;
      a2Crew = [];
      restartFn();
      loop.start();
    }, 2000);
  }

  /* ── END GAME (failure) ────────────────────────────────── */

  function endGame(result) {
    if (phase === "done") return;
    if (result === "escaped") {
      initAct4Exit();
      return;
    }
    Music.stop();
    phase = "done";
    audio.play("bust");
    loop.stop();
    const my = state.get("score") || 0,
      tot = my + s4AlyScore;
    let title, sub, color;
    color = C_DANGER;
    if (result === "busted") {
      title = window.LANG.endGameBustedTitle;
      sub = window.LANG.endGameBustedSub;
    } else {
      // "caught" — do NOT say escaped
      title = window.LANG.endGameCaughtTitle || "CAUGHT.";
      sub = window.LANG.endGameCaughtSub + (tot > 0 ? " " + window.LANG.endGameCaughtHad.replace("{tot}", tot) : "");
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
      overlay.classList.add("hidden");
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
    boxed: true /* draw border box around text? */,
    life: 2500 /* ms on screen */,
    fadeStart: 0.15 /* fraction of life at which it fades */,
    padX: 1 /* horizontal padding inside box */,
  };

  function addFloat(t, x, y, co) {
    /* x, y ignored — floats cluster near top of screen (playful overlap).
       To move the cluster up or down, edit floatBaseY in the render function. */
    // const life = phase === "act4" ? 1200 : FLOAT_STYLE.life;
    // food floats to disappear slightly faster
    const life = phase === "act4" ? 550 : FLOAT_STYLE.life;
    floats.push({
      text: t,
      color: co,
      life,
      max: life,
      boxed: FLOAT_STYLE.boxed,
    });
  }
  function update(dt) {
    _mobUpdate(dt);
    // Drive chunked dialogue queue
    if (_convChunkQueue.length > 0) {
      _convChunkTimer -= dt;
      if (_convChunkTimer <= 0) {
        _convChunkTimer = CONV_CHUNK_PAUSE_MS;
        _convChunkFlush();
      }
    } else {
      _convChunkTimer = CONV_CHUNK_PAUSE_MS;
    }
    // Typing reveal driver — only advances the last (active) box
    if (convLog.length > 0) {
      const li = convLog.length - 1;
      const full = convLog[li].text;
      if (convReveal[li] === undefined) convReveal[li] = 0;
      if (!CONV_TYPING_ENABLED) convReveal[li] = full.length; // instant reveal
      if (convReveal[li] < full.length) {
        _convTypeTimer += dt;
        const ch = full[convReveal[li]];
        const delay =
          ch === "." || ch === "?" || ch === "!" ? CONV_TYPE_MS + CONV_TYPE_PUNCT_MS : ch === "," ? CONV_TYPE_MS + CONV_TYPE_COMMA_MS : CONV_TYPE_MS;
        if (_convTypeTimer >= delay) {
          _convTypeTimer = 0;
          convReveal[li]++;
        }
      }
    }
    // Update conversation fade timer
    if (convFading) {
      convFadeTimer += dt;
      if (convFadeTimer >= convFadeDuration) {
        // Fade complete, reset conversation
        convReset();
      }
    } else if (phase === "inter") updateInter(dt);
    if (convChoiceSelected >= 0) convChoiceSelectedT += dt;

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
    else if (phase === "act2b") {
      updateAct2b(dt);
      popupUpdate(dt);
    } else if (phase === "act3") updateAct3(dt);
    else if (phase === "act4") {
      updateAct4(dt);
      popupUpdate(dt);
    } else if (phase === "act4exit") updateAct4Exit(dt);
    else if (phase === "act4run") updateAct4Run(dt);
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
    else if (phase === "act4exit") renderAct4Exit();
    else if (phase === "act4run") renderAct4Run();
    else if (phase === "act5") renderAct5();
    else if (phase === "end") renderEnd();
    else if (phase === "cta") renderCTA();
    else if (phase === "inter") renderInter();

    /* Floats: Act 2b + Act 4 = playful overlap with per-float position jitter.
                         Other phases = tidy vertical stack.
                         Uses thin double-line borders instead of heavy block chars. */
    const floatMaxW = W - 6;
    // Tweak these two numbers independently:
    // act2b: 0.15 = near top, 0.4 = middle, 0.7 = near bottom
    // act4:  same scale
    const floatBaseY =
      phase === "act2b"
        ? Math.floor(H * 0.15)
        : phase === "act4"
          ? Math.floor(H * 0.08)
          : phase === "act2"
            ? Math.floor(H * 0.82)
            : Math.floor(H * 0.25);
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
      gs.classList.remove("flash-good");
      void gs.offsetWidth;
      gs.classList.add("flash-good");
      flashGoodT = 0;
    }
    if (flashGoldT > 0) {
      console.log("RENDER applying flash-gold, phase=", phase);
      gs.classList.remove("flash-gold");
      void gs.offsetWidth;
      gs.classList.add("flash-gold");
      flashGoldT = 0;
    }
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
      loop.start();
    } else {
      bannerText = "";
      bannerTimer = 0;
      initAct1();
      loop.start();
      // showBannerSequence(
      //   [
      //     { t: window.LANG.bannerIsThisALife, c: "#9ab0cc", d: 2000 },
      //     { pause: true, d: 800 },
      //     { t: window.LANG.bannerWhoIsInControl, c: "#9ab0cc", d: 3000 },
      //   ],
      //   true,
      // );

      showBannerSequence(
        [
          { t: window.LANG.bannerIsThisALife, c: "#9ab0cc", d: 2500 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerWhoIsInControl, c: "#7c94b2", d: 3000 },
          { pause: true, d: 1000 },
          { t: window.LANG.bannerYouControlNothing || "(it sure isn't you)", c: "#7c8ca2", d: 4500 },
        ],
        true,
      );
    }
    // hasPlayed is set to true when the player reaches Act 2
  }
  ovTitle.textContent = window.LANG.overlayTitle;
  ovSub.innerHTML = window.LANG.overlaySub;
  startBtn.textContent = window.LANG.playBtn;
  // startBtn.addEventListener("click", startGame);

  // startBtn handler — already have this, just add preload:
  startBtn.addEventListener("click", async () => {
    await audio.unlock();
    await audio.preload(["click", "music_act1"]);

    Music.play("music_act1");
    startGame();
  });

  // DEV: scene-nav buttons jump to any act using the same path as hotkeys
  document.querySelectorAll("#scene-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      jumpToAct(btn.dataset.act);
    });
  });

  // ── ACT JUMP TABLE ────────────────────────────────────────────
  // Single source of truth for jumping to any act. Each entry must
  // exactly mirror what happens in the real game flow.
  const ACT_JUMPS = {
    1: () => {
      Music.play("music_act1");
      initAct1();
    },
    2: () =>
      initInter(
        [
          { t: window.LANG.bannerRecruitCrew, c: C_ORANGE, d: 2000 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerWatchNarcs, c: C_ORANGE, d: 2500 },
        ],
        initAct2,
        0,
        Device.isMobile ? window.LANG.controlsAct2Mobile : window.LANG.controlsAct2,
      ),
    3: () =>
      initInter(
        [
          { t: window.LANG.bannerRallyNeighbourhood, c: C_ORANGE, d: 2000 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerAvoidNarcs, c: C_ORANGE, d: 2500 },
        ],
        initAct2b,
        1,
        Device.isMobile ? window.LANG.controlsAct2bMobile : window.LANG.controlsAct2b,
      ),
    4: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initAct3();
    },
    5: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initInter(
        [
          { t: window.LANG.bannerGrabEverything, c: C_PLAYER, d: 2500 },
          { pause: true, d: 800 },
          { t: window.LANG.bannerAvoidSecurity, c: C_WARN, d: 2500 },
        ],
        initAct4,
        3,
        Device.isMobile ? window.LANG.controlsAct4Mobile : window.LANG.controlsAct4,
      );
    },
    6: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initAct4();
      initAct4Exit();
    },
    7: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      ensureCrew();
      initAct4();
      initAct4Run();
    },
    8: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      s4AlyScore = s4AlyScore || 0;
      ensureCrew();
      initAct5();
    },
    9: () => {
      a2CrewCount = Math.max(a2CrewCount, 5);
      s4AlyScore = s4AlyScore || 0;
      ensureCrew();
      state.reset({ score: 80 });
      initEnd();
    },
    0: () => initCTA(),
  };

  function jumpToAct(key) {
    if (!ACT_JUMPS[key]) return;
    try {
      loop.stop();
    } catch (_) {}
    Music.stop();
    overlay.classList.add("hidden");
    floats.length = 0;
    sparks.length = 0;
    dialogStack = [];
    convReset();
    bannerTimer = 0;
    bannerText = "";
    clickPending = false;
    a2TN = null;
    ACT_JUMPS[key]();
    loop.start();
  }

  window.addEventListener("keydown", (e) => {
    if (ACT_JUMPS[e.key]) jumpToAct(e.key);
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
