// ============================================================
// SameGame 3D - constants.js
// 役割: アプリ全体で共有する定数
// ============================================================

// ---- ブロックカラー ----
const BLOCK_COLORS_HEX = [
  0xe74c3c, // 赤
  0x3498db, // 青
  0x2ecc71, // 緑
  0xf39c12, // オレンジ
  0x9b59b6, // 紫
  0x1abc9c, // ターコイズ
  0xe91e63, // ピンク
  0xf1c40f, // 黄
  0x7f8c8d, // グレー
  0xff6b35, // 朱色
];

const BLOCK_COLORS_CSS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e91e63',
  '#f1c40f',
  '#7f8c8d',
  '#ff6b35',
];

// ---- ブロック形状（Three.js レンダラー用） ----
const BLOCK_SIZE    = 1.0;
const BLOCK_DEPTH   = 1.0;
const BLOCK_GAP     = 0.10;
const BLOCK_SPACING = BLOCK_SIZE + BLOCK_GAP;

// ---- アニメーション ----
const REMOVE_DURATION = 260; // ms: 消去フェーズ
const FALL_DURATION   = 380; // ms: 落下フェーズ
