// ============================================================
// SortGame - view.js
// 役割: Canvas 2D 描画・HUD更新・アニメーション
// ============================================================

const View = (() => {
  let _canvas = null;
  let _ctx = null;
  let _layout = null;

  let _shakeAnim = null;
  let _pourAnim = null;
  let _winAnim = null;
  let _animId = null;

  function _calcLayout(numTubes) {
    const W = _canvas.width;
    const H = _canvas.height;

    const cols = numTubes <= 4 ? numTubes : numTubes <= 8 ? Math.ceil(numTubes / 2) : Math.ceil(numTubes / 3);
    const rows = Math.ceil(numTubes / cols);

    const marginX = 14;
    const marginY = 26;
    const gapX = 10;
    const gapY = 14;

    const tubeW = Math.min(78, Math.floor((W - marginX * 2 - gapX * (cols - 1)) / cols));
    const tubeH = Math.min(TUBE_CAPACITY * 44 + 24, Math.floor((H - marginY * 2 - gapY * (rows - 1)) / rows));

    const totalW = tubeW * cols + gapX * (cols - 1);
    const totalH = tubeH * rows + gapY * (rows - 1);
    const offsetX = (W - totalW) / 2;
    const offsetY = marginY + (H - marginY * 2 - totalH) / 2;

    return { tubeW, tubeH, tubeGap: gapX, rowGap: gapY, cols, rows, offsetX, offsetY };
  }

  function _tubePos(idx) {
    const { tubeW, tubeH, tubeGap, rowGap, cols, offsetX, offsetY } = _layout;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return {
      x: offsetX + col * (tubeW + tubeGap),
      y: offsetY + row * (tubeH + rowGap),
      w: tubeW,
      h: tubeH,
    };
  }

  function _tubePath(x, y, w, h, r) {
    _ctx.beginPath();
    _ctx.moveTo(x + r, y);
    _ctx.lineTo(x + w - r, y);
    _ctx.arcTo(x + w, y, x + w, y + r, r);
    _ctx.lineTo(x + w, y + h - r);
    _ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    _ctx.arcTo(x, y + h, x, y + h - r, r);
    _ctx.lineTo(x, y + r);
    _ctx.arcTo(x, y, x + r, y, r);
    _ctx.closePath();
  }

  function _drawTube(idx, tubes, selectedIdx, shakeOffX) {
    const { x: bx, y: by, w, h } = _tubePos(idx);
    const x = bx + (shakeOffX || 0);
    const y = by;
    const r = w / 2;
    const isSelected = idx === selectedIdx;
    const floatY = isSelected ? -12 : 0;

    _ctx.save();
    _tubePath(x, y + floatY, w, h, r);
    _ctx.fillStyle = '#1e1b23';
    _ctx.fill();

    const tube = tubes[idx];
    const segH = (h - r * 2) / TUBE_CAPACITY;

    for (let s = 0; s < tube.length; s++) {
      const color = COLORS_CSS[tube[s]];
      const segY = y + floatY + h - r - segH * (s + 1);

      _ctx.save();
      _tubePath(x, y + floatY, w, h, r);
      _ctx.clip();
      _ctx.fillStyle = color;
      _ctx.fillRect(x, segY, w, segH);
      _ctx.restore();
    }

    _tubePath(x, y + floatY, w, h, r);
    _ctx.strokeStyle = isSelected ? '#D0BCFF' : '#49454F';
    _ctx.lineWidth = isSelected ? 3 : 1.5;
    _ctx.stroke();

    if (isSelected) {
      _ctx.shadowColor = '#D0BCFF';
      _ctx.shadowBlur = 12;
      _tubePath(x, y + floatY, w, h, r);
      _ctx.stroke();
      _ctx.shadowBlur = 0;
    }

    _ctx.restore();
  }

  function _loop() {
    _animId = requestAnimationFrame(_loop);
    _redraw();
  }

  function _redraw() {
    if (!_canvas || !_ctx) return;
    const W = _canvas.width;
    const H = _canvas.height;

    _ctx.clearRect(0, 0, W, H);
    _ctx.fillStyle = '#0F0D13';
    _ctx.fillRect(0, 0, W, H);

    if (!_layout) return;

    const numTubes = Model.getNumTubes();
    const tubes = Model.getTubes();
    const selectedIdx = Model.getSelectedIdx();
    const now = Date.now();

    let shakeIdx = -1;
    let shakeOffX = 0;
    if (_shakeAnim) {
      const t = (now - _shakeAnim.startTime) / ANIM_SHAKE_DURATION;
      if (t < 1) {
        shakeIdx = _shakeAnim.tubeIdx;
        shakeOffX = Math.sin(t * Math.PI * 6) * 8 * (1 - t);
      } else {
        _shakeAnim = null;
      }
    }

    if (_pourAnim) {
      const t = Math.min(1, (now - _pourAnim.startTime) / ANIM_POUR_DURATION);
      _pourAnim.progress = t;
      if (t >= 1) {
        const cb = _pourAnim.onDone;
        _pourAnim = null;
        if (cb) cb();
      }
    }

    for (let i = 0; i < numTubes; i++) {
      _drawTube(i, tubes, selectedIdx, i === shakeIdx ? shakeOffX : 0);
    }

    if (_pourAnim) {
      const { from, to, color, progress } = _pourAnim;
      const fromPos = _tubePos(from);
      const toPos = _tubePos(to);
      const fx = fromPos.x + fromPos.w / 2;
      const fy = fromPos.y - 5;
      const tx = toPos.x + toPos.w / 2;
      const ty = toPos.y;
      const x = fx + (tx - fx) * progress;
      const y = fy + (ty - fy) * progress;

      _ctx.beginPath();
      _ctx.arc(x, y, fromPos.w * 0.25, 0, Math.PI * 2);
      _ctx.fillStyle = COLORS_CSS[color];
      _ctx.fill();
    }

    if (_winAnim) {
      const t = (now - _winAnim.startTime) / 2000;
      if (t < 1) {
        _ctx.fillStyle = `rgba(208, 188, 255, ${0.15 * Math.sin(t * Math.PI)})`;
        _ctx.fillRect(0, 0, W, H);
        _ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * Math.sin(t * Math.PI * 3)})`;
        _ctx.font = 'bold 40px Roboto, sans-serif';
        _ctx.textAlign = 'center';
        _ctx.fillText('CLEAR!', W / 2, H / 2);
      } else {
        _winAnim = null;
      }
    }
  }

  function init(canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext('2d');
    if (_animId) cancelAnimationFrame(_animId);
    _loop();
  }

  function updateLayout(numTubes) {
    if (!_canvas) return;
    _canvas.width = _canvas.offsetWidth;
    _canvas.height = _canvas.offsetHeight;
    _layout = _calcLayout(numTubes);
  }

  function startShakeAnimation(tubeIdx, onDone) {
    _shakeAnim = { tubeIdx, startTime: Date.now() };
    setTimeout(onDone, ANIM_SHAKE_DURATION);
  }

  function startPourAnimation(from, to, color, count, onDone) {
    _pourAnim = { from, to, color, count, progress: 0, startTime: Date.now(), onDone };
  }

  function startWinAnimation() {
    _winAnim = { startTime: Date.now() };
  }

  function getTubeIndexAt(clientX, clientY) {
    if (!_layout || !_canvas) return -1;
    const rect = _canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const numTubes = Model.getNumTubes();
    for (let i = 0; i < numTubes; i++) {
      const pos = _tubePos(i);
      const floatY = i === Model.getSelectedIdx() ? -12 : 0;
      if (x >= pos.x && x <= pos.x + pos.w && y >= pos.y + floatY && y <= pos.y + pos.h + floatY) {
        return i;
      }
    }
    return -1;
  }

  function onResize() {
    if (!_canvas) return;
    updateLayout(Model.getNumTubes());
  }

  function updateMoves(moves) {
    const el = document.getElementById('moves-display');
    if (el) el.textContent = `手数: ${moves}`;
  }

  function showResult(isWon, score, moves) {
    const overlay = document.getElementById('result-overlay');
    const title = document.getElementById('result-title');
    const scoreEl = document.getElementById('result-score');
    const movesEl = document.getElementById('result-moves');
    if (!overlay) return;
    title.textContent = isWon ? 'クリア！' : 'もう一度';
    title.className = isWon ? 'result-won' : '';
    scoreEl.textContent = score;
    movesEl.textContent = moves;
    overlay.style.display = 'flex';
  }

  function hideResult() {
    const el = document.getElementById('result-overlay');
    if (el) el.style.display = 'none';
  }

  function showGameScreen() {
    document.getElementById('settings-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
  }

  function showSettingsScreen() {
    document.getElementById('result-overlay').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('settings-screen').style.display = 'flex';
  }

  function cleanup() {
    if (_animId) {
      cancelAnimationFrame(_animId);
      _animId = null;
    }
    _pourAnim = null;
    _shakeAnim = null;
    _winAnim = null;
    _layout = null;
  }

  return {
    init,
    updateLayout,
    startShakeAnimation,
    startPourAnimation,
    startWinAnimation,
    getTubeIndexAt,
    onResize,
    updateMoves,
    showResult,
    hideResult,
    showGameScreen,
    showSettingsScreen,
    cleanup,
  };
})();
