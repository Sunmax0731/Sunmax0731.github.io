/* ============================================================
   2048 3D - controller.js

   操作:
     キーボード  WASD / 矢印キー : 左 / 右 / 上 / 下
               スクロールアップ : 手前へ（forward） ※3D のみ
               スクロールダウン : 奥へ（backward）  ※3D のみ
     スマホ     1本指スワイプ   : 左 / 右 / 上 / 下
               2本指ピンチアウト: 手前へ             ※3D のみ
               2本指ピンチイン  : 奥へ               ※3D のみ
   ============================================================ */

class Controller {
  constructor(config = {}) {
    const { size = 4, depth = 4, is3D = true } = config;
    this._is3D = is3D;
    this._ac   = new AbortController();

    this.model = new Model(size, depth);
    this.view  = new View(config);
    this.best  = parseInt(localStorage.getItem('2048-best') || '0');

    this._render();
    this._bindEvents();
  }

  _render() {
    if (this.model.score > this.best) {
      this.best = this.model.score;
      localStorage.setItem('2048-best', this.best);
    }
    this.view.render(this.model, this.best);
  }

  _move(direction) {
    const { moved } = this.model.move(direction);
    if (moved) this._render();
  }

  _newGame() {
    this.model.reset();
    this.view.clearTiles();
    this._render();
  }

  destroy() {
    this._ac.abort();
    this.view.destroy();
  }

  _bindEvents() {
    const { signal } = this._ac;
    const opts       = { signal };

    /* ---- キーボード ----
       e.key  : 通常環境
       e.keyCode : IME アクティブ時や一部環境でのフォールバック */
    const keyMap = {
      ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      a: 'left', A: 'left', d: 'right', D: 'right',
      w: 'up',   W: 'up',   s: 'down',  S: 'down',
    };
    const codeMap = {
      37: 'left', 39: 'right', 38: 'up', 40: 'down',  // 矢印
      65: 'left', 68: 'right', 87: 'up', 83: 'down',  // WASD
    };

    document.addEventListener('keydown', e => {
      if (e.isComposing) return;                        // IME 変換中は無視
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const dir = keyMap[e.key] || codeMap[e.keyCode];
      if (dir) {
        e.preventDefault();
        this._move(dir);
      }
    }, opts);

    /* ---- スクロール（奥行き操作 / 3D のみ） ---- */
    if (this._is3D) {
      let scrollCooldown = false;
      window.addEventListener('wheel', e => {
        e.preventDefault();
        if (scrollCooldown) return;
        scrollCooldown = true;
        setTimeout(() => { scrollCooldown = false; }, 160);
        this._move(e.deltaY > 0 ? 'backward' : 'forward');
      }, { ...opts, passive: false });
    }

    /* ---- ボタン ---- */
    document.getElementById('btn-new')  .addEventListener('click', () => this._newGame(), opts);
    document.getElementById('btn-retry').addEventListener('click', () => this._newGame(), opts);

    /* ---- タッチ ---- */
    this._bindTouch(opts);

    /* ---- リサイズ ---- */
    window.addEventListener('resize', () => this.view.refreshSizes(), opts);
  }

  _bindTouch(opts) {
    /* 1本指スワイプ → 左右上下
       2本指ピンチ   → 手前 / 奥（3D のみ） */

    let swipeStart    = null;
    let pinchStart    = null;
    let pinchCooldown = false;
    const SWIPE_MIN   = 35;
    const PINCH_MIN   = 45;

    const dist2 = t =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    window.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        pinchStart = null;
      } else if (e.touches.length === 2 && this._is3D) {
        swipeStart = null;
        pinchStart = dist2(e.touches);
      }
    }, { ...opts, passive: true });

    window.addEventListener('touchmove', e => {
      if (e.touches.length === 2 && this._is3D && pinchStart !== null) {
        if (pinchCooldown) return;
        const d     = dist2(e.touches);
        const delta = d - pinchStart;
        if (Math.abs(delta) >= PINCH_MIN) {
          pinchCooldown = true;
          setTimeout(() => { pinchCooldown = false; }, 300);
          this._move(delta > 0 ? 'forward' : 'backward');
          pinchStart = d;
        }
      }
    }, { ...opts, passive: true });

    window.addEventListener('touchend', e => {
      if (e.changedTouches.length === 1 && swipeStart !== null) {
        const dx = e.changedTouches[0].clientX - swipeStart.x;
        const dy = e.changedTouches[0].clientY - swipeStart.y;
        if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          this._move(dx > 0 ? 'right' : 'left');
        } else {
          this._move(dy > 0 ? 'down' : 'up');
        }
      }
      swipeStart = null;
    }, { ...opts, passive: true });
  }
}
