// ============================================================
// RunnerGame - view.js
// 役割: Canvas 2D 描画・HUD更新
// ============================================================

const View = (() => {
  let _canvas = null;
  let _ctx = null;
  let _scaleX = 1;
  let _scaleY = 1;
  let _offsetX = 0;
  let _flash = null;

  function _roundRect(x, y, w, h, r) {
    _ctx.beginPath();
    _ctx.moveTo(x + r, y);
    _ctx.lineTo(x + w - r, y);
    _ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    _ctx.lineTo(x + w, y + h - r);
    _ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    _ctx.lineTo(x + r, y + h);
    _ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    _ctx.lineTo(x, y + r);
    _ctx.quadraticCurveTo(x, y, x + r, y);
    _ctx.closePath();
  }

  function _worldToScreen(wx, wy, playerY) {
    const screenPlayerY = WORLD_HEIGHT * 0.72;
    const camOffsetY = playerY - screenPlayerY;
    return {
      x: wx * _scaleX + _offsetX,
      y: (wy - camOffsetY) * _scaleY,
    };
  }

  function _drawBackground(playerY) {
    const W = _canvas.width;
    const H = _canvas.height;
    const roadLeft = _worldToScreen(0, 0, playerY).x;
    const roadRight = _worldToScreen(WORLD_WIDTH, 0, playerY).x;

    _ctx.fillStyle = COLOR_ROADSIDE;
    _ctx.fillRect(0, 0, W, H);

    _ctx.fillStyle = COLOR_ROAD;
    _ctx.fillRect(roadLeft, 0, roadRight - roadLeft, H);

    const lineX = _worldToScreen(WORLD_WIDTH / 2, 0, playerY).x;
    const lineH = 40 * _scaleY;
    const lineGap = 30 * _scaleY;
    const lineW = Math.max(3, 4 * _scaleX);
    const camOffY = playerY - WORLD_HEIGHT * 0.72;
    const cycle = lineH + lineGap;
    const startY = ((camOffY * _scaleY) % cycle + cycle) % cycle;

    _ctx.fillStyle = COLOR_LANE;
    for (let y = -lineH + startY; y < H + lineH; y += cycle) {
      _ctx.fillRect(lineX - lineW / 2, y, lineW, lineH);
    }
  }

  function _drawPlayer(player, playerY) {
    if (player.crowd <= 0) return;

    const base = _worldToScreen(player.x, player.y, playerY);
    const r = Math.max(5, CROWD_UNIT_RADIUS * _scaleX);
    const spacing = CROWD_SPACING * _scaleX * 0.8;
    const positions = [{ x: 0, y: 0 }];
    const rings = [6, 12, 18];

    let remaining = player.crowd - 1;
    let ring = 0;
    while (remaining > 0 && ring < rings.length) {
      const slots = rings[ring];
      const count = Math.min(remaining, slots);
      const radius = (ring + 1) * spacing;
      for (let i = 0; i < count; i++) {
        const angle = (i / slots) * Math.PI * 2;
        positions.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius * 0.5,
        });
      }
      remaining -= count;
      ring += 1;
    }

    const sorted = positions.slice(0, player.crowd).sort((a, b) => a.y - b.y);
    for (const pos of sorted) {
      const px = base.x + pos.x;
      const py = base.y + pos.y;
      const isLeader = pos === positions[0];

      _ctx.beginPath();
      _ctx.ellipse(px, py + r * 1.45, r * 0.95, r * 0.35, 0, 0, Math.PI * 2);
      _ctx.fillStyle = 'rgba(0,0,0,0.25)';
      _ctx.fill();

      _roundRect(px - r * 0.58, py - r * 0.22, r * 1.16, r * 1.35, r * 0.28);
      _ctx.fillStyle = isLeader ? COLOR_PLAYER : COLOR_CROWD;
      _ctx.fill();

      _ctx.beginPath();
      _ctx.arc(px, py - r * 0.45, r * 0.58, 0, Math.PI * 2);
      _ctx.fillStyle = isLeader ? '#a78bfa' : '#d9c6ff';
      _ctx.fill();
    }

    _ctx.fillStyle = '#f4e8ff';
    _ctx.font = `bold ${Math.max(14, 16 * _scaleX)}px Roboto, sans-serif`;
    _ctx.textAlign = 'center';
    _ctx.fillText(`群衆 ${player.crowd}`, base.x, base.y - r * 2.4);
  }

  function _drawGates(gates, playerY) {
    for (const gate of gates) {
      for (const side of [gate.left, gate.right]) {
        if (side.passed) continue;
        const pos = _worldToScreen(side.x, gate.y, playerY);
        const w = side.w * _scaleX;
        const h = GATE_HEIGHT * _scaleY;

        let color = COLOR_GATE_DIV;
        if (side.op === '+') color = COLOR_GATE_POS;
        else if (side.op === '-') color = COLOR_GATE_NEG;
        else if (side.op === '*') color = COLOR_GATE_MUL;

        _ctx.fillStyle = `${color}33`;
        _ctx.fillRect(pos.x, pos.y - h / 2, w, h);
        _ctx.strokeStyle = color;
        _ctx.lineWidth = Math.max(2, 3 * _scaleX);
        _ctx.strokeRect(pos.x, pos.y - h / 2, w, h);

        _ctx.fillStyle = '#ffffff';
        _ctx.font = `bold ${Math.max(18, 20 * _scaleX)}px Roboto, sans-serif`;
        _ctx.textAlign = 'center';
        _ctx.fillText(side.label, pos.x + w / 2, pos.y + 7 * _scaleY);
      }
    }
  }

  function _drawObstacles(obstacles, playerY) {
    for (const obs of obstacles) {
      if (obs.hit) continue;
      const pos = _worldToScreen(obs.x, obs.y, playerY);
      const w = obs.w * _scaleX;
      const h = OBSTACLE_HEIGHT * _scaleY;

      _roundRect(pos.x, pos.y - h / 2, w, h, 4 * _scaleX);
      _ctx.fillStyle = COLOR_OBSTACLE;
      _ctx.fill();

      const p = 8 * _scaleX;
      _ctx.strokeStyle = '#ffffff';
      _ctx.lineWidth = Math.max(2, 3 * _scaleX);
      _ctx.beginPath();
      _ctx.moveTo(pos.x + p, pos.y - h / 2 + p);
      _ctx.lineTo(pos.x + w - p, pos.y + h / 2 - p);
      _ctx.moveTo(pos.x + w - p, pos.y - h / 2 + p);
      _ctx.lineTo(pos.x + p, pos.y + h / 2 - p);
      _ctx.stroke();
    }
  }

  function _drawCoins(coins, playerY) {
    for (const coin of coins) {
      if (coin.collected) continue;
      const pos = _worldToScreen(coin.x, coin.y, playerY);
      const r = Math.max(6, COIN_RADIUS * _scaleX);

      _ctx.beginPath();
      _ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      _ctx.fillStyle = COLOR_COIN;
      _ctx.fill();

      _ctx.fillStyle = '#9a7a00';
      _ctx.font = `bold ${Math.max(10, 11 * _scaleX)}px Roboto, sans-serif`;
      _ctx.textAlign = 'center';
      _ctx.textBaseline = 'middle';
      _ctx.fillText('C', pos.x, pos.y);
      _ctx.textBaseline = 'alphabetic';
    }
  }

  function _drawGoal(goal, playerY) {
    if (!goal) return;
    const pos = _worldToScreen(0, goal.y, playerY);
    const W = _canvas.width;
    const grad = _ctx.createLinearGradient(0, pos.y - 10, 0, pos.y + 10);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, COLOR_GOAL);
    grad.addColorStop(1, 'transparent');
    _ctx.fillStyle = grad;
    _ctx.fillRect(0, pos.y - 10, W, 20);

    _ctx.fillStyle = '#ffffff';
    _ctx.font = `bold ${Math.max(16, 18 * _scaleY)}px Roboto, sans-serif`;
    _ctx.textAlign = 'center';
    _ctx.fillText('GOAL', W / 2, pos.y - 15 * _scaleY);
  }

  function _drawFlash() {
    if (!_flash) return;
    const elapsed = Date.now() - _flash.startTime;
    const t = elapsed / _flash.duration;
    if (t >= 1) {
      _flash = null;
      return;
    }
    const alpha = _flash.alpha * (1 - t);
    _ctx.fillStyle = _flash.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
  }

  function init(canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext('2d');
    onResize();
  }

  function onResize() {
    if (!_canvas) return;
    _canvas.width = _canvas.offsetWidth;
    _canvas.height = _canvas.offsetHeight;
    _scaleY = _canvas.height / WORLD_HEIGHT;
    _scaleX = _scaleY;
    _offsetX = (_canvas.width - WORLD_WIDTH * _scaleX) / 2;
  }

  function render(player, obstacles, gates, coins, goal) {
    if (!_canvas || !_ctx) return;
    _drawBackground(player.y);
    _drawGoal(goal, player.y);
    _drawCoins(coins, player.y);
    _drawGates(gates, player.y);
    _drawObstacles(obstacles, player.y);
    _drawPlayer(player, player.y);
    _drawFlash();
  }

  function flash(color, alpha, duration) {
    _flash = { color, alpha, startTime: Date.now(), duration };
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

  function showResult(isGoal, score, crowd) {
    const overlay = document.getElementById('result-overlay');
    document.getElementById('result-title').textContent = isGoal ? 'ゴール！' : '全滅...';
    document.getElementById('result-score').textContent = score;
    document.getElementById('result-crowd').textContent = `残り ${crowd} 人`;
    overlay.style.display = 'flex';
  }

  function updateHUD(crowd, score, progress) {
    const crowdEl = document.getElementById('crowd-display');
    if (crowdEl) crowdEl.textContent = `👥 ${crowd}人`;
    const scoreEl = document.getElementById('score-display');
    if (scoreEl) scoreEl.textContent = `🪙 ${score}`;
    const bar = document.getElementById('progress-bar-fill');
    if (bar) bar.style.width = `${Math.round(progress * 100)}%`;
  }

  return {
    init,
    onResize,
    render,
    flash,
    updateHUD,
    showGameScreen,
    showSettingsScreen,
    showResult,
  };
})();
