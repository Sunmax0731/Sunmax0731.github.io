(function () {
  let selectedDim = "2d";
  let selectedSize = "medium";
  let selectedSpeed = "normal";
  let selectedPattern = "random";
  let controller = null;
  let canvas = document.getElementById("game-canvas");

  function initToggle(selector, onChange) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        onChange(btn.dataset);
      });
    });
  }

  function updateSizeDesc() {
    document.getElementById("size-desc").textContent = SIZE_DESCS[selectedDim][selectedSize];
  }

  function updatePatternLabels() {
    const labels = PATTERN_LABELS[selectedDim];
    document.querySelectorAll(".pattern-btn").forEach((btn, index) => {
      if (labels[index] !== undefined) btn.textContent = labels[index];
    });
  }

  initToggle(".dim-btn", (data) => {
    selectedDim = data.dim;
    updateSizeDesc();
    updatePatternLabels();
  });
  initToggle(".size-btn", (data) => {
    selectedSize = data.size;
    updateSizeDesc();
  });
  initToggle(".speed-btn", (data) => {
    selectedSpeed = data.speed;
  });
  initToggle(".pattern-btn", (data) => {
    selectedPattern = data.pattern;
  });

  const settingsScreen = document.getElementById("settings-screen");
  const gameScreen = document.getElementById("game-screen");

  function resetCanvas() {
    const parent = canvas.parentNode;
    const fresh = document.createElement("canvas");
    fresh.id = "game-canvas";
    parent.replaceChild(fresh, canvas);
    canvas = fresh;
  }

  function showSettings() {
    if (controller) {
      controller.destroy();
      controller = null;
    }
    gameScreen.style.display = "none";
    settingsScreen.style.display = "flex";
  }

  function showGame() {
    settingsScreen.style.display = "none";
    gameScreen.style.display = "block";
    resetCanvas();

    const is3D = selectedDim === "3d";
    const sizeConf = is3D ? GRID_SIZES_3D[selectedSize] : GRID_SIZES[selectedSize];
    const model = is3D
      ? new LifeModel3D(sizeConf.cols, sizeConf.rows, sizeConf.layers)
      : new LifeModel(sizeConf.cols, sizeConf.rows, 0);
    const view = is3D ? new LifeView3D(canvas, model) : new LifeView(canvas, model);

    if (is3D) {
      switch (selectedPattern) {
        case "random":
          model.randomize(0.2);
          break;
        case "glider":
          model.randomizeCenter(0.35);
          break;
        default:
          model.clear();
          break;
      }
    } else {
      switch (selectedPattern) {
        case "random":
          model.randomize(0.3);
          break;
        case "glider":
          model.applyPattern(buildGliderPattern(sizeConf.cols, sizeConf.rows));
          break;
        default:
          model.clear();
          break;
      }
    }

    const intervalMs = SPEEDS[selectedSpeed];
    controller = is3D
      ? new LifeController3D(model, view, intervalMs)
      : new LifeController(model, view, intervalMs);

    if (is3D) {
      view.markDirty();
    } else {
      view.render();
    }
    view.updateHUD(model.generation, model.population);

    if (selectedPattern !== "blank") controller.play();
  }

  document.getElementById("start-btn").addEventListener("click", showGame);
  document.getElementById("back-btn").addEventListener("click", showSettings);

  updateSizeDesc();
  updatePatternLabels();
  showSettings();
})();
