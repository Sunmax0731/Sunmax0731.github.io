/* ============================================================
   Life Game - model3d.js
   真の3D セルオートマトン（球状グリッド）

   - グリッド: cols × rows × layers の直方体を定義するが、
     中央に内接する球の内側のセルのみ有効（mask=1）
   - 近傍: 26 近傍（境界は死亡セル扱い、トーラスなし）
   - ルール: B5/S45（Carter Bays の 3D Life）
   - フェード: 死んだセルが3世代かけて透明に消える
   ============================================================ */

class LifeModel3D {
  static FADE_MAX = 3;

  constructor(cols, rows, layers) {
    this.cols   = cols;
    this.rows   = rows;
    this.layers = layers;

    const size     = cols * rows * layers;
    this.cells     = new Uint8Array(size);
    this.next      = new Uint8Array(size);
    this.fade      = new Uint8Array(size);

    // 球マスク: 中心から球半径以内のセルだけ有効
    this.mask      = new Uint8Array(size);
    this.sphereRadius = (Math.min(cols, rows, layers) - 1) / 2 * 0.95;
    this._buildMask();

    // 有効セルのインデックスリスト（ランダム選択に使用）
    this._maskIndices = [];
    for (let i = 0; i < size; i++) {
      if (this.mask[i]) this._maskIndices.push(i);
    }

    this.generation = 0;
    this.population = 0;

    // B5/S45: 誕生=5近傍、生存=4か5近傍
    this.birthSet   = new Set([5]);
    this.surviveSet = new Set([4, 5]);
  }

  // ---- マスク構築 ----

  _buildMask() {
    const { cols, rows, layers } = this;
    const cx = (cols   - 1) / 2;
    const cy = (rows   - 1) / 2;
    const cz = (layers - 1) / 2;
    const r2 = this.sphereRadius * this.sphereRadius;

    for (let z = 0; z < layers; z++) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const dx = x - cx, dy = y - cy, dz = z - cz;
          this.mask[this.idx(x, y, z)] = (dx*dx + dy*dy + dz*dz <= r2) ? 1 : 0;
        }
      }
    }
  }

  // ---- インデックス変換 ----

  idx(x, y, z) {
    return (z * this.rows + y) * this.cols + x;
  }

  _idxToXYZ(i) {
    const { cols, rows } = this;
    const z = Math.floor(i / (rows * cols));
    const y = Math.floor((i % (rows * cols)) / cols);
    const x = i % cols;
    return { x, y, z };
  }

  get(x, y, z) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows || z < 0 || z >= this.layers) return 0;
    return this.cells[this.idx(x, y, z)];
  }

  set(x, y, z, val) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows || z < 0 || z >= this.layers) return;
    const i = this.idx(x, y, z);
    if (!this.mask[i]) return; // 球外は変更不可
    const prev = this.cells[i];
    this.cells[i] = val;
    if (val) this.fade[i] = LifeModel3D.FADE_MAX;
    this.population += val - prev;
  }

  // ---- 状態操作 ----

  clear() {
    this.cells.fill(0);
    this.next.fill(0);
    this.fade.fill(0);
    this.generation = 0;
    this.population = 0;
  }

  randomize(density = 0.20) {
    this.cells.fill(0);
    this.fade.fill(0);
    this.population = 0;
    for (const i of this._maskIndices) {
      this.cells[i] = Math.random() < density ? 1 : 0;
      this.fade[i]  = this.cells[i] ? LifeModel3D.FADE_MAX : 0;
      this.population += this.cells[i];
    }
    this.generation = 0;
  }

  // 球の中心付近に密集してランダム配置（「中央集積」パターン）
  randomizeCenter(density = 0.35) {
    this.clear();
    const cx = (this.cols   - 1) / 2;
    const cy = (this.rows   - 1) / 2;
    const cz = (this.layers - 1) / 2;
    const innerR2 = (this.sphereRadius * 0.45) ** 2;

    for (const i of this._maskIndices) {
      const { x, y, z } = this._idxToXYZ(i);
      const dx = x - cx, dy = y - cy, dz = z - cz;
      if (dx*dx + dy*dy + dz*dz <= innerR2 && Math.random() < density) {
        this.cells[i] = 1;
        this.fade[i]  = LifeModel3D.FADE_MAX;
        this.population++;
      }
    }
    this.generation = 0;
  }

  /**
   * 球内のランダムな位置に小クラスターを発生させる
   * （絶滅時の自動復活用）
   * B5/S45 は5近傍が必要なため、密度~20%の5×5×5クラスターを生成
   */
  respawn(sx, sy, sz) {
    const indices = this._maskIndices;
    if (indices.length === 0) return;

    // 座標が渡されなければランダムな種座標を選ぶ
    if (sx === undefined) {
      ({ x: sx, y: sy, z: sz } = this._idxToXYZ(
        indices[Math.floor(Math.random() * indices.length)]
      ));
    }

    // 5×5×5 の範囲を約20%の密度で充填
    for (let dz = -2; dz <= 2; dz++) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (Math.random() > 0.20) continue;
          const x = sx + dx;
          const y = sy + dy;
          const z = sz + dz;
          if (x < 0 || x >= this.cols || y < 0 || y >= this.rows || z < 0 || z >= this.layers) continue;
          const i = this.idx(x, y, z);
          if (this.mask[i] && !this.cells[i]) {
            this.cells[i] = 1;
            this.fade[i]  = LifeModel3D.FADE_MAX;
            this.population++;
          }
        }
      }
    }
  }

  // ---- 1世代更新 ----

  step() {
    const { cols, rows, layers } = this;
    const size = cols * rows * layers;
    let pop = 0;

    for (let z = 0; z < layers; z++) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = this.idx(x, y, z);

          if (!this.mask[i]) {
            // 球外: 常に死亡
            this.next[i] = 0;
            this.fade[i] = 0;
            continue;
          }

          const n     = this._countNeighbors(x, y, z);
          const alive = this.cells[i];
          let next = 0;
          if (alive) {
            next = this.surviveSet.has(n) ? 1 : 0;
          } else {
            next = this.birthSet.has(n) ? 1 : 0;
          }
          this.next[i] = next;
          pop += next;
        }
      }
    }

    // フェードカウンタ更新
    for (let i = 0; i < size; i++) {
      if (!this.mask[i]) continue;
      if (this.next[i]) {
        this.fade[i] = LifeModel3D.FADE_MAX;
      } else if (this.fade[i] > 0) {
        this.fade[i]--;
      }
    }

    // バッファ入れ替え
    const tmp  = this.cells;
    this.cells = this.next;
    this.next  = tmp;

    this.population = pop;
    this.generation++;
  }

  // 近傍カウント（球外はセルが常に0なので mask チェック不要）
  _countNeighbors(x, y, z) {
    const { cols, rows, layers } = this;
    let count = 0;
    for (let dz = -1; dz <= 1; dz++) {
      const nz = z + dz;
      if (nz < 0 || nz >= layers) continue;
      const zOff = nz * rows * cols;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= rows) continue;
        const yOff = ny * cols;
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          const nx = x + dx;
          if (nx < 0 || nx >= cols) continue;
          count += this.cells[zOff + yOff + nx];
        }
      }
    }
    return count;
  }
}
