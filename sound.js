/* Audio setup, Music player, mute controls. */
  audio = new Audio_({
    basePath: "sounds/",
    poolSize: 8,
    volume: 0.7,
  });
  // mobile uses smaller AAC for cellular
  const _mus = Device.isMobile ? "_lo.m4a" : ".mp3";
  audio.register({
    click: "click.mp3",
    music_act1: "music_act1" + _mus,
    music_act3: "music_act3" + _mus,
    music_act4: "music_act4" + _mus,
    music_act5: "music_act5" + _mus,
    music_act6: "music_act6" + _mus,
    music_act7: "music_act7" + _mus,
    music_act8: "music_act8" + _mus,
    music_act9: "music_act9" + _mus,

    bump: "bump.mp3",
    level: "level.mp3",
    moveStart: "moveStart.mp3",
    drop: "drop.mp3",
    dropBonus: "dropBonus.mp3",
    paper: "paper.mp3",
    urgent: "urgent.mp3",
    idleWarning: "idleWarning.mp3",
    exit: "exit.mp3",
    exitAvailable: "exitAvailable.mp3",
    playertxtbox: "playertxtbox.mp3",
    npctxtbox: "npctxtbox.mp3",
    trumpet: "trumpet.mp3",
    recruit: "recruit.mp3",
    security: "securityAlert.mp3",
    narc: "narc.mp3",
    grab: "grab.mp3",
    death: "death.wav",

    // see sound-list.csv for trigger docs
    coin: "coin.mp3",
    hitFridge: "hitFridge.mp3",
    playerArrive: "playerArrive.mp3",
    crewAtFridge: "crewAtFridge.mp3",
    neighbourThanks: "neighbourThanks.mp3",
    cutItOut: "cutItOut.mp3",
    goodCall: "goodCall.mp3",
    giveItAShot: "giveItAShot.mp3",
    tryHarder: "tryHarder.mp3",
    catDeclined: "catDeclined.mp3",
    textrise: "textrise.mp3",
    titleFall: "titleFall.mp3",
    storeArrive: "storeArrive.mp3",
    sweepOff: "sweepOff.mp3",
    sweepIn: "sweepIn.mp3",
    textPeel: "textPeel.mp3",
    collapseToCenter: "collapseToCenter.mp3",
    riseFromPile: "riseFromPile.mp3",
    crewSettle: "crewSettle.mp3",
    walk: "walk.mp3",
    declineHard: "declineHard.mp3",
    sigh: "sigh.mp3",
    rowSwitch: "rowSwitch.mp3",
    copsCircling: "copsCircling.mp3",
    propPylon: "propPylon.mp3",
    propBagel: "propBagel.mp3",
    propServiceberry: "propServiceberry.mp3",
    propMulberry: "propMulberry.mp3",
    propNasturtium: "propNasturtium.mp3",
    catMeow: "catMeow.mp3",
    wrongChoice: "wrongChoice.mp3",
    storeAnnounce: "storeAnnounce.mp3",
    ambianceStore1: "ambianceStore1.mp3",
    ambianceStore2: "ambianceStore2.mp3",
    ambianceStore3: "ambianceStore3.mp3",
    guardCollide: "guardCollide.mp3",
    grab2: "grab2.mp3",
    grab3: "grab3.mp3",
    shopperBump1: "shopperBump1.mp3",
    shopperBump2: "shopperBump2.mp3",
    shopperBump3: "shopperBump3.mp3",
    robinExit: "robinExit.mp3",
    copsChase: "copsChase.mp3",
    copsSiren: "copsSiren.mp3",
    copsHit: "copsHit.mp3",
    lostThem: "lostThem.mp3",
    sparkleStart: "sparkleStart.mp3",
    foodLand1: "foodLand1.mp3",
    foodLand2: "foodLand2.mp3",
    foodLand3: "foodLand3.mp3",
    uiButton: "uiButton.mp3",
  });

  function playBank(keys) {
    audio.play(Util.pick(keys));
  }

  const Footsteps = {
    el: null,
    start() {
      if (this.el) return;
      this.el = audio.play("walk", { loop: true, volume: 0.35 });
    },
    stop() {
      if (!this.el) return;
      audio.stop(this.el);
      this.el = null;
    },
    pause() {
      if (this.el) this.el.pause();
    },
    resume() {
      if (this.el && this.el.paused) this.el.play().catch(() => {});
    },
    setRate(rate) {
      if (!this.el) return;
      const r = Util.clamp(rate, 0.7, 1.8);
      // skips tiny changes to avoid resampling
      if (this._lastRate !== undefined && Math.abs(r - this._lastRate) < 0.02) return;
      this._lastRate = r;
      this.el.playbackRate = r;
    },
  };

  const Ambience = {
    el: null,
    start(name) {
      if (this.el) return;
      this.el = audio.play(name, { loop: true, volume: 0.25 });
    },
    stop() {
      if (!this.el) return;
      audio.stop(this.el);
      this.el = null;
    },
    pause() {
      if (this.el) this.el.pause();
    },
    resume() {
      if (this.el && this.el.paused) this.el.play().catch(() => {});
    },
  };

  // temporary: some act tracks lack rights
  const MUSIC_STRETCH = true;

  const Music = {
    current: null,
    currentName: null,
    volume: 0.3,
    fadeOutMs: 1200, // fades out under the new track

    // temporary swap; remove once rights clear
    _stretchMap: MUSIC_STRETCH ? { music_act8: "music_act7", music_act9: "music_act7" } : {},

    play(name) {
      this.currentName = name;
      const el = (this.current = audio.play(name, {
        loop: true,
        volume: this.volume,
      }));
      // iOS may reject; retries on next tap
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
      // fades out old track, fire-and-forget
      const old = this.current;
      this.current = null;
      if (old) {
        audio.fade(old, 0, this.fadeOutMs, () => audio.stop(old));
      }
      this.play(name);
    },

    // resolves via stretchMap; skips if already playing
    transitionStretched(name) {
      const resolved = this._stretchMap[name] || name;
      if (this.currentName === resolved) return;
      this.transition(resolved);
    },

    stop() {
      if (!this.current) return;
      audio.stop(this.current);
      this.current = null;
      this.currentName = null;
    },

    pause() {
      if (this.current) this.current.pause();
    },
    resume() {
      if (this.current && this.current.paused) this.current.play().catch(() => {});
    },
  };

  const musicVol = document.getElementById("music-vol");

  const MUSIC_STEPS = [
    { label: ctrl("musicOff") || "music off", vol: 0.0 },
    { label: ctrl("musicLow") || "music low", vol: 0.2 },
    { label: ctrl("musicMed") || "music med", vol: 0.55 },
    { label: ctrl("musicHigh") || "music high", vol: 1 },
  ];
  let _musicStep = parseInt(localStorage.getItem("musicStep"), 10);
  if (isNaN(_musicStep) || _musicStep < 0 || _musicStep >= MUSIC_STEPS.length) _musicStep = 1;
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
    audio.play("click");
    _musicStep = (_musicStep + 1) % MUSIC_STEPS.length;
    localStorage.setItem("musicStep", _musicStep);
    _applyMusicStep();
  });
  _applyMusicStep();

  const muteBtn = document.getElementById("mute-btn");
  audio.muted = localStorage.getItem("muted") === "true";
  muteBtn.textContent = audio.muted ? window.LANG.muteMuted : window.LANG.muteMute;
  muteBtn.style.color = audio.muted ? "#444" : C_DIM;
  muteBtn.addEventListener("click", () => {
    const muted = audio.toggleMute();
    audio.play("click");
    localStorage.setItem("muted", muted);
    // already short; no mobile variant needed
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
