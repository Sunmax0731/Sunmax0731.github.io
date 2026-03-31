// ============================================================
// SortGame - model.js
// 役割: 純粋なゲームロジック
//   - DOM / Canvas に一切依存しない
//   - チューブ状態・手数・勝利判定を管理
// ============================================================

const Model = (() => {

  // ---- 内部状態 ----
  let _tubes       = []; // tubes[i] = 色インデックスの配列（[0]が底、末尾が最上部）
  let _numColors   = 0;
  let _selectedIdx = -1; // 選択中チューブのインデックス（-1=未選択）
  let _moves       = 0;
  let _isWon       = false;

  // ============================================================
  // 内部処理
  // ============================================================

  /** チューブを初期化してランダムに色を配る */
  function _initTubes(numColors, extraTubes) {
    _tubes = [];

    // 全セグメントを作成（各色 TUBE_CAPACITY 個ずつ）
    const segments = [];
    for (let c = 0; c < numColors; c++) {
      for (let i = 0; i < TUBE_CAPACITY; i++) {
        segments.push(c);
      }
    }

    // シャッフル（Fisher-Yates）
    for (let i = segments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [segments[i], segments[j]] = [segments[j], segments[i]];
    }

    // チューブに割り当て
    for (let t = 0; t < numColors; t++) {
      _tubes.push(segments.splice(0, TUBE_CAPACITY));
    }

    // 空チューブを追加
    for (let e = 0; e < extraTubes; e++) {
      _tubes.push([]);
    }
  }

  /** チューブ上部から連続する同色セグメント数を返す */
  function _topRunLength(tubeIdx) {
    const tube = _tubes[tubeIdx];
    if (tube.length === 0) return 0;
    const topColor = tube[tube.length - 1];
    let count = 0;
    for (let i = tube.length - 1; i >= 0; i--) {
      if (tube[i] === topColor) count++;
      else break;
    }
    return count;
  }

  /** 注ぐ条件を検証する */
  function _canPour(fromIdx, toIdx) {
    if (fromIdx === toIdx) return false;
    const from = _tubes[fromIdx];
    const to   = _tubes[toIdx];
    if (from.length === 0) return false;
    if (to.length >= TUBE_CAPACITY) return false;
    if (to.length === 0) return true; // 空チューブには常に注げる
    return from[from.length - 1] === to[to.length - 1]; // 最上部の色が同じ
  }

  /** 勝利判定: 全チューブが空 or 単色満杯 */
  function _checkWin() {
    for (const tube of _tubes) {
      if (tube.length === 0) continue;
      if (tube.length !== TUBE_CAPACITY) return false;
      const color = tube[0];
      if (!tube.every(c => c === color)) return false;
    }
    return true;
  }

  // ============================================================
  // 公開 API
  // ============================================================

  /**
   * ゲームを初期化する
   * @param {number} numColors   - 色の種類数
   * @param {number} extraTubes  - 追加する空チューブ数
   */
  function init(numColors, extraTubes) {
    _numColors   = numColors;
    _selectedIdx = -1;
    _moves       = 0;
    _isWon       = false;
    _initTubes(numColors, extraTubes);
  }

  /**
   * チューブを選択 / 注ぐ操作を行う
   * @param {number} idx - 操作対象チューブのインデックス
   * @returns {{ action: string, from: number, to: number, count: number, color: number }}
   *   action: 'select' | 'deselect' | 'pour' | 'invalid' | 'won'
   */
  function selectTube(idx) {
    // 未選択状態
    if (_selectedIdx === -1) {
      if (_tubes[idx].length === 0) {
        return { action: 'invalid', from: idx, to: -1, count: 0, color: -1 };
      }
      _selectedIdx = idx;
      return { action: 'select', from: idx, to: -1, count: 0, color: _tubes[idx][_tubes[idx].length - 1] };
    }

    // 同じチューブを再タップ → 選択解除
    if (_selectedIdx === idx) {
      _selectedIdx = -1;
      return { action: 'deselect', from: idx, to: -1, count: 0, color: -1 };
    }

    const fromIdx = _selectedIdx;
    const toIdx   = idx;

    // 注げない場合
    if (!_canPour(fromIdx, toIdx)) {
      _selectedIdx = -1;
      return { action: 'invalid', from: fromIdx, to: toIdx, count: 0, color: -1 };
    }

    // 注ぐ処理
    const pourColor = _tubes[fromIdx][_tubes[fromIdx].length - 1];
    const runLen    = _topRunLength(fromIdx);
    const space     = TUBE_CAPACITY - _tubes[toIdx].length;
    const count     = Math.min(runLen, space);

    for (let i = 0; i < count; i++) {
      _tubes[toIdx].push(_tubes[fromIdx].pop());
    }

    _moves++;
    _selectedIdx = -1;

    // 勝利判定
    if (_checkWin()) {
      _isWon = true;
      return { action: 'won', from: fromIdx, to: toIdx, count, color: pourColor };
    }

    return { action: 'pour', from: fromIdx, to: toIdx, count, color: pourColor };
  }

  /**
   * 注げるセグメント数を返す（アニメーション用）
   */
  function getPourCount(fromIdx) {
    if (_tubes[fromIdx].length === 0) return 0;
    return _topRunLength(fromIdx);
  }

  /** 注げるか判定（View からのハイライト用） */
  function canPour(fromIdx, toIdx) {
    return _canPour(fromIdx, toIdx);
  }

  // ---- ゲッター ----
  function getTubes()       { return _tubes.map(t => [...t]); } // ディープコピー
  function getNumTubes()    { return _tubes.length; }
  function getNumColors()   { return _numColors; }
  function getSelectedIdx() { return _selectedIdx; }
  function getMoves()       { return _moves; }
  function isWon()          { return _isWon; }
  function getScore()       { return Math.max(0, BASE_SCORE - _moves * SCORE_PER_MOVE); }

  return {
    init,
    selectTube,
    getPourCount,
    canPour,
    getTubes,
    getNumTubes,
    getNumColors,
    getSelectedIdx,
    getMoves,
    isWon,
    getScore,
  };

})();
