const GRID_SIZES = {
  small: { cols: 60, rows: 40 },
  medium: { cols: 100, rows: 70 },
  large: { cols: 150, rows: 100 },
};

const GRID_SIZES_3D = {
  small: { cols: 20, rows: 20, layers: 20 },
  medium: { cols: 28, rows: 28, layers: 28 },
  large: { cols: 36, rows: 36, layers: 36 },
};

const SPEEDS = {
  slow: 500,
  normal: 120,
  fast: 30,
  turbo: 8,
};

const CELL_SIZE = 1.0;
const CELL_GAP = 0.08;

const GLIDER_PATTERN = [
  [1, 0],
  [2, 1],
  [0, 2], [1, 2], [2, 2],
];

function buildGliderPattern(cols, rows) {
  const cells = [];
  const positions = [
    { ox: 2, oy: 2 },
    { ox: 20, oy: 5 },
    { ox: 5, oy: 20 },
    { ox: 30, oy: 15 },
    { ox: 10, oy: 35 },
  ];
  for (const { ox, oy } of positions) {
    for (const [dx, dy] of GLIDER_PATTERN) {
      const x = ox + dx;
      const y = oy + dy;
      if (x >= 0 && x < cols && y >= 0 && y < rows) cells.push({ x, y });
    }
  }
  return cells;
}

const SIZE_DESCS = {
  "2d": {
    small: "60 x 40 マス",
    medium: "100 x 70 マス",
    large: "150 x 100 マス",
  },
  "3d": {
    small: "約 1,800 セル",
    medium: "約 4,900 セル",
    large: "約 10,300 セル",
  },
};

const PATTERN_LABELS = {
  "2d": ["ランダム", "グライダー", "空白"],
  "3d": ["ランダム", "中央配置", "空白"],
};
