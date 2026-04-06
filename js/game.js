// ==================== GAME STATE MACHINE ====================

const Game = {
  board: null,
  state: null,
  currentScreen: 'title',
  _renderLoopStarted: false,

  // ============ SCREEN MANAGEMENT ============
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(name + '-screen').classList.add('active');
    this.currentScreen = name;
  },

  // ============ TITLE SCREEN ============
  showTitle() {
    this.showScreen('title');
    Music.play('title');
    // Show/hide continue button
    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn) {
      continueBtn.style.display = Saves.hasSave() ? 'block' : 'none';
    }
    // Show save info
    const saveInfo = document.getElementById('save-info');
    if (saveInfo) {
      const info = Saves.getSaveInfo();
      if (info) {
        saveInfo.textContent = `Saved: Round ${info.round} | ${info.wins} wins | ${info.gold}g | ${info.relicsCount} relics (${info.date})`;
      } else {
        saveInfo.textContent = '';
      }
    }
  },

  // ============ START NEW RUN ============
  startRun() {
    Draft.init();
    GoldSystem.reset();
    RelicSystem.reset();
    RelicSystem.resetResurrection();
    Saves.deleteSave();
    this.showDraft();
  },

  // ============ CONTINUE RUN ============
  continueRun() {
    const data = Saves.load();
    if (!data) { this.startRun(); return; }
    Saves.applyLoad(data);
    this.showDraft();
  },

  // ============ DRAFT PHASE ============
  showDraft() {
    this.showScreen('draft');
    Music.play('draft');
    Draft.generateOffers(6);
    Draft.render();
    this._updateShopBoardPreview('draft-board-preview');
  },

  _updateShopBoardPreview(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const board = createCustomBoard(
      Draft.getPlayerSetup(),
      { pawns: Array(8).fill(PT.PAWN), back: [PT.ROOK, PT.KNIGHT, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.ROOK] }
    );
    Renderer.drawMiniBoard(canvas, board, 28);
  },

  // ============ START MATCH ============
  startMatch() {
    const playerSetup = Draft.getPlayerSetup();
    const enemySetup = Draft.getEnemySetup();

    this.board = createCustomBoard(playerSetup, enemySetup);
    this.state = createGameState();
    this.state.battleGoldEarned = 0;

    // Handle start-of-game effects
    this.handleGameStartEffects();

    // Apply relic battle-start effects
    RelicSystem.applyBattleStart(this.board, this.state);

    // Unlock codex entries for pieces on board
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) Codex.unlock(p.type);
      }
    }

    // Update aristocrat tracking
    updateAristocratStatus(this.board, this.state);

    // Init renderer (only once)
    this.showScreen('game');
    if (!this._renderLoopStarted) {
      Renderer.init();
      Renderer.startRenderLoop(this.board, this.state);
      this._renderLoopStarted = true;
    } else {
      Renderer.board = this.board;
      Renderer.state = this.state;
    }

    Music.play('battle');
    GoldSystem.resetBattleGold();
    GoldSystem.updateDisplay();
    this.updateUI();
    this.addLog('Round ' + Draft.state.round + ' started!');

    if (this.state.currentTeam === TEAM.BLACK) {
      setTimeout(() => this.doAITurn(), 500);
    }
  },

  // ============ START-OF-GAME EFFECTS ============
  handleGameStartEffects() {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) continue;

        if (p.type === PT.BLUEPRINT) {
          const leftCol = c - 1;
          if (leftCol >= 0 && this.board[r][leftCol]) {
            const leftPiece = this.board[r][leftCol];
            if (PIECE_CATEGORY[leftPiece.type] === 'pawn') {
              p.type = leftPiece.type;
            }
          }
          if (p.type === PT.BLUEPRINT) p.type = PT.PAWN;
        }

        if (p.type === PT.PINATA) {
          const options = [PT.PAWN, PT.ROOK, PT.BISHOP, PT.KNIGHT, PT.QUEEN];
          p.type = options[Math.floor(Math.random() * options.length)];
        }
      }
    }
  },

  // ============ CLICK HANDLING ============
  handleBoardClick(canvasX, canvasY) {
    if (this.state.gameOver) return;
    if (this.state.currentTeam !== TEAM.WHITE) return;
    if (this.state.promotionPending) return;

    const col = Math.floor(canvasX / TILE_SIZE);
    const row = Math.floor(canvasY / TILE_SIZE);
    if (row < 0 || row > 7 || col < 0 || col > 7) return;

    const clickedPiece = this.board[row][col];

    if (this.state.selectedPiece) {
      const move = this.state.validMoves.find(m => m.row === row && m.col === col);
      if (move) {
        Music.playSFX('move');
        this.executeMove(this.state.selectedPiece.row, this.state.selectedPiece.col, move);
        return;
      }
      if (clickedPiece && clickedPiece.team === TEAM.WHITE) {
        this.selectPiece(row, col);
        return;
      }
      this.deselectPiece();
      return;
    }

    if (clickedPiece && clickedPiece.team === TEAM.WHITE) {
      this.selectPiece(row, col);
    }
  },

  selectPiece(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.dissipated) return;
    Music.playSFX('select');

    if (piece.frozen) {
      this.state.selectedPiece = { row, col };
      this.state.validMoves = [{ row, col, type: 'unfreeze' }];
      this.updatePieceInfo(piece);
      return;
    }

    const moves = PieceMoves.getMoves(piece, row, col, this.board, this.state);
    const legal = PieceMoves.filterLegalMoves(piece, row, col, moves, this.board, this.state);
    this.state.selectedPiece = { row, col };
    this.state.validMoves = legal;
    this.updatePieceInfo(piece);
  },

  deselectPiece() {
    this.state.selectedPiece = null;
    this.state.validMoves = [];
  },

  // ============ MOVE EXECUTION ============
  executeMove(fromRow, fromCol, move) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return;
    this.deselectPiece();

    if (move.type === 'unfreeze') {
      piece.frozen = false;
      this.addLog(`${PIECE_INFO[piece.type]?.name || piece.type} unfreezes!`);
      this.endTurn(); return;
    }

    if (move.type === 'special') {
      if (piece.type === PT.DJINN && move.row === fromRow && move.col === fromCol) {
        piece.dissipated = true;
        this.state.dissipatedDjinns.push({ piece, row: fromRow, col: fromCol });
        this.board[fromRow][fromCol] = null;
        this.addLog('Djinn dissipates...'); this.endTurn(); return;
      }
      if (piece.type === PT.ROCKETMAN && move.rocketMove) {
        piece.rocketUsed = true;
        this.board[fromRow][fromCol] = null;
        this.board[move.row][move.col] = piece;
        piece.hasMoved = true;
        Renderer.spawnExplosionEffect(fromRow, fromCol);
        Music.playSFX('explode');
        this.addLog('Rocketman blasts off!', 'important'); this.endTurn(); return;
      }
      if (piece.type === PT.SUMO_ROOK && move.pushTarget) {
        this.handleSumoPush(piece, fromRow, fromCol, move); this.endTurn(); return;
      }
      if (move.duel) {
        this.handleGunslingerDuel(piece, fromRow, fromCol, move); this.endTurn(); return;
      }
      if (move.resurrect) {
        this.handlePilgrimResurrect(piece, fromRow, fromCol, move); this.endTurn(); return;
      }
    }

    // Standard move/capture
    const targetPiece = this.board[move.row][move.col];
    let captured = null;

    if (PIECE_CATEGORY[piece.type] === 'pawn' && move.enPassant) {
      const captureRow = move.enPassantRow !== undefined ? move.enPassantRow : fromRow;
      const captureCol = move.enPassantCol !== undefined ? move.enPassantCol : move.col;
      captured = removePiece(this.board, captureRow, captureCol, this.state);
      if (captured) {
        Renderer.spawnCaptureEffect(captureRow, captureCol, '#f44');
        Music.playSFX('capture');
        this.addLog(`${PIECE_INFO[piece.type]?.name} en passants ${PIECE_INFO[captured.type]?.name}!`);
        this._onCapture(piece, captured);
      }
    } else if (targetPiece && targetPiece.team !== piece.team && targetPiece.type !== PT.IRON_PAWN) {
      captured = removePiece(this.board, move.row, move.col, this.state);
      if (captured) {
        Renderer.spawnCaptureEffect(move.row, move.col, captured.team === TEAM.WHITE ? '#e8e0d0' : '#484058');
        Music.playSFX('capture');
        this.addLog(`${PIECE_INFO[piece.type]?.name} captures ${PIECE_INFO[captured.type]?.name}!`);
        this._onCapture(piece, captured);
      }
    }

    // Blade runner pass-through
    if (piece.type === PT.BLADE_RUNNER && move.bladeTarget) {
      const bt = move.bladeTarget;
      const target = this.board[bt.row][bt.col];
      if (target) {
        if (RelicSystem.isBladeRunnerImmediate()) {
          // Blessed blade: kill immediately
          const killed = removePiece(this.board, bt.row, bt.col, this.state);
          if (killed) { Renderer.spawnCaptureEffect(bt.row, bt.col, '#f44'); this._onCapture(piece, killed); }
        } else {
          this.state.bladeRunnerMarks.push({ row: bt.row, col: bt.col, turn: this.state.turn });
          this.addLog(`Blade Runner marks ${PIECE_INFO[target.type]?.name} for death!`, 'danger');
        }
      }
    }

    // Move the piece
    this.board[fromRow][fromCol] = null;
    this.board[move.row][move.col] = piece;
    piece.hasMoved = true;

    if (piece.type === PT.PILGRIM) {
      piece.totalMoved += Math.max(Math.abs(move.row - fromRow), Math.abs(move.col - fromCol));
    }

    // En passant target
    if (PIECE_CATEGORY[piece.type] === 'pawn' && Math.abs(move.row - fromRow) === 2) {
      this.state.enPassantTarget = { row: (fromRow + move.row) / 2, col: fromCol, pawnRow: move.row, pawnCol: move.col };
    } else {
      this.state.enPassantTarget = null;
    }

    // Castling
    if (PIECE_CATEGORY[piece.type] === 'king' && Math.abs(move.col - fromCol) === 2) {
      const rookFromCol = move.col > fromCol ? 7 : 0;
      const rookToCol = move.col > fromCol ? move.col - 1 : move.col + 1;
      const rook = this.board[fromRow][rookFromCol];
      if (rook) { this.board[fromRow][rookFromCol] = null; this.board[fromRow][rookToCol] = rook; rook.hasMoved = true; }
    }

    // Special abilities on capture
    if (captured) {
      if (piece.type === PT.BANKER && PIECE_CATEGORY[captured.type] === 'pawn') this.handleBankerGolden(piece);
      if (piece.type === PT.HORDE_MOTHER) this.spawnHordeling(piece, captured);
      if (piece.type === PT.FISSION_REACTOR && piece.killCount >= 5) this.handleFissionExplosion(move.row, move.col, piece);
    }

    // Electro knight
    if (piece.type === PT.ELECTRO_KNIGHT) {
      piece.consecutiveMoves++;
      const threshold = RelicSystem.getElectroChargeThreshold();
      if (piece.consecutiveMoves >= threshold) piece.charged = true;
      if (piece.charged && captured) {
        this.handleElectrocution(move.row, move.col, piece);
        piece.charged = false; piece.consecutiveMoves = 0;
      }
    }

    this.state.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: move.row, col: move.col }, piece };
    this.state.lastMovedPieceId = piece.id;
    if (piece.type === PT.FISH) piece.movedLastTurn = true;

    // Hero pawn check promotion
    if (piece.type === PT.HERO_PAWN) {
      const oppTeam = getOpponent(piece.team);
      if (PieceMoves.isInCheck(oppTeam, this.board, this.state)) {
        this.addLog('Hero Pawn checks the king — promotes!', 'important');
        Renderer.spawnPromotionEffect(move.row, move.col);
        Music.playSFX('promote');
        this.handlePromotion(move.row, move.col, piece); return;
      }
    }

    // Dancer check bonus
    if (piece.type === PT.DANCER) {
      const oppTeam = getOpponent(piece.team);
      if (PieceMoves.isInCheck(oppTeam, this.board, this.state)) {
        this.state.dancerBonusTurn = true;
        this.state.dancerBonusTeam = piece.team;
        this.state.dancerMovesLeft = RelicSystem.getDancerBonusMoves();
        this.addLog('Dancer checks the king! Extra moves incoming!', 'important');
        Music.playSFX('check');
      }
    }

    // Check sound
    const oppTeam = getOpponent(piece.team);
    if (PieceMoves.isInCheck(oppTeam, this.board, this.state)) {
      Music.playSFX('check');
    }

    // Promotion
    if (isPromotion(piece, move.row, this.state)) {
      if (piece.type === PT.GOLDEN_PAWN) {
        this.addLog('GOLDEN PAWN PROMOTES — VICTORY!', 'important');
        Music.playSFX('promote');
        this.state.gameOver = true; this.state.winner = piece.team; this.state.winReason = 'Golden Pawn promotion!';
        Renderer.spawnExplosionEffect(move.row, move.col);
        setTimeout(() => this.showGameOver(), 1200); return;
      }
      this.handlePromotion(move.row, move.col, piece); return;
    }

    this.processWarAutomators();
    this.processBladeRunnerMarks();
    this.processIcicleEffects();
    this.endTurn();
  },

  // ── Gold on capture ────────────────────────────
  _onCapture(attacker, captured) {
    attacker.killCount = (attacker.killCount || 0) + 1;
    let gold = 0;
    // Blood money: any capture
    gold += RelicSystem.applyOnCapture(attacker, captured, this.board, this.state);
    // Base: special piece capture
    if (PIECE_CATEGORY[captured.type] !== undefined) {
      const isSpecial = captured.type !== PT.PAWN && captured.type !== PT.ROOK &&
        captured.type !== PT.BISHOP && captured.type !== PT.KNIGHT &&
        captured.type !== PT.QUEEN && captured.type !== PT.KING;
      if (isSpecial) gold += GOLD.CAPTURE_REWARD;
    }
    if (gold > 0) {
      GoldSystem.earn(gold, 'capture');
      this.state.battleGoldEarned = (this.state.battleGoldEarned || 0) + gold;
    }
    // Unlock codex
    Codex.unlock(captured.type);
  },

  // ============ SPECIAL EFFECTS ============
  handleSumoPush(piece, fromRow, fromCol, move) {
    const target = this.board[move.pushTarget.row][move.pushTarget.col];
    if (!target) return;
    const dRow = move.pushTarget.row - fromRow;
    const dCol = move.pushTarget.col - fromCol;
    const pushRow = move.pushTarget.row + Math.sign(dRow);
    const pushCol = move.pushTarget.col + Math.sign(dCol);
    this.board[fromRow][fromCol] = null;
    this.board[move.row][move.col] = piece; piece.hasMoved = true;
    if (pushRow >= 0 && pushRow < 8 && pushCol >= 0 && pushCol < 8 && !this.board[pushRow][pushCol]) {
      this.board[move.pushTarget.row][move.pushTarget.col] = null;
      this.board[pushRow][pushCol] = target;
      this.addLog(`Sumo Rook pushes ${PIECE_INFO[target.type]?.name}!`);
    } else {
      const captured = removePiece(this.board, move.pushTarget.row, move.pushTarget.col, this.state);
      if (captured) { Renderer.spawnCaptureEffect(move.pushTarget.row, move.pushTarget.col, '#a84'); this._onCapture(piece, captured); this.addLog(`Sumo Rook crushes ${PIECE_INFO[captured.type]?.name}!`); }
    }
    this.state.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: move.row, col: move.col }, piece };
  },

  handleGunslingerDuel(piece, fromRow, fromCol, move) {
    const target = this.board[move.duelTarget.row][move.duelTarget.col];
    if (target) {
      removePiece(this.board, move.duelTarget.row, move.duelTarget.col, this.state);
      removePiece(this.board, fromRow, fromCol, this.state);
      Renderer.spawnExplosionEffect(fromRow, fromCol);
      Renderer.spawnExplosionEffect(move.duelTarget.row, move.duelTarget.col);
      Music.playSFX('explode');
      this.addLog(`Gunslinger duel — both destroyed!`, 'danger');
    }
  },

  handlePilgrimResurrect(piece, fromRow, fromCol, move) {
    const team = piece.team;
    const captured = this.state.capturedPieces[team === TEAM.WHITE ? 'white' : 'black'];
    if (captured.length > 0) {
      const sorted = [...captured].sort((a, b) => (ChessAI.pieceValues[b.type] || 100) - (ChessAI.pieceValues[a.type] || 100));
      const toResurrect = sorted[0];
      const backRank = team === TEAM.WHITE ? 7 : 0;
      for (let c = 0; c < 8; c++) {
        if (!this.board[backRank][c]) {
          const newPiece = createPiece(toResurrect.type, team);
          this.board[backRank][c] = newPiece;
          captured.splice(captured.indexOf(toResurrect), 1);
          Renderer.spawnPromotionEffect(backRank, c);
          Music.playSFX('promote');
          this.addLog(`Pilgrim resurrects ${PIECE_INFO[toResurrect.type]?.name}!`, 'important'); break;
        }
      }
    }
  },

  handleBankerGolden(bankerPiece) {
    const team = bankerPiece.team;
    const pawns = findAllPieces(this.board, p => p.team === team && p.type === PT.PAWN);
    if (pawns.length > 0) {
      const target = pawns[Math.floor(Math.random() * pawns.length)];
      target.piece.type = PT.GOLDEN_PAWN;
      Renderer.spawnPromotionEffect(target.row, target.col);
      this.addLog('Banker creates a Golden Pawn!', 'important');
    }
  },

  spawnHordeling(motherPiece, captured) {
    const team = motherPiece.team;
    const count = RelicSystem.getHordeSpawnCount();
    for (let i = 0; i < count; i++) {
      const startRow = team === TEAM.WHITE ? 5 : 2;
      for (let r = startRow; r >= 0 && r < 8; r += (team === TEAM.WHITE ? -1 : 1)) {
        for (let c = 0; c < 8; c++) {
          if (!this.board[r][c]) {
            const hordeling = createPiece(PT.HORDELING, team);
            hordeling.parentId = motherPiece.id;
            motherPiece.hordelings.push(hordeling.id);
            this.board[r][c] = hordeling;
            this.addLog('Horde Mother spawns a Hordeling!');
            break;
          }
        }
      }
    }
  },

  handleFissionExplosion(row, col, piece) {
    this.addLog('FISSION REACTOR EXPLODES!', 'danger');
    Renderer.spawnExplosionEffect(row, col);
    Music.playSFX('explode');
    const enemyTeam = getOpponent(piece.team);
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr, dc]) => {
      const nr = row + dr; const nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = this.board[nr][nc];
        if (target && target.team === enemyTeam) {
          removePiece(this.board, nr, nc, this.state);
          Renderer.spawnExplosionEffect(nr, nc);
          this.addLog(`Explosion destroys ${PIECE_INFO[target.type]?.name}!`, 'danger');
        }
      }
    });
    removePiece(this.board, row, col, this.state);
  },

  handleElectrocution(row, col, piece) {
    const enemyTeam = getOpponent(piece.team);
    const targets = [];
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
      const nr = row + dr; const nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const t = this.board[nr][nc];
        if (t && t.team === enemyTeam && t.type !== PT.IRON_PAWN) targets.push({ row: nr, col: nc });
      }
    });
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const zapped = removePiece(this.board, target.row, target.col, this.state);
      if (zapped) { Renderer.spawnCaptureEffect(target.row, target.col, '#ff0'); Music.playSFX('electric'); this.addLog(`Electro Knight zaps ${PIECE_INFO[zapped.type]?.name}!`, 'important'); }
    }
  },

  // ============ PROMOTION ============
  handlePromotion(row, col, piece) {
    if (piece.team === TEAM.WHITE) {
      this.state.promotionPending = { row, col };
      this.showPromotionModal(piece.team);
    } else {
      piece.type = PT.QUEEN;
      this.addLog('Pawn promotes to Queen!', 'important');
      Renderer.spawnPromotionEffect(row, col);
      this.processWarAutomators(); this.processBladeRunnerMarks(); this.endTurn();
    }
  },

  showPromotionModal(team) {
    const modal = document.getElementById('promotion-modal');
    modal.classList.add('active');
    const container = document.getElementById('promotion-pieces');
    container.innerHTML = '';
    [PT.QUEEN, PT.ROOK, PT.BISHOP, PT.KNIGHT].forEach(type => {
      const div = document.createElement('div');
      div.className = 'promo-piece';
      const canvas = document.createElement('canvas');
      Renderer.drawPieceCanvas(canvas, type, team, 48);
      div.appendChild(canvas);
      div.addEventListener('click', () => {
        modal.classList.remove('active');
        const pos = this.state.promotionPending;
        const piece = this.board[pos.row][pos.col];
        piece.type = type; this.state.promotionPending = null;
        this.addLog(`Pawn promotes to ${PIECE_INFO[type]?.name}!`, 'important');
        Renderer.spawnPromotionEffect(pos.row, pos.col);
        Music.playSFX('promote');
        this.processWarAutomators(); this.processBladeRunnerMarks(); this.endTurn();
      });
      container.appendChild(div);
    });
  },

  // ============ PERIODIC EFFECTS ============
  processWarAutomators() {
    const queue = [...this.state.warAutomatorQueue];
    this.state.warAutomatorQueue = [];
    const dist = RelicSystem.getWarAutomatorDistance();
    queue.forEach(pos => {
      let p = this.board[pos.row][pos.col];
      if (!p || p.type !== PT.WAR_AUTOMATOR) return;
      const dir = p.team === TEAM.WHITE ? -1 : 1;
      for (let step = 0; step < dist; step++) {
        const currentRow = pos.row + dir * step;
        const newRow = currentRow + dir;
        if (newRow < 0 || newRow >= 8 || this.board[newRow][pos.col]) break;
        this.board[currentRow][pos.col] = null;
        this.board[newRow][pos.col] = p;
      }
    });
  },

  processBladeRunnerMarks() {
    const currentTurn = this.state.turn;
    const toRemove = [];
    this.state.bladeRunnerMarks.forEach((mark, i) => {
      if (currentTurn > mark.turn) {
        const target = this.board[mark.row][mark.col];
        if (target && target.type !== PT.IRON_PAWN) {
          const captured = removePiece(this.board, mark.row, mark.col, this.state);
          if (captured) { Renderer.spawnCaptureEffect(mark.row, mark.col, '#f44'); this.addLog(`${PIECE_INFO[captured.type]?.name} falls to Blade Runner's mark!`, 'danger'); }
        }
        toRemove.push(i);
      }
    });
    for (let i = toRemove.length - 1; i >= 0; i--) this.state.bladeRunnerMarks.splice(toRemove[i], 1);
  },

  processIcicleEffects() {
    const threshold = RelicSystem.getIcicleFreezeThreshold();
    findAllPieces(this.board, p => p.type === PT.ICICLE).forEach(({ piece: icicle, row, col }) => {
      const enemyTeam = getOpponent(icicle.team);
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
        const nr = row + dr; const nc = col + dc;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) return;
        const target = this.board[nr][nc];
        if (!target || target.team !== enemyTeam) { delete icicle.adjacentTurns[nr + ',' + nc]; return; }
        const key = nr + ',' + nc;
        icicle.adjacentTurns[key] = (icicle.adjacentTurns[key] || 0) + 1;
        if (icicle.adjacentTurns[key] >= threshold && !target.frozen) {
          target.frozen = true;
          Renderer.spawnFreezeEffect(nr, nc);
          Music.playSFX('freeze');
          this.addLog(`${PIECE_INFO[target.type]?.name} is FROZEN!`, 'important');
        }
      });
    });
  },

  // ============ TURN MANAGEMENT ============
  endTurn() {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) continue;
        if (p.type === PT.FISH && p.id !== this.state.lastMovedPieceId) p.movedLastTurn = false;
        if (p.type === PT.ELECTRO_KNIGHT && p.id !== this.state.lastMovedPieceId) { p.consecutiveMoves = 0; p.charged = false; }
      }
    }

    // Dancer bonus turns
    if (this.state.dancerBonusTurn && this.state.dancerBonusTeam === this.state.currentTeam) {
      this.state.dancerMovesLeft = (this.state.dancerMovesLeft || 1) - 1;
      if (this.state.dancerMovesLeft <= 0) {
        this.state.dancerBonusTurn = false; this.state.dancerBonusTeam = null;
      } else {
        this.addLog('Dancer — bonus move!', 'important');
        this.updateUI(); this.checkGameEnd(); return;
      }
    }

    this.state.currentTeam = getOpponent(this.state.currentTeam);
    if (this.state.currentTeam === TEAM.WHITE) this.state.turn++;

    updateAristocratStatus(this.board, this.state);
    this.updateUI();
    this.checkGameEnd();

    if (!this.state.gameOver && this.state.currentTeam === TEAM.BLACK) {
      setTimeout(() => this.doAITurn(), 400);
    }
  },

  // ============ AI TURN ============
  doAITurn() {
    if (this.state.gameOver) return;
    const difficulty = Draft.state.enemyDifficulty - (RelicSystem.has('tacticians_manual') ? 1 : 0);
    const move = ChessAI.getBestMove(this.board, this.state, TEAM.BLACK, Math.max(1, difficulty));
    if (!move) {
      if (PieceMoves.isInCheck(TEAM.BLACK, this.board, this.state)) {
        this.state.gameOver = true; this.state.winner = TEAM.WHITE; this.state.winReason = 'Checkmate!';
      } else {
        this.state.gameOver = true; this.state.winner = null; this.state.winReason = 'Stalemate!';
      }
      this.showGameOver(); return;
    }
    this.executeMove(move.from.row, move.from.col, move.to);
  },

  // ============ CHECK GAME END ============
  checkGameEnd() {
    if (this.state.gameOver) return;
    const team = this.state.currentTeam;
    let hasLegalMoves = false;
    outer: for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p || p.team !== team || p.dissipated) continue;
        const moves = PieceMoves.getMoves(p, r, c, this.board, this.state);
        const legal = PieceMoves.filterLegalMoves(p, r, c, moves, this.board, this.state);
        if (legal.length > 0) { hasLegalMoves = true; break outer; }
      }
    }
    if (!hasLegalMoves) {
      if (PieceMoves.isInCheck(team, this.board, this.state)) {
        this.state.gameOver = true; this.state.winner = getOpponent(team); this.state.winReason = 'Checkmate!';
      } else {
        this.state.gameOver = true; this.state.winner = null; this.state.winReason = 'Stalemate!';
      }
      setTimeout(() => this.showGameOver(), 600); return;
    }
    const whiteKing = PieceMoves.findKing(TEAM.WHITE, this.board);
    const blackKing = PieceMoves.findKing(TEAM.BLACK, this.board);
    if (!whiteKing) { this.state.gameOver = true; this.state.winner = TEAM.BLACK; this.state.winReason = 'White king destroyed!'; setTimeout(() => this.showGameOver(), 600); }
    else if (!blackKing) { this.state.gameOver = true; this.state.winner = TEAM.WHITE; this.state.winReason = 'Black king destroyed!'; setTimeout(() => this.showGameOver(), 600); }
  },

  // ============ GAME OVER ============
  showGameOver() {
    const won = this.state.winner === TEAM.WHITE;
    const lost = this.state.winner === TEAM.BLACK;

    const resultEl = document.getElementById('gameover-result');
    const detailsEl = document.getElementById('gameover-details');
    const statsEl = document.getElementById('gameover-stats');

    if (won) {
      resultEl.textContent = 'VICTORY!'; resultEl.className = 'win';
      Music.play('victory');
      Draft.winRound();
    } else if (lost) {
      resultEl.textContent = 'DEFEAT'; resultEl.className = 'lose';
      Music.play('defeat');
      const prevented = RelicSystem.tryResurrection();
      if (prevented) {
        this.addLog('Resurrection Stone activates — life spared!', 'important');
        Draft.state.lives = Math.max(Draft.state.lives, 1);
      } else {
        Draft.loseRound();
      }
    } else {
      resultEl.textContent = 'DRAW'; resultEl.className = 'draw';
    }

    detailsEl.textContent = this.state.winReason;

    // Stats
    statsEl.innerHTML = `
      <div class="gameover-stat"><div class="gameover-stat-val">${Draft.state.round}</div><div>ROUND</div></div>
      <div class="gameover-stat"><div class="gameover-stat-val">${Draft.state.wins}</div><div>WINS</div></div>
      <div class="gameover-stat"><div class="gameover-stat-val">${GoldSystem.gold}g</div><div>GOLD</div></div>
      <div class="gameover-stat"><div class="gameover-stat-val">${RelicSystem.owned.length}</div><div>RELICS</div></div>
      <div class="gameover-stat"><div class="gameover-stat-val">${this.state.turn}</div><div>TURNS</div></div>
    `;

    this.showScreen('gameover');

    const continueBtn = document.getElementById('gameover-continue');
    if (won) {
      continueBtn.textContent = 'GO TO SHOP'; continueBtn.style.display = 'block';
    } else if (!Draft.isGameOver()) {
      continueBtn.textContent = 'CONTINUE RUN'; continueBtn.style.display = 'block';
    } else {
      continueBtn.style.display = 'none';
    }
  },

  // ============ UI UPDATES ============
  updateUI() {
    const turnEl = document.getElementById('turn-indicator');
    turnEl.className = this.state.currentTeam === TEAM.WHITE ? 'white-turn' : 'black-turn';
    turnEl.textContent = this.state.currentTeam === TEAM.WHITE ? 'YOUR TURN' : 'ENEMY TURN...';
    GoldSystem.updateDisplay();
    this.updateCapturedDisplay();
  },

  updateCapturedDisplay() {
    ['white', 'black'].forEach(team => {
      const row = document.getElementById('captured-' + team);
      if (!row) return;
      row.innerHTML = '';
      this.state.capturedPieces[team].forEach(p => {
        const canvas = document.createElement('canvas');
        Renderer.drawPieceCanvas(canvas, p.type, p.team, 18);
        row.appendChild(canvas);
      });
    });
  },

  updatePieceInfo(piece) {
    const nameEl = document.querySelector('#piece-info-panel .info-name');
    const typeEl = document.querySelector('#piece-info-panel .info-type');
    const descEl = document.querySelector('#piece-info-panel .info-desc');
    const statsEl = document.querySelector('#piece-info-panel .info-stats');
    if (!piece) { descEl.textContent = 'Click a piece to see info'; return; }
    const info = PIECE_INFO[piece.type];
    nameEl.textContent = info?.name || piece.type;
    typeEl.textContent = (PIECE_CATEGORY[piece.type] || '').toUpperCase();
    descEl.textContent = info?.desc || '';
    const stats = [];
    if (piece.killCount) stats.push('Kills: ' + piece.killCount);
    if (piece.totalMoved) stats.push('Dist: ' + piece.totalMoved + '/' + RelicSystem.getPilgrimThreshold());
    if (piece.charged) stats.push('CHARGED!');
    if (piece.frozen) stats.push('FROZEN');
    if (piece.consecutiveMoves) stats.push('Combo: ' + piece.consecutiveMoves + '/' + RelicSystem.getElectroChargeThreshold());
    statsEl.textContent = stats.join(' | ');
  },

  addLog(text, type) {
    const log = document.getElementById('game-log');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry' + (type ? ' ' + type : '');
    entry.textContent = `[${this.state?.turn || 0}] ${text}`;
    log.insertBefore(entry, log.firstChild);
    while (log.children.length > 60) log.removeChild(log.lastChild);
  },

  handleBoardHover(canvasX, canvasY) {
    const col = Math.floor(canvasX / TILE_SIZE);
    const row = Math.floor(canvasY / TILE_SIZE);
    if (row < 0 || row > 7 || col < 0 || col > 7) return;
    const piece = this.board ? this.board[row][col] : null;
    if (piece) this.updatePieceInfo(piece);
  },
};
