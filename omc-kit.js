/**
 * OMC Game Kit — browser game toolkit
 * from patterns in Backoff + Loser Lane
 * 
 * GameLoop, Input, State, Audio, Animation, Entities, Spatial, Device
 */

// ============================================================
// DEVICE — Mobile/iOS detection, network awareness
// ============================================================
const Device = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  hasLowMemory: (navigator.deviceMemory && navigator.deviceMemory <= 2),
  
  get isSlowConnection() {
    const conn = navigator.connection;
    if (!conn) return false;
    return ['slow-2g', '2g', '3g'].includes(conn.effectiveType) || conn.saveData;
  },

  get pixelRatio() {
    return window.devicePixelRatio || 1;
  },

  get isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};


// ============================================================
// GAME LOOP — requestAnimationFrame with delta time + speed control
// ============================================================
class GameLoop {
  constructor({ update, render, speed = 1.0, fixedStep = null } = {}) {
    this._updateFn = update || (() => {});
    this._renderFn = render || (() => {});
    this.speed = speed;
    this.fixedStep = fixedStep; // ms — if set, update runs at fixed intervals
    this._running = false;
    this._paused = false;
    this._frameId = null;
    this._lastTime = 0;
    this._accumulator = 0;
    this._frameCount = 0;
    this._fpsTime = 0;
    this.fps = 0;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this._lastTime = performance.now();
    this._accumulator = 0;
    this._tick();
  }

  stop() {
    this._running = false;
    if (this._frameId) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }
  }

  pause()  { this._paused = true; }
  resume() { this._paused = false; this._lastTime = performance.now(); }
  get isPaused() { return this._paused; }
  get isRunning() { return this._running; }

  _tick() {
    if (!this._running) return;
    this._frameId = requestAnimationFrame((now) => {
      // FPS counter
      this._frameCount++;
      if (now - this._fpsTime >= 1000) {
        this.fps = this._frameCount;
        this._frameCount = 0;
        this._fpsTime = now;
      }

      if (this._paused) {
        this._lastTime = now;
        this._tick();
        return;
      }

      const raw = now - this._lastTime;
      // Cap delta to avoid spiral of death on tab-switch
      const delta = Math.min(raw, 200) * this.speed;
      this._lastTime = now;

      if (this.fixedStep) {
        // Fixed timestep with accumulator
        this._accumulator += delta;
        while (this._accumulator >= this.fixedStep) {
          this._updateFn(this.fixedStep, now);
          this._accumulator -= this.fixedStep;
        }
      } else {
        // Variable timestep
        this._updateFn(delta, now);
      }

      this._renderFn(delta, now);
      this._tick();
    });
  }
}


// ============================================================
// STATE — Simple observable state machine (from your GameState patterns)
// ============================================================
class State {
  constructor(initial = {}) {
    this._state = { ...initial };
    this._listeners = {};
    this._phase = null;
    this._phaseListeners = [];
  }

  get(key) { return this._state[key]; }
  
  set(key, value) {
    const old = this._state[key];
    if (old === value) return;
    this._state[key] = value;
    if (this._listeners[key]) {
      this._listeners[key].forEach(fn => fn(value, old, key));
    }
    // Wildcard listeners
    if (this._listeners['*']) {
      this._listeners['*'].forEach(fn => fn(value, old, key));
    }
  }

  // Bulk update
  update(obj) {
    for (const [k, v] of Object.entries(obj)) {
      this.set(k, v);
    }
  }

  on(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
    return () => {
      this._listeners[key] = this._listeners[key].filter(f => f !== fn);
    };
  }

  // Phase system (menu → playing → gameover → etc.)
  get phase() { return this._phase; }
  
  setPhase(name) {
    const old = this._phase;
    this._phase = name;
    this._phaseListeners.forEach(fn => fn(name, old));
  }
  
  onPhase(fn) {
    this._phaseListeners.push(fn);
    return () => {
      this._phaseListeners = this._phaseListeners.filter(f => f !== fn);
    };
  }

  reset(initial) {
    this._state = { ...initial };
  }

  toJSON() { return { ...this._state, _phase: this._phase }; }
}


// ============================================================
// INPUT — Unified keyboard + touch + pointer, inspired by both games
// ============================================================
class Input {
  constructor(target = window) {
    this.target = target;
    this._keys = {};
    this._justPressed = {};
    this._justReleased = {};
    this._pointerDown = false;
    this._pointerPos = { x: 0, y: 0 };
    this._pointerStart = null;
    this._swipe = null;
    this._actions = {}; // named actions → key bindings
    this._listeners = []; // for cleanup

    this._bind();
  }

  // Map named actions to keys: input.mapActions({ left: ['ArrowLeft','a'], right: ['ArrowRight','d'] })
  mapActions(map) {
    this._actions = {};
    for (const [action, keys] of Object.entries(map)) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      keyList.forEach(k => { this._actions[k] = action; });
    }
  }

  isDown(keyOrAction)  { return !!this._keys[keyOrAction]; }
  justPressed(keyOrAction)  { return !!this._justPressed[keyOrAction]; }
  justReleased(keyOrAction) { return !!this._justReleased[keyOrAction]; }
  get pointer() { return { ...this._pointerPos, isDown: this._pointerDown }; }
  get swipe() { return this._swipe; }

  // Call at end of each update to clear "just" flags
  endFrame() {
    this._justPressed = {};
    this._justReleased = {};
    this._swipe = null;
  }

  _bind() {
    const on = (el, evt, fn, opts) => {
      el.addEventListener(evt, fn, opts);
      this._listeners.push(() => el.removeEventListener(evt, fn, opts));
    };

    on(this.target, 'keydown', (e) => {
      const key = e.key;
      const action = this._actions[key];
      if (!this._keys[key]) {
        this._justPressed[key] = true;
        if (action) this._justPressed[action] = true;
      }
      this._keys[key] = true;
      if (action) this._keys[action] = true;
    });

    on(this.target, 'keyup', (e) => {
      const key = e.key;
      const action = this._actions[key];
      this._keys[key] = false;
      if (action) {
        // Only release action if no other key for it is held
        const otherKeysForAction = Object.entries(this._actions)
          .filter(([k, a]) => a === action && k !== key)
          .some(([k]) => this._keys[k]);
        if (!otherKeysForAction) this._keys[action] = false;
      }
      this._justReleased[key] = true;
      if (action) this._justReleased[action] = true;
    });

    // Pointer (mouse + touch unified)
    const passive = { passive: true };

    on(this.target, 'pointerdown', (e) => {
      this._pointerDown = true;
      this._pointerPos = { x: e.clientX, y: e.clientY };
      this._pointerStart = { x: e.clientX, y: e.clientY, time: performance.now() };
    }, passive);

    on(this.target, 'pointermove', (e) => {
      this._pointerPos = { x: e.clientX, y: e.clientY };
    }, passive);

    on(this.target, 'pointerup', (e) => {
      this._pointerDown = false;
      this._pointerPos = { x: e.clientX, y: e.clientY };

      // Swipe detection
      if (this._pointerStart) {
        const dx = e.clientX - this._pointerStart.x;
        const dy = e.clientY - this._pointerStart.y;
        const dt = performance.now() - this._pointerStart.time;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 30 && dt < 500) {
          if (Math.abs(dx) > Math.abs(dy)) {
            this._swipe = dx > 0 ? 'right' : 'left';
          } else {
            this._swipe = dy > 0 ? 'down' : 'up';
          }
        }
      }
      this._pointerStart = null;
    }, passive);
  }

  destroy() {
    this._listeners.forEach(fn => fn());
    this._listeners = [];
  }
}


// ============================================================
// AUDIO — Pooled audio with priority loading, iOS unlock, fade
// Distilled from your 1000+ line AudioManager
// ============================================================
class Audio_ {
  constructor({ basePath = 'sounds/', poolSize = 8, volume = 1.0 } = {}) {
    this.basePath = basePath.endsWith('/') ? basePath : basePath + '/';
    this.volume = volume;
    this.muted = false;
    this._initialized = false;
    this._ctx = null;
    this._pool = [];
    this._playing = [];
    this._cache = {};      // name → HTMLAudioElement (preloaded)
    this._groups = {};     // name → [filenames] for random play
    this._fades = new Map();

    // Build pool
    for (let i = 0; i < poolSize; i++) {
      this._pool.push(new window.Audio());
    }
  }

  // Register sounds: audio.register({ click: 'click.mp3', slap: ['slap1.mp3','slap2.mp3'] })
  register(manifest) {
    for (const [name, files] of Object.entries(manifest)) {
      if (Array.isArray(files)) {
        this._groups[name] = files;
      } else {
        this._groups[name] = [files];
      }
    }
  }

  // Preload specific sounds (critical path)
  async preload(names) {
    const toLoad = Array.isArray(names) ? names : [names];
    const promises = toLoad.map(name => {
      const files = this._groups[name];
      if (!files) return Promise.resolve();
      return Promise.all(files.map(file => this._loadOne(name, file)));
    });
    return Promise.all(promises);
  }

  _loadOne(name, file) {
    const key = this.basePath + file;
    if (this._cache[key]) return Promise.resolve(this._cache[key]);
    
    return new Promise((resolve) => {
      const audio = new window.Audio();
      audio.preload = 'auto';
      audio.src = key;
      audio.oncanplaythrough = () => {
        this._cache[key] = audio;
        resolve(audio);
      };
      audio.onerror = () => resolve(null);
      audio.load();
    });
  }

  // Must call on first user interaction (especially iOS)
  unlock() {
    if (this._initialized) return Promise.resolve(true);

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if (window.AudioContext) {
      this._ctx = new window.AudioContext();
    }

    this._initialized = true;

    // iOS silent sound trick
    if (Device.isIOS) {
      const s = new window.Audio(
        'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAABhgFbHRkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEAAIF0DZEAAAITB2YWAAAwCQAAbQMgjEBgMB'
      );
      s.volume = 0.01;
      s.play().then(() => s.pause()).catch(() => {});
    }

    // Resume context
    if (this._ctx && this._ctx.state === 'suspended') {
      return this._ctx.resume().then(() => true).catch(() => false);
    }
    return Promise.resolve(true);
  }

  // Play a sound (or random from group)
  play(name, { volume, loop = false } = {}) {
    if (this.muted || !this._initialized) return null;

    const files = this._groups[name];
    if (!files || files.length === 0) {
      console.warn(`[Audio] Sound not found: ${name}`);
      return null;
    }

    // Pick file (random if group)
    const file = files[files.length === 1 ? 0 : Math.floor(Math.random() * files.length)];
    const src = this.basePath + file;

    // Try cached clone first (instant playback for preloaded sounds)
    const cached = this._cache[src];
    let audio;
    if (cached) {
      audio = cached.cloneNode();
    } else {
      // Get from pool
      audio = this._pool.pop() || new window.Audio();
      audio.src = src;
    }

    audio.loop = loop;
    audio.volume = Math.min(1, (volume ?? 1) * this.volume);
    audio.currentTime = 0;

    // Track it
    this._playing.push(audio);
    audio.onended = () => {
      this._returnToPool(audio);
    };

    audio.play().catch(() => this._returnToPool(audio));
    return audio;
  }

  // Stop a specific playing sound
  stop(audio) {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    this._returnToPool(audio);
  }

  // Fade an audio element to target volume over duration(ms)
  fade(audio, targetVolume, duration, onDone) {
    if (!audio) return;
    const start = audio.volume;
    const diff = targetVolume - start;
    const startTime = performance.now();

    // Clear existing fade on this element
    if (this._fades.has(audio)) {
      clearInterval(this._fades.get(audio));
    }

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = start + diff * progress;
      if (progress >= 1) {
        clearInterval(interval);
        this._fades.delete(audio);
        if (targetVolume <= 0.01) {
          audio.pause();
          audio.currentTime = 0;
        }
        if (onDone) onDone();
      }
    }, 30);

    this._fades.set(audio, interval);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this._playing.forEach(s => { if (s && !s.paused) s.pause(); });
    }
    return this.muted;
  }

  stopAll() {
    [...this._playing].forEach(s => this.stop(s));
    this._fades.forEach(interval => clearInterval(interval));
    this._fades.clear();
  }

  _returnToPool(audio) {
    const idx = this._playing.indexOf(audio);
    if (idx !== -1) this._playing.splice(idx, 1);
    audio.onended = null;
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    if (this._pool.length < 20) {
      this._pool.push(audio);
    }
  }
}


// ============================================================
// ANIMATION — Sprite sheet + CSS frame animation manager
// Distilled from your AnimationManager class
// ============================================================
class SpriteAnimator {
  constructor(element) {
    this.el = element; // The DOM element to animate (background-image sprite)
    this.animations = {};
    this.current = null;
    this.frame = 0;
    this.loopCount = 0;
    this._raf = null;
    this._lastFrameTime = 0;
    this._accumulator = 0;
    this._playing = false;
    this._onComplete = null;
    this._queue = [];
    this.speed = 1.0; // multiplier
  }

  // Define animations: animator.define('idle', { sheet: 'idle.png', frames: 2, duration: 300, loop: true })
  define(name, { sheet, frames, duration = 200, loop = false, loopCount = Infinity, onFrame } = {}) {
    this.animations[name] = {
      sheet,
      frames,
      duration,
      loop: loop || loopCount === Infinity,
      loopCount: loop ? Infinity : loopCount,
      onFrame: onFrame || null, // callback(frameIndex) per frame
    };
  }

  // Play an animation
  play(name, onComplete) {
    const anim = this.animations[name];
    if (!anim) {
      console.warn(`[Sprite] Animation not found: ${name}`);
      return;
    }

    // Stop current
    this._stop();

    this.current = name;
    this.frame = 0;
    this.loopCount = 0;
    this._onComplete = onComplete || null;
    this._playing = true;

    // Set sprite sheet
    if (this.el && anim.sheet) {
      this.el.style.backgroundImage = `url(${anim.sheet})`;
    }
    this._updateFrame();

    this._lastFrameTime = performance.now();
    this._accumulator = 0;
    this._tick();
  }

  // Queue an animation to play after current finishes
  queue(name, onComplete) {
    this._queue.push({ name, onComplete });
  }

  // Play a sequence: animator.sequence(['hit', 'recover', 'idle'])
  sequence(names, finalCallback) {
    if (names.length === 0) { if (finalCallback) finalCallback(); return; }
    const [first, ...rest] = names;
    this.play(first, () => this.sequence(rest, finalCallback));
  }

  stop() {
    this._stop();
    this._queue = [];
  }

  _stop() {
    this._playing = false;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  _tick() {
    if (!this._playing) return;
    this._raf = requestAnimationFrame((now) => {
      const anim = this.animations[this.current];
      if (!anim) return;

      const frameDuration = Math.max(30, anim.duration / this.speed);
      const elapsed = now - this._lastFrameTime;
      this._lastFrameTime = now;
      this._accumulator += elapsed;

      if (this._accumulator >= frameDuration) {
        this._accumulator -= frameDuration;
        this.frame++;

        if (this.frame >= anim.frames) {
          this.frame = 0;
          this.loopCount++;

          if (!anim.loop || this.loopCount >= anim.loopCount) {
            this._playing = false;
            const cb = this._onComplete;
            this._onComplete = null;

            // Check queue
            if (this._queue.length > 0) {
              const next = this._queue.shift();
              this.play(next.name, next.onComplete);
            } else if (cb) {
              cb();
            }
            return;
          }
        }

        this._updateFrame();
      }

      this._tick();
    });
  }

  _updateFrame() {
    if (!this.el) return;
    const anim = this.animations[this.current];
    if (!anim) return;

    // Horizontal sprite strip: offset by frame * element width
    const width = this.el.offsetWidth || this.el.clientWidth;
    this.el.style.backgroundPosition = `-${this.frame * width}px 0`;

    if (anim.onFrame) anim.onFrame(this.frame);
  }
}


// ============================================================
// ENTITY SYSTEM — Lightweight, inspired by your DarlingType + SpatialManager
// ============================================================
class Entity {
  constructor(type, x = 0, y = 0, props = {}) {
    this.id = Entity._nextId++;
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = props.width || 1;
    this.height = props.height || 1;
    this.active = true;
    this.tags = new Set(props.tags || []);
    // Arbitrary extra data
    Object.assign(this, props);
  }

  get left()   { return this.x; }
  get right()  { return this.x + this.width; }
  get top()    { return this.y; }
  get bottom() { return this.y + this.height; }

  overlaps(other) {
    return this.left < other.right &&
           this.right > other.left &&
           this.top < other.bottom &&
           this.bottom > other.top;
  }

  distanceTo(other) {
    const dx = (this.x + this.width / 2) - (other.x + other.width / 2);
    const dy = (this.y + this.height / 2) - (other.y + other.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }
}
Entity._nextId = 0;


class EntityManager {
  constructor() {
    this.entities = [];
    this._byType = {};
    this._byTag = {};
  }

  add(entity) {
    this.entities.push(entity);
    // Index by type
    if (!this._byType[entity.type]) this._byType[entity.type] = [];
    this._byType[entity.type].push(entity);
    // Index by tags
    entity.tags.forEach(tag => {
      if (!this._byTag[tag]) this._byTag[tag] = [];
      this._byTag[tag].push(entity);
    });
    return entity;
  }

  create(type, x, y, props) {
    return this.add(new Entity(type, x, y, props));
  }

  remove(entity) {
    entity.active = false;
  }

  getByType(type) {
    return (this._byType[type] || []).filter(e => e.active);
  }

  getByTag(tag) {
    return (this._byTag[tag] || []).filter(e => e.active);
  }

  // Check collisions between two groups
  collisions(groupA, groupB) {
    const hits = [];
    for (const a of groupA) {
      if (!a.active) continue;
      for (const b of groupB) {
        if (!b.active || a === b) continue;
        if (a.overlaps(b)) hits.push([a, b]);
      }
    }
    return hits;
  }

  // Flush inactive entities
  cleanup() {
    this.entities = this.entities.filter(e => e.active);
    for (const type in this._byType) {
      this._byType[type] = this._byType[type].filter(e => e.active);
    }
    for (const tag in this._byTag) {
      this._byTag[tag] = this._byTag[tag].filter(e => e.active);
    }
  }

  clear() {
    this.entities = [];
    this._byType = {};
    this._byTag = {};
  }
}


// ============================================================
// TIMER — Delayed actions, sequences, cooldowns
// ============================================================
class Timer {
  constructor() {
    this._timers = [];
  }

  // One-shot delay: timer.after(1000, () => explode())
  after(ms, fn) {
    const t = { remaining: ms, fn, repeat: false, active: true };
    this._timers.push(t);
    return t;
  }

  // Repeating: timer.every(500, () => spawnEnemy())
  every(ms, fn) {
    const t = { remaining: ms, interval: ms, fn, repeat: true, active: true };
    this._timers.push(t);
    return t;
  }

  cancel(t) {
    if (t) t.active = false;
  }

  // Call each frame with delta ms
  update(delta) {
    for (let i = this._timers.length - 1; i >= 0; i--) {
      const t = this._timers[i];
      if (!t.active) { this._timers.splice(i, 1); continue; }
      
      t.remaining -= delta;
      if (t.remaining <= 0) {
        t.fn();
        if (t.repeat) {
          t.remaining += t.interval;
        } else {
          this._timers.splice(i, 1);
        }
      }
    }
  }

  clear() {
    this._timers = [];
  }
}


// ============================================================
// UTIL — I keep rewriting
// ============================================================
const Util = {
  // Random integer in [min, max]
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Pick random from array
  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Shuffle (Fisher-Yates) — returns new array
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Clamp
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  // Linear interpolation
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  // Eased lerp (decelerate)
  ease(a, b, t) {
    t = 1 - Math.pow(1 - t, 3); // ease-out cubic
    return a + (b - a) * t;
  },

  // Distance between two {x,y} points
  dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Format seconds to MM:SS
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  // Simple element creator
  el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    }
    children.forEach(c => {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    });
    return e;
  }
};


// ============================================================
// EXPORT
// ============================================================
// Works as ES module, CommonJS, or plain <script>
const OMC = { Device, GameLoop, State, Input, Audio: Audio_, SpriteAnimator, Entity, EntityManager, Timer, Util };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OMC;
} else if (typeof window !== 'undefined') {
  window.OMC = OMC;
}
