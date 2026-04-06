// ==================== RELIC SYSTEM ====================

const RelicSystem = {
  owned: [],  // array of relic IDs

  has(id) {
    return this.owned.includes(id);
  },

  add(id) {
    if (!this.owned.includes(id)) {
      this.owned.push(id);
      this.updateDisplay();
    }
  },

  remove(id) {
    this.owned = this.owned.filter(r => r !== id);
    this.updateDisplay();
  },

  reset() {
    this.owned = [];
    this.updateDisplay();
  },

  // ── Apply relic effects to piece state / game ──

  // Called at battle start — apply battle-start relics
  applyBattleStart(board, gameState) {
    // Golden Touch: one random pawn becomes golden
    if (this.has('golden_touch')) {
      const pawns = findAllPieces(board, p =>
        p.team === TEAM.WHITE && p.type === PT.PAWN
      );
      if (pawns.length > 0) {
        const target = pawns[Math.floor(Math.random() * pawns.length)];
        target.piece.type = PT.GOLDEN_PAWN;
      }
    }

    // Battle Hardened: all pieces start with 1 kill
    if (this.has('battle_hardened')) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.team === TEAM.WHITE) {
            p.killCount = Math.max(p.killCount || 0, 1);
          }
        }
      }
    }
  },

  // Called when a capture happens
  applyOnCapture(capturingPiece, capturedPiece, board, gameState) {
    let goldEarned = 0;

    // Blood Money: +1 gold per any capture
    if (this.has('blood_money')) {
      goldEarned += 1;
    }

    return goldEarned;
  },

  // Check if blade runner kills are immediate
  isBladeRunnerImmediate() {
    return this.has('blessed_blade');
  },

  // Get icicle freeze threshold (normally 2 turns adjacent)
  getIcicleFreezeThreshold() {
    return this.has('frozen_heart') ? 1 : 2;
  },

  // Get pilgrim resurrect threshold (normally 20 squares)
  getPilgrimThreshold() {
    return this.has('pilgrims_blessing') ? 10 : 20;
  },

  // Get electro knight charge threshold (normally 3 moves)
  getElectroChargeThreshold() {
    return this.has('conductors_baton') ? 2 : 3;
  },

  // Get dancer bonus moves (normally 2)
  getDancerBonusMoves() {
    return this.has('speed_demon') ? 3 : 2;
  },

  // Get war automator advance distance (normally 1)
  getWarAutomatorDistance() {
    return this.has('warchief') ? 2 : 1;
  },

  // Get horde mother spawn count (normally 1)
  getHordeSpawnCount() {
    return this.has('pack_leader') ? 2 : 1;
  },

  // Check if king is immune to first check
  hasMirrorShield() {
    return this.has('mirror_shield');
  },

  // Resurrection stone: prevent 1 life loss per run
  _resurrectionUsed: false,
  tryResurrection() {
    if (this.has('resurrection_stone') && !this._resurrectionUsed) {
      this._resurrectionUsed = true;
      return true; // prevented the death
    }
    return false;
  },

  resetResurrection() {
    this._resurrectionUsed = false;
  },

  // ── Display ──────────────────────────────────
  updateDisplay() {
    const container = document.getElementById('relics-display');
    if (!container) return;

    container.innerHTML = '';
    this.owned.forEach(id => {
      const relic = I18n.relicInfo(id);
      if (!relic) return;

      const el = document.createElement('div');
      el.className = 'relic-icon';
      el.textContent = relic.icon;
      el.title = `${relic.name}: ${relic.desc}`;
      el.setAttribute('data-relic', id);

      // Tooltip on hover
      el.addEventListener('mouseenter', (e) => {
        showRelicTooltip(relic, e.clientX, e.clientY);
      });
      el.addEventListener('mouseleave', () => {
        hideRelicTooltip();
      });

      container.appendChild(el);
    });
  },

  // Get all relics for shop (exclude owned)
  getShopPool(count) {
    const available = Object.values(RELICS).filter(r => !this.owned.includes(r.id));

    // Sort by rarity (common first, then uncommon, rare last)
    const rarityWeight = { common: 3, uncommon: 2, rare: 1 };
    const pool = [];
    available.forEach(r => {
      for (let i = 0; i < (rarityWeight[r.rarity] || 1); i++) {
        pool.push(r);
      }
    });

    // Shuffle weighted pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Deduplicate
    const seen = new Set();
    const result = [];
    for (const r of pool) {
      if (!seen.has(r.id) && result.length < count) {
        seen.add(r.id);
        result.push(r);
      }
    }
    return result;
  },
};

// ── Tooltip helpers ──────────────────────────────────
function showRelicTooltip(relic, x, y) {
  const relicInfo = I18n.relicInfo(relic.id) || relic;
  let tt = document.getElementById('relic-tooltip');
  if (!tt) {
    tt = document.createElement('div');
    tt.id = 'relic-tooltip';
    tt.className = 'tooltip';
    document.body.appendChild(tt);
  }
  tt.innerHTML = `<div class="tt-name">${relicInfo.icon} ${relicInfo.name}</div>${relicInfo.desc}<br><em>${relicInfo.flavor || ''}</em>`;
  tt.style.left = (x + 12) + 'px';
  tt.style.top = (y - 10) + 'px';
  tt.style.display = 'block';
}

function hideRelicTooltip() {
  const tt = document.getElementById('relic-tooltip');
  if (tt) tt.style.display = 'none';
}
