// ==================== BOARD STATE ====================

let pieceIdCounter = 0;
function generatePieceId() {
  return 'p_' + (pieceIdCounter++);
}

function createPiece(type, team) {
  return {
    type,
    team,
    id: generatePieceId(),
    hasMoved: false,
    consecutiveMoves: 0,
    charged: false,
    killCount: 0,
    totalMoved: 0,
    movedLastTurn: false,
    dissipated: false,
    frozen: false,
    frozenTurns: 0,
    bladeMarkTurn: -1,
    rocketUsed: false,
    adjacentTurns: {},
    parentId: null,
    hordelings: [],
    dancerChecked: false,
  };
}

function createStandardBoard() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Black pieces (rows 0-1)
  const backRow = [PT.ROOK, PT.KNIGHT, PT.BISHOP, PT.QUEEN, PT.KING, PT.BISHOP, PT.KNIGHT, PT.ROOK];
  for (let c = 0; c < 8; c++) {
    board[0][c] = createPiece(backRow[c], TEAM.BLACK);
    board[1][c] = createPiece(PT.PAWN, TEAM.BLACK);
  }

  // White pieces (rows 6-7)
  for (let c = 0; c < 8; c++) {
    board[7][c] = createPiece(backRow[c], TEAM.WHITE);
    board[6][c] = createPiece(PT.PAWN, TEAM.WHITE);
  }

  return board;
}

function createCustomBoard(whiteSetup, blackSetup) {
  // whiteSetup/blackSetup: { pawns: [8 types], back: [8 types] }
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Black back row
  for (let c = 0; c < 8; c++) {
    board[0][c] = createPiece(blackSetup.back[c], TEAM.BLACK);
    board[1][c] = createPiece(blackSetup.pawns[c], TEAM.BLACK);
  }

  // White
  for (let c = 0; c < 8; c++) {
    board[7][c] = createPiece(whiteSetup.back[c], TEAM.WHITE);
    board[6][c] = createPiece(whiteSetup.pawns[c], TEAM.WHITE);
  }

  return board;
}

function createGameState() {
  return {
    turn: 1,
    currentTeam: TEAM.WHITE,
    lastMove: null,
    enPassantTarget: null,
    capturedPieces: { white: [], black: [] },
    hasAristocrat: { white: false, black: false },
    dancerBonusTurn: false,
    dancerBonusTeam: null,
    bladeRunnerMarks: [],
    dissipatedDjinns: [],
    moveHistory: [],
    gameOver: false,
    winner: null,
    winReason: '',
    selectedPiece: null,
    validMoves: [],
    lastMovedPieceId: null,
    warAutomatorQueue: [],
    promotionPending: null,
  };
}

function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell, adjacentTurns: { ...cell.adjacentTurns }, hordelings: [...cell.hordelings] } : null));
}

function findPiece(board, predicate) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && predicate(board[r][c], r, c)) {
        return { piece: board[r][c], row: r, col: c };
      }
    }
  }
  return null;
}

function findAllPieces(board, predicate) {
  const results = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && predicate(board[r][c], r, c)) {
        results.push({ piece: board[r][c], row: r, col: c });
      }
    }
  }
  return results;
}

function removePiece(board, row, col, gameState) {
  const piece = board[row][col];
  if (!piece) return null;

  board[row][col] = null;

  // Add to captured list
  const capturedBy = piece.team === TEAM.WHITE ? 'black' : 'white';
  gameState.capturedPieces[capturedBy].push(piece);

  // Horde mother death cascade
  if (piece.type === PT.HORDE_MOTHER) {
    const hordelings = findAllPieces(board, p => p.parentId === piece.id);
    hordelings.forEach(h => {
      board[h.row][h.col] = null;
      gameState.capturedPieces[capturedBy].push(h.piece);
    });
  }

  // Hordeling death - check if mother should be notified
  if (piece.parentId) {
    const mother = findPiece(board, p => p.id === piece.parentId);
    if (mother) {
      mother.piece.hordelings = mother.piece.hordelings.filter(id => id !== piece.id);
    }
  }

  // War automator: queue auto-advances
  const automators = findAllPieces(board, p => p.type === PT.WAR_AUTOMATOR);
  automators.forEach(a => {
    gameState.warAutomatorQueue.push({ row: a.row, col: a.col });
  });

  // Djinn reform: if any djinn is dissipated, reform it
  for (let i = gameState.dissipatedDjinns.length - 1; i >= 0; i--) {
    const djinn = gameState.dissipatedDjinns[i];
    if (!board[djinn.row][djinn.col]) {
      board[djinn.row][djinn.col] = djinn.piece;
      djinn.piece.dissipated = false;
      gameState.dissipatedDjinns.splice(i, 1);
    }
  }

  return piece;
}

function updateAristocratStatus(board, gameState) {
  gameState.hasAristocrat.white = !!findPiece(board, p => p.type === PT.ARISTOCRAT && p.team === TEAM.WHITE);
  gameState.hasAristocrat.black = !!findPiece(board, p => p.type === PT.ARISTOCRAT && p.team === TEAM.BLACK);
}

function getOpponent(team) {
  return team === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE;
}

function isPromotion(piece, toRow, gameState) {
  const cat = PIECE_CATEGORY[piece.type];
  if (cat !== 'pawn') return false;
  if (piece.type === PT.IRON_PAWN || piece.type === PT.HORDELING) return false;
  // Aristocrat prevents promotion
  if (gameState.hasAristocrat.white || gameState.hasAristocrat.black) return false;
  const promoRow = piece.team === TEAM.WHITE ? 0 : 7;
  return toRow === promoRow;
}
