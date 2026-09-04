/* Effects — drain / mirror fold / corrupt grid effects. */
(function () {

  const Effects = (() => {
    const active = [];
    const HARD_CHARS = "█▓▒░▄▀■◆●✕#@!?%$&*XZ╬╫┼±";
    const GLITCH_COLS = ["#f44", "#0ff", "#ff0", "#f0f", "#fff", "#f80", "#cc6688"];

    function inRegion(x, y, opts) {
      if (opts.radius == null) return true;
      const dx = x - opts.x;
      const dy = (y - opts.y) * 2; // cells are ~2x taller than wide visually
      return dx * dx + dy * dy <= opts.radius * opts.radius;
    }

    function falloff(x, y, opts) {
      if (opts.radius == null) return 1;
      const dx = x - opts.x;
      const dy = (y - opts.y) * 2;
      const d = Math.sqrt(dx * dx + dy * dy);
      return Math.max(0, 1 - d / opts.radius);
    }

  
    function snapshotGrid(grid) {
      const snap = [];
      for (let y = 0; y < grid.h; y++) {
        snap[y] = [];
        for (let x = 0; x < grid.w; x++) {
          snap[y][x] = { ch: grid.c[y][x].ch, co: grid.c[y][x].co };
        }
      }
      return snap;
    }

    function compositeBack(snap, grid, opts) {
      for (let y = 0; y < grid.h; y++) {
        for (let x = 0; x < grid.w; x++) {
          if (inRegion(x, y, opts)) {
            grid.set(x, y, snap[y][x].ch, snap[y][x].co);
          }
        }
      }
    }

    // ── DRAIN ──────────────────────────────────────────────
    class DrainFX {
      constructor(opts) {
        this.opts = opts;
        this.t = 0;
        this.done = false;
        this.snap = null;
        this.orig = null;
        this.darkAt = null;
      }
      update(dt, grid) {
        this.t += dt;
        const progress = Math.min(this.t / this.opts.duration, 1);
        if (!this.snap) {
          this.snap = snapshotGrid(grid);
          if (this.opts.restore) this.orig = snapshotGrid(grid);
        }
        const r = this.opts.radius;
        const ceilY = r == null ? 0 : Math.max(0, Math.floor(this.opts.y - r / 2));
        const floorY = r == null ? grid.h - 1 : Math.min(grid.h - 1, Math.ceil(this.opts.y + r / 2));

        // Restore mode: first half drains, second half reconstitutes
        const isRestoring = this.opts.restore && progress > 0.5;
        if (isRestoring) {
          // Lerp snapshot back toward original
          const restoreT = (progress - 0.5) * 2; // 0..1
          for (let y = 0; y < grid.h; y++) {
            for (let x = 0; x < grid.w; x++) {
              if (!inRegion(x, y, this.opts)) continue;
              if (Math.random() < restoreT * 0.15) {
                this.snap[y][x] = { ch: this.orig[y][x].ch, co: this.orig[y][x].co };
              }
            }
          }
        } else {
          // Drain: gravity passes
          const passes = Math.max(1, Math.floor(progress * 3 * this.opts.intensity));
          for (let p = 0; p < passes; p++) {
            for (let y = floorY - 1; y >= ceilY; y--) {
              for (let x = 0; x < grid.w; x++) {
                if (!inRegion(x, y, this.opts)) continue;
                const c = this.snap[y][x];
                if (c.ch === " ") continue;
                const below = this.snap[y + 1] && this.snap[y + 1][x];
                if (below && below.ch === " " && inRegion(x, y + 1, this.opts)) {
                  this.snap[y + 1][x] = { ch: c.ch, co: c.co };
                  this.snap[y][x] = { ch: " ", co: null };
                } else if (
                  x > 0 &&
                  this.snap[y + 1] &&
                  this.snap[y + 1][x - 1] &&
                  this.snap[y + 1][x - 1].ch === " " &&
                  inRegion(x - 1, y + 1, this.opts) &&
                  Math.random() < 0.3
                ) {
                  this.snap[y + 1][x - 1] = { ch: c.ch, co: c.co };
                  this.snap[y][x] = { ch: " ", co: null };
                } else if (
                  x < grid.w - 1 &&
                  this.snap[y + 1] &&
                  this.snap[y + 1][x + 1] &&
                  this.snap[y + 1][x + 1].ch === " " &&
                  inRegion(x + 1, y + 1, this.opts) &&
                  Math.random() < 0.3
                ) {
                  this.snap[y + 1][x + 1] = { ch: c.ch, co: c.co };
                  this.snap[y][x] = { ch: " ", co: null };
                }
              }
            }
          }
          // Evaporate from floor (only if NOT in restore mode)
          if (progress > 0.4 && !this.opts.restore) {
            const evapCount = Math.floor((progress - 0.4) * 8 * this.opts.intensity);
            for (let i = 0; i < evapCount; i++) {
              const x = Math.floor(Math.random() * grid.w);
              if (inRegion(x, floorY, this.opts)) this.snap[floorY][x] = { ch: " ", co: null };
              if (Math.random() < 0.4 && floorY - 1 >= 0 && inRegion(x, floorY - 1, this.opts)) {
                this.snap[floorY - 1][x] = { ch: " ", co: null };
              }
            }
          }
        }

        if (this.opts.toBlack) {
          if (!this.darkAt) {
            this.darkAt = [];
            for (let y = 0; y < grid.h; y++) {
              this.darkAt[y] = [];
              for (let x = 0; x < grid.w; x++) this.darkAt[y][x] = 0.5 + Math.random() * 0.5;
            }
          }
          for (let y = 0; y < grid.h; y++) {
            for (let x = 0; x < grid.w; x++) {
              if (inRegion(x, y, this.opts) && progress >= this.darkAt[y][x]) this.snap[y][x] = { ch: " ", co: null };
            }
          }
        }
        compositeBack(this.snap, grid, this.opts);
        if (progress >= 1) {
          // If not restore/toBlack, snap is left drained (caller's choice to redraw next frame)
          this.done = true;
        }
      }
    }

    // ── MIRROR FOLD ────────────────────────────────────────
    class MirrorFX {
      constructor(opts) {
        this.opts = opts;
        this.t = 0;
        this.done = false;
        this.snap = null;
        this.darkAt = null;
      }
      update(dt, grid) {
        this.t += dt;
        const progress = Math.min(this.t / this.opts.duration, 1);

        const foldPhase = this.opts.toBlack ? Math.min(1, progress / 0.5) : progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        const r = this.opts.radius;
        const cy = r == null ? Math.floor(grid.h / 2) : this.opts.y;
        const minY = r == null ? 0 : Math.max(0, Math.floor(this.opts.y - r / 2));
        const maxY = r == null ? grid.h - 1 : Math.min(grid.h - 1, Math.ceil(this.opts.y + r / 2));
        const regionH = maxY - minY + 1;
        // per-frame row-slice: live scene, without full-grid copies
        const _pad = Math.ceil(regionH * 0.2) + 1;
        const _lo = Math.max(0, minY - _pad),
          _hi = Math.min(grid.h - 1, maxY + _pad);
        this.snap = [];
        for (let y = _lo; y <= _hi; y++) {
          this.snap[y] = [];
          for (let x = 0; x < grid.w; x++) this.snap[y][x] = { ch: grid.c[y][x].ch, co: grid.c[y][x].co };
        }

        const smear = this.opts.toBlack ? Math.ceil(foldPhase * regionH * 0.5) : Math.floor(foldPhase * regionH * 0.5 * this.opts.intensity);

        if (this.opts.toBlack && !this.darkAt) {
          this.darkAt = [];
          for (let y = 0; y < grid.h; y++) {
            this.darkAt[y] = [];
            for (let x = 0; x < grid.w; x++) this.darkAt[y][x] = 0.5 + Math.random() * 0.5;
          }
        }

        for (let y = minY; y <= maxY; y++) {
          const distFromTop = y - minY;
          const distFromBot = maxY - y;
          const fold = Math.min(distFromTop, distFromBot);
          for (let x = 0; x < grid.w; x++) {
            if (!inRegion(x, y, this.opts)) continue;
            if (this.opts.toBlack && progress >= this.darkAt[y][x]) {
              grid.set(x, y, " ", "#000");
              continue;
            }
            if (fold < smear) {
              let srcY;
              if (y < cy) srcY = maxY - distFromTop + Math.floor(Math.random() * smear * 0.3);
              else srcY = minY + distFromBot - Math.floor(Math.random() * smear * 0.3);
              srcY = Math.max(0, Math.min(grid.h - 1, srcY));
              const src = (this.snap[srcY] || grid.c[srcY])[x];
              const corruptChance = (1 - fold / Math.max(1, smear)) * 0.5 * this.opts.intensity;
              if (Math.random() < corruptChance) {
                grid.set(
                  x,
                  y,
                  HARD_CHARS[Math.floor(Math.random() * HARD_CHARS.length)],
                  GLITCH_COLS[Math.floor(Math.random() * GLITCH_COLS.length)],
                );
              } else {
                grid.set(x, y, src.ch, src.co);
              }
            } else {
              grid.set(x, y, this.snap[y][x].ch, this.snap[y][x].co);
            }
          }
        }
        if (progress >= 1) {
          this.done = true;
        }
      }
    }

    // ── CORRUPTED MEMORY ───────────────────────────────────
    class CorruptFX {
      constructor(opts) {
        this.opts = opts;
        this.t = 0;
        this.done = false;
        this.snap = null;
        this.nextSwap = 0;
        this.darkAt = null;
      }
      update(dt, grid) {
        this.t += dt;
        const progress = Math.min(this.t / this.opts.duration, 1);
        const r = this.opts.radius;
        const minY = r == null ? 0 : Math.max(0, Math.floor(this.opts.y - r / 2));
        const maxY = r == null ? grid.h - 1 : Math.min(grid.h - 1, Math.ceil(this.opts.y + r / 2));

        if (this.opts.toBlack && !this.darkAt) {
          this.darkAt = [];
          for (let y = 0; y < grid.h; y++) {
            this.darkAt[y] = [];
            for (let x = 0; x < grid.w; x++) this.darkAt[y][x] = 0.5 + Math.random() * 0.5;
          }
        }

        const curve = this.opts.toBlack ? Math.min(1, progress / 0.5) : 1 - Math.abs(progress - 0.5) * 2;
        const chaos = curve * this.opts.intensity;

        // Row swaps (optional — disable with swap: false for gentler glitch-only)
        const allowSwap = this.opts.swap !== false;
        this.nextSwap -= dt;
        if (allowSwap && this.nextSwap <= 0 && chaos > 0.1) {
          this.nextSwap = 60 + Math.random() * 80;
          const numSwaps = Math.floor(1 + chaos * 3);
          for (let s = 0; s < numSwaps; s++) {
            const a = minY + Math.floor(Math.random() * (maxY - minY + 1));
            const b = minY + Math.floor(Math.random() * (maxY - minY + 1));
            for (let x = 0; x < grid.w; x++) {
              if (inRegion(x, a, this.opts) && inRegion(x, b, this.opts)) {
                const tCh = grid.c[a][x].ch,
                  tCo = grid.c[a][x].co;
                grid.set(x, a, grid.c[b][x].ch, grid.c[b][x].co);
                grid.set(x, b, tCh, tCo);
              }
            }
          }
        }
        // Per-cell glitch bleed
        for (let y = minY; y <= maxY; y++) {
          for (let x = 0; x < grid.w; x++) {
            if (!inRegion(x, y, this.opts)) continue;
            const f = falloff(x, y, this.opts);
            if (Math.random() < chaos * f * 0.45) {
              grid.set(x, y, HARD_CHARS[Math.floor(Math.random() * HARD_CHARS.length)], GLITCH_COLS[Math.floor(Math.random() * GLITCH_COLS.length)]);
            }
          }
        }
        if (this.opts.toBlack) {
          for (let y = minY; y <= maxY; y++) {
            for (let x = 0; x < grid.w; x++) {
              if (inRegion(x, y, this.opts) && progress >= this.darkAt[y][x]) grid.set(x, y, " ", "#000");
            }
          }
        }
        if (progress >= 1) {
          this.done = true;
        }
      }
    }

    // ── MAGNET LEAN ─────────────────────────────────────────
    // Continuous anticipation beat — glyphs within range lean away from the
    // point (via the grid's per-cell rot field, see grid.js), strength
    // fading with distance, plus a light standing wiggle. No fade, no
    // character swap — motion only. Meant to be layered ON TOP of another
    // effect: start it AFTER the other effect (Effects.start pushes to the
    // end of `active`, and `update()` runs that array back-to-front, so the
    // most-recently-started effect draws last and its rotation survives).
    class MagnetLeanFX {
      constructor(opts) {
        this.opts = opts;
        this.t = 0;
        this.done = false;
      }
      update(dt, grid) {
        this.t += dt;
        const progress = Math.min(this.t / this.opts.duration, 1);
        const r = this.opts.radius;
        const minY = r == null ? 0 : Math.max(0, Math.floor(this.opts.y - r / 2));
        const maxY = r == null ? grid.h - 1 : Math.min(grid.h - 1, Math.ceil(this.opts.y + r / 2));
        const maxRot = this.opts.maxRot;
        for (let y = minY; y <= maxY; y++) {
          for (let x = 0; x < grid.w; x++) {
            if (!inRegion(x, y, this.opts)) continue;
            const c = grid.c[y][x];
            if (c.ch === " ") continue;
            const f = falloff(x, y, this.opts);
            const dx = x - this.opts.x;
            const lean = Math.max(-maxRot, Math.min(maxRot, (dx / 8) * maxRot)) * f;
            const wiggle = Math.sin(this.t / 500 + dx + (y - this.opts.y)) * 3 * f;
            grid.set(x, y, c.ch, c.co, c.b, c.flip, c.lift, lean + wiggle);
          }
        }
        if (progress >= 1) this.done = true;
      }
    }

    // ── PENDING ─────────────────────────────────────────────
    // Placeholder for effects prototyped in fx-lab.html and wired into the
    // registry/hotkeys, but not yet implemented — ticks to done, touches no
    // grid cells. Swap a REGISTRY entry below for a real class (see
    // DrainFX/MirrorFX/CorruptFX for the shape) when it's time to build and
    // tune that one.
    class PendingFX {
      constructor(opts) {
        this.opts = opts;
        this.t = 0;
        this.done = false;
      }
      update(dt) {
        this.t += dt;
        if (this.t >= this.opts.duration) this.done = true;
      }
    }

    const REGISTRY = {
      drain: DrainFX,
      mirror: MirrorFX,
      corrupt: CorruptFX,
      // ── pending — see PendingFX above ──
      ringSnapFinal: PendingFX, // final narc takedown — full-scene ring cascade
      ringSnapLocal: PendingFX, // regular narc hit — localized, snappy ring cascade
      colorPulseHit: PendingFX, // regular narc hit — localized red color pulse
      scalePulseGrocery: PendingFX, // grocery store — slow breathing scale, ramps over ~20s
      densityRampFinal: PendingFX, // final ~10s before death — cranked density-glyph ramp
      glitchOrbChase: PendingFX, // chase scene — steady localized glitch orb following the player
      typewriterReveal: PendingFX, // Act 2 opening — world decodes in as player walks into it
      magnetLean: MagnetLeanFX, // "I've had enough" anticipation beat, before handing off to streamOut()
    };

    return {
      start(name, opts) {
        const Ctor = REGISTRY[name];
        if (!Ctor) {
          console.warn("[Effects] unknown:", name);
          return null;
        }
        const fx = new Ctor({
          x: opts.x ?? 0,
          y: opts.y ?? 0,
          radius: opts.radius ?? null,
          duration: opts.duration ?? 900,
          intensity: opts.intensity ?? 0.6,
          restore: opts.restore ?? false,
          swap: opts.swap !== false,
          toBlack: opts.toBlack ?? false,
          maxRot: opts.maxRot ?? 40,

          onDone: opts.onDone || null,
        });
        active.push(fx);
        return fx;
      },
      update(dt, grid) {
        for (let i = active.length - 1; i >= 0; i--) {
          active[i].update(dt, grid);
          if (active[i].done) {
            const cb = active[i].opts.onDone;
            active.splice(i, 1);

            if (cb) setTimeout(cb, 0);
          }
        }
      },

      clear() {
        active.length = 0;
      },
      get count() {
        return active.length;
      },
    };
  })();
  window.Effects = Effects;
})();
