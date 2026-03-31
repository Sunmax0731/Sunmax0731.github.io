// ============================================================
// Block Breaker 2D - constants.js
// ============================================================

// ---- ワールド座標系 ----
// 中心が (0, 0)、x: -WORLD_W/2 〜 +WORLD_W/2、y: -WORLD_H/2 〜 +WORLD_H/2
const WORLD_W = 20;
const WORLD_H = 28;

// ---- 壁 ----
const WALL_T = 0.3; // 壁の厚さ（見た目用）

// ---- パドル ----
const PADDLE_W = 3.5;
const PADDLE_H = 0.4;
const PADDLE_Y = -WORLD_H / 2 + 1.2; // パドル中心 Y

// ---- ボール ----
const BALL_RADIUS = 0.25;

// ---- ブリック ----
const BRICK_COLS = 10;
const BRICK_ROWS = 6;
const BRICK_GAP  = 0.15;
const BRICK_W    = (WORLD_W - WALL_T * 2 - BRICK_GAP * (BRICK_COLS - 1)) / BRICK_COLS;
const BRICK_H    = 0.6;
const BRICKS_TOP_Y = WORLD_H / 2 - WALL_T - 2.5; // 最上段ブリック中心 Y

// ブリック左端 X（col=0 の中心 X）
const BRICKS_LEFT_X = -WORLD_W / 2 + WALL_T + BRICK_W / 2;

// ---- ブリックカラー（行ごと）----
const BRICK_COLOR_HEX = [
  0xef5350, // 0: 赤   7pt
  0xff7043, // 1: 橙   5pt
  0xffca28, // 2: 黄   4pt
  0x66bb6a, // 3: 緑   3pt
  0x42a5f5, // 4: 青   2pt
  0xab47bc, // 5: 紫   1pt
];
const BRICK_COLOR_CSS = ['#ef5350','#ff7043','#ffca28','#66bb6a','#42a5f5','#ab47bc'];
const BRICK_POINTS    = [7, 5, 4, 3, 2, 1];

// 難易度別ブリック耐久値（行ごと）
const BRICK_HEALTH = {
  easy:   [1, 1, 1, 1, 1, 1],
  normal: [2, 2, 1, 1, 1, 1],
  hard:   [3, 2, 2, 1, 1, 1],
};

// ---- 難易度別パラメータ ----
const DIFFICULTY = {
  easy:   { ballSpeed: 11, lives: 5 },
  normal: { ballSpeed: 15, lives: 3 },
  hard:   { ballSpeed: 19, lives: 3 },
};

// ---- オブジェクト奥行き ----
const BRICK_DEPTH  = BRICK_W; // 横幅と同じ長さ
const PADDLE_DEPTH = 0.5;
const WALL_DEPTH   = 0.5;

// ---- 3D モード ----
const WORLD_Z        = 14;   // 3Dモード時の奥行き範囲（ワールド単位）
const BRICK_LAYER_GAP = 0.15; // 奥行き方向ブリック間隔

// ---- アニメーション ----
const BRICK_DIE_DURATION = 180; // ms

// ---- パワーアップアイテム ----
const ITEM_FALL_SPEED = 5;      // 落下速度（units/sec）
const ITEM_W          = 1.1;
const ITEM_H          = 0.5;
const ITEM_DROP_CHANCE = 0.25;  // ブリック破壊時の出現確率

const POWER_UP_TYPES = [
  'multiBall', 'widePaddle', 'speedUp', 'speedDown',
  'pierce', 'catch', 'extraLife', 'narrowPaddle', 'darkness',
];

const POWER_UP_WIDE_PADDLE_DURATION   = 10; // 秒
const POWER_UP_NARROW_PADDLE_DURATION =  8; // 秒
const POWER_UP_PIERCE_DURATION        =  8; // 秒
const POWER_UP_CATCH_DURATION         = 12; // 秒
const POWER_UP_DARKNESS_DURATION      =  8; // 秒

const POWER_UP_SPEED_FACTOR = 1.3;        // 加速倍率
const POWER_UP_SLOW_FACTOR  = 0.75;       // 減速倍率
const POWER_UP_MIN_SPEED    = 6;
const POWER_UP_MAX_SPEED    = 32;

const POWER_UP_COLORS = {
  multiBall:   0x00BCD4, // シアン
  widePaddle:  0x4CAF50, // グリーン
  speedUp:     0xFF5722, // オレンジ
  speedDown:   0x673AB7, // パープル
  pierce:      0xFF9800, // アンバー
  catch:       0x00E5FF, // ライトシアン
  extraLife:   0xFF4081, // ピンク
  narrowPaddle:0xF44336, // 赤
  darkness:    0x78909C, // ブルーグレー
};

const POWER_UP_LABELS = {
  multiBall:   '2× BALL',
  widePaddle:  'WIDE',
  speedUp:     'FAST',
  speedDown:   'SLOW',
  pierce:      'PIERCE',
  catch:       'CATCH',
  extraLife:   '+1 UP',
  narrowPaddle:'NARROW',
  darkness:    'DARK',
};
