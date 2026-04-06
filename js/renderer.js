// ==================== RENDERER ====================

const Renderer = {
  canvas: null,
  ctx: null,
  effectsCanvas: null,
  effectsCtx: null,
  particles: [],
  animations: [],
  showCoordinates: true,
  showThreatMap: true,

  setDisplayOptions(options) {
    const opts = options || {};
    if (typeof opts.showCoordinates === 'boolean') this.showCoordinates = opts.showCoordinates;
    if (typeof opts.showThreatMap === 'boolean') this.showThreatMap = opts.showThreatMap;
  },

  init() {
    this.canvas = document.getElementById('board-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = CANVAS_SIZE;
    this.canvas.height = CANVAS_SIZE;
    this.ctx.imageSmoothingEnabled = false;

    this.effectsCanvas = document.getElementById('effects-canvas');
    this.effectsCtx = this.effectsCanvas.getContext('2d');
    this.effectsCanvas.width = CANVAS_SIZE;
    this.effectsCanvas.height = CANVAS_SIZE;
    this.effectsCtx.imageSmoothingEnabled = false;
  },

  drawBoard(board, gameState) {
    const ctx = this.ctx;

    // Draw tiles
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        ctx.fillStyle = isLight ? COLORS.BOARD_LIGHT : COLORS.BOARD_DARK;
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    if (this.showThreatMap) {
      this.drawThreatMap(board, gameState);
    }

    // Last move highlight
    if (gameState.lastMove) {
      ctx.fillStyle = COLORS.LAST_MOVE;
      ctx.fillRect(gameState.lastMove.from.col * TILE_SIZE, gameState.lastMove.from.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.fillRect(gameState.lastMove.to.col * TILE_SIZE, gameState.lastMove.to.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Check highlight
    const currentKing = PieceMoves.findKing(gameState.currentTeam, board);
    if (currentKing && PieceMoves.isInCheck(gameState.currentTeam, board, gameState)) {
      ctx.fillStyle = COLORS.CHECK;
      ctx.fillRect(currentKing.col * TILE_SIZE, currentKing.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Selected piece highlight
    if (gameState.selectedPiece) {
      const sp = gameState.selectedPiece;
      ctx.fillStyle = COLORS.SELECTED;
      ctx.fillRect(sp.col * TILE_SIZE, sp.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Valid moves
    if (gameState.validMoves) {
      gameState.validMoves.forEach(m => {
        const cx = m.col * TILE_SIZE + TILE_SIZE / 2;
        const cy = m.row * TILE_SIZE + TILE_SIZE / 2;
        if (m.type === 'capture' || m.type === 'special') {
          // Capture: corner triangles
          ctx.fillStyle = m.type === 'special' ? 'rgba(200,100,255,0.4)' : COLORS.CAPTURE_DOT;
          const s = TILE_SIZE;
          const x = m.col * TILE_SIZE;
          const y = m.row * TILE_SIZE;
          const t = 10;
          // Four corners
          ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x + t, y); ctx.lineTo(x, y + t); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x + s, y); ctx.lineTo(x + s - t, y); ctx.lineTo(x + s, y + t); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, y + s); ctx.lineTo(x + t, y + s); ctx.lineTo(x, y + s - t); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x + s, y + s); ctx.lineTo(x + s - t, y + s); ctx.lineTo(x + s, y + s - t); ctx.fill();
        } else {
          // Move: dot
          ctx.fillStyle = COLORS.MOVE_DOT;
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Draw pieces
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && !piece.dissipated) {
          const x = c * TILE_SIZE;
          const y = r * TILE_SIZE;
          drawSprite(ctx, piece.type, piece.team, x, y, TILE_SIZE);

          // Status indicators
          this.drawStatusIndicators(ctx, piece, x, y);
        }
      }
    }

    // Blade runner marks (skulls on marked pieces)
    gameState.bladeRunnerMarks.forEach(mark => {
      const p = board[mark.row][mark.col];
      if (p) {
        const x = mark.col * TILE_SIZE + TILE_SIZE - 12;
        const y = mark.row * TILE_SIZE + 2;
        ctx.fillStyle = '#f44';
        ctx.font = '10px monospace';
        ctx.fillText('\u2620', x, y + 10);
      }
    });

    // Coordinate labels
    if (this.showCoordinates) {
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#383050';
      for (let i = 0; i < 8; i++) {
        ctx.fillText(String.fromCharCode(97 + i), i * TILE_SIZE + TILE_SIZE - 12, CANVAS_SIZE - 4);
        ctx.fillText(8 - i, 3, i * TILE_SIZE + 12);
      }
    }
  },

  drawThreatMap(board, gameState) {
    if (!board || !gameState) return;

    const threatenedBy = gameState.currentTeam === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE;
    const threatCount = new Map();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece || piece.team !== threatenedBy || piece.dissipated) continue;
        const attacks = PieceMoves._getAttackSquares(piece, r, c, board, gameState);
        attacks.forEach(a => {
          if (a.row < 0 || a.row > 7 || a.col < 0 || a.col > 7) return;
          const key = a.row + ',' + a.col;
          threatCount.set(key, (threatCount.get(key) || 0) + 1);
        });
      }
    }

    threatCount.forEach((count, key) => {
      const [row, col] = key.split(',').map(Number);
      const alpha = Math.min(0.26, 0.08 + count * 0.03);
      this.ctx.fillStyle = `rgba(255, 64, 64, ${alpha})`;
      this.ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
  },

  drawStatusIndicators(ctx, piece, x, y) {
    const indicators = [];

    if (piece.frozen) {
      indicators.push({ color: '#8ef', char: '*' });
    }
    if (piece.charged) {
      indicators.push({ color: '#ff0', char: '\u26a1' });
    }
    if (piece.type === PT.FISSION_REACTOR && piece.killCount > 0) {
      indicators.push({ color: '#f80', char: String(piece.killCount) });
    }
    if (piece.type === PT.PILGRIM) {
      const progress = Math.min(piece.totalMoved, 20);
      indicators.push({ color: '#a84', char: String(progress) });
    }
    if (piece.type === PT.MARAUDER && piece.killCount > 0) {
      indicators.push({ color: '#f44', char: '+' + (piece.killCount * 2) });
    }
    if (piece.type === PT.ELECTRO_KNIGHT) {
      indicators.push({ color: '#ff0', char: String(piece.consecutiveMoves) });
    }
    if (piece.type === PT.GOLDEN_PAWN) {
      indicators.push({ color: '#fc0', char: '\u2605' });
    }
    if (piece.type === PT.IRON_PAWN) {
      indicators.push({ color: '#888', char: '\u25c6' });
    }

    ctx.font = '8px monospace';
    indicators.forEach((ind, i) => {
      ctx.fillStyle = ind.color;
      ctx.fillText(ind.char, x + 2 + i * 10, y + 10);
    });
  },

  // Particles system
  addParticle(x, y, color, life, vx, vy) {
    this.particles.push({ x, y, color, life, maxLife: life, vx: vx || 0, vy: vy || 0 });
  },

  spawnCaptureEffect(row, col, color) {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 1 + Math.random() * 3;
      this.addParticle(cx, cy, color, 20 + Math.random() * 15,
        Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  },

  spawnExplosionEffect(row, col) {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      const colors = ['#f80', '#ff0', '#f44', '#fff'];
      this.addParticle(cx, cy, colors[i % 4], 25 + Math.random() * 20,
        Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  },

  spawnFreezeEffect(row, col) {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    for (let i = 0; i < 8; i++) {
      this.addParticle(
        cx - 10 + Math.random() * 20,
        cy + 10,
        '#8ef',
        15 + Math.random() * 10,
        (Math.random() - 0.5) * 0.5,
        -1 - Math.random()
      );
    }
  },

  spawnPromotionEffect(row, col) {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      this.addParticle(cx, cy, '#ffd040', 30 + Math.random() * 20,
        Math.cos(angle) * speed, Math.sin(angle) * speed - 1);
    }
  },

  updateParticles() {
    const ctx = this.effectsCtx;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const size = 2 + Math.floor(alpha * 3);
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), size, size);
    }
    ctx.globalAlpha = 1;
  },

  // Draw a mini board for draft preview
  drawMiniBoard(canvas, board, tileSize) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    canvas.width = tileSize * 8;
    canvas.height = tileSize * 8;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        ctx.fillStyle = isLight ? COLORS.BOARD_LIGHT : COLORS.BOARD_DARK;
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);

        if (board[r][c]) {
          drawSprite(ctx, board[r][c].type, board[r][c].team, c * tileSize, r * tileSize, tileSize);
        }
      }
    }
  },

  // Draw a single piece sprite on a small canvas (for draft cards, captured display)
  drawPieceCanvas(canvas, pieceType, team, size) {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawSprite(ctx, pieceType, team, 0, 0, size);
  },

  // Render loop — uses references updated by Game
  startRenderLoop(board, gameState) {
    this.board = board;
    this.state = gameState;
    const loop = () => {
      if (this.board && this.state) {
        this.drawBoard(this.board, this.state);
      }
      this.updateParticles();
      requestAnimationFrame(loop);
    };
    loop();
  },
};
