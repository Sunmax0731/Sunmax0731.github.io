// ============================================================
// Minesweeper - model.js
// 役割: 純粋なゲームロジック（DOM / Three.js 非依存）
//
// セル管理:
//   _cells[i]     = { mine, revealed, flagged, adjMines }
//   _adjacency[i] = [ 隣接セルインデックス, ... ]
//   _numCells     = セル総数
//   _topoData     = View に渡すトポロジーデータ
// ============================================================

const Model = (() => {

  let _cells        = [];
  let _adjacency    = [];
  let _numCells     = 0;
  let _topoData     = null;

  let _mines         = 0;
  let _flagCount     = 0;
  let _revealedCount = 0;
  let _gameState     = 'idle';
  let _difficulty    = 'normal';
  let _shapeType     = 'flat';
  let _startTime     = 0;
  let _elapsedTime   = 0;
  let _score         = 0;
  let _firstClick    = true;
  let _explodedCell  = null;   // セルインデックス or null

  // flat/cube 用
  let _rows = 0, _cols = 0;

  // ============================================================
  // キューブ球体: 面遷移付き隣接セル計算（cube モード専用）
  // ============================================================

  function _cubeNeighborFace(face, u, v) {
    const N = _cols;
    const s = (u + 0.5) / N * 2 - 1;
    const t = (v + 0.5) / N * 2 - 1;
    const b = FACE_BASES[face];
    const x = b.c[0] + s*b.u[0] + t*b.v[0];
    const y = b.c[1] + s*b.u[1] + t*b.v[1];
    const z = b.c[2] + s*b.u[2] + t*b.v[2];

    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    let nf;
    if      (ax >= ay && ax >= az) nf = x > 0 ? 4 : 5;
    else if (ay >= ax && ay >= az) nf = y > 0 ? 2 : 3;
    else                           nf = z > 0 ? 0 : 1;

    const nb    = FACE_BASES[nf];
    const scale = nb.c[0]*x + nb.c[1]*y + nb.c[2]*z;
    if (scale <= 0) return { face: nf, u: 0, v: 0 };

    const rx = x/scale - nb.c[0];
    const ry = y/scale - nb.c[1];
    const rz = z/scale - nb.c[2];
    const nu  = rx*nb.u[0] + ry*nb.u[1] + rz*nb.u[2];
    const nv  = rx*nb.v[0] + ry*nb.v[1] + rz*nb.v[2];

    return {
      face: nf,
      u: Math.max(0, Math.min(N-1, Math.round((nu+1)/2*N - 0.5))),
      v: Math.max(0, Math.min(N-1, Math.round((nv+1)/2*N - 0.5))),
    };
  }

  function _cubeNeighborIdx(r, c) {
    const N    = _cols;
    const face = Math.floor(r / N);
    const u    = r % N;
    const v    = c;
    const result = [];
    for (let du = -1; du <= 1; du++) {
      for (let dv = -1; dv <= 1; dv++) {
        if (!du && !dv) continue;
        const nu = u+du, nv = v+dv;
        if (nu >= 0 && nu < N && nv >= 0 && nv < N) {
          result.push((face*N + nu) * _cols + nv);
        } else {
          const nb = _cubeNeighborFace(face, nu, nv);
          result.push((nb.face*N + nb.u) * _cols + nb.v);
        }
      }
    }
    return result;
  }

  // ============================================================
  // トポロジー構築
  // ============================================================

  function _buildFlatTopology() {
    const adj = new Array(_numCells);
    for (let r = 0; r < _rows; r++)
      for (let c = 0; c < _cols; c++) {
        const i = r*_cols+c, nb = [];
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const nr = r+dr, nc = c+dc;
            if (nr >= 0 && nr < _rows && nc >= 0 && nc < _cols) nb.push(nr*_cols+nc);
          }
        adj[i] = nb;
      }
    return adj;
  }

  function _buildCubeTopology() {
    const adj = new Array(_numCells);
    for (let r = 0; r < _rows; r++)
      for (let c = 0; c < _cols; c++)
        adj[r*_cols+c] = _cubeNeighborIdx(r, c);
    return adj;
  }

  // ============================================================
  // 地雷配置・隣接カウント
  // ============================================================

  function _placeMines(safeIdx) {
    const safe = new Set([safeIdx, ..._adjacency[safeIdx]]);
    let placed = 0;
    while (placed < _mines) {
      const i = Math.floor(Math.random() * _numCells);
      if (!_cells[i].mine && !safe.has(i)) { _cells[i].mine = true; placed++; }
    }
    for (let i = 0; i < _numCells; i++) {
      if (_cells[i].mine) continue;
      let n = 0;
      for (const j of _adjacency[i]) if (_cells[j].mine) n++;
      _cells[i].adjMines = n;
    }
  }

  // ============================================================
  // フラッド開放
  // ============================================================

  function _floodReveal(startIdx) {
    const changed = [];
    const visited = new Set();
    const queue   = [startIdx];
    while (queue.length) {
      const i = queue.shift();
      if (visited.has(i)) continue;
      visited.add(i);
      const cell = _cells[i];
      if (cell.revealed || cell.flagged || cell.mine) continue;
      cell.revealed = true;
      _revealedCount++;
      changed.push({ cellIdx: i });
      if (cell.adjMines === 0)
        for (const j of _adjacency[i]) queue.push(j);
    }
    return changed;
  }

  // ============================================================
  // 公開 API
  // ============================================================

  function init(difficulty, shapeType) {
    _difficulty = difficulty || 'normal';
    _shapeType  = shapeType  || 'flat';

    if (_shapeType === 'flat') {
      const d = DIFFICULTIES[_difficulty];
      _rows = d.rows; _cols = d.cols; _mines = d.mines;
      _numCells = _rows * _cols;
      _topoData = { shapeType: 'flat', numCells: _numCells, rows: _rows, cols: _cols };
      _cells     = Array.from({ length: _numCells }, () =>
        ({ mine: false, revealed: false, flagged: false, adjMines: 0 }));
      _adjacency = _buildFlatTopology();

    } else if (_shapeType === 'cube') {
      const d = SPHERE_DIFFS[_difficulty];
      _rows = 6*d.N; _cols = d.N; _mines = d.mines;
      _numCells = _rows * _cols;
      _topoData = { shapeType: 'cube', numCells: _numCells, N: d.N };
      _cells     = Array.from({ length: _numCells }, () =>
        ({ mine: false, revealed: false, flagged: false, adjMines: 0 }));
      _adjacency = _buildCubeTopology();

    } else if (_shapeType === 'triangle') {
      const d    = TRIANGLE_DIFFS[_difficulty];
      const topo = Topology.buildTriangle(d.freq);
      _mines     = d.mines;
      _numCells  = topo.numCells;
      _rows = _cols = 0;
      _topoData  = topo;
      _cells     = Array.from({ length: _numCells }, () =>
        ({ mine: false, revealed: false, flagged: false, adjMines: 0 }));
      _adjacency = topo.adjacency;

    } else if (_shapeType === 'hex') {
      const d    = HEX_DIFFS[_difficulty];
      const topo = Topology.buildHex(d.freq);
      _mines     = d.mines;
      _numCells  = topo.numCells;
      _rows = _cols = 0;
      _topoData  = topo;
      _cells     = Array.from({ length: _numCells }, () =>
        ({ mine: false, revealed: false, flagged: false, adjMines: 0 }));
      _adjacency = topo.adjacency;
    }

    _flagCount = _revealedCount = _startTime = _elapsedTime = _score = 0;
    _firstClick   = true;
    _explodedCell = null;
    _gameState    = 'ready';
  }

  function revealCell(idx) {
    const empty = { changed: [], gameOver: false, won: false };
    if (_gameState !== 'ready' && _gameState !== 'playing') return empty;
    const cell = _cells[idx];
    if (!cell || cell.revealed || cell.flagged) return empty;

    if (_firstClick) {
      _placeMines(idx);
      _firstClick = false;
      _startTime  = Date.now();
      _gameState  = 'playing';
    }

    if (cell.mine) {
      cell.revealed = true;
      _explodedCell = idx;
      _elapsedTime  = (Date.now() - _startTime) / 1000;
      _gameState    = 'gameover';
      return { changed: [{ cellIdx: idx }], gameOver: true, won: false };
    }

    const changed = _floodReveal(idx);
    if (_revealedCount >= _numCells - _mines) {
      _elapsedTime = (Date.now() - _startTime) / 1000;
      _score       = Math.max(100, Math.round(10000 / Math.max(1, _elapsedTime)));
      _gameState   = 'won';
      return { changed, gameOver: false, won: true };
    }
    return { changed, gameOver: false, won: false };
  }

  function flagCell(idx) {
    if (_gameState !== 'ready' && _gameState !== 'playing') return null;
    const cell = _cells[idx];
    if (!cell || cell.revealed) return null;
    cell.flagged  = !cell.flagged;
    _flagCount   += cell.flagged ? 1 : -1;
    return { cellIdx: idx, flagged: cell.flagged };
  }

  function chordReveal(idx) {
    const empty = { changed: [], gameOver: false, won: false };
    if (_gameState !== 'playing') return empty;
    const cell = _cells[idx];
    if (!cell || !cell.revealed || cell.adjMines === 0) return empty;

    let flags = 0;
    const toReveal = [];
    for (const j of _adjacency[idx]) {
      if (_cells[j].flagged) flags++;
      else if (!_cells[j].revealed) toReveal.push(j);
    }
    if (flags !== cell.adjMines) return empty;

    let all = [], over = false, win = false;
    for (const j of toReveal) {
      const r = revealCell(j);
      all = all.concat(r.changed);
      if (r.gameOver) { over = true; break; }
      if (r.won)      { win  = true; break; }
    }
    return { changed: all, gameOver: over, won: win };
  }

  function getState() {
    const elapsed = _gameState === 'playing'
      ? (Date.now() - _startTime) / 1000
      : _elapsedTime;
    return {
      numCells: _numCells, mines: _mines,
      flagCount: _flagCount, minesLeft: _mines - _flagCount,
      revealedCount: _revealedCount, gameState: _gameState,
      difficulty: _difficulty, shapeType: _shapeType,
      elapsedTime: elapsed, score: _score, explodedCell: _explodedCell,
    };
  }

  function getCell(idx)     { return _cells[idx]; }
  function getCells()       { return _cells; }
  function getNumCells()    { return _numCells; }
  function getTopology()    { return _topoData; }
  function getGameState()   { return _gameState; }
  function getDifficulty()  { return _difficulty; }
  function getShapeType()   { return _shapeType; }
  function getScore()       { return _score; }

  return {
    init, revealCell, flagCell, chordReveal,
    getState, getCell, getCells, getNumCells,
    getTopology, getGameState, getDifficulty, getShapeType, getScore,
  };

})();
