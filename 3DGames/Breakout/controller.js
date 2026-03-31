// ============================================================
// Block Breaker - controller.js
// 役割: ゲームループ・入力処理・Model と View の橋渡し
// ============================================================

const Controller = (() => {

  let _animId    = null;
  let _lastTime  = 0;
  let _prevState = null;
  let _is3DMode  = false;

  // ---- ドラッグ回転（3D モード用）----
  const DRAG_THRESHOLD  = 4;    // px
  const ROT_SENSITIVITY = 0.007; // rad/px
  let _dragActive  = false;
  let _dragStartX  = 0;
  let _dragRotBase = 0;
  let _didDrag     = false;

  // ============================================================
  // ゲームループ
  // ============================================================

  function _loop(timestamp) {
    const dt = Math.min((timestamp - _lastTime) / 1000, 1 / 20);
    _lastTime = timestamp;

    Model.update(dt);
    const state = Model.getState();
    View.sync(state);
    View.render();

    if (_prevState !== state.gameState) {
      _onGameStateChange(state.gameState, state.score);
      _prevState = state.gameState;
    }

    _animId = requestAnimationFrame(_loop);
  }

  function _onGameStateChange(newState, score) {
    if (newState === 'gameover') {
      setTimeout(() => View.showGameOver(score, false), 400);
    } else if (newState === 'won') {
      setTimeout(() => View.showGameOver(score, true), 400);
    }
  }

  // ============================================================
  // 入力処理
  // ============================================================

  function _onMouseDown(e) {
    if (!_is3DMode) return;
    _dragActive  = true;
    _dragStartX  = e.clientX;
    _dragRotBase = View.getRotation();
    _didDrag     = false;
  }

  function _onMouseMove(event) {
    Model.setPaddleX(View.screenToWorldX(event.clientX));
    if (_dragActive && _is3DMode) {
      const dx = event.clientX - _dragStartX;
      if (Math.abs(dx) > DRAG_THRESHOLD) _didDrag = true;
      View.setRotation(_dragRotBase + dx * ROT_SENSITIVITY);
    }
  }

  function _onMouseUp() {
    _dragActive = false;
  }

  function _onClick() {
    if (_didDrag) return;
    if (!Model.releaseCaughtBalls()) Model.launchBall();
  }

  function _onTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) Model.setPaddleX(View.screenToWorldX(touch.clientX));
  }

  function _onTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      Model.setPaddleX(View.screenToWorldX(touch.clientX));
      if (_is3DMode) {
        _dragActive  = true;
        _dragStartX  = touch.clientX;
        _dragRotBase = View.getRotation();
        _didDrag     = false;
      }
    }
    if (!Model.releaseCaughtBalls()) Model.launchBall();
  }

  function _onTouchEnd(event) {
    _dragActive = false;
    if (event.changedTouches.length > 0 && _is3DMode) {
      const dx = event.changedTouches[0].clientX - _dragStartX;
      if (Math.abs(dx) > DRAG_THRESHOLD) _didDrag = true;
    }
  }

  function _onContextMenu(e) { e.preventDefault(); }

  function _onResize() { View.onResize(); }

  function _onKeyDown(event) {
    if (event.code === 'Space') {
      if (!Model.releaseCaughtBalls()) Model.launchBall();
    }
  }

  function _addListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('mousedown',   _onMouseDown);
    canvas.addEventListener('mousemove',   _onMouseMove);
    canvas.addEventListener('mouseup',     _onMouseUp);
    canvas.addEventListener('click',       _onClick);
    canvas.addEventListener('touchmove',   _onTouchMove,  { passive: false });
    canvas.addEventListener('touchstart',  _onTouchStart, { passive: false });
    canvas.addEventListener('touchend',    _onTouchEnd);
    canvas.addEventListener('contextmenu', _onContextMenu);
    window.addEventListener('resize',      _onResize);
    window.addEventListener('keydown',     _onKeyDown);
  }

  function _removeListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.removeEventListener('mousedown',   _onMouseDown);
    canvas.removeEventListener('mousemove',   _onMouseMove);
    canvas.removeEventListener('mouseup',     _onMouseUp);
    canvas.removeEventListener('click',       _onClick);
    canvas.removeEventListener('touchmove',   _onTouchMove);
    canvas.removeEventListener('touchstart',  _onTouchStart);
    canvas.removeEventListener('touchend',    _onTouchEnd);
    canvas.removeEventListener('contextmenu', _onContextMenu);
    window.removeEventListener('resize',      _onResize);
    window.removeEventListener('keydown',     _onKeyDown);
  }

  // ============================================================
  // 公開 API
  // ============================================================

  function startGame(difficulty, is3D, numLayers) {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    _is3DMode = !!is3D;

    Model.init(difficulty, is3D, numLayers);
    View.initScene(is3D, numLayers);

    const state = Model.getState();
    View.resetBrickMeshes(state.bricks);
    View.sync(state);
    View.render();

    _prevState = 'ready';
    _lastTime  = performance.now();
    _removeListeners();
    _addListeners();
    _animId = requestAnimationFrame(_loop);
  }

  function retryGame() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }

    Model.init(Model.getDifficulty(), Model.getIs3D(), Model.getNumLayers());
    const state = Model.getState();
    View.resetBrickMeshes(state.bricks);
    View.hideGameOver();
    View.sync(state);
    View.render();

    _prevState = 'ready';
    _lastTime  = performance.now();
    _animId = requestAnimationFrame(_loop);
  }

  function goToSettings() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    _removeListeners();
    View.cleanup();
    View.showSettingsScreen();
  }

  return { startGame, retryGame, goToSettings };

})();
