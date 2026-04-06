// ==================== SHOP SYSTEM ====================

const Shop = {
  currentOffers: [],   // { type, item, cost, bought }
  currentRelics: [],

  // ── Show shop after a win ─────────────────────────
  show(wonRound) {
    // Loan shark relic: +3 gold on shop entry
    if (RelicSystem.has('loan_shark')) {
      GoldSystem.earn(3, 'loan_shark');
    }

    // Apply round-end gold reward
    const earned = GoldSystem.applyRoundEnd(wonRound);

    this.generateOffers();
    this.renderShop(earned);
    Game.showScreen('shop');

    Music.play('shop');
  },

  // ── Generate shop stock ───────────────────────────
  generateOffers() {
    GoldSystem.rerollCount = 0;
    this.currentOffers = [];
    this.currentRelics = [];

    // 3 piece offers
    const allSpecial = [];
    Object.entries(Draft.piecePool).forEach(([cat, pieces]) => {
      pieces.forEach(pt => allSpecial.push({ pt, cat }));
    });

    // Shuffle
    for (let i = allSpecial.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSpecial[i], allSpecial[j]] = [allSpecial[j], allSpecial[i]];
    }

    const current = [...Draft.state.playerPieces.pawns, ...Draft.state.playerPieces.back];

    for (const { pt, cat } of allSpecial.slice(0, 3)) {
      const alreadyHave = current.includes(pt);
      const cost = alreadyHave ? SHOP_COSTS.piece_standard : SHOP_COSTS.piece_special;
      this.currentOffers.push({
        id: 'piece_' + pt,
        type: 'piece',
        pt,
        cat,
        cost,
        alreadyHave,
        bought: false,
        replaceIndex: this._findReplaceSlot(pt, cat),
        replaceArray: cat === 'pawn' ? 'pawns' : 'back',
      });
    }

    // Heal option (always available if lives < max)
    if (Draft.state.lives < STARTING_LIVES) {
      this.currentOffers.push({
        id: 'heal',
        type: 'heal',
        cost: SHOP_COSTS.heal,
        bought: false,
      });
    }

    // 2 relic offers
    this.currentRelics = RelicSystem.getShopPool(2);
  },

  _findReplaceSlot(pt, cat) {
    if (cat === 'pawn') {
      const idx = Draft.state.playerPieces.pawns.findIndex(p => p === PT.PAWN);
      return idx >= 0 ? idx : Math.floor(Math.random() * 8);
    }
    const slotMap = { rook: [0,7], knight: [1,6], bishop: [2,5], queen: [3], king: [4] };
    const slots = slotMap[cat] || [];
    const stdTypes = { rook: PT.ROOK, knight: PT.KNIGHT, bishop: PT.BISHOP, queen: PT.QUEEN, king: PT.KING };
    const found = slots.find(i => Draft.state.playerPieces.back[i] === stdTypes[cat]);
    return found !== undefined ? found : (slots[0] || 0);
  },

  // ── Buy item ──────────────────────────────────────
  buyItem(id) {
    const offer = [...this.currentOffers].find(o => o.id === id);
    if (!offer || offer.bought) return false;
    if (!GoldSystem.canAfford(offer.cost)) {
      Music.playSFX('error');
      return false;
    }

    GoldSystem.spend(offer.cost);
    offer.bought = true;
    Music.playSFX('purchase');

    if (offer.type === 'piece') {
      Draft.state.playerPieces[offer.replaceArray][offer.replaceIndex] = offer.pt;
      if (!Draft.state.collection.includes(offer.pt)) {
        Draft.state.collection.push(offer.pt);
      }
    } else if (offer.type === 'heal') {
      Draft.state.lives = Math.min(Draft.state.lives + 1, STARTING_LIVES);
      this._updateLivesDisplay();
    }

    this.renderShop();
    Saves.save();
    return true;
  },

  buyRelic(id) {
    const relic = RELICS[id];
    if (!relic || RelicSystem.has(id)) return false;
    if (!GoldSystem.canAfford(relic.cost)) {
      Music.playSFX('error');
      return false;
    }

    GoldSystem.spend(relic.cost);
    RelicSystem.add(id);
    Music.playSFX('purchase');

    // Remove from current relics
    this.currentRelics = this.currentRelics.filter(r => r.id !== id);

    this.renderShop();
    Saves.save();
    return true;
  },

  reroll() {
    if (!GoldSystem.reroll()) {
      Music.playSFX('error');
      return;
    }
    this.generateOffers();
    this.renderShop();
    Music.playSFX('purchase');
  },

  leave() {
    Saves.save();
    Game.showDraft();
  },

  // ── Render ────────────────────────────────────────
  renderShop(goldEarned) {
    // Header
    document.getElementById('shop-round').textContent = 'Round ' + Draft.state.round + ' Shop';

    this._updateLivesDisplay();
    GoldSystem.updateDisplay();

    // Gold earned banner
    const banner = document.getElementById('shop-earned-banner');
    if (banner) {
      if (goldEarned !== undefined && goldEarned > 0) {
        const interest = GoldSystem.getInterest();
        banner.textContent = `+${goldEarned}g earned (${GOLD.WIN_BASE}g win + ${Draft.state.round - 1}g round bonus + ${interest}g interest)`;
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }

    // Pieces
    const piecesContainer = document.getElementById('shop-pieces');
    piecesContainer.innerHTML = '';

    this.currentOffers.forEach(offer => {
      if (offer.type === 'heal') {
        const card = this._createHealCard(offer);
        piecesContainer.appendChild(card);
        return;
      }

      const card = this._createPieceCard(offer);
      piecesContainer.appendChild(card);
    });

    // Relics
    const relicsContainer = document.getElementById('shop-relics');
    relicsContainer.innerHTML = '';

    this.currentRelics.forEach(relic => {
      const card = this._createRelicCard(relic);
      relicsContainer.appendChild(card);
    });

    if (this.currentRelics.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'shop-empty';
      msg.textContent = 'No relics available — you own them all!';
      relicsContainer.appendChild(msg);
    }

    // Reroll button
    const rerollBtn = document.getElementById('shop-reroll');
    if (rerollBtn) {
      const cost = GoldSystem.getRerollCost();
      rerollBtn.textContent = `REROLL (${cost}g)`;
      rerollBtn.disabled = !GoldSystem.canAfford(cost);
    }

    // Current relics display
    RelicSystem.updateDisplay();
  },

  _createPieceCard(offer) {
    const card = document.createElement('div');
    card.className = 'shop-card' + (offer.bought ? ' bought' : '') +
      (!GoldSystem.canAfford(offer.cost) && !offer.bought ? ' cant-afford' : '');

    const canvas = document.createElement('canvas');
    Renderer.drawPieceCanvas(canvas, offer.pt, TEAM.WHITE, 48);

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = PIECE_INFO[offer.pt]?.name || offer.pt;

    const cat = document.createElement('div');
    cat.className = 'card-category';
    cat.textContent = offer.cat;

    const desc = document.createElement('div');
    desc.className = 'card-desc';
    desc.textContent = PIECE_INFO[offer.pt]?.desc || '';

    const replaces = document.createElement('div');
    replaces.className = 'card-replaces';
    const currentPiece = Draft.state.playerPieces[offer.replaceArray][offer.replaceIndex];
    replaces.textContent = 'Replaces: ' + (PIECE_INFO[currentPiece]?.name || currentPiece);

    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn btn-small btn-gold';
    buyBtn.textContent = offer.bought ? 'SOLD' : offer.cost + 'g';
    buyBtn.disabled = offer.bought || !GoldSystem.canAfford(offer.cost);
    buyBtn.addEventListener('click', () => this.buyItem(offer.id));

    card.appendChild(canvas);
    card.appendChild(name);
    card.appendChild(cat);
    card.appendChild(desc);
    card.appendChild(replaces);
    card.appendChild(buyBtn);

    return card;
  },

  _createHealCard(offer) {
    const card = document.createElement('div');
    card.className = 'shop-card shop-card-heal' + (offer.bought ? ' bought' : '') +
      (!GoldSystem.canAfford(offer.cost) && !offer.bought ? ' cant-afford' : '');

    const icon = document.createElement('div');
    icon.className = 'shop-heal-icon';
    icon.textContent = '\u2764';

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = 'Restore Life';

    const desc = document.createElement('div');
    desc.className = 'card-desc';
    desc.textContent = 'Recover 1 lost life. Keep fighting.';

    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn btn-small btn-danger';
    buyBtn.textContent = offer.bought ? 'HEALED' : offer.cost + 'g';
    buyBtn.disabled = offer.bought || !GoldSystem.canAfford(offer.cost);
    buyBtn.addEventListener('click', () => this.buyItem(offer.id));

    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(buyBtn);

    return card;
  },

  _createRelicCard(relic) {
    const card = document.createElement('div');
    card.className = 'shop-card shop-card-relic' + (!GoldSystem.canAfford(relic.cost) ? ' cant-afford' : '');
    card.setAttribute('data-rarity', relic.rarity);

    const icon = document.createElement('div');
    icon.className = 'shop-relic-icon';
    icon.textContent = relic.icon;

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = relic.name;

    const rarityEl = document.createElement('div');
    rarityEl.className = 'card-category rarity-' + relic.rarity;
    rarityEl.textContent = relic.rarity;

    const desc = document.createElement('div');
    desc.className = 'card-desc';
    desc.textContent = relic.desc;

    const flavor = document.createElement('div');
    flavor.className = 'card-flavor';
    flavor.textContent = relic.flavor || '';

    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn btn-small btn-gold';
    buyBtn.textContent = relic.cost + 'g';
    buyBtn.disabled = !GoldSystem.canAfford(relic.cost);
    buyBtn.addEventListener('click', () => this.buyRelic(relic.id));

    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(rarityEl);
    card.appendChild(desc);
    card.appendChild(flavor);
    card.appendChild(buyBtn);

    return card;
  },

  _updateLivesDisplay() {
    const livesEl = document.getElementById('shop-lives');
    if (livesEl) {
      livesEl.innerHTML =
        '<span class="heart">' + '\u2764'.repeat(Draft.state.lives) + '</span>' +
        '\u2661'.repeat(Math.max(0, STARTING_LIVES - Draft.state.lives));
    }
  },
};
