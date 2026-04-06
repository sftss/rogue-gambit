// ==================== AI OPPONENT ====================

const ChessAI = {
  // Piece values for evaluation
  pieceValues: {
    [PT.PAWN]: 100, [PT.KNIGHT]: 320, [PT.BISHOP]: 330,
    [PT.ROOK]: 500, [PT.QUEEN]: 900, [PT.KING]: 20000,
    [PT.BLUEPRINT]: 100, [PT.EPEE_PAWN]: 130, [PT.GOLDEN_PAWN]: 500,
    [PT.HERO_PAWN]: 200, [PT.IRON_PAWN]: 150, [PT.KNIFE_PAWN]: 130,
    [PT.WAR_AUTOMATOR]: 120, [PT.WARP_JUMPER]: 120, [PT.HORDELING]: 60,
    [PT.PHASE_ROOK]: 520, [PT.SUMO_ROOK]: 510,
    [PT.ARISTOCRAT]: 400, [PT.BASILISK]: 380, [PT.BLADE_RUNNER]: 360,
    [PT.BOUNCER]: 360, [PT.CARDINAL]: 350, [PT.DANCER]: 370,
    [PT.DJINN]: 340, [PT.GUNSLINGER]: 330, [PT.HORDE_MOTHER]: 400,
    [PT.ICICLE]: 350, [PT.MARAUDER]: 300, [PT.PILGRIM]: 350,
    [PT.ANTI_VIOLENCE]: 300, [PT.BANKER]: 350, [PT.CAMEL]: 310,
    [PT.ELECTRO_KNIGHT]: 350, [PT.FISH]: 330, [PT.PINATA]: 320,
    [PT.KNIGHTMARE]: 340,
    [PT.FISSION_REACTOR]: 950,
    [PT.ROCKETMAN]: 20000,
  },

  // Position bonus tables (for center control)
  pawnTable: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0],
  ],

  centerBonus: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ],

  evaluate(board, gameState, aiTeam) {
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece || piece.dissipated) continue;

        const val = this.pieceValues[piece.type] || 100;
        const sign = piece.team === aiTeam ? 1 : -1;

        // Material
        score += sign * val;

        // Position
        const cat = PIECE_CATEGORY[piece.type];
        if (cat === 'pawn') {
          const pr = piece.team === TEAM.WHITE ? r : 7 - r;
          score += sign * this.pawnTable[pr][c];
        } else {
          score += sign * this.centerBonus[r][c] * 0.5;
        }

        // Special bonuses
        if (piece.type === PT.MARAUDER) score += sign * piece.killCount * 50;
        if (piece.type === PT.PILGRIM) score += sign * Math.min(piece.totalMoved, 20) * 5;
        if (piece.type === PT.ELECTRO_KNIGHT && piece.charged) score += sign * 50;
        if (piece.type === PT.GOLDEN_PAWN) {
          // Bonus for being close to promotion
          const promoRow = piece.team === TEAM.WHITE ? 0 : 7;
          const dist = Math.abs(r - promoRow);
          score += sign * (7 - dist) * 80;
        }
      }
    }

    // Check bonus
    const opponent = getOpponent(aiTeam);
    if (PieceMoves.isInCheck(opponent, board, gameState)) score += 30;
    if (PieceMoves.isInCheck(aiTeam, board, gameState)) score -= 30;

    return score;
  },

  getAllMoves(board, gameState, team) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece || piece.team !== team || piece.dissipated) continue;

        const pieceMoves = PieceMoves.getMoves(piece, r, c, board, gameState);
        const legal = PieceMoves.filterLegalMoves(piece, r, c, pieceMoves, board, gameState);

        legal.forEach(m => {
          moves.push({ from: { row: r, col: c }, to: m, piece });
        });
      }
    }
    return moves;
  },

  // Minimax with alpha-beta pruning
  minimax(board, gameState, depth, alpha, beta, maximizing, aiTeam) {
    if (depth === 0) {
      return { score: this.evaluate(board, gameState, aiTeam) };
    }

    const team = maximizing ? aiTeam : getOpponent(aiTeam);
    const moves = this.getAllMoves(board, gameState, team);

    if (moves.length === 0) {
      // Checkmate or stalemate
      if (PieceMoves.isInCheck(team, board, gameState)) {
        return { score: maximizing ? -99999 + (3 - depth) : 99999 - (3 - depth) };
      }
      return { score: 0 }; // Stalemate
    }

    // Order moves: captures first, then center moves
    moves.sort((a, b) => {
      const aCapture = board[a.to.row][a.to.col] ? 1 : 0;
      const bCapture = board[b.to.row][b.to.col] ? 1 : 0;
      return bCapture - aCapture;
    });

    let bestMove = moves[0];

    if (maximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const sim = this.simulateMove(board, gameState, move);
        const result = this.minimax(sim.board, sim.state, depth - 1, alpha, beta, false, aiTeam);

        if (result.score > maxScore) {
          maxScore = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, maxScore);
        if (beta <= alpha) break;
      }
      return { score: maxScore, move: bestMove };
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const sim = this.simulateMove(board, gameState, move);
        const result = this.minimax(sim.board, sim.state, depth - 1, alpha, beta, true, aiTeam);

        if (result.score < minScore) {
          minScore = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, minScore);
        if (beta <= alpha) break;
      }
      return { score: minScore, move: bestMove };
    }
  },

  simulateMove(board, gameState, move) {
    const newBoard = cloneBoard(board);
    const newState = {
      ...gameState,
      capturedPieces: {
        white: [...gameState.capturedPieces.white],
        black: [...gameState.capturedPieces.black],
      },
      bladeRunnerMarks: [...gameState.bladeRunnerMarks],
      dissipatedDjinns: [...gameState.dissipatedDjinns],
      warAutomatorQueue: [],
    };

    const fromPiece = newBoard[move.from.row][move.from.col];
    const toPiece = newBoard[move.to.row][move.to.col];

    // Simple move simulation (doesn't handle all special effects for perf)
    if (toPiece && toPiece.team !== fromPiece.team && toPiece.type !== PT.IRON_PAWN) {
      const capBy = toPiece.team === TEAM.WHITE ? 'black' : 'white';
      newState.capturedPieces[capBy].push(toPiece);
    }

    newBoard[move.to.row][move.to.col] = fromPiece;
    newBoard[move.from.row][move.from.col] = null;

    return { board: newBoard, state: newState };
  },

  getBestMove(board, gameState, aiTeam, difficulty) {
    // difficulty: 1 = easy (depth 1), 2 = medium (depth 2), 3 = hard (depth 3)
    const depth = Math.min(difficulty || 2, 3);

    const result = this.minimax(board, gameState, depth, -Infinity, Infinity, true, aiTeam);

    // Add some randomness for easy difficulty
    if (difficulty === 1 && Math.random() < 0.3) {
      const allMoves = this.getAllMoves(board, gameState, aiTeam);
      if (allMoves.length > 0) {
        return allMoves[Math.floor(Math.random() * allMoves.length)];
      }
    }

    return result.move;
  },

  // Choose promotion piece for AI
  choosePromotionPiece(board, gameState, aiTeam) {
    // Usually queen, but sometimes knight for forks
    return PT.QUEEN;
  },
};
