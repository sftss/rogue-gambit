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
  },

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
    };
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

    // Shuffle
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

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
          replaceIndex = Math.floor(Math.random() * 8);
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
          replaceIndex = slots[Math.floor(Math.random() * slots.length)];
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

    // Shuffle
    for (let i = allSpecial.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSpecial[i], allSpecial[j]] = [allSpecial[j], allSpecial[i]];
    }

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
        if (piece === PT.ROCKETMAN && Math.random() < 0.3) {
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
    document.getElementById('draft-round').textContent = `Round ${this.state.round}`;
    document.getElementById('draft-lives').innerHTML =
      '<span class="heart">' + '\u2764'.repeat(this.state.lives) + '</span>' +
      '\u2661'.repeat(Math.max(0, STARTING_LIVES - this.state.lives));
    document.getElementById('draft-info').textContent = `Wins: ${this.state.wins} | Pick up to ${DRAFT_PICKS} pieces`;

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
      name.textContent = PIECE_INFO[offer.type]?.name || offer.type;

      const category = document.createElement('div');
      category.className = 'card-category';
      category.textContent = offer.category;

      const desc = document.createElement('div');
      desc.className = 'card-desc';
      desc.textContent = PIECE_INFO[offer.type]?.desc || '';

      const replaces = document.createElement('div');
      replaces.className = 'card-replaces';
      const replaceName = PIECE_INFO[offer.replacesType]?.name || offer.replacesType;
      replaces.textContent = `Replaces: ${replaceName} (pos ${offer.replaceIndex + 1})`;

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

    // Confirm button
    document.getElementById('draft-confirm').onclick = () => {
      this.applyPicks();
      Game.startMatch();
    };

    // Skip button
    document.getElementById('draft-skip').onclick = () => {
      Game.startMatch();
    };
  },
};
