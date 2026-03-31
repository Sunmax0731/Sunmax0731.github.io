/* ============================================================
   Life Game - view3d.js
   Three.js による真の 3D ボリューム描画（球状グリッド版）

   カメラ: クォータニオン方式アークボール（マインスイーパ準拠）
     _camQuat : カメラ姿勢クォータニオン
     _camDist : 中心からの距離
     getCamQuat() / setCamQuat(q) でコントローラが操作

   フェード値 → 描画レイヤー:
     fade=3 (生存中)  : 不透明  #A8D5A2
     fade=2 (死後1世代): 半透明  #5A9A5A  opacity 0.45
     fade=1 (死後2世代): 薄い    #285A28  opacity 0.18
     fade=0 (完全死亡) : かすか  #0C160C  opacity 0.06
   ============================================================ */

class LifeView3D {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.model  = model;
    this._dirty = true;

    this._raycaster = new THREE.Raycaster();
    this._mouse     = new THREE.Vector2();
    this._matBuf    = new THREE.Matrix4();
    this._posBuf    = new THREE.Vector3();

    // アークボールカメラ状態
    this._camQuat = new THREE.Quaternion();
    this._camDist = 1;

    this._setupRenderer();
    this._setupScene();
    this._setupCamera();
    this._setupLights();
    this._setupMeshes();
    this._setupSphereWireframe();

    this.resize();
  }

  // ---- ヘルパー ----

  _center() {
    const { cols, rows, layers } = this.model;
    return {
      cx: (cols   - 1) * CELL_SIZE / 2,
      cy: (rows   - 1) * CELL_SIZE / 2,
      cz: (layers - 1) * CELL_SIZE / 2,
    };
  }

  // ---- セットアップ ----

  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  _setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060806);
    this.scene.fog = new THREE.FogExp2(0x060806, 0.009);
  }

  _setupCamera() {
    const { cx, cy, cz } = this._center();
    const r = this.model.sphereRadius * CELL_SIZE;
    this._camDist = r * 3.0;

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);

    // 初期姿勢: (0,0,1) → 斜め右上前方から見るクォータニオン
    // setFromUnitVectors で「デフォルト方向(0,0,1)」→「希望方向」に回転させる
    const targetDir = new THREE.Vector3(0.70, 0.75, -0.65).normalize();
    this._camQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), targetDir);

    this._updateCamera();
  }

  // カメラ位置をクォータニオンから計算して更新
  _updateCamera() {
    const { cx, cy, cz } = this._center();
    const offset = new THREE.Vector3(0, 0, this._camDist).applyQuaternion(this._camQuat);
    const up     = new THREE.Vector3(0, 1, 0).applyQuaternion(this._camQuat);
    this.camera.position.set(cx + offset.x, cy + offset.y, cz + offset.z);
    this.camera.up.copy(up);
    this.camera.lookAt(cx, cy, cz);
  }

  // ---- アークボール公開 API ----

  getCamQuat() { return this._camQuat.clone(); }

  setCamQuat(q) {
    this._camQuat.copy(q);
    this._updateCamera();
    this._dirty = true;
  }

  // ---- ライト / メッシュ ----

  _setupLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.48));

    const key = new THREE.DirectionalLight(0xffffff, 0.92);
    key.position.set(1.5, 2.0, -1.0);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x88aacc, 0.22);
    fill.position.set(-1.0, -0.6, 0.8);
    this.scene.add(fill);
  }

  _setupMeshes() {
    const total = this.model._maskIndices.length;
    const cs    = CELL_SIZE - CELL_GAP;
    const geo   = new THREE.BoxGeometry(cs, cs, cs);

    this.aliveMesh = this._makeMesh(geo, 0xA8D5A2, 1.00, false, total);
    this.fadeMesh2 = this._makeMesh(geo, 0x5A9A5A, 0.45, true,  total);
    this.fadeMesh1 = this._makeMesh(geo, 0x285A28, 0.18, true,  total);
    this.deadMesh  = this._makeMesh(geo, 0x0C160C, 0.06, true,  total);
  }

  _makeMesh(geo, color, opacity, transparent, maxCount) {
    const mat = new THREE.MeshLambertMaterial({
      color, transparent, opacity,
      depthWrite: !transparent,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, maxCount);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count = 0;
    this.scene.add(mesh);
    return mesh;
  }

  _setupSphereWireframe() {
    const { cx, cy, cz } = this._center();
    const r = this.model.sphereRadius * CELL_SIZE;
    const geo = new THREE.SphereGeometry(r, 20, 14);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x2A5A2A, wireframe: true, transparent: true, opacity: 0.12,
    });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.set(cx, cy, cz);
    this.scene.add(sphere);
  }

  // ---- 公開 API ----

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this._dirty = true;
  }

  markDirty() { this._dirty = true; }

  // canvas 座標 → セル XYZ（InstancedMesh へのレイキャスト）
  canvasToCellXYZ(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this._mouse.x =  ((clientX - rect.left) / rect.width)  * 2 - 1;
    this._mouse.y = -((clientY - rect.top)  / rect.height) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this.camera);

    const targets = [this.aliveMesh, this.fadeMesh2, this.fadeMesh1, this.deadMesh];
    let best = null, bestDist = Infinity;

    for (const mesh of targets) {
      if (mesh.count === 0) continue;
      const hits = this._raycaster.intersectObject(mesh);
      if (hits.length > 0 && hits[0].distance < bestDist) {
        best = hits[0]; bestDist = hits[0].distance;
      }
    }
    if (!best || best.instanceId == null) return null;

    best.object.getMatrixAt(best.instanceId, this._matBuf);
    this._posBuf.setFromMatrixPosition(this._matBuf);

    return {
      x: Math.round(this._posBuf.x / CELL_SIZE),
      y: Math.round(this._posBuf.y / CELL_SIZE),
      z: Math.round(this._posBuf.z / CELL_SIZE),
    };
  }

  renderScene() {
    if (this._dirty) {
      this._updateInstances();
      this._dirty = false;
    }
    this.renderer.render(this.scene, this.camera);
  }

  updateHUD(generation, population) {
    document.getElementById('gen-display').textContent = `世代: ${generation.toLocaleString()}`;
    document.getElementById('pop-display').textContent = `個体: ${population.toLocaleString()}`;
  }

  dispose() { this.renderer.dispose(); }

  // ---- 内部: InstancedMesh 更新 ----

  _updateInstances() {
    const { model } = this;
    const { cols, rows } = model;
    const mat = this._matBuf;
    let ai = 0, f2i = 0, f1i = 0, di = 0;

    for (const i of model._maskIndices) {
      const z  = Math.floor(i / (rows * cols));
      const y  = Math.floor((i % (rows * cols)) / cols);
      const x  = i % cols;
      const fv = model.fade[i];
      mat.setPosition(x * CELL_SIZE, y * CELL_SIZE, z * CELL_SIZE);

      if (model.cells[i]) {
        this.aliveMesh.setMatrixAt(ai++, mat);
      } else if (fv === 2) {
        this.fadeMesh2.setMatrixAt(f2i++, mat);
      } else if (fv === 1) {
        this.fadeMesh1.setMatrixAt(f1i++, mat);
      } else {
        this.deadMesh.setMatrixAt(di++, mat);
      }
    }

    this.aliveMesh.count = ai;
    this.fadeMesh2.count = f2i;
    this.fadeMesh1.count = f1i;
    this.deadMesh.count  = di;

    this.aliveMesh.instanceMatrix.needsUpdate = true;
    this.fadeMesh2.instanceMatrix.needsUpdate = true;
    this.fadeMesh1.instanceMatrix.needsUpdate = true;
    this.deadMesh.instanceMatrix.needsUpdate  = true;
  }
}
