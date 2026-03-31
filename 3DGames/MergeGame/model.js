// ============================================================
// MergeGame - model.js
// 役割: 純粋なゲームロジック
//   - DOM / Canvas に一切依存しない
//   - グリッド状態・スコア・マージ判定を管理
// ============================================================

const Model = (() => {

  // ---- 内部状態 ----
  let _grid         = [];    // _grid[row][col] = level (0=空)
  let _gridSize     = 5;
  let _score        = 0;
  let _selectedCell = null;  // { row, col } | null
  let _isGameOver   = false;
  let _highestLevel = 0;

  // ============================================================
  // 内部処理
  // ============================================================

  /** グリッドを初期化する（全セルを0で埋める） */
  function _createEmptyGrid(size) {
    const grid = [];
    for (let r = 0; r < size; r++) {
      grid[r] = new Array(size).fill(0);
    }
    return grid;
  }

  /** グリッドの空きセルリストを取得する */
  function _getEmptyCells() {
    const cells = [];
    for (let r = 0; r < _gridSize; r++) {
      for (let c = 0; c < _gridSize; c++) {
        if (_grid[r][c] === 0) cells.push({ row: r, col: c });
      }
    }
    return cells;
  }

  /** ランダムな整数を返す [min, max] */
  function _randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** 最高レベルを更新する */
  function _updateHighestLevel(level) {
    if (level > _highestLevel) _highestLevel = level;
  }

  /** 指定セルが隣接しているか判定する */
  function _isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  // ============================================================
  // 公開 API
  // ============================================================

  /**
   * ゲームを初期化する
   * @param {string} sizeKey - 'small' | 'medium' | 'large'
   */
  function init(sizeKey) {
    _gridSize     = GRID_SIZES[sizeKey] || GRID_SIZES.medium;
    _score        = 0;
    _selectedCell = null;
    _isGameOver   = false;
    _highestLevel = 0;

    // 空グリッドを作成
    _grid = _createEmptyGrid(_gridSize);

    // 初期アイテムを配置（グリッドの40%程度）
    const totalCells   = _gridSize * _gridSize;
    const targetCount  = Math.floor(totalCells * INITIAL_FILL_RATIO);

    // 全セルをランダムに並べて先頭から配置
    const allCells = [];
    for (let r = 0; r < _gridSize; r++) {
      for (let c = 0; c < _gridSize; c++) {
        allCells.push({ row: r, col: c });
      }
    }
    // Fisher-Yates シャッフル
    for (let i = allCells.length - 1; i > 0; i--) {
      const j = _randInt(0, i);
      [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
    }

    for (let i = 0; i < targetCount; i++) {
      const { row, col } = allCells[i];
      _grid[row][col] = _randInt(1, INITIAL_MAX_LEVEL);
      _updateHighestLevel(_grid[row][col]);
    }
  }

  /**
   * セルを選択またはマージを試みる
   * @param {number} row
   * @param {number} col
   * @returns {{ action: string, mergedLevel?: number, newLevel?: number, score?: number, bonusRow?: number, bonusCol?: number }}
   *   action: 'select' | 'deselect' | 'merge' | 'merge_bonus' | 'invalid' | 'empty'
   */
  function selectCell(row, col) {
    // 境界チェック
    if (row < 0 || row >= _gridSize || col < 0 || col >= _gridSize) {
      return { action: 'invalid' };
    }

    const level = _grid[row][col];

    // 空セルはスキップ
    if (level === 0) {
      _selectedCell = null;
      return { action: 'empty' };
    }

    // 未選択 → このセルを選択
    if (_selectedCell === null) {
      _selectedCell = { row, col };
      return { action: 'select' };
    }

    // 同じセルを再度タップ → 選択解除
    if (_selectedCell.row === row && _selectedCell.col === col) {
      _selectedCell = null;
      return { action: 'deselect' };
    }

    const prevRow = _selectedCell.row;
    const prevCol = _selectedCell.col;
    const prevLevel = _grid[prevRow][prevCol];

    // 隣接かつ同レベルでなければ → 新しい選択に切り替え
    if (!_isAdjacent(prevRow, prevCol, row, col) || prevLevel !== level) {
      _selectedCell = { row, col };
      return { action: 'select' };
    }

    // マージ実行: 選択セルを消してターゲットセルをレベルアップ
    const mergedLevel = level;
    const newLevel    = level + 1;

    // 合体元セルを空にする
    _grid[prevRow][prevCol] = 0;

    // Lv10 以上の場合は上限に達しているのでマージ不可
    if (newLevel > MAX_LEVEL) {
      // 元に戻す
      _grid[prevRow][prevCol] = mergedLevel;
      _selectedCell = null;
      return { action: 'invalid' };
    }

    // Lv10 に到達した場合（MAX_LEVEL）
    if (newLevel === MAX_LEVEL) {
      _grid[row][col] = newLevel;
      _score += ITEM_VALUES[newLevel - 1]; // マージで生まれた値を加算
      _updateHighestLevel(newLevel);

      // ボーナス加算後にセルを消去（スコアに変換）
      _score += MAX_LEVEL_BONUS;
      _grid[row][col] = 0;

      _selectedCell = null;
      return {
        action:      'merge_bonus',
        mergedLevel: mergedLevel,
        newLevel:    newLevel,
        score:       _score,
        bonusRow:    row,
        bonusCol:    col,
      };
    }

    // 通常マージ
    _grid[row][col] = newLevel;
    _score += ITEM_VALUES[newLevel - 1]; // 新しいアイテムの値をスコアに加算
    _updateHighestLevel(newLevel);
    _selectedCell = null;

    return {
      action:      'merge',
      mergedLevel: mergedLevel,
      newLevel:    newLevel,
      score:       _score,
    };
  }

  /**
   * 空きマスにLv1アイテムをランダム追加する
   * @returns {{ row: number, col: number } | null}
   */
  function spawnRandom() {
    const emptyCells = _getEmptyCells();
    if (emptyCells.length === 0) return null;

    const idx     = _randInt(0, emptyCells.length - 1);
    const { row, col } = emptyCells[idx];
    _grid[row][col] = 1;
    return { row, col };
  }

  /**
   * ゲームオーバー判定
   * グリッドが満杯で合体できる組み合わせがない場合 true
   * @returns {boolean}
   */
  function checkGameOver() {
    // 空きマスがあれば継続
    const emptyCells = _getEmptyCells();
    if (emptyCells.length > 0) return false;

    // 合体可能な隣接ペアが存在するか確認
    if (canMergeAnywhere()) return false;

    _isGameOver = true;
    return true;
  }

  /**
   * 合体可能な隣接ペアが存在するか確認する
   * @returns {boolean}
   */
  function canMergeAnywhere() {
    for (let r = 0; r < _gridSize; r++) {
      for (let c = 0; c < _gridSize; c++) {
        const level = _grid[r][c];
        if (level === 0 || level >= MAX_LEVEL) continue;

        // 右隣を確認
        if (c + 1 < _gridSize && _grid[r][c + 1] === level) return true;
        // 下隣を確認
        if (r + 1 < _gridSize && _grid[r + 1][c] === level) return true;
      }
    }
    return false;
  }

  // ---- ゲッター ----
  function getGrid()         { return _grid; }
  function getGridSize()     { return _gridSize; }
  function getScore()        { return _score; }
  function getSelectedCell() { return _selectedCell; }
  function isGameOver()      { return _isGameOver; }
  function getHighestLevel() { return _highestLevel; }

  return {
    init,
    selectCell,
    spawnRandom,
    checkGameOver,
    canMergeAnywhere,
    getGrid,
    getGridSize,
    getScore,
    getSelectedCell,
    isGameOver,
    getHighestLevel,
  };

})();
