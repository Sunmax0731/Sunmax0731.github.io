// ============================================================
// Block Breaker - view.js
// 役割: Three.js シーン管理・レンダリング・HUD 更新
// ============================================================

const View = (() => {

  let _scene, _camera, _renderer;
  let _gamePlane;
  let _raycaster;

  // ---- ライト参照（darkness エフェクト用）----
  let _ambientLight  = null;
  let _dirFrontLight = null;

  // ---- モード ----
  let _is3D      = false;
  let _numLayers = 1;

  // ---- カメラ軌道 ----
  let _rotY       = 0;
  let _orbitBaseX = 0, _orbitBaseY = 0, _orbitBaseZ = 30;

  // ---- メッシュ ----
  let _ballPool    = [];
  let _paddleMesh  = null;
  let _brickMeshes = [];   // [row][col][layer]
  let _itemMeshMap = new Map();
  let _wallL = null, _wallR = null, _wallT = null;  // 壁（表示制御用）

  // ---- ブリック死亡アニメーション ----
  let _dyingBricks = [];

  // ---- ボールカラー定数 ----
  const _BALL_COLOR_NORMAL = new THREE.Color(0xe0f7fa);
  const _BALL_COLOR_PIERCE = new THREE.Color(0xFF9800);
  const _BALL_COLOR_CATCH  = new THREE.Color(0x00E5FF);

  // ============================================================
  // 内部: メッシュ生成
  // ============================================================

  function _box(w, h, d, color, emissiveFactor) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshPhongMaterial({
      color,
      emissive: new THREE.Color(color).multiplyScalar(emissiveFactor || 0),
      shininess: 60,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function _makeBallMesh() {
    const geo = new THREE.SphereGeometry(BALL_RADIUS, 24, 16);
    const mat = new THREE.MeshPhongMaterial({
      color:     _BALL_COLOR_NORMAL.clone(),
      emissive:  _BALL_COLOR_NORMAL.clone().multiplyScalar(0.25),
      shininess: 100,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  function _createItemMesh(type) {
    const color = POWER_UP_COLORS[type];
    const geo   = new THREE.BoxGeometry(ITEM_W, ITEM_H, 0.4);
    const mat   = new THREE.MeshPhongMaterial({
      color,
      emissive: new THREE.Color(color).multiplyScalar(0.35),
      shininess: 90,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  function _damagedColor(row, health, maxHealth) {
    const c = new THREE.Color(BRICK_COLOR_HEX[row]);
    return c.multiplyScalar(0.35 + 0.65 * (health / maxHealth));
  }

  // ============================================================
  // 内部: アニメーション
  // ============================================================

  function _updateDyingBricks() {
    const now = Date.now();
    _dyingBricks = _dyingBricks.filter(item => {
      const t = (now - item.startTime) / BRICK_DIE_DURATION;
      if (t >= 1) { item.mesh.visible = false; item.mesh.scale.set(1, 1, 1); return false; }
      const s = 1 - t;
      item.mesh.scale.set(s, s, s);
      return true;
    });
  }

  // ============================================================
  // 内部: カメラ
  // ============================================================

  function _updateCameraOrbit() {
    const cosA = Math.cos(_rotY), sinA = Math.sin(_rotY);
    const newX = _orbitBaseX * cosA + _orbitBaseZ * sinA;
    const newZ = -_orbitBaseX * sinA + _orbitBaseZ * cosA;
    _camera.position.set(newX, _orbitBaseY, newZ);
    _camera.lookAt(0, 0, 0);
    _updateWallVisibility();
  }

  /** カメラが壁の外側に出たら該当壁を非表示にする */
  function _updateWallVisibility() {
    if (!_camera) return;
    const cx = _camera.position.x;
    const cy = _camera.position.y;
    if (_wallL) _wallL.visible = cx > -(WORLD_W / 2 - WALL_T);
    if (_wallR) _wallR.visible = cx <  (WORLD_W / 2 - WALL_T);
    if (_wallT) _wallT.visible = cy <  (WORLD_H / 2 - WALL_T);
  }

  function _setupCamera(W, H) {
    const fov     = 42;
    const vFovRad = (fov * Math.PI) / 180;
    const distV   = (WORLD_H / 2) / Math.tan(vFovRad / 2);
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * (W / H));
    const distH   = (WORLD_W / 2) / Math.tan(hFovRad / 2);

    if (_is3D) {
      _orbitBaseX = 0;
      _orbitBaseY = WORLD_H * 0.15;
      _orbitBaseZ = Math.max(distV, distH) * 1.25;
    } else {
      _orbitBaseX = 0;
      _orbitBaseY = WORLD_H * 0.05;
      _orbitBaseZ = Math.max(distV, distH) * 1.08;
    }

    if (_camera) {
      _camera.aspect = W / H;
      _camera.updateProjectionMatrix();
    } else {
      _camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 300);
    }
    _updateCameraOrbit();
  }

  // ============================================================
  // 公開 API: シーン管理
  // ============================================================

  function initScene(is3D, numLayers) {
    cleanup();
    _is3D      = !!is3D;
    _numLayers = _is3D ? Math.max(1, numLayers || 2) : 1;
    _rotY      = 0;

    const canvas = document.getElementById('game-canvas');
    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;

    _scene = new THREE.Scene();
    _scene.background = new THREE.Color(0x08080f);
    _setupCamera(W, H);

    _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    _renderer.setSize(W, H);
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.shadowMap.enabled = true;
    _renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

    _gamePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    _raycaster = new THREE.Raycaster();

    // ---- ライティング ----
    _ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    _scene.add(_ambientLight);

    _dirFrontLight = new THREE.DirectionalLight(0xffffff, 0.7);
    _dirFrontLight.position.set(0, WORLD_H * 0.5, 30);
    _dirFrontLight.castShadow           = true;
    _dirFrontLight.shadow.mapSize.width = _dirFrontLight.shadow.mapSize.height = 1024;
    _dirFrontLight.shadow.camera.left   = -WORLD_W;
    _dirFrontLight.shadow.camera.right  =  WORLD_W;
    _dirFrontLight.shadow.camera.top    =  WORLD_H;
    _dirFrontLight.shadow.camera.bottom = -WORLD_H;
    _dirFrontLight.shadow.camera.near   = 1;
    _dirFrontLight.shadow.camera.far    = 120;
    _scene.add(_dirFrontLight);

    const dirFill = new THREE.DirectionalLight(0x8090ff, 0.3);
    dirFill.position.set(-10, -5, 10);
    _scene.add(dirFill);

    // ---- 壁 ----
    const wallMat  = new THREE.MeshPhongMaterial({ color: 0x2d2b3a, shininess: 30 });
    const wallZExt = _is3D ? WORLD_Z : WALL_DEPTH;
    const makeWall = (w, h) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, wallZExt), wallMat);
      m.receiveShadow = true;
      return m;
    };
    _wallL = makeWall(WALL_T, WORLD_H); _wallL.position.set(-WORLD_W / 2 + WALL_T / 2, 0, 0); _scene.add(_wallL);
    _wallR = makeWall(WALL_T, WORLD_H); _wallR.position.set( WORLD_W / 2 - WALL_T / 2, 0, 0); _scene.add(_wallR);
    _wallT = makeWall(WORLD_W, WALL_T); _wallT.position.set(0, WORLD_H / 2 - WALL_T / 2, 0);  _scene.add(_wallT);

    if (_is3D) {
      // 奥壁（半透明で奥行き感を強調）
      const backWallMat = new THREE.MeshPhongMaterial({ color: 0x1a1830, transparent: true, opacity: 0.7, shininess: 10 });
      const wBack = new THREE.Mesh(new THREE.BoxGeometry(WORLD_W, WORLD_H, WALL_T), backWallMat);
      wBack.position.set(0, 0, -WORLD_Z / 2);
      wBack.receiveShadow = true;
      _scene.add(wBack);
    }

    // ---- パドル（3D時は奥行き全体に延伸）----
    const paddleZExt = _is3D ? WORLD_Z - WALL_T * 2 : PADDLE_DEPTH;
    _paddleMesh = _box(PADDLE_W, PADDLE_H, paddleZExt, 0xCE93D8, 0.05);
    _paddleMesh.position.set(0, PADDLE_Y, 0);
    _scene.add(_paddleMesh);

    // ---- ボールプール（初期1個）----
    const firstBall = _makeBallMesh();
    _scene.add(firstBall);
    _ballPool = [firstBall];

    // ---- ブリック ----
    const layerSpacing = BRICK_DEPTH + BRICK_LAYER_GAP;
    const totalZ       = _numLayers * BRICK_DEPTH + (_numLayers - 1) * BRICK_LAYER_GAP;
    const firstZ       = -(totalZ / 2) + BRICK_DEPTH / 2;

    _brickMeshes = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      _brickMeshes[r] = [];
      for (let c = 0; c < BRICK_COLS; c++) {
        _brickMeshes[r][c] = [];
        for (let l = 0; l < _numLayers; l++) {
          const mesh = _box(BRICK_W - 0.04, BRICK_H - 0.04, BRICK_DEPTH, BRICK_COLOR_HEX[r], 0.08);
          mesh.position.set(
            BRICKS_LEFT_X + c * (BRICK_W + BRICK_GAP),
            BRICKS_TOP_Y  - r * (BRICK_H + BRICK_GAP),
            _is3D ? firstZ + l * layerSpacing : 0
          );
          _brickMeshes[r][c][l] = mesh;
          _scene.add(mesh);
        }
      }
    }
  }

  function cleanup() {
    if (_renderer) { _renderer.dispose(); _renderer = null; }
    _ambientLight  = null;
    _dirFrontLight = null;
    _brickMeshes   = [];
    _dyingBricks   = [];
    _ballPool      = [];
    _itemMeshMap.clear();
    _paddleMesh    = null;
    _wallL = _wallR = _wallT = null;
    _camera        = null;
  }

  function onResize() {
    if (!_renderer) return;
    const canvas = document.getElementById('game-canvas');
    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;
    _setupCamera(W, H);
    _renderer.setSize(W, H);
  }

  // ============================================================
  // 公開 API: カメラ回転（3D モード用）
  // ============================================================

  function setRotation(angle) { _rotY = angle; _updateCameraOrbit(); }
  function getRotation()      { return _rotY; }

  // ============================================================
  // 公開 API: 毎フレーム更新
  // ============================================================

  function sync(state) {
    if (!_scene) return;

    // ---- ボールプール同期 ----
    while (_ballPool.length < state.balls.length) {
      const m = _makeBallMesh();
      _scene.add(m);
      _ballPool.push(m);
    }
    for (let i = 0; i < _ballPool.length; i++) {
      const mesh = _ballPool[i];
      if (i < state.balls.length) {
        const ball = state.balls[i];
        mesh.visible = true;
        mesh.position.set(ball.x, ball.y, ball.z || 0);
        if (ball.caught) {
          mesh.material.color.copy(_BALL_COLOR_CATCH);
          mesh.material.emissive.copy(_BALL_COLOR_CATCH).multiplyScalar(0.5);
        } else if (state.pierceTimer > 0) {
          mesh.material.color.copy(_BALL_COLOR_PIERCE);
          mesh.material.emissive.copy(_BALL_COLOR_PIERCE).multiplyScalar(0.4);
        } else {
          mesh.material.color.copy(_BALL_COLOR_NORMAL);
          mesh.material.emissive.copy(_BALL_COLOR_NORMAL).multiplyScalar(0.25);
        }
      } else {
        mesh.visible = false;
      }
    }

    // ---- パドル ----
    _paddleMesh.position.set(state.paddle.x, PADDLE_Y, 0);
    _paddleMesh.scale.x = state.paddleWidth / PADDLE_W;

    // ---- ブリック差分更新 ----
    for (const { row, col, layer } of state.dirtyBricks) {
      const brick = state.bricks[row][col][layer];
      const mesh  = _brickMeshes[row][col][layer];
      if (!brick.alive) {
        _dyingBricks.push({ mesh, startTime: Date.now() });
      } else {
        mesh.material.color.copy(_damagedColor(row, brick.health, brick.maxHealth));
      }
    }
    _updateDyingBricks();

    // ---- アイテムメッシュ同期 ----
    const currentIds = new Set(state.items.map(i => i.id));
    for (const [id, mesh] of _itemMeshMap) {
      if (!currentIds.has(id)) {
        _scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        _itemMeshMap.delete(id);
      }
    }
    for (const item of state.items) {
      if (!_itemMeshMap.has(item.id)) {
        const mesh = _createItemMesh(item.type);
        _scene.add(mesh);
        _itemMeshMap.set(item.id, mesh);
      }
      _itemMeshMap.get(item.id).position.set(item.x, item.y, 0.1);
    }

    // ---- ダークネス エフェクト ----
    if (_ambientLight && _dirFrontLight) {
      if (state.darknessTimer > 0) {
        _ambientLight.intensity  = 0.04;
        _dirFrontLight.intensity = 0.08;
      } else {
        _ambientLight.intensity  = 0.45;
        _dirFrontLight.intensity = 0.7;
      }
    }

    // ---- HUD ----
    document.getElementById('score-display').textContent = `スコア: ${state.score}`;
    document.getElementById('lives-display').textContent = '❤'.repeat(Math.max(0, state.lives));
    _updatePowerUpHUD(state);
  }

  function _updatePowerUpHUD(state) {
    const pwEl = document.getElementById('powerup-display');
    const effects = [];
    if (state.widePaddleTimer   > 0) effects.push(`WIDE ${Math.ceil(state.widePaddleTimer)}s`);
    if (state.narrowPaddleTimer > 0) effects.push(`NARROW ${Math.ceil(state.narrowPaddleTimer)}s`);
    if (state.pierceTimer       > 0) effects.push(`PIERCE ${Math.ceil(state.pierceTimer)}s`);
    if (state.catchTimer        > 0) effects.push(`CATCH ${Math.ceil(state.catchTimer)}s`);
    if (state.darknessTimer     > 0) effects.push(`DARK ${Math.ceil(state.darknessTimer)}s`);
    if (state.hasCaughtBalls)        effects.push('▶ タップで発射');
    if (effects.length > 0) {
      pwEl.textContent   = effects.join('  ');
      pwEl.style.display = 'block';
    } else {
      pwEl.style.display = 'none';
    }
  }

  function render() {
    if (_renderer && _scene && _camera) _renderer.render(_scene, _camera);
  }

  // ============================================================
  // 公開 API: 入力支援（Raycaster による z=0 平面交差）
  // ============================================================

  function screenToWorldX(clientX) {
    if (!_camera || !_raycaster || !_gamePlane) return 0;
    const canvas = document.getElementById('game-canvas');
    const rect   = canvas.getBoundingClientRect();
    const ndcX   = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY   = -(rect.height / 2 / rect.height) * 2 + 1;
    _raycaster.setFromCamera({ x: ndcX, y: ndcY }, _camera);
    const target = new THREE.Vector3();
    _raycaster.ray.intersectPlane(_gamePlane, target);
    return target ? target.x : 0;
  }

  // ============================================================
  // 公開 API: 画面管理
  // ============================================================

  function showGameScreen() {
    document.getElementById('settings-screen').style.display = 'none';
    document.getElementById('game-screen').style.display     = 'block';
  }

  function showSettingsScreen() {
    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('game-screen').style.display       = 'none';
    document.getElementById('settings-screen').style.display   = 'flex';
  }

  function showGameOver(score, won) {
    document.getElementById('result-title').textContent =
      won ? '🎉 ステージクリア！' : 'ゲームオーバー';
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-overlay').style.display = 'flex';
  }

  function hideGameOver() {
    document.getElementById('game-over-overlay').style.display = 'none';
  }

  function resetBrickMeshes(bricks) {
    _dyingBricks = [];
    for (const [, mesh] of _itemMeshMap) {
      if (_scene) { _scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); }
    }
    _itemMeshMap.clear();

    for (let i = 0; i < _ballPool.length; i++) {
      _ballPool[i].visible = (i === 0);
      _ballPool[i].material.color.copy(_BALL_COLOR_NORMAL);
      _ballPool[i].material.emissive.copy(_BALL_COLOR_NORMAL).multiplyScalar(0.25);
    }

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let l = 0; l < _numLayers; l++) {
          const mesh = _brickMeshes[r][c][l];
          mesh.visible = true;
          mesh.scale.set(1, 1, 1);
          mesh.material.color.setHex(BRICK_COLOR_HEX[r]);
        }
      }
    }

    if (_paddleMesh) _paddleMesh.scale.x = 1;
    if (_ambientLight)  _ambientLight.intensity  = 0.45;
    if (_dirFrontLight) _dirFrontLight.intensity = 0.7;
    const pwEl = document.getElementById('powerup-display');
    if (pwEl) pwEl.style.display = 'none';
  }

  return {
    initScene, cleanup, onResize,
    setRotation, getRotation,
    sync, render,
    screenToWorldX,
    showGameScreen, showSettingsScreen,
    showGameOver, hideGameOver,
    resetBrickMeshes,
  };

})();
