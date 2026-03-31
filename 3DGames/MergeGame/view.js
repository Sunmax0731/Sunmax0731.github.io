// ============================================================
// MergeGame - view.js
// 役割: Canvas 2D 描画・アニメーション
//   - ゲームロジックに一切関与しない
//   - 受け取った状態を描画するだけ
// ============================================================

const View = (() => {

  // ---- Canvas 参照 ----
  let _canvas  = null;
  let _ctx     = null;

  // ---- グリッド描画パラメータ ----
  let _cellSize    = 80;   // セルサイズ (px)
  let _padding     = 16;   // グリッド外余白
  let _cellPadding = 6;    // セル内余白
  let _cornerRadius = 10;  // 角丸半径

  // ---- アニメーション管理 ----
  // 各アニメーションは { type, startTime, duration, params, onDone } の形式
  let _animations = [];

  // ---- 描画状態（最後に渡されたstate） ----
  let _lastState = null;

  // ---- requestAnimationFrame の ID ----
  let _rafId = null;

  // ============================================================
  // 内部処理 - レイアウト計算
  // ============================================================

  /** グリッドのレイアウトパラメータを計算する */
  function _calcLayout(gridSize) {
    // CSS ピクセル単位で計算する（ctx は DPR スケール済み）
    const w = _canvas.clientWidth  || window.innerWidth;
    const h = _canvas.clientHeight || window.innerHeight;

    // HUDの高さ分を除いた利用可能領域
    const hudH     = 70;
    const footerH  = 50;
    const available = Math.min(w, h - hudH - footerH) - _padding * 2;
    _cellSize = Math.floor(available / gridSize);
    _cellSize = Math.max(40, Math.min(_cellSize, 110));
    _cornerRadius = Math.max(6, Math.floor(_cellSize * 0.12));
    _cellPadding  = Math.max(4, Math.floor(_cellSize * 0.07));

    const totalSize = _cellSize * gridSize;
    const offsetX   = Math.floor((w - totalSize) / 2);
    const offsetY   = hudH + Math.floor((h - hudH - footerH - totalSize) / 2);

    return { offsetX, offsetY, totalSize };
  }

  // ============================================================
  // 内部処理 - 基本描画
  // ============================================================

  /** 角丸矩形パスを定義する */
  function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /** セルの背景色を決定する（レベルに応じて） */
  function _getCellBgColor(level) {
    if (level === 0) return '#1a1820';
    return ITEM_COLORS[level - 1] || '#333';
  }

  /** 空セルを描画する */
  function _drawEmptyCell(ctx, x, y, size) {
    const pad = _cellPadding;
    _roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, _cornerRadius);
    ctx.fillStyle = _getCellBgColor(0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /** アイテムセルを描画する */
  function _drawItemCell(ctx, x, y, size, level, alpha, scale) {
    alpha = (alpha !== undefined) ? alpha : 1;
    scale = (scale !== undefined) ? scale : 1;

    if (scale !== 1 || alpha !== 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x + size / 2, y + size / 2);
      ctx.scale(scale, scale);
      ctx.translate(-(size / 2), -(size / 2));
      x = 0;
      y = 0;
    }

    const pad  = _cellPadding;
    const cw   = size - pad * 2;
    const ch   = size - pad * 2;

    // カード背景
    _roundRect(ctx, x + pad, y + pad, cw, ch, _cornerRadius);
    ctx.fillStyle = _getCellBgColor(level);
    ctx.fill();

    // 少し明るい上部グラデーション感
    const grad = ctx.createLinearGradient(x + pad, y + pad, x + pad, y + pad + ch * 0.5);
    grad.addColorStop(0, 'rgba(255,255,255,0.18)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    _roundRect(ctx, x + pad, y + pad, cw, ch, _cornerRadius);
    ctx.fillStyle = grad;
    ctx.fill();

    // エモジ描画
    const emojiSize = Math.floor(size * 0.42);
    ctx.font = `${emojiSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emoji = ITEM_EMOJIS[level - 1] || '?';
    ctx.fillText(emoji, x + size / 2, y + size / 2 - size * 0.06);

    // 数値描画
    const valSize = Math.max(10, Math.floor(size * 0.18));
    ctx.font      = `bold ${valSize}px 'Roboto', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(ITEM_VALUES[level - 1], x + size / 2, y + size - pad - 2);

    if (scale !== 1 || alpha !== 1) {
      ctx.restore();
    }
  }

  /** 選択ハイライトを描画する */
  function _drawSelectedHighlight(ctx, x, y, size) {
    const pad = _cellPadding - 2;
    _roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, _cornerRadius + 2);
    ctx.strokeStyle = '#D0BCFF';
    ctx.lineWidth   = 3;
    ctx.stroke();

    // 発光エフェクト
    ctx.shadowColor  = '#D0BCFF';
    ctx.shadowBlur   = 12;
    ctx.stroke();
    ctx.shadowBlur   = 0;
  }

  // ============================================================
  // 内部処理 - 全体描画
  // ============================================================

  /** グリッド全体を描画する（アニメーションなし） */
  function _drawGrid(state) {
    if (!state || !_canvas) return;

    const ctx      = _ctx;
    const gridSize = state.gridSize;
    const grid     = state.grid;
    const selected = state.selectedCell;
    const layout   = _calcLayout(gridSize);
    const { offsetX, offsetY } = layout;
    const size = _cellSize;

    const cw = _canvas.clientWidth  || window.innerWidth;
    const ch = _canvas.clientHeight || window.innerHeight;
    ctx.clearRect(0, 0, cw, ch);

    // 背景
    ctx.fillStyle = '#141218';
    ctx.fillRect(0, 0, cw, ch);

    // グリッド線（背景）
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = offsetX + c * size;
        const y = offsetY + r * size;
        _drawEmptyCell(ctx, x, y, size);
      }
    }

    // アイテム描画（アニメーション中のセルはスキップ）
    const animatingCells = _getAnimatingCells();

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const level = grid[r][c];
        if (level === 0) continue;

        // アニメーション中のセルはアニメーション側で描画
        const key = `${r},${c}`;
        if (animatingCells.has(key)) continue;

        const x = offsetX + c * size;
        const y = offsetY + r * size;
        _drawItemCell(ctx, x, y, size, level);

        // 選択ハイライト
        if (selected && selected.row === r && selected.col === c) {
          _drawSelectedHighlight(ctx, x, y, size);
        }
      }
    }

    // アニメーション描画
    _drawAnimations(ctx, offsetX, offsetY, size);
  }

  /** アニメーション中のセル座標集合を返す */
  function _getAnimatingCells() {
    const set = new Set();
    for (const anim of _animations) {
      if (anim.type === 'merge') {
        set.add(`${anim.params.fromRow},${anim.params.fromCol}`);
        set.add(`${anim.params.toRow},${anim.params.toCol}`);
      } else if (anim.type === 'spawn') {
        set.add(`${anim.params.row},${anim.params.col}`);
      } else if (anim.type === 'bonus') {
        set.add(`${anim.params.row},${anim.params.col}`);
      }
    }
    return set;
  }

  /** アニメーションを描画する */
  function _drawAnimations(ctx, offsetX, offsetY, size) {
    const now = performance.now();

    for (let i = _animations.length - 1; i >= 0; i--) {
      const anim = _animations[i];
      const elapsed = now - anim.startTime;
      const t = Math.min(elapsed / anim.duration, 1);

      if (anim.type === 'merge') {
        _drawMergeAnimation(ctx, anim, t, offsetX, offsetY, size);
      } else if (anim.type === 'spawn') {
        _drawSpawnAnimation(ctx, anim, t, offsetX, offsetY, size);
      } else if (anim.type === 'bonus') {
        _drawBonusAnimation(ctx, anim, t, offsetX, offsetY, size);
      }

      // 完了したアニメーションを削除してコールバック実行
      if (t >= 1) {
        const onDone = anim.onDone;
        _animations.splice(i, 1);
        if (onDone) onDone();
      }
    }
  }

  /** マージアニメーションを描画する（fromセルがtoセルに吸い込まれる） */
  function _drawMergeAnimation(ctx, anim, t, offsetX, offsetY, size) {
    const { fromRow, fromCol, toRow, toCol, mergedLevel, newLevel } = anim.params;

    // イージング（ease-in）
    const eased = t * t;

    // from セル: toセルに向かって移動しながら縮小・フェードアウト
    const fromX = offsetX + fromCol * size;
    const fromY = offsetY + fromRow * size;
    const toX   = offsetX + toCol   * size;
    const toY   = offsetY + toRow   * size;

    const currentX = fromX + (toX - fromX) * eased;
    const currentY = fromY + (toY - fromY) * eased;
    const fromScale = 1 - eased * 0.5;
    const fromAlpha = 1 - eased;

    if (fromAlpha > 0.01) {
      _drawItemCell(ctx, currentX, currentY, size, mergedLevel, fromAlpha, fromScale);
    }

    // to セル: スケールアップ演出
    // フェーズ1(0〜0.5): 通常表示
    // フェーズ2(0.5〜1): スケールアップ→通常に戻る
    const phase2 = Math.max(0, (t - 0.5) / 0.5);
    const toScale = phase2 < 0.5
      ? 1 + phase2 * 0.4          // 拡大
      : 1 + (1 - phase2) * 0.4;  // 縮小して戻る

    if (t > 0.3) {
      _drawItemCell(ctx, toX, toY, size, newLevel, 1, toScale);
    } else {
      _drawItemCell(ctx, toX, toY, size, mergedLevel, 1, 1);
    }
  }

  /** スポーンアニメーションを描画する（スケールアップで出現） */
  function _drawSpawnAnimation(ctx, anim, t, offsetX, offsetY, size) {
    const { row, col } = anim.params;
    const x     = offsetX + col * size;
    const y     = offsetY + row * size;
    // ease-out
    const eased = 1 - Math.pow(1 - t, 2);
    const scale = eased;
    const alpha = eased;
    _drawItemCell(ctx, x, y, size, 1, alpha, scale);
  }

  /** ボーナスアニメーションを描画する（Lv10クリア時の爆発演出） */
  function _drawBonusAnimation(ctx, anim, t, offsetX, offsetY, size) {
    const { row, col } = anim.params;
    const cx = offsetX + col * size + size / 2;
    const cy = offsetY + row * size + size / 2;

    // 放射状の光のリング
    const radius  = size * 0.5 * (1 + t * 2);
    const alpha   = 1 - t;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth   = 4 * (1 - t * 0.7);
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur  = 20 * (1 - t);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // テキスト演出
    const textAlpha = t < 0.5 ? t * 2 : (1 - t) * 2;
    ctx.globalAlpha = textAlpha;
    const textSize  = Math.floor(size * 0.3);
    ctx.font        = `bold ${textSize}px 'Roboto', sans-serif`;
    ctx.fillStyle   = '#FFD700';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${MAX_LEVEL_BONUS}`, cx, cy - size * 0.4 - t * size * 0.5);

    ctx.restore();
  }

  // ============================================================
  // アニメーションループ
  // ============================================================

  /** アニメーションループを開始する */
  function _startLoop() {
    if (_rafId !== null) return;
    _loop();
  }

  function _loop() {
    if (_lastState) {
      _drawGrid(_lastState);
    }

    if (_animations.length > 0) {
      _rafId = requestAnimationFrame(_loop);
    } else {
      _rafId = null;
      // 最終フレームを描画
      if (_lastState) _drawGrid(_lastState);
    }
  }

  // ============================================================
  // HUD 更新
  // ============================================================

  function _updateHUD(state) {
    const scoreEl = document.getElementById('score-display');
    const levelEl = document.getElementById('level-display');
    if (scoreEl) scoreEl.textContent = `スコア: ${state.score.toLocaleString()}`;
    if (levelEl) {
      const lvl = state.highestLevel;
      if (lvl > 0) {
        levelEl.textContent = `最高: ${ITEM_EMOJIS[lvl - 1]} Lv${lvl}`;
      } else {
        levelEl.textContent = '最高: -';
      }
    }
  }

  // ============================================================
  // 公開 API
  // ============================================================

  /**
   * Canvasを初期化する
   * @param {HTMLCanvasElement} canvas
   */
  function init(canvas) {
    _canvas     = canvas;
    _ctx        = canvas.getContext('2d');
    _animations = [];
    _lastState  = null;
    _rafId      = null;
    onResize();
  }

  /**
   * 全体を再描画する
   * @param {object} state - { grid, gridSize, score, selectedCell, highestLevel }
   */
  function drawAll(state) {
    _lastState = state;
    _updateHUD(state);
    if (_animations.length === 0) {
      _drawGrid(state);
    }
  }

  /**
   * マージアニメーションを開始する
   * @param {number} fromRow
   * @param {number} fromCol
   * @param {number} toRow
   * @param {number} toCol
   * @param {number} mergedLevel - マージ前のレベル
   * @param {number} newLevel    - マージ後のレベル
   * @param {Function} onDone
   */
  function startMergeAnimation(fromRow, fromCol, toRow, toCol, mergedLevel, newLevel, onDone) {
    _animations.push({
      type:      'merge',
      startTime: performance.now(),
      duration:  ANIM_MERGE_DURATION,
      params:    { fromRow, fromCol, toRow, toCol, mergedLevel, newLevel },
      onDone,
    });
    _startLoop();
  }

  /**
   * スポーンアニメーションを開始する
   * @param {number} row
   * @param {number} col
   * @param {Function} onDone
   */
  function startSpawnAnimation(row, col, onDone) {
    _animations.push({
      type:      'spawn',
      startTime: performance.now(),
      duration:  ANIM_SPAWN_DURATION,
      params:    { row, col },
      onDone,
    });
    _startLoop();
  }

  /**
   * ボーナスアニメーションを開始する（Lv10クリア時）
   * @param {number} row
   * @param {number} col
   * @param {Function} onDone
   */
  function startBonusAnimation(row, col, onDone) {
    _animations.push({
      type:      'bonus',
      startTime: performance.now(),
      duration:  ANIM_BONUS_DURATION,
      params:    { row, col },
      onDone,
    });
    _startLoop();
  }

  /**
   * Canvasリサイズ処理
   */
  function onResize() {
    if (!_canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = _canvas.clientWidth  || window.innerWidth;
    const h   = _canvas.clientHeight || window.innerHeight;
    _canvas.width  = Math.floor(w * dpr);
    _canvas.height = Math.floor(h * dpr);
    _ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (_lastState) _drawGrid(_lastState);
  }

  /**
   * クリック座標からグリッドセルを返す
   * @param {number} x - クライアント座標
   * @param {number} y - クライアント座標
   * @returns {{ row: number, col: number } | null}
   */
  function getCellAt(x, y) {
    if (!_lastState) return null;
    const gridSize = _lastState.gridSize;
    const layout   = _calcLayout(gridSize);
    const { offsetX, offsetY } = layout;
    const size = _cellSize;

    // クライアント座標はそのまま使用（DPRはCanvasの内部スケールに適用済み）
    const col = Math.floor((x - offsetX) / size);
    const row = Math.floor((y - offsetY) / size);

    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) return null;
    return { row, col };
  }

  /**
   * 設定画面を表示する
   */
  function showSettingsScreen() {
    document.getElementById('settings-screen').style.display = 'flex';
    document.getElementById('game-screen').style.display     = 'none';
  }

  /**
   * ゲーム画面を表示する
   */
  function showGameScreen() {
    document.getElementById('settings-screen').style.display = 'none';
    document.getElementById('game-screen').style.display     = 'flex';
  }

  /**
   * ゲームオーバーオーバーレイを表示する
   * @param {number} score
   * @param {number} highestLevel
   */
  function showGameOver(score, highestLevel) {
    const overlay  = document.getElementById('game-over-overlay');
    const scoreEl  = document.getElementById('final-score');
    const levelEl  = document.getElementById('final-level');

    if (scoreEl) scoreEl.textContent = score.toLocaleString();
    if (levelEl && highestLevel > 0) {
      levelEl.textContent = `${ITEM_EMOJIS[highestLevel - 1]} Lv${highestLevel}`;
    }

    if (overlay) overlay.style.display = 'flex';
  }

  /**
   * ゲームオーバーオーバーレイを非表示にする
   */
  function hideGameOver() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  /**
   * アニメーションがすべて完了しているか確認する
   * @returns {boolean}
   */
  function isAnimating() {
    return _animations.length > 0;
  }

  /**
   * スポーンタイマー表示を更新する
   * @param {number} seconds - 残り秒数
   */
  function updateSpawnTimer(seconds) {
    const el = document.getElementById('spawn-timer');
    if (el) el.textContent = `次のスポーン: ${seconds}秒`;
  }

  return {
    init,
    drawAll,
    startMergeAnimation,
    startSpawnAnimation,
    startBonusAnimation,
    onResize,
    getCellAt,
    showSettingsScreen,
    showGameScreen,
    showGameOver,
    hideGameOver,
    isAnimating,
    updateSpawnTimer,
  };

})();
