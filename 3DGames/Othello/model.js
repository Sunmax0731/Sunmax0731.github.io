/* ============================================================
   Othello - model.js
   ゲーム状態・ルール・AI ロジック（DOM に一切触れない）
   ============================================================ */

class OthelloModel {
  /**
   * @param {string} difficulty - 'easy' | 'normal' | 'hard'
   * @param {number} playerColor - 1=黒, -1=白
   */
  constructor(difficulty, playerColor) {
    this.difficulty  = difficulty;
    this.playerColor = playerColor;

    /** @type {number[][]} 8×8 盤面。0=空, 1=黒, -1=白 */
    this.board         = [];
    /** @type {number} 現在の手番プレイヤー。1=黒, -1=白 */
    this.currentPlayer = 1; // 黒が常に先手
    /** @type {boolean} */
    this.gameOver      = false;

    this.init();
  }

  // ============================================================
  //  初期化
  // ============================================================

  init() {
    this.board = Array.from({ length: 8 }, () => Array(8).fill(0));
    this.board[3][3] = -1;  this.board[3][4] =  1;
    this.board[4][3] =  1;  this.board[4][4] = -1;
    this.currentPlayer = 1;
    this.gameOver      = false;
  }

  // ============================================================
  //  公開 API — 盤面クエリ
  // ============================================================

  /**
   * currentPlayer が (r, c) に置いたときに返せる駒のリストを返す。
   * 盤面を変更しない。
   * @returns {[number, number][]}
   */
  getFlips(r, c) {
    return this._flipsOnBoard(this.board, r, c, this.currentPlayer);
  }

  /** currentPlayer が (r, c) に置けるかどうか */
  canPlace(r, c) {
    return this.board[r][c] === 0 && this.getFlips(r, c).length > 0;
  }

  /** currentPlayer の有効手リストを返す */
  getValidMoves() {
    return this._validMovesOnBoard(this.board, this.currentPlayer);
  }

  /** 指定プレイヤーの有効手が 1 つ以上あるか */
  hasAnyMoves(player) {
    return this._validMovesOnBoard(this.board, player).length > 0;
  }

  /** 黒・白の枚数を返す */
  countPieces() {
    let black = 0, white = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if      (this.board[r][c] ===  1) black++;
        else if (this.board[r][c] === -1) white++;
    return { black, white };
  }

  // ============================================================
  //  公開 API — 盤面更新（Controller から逐次呼ぶ）
  // ============================================================

  /**
   * (r, c) に currentPlayer の駒を置く。
   * フリップは commitFlips() で別途行う。
   */
  commitPlace(r, c) {
    this.board[r][c] = this.currentPlayer;
  }

  /**
   * フリップリストを盤面に反映する。
   * @param {[number, number][]} flips
   */
  commitFlips(flips) {
    for (const [fr, fc] of flips) {
      this.board[fr][fc] = this.currentPlayer;
    }
  }

  /** 手番を切り替える */
  advanceTurn() {
    this.currentPlayer = -this.currentPlayer;
  }

  // ============================================================
  //  公開 API — AI
  // ============================================================

  /**
   * 現在の難易度に応じた最善手を返す。
   * @returns {[number, number] | null}
   */
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
  //  内部: 盤面計算（純粋関数。board を引数で受け取る）
  // ============================================================

  _flipsOnBoard(b, r, c, player) {
    const result = [];
    for (const [dr, dc] of DIRS) {
      const line = [];
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr][nc] === -player) {
        line.push([nr, nc]);
        nr += dr;
        nc += dc;
      }
      if (line.length && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr][nc] === player) {
        result.push(...line);
      }
    }
    return result;
  }

  _validMovesOnBoard(b, player) {
    const moves = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (b[r][c] === 0 && this._flipsOnBoard(b, r, c, player).length > 0)
          moves.push([r, c]);
    return moves;
  }

  /** ムーブを適用した新しい盤面を返す（AI 用・元の盤面は変更しない） */
  _applyMoveToBoard(b, r, c, player) {
    const nb = b.map(row => row.slice());
    nb[r][c] = player;
    for (const [fr, fc] of this._flipsOnBoard(nb, r, c, player)) {
      nb[fr][fc] = player;
    }
    return nb;
  }

  _countOnBoard(b) {
    let black = 0, white = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if      (b[r][c] ===  1) black++;
        else if (b[r][c] === -1) white++;
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
    for (const [r, c] of moves) {
      const nb  = this._applyMoveToBoard(b, r, c, player);
      const cnt = this._countOnBoard(nb);
      const score = player === 1 ? cnt.black - cnt.white : cnt.white - cnt.black;
      if (score > bestScore) { bestScore = score; best = [r, c]; }
    }
    return best;
  }

  _minimaxMove(b, player, moves) {
    let best = null, bestScore = -Infinity;
    for (const [r, c] of moves) {
      const score = this._minimax(
        this._applyMoveToBoard(b, r, c, player),
        5, -Infinity, Infinity, false, player
      );
      if (score > bestScore) { bestScore = score; best = [r, c]; }
    }
    return best;
  }

  /**
   * Minimax + αβ 枝刈り
   * @param {number[][]} b
   * @param {number} depth
   * @param {number} alpha
   * @param {number} beta
   * @param {boolean} maximizing
   * @param {number} player - 最大化したいプレイヤー（AI の色）
   */
  _minimax(b, depth, alpha, beta, maximizing, player) {
    const cur   = maximizing ? player : -player;
    const moves = this._validMovesOnBoard(b, cur);

    if (depth === 0) return this._evalBoard(b, player);

    if (!moves.length) {
      // パス: 相手にも手がなければ終局
      if (!this._validMovesOnBoard(b, -cur).length) return this._evalBoard(b, player);
      return this._minimax(b, depth - 1, alpha, beta, !maximizing, player);
    }

    if (maximizing) {
      let v = -Infinity;
      for (const [r, c] of moves) {
        v = Math.max(v, this._minimax(
          this._applyMoveToBoard(b, r, c, cur), depth - 1, alpha, beta, false, player
        ));
        alpha = Math.max(alpha, v);
        if (beta <= alpha) break;
      }
      return v;
    } else {
      let v = Infinity;
      for (const [r, c] of moves) {
        v = Math.min(v, this._minimax(
          this._applyMoveToBoard(b, r, c, cur), depth - 1, alpha, beta, true, player
        ));
        beta = Math.min(beta, v);
        if (beta <= alpha) break;
      }
      return v;
    }
  }

  /**
   * 盤面評価関数
   * 位置評価（WEIGHTS）+ モビリティボーナス
   */
  _evalBoard(b, player) {
    let score = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        if      (b[r][c] ===  player) score += WEIGHTS[r][c];
        else if (b[r][c] === -player) score -= WEIGHTS[r][c];
      }
    // モビリティ（置ける手の数）ボーナス
    score += 4 * (
      this._validMovesOnBoard(b,  player).length -
      this._validMovesOnBoard(b, -player).length
    );
    return score;
  }
}
