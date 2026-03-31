// ============================================================
// Minesweeper - controller.js
// 蠖ｹ蜑ｲ: 繧ｲ繝ｼ繝繝ｫ繝ｼ繝励・蜈･蜉帛・逅・・Model 縺ｨ View 縺ｮ讖区ｸ｡縺・// ============================================================

const Controller = (() => {

  let _animId    = null;
  let _flagMode  = false;
  let _shapeType = 'flat';

  // 逅・ｽ薙き繝｡繝ｩ繝峨Λ繝・げ
  let _dragActive = false;
  let _dragStartX = 0, _dragStartY = 0;
  let _dragBaseQuat = new THREE.Quaternion();
  let _dragDist = 0;

  // ============================================================
  // 繧ｲ繝ｼ繝繝ｫ繝ｼ繝・  // ============================================================

  function _loop() {
    _animId = requestAnimationFrame(_loop);
    if (Model.getGameState() === 'playing') View.updateHUD(Model.getState());
    View.render();
  }

  // ============================================================
  // 繧ｻ繝ｫ繧｢繧ｯ繧ｷ繝ｧ繝ｳ
  // ============================================================

  function _handleReveal(clientX, clientY) {
    const hit = View.screenToCell(clientX, clientY);
    if (!hit) return;
    const { cellIdx } = hit;
    const gs = Model.getGameState();
    if (gs !== 'ready' && gs !== 'playing') return;

    if (_flagMode) {
      const r = Model.flagCell(cellIdx);
      if (r) View.updateCell(r.cellIdx, Model.getCell(r.cellIdx));
      View.updateHUD(Model.getState());
      return;
    }

    const cell   = Model.getCell(cellIdx);
    const result = cell.revealed
      ? Model.chordReveal(cellIdx)
      : Model.revealCell(cellIdx);

    if (result.changed.length) {
      View.updateCells(result.changed, Model.getCells());
      View.updateHUD(Model.getState());
    }
    if (result.gameOver) {
      View.revealAllMines(Model.getCells(), Model.getState().explodedCell);
      setTimeout(() => View.showGameOver(Model.getState(), false), 700);
    } else if (result.won) {
      setTimeout(() => View.showGameOver(Model.getState(), true), 400);
    }
  }

  function _handleFlag(clientX, clientY) {
    const hit = View.screenToCell(clientX, clientY);
    if (!hit) return;
    const gs = Model.getGameState();
    if (gs !== 'ready' && gs !== 'playing') return;
    const r = Model.flagCell(hit.cellIdx);
    if (r) View.updateCell(r.cellIdx, Model.getCell(r.cellIdx));
    View.updateHUD(Model.getState());
  }

  // ============================================================
  // 繝槭え繧ｹ繧､繝吶Φ繝・  // ============================================================

  const _is3D = () => _shapeType !== 'flat';

  // 3D モード時のドラッグ回転処理
  function _applyDragRotation(dx, dy) {
    if (dx === 0 && dy === 0) return;
    const sens = 0.007;
    const camUp    = new THREE.Vector3(0, 1, 0).applyQuaternion(_dragBaseQuat);
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(_dragBaseQuat);
    const angle = Math.sqrt(dx * dx + dy * dy) * sens;
    const axis  = new THREE.Vector3()
      .addScaledVector(camUp,   -dx)   // 蜿ｳ繝峨Λ繝・げ 竊・camUp騾・婿蜷代・霆ｸ
      .addScaledVector(camRight, -dy)  // 荳九ラ繝ｩ繝・げ 竊・camRight騾・婿蜷代・霆ｸ
      .normalize();
    View.setCamQuat(new THREE.Quaternion().setFromAxisAngle(axis, angle).multiply(_dragBaseQuat));
  }

  function _onMouseDown(e) {
    if (!_is3D() || e.button !== 0) return;
    _dragActive   = true;
    _dragDist     = 0;
    _dragStartX   = e.clientX;
    _dragStartY   = e.clientY;
    _dragBaseQuat = View.getCamQuat();
  }

  function _onMouseMove(e) {
    if (!_dragActive || !_is3D()) return;
    const dx = e.clientX - _dragStartX;
    const dy = e.clientY - _dragStartY;
    _dragDist = Math.sqrt(dx*dx + dy*dy);
    _applyDragRotation(dx, dy);
  }

  function _onMouseUp() { _dragActive = false; }

  function _onClick(e) {
    if (e.button !== 0) return;
    if (_is3D() && _dragDist > 5) return;
    _handleReveal(e.clientX, e.clientY);
  }

  function _onContextMenu(e) {
    e.preventDefault();
    _handleFlag(e.clientX, e.clientY);
  }

  // ============================================================
  // 繧ｿ繝・メ繧､繝吶Φ繝・  // ============================================================

  function _onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    _dragActive = true;
    _dragDist   = 0;
    _dragStartX = e.touches[0].clientX;
    _dragStartY = e.touches[0].clientY;
    if (_is3D()) {
      _dragBaseQuat = View.getCamQuat();
    }
  }

  function _onTouchMove(e) {
    e.preventDefault();
    if (!_dragActive || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - _dragStartX;
    const dy = e.touches[0].clientY - _dragStartY;
    _dragDist = Math.sqrt(dx*dx + dy*dy);
    if (_is3D()) {
      _applyDragRotation(dx, dy);
    }
  }

  function _onTouchEnd(e) {
    e.preventDefault();
    _dragActive = false;
    if (_dragDist < 8) {
      const touch = e.changedTouches[0];
      if (touch) _handleReveal(touch.clientX, touch.clientY);
    }
  }

  function _onResize() { View.onResize(); }

  function _onFlagToggle() {
    _flagMode = !_flagMode;
    const btn = document.getElementById('flag-toggle-btn');
    if (_flagMode) { btn.textContent = '🚩 フラグ'; btn.classList.add('active'); }
    else           { btn.textContent = '🔍 開放';   btn.classList.remove('active'); }
  }

  // ============================================================
  // 繝ｪ繧ｹ繝翫・邂｡逅・  // ============================================================

  function _addListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click',       _onClick);
    canvas.addEventListener('contextmenu', _onContextMenu);
    canvas.addEventListener('touchstart',  _onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',   _onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',    _onTouchEnd,   { passive: false });
    if (_is3D()) {
      canvas.addEventListener('mousedown', _onMouseDown);
      canvas.addEventListener('mousemove', _onMouseMove);
      canvas.addEventListener('mouseup',   _onMouseUp);
    }
    window.addEventListener('resize', _onResize);
    document.getElementById('flag-toggle-btn').addEventListener('click', _onFlagToggle);
  }

  function _removeListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.removeEventListener('click',       _onClick);
    canvas.removeEventListener('contextmenu', _onContextMenu);
    canvas.removeEventListener('touchstart',  _onTouchStart);
    canvas.removeEventListener('touchmove',   _onTouchMove);
    canvas.removeEventListener('touchend',    _onTouchEnd);
    canvas.removeEventListener('mousedown',   _onMouseDown);
    canvas.removeEventListener('mousemove',   _onMouseMove);
    canvas.removeEventListener('mouseup',     _onMouseUp);
    window.removeEventListener('resize',      _onResize);
    const btn = document.getElementById('flag-toggle-btn');
    if (btn) btn.removeEventListener('click', _onFlagToggle);
  }

  // ============================================================
  // 蜈ｬ髢・API
  // ============================================================

  function startGame(difficulty, shapeType) {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    _shapeType = shapeType || 'flat';
    _flagMode  = false;
    _resetFlagBtn();

    Model.init(difficulty, _shapeType);
    View.initScene(Model.getTopology());
    View.updateHUD(Model.getState());
    View.render();

    _removeListeners();
    _addListeners();
    _animId = requestAnimationFrame(_loop);
  }

  function retryGame() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    _flagMode  = false;
    _resetFlagBtn();

    _shapeType = Model.getShapeType();
    Model.init(Model.getDifficulty(), _shapeType);
    View.initScene(Model.getTopology());
    View.hideGameOver();
    View.updateHUD(Model.getState());
    View.render();

    _animId = requestAnimationFrame(_loop);
  }

  function goToSettings() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    _removeListeners();
    View.cleanup();
    View.showSettingsScreen();
  }

  function _resetFlagBtn() {
    const btn = document.getElementById('flag-toggle-btn');
    if (btn) { btn.textContent = '🔍 開放'; btn.classList.remove('active'); }
  }

  return { startGame, retryGame, goToSettings };

})();

