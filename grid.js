/* Grid — ASCII cell grid + HTML renderer. */
(function () {
  /* Detects characters that may render wider than 1 monospace cell. */
  function isWideChar(ch) {
    if (!ch || ch.length === 0) return false;
    const code = ch.charCodeAt(0);
    /* Fast reject for common ASCII + Latin */
    if (code < 0x0180) return false;
    /* Known problem ranges — extended for Windows Chrome (Consolas/Courier New) */
    return (
      (code >= 0x0180 && code <= 0x024f) /* Latin Extended-B (ƛ hat) */ ||
      (code >= 0x0370 && code <= 0x03ff) /* Greek + Coptic (φ ψ Ω Θ NPC bodies) */ ||
      (code >= 0x0b80 && code <= 0x0bff) /* Tamil (cat ஹ, mountain ௳ ୰) */ ||
      (code >= 0x0d80 && code <= 0x0dff) /* Sinhala (cat ඣ) */ ||
      (code >= 0x1100 && code <= 0x115f) /* Hangul Jamo */ ||
      (code >= 0x2010 && code <= 0x2027) /* General Punctuation hyphens/dashes */ ||
      (code >= 0x20a0 && code <= 0x20cf) /* Currency (₳ walk-cycle leg, € £ ¥ ₿ ₽) */ ||
      (code >= 0x2190 && code <= 0x21ff) /* Arrows */ ||
      (code >= 0x2500 && code <= 0x257f) /* Box drawing */ ||
      (code >= 0x2580 && code <= 0x259f) /* Block elements (█ ░ ▒ ▓) */ ||
      (code >= 0x25a0 && code <= 0x25ff) /* Geometric shapes (▶ ◀ ◆ ◇ ◎ ● ○) */ ||
      (code >= 0x2600 && code <= 0x27bf) /* Misc symbols + dingbats (♥ ♦ ✦ ★) */ ||
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
            b: false,
            bg: null,
            flip: false,
            lift: false,
            rot: 0,
          };
      }
    }
    clear() {
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.w; x++) {
          this.c[y][x].ch = " ";
          this.c[y][x].co = null;
          this.c[y][x].b = false;
          this.c[y][x].bg = null;
          this.c[y][x].flip = false;
          this.c[y][x].lift = false;
          this.c[y][x].rot = 0;
        }
      this.wideRows.clear();
    }
    /* Background color on a cell */
    setBg(x, y, bg) {
      x = Math.floor(x);
      y = Math.floor(y);
      if (x >= 0 && x < this.w && y >= 0 && y < this.h) this.c[y][x].bg = bg || null;
    }
   
    set(x, y, ch, co, bold, flip, lift, rot) {
      x = Math.floor(x);
      y = Math.floor(y);
      if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
        this.c[y][x].ch = ch;
        this.c[y][x].co = co || null;
        this.c[y][x].b = !!bold;
        this.c[y][x].flip = !!flip;
        this.c[y][x].lift = !!lift;
        this.c[y][x].rot = rot || 0;
        /* Rotated cells need their own <span> to carry a transform, same as
           wide chars — route the whole row through the rigid per-cell path. */
        if (isWideChar(ch) || rot) this.wideRows.add(y);
      }
    }
    text(s, x, y, co, bold) {
      for (let i = 0; i < s.length; i++) this.set(x + i, y, s[i], co, bold);
    }
    textCenter(s, y, co) {
      this.text(s, Math.floor((this.w - s.length) / 2), y, co);
    }
    art(a, px, py, co, flip, lift, rot) {
      if (!Array.isArray(a)) {
        console.warn("Grid.art: undefined art passed from", new Error().stack.split("\n")[2]);
        return;
      }
      px = Math.round(px);
      py = Math.round(py);
      a.forEach((l, r) => {
        for (let i = 0; i < l.length; i++) {
          if (l[i] !== " ") {
            this.set(px + i, py + r, l[i], co, false, flip, lift, rot);
          } else {
            this.set(px + i, py + r, " ", "#000"); // block mountain bleed
          }
        }
      });
    }
    htmlRows() {
      const rows = [];
      let o = "";
      for (let y = 0; y < this.h; y++) {
        if (this.wideRows.has(y)) {
          /* Rigid per-cell rendering for rows containing wide chars*/
          for (let x = 0; x < this.w; x++) {
            const c = this.c[y][x];
            const ch = c.ch === "<" ? "&lt;" : c.ch === ">" ? "&gt;" : c.ch === "&" ? "&amp;" : c.ch;
         
            const _transforms = [];
            if (c.flip) _transforms.push("scaleX(-1)");
            if (c.lift) _transforms.push("translateY(-2px)");
            if (c.rot) _transforms.push("rotate(" + c.rot + "deg)");
            const style =
              (c.co ? "color:" + c.co + ";" : "") +
              (c.b ? "font-weight:bold;" : "") +
              (c.bg ? "background-color:" + c.bg + ";box-shadow:0 -2px 0 " + c.bg + ",0 2px 0 " + c.bg + ";" : "") +
     
              (_transforms.length
                ? "transform:" + _transforms.join(" ") + ";transform-origin:" + (c.rot ? "center;" : "left;")
                : "");
            if (style) {
              o += '<span class="cell" style="' + style + '">' + ch + "</span>";
            } else {
              o += '<span class="cell">' + ch + "</span>";
            }
          }
          rows.push(o);
          o = "";
        } else {
          /* Fast path: run-length color+bold+background+lift merging for normal rows. */
          let lc = null,
            lb = false,
            lbg = null,
            llift = false,
            spanOpen = false;
          for (let x = 0; x < this.w; x++) {
            const c = this.c[y][x];
            const b = !!c.b;
            const bg = c.bg || null;
            const lift = !!c.lift;
            if (c.co !== lc || b !== lb || bg !== lbg || lift !== llift) {
              if (spanOpen) o += "</span>";
              if (c.co || b || bg || lift) {
           
                o +=
                  '<span style="' +
                  (c.co ? "color:" + c.co + ";" : "") +
                  (b ? "font-weight:bold;" : "") +
                  (bg ? "background-color:" + bg + ";box-shadow:0 -2px 0 " + bg + ",0 2px 0 " + bg + ";" : "") +
                  (lift ? "display:inline-block;transform:translateY(-2px);" : "") +
                  '">';
                spanOpen = true;
              } else {
                spanOpen = false;
              }
              lc = c.co;
              lb = b;
              lbg = bg;
              llift = lift;
            }
            o += c.ch === "<" ? "&lt;" : c.ch === ">" ? "&gt;" : c.ch === "&" ? "&amp;" : c.ch;
          }
          if (spanOpen) o += "</span>";
          rows.push(o);
          o = "";
        }
      }
      return rows;
    }
    html() {
      return this.htmlRows().join("\n") + "\n";
    }
  }
  window.Grid = Grid;
})();
