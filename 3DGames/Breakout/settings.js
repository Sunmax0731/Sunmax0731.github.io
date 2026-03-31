let _difficulty = "normal";
let _is3DMode = false;
let _numLayers = 2;

const _DIFF_DESC = {
  easy: "ボール速度は控えめ、ブロックは1層です。",
  normal: "標準設定です。ブロックは2層です。",
  hard: "ボール速度が速く、ブロックは3層です。",
};

document.querySelectorAll(".mode-btn[data-diff]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn[data-diff]").forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    _difficulty = btn.dataset.diff;
    document.getElementById("diff-desc").textContent = _DIFF_DESC[_difficulty];
  });
});

document.querySelectorAll(".mode-btn[data-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn[data-mode]").forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    _is3DMode = btn.dataset.mode === "3d";
    document.getElementById("layer-group").style.display = _is3DMode ? "block" : "none";
  });
});

const layerSlider = document.getElementById("layer-count");
const layerLabel = document.getElementById("layer-label");
layerSlider.addEventListener("input", () => {
  _numLayers = parseInt(layerSlider.value, 10);
  layerLabel.textContent = `${_numLayers}`;
});

document.getElementById("start-btn").addEventListener("click", () => {
  View.showGameScreen();
  Controller.startGame(_difficulty, _is3DMode, _numLayers);
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

document.getElementById("diff-desc").textContent = _DIFF_DESC[_difficulty];
