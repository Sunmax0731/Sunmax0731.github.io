/* ============================================================
   Othello3D - model3d.js
   3D ゲーム状態・ルール・AI ロジック（4×4×4 盤面）
   DOM に一切触れない
   ============================================================ */

class OthelloModel3D {
  /**
   * @param {string} difficulty - 'easy' | 'normal' | 'hard'
   * @param {number} playerColor - 1=黒, -1=白
   */
  constructor(difficulty, playerColor) {
    this.difficulty  = difficulty;
    this.playerColor = playerColor;

    /** @type {number[][][]} board[z][y][x]  0=空, 1=黒, -1=白 */
    this.board         = [];
    /** @type {number} 現在の手番 1=黒, -1=白 */
    this.currentPlayer = 1;
    /** @type {boolean} */
    this.gameOver      = false;

    this.init();
  }

  // ============================================================
  //  初期化
  // ============================================================

  init() {
    this.board = Array.from({ length: SIZE3D }, () =>
      Array.from({ length: SIZE3D }, () => Array(SIZE3D).fill(0))
    );

    // 中央 2×2×2（インデックス 1,2）に初期配置
    // (x+y+z) の偶奇で黒/白を交互に配置
    for (const z of [1, 2])
      for (const y of [1, 2])
        for (const x of [1, 2])
          this.board[z][y][x] = ((x + y + z) % 2 === 0) ? 1 : -1;

    this.currentPlayer = 1;
    this.gameOver      = false;
  }

  // ============================================================
  //  公開 API — 盤面クエリ
  // ============================================================

  getFlips(x, y, z) {
    return this._flipsOnBoard(this.board, x, y, z, this.currentPlayer);
  }

  canPlace(x, y, z) {
    return this.board[z][y][x] === 0 && this.getFlips(x, y, z).length > 0;
  }

  getValidMoves() {
    return this._validMovesOnBoard(this.board, this.currentPlayer);
  }

  hasAnyMoves(player) {
    return this._validMovesOnBoard(this.board, player).length > 0;
  }

  countPieces() {
    let black = 0, white = 0;
    for (let z = 0; z < SIZE3D; z++)
      for (let y = 0; y < SIZE3D; y++)
        for (let x = 0; x < SIZE3D; x++) {
          if      (this.board[z][y][x] ===  1) black++;
          else if (this.board[z][y][x] === -1) white++;
        }
    return { black, white };
  }

  // ============================================================
  //  公開 API — 盤面更新
  // ============================================================

  commitPlace(x, y, z) {
    this.board[z][y][x] = this.currentPlayer;
  }

  commitFlips(flips) {
    for (const [fx, fy, fz] of flips)
      this.board[fz][fy][fx] = this.currentPlayer;
  }

  advanceTurn() {
    this.currentPlayer = -this.currentPlayer;
  }

  // ============================================================
  //  公開 API — AI
  // ============================================================

  getAIMove() {
    const moves = this.getValidMoves();
    if (!moves.length) return null;

    switch (this.difficulty) {
      case 'easy':   return this._randomMove(moves);
      case 'normal': return this._greedyMove(this.board, this.currentPlayer, moves);
      default:       return this._minimaxMove(this.board, this.currentPlayer, moves);
    }
  }

  // ============================================================
  //  内部: 盤面計算
  // ============================================================

  _inBounds(x, y, z) {
    return x >= 0 && x < SIZE3D
        && y >= 0 && y < SIZE3D
        && z >= 0 && z < SIZE3D;
  }

  _flipsOnBoard(b, x, y, z, player) {
    const result = [];
    for (const [dx, dy, dz] of DIRS_3D) {
      const line = [];
      let nx = x + dx, ny = y + dy, nz = z + dz;
      while (this._inBounds(nx, ny, nz) && b[nz][ny][nx] === -player) {
        line.push([nx, ny, nz]);
        nx += dx; ny += dy; nz += dz;
      }
      if (line.length && this._inBounds(nx, ny, nz) && b[nz][ny][nx] === player) {
        result.push(...line);
      }
    }
    return result;
  }

  _validMovesOnBoard(b, player) {
    const moves = [];
    for (let z = 0; z < SIZE3D; z++)
      for (let y = 0; y < SIZE3D; y++)
        for (let x = 0; x < SIZE3D; x++)
          if (b[z][y][x] === 0 && this._flipsOnBoard(b, x, y, z, player).length > 0)
            moves.push([x, y, z]);
    return moves;
  }

  _applyMoveToBoard(b, x, y, z, player) {
    const nb = b.map(layer => layer.map(row => row.slice()));
    nb[z][y][x] = player;
    for (const [fx, fy, fz] of this._flipsOnBoard(nb, x, y, z, player))
      nb[fz][fy][fx] = player;
    return nb;
  }

  _countOnBoard(b) {
    let black = 0, white = 0;
    for (let z = 0; z < SIZE3D; z++)
      for (let y = 0; y < SIZE3D; y++)
        for (let x = 0; x < SIZE3D; x++) {
          if      (b[z][y][x] ===  1) black++;
          else if (b[z][y][x] === -1) white++;
        }
    return { black, white };
  }

  // ============================================================
  //  内部: AI 戦略
  // ============================================================

  _randomMove(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  _greedyMove(b, player, moves) {
    let best = null, bestScore = -Infinity;
    for (const [x, y, z] of moves) {
      const nb    = this._applyMoveToBoard(b, x, y, z, player);
      const cnt   = this._countOnBoard(nb);
      const score = player === 1 ? cnt.black - cnt.white : cnt.white - cnt.black;
      if (score > bestScore) { bestScore = score; best = [x, y, z]; }
    }
    return best;
  }

  _minimaxMove(b, player, moves) {
    let best = null, bestScore = -Infinity;
    for (const [x, y, z] of moves) {
      const score = this._minimax(
        this._applyMoveToBoard(b, x, y, z, player),
        3, -Infinity, Infinity, false, player   // depth=3（3Dは分岐多い）
      );
      if (score > bestScore) { bestScore = score; best = [x, y, z]; }
    }
    return best;
  }

  _minimax(b, depth, alpha, beta, maximizing, player) {
    const cur   = maximizing ? player : -player;
    const moves = this._validMovesOnBoard(b, cur);

    if (depth === 0) return this._evalBoard(b, player);

    if (!moves.length) {
      if (!this._validMovesOnBoard(b, -cur).length) return this._evalBoard(b, player);
      return this._minimax(b, depth - 1, alpha, beta, !maximizing, player);
    }

    if (maximizing) {
      let v = -Infinity;
      for (const [x, y, z] of moves) {
        v = Math.max(v, this._minimax(
          this._applyMoveToBoard(b, x, y, z, cur), depth - 1, alpha, beta, false, player
        ));
        alpha = Math.max(alpha, v);
        if (beta <= alpha) break;
      }
      return v;
    } else {
      let v = Infinity;
      for (const [x, y, z] of moves) {
        v = Math.min(v, this._minimax(
          this._applyMoveToBoard(b, x, y, z, cur), depth - 1, alpha, beta, true, player
        ));
        beta = Math.min(beta, v);
        if (beta <= alpha) break;
      }
      return v;
    }
  }

  /**
   * 盤面評価: 位置ウェイト + モビリティ
   * 3D では頂点(角)が最高価値、辺・面中心・体積中心の順
   */
  _evalBoard(b, player) {
    let score = 0;
    for (let z = 0; z < SIZE3D; z++)
      for (let y = 0; y < SIZE3D; y++)
        for (let x = 0; x < SIZE3D; x++) {
          const w = this._posWeight(x, y, z);
          if      (b[z][y][x] ===  player) score += w;
          else if (b[z][y][x] === -player) score -= w;
        }
    score += 3 * (
      this._validMovesOnBoard(b,  player).length -
      this._validMovesOnBoard(b, -player).length
    );
    return score;
  }

  _posWeight(x, y, z) {
    // 外周に面する軸の数（0〜3）でウェイトを決定
    const edgeCount = [x, y, z].filter(v => v === 0 || v === SIZE3D - 1).length;
    return [2, 5, 20, 120][edgeCount];
  }
}
