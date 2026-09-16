

const Device = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  hasLowMemory: (navigator.deviceMemory && navigator.deviceMemory <= 2),
  /* FB in-app webview toolbar eats screen space */
  isFacebookInApp: /FBAN|FBAV|FB_IAB|FBIOS/i.test(navigator.userAgent),
  
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


class GameLoop {
  constructor({ update, render, speed = 1.0, fixedStep = null } = {}) {
    this._updateFn = update || (() => {});
    this._renderFn = render || (() => {});
    this.speed = speed;
    this.fixedStep = fixedStep; // ms; enables fixed timestep mode
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

      const delta = Math.max(0, Math.min(raw, 200)) * this.speed;
      this._lastTime = now;

      if (this.fixedStep) {
        this._accumulator += delta;
        while (this._accumulator >= this.fixedStep) {
          this._updateFn(this.fixedStep, now);
          this._accumulator -= this.fixedStep;
        }
      } else {
        this._updateFn(delta, now);
      }

      this._renderFn(delta, now);
      this._tick();
    });
  }
}


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
    // wildcard listeners
    if (this._listeners['*']) {
      this._listeners['*'].forEach(fn => fn(value, old, key));
    }
  }

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

  // e.g. menu, playing, gameover
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
    this._listeners = [];

    this._bind();
  }

  mapActions(map) {
    this._actions = {};
    for (const [action, keys] of Object.entries(map)) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      keyList.forEach(k => {
        if (!this._actions[k]) this._actions[k] = [];
        this._actions[k].push(action);
      });
    }
  }

  isDown(keyOrAction)  { return !!this._keys[keyOrAction]; }
  justPressed(keyOrAction)  { return !!this._justPressed[keyOrAction]; }
  justReleased(keyOrAction) { return !!this._justReleased[keyOrAction]; }
  get pointer() { return { ...this._pointerPos, isDown: this._pointerDown }; }
  get swipe() { return this._swipe; }

  // call at end of each update
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
      const actions = this._actions[key] || [];
      if (!this._keys[key]) {
        this._justPressed[key] = true;
        actions.forEach(action => { this._justPressed[action] = true; });
      }
      this._keys[key] = true;
      actions.forEach(action => { this._keys[action] = true; });
    });

    on(this.target, 'keyup', (e) => {
      const key = e.key;
      const actions = this._actions[key] || [];
      this._keys[key] = false;
      actions.forEach(action => {
        // only release if no other key held
        const otherKeysForAction = Object.entries(this._actions)
          .filter(([k, aList]) => aList.includes(action) && k !== key)
          .some(([k]) => this._keys[k]);
        if (!otherKeysForAction) this._keys[action] = false;
      });
      this._justReleased[key] = true;
      actions.forEach(action => { this._justReleased[action] = true; });
    });

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
    this._gainNodes = new WeakMap(); // iOS Safari ignores .volume; use gain

    for (let i = 0; i < poolSize; i++) {
      this._pool.push(new window.Audio());
    }
  }

  register(manifest) {
    for (const [name, files] of Object.entries(manifest)) {
      if (Array.isArray(files)) {
        this._groups[name] = files;
      } else {
        this._groups[name] = [files];
      }
    }
  }

  async preload(names, opts) {
    const toLoad = Array.isArray(names) ? names : [names];
    const asBlob = !!(opts && opts.blob);
    const promises = toLoad.map(name => {
      const files = this._groups[name];
      if (!files) return Promise.resolve();
      return Promise.all(files.map(file => this._loadOne(name, file, asBlob)));
    });
    return Promise.all(promises);
  }

  _loadOne(name, file, asBlob) {
    const key = this.basePath + file;
    if (this._cache[key]) return Promise.resolve(this._cache[key]);

    const wire = (audio, resolve) => {
      audio.oncanplaythrough = () => {
        audio._omcCached = true; // keeps cached audio out of pool
        this._cache[key] = audio;
        resolve(audio);
      };
      audio.onerror = () => resolve(null);
      audio.load();
    };
    if (asBlob) {
      return fetch(key)
        .then(r => r.blob())
        .then(b => new Promise((resolve) => {
          const audio = new window.Audio();
          audio.src = URL.createObjectURL(b);
          wire(audio, resolve);
        }))
        .catch(() => null);
    }
    return new Promise((resolve) => {
      const audio = new window.Audio();
      audio.preload = 'auto';
      audio.src = key;
      wire(audio, resolve);
    });
  }

  // call on first user interaction
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

    if (this._ctx && this._ctx.state === 'suspended') {
      return this._ctx.resume().then(() => true).catch(() => false);
    }
    return Promise.resolve(true);
  }

  _getGain(audioEl) {
    if (!this._ctx) return null;
    let entry = this._gainNodes.get(audioEl);
    if (!entry) {
      const source = this._ctx.createMediaElementSource(audioEl);
      const gain = this._ctx.createGain();
      source.connect(gain).connect(this._ctx.destination);
      entry = { gain };
      this._gainNodes.set(audioEl, entry);
    }
    return entry;
  }

  setVolume(audioEl, vol) {
    if (!audioEl) return;
    const gainEntry = this._getGain(audioEl);
    if (gainEntry) gainEntry.gain.gain.value = Math.min(1, vol);
    else audioEl.volume = Math.min(1, vol);
  }

  play(name, { volume, loop = false, rate } = {}) {
    if (this.muted || !this._initialized) return null;

    const files = this._groups[name];
    if (!files || files.length === 0) {
      console.warn(`[Audio] Sound not found: ${name}`);
      return null;
    }

    const file = files[files.length === 1 ? 0 : Math.floor(Math.random() * files.length)];
    const src = this.basePath + file;


    const cached = this._cache[src];
    let audio;
    if (cached && cached.paused) {
      audio = cached;
    } else if (cached) {
      audio = cached.cloneNode();
    } else {
      audio = this._pool.pop() || new window.Audio();
      audio.src = src;
    }

    audio.loop = loop;
    const targetVolume = Math.min(1, (volume ?? 1) * this.volume);

    const gainEntry = loop || this._gainNodes.has(audio) ? this._getGain(audio) : null;
    if (gainEntry) {
      gainEntry.gain.gain.value = targetVolume;
      audio.volume = 1; // gain node controls output now
    } else {
      audio.volume = targetVolume;
    }
    if (rate) {
      audio.preservesPitch = false;
      audio.webkitPreservesPitch = false;
      audio.playbackRate = rate;
    } else if (audio.playbackRate !== 1) {
      audio.playbackRate = 1;
    }
    audio.currentTime = 0;

    this._playing.push(audio);
    audio.onended = () => {
      this._returnToPool(audio);
    };

    audio.play().catch((err) => {
      if (window.DEBUG) console.warn("[Audio] play failed:", name, err && err.name);
      this._returnToPool(audio);
    });
    return audio;
  }

  stop(audio) {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    this._returnToPool(audio);
  }

  fade(audio, targetVolume, duration, onDone) {
    if (!audio) return;
    const gainEntry = this._gainNodes.get(audio);
    const start = gainEntry ? gainEntry.gain.gain.value : audio.volume;
    const diff = targetVolume - start;
    const startTime = performance.now();

    if (this._fades.has(audio)) {
      clearInterval(this._fades.get(audio));
    }

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const v = start + diff * progress;
      if (gainEntry) gainEntry.gain.gain.value = v;
      else audio.volume = v;
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
    if (!audio._omcCached && this._pool.length < 20) {
      this._pool.push(audio);
    }
  }
}


class SpriteAnimator {
  constructor(element) {
    this.el = element; // uses background-image sprite
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
    this.speed = 1.0;
  }

  define(name, { sheet, frames, duration = 200, loop = false, loopCount = Infinity, onFrame } = {}) {
    this.animations[name] = {
      sheet,
      frames,
      duration,
      loop: loop || loopCount === Infinity,
      loopCount: loop ? Infinity : loopCount,
      onFrame: onFrame || null, // callback receives frame index
    };
  }

  play(name, onComplete) {
    const anim = this.animations[name];
    if (!anim) {
      console.warn(`[Sprite] Animation not found: ${name}`);
      return;
    }

    this._stop();

    this.current = name;
    this.frame = 0;
    this.loopCount = 0;
    this._onComplete = onComplete || null;
    this._playing = true;

    if (this.el && anim.sheet) {
      this.el.style.backgroundImage = `url(${anim.sheet})`;
    }
    this._updateFrame();

    this._lastFrameTime = performance.now();
    this._accumulator = 0;
    this._tick();
  }

  queue(name, onComplete) {
    this._queue.push({ name, onComplete });
  }

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

    // assumes horizontal sprite strip layout
    const width = this.el.offsetWidth || this.el.clientWidth;
    this.el.style.backgroundPosition = `-${this.frame * width}px 0`;

    if (anim.onFrame) anim.onFrame(this.frame);
  }
}


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
    if (!this._byType[entity.type]) this._byType[entity.type] = [];
    this._byType[entity.type].push(entity);
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


class Timer {
  constructor() {
    this._timers = [];
  }

  after(ms, fn) {
    const t = { remaining: ms, fn, repeat: false, active: true };
    this._timers.push(t);
    return t;
  }

  every(ms, fn) {
    const t = { remaining: ms, interval: ms, fn, repeat: true, active: true };
    this._timers.push(t);
    return t;
  }

  cancel(t) {
    if (t) t.active = false;
  }

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


const Util = {
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Fisher-Yates; returns new array
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  // decelerating ease-out curve
  ease(a, b, t) {
    t = 1 - Math.pow(1 - t, 3);
    return a + (b - a) * t;
  },

  dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

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


// supports ESM, CommonJS, or script tag
const OMC = { Device, GameLoop, State, Input, Audio: Audio_, SpriteAnimator, Entity, EntityManager, Timer, Util };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OMC;
} else if (typeof window !== 'undefined') {
  window.OMC = OMC;
}
