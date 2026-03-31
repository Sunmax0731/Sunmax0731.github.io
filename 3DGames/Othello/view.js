/* ============================================================
   Othello - view.js
   DOM 描画・アニメーション（ゲームロジックに一切触れない）
   ============================================================ */

class OthelloView {
  /**
   * @param {OthelloModel} model
   */
  constructor(model) {
    this.model    = model;
    this._boardEl = document.getElementById('board');
  }

  // ============================================================
  //  ボード DOM
  // ============================================================

  /**
   * 8×8 のセルを生成する（ゲーム開始時に一度だけ呼ぶ）。
   * クリックイベントは Controller が addEventListener で委譲するため
   * ここでは設定しない。
   */
  initBoard() {
    this._boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className  = 'cell';
        cell.dataset.r  = r;
        cell.dataset.c  = c;
        this._boardEl.appendChild(cell);
      }
    }
  }

  /**
   * 盤面全体を model の状態と同期する。
   * @param {boolean} showHints - プレイヤーの有効手をドットで表示するか
   */
  render(showHints = true) {
    const { board, currentPlayer, playerColor, gameOver } = this.model;

    const validSet = new Set(
      (showHints && !gameOver && currentPlayer === playerColor)
        ? this.model.getValidMoves().map(([r, c]) => `${r},${c}`)
        : []
    );

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = this._cell(r, c);
        if (!cell) continue;

        const val = board[r][c];
        const key = `${r},${c}`;
        cell.classList.toggle('hint', val === 0 && validSet.has(key));

        let disc = cell.querySelector('.disc');
        if (val !== 0) {
          if (!disc) {
            disc = document.createElement('div');
            cell.appendChild(disc);
          }
          const color = val === 1 ? 'black' : 'white';
          if (!disc.classList.contains(color)) {
            disc.className = `disc ${color}`;
          }
        } else {
          disc?.remove();
        }
      }
    }
  }

  // ============================================================
  //  アニメーション（async — Controller が await する）
  // ============================================================

  /**
   * 新しい駒をアニメーション付きで配置する。
   * model.commitPlace() 後に呼ぶ。
   * @param {number} r
   * @param {number} c
   * @param {number} player  1=黒, -1=白
   */
  async animatePlacement(r, c, player) {
    const cell = this._cell(r, c);
    if (!cell) return;

    cell.classList.remove('hint');

    const disc = document.createElement('div');
    disc.className = `disc ${player === 1 ? 'black' : 'white'} placing`;
    cell.appendChild(disc);

    await this._delay(PLACE_ANIM_MS);
  }

  /**
   * 駒を X 方向にフリップするアニメーション。
   * アニメーション中に色を切り替えるため、model.commitFlips() より
   * 先に呼ぶ（呼び出し時点では旧色 DOM が存在する）。
   * @param {number} r
   * @param {number} c
   * @param {number} toPlayer  変更後の色
   */
  async animateFlip(r, c, toPlayer) {
    const disc = this._cell(r, c)?.querySelector('.disc');
    if (!disc) return;

    const newColor = toPlayer === 1 ? 'black' : 'white';

    // フェーズ 1: X 方向に縮む
    disc.style.transition = `transform ${FLIP_HALF_MS}ms ease-in`;
    disc.style.transform  = 'scaleX(0)';
    await this._delay(FLIP_HALF_MS);

    // 色を切り替えて広げる
    disc.classList.remove('black', 'white');
    disc.classList.add(newColor);
    disc.style.transition = `transform ${FLIP_HALF_MS}ms ease-out`;
    disc.style.transform  = 'scaleX(1)';
    await this._delay(FLIP_HALF_MS);

    // インラインスタイルをリセット（render() が上書きしても問題ないよう）
    disc.style.transition = '';
    disc.style.transform  = '';
  }

  // ============================================================
  //  HUD 更新
  // ============================================================

  /**
   * @param {number} black
   * @param {number} white
   */
  updateScores(black, white) {
    document.getElementById('score-black').textContent = black;
    document.getElementById('score-white').textContent = white;

    const cp = this.model.currentPlayer;
    document.getElementById('score-black-half').classList.toggle('active-turn', cp ===  1);
    document.getElementById('score-white-half').classList.toggle('active-turn', cp === -1);
  }

  /**
   * @param {string} text
   * @param {'player'|'cpu'|'pass'|'gameover'} cls
   */
  setTurnBanner(text, cls) {
    const el = document.getElementById('turn-banner');
    el.textContent = text;
    el.className   = `turn-banner ${cls}`;
  }

  // ============================================================
  //  ゲームオーバーオーバーレイ
  // ============================================================

  /** @param {number} black @param {number} white */
  showGameOver(black, white) {
    document.getElementById('overlay-score').textContent = `黒 ${black}  vs  白 ${white}`;

    const { playerColor } = this.model;
    const winnerEl = document.getElementById('overlay-winner');

    if (black === white) {
      winnerEl.innerHTML = '<span class="win-draw">引き分け！</span>';
    } else {
      const blackWins  = black > white;
      const playerWins = (blackWins && playerColor === 1) || (!blackWins && playerColor === -1);
      winnerEl.innerHTML = playerWins
        ? '<span class="win-player">あなたの勝ち！🎉</span>'
        : '<span class="win-cpu">CPU の勝ち</span>';
    }

    document.getElementById('overlay').classList.add('show');
  }

  hideGameOver() {
    document.getElementById('overlay').classList.remove('show');
  }

  // ============================================================
  //  内部ユーティリティ
  // ============================================================

  _cell(r, c) {
    return this._boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
