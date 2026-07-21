/* Audio setup, the Music player, and the mute / music-volume controls. */
  // ── AUDIO SETUP ─────────────────────────────────────────────────
  audio = new Audio_({
    basePath: "sounds/",
    poolSize: 8,
    volume: 0.7,
  });
  // Mobile gets 64k mono AAC (~1/3 the bytes) — cellular can't fetch the full mp3s in time.
  const _mus = Device.isMobile ? "_lo.m4a" : ".mp3";
  audio.register({
    click: "click.mp3",
    music: "music" + _mus,
    music_act1: "music_act1" + _mus,
    music_act3: "music_act3" + _mus,
    music_act4: "music_act4" + _mus,
    music_act5: "music_act5" + _mus,
    music_act6: "music_act6" + _mus,
    music_act8: "music_act8" + _mus,

    music_act9: "music_act9" + _mus,
    music_act10: "music_act10" + _mus,

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
    grab: "grab.mp3", // Act 6 food grab
    bust: "bust.mp3", // game over
    prompt: "click.mp3", // subtle chime when tap-prompts appear; swap file later
    hint: "click.mp3", // softer chime when control-hints appear; swap file later
  });

  const Music = {
    current: null,
    volume: 0.3,
    fadeOutMs: 1200, // old track fades out over this long UNDERNEATH the new one

    play(name) {
      const el = (this.current = audio.play(name, {
        loop: true,
        volume: this.volume,
      }));
      // iOS can reject mid-game plays (stale gesture) — retry on next tap
      if (el) {
        const src = el.src;
        setTimeout(() => {
          if (this.current === el && el.paused) {
            const retry = () => {
              if (this.current === el && el.paused && el.src === src) {
                el.loop = true;
                el.play().catch(() => {});
              }
            };
            document.addEventListener("pointerup", retry, { once: true });
          }
        }, 600);
      }
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

  // ── MUSIC VOL ────────────────────────────────────────────────
  const musicVol = document.getElementById("music-vol");

  const MUSIC_STEPS = [
    { label: ctrl("musicOff") || "music off", vol: 0.0 },
    { label: ctrl("musicLow") || "music low", vol: 0.2 },
    { label: ctrl("musicMed") || "music med", vol: 0.55 },
    { label: ctrl("musicHigh") || "music high", vol: 1 },
  ];
  let _musicStep = 1;
  function _applyMusicStep() {
    Music.volume = MUSIC_STEPS[_musicStep].vol;
    if (Music.current) {
      audio.setVolume(Music.current, Music.volume * audio.volume);
    }
    musicVol.innerHTML = MUSIC_STEPS[_musicStep].label
      .split(" ")
      .map((w) => "<span>" + w + "</span>")
      .join(" ");
  }
  musicVol.addEventListener("click", () => {
    _musicStep = (_musicStep + 1) % MUSIC_STEPS.length;
    _applyMusicStep();
  });
  _applyMusicStep();

  const muteBtn = document.getElementById("mute-btn");
  muteBtn.textContent = window.LANG.muteMute; // starts unmuted (Audio_ constructor default)
  muteBtn.addEventListener("click", () => {
    const muted = audio.toggleMute();
    // muteMute is already short ("mute"/"muet") — no separate mobile variant needed.
    muteBtn.textContent = muted ? window.LANG.muteMuted : window.LANG.muteMute;
    muteBtn.style.color = muted ? "#444" : C_DIM;
    if (!muted && Music.current) {
      audio.setVolume(Music.current, Music.volume * audio.volume);
      Music.current.play().catch(() => {});
    }
  });

  const _bufCache = {};
  function playPitched(name, cents = 8, vol = 1) {
    const ctx = audio._ctx;
    if (audio.muted) return;
    if (!ctx) return audio.play(name, { volume: vol });
    const files = audio._groups && audio._groups[name];
    const file = files && files[0];
    if (!file) return audio.play(name, { volume: vol });
    const go = (buf) => {
      if (!buf) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.detune.value = (Math.random() * 2 - 1) * cents;
      const g = ctx.createGain();
      g.gain.value = vol * audio.volume;
      src.connect(g);
      g.connect(ctx.destination);
      src.start(ctx.currentTime + 0.01);
    };
    if (_bufCache[file]) return go(_bufCache[file]);
    fetch("sounds/" + file)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((buf) => {
        _bufCache[file] = buf;
        go(buf);
      })
      .catch(() => audio.play(name, { volume: vol }));
  }

  let _clickBuf = null;
  function scheduleClicks(n, intervalMs) {
    const ctx = audio._ctx;
    const fallback = () => {
      for (let i = 0; i < n; i++) setTimeout(() => audio.play("click"), i * intervalMs);
    };
    if (!ctx) return fallback();
    const go = () => {
      const g = ctx.createGain();
      g.gain.value = audio.volume;
      g.connect(ctx.destination);
      const t0 = ctx.currentTime + 0.05;
      for (let i = 0; i < n; i++) {
        const src = ctx.createBufferSource();
        src.buffer = _clickBuf;
        src.connect(g);
        src.start(t0 + (i * intervalMs) / 1000);
      }
    };
    if (_clickBuf) return go();
    fetch("sounds/click.mp3")
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((buf) => {
        _clickBuf = buf;
        go();
      })
      .catch(fallback);
  }
