/* ============================================================
   Life Game - controller3d.js
   3D モード専用コントローラ
   - ゲームループ  : setInterval（世代更新）
   - 描画ループ    : requestAnimationFrame（Three.js）
   - 絶滅監視      : population=0 が EXTINCT_WAIT 世代続いたら自動復活
   - 自動回転      : IDLE_MS 無操作で地球自転のように Y 軸回転
   ============================================================ */

class LifeController3D {
  // 何世代 population=0 が続いたら復活させるか
  static EXTINCT_WAIT = 4;
  // 何世代パターン変化なしで追加発生させるか
  static STAGNANT_WAIT = 40;
  // 何 ms 無操作で自動回転を開始するか
  static IDLE_MS = 3000;
  // 自動回転速度 (rad/frame, ~60fps → 約 35 秒で一周)
  static AUTO_ROT_SPEED = 0.003;

  constructor(model, view, intervalMs) {
    this.model      = model;
    this.view       = view;
    this.intervalMs = intervalMs;

    this.playing      = false;
    this._timerId     = null;
    this._rafId       = null;
    this._extinctCount  = 0; // population=0 が続いた世代数
    this._stagnantCount = 0; // パターン変化なしが続いた世代数
    this._prevCellHash  = -1;

    // 自動回転: ワールド Y 軸まわりの微小クォータニオン（毎フレーム使い回す）
    this._lastInteraction = Date.now();
    this._autoRotDelta = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 1, 0), LifeController3D.AUTO_ROT_SPEED);

    this._bindEvents();
    this._startRenderLoop();
  }

  // ---- 公開 API ----

  setInterval(ms) {
    this.intervalMs = ms;
    if (this.playing) { this._stopGameLoop(); this._startGameLoop(); }
  }

  play() {
    if (this.playing) return;
    this.playing = true;
    document.getElementById('play-pause-btn').textContent = '⏸';
    document.getElementById('play-pause-btn').classList.add('playing');
    this._startGameLoop();
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    document.getElementById('play-pause-btn').textContent = '▶';
    document.getElementById('play-pause-btn').classList.remove('playing');
    this._stopGameLoop();
  }

  togglePlay() { this.playing ? this.pause() : this.play(); }

  stepOnce() {
    this.pause();
    this._tick();
  }

  randomize() {
    this.pause();
    this.model.randomize();
    this._extinctCount  = 0;
    this._stagnantCount = 0;
    this._prevCellHash  = -1;
    this.view.markDirty();
    this.view.updateHUD(this.model.generation, this.model.population);
  }

  clear() {
    this.pause();
    this.model.clear();
    this._extinctCount  = 0;
    this._stagnantCount = 0;
    this._prevCellHash  = -1;
    this.view.markDirty();
    this.view.updateHUD(this.model.generation, this.model.population);
  }

  destroy() {
    this._stopGameLoop();
    this._stopRenderLoop();
    this._unbindEvents();
    this.view.dispose();
  }

  // ---- ループ ----

  _tick() {
    this.model.step();

    // 絶滅監視: population=0 が EXTINCT_WAIT 世代続いたら自動復活
    if (this.model.population === 0) {
      this._extinctCount++;
      if (this._extinctCount >= LifeController3D.EXTINCT_WAIT) {
        this.model.respawn();
        this._extinctCount  = 0;
        this._stagnantCount = 0;
        this._prevCellHash  = -1;
      }
    } else {
      this._extinctCount = 0;

      // 停滞監視: パターンが変化しない世代が STAGNANT_WAIT 続いたら追加発生
      const hash = this._cellChecksum();
      if (hash === this._prevCellHash) {
        this._stagnantCount++;
        if (this._stagnantCount >= LifeController3D.STAGNANT_WAIT) {
          this.model.respawn();
          this._stagnantCount = 0;
          this._prevCellHash  = -1;
        }
      } else {
        this._stagnantCount = 0;
        this._prevCellHash  = hash;
      }
    }

    this.view.markDirty();
    this.view.updateHUD(this.model.generation, this.model.population);
  }

  // セル配列の軽量チェックサム（変化検出用）
  _cellChecksum() {
    const cells   = this.model.cells;
    const indices = this.model._maskIndices;
    let h = 0;
    for (let k = 0; k < indices.length; k++) {
      if (cells[indices[k]]) h = (Math.imul(h, 31) + indices[k] + 1) | 0;
    }
    return h;
  }

  _startGameLoop() {
    this._timerId = setInterval(() => this._tick(), this.intervalMs);
  }

  _stopGameLoop() {
    if (this._timerId !== null) { clearInterval(this._timerId); this._timerId = null; }
  }

  _startRenderLoop() {
    const loop = () => {
      // アイドル時: ワールド Y 軸まわりに自動回転
      if (Date.now() - this._lastInteraction > LifeController3D.IDLE_MS) {
        const q = this.view.getCamQuat();
        // ワールド空間の Y 回転を左から掛ける（= グローバル軸まわり）
        this.view.setCamQuat(this._autoRotDelta.clone().multiply(q));
      }
      this.view.renderScene();
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  _stopRenderLoop() {
    if (this._rafId !== null) { cancelAnimationFrame(this._rafId); this._rafId = null; }
  }

  // ---- イベント ----

  _bindEvents() {
    const canvas = this.view.canvas;

    // アークボール用状態
    this._dragActive  = false;
    this._dragStartX  = 0;
    this._dragStartY  = 0;
    this._dragMoved   = false;
    this._dragBaseQuat = new THREE.Quaternion();
    this._dragButton  = 0;

    this._onMouseDown = (e) => {
      this._lastInteraction = Date.now();
      if (e.button === 0 || e.button === 2) {
        this._dragActive   = true;
        this._dragMoved    = false;
        this._dragStartX   = e.clientX;
        this._dragStartY   = e.clientY;
        this._dragButton   = e.button;
        this._dragBaseQuat = this.view.getCamQuat();
      }
    };

    this._onMouseMove = (e) => {
      if (!this._dragActive) return;
      this._lastInteraction = Date.now();
      const dx = e.clientX - this._dragStartX;
      const dy = e.clientY - this._dragStartY;
      if (!this._dragMoved && Math.sqrt(dx*dx + dy*dy) > 5) {
        this._dragMoved = true;
      }
      if (this._dragMoved && this._dragButton === 0) {
        this._applyDragRotation(dx, dy);
      }
    };

    this._onMouseUp = (e) => {
      if (!this._dragActive) return;
      if (!this._dragMoved) {
        // クリック: クリック位置にリスポーン
        const cell = this.view.canvasToCellXYZ(e.clientX, e.clientY);
        if (cell) {
          this.model.respawn(cell.x, cell.y, cell.z);
          this._stagnantCount = 0;
          this._prevCellHash  = -1;
          this.view.markDirty();
          this.view.updateHUD(this.model.generation, this.model.population);
        }
      }
      this._dragActive = false;
    };

    canvas.addEventListener('mousedown',   this._onMouseDown);
    window.addEventListener('mousemove',   this._onMouseMove);
    window.addEventListener('mouseup',     this._onMouseUp);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // タッチ用状態
    this._touchActive  = false;
    this._touchStartX  = 0;
    this._touchStartY  = 0;
    this._touchMoved   = false;
    this._touchBaseQuat = new THREE.Quaternion();

    this._onTouchStart = (e) => {
      e.preventDefault();
      this._lastInteraction = Date.now();
      const t = e.touches[0];
      this._touchActive   = true;
      this._touchMoved    = false;
      this._touchStartX   = t.clientX;
      this._touchStartY   = t.clientY;
      this._touchBaseQuat = this.view.getCamQuat();
    };

    this._onTouchMove = (e) => {
      e.preventDefault();
      if (!this._touchActive) return;
      this._lastInteraction = Date.now();
      const t = e.touches[0];
      const dx = t.clientX - this._touchStartX;
      const dy = t.clientY - this._touchStartY;
      if (!this._touchMoved && Math.sqrt(dx*dx + dy*dy) > 8) {
        this._touchMoved = true;
      }
      if (this._touchMoved) {
        this._applyDragRotationFrom(dx, dy, this._touchBaseQuat);
      }
    };

    this._onTouchEnd = (e) => {
      if (!this._touchActive) return;
      if (!this._touchMoved && e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const cell = this.view.canvasToCellXYZ(t.clientX, t.clientY);
        if (cell) {
          this.model.respawn(cell.x, cell.y, cell.z);
          this._stagnantCount = 0;
          this._prevCellHash  = -1;
          this.view.markDirty();
          this.view.updateHUD(this.model.generation, this.model.population);
        }
      }
      this._touchActive = false;
    };

    canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  this._onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   this._onTouchEnd);

    this._onPlayPause = () => this.togglePlay();
    this._onStep      = () => this.stepOnce();
    this._onRandom    = () => this.randomize();
    this._onClear     = () => this.clear();

    document.getElementById('play-pause-btn').addEventListener('click', this._onPlayPause);
    document.getElementById('step-btn')      .addEventListener('click', this._onStep);
    document.getElementById('random-btn')    .addEventListener('click', this._onRandom);
    document.getElementById('clear-btn')     .addEventListener('click', this._onClear);

    this._onResize = () => this.view.resize();
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

    document.getElementById('play-pause-btn').removeEventListener('click', this._onPlayPause);
    document.getElementById('step-btn')      .removeEventListener('click', this._onStep);
    document.getElementById('random-btn')    .removeEventListener('click', this._onRandom);
    document.getElementById('clear-btn')     .removeEventListener('click', this._onClear);

    window.removeEventListener('resize', this._onResize);
  }

  // ---- アークボール回転 ----

  _applyDragRotation(dx, dy) {
    this._applyDragRotationFrom(dx, dy, this._dragBaseQuat);
  }

  _applyDragRotationFrom(dx, dy, baseQuat) {
    const sens  = 0.007;
    const camUp    = new THREE.Vector3(0, 1, 0).applyQuaternion(baseQuat);
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(baseQuat);
    const angle = Math.sqrt(dx*dx + dy*dy) * sens;
    const axis  = new THREE.Vector3()
      .addScaledVector(camUp,    -dx)
      .addScaledVector(camRight, -dy)
      .normalize();
    const rot = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    this.view.setCamQuat(rot.multiply(baseQuat));
  }
}
