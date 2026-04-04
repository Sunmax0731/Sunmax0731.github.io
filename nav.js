const docsRootUrl = document.currentScript?.src
  ? new URL(".", document.currentScript.src)
  : new URL("./", window.location.href);

document.addEventListener("DOMContentLoaded", () => {
  const menus = Array.from(document.querySelectorAll(".nav-menu, .portfolio-menu"));
  if (menus.length === 0) return;

  const fluidSimulationHref = new URL("fluid-simulation.html", docsRootUrl).href;
  const faceTrackingHref = new URL("face-tracking/", docsRootUrl).href;
  const gungiHref = new URL("gungi/", docsRootUrl).href;

  const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown, .portfolio-dropdown"));
  const workDropdowns = dropdowns.filter((dropdown) => (
    dropdown.querySelector('a[href*="vehicle-physics"]')
      && dropdown.querySelector('a[href*="mathematics"]')
  ));
  const gameDropdowns = dropdowns.filter((dropdown) => (
    dropdown.querySelector('a[href*="2048"]')
      && dropdown.querySelector('a[href*="same-game-3d"]')
  ));

  for (const dropdown of workDropdowns) {
    if (!dropdown.querySelector('a[href*="fluid-simulation"]')) {
      const link = document.createElement("a");
      link.href = fluidSimulationHref;
      link.textContent = "流体シミュレーション";
      dropdown.appendChild(link);
    }

    if (!dropdown.querySelector('a[href*="face-tracking"]')) {
      const link = document.createElement("a");
      link.href = faceTrackingHref;
      link.textContent = "フェイストラッキング";
      dropdown.appendChild(link);
    }
  }

  for (const dropdown of gameDropdowns) {
    if (dropdown.querySelector('a[href*="gungi"]')) continue;

    const link = document.createElement("a");
    link.href = gungiHref;
    link.textContent = "軍議";
    dropdown.appendChild(link);
  }

  for (const menu of menus) {
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;

      for (const other of menus) {
        if (other !== menu) other.open = false;
      }
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (menus.some((menu) => menu.contains(target))) return;

    for (const menu of menus) {
      menu.open = false;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    for (const menu of menus) {
      menu.open = false;
    }
  });
});
