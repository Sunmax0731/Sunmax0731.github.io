// ============================================================
// RunnerGame - constants.js
// 役割: アプリ全体で共有する定数
// ============================================================

const WORLD_WIDTH = 360;
const WORLD_HEIGHT = 640;

const PLAYER_START_X = WORLD_WIDTH / 2;
const PLAYER_START_Y = WORLD_HEIGHT * 0.72;
const PLAYER_LATERAL_SPEED = 200;
const CROWD_UNIT_RADIUS = 9;
const CROWD_SPACING = 24;
const MAX_CROWD = 30;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 50;

const GATE_WIDTH = 100;
const GATE_HEIGHT = 56;
const GATE_GAP = 20;

const OBSTACLE_WIDTH = 60;
const OBSTACLE_HEIGHT = 50;

const COIN_RADIUS = 10;

const DIFFICULTY_SETTINGS = {
  easy: {
    label: 'やさしい',
    goalDistance: 2000,
    baseSpeed: 140,
    gateInterval: 500,
    obstacleInterval: 600,
    coinInterval: 300,
  },
  normal: {
    label: 'ふつう',
    goalDistance: 4000,
    baseSpeed: 180,
    gateInterval: 380,
    obstacleInterval: 420,
    coinInterval: 250,
  },
  hard: {
    label: 'むずかしい',
    goalDistance: 7000,
    baseSpeed: 240,
    gateInterval: 260,
    obstacleInterval: 280,
    coinInterval: 200,
  },
};

const COLOR_ROAD = '#2C2C2E';
const COLOR_ROADSIDE = '#1a3a1a';
const COLOR_LANE = '#555';
const COLOR_PLAYER = '#7C4DFF';
const COLOR_CROWD = '#B39DDB';
const COLOR_GATE_POS = '#2ecc71';
const COLOR_GATE_NEG = '#e74c3c';
const COLOR_GATE_MUL = '#3498db';
const COLOR_GATE_DIV = '#f39c12';
const COLOR_OBSTACLE = '#c0392b';
const COLOR_COIN = '#f1c40f';
const COLOR_GOAL = '#D0BCFF';

const SCORE_PER_PERSON = 100;
const SCORE_PER_COIN = 10;
