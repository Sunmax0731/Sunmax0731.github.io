(function () {
  let selectedDim = "3d";
  let selectedSize = "medium";

  function initToggle(selector, onChange) {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(selector).forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        onChange(btn.dataset);
      });
    });
  }

  function updateDesc() {
    document.getElementById("size-desc").textContent = GRID_LABELS[selectedDim][selectedSize];
  }

  function updateHowToPlay() {
    document.getElementById("how-to-play-3d").style.display = selectedDim === "3d" ? "" : "none";
    document.getElementById("how-to-play-2d").style.display = selectedDim === "2d" ? "" : "none";
  }

  initToggle(".dim-btn", (data) => {
    selectedDim = data.dim;
    updateDesc();
    updateHowToPlay();
  });

  initToggle(".size-btn", (data) => {
    selectedSize = data.size;
    updateDesc();
  });

  let controller = null;
  const settingsEl = document.getElementById("settings-screen");
  const gameEl = document.getElementById("game-screen");

  function showSettings() {
    if (controller) {
      controller.destroy();
      controller = null;
    }
    gameEl.style.display = "none";
    settingsEl.style.display = "flex";
  }

  function showGame() {
    settingsEl.style.display = "none";
    gameEl.style.display = "flex";

    const cfg = GRID_CONFIGS[selectedDim][selectedSize];
    const is3D = selectedDim === "3d";
    const hintsEl = document.querySelector(".hints");

    if (is3D) {
      hintsEl.innerHTML =
        '<span class="hint"><kbd>WASD</kbd> / 矢印キーで移動</span>' +
        '<span class="hint">ドラッグで回転 / スクロールでズーム</span>';
    } else {
      hintsEl.innerHTML = '<span class="hint"><kbd>WASD</kbd> / 矢印キーで移動</span>';
    }

    controller = new Controller({ size: cfg.size, depth: cfg.depth, is3D });
  }

  document.getElementById("start-btn").addEventListener("click", showGame);
  document.getElementById("back-btn").addEventListener("click", showSettings);

  updateDesc();
  updateHowToPlay();
  showSettings();
})();
