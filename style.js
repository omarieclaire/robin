/* Centralized style config — box styles, palette, color helpers, timing vocabulary. */
  /* ── CENTRALIZED STYLE CONFIG ── */



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
  /* SHARP: square corners — for boxes that should read as solid/clickable */
  const SHARP_BOX = {
    tl: "\u250C",
    tr: "\u2510",
    bl: "\u2514",
    br: "\u2518",
    h: "\u2500",
    v: "\u2502",
  };
  /* Main character color COLOURS */
  const PAL = (window.GAME_DATA && window.GAME_DATA.colors) || {};
  const C_PLAYER = PAL.player || "#2deeff";
  const C_SIDEWALK = PAL.sidewalk || "#b0a898";
  const C_DANGER = PAL.danger || "#c44"; // narcs, heat, bust, security
  const C_TEAL = PAL.teal || "#5cbdbd"; // crew, fridge, info, success moments
  const C_ORANGE = PAL.rally || "#00ffbb"; // rally banners, CTA accent
  const C_WARN = PAL.warn || "#da0"; // urgency warnings
  const C_SUCCESS = PAL.success || "#4ecc4e"; // status green
  const C_DIM = PAL.dim || "#888"; // muted text, tap prompts
  const C_MID = PAL.mid || "#aaa"; // medium text
  const C_COIN = PAL.coin || "#e6c235"; // coin glyphs + pickup floats
  const C_THINKING = PAL.thinking || "#d9a520"; // "they're thinking" floats
  const C_CAT = PAL.cat || "#ee8833"; // cat accent
  const C_GOLD = PAL.gold || "#ffd700"; // confirmed choice, celebration gold
  const C_CREW = PAL.crew || "#3a9a3a"; // crew-trail fallback green
  const C_CONV_NPC = PAL.convNpc || "#7a8aaa"; // default NPC dialogue color

  const HAT_CHAR = "ƛ";
  const HAT_COLOR = C_ORANGE;
// cat cat cat ඣ
  const CAT_GLYPHS = ["ஹ"];

  function playerPulseColor(t) {
    // Gentle 1.4Hz white glow — works in any act, just pass the act timer
    return Math.sin(t / 0.01) > 0.3 ? "#e69224" : C_PLAYER;
  }

  function dullColor(hex, amount) {
    // amount 0..1 — 0 = original, 1 = full gray
    amount = amount ?? 0.55;
    const rgbMatch = hex.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    let r, g, b;
    if (rgbMatch) {
      r = +rgbMatch[1];
      g = +rgbMatch[2];
      b = +rgbMatch[3];
    } else {
      let h = hex.replace("#", "");
      // Expand 3-digit hex shorthand to 6 digits
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      r = parseInt(h.substring(0, 2), 16);
      g = parseInt(h.substring(2, 4), 16);
      b = parseInt(h.substring(4, 6), 16);
    }
    const gray = 140;
    const mr = Math.round(r * (1 - amount) + gray * amount);
    const mg = Math.round(g * (1 - amount) + gray * amount);
    const mb = Math.round(b * (1 - amount) + gray * amount);
    return "#" + mr.toString(16).padStart(2, "0") + mg.toString(16).padStart(2, "0") + mb.toString(16).padStart(2, "0");
  }

  function brightenColor(hex, amount) {
    amount = amount ?? 0.5;
    let h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const mr = Math.round(r * (1 - amount) + 255 * amount);
    const mg = Math.round(g * (1 - amount) + 255 * amount);
    const mb = Math.round(b * (1 - amount) + 255 * amount);
    return "#" + mr.toString(16).padStart(2, "0") + mg.toString(16).padStart(2, "0") + mb.toString(16).padStart(2, "0");
  }

  function darkenColor(hex, amount) {
    amount = amount ?? 0.7;
    let h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const dark = 10;
    const mr = Math.round(r * (1 - amount) + dark * amount);
    const mg = Math.round(g * (1 - amount) + dark * amount);
    const mb = Math.round(b * (1 - amount) + dark * amount);
    return "#" + mr.toString(16).padStart(2, "0") + mg.toString(16).padStart(2, "0") + mb.toString(16).padStart(2, "0");
  }

  function wrapWords(text, maxW, contPrefix) {
    const words = text.split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      if (cur.length + w.length + 1 > maxW) {
        lines.push(cur);
        cur = (contPrefix || "") + w;
      } else cur = cur ? cur + " " + w : w;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  const T = {
    beat: 420, // breath between thoughts
    pause: 850, // dramatic pause — let it breathe
    hold: 1500, // heavy line — wait for it to land
    linger: 2400, // dense/long line — full read time

    exit: 700, // before conv panel closes after final line
    reply: 2400, // delay before NPC first speaks (thinking)
    npcMin: 3600, // minimum ms to show an NPC line
    npcPer: 260, // ms per word added on top of npcMin

    // Banner-specific
    bannerBeat: 600, // pause between banner sequence entries
    bannerHold: 3000, // default banner display duration
  };


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

  /* ── FLOAT STYLE CONFIG ── */
  const FLOAT_STYLE = {
    boxed: true /* draw border box around text? */,
    life: 2500 /* ms on screen */,
    fadeStart: 0.15 /* fraction of life at which it fades */,
    padX: 1 /* horizontal padding inside box */,
  };

  function ctrl(baseKey) {
    const mobileKey = baseKey + "Mobile";
    if (Device.isMobile && window.LANG[mobileKey]) return window.LANG[mobileKey];
    return window.LANG[baseKey];
  }

  const _decks = {};
  function drawDeck(key, arr) {
    if (!arr || !arr.length) return "";
    let d = _decks[key];
    if (!d || d.src !== arr || !d.left.length) {
      const idx = _shuffledIndices(arr.length);
      const last = d ? d.lastIdx : null;
      if (idx.length > 1 && idx[idx.length - 1] === last) idx.unshift(idx.pop());
      d = _decks[key] = { left: idx, src: arr, lastIdx: last };
    }
    d.lastIdx = d.left.pop();
    return arr[d.lastIdx];
  }
