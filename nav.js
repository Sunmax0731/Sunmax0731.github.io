const docsRootUrl = document.currentScript?.src
  ? new URL(".", document.currentScript.src)
  : new URL("./", window.location.href);

const gameNavItems = [
  { label: "ゲーム一覧", href: "games.html" },
  { label: "軍儀", href: "gungi/", prefixMatch: true },
  { label: "2048", href: "2048.html" },
  { label: "Breakout", href: "breakout-2d.html" },
  { label: "Life Game", href: "life-game.html" },
  { label: "Merge Game", href: "merge-game.html" },
  { label: "Minesweeper", href: "mine-sweeper.html" },
  { label: "Othello", href: "othello.html" },
  { label: "Crowd Runner", href: "crowd-runner.html" },
  { label: "SameGame 3D", href: "same-game-3d.html" },
  { label: "Color Sort", href: "color-sort.html" },
];

const siteNavItems = [
  { type: "link", label: "トップ", href: "./" },
  { type: "menu", label: "ゲーム", items: gameNavItems },
  {
    type: "menu",
    label: "ラボ",
    items: [
      { label: "車両の物理シミュ", href: "vehicle-physics.html" },
      { label: "数学の可視化", href: "mathematics.html" },
      { label: "流体シミュレーション", href: "fluid-simulation.html" },
      { label: "フェイストラッキング", href: "face-tracking/", prefixMatch: true },
      { label: "I2I Forge", href: "i2i-lab/", prefixMatch: true },
      { label: "3Dテクスチャレビューア", href: "mobile-3d-texture-reviewer/", prefixMatch: true },
    ],
  },
  { type: "link", label: "バイク図鑑", href: "moto-catalog/", prefixMatch: true },
  { type: "link", label: "ブログ", href: "blog/", prefixMatch: true },
  { type: "link", label: "問い合わせ", href: "contact.html" },
];

const portfolioNavItems = [
  { type: "link", label: "トップ", href: "./" },
  { type: "menu", label: "ゲーム", items: gameNavItems },
  {
    type: "menu",
    label: "ラボ",
    items: [
      { label: "車両の物理シミュ", href: "vehicle-physics.html" },
      { label: "数学の可視化", href: "mathematics.html" },
      { label: "流体シミュレーション", href: "fluid-simulation.html" },
      { label: "フェイストラッキング", href: "face-tracking/", prefixMatch: true },
      { label: "I2I Forge", href: "i2i-lab/", prefixMatch: true },
      { label: "3Dテクスチャレビューア", href: "mobile-3d-texture-reviewer/", prefixMatch: true },
    ],
  },
  { type: "link", label: "バイク図鑑", href: "moto-catalog/", prefixMatch: true },
  { type: "link", label: "ブログ", href: "blog/", prefixMatch: true },
  { type: "link", label: "問い合わせ", href: "contact.html" },
];

function toAbsoluteHref(relativeHref) {
  return new URL(relativeHref, docsRootUrl).href;
}

function normalizePath(url) {
  const pathname = new URL(url, docsRootUrl).pathname;
  if (pathname.endsWith("/index.html")) {
    return pathname.slice(0, -"index.html".length);
  }
  return pathname;
}

const currentPath = normalizePath(window.location.href);

function isItemActive(item) {
  const targetPath = normalizePath(item.href);
  if (currentPath === targetPath) return true;
  if (!item.prefixMatch) return false;
  return currentPath.startsWith(targetPath);
}

function createLink(item) {
  const link = document.createElement("a");
  link.href = toAbsoluteHref(item.href);
  link.textContent = item.label;

  if (isItemActive(item)) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }

  return link;
}

function createMenu(item, navKind) {
  const details = document.createElement("details");
  details.className = navKind === "portfolio" ? "portfolio-menu" : "nav-menu";

  const summary = document.createElement("summary");
  summary.textContent = item.label;
  details.appendChild(summary);

  const dropdown = document.createElement("div");
  dropdown.className = navKind === "portfolio" ? "portfolio-dropdown" : "nav-dropdown";

  let hasActiveItem = false;
  for (const childItem of item.items) {
    const link = createLink(childItem);
    if (link.classList.contains("active")) {
      hasActiveItem = true;
    }
    dropdown.appendChild(link);
  }

  if (hasActiveItem) {
    summary.classList.add("active");
    details.dataset.current = "true";
  }

  details.appendChild(dropdown);
  return details;
}

function renderNav(nav, items, navKind) {
  const fragment = document.createDocumentFragment();

  for (const item of items) {
    if (item.type === "menu") {
      fragment.appendChild(createMenu(item, navKind));
      continue;
    }

    fragment.appendChild(createLink(item));
  }

  nav.replaceChildren(fragment);
}

document.addEventListener("DOMContentLoaded", () => {
  const navs = Array.from(document.querySelectorAll(".site-nav, .portfolio-nav"));
  if (navs.length === 0) return;

  for (const nav of navs) {
    if (nav.classList.contains("portfolio-nav")) {
      renderNav(nav, portfolioNavItems, "portfolio");
      continue;
    }

    renderNav(nav, siteNavItems, "site");
  }

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

  for (const link of document.querySelectorAll(".nav-dropdown a, .portfolio-dropdown a")) {
    link.addEventListener("click", () => {
      for (const menu of menus) {
        menu.open = false;
      }
    });
  }
});
