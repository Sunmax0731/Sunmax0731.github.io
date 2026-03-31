/* ============================================================
   Othello3D - view3d.js
   Three.js 3D 描画・アニメーション
   4×4×4 格子盤面 + 球体の駒（ゲームロジックに一切触れない）
   ============================================================ */

class OthelloView3D {
  /**
   * @param {OthelloModel3D} model
   */
  constructor(model) {
    this.model = model;

    this._renderer    = null;
    this._scene       = null;
    this._camera      = null;
    this._animFrameId = null;

    this._pieceMeshes   = {};  // "x,y,z" → THREE.Mesh
    this._boardHitboxes = {};  // "x,y,z" → THREE.Mesh（不可視、ラジキャスト用）
    this._hintMeshes    = [];

    this._raycaster = new THREE.Raycaster();
    this._mouse     = new THREE.Vector2();

    // クリックイベント用
    this._clickCb       = null;
    this._onMouseDown   = null;
    this._onCanvasClick = null;
    this._onCanvasMove  = null;
    this._mouseDownPos  = null;

    // カメラ操作用（独自実装）
    this._orbit = {
      theta: 0.45,  thetaT: 0.45,
      phi:   0.70,  phiT:   0.70,
      radius: 16,   radiusT: 16,
    };
    this._orbitPointerDown = null;
    this._orbitPointerMove = null;
    this._orbitPointerUp   = null;
    this._orbitWheel       = null;

    this._buildScene();
    this._startRenderLoop();
  }

  // ============================================================
  //  盤面座標 → Three.js ワールド座標
  // ============================================================

  _wp(x, y, z) {
    const S    = 2.0;
    const half = (SIZE3D - 1) / 2; // 1.5 for SIZE3D=4
    return [(x - half) * S, (y - half) * S, (z - half) * S];
  }

  // ============================================================
  //  公開 API（OthelloView と同一インターフェイス）
  // ============================================================

  initBoard() {
    this._clearPieces();
    this._clearHints();

    const { board } = this.model;
    for (let z = 0; z < SIZE3D; z++)
      for (let y = 0; y < SIZE3D; y++)
        for (let x = 0; x < SIZE3D; x++)
          if (board[z][y][x] !== 0) this._createPiece(x, y, z, board[z][y][x]);
  }

  render(showHints = true) {
    const { board, currentPlayer, playerColor, gameOver } = this.model;

    this._clearHints();

    for (let z = 0; z < SIZE3D; z++) {
      for (let y = 0; y < SIZE3D; y++) {
        for (let x = 0; x < SIZE3D; x++) {
          const val      = board[z][y][x];
          const key      = `${x},${y},${z}`;
          const existing = this._pieceMeshes[key];

          if (val !== 0) {
            if (!existing) {
              this._createPiece(x, y, z, val);
            } else {
              const expected = val === 1 ? 0x111111 : 0xf2f2f2;
              if (existing.material.color.getHex() !== expected) {
                this._applyColor(existing, val);
              }
            }
          } else if (existing) {
            this._removePiece(x, y, z);
          }
        }
      }
    }

    // 有効手ヒント（半透明の緑の球）
    if (showHints && !gameOver && currentPlayer === playerColor) {
      for (const [hx, hy, hz] of this.model.getValidMoves()) {
        const [wx, wy, wz] = this._wp(hx, hy, hz);
        const geo  = new THREE.SphereGeometry(0.3, 16, 16);
        const mat  = new THREE.MeshPhongMaterial({
          color:     0x43e97b,
          emissive:  0x1a5c30,
          transparent: true,
          opacity:   0.6,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(wx, wy, wz);
        this._scene.add(mesh);
        this._hintMeshes.push(mesh);
      }
    }
  }

  async animatePlacement(x, y, z, player) {
    this._removePiece(x, y, z);

    const piece        = this._createPiece(x, y, z, player);
    const [wx, wy, wz] = this._wp(x, y, z);
    const startY       = wy + 8;
    piece.position.y   = startY;

    await this._tween(PLACE_ANIM_MS, (t) => {
      piece.position.y = startY + (wy - startY) * this._easeOutBounce(t);
    });
    piece.position.y = wy;
  }

  async animateFlip(x, y, z, toPlayer) {
    const piece = this._pieceMeshes[`${x},${y},${z}`];
    if (!piece) return;

    // 球を均等に収縮させ、色変更後に拡大（フリップ表現）
    await this._tween(FLIP_HALF_MS, (t) => { piece.scale.setScalar(1 - t); });
    this._applyColor(piece, toPlayer);
    await this._tween(FLIP_HALF_MS, (t) => { piece.scale.setScalar(t); });
    piece.scale.setScalar(1);
  }

  updateScores(black, white) {
    document.getElementById('score-black').textContent = black;
    document.getElementById('score-white').textContent = white;

    const cp = this.model.currentPlayer;
    document.getElementById('score-black-half').classList.toggle('active-turn', cp ===  1);
    document.getElementById('score-white-half').classList.toggle('active-turn', cp === -1);
  }

  setTurnBanner(text, cls) {
    const el = document.getElementById('turn-banner');
    el.textContent = text;
    el.className   = `turn-banner ${cls}`;
  }

  showGameOver(black, white) {
    document.getElementById('overlay-score').textContent = `黒 ${black}  vs  白 ${white}`;

    const { playerColor } = this.model;
    const winnerEl = document.getElementById('overlay-winner');

    if (black === white) {
      winnerEl.innerHTML = '<span class="win-draw">引き分け！</span>';
    } else {
      const blackWins  = black > white;
      const playerWins = (blackWins && playerColor === 1) || (!blackWins && playerColor === -1);
      winnerEl.innerHTML = playerWins
        ? '<span class="win-player">あなたの勝ち！🎉</span>'
        : '<span class="win-cpu">CPU の勝ち</span>';
    }

    document.getElementById('overlay').classList.add('show');
  }

  hideGameOver() {
    document.getElementById('overlay').classList.remove('show');
  }

  // ============================================================
  //  3D クリック連携（Controller から呼ばれる）
  // ============================================================

  setup3DClick(callback) {
    this._clickCb = callback;
    const canvas  = document.getElementById('board-3d');

    this._onMouseDown = (e) => {
      this._mouseDownPos = { x: e.clientX, y: e.clientY };
    };

    this._onCanvasClick = (e) => {
      if (!this._mouseDownPos) return;
      const dx = e.clientX - this._mouseDownPos.x;
      const dy = e.clientY - this._mouseDownPos.y;
      this._mouseDownPos = null;
      if (dx * dx + dy * dy > 25) return;

      const rect = canvas.getBoundingClientRect();
      this._mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      this._mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      this._raycaster.setFromCamera(this._mouse, this._camera);
      const hits = this._raycaster.intersectObjects(Object.values(this._boardHitboxes));
      if (hits.length > 0) {
        const { x, y, z } = hits[0].object.userData;
        this._clickCb(x, y, z);
      }
    };

    this._onCanvasMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      this._mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      this._mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      this._raycaster.setFromCamera(this._mouse, this._camera);
      const hits = this._raycaster.intersectObjects(Object.values(this._boardHitboxes));

      if (hits.length > 0) {
        const { x, y, z } = hits[0].object.userData;
        const canClick =
          !this.model.gameOver &&
          this.model.currentPlayer === this.model.playerColor &&
          this.model.canPlace(x, y, z);
        canvas.style.cursor = canClick ? 'pointer' : 'default';
      } else {
        canvas.style.cursor = 'default';
      }
    };

    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('click',     this._onCanvasClick);
    canvas.addEventListener('mousemove', this._onCanvasMove);
  }

  cleanup3DClick() {
    const canvas = document.getElementById('board-3d');
    if (canvas) {
      if (this._onMouseDown)   canvas.removeEventListener('mousedown', this._onMouseDown);
      if (this._onCanvasClick) canvas.removeEventListener('click',     this._onCanvasClick);
      if (this._onCanvasMove)  canvas.removeEventListener('mousemove', this._onCanvasMove);
    }
    this._onMouseDown = this._onCanvasClick = this._onCanvasMove = null;
    this._clickCb = null;
  }

  destroy() {
    this.cleanup3DClick();
    this._cleanupOrbitControls();

    if (this._animFrameId !== null) {
      cancelAnimationFrame(this._animFrameId);
      this._animFrameId = null;
    }

    if (this._scene) {
      this._scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }
    if (this._renderer) {
      this._renderer.dispose();
      this._renderer = null;
    }
    this._scene = this._camera = null;
    this._pieceMeshes   = {};
    this._boardHitboxes = {};
    this._hintMeshes    = [];

    document.getElementById('board-3d').style.display = 'none';
    document.getElementById('board').style.display = '';
  }

  // ============================================================
  //  内部: シーン構築
  // ============================================================

  _buildScene() {
    const canvas = document.getElementById('board-3d');
    const W = Math.round(canvas.clientWidth || 588);
    const H = Math.round(canvas.clientHeight || W);

    canvas.style.display = 'block';
    document.getElementById('board').style.display = 'none';

    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.setSize(W, H);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.setClearColor(0x0a0a18, 1);

    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.FogExp2(0x0a0a18, 0.018);

    this._camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    this._updateCameraPosition();

    // ライト
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    this._scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff0e0, 1.2);
    sun.position.set(8, 14, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width  = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near   =  1;
    sun.shadow.camera.far    = 50;
    sun.shadow.camera.left   = -8;
    sun.shadow.camera.right  =  8;
    sun.shadow.camera.top    =  8;
    sun.shadow.camera.bottom = -8;
    this._scene.add(sun);

    const fill = new THREE.DirectionalLight(0x80a8ff, 0.3);
    fill.position.set(-6, 4, -6);
    this._scene.add(fill);

    this._buildGrid();
    this._initOrbitControls(canvas);
  }

  _buildGrid() {
    const S    = 2.0;
    const half = (SIZE3D - 1) / 2; // 1.5

    // ---- 格子線（全48本）----
    const verts = [];
    const span  = half * S; // 3.0

    for (let a = 0; a < SIZE3D; a++) {
      const pa = (a - half) * S;
      for (let b = 0; b < SIZE3D; b++) {
        const pb = (b - half) * S;
        verts.push(-span, pa, pb,  span, pa, pb); // X方向
        verts.push(pa, -span, pb,  pa,  span, pb); // Y方向
        verts.push(pa, pb, -span,  pa,  pb,  span); // Z方向
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6688bb, opacity: 0.35, transparent: true,
    });
    this._scene.add(new THREE.LineSegments(lineGeo, lineMat));

    // ---- 外枠（ワイヤーフレームBOX）----
    const boxEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(
      span * 2 + 0.3, span * 2 + 0.3, span * 2 + 0.3
    ));
    const boxMat = new THREE.LineBasicMaterial({
      color: 0x88aaff, opacity: 0.5, transparent: true,
    });
    this._scene.add(new THREE.LineSegments(boxEdges, boxMat));

    // ---- セルのヒットボックス（不可視球体、ラジキャスト専用）----
    const hitGeo = new THREE.SphereGeometry(0.88, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    for (let z = 0; z < SIZE3D; z++) {
      for (let y = 0; y < SIZE3D; y++) {
        for (let x = 0; x < SIZE3D; x++) {
          const hitbox = new THREE.Mesh(hitGeo, hitMat);
          const [wx, wy, wz] = this._wp(x, y, z);
          hitbox.position.set(wx, wy, wz);
          hitbox.userData = { x, y, z };
          this._scene.add(hitbox);
          this._boardHitboxes[`${x},${y},${z}`] = hitbox;
        }
      }
    }
  }

  // ============================================================
  //  内部: 駒管理
  // ============================================================

  _createPiece(x, y, z, player) {
    const geo  = new THREE.SphereGeometry(0.55, 32, 32);
    const mat  = new THREE.MeshPhongMaterial({
      color:     player === 1 ? 0x111111 : 0xf2f2f2,
      specular:  player === 1 ? 0x444444 : 0xffffff,
      shininess: player === 1 ? 80 : 140,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const [wx, wy, wz] = this._wp(x, y, z);
    mesh.position.set(wx, wy, wz);
    mesh.castShadow = mesh.receiveShadow = true;
    this._scene.add(mesh);
    this._pieceMeshes[`${x},${y},${z}`] = mesh;
    return mesh;
  }

  _removePiece(x, y, z) {
    const key  = `${x},${y},${z}`;
    const mesh = this._pieceMeshes[key];
    if (!mesh) return;
    this._scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    delete this._pieceMeshes[key];
  }

  _applyColor(mesh, player) {
    mesh.material.color.setHex(player === 1 ? 0x111111 : 0xf2f2f2);
    mesh.material.specular.setHex(player === 1 ? 0x444444 : 0xffffff);
    mesh.material.shininess = player === 1 ? 80 : 140;
  }

  _clearPieces() {
    for (const key of Object.keys(this._pieceMeshes)) {
      const [x, y, z] = key.split(',').map(Number);
      this._removePiece(x, y, z);
    }
  }

  _clearHints() {
    for (const m of this._hintMeshes) {
      this._scene.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    }
    this._hintMeshes = [];
  }

  // ============================================================
  //  内部: カメラ操作（独自実装・OrbitControls 不使用）
  // ============================================================

  _initOrbitControls(canvas) {
    let prevX = 0, prevY = 0;

    this._orbitPointerDown = (e) => {
      if (e.button !== 0) return;
      prevX = e.clientX;
      prevY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    this._orbitPointerMove = (e) => {
      if (!e.buttons) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      this._orbit.thetaT -= dx * 0.006;
      this._orbit.phiT    = Math.max(0.18, Math.min(1.42, this._orbit.phiT - dy * 0.006));
    };

    this._orbitPointerUp   = () => {};

    this._orbitWheel = (e) => {
      e.preventDefault();
      this._orbit.radiusT = Math.max(8, Math.min(28, this._orbit.radiusT + e.deltaY * 0.02));
    };

    canvas.addEventListener('pointerdown', this._orbitPointerDown);
    canvas.addEventListener('pointermove', this._orbitPointerMove);
    canvas.addEventListener('pointerup',   this._orbitPointerUp);
    canvas.addEventListener('wheel',       this._orbitWheel, { passive: false });
  }

  _cleanupOrbitControls() {
    const canvas = document.getElementById('board-3d');
    if (!canvas) return;
    if (this._orbitPointerDown) canvas.removeEventListener('pointerdown', this._orbitPointerDown);
    if (this._orbitPointerMove) canvas.removeEventListener('pointermove', this._orbitPointerMove);
    if (this._orbitPointerUp)   canvas.removeEventListener('pointerup',   this._orbitPointerUp);
    if (this._orbitWheel)       canvas.removeEventListener('wheel',       this._orbitWheel);
    this._orbitPointerDown = this._orbitPointerMove = this._orbitPointerUp = this._orbitWheel = null;
  }

  _updateCameraPosition() {
    const lerp = (a, b) => a + (b - a) * 0.1;
    this._orbit.theta  = lerp(this._orbit.theta,  this._orbit.thetaT);
    this._orbit.phi    = lerp(this._orbit.phi,     this._orbit.phiT);
    this._orbit.radius = lerp(this._orbit.radius,  this._orbit.radiusT);

    const { theta, phi, radius } = this._orbit;
    this._camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    );
    this._camera.lookAt(0, 0, 0);
  }

  // ============================================================
  //  内部: レンダーループ・アニメーション
  // ============================================================

  _startRenderLoop() {
    const loop = () => {
      this._animFrameId = requestAnimationFrame(loop);
      this._updateCameraPosition();
      if (this._renderer && this._scene && this._camera) {
        this._renderer.render(this._scene, this._camera);
      }
    };
    loop();
  }

  _tween(duration, onUpdate) {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick  = (now) => {
        const t = Math.min((now - start) / duration, 1);
        onUpdate(t);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  _easeOutBounce(t) {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1)     return n1 * t * t;
    if (t < 2 / d1)     return n1 * (t -= 1.5   / d1) * t + 0.75;
    if (t < 2.5 / d1)   return n1 * (t -= 2.25  / d1) * t + 0.9375;
    return                      n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}
