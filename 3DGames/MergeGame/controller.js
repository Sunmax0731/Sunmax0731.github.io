// ============================================================
// MergeGame - controller.js
// 役割: ゲーム進行制御・入力処理・Model と View の橋渡し
//   - Model のゲームロジックを呼び出し、結果を View に反映する
//   - DOM 操作のうちイベント登録のみを担当
// ============================================================

const Controller = (() => {

  // ---- 状態 ----
  let _spawnTimer      = null;   // setInterval の ID
  let _spawnCountdown  = null;   // setInterval の ID（タイマー表示用）
  let _spawnRemaining  = 0;      // 次スポーンまでの残り秒数
  let _isAnimating     = false;  // アニメーション中フラグ
  let _currentSizeKey  = 'medium';

  // ============================================================
  // 内部処理 - 状態更新
  // ============================================================

  /** ModelとViewを同期して画面を更新する */
  function _refresh() {
    View.drawAll({
      grid:         Model.getGrid(),
      gridSize:     Model.getGridSize(),
      score:        Model.getScore(),
      selectedCell: Model.getSelectedCell(),
      highestLevel: Model.getHighestLevel(),
    });
  }

  /** スポーンタイマーを開始する */
  function _startSpawnTimer() {
    _stopSpawnTimer();
    _spawnRemaining = Math.floor(SPAWN_INTERVAL / 1000);
    View.updateSpawnTimer(_spawnRemaining);

    // スポーン実行タイマー
    _spawnTimer = setInterval(() => {
      _doSpawn();
      _spawnRemaining = Math.floor(SPAWN_INTERVAL / 1000);
    }, SPAWN_INTERVAL);

    // カウントダウン表示タイマー
    _spawnCountdown = setInterval(() => {
      _spawnRemaining = Math.max(0, _spawnRemaining - 1);
      View.updateSpawnTimer(_spawnRemaining);
    }, 1000);
  }

  /** スポーンタイマーを停止する */
  function _stopSpawnTimer() {
    if (_spawnTimer     !== null) { clearInterval(_spawnTimer);     _spawnTimer     = null; }
    if (_spawnCountdown !== null) { clearInterval(_spawnCountdown); _spawnCountdown = null; }
  }

  /** スポーンを実行する */
  function _doSpawn() {
    if (Model.isGameOver()) return;

    const cell = Model.spawnRandom();
    if (!cell) {
      // グリッドが満杯 → ゲームオーバーチェック
      _checkAndHandleGameOver();
      return;
    }

    _isAnimating = true;
    _refresh();

    View.startSpawnAnimation(cell.row, cell.col, () => {
      _isAnimating = false;
      _refresh();
      _checkAndHandleGameOver();
    });
  }

  /** ゲームオーバーチェックと処理 */
  function _checkAndHandleGameOver() {
    if (Model.isGameOver()) return;
    if (Model.checkGameOver()) {
      _stopSpawnTimer();
      // 少し遅延を入れてからゲームオーバー表示
      setTimeout(() => {
        View.showGameOver(Model.getScore(), Model.getHighestLevel());
      }, 300);
    }
  }

  // ============================================================
  // 内部処理 - 入力ハンドラ
  // ============================================================

  /** セル選択処理（クリック・タップ共通） */
  function _handleCellClick(clientX, clientY) {
    if (Model.isGameOver()) return;
    if (View.isAnimating()) return;

    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    const cell = View.getCellAt(clientX - rect.left, clientY - rect.top);
    if (!cell) return;

    // Model に渡す前に「前回選択セル」を保存しておく（マージ元として使用）
    const prevSelected = Model.getSelectedCell();

    const result = Model.selectCell(cell.row, cell.col);

    if (result.action === 'select') {
      _refresh();

    } else if (result.action === 'deselect') {
      _refresh();

    } else if (result.action === 'merge') {
      // アニメーション中は追加操作を無効化
      _isAnimating = true;
      _refresh();

      // from: 前回の選択セル, to: 今回タップしたセル
      const fromRow = prevSelected ? prevSelected.row : cell.row;
      const fromCol = prevSelected ? prevSelected.col : cell.col;

      View.startMergeAnimation(
        fromRow, fromCol,         // from（合体元セル）
        cell.row, cell.col,       // to（合体先セル = 新アイテムの出現位置）
        result.mergedLevel,
        result.newLevel,
        () => {
          _isAnimating = false;
          _refresh();
          _checkAndHandleGameOver();
        }
      );

    } else if (result.action === 'merge_bonus') {
      // Lv10 達成 → ボーナスアニメーション
      _isAnimating = true;
      _refresh();

      View.startBonusAnimation(result.bonusRow, result.bonusCol, () => {
        _isAnimating = false;
        _refresh();
        _checkAndHandleGameOver();
      });
    }
  }

  // ---- イベントハンドラ ----

  function _onCanvasClick(e) {
    e.preventDefault();
    _handleCellClick(e.clientX, e.clientY);
  }

  function _onCanvasTouchEnd(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (touch) _handleCellClick(touch.clientX, touch.clientY);
  }

  function _onResize() {
    View.onResize();
    _refresh();
  }

  // ---- イベントリスナー登録・解除 ----

  function _addEventListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click',      _onCanvasClick);
    canvas.addEventListener('touchend',   _onCanvasTouchEnd, { passive: false });
    window.addEventListener('resize',     _onResize);
  }

  function _removeEventListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.removeEventListener('click',      _onCanvasClick);
    canvas.removeEventListener('touchend',   _onCanvasTouchEnd);
    window.removeEventListener('resize',     _onResize);
  }

  // ============================================================
  // 公開 API
  // ============================================================

  /**
   * ゲームを開始する
   * @param {string} sizeKey - 'small' | 'medium' | 'large'
   */
  function startGame(sizeKey) {
    _currentSizeKey = sizeKey || 'medium';
    _isAnimating    = false;

    // タイマー停止
    _stopSpawnTimer();

    // Model 初期化
    Model.init(_currentSizeKey);

    // View 初期化
    const canvas = document.getElementById('game-canvas');
    View.showGameScreen();
    View.init(canvas);
    View.hideGameOver();

    // 初期描画
    _refresh();

    // イベントリスナー登録
    _removeEventListeners();
    _addEventListeners();

    // スポーンタイマー開始
    _startSpawnTimer();
  }

  /**
   * 設定画面に戻る
   */
  function goToSettings() {
    _stopSpawnTimer();
    _removeEventListeners();
    View.hideGameOver();
    View.showSettingsScreen();
  }

  return {
    startGame,
    goToSettings,
  };

})();

// ============================================================
// DOM 初期化 - DOMContentLoaded で設定画面をセットアップ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // ---- 設定画面: グリッドサイズ選択ボタン ----
  let _selectedSizeKey = 'medium';

  const sizeBtns = document.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _selectedSizeKey = btn.dataset.size;
    });
  });

  // ---- スタートボタン ----
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      Controller.startGame(_selectedSizeKey);
    });
  }

  // ---- 設定に戻るボタン（HUD） ----
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      Controller.goToSettings();
    });
  }

  // ---- ゲームオーバー: もう一度ボタン ----
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      Controller.startGame(_selectedSizeKey);
    });
  }

  // ---- ゲームオーバー: 設定に戻るボタン ----
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      Controller.goToSettings();
    });
  }

  // 初期表示は設定画面
  View.showSettingsScreen();
});
