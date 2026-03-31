// ============================================================
// Block Breaker - model.js
// 役割: 純粋なゲームロジック（DOM / Three.js 非依存）
// ============================================================

const Model = (() => {

  // ---- 内部状態 ----
  let _balls       = [];
  let _paddle      = {};
  let _bricks      = [];   // [row][col][layer]
  let _items       = [];
  let _score       = 0;
  let _lives       = 3;
  let _bricksLeft  = 0;
  let _ballSpeed   = 15;
  let _initSpeed   = 15;
  let _gameState   = 'idle';
  let _difficulty  = 'normal';
  let _dirtyBricks = [];
  let _nextId      = 0;

  // ---- 3D モード ----
  let _is3D      = false;
  let _numLayers = 1;
  let _paddleHD  = PADDLE_DEPTH / 2;  // パドル奥行き半サイズ

  // ---- パワーアップ状態 ----
  let _widePaddleTimer   = 0;
  let _narrowPaddleTimer = 0;
  let _currentPaddleW    = PADDLE_W;
  let _pierceTimer       = 0;
  let _catchTimer        = 0;
  let _darknessTimer     = 0;

  // ============================================================
  // 内部: ユーティリティ
  // ============================================================

  function _recalcPaddleW() {
    if (_widePaddleTimer > 0 && _narrowPaddleTimer > 0) {
      _currentPaddleW = PADDLE_W;
    } else if (_widePaddleTimer > 0) {
      _currentPaddleW = PADDLE_W * 2;
    } else if (_narrowPaddleTimer > 0) {
      _currentPaddleW = PADDLE_W * 0.5;
    } else {
      _currentPaddleW = PADDLE_W;
    }
  }

  function _brickFirstZ() {
    const total = _numLayers * BRICK_DEPTH + (_numLayers - 1) * BRICK_LAYER_GAP;
    return -(total / 2) + BRICK_DEPTH / 2;
  }

  // ============================================================
  // 内部: 初期化
  // ============================================================

  function _resetBalls() {
    _balls = [{
      x: _paddle.x, y: PADDLE_Y + PADDLE_H / 2 + BALL_RADIUS + 0.01,
      z: 0,
      vx: 0, vy: 0, vz: 0,
      radius: BALL_RADIUS,
      caught: false, relX: 0, relZ: 0,
    }];
  }

  function _initBricks(difficulty) {
    const health = BRICK_HEALTH[difficulty];
    _bricks = [];
    _bricksLeft = 0;
    const layerSpacing = BRICK_DEPTH + BRICK_LAYER_GAP;
    const firstZ = _brickFirstZ();

    for (let r = 0; r < BRICK_ROWS; r++) {
      _bricks[r] = [];
      for (let c = 0; c < BRICK_COLS; c++) {
        _bricks[r][c] = [];
        for (let l = 0; l < _numLayers; l++) {
          const maxH = health[r];
          _bricks[r][c][l] = {
            x: BRICKS_LEFT_X + c * (BRICK_W + BRICK_GAP),
            y: BRICKS_TOP_Y  - r * (BRICK_H + BRICK_GAP),
            z: _is3D ? firstZ + l * layerSpacing : 0,
            alive: true, health: maxH, maxHealth: maxH,
            row: r, col: c, layer: l,
          };
          _bricksLeft++;
        }
      }
    }
  }

  // ============================================================
  // 内部: 衝突判定
  // ============================================================

  /** 2D 球 vs AABB */
  function _circleAABB2D(ball, cx, cy, hw, hh) {
    const clampX = Math.max(cx - hw, Math.min(ball.x, cx + hw));
    const clampY = Math.max(cy - hh, Math.min(ball.y, cy + hh));
    const dx = ball.x - clampX, dy = ball.y - clampY;
    const dist2 = dx * dx + dy * dy;
    if (dist2 >= ball.radius * ball.radius) return null;
    const dist = Math.sqrt(dist2) || 0.0001;
    return { nx: dx / dist, ny: dy / dist, nz: 0, depth: ball.radius - dist };
  }

  /** 3D 球 vs AABB */
  function _circleAABB3D(ball, cx, cy, cz, hw, hh, hd) {
    const clampX = Math.max(cx - hw, Math.min(ball.x, cx + hw));
    const clampY = Math.max(cy - hh, Math.min(ball.y, cy + hh));
    const clampZ = Math.max(cz - hd, Math.min(ball.z, cz + hd));
    const dx = ball.x - clampX, dy = ball.y - clampY, dz = ball.z - clampZ;
    const dist2 = dx * dx + dy * dy + dz * dz;
    if (dist2 >= ball.radius * ball.radius) return null;
    const dist = Math.sqrt(dist2) || 0.0001;
    return { nx: dx / dist, ny: dy / dist, nz: dz / dist, depth: ball.radius - dist };
  }

  function _reflectBall(ball, hit) {
    const dot = ball.vx * hit.nx + ball.vy * hit.ny + ball.vz * hit.nz;
    ball.vx -= 2 * dot * hit.nx;
    ball.vy -= 2 * dot * hit.ny;
    ball.vz -= 2 * dot * hit.nz;
    ball.x  += hit.nx * (hit.depth + 0.001);
    ball.y  += hit.ny * (hit.depth + 0.001);
    ball.z  += hit.nz * (hit.depth + 0.001);
  }

  function _pushOut(ball, hit) {
    ball.x += hit.nx * (hit.depth + 0.001);
    ball.y += hit.ny * (hit.depth + 0.001);
    ball.z += hit.nz * (hit.depth + 0.001);
  }

  // ============================================================
  // 内部: 物理
  // ============================================================

  function _checkWalls(ball) {
    const hw = WORLD_W / 2 - WALL_T;
    const hh = WORLD_H / 2 - WALL_T;
    if (ball.x - ball.radius < -hw) { ball.x = -hw + ball.radius; ball.vx =  Math.abs(ball.vx); }
    if (ball.x + ball.radius >  hw) { ball.x =  hw - ball.radius; ball.vx = -Math.abs(ball.vx); }
    if (ball.y + ball.radius >  hh) { ball.y =  hh - ball.radius; ball.vy = -Math.abs(ball.vy); }
    if (_is3D) {
      const hz = WORLD_Z / 2;
      if (ball.z - ball.radius < -hz) { ball.z = -hz + ball.radius; ball.vz =  Math.abs(ball.vz); }
      if (ball.z + ball.radius >  hz) { ball.z =  hz - ball.radius; ball.vz = -Math.abs(ball.vz); }
    }
  }

  /** 1ボール分のブリック衝突。true を返したら win */
  function _checkBricks(ball) {
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let l = 0; l < _numLayers; l++) {
          const brick = _bricks[r][c][l];
          if (!brick.alive) continue;

          const hit = _is3D
            ? _circleAABB3D(ball, brick.x, brick.y, brick.z,
                BRICK_W / 2, BRICK_H / 2, BRICK_DEPTH / 2)
            : _circleAABB2D(ball, brick.x, brick.y, BRICK_W / 2, BRICK_H / 2);
          if (!hit) continue;

          if (_pierceTimer > 0) _pushOut(ball, hit);
          else                  _reflectBall(ball, hit);

          brick.health--;
          _dirtyBricks.push({ row: r, col: c, layer: l });

          if (brick.health <= 0) {
            brick.alive = false;
            _score += BRICK_POINTS[r];
            _bricksLeft--;

            if (Math.random() < ITEM_DROP_CHANCE) {
              _items.push({
                id:   _nextId++,
                x:    brick.x,
                y:    brick.y,
                type: POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)],
              });
            }

            if (_bricksLeft <= 0) {
              _score += _lives * 100;
              _gameState = 'won';
              return true;
            }
          }

          if (_pierceTimer > 0) continue;
          return false;
        }
      }
    }
    return false;
  }

  function _checkPaddle(ball) {
    if (ball.caught) return;
    if (ball.vy > 0)  return;

    const hit = _is3D
      ? _circleAABB3D(ball, _paddle.x, PADDLE_Y, 0,
          _currentPaddleW / 2, PADDLE_H / 2, _paddleHD)
      : _circleAABB2D(ball, _paddle.x, PADDLE_Y,
          _currentPaddleW / 2, PADDLE_H / 2);
    if (!hit) return;

    if (_catchTimer > 0) {
      ball.caught = true;
      ball.relX = Math.max(-_currentPaddleW / 2, Math.min(_currentPaddleW / 2, ball.x - _paddle.x));
      ball.relZ = ball.z;
      ball.vx = ball.vy = ball.vz = 0;
      return;
    }

    ball.y = PADDLE_Y + PADDLE_H / 2 + ball.radius + 0.001;
    const totalSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy + ball.vz * ball.vz) || _ballSpeed;
    const vzCurrent  = _is3D ? ball.vz : 0;
    const xySpeed    = Math.sqrt(Math.max(0, totalSpeed * totalSpeed - vzCurrent * vzCurrent));
    const offset     = Math.max(-1, Math.min(1, (ball.x - _paddle.x) / (_currentPaddleW / 2)));
    const angle      = offset * Math.PI / 2.8;
    ball.vx = Math.sin(angle) * xySpeed;
    ball.vy = Math.abs(Math.cos(angle) * xySpeed);
    if (ball.vy < 2) ball.vy = 2;
    ball.vz = vzCurrent;
  }

  function _updateItems(dt) {
    const toRemove = [];
    for (let i = 0; i < _items.length; i++) {
      const item = _items[i];
      item.y -= ITEM_FALL_SPEED * dt;
      const dx = Math.abs(item.x - _paddle.x);
      const dy = Math.abs(item.y - PADDLE_Y);
      if (dx < (_currentPaddleW / 2 + ITEM_W / 2) && dy < (PADDLE_H / 2 + ITEM_H / 2)) {
        _applyPowerUp(item.type);
        toRemove.push(i);
      } else if (item.y + ITEM_H / 2 < -WORLD_H / 2) {
        toRemove.push(i);
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) _items.splice(toRemove[i], 1);
  }

  function _applyPowerUp(type) {
    switch (type) {
      case 'multiBall': {
        const copies = _balls.map(b => {
          const speed  = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz) || _ballSpeed;
          const base   = Math.atan2(b.vx, b.vy || speed);
          const flip   = -base + (Math.random() - 0.5) * (Math.PI / 3);
          const vzNew  = _is3D ? (Math.random() - 0.5) * speed * 0.4 : 0;
          const xySpd  = Math.sqrt(Math.max(0, speed * speed - vzNew * vzNew));
          return {
            x: b.x + b.vx * 0.05, y: b.y + b.vy * 0.05, z: b.z,
            vx: Math.sin(flip) * xySpd,
            vy: Math.abs(Math.cos(flip) * xySpd) || 2,
            vz: vzNew,
            radius: BALL_RADIUS, caught: false, relX: 0, relZ: 0,
          };
        });
        _balls = [..._balls, ...copies];
        break;
      }
      case 'widePaddle':
        _widePaddleTimer = POWER_UP_WIDE_PADDLE_DURATION;
        _recalcPaddleW();
        break;
      case 'narrowPaddle':
        _narrowPaddleTimer = POWER_UP_NARROW_PADDLE_DURATION;
        _recalcPaddleW();
        break;
      case 'speedUp':
        for (const b of _balls) {
          const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
          if (!s) continue;
          const ns = Math.min(s * POWER_UP_SPEED_FACTOR, POWER_UP_MAX_SPEED);
          b.vx = b.vx / s * ns; b.vy = b.vy / s * ns; b.vz = b.vz / s * ns;
        }
        _ballSpeed = Math.min(_ballSpeed * POWER_UP_SPEED_FACTOR, POWER_UP_MAX_SPEED);
        break;
      case 'speedDown':
        for (const b of _balls) {
          const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
          if (!s) continue;
          const ns = Math.max(s * POWER_UP_SLOW_FACTOR, POWER_UP_MIN_SPEED);
          b.vx = b.vx / s * ns; b.vy = b.vy / s * ns; b.vz = b.vz / s * ns;
        }
        _ballSpeed = Math.max(_ballSpeed * POWER_UP_SLOW_FACTOR, POWER_UP_MIN_SPEED);
        break;
      case 'pierce':    _pierceTimer = POWER_UP_PIERCE_DURATION; break;
      case 'catch':     _catchTimer  = POWER_UP_CATCH_DURATION;  break;
      case 'extraLife': _lives = Math.min(_lives + 1, 9); break;
      case 'darkness':  _darknessTimer = POWER_UP_DARKNESS_DURATION; break;
    }
  }

  // ============================================================
  // 公開 API
  // ============================================================

  function init(difficulty, is3D, numLayers) {
    _difficulty        = difficulty || 'normal';
    _is3D              = !!is3D;
    _numLayers         = _is3D ? Math.max(1, numLayers || 2) : 1;
    _paddleHD          = _is3D ? (WORLD_Z - WALL_T * 2) / 2 : PADDLE_DEPTH / 2;
    const d            = DIFFICULTY[_difficulty];
    _score             = 0;
    _lives             = d.lives;
    _ballSpeed         = d.ballSpeed;
    _initSpeed         = d.ballSpeed;
    _gameState         = 'ready';
    _dirtyBricks       = [];
    _items             = [];
    _widePaddleTimer   = 0;
    _narrowPaddleTimer = 0;
    _pierceTimer       = 0;
    _catchTimer        = 0;
    _darknessTimer     = 0;
    _currentPaddleW    = PADDLE_W;
    _nextId            = 0;

    _paddle = { x: 0 };
    _resetBalls();
    _initBricks(_difficulty);
  }

  function update(dt) {
    if (_gameState === 'ready') {
      _balls[0].x = _paddle.x;
      _balls[0].y = PADDLE_Y + PADDLE_H / 2 + BALL_RADIUS + 0.01;
      _balls[0].z = 0;
      return;
    }
    if (_gameState !== 'playing') return;

    _dirtyBricks = [];

    const fallen = [];
    for (let i = 0; i < _balls.length; i++) {
      const ball = _balls[i];

      if (ball.caught) {
        ball.x = _paddle.x + ball.relX;
        ball.y = PADDLE_Y + PADDLE_H / 2 + BALL_RADIUS + 0.01;
        ball.z = ball.relZ;
        continue;
      }

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      ball.z += ball.vz * dt;
      _checkWalls(ball);
      if (_checkBricks(ball)) return;
      _checkPaddle(ball);
      if (ball.y + ball.radius < -WORLD_H / 2) fallen.push(i);
    }

    for (let i = fallen.length - 1; i >= 0; i--) _balls.splice(fallen[i], 1);

    if (_balls.length === 0) {
      _lives--;
      _widePaddleTimer = _narrowPaddleTimer = _pierceTimer = _catchTimer = _darknessTimer = 0;
      _ballSpeed = _initSpeed;
      _items = [];
      _recalcPaddleW();
      if (_lives <= 0) {
        _gameState = 'gameover';
      } else {
        _gameState = 'ready';
        _resetBalls();
      }
      return;
    }

    _updateItems(dt);

    if (_widePaddleTimer > 0) {
      _widePaddleTimer -= dt;
      if (_widePaddleTimer <= 0) { _widePaddleTimer = 0; _recalcPaddleW(); }
    }
    if (_narrowPaddleTimer > 0) {
      _narrowPaddleTimer -= dt;
      if (_narrowPaddleTimer <= 0) { _narrowPaddleTimer = 0; _recalcPaddleW(); }
    }
    if (_pierceTimer > 0)    { _pierceTimer    -= dt; if (_pierceTimer    <= 0) _pierceTimer    = 0; }
    if (_catchTimer  > 0)    { _catchTimer     -= dt; if (_catchTimer     <= 0) { _catchTimer = 0; releaseCaughtBalls(); } }
    if (_darknessTimer > 0)  { _darknessTimer  -= dt; if (_darknessTimer  <= 0) _darknessTimer  = 0; }
  }

  function setPaddleX(x) {
    const limit = WORLD_W / 2 - WALL_T - _currentPaddleW / 2;
    _paddle.x = Math.max(-limit, Math.min(limit, x));
  }

  function launchBall() {
    if (_gameState !== 'ready') return;
    const angleXY = (Math.random() - 0.5) * (Math.PI / 3);
    if (_is3D) {
      const angleZ = (Math.random() - 0.5) * (Math.PI / 3);
      const cosZ   = Math.cos(angleZ);
      _balls[0].vx = Math.sin(angleXY) * cosZ * _ballSpeed;
      _balls[0].vy = Math.abs(Math.cos(angleXY)) * cosZ * _ballSpeed;
      _balls[0].vz = Math.sin(angleZ) * _ballSpeed;
    } else {
      _balls[0].vx = Math.sin(angleXY) * _ballSpeed;
      _balls[0].vy = Math.cos(angleXY) * _ballSpeed;
      _balls[0].vz = 0;
    }
    if (_balls[0].vy < 2) _balls[0].vy = 2;
    _gameState = 'playing';
  }

  function releaseCaughtBalls() {
    const hasCaught = _balls.some(b => b.caught);
    if (!hasCaught) return false;
    for (const ball of _balls) {
      if (!ball.caught) continue;
      ball.caught = false;
      const angle = (Math.random() - 0.5) * (Math.PI / 3);
      if (_is3D) {
        const vz = (Math.random() - 0.5) * _ballSpeed * 0.3;
        const xySpd = Math.sqrt(Math.max(0, _ballSpeed * _ballSpeed - vz * vz));
        ball.vx = Math.sin(angle) * xySpd;
        ball.vy = Math.abs(Math.cos(angle) * xySpd);
        ball.vz = vz;
      } else {
        ball.vx = Math.sin(angle) * _ballSpeed;
        ball.vy = Math.abs(Math.cos(angle) * _ballSpeed);
        ball.vz = 0;
      }
      if (ball.vy < 2) ball.vy = 2;
    }
    return true;
  }

  function getState() {
    return {
      balls:              _balls.map(b => ({ ...b })),
      paddle:             { ..._paddle },
      bricks:             _bricks,
      items:              _items.map(i => ({ ...i })),
      dirtyBricks:        _dirtyBricks,
      score:              _score,
      lives:              _lives,
      gameState:          _gameState,
      paddleWidth:        _currentPaddleW,
      widePaddleTimer:    _widePaddleTimer,
      narrowPaddleTimer:  _narrowPaddleTimer,
      pierceTimer:        _pierceTimer,
      catchTimer:         _catchTimer,
      darknessTimer:      _darknessTimer,
      hasCaughtBalls:     _balls.some(b => b.caught),
      is3D:               _is3D,
      numLayers:          _numLayers,
    };
  }

  function getScore()      { return _score; }
  function getLives()      { return _lives; }
  function getGameState()  { return _gameState; }
  function getDifficulty() { return _difficulty; }
  function getIs3D()       { return _is3D; }
  function getNumLayers()  { return _numLayers; }

  return {
    init, update, setPaddleX, launchBall, releaseCaughtBalls,
    getState, getScore, getLives, getGameState, getDifficulty,
    getIs3D, getNumLayers,
  };

})();
