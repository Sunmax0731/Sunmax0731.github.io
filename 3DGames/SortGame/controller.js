// ============================================================
// SortGame - controller.js
// 役割: ゲーム進行の制御・入力処理・Model と View の橋渡し
// ============================================================

const Controller = (() => {

  let _isAnimating = false;

  // ============================================================
  // イベントハンドラ
  // ============================================================

  function _onCanvasClick(event) {
    if (_isAnimating || Model.isWon()) return;
    const idx = View.getTubeIndexAt(event.clientX, event.clientY);
    if (idx === -1) return;
    _handleSelect(idx);
  }

  function _onCanvasTouch(event) {
    event.preventDefault();
    if (_isAnimating || Model.isWon()) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const idx = View.getTubeIndexAt(touch.clientX, touch.clientY);
    if (idx === -1) return;
    _handleSelect(idx);
  }

  function _onResize() {
    View.onResize();
  }

  function _addEventListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click',    _onCanvasClick);
    canvas.addEventListener('touchend', _onCanvasTouch, { passive: false });
    window.addEventListener('resize',   _onResize);
  }

  function _removeEventListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.removeEventListener('click',    _onCanvasClick);
    canvas.removeEventListener('touchend', _onCanvasTouch);
    window.removeEventListener('resize',   _onResize);
  }

  // ============================================================
  // チューブ選択・注ぎ処理
  // ============================================================

  function _handleSelect(idx) {
    const result = Model.selectTube(idx);
    View.updateMoves(Model.getMoves());

    switch (result.action) {
      case 'select':
      case 'deselect':
        // 再描画はアニメーションループが行う
        break;

      case 'invalid':
        _isAnimating = true;
        View.startShakeAnimation(idx, () => { _isAnimating = false; });
        break;

      case 'pour':
        _isAnimating = true;
        View.startPourAnimation(result.from, result.to, result.color, result.count, () => {
          _isAnimating = false;
        });
        break;

      case 'won':
        _isAnimating = true;
        View.startPourAnimation(result.from, result.to, result.color, result.count, () => {
          _isAnimating = false;
          View.startWinAnimation();
          setTimeout(() => {
            View.showResult(true, Model.getScore(), Model.getMoves());
          }, 1200);
        });
        break;
    }
  }

  // ============================================================
  // 設定画面のセットアップ
  // ============================================================

  function _setupSettings() {
    const colorSlider   = document.getElementById('color-count');
    const colorDisplay  = document.getElementById('color-count-display');
    const extraSlider   = document.getElementById('extra-tubes');
    const extraDisplay  = document.getElementById('extra-tubes-display');

    colorSlider.addEventListener('input', () => {
      colorDisplay.textContent = colorSlider.value;
    });
    extraSlider.addEventListener('input', () => {
      extraDisplay.textContent = extraSlider.value;
    });

    document.getElementById('start-btn').addEventListener('click', () => {
      startGame(parseInt(colorSlider.value), parseInt(extraSlider.value));
    });

    document.getElementById('restart-btn').addEventListener('click', goToSettings);
    document.getElementById('retry-btn').addEventListener('click', () => {
      const colorSlider  = document.getElementById('color-count');
      const extraSlider  = document.getElementById('extra-tubes');
      startGame(parseInt(colorSlider.value), parseInt(extraSlider.value));
    });
    document.getElementById('back-btn').addEventListener('click', goToSettings);
  }

  // ============================================================
  // 公開 API
  // ============================================================

  function startGame(numColors, extraTubes) {
    _isAnimating = false;
    _removeEventListeners();

    Model.init(numColors, extraTubes);

    const canvas = document.getElementById('game-canvas');
    View.showGameScreen();        // canvas が visible になってから init する
    View.init(canvas);
    View.updateLayout(Model.getNumTubes());
    View.hideResult();
    View.updateMoves(0);

    _addEventListeners();
  }

  function goToSettings() {
    _removeEventListeners();
    View.cleanup();
    View.showSettingsScreen();
  }

  /** ページ読み込み時に呼ぶ */
  function setup() {
    _setupSettings();
    View.showSettingsScreen();
  }

  return {
    startGame,
    goToSettings,
    setup,
  };

})();

// ページ読み込み時にセットアップ
document.addEventListener('DOMContentLoaded', () => Controller.setup());
