// ==================== CODEX / GLOSSAIRE ====================

const Codex = {
  seen: new Set(),      // piece types the player has encountered
  currentFilter: 'all', // 'all', 'pawn', 'rook', 'bishop', 'knight', 'queen', 'king'
  currentSelected: null,

  // Called when a piece is used in battle — unlock its entry
  unlock(pieceType) {
    this.seen.add(pieceType);
    // Unlock standard pieces by default
    ['pawn','rook','bishop','knight','queen','king'].forEach(t => this.seen.add(t));
  },

  unlockAll() {
    Object.values(PT).forEach(t => this.seen.add(t));
  },

  isUnlocked(pieceType) {
    return this.seen.has(pieceType);
  },

  // Show the codex screen
  show(returnScreen) {
    this._returnScreen = returnScreen || 'title';

    // Standard pieces always unlocked
    ['pawn','rook','bishop','knight','queen','king'].forEach(t => this.seen.add(t));

    this.renderCodex();
    Game.showScreen('codex');
    Music.play('codex');
  },

  back() {
    Game.showScreen(this._returnScreen);
    Music.play(this._returnScreen === 'title' ? 'title' : this._returnScreen);
  },

  setFilter(filter) {
    this.currentFilter = filter;
    this.renderCodex();
  },

  renderCodex() {
    // Update filter buttons
    document.querySelectorAll('.codex-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
    });

    const list = document.getElementById('codex-list');
    list.innerHTML = '';

    // Get all piece types for the current filter
    const allTypes = Object.values(PT).filter(t => {
      if (t === PT.HORDELING) return this.currentFilter === 'all' || this.currentFilter === 'pawn';
      const cat = PIECE_CATEGORY[t];
      return this.currentFilter === 'all' || cat === this.currentFilter;
    });

    allTypes.forEach(type => {
      const unlocked = this.isUnlocked(type);
      const card = document.createElement('div');
      card.className = 'codex-entry' + (unlocked ? '' : ' locked') +
        (this.currentSelected === type ? ' selected' : '');

      const canvas = document.createElement('canvas');
      if (unlocked) {
        Renderer.drawPieceCanvas(canvas, type, TEAM.WHITE, 40);
      } else {
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2a1a40';
        ctx.fillRect(0, 0, 40, 40);
        ctx.fillStyle = '#4a3a60';
        ctx.font = '20px monospace';
        ctx.fillText('?', 12, 28);
      }

      const name = document.createElement('div');
      name.className = 'codex-entry-name';
      name.textContent = unlocked ? (PIECE_INFO[type]?.name || type) : '???';

      card.appendChild(canvas);
      card.appendChild(name);

      if (unlocked) {
        card.addEventListener('click', () => {
          this.currentSelected = type;
          this.renderCodexDetail(type);
          // Update selection highlight
          document.querySelectorAll('.codex-entry').forEach(e => e.classList.remove('selected'));
          card.classList.add('selected');
        });
      }

      list.appendChild(card);
    });

    // Auto-select first unlocked
    if (!this.currentSelected || !this.isUnlocked(this.currentSelected)) {
      const firstUnlocked = allTypes.find(t => this.isUnlocked(t));
      if (firstUnlocked) {
        this.currentSelected = firstUnlocked;
        this.renderCodexDetail(firstUnlocked);
      }
    } else {
      this.renderCodexDetail(this.currentSelected);
    }
  },

  renderCodexDetail(type) {
    const panel = document.getElementById('codex-detail');
    if (!panel) return;

    const info = PIECE_INFO[type];
    const lore = (typeof LORE !== 'undefined') ? LORE[type] : null;
    const cat = PIECE_CATEGORY[type] || 'unknown';

    // Header
    const headerCanvas = document.createElement('canvas');
    Renderer.drawPieceCanvas(headerCanvas, type, TEAM.WHITE, 64);

    panel.innerHTML = '';

    // Piece preview (both teams)
    const preview = document.createElement('div');
    preview.className = 'codex-preview';
    const wCanvas = document.createElement('canvas');
    Renderer.drawPieceCanvas(wCanvas, type, TEAM.WHITE, 64);
    const bCanvas = document.createElement('canvas');
    Renderer.drawPieceCanvas(bCanvas, type, TEAM.BLACK, 64);
    preview.appendChild(wCanvas);
    preview.appendChild(bCanvas);

    // Title
    const title = document.createElement('h2');
    title.className = 'codex-title';
    title.textContent = info?.name || type;

    const catEl = document.createElement('div');
    catEl.className = 'codex-category';
    catEl.textContent = cat.toUpperCase() + ' CLASS';

    // Tags
    if (lore?.tags) {
      const tagsEl = document.createElement('div');
      tagsEl.className = 'codex-tags';
      lore.tags.forEach(tag => {
        const t = document.createElement('span');
        t.className = 'codex-tag';
        t.textContent = tag;
        tagsEl.appendChild(t);
      });
      panel.appendChild(preview);
      panel.appendChild(title);
      panel.appendChild(catEl);
      panel.appendChild(tagsEl);
    } else {
      panel.appendChild(preview);
      panel.appendChild(title);
      panel.appendChild(catEl);
    }

    // Mechanic description
    const mechanic = document.createElement('div');
    mechanic.className = 'codex-mechanic';
    mechanic.innerHTML = '<span class="codex-section-title">ABILITY</span><br>' + (info?.desc || '');
    panel.appendChild(mechanic);

    // Lore text
    if (lore?.lore) {
      const loreEl = document.createElement('div');
      loreEl.className = 'codex-lore';
      loreEl.textContent = lore.lore;
      panel.appendChild(loreEl);
    }

    // Flavor quote
    if (lore?.flavor) {
      const flavorEl = document.createElement('div');
      flavorEl.className = 'codex-flavor';
      flavorEl.textContent = lore.flavor;
      panel.appendChild(flavorEl);
    }

    // If in collection
    const owned = [...Draft.state.playerPieces.pawns, ...Draft.state.playerPieces.back].includes(type);
    if (owned) {
      const badge = document.createElement('div');
      badge.className = 'codex-owned-badge';
      badge.textContent = '\u2714 In your army';
      panel.appendChild(badge);
    }
  },
};
