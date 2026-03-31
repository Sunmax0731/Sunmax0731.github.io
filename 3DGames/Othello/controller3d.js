/* ============================================================
   Othello3D - controller3d.js
   3D ゲームフロー・ユーザー操作の仲介（Model3D ↔ View3D の橋渡し）
   ============================================================ */

class OthelloController3D {
  /**
   * @param {OthelloModel3D} model
   * @param {OthelloView3D}  view
   */
  constructor(model, view) {
    this.model    = model;
    this.view     = view;
    this._cpuBusy = false;

    this._bindEvents();
  }

  // ============================================================
  //  公開 API
  // ============================================================

  async start() {
    this.view.initBoard();
    this.view.hideGameOver();

    const cnt = this.model.countPieces();
    this.view.updateScores(cnt.black, cnt.white);

    if (this.model.playerColor === -1) {
      await this._nextTurn();
    } else {
      this.view.setTurnBanner('あなたのターン', 'player');
      this.view.render();
    }
  }

  destroy() {
    this._unbindEvents();
    if (typeof this.view.destroy === 'function') this.view.destroy();
  }

  // ============================================================
  //  内部: イベント
  // ============================================================

  _bindEvents() {
    this.view.setup3DClick((x, y, z) => this._handleCellClick(x, y, z));
  }

  _unbindEvents() {
    if (typeof this.view.cleanup3DClick === 'function') this.view.cleanup3DClick();
  }

  // ============================================================
  //  内部: プレイヤー操作
  // ============================================================

  async _handleCellClick(x, y, z) {
    if (this._cpuBusy)  return;
    if (this.model.gameOver) return;
    if (this.model.currentPlayer !== this.model.playerColor) return;
    if (!this.model.canPlace(x, y, z)) return;

    await this._placeAndFlip(x, y, z);
    this.model.advanceTurn();
    await this._nextTurn();
  }

  // ============================================================
  //  内部: 駒配置 + フリップアニメーション
  // ============================================================

  async _placeAndFlip(x, y, z) {
    const player = this.model.currentPlayer;
    const flips  = this.model.getFlips(x, y, z);

    this.model.commitPlace(x, y, z);
    await this.view.animatePlacement(x, y, z, player);

    await Promise.all(
      flips.map(([fx, fy, fz], i) =>
        this._delay(i * FLIP_STAGGER_MS).then(() =>
          this.view.animateFlip(fx, fy, fz, player)
        )
      )
    );

    this.model.commitFlips(flips);
    await this._delay(80);

    const cnt = this.model.countPieces();
    this.view.updateScores(cnt.black, cnt.white);
  }

  // ============================================================
  //  内部: ターン進行
  // ============================================================

  async _nextTurn() {
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
      if (!this.model.hasAnyMoves(-this.model.playerColor)) {
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
