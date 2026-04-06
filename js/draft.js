// ==================== ROGUELIKE DRAFT SYSTEM ====================

const Draft = {
  state: {
    round: 1,
    lives: STARTING_LIVES,
    playerPieces: {
      pawns: Array(8).fill(PT.PAWN),
      back: [PT.ROOK, PT.KNIGHT, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.ROOK],
    },
    enemyDifficulty: 1,
    selectedCards: [],
    currentOffers: [],
    collection: [], // all special pieces player has collected
    wins: 0,
    runEvent: null,
    eventAppliedRound: 0,
  },

  bossConfigs: {
    5: {
      id: 'frost_court',
      name: 'Boss: Frost Court',
      desc: 'A controlled freeze setup with a single basilisk anchor.',
      setup: {
        pawns: [PT.ICICLE, PT.PAWN, PT.PAWN, PT.PAWN, PT.PAWN, PT.PAWN, PT.PAWN, PT.PAWN],
        back: [PT.ROOK, PT.BASILISK, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.ROOK],
      },
      modifier: 'frost',
    },
    10: {
      id: 'iron_legion',
      name: 'Boss: Iron Legion',
      desc: 'Durable frontline with moderate attrition pressure.',
      setup: {
        pawns: [PT.IRON_PAWN, PT.WAR_AUTOMATOR, PT.PAWN, PT.PAWN, PT.PAWN, PT.PAWN, PT.WAR_AUTOMATOR, PT.IRON_PAWN],
        back: [PT.SUMO_ROOK, PT.KNIGHT, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.SUMO_ROOK],
      },
      modifier: 'legion',
    },
    15: {
      id: 'cataclysm_court',
      name: 'Boss: Cataclysm Court',
      desc: 'Elite mobility and tactical pressure without instant snowball.',
      setup: {
        pawns: [PT.HERO_PAWN, PT.EPEE_PAWN, PT.WARP_JUMPER, PT.PAWN, PT.PAWN, PT.WARP_JUMPER, PT.EPEE_PAWN, PT.HERO_PAWN],
        back: [PT.PHASE_ROOK, PT.KNIGHTMARE, PT.BISHOP, PT.FISSION_REACTOR, PT.KING, PT.BLADE_RUNNER, PT.KNIGHT, PT.PHASE_ROOK],
      },
      modifier: 'cataclysm',
    },
  },

  eventPool: [
    {
      id: 'campfire',
      title: 'Campfire Decision',
      desc: 'Your troops rest before battle. Choose recovery or momentum.',
      choices: [
        { id: 'heal', label: '+1 life', effect: 'heal' },
        { id: 'gold', label: '+2 gold', effect: 'gold' },
      ],
    },
    {
      id: 'blacksmith',
      title: 'Blacksmith Forge',
      desc: 'The forge can reinforce your army before combat.',
      choices: [
        { id: 'relic', label: 'Gain a random relic', effect: 'random_relic' },
        { id: 'upgrade', label: 'Upgrade one pawn', effect: 'upgrade_pawn' },
      ],
    },
    {
      id: 'dark_pact',
      title: 'Dark Pact',
      desc: 'Power at a cost. Risk your life for a rare edge.',
      choices: [
        { id: 'rare_power', label: '-1 life, gain rare relic', effect: 'rare_relic_cost_life' },
        { id: 'safe', label: 'Refuse and gain +2 gold', effect: 'reroll_token' },
      ],
    },
  ],

  // Pool of draftable pieces per category
  piecePool: {
    pawn: [PT.EPEE_PAWN, PT.GOLDEN_PAWN, PT.HERO_PAWN, PT.IRON_PAWN,
           PT.KNIFE_PAWN, PT.WAR_AUTOMATOR, PT.WARP_JUMPER, PT.BLUEPRINT],
    rook: [PT.PHASE_ROOK, PT.SUMO_ROOK],
    bishop: [PT.ARISTOCRAT, PT.BASILISK, PT.BLADE_RUNNER, PT.BOUNCER,
             PT.CARDINAL, PT.DANCER, PT.DJINN, PT.GUNSLINGER,
             PT.HORDE_MOTHER, PT.ICICLE, PT.MARAUDER, PT.PILGRIM],
    knight: [PT.ANTI_VIOLENCE, PT.BANKER, PT.CAMEL, PT.ELECTRO_KNIGHT,
             PT.FISH, PT.PINATA, PT.KNIGHTMARE],
    queen: [PT.FISSION_REACTOR],
    king: [PT.ROCKETMAN],
  },

  init() {
    this.state = {
      round: 1,
      lives: STARTING_LIVES,
      playerPieces: {
        pawns: Array(8).fill(PT.PAWN),
        back: [PT.ROOK, PT.KNIGHT, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.ROOK],
      },
      enemyDifficulty: 1,
      selectedCards: [],
      currentOffers: [],
      collection: [],
      wins: 0,
      runEvent: null,
      eventAppliedRound: 0,
    };
  },

  isBossRound(round) {
    const r = round || this.state.round;
    return !!this.bossConfigs[r];
  },

  getBossForRound(round) {
    return this.bossConfigs[round] || null;
  },

  getCurrentBoss() {
    return this.getBossForRound(this.state.round);
  },

  _pickUniquePawnUpgrade() {
    const options = this.piecePool.pawn.filter(pt => !this.state.playerPieces.pawns.includes(pt));
    if (options.length === 0) return false;
    const idx = RunRNG.int(this.state.playerPieces.pawns.length);
    const nextType = options[RunRNG.int(options.length)];
    this.state.playerPieces.pawns[idx] = nextType;
    if (!this.state.collection.includes(nextType)) this.state.collection.push(nextType);
    return true;
  },

  rollRoundEvent() {
    if (this.state.eventAppliedRound === this.state.round) return;
    this.state.eventAppliedRound = this.state.round;
    this.state.runEvent = null;

    if (this.state.round <= 1 || this.isBossRound()) return;
    if (!RunRNG.chance(0.4)) return;

    const template = this.eventPool[RunRNG.int(this.eventPool.length)];
    this.state.runEvent = {
      id: template.id,
      title: template.title,
      desc: template.desc,
      choices: template.choices.map(c => ({ ...c })),
      resolved: false,
      resultText: '',
    };
  },

  applyRoundEventChoice(choiceId) {
    const event = this.state.runEvent;
    if (!event || event.resolved) return;

    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return;

    let resultText = 'No effect.';
    switch (choice.effect) {
      case 'heal':
        this.state.lives = Math.min(STARTING_LIVES, this.state.lives + 1);
        resultText = 'Your army recovers 1 life.';
        break;
      case 'gold':
        GoldSystem.earn(2, 'event');
        resultText = 'You gained 2 gold.';
        break;
      case 'random_relic': {
        const relicChoices = RelicSystem.getShopPool(5).filter(r => r.rarity !== 'rare');
        const relic = RunRNG.pick(relicChoices.length > 0 ? relicChoices : RelicSystem.getShopPool(5));
        if (relic) {
          RelicSystem.add(relic.id);
          resultText = `You gained relic: ${I18n.relicInfo(relic.id)?.name || relic.name}.`;
        } else {
          resultText = 'No relic available.';
        }
        break;
      }
      case 'upgrade_pawn': {
        const upgraded = this._pickUniquePawnUpgrade();
        resultText = upgraded ? 'A pawn was upgraded before battle.' : 'No pawn upgrade available.';
        break;
      }
      case 'rare_relic_cost_life': {
        if (this.state.lives > 2) {
          this.state.lives -= 1;
          const rareRelics = Object.values(RELICS).filter(r => r.rarity === 'rare' && !RelicSystem.has(r.id));
          const relic = RunRNG.pick(rareRelics);
          if (relic) {
            RelicSystem.add(relic.id);
            resultText = `Dark pact accepted: ${I18n.relicInfo(relic.id)?.name || relic.name}.`;
          } else {
            resultText = 'No rare relic available.';
          }
        } else {
          resultText = 'Not enough life for the pact.';
        }
        break;
      }
      case 'reroll_token':
        GoldSystem.earn(2, 'event');
        resultText = 'You gained 2 gold by refusing the pact.';
        break;
    }

    event.resolved = true;
    event.resultText = resultText;
    Saves.save();
    this.render();
  },

  // Generate draft offers
  generateOffers(count) {
    const offers = [];
    const available = [];

    // Collect all available pieces not already in player's setup
    const currentPieces = [...this.state.playerPieces.pawns, ...this.state.playerPieces.back];

    Object.entries(this.piecePool).forEach(([category, pieces]) => {
      pieces.forEach(pt => {
        if (!currentPieces.includes(pt)) {
          available.push({ type: pt, category });
        }
      });
    });

    RunRNG.shuffle(available);

    // Pick up to count
    const numOffers = Math.min(count, available.length);
    for (let i = 0; i < numOffers; i++) {
      const offer = available[i];
      // Determine which slot this replaces
      let replaceIndex = -1;
      let replaceArray = 'pawns';

      if (offer.category === 'pawn') {
        // Find a standard pawn to replace, or any pawn slot
        replaceIndex = this.state.playerPieces.pawns.findIndex(p => p === PT.PAWN);
        if (replaceIndex === -1) {
          // Replace a random pawn
          replaceIndex = RunRNG.int(8);
        }
        replaceArray = 'pawns';
      } else {
        // Find the slot in back row
        const slotMap = {
          rook: [0, 7],
          knight: [1, 6],
          bishop: [2, 5],
          queen: [3],
          king: [4],
        };
        const slots = slotMap[offer.category];
        // Prefer replacing a standard piece
        replaceIndex = slots.find(i => {
          const t = this.state.playerPieces.back[i];
          return t === PT.ROOK || t === PT.KNIGHT || t === PT.BISHOP ||
                 t === PT.QUEEN || t === PT.KING;
        });
        if (replaceIndex === undefined) {
          replaceIndex = slots[RunRNG.int(slots.length)];
        }
        replaceArray = 'back';
      }

      offers.push({
        ...offer,
        replaceIndex,
        replaceArray,
        replacesType: this.state.playerPieces[replaceArray][replaceIndex],
      });
    }

    this.state.currentOffers = offers;
    this.rollRoundEvent();
    this.state.selectedCards = [];
    return offers;
  },

  // Select a card in draft
  toggleCard(index) {
    const idx = this.state.selectedCards.indexOf(index);
    if (idx >= 0) {
      this.state.selectedCards.splice(idx, 1);
    } else {
      if (this.state.selectedCards.length < DRAFT_PICKS) {
        this.state.selectedCards.push(index);
      }
    }
  },

  // Apply selected draft picks
  applyPicks() {
    this.state.selectedCards.forEach(idx => {
      const offer = this.state.currentOffers[idx];
      this.state.playerPieces[offer.replaceArray][offer.replaceIndex] = offer.type;
      if (!this.state.collection.includes(offer.type)) {
        this.state.collection.push(offer.type);
      }
    });
  },

  // Get the board setup for the current round
  getPlayerSetup() {
    return { ...this.state.playerPieces };
  },

  // Generate enemy setup based on round
  getEnemySetup() {
    const boss = this.getCurrentBoss();
    if (boss) {
      return {
        pawns: [...boss.setup.pawns],
        back: [...boss.setup.back],
      };
    }

    const round = this.state.round;
    const setup = {
      pawns: Array(8).fill(PT.PAWN),
      back: [PT.ROOK, PT.KNIGHT, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.ROOK],
    };

    // Each round, enemy gets more special pieces
    const numSpecial = Math.min(round, 6);
    const allSpecial = [];

    Object.values(this.piecePool).forEach(pieces => {
      pieces.forEach(p => allSpecial.push(p));
    });

    RunRNG.shuffle(allSpecial);

    let placed = 0;
    for (const piece of allSpecial) {
      if (placed >= numSpecial) break;

      const cat = PIECE_CATEGORY[piece];
      if (cat === 'pawn') {
        const idx = setup.pawns.findIndex(p => p === PT.PAWN);
        if (idx >= 0) {
          setup.pawns[idx] = piece;
          placed++;
        }
      } else if (cat === 'king') {
        // Don't replace king for enemy unless rocketman
        if (piece === PT.ROCKETMAN && RunRNG.chance(0.3)) {
          setup.back[4] = piece;
          placed++;
        }
      } else {
        const slotMap = { rook: [0, 7], knight: [1, 6], bishop: [2, 5], queen: [3] };
        const slots = slotMap[cat];
        if (slots) {
          const stdTypes = { rook: PT.ROOK, knight: PT.KNIGHT, bishop: PT.BISHOP, queen: PT.QUEEN };
          const idx = slots.find(i => setup.back[i] === stdTypes[cat]);
          if (idx !== undefined) {
            setup.back[idx] = piece;
            placed++;
          }
        }
      }
    }

    return setup;
  },

  // Win a round
  winRound() {
    this.state.wins++;
    this.state.round++;
    if (this.state.round % 3 === 0) {
      this.state.enemyDifficulty = Math.min(3, this.state.enemyDifficulty + 1);
    }
  },

  // Lose a round
  loseRound() {
    this.state.lives--;
    return this.state.lives > 0;
  },

  isGameOver() {
    return this.state.lives <= 0;
  },

  // Render the draft screen
  render() {
    const container = document.getElementById('draft-screen');

    // Header info
    document.getElementById('draft-round').textContent = I18n.t('draft.round', { round: this.state.round });
    document.getElementById('draft-lives').innerHTML =
      '<span class="heart">' + '\u2764'.repeat(this.state.lives) + '</span>' +
      '\u2661'.repeat(Math.max(0, STARTING_LIVES - this.state.lives));
    document.getElementById('draft-info').textContent = I18n.t('draft.info', {
      wins: this.state.wins,
      count: DRAFT_PICKS,
    });
    GoldSystem.updateDisplay();
    RelicSystem.updateDisplay();
    const boss = this.getCurrentBoss();
    if (boss) {
      document.getElementById('draft-info').textContent += ` | ${boss.name}`;
    }
    const picksHint = document.getElementById('draft-picks-hint');
    if (picksHint) picksHint.textContent = I18n.t('draft.chooseHint', { count: DRAFT_PICKS });

    // Seed display
    const seedEl = document.getElementById('run-seed-display');
    if (seedEl) {
      seedEl.textContent = `Run seed: ${RunRNG.getSeed()}`;
    }

    // Event panel
    const eventBox = document.getElementById('draft-event');
    if (eventBox) {
      const ev = this.state.runEvent;
      if (!ev) {
        eventBox.style.display = 'none';
        eventBox.innerHTML = '';
      } else {
        eventBox.style.display = 'block';
        const choicesHtml = ev.choices.map(c =>
          `<button class="btn btn-small" data-event-choice="${c.id}" ${ev.resolved ? 'disabled' : ''}>${c.label}</button>`
        ).join(' ');
        eventBox.innerHTML = `
          <div class="draft-event-title">${ev.title}</div>
          <div class="draft-event-desc">${ev.desc}</div>
          <div class="draft-event-actions">${choicesHtml}</div>
          ${ev.resultText ? `<div class="draft-event-result">${ev.resultText}</div>` : ''}
        `;
        eventBox.querySelectorAll('[data-event-choice]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.applyRoundEventChoice(btn.getAttribute('data-event-choice'));
          });
        });
      }
    }

    // Board preview
    const previewCanvas = document.getElementById('draft-board-preview');
    const previewBoard = createCustomBoard(
      this.getPlayerSetup(),
      { pawns: Array(8).fill(PT.PAWN), back: [PT.ROOK, PT.KNIGHT, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.ROOK] }
    );
    Renderer.drawMiniBoard(previewCanvas, previewBoard, 32);

    // Draft cards
    const picksContainer = document.getElementById('draft-picks');
    picksContainer.innerHTML = '';

    this.state.currentOffers.forEach((offer, i) => {
      const card = document.createElement('div');
      card.className = 'draft-card' + (this.state.selectedCards.includes(i) ? ' selected' : '');

      // Piece preview canvas
      const canvas = document.createElement('canvas');
      Renderer.drawPieceCanvas(canvas, offer.type, TEAM.WHITE, 48);

      const name = document.createElement('div');
      name.className = 'card-name';
      name.textContent = I18n.pieceName(offer.type);

      const category = document.createElement('div');
      category.className = 'card-category';
      category.textContent = I18n.categoryName(offer.category);

      const desc = document.createElement('div');
      desc.className = 'card-desc';
      desc.textContent = I18n.pieceDesc(offer.type);

      const replaces = document.createElement('div');
      replaces.className = 'card-replaces';
      const replaceName = I18n.pieceName(offer.replacesType);
      replaces.textContent = I18n.t('draft.replaces', { name: replaceName, pos: offer.replaceIndex + 1 });

      card.appendChild(canvas);
      card.appendChild(name);
      card.appendChild(category);
      card.appendChild(desc);
      card.appendChild(replaces);

      card.addEventListener('click', () => {
        this.toggleCard(i);
        this.render();
      });

      picksContainer.appendChild(card);
    });

  },
};
