// ==================== MAIN ENTRY POINT ====================

window.addEventListener('DOMContentLoaded', () => {
  let optionsReturnScreen = 'title';

  const detectPreferredLanguage = () => {
    const lang = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    if (lang.startsWith('fr')) return 'fr';
    return 'en';
  };

  // Init audio on first interaction
  document.addEventListener('click', () => Music.init(), { once: true });
  document.addEventListener('keydown', () => Music.init(), { once: true });

  // Load settings
  const settings = Saves.loadSettings();
  Music.setVolume(settings.musicVolume);
  if (!settings.musicEnabled) Music.toggle();
  if (!settings.sfxEnabled) Music.toggleSFX();
  Renderer.setDisplayOptions({
    showCoordinates: settings.showCoordinates !== false,
    showThreatMap: settings.showThreatMap !== false,
  });

  const updateAudioToggleLabels = () => {
    const musicBtn = document.getElementById('opt-music-toggle');
    const sfxBtn = document.getElementById('opt-sfx-toggle');
    if (musicBtn) musicBtn.textContent = Music.isMuted ? I18n.t('common.off') : I18n.t('common.on');
    if (sfxBtn) sfxBtn.textContent = Music.isSFXMuted ? I18n.t('common.off') : I18n.t('common.on');
  };

  const updateGameplayToggleLabels = () => {
    const settingsNow = Saves.loadSettings();
    const coordsBtn = document.getElementById('opt-coords');
    const threatsBtn = document.getElementById('opt-threats');
    if (coordsBtn) coordsBtn.textContent = settingsNow.showCoordinates === false ? I18n.t('common.off') : I18n.t('common.on');
    if (threatsBtn) threatsBtn.textContent = settingsNow.showThreatMap === false ? I18n.t('common.off') : I18n.t('common.on');
  };

  const updateLanguageButtons = () => {
    document.querySelectorAll('.lang-choice').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === I18n.getLanguage());
    });
  };

  const refreshLocalizedRuntimeUI = (rerenderScreens) => {
    const shouldRerender = rerenderScreens !== false;
    I18n.applyToDOM();
    updateAudioToggleLabels();
    updateGameplayToggleLabels();
    updateLanguageButtons();
    GoldSystem.updateDisplay();
    RelicSystem.updateDisplay();
    if (typeof Progression !== 'undefined') Progression.renderTitlePanel();

    if (!shouldRerender) return;

    if (Game.currentScreen === 'title') {
      Game.showTitle();
    } else if (Game.currentScreen === 'draft') {
      Draft.render();
    } else if (Game.currentScreen === 'shop') {
      Shop.renderShop();
    } else if (Game.currentScreen === 'game' && Game.state) {
      Game.updateUI();
      if (Game.state.selectedPiece) {
        const sel = Game.state.selectedPiece;
        Game.updatePieceInfo(Game.board[sel.row][sel.col]);
      } else {
        Game.updatePieceInfo(null);
      }
    } else if (Game.currentScreen === 'codex') {
      Codex.renderCodex();
    }
  };

  I18n.onChange(refreshLocalizedRuntimeUI);

  // Apply persisted settings to UI controls
  document.getElementById('opt-music-vol').value = Math.round((settings.musicVolume || 0) * 100);
  document.getElementById('opt-sfx-vol').value = Math.round((settings.sfxVolume || 0) * 100);
  Draft.state.enemyDifficulty = settings.aiDifficulty || Draft.state.enemyDifficulty;
  document.querySelectorAll('.option-choice[data-opt="ai"]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.val) === Draft.state.enemyDifficulty);
  });

  // Initialize language before first render
  const startupLanguage = (!settings.language || settings.language === 'auto')
    ? detectPreferredLanguage()
    : settings.language;
  I18n.setLanguage(startupLanguage, { persist: false, apply: false });
  refreshLocalizedRuntimeUI(false);

  // ── TITLE SCREEN ──
  document.getElementById('btn-start').addEventListener('click', () => {
    if (Saves.hasSave()) {
      if (confirm(I18n.t('confirm.startNewRun'))) {
        Game.startRun();
      }
    } else {
      Game.startRun();
    }
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    Game.continueRun();
  });

  document.getElementById('btn-codex').addEventListener('click', () => {
    Codex.show('title');
  });

  document.getElementById('btn-options').addEventListener('click', () => {
    optionsReturnScreen = 'title';
    Game.showScreen('options');
  });

  document.getElementById('btn-tutorial').addEventListener('click', () => {
    Tutorial.start(true);
  });

  document.getElementById('btn-patchnotes').addEventListener('click', () => {
    Game.showScreen('patchnotes');
  });

  // ── DRAFT SCREEN ──
  document.getElementById('draft-confirm').addEventListener('click', () => {
    Draft.applyPicks();
    Saves.save();
    Game.startMatch();
  });

  document.getElementById('draft-skip').addEventListener('click', () => {
    Saves.save();
    Game.startMatch();
  });

  document.getElementById('btn-draft-codex').addEventListener('click', () => {
    Codex.show('draft');
  });

  // ── SHOP SCREEN ──
  document.getElementById('shop-reroll').addEventListener('click', () => {
    Shop.reroll();
    // Update shop board preview
    const canvas = document.getElementById('shop-board-preview');
    if (canvas) {
      const board = createCustomBoard(
        Draft.getPlayerSetup(),
        { pawns: Array(8).fill(PT.PAWN), back: [PT.ROOK, PT.KNIGHT, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.ROOK] }
      );
      Renderer.drawMiniBoard(canvas, board, 28);
    }
  });

  document.getElementById('shop-leave').addEventListener('click', () => {
    Shop.leave();
  });

  // ── GAME SCREEN ──
  document.getElementById('board-canvas').addEventListener('click', (e) => {
    const canvas = document.getElementById('board-canvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    Game.handleBoardClick((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  });

  document.getElementById('board-canvas').addEventListener('mousemove', (e) => {
    const canvas = document.getElementById('board-canvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    Game.handleBoardHover((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  });

  document.getElementById('btn-resign').addEventListener('click', () => {
    if (confirm(I18n.t('confirm.resign'))) {
      Game.state.gameOver = true;
      Game.state.winner = TEAM.BLACK;
      Game.state.winReason = I18n.t('game.reason.resigned');
      Game.showGameOver();
    }
  });

  document.getElementById('btn-game-codex').addEventListener('click', () => {
    Codex.show('game');
  });

  const gameOptionsBtn = document.getElementById('btn-game-options');
  if (gameOptionsBtn) {
    gameOptionsBtn.addEventListener('click', () => {
      optionsReturnScreen = 'game';
      Game.showScreen('options');
    });
  }

  // ── CODEX SCREEN ──
  document.getElementById('codex-back').addEventListener('click', () => {
    Codex.back();
  });

  document.getElementById('codex-unlock-all').addEventListener('click', () => {
    Codex.unlockAll();
    Codex.renderCodex();
  });

  document.querySelectorAll('.codex-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Codex.setFilter(btn.dataset.filter);
    });
  });

  // ── OPTIONS SCREEN ──
  document.getElementById('options-back').addEventListener('click', () => {
    if (optionsReturnScreen === 'game') {
      Game.showScreen('game');
      if (Game.state) Game.updateUI();
      return;
    }
    Game.showTitle();
  });

  document.getElementById('patchnotes-back').addEventListener('click', () => {
    Game.showTitle();
  });

  document.getElementById('opt-music-vol').addEventListener('input', (e) => {
    const vol = parseInt(e.target.value) / 100;
    Music.setVolume(vol);
    const s = Saves.loadSettings();
    s.musicVolume = vol;
    Saves.saveSettings(s);
  });

  document.getElementById('opt-sfx-vol').addEventListener('input', (e) => {
    const vol = parseInt(e.target.value) / 100;
    if (Music.sfxGain) Music.sfxGain.gain.value = vol;
    const s = Saves.loadSettings();
    s.sfxVolume = vol;
    Saves.saveSettings(s);
  });

  document.getElementById('opt-music-toggle').addEventListener('click', (e) => {
    Music.toggle();
    e.target.textContent = Music.isMuted ? I18n.t('common.off') : I18n.t('common.on');
    const s = Saves.loadSettings();
    s.musicEnabled = !Music.isMuted;
    Saves.saveSettings(s);
  });

  document.getElementById('opt-sfx-toggle').addEventListener('click', (e) => {
    Music.toggleSFX();
    e.target.textContent = Music.isSFXMuted ? I18n.t('common.off') : I18n.t('common.on');
    const s = Saves.loadSettings();
    s.sfxEnabled = !Music.isSFXMuted;
    Saves.saveSettings(s);
  });

  document.querySelectorAll('.lang-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      I18n.setLanguage(btn.dataset.lang);
    });
  });

  document.querySelectorAll('.option-choice[data-opt="ai"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.option-choice[data-opt="ai"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const diff = parseInt(btn.dataset.val);
      Draft.state.enemyDifficulty = diff;
      const s = Saves.loadSettings();
      s.aiDifficulty = diff;
      Saves.saveSettings(s);
    });
  });

  document.getElementById('opt-delete-save').addEventListener('click', () => {
    if (confirm(I18n.t('confirm.deleteSave'))) {
      Saves.deleteSave();
      document.getElementById('btn-continue').style.display = 'none';
      document.getElementById('save-info').textContent = '';
    }
  });

  document.getElementById('opt-coords').addEventListener('click', (e) => {
    const s = Saves.loadSettings();
    s.showCoordinates = !(s.showCoordinates !== false);
    Saves.saveSettings(s);
    Renderer.setDisplayOptions({ showCoordinates: s.showCoordinates !== false });
    e.target.textContent = s.showCoordinates === false ? I18n.t('common.off') : I18n.t('common.on');
  });

  document.getElementById('opt-threats').addEventListener('click', (e) => {
    const s = Saves.loadSettings();
    s.showThreatMap = !(s.showThreatMap !== false);
    Saves.saveSettings(s);
    Renderer.setDisplayOptions({ showThreatMap: s.showThreatMap !== false });
    e.target.textContent = s.showThreatMap === false ? I18n.t('common.off') : I18n.t('common.on');
  });

  document.getElementById('tutorial-prev').addEventListener('click', () => Tutorial.prev());
  document.getElementById('tutorial-next').addEventListener('click', () => Tutorial.next());
  document.getElementById('tutorial-skip').addEventListener('click', () => Tutorial.close());

  window.addEventListener('beforeunload', () => {
    Saves.save();
  });

  // ── GAME OVER SCREEN ──
  document.getElementById('gameover-continue').addEventListener('click', () => {
    const won = Game.state.winner === TEAM.WHITE;
    if (won) {
      Shop.show(true);
    } else if (!Draft.isGameOver()) {
      Game.showDraft();
    } else {
      Game.showTitle();
    }
  });

  document.getElementById('gameover-newrun').addEventListener('click', () => {
    Game.startRun();
  });

  document.getElementById('gameover-title').addEventListener('click', () => {
    Game.showTitle();
  });

  // ── INIT ──
  updateAudioToggleLabels();
  updateGameplayToggleLabels();
  updateLanguageButtons();
  if (typeof Progression !== 'undefined') Progression.renderTitlePanel();
  Game.showTitle();
  if (typeof Tutorial !== 'undefined' && !Tutorial.hasSeen()) {
    setTimeout(() => Tutorial.start(), 350);
  }
  // Unlock standard pieces in codex
  ['pawn','rook','bishop','knight','queen','king'].forEach(t => Codex.unlock(t));
});
