/* ============================================================
   2048 3D - view.js  (Three.js)

   ブロック構造:
     BoxGeometry の 6 面に別マテリアルを割り当て
       +z (index 4) = 数字テクスチャ（手前面）
       +y (index 2) = 明るい面（上面）
       +x (index 0) = やや暗い面（右側面）
       その他       = 暗い面

   アニメーション:
     位置 → lerp で滑らか移動
     スケール → lerp（出現: 0→1、マージ: 1.3→1）
   ============================================================ */

/* ---- タイル配色テーブル ---- */
const TILE_COLORS = {
  2:    { bg: '#3D3355', text: '#E8DEF8' },
  4:    { bg: '#4F3F6F', text: '#E8DEF8' },
  8:    { bg: '#6B4FA0', text: '#EADDFF' },
  16:   { bg: '#7D5FBF', text: '#EADDFF' },
  32:   { bg: '#9370DB', text: '#ffffff' },
  64:   { bg: '#A855F7', text: '#ffffff' },
  128:  { bg: '#C084FC', text: '#1C0033' },
  256:  { bg: '#D0BCFF', text: '#1C0033' },
  512:  { bg: '#E9D5FF', text: '#1C0033' },
  1024: { bg: '#F3E8FF', text: '#1C0033' },
  2048: { bg: '#ffffff', text: '#1C0033' },
  4096: { bg: '#FFD700', text: '#1C0033' },
  8192: { bg: '#FF8C00', text: '#ffffff' },
};

/* ---- グリッド定数 ---- */
const TILE_S = 1.0;          // タイルサイズ（Three.js 単位）
const GAP    = 0.12;         // タイル間ギャップ
const STEP   = TILE_S + GAP; // レイヤー / グリッド間隔 = 1.12

/* ============================================================
   View クラス
   ============================================================ */
class View {
  constructor(config = {}) {
    const { size = 4, depth = 4, is3D = true } = config;
    this._size      = size;
    this._depth     = depth;
    this._is3D      = is3D;
    this._destroyed = false;
    this._ac        = new AbortController();

    this._el          = document.getElementById('board-container');
    this.scoreEl      = document.getElementById('score');
    this.bestEl       = document.getElementById('best');
    this.overlayEl    = document.getElementById('overlay');
    this.overlayMsgEl = document.getElementById('overlay-message');

    /* Three.js コア */
    this._scene    = new THREE.Scene();
    this._camera   = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this._renderer = new THREE.WebGLRenderer({ antialias: true });

    /* タイル管理 */
    this._meshes   = new Map(); // tile.id → THREE.Mesh
    this._textures = new Map(); // value   → THREE.CanvasTexture
    this._tileGeom = new THREE.BoxGeometry(TILE_S, TILE_S, TILE_S); // 共有ジオメトリ

    /* グリッド中心（カメラの注視点）— グリッドサイズに応じて計算 */
    this._center = new THREE.Vector3(
      ((size  - 1) * STEP) / 2,
      -((size  - 1) * STEP) / 2,
      -((depth - 1) * STEP) / 2
    );

    /* クォータニオンによるカメラ orbit（トラックボール方式） */
    /* カメラ距離: グリッドが画面の ~70% を占めるよう FOV から逆算
       3D: 奥行きもあるため少し遠め / 2D: 手前のみなので近め */
    const span = (Math.max(size, depth) - 1) * STEP + TILE_S;
    this._camR = is3D ? span * 1.85 : span * 1.5;
    this._camQuat = is3D
      ? new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.52, 0.45, 0, 'YXZ'))
      : new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, 0,    0, 'YXZ'));

    this._initRenderer();
    this._initGrid();
    if (is3D) this._initHintOverlay();
    if (is3D) this._bindOrbit();
    this._animate();
  }

  /* ------------------------------------------------------------------ */
  /* セットアップ                                                          */
  /* ------------------------------------------------------------------ */

  _initRenderer() {
    const r = this._renderer;
    r.setPixelRatio(window.devicePixelRatio);
    r.setClearColor(0x0f0d14);
    this._el.appendChild(r.domElement);

    this._onResize();
    window.addEventListener('resize', () => this._onResize());
    this._updateCamera();
  }

  _onResize() {
    const w = this._el.clientWidth;
    const h = this._el.clientHeight;
    if (!w || !h) return;
    this._renderer.setSize(w, h);
    this._camera.aspect = w / h;
    this._camera.updateProjectionMatrix();
  }

  _updateCamera() {
    const offset = new THREE.Vector3(0, 0, this._camR).applyQuaternion(this._camQuat);
    const up     = new THREE.Vector3(0, 1, 0).applyQuaternion(this._camQuat);
    const c      = this._center;
    this._camera.position.set(c.x + offset.x, c.y + offset.y, c.z + offset.z);
    this._camera.up.copy(up);
    this._camera.lookAt(c);
  }

  /* ------------------------------------------------------------------ */
  /* グリッド背景（半透明セル）                                             */
  /* ------------------------------------------------------------------ */

  _initGrid() {
    const geom = new THREE.BoxGeometry(TILE_S * 0.90, TILE_S * 0.90, TILE_S * 0.90);
    const mat  = new THREE.MeshBasicMaterial({
      color: 0x1a1724,
      transparent: true,
      opacity: 0.30,
    });
    for (let l = 0; l < this._depth; l++)
      for (let r = 0; r < this._size; r++)
        for (let c = 0; c < this._size; c++) {
          const cell = new THREE.Mesh(geom, mat);
          cell.position.set(c * STEP, -r * STEP, -l * STEP);
          this._scene.add(cell);
        }
  }

  /* ------------------------------------------------------------------ */
  /* 方向ヒントブロック（グリッド外周に配置）                              */
  /* ------------------------------------------------------------------ */

  _initHintOverlay() {
    const C       = this._center;
    const HALF_XY = ((this._size  - 1) * STEP) / 2;
    const HALF_Z  = ((this._depth - 1) * STEP) / 2;
    const OFF_XY  = HALF_XY + 1.6;
    const OFF_Z   = HALF_Z  + 1.6;

    const defs = [
      { label: 'W',       sub: '上へ',   dx:  0, dy:  1, dz:  0 },
      { label: 'S',       sub: '下へ',   dx:  0, dy: -1, dz:  0 },
      { label: 'A',       sub: '左へ',   dx: -1, dy:  0, dz:  0 },
      { label: 'D',       sub: '右へ',   dx:  1, dy:  0, dz:  0 },
      { label: 'Scroll↑', sub: '手前へ', dx:  0, dy:  0, dz:  1 },
      { label: 'Scroll↓', sub: '奥へ',   dx:  0, dy:  0, dz: -1 },
    ];

    /* オーバーレイ div を動的生成 */
    const overlayEl = document.createElement('div');
    overlayEl.id = 'hint-overlay';
    this._el.appendChild(overlayEl);
    this._hintItems = [];

    defs.forEach(({ label, sub, dx, dy, dz }) => {
      const isZ    = dz !== 0;
      const HALF   = isZ ? HALF_Z  : HALF_XY;
      const OFF    = isZ ? OFF_Z   : OFF_XY;
      const outward = new THREE.Vector3(dx, dy, dz);

      const worldPos = new THREE.Vector3(
        C.x + dx * OFF,
        C.y + dy * OFF,
        C.z + dz * OFF,
      );

      const el = document.createElement('div');
      el.className = 'hint-dir';
      el.innerHTML =
        `<span class="hint-dir-key">${label}</span>` +
        `<span class="hint-dir-sub">${sub}</span>`;
      overlayEl.appendChild(el);

      const arrowOrigin = new THREE.Vector3(
        C.x + dx * (HALF + 0.1),
        C.y + dy * (HALF + 0.1),
        C.z + dz * (HALF + 0.1),
      );
      const arrowLen = OFF - HALF - 0.1 - 0.15;
      const arrow = new THREE.ArrowHelper(
        outward, arrowOrigin, arrowLen,
        0xD0BCFF, 0.28, 0.18,
      );
      this._scene.add(arrow);

      this._hintItems.push({ el, worldPos });
    });
  }

  _updateHintOverlay() {
    const canvas = this._renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    for (const { el, worldPos } of this._hintItems) {
      const v = worldPos.clone().project(this._camera);

      /* カメラ背後（z > 1）なら非表示 */
      if (v.z > 1) {
        el.style.opacity = '0';
        continue;
      }

      const x = ( v.x + 1) / 2 * w;
      const y = (-v.y + 1) / 2 * h;
      el.style.left    = `${x}px`;
      el.style.top     = `${y}px`;
      el.style.opacity = '1';
    }
  }

  /* ------------------------------------------------------------------ */
  /* テクスチャ生成（Canvas 2D → THREE.CanvasTexture）                    */
  /* ------------------------------------------------------------------ */

  _getTexture(value) {
    if (!this._textures.has(value)) {
      this._textures.set(value, this._makeTexture(value));
    }
    return this._textures.get(value);
  }

  _makeTexture(value) {
    const S   = 256;
    const cv  = document.createElement('canvas');
    cv.width  = cv.height = S;
    const ctx = cv.getContext('2d');
    const { bg, text } = TILE_COLORS[value] || { bg: '#3D3355', text: '#E8DEF8' };

    /* 背景（角丸） */
    ctx.fillStyle = bg;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(6, 6, S - 12, S - 12, 20);
    } else {
      ctx.rect(6, 6, S - 12, S - 12); // フォールバック
    }
    ctx.fill();

    /* 数字 */
    const str = String(value);
    const fs  = str.length <= 2 ? 104 : str.length <= 3 ? 80 : 60;
    ctx.fillStyle    = text;
    ctx.font         = `bold ${fs}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, S / 2, S / 2);

    return new THREE.CanvasTexture(cv);
  }

  /* ------------------------------------------------------------------ */
  /* タイルマテリアル（6 面）                                              */
  /*   BoxGeometry の面順序:                                              */
  /*     0: +x（右）  1: -x（左）  2: +y（上）                            */
  /*     3: -y（下）  4: +z（前）  5: -z（後）                            */
  /* ------------------------------------------------------------------ */

  _makeMaterials(value) {
    const { bg } = TILE_COLORS[value] || { bg: '#3D3355', text: '#E8DEF8' };
    const base = new THREE.Color(bg);
    const W    = new THREE.Color(1, 1, 1);
    const B    = new THREE.Color(0, 0, 0);

    const lighter = base.clone().lerp(W, 0.28); // 上面
    const darker  = base.clone().lerp(B, 0.38); // 右面
    const darkest = base.clone().lerp(B, 0.62); // 左・下・後ろ

    const tex  = c => new THREE.MeshBasicMaterial({ map: this._getTexture(value), color: c });

    return [
      tex(darker),   // 0: +x 右
      tex(darkest),  // 1: -x 左
      tex(lighter),  // 2: +y 上
      tex(darkest),  // 3: -y 下
      tex(new THREE.Color(1, 1, 1)), // 4: +z 前（明るくそのまま表示）
      tex(darker),   // 5: -z 後
    ];
  }

  /* ------------------------------------------------------------------ */
  /* タイル位置計算                                                        */
  /* ------------------------------------------------------------------ */

  _tilePos(col, row, layer) {
    return new THREE.Vector3(col * STEP, -row * STEP, -layer * STEP);
  }

  /* ------------------------------------------------------------------ */
  /* 全体再描画（Model からの呼び出し）                                     */
  /* ------------------------------------------------------------------ */

  render(model, best) {
    const { DEPTH, SIZE, grid } = model;
    const livingIds = new Set();

    for (let l = 0; l < DEPTH; l++) {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          const tile = grid[l][r][c];
          if (!tile) continue;
          livingIds.add(tile.id);

          const targetPos = this._tilePos(c, r, l);

          if (!this._meshes.has(tile.id)) {
            /* 新規タイル：スケール 0 から出現 */
            const mesh = new THREE.Mesh(this._tileGeom, this._makeMaterials(tile.value));
            mesh.position.copy(targetPos);
            mesh.scale.setScalar(0.01);
            mesh.userData.targetPos   = targetPos.clone();
            mesh.userData.targetScale = 1.0;
            this._scene.add(mesh);
            this._meshes.set(tile.id, mesh);

          } else {
            const mesh = this._meshes.get(tile.id);
            mesh.userData.targetPos = targetPos;

            if (tile.mergedFrom) {
              /* マージ：マテリアル差し替え + バウンスアニメーション */
              mesh.material.forEach(m => m.dispose());
              mesh.material = this._makeMaterials(tile.value);
              mesh.userData.targetScale = 1.3;
              setTimeout(() => {
                const m = this._meshes.get(tile.id);
                if (m) m.userData.targetScale = 1.0;
              }, 130);
              delete tile.mergedFrom;
            }
          }
        }
      }
    }

    /* 消えたタイルを削除 */
    for (const [id, mesh] of this._meshes) {
      if (!livingIds.has(id)) {
        this._scene.remove(mesh);
        mesh.material.forEach(m => m.dispose());
        this._meshes.delete(id);
      }
    }

    /* スコア */
    this.scoreEl.textContent = model.score;
    this.bestEl.textContent  = best;

    /* オーバーレイ */
    if (model.won && !model._shownWin) {
      model._shownWin = true;
      this._showOverlay('2048 達成！');
    } else if (model.over) {
      this._showOverlay('ゲームオーバー');
    } else {
      this._hideOverlay();
    }
  }

  _showOverlay(msg) {
    this.overlayMsgEl.textContent = msg;
    this.overlayEl.classList.remove('hidden');
  }

  _hideOverlay() {
    this.overlayEl.classList.add('hidden');
  }

  clearTiles() {
    for (const mesh of this._meshes.values()) {
      this._scene.remove(mesh);
      mesh.material.forEach(m => m.dispose());
    }
    this._meshes.clear();
  }

  /* ------------------------------------------------------------------ */
  /* アニメーションループ                                                   */
  /* ------------------------------------------------------------------ */

  _animate() {
    if (this._destroyed) return;
    requestAnimationFrame(() => this._animate());

    for (const mesh of this._meshes.values()) {
      /* 位置を目標へ lerp */
      mesh.position.lerp(mesh.userData.targetPos, 0.2);

      /* スケールを目標へ lerp */
      const ts = mesh.userData.targetScale ?? 1;
      const cs = mesh.scale.x;
      const ns = cs + (ts - cs) * 0.16;
      mesh.scale.setScalar(Math.abs(ns - ts) < 0.004 ? ts : ns);
    }

    this._renderer.render(this._scene, this._camera);
    if (this._is3D) this._updateHintOverlay();
  }

  /* ------------------------------------------------------------------ */
  /* マウスドラッグで視点回転（orbit）                                      */
  /* ------------------------------------------------------------------ */

  _bindOrbit() {
    const el = this._renderer.domElement;
    let dragging  = false;
    let startX = 0, startY = 0;
    let baseQuat  = new THREE.Quaternion();

    el.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      dragging = true;
      startX   = e.clientX;
      startY   = e.clientY;
      baseQuat = this._camQuat.clone();
    });

    const { signal } = this._ac;

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (dx === 0 && dy === 0) return;

      // ドラッグ開始時のカメラ上方向・右方向（ワールド座標）
      const camUp    = new THREE.Vector3(0, 1, 0).applyQuaternion(baseQuat);
      const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(baseQuat);

      // スクリーン上の移動量から回転軸・角度を計算
      const angle = Math.sqrt(dx * dx + dy * dy) * 0.007;
      const axis  = new THREE.Vector3()
        .addScaledVector(camUp,    -dx)
        .addScaledVector(camRight, -dy)
        .normalize();

      this._camQuat = new THREE.Quaternion()
        .setFromAxisAngle(axis, angle)
        .multiply(baseQuat);
      this._updateCamera();
    }, { signal });

    document.addEventListener('mouseup', () => { dragging = false; }, { signal });
  }

  refreshSizes() { this._onResize(); }

  destroy() {
    this._destroyed = true;
    this._ac.abort();
    this._renderer.dispose();
    this._el.innerHTML = '';
  }
}
