document.addEventListener("DOMContentLoaded", () => {
  const menus = Array.from(document.querySelectorAll(".nav-menu, .portfolio-menu"));
  if (menus.length === 0) return;

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
