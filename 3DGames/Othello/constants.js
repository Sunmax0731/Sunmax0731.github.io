const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

const WEIGHTS = [
  [120, -20, 20, 5, 5, 20, -20, 120],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [120, -20, 20, 5, 5, 20, -20, 120],
];

const DIFFICULTY_LABELS = {
  easy: "やさしい",
  normal: "ふつう",
  hard: "むずかしい",
};

const CPU_THINK_MS = {
  easy: 400,
  normal: 600,
  hard: 900,
};

const FLIP_STAGGER_MS = 55;
const PLACE_ANIM_MS = 300;
const FLIP_HALF_MS = 145;
const SIZE3D = 4;

const DIRS_3D = (() => {
  const dirs = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx || dy || dz) dirs.push([dx, dy, dz]);
      }
    }
  }
  return dirs;
})();
