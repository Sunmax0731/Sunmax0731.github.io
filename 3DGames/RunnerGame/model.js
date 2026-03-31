// ============================================================
// RunnerGame - model.js
// 役割: 純粋なゲームロジック
//   - DOM / Canvas に一切依存しない
//   - プレイヤー位置・障害物・ゲート・スコア・衝突判定を管理
// ============================================================

const Model = (() => {

  // ---- 内部状態 ----
  let _player      = null;  // { x, y, crowd }
  let _obstacles   = [];    // [{ x, y, w, h }]
  let _gates       = [];    // [{ x, y, left: {x,w,label,op,val}, right: {x,w,...} }]
  let _coins       = [];    // [{ x, y, collected }]
  let _goal        = null;  // { y }
  let _distance    = 0;     // 走った距離
  let _goalDistance = 0;
  let _speed       = 0;
  let _score       = 0;
  let _coins_count = 0;
  let _isGameOver  = false;
  let _isGoal      = false;
  let _difficulty  = 'normal';

  // スポーン間隔カウンター
  let _nextGateY      = 0;
  let _nextObstacleY  = 0;
  let _nextCoinY      = 0;

  // ゲートの演算タイプ一覧
  const GATE_OPS = [
    { op: '+', val: 3,  label: '+3'  },
    { op: '+', val: 5,  label: '+5'  },
    { op: '-', val: 2,  label: '-2'  },
    { op: '-', val: 3,  label: '-3'  },
    { op: '*', val: 2,  label: '×2'  },
    { op: '/', val: 2,  label: '÷2'  },
  ];

  // ============================================================
  // 内部処理
  // ============================================================

  function _applyOp(crowd, op, val) {
    let result;
    switch (op) {
      case '+': result = crowd + val; break;
      case '-': result = crowd - val; break;
      case '*': result = crowd * val; break;
      case '/': result = Math.ceil(crowd / val); break;
      default:  result = crowd;
    }
    return Math.max(0, Math.min(MAX_CROWD, result));
  }

  function _randomGateOp() {
    return GATE_OPS[Math.floor(Math.random() * GATE_OPS.length)];
  }

  /** 前方にゲートを生成する */
  function _spawnGate(worldY) {
    const settings = DIFFICULTY_SETTINGS[_difficulty];
    const leftOp   = _randomGateOp();
    let   rightOp  = _randomGateOp();
    // 左右で同じ演算にならないようにする（最大3回試行）
    for (let i = 0; i < 3 && rightOp.label === leftOp.label; i++) {
      rightOp = _randomGateOp();
    }

    const gap    = GATE_GAP;
    const gw     = GATE_WIDTH;
    const totalW = gw * 2 + gap;
    const startX = (WORLD_WIDTH - totalW) / 2;

    _gates.push({
      y:     worldY,
      left:  { x: startX,        w: gw, ...leftOp,  passed: false },
      right: { x: startX + gw + gap, w: gw, ...rightOp, passed: false },
    });
    _nextGateY = worldY - settings.gateInterval - Math.random() * 200;
  }

  /** 障害物を生成する */
  function _spawnObstacle(worldY) {
    const settings = DIFFICULTY_SETTINGS[_difficulty];
    // ランダムなX位置（端から少し内側）
    const margin = 20;
    const x = margin + Math.random() * (WORLD_WIDTH - OBSTACLE_WIDTH - margin * 2);
    _obstacles.push({ x, y: worldY, w: OBSTACLE_WIDTH, h: OBSTACLE_HEIGHT });
    _nextObstacleY = worldY - settings.obstacleInterval - Math.random() * 150;
  }

  /** コインを生成する */
  function _spawnCoin(worldY) {
    const settings = DIFFICULTY_SETTINGS[_difficulty];
    const x = COIN_RADIUS + Math.random() * (WORLD_WIDTH - COIN_RADIUS * 2);
    _coins.push({ x, y: worldY, collected: false });
    _nextCoinY = worldY - settings.coinInterval - Math.random() * 100;
  }

  /** AABB 衝突判定 */
  function _rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  /** プレイヤーとオブジェクトの衝突判定（プレイヤーは PLAYER_WIDTH × PLAYER_HEIGHT） */
  function _playerRect() {
    return {
      x: _player.x - PLAYER_WIDTH / 2,
      y: _player.y - PLAYER_HEIGHT / 2,
    };
  }

  // ============================================================
  // 公開 API
  // ============================================================

  /**
   * ゲームを初期化する
   * @param {string} difficulty - 'easy' | 'normal' | 'hard'
   */
  function init(difficulty) {
    _difficulty   = difficulty || 'normal';
    const settings = DIFFICULTY_SETTINGS[_difficulty];

    _player = { x: PLAYER_START_X, y: PLAYER_START_Y, crowd: 5 };
    _obstacles   = [];
    _gates       = [];
    _coins       = [];
    _distance    = 0;
    _goalDistance = settings.goalDistance;
    _speed       = settings.baseSpeed;
    _score       = 0;
    _coins_count = 0;
    _isGameOver  = false;
    _isGoal      = false;

    // 最初のオブジェクトの出現位置（プレイヤーより上 = 小さいY値）
    _nextGateY     = PLAYER_START_Y - 500;
    _nextObstacleY = PLAYER_START_Y - 700;
    _nextCoinY     = PLAYER_START_Y - 350;

    // ゴールの世界Y座標
    _goal = { y: PLAYER_START_Y - _goalDistance };
  }

  /**
   * ゲームを1フレーム更新する
   * @param {number} deltaTime - 経過時間（秒）
   * @param {number} inputDx   - 横入力 (-1〜1)
   * @returns {{ events: string[] }}
   */
  function update(deltaTime, inputDx) {
    if (_isGameOver || _isGoal) return { events: [] };

    const events = [];

    // ---- 前進（Y座標を減らす）----
    const advance = _speed * deltaTime;
    _player.y  -= advance;
    _distance  += advance;

    // ---- 横移動 ----
    if (inputDx !== 0) {
      _player.x += inputDx * PLAYER_LATERAL_SPEED * deltaTime;
      _player.x = Math.max(PLAYER_WIDTH / 2, Math.min(WORLD_WIDTH - PLAYER_WIDTH / 2, _player.x));
    }

    // ---- スポーン ----
    if (_player.y > _nextGateY + 2000) {
      // 未到達のゾーンにスポーン（プレイヤーより先）
    }
    const spawnAheadY = _player.y - 500; // プレイヤーより500前方
    if (spawnAheadY < _nextGateY)     _spawnGate(spawnAheadY);
    if (spawnAheadY < _nextObstacleY) _spawnObstacle(spawnAheadY);
    if (spawnAheadY < _nextCoinY)     _spawnCoin(spawnAheadY);

    const pr = _playerRect();

    // ---- ゲート通過判定 ----
    for (const gate of _gates) {
      for (const side of [gate.left, gate.right]) {
        if (side.passed) continue;
        if (_rectOverlap(pr.x, pr.y, PLAYER_WIDTH, PLAYER_HEIGHT,
                         side.x, gate.y - GATE_HEIGHT / 2, side.w, GATE_HEIGHT)) {
          side.passed = true;
          const before = _player.crowd;
          _player.crowd = _applyOp(_player.crowd, side.op, side.val);
          events.push({ type: 'gate', op: side.op, val: side.val, crowd: _player.crowd });
          if (_player.crowd === 0) {
            _isGameOver = true;
            events.push({ type: 'gameover' });
            return { events };
          }
        }
      }
    }

    // ---- 障害物衝突判定 ----
    for (const obs of _obstacles) {
      if (obs.hit) continue;
      if (_rectOverlap(pr.x, pr.y, PLAYER_WIDTH, PLAYER_HEIGHT,
                       obs.x, obs.y - OBSTACLE_HEIGHT / 2, obs.w, OBSTACLE_HEIGHT)) {
        obs.hit = true;
        _player.crowd = Math.max(0, _player.crowd - 1);
        events.push({ type: 'obstacle', crowd: _player.crowd });
        if (_player.crowd === 0) {
          _isGameOver = true;
          events.push({ type: 'gameover' });
          return { events };
        }
      }
    }

    // ---- コイン収集判定 ----
    for (const coin of _coins) {
      if (coin.collected) continue;
      const dx = _player.x - coin.x;
      const dy = (_player.y) - coin.y;
      if (Math.sqrt(dx * dx + dy * dy) < PLAYER_WIDTH / 2 + COIN_RADIUS) {
        coin.collected = true;
        _coins_count++;
        _score += SCORE_PER_COIN;
        events.push({ type: 'coin' });
      }
    }

    // ---- ゴール判定 ----
    if (_goal && _player.y <= _goal.y) {
      _isGoal = true;
      _score  = _player.crowd * SCORE_PER_PERSON + _coins_count * SCORE_PER_COIN;
      events.push({ type: 'goal', score: _score });
    }

    // ---- 速度を徐々に上げる ----
    _speed = Math.min(_speed + deltaTime * 5, DIFFICULTY_SETTINGS[_difficulty].baseSpeed * 1.8);

    // ---- 画面外オブジェクトを削除 ----
    const removeY = _player.y + WORLD_HEIGHT;
    _obstacles = _obstacles.filter(o => o.y < removeY);
    _gates     = _gates.filter(g => g.y < removeY);
    _coins     = _coins.filter(c => c.y < removeY);

    return { events };
  }

  // ---- ゲッター ----
  function getPlayer()       { return { ..._player }; }
  function getObstacles()    { return _obstacles; }
  function getGates()        { return _gates; }
  function getCoins()        { return _coins; }
  function getGoal()         { return _goal; }
  function getScore()        { return _score; }
  function getDistance()     { return Math.floor(_distance); }
  function getGoalDistance() { return _goalDistance; }
  function getProgress()     { return Math.min(1, _distance / _goalDistance); }
  function isGameOver()      { return _isGameOver; }
  function isGoal()          { return _isGoal; }

  return {
    init,
    update,
    getPlayer,
    getObstacles,
    getGates,
    getCoins,
    getGoal,
    getScore,
    getDistance,
    getGoalDistance,
    getProgress,
    isGameOver,
    isGoal,
  };

})();
