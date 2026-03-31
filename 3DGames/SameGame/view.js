// ============================================================
// SameGame 3D - view.js
// 役割: 描画・表示の責務をすべて担う
//   - Three.js シーン管理・メッシュ生成・アニメーション
//   - HUD / ゲームオーバー画面などの DOM 更新
//   - ゲームロジックには関与しない
// ============================================================

const View = (() => {

  // ---- Three.js 内部状態 ----
  let _scene, _camera, _renderer, _raycaster, _mouse;
  let _blockMeshes      = []; // _blockMeshes[row][col][depth] = Mesh | null
  let _highlightedGroup = [];
  let _animationId      = null;
  let _boardWidth       = 0;
  let _boardHeight      = 0;
  let _boardDepth       = 1;

  // ---- アニメーション状態 ----
  let _removeAnim   = [];
  let _fallAnim     = [];
  let _onRemoveDone = null;
  let _onFallDone   = null;

  // ---- カメラオービット（Y軸回転）----
  let _rotY       = 0;   // 現在の回転角（ラジアン）
  let _orbitCx    = 0;   // 注視点 X
  let _orbitCy    = 0;   // 注視点 Y
  let _orbitCz    = 0;   // 注視点 Z
  let _orbitRelX  = 0;   // 回転前カメラ相対位置 X
  let _orbitRelY  = 0;   // 回転前カメラ相対位置 Y（Y は回転で変化しない）
  let _orbitRelZ  = 0;   // 回転前カメラ相対位置 Z

  // ============================================================
  // イージング
  // ============================================================
  function _easeInQuad(t)  { return t * t; }
  function _easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

  // ============================================================
  // 内部: Three.js ヘルパー
  // ============================================================

  function _createBlockMesh(colorIndex, row, col, depth) {
    const geo = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_DEPTH);
    const mat = new THREE.MeshPhongMaterial({
      color:    new THREE.Color(BLOCK_COLORS_HEX[colorIndex - 1]),
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0xaaaaaa),
      shininess: 70,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      col  * BLOCK_SPACING,
      (_boardHeight - 1 - row) * BLOCK_SPACING,
      -(depth * BLOCK_SPACING)
    );
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData = { row, col, depth, colorIndex };
    return mesh;
  }

  function _addStarField(cz) {
    const geo = new THREE.BufferGeometry();
    const N   = 300;
    const pos = new Float32Array(N * 3);
    const baseZ = cz - (_boardDepth * BLOCK_SPACING + 15);
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 2] = baseZ - Math.random() * 20;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    _scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18 })));
  }

  function _clearHighlightInternal() {
    for (const [r, c, d] of _highlightedGroup) {
      const m = _blockMeshes[r] && _blockMeshes[r][c] && _blockMeshes[r][c][d];
      if (m) { m.material.emissive.setHex(0x000000); m.scale.set(1, 1, 1); }
    }
    _highlightedGroup = [];
  }

  // ============================================================
  // 内部: カメラオービット
  // ============================================================

  /**
   * _rotY に基づいてカメラ位置を更新する
   * Y 軸回転行列: X' = relX*cos(θ) + relZ*sin(θ)
   *              Z' = -relX*sin(θ) + relZ*cos(θ)
   */
  function _updateCameraOrbit() {
    if (!_camera) return;
    const cosA = Math.cos(_rotY);
    const sinA = Math.sin(_rotY);
    const newRelX = _orbitRelX * cosA + _orbitRelZ * sinA;
    const newRelZ = -_orbitRelX * sinA + _orbitRelZ * cosA;
    _camera.position.set(
      _orbitCx + newRelX,
      _orbitCy + _orbitRelY,
      _orbitCz + newRelZ
    );
    _camera.lookAt(_orbitCx, _orbitCy, _orbitCz);
  }

  // ============================================================
  // 内部: カメラセットアップ（initScene / onResize 共通）
  // ============================================================

  function _setupCamera(W, H) {
    const cx = (_boardWidth  - 1) * BLOCK_SPACING / 2;
    const cy = (_boardHeight - 1) * BLOCK_SPACING / 2;
    const cz = -((_boardDepth - 1) * BLOCK_SPACING / 2);

    const fovV       = 42 * Math.PI / 180;
    const aspect     = W / H;
    const margin     = BLOCK_SPACING * 1.5;
    const depthExtent = (_boardDepth - 1) * BLOCK_SPACING;

    const effectHalfW = cx + (_boardDepth > 1 ? depthExtent * 0.5 : 0);
    const distV = (cy + margin) / Math.tan(fovV / 2);
    const distH = (effectHalfW + margin) / (Math.tan(fovV / 2) * aspect);
    const dist  = Math.max(distV, distH) * 1.1;

    // オービットパラメータを更新（resize 時も再計算）
    _orbitCx   = cx;
    _orbitCy   = cy;
    _orbitCz   = cz;
    _orbitRelX = (_boardDepth > 1) ? depthExtent * 0.65 : 0;
    _orbitRelY = (_boardDepth > 1) ? dist * 0.18 : 0;
    _orbitRelZ = dist;

    // 現在の回転角を維持したままカメラ位置を更新
    _updateCameraOrbit();

    return { cx, cy, cz, dist, depthExtent };
  }

  // ============================================================
  // 内部: アニメーションループ
  // ============================================================

  function _animateLoop() {
    _animationId = requestAnimationFrame(_animateLoop);
    const now = Date.now();

    // Phase 1: 消去アニメーション
    if (_removeAnim.length > 0) {
      let allDone = true;
      for (const b of _removeAnim) {
        const t = Math.min(1, (now - b.startTime) / REMOVE_DURATION);
        b.mesh.scale.set(1 - t, 1 - t, 1 - t);
        b.mesh.material.emissive.setRGB(t * 0.9, t * 0.5, 0.05);
        if (t < 1) allDone = false;
      }
      if (allDone) {
        _removeAnim = [];
        const cb = _onRemoveDone;
        _onRemoveDone = null;
        if (cb) cb();
      }
    }

    // Phase 2: 落下アニメーション
    if (_fallAnim.length > 0) {
      let allDone = true;
      for (const b of _fallAnim) {
        const t = Math.min(1, (now - b.startTime) / FALL_DURATION);
        b.mesh.position.x = b.fromX + (b.toX - b.fromX) * _easeOutQuad(t);
        b.mesh.position.y = b.fromY + (b.toY - b.fromY) * _easeInQuad(t);
        if (t < 1) allDone = false;
      }
      if (allDone) {
        for (const b of _fallAnim) {
          b.mesh.position.x = b.toX;
          b.mesh.position.y = b.toY;
        }
        _fallAnim = [];
        const cb = _onFallDone;
        _onFallDone = null;
        if (cb) cb();
      }
    }

    _renderer.render(_scene, _camera);
  }

  // ============================================================
  // 公開 API: Three.js シーン管理
  // ============================================================

  function initScene(boardWidth, boardHeight, boardDepth) {
    cleanup();

    _boardWidth  = boardWidth;
    _boardHeight = boardHeight;
    _boardDepth  = (boardDepth && boardDepth >= 1) ? boardDepth : 1;
    _rotY        = 0; // 新ゲームごとに回転リセット

    const canvas = document.getElementById('game-canvas');
    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;

    _scene = new THREE.Scene();
    _scene.background = new THREE.Color(0x08080f);

    _camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 300);
    const { cx, cy, cz, dist, depthExtent } = _setupCamera(W, H);

    const fogNear = dist * 0.85;
    const fogFar  = dist + depthExtent + 30;
    _scene.fog = new THREE.Fog(0x08080f, fogNear, fogFar);

    _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    _renderer.setSize(W, H);
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.shadowMap.enabled = true;
    _renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    _scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(cx + dist * 0.4, cy + dist * 0.7, dist * 0.6);
    sun.castShadow = true;
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
    _scene.add(sun);

    const fill = new THREE.DirectionalLight(0x6688ff, 0.35);
    fill.position.set(-dist, cy - dist * 0.2, dist * 0.3);
    _scene.add(fill);

    _addStarField(cz);

    // 2D モードのみ床板を表示（3D モードでは中央断面に見えてしまうため非表示）
    if (_boardDepth === 1) {
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(
          boardWidth  * BLOCK_SPACING + 0.6,
          boardHeight * BLOCK_SPACING + 0.6
        ),
        new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.9, metalness: 0.1 })
      );
      floor.position.set(cx, cy, -BLOCK_DEPTH / 2 - 0.01);
      floor.receiveShadow = true;
      _scene.add(floor);
    }

    _raycaster = new THREE.Raycaster();
    _mouse     = new THREE.Vector2();

    _animateLoop();
  }

  function cleanup() {
    if (_animationId) { cancelAnimationFrame(_animationId); _animationId = null; }
    if (_renderer)    { _renderer.dispose(); _renderer = null; }
    _blockMeshes      = [];
    _highlightedGroup = [];
    _removeAnim       = [];
    _fallAnim         = [];
    _onRemoveDone     = null;
    _onFallDone       = null;
  }

  function rebuildMeshes(board, boardWidth, boardHeight, boardDepth) {
    const depth = (boardDepth && boardDepth >= 1) ? boardDepth : 1;

    for (let r = 0; r < _blockMeshes.length; r++)
      for (let c = 0; c < (_blockMeshes[r] || []).length; c++)
        for (let d = 0; d < (_blockMeshes[r][c] || []).length; d++) {
          const m = _blockMeshes[r][c][d];
          if (m) { _scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
        }

    _blockMeshes      = [];
    _highlightedGroup = [];

    for (let r = 0; r < boardHeight; r++) {
      _blockMeshes[r] = [];
      for (let c = 0; c < boardWidth; c++) {
        _blockMeshes[r][c] = [];
        for (let d = 0; d < depth; d++) {
          if (board[r][c][d] !== 0) {
            const mesh = _createBlockMesh(board[r][c][d], r, c, d);
            _blockMeshes[r][c][d] = mesh;
            _scene.add(mesh);
          } else {
            _blockMeshes[r][c][d] = null;
          }
        }
      }
    }
  }

  function onResize() {
    if (!_renderer || !_camera) return;
    const canvas = document.getElementById('game-canvas');
    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;
    _camera.aspect = W / H;
    _setupCamera(W, H); // オービットパラメータ再計算 + 回転維持
    _camera.updateProjectionMatrix();
    _renderer.setSize(W, H);
  }

  // ============================================================
  // 公開 API: カメラ回転（Controller から呼ぶ）
  // ============================================================

  /** Y 軸回転角を設定してカメラを更新する */
  function setRotation(angle) {
    _rotY = angle;
    _updateCameraOrbit();
  }

  /** 現在の Y 軸回転角を返す */
  function getRotation() {
    return _rotY;
  }

  // ============================================================
  // 公開 API: 入力支援
  // ============================================================

  function getHoveredCell(clientX, clientY) {
    const canvas = document.getElementById('game-canvas');
    const rect   = canvas.getBoundingClientRect();
    _mouse.x =  ((clientX - rect.left) / rect.width)  * 2 - 1;
    _mouse.y = -((clientY - rect.top)  / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_mouse, _camera);

    const meshes = [];
    for (let r = 0; r < _boardHeight; r++)
      for (let c = 0; c < _boardWidth; c++)
        for (let d = 0; d < _boardDepth; d++)
          if (_blockMeshes[r] && _blockMeshes[r][c] && _blockMeshes[r][c][d])
            meshes.push(_blockMeshes[r][c][d]);

    const hits = _raycaster.intersectObjects(meshes);
    if (hits.length === 0) return null;
    const { row, col, depth } = hits[0].object.userData;
    return { row, col, depth };
  }

  // ============================================================
  // 公開 API: ハイライト
  // ============================================================

  function highlightGroup(group) {
    _clearHighlightInternal();
    if (group.length < 2) return;
    _highlightedGroup = group;
    for (const [r, c, d] of group) {
      const m = _blockMeshes[r] && _blockMeshes[r][c] && _blockMeshes[r][c][d];
      if (m) { m.material.emissive.setHex(0x3a3a3a); m.scale.set(1.06, 1.06, 1.06); }
    }
    const n = group.length;
    setInfo(`${n}個 → +${n * (n - 1)}点`);
  }

  function clearHighlight() {
    _clearHighlightInternal();
  }

  // ============================================================
  // 公開 API: アニメーション
  // ============================================================

  function startRemoveAnimation(group, onDone) {
    const t0 = Date.now();
    _removeAnim = group.map(([r, c, d]) => ({
      mesh: _blockMeshes[r][c][d],
      startTime: t0,
    }));

    _onRemoveDone = () => {
      for (const [r, c, d] of group) {
        const m = _blockMeshes[r][c][d];
        if (m) { _scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
        _blockMeshes[r][c][d] = null;
      }
      onDone();
    };
  }

  function startFallAnimation(gravMap, shiftMap, boardHeight, boardDepth, onDone) {
    const t1 = Date.now();
    const newFall = [];
    const newBlockMeshes = Array.from({ length: boardHeight }, () =>
      Array.from({ length: _boardWidth }, () =>
        new Array(boardDepth).fill(null)
      )
    );

    for (let r = 0; r < boardHeight; r++) {
      for (let c = 0; c < _boardWidth; c++) {
        for (let d = 0; d < boardDepth; d++) {
          const m = _blockMeshes[r] && _blockMeshes[r][c] && _blockMeshes[r][c][d];
          if (!m) continue;

          const newRow = gravMap[c] && gravMap[c][d] && gravMap[c][d][r];
          const newCol = shiftMap[c];

          if (newRow === undefined || newCol === undefined) {
            _scene.remove(m); m.geometry.dispose(); m.material.dispose();
            continue;
          }

          const toX = newCol * BLOCK_SPACING;
          const toY = (boardHeight - 1 - newRow) * BLOCK_SPACING;

          if (Math.abs(toX - m.position.x) > 0.001 || Math.abs(toY - m.position.y) > 0.001) {
            newFall.push({ mesh: m, fromX: m.position.x, fromY: m.position.y, toX, toY, startTime: t1 });
          }

          m.userData.row = newRow;
          m.userData.col = newCol;
          newBlockMeshes[newRow][newCol][d] = m;
        }
      }
    }
    _blockMeshes = newBlockMeshes;

    if (newFall.length === 0) { onDone(); return; }

    _fallAnim   = newFall;
    _onFallDone = onDone;
  }

  // ============================================================
  // 公開 API: HUD 更新
  // ============================================================

  function updateScore(score) {
    document.getElementById('score-display').textContent = `スコア: ${score}`;
  }

  function setInfo(text) {
    document.getElementById('info-display').textContent = text;
  }

  function updateColorCounter(counts, colorCount) {
    const container = document.getElementById('color-counter');
    container.innerHTML = '';
    for (let i = 0; i < colorCount; i++) {
      const item = document.createElement('div');
      item.className = 'cc-item' + (counts[i] === 0 ? ' zero' : '');

      const swatch = document.createElement('div');
      swatch.className = 'cc-swatch';
      swatch.style.background = BLOCK_COLORS_CSS[i];

      const label = document.createElement('span');
      label.className = 'cc-label';
      label.textContent = '残り';

      const count = document.createElement('span');
      count.className = 'cc-count';
      count.textContent = counts[i];

      item.appendChild(swatch);
      item.appendChild(label);
      item.appendChild(count);
      container.appendChild(item);
    }
  }

  function showGameOver(score, remaining, isPerfect, colorCounts, colorCount) {
    const titleEl = document.getElementById('game-over-title');
    if (isPerfect) { titleEl.textContent = '完全クリア！'; titleEl.className = 'perfect'; }
    else           { titleEl.textContent = 'ゲームオーバー'; titleEl.className = 'normal'; }

    document.getElementById('final-score').textContent = score;
    document.getElementById('remaining-blocks').textContent =
      isPerfect ? 'ボーナス +1000点！' : `残りブロック合計: ${remaining}個`;

    const container = document.getElementById('go-color-counts');
    container.innerHTML = '';
    if (!isPerfect) {
      for (let i = 0; i < colorCount; i++) {
        if (colorCounts[i] === 0) continue;
        const item = document.createElement('div');
        item.className = 'go-cc-item';

        const swatch = document.createElement('div');
        swatch.className = 'go-cc-swatch';
        swatch.style.background = BLOCK_COLORS_CSS[i];

        const label = document.createElement('span');
        label.textContent = `${colorCounts[i]}個`;

        item.appendChild(swatch);
        item.appendChild(label);
        container.appendChild(item);
      }
    }

    document.getElementById('game-over-overlay').style.display = 'flex';
  }

  function hideGameOver() {
    document.getElementById('game-over-overlay').style.display = 'none';
  }

  // ============================================================
  // 公開 API: 画面切り替え
  // ============================================================

  function showGameScreen() {
    document.getElementById('settings-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
  }

  function showSettingsScreen() {
    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('settings-screen').style.display = 'flex';
  }

  return {
    // Three.js
    initScene,
    cleanup,
    rebuildMeshes,
    onResize,
    // カメラ回転
    setRotation,
    getRotation,
    // 入力支援
    getHoveredCell,
    // ハイライト
    highlightGroup,
    clearHighlight,
    // アニメーション
    startRemoveAnimation,
    startFallAnimation,
    // HUD
    updateScore,
    setInfo,
    updateColorCounter,
    showGameOver,
    hideGameOver,
    // 画面切り替え
    showGameScreen,
    showSettingsScreen,
  };

})();
