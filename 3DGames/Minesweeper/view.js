// ============================================================
// Minesweeper - view.js
// 役割: Three.js シーン管理・レンダリング・HUD 更新
//
// shapeType:
//   'flat'     - 2D フラットグリッド
//   'cube'     - 3D キューブ球体（6面×N×N の正方形セル）
//   'triangle' - 3D 測地線球体（正二十面体分割の三角形セル）
//   'hex'      - 3D ゴールドバーグ球体（六角形+五角形セル）
// ============================================================

const View = (() => {

  let _scene, _camera, _renderer;
  let _raycaster, _gamePlane;
  let _shapeType = 'flat';
  let _rows = 0, _cols = 0;  // flat/cube 用

  // セルメッシュ（フラット配列: cellIdx → Mesh）
  let _cellMeshFlat   = [];
  let _overlayFlat    = [];
  let _cellPickList   = [];  // 3D レイキャスト対象

  // トポロジーデータ（3D モード）
  let _topoData = null;

  let _numTextures = [];
  let _mineTexture = null;
  let _flagTexture = null;

  // 球体カメラ（クォータニオン方式）
  let _camQuat = new THREE.Quaternion();
  let _camDist = SPHERE_R * 3.2;

  // ============================================================
  // テクスチャ生成
  // ============================================================

  function _makeNumTexture(num) {
    const size = 256, cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = NUM_COLORS_CSS[num];
    ctx.font = `bold ${Math.round(size * 0.68)}px Roboto, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(num), size/2, size/2 + size*0.04);
    return new THREE.CanvasTexture(cv);
  }

  function _makeMineTexture() {
    const size = 256, cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    const cx = size/2, cy = size/2 + 8;
    ctx.fillStyle = '#1a1830';
    ctx.beginPath(); ctx.arc(cx, cy, 72, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 10; ctx.stroke();
    ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 7;
    for (const [sx,sy] of [[cx,cy-96],[cx,cy+96],[cx-96,cy],[cx+96,cy],
                            [cx-68,cy-68],[cx+68,cy-68],[cx-68,cy+68],[cx+68,cy+68]]) {
      ctx.beginPath();
      ctx.moveTo(cx+(sx-cx)*0.72, cy+(sy-cy)*0.72);
      ctx.lineTo(sx, sy); ctx.stroke();
    }
    ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(cx, cy-72);
    ctx.bezierCurveTo(cx+20, cy-96, cx+48, cy-100, cx+52, cy-118); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.arc(cx-22, cy-26, 20, 0, Math.PI*2); ctx.fill();
    return new THREE.CanvasTexture(cv);
  }

  function _makeFlagTexture() {
    const size = 256, cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(88, 36); ctx.lineTo(88, 216); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(60, 216); ctx.lineTo(116, 216); ctx.stroke();
    ctx.fillStyle = '#FF5252';
    ctx.beginPath(); ctx.moveTo(88,36); ctx.lineTo(192,88); ctx.lineTo(88,140);
    ctx.closePath(); ctx.fill();
    return new THREE.CanvasTexture(cv);
  }

  function _initTextures() {
    _numTextures = [null];
    for (let i = 1; i <= 8; i++) _numTextures.push(_makeNumTexture(i));
    _mineTexture = _makeMineTexture();
    _flagTexture = _makeFlagTexture();
  }

  // ============================================================
  // 2D フラット: セルメッシュ
  // ============================================================

  function _cellWorldPos2D(row, col) {
    return {
      x: (col - (_cols-1)/2) * CELL_STEP,
      y: ((_rows-1)/2 - row) * CELL_STEP,
    };
  }

  function _calcFlatCamZ(W, H) {
    const fov = 44, fovRad = fov*Math.PI/180;
    const halfH = _rows*CELL_STEP/2 + 0.8;
    const halfW = _cols*CELL_STEP/2 + 0.8;
    const distV = halfH / Math.tan(fovRad/2);
    const hFov  = 2*Math.atan(Math.tan(fovRad/2)*W/H);
    const distH = halfW / Math.tan(hFov/2);
    return Math.max(distV, distH) * 1.12;
  }

  function _makeFlatCellMesh(row, col, cellIdx) {
    const geo  = new THREE.BoxGeometry(CELL_SIZE-0.05, CELL_SIZE-0.05, CELL_DEPTH);
    const mat  = new THREE.MeshPhongMaterial({
      color: COL_HIDDEN,
      emissive: new THREE.Color(COL_HIDDEN).multiplyScalar(0.08),
      shininess: 50,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = mesh.castShadow = true;
    const { x, y } = _cellWorldPos2D(row, col);
    mesh.position.set(x, y, 0);
    mesh.userData = { cellIdx };
    return mesh;
  }

  // ============================================================
  // キューブ球体: セルメッシュ
  // ============================================================

  // 面インデックスと正規化パラメータ (s,t) ∈ [-1,1] → 球面方向ベクトル（配列）
  function _cubeDir(face, s, t) {
    const b = FACE_BASES[face];
    const x = b.c[0]+s*b.u[0]+t*b.v[0];
    const y = b.c[1]+s*b.u[1]+t*b.v[1];
    const z = b.c[2]+s*b.u[2]+t*b.v[2];
    const len = Math.sqrt(x*x+y*y+z*z);
    return [x/len, y/len, z/len];
  }

  function _cubeSphereDir(row, col) {
    const N = _cols, face = Math.floor(row/N), u = row%N, v = col;
    const [x,y,z] = _cubeDir(face, (u+0.5)/N*2-1, (v+0.5)/N*2-1);
    return new THREE.Vector3(x, y, z);
  }

  // セルの実際の4コーナーを球面上に計算してクワッドメッシュを生成
  // BoxGeometry の固定サイズ投影とは異なり、辺・角付近でも重ならない
  function _makeSphereCellMesh(row, col, cellIdx) {
    const N    = _cols;
    const face = Math.floor(row/N), u = row%N, v = col;
    const GAP  = 0.91;
    const R    = SPHERE_R + SPHERE_DEPTH / 2;

    // セル中心方向（重心）
    const center = _cubeDir(face, (u+0.5)/N*2-1, (v+0.5)/N*2-1);

    // セルの 4 コーナー（時計回り）
    const corners = [
      _cubeDir(face,  u/N*2-1,    v/N*2-1   ),
      _cubeDir(face, (u+1)/N*2-1, v/N*2-1   ),
      _cubeDir(face, (u+1)/N*2-1, (v+1)/N*2-1),
      _cubeDir(face,  u/N*2-1,    (v+1)/N*2-1),
    ];

    // 各コーナーを中心方向に縮小して球面に配置
    const pts = corners.map(c => {
      const sx = center[0]+(c[0]-center[0])*GAP;
      const sy = center[1]+(c[1]-center[1])*GAP;
      const sz = center[2]+(c[2]-center[2])*GAP;
      const sl = Math.sqrt(sx*sx+sy*sy+sz*sz);
      return [sx/sl*R, sy/sl*R, sz/sl*R];
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([...pts[0], ...pts[1], ...pts[2], ...pts[3]]), 3
    ));
    geo.setIndex([0, 1, 2,  0, 2, 3]);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color: COL_HIDDEN,
      emissive: new THREE.Color(COL_HIDDEN).multiplyScalar(0.08),
      shininess: 50,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData = { cellIdx };
    return mesh;
  }

  // ============================================================
  // 三角形球体: セルメッシュ（各三角形 = 単一のメッシュ）
  // ============================================================

  function _makeTriangleCellMesh(triVerts, cellIdx) {
    // triVerts = [[x,y,z],[x,y,z],[x,y,z]] 正規化済み方向ベクトル
    const cx = (triVerts[0][0]+triVerts[1][0]+triVerts[2][0])/3;
    const cy = (triVerts[0][1]+triVerts[1][1]+triVerts[2][1])/3;
    const cz = (triVerts[0][2]+triVerts[1][2]+triVerts[2][2])/3;
    const cl = Math.sqrt(cx*cx+cy*cy+cz*cz);
    const centroid = [cx/cl, cy/cl, cz/cl];

    const GAP = 0.87;  // 隙間用縮小係数
    const R   = SPHERE_R + SPHERE_DEPTH / 2;

    // 各頂点を重心方向に縮小して球面に配置
    const pts = triVerts.map(v => {
      const sx = centroid[0]+(v[0]-centroid[0])*GAP;
      const sy = centroid[1]+(v[1]-centroid[1])*GAP;
      const sz = centroid[2]+(v[2]-centroid[2])*GAP;
      const sl = Math.sqrt(sx*sx+sy*sy+sz*sz);
      return [sx/sl*R, sy/sl*R, sz/sl*R];
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([...pts[0], ...pts[1], ...pts[2]]), 3
    ));
    geo.setIndex([0, 1, 2]);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color: COL_HIDDEN,
      emissive: new THREE.Color(COL_HIDDEN).multiplyScalar(0.08),
      shininess: 50,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData = { cellIdx };
    return mesh;
  }

  // ============================================================
  // 六角形球体: セルメッシュ（扇形三角分割ポリゴン）
  // ============================================================

  function _makeHexCellMesh(center, polyVerts, cellIdx) {
    // center = [x,y,z] 正規化、polyVerts = [[x,y,z]] 角度順ソート済み
    const GAP = 0.91;  // 隙間用縮小係数
    const R   = SPHERE_R + SPHERE_DEPTH / 2;
    const n   = polyVerts.length;

    // ポリゴン頂点を重心方向に縮小して球面に配置
    const pts = polyVerts.map(v => {
      const sx = center[0]+(v[0]-center[0])*GAP;
      const sy = center[1]+(v[1]-center[1])*GAP;
      const sz = center[2]+(v[2]-center[2])*GAP;
      const sl = Math.sqrt(sx*sx+sy*sy+sz*sz);
      return [sx/sl*R, sy/sl*R, sz/sl*R];
    });

    // 頂点0 = 中心点、頂点1..n = ポリゴン周辺
    const cc  = center.map(x => x*R);
    const posArr = [...cc];
    for (const p of pts) posArr.push(...p);

    // 扇形三角分割
    const indices = [];
    for (let i = 0; i < n; i++) indices.push(0, i+1, (i+1)%n+1);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArr), 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color: COL_HIDDEN,
      emissive: new THREE.Color(COL_HIDDEN).multiplyScalar(0.08),
      shininess: 50,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData = { cellIdx };
    return mesh;
  }

  // ============================================================
  // オーバーレイ
  // ============================================================

  function _overlaySize() {
    if (_shapeType === 'flat')     return CELL_SIZE * 0.74;
    if (_shapeType === 'cube')     return 2*SPHERE_R/_cols * 0.64;
    // triangle/hex: セル数から概算
    const nc = _topoData ? _topoData.numCells : 300;
    return SPHERE_R * 2.5 / Math.sqrt(nc);
  }

  function _getCellDir(cellIdx) {
    // 3D モードでセルの外向き方向ベクトルを返す
    if (_shapeType === 'cube') {
      const r = Math.floor(cellIdx / _cols);
      const c = cellIdx % _cols;
      return _cubeSphereDir(r, c);
    }
    if (_topoData && _topoData.positions) {
      const p = _topoData.positions[cellIdx];
      return new THREE.Vector3(p[0], p[1], p[2]);
    }
    return new THREE.Vector3(0, 0, 1);
  }

  function _add3DOverlay(cellIdx, texture) {
    const dir  = _getCellDir(cellIdx);
    const size = _overlaySize();
    const geo  = new THREE.PlaneGeometry(size, size);
    const mat  = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const plane = new THREE.Mesh(geo, mat);
    plane.position.copy(dir.clone().multiplyScalar(SPHERE_R + SPHERE_DEPTH + 0.03));
    plane.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), dir);
    _overlayFlat[cellIdx] = plane;
    _scene.add(plane);
  }

  function _add2DOverlay(cellIdx, texture) {
    const row = Math.floor(cellIdx / _cols);
    const col = cellIdx % _cols;
    const geo  = new THREE.PlaneGeometry(CELL_SIZE*0.74, CELL_SIZE*0.74);
    const mat  = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const plane = new THREE.Mesh(geo, mat);
    const { x, y } = _cellWorldPos2D(row, col);
    plane.position.set(x, y, CELL_DEPTH/2 + 0.01);
    _overlayFlat[cellIdx] = plane;
    _scene.add(plane);
  }

  function _removeOverlay(cellIdx) {
    const prev = _overlayFlat[cellIdx];
    if (!prev) return;
    _scene.remove(prev);
    prev.geometry.dispose();
    prev.material.dispose();
    _overlayFlat[cellIdx] = null;
  }

  function _addOverlay(cellIdx, texture) {
    _removeOverlay(cellIdx);
    if (_shapeType === 'flat') _add2DOverlay(cellIdx, texture);
    else                       _add3DOverlay(cellIdx, texture);
  }

  // ============================================================
  // 球体共通演出
  // ============================================================

  function _updateSphereCamera() {
    const pos = new THREE.Vector3(0, 0, _camDist).applyQuaternion(_camQuat);
    const up  = new THREE.Vector3(0, 1, 0).applyQuaternion(_camQuat);
    _camera.position.copy(pos);
    _camera.up.copy(up);
    _camera.lookAt(0, 0, 0);
  }

  function getCamQuat()  { return _camQuat.clone(); }
  function setCamQuat(q) { _camQuat.copy(q); _updateSphereCamera(); }

  function _addStarField() {
    const count = 900;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2*Math.random() - 1);
      const r = 80 + Math.random() * 40;
      pos[i*3]   = r*Math.sin(p)*Math.cos(t);
      pos[i*3+1] = r*Math.cos(p);
      pos[i*3+2] = r*Math.sin(p)*Math.sin(t);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    _scene.add(new THREE.Points(geo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.38, transparent: true, opacity: 0.9 })));
  }

  function _addPlanetCore() {
    _scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(5.9, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x0C0A18, shininess: 8 })
    ));
    _scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_R * 1.07, 32, 32),
      new THREE.MeshPhongMaterial({
        color: 0x3050d0, transparent: true, opacity: 0.10,
        side: THREE.BackSide, depthWrite: false,
      })
    ));
  }

  // ============================================================
  // シーン管理
  // ============================================================

  function initScene(topo) {
    cleanup();
    _topoData  = topo;
    _shapeType = topo.shapeType;
    if (_shapeType === 'flat')  { _rows = topo.rows; _cols = topo.cols; }
    if (_shapeType === 'cube')  { _rows = topo.N * 6; _cols = topo.N; }

    const canvas = document.getElementById('game-canvas');
    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;

    _scene     = new THREE.Scene();
    _raycaster = new THREE.Raycaster();

    const is3D = _shapeType !== 'flat';

    if (is3D) {
      _scene.background = new THREE.Color(0x02010A);
      _camDist = SPHERE_R * 3.2;
      _camQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.42);
      _camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 500);
      _updateSphereCamera();
      _addStarField();
      _addPlanetCore();
      _scene.add(new THREE.AmbientLight(0xaabbff, 0.38));
      const sun = new THREE.DirectionalLight(0xffeedd, 1.0);
      sun.position.set(20, 14, 20); sun.castShadow = true; _scene.add(sun);
      const fill3d = new THREE.DirectionalLight(0x4060ff, 0.22);
      fill3d.position.set(-14, -8, -14); _scene.add(fill3d);
    } else {
      _scene.background = new THREE.Color(0x0A0810);
      _camera = new THREE.PerspectiveCamera(44, W/H, 0.1, 500);
      _camera.position.set(0, 0, _calcFlatCamZ(W, H));
      _camera.lookAt(0, 0, 0);
      _gamePlane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
      _scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const dir = new THREE.DirectionalLight(0xffffff, 0.75);
      dir.position.set(4, 8, 20); dir.castShadow = true; _scene.add(dir);
      const fill2d = new THREE.DirectionalLight(0x8090ff, 0.22);
      fill2d.position.set(-4, -4, 10); _scene.add(fill2d);
    }

    _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    _renderer.setSize(W, H);
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.shadowMap.enabled = true;
    _renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

    _initTextures();

    _cellMeshFlat = [];
    _overlayFlat  = new Array(topo.numCells).fill(null);
    _cellPickList = [];

    if (_shapeType === 'flat') {
      for (let r = 0; r < _rows; r++)
        for (let c = 0; c < _cols; c++) {
          const i    = r*_cols+c;
          const mesh = _makeFlatCellMesh(r, c, i);
          _cellMeshFlat[i] = mesh;
          _scene.add(mesh);
        }

    } else if (_shapeType === 'cube') {
      for (let r = 0; r < _rows; r++)
        for (let c = 0; c < _cols; c++) {
          const i    = r*_cols+c;
          const mesh = _makeSphereCellMesh(r, c, i);
          _cellMeshFlat[i] = mesh;
          _cellPickList.push(mesh);
          _scene.add(mesh);
        }

    } else if (_shapeType === 'triangle') {
      for (let i = 0; i < topo.numCells; i++) {
        const mesh = _makeTriangleCellMesh(topo.triVerts[i], i);
        _cellMeshFlat[i] = mesh;
        _cellPickList.push(mesh);
        _scene.add(mesh);
      }

    } else if (_shapeType === 'hex') {
      for (let i = 0; i < topo.numCells; i++) {
        const mesh = _makeHexCellMesh(topo.positions[i], topo.polygons[i], i);
        _cellMeshFlat[i] = mesh;
        _cellPickList.push(mesh);
        _scene.add(mesh);
      }
    }
  }

  function cleanup() {
    if (_renderer) { _renderer.dispose(); _renderer = null; }
    for (const m of _overlayFlat) {
      if (m) { m.geometry.dispose(); m.material.dispose(); }
    }
    _cellMeshFlat = []; _overlayFlat = []; _cellPickList = [];
    _numTextures  = []; _mineTexture = null; _flagTexture = null;
    _camera = null; _scene = null; _gamePlane = null; _topoData = null;
  }

  function onResize() {
    if (!_renderer || !_camera) return;
    const canvas = document.getElementById('game-canvas');
    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;
    _camera.aspect = W/H;
    if (_shapeType === 'flat') _camera.position.z = _calcFlatCamZ(W, H);
    _camera.updateProjectionMatrix();
    _renderer.setSize(W, H);
  }

  // ============================================================
  // セル更新
  // ============================================================

  function updateCell(cellIdx, cell) {
    if (!_scene) return;
    const mesh = _cellMeshFlat[cellIdx];
    if (!mesh) return;
    if (cell.revealed) {
      if (cell.mine) {
        mesh.material.color.setHex(COL_MINE_HIT);
        mesh.material.emissive.setHex(COL_MINE_HIT).multiplyScalar(0.35);
        _addOverlay(cellIdx, _mineTexture);
      } else {
        mesh.material.color.setHex(COL_REVEALED);
        mesh.material.emissive.setHex(COL_REVEALED).multiplyScalar(0.05);
        if (cell.adjMines > 0) _addOverlay(cellIdx, _numTextures[cell.adjMines]);
        else                   _removeOverlay(cellIdx);
      }
    } else if (cell.flagged) {
      mesh.material.color.setHex(COL_HIDDEN);
      mesh.material.emissive.setHex(COL_HIDDEN).multiplyScalar(0.08);
      _addOverlay(cellIdx, _flagTexture);
    } else {
      mesh.material.color.setHex(COL_HIDDEN);
      mesh.material.emissive.setHex(COL_HIDDEN).multiplyScalar(0.08);
      _removeOverlay(cellIdx);
    }
  }

  function updateCells(changedList, cells) {
    for (const { cellIdx } of changedList) updateCell(cellIdx, cells[cellIdx]);
  }

  function revealAllMines(cells, explodedIdx) {
    if (!_scene) return;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (!cell.mine || cell.flagged) continue;
      const isHit = (i === explodedIdx);
      _cellMeshFlat[i].material.color.setHex(isHit ? COL_MINE_HIT : COL_MINE_REV);
      _cellMeshFlat[i].material.emissive
        .setHex(isHit ? COL_MINE_HIT : COL_MINE_REV)
        .multiplyScalar(isHit ? 0.4 : 0.15);
      _addOverlay(i, _mineTexture);
    }
  }

  // ============================================================
  // HUD・レンダリング
  // ============================================================

  function updateHUD(state) {
    document.getElementById('mines-display').textContent = `💣 ${state.minesLeft}`;
    document.getElementById('timer-display').textContent = `⏱ ${Math.floor(state.elapsedTime)}`;
  }

  function render() {
    if (_renderer && _scene && _camera) _renderer.render(_scene, _camera);
  }

  // ============================================================
  // 画面座標 → セル変換
  // ============================================================

  function screenToCell(clientX, clientY) {
    if (_shapeType === 'flat') return _screenToCellFlat(clientX, clientY);
    return _screenToCell3D(clientX, clientY);
  }

  function _screenToCellFlat(clientX, clientY) {
    if (!_camera || !_raycaster || !_gamePlane) return null;
    const canvas = document.getElementById('game-canvas');
    const rect   = canvas.getBoundingClientRect();
    const ndcX   =  ((clientX-rect.left)/rect.width)  * 2 - 1;
    const ndcY   = -((clientY-rect.top) /rect.height)  * 2 + 1;
    _raycaster.setFromCamera({ x: ndcX, y: ndcY }, _camera);
    const target = new THREE.Vector3();
    if (!_raycaster.ray.intersectPlane(_gamePlane, target)) return null;
    const col = Math.round(target.x / CELL_STEP + (_cols-1)/2);
    const row = Math.round(-target.y / CELL_STEP + (_rows-1)/2);
    if (col < 0 || col >= _cols || row < 0 || row >= _rows) return null;
    return { cellIdx: row*_cols+col };
  }

  function _screenToCell3D(clientX, clientY) {
    if (!_camera || !_raycaster) return null;
    const canvas = document.getElementById('game-canvas');
    const rect   = canvas.getBoundingClientRect();
    const ndcX   =  ((clientX-rect.left)/rect.width)  * 2 - 1;
    const ndcY   = -((clientY-rect.top) /rect.height)  * 2 + 1;
    _raycaster.setFromCamera({ x: ndcX, y: ndcY }, _camera);
    const hits = _raycaster.intersectObjects(_cellPickList);
    return hits.length ? hits[0].object.userData : null;
  }

  // ============================================================
  // 画面遷移
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

  function showGameOver(state, won) {
    document.getElementById('result-title').textContent  = won ? '🎉 クリア！' : '💥 ゲームオーバー';
    document.getElementById('final-time').textContent    = `${Math.floor(state.elapsedTime)} 秒`;
    document.getElementById('final-score').textContent   = won ? state.score : '---';
    document.getElementById('score-row').style.display   = won ? 'block' : 'none';
    document.getElementById('game-over-overlay').style.display = 'flex';
  }

  function hideGameOver() {
    document.getElementById('game-over-overlay').style.display = 'none';
  }

  return {
    initScene, cleanup, onResize, render,
    updateCell, updateCells, updateHUD, revealAllMines,
    screenToCell,
    getCamQuat, setCamQuat,
    showGameScreen, showSettingsScreen,
    showGameOver, hideGameOver,
  };

})();
