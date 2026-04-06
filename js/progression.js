// ==================== META PROGRESSION ====================

const Progression = {
  PROFILE_KEY: 'rogue_gambit_v1_profile',

  achievementDefs: [
    { id: 'first_win', title: 'First Victory', desc: 'Win your first battle.' },
    { id: 'relic_hunter', title: 'Relic Hunter', desc: 'Buy 10 relics across all runs.' },
    { id: 'survivor_10', title: 'Survivor', desc: 'Reach round 10.' },
    { id: 'boss_slayer', title: 'Boss Slayer', desc: 'Defeat a boss round.' },
    { id: 'captain_100', title: 'Battle Captain', desc: 'Capture 100 enemy pieces.' },
  ],

  _defaultProfile() {
    return {
      stats: {
        runsStarted: 0,
        runsWon: 0,
        runsLost: 0,
        roundsWon: 0,
        totalMatches: 0,
        totalCaptures: 0,
        relicsBought: 0,
        bossesDefeated: 0,
        bestRound: 1,
      },
      achievements: {},
      currentRun: {
        seed: '',
        roundsWon: 0,
        relicsBought: 0,
        captures: 0,
      },
      missions: {
        win3Rounds: false,
        buy2Relics: false,
        reachRound6: false,
      },
      updatedAt: Date.now(),
    };
  },

  _profile: null,

  load() {
    if (this._profile) return this._profile;
    try {
      const raw = localStorage.getItem(this.PROFILE_KEY);
      if (!raw) {
        this._profile = this._defaultProfile();
        return this._profile;
      }
      this._profile = { ...this._defaultProfile(), ...JSON.parse(raw) };
      this._profile.stats = { ...this._defaultProfile().stats, ...(this._profile.stats || {}) };
      this._profile.currentRun = { ...this._defaultProfile().currentRun, ...(this._profile.currentRun || {}) };
      this._profile.missions = { ...this._defaultProfile().missions, ...(this._profile.missions || {}) };
      this._profile.achievements = { ...(this._profile.achievements || {}) };
      return this._profile;
    } catch {
      this._profile = this._defaultProfile();
      return this._profile;
    }
  },

  save() {
    const p = this.load();
    p.updatedAt = Date.now();
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(p));
  },

  onRunStart(seed) {
    const p = this.load();
    p.stats.runsStarted += 1;
    p.currentRun = {
      seed: String(seed || ''),
      roundsWon: 0,
      relicsBought: 0,
      captures: 0,
    };
    p.missions = {
      win3Rounds: false,
      buy2Relics: false,
      reachRound6: false,
    };
    this._updateMissionProgress();
    this._updateAchievements();
    this.save();
    this.renderTitlePanel();
  },

  onCapture() {
    const p = this.load();
    p.stats.totalCaptures += 1;
    p.currentRun.captures += 1;
    this._updateAchievements();
    this.save();
  },

  onRelicBought() {
    const p = this.load();
    p.stats.relicsBought += 1;
    p.currentRun.relicsBought += 1;
    this._updateMissionProgress();
    this._updateAchievements();
    this.save();
    this.renderTitlePanel();
  },

  onBattleEnd(opts) {
    const p = this.load();
    const won = !!opts?.won;
    const round = Math.max(1, Number(opts?.round || 1));
    const runEnded = !!opts?.runEnded;
    const bossDefeated = !!opts?.bossDefeated;

    p.stats.totalMatches += 1;
    p.stats.bestRound = Math.max(p.stats.bestRound, round);

    if (won) {
      p.stats.roundsWon += 1;
      p.currentRun.roundsWon += 1;
    }

    if (bossDefeated) {
      p.stats.bossesDefeated += 1;
      p.stats.runsWon += 1;
    }

    if (runEnded) {
      p.stats.runsLost += 1;
    }

    this._updateMissionProgress();
    this._updateAchievements();
    this.save();
    this.renderTitlePanel();
  },

  _updateMissionProgress() {
    const p = this.load();
    p.missions.win3Rounds = p.currentRun.roundsWon >= 3;
    p.missions.buy2Relics = p.currentRun.relicsBought >= 2;
    p.missions.reachRound6 = (typeof Draft !== 'undefined' && Draft && Draft.state)
      ? Draft.state.round >= 6
      : p.missions.reachRound6;
  },

  _updateAchievements() {
    const p = this.load();
    p.achievements.first_win = p.stats.roundsWon >= 1;
    p.achievements.relic_hunter = p.stats.relicsBought >= 10;
    p.achievements.survivor_10 = p.stats.bestRound >= 10;
    p.achievements.boss_slayer = p.stats.bossesDefeated >= 1;
    p.achievements.captain_100 = p.stats.totalCaptures >= 100;
  },

  renderTitlePanel() {
    const panel = document.getElementById('profile-panel');
    if (!panel) return;

    const p = this.load();
    const stats = p.stats;

    const statsEl = document.getElementById('profile-stats');
    const achEl = document.getElementById('profile-achievements');
    const missionEl = document.getElementById('profile-missions');

    if (statsEl) {
      statsEl.innerHTML = [
        `<div class="profile-chip"><span>Best Round</span><strong>${stats.bestRound}</strong></div>`,
        `<div class="profile-chip"><span>Rounds Won</span><strong>${stats.roundsWon}</strong></div>`,
        `<div class="profile-chip"><span>Bosses</span><strong>${stats.bossesDefeated}</strong></div>`,
        `<div class="profile-chip"><span>Captures</span><strong>${stats.totalCaptures}</strong></div>`,
      ].join('');
    }

    if (achEl) {
      achEl.innerHTML = this.achievementDefs.map(def => {
        const unlocked = !!p.achievements[def.id];
        return `<div class="profile-achievement ${unlocked ? 'unlocked' : 'locked'}"><b>${def.title}</b><span>${def.desc}</span></div>`;
      }).join('');
    }

    if (missionEl) {
      const missions = [
        { key: 'win3Rounds', label: 'Win 3 rounds in this run' },
        { key: 'buy2Relics', label: 'Buy 2 relics in this run' },
        { key: 'reachRound6', label: 'Reach round 6' },
      ];
      missionEl.innerHTML = missions.map(m => {
        const done = !!p.missions[m.key];
        return `<div class="profile-mission ${done ? 'done' : ''}">${done ? 'OK' : '...'} ${m.label}</div>`;
      }).join('');
    }
  },
};
