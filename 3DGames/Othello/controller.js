/* ============================================================
   Othello - controller.js
   ゲームフロー・ユーザー操作の仲介（Model ↔ View の橋渡し）
   ============================================================ */

class OthelloController {
  /**
   * @param {OthelloModel} model
   * @param {OthelloView}  view
   */
  constructor(model, view) {
    this.model     = model;
    this.view      = view;
    this._cpuBusy  = false;

    this._bindEvents();
  }

  // ============================================================
  //  公開 API
  // ============================================================

  /** ゲームを開始する（settings.js から呼ぶ） */
  async start() {
    this.view.initBoard();
    this.view.hideGameOver();

    const cnt = this.model.countPieces();
    this.view.updateScores(cnt.black, cnt.white);

    if (this.model.playerColor === -1) {
      // プレイヤーが白 → CPU（黒）が先攻
      await this._nextTurn();
    } else {
      this.view.setTurnBanner('あなたのターン', 'player');
      this.view.render();
    }
  }

  /** コントローラを破棄する（settings.js から呼ぶ） */
  destroy() {
    this._unbindEvents();
    if (typeof this.view.destroy === 'function') this.view.destroy();
  }

  // ============================================================
  //  内部: イベント
  // ============================================================

  _bindEvents() {
    this._boardEl = document.getElementById('board');

    if (typeof this.view.setup3DClick === 'function') {
      // 3D モード: ビューがレイキャストでクリックを処理
      this.view.setup3DClick((r, c) => this._handleCellClick(r, c));
    } else {
      // 2D モード: DOM イベント委譲
      this._onBoardClick = (e) => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        this._handleCellClick(
          parseInt(cell.dataset.r, 10),
          parseInt(cell.dataset.c, 10)
        );
      };
      this._boardEl.addEventListener('click', this._onBoardClick);
    }
  }

  _unbindEvents() {
    if (typeof this.view.cleanup3DClick === 'function') {
      this.view.cleanup3DClick();
    } else if (this._onBoardClick) {
      this._boardEl.removeEventListener('click', this._onBoardClick);
    }
  }

  // ============================================================
  //  内部: プレイヤー操作
  // ============================================================

  async _handleCellClick(r, c) {
    if (this._cpuBusy)  return;
    if (this.model.gameOver) return;
    if (this.model.currentPlayer !== this.model.playerColor) return;
    if (!this.model.canPlace(r, c)) return;

    await this._placeAndFlip(r, c);
    this.model.advanceTurn();
    await this._nextTurn();
  }

  // ============================================================
  //  内部: 駒配置 + フリップアニメーション
  // ============================================================

  async _placeAndFlip(r, c) {
    const player = this.model.currentPlayer;

    // フリップ対象を配置前に計算（盤面変更前の状態が必要）
    const flips = this.model.getFlips(r, c);

    // 1. 盤面に駒を置き、配置アニメーション
    this.model.commitPlace(r, c);
    await this.view.animatePlacement(r, c, player);

    // 2. フリップアニメーション（スタガー付き並走）
    await Promise.all(
      flips.map(([fr, fc], i) =>
        this._delay(i * FLIP_STAGGER_MS).then(() =>
          this.view.animateFlip(fr, fc, player)
        )
      )
    );

    // 3. アニメーション完了後に盤面状態を確定
    this.model.commitFlips(flips);

    await this._delay(80);

    const cnt = this.model.countPieces();
    this.view.updateScores(cnt.black, cnt.white);
  }

  // ============================================================
  //  内部: ターン進行
  // ============================================================

  async _nextTurn() {
    // 両者手なし → 終局
    if (
      !this.model.hasAnyMoves( this.model.playerColor) &&
      !this.model.hasAnyMoves(-this.model.playerColor)
    ) {
      this._endGame();
      return;
    }

    const isPlayerTurn = this.model.currentPlayer === this.model.playerColor;

    if (isPlayerTurn) {
      if (!this.model.hasAnyMoves(this.model.playerColor)) {
        // プレイヤーはパス
        this.view.setTurnBanner('パス（置ける場所がありません）', 'pass');
        await this._delay(1600);
        this.model.advanceTurn();
        this.view.render(false);
        await this._nextTurn();
      } else {
        this.view.setTurnBanner('あなたのターン', 'player');
        this.view.render();
      }
    } else {
      // CPU のターン
      if (!this.model.hasAnyMoves(-this.model.playerColor)) {
        // CPU はパス
        this.view.setTurnBanner('CPU はパスします', 'cpu');
        await this._delay(1200);
        this.model.advanceTurn();
        this.view.render();
        await this._nextTurn();
        return;
      }

      this._cpuBusy = true;
      this.view.setTurnBanner('CPU が考え中…', 'cpu');
      this.view.render(false);

      // 演出ウェイト（実際の minimax と並走させる）
      const [move] = await Promise.all([
        Promise.resolve(this.model.getAIMove()),
        this._delay(CPU_THINK_MS[this.model.difficulty]),
      ]);

      if (move) await this._placeAndFlip(...move);

      this._cpuBusy = false;
      this.model.advanceTurn();
      await this._nextTurn();
    }
  }

  // ============================================================
  //  内部: 終局処理
  // ============================================================

  _endGame() {
    this.model.gameOver = true;
    this.view.setTurnBanner('ゲーム終了', 'gameover');
    this.view.render(false);

    const cnt = this.model.countPieces();
    this.view.showGameOver(cnt.black, cnt.white);
  }

  // ============================================================
  //  内部: ユーティリティ
  // ============================================================

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
