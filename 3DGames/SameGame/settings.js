// ============================================================
// SameGame 3D - settings.js
// 役割: 設定画面のUIのみを担う
//   - スライダー操作・プレビュー表示
//   - 2D/3D モード切り替え
//   - 設定値の収集
//   - ボタンから Controller への橋渡し
// ============================================================

// ---- DOM 参照 ----
const _colorCountSlider  = document.getElementById('color-count');
const _colorCountDisplay = document.getElementById('color-count-display');
const _colorPreviewDiv   = document.getElementById('color-preview');
const _boardWidthInput   = document.getElementById('board-width');
const _boardHeightInput  = document.getElementById('board-height');
const _boardDepthInput   = document.getElementById('board-depth');
const _boardWidthDisplay  = document.getElementById('board-width-display');
const _boardHeightDisplay = document.getElementById('board-height-display');
const _boardDepthDisplay  = document.getElementById('board-depth-display');
const _depthGroup         = document.getElementById('depth-group');
const _mode2dBtn          = document.getElementById('mode-2d-btn');
const _mode3dBtn          = document.getElementById('mode-3d-btn');

let _is3DMode = false;

// ============================================================
// モード切り替え
// ============================================================

_mode2dBtn.addEventListener('click', () => {
  _is3DMode = false;
  _mode2dBtn.classList.add('active');
  _mode3dBtn.classList.remove('active');
  _depthGroup.style.display = 'none';
});

_mode3dBtn.addEventListener('click', () => {
  _is3DMode = true;
  _mode3dBtn.classList.add('active');
  _mode2dBtn.classList.remove('active');
  _depthGroup.style.display = 'block';
});

// ============================================================
// スライダー プレビュー更新
// ============================================================

function _updateColorPreview(count) {
  _colorCountDisplay.textContent = count;
  _colorPreviewDiv.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'color-swatch';
    s.style.background = BLOCK_COLORS_CSS[i];
    _colorPreviewDiv.appendChild(s);
  }
}

_colorCountSlider.addEventListener('input', () =>
  _updateColorPreview(parseInt(_colorCountSlider.value)));

_boardWidthInput.addEventListener('input', () =>
  _boardWidthDisplay.textContent = _boardWidthInput.value);

_boardHeightInput.addEventListener('input', () =>
  _boardHeightDisplay.textContent = _boardHeightInput.value);

_boardDepthInput.addEventListener('input', () =>
  _boardDepthDisplay.textContent = _boardDepthInput.value);

// 初期表示
_updateColorPreview(parseInt(_colorCountSlider.value));

// ============================================================
// 設定値の収集
// ============================================================

function _getSettings() {
  return {
    colorCount : parseInt(_colorCountSlider.value),
    boardWidth : Math.min(20, Math.max(5,  parseInt(_boardWidthInput.value)  || 10)),
    boardHeight: Math.min(20, Math.max(5,  parseInt(_boardHeightInput.value) || 10)),
    boardDepth : _is3DMode
      ? Math.min(6,  Math.max(2,  parseInt(_boardDepthInput.value) || 3))
      : 1,
  };
}

// ============================================================
// ボタンイベント
// ============================================================

document.getElementById('start-btn').addEventListener('click', () => {
  const s = _getSettings();
  View.showGameScreen();
  Controller.startGame(s.colorCount, s.boardWidth, s.boardHeight, s.boardDepth);
});

document.getElementById('restart-btn').addEventListener('click', () => {
  Controller.goToSettings();
});

document.getElementById('back-btn').addEventListener('click', () => {
  Controller.goToSettings();
});

document.getElementById('retry-btn').addEventListener('click', () => {
  const s = _getSettings();
  View.hideGameOver();
  Controller.startGame(s.colorCount, s.boardWidth, s.boardHeight, s.boardDepth);
});
