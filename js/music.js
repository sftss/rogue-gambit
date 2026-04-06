// music.js - Web Audio API procedural 8-bit music system
// No ES modules - all variables global

// ---------------------------------------------------------------------------
// Note frequency table (equal temperament, A4 = 440 Hz)
// ---------------------------------------------------------------------------
const NOTE = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, E3: 164.81, F3: 174.61,
  Fs3: 185.00, G3: 196.00, Gs3: 207.65, A3: 220.00, As3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23,
  Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, As4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46,
  Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00, As5: 932.33, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760.00,
  R: 0  // rest
};

// ---------------------------------------------------------------------------
// Track definitions  [frequency, durationSeconds, waveType, volume?]
// waveType: 'square' | 'sawtooth' | 'triangle' | 'sine'
// ---------------------------------------------------------------------------

// ---- TITLE: Haunting dungeon menu, Am arpeggio progression ----
// Progression: Am - F - C - E  (i - VI - III - VII in A minor)
// Slow arpeggios, triangle wave for a soft mysterious feel
const TRACK_TITLE = (function() {
  const t = 0.18; // base note duration
  // Am arpeggio: A3 C4 E4 A4  |  F arpeggio: F3 A3 C4 F4
  // C arpeggio:  C3 E3 G3 C4  |  E arpeggio: E3 Gs3 B3 E4
  const am  = [[NOTE.A3,t,'triangle'],[NOTE.C4,t,'triangle'],[NOTE.E4,t,'triangle'],[NOTE.A4,t*1.5,'triangle']];
  const fmaj= [[NOTE.F3,t,'triangle'],[NOTE.A3,t,'triangle'],[NOTE.C4,t,'triangle'],[NOTE.F4,t*1.5,'triangle']];
  const cmaj= [[NOTE.C3,t,'triangle'],[NOTE.E3,t,'triangle'],[NOTE.G3,t,'triangle'],[NOTE.C4,t*1.5,'triangle']];
  const emaj= [[NOTE.E3,t,'triangle'],[NOTE.Gs3,t,'triangle'],[NOTE.B3,t,'triangle'],[NOTE.E4,t*1.5,'triangle']];
  // Second pass - higher register melody over the chords
  const am2 = [[NOTE.E5,t*2,'sine'],[NOTE.D5,t,'sine'],[NOTE.C5,t,'sine'],[NOTE.B4,t*2,'sine']];
  const f2  = [[NOTE.C5,t*2,'sine'],[NOTE.A4,t,'sine'],[NOTE.G4,t,'sine'],[NOTE.F4,t*2,'sine']];
  const c2  = [[NOTE.G4,t*2,'sine'],[NOTE.E4,t,'sine'],[NOTE.F4,t,'sine'],[NOTE.G4,t*2,'sine']];
  const e2  = [[NOTE.Gs4,t*2,'sine'],[NOTE.B4,t,'sine'],[NOTE.E5,t,'sine'],[NOTE.E5,t*2,'sine']];
  // Interleave arpeggio + melody
  return [...am,...am2,...fmaj,...f2,...cmaj,...c2,...emaj,...e2,
          ...am,...am2,...fmaj,...f2,...cmaj,...c2,...emaj,...e2];
})();

// ---- DRAFT: Thoughtful, tense preparation, Dm feel ----
// Medium tempo, square wave lead, walking bass
const TRACK_DRAFT = (function() {
  const q = 0.22; // quarter note
  const h = q * 2;
  const e = q / 2;
  // Dm - Am - Bb - C  (i - v - VI - VII in D minor)
  // Melody
  const mel = [
    [NOTE.D5,q,'square'],[NOTE.C5,e,'square'],[NOTE.D5,e,'square'],
    [NOTE.A4,h,'square'],
    [NOTE.Bb4 !== undefined ? NOTE.As4 : NOTE.As4, q, 'square'],[NOTE.A4,q,'square'],
    [NOTE.C5,h,'square'],
    [NOTE.D5,q,'square'],[NOTE.E5,e,'square'],[NOTE.F5,e,'square'],
    [NOTE.E5,q,'square'],[NOTE.D5,q,'square'],
    [NOTE.C5,q,'square'],[NOTE.As4,e,'square'],[NOTE.A4,e,'square'],
    [NOTE.D5,h,'square'],[NOTE.R,h,'square'],
  ];
  // Bass line (lower octave)
  const bass = [
    [NOTE.D3,q,'sawtooth'],[NOTE.R,q,'sawtooth'],[NOTE.D3,e,'sawtooth'],[NOTE.F3,e,'sawtooth'],
    [NOTE.A3,q,'sawtooth'],[NOTE.R,q,'sawtooth'],[NOTE.A3,e,'sawtooth'],[NOTE.C4,e,'sawtooth'],
    [NOTE.As3,q,'sawtooth'],[NOTE.R,q,'sawtooth'],[NOTE.As3,e,'sawtooth'],[NOTE.D4,e,'sawtooth'],
    [NOTE.C3,q,'sawtooth'],[NOTE.R,q,'sawtooth'],[NOTE.C3,q,'sawtooth'],[NOTE.R,q,'sawtooth'],
    [NOTE.D3,q,'sawtooth'],[NOTE.R,q,'sawtooth'],[NOTE.D3,e,'sawtooth'],[NOTE.F3,e,'sawtooth'],
    [NOTE.A3,q,'sawtooth'],[NOTE.R,q,'sawtooth'],[NOTE.A3,e,'sawtooth'],[NOTE.C4,e,'sawtooth'],
    [NOTE.As3,q,'sawtooth'],[NOTE.R,q,'sawtooth'],[NOTE.As3,e,'sawtooth'],[NOTE.G3,e,'sawtooth'],
    [NOTE.D3,h,'sawtooth'],[NOTE.R,h,'sawtooth'],
  ];
  return { layers: [mel, bass] };
})();

// ---- BATTLE: Energetic chess/tactical, driving rhythm ----
// Em, fast tempo, sawtooth lead + bass + rhythmic pulse
const TRACK_BATTLE = (function() {
  const q = 0.14; // quarter note (~107 bpm feel with 8th subdivision)
  const h = q * 2;
  const e = q / 2;

  // 8-bar melody in E minor (two 4-bar phrases)
  // Phrase A: ascending tension
  const phraseA_mel = [
    [NOTE.E4, e,'square'],[NOTE.Fs4,e,'square'],[NOTE.G4,q,'square'],[NOTE.A4,e,'square'],[NOTE.G4,e,'square'],
    [NOTE.Fs4,q,'square'],[NOTE.E4,e,'square'],[NOTE.D4,e,'square'],
    [NOTE.E4, e,'square'],[NOTE.G4,q,'square'],[NOTE.A4,e,'square'],[NOTE.B4,q,'square'],
    [NOTE.B4, q,'square'],[NOTE.A4,h,'square'],
    // bar 3-4
    [NOTE.G4, e,'square'],[NOTE.A4,e,'square'],[NOTE.B4,q,'square'],[NOTE.A4,e,'square'],[NOTE.G4,e,'square'],
    [NOTE.Fs4,q,'square'],[NOTE.G4,e,'square'],[NOTE.E4,e,'square'],
    [NOTE.D4, e,'square'],[NOTE.E4,e,'square'],[NOTE.Fs4,q,'square'],[NOTE.G4,e,'square'],[NOTE.A4,e,'square'],
    [NOTE.E4, h,'square'],[NOTE.R,h,'square'],
  ];
  // Phrase B: descending answer
  const phraseB_mel = [
    [NOTE.B4, q,'square'],[NOTE.A4,e,'square'],[NOTE.G4,e,'square'],[NOTE.Fs4,q,'square'],[NOTE.E4,q,'square'],
    [NOTE.D4, e,'square'],[NOTE.E4,e,'square'],[NOTE.Fs4,q,'square'],[NOTE.G4,q,'square'],
    [NOTE.A4, e,'square'],[NOTE.B4,e,'square'],[NOTE.A4,q,'square'],[NOTE.G4,e,'square'],[NOTE.Fs4,e,'square'],
    [NOTE.E4, h,'square'],[NOTE.D4,h,'square'],
    // bar 7-8 - climax
    [NOTE.E5, e,'square'],[NOTE.D5,e,'square'],[NOTE.B4,q,'square'],[NOTE.G4,e,'square'],[NOTE.A4,e,'square'],
    [NOTE.B4, q,'square'],[NOTE.A4,e,'square'],[NOTE.G4,e,'square'],[NOTE.Fs4,q,'square'],
    [NOTE.E4, e,'square'],[NOTE.Fs4,e,'square'],[NOTE.G4,e,'square'],[NOTE.A4,e,'square'],
    [NOTE.B4, e,'square'],[NOTE.A4,e,'square'],
    [NOTE.E4, h,'square'],[NOTE.R,h,'square'],
  ];
  // Bass: Em - D - C - B7 pattern, driving eighths
  const bass_A = [
    [NOTE.E2,e,'sawtooth'],[NOTE.E3,e,'sawtooth'],[NOTE.E2,e,'sawtooth'],[NOTE.E3,e,'sawtooth'],
    [NOTE.E2,e,'sawtooth'],[NOTE.E3,e,'sawtooth'],[NOTE.G2,e,'sawtooth'],[NOTE.B2,e,'sawtooth'],
    [NOTE.D3,e,'sawtooth'],[NOTE.D2,e,'sawtooth'],[NOTE.D3,e,'sawtooth'],[NOTE.D2,e,'sawtooth'],
    [NOTE.D3,e,'sawtooth'],[NOTE.D2,e,'sawtooth'],[NOTE.F2,e,'sawtooth'],[NOTE.A2,e,'sawtooth'],
    [NOTE.C3,e,'sawtooth'],[NOTE.C2,e,'sawtooth'],[NOTE.C3,e,'sawtooth'],[NOTE.C2,e,'sawtooth'],
    [NOTE.C3,e,'sawtooth'],[NOTE.E2,e,'sawtooth'],[NOTE.G2,e,'sawtooth'],[NOTE.C3,e,'sawtooth'],
    [NOTE.B2,e,'sawtooth'],[NOTE.B2,e,'sawtooth'],[NOTE.Ds3,e,'sawtooth'],[NOTE.Fs3,e,'sawtooth'],
    [NOTE.B2,e,'sawtooth'],[NOTE.Fs3,e,'sawtooth'],[NOTE.Ds3,e,'sawtooth'],[NOTE.B2,e,'sawtooth'],
  ];
  const bass_B = [
    [NOTE.E2,e,'sawtooth'],[NOTE.E3,e,'sawtooth'],[NOTE.E2,e,'sawtooth'],[NOTE.E3,e,'sawtooth'],
    [NOTE.G2,e,'sawtooth'],[NOTE.E3,e,'sawtooth'],[NOTE.G2,e,'sawtooth'],[NOTE.E3,e,'sawtooth'],
    [NOTE.D2,e,'sawtooth'],[NOTE.D3,e,'sawtooth'],[NOTE.D2,e,'sawtooth'],[NOTE.D3,e,'sawtooth'],
    [NOTE.A2,e,'sawtooth'],[NOTE.D3,e,'sawtooth'],[NOTE.A2,e,'sawtooth'],[NOTE.D3,e,'sawtooth'],
    [NOTE.C2,e,'sawtooth'],[NOTE.C3,e,'sawtooth'],[NOTE.C2,e,'sawtooth'],[NOTE.C3,e,'sawtooth'],
    [NOTE.G2,e,'sawtooth'],[NOTE.C3,e,'sawtooth'],[NOTE.G2,e,'sawtooth'],[NOTE.C3,e,'sawtooth'],
    [NOTE.B2,e,'sawtooth'],[NOTE.B2,e,'sawtooth'],[NOTE.B2,e,'sawtooth'],[NOTE.Fs3,e,'sawtooth'],
    [NOTE.E2,e,'sawtooth'],[NOTE.E3,e,'sawtooth'],[NOTE.E2,q,'sawtooth'],[NOTE.E2,q,'sawtooth'],
  ];
  // Rhythmic pulse / counter-melody (triangle, mid register)
  const pulse_A = [
    [NOTE.E4,e,'triangle',0.3],[NOTE.R,e,'triangle'],[NOTE.G4,e,'triangle',0.3],[NOTE.R,e,'triangle'],
    [NOTE.A4,e,'triangle',0.3],[NOTE.R,e,'triangle'],[NOTE.G4,e,'triangle',0.3],[NOTE.R,e,'triangle'],
    [NOTE.D4,e,'triangle',0.3],[NOTE.R,e,'triangle'],[NOTE.Fs4,e,'triangle',0.3],[NOTE.R,e,'triangle'],
    [NOTE.A4,e,'triangle',0.3],[NOTE.R,e,'triangle'],[NOTE.Fs4,e,'triangle',0.3],[NOTE.R,e,'triangle'],
    [NOTE.C4,e,'triangle',0.3],[NOTE.R,e,'triangle'],[NOTE.E4,e,'triangle',0.3],[NOTE.R,e,'triangle'],
    [NOTE.G4,e,'triangle',0.3],[NOTE.R,e,'triangle'],[NOTE.E4,e,'triangle',0.3],[NOTE.R,e,'triangle'],
    [NOTE.B3,e,'triangle',0.3],[NOTE.R,e,'triangle'],[NOTE.Ds4,e,'triangle',0.3],[NOTE.R,e,'triangle'],
    [NOTE.Fs4,e,'triangle',0.3],[NOTE.R,e,'triangle'],[NOTE.B3,e,'triangle',0.3],[NOTE.R,e,'triangle'],
  ];
  const mel  = [...phraseA_mel, ...phraseB_mel];
  const bass = [...bass_A, ...bass_B];
  const pulse= [...pulse_A, ...pulse_A];
  return { layers: [mel, bass, pulse] };
})();

// ---- SHOP: Upbeat, major key, coin-jingle vibe (C major) ----
const TRACK_SHOP = (function() {
  const q = 0.20;
  const e = q / 2;
  const h = q * 2;
  // C - G - Am - F  in C major
  const mel = [
    [NOTE.E5,e,'square'],[NOTE.G5,e,'square'],[NOTE.C5,q,'square'],[NOTE.E5,e,'square'],[NOTE.D5,e,'square'],
    [NOTE.G4,q,'square'],[NOTE.B4,e,'square'],[NOTE.D5,e,'square'],
    [NOTE.C5,e,'square'],[NOTE.E5,e,'square'],[NOTE.A5,q,'square'],[NOTE.G5,e,'square'],[NOTE.F5,e,'square'],
    [NOTE.F5,q,'square'],[NOTE.E5,q,'square'],
    [NOTE.E5,e,'square'],[NOTE.G5,e,'square'],[NOTE.C5,q,'square'],[NOTE.E5,e,'square'],[NOTE.D5,e,'square'],
    [NOTE.D5,q,'square'],[NOTE.G4,e,'square'],[NOTE.A4,e,'square'],
    [NOTE.B4,e,'square'],[NOTE.C5,e,'square'],[NOTE.D5,q,'square'],[NOTE.E5,e,'square'],[NOTE.C5,e,'square'],
    [NOTE.C5,h,'square'],[NOTE.R,h,'square'],
  ];
  const bass = [
    [NOTE.C3,q,'triangle'],[NOTE.E3,e,'triangle'],[NOTE.G3,e,'triangle'],[NOTE.R,q,'triangle'],
    [NOTE.G2,q,'triangle'],[NOTE.B2,e,'triangle'],[NOTE.D3,e,'triangle'],[NOTE.R,q,'triangle'],
    [NOTE.A2,q,'triangle'],[NOTE.C3,e,'triangle'],[NOTE.E3,e,'triangle'],[NOTE.R,q,'triangle'],
    [NOTE.F2,q,'triangle'],[NOTE.A2,e,'triangle'],[NOTE.C3,e,'triangle'],[NOTE.R,q,'triangle'],
    [NOTE.C3,q,'triangle'],[NOTE.E3,e,'triangle'],[NOTE.G3,e,'triangle'],[NOTE.R,q,'triangle'],
    [NOTE.G2,q,'triangle'],[NOTE.B2,e,'triangle'],[NOTE.D3,e,'triangle'],[NOTE.R,q,'triangle'],
    [NOTE.F2,e,'triangle'],[NOTE.A2,e,'triangle'],[NOTE.G2,e,'triangle'],[NOTE.B2,e,'triangle'],
    [NOTE.C3,h,'triangle'],[NOTE.R,h,'triangle'],
  ];
  return { layers: [mel, bass] };
})();

// ---- CODEX: Calm, scholarly, medieval (G Dorian) ----
const TRACK_CODEX = (function() {
  const h  = 0.35;
  const q  = h / 2;
  const dq = q * 1.5;
  // G Dorian: G A Bb C D E F G
  const mel = [
    [NOTE.G4,h,'sine'],[NOTE.A4,q,'sine'],[NOTE.As4,q,'sine'],
    [NOTE.C5,dq,'sine'],[NOTE.D5,q*0.5,'sine'],
    [NOTE.D5,h,'sine'],[NOTE.C5,q,'sine'],[NOTE.As4,q,'sine'],
    [NOTE.A4,h*2,'sine'],
    [NOTE.G4,q,'sine'],[NOTE.A4,q,'sine'],[NOTE.C5,q,'sine'],[NOTE.D5,q,'sine'],
    [NOTE.E5,h,'sine'],[NOTE.D5,q,'sine'],[NOTE.C5,q,'sine'],
    [NOTE.As4,h,'sine'],[NOTE.A4,q,'sine'],[NOTE.G4,q,'sine'],
    [NOTE.G4,h*2,'sine'],
    [NOTE.D4,h,'sine'],[NOTE.E4,q,'sine'],[NOTE.Fs4,q,'sine'],
    [NOTE.G4,dq,'sine'],[NOTE.A4,q*0.5,'sine'],
    [NOTE.As4,h,'sine'],[NOTE.G4,q,'sine'],[NOTE.A4,q,'sine'],
    [NOTE.G4,h*2,'sine'],
  ];
  const bass = [
    [NOTE.G3,h,'triangle',0.5],[NOTE.D3,h,'triangle',0.5],
    [NOTE.C3,h,'triangle',0.5],[NOTE.D3,h,'triangle',0.5],
    [NOTE.G3,h,'triangle',0.5],[NOTE.D3,h,'triangle',0.5],
    [NOTE.As3,h,'triangle',0.5],[NOTE.A3,h,'triangle',0.5],
    [NOTE.G3,h,'triangle',0.5],[NOTE.G3,h,'triangle',0.5],
    [NOTE.C3,h,'triangle',0.5],[NOTE.D3,h,'triangle',0.5],
    [NOTE.As3,h,'triangle',0.5],[NOTE.C3,h,'triangle',0.5],
    [NOTE.G3,h*2,'triangle',0.5],
    [NOTE.D3,h,'triangle',0.5],[NOTE.E3,h,'triangle',0.5],
    [NOTE.G3,h,'triangle',0.5],[NOTE.D3,h,'triangle',0.5],
    [NOTE.C3,h,'triangle',0.5],[NOTE.D3,h,'triangle',0.5],
    [NOTE.G3,h*2,'triangle',0.5],
  ];
  return { layers: [mel, bass] };
})();

// ---- VICTORY: Short triumphant fanfare, does NOT loop ----
const TRACK_VICTORY = (function() {
  const q = 0.18;
  const e = q / 2;
  return [
    [NOTE.C4,e,'square'],[NOTE.E4,e,'square'],[NOTE.G4,e,'square'],
    [NOTE.C5,q,'square'],[NOTE.C5,e,'square'],[NOTE.D5,e,'square'],
    [NOTE.E5,q,'square'],[NOTE.E5,e,'square'],[NOTE.F5,e,'square'],
    [NOTE.G5,q*1.5,'square'],[NOTE.E5,e,'square'],
    [NOTE.G5,q,'square'],[NOTE.A5,q,'square'],
    [NOTE.G5,q,'square'],[NOTE.E5,q,'square'],
    [NOTE.C5,e,'square'],[NOTE.D5,e,'square'],[NOTE.E5,e,'square'],[NOTE.F5,e,'square'],
    [NOTE.G5,q*3,'square'],
  ];
})();

// ---- DEFEAT: Short sad descending sting, does NOT loop ----
const TRACK_DEFEAT = (function() {
  const q = 0.22;
  const e = q / 2;
  return [
    [NOTE.A4,q,'triangle'],[NOTE.G4,q,'triangle'],
    [NOTE.F4,q,'triangle'],[NOTE.E4,q,'triangle'],
    [NOTE.D4,q,'triangle'],[NOTE.C4,q,'triangle'],
    [NOTE.B3,e,'triangle'],[NOTE.G3,e,'triangle'],
    [NOTE.E3,q*3,'triangle'],
  ];
})();

// ---------------------------------------------------------------------------
// Music engine
// ---------------------------------------------------------------------------

const Music = {
  ctx: null,
  masterGain: null,
  sfxGain: null,
  currentTrack: null,
  currentLoop: null,
  currentMusicBus: null,
  isMuted: false,
  isSFXMuted: false,
  volume: 0.4,

  // ---- Initialization ----
  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  },

  // ---- Volume / Mute ----
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime, 0.05
      );
    }
  },

  toggle() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime, 0.05
      );
    }
  },

  toggleSFX() {
    this.isSFXMuted = !this.isSFXMuted;
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(
        this.isSFXMuted ? 0 : 0.6,
        this.ctx.currentTime, 0.05
      );
    }
  },

  // ---- Internal: play a single oscillator note ----
  // Returns the exact end time so callers can chain notes
  _scheduleNote(freq, startTime, duration, waveType, noteVolume, destination) {
    if (!this.ctx) return startTime + duration;
    // silence / rest
    if (!freq || freq === 0) return startTime + duration;

    const gain = this.ctx.createGain();
    gain.connect(destination);

    const osc = this.ctx.createOscillator();
    osc.type = waveType || 'square';
    osc.frequency.value = freq;
    osc.connect(gain);

    const vol = (noteVolume !== undefined ? noteVolume : 1.0) * 0.5;
    const attack  = Math.min(0.01, duration * 0.05);
    const release = Math.min(0.06, duration * 0.3);
    const sustain = Math.max(0, duration - attack - release);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + attack);
    gain.gain.setValueAtTime(vol, startTime + attack + sustain);
    gain.gain.linearRampToValueAtTime(0, startTime + attack + sustain + release);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);

    return startTime + duration;
  },

  // ---- Internal: schedule a flat note array (single layer) ----
  // Returns total duration in seconds
  _scheduleLayer(notes, startTime, destination) {
    let t = startTime;
    for (let i = 0; i < notes.length; i++) {
      const [freq, dur, wave, vol] = notes[i];
      this._scheduleNote(freq, t, dur, wave, vol, destination);
      t += dur;
    }
    return t - startTime;
  },

  // ---- Internal: schedule a track object (single array OR {layers:[...]}) ----
  _scheduleTrack(trackData, startTime, destination) {
    if (Array.isArray(trackData)) {
      return this._scheduleLayer(trackData, startTime, destination);
    }
    // multi-layer - schedule each layer in parallel; duration = longest layer
    let maxDur = 0;
    for (const layer of trackData.layers) {
      const dur = this._scheduleLayer(layer, startTime, destination);
      if (dur > maxDur) maxDur = dur;
    }
    return maxDur;
  },

  // ---- Internal: looping scheduler ----
  // Uses overlapping look-ahead scheduling to keep audio gap-free
  _startLoop(trackData, loop) {
    if (!this.ctx) return;
    const LOOKAHEAD = 0.15; // seconds ahead to schedule
    const INTERVAL  = 80;   // ms between scheduler ticks

    const musicBus = this.ctx.createGain();
    musicBus.gain.value = 1;
    musicBus.connect(this.masterGain);

    const loopState = {
      active: true,
      nextTime: this.ctx.currentTime + 0.05,
      shouldLoop: loop,
      bus: musicBus,
      tickTimer: null,
      endTimer: null,
    };
    this.currentLoop = loopState;
    this.currentMusicBus = musicBus;

    const tick = () => {
      if (!loopState.active) return;
      // Schedule up to LOOKAHEAD seconds ahead
      while (loopState.nextTime < this.ctx.currentTime + LOOKAHEAD + 0.5) {
        if (!loopState.active) break;
        const dur = this._scheduleTrack(trackData, loopState.nextTime, loopState.bus);
        if (!loopState.shouldLoop) {
          // non-looping: schedule stop after completion
          const endTime = loopState.nextTime + dur;
          const delay = (endTime - this.ctx.currentTime) * 1000 + 100;
          loopState.endTimer = setTimeout(() => { loopState.active = false; }, delay);
          return;
        }
        loopState.nextTime += dur;
      }
      if (loopState.active) {
        loopState.tickTimer = setTimeout(tick, INTERVAL);
      }
    };
    tick();
  },

  // ---- play / stop ----
  play(trackName) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Prevent duplicate scheduling when requesting the same active track.
    if (this.currentTrack === trackName && this.currentLoop && this.currentLoop.active) {
      return;
    }

    this.stop();

    let trackData = null;
    let loop = true;

    switch (trackName) {
      case 'title':   trackData = TRACK_TITLE;   loop = true;  break;
      case 'draft':   trackData = TRACK_DRAFT;   loop = true;  break;
      case 'battle':  trackData = TRACK_BATTLE;  loop = true;  break;
      case 'shop':    trackData = TRACK_SHOP;    loop = true;  break;
      case 'codex':   trackData = TRACK_CODEX;   loop = true;  break;
      case 'victory': trackData = TRACK_VICTORY; loop = false; break;
      case 'defeat':  trackData = TRACK_DEFEAT;  loop = false; break;
      default:
        console.warn('Music.play: unknown track "' + trackName + '"');
        return;
    }

    this.currentTrack = trackName;
    this._startLoop(trackData, loop);
  },

  stop() {
    const loopState = this.currentLoop;
    if (loopState) {
      loopState.active = false;
      if (loopState.tickTimer) clearTimeout(loopState.tickTimer);
      if (loopState.endTimer) clearTimeout(loopState.endTimer);

      // Fade out old music bus quickly so pre-scheduled notes become inaudible.
      if (this.ctx && loopState.bus) {
        const now = this.ctx.currentTime;
        try {
          loopState.bus.gain.cancelScheduledValues(now);
          loopState.bus.gain.setValueAtTime(loopState.bus.gain.value, now);
          loopState.bus.gain.linearRampToValueAtTime(0, now + 0.06);
        } catch {
          // no-op
        }
        setTimeout(() => {
          try { loopState.bus.disconnect(); } catch {
            // no-op
          }
        }, 120);
      }
    }
    this.currentLoop = null;
    this.currentMusicBus = null;
    this.currentTrack = null;
  },

  // ---- Sound Effects ----
  playSFX(name) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.isSFXMuted) return;

    switch (name) {
      case 'move':      this._sfxMove();     break;
      case 'capture':   this._sfxCapture();  break;
      case 'select':    this._sfxSelect();   break;
      case 'promote':   this._sfxPromote();  break;
      case 'check':     this._sfxCheck();    break;
      case 'freeze':    this._sfxFreeze();   break;
      case 'electric':  this._sfxElectric(); break;
      case 'explode':   this._sfxExplode();  break;
      case 'purchase':  this._sfxPurchase(); break;
      case 'error':     this._sfxError();    break;
      default:
        console.warn('Music.playSFX: unknown sfx "' + name + '"');
    }
  },

  // ---- SFX helpers ----
  _sfxOsc(freq, type, startTime, duration, vol, dest) {
    const gain = this.ctx.createGain();
    gain.connect(dest || this.sfxGain);
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.gain.setValueAtTime(vol || 0.5, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    return osc;
  },

  _sfxNoise(startTime, duration, vol, dest) {
    const bufSize = Math.ceil(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    src.connect(gain);
    gain.connect(dest || this.sfxGain);
    gain.gain.setValueAtTime(vol || 0.3, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    src.start(startTime);
    return src;
  },

  // move - soft click (short low-freq square blip)
  _sfxMove() {
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.sfxGain);
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.06);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.07);
    osc.start(t);
    osc.stop(t + 0.08);
  },

  // capture - short pop / explosion
  _sfxCapture() {
    const t = this.ctx.currentTime;
    // Noise burst
    this._sfxNoise(t, 0.12, 0.4);
    // Low thud
    const gain = this.ctx.createGain();
    gain.connect(this.sfxGain);
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.19);
  },

  // select - higher pitch tick
  _sfxSelect() {
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.sfxGain);
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.04);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.05);
    osc.start(t);
    osc.stop(t + 0.06);
  },

  // promote - ascending arpeggio (C E G C)
  _sfxPromote() {
    const t = this.ctx.currentTime;
    const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6];
    for (let i = 0; i < notes.length; i++) {
      this._sfxOsc(notes[i], 'square', t + i * 0.08, 0.12, 0.4);
    }
  },

  // check - tense two-tone sting
  _sfxCheck() {
    const t = this.ctx.currentTime;
    this._sfxOsc(NOTE.B4, 'sawtooth', t,        0.08, 0.5);
    this._sfxOsc(NOTE.F5, 'sawtooth', t + 0.05, 0.12, 0.5);
    this._sfxOsc(NOTE.B4, 'sawtooth', t + 0.14, 0.18, 0.4);
  },

  // freeze - cold crystalline (high triangle with shimmer)
  _sfxFreeze() {
    const t = this.ctx.currentTime;
    const freqs = [NOTE.C6, NOTE.G5, NOTE.E5, NOTE.C5];
    for (let i = 0; i < freqs.length; i++) {
      const gain = this.ctx.createGain();
      gain.connect(this.sfxGain);
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freqs[i];
      osc.connect(gain);
      const st = t + i * 0.07;
      const dur = 0.35 - i * 0.05;
      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.35, st + 0.01);
      gain.gain.linearRampToValueAtTime(0, st + dur);
      osc.start(st);
      osc.stop(st + dur + 0.01);
    }
    // Add a high-freq shimmer
    const shimmer = this.ctx.createOscillator();
    const shimGain = this.ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(3500, t);
    shimmer.frequency.linearRampToValueAtTime(5000, t + 0.4);
    shimmer.connect(shimGain);
    shimGain.connect(this.sfxGain);
    shimGain.gain.setValueAtTime(0.15, t);
    shimGain.gain.linearRampToValueAtTime(0, t + 0.45);
    shimmer.start(t);
    shimmer.stop(t + 0.46);
  },

  // electric - zap (noise + rising square)
  _sfxElectric() {
    const t = this.ctx.currentTime;
    this._sfxNoise(t, 0.1, 0.5);
    const gain = this.ctx.createGain();
    gain.connect(this.sfxGain);
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.21);
  },

  // explode - deep boom with noise
  _sfxExplode() {
    const t = this.ctx.currentTime;
    this._sfxNoise(t, 0.4, 0.7);
    const gain = this.ctx.createGain();
    gain.connect(this.sfxGain);
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.start(t);
    osc.stop(t + 0.56);
  },

  // purchase - bright coin jingle (G5 B5 D6)
  _sfxPurchase() {
    const t = this.ctx.currentTime;
    const notes = [NOTE.G5, NOTE.B5, NOTE.D6];
    for (let i = 0; i < notes.length; i++) {
      const gain = this.ctx.createGain();
      gain.connect(this.sfxGain);
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = notes[i];
      osc.connect(gain);
      const st = t + i * 0.07;
      gain.gain.setValueAtTime(0.4, st);
      gain.gain.setValueAtTime(0.4, st + 0.06);
      gain.gain.linearRampToValueAtTime(0, st + 0.25);
      osc.start(st);
      osc.stop(st + 0.26);
    }
  },

  // error - buzzer (low sawtooth burst)
  _sfxError() {
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.sfxGain);
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 120;
    osc.connect(gain);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.setValueAtTime(0.5, t + 0.08);
    gain.gain.setValueAtTime(0, t + 0.09);
    gain.gain.setValueAtTime(0.4, t + 0.12);
    gain.gain.setValueAtTime(0.4, t + 0.20);
    gain.gain.linearRampToValueAtTime(0, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.23);
  },
};
