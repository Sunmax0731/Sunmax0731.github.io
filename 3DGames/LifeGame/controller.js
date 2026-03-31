/* ============================================================
   Life Game - controller.js
   ゲームループ・ユーザー操作
   ============================================================ */

class LifeController {
  constructor(model, view, intervalMs) {
    this.model      = model;
    this.view       = view;
    this.intervalMs = intervalMs;

    this.playing    = false;
    this._timerId   = null;
    this._lastTime  = 0;

    this._drawing   = false;  // ドラッグ中フラグ
    this._drawValue = 1;      // 描画する値（1=生、0=死）

    this._bindEvents();
    this._render();
  }

  // ---- 公開 API ----

  setInterval(ms) {
    this.intervalMs = ms;
    if (this.playing) {
      this._stopLoop();
      this._startLoop();
    }
  }

  play() {
    if (this.playing) return;
    this.playing = true;
    document.getElementById('play-pause-btn').textContent = '⏸';
    document.getElementById('play-pause-btn').classList.add('playing');
    this._startLoop();
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    document.getElementById('play-pause-btn').textContent = '▶';
    document.getElementById('play-pause-btn').classList.remove('playing');
    this._stopLoop();
  }

  togglePlay() {
    this.playing ? this.pause() : this.play();
  }

  stepOnce() {
    this.pause();
    this.model.step();
    this._render();
  }

  randomize() {
    this.pause();
    this.model.randomize();
    this._render();
  }

  clear() {
    this.pause();
    this.model.clear();
    this._render();
  }

  destroy() {
    this._stopLoop();
    this._unbindEvents();
  }

  // ---- 内部 ----

  _startLoop() {
    this._timerId = setInterval(() => {
      this.model.step();
      this._render();
    }, this.intervalMs);
  }

  _stopLoop() {
    if (this._timerId !== null) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  _render() {
    this.view.render();
    this.view.updateHUD(this.model.generation, this.model.population);
  }

  _bindEvents() {
    const canvas = this.view.canvas;

    // マウス
    this._onMouseDown = (e) => this._startDraw(e.clientX, e.clientY, e.button);
    this._onMouseMove = (e) => {
      if (this._drawing) this._draw(e.clientX, e.clientY);
    };
    this._onMouseUp   = () => { this._drawing = false; };

    canvas.addEventListener('mousedown',      this._onMouseDown);
    window.addEventListener('mousemove',      this._onMouseMove);
    window.addEventListener('mouseup',        this._onMouseUp);
    canvas.addEventListener('contextmenu',    (e) => e.preventDefault());

    // タッチ
    this._onTouchStart = (e) => {
      e.preventDefault();
      const t = e.touches[0];
      this._startDraw(t.clientX, t.clientY, 0);
    };
    this._onTouchMove = (e) => {
      e.preventDefault();
      if (this._drawing) {
        const t = e.touches[0];
        this._draw(t.clientX, t.clientY);
      }
    };
    this._onTouchEnd = () => { this._drawing = false; };

    canvas.addEventListener('touchstart',     this._onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',      this._onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',       this._onTouchEnd);

    // ボタン
    document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePlay());
    document.getElementById('step-btn').addEventListener('click',       () => this.stepOnce());
    document.getElementById('random-btn').addEventListener('click',     () => this.randomize());
    document.getElementById('clear-btn').addEventListener('click',      () => this.clear());

    // リサイズ
    this._onResize = () => {
      this.view.resize();
      this._render();
    };
    window.addEventListener('resize', this._onResize);
  }

  _unbindEvents() {
    const canvas = this.view.canvas;
    canvas.removeEventListener('mousedown',   this._onMouseDown);
    window.removeEventListener('mousemove',   this._onMouseMove);
    window.removeEventListener('mouseup',     this._onMouseUp);
    canvas.removeEventListener('touchstart',  this._onTouchStart);
    canvas.removeEventListener('touchmove',   this._onTouchMove);
    canvas.removeEventListener('touchend',    this._onTouchEnd);
    window.removeEventListener('resize',      this._onResize);
  }

  _startDraw(clientX, clientY, button) {
    const { col, row } = this.view.canvasToCell(clientX, clientY);
    // 右クリックで消去、左クリックで描画
    const currentVal = this.model.get(col, row);
    this._drawValue = (button === 2) ? 0 : (currentVal ? 0 : 1);
    this._drawing = true;
    this._applyDraw(col, row);
  }

  _draw(clientX, clientY) {
    const { col, row } = this.view.canvasToCell(clientX, clientY);
    this._applyDraw(col, row);
  }

  _applyDraw(col, row) {
    if (col < 0 || col >= this.model.cols || row < 0 || row >= this.model.rows) return;
    this.model.set(col, row, this._drawValue);
    // ドラッグ中はループ外でも毎フレーム描画
    if (!this.playing) this._render();
  }
}
