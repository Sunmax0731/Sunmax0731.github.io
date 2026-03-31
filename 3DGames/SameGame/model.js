// ============================================================
// SameGame 3D - model.js
// 役割: 純粋なゲームロジック
//   - DOM / Three.js に一切依存しない
//   - 盤面状態・スコア・ルール判定を管理
//   - 2D モード: _boardDepth = 1（depth=0 のみ）
//   - 3D モード: _boardDepth >= 2（6方向隣接 BFS）
// ============================================================

const Model = (() => {

  // ---- 内部状態 ----
  let _board       = [];   // _board[row][col][depth]
  let _boardWidth  = 0;
  let _boardHeight = 0;
  let _boardDepth  = 1;
  let _colorCount  = 0;
  let _score       = 0;
  let _isGameOver  = false;

  // ============================================================
  // 内部処理
  // ============================================================

  function _initBoardData() {
    _board = [];
    for (let r = 0; r < _boardHeight; r++) {
      _board[r] = [];
      for (let c = 0; c < _boardWidth; c++) {
        _board[r][c] = [];
        for (let d = 0; d < _boardDepth; d++) {
          _board[r][c][d] = Math.floor(Math.random() * _colorCount) + 1;
        }
      }
    }
  }

  /**
   * 重力マップを計算する（board 更新前に呼ぶこと）
   * gravMap[col][depth][oldRow] = newRow
   */
  function _computeGravityMap() {
    const gravMap = {};
    for (let c = 0; c < _boardWidth; c++) {
      gravMap[c] = {};
      for (let d = 0; d < _boardDepth; d++) {
        gravMap[c][d] = {};
        let bottom = _boardHeight - 1;
        for (let r = _boardHeight - 1; r >= 0; r--) {
          if (_board[r][c][d] !== 0) {
            gravMap[c][d][r] = bottom;
            bottom--;
          }
        }
      }
    }
    return gravMap;
  }

  /** 重力を適用してブロックを下に詰める */
  function _applyGravity() {
    for (let c = 0; c < _boardWidth; c++) {
      for (let d = 0; d < _boardDepth; d++) {
        let bottom = _boardHeight - 1;
        for (let r = _boardHeight - 1; r >= 0; r--) {
          if (_board[r][c][d] !== 0) {
            _board[bottom][c][d] = _board[r][c][d];
            if (bottom !== r) _board[r][c][d] = 0;
            bottom--;
          }
        }
        for (let r = bottom; r >= 0; r--) _board[r][c][d] = 0;
      }
    }
  }

  /**
   * 列シフトマップを計算する（_applyGravity 後に呼ぶこと）
   * shiftMap[oldCol] = newCol
   * 全深さで底が空の列を削除対象とみなす
   */
  function _computeShiftMap() {
    const shiftMap = {};
    let left = 0;
    for (let c = 0; c < _boardWidth; c++) {
      let hasBlock = false;
      for (let d = 0; d < _boardDepth; d++) {
        if (_board[_boardHeight - 1][c][d] !== 0) { hasBlock = true; break; }
      }
      if (hasBlock) {
        shiftMap[c] = left;
        left++;
      }
    }
    return shiftMap;
  }

  /** 空列を左に詰める（全深さをまとめてシフト） */
  function _shiftColumnsLeft() {
    let left = 0;
    for (let c = 0; c < _boardWidth; c++) {
      let hasBlock = false;
      for (let d = 0; d < _boardDepth; d++) {
        if (_board[_boardHeight - 1][c][d] !== 0) { hasBlock = true; break; }
      }
      if (hasBlock) {
        if (left !== c) {
          for (let r = 0; r < _boardHeight; r++) {
            for (let d = 0; d < _boardDepth; d++) {
              _board[r][left][d] = _board[r][c][d];
              _board[r][c][d]    = 0;
            }
          }
        }
        left++;
      }
    }
  }

  // ============================================================
  // 公開 API
  // ============================================================

  /**
   * ゲームを初期化する
   * @param {number} colors
   * @param {number} width
   * @param {number} height
   * @param {number} [depth=1]  1 = 2D モード
   */
  function init(colors, width, height, depth) {
    _colorCount  = colors;
    _boardWidth  = width;
    _boardHeight = height;
    _boardDepth  = (depth && depth >= 1) ? depth : 1;
    _score       = 0;
    _isGameOver  = false;
    _initBoardData();
  }

  /**
   * 指定セルと隣接する同色グループを BFS で取得する
   * 3D モードでは上下左右前後の6方向を探索
   * @returns {Array<[number, number, number]>} グループのセル座標リスト
   */
  function findGroup(startRow, startCol, startDepth) {
    const d0    = (startDepth !== undefined) ? startDepth : 0;
    const color = _board[startRow][startCol][d0];
    if (!color) return [];

    const visited = new Set();
    const queue   = [[startRow, startCol, d0]];
    const group   = [];

    while (queue.length > 0) {
      const [r, c, d] = queue.shift();
      const key = `${r},${c},${d}`;
      if (visited.has(key)) continue;
      if (r < 0 || r >= _boardHeight) continue;
      if (c < 0 || c >= _boardWidth)  continue;
      if (d < 0 || d >= _boardDepth)  continue;
      if (_board[r][c][d] !== color)  continue;
      visited.add(key);
      group.push([r, c, d]);
      queue.push(
        [r - 1, c, d], [r + 1, c, d],
        [r, c - 1, d], [r, c + 1, d],
        [r, c, d - 1], [r, c, d + 1],
      );
    }
    return group;
  }

  /**
   * グループを盤面から消去しスコアを加算する
   * @param {Array<[number, number, number]>} group
   */
  function removeGroup(group) {
    for (const [r, c, d] of group) _board[r][c][d] = 0;
    const n = group.length;
    _score += n * (n - 1);
  }

  /**
   * 重力・列詰めを適用し、アニメーション用マップを返す
   * @returns {{ gravMap: object, shiftMap: object }}
   */
  function applyPhysics() {
    const gravMap  = _computeGravityMap(); // board 更新前に計算
    _applyGravity();
    const shiftMap = _computeShiftMap();   // gravity 後に計算
    _shiftColumnsLeft();
    return { gravMap, shiftMap };
  }

  /**
   * ゲームオーバー判定を行う
   * 全消し時は +1000 点を加算する
   * @returns {{ isOver: boolean, remaining: number, isPerfect: boolean }}
   */
  function checkGameOver() {
    let remaining    = 0;
    let hasValidMove = false;

    for (let r = 0; r < _boardHeight; r++)
      for (let c = 0; c < _boardWidth; c++)
        for (let d = 0; d < _boardDepth; d++) {
          if (_board[r][c][d] !== 0) {
            remaining++;
            if (!hasValidMove && findGroup(r, c, d).length >= 2) hasValidMove = true;
          }
        }

    if (!hasValidMove) {
      const isPerfect = remaining === 0;
      if (isPerfect) _score += 1000;
      _isGameOver = true;
      return { isOver: true, remaining, isPerfect };
    }
    return { isOver: false, remaining: 0, isPerfect: false };
  }

  /**
   * 色ごとの残りブロック数を返す
   * @returns {number[]} インデックスは colorIndex - 1 に対応
   */
  function getColorCounts() {
    const counts = new Array(_colorCount).fill(0);
    for (let r = 0; r < _boardHeight; r++)
      for (let c = 0; c < _boardWidth; c++)
        for (let d = 0; d < _boardDepth; d++)
          if (_board[r][c][d] !== 0) counts[_board[r][c][d] - 1]++;
    return counts;
  }

  // ---- ゲッター ----
  function getBoard()       { return _board; }
  function getBoardWidth()  { return _boardWidth; }
  function getBoardHeight() { return _boardHeight; }
  function getBoardDepth()  { return _boardDepth; }
  function getColorCount()  { return _colorCount; }
  function getScore()       { return _score; }
  function getIsGameOver()  { return _isGameOver; }

  return {
    init,
    findGroup,
    removeGroup,
    applyPhysics,
    checkGameOver,
    getColorCounts,
    getBoard,
    getBoardWidth,
    getBoardHeight,
    getBoardDepth,
    getColorCount,
    getScore,
    getIsGameOver,
  };

})();
