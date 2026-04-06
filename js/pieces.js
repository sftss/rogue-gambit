// ==================== PIECE MOVEMENT ENGINE ====================
// Core movement logic and special abilities for all piece types.
// Depends on constants.js (PT, TEAM, BOARD_SIZE, PIECE_CATEGORY)

const PieceMoves = {

  // ───────────── PUBLIC API ─────────────

  /**
   * Returns all legal moves for a piece at (row, col).
   * Each move: { row, col, type } where type is 'move', 'capture', 'special', or 'unfreeze'.
   */
  getMoves(piece, row, col, board, gameState) {
    if (!piece) return [];

    // Frozen pieces can only unfreeze
    if (piece.frozen) {
      return [{ row, col, type: 'unfreeze' }];
    }

    // Check basilisk paralysis: if this piece is on a square threatened by an enemy basilisk, it cannot move
    if (this._isParalyzed(piece, row, col, board)) {
      return [];
    }

    let moves = this._getRawMoves(piece, row, col, board, gameState);

    // Apply anti-violence aura: if an enemy anti_violence knight is adjacent, remove all capture moves
    if (this._isUnderAntiViolenceAura(piece, row, col, board)) {
      moves = moves.filter(m => m.type !== 'capture');
    }

    // Filter out moves that capture iron pawns
    moves = moves.filter(m => {
      if (m.type === 'capture') {
        const target = board[m.row][m.col];
        if (target && target.type === PT.IRON_PAWN) return false;
      }
      return true;
    });

    // Filter out illegal moves (those that leave own king in check)
    moves = this.filterLegalMoves(piece, row, col, moves, board, gameState);

    return moves;
  },

  /**
   * Get raw (unfiltered) moves for a piece - dispatches to type-specific handler.
   */
  _getRawMoves(piece, row, col, board, gameState) {
    const type = piece.type;
    switch (type) {
      // Standard
      case PT.PAWN:          return this._pawnMoves(piece, row, col, board, gameState);
      case PT.ROOK:          return this._rookMoves(piece, row, col, board, gameState);
      case PT.BISHOP:        return this._bishopMoves(piece, row, col, board, gameState);
      case PT.KNIGHT:        return this._knightMoves(piece, row, col, board, gameState);
      case PT.QUEEN:         return this._queenMoves(piece, row, col, board, gameState);
      case PT.KING:          return this._kingMoves(piece, row, col, board, gameState);
      // Special Pawns
      case PT.BLUEPRINT:     return this._blueprintMoves(piece, row, col, board, gameState);
      case PT.EPEE_PAWN:     return this._epeePawnMoves(piece, row, col, board, gameState);
      case PT.GOLDEN_PAWN:   return this._pawnMoves(piece, row, col, board, gameState);
      case PT.HERO_PAWN:     return this._pawnMoves(piece, row, col, board, gameState);
      case PT.IRON_PAWN:     return this._ironPawnMoves(piece, row, col, board, gameState);
      case PT.KNIFE_PAWN:    return this._knifePawnMoves(piece, row, col, board, gameState);
      case PT.WAR_AUTOMATOR: return this._pawnMoves(piece, row, col, board, gameState);
      case PT.WARP_JUMPER:   return this._warpJumperMoves(piece, row, col, board, gameState);
      case PT.HORDELING:     return this._hordelingMoves(piece, row, col, board, gameState);
      // Special Rooks
      case PT.PHASE_ROOK:    return this._phaseRookMoves(piece, row, col, board, gameState);
      case PT.SUMO_ROOK:     return this._sumoRookMoves(piece, row, col, board, gameState);
      // Special Bishops
      case PT.ARISTOCRAT:    return this._bishopMoves(piece, row, col, board, gameState);
      case PT.BASILISK:      return this._basiliskMoves(piece, row, col, board, gameState);
      case PT.BLADE_RUNNER:  return this._bladeRunnerMoves(piece, row, col, board, gameState);
      case PT.BOUNCER:       return this._bouncerMoves(piece, row, col, board, gameState);
      case PT.CARDINAL:      return this._cardinalMoves(piece, row, col, board, gameState);
      case PT.DANCER:        return this._bishopMoves(piece, row, col, board, gameState);
      case PT.DJINN:         return this._djinnMoves(piece, row, col, board, gameState);
      case PT.GUNSLINGER:    return this._gunslingerMoves(piece, row, col, board, gameState);
      case PT.HORDE_MOTHER:  return this._bishopMoves(piece, row, col, board, gameState);
      case PT.ICICLE:        return this._icicleMoves(piece, row, col, board, gameState);
      case PT.MARAUDER:      return this._marauderMoves(piece, row, col, board, gameState);
      case PT.PILGRIM:       return this._pilgrimMoves(piece, row, col, board, gameState);
      // Special Knights
      case PT.ANTI_VIOLENCE: return this._antiViolenceMoves(piece, row, col, board, gameState);
      case PT.BANKER:        return this._knightMoves(piece, row, col, board, gameState);
      case PT.CAMEL:         return this._camelMoves(piece, row, col, board, gameState);
      case PT.ELECTRO_KNIGHT:return this._knightMoves(piece, row, col, board, gameState);
      case PT.FISH:          return this._fishMoves(piece, row, col, board, gameState);
      case PT.PINATA:        return this._knightMoves(piece, row, col, board, gameState);
      case PT.KNIGHTMARE:    return this._knightmareMoves(piece, row, col, board, gameState);
      // Special Queens
      case PT.FISSION_REACTOR: return this._queenMoves(piece, row, col, board, gameState);
      // Special Kings
      case PT.ROCKETMAN:     return this._rocketmanMoves(piece, row, col, board, gameState);
      default:               return [];
    }
  },

  // ───────────── STANDARD PIECE MOVES ─────────────

  _pawnMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dir = piece.team === TEAM.WHITE ? -1 : 1;
    const startRow = piece.team === TEAM.WHITE ? 6 : 1;

    // Forward 1
    const f1 = row + dir;
    if (this._inBounds(f1, col) && !board[f1][col]) {
      moves.push({ row: f1, col, type: 'move' });

      // Forward 2 from start
      if (row === startRow) {
        const f2 = row + dir * 2;
        if (this._inBounds(f2, col) && !board[f2][col]) {
          moves.push({ row: f2, col, type: 'move' });
        }
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const nr = row + dir;
      const nc = col + dc;
      if (!this._inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (target && target.team !== piece.team) {
        moves.push({ row: nr, col: nc, type: 'capture' });
      }
    }

    // En passant
    if (gameState && gameState.enPassantTarget) {
      const ep = gameState.enPassantTarget;
      if (ep.row === row + dir && Math.abs(ep.col - col) === 1) {
        moves.push({ row: ep.row, col: ep.col, type: 'capture' });
      }
    }

    return moves;
  },

  _rookMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      moves.push(...this._slide(row, col, dr, dc, board, piece.team));
    }
    return moves;
  },

  _bishopMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      moves.push(...this._slide(row, col, dr, dc, board, piece.team));
    }
    return moves;
  },

  _knightMoves(piece, row, col, board, gameState) {
    const moves = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of offsets) {
      const nr = row + dr;
      const nc = col + dc;
      if (!this._inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (!target) {
        moves.push({ row: nr, col: nc, type: 'move' });
      } else if (target.team !== piece.team) {
        moves.push({ row: nr, col: nc, type: 'capture' });
      }
    }
    return moves;
  },

  _queenMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      moves.push(...this._slide(row, col, dr, dc, board, piece.team));
    }
    return moves;
  },

  _kingMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (!this._inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (!target) {
        moves.push({ row: nr, col: nc, type: 'move' });
      } else if (target.team !== piece.team) {
        moves.push({ row: nr, col: nc, type: 'capture' });
      }
    }

    // Castling
    this._addCastlingMoves(piece, row, col, board, gameState, moves);

    return moves;
  },

  _addCastlingMoves(piece, row, col, board, gameState, moves) {
    if (piece.hasMoved) return;
    if (this.isInCheck(piece.team, board, gameState)) return;

    const baseRow = piece.team === TEAM.WHITE ? 7 : 0;
    if (row !== baseRow) return;

    // Kingside: king at col 4 -> col 6, rook at col 7 -> col 5
    const kRook = board[baseRow][7];
    if (kRook && PIECE_CATEGORY[kRook.type] === 'rook' && kRook.team === piece.team && !kRook.hasMoved) {
      if (!board[baseRow][5] && !board[baseRow][6]) {
        // King must not pass through check
        if (!this.isSquareAttacked(baseRow, 5, piece.team === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE, board, gameState) &&
            !this.isSquareAttacked(baseRow, 6, piece.team === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE, board, gameState)) {
          moves.push({ row: baseRow, col: 6, type: 'special', castling: 'kingside' });
        }
      }
    }

    // Queenside: king at col 4 -> col 2, rook at col 0 -> col 3
    const qRook = board[baseRow][0];
    if (qRook && PIECE_CATEGORY[qRook.type] === 'rook' && qRook.team === piece.team && !qRook.hasMoved) {
      if (!board[baseRow][1] && !board[baseRow][2] && !board[baseRow][3]) {
        if (!this.isSquareAttacked(baseRow, 2, piece.team === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE, board, gameState) &&
            !this.isSquareAttacked(baseRow, 3, piece.team === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE, board, gameState)) {
          moves.push({ row: baseRow, col: 2, type: 'special', castling: 'queenside' });
        }
      }
    }
  },

  // ───────────── SPECIAL PAWN MOVES ─────────────

  _blueprintMoves(piece, row, col, board, gameState) {
    // If still a blueprint (not yet transformed), moves like a normal pawn
    return this._pawnMoves(piece, row, col, board, gameState);
  },

  _epeePawnMoves(piece, row, col, board, gameState) {
    const moves = this._pawnMoves(piece, row, col, board, gameState);
    const dir = piece.team === TEAM.WHITE ? -1 : 1;

    // Extended en passant: can capture any enemy pawn that moved 2 squares last turn
    if (gameState && gameState.lastMove) {
      const lm = gameState.lastMove;
      if (lm.piece && PIECE_CATEGORY[lm.piece.type] === 'pawn' && lm.piece.team !== piece.team) {
        const movedDist = Math.abs(lm.to.row - lm.from.row);
        if (movedDist === 2) {
          // The pawn is at lm.to. The epee pawn captures by moving to the square
          // behind the enemy pawn (en passant style).
          const epRow = lm.to.row + (lm.piece.team === TEAM.WHITE ? 1 : -1);
          const epCol = lm.to.col;
          if (this._inBounds(epRow, epCol) && !board[epRow][epCol]) {
            // Check if this capture isn't already in our moves
            const exists = moves.some(m => m.row === epRow && m.col === epCol);
            if (!exists) {
              moves.push({ row: epRow, col: epCol, type: 'capture', epeeEnPassant: true, captureRow: lm.to.row, captureCol: lm.to.col });
            }
          }
        }
      }
    }

    return moves;
  },

  _ironPawnMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dir = piece.team === TEAM.WHITE ? -1 : 1;
    const startRow = piece.team === TEAM.WHITE ? 6 : 1;

    // Forward 1 only (no captures, no promotion)
    const f1 = row + dir;
    if (this._inBounds(f1, col) && !board[f1][col]) {
      // Cannot promote: don't move to last rank
      const promoRow = piece.team === TEAM.WHITE ? 0 : 7;
      if (f1 !== promoRow) {
        moves.push({ row: f1, col, type: 'move' });
      }

      // Forward 2 from start
      if (row === startRow) {
        const f2 = row + dir * 2;
        if (this._inBounds(f2, col) && !board[f2][col] && f2 !== promoRow) {
          moves.push({ row: f2, col, type: 'move' });
        }
      }
    }

    return moves;
  },

  _knifePawnMoves(piece, row, col, board, gameState) {
    const moves = this._pawnMoves(piece, row, col, board, gameState);
    const dir = piece.team === TEAM.WHITE ? -1 : 1;

    // Extended diagonal capture: 2 squares diagonally toward center
    // Columns 0-3: center is to the right (+1), columns 4-7: center is to the left (-1)
    const centerDc = col <= 3 ? 1 : -1;

    const nr = row + dir * 2;
    const nc = col + centerDc * 2;
    if (this._inBounds(nr, nc)) {
      const target = board[nr][nc];
      if (target && target.team !== piece.team) {
        moves.push({ row: nr, col: nc, type: 'capture' });
      }
    }

    return moves;
  },

  _warpJumperMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dir = piece.team === TEAM.WHITE ? -1 : 1;
    const startRow = piece.team === TEAM.WHITE ? 6 : 1;

    // Forward 1: can jump over enemy pawns
    const f1 = row + dir;
    if (this._inBounds(f1, col)) {
      const blocker = board[f1][col];
      if (!blocker) {
        moves.push({ row: f1, col, type: 'move' });

        // Forward 2 from start
        if (row === startRow) {
          const f2 = row + dir * 2;
          if (this._inBounds(f2, col)) {
            const blocker2 = board[f2][col];
            if (!blocker2) {
              moves.push({ row: f2, col, type: 'move' });
            }
          }
        }
      } else if (blocker.team !== piece.team && PIECE_CATEGORY[blocker.type] === 'pawn') {
        // Can jump over enemy pawn - land on f1+dir if empty
        const jumpTo = f1 + dir;
        if (this._inBounds(jumpTo, col) && !board[jumpTo][col]) {
          moves.push({ row: jumpTo, col, type: 'move' });
        }

        // Also from start row, if first square has enemy pawn, jump over and continue
        if (row === startRow) {
          const f2 = row + dir * 2;
          if (this._inBounds(f2, col) && !board[f2][col]) {
            moves.push({ row: f2, col, type: 'move' });
          }
        }
      }
    }

    // Diagonal captures (normal pawn)
    for (const dc of [-1, 1]) {
      const nr = row + dir;
      const nc = col + dc;
      if (!this._inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (target && target.team !== piece.team) {
        moves.push({ row: nr, col: nc, type: 'capture' });
      }
    }

    // En passant
    if (gameState && gameState.enPassantTarget) {
      const ep = gameState.enPassantTarget;
      if (ep.row === row + dir && Math.abs(ep.col - col) === 1) {
        moves.push({ row: ep.row, col: ep.col, type: 'capture' });
      }
    }

    return moves;
  },

  _hordelingMoves(piece, row, col, board, gameState) {
    // Moves like a pawn but cannot promote
    const moves = [];
    const dir = piece.team === TEAM.WHITE ? -1 : 1;
    const startRow = piece.team === TEAM.WHITE ? 6 : 1;
    const promoRow = piece.team === TEAM.WHITE ? 0 : 7;

    // Forward 1
    const f1 = row + dir;
    if (this._inBounds(f1, col) && !board[f1][col] && f1 !== promoRow) {
      moves.push({ row: f1, col, type: 'move' });

      // Forward 2 from start
      if (row === startRow) {
        const f2 = row + dir * 2;
        if (this._inBounds(f2, col) && !board[f2][col] && f2 !== promoRow) {
          moves.push({ row: f2, col, type: 'move' });
        }
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const nr = row + dir;
      const nc = col + dc;
      if (!this._inBounds(nr, nc)) continue;
      if (nr === promoRow) continue; // cannot promote
      const target = board[nr][nc];
      if (target && target.team !== piece.team) {
        moves.push({ row: nr, col: nc, type: 'capture' });
      }
    }

    return moves;
  },

  // ───────────── SPECIAL ROOK MOVES ─────────────

  _phaseRookMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      moves.push(...this._phaseSlide(row, col, dr, dc, board, piece.team));
    }
    return moves;
  },

  /**
   * Phase slide: passes through allied pieces, blocked by enemies (captures first enemy).
   */
  _phaseSlide(row, col, dRow, dCol, board, team, maxDist) {
    const moves = [];
    const limit = maxDist || BOARD_SIZE;
    let r = row + dRow;
    let c = col + dCol;
    let dist = 0;
    while (this._inBounds(r, c) && dist < limit) {
      const target = board[r][c];
      if (!target) {
        moves.push({ row: r, col: c, type: 'move' });
      } else if (target.team === team) {
        // Pass through ally - continue
      } else {
        // Enemy: capture and stop
        moves.push({ row: r, col: c, type: 'capture' });
        break;
      }
      r += dRow;
      c += dCol;
      dist++;
    }
    return moves;
  },

  _sumoRookMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      while (this._inBounds(r, c)) {
        const target = board[r][c];
        if (!target) {
          moves.push({ row: r, col: c, type: 'move' });
        } else if (target.team === piece.team) {
          break; // Blocked by ally
        } else {
          // Enemy piece: try to push
          const pushR = r + dr;
          const pushC = c + dc;
          if (this._inBounds(pushR, pushC) && !board[pushR][pushC]) {
            // Can push: special move
            moves.push({ row: r, col: c, type: 'special', sumo: true, pushTo: { row: pushR, col: pushC } });
          } else {
            // Cannot push (off board or blocked): capture normally
            moves.push({ row: r, col: c, type: 'capture' });
          }
          break; // Stop sliding after encountering an enemy
        }
        r += dr;
        c += dc;
      }
    }
    return moves;
  },

  // ───────────── SPECIAL BISHOP MOVES ─────────────

  _basiliskMoves(piece, row, col, board, gameState) {
    // Normal bishop movement but CANNOT capture
    const moves = [];
    const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      while (this._inBounds(r, c)) {
        const target = board[r][c];
        if (!target) {
          moves.push({ row: r, col: c, type: 'move' });
        } else {
          // Blocked by any piece - cannot capture
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return moves;
  },

  _bladeRunnerMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      let passedThrough = [];

      while (this._inBounds(r, c)) {
        const target = board[r][c];
        if (!target) {
          if (passedThrough.length > 0) {
            // This is a valid destination after passing through enemy/enemies
            moves.push({
              row: r, col: c, type: 'special',
              bladeRunner: true,
              markedPieces: [...passedThrough]
            });
          } else {
            // Normal move (no enemies passed through yet)
            moves.push({ row: r, col: c, type: 'move' });
          }
        } else if (target.team === piece.team) {
          // Blocked by ally
          break;
        } else {
          // Enemy piece: pass through, mark for death
          passedThrough.push({ row: r, col: c });
          // Continue sliding
        }
        r += dr;
        c += dc;
      }
    }
    return moves;
  },

  _bouncerMoves(piece, row, col, board, gameState) {
    const moves = [];
    const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dr, dc] of dirs) {
      // Normal diagonal slide first
      let r = row + dr;
      let c = col + dc;
      let lastEmptyR = -1;
      let lastEmptyC = -1;
      let hitEdge = false;

      while (this._inBounds(r, c)) {
        const target = board[r][c];
        if (!target) {
          moves.push({ row: r, col: c, type: 'move' });
          lastEmptyR = r;
          lastEmptyC = c;
        } else if (target.team !== piece.team) {
          moves.push({ row: r, col: c, type: 'capture' });
          break;
        } else {
          break; // Blocked by ally
        }
        r += dr;
        c += dc;
      }

      // Bounce: when the slide would go off the board or hits the edge
      // Try to bounce from the position just past the board edge
      let bounceR = r;
      let bounceC = c;
      let newDr = dr;
      let newDc = dc;

      if (!this._inBounds(bounceR, bounceC)) {
        // Determine which edge was hit and reflect
        if (bounceR < 0 || bounceR >= BOARD_SIZE) {
          newDr = -dr; // Reflect vertical component
        }
        if (bounceC < 0 || bounceC >= BOARD_SIZE) {
          newDc = -dc; // Reflect horizontal component
        }

        // Start bounce from the last valid position on the diagonal
        let prevR = bounceR - dr;
        let prevC = bounceC - dc;
        if (this._inBounds(prevR, prevC)) {
          let br = prevR + newDr;
          let bc = prevC + newDc;

          while (this._inBounds(br, bc)) {
            // Don't revisit the origin
            if (br === row && bc === col) {
              br += newDr;
              bc += newDc;
              continue;
            }
            const target = board[br][bc];
            if (!target) {
              moves.push({ row: br, col: bc, type: 'move', bounced: true });
            } else if (target.team !== piece.team) {
              moves.push({ row: br, col: bc, type: 'capture', bounced: true });
              break;
            } else {
              break; // Blocked by ally
            }
            br += newDr;
            bc += newDc;
          }
        }
      }
    }

    return moves;
  },

  _cardinalMoves(piece, row, col, board, gameState) {
    const moves = this._bishopMoves(piece, row, col, board, gameState);

    // Can move 1 square directly backward without capturing
    const backDir = piece.team === TEAM.WHITE ? 1 : -1;
    const nr = row + backDir;
    if (this._inBounds(nr, col) && !board[nr][col]) {
      moves.push({ row: nr, col, type: 'move' });
    }

    return moves;
  },

  _djinnMoves(piece, row, col, board, gameState) {
    if (piece.dissipated) {
      // Dissipated: no moves. Reforms when any piece is captured (handled in game.js)
      return [];
    }

    // Normal bishop moves + dissipate special
    const moves = this._bishopMoves(piece, row, col, board, gameState);

    // Add dissipate option (stay in place)
    moves.push({ row, col, type: 'special', dissipate: true });

    return moves;
  },

  _gunslingerMoves(piece, row, col, board, gameState) {
    const moves = this._bishopMoves(piece, row, col, board, gameState);

    // Check for duel opportunity: if an enemy piece and this piece mutually threaten each other
    // for a full turn (tracked via adjacentTurns on the piece)
    if (piece.adjacentTurns) {
      for (const key in piece.adjacentTurns) {
        if (piece.adjacentTurns[key] >= 1) {
          const [er, ec] = key.split(',').map(Number);
          if (this._inBounds(er, ec)) {
            const target = board[er][ec];
            if (target && target.team !== piece.team) {
              // Verify mutual threat: does the target also threaten the gunslinger?
              const targetMoves = this._getRawMovesForAttack(target, er, ec, board, gameState);
              const threatensUs = targetMoves.some(m => m.row === row && m.col === col);
              if (threatensUs) {
                moves.push({ row: er, col: ec, type: 'special', duel: true });
              }
            }
          }
        }
      }
    }

    return moves;
  },

  _icicleMoves(piece, row, col, board, gameState) {
    // Normal bishop movement only - no captures
    const moves = [];
    const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      while (this._inBounds(r, c)) {
        const target = board[r][c];
        if (!target) {
          moves.push({ row: r, col: c, type: 'move' });
        } else {
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return moves;
  },

  _marauderMoves(piece, row, col, board, gameState) {
    const moves = [];
    const range = 1 + (piece.killCount || 0) * 2;
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dr, dc] of dirs) {
      for (let dist = 1; dist <= range; dist++) {
        const nr = row + dr * dist;
        const nc = col + dc * dist;
        if (!this._inBounds(nr, nc)) break;
        const target = board[nr][nc];
        if (!target) {
          moves.push({ row: nr, col: nc, type: 'move' });
        } else if (target.team !== piece.team) {
          moves.push({ row: nr, col: nc, type: 'capture' });
          break; // Blocked after capturing
        } else {
          break; // Blocked by ally
        }
      }
    }

    return moves;
  },

  _pilgrimMoves(piece, row, col, board, gameState) {
    const moves = this._bishopMoves(piece, row, col, board, gameState);

    // If totalMoved >= 20, add resurrect special move (stay in place)
    if ((piece.totalMoved || 0) >= 20) {
      // Check if there are captured allied pieces to resurrect
      if (gameState && gameState.capturedPieces) {
        const captured = gameState.capturedPieces[piece.team];
        if (captured && captured.length > 0) {
          moves.push({ row, col, type: 'special', resurrect: true });
        }
      }
    }

    return moves;
  },

  // ───────────── SPECIAL KNIGHT MOVES ─────────────

  _antiViolenceMoves(piece, row, col, board, gameState) {
    // Normal knight moves but CANNOT capture
    const moves = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of offsets) {
      const nr = row + dr;
      const nc = col + dc;
      if (!this._inBounds(nr, nc)) continue;
      if (!board[nr][nc]) {
        moves.push({ row: nr, col: nc, type: 'move' });
      }
      // No capture moves - anti-violence
    }
    return moves;
  },

  _camelMoves(piece, row, col, board, gameState) {
    const moves = [];
    const offsets = [
      [-3, -1], [-3, 1], [3, -1], [3, 1],
      [-1, -3], [-1, 3], [1, -3], [1, 3]
    ];
    for (const [dr, dc] of offsets) {
      const nr = row + dr;
      const nc = col + dc;
      if (!this._inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (!target) {
        moves.push({ row: nr, col: nc, type: 'move' });
      } else if (target.team !== piece.team) {
        moves.push({ row: nr, col: nc, type: 'capture' });
      }
    }
    return moves;
  },

  _fishMoves(piece, row, col, board, gameState) {
    // Normal knight moves
    const moves = this._knightMoves(piece, row, col, board, gameState);

    // If moved last turn, also 1 square in any direction (no capture)
    if (piece.movedLastTurn) {
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of dirs) {
        const nr = row + dr;
        const nc = col + dc;
        if (!this._inBounds(nr, nc)) continue;
        if (!board[nr][nc]) {
          // Avoid duplicate moves
          const exists = moves.some(m => m.row === nr && m.col === nc);
          if (!exists) {
            moves.push({ row: nr, col: nc, type: 'move' });
          }
        }
      }
    }

    return moves;
  },

  _knightmareMoves(piece, row, col, board, gameState) {
    const moves = this._knightMoves(piece, row, col, board, gameState);

    // Add wrapping moves: L-shape jumps that go off one edge and appear on opposite side
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of offsets) {
      let nr = row + dr;
      let nc = col + dc;

      // Only add wrapping moves (non-wrapping already handled by _knightMoves)
      if (this._inBounds(nr, nc)) continue;

      // Wrap around
      nr = ((nr % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
      nc = ((nc % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;

      if (!this._inBounds(nr, nc)) continue;

      const target = board[nr][nc];
      if (!target) {
        moves.push({ row: nr, col: nc, type: 'move', wrapped: true });
      } else if (target.team !== piece.team) {
        moves.push({ row: nr, col: nc, type: 'capture', wrapped: true });
      }
    }

    return moves;
  },

  // ───────────── SPECIAL KING MOVES ─────────────

  _rocketmanMoves(piece, row, col, board, gameState) {
    const moves = this._kingMoves(piece, row, col, board, gameState);

    // Rocket: once per game, teleport to a random empty tile
    if (!piece.rocketUsed) {
      // Find all empty tiles
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (!board[r][c] && !(r === row && c === col)) {
            moves.push({ row: r, col: c, type: 'special', rocket: true });
          }
        }
      }
    }

    return moves;
  },

  // ───────────── SLIDING HELPER ─────────────

  /**
   * Slide from (row, col) in direction (dRow, dCol) until blocked.
   * Returns array of moves. maxDist defaults to 8 (full board).
   */
  _slide(row, col, dRow, dCol, board, team, maxDist) {
    const moves = [];
    const limit = maxDist || BOARD_SIZE;
    let r = row + dRow;
    let c = col + dCol;
    let dist = 0;
    while (this._inBounds(r, c) && dist < limit) {
      const target = board[r][c];
      if (!target) {
        moves.push({ row: r, col: c, type: 'move' });
      } else if (target.team !== team) {
        moves.push({ row: r, col: c, type: 'capture' });
        break;
      } else {
        break; // Blocked by ally
      }
      r += dRow;
      c += dCol;
      dist++;
    }
    return moves;
  },

  // ───────────── BOUNDS CHECK ─────────────

  _inBounds(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  },

  // ───────────── CHECK / ATTACK DETECTION ─────────────

  /**
   * Check if a square is attacked by the given team.
   * Used for castling, check detection, etc.
   */
  isSquareAttacked(row, col, byTeam, board, gameState) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (!piece || piece.team !== byTeam) continue;

        // Get raw attack squares for this piece (without legality filtering to avoid recursion)
        const attacks = this._getAttackSquares(piece, r, c, board, gameState);
        if (attacks.some(a => a.row === row && a.col === col)) {
          return true;
        }
      }
    }
    return false;
  },

  /**
   * Get squares that a piece attacks (threatens), without legality checks.
   * Simplified version for check/attack detection to avoid infinite recursion.
   */
  _getAttackSquares(piece, row, col, board, gameState) {
    const type = piece.type;
    const team = piece.team;

    // Pawns attack diagonally
    if (PIECE_CATEGORY[type] === 'pawn') {
      return this._pawnAttacks(piece, row, col);
    }

    // Knights and knight variants
    if (type === PT.KNIGHT || type === PT.BANKER || type === PT.ELECTRO_KNIGHT ||
        type === PT.FISH || type === PT.PINATA) {
      return this._knightAttacks(row, col);
    }
    if (type === PT.ANTI_VIOLENCE) {
      return []; // Cannot capture, so does not threaten
    }
    if (type === PT.CAMEL) {
      return this._camelAttacks(row, col);
    }
    if (type === PT.KNIGHTMARE) {
      return this._knightmareAttacks(row, col);
    }

    // Rook-type
    if (type === PT.ROOK || type === PT.SUMO_ROOK) {
      return this._rookAttacks(row, col, board, team);
    }
    if (type === PT.PHASE_ROOK) {
      return this._phaseRookAttacks(row, col, board, team);
    }

    // Bishop-type
    if (type === PT.BISHOP || type === PT.ARISTOCRAT || type === PT.DANCER ||
        type === PT.HORDE_MOTHER || type === PT.BOUNCER || type === PT.CARDINAL ||
        type === PT.GUNSLINGER || type === PT.PILGRIM || type === PT.DJINN) {
      if (type === PT.DJINN && piece.dissipated) return [];
      return this._bishopAttacks(row, col, board, team);
    }
    if (type === PT.BASILISK) {
      // Basilisk cannot capture but its threatened squares paralyze
      return this._bishopAttacks(row, col, board, team);
    }
    if (type === PT.BLADE_RUNNER) {
      return this._bishopAttacks(row, col, board, team);
    }
    if (type === PT.ICICLE) {
      return []; // Cannot capture, does not threaten
    }
    if (type === PT.MARAUDER) {
      return this._marauderAttacks(piece, row, col, board, team);
    }

    // Queen-type
    if (type === PT.QUEEN || type === PT.FISSION_REACTOR) {
      return this._queenAttacks(row, col, board, team);
    }

    // King-type
    if (type === PT.KING || type === PT.ROCKETMAN) {
      return this._kingAttacks(row, col);
    }

    return [];
  },

  _pawnAttacks(piece, row, col) {
    const dir = piece.team === TEAM.WHITE ? -1 : 1;
    const attacks = [];
    for (const dc of [-1, 1]) {
      const nr = row + dir;
      const nc = col + dc;
      if (this._inBounds(nr, nc)) {
        attacks.push({ row: nr, col: nc });
      }
    }
    return attacks;
  },

  _knightAttacks(row, col) {
    const attacks = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of offsets) {
      const nr = row + dr;
      const nc = col + dc;
      if (this._inBounds(nr, nc)) {
        attacks.push({ row: nr, col: nc });
      }
    }
    return attacks;
  },

  _camelAttacks(row, col) {
    const attacks = [];
    const offsets = [
      [-3, -1], [-3, 1], [3, -1], [3, 1],
      [-1, -3], [-1, 3], [1, -3], [1, 3]
    ];
    for (const [dr, dc] of offsets) {
      const nr = row + dr;
      const nc = col + dc;
      if (this._inBounds(nr, nc)) {
        attacks.push({ row: nr, col: nc });
      }
    }
    return attacks;
  },

  _knightmareAttacks(row, col) {
    const attacks = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of offsets) {
      let nr = row + dr;
      let nc = col + dc;
      // Include normal and wrapped positions
      if (this._inBounds(nr, nc)) {
        attacks.push({ row: nr, col: nc });
      } else {
        nr = ((nr % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
        nc = ((nc % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
        if (this._inBounds(nr, nc)) {
          attacks.push({ row: nr, col: nc });
        }
      }
    }
    return attacks;
  },

  _rookAttacks(row, col, board, team) {
    const attacks = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      while (this._inBounds(r, c)) {
        attacks.push({ row: r, col: c });
        if (board[r][c]) break; // Blocked
        r += dr;
        c += dc;
      }
    }
    return attacks;
  },

  _phaseRookAttacks(row, col, board, team) {
    const attacks = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      while (this._inBounds(r, c)) {
        const target = board[r][c];
        if (!target) {
          attacks.push({ row: r, col: c });
        } else if (target.team === team) {
          // Phase through allies
          attacks.push({ row: r, col: c });
        } else {
          // Enemy: threaten this square and stop
          attacks.push({ row: r, col: c });
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return attacks;
  },

  _bishopAttacks(row, col, board, team) {
    const attacks = [];
    const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      while (this._inBounds(r, c)) {
        attacks.push({ row: r, col: c });
        if (board[r][c]) break; // Blocked
        r += dr;
        c += dc;
      }
    }
    return attacks;
  },

  _queenAttacks(row, col, board, team) {
    return [
      ...this._rookAttacks(row, col, board, team),
      ...this._bishopAttacks(row, col, board, team)
    ];
  },

  _kingAttacks(row, col) {
    const attacks = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (this._inBounds(nr, nc)) {
        attacks.push({ row: nr, col: nc });
      }
    }
    return attacks;
  },

  _marauderAttacks(piece, row, col, board, team) {
    const attacks = [];
    const range = 1 + (piece.killCount || 0) * 2;
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      for (let dist = 1; dist <= range; dist++) {
        const nr = row + dr * dist;
        const nc = col + dc * dist;
        if (!this._inBounds(nr, nc)) break;
        attacks.push({ row: nr, col: nc });
        if (board[nr][nc]) break; // Blocked
      }
    }
    return attacks;
  },

  /**
   * Get raw attack moves for a piece, used by gunslinger duel check.
   * This avoids the full getMoves pipeline to prevent recursion.
   */
  _getRawMovesForAttack(piece, row, col, board, gameState) {
    return this._getAttackSquares(piece, row, col, board, gameState);
  },

  // ───────────── CHECK DETECTION ─────────────

  /**
   * Is the given team's king in check?
   */
  isInCheck(team, board, gameState) {
    const king = this.findKing(team, board);
    if (!king) return false;
    const enemy = team === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE;
    return this.isSquareAttacked(king.row, king.col, enemy, board, gameState);
  },

  /**
   * Find the king (or rocketman) of a team.
   */
  findKing(team, board) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (piece && piece.team === team && PIECE_CATEGORY[piece.type] === 'king') {
          return { row: r, col: c, piece };
        }
      }
    }
    return null;
  },

  // ───────────── LEGALITY FILTER ─────────────

  /**
   * Remove moves that would leave the player's own king in check.
   */
  filterLegalMoves(piece, row, col, moves, board, gameState) {
    return moves.filter(move => {
      // Simulate the move
      const simBoard = this._cloneBoard(board);

      // Remove piece from origin
      simBoard[row][col] = null;

      if (move.type === 'special') {
        if (move.castling) {
          // Move king
          simBoard[move.row][move.col] = piece;
          // Move rook
          const baseRow = move.row;
          if (move.castling === 'kingside') {
            simBoard[baseRow][5] = simBoard[baseRow][7];
            simBoard[baseRow][7] = null;
          } else {
            simBoard[baseRow][3] = simBoard[baseRow][0];
            simBoard[baseRow][0] = null;
          }
        } else if (move.sumo) {
          // Sumo: move piece to target square, push target to pushTo
          const target = simBoard[move.row][move.col];
          simBoard[move.pushTo.row][move.pushTo.col] = target;
          simBoard[move.row][move.col] = piece;
        } else if (move.dissipate) {
          // Djinn dissipate: piece stays, just changes state - no board change for check
          simBoard[row][col] = piece;
        } else if (move.duel) {
          // Gunslinger duel: both pieces destroyed
          simBoard[move.row][move.col] = null;
          // Gunslinger is also removed (already null from origin removal)
        } else if (move.rocket) {
          // Rocketman: teleport
          simBoard[move.row][move.col] = piece;
        } else if (move.bladeRunner) {
          // Blade runner: move to destination (marked pieces stay for now)
          simBoard[move.row][move.col] = piece;
        } else if (move.resurrect) {
          // Pilgrim resurrect: piece stays in place
          simBoard[row][col] = piece;
        } else if (move.epeeEnPassant) {
          // Epee en passant: move to target square, captured pawn removed
          simBoard[move.row][move.col] = piece;
          if (move.captureRow !== undefined) {
            simBoard[move.captureRow][move.captureCol] = null;
          }
        } else {
          // Generic special: place piece at destination
          simBoard[move.row][move.col] = piece;
        }
      } else if (move.type === 'unfreeze') {
        // Unfreeze: piece stays in place
        simBoard[row][col] = piece;
      } else {
        // Normal move or capture
        simBoard[move.row][move.col] = piece;

        // Handle en passant capture for normal pawns
        if (PIECE_CATEGORY[piece.type] === 'pawn' && move.type === 'capture' && !board[move.row][move.col]) {
          // En passant: remove the captured pawn
          if (gameState && gameState.enPassantTarget &&
              move.row === gameState.enPassantTarget.row && move.col === gameState.enPassantTarget.col) {
            const capturedPawnRow = move.row + (piece.team === TEAM.WHITE ? 1 : -1);
            simBoard[capturedPawnRow][move.col] = null;
          }
        }
      }

      // Check if own king is in check after this move
      return !this.isInCheck(piece.team, simBoard, gameState);
    });
  },

  // ───────────── PARALYSIS CHECK (BASILISK) ─────────────

  /**
   * Check if a piece is paralyzed by an enemy basilisk.
   */
  _isParalyzed(piece, row, col, board) {
    const enemy = piece.team === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE;

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const bp = board[r][c];
        if (!bp || bp.team !== enemy || bp.type !== PT.BASILISK) continue;

        // Check if basilisk threatens (row, col) via diagonal line of sight
        const attacks = this._bishopAttacks(r, c, board, enemy);
        if (attacks.some(a => a.row === row && a.col === col)) {
          return true;
        }
      }
    }
    return false;
  },

  // ───────────── ANTI-VIOLENCE AURA CHECK ─────────────

  /**
   * Check if a piece is adjacent to an enemy anti-violence knight.
   * If so, the piece cannot capture.
   */
  _isUnderAntiViolenceAura(piece, row, col, board) {
    const enemy = piece.team === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE;
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (!this._inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (target && target.team === enemy && target.type === PT.ANTI_VIOLENCE) {
        return true;
      }
    }
    return false;
  },

  // ───────────── BASILISK THREAT SQUARES ─────────────

  /**
   * Get all squares threatened by all basilisks of a team.
   * Useful for UI highlighting paralysis zones.
   */
  getBasiliskThreats(team, board) {
    const threats = new Set();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (!piece || piece.team !== team || piece.type !== PT.BASILISK) continue;
        const attacks = this._bishopAttacks(r, c, board, team);
        attacks.forEach(a => threats.add(a.row + ',' + a.col));
      }
    }
    return threats;
  },

  // ───────────── BOARD CLONING ─────────────

  _cloneBoard(board) {
    const clone = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      clone[r] = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        clone[r][c] = board[r][c]; // Shallow copy of piece references is fine for move simulation
      }
    }
    return clone;
  },

  // ───────────── UTILITY: IS CHECKMATE / STALEMATE ─────────────

  /**
   * Check if a team has any legal moves.
   */
  hasLegalMoves(team, board, gameState) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (!piece || piece.team !== team) continue;
        const moves = this.getMoves(piece, r, c, board, gameState);
        if (moves.length > 0) return true;
      }
    }
    return false;
  },

  /**
   * Is the team in checkmate?
   */
  isCheckmate(team, board, gameState) {
    return this.isInCheck(team, board, gameState) && !this.hasLegalMoves(team, board, gameState);
  },

  /**
   * Is the team in stalemate?
   */
  isStalemate(team, board, gameState) {
    return !this.isInCheck(team, board, gameState) && !this.hasLegalMoves(team, board, gameState);
  },
};
