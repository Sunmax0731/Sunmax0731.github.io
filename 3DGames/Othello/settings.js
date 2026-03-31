(function () {
  "use strict";

  let selectedDifficulty = "easy";
  let selectedMode = "2d";
  let controller = null;

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("hidden", screen.id !== id);
    });
  }

  function showSettings() {
    if (controller) {
      controller.destroy();
      controller = null;
    }
    showScreen("screen-settings");
  }

  document.querySelectorAll(".mode-btn[data-diff]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn[data-diff]").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      selectedDifficulty = btn.dataset.diff;
    });
  });

  document.querySelectorAll(".mode-btn[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn[data-mode]").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      selectedMode = btn.dataset.mode;
    });
  });

  function showCoinToss() {
    const coinEl = document.getElementById("coin");
    const resultEl = document.getElementById("coin-result");
    coinEl.style.animation = "none";
    coinEl.style.transform = "rotateY(0deg) translateY(0px)";
    resultEl.classList.remove("show");
    resultEl.innerHTML = "";
    showScreen("screen-coin");
    setTimeout(startCoinAnimation, 400);
  }

  function startCoinAnimation() {
    const isHeads = Math.random() < 0.5;
    const coinEl = document.getElementById("coin");
    const resultEl = document.getElementById("coin-result");
    const finalDeg = isHeads ? 1440 : 1620;

    injectCoinKeyframes(finalDeg);
    void coinEl.offsetWidth;
    coinEl.style.animation = "coinToss 2.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards";

    setTimeout(() => {
      resultEl.innerHTML = isHeads
        ? '<span class="coin-result-big heads">表</span><span class="coin-result-sub">あなたが先手です</span>'
        : '<span class="coin-result-big tails">裏</span><span class="coin-result-sub">あなたが後手です</span>';
      resultEl.classList.add("show");
    }, 2900);

    const playerColor = isHeads ? 1 : -1;
    setTimeout(() => launchGame(playerColor), 5000);
  }

  function injectCoinKeyframes(finalDeg) {
    const id = "coin-keyframe-style";
    const old = document.getElementById(id);
    if (old) old.remove();

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes coinToss {
        0%   { transform: rotateY(0deg) translateY(0px); }
        18%  { transform: rotateY(${finalDeg * 0.28}deg) translateY(-200px); }
        50%  { transform: rotateY(${finalDeg * 0.65}deg) translateY(-160px); }
        78%  { transform: rotateY(${finalDeg - 50}deg) translateY(-18px); }
        88%  { transform: rotateY(${finalDeg + 18}deg) translateY(-6px); }
        94%  { transform: rotateY(${finalDeg - 8}deg) translateY(0px); }
        100% { transform: rotateY(${finalDeg}deg) translateY(0px); }
      }
    `;
    document.head.appendChild(style);
  }

  function launchGame(playerColor) {
    if (controller) {
      controller.destroy();
      controller = null;
    }

    let model;
    let view;
    if (selectedMode === "3d") {
      model = new OthelloModel3D(selectedDifficulty, playerColor);
      view = new OthelloView3D(model);
      controller = new OthelloController3D(model, view);
    } else {
      model = new OthelloModel(selectedDifficulty, playerColor);
      view = new OthelloViewFlat3D(model);
      controller = new OthelloController(model, view);
    }

    const badge = document.getElementById("diff-badge");
    badge.textContent = DIFFICULTY_LABELS[selectedDifficulty];
    badge.className = `diff-badge ${selectedDifficulty}`;

    showScreen("screen-game");
    controller.start();
  }

  document.getElementById("start-btn").addEventListener("click", showCoinToss);
  document.getElementById("btn-back").addEventListener("click", showSettings);
  document.getElementById("btn-replay").addEventListener("click", showCoinToss);

  showSettings();
})();
