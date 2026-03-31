/**
 * visualization-base.js - 可視化基底クラス
 */

class MathVisualization {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;
    if (!this.container) throw new Error(`Container not found: ${containerId}`);

    this.options = Object.assign({
      width: null,        // null = コンテナ幅に追従
      height: 400,
      padding: 40,
      fps: 60,
      background: 'transparent',
    }, options);

    this.canvas = null;
    this.ctx = null;
    this._animId = null;
    this._running = false;
    this._lastTime = 0;
    this.frame = 0;
    this.time = 0;

    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(this.container);

    this._init();
  }

  _init() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this._onResize();
    this.init();
    this.render();
  }

  _onResize() {
    const w = this.options.width || this.container.clientWidth || 600;
    const h = this.options.height;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);
    this.width  = w;
    this.height = h;
    this.render();
  }

  /** サブクラスでオーバーライド: 初期化処理 */
  init() {}

  /** サブクラスでオーバーライド: 描画処理 */
  render() {}

  /** アニメーション開始 */
  start() {
    if (this._running) return;
    this._running = true;
    const loop = (timestamp) => {
      if (!this._running) return;
      const dt = Math.min((timestamp - this._lastTime) / 1000, 0.1);
      this._lastTime = timestamp;
      this.time += dt;
      this.frame++;
      this.update(dt);
      this.render();
      this._animId = requestAnimationFrame(loop);
    };
    this._animId = requestAnimationFrame((t) => { this._lastTime = t; loop(t); });
  }

  /** アニメーション停止 */
  stop() {
    this._running = false;
    if (this._animId) cancelAnimationFrame(this._animId);
  }

  /** アニメーションの1フレーム更新（サブクラスでオーバーライド） */
  update(dt) {}

  /** リソース解放 */
  destroy() {
    this.stop();
    this._resizeObserver.disconnect();
    this.canvas.remove();
  }

  // ===== ヘルパーメソッド =====

  /** キャンバスをクリア */
  clear(color = this.options.background) {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    if (color && color !== 'transparent') {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
    }
  }

  /** 数学座標系に変換するトランスフォームを設定 */
  setMathTransform(xMin, xMax, yMin, yMax) {
    const p = this.options.padding;
    const w = this.width - 2 * p;
    const h = this.height - 2 * p;
    this._mathBounds = { xMin, xMax, yMin, yMax, p, w, h };
  }

  /** 数学座標 → スクリーン座標 */
  toScreen(mx, my) {
    const { xMin, xMax, yMin, yMax, p, w, h } = this._mathBounds;
    return {
      x: p + (mx - xMin) / (xMax - xMin) * w,
      y: p + (1 - (my - yMin) / (yMax - yMin)) * h,
    };
  }

  /** スクリーン座標 → 数学座標 */
  toMath(sx, sy) {
    const { xMin, xMax, yMin, yMax, p, w, h } = this._mathBounds;
    return {
      x: xMin + (sx - p) / w * (xMax - xMin),
      y: yMin + (1 - (sy - p) / h) * (yMax - yMin),
    };
  }

  /** グリッドと軸を描画 */
  drawAxes(opts = {}) {
    const { ctx } = this;
    const { xMin, xMax, yMin, yMax } = this._mathBounds;
    const gridColor  = opts.gridColor  || 'rgba(255,255,255,0.05)';
    const axisColor  = opts.axisColor  || 'rgba(255,255,255,0.2)';
    const labelColor = opts.labelColor || '#666688';

    // グリッド
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const xStep = opts.xStep || this._niceStep(xMax - xMin);
    const yStep = opts.yStep || this._niceStep(yMax - yMin);

    for (let x = Math.ceil(xMin/xStep)*xStep; x <= xMax; x += xStep) {
      const s = this.toScreen(x, 0);
      ctx.beginPath();
      ctx.moveTo(s.x, this.options.padding);
      ctx.lineTo(s.x, this.height - this.options.padding);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin/yStep)*yStep; y <= yMax; y += yStep) {
      const s = this.toScreen(0, y);
      ctx.beginPath();
      ctx.moveTo(this.options.padding, s.y);
      ctx.lineTo(this.width - this.options.padding, s.y);
      ctx.stroke();
    }

    // X軸
    if (yMin <= 0 && yMax >= 0) {
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.5;
      const y0 = this.toScreen(0, 0).y;
      ctx.beginPath();
      ctx.moveTo(this.options.padding, y0);
      ctx.lineTo(this.width - this.options.padding, y0);
      ctx.stroke();
    }

    // Y軸
    if (xMin <= 0 && xMax >= 0) {
      const x0 = this.toScreen(0, 0).x;
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, this.options.padding);
      ctx.lineTo(x0, this.height - this.options.padding);
      ctx.stroke();
    }

    // ラベル
    ctx.fillStyle = labelColor;
    ctx.font = '11px ' + getComputedStyle(document.body).getPropertyValue('--font-mono') + ', monospace';
    ctx.textAlign = 'center';
    for (let x = Math.ceil(xMin/xStep)*xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue;
      const s = this.toScreen(x, 0);
      const label = Number.isInteger(x) ? x.toString() : x.toFixed(1);
      ctx.fillText(label, s.x, Math.min(s.y + 16, this.height - 4));
    }
    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin/yStep)*yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue;
      const s = this.toScreen(0, y);
      const label = Number.isInteger(y) ? y.toString() : y.toFixed(1);
      ctx.fillText(label, Math.max(s.x - 4, 36), s.y + 4);
    }
  }

  /** 関数をプロット */
  plotFunction(f, opts = {}) {
    const { ctx } = this;
    const { xMin, xMax } = this._mathBounds;
    const steps = opts.steps || 400;
    const color = opts.color || '#7c6cf8';

    ctx.strokeStyle = color;
    ctx.lineWidth = opts.lineWidth || 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let first = true;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * i / steps;
      const y = f(x);
      if (!isFinite(y)) { first = true; continue; }
      const s = this.toScreen(x, y);
      if (first) { ctx.moveTo(s.x, s.y); first = false; }
      else ctx.lineTo(s.x, s.y);
    }
    ctx.stroke();
  }

  /** ドットを描画 */
  drawDot(mx, my, opts = {}) {
    const { ctx } = this;
    const s = this.toScreen(mx, my);
    const r = opts.radius || 5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = opts.fill || '#7c6cf8';
    ctx.fill();
    if (opts.stroke) {
      ctx.strokeStyle = opts.stroke;
      ctx.lineWidth = opts.strokeWidth || 2;
      ctx.stroke();
    }
  }

  _niceStep(range) {
    const rough = range / 8;
    const exp = Math.pow(10, Math.floor(Math.log10(rough)));
    const frac = rough / exp;
    if (frac < 1.5) return exp;
    if (frac < 3.5) return 2 * exp;
    if (frac < 7.5) return 5 * exp;
    return 10 * exp;
  }
}

window.MathVisualization = MathVisualization;
