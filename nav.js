const docsRootUrl = document.currentScript?.src
  ? new URL(".", document.currentScript.src)
  : new URL("./", window.location.href);

document.addEventListener("DOMContentLoaded", () => {
  const menus = Array.from(document.querySelectorAll(".nav-menu, .portfolio-menu"));
  if (menus.length === 0) return;
  const fluidSimulationHref = new URL("fluid-simulation.html", docsRootUrl).href;
  const workDropdowns = Array.from(document.querySelectorAll(".nav-dropdown, .portfolio-dropdown")).filter((dropdown) => (
    dropdown.querySelector('a[href*="vehicle-physics"]') && dropdown.querySelector('a[href*="mathematics"]')
  ));

  for (const dropdown of workDropdowns) {
    if (dropdown.querySelector('a[href*="fluid-simulation/"]')) continue;

    const link = document.createElement("a");
    link.href = fluidSimulationHref;
    link.textContent = "流体シミュレーション";
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
