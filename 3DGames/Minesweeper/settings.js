let _difficulty = "normal";
let _shapeType = "flat";

const _DIFF_DESCS = {
  flat: {
    easy: "9 x 9 マス、地雷 10 個",
    normal: "16 x 16 マス、地雷 40 個",
    hard: "30 x 16 マス、地雷 99 個",
  },
  cube: {
    easy: "立方体 6 面、地雷 20 個",
    normal: "立方体 6 面、地雷 46 個",
    hard: "立方体 6 面、地雷 97 個",
  },
  triangle: {
    easy: "三角柱マップ、地雷 50 個",
    normal: "三角柱マップ、地雷 80 個",
    hard: "三角柱マップ、地雷 115 個",
  },
  hex: {
    easy: "六角柱マップ、地雷 25 個",
    normal: "六角柱マップ、地雷 42 個",
    hard: "六角柱マップ、地雷 65 個",
  },
};

function updateDiffDesc() {
  const desc = (_DIFF_DESCS[_shapeType] || _DIFF_DESCS.flat)[_difficulty];
  document.getElementById("diff-desc").textContent = desc;
}

document.querySelectorAll(".mode-btn[data-diff]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn[data-diff]").forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    _difficulty = btn.dataset.diff;
    updateDiffDesc();
  });
});

document.querySelectorAll(".mode-btn[data-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn[data-mode]").forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    _shapeType = btn.dataset.mode;
    updateDiffDesc();
  });
});

document.getElementById("start-btn").addEventListener("click", () => {
  View.showGameScreen();
  Controller.startGame(_difficulty, _shapeType);
});

document.getElementById("restart-btn").addEventListener("click", () => {
  Controller.goToSettings();
});

document.getElementById("retry-btn").addEventListener("click", () => {
  Controller.retryGame();
});

document.getElementById("back-btn").addEventListener("click", () => {
  Controller.goToSettings();
});

updateDiffDesc();
