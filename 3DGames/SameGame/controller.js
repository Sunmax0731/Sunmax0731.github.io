// ============================================================
// SameGame 3D - controller.js
// 役割: ゲーム進行の制御・入力処理・Model と View の橋渡し
//   - Model のゲームロジックを呼び出し、結果を View に渡す
//   - DOM / Three.js には直接触れない
// ============================================================

const Controller = (() => {

  let _isAnimating = false;

  // ---- ドラッグ（カメラ回転）状態 ----
  const DRAG_THRESHOLD   = 4;    // px: これ以上移動したらドラッグ扱い
  const ROT_SENSITIVITY  = 0.007; // rad/px
  let _dragActive    = false; // マウスボタン or タッチ中
  let _dragStartX    = 0;
  let _dragRotYBase  = 0;
  let _didDrag       = false; // ドラッグが発生したら true → click をスキップ

  // ============================================================
  // カメラ回転ヘルパー
  // ============================================================

  function _applyDragRotation(currentX) {
    const delta = currentX - _dragStartX;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      _didDrag = true;
      View.setRotation(_dragRotYBase + delta * ROT_SENSITIVITY);
      View.clearHighlight();
      return true; // 回転中はハイライト更新をスキップ
    }
    return false;
  }

  // ============================================================
  // イベントハンドラ
  // ============================================================

  function _onMouseDown(event) {
    if (Model.getBoardDepth() === 1) return; // 2D モードは回転なし
    _dragActive   = true;
    _dragStartX   = event.clientX;
    _dragRotYBase = View.getRotation();
    _didDrag      = false;
    document.getElementById('game-canvas').style.cursor = 'grab';
  }

  function _onMouseUp() {
    _dragActive = false;
    document.getElementById('game-canvas').style.cursor = 'default';
  }

  function _onMouseMove(event) {
    if (Model.getIsGameOver() || _isAnimating) return;

    // ドラッグ中はカメラ回転のみ
    if (_dragActive && _applyDragRotation(event.clientX)) {
      document.getElementById('game-canvas').style.cursor = 'grabbing';
      return;
    }

    // ホバーハイライト
    const cell   = View.getHoveredCell(event.clientX, event.clientY);
    const canvas = document.getElementById('game-canvas');
    if (cell) {
      const group = Model.findGroup(cell.row, cell.col, cell.depth);
      View.highlightGroup(group);
      canvas.style.cursor = group.length >= 2 ? 'pointer' : 'not-allowed';
    } else {
      View.clearHighlight();
      View.setInfo('ブロックをクリックして消そう！');
      canvas.style.cursor = _dragActive ? 'grab' : 'default';
    }
  }

  function _onMouseClick(event) {
    // ドラッグ終了直後の click は無視
    if (_didDrag) { _didDrag = false; return; }
    _handleSelect(event.clientX, event.clientY);
  }

  function _onTouchStart(event) {
    event.preventDefault();
    if (Model.getIsGameOver() || _isAnimating) return;
    const touch = event.touches[0];
    if (!touch) return;

    if (Model.getBoardDepth() > 1) { // 3D モードのみドラッグ回転を有効化
      _dragActive   = true;
      _dragStartX   = touch.clientX;
      _dragRotYBase = View.getRotation();
      _didDrag      = false;
    }

    const cell = View.getHoveredCell(touch.clientX, touch.clientY);
    if (cell) View.highlightGroup(Model.findGroup(cell.row, cell.col, cell.depth));
    else      { View.clearHighlight(); View.setInfo('ブロックをクリックして消そう！'); }
  }

  function _onTouchMove(event) {
    event.preventDefault();
    if (Model.getIsGameOver() || _isAnimating) return;
    const touch = event.touches[0];
    if (!touch) return;

    // 横スワイプ → カメラ回転
    if (_applyDragRotation(touch.clientX)) return;

    // 小移動 → ハイライト更新
    const cell = View.getHoveredCell(touch.clientX, touch.clientY);
    if (cell) View.highlightGroup(Model.findGroup(cell.row, cell.col, cell.depth));
    else      { View.clearHighlight(); View.setInfo('ブロックをクリックして消そう！'); }
  }

  function _onTouchEnd(event) {
    _dragActive = false;
    // ドラッグなしのタップ → ブロック選択
    if (!_didDrag) {
      const touch = event.changedTouches[0];
      if (touch) _handleSelect(touch.clientX, touch.clientY);
    }
    _didDrag = false;
  }

  function _onResize() {
    View.onResize();
  }

  function _addEventListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('mousedown',  _onMouseDown);
    canvas.addEventListener('mousemove',  _onMouseMove);
    canvas.addEventListener('click',      _onMouseClick);
    canvas.addEventListener('touchstart', _onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  _onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   _onTouchEnd,   { passive: false });
    window.addEventListener('mouseup',    _onMouseUp);
    window.addEventListener('resize',     _onResize);
  }

  function _removeEventListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.removeEventListener('mousedown',  _onMouseDown);
    canvas.removeEventListener('mousemove',  _onMouseMove);
    canvas.removeEventListener('click',      _onMouseClick);
    canvas.removeEventListener('touchstart', _onTouchStart);
    canvas.removeEventListener('touchmove',  _onTouchMove);
    canvas.removeEventListener('touchend',   _onTouchEnd);
    window.removeEventListener('mouseup',    _onMouseUp);
    window.removeEventListener('resize',     _onResize);
  }

  // ============================================================
  // ブロック選択処理（クリック・タップ共通）
  // ============================================================

  function _handleSelect(clientX, clientY) {
    if (Model.getIsGameOver() || _isAnimating) return;

    const cell = View.getHoveredCell(clientX, clientY);
    if (!cell) return;

    const group = Model.findGroup(cell.row, cell.col, cell.depth);
    if (group.length < 2) { View.setInfo('単独ブロックは消せません'); return; }

    View.clearHighlight();
    _isAnimating = true;

    View.startRemoveAnimation(group, () => {
      Model.removeGroup(group);
      View.updateScore(Model.getScore());

      const { gravMap, shiftMap } = Model.applyPhysics();
      View.updateColorCounter(Model.getColorCounts(), Model.getColorCount());

      View.startFallAnimation(gravMap, shiftMap, Model.getBoardHeight(), Model.getBoardDepth(), () => {
        _isAnimating = false;
        const result = Model.checkGameOver();

        if (result.isOver) {
          View.updateScore(Model.getScore());
          View.showGameOver(
            Model.getScore(),
            result.remaining,
            result.isPerfect,
            Model.getColorCounts(),
            Model.getColorCount()
          );
        } else {
          View.setInfo('ブロックをクリックして消そう！');
        }
      });
    });
  }

  // ============================================================
  // 公開 API
  // ============================================================

  function startGame(colors, width, height, depth) {
    _isAnimating = false;
    _didDrag     = false;
    _dragActive  = false;

    Model.init(colors, width, height, depth);
    View.initScene(Model.getBoardWidth(), Model.getBoardHeight(), Model.getBoardDepth());
    View.rebuildMeshes(Model.getBoard(), Model.getBoardWidth(), Model.getBoardHeight(), Model.getBoardDepth());
    View.updateScore(Model.getScore());
    View.updateColorCounter(Model.getColorCounts(), Model.getColorCount());
    View.setInfo('ブロックをクリックして消そう！');

    _addEventListeners();
  }

  function goToSettings() {
    _removeEventListeners();
    View.cleanup();
    View.showSettingsScreen();
  }

  return {
    startGame,
    goToSettings,
  };

})();
