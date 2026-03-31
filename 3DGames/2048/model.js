/* ============================================================
   2048 - model.js
   ゲームロジック（4x4x4 3Dグリッド）
   ============================================================ */

class Model {
  constructor(size = 4, depth = 4) {
    this.SIZE  = size;
    this.DEPTH = depth;
    this.reset();
  }

  reset() {
    // grid[layer][row][col] = { id, value } | null
    // layer 0 = 手前, layer 3 = 奥
    this.grid = Array.from({ length: this.DEPTH }, () =>
      Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(null))
    );
    this.score = 0;
    this.won   = false;
    this.over  = false;
    this._shownWin = false;
    this._nextId   = 1;
    this.addRandom();
    this.addRandom();
  }

  // ---- タイル追加 ----

  _newTile(value) {
    return { id: this._nextId++, value };
  }

  addRandom() {
    const empties = [];
    for (let l = 0; l < this.DEPTH; l++)
      for (let r = 0; r < this.SIZE; r++)
        for (let c = 0; c < this.SIZE; c++)
          if (!this.grid[l][r][c]) empties.push([l, r, c]);
    if (!empties.length) return false;
    const [l, r, c] = empties[Math.floor(Math.random() * empties.length)];
    this.grid[l][r][c] = this._newTile(Math.random() < 0.9 ? 2 : 4);
    return true;
  }

  // ---- 1列スライド（左方向基準） ----

  _slideRow(row) {
    const vals = row.filter(Boolean);
    const result = Array(row.length).fill(null);
    let gained = 0;
    let wi = 0;
    let i = 0;
    while (i < vals.length) {
      if (i + 1 < vals.length && vals[i].value === vals[i + 1].value) {
        const merged = this._newTile(vals[i].value * 2);
        merged.mergedFrom = [vals[i].id, vals[i + 1].id];
        result[wi++] = merged;
        gained += merged.value;
        i += 2;
      } else {
        result[wi++] = vals[i++];
      }
    }
    const moved = row.some((t, idx) => {
      if (!t && !result[idx]) return false;
      if (!t || !result[idx]) return true;
      return t.id !== result[idx].id;
    });
    return { result, gained, moved };
  }

  // ---- 移動 ----
  // direction: 'left'|'right'|'up'|'down'|'forward'|'backward'
  // forward  = 手前（layer index 減少方向）
  // backward = 奥  （layer index 増加方向）

  move(direction) {
    if (this.over) return { moved: false, gained: 0 };

    let totalGained = 0;
    let totalMoved  = false;
    const { SIZE, DEPTH } = this;

    if (direction === 'left' || direction === 'right') {
      for (let l = 0; l < DEPTH; l++) {
        for (let r = 0; r < SIZE; r++) {
          let line = this.grid[l][r].slice();
          if (direction === 'right') line.reverse();
          const { result, gained, moved } = this._slideRow(line);
          if (direction === 'right') result.reverse();
          this.grid[l][r] = result;
          totalGained += gained;
          if (moved) totalMoved = true;
        }
      }
    } else if (direction === 'up' || direction === 'down') {
      for (let l = 0; l < DEPTH; l++) {
        for (let c = 0; c < SIZE; c++) {
          let line = Array.from({ length: SIZE }, (_, r) => this.grid[l][r][c]);
          if (direction === 'down') line.reverse();
          const { result, gained, moved } = this._slideRow(line);
          if (direction === 'down') result.reverse();
          for (let r = 0; r < SIZE; r++) this.grid[l][r][c] = result[r];
          totalGained += gained;
          if (moved) totalMoved = true;
        }
      }
    } else if (direction === 'forward' || direction === 'backward') {
      // forward = layer index 減少（手前へ寄せる）
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          let line = Array.from({ length: DEPTH }, (_, l) => this.grid[l][r][c]);
          if (direction === 'backward') line.reverse();
          const { result, gained, moved } = this._slideRow(line);
          if (direction === 'backward') result.reverse();
          for (let l = 0; l < DEPTH; l++) this.grid[l][r][c] = result[l];
          totalGained += gained;
          if (moved) totalMoved = true;
        }
      }
    }

    if (totalMoved) {
      this.score += totalGained;
      this.addRandom();
      if (!this.won && this._has2048()) this.won = true;
      if (!this._canMove()) this.over = true;
    }

    return { moved: totalMoved, gained: totalGained };
  }

  _has2048() {
    return this.grid.some(layer =>
      layer.some(row => row.some(t => t && t.value >= 2048))
    );
  }

  _canMove() {
    const { SIZE, DEPTH } = this;
    for (let l = 0; l < DEPTH; l++) {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (!this.grid[l][r][c]) return true;
          const v = this.grid[l][r][c].value;
          if (c + 1 < SIZE  && this.grid[l][r][c + 1]?.value === v)    return true;
          if (r + 1 < SIZE  && this.grid[l][r + 1]?.[c]?.value === v)  return true;
          if (l + 1 < DEPTH && this.grid[l + 1]?.[r]?.[c]?.value === v) return true;
        }
      }
    }
    return false;
  }
}
