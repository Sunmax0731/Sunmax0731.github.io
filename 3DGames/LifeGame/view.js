/* ============================================================
   Life Game - view.js
   Canvas 2D の描画
   ============================================================ */

class LifeView {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;

    this.cellW = 1;
    this.cellH = 1;
    this.showGrid = true;

    this.aliveColor = '#A8D5A2';
    this.deadColor = '#0A0D0A';
    this.gridColor = '#1A211A';

    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.cellW = w / this.model.cols;
    this.cellH = h / this.model.rows;
    this.showGrid = this.cellW >= 4 && this.cellH >= 4;
    this.logicalW = w;
    this.logicalH = h;
  }

  canvasToCell(canvasX, canvasY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = canvasX - rect.left;
    const y = canvasY - rect.top;
    return {
      col: Math.floor(x / this.cellW),
      row: Math.floor(y / this.cellH),
    };
  }

  render() {
    const { ctx, model, cellW, cellH } = this;
    const { cols, rows } = model;
    const w = this.logicalW;
    const h = this.logicalH;

    ctx.fillStyle = this.deadColor;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = this.aliveColor;
    const gap = this.showGrid ? 1 : 0;
    for (let y = 0; y < rows; y++) {
      const py = y * cellH;
      for (let x = 0; x < cols; x++) {
        if (model.cells[model.idx(x, y)]) {
          ctx.fillRect(x * cellW + gap, py + gap, cellW - gap, cellH - gap);
        }
      }
    }

    if (this.showGrid) {
      ctx.strokeStyle = this.gridColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= cols; x++) {
        ctx.moveTo(x * cellW, 0);
        ctx.lineTo(x * cellW, h);
      }
      for (let y = 0; y <= rows; y++) {
        ctx.moveTo(0, y * cellH);
        ctx.lineTo(w, y * cellH);
      }
      ctx.stroke();
    }
  }

  updateHUD(generation, population) {
    document.getElementById('gen-display').textContent = `世代: ${generation.toLocaleString()}`;
    document.getElementById('pop-display').textContent = `生存: ${population.toLocaleString()}`;
  }
}
