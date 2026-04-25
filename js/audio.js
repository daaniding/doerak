/* DOERAK Web Audio engine — all sounds generated, no files. */
(function (global) {

  const AudioFX = {
    ctx: null,
    unlocked: false,
    muted: false,

    unlock() {
      if (this.ctx) return;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        this.ctx = new Ctx();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.unlocked = true;
      } catch (e) { /* autoplay restrictions etc */ }
    },

    _osc(freq, type = 'sine', duration = 0.1, gain = 0.18, when = 0) {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + when;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      o.connect(g).connect(this.ctx.destination);
      o.start(t0);
      o.stop(t0 + duration + 0.02);
      return { o, g, t0 };
    },

    tick() { this._osc(880, 'sine', 0.04, 0.07); },

    boom() {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(120, t0);
      o.frequency.exponentialRampToValueAtTime(40, t0 + 0.55);
      g.gain.setValueAtTime(0.5, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);
      o.connect(g).connect(this.ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.62);

      // noise burst layered on top for thump
      this._noise(0.18, 0.45);
    },

    beep() { this._osc(640, 'triangle', 0.04, 0.10); },

    softBeep() { this._osc(420, 'triangle', 0.05, 0.06); },

    _noise(duration = 0.2, gain = 0.2) {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime;
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      src.connect(g).connect(this.ctx.destination);
      src.start(t0);
      src.stop(t0 + duration + 0.02);
    },

    whoosh() { this._noise(0.22, 0.18); },

    slotClick() {
      if (!this.ctx || this.muted) return;
      this._osc(220 + Math.random() * 80, 'sawtooth', 0.025, 0.07);
    },

    win() {
      this._osc(523, 'triangle', 0.10, 0.14, 0);
      this._osc(659, 'triangle', 0.10, 0.14, 0.10);
      this._osc(784, 'triangle', 0.18, 0.14, 0.20);
    },

    lose() {
      this._osc(440, 'sawtooth', 0.12, 0.12, 0);
      this._osc(370, 'sawtooth', 0.18, 0.12, 0.10);
    },

    reveal() {
      this._osc(196, 'square', 0.04, 0.16, 0);
      this._osc(294, 'square', 0.04, 0.16, 0.06);
      this._osc(392, 'square', 0.10, 0.18, 0.12);
    },

    setMuted(m) { this.muted = m; }
  };

  global.AudioFX = AudioFX;

  // Unlock on first user gesture
  const unlockOnce = () => {
    AudioFX.unlock();
    document.removeEventListener('pointerdown', unlockOnce);
    document.removeEventListener('touchstart', unlockOnce);
  };
  document.addEventListener('pointerdown', unlockOnce, { once: true });
  document.addEventListener('touchstart', unlockOnce, { once: true });
})(window);
