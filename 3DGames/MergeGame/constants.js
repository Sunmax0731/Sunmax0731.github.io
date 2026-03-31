// ============================================================
// MergeGame - constants.js
// 役割: アプリ全体で共有する定数
// ============================================================

// ---- グリッドサイズ設定 ----
const GRID_SIZES = {
  small:  4,
  medium: 5,
  large:  6,
};

// ---- アイテム定義 ----
const MAX_LEVEL = 10;

// 各レベルのエモジ表現
const ITEM_EMOJIS = ['🌱', '🌿', '🌲', '🏠', '🏰', '🚀', '⭐', '🌙', '☀️', '💎'];

// 各レベルのスコア値
const ITEM_VALUES = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

// 各レベルのカードカラー
const ITEM_COLORS = [
  '#2d5a27', // Lv1 深緑
  '#3a7a32', // Lv2
  '#4a9e3f', // Lv3
  '#c4842a', // Lv4 茶
  '#8b6914', // Lv5
  '#1565c0', // Lv6 青
  '#7b1fa2', // Lv7 紫
  '#37474f', // Lv8 ダーク
  '#e65100', // Lv9 オレンジ
  '#1a237e', // Lv10 深青（宝石）
];

// Lv10 作成時のボーナス点
const MAX_LEVEL_BONUS = 1000;

// ---- スポーン設定 ----
const SPAWN_INTERVAL = 3000;  // ms: 自動スポーン間隔

// ---- アニメーション設定 ----
const ANIM_MERGE_DURATION = 300;  // ms: マージアニメーション時間
const ANIM_SPAWN_DURATION = 250;  // ms: スポーンアニメーション時間
const ANIM_BONUS_DURATION = 500;  // ms: ボーナスアニメーション時間

// ---- 初期配置 ----
const INITIAL_FILL_RATIO = 0.4;   // グリッドの40%を初期配置
const INITIAL_MAX_LEVEL  = 2;     // 初期配置のアイテム最大レベル
