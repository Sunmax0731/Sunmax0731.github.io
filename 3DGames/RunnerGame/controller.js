// ============================================================
// RunnerGame - controller.js
// 役割: ゲームループ・入力処理・Model と View の橋渡し
// ============================================================

const Controller = (() => {

  let _animId      = null;
  let _lastTime    = 0;
  let _inputDx     = 0;  // 現フレームの横入力 (-1〜1)

  // ---- タッチ/ドラッグ入力 ----
  let _touchStartX = null;
  let _prevTouchX  = null;

  // ============================================================
  // ゲームループ
  // ============================================================

  function _gameLoop(timestamp) {
    _animId = requestAnimationFrame(_gameLoop);

    const dt = Math.min((timestamp - _lastTime) / 1000, 0.05); // 最大 50ms でクランプ
    _lastTime = timestamp;

    const { events } = Model.update(dt, _inputDx);
    _inputDx = 0; // 毎フレームリセット（キーボード入力はここで上書きされる）

    // イベント処理
    for (const ev of events) {
      if (ev.type === 'coin') {
        View.flash('rgb(241,196,15)', 0.25, 200);
      } else if (ev.type === 'obstacle') {
        View.flash('rgb(231,76,60)', 0.35, 300);
      } else if (ev.type === 'gate') {
        const color = ev.op === '+' || ev.op === '*' ? 'rgb(46,204,113)' : 'rgb(231,76,60)';
        View.flash(color, 0.3, 250);
      } else if (ev.type === 'gameover') {
        cancelAnimationFrame(_animId);
        _animId = null;
        setTimeout(() => {
          View.showResult(false, Model.getScore(), Model.getPlayer().crowd);
        }, 600);
        break;
      } else if (ev.type === 'goal') {
        cancelAnimationFrame(_animId);
        _animId = null;
        setTimeout(() => {
          View.showResult(true, Model.getScore(), Model.getPlayer().crowd);
        }, 800);
        break;
      }
    }

    // 描画
    View.render(
      Model.getPlayer(),
      Model.getObstacles(),
      Model.getGates(),
      Model.getCoins(),
      Model.getGoal()
    );

    // HUD 更新
    const player = Model.getPlayer();
    View.updateHUD(player.crowd, Model.getScore(), Model.getProgress());
  }

  // ============================================================
  // 入力ハンドラ
  // ============================================================

  // ---- キーボード ----
  let _keysDown = {};

  function _onKeyDown(e) {
    _keysDown[e.code] = true;
  }
  function _onKeyUp(e) {
    _keysDown[e.code] = false;
  }

  function _readKeyboardInput() {
    if (_keysDown['ArrowLeft']  || _keysDown['KeyA']) return -1;
    if (_keysDown['ArrowRight'] || _keysDown['KeyD']) return  1;
    return 0;
  }

  // ---- タッチ/マウス ----
  function _onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    _touchStartX = touch.clientX;
    _prevTouchX  = touch.clientX;
  }

  function _onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    if (_prevTouchX === null) { _prevTouchX = touch.clientX; return; }
    const delta = touch.clientX - _prevTouchX;
    _inputDx = Math.max(-1, Math.min(1, delta / 15)); // 15px で最大速度
    _prevTouchX = touch.clientX;
  }

  function _onTouchEnd(e) {
    _touchStartX = null;
    _prevTouchX  = null;
  }

  // ---- マウス（デスクトップ対応） ----
  let _mouseDown = false;
  function _onMouseDown(e) { _mouseDown = true; _prevTouchX = e.clientX; }
  function _onMouseMove(e) {
    if (!_mouseDown) return;
    const delta = e.clientX - _prevTouchX;
    _inputDx    = Math.max(-1, Math.min(1, delta / 15));
    _prevTouchX = e.clientX;
  }
  function _onMouseUp() { _mouseDown = false; _prevTouchX = null; }

  // ---- キーボード入力はゲームループ内で毎フレーム読む ----
  const _originalGameLoop = _gameLoop;

  function _addEventListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('touchstart', _onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  _onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   _onTouchEnd,   { passive: false });
    canvas.addEventListener('mousedown',  _onMouseDown);
    window.addEventListener('mousemove',  _onMouseMove);
    window.addEventListener('mouseup',    _onMouseUp);
    window.addEventListener('keydown',    _onKeyDown);
    window.addEventListener('keyup',      _onKeyUp);
    window.addEventListener('resize',     _onResize);
  }

  function _removeEventListeners() {
    const canvas = document.getElementById('game-canvas');
    canvas.removeEventListener('touchstart', _onTouchStart);
    canvas.removeEventListener('touchmove',  _onTouchMove);
    canvas.removeEventListener('touchend',   _onTouchEnd);
    canvas.removeEventListener('mousedown',  _onMouseDown);
    window.removeEventListener('mousemove',  _onMouseMove);
    window.removeEventListener('mouseup',    _onMouseUp);
    window.removeEventListener('keydown',    _onKeyDown);
    window.removeEventListener('keyup',      _onKeyUp);
    window.removeEventListener('resize',     _onResize);
  }

  function _onResize() {
    View.onResize();
  }

  // ============================================================
  // 設定画面のセットアップ
  // ============================================================

  function _setupSettings() {
    // 難易度ボタン
    document.querySelectorAll('.mode-btn[data-diff]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn[data-diff]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.getElementById('start-btn').addEventListener('click', () => {
      const active = document.querySelector('.mode-btn[data-diff].active');
      const diff   = active ? active.dataset.diff : 'normal';
      startGame(diff);
    });

    document.getElementById('restart-btn').addEventListener('click', goToSettings);
    document.getElementById('retry-btn').addEventListener('click', () => {
      const active = document.querySelector('.mode-btn[data-diff].active');
      const diff   = active ? active.dataset.diff : 'normal';
      startGame(diff);
    });
    document.getElementById('back-btn').addEventListener('click', goToSettings);
  }

  // ============================================================
  // 公開 API
  // ============================================================

  function startGame(difficulty) {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    _removeEventListeners();
    _keysDown = {};
    _inputDx  = 0;

    Model.init(difficulty);

    const canvas = document.getElementById('game-canvas');
    View.showGameScreen();        // canvas が visible になってから init する
    View.init(canvas);
    View.render(Model.getPlayer(), Model.getObstacles(), Model.getGates(), Model.getCoins(), Model.getGoal());
    View.updateHUD(Model.getPlayer().crowd, Model.getScore(), Model.getProgress());

    _addEventListeners();

    _lastTime = performance.now();
    _animId = requestAnimationFrame(function mainLoop(ts) {
      const kbDx = _readKeyboardInput();
      if (kbDx !== 0) _inputDx = kbDx;

      const dt = Math.min((ts - _lastTime) / 1000, 0.05);
      _lastTime = ts;

      const { events } = Model.update(dt, _inputDx);
      _inputDx = 0;

      for (const ev of events) {
        if (ev.type === 'coin') {
          View.flash('rgb(241,196,15)', 0.25, 200);
        } else if (ev.type === 'obstacle') {
          View.flash('rgb(231,76,60)', 0.35, 300);
        } else if (ev.type === 'gate') {
          const color = (ev.op === '+' || ev.op === '*') ? 'rgb(46,204,113)' : 'rgb(231,76,60)';
          View.flash(color, 0.3, 250);
        } else if (ev.type === 'gameover') {
          cancelAnimationFrame(_animId);
          _animId = null;
          View.render(Model.getPlayer(), Model.getObstacles(), Model.getGates(), Model.getCoins(), Model.getGoal());
          setTimeout(() => View.showResult(false, Model.getScore(), Model.getPlayer().crowd), 600);
          return;
        } else if (ev.type === 'goal') {
          cancelAnimationFrame(_animId);
          _animId = null;
          View.render(Model.getPlayer(), Model.getObstacles(), Model.getGates(), Model.getCoins(), Model.getGoal());
          setTimeout(() => View.showResult(true, Model.getScore(), Model.getPlayer().crowd), 800);
          return;
        }
      }

      View.render(Model.getPlayer(), Model.getObstacles(), Model.getGates(), Model.getCoins(), Model.getGoal());

      const player = Model.getPlayer();
      View.updateHUD(player.crowd, Model.getScore(), Model.getProgress());

      _animId = requestAnimationFrame(mainLoop);
    });
  }

  function goToSettings() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    _removeEventListeners();
    View.showSettingsScreen();
  }

  function setup() {
    _setupSettings();
    View.showSettingsScreen();
  }

  return { startGame, goToSettings, setup };

})();

document.addEventListener('DOMContentLoaded', () => Controller.setup());
