// ==================== SAVE SYSTEM ====================

const Saves = {
  SAVE_KEY: 'rogue_gambit_v1_save',
  SETTINGS_KEY: 'rogue_gambit_v1_settings',
  LEGACY_SAVE_KEYS: ['chess_roguelike_v1_save'],
  LEGACY_SETTINGS_KEYS: ['chess_roguelike_v1_settings'],
  SAVE_VERSION: 1,

  _migrateLegacyStorage(currentKey, legacyKeys) {
    if (localStorage.getItem(currentKey) !== null) return;

    for (const legacyKey of legacyKeys) {
      const legacyValue = localStorage.getItem(legacyKey);
      if (legacyValue !== null) {
        localStorage.setItem(currentKey, legacyValue);
        break;
      }
    }
  },

  _ensureMigration() {
    this._migrateLegacyStorage(this.SAVE_KEY, this.LEGACY_SAVE_KEYS);
    this._migrateLegacyStorage(this.SETTINGS_KEY, this.LEGACY_SETTINGS_KEYS);
  },

  // ── Save / Load ──────────────────────────────
  save() {
    try {
      const data = {
        version: this.SAVE_VERSION,
        timestamp: Date.now(),
        draft: {
          round: Draft.state.round,
          lives: Draft.state.lives,
          wins: Draft.state.wins,
          enemyDifficulty: Draft.state.enemyDifficulty,
          playerPieces: Draft.state.playerPieces,
          collection: Draft.state.collection,
          runEvent: Draft.state.runEvent || null,
          eventAppliedRound: Draft.state.eventAppliedRound || 0,
        },
        gold: GoldSystem.gold,
        relics: RelicSystem.owned,
        codexSeen: Array.from(Codex.seen),
        runSeed: (typeof RunRNG !== 'undefined') ? RunRNG.getSeed() : null,
        runRngState: (typeof RunRNG !== 'undefined') ? RunRNG.getState() : null,
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Failed to save:', e);
      return false;
    }
  },

  load() {
    try {
      this._ensureMigration();
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== this.SAVE_VERSION) return null;
      return data;
    } catch (e) {
      console.warn('Failed to load save:', e);
      return null;
    }
  },

  hasSave() {
    try {
      this._ensureMigration();
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data && data.version === this.SAVE_VERSION;
    } catch {
      return false;
    }
  },

  deleteSave() {
    localStorage.removeItem(this.SAVE_KEY);
    this.LEGACY_SAVE_KEYS.forEach(key => localStorage.removeItem(key));
  },

  applyLoad(data) {
    if (typeof RunRNG !== 'undefined') {
      RunRNG.restore(data.runSeed || String(data.timestamp || Date.now()), data.runRngState);
    }

    // Restore Draft state
    Draft.state.round = data.draft.round;
    Draft.state.lives = data.draft.lives;
    Draft.state.wins = data.draft.wins;
    Draft.state.enemyDifficulty = data.draft.enemyDifficulty;
    Draft.state.playerPieces = data.draft.playerPieces;
    Draft.state.collection = data.draft.collection;
    Draft.state.runEvent = data.draft.runEvent || null;
    Draft.state.eventAppliedRound = data.draft.eventAppliedRound || 0;

    // Restore Gold
    GoldSystem.gold = data.gold || 0;

    // Restore Relics
    RelicSystem.owned = data.relics || [];

    // Restore Codex seen
    if (Array.isArray(data.codexSeen)) Codex.seen = new Set(data.codexSeen);

    GoldSystem.updateDisplay();
  },

  getSaveInfo() {
    const data = this.load();
    if (!data) return null;
    const locale = (typeof I18n !== 'undefined' && I18n && typeof I18n.getLocale === 'function')
      ? I18n.getLocale()
      : undefined;
    return {
      round: data.draft.round,
      wins: data.draft.wins,
      lives: data.draft.lives,
      gold: data.gold,
      relicsCount: (data.relics || []).length,
      date: new Date(data.timestamp).toLocaleDateString(locale),
    };
  },

  // ── Settings ─────────────────────────────────
  defaultSettings: {
    musicVolume: 0.4,
    sfxVolume: 0.6,
    musicEnabled: true,
    sfxEnabled: true,
    language: 'auto',
    aiDifficulty: 2,
    showCoordinates: true,
    showThreatMap: false,
    animationSpeed: 'normal',
  },

  saveSettings(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  },

  loadSettings() {
    try {
      this._ensureMigration();
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      if (!raw) return { ...this.defaultSettings };
      return { ...this.defaultSettings, ...JSON.parse(raw) };
    } catch {
      return { ...this.defaultSettings };
    }
  },
};
