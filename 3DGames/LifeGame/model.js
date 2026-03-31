/* ============================================================
   Life Game - model.js
   Conway's Game of Life ロジック + 世代履歴バッファ
   ============================================================ */

class LifeModel {
  /**
   * @param {number} cols
   * @param {number} rows
   * @param {number} historyDepth  保持する過去世代数（2D=0、3D=N）
   */
  constructor(cols, rows, historyDepth = 0) {
    this.cols         = cols;
    this.rows         = rows;
    this.historyDepth = historyDepth;

    this.cells     = new Uint8Array(cols * rows);
    this.nextCells = new Uint8Array(cols * rows);

    // 過去世代のスナップショット配列
    // history[0] = 1世代前、history[1] = 2世代前 …
    this.history = [];

    this.generation = 0;
    this.population = 0;
  }

  idx(x, y) {
    return y * this.cols + x;
  }

  // トーラス（端が繋がる）で取得
  get(x, y) {
    const cx = (x + this.cols) % this.cols;
    const cy = (y + this.rows) % this.rows;
    return this.cells[cy * this.cols + cx];
  }

  set(x, y, val) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;
    const i    = this.idx(x, y);
    const prev = this.cells[i];
    this.cells[i] = val;
    this.population += val - prev;
  }

  toggle(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;
    const i    = this.idx(x, y);
    const prev = this.cells[i];
    this.cells[i] = prev ? 0 : 1;
    this.population += this.cells[i] - prev;
  }

  clear() {
    this.cells.fill(0);
    this.nextCells.fill(0);
    this.history = [];
    this.generation = 0;
    this.population = 0;
  }

  randomize(density = 0.3) {
    this.population = 0;
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = Math.random() < density ? 1 : 0;
      this.population += this.cells[i];
    }
    this.history    = [];
    this.generation = 0;
  }

  applyPattern(cells) {
    this.clear();
    for (const { x, y } of cells) {
      this.set(x, y, 1);
    }
  }

  /**
   * 3D モード用：レイヤーインデックスに対応する Uint8Array を返す
   * layer=0 → 現在世代、layer=1 → 1世代前、…
   */
  getLayerCells(layerIndex) {
    if (layerIndex === 0) return this.cells;
    return this.history[layerIndex - 1] || null;
  }

  // 1世代進める
  step() {
    // 履歴に現在の状態を保存（3Dモード時のみ）
    if (this.historyDepth > 0) {
      this.history.unshift(this.cells.slice()); // 先頭に追加
      if (this.history.length > this.historyDepth) {
        this.history.pop(); // 古いものを削除
      }
    }

    const { cols, rows } = this;
    let pop = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const neighbors = this._countNeighbors(x, y);
        const alive     = this.cells[this.idx(x, y)];
        let   next      = 0;

        if (alive) {
          next = (neighbors === 2 || neighbors === 3) ? 1 : 0;
        } else {
          next = (neighbors === 3) ? 1 : 0;
        }

        this.nextCells[this.idx(x, y)] = next;
        pop += next;
      }
    }

    // バッファ入れ替え
    const tmp  = this.cells;
    this.cells = this.nextCells;
    this.nextCells = tmp;

    this.population = pop;
    this.generation++;
  }

  _countNeighbors(x, y) {
    const { cols, rows } = this;
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      const ny        = (y + dy + rows) % rows;
      const rowOffset = ny * cols;
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + cols) % cols;
        count += this.cells[rowOffset + nx];
      }
    }
    return count;
  }
}
