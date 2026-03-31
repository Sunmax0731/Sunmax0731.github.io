/* ============================================================
   Othello - view_flat3d.js
   Three.js による 8×8 平面ボードの 3D 描画
   （2D モードで使用 — ゲームロジックに一切触れない）
   ============================================================ */

class OthelloViewFlat3D {
  /**
   * @param {OthelloModel} model
   */
  constructor(model) {
    this.model = model;

    this._renderer    = null;
    this._scene       = null;
    this._camera      = null;
    this._animFrameId = null;

    this._pieceMeshes   = {};  // "r,c" → THREE.Mesh
    this._boardHitboxes = {};  // "r,c" → THREE.Mesh（不可視、ラジキャスト用）
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
      theta: 0,    thetaT: 0,
      phi:   0.76, phiT:   0.76,
      radius: 12.5, radiusT: 12.5,
    };
    this._orbitPointerDown = null;
    this._orbitPointerMove = null;
    this._orbitPointerUp   = null;
    this._orbitWheel       = null;

    this._buildScene();
    this._startRenderLoop();
  }

  // ============================================================
  //  公開 API（OthelloView と同一インターフェイス）
  // ============================================================

  initBoard() {
    this._clearPieces();
    this._clearHints();

    const { board } = this.model;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c] !== 0) this._createPiece(r, c, board[r][c]);
  }

  render(showHints = true) {
    const { board, currentPlayer, playerColor, gameOver } = this.model;

    this._clearHints();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const val      = board[r][c];
        const key      = `${r},${c}`;
        const existing = this._pieceMeshes[key];

        if (val !== 0) {
          if (!existing) {
            this._createPiece(r, c, val);
          } else {
            const expected = val === 1 ? 0x111111 : 0xf0f0f0;
            if (existing.material.color.getHex() !== expected) {
              this._applyColor(existing, val);
            }
          }
        } else if (existing) {
          this._removePiece(r, c);
        }
      }
    }

    // 有効手ヒント（半透明の緑シリンダー）
    if (showHints && !gameOver && currentPlayer === playerColor) {
      for (const [hr, hc] of this.model.getValidMoves()) {
        const geo  = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 24);
        const mat  = new THREE.MeshBasicMaterial({
          color: 0x43e97b, transparent: true, opacity: 0.65,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(hc - 3.5, 0.068, hr - 3.5);
        this._scene.add(mesh);
        this._hintMeshes.push(mesh);
      }
    }
  }

  async animatePlacement(r, c, player) {
    this._removePiece(r, c);

    const piece   = this._createPiece(r, c, player);
    const targetY = 0.065;
    piece.position.y = 4.0;

    await this._tween(PLACE_ANIM_MS, (t) => {
      piece.position.y = 4.0 + (targetY - 4.0) * this._easeOutBounce(t);
    });
    piece.position.y = targetY;
  }

  async animateFlip(r, c, toPlayer) {
    const piece = this._pieceMeshes[`${r},${c}`];
    if (!piece) return;

    await this._tween(FLIP_HALF_MS, (t) => { piece.scale.x = 1 - t; });
    this._applyColor(piece, toPlayer);
    await this._tween(FLIP_HALF_MS, (t) => { piece.scale.x = t; });
    piece.scale.x = 1;
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
  //  3D クリック連携（OthelloController の _bindEvents から呼ばれる）
  //  コールバックは (r, c) の 2D 座標で通知
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
        const { r, c } = hits[0].object.userData;
        this._clickCb(r, c);
      }
    };

    this._onCanvasMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      this._mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      this._mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      this._raycaster.setFromCamera(this._mouse, this._camera);
      const hits = this._raycaster.intersectObjects(Object.values(this._boardHitboxes));

      if (hits.length > 0) {
        const { r, c } = hits[0].object.userData;
        const canClick =
          !this.model.gameOver &&
          this.model.currentPlayer === this.model.playerColor &&
          this.model.canPlace(r, c);
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
    this._renderer.setClearColor(0x0f0f1e, 1);

    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.FogExp2(0x0f0f1e, 0.025);

    this._camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    this._updateCameraPosition();

    // ライト
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this._scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4e0, 1.1);
    sun.position.set(6, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width  = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near   =  0.5;
    sun.shadow.camera.far    = 40;
    sun.shadow.camera.left   = -8;
    sun.shadow.camera.right  =  8;
    sun.shadow.camera.top    =  8;
    sun.shadow.camera.bottom = -8;
    this._scene.add(sun);

    const fill = new THREE.DirectionalLight(0xb0c8ff, 0.28);
    fill.position.set(-5, 4, -5);
    this._scene.add(fill);

    this._buildBoard();
    this._initOrbitControls(canvas);
  }

  _buildBoard() {
    // 木の枠
    const frameGeo = new THREE.BoxGeometry(8.8, 0.32, 8.8);
    const frameMat = new THREE.MeshPhongMaterial({
      color: 0x5c3800, specular: 0x301800, shininess: 45,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = -0.16;
    frame.castShadow = frame.receiveShadow = true;
    this._scene.add(frame);

    // 緑の盤面
    const boardGeo = new THREE.BoxGeometry(8, 0.08, 8);
    const boardMat = new THREE.MeshPhongMaterial({
      color: 0x1a5c28, specular: 0x0a2510, shininess: 25,
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.position.y = 0.01;
    boardMesh.receiveShadow = true;
    this._scene.add(boardMesh);

    // グリッド線（9本 × 2方向）
    const verts = [];
    for (let i = 0; i <= 8; i++) {
      const p = i - 4;
      verts.push(-4, 0.056, p,  4, 0.056, p);
      verts.push( p, 0.056, -4, p, 0.056,  4);
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x000000, opacity: 0.38, transparent: true,
    });
    this._scene.add(new THREE.LineSegments(lineGeo, lineMat));

    // 星点（4箇所）
    const starGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0x000000, opacity: 0.5, transparent: true,
    });
    for (const [r, c] of [[2,2],[2,5],[5,2],[5,5]]) {
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(c - 3.5, 0.058, r - 3.5);
      this._scene.add(star);
    }

    // セルのヒットボックス（不可視・ラジキャスト専用）
    const hitGeo = new THREE.PlaneGeometry(0.97, 0.97);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const hitbox = new THREE.Mesh(hitGeo, hitMat);
        hitbox.rotation.x = -Math.PI / 2;
        hitbox.position.set(c - 3.5, 0.058, r - 3.5);
        hitbox.userData = { r, c };
        this._scene.add(hitbox);
        this._boardHitboxes[`${r},${c}`] = hitbox;
      }
    }
  }

  // ============================================================
  //  内部: 駒管理
  // ============================================================

  _createPiece(r, c, player) {
    const geo  = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 48);
    const mat  = new THREE.MeshPhongMaterial({
      color:     player === 1 ? 0x111111 : 0xf0f0f0,
      specular:  player === 1 ? 0x333333 : 0xdddddd,
      shininess: player === 1 ? 80 : 120,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(c - 3.5, 0.065, r - 3.5);
    mesh.castShadow = mesh.receiveShadow = true;
    this._scene.add(mesh);
    this._pieceMeshes[`${r},${c}`] = mesh;
    return mesh;
  }

  _removePiece(r, c) {
    const key  = `${r},${c}`;
    const mesh = this._pieceMeshes[key];
    if (!mesh) return;
    this._scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    delete this._pieceMeshes[key];
  }

  _applyColor(mesh, player) {
    mesh.material.color.setHex(player === 1 ? 0x111111 : 0xf0f0f0);
    mesh.material.specular.setHex(player === 1 ? 0x333333 : 0xdddddd);
    mesh.material.shininess = player === 1 ? 80 : 120;
  }

  _clearPieces() {
    for (const key of Object.keys(this._pieceMeshes)) {
      const [r, c] = key.split(',').map(Number);
      this._removePiece(r, c);
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
  //  内部: カメラ操作（独自実装）
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
      this._orbit.phiT    = Math.max(0.22, Math.min(1.38, this._orbit.phiT - dy * 0.006));
    };

    this._orbitPointerUp = () => {};

    this._orbitWheel = (e) => {
      e.preventDefault();
      this._orbit.radiusT = Math.max(6, Math.min(20, this._orbit.radiusT + e.deltaY * 0.02));
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
