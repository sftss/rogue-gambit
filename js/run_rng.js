// ==================== RUN SEEDED RNG ====================
// Deterministic RNG for gameplay systems (draft, shop, enemy setup, events).

const RunRNG = {
  _seed: null,
  _state: 1,

  _hashSeed(seedInput) {
    const str = String(seedInput);
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // Avoid zero state for LCG.
    return (h >>> 0) || 1;
  },

  _newSeedValue() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0].toString(36);
    }
    return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)).toString(36);
  },

  initNewRun(seed) {
    const nextSeed = (seed === undefined || seed === null || seed === '') ? this._newSeedValue() : String(seed);
    this._seed = nextSeed;
    this._state = this._hashSeed(nextSeed);
    return this._seed;
  },

  setSeed(seed) {
    return this.initNewRun(seed);
  },

  getSeed() {
    if (!this._seed) this.initNewRun();
    return this._seed;
  },

  getState() {
    return this._state >>> 0;
  },

  restore(seed, state) {
    this.initNewRun(seed);
    if (Number.isFinite(state) && state > 0) {
      this._state = (Math.floor(state) >>> 0) || this._state;
    }
  },

  random() {
    if (!this._seed) this.initNewRun();
    // 32-bit LCG
    this._state = (Math.imul(this._state, 1664525) + 1013904223) >>> 0;
    return this._state / 4294967296;
  },

  int(maxExclusive) {
    if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) return 0;
    return Math.floor(this.random() * maxExclusive);
  },

  chance(probability) {
    return this.random() < Math.max(0, Math.min(1, probability));
  },

  pick(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[this.int(array.length)];
  },

  shuffle(array) {
    if (!Array.isArray(array)) return array;
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
};
