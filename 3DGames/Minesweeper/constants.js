// ============================================================
// Minesweeper - constants.js
// ============================================================

// ---- 2D 難易度 ----
const DIFFICULTIES = {
  easy:   { cols: 9,  rows: 9,  mines: 10 },
  normal: { cols: 16, rows: 16, mines: 40 },
  hard:   { cols: 30, rows: 16, mines: 99 },
};

// ---- 球体 難易度（キューブ球体: 6面 × N × N） ----
// rows = 6*N, cols = N として 2D グリッドにフラット化
const SPHERE_DIFFS = {
  easy:   { N: 5, mines: 20  },   // 6×25 = 150 セル
  normal: { N: 7, mines: 46  },   // 6×49 = 294 セル
  hard:   { N: 9, mines: 97  },   // 6×81 = 486 セル
};

// ---- 三角形球体 難易度（正二十面体 freq 分割: 20*freq² セル） ----
const TRIANGLE_DIFFS = {
  easy:   { freq: 4, mines:  50 },   // 20×16 = 320 セル
  normal: { freq: 5, mines:  80 },   // 20×25 = 500 セル
  hard:   { freq: 6, mines: 115 },   // 20×36 = 720 セル
};

// ---- 六角形球体 難易度（測地線双対: 10*freq²+2 セル） ----
const HEX_DIFFS = {
  easy:   { freq: 4, mines:  25 },   // 10×16+2 = 162 セル
  normal: { freq: 5, mines:  42 },   // 10×25+2 = 252 セル
  hard:   { freq: 6, mines:  65 },   // 10×36+2 = 362 セル
};

// ---- 2D セルサイズ ----
const CELL_SIZE  = 1.0;
const CELL_GAP   = 0.06;
const CELL_STEP  = CELL_SIZE + CELL_GAP;
const CELL_DEPTH = 0.28;

// ---- 球体パラメータ ----
const SPHERE_R     = 6.0;   // 球体半径（ワールド単位）
const SPHERE_DEPTH = 0.22;  // セルの厚さ

// ---- キューブ球体: 各面の基底ベクトル ----
// { c: 面中心方向, u: u軸, v: v軸 }
// 立方体の6面を球面に投影するための座標基底
const FACE_BASES = [
  { c: [ 0, 0, 1], u: [ 1, 0, 0], v: [ 0, 1, 0] },  // 0: +Z 前面
  { c: [ 0, 0,-1], u: [-1, 0, 0], v: [ 0, 1, 0] },  // 1: -Z 背面
  { c: [ 0, 1, 0], u: [ 1, 0, 0], v: [ 0, 0,-1] },  // 2: +Y 上面
  { c: [ 0,-1, 0], u: [ 1, 0, 0], v: [ 0, 0, 1] },  // 3: -Y 下面
  { c: [ 1, 0, 0], u: [ 0, 0,-1], v: [ 0, 1, 0] },  // 4: +X 右面
  { c: [-1, 0, 0], u: [ 0, 0, 1], v: [ 0, 1, 0] },  // 5: -X 左面
];

// ---- セルカラー ----
const COL_HIDDEN   = 0x4A4458;
const COL_REVEALED = 0x28263A;
const COL_MINE_HIT = 0xFF1744;
const COL_MINE_REV = 0x7B1C1C;

// ---- 数字カラー (CSS 文字列、index = 数字) ----
const NUM_COLORS_CSS = [
  '',
  '#42a5f5',  // 1 青
  '#66bb6a',  // 2 緑
  '#ef5350',  // 3 赤
  '#ce93d8',  // 4 紫
  '#ff7043',  // 5 橙
  '#4dd0e1',  // 6 シアン
  '#e0e0e0',  // 7 白
  '#9e9e9e',  // 8 グレー
];
