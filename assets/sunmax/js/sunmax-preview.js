(() => {
  const assetRoot = document.body.dataset.assetRoot || "";
  const areas = ["top", "portfolio", "contact"];
  const backgroundByArea = {
    top: ".background-harbor",
    portfolio: ".background-sea",
    contact: ".background-river",
  };

  const profileItems = [
    {
      id: "skills",
      title: "スキル",
      label: "スキル",
      icon: "Skill",
      creature: "ray",
      size: 190,
      x: 58,
      y: 48,
      colors: ["#9fd8e3", "#4f7782"],
      description:
        "Unity、C#、Blender、Python、C、C++、HTML、CSS、JavaScript、TypeScriptを中心に、3D表現、シミュレーション、ブラウザで動く制作物の実装に取り組んでいます。",
    },
    {
      id: "tools",
      title: "使用ツール",
      label: "使用ツール",
      icon: "Tool",
      creature: "jelly",
      size: 128,
      x: 38,
      y: 58,
      colors: ["#b9e7d4", "#6fae9b"],
      description:
        "Codex、Tripo3D、Unity、Blender、GitHub、各種ブラウザ開発ツールを、設計、実装、検証、3Dアセット制作の補助に活用しています。",
    },
    {
      id: "hobbies",
      title: "趣味",
      label: "趣味",
      icon: "Hobby",
      creature: "fish",
      size: 154,
      x: 50,
      y: 76,
      colors: ["#f0d492", "#7b8d64"],
      description:
        "バイク、カメラ、読書、ゲーム、技術学習が趣味です。バイク図鑑のように、趣味とWeb実装をつなげた制作物も残しています。",
    },
  ];

  const projects = [
    {
      id: "gungi",
      title: "軍儀",
      category: "Unity",
      creature: "whale",
      size: 250,
      x: 9,
      y: 9,
      colors: ["#8ba9c2", "#274357"],
      year: "2026",
      tech: "Browser Game / 3D Board / CPU",
      href: `${assetRoot}gungi/`,
      description:
        "9x9盤、手駒配置、ツケの3D表現、CPU対戦まで含むブラウザ版ゲームです。",
    },
    {
      id: "moto-catalog",
      title: "バイク図鑑",
      category: "Web",
      creature: "turtle",
      size: 205,
      x: 24,
      y: 56,
      colors: ["#b9c984", "#557a5c"],
      year: "2026",
      tech: "React / Catalog UI / Data",
      href: `${assetRoot}moto-catalog/`,
      description:
        "バイクのスペックやタグをもとに探せる図鑑アプリです。趣味とデータUIを組み合わせた制作物です。",
    },
    {
      id: "texture-reviewer",
      title: "モバイル3Dテクスチャレビューア",
      category: "3D",
      creature: "ray",
      size: 190,
      x: 64,
      y: 20,
      colors: ["#9bcde0", "#3e6075"],
      year: "2026",
      tech: "Three.js / Web 3D / Review Tool",
      href: "https://sunmax0731.github.io/mobile-3d-texture-reviewer/",
      description:
        "ブラウザ上で3Dモデルとテクスチャの見え方を確認できるレビュー用ツールです。",
    },
    {
      id: "thumbnail-generator",
      title: "サムネイル作成ツール",
      category: "Tool",
      creature: "shark",
      size: 180,
      x: 56,
      y: 61,
      colors: ["#93b3be", "#2d5260"],
      year: "2026",
      tech: "Canvas / Editor UI / Animation",
      href: "https://sunmax0731.github.io/thumbnail-generator/",
      description:
        "動画サムネ、待機画面、スケジュール画像をブラウザ上で作成するWebツールです。",
    },
    {
      id: "image-mosaic",
      title: "モザイク加工ツール",
      category: "UI/UX",
      creature: "jelly",
      size: 126,
      x: 35,
      y: 32,
      colors: ["#f2bad0", "#9272b8"],
      year: "2026",
      tech: "Image Processing / Preset UI",
      href: "https://sunmax0731.github.io/image-mosaic-effect/",
      description:
        "画像にモザイク加工を適用するブラウザツールです。プリセット選択と確認のしやすさを重視しています。",
    },
  ];

  const contacts = [
    {
      id: "email",
      title: "Email",
      note: "仕事のご依頼、ご相談はこちらから。",
      logo: "mail",
      href: "mailto:gkk.jhon@gmail.com",
      x: 8,
      y: 19,
    },
    {
      id: "github",
      title: "GitHub",
      note: "ソースコードと制作物の置き場です。",
      logo: "github",
      href: "https://github.com/Sunmax0731",
      x: 37,
      y: 30,
    },
    {
      id: "x",
      title: "X (旧Twitter)",
      note: "短い近況や制作メモを投稿しています。",
      logo: "x",
      href: "https://x.com/Sunmax0731",
      x: 32,
      y: 17,
    },
    {
      id: "zenn",
      title: "Zenn",
      note: "学習記録や技術メモをまとめています。",
      logo: "zenn",
      href: "https://zenn.dev/sunmax",
      x: 60,
      y: 22,
    },
    {
      id: "booth",
      title: "BOOTH",
      note: "公開・販売中の制作物へのリンクです。",
      logo: "booth",
      href: "https://sunmax.booth.pm/",
      x: 15,
      y: 49,
    },
    {
      id: "form",
      title: "お問い合わせフォーム",
      note: "フォーム相当の連絡先としてメールを起動します。",
      logo: "form",
      href: "mailto:gkk.jhon@gmail.com?subject=SunmaxEngineering%20Contact",
      x: 68,
      y: 58,
    },
    {
      id: "note",
      title: "note",
      note: "今後追加する外部リンク候補です。",
      logo: "note",
      href: "",
      x: 57,
      y: 18,
    },
  ];

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "textarea",
    "input",
    "select",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const modalLayer = document.querySelector("[data-modal-layer]");
  const modalPanel = document.querySelector(".modal-panel");
  const modalKicker = document.querySelector("[data-modal-kicker]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalBody = document.querySelector("[data-modal-body]");
  let previousFocus = null;
  let currentArea = "top";
  let wheelLocked = false;
  let touchStartY = null;
  let touchStartTarget = null;
  let backgroundTimer = null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function serviceLogo(type) {
    const common = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
    const label = {
      mail: '<path d="M4 6h16v12H4z" fill="none"/><path d="M5 7l7 6 7-6M5 17h14V8H5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      github: '<path d="M12 3.2a8.7 8.7 0 0 0-2.8 17c.4.1.6-.2.6-.5v-1.7c-2.4.5-2.9-1-2.9-1-.4-.9-.9-1.2-.9-1.2-.7-.5 0-.5 0-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.6.7.1-.5.3-.9.5-1.1-1.9-.2-3.9-.9-3.9-4.2 0-.9.3-1.7.8-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.3.9.7-.2 1.4-.3 2.1-.3s1.5.1 2.1.3c1.6-1.1 2.3-.9 2.3-.9.5 1.2.2 2.1.1 2.3.5.6.8 1.4.8 2.3 0 3.3-2 4-3.9 4.2.3.3.6.8.6 1.6v2.4c0 .3.2.6.6.5A8.7 8.7 0 0 0 12 3.2z" fill="currentColor"/>',
      x: '<path d="M5 4h4.2l3.4 4.8L16.8 4H20l-5.8 6.7L20.5 20h-4.2l-3.8-5.5L7.7 20H4.5l6.3-7.3z" fill="currentColor"/>',
      zenn: '<path d="M5 6h13l-8.2 12H18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
      booth: '<path d="M6 4h8a4.4 4.4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
      form: '<path d="M6 4h10l2 2v14H6zM9 9h6M9 13h6M9 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      note: '<path d="M7 5h10v14H7zM10 9h4M10 13h4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    }[type] || '<circle cx="12" cy="12" r="6" fill="currentColor"/>';
    return `<span class="item-icon service-logo"><svg ${common}>${label}</svg></span>`;
  }

  function goToHref(href) {
    if (!href) return;
    if (href.startsWith("mailto:") || href.startsWith(`${assetRoot}`) || href.startsWith("/") || href.startsWith("#")) {
      window.location.href = href;
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function openModal(copy) {
    if (!copy || !modalLayer || !modalPanel) return;

    previousFocus = document.activeElement;
    modalKicker.textContent = copy.kicker || "";
    modalTitle.textContent = copy.title || "";
    modalBody.innerHTML = copy.html || "";
    modalLayer.hidden = false;
    document.body.classList.add("modal-open");
    modalPanel.focus();
  }

  function closeModal() {
    if (!modalLayer) return;
    modalLayer.hidden = true;
    document.body.classList.remove("modal-open");
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || modalLayer.hidden) return;
    const focusable = Array.from(modalPanel.querySelectorAll(focusableSelector));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function layerForArea(area) {
    return document.querySelector(backgroundByArea[area]);
  }

  function clearBackgroundClasses(layer) {
    layer?.classList.remove(
      "is-active",
      "is-leaving",
      "enter-from-top",
      "enter-from-bottom",
      "exit-to-top",
      "exit-to-bottom",
    );
  }

  function inferDirection(previousArea, nextArea) {
    if (previousArea === nextArea) return "down";
    if (previousArea === "top" && nextArea === "contact") return "up";
    if (previousArea === "portfolio" && nextArea === "top") return "up";
    return "down";
  }

  function transitionBackground(previousArea, nextArea, direction, skipAnimation = false) {
    const previousLayer = layerForArea(previousArea);
    const nextLayer = layerForArea(nextArea);
    window.clearTimeout(backgroundTimer);

    if (skipAnimation || previousArea === nextArea || !previousLayer || !nextLayer) {
      document.querySelectorAll(".background-layer").forEach(clearBackgroundClasses);
      nextLayer?.classList.add("is-active");
      return;
    }

    document.querySelectorAll(".background-layer").forEach(clearBackgroundClasses);
    const enterClass = direction === "up" ? "enter-from-top" : "enter-from-bottom";
    const exitClass = direction === "up" ? "exit-to-bottom" : "exit-to-top";

    previousLayer.classList.add("is-active");
    nextLayer.classList.add(enterClass);

    requestAnimationFrame(() => {
      nextLayer.classList.add("is-active");
      nextLayer.classList.remove(enterClass);
      previousLayer.classList.remove("is-active");
      previousLayer.classList.add("is-leaving", exitClass);
    });

    backgroundTimer = window.setTimeout(() => {
      clearBackgroundClasses(previousLayer);
      nextLayer.classList.add("is-active");
    }, 760);
  }

  function setArea(area, options = {}) {
    const nextArea = areas.includes(area) ? area : "top";
    const previousArea = currentArea;
    const direction = options.direction || inferDirection(previousArea, nextArea);

    transitionBackground(previousArea, nextArea, direction, options.skipAnimation);
    currentArea = nextArea;
    document.body.classList.remove("area-top", "area-portfolio", "area-contact");
    document.body.classList.add(`area-${nextArea}`);
    document.body.dataset.currentArea = nextArea;
    document.body.dataset.scrollDirection = direction;

    document.querySelectorAll("[data-area-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.areaPanel !== nextArea;
    });

    document.querySelectorAll("[data-area-link]").forEach((link) => {
      const active = link.dataset.areaLink === nextArea;
      link.classList.toggle("is-active", active);
      if (link.closest(".sunmax-nav") || link.closest(".area-rail")) {
        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      }
    });

    hideProfileDetail();
    hideProject();
    hideContact();
    highlightProfiles("");
    highlightProjects("");

    if (!options.skipHash) {
      const nextHash = `#${nextArea}`;
      if (window.location.hash !== nextHash) {
        const method = options.replace ? "replaceState" : "pushState";
        history[method](null, "", nextHash);
      }
    }
  }

  function areaFromHash() {
    const hash = window.location.hash.replace("#", "");
    return areas.includes(hash) ? hash : "top";
  }

  function nextAreaByDirection(deltaY) {
    if (currentArea === "top") {
      return { area: deltaY > 0 ? "portfolio" : "contact", direction: deltaY > 0 ? "down" : "up" };
    }
    if (currentArea === "portfolio" && deltaY < 0) return { area: "top", direction: "up" };
    if (currentArea === "contact" && deltaY > 0) return { area: "top", direction: "down" };
    return { area: currentArea, direction: deltaY > 0 ? "down" : "up" };
  }

  function navigateByDirection(deltaY) {
    if (wheelLocked || Math.abs(deltaY) < 24) return;
    const next = nextAreaByDirection(deltaY);
    if (next.area === currentArea) return;
    wheelLocked = true;
    setArea(next.area, { direction: next.direction });
    window.setTimeout(() => {
      wheelLocked = false;
    }, 720);
  }

  function scrollablePanelFrom(target) {
    const panel = target?.closest?.(".menu-panel, .modal-panel");
    if (!panel || panel.scrollHeight <= panel.clientHeight + 1) return null;
    return panel;
  }

  function canPanelScroll(panel, deltaY) {
    if (!panel) return false;
    if (deltaY > 0) return panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1;
    if (deltaY < 0) return panel.scrollTop > 1;
    return false;
  }

  function closeMobileMenu() {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const menuPanel = document.querySelector("[data-menu-panel]");
    menuPanel?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }

  function setupHeader() {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const menuPanel = document.querySelector("[data-menu-panel]");

    menuToggle?.addEventListener("click", () => {
      const open = !menuPanel.classList.contains("is-open");
      menuPanel.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    document.querySelectorAll("[data-area-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        closeMobileMenu();
        const nextArea = link.dataset.areaLink;
        setArea(nextArea, { direction: inferDirection(currentArea, nextArea) });
      });
    });

    document.querySelectorAll("[data-modal-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modalLayer.hidden) closeModal();
      if (document.body.classList.contains("modal-open")) {
        trapFocus(event);
        return;
      }
      if (event.key === "ArrowDown" || event.key === "PageDown") navigateByDirection(80);
      if (event.key === "ArrowUp" || event.key === "PageUp") navigateByDirection(-80);
      trapFocus(event);
    });

    window.addEventListener("popstate", () => setArea(areaFromHash(), { skipHash: true, skipAnimation: true }));
  }

  function setupPanelToggles() {
    document.querySelectorAll(".menu-panel").forEach((panel) => {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "panel-toggle";
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "メニューを折りたたむ");
      toggle.textContent = "−";
      toggle.addEventListener("click", () => {
        const collapsed = !panel.classList.contains("is-collapsed");
        panel.classList.toggle("is-collapsed", collapsed);
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggle.setAttribute("aria-label", collapsed ? "メニューを展開する" : "メニューを折りたたむ");
        toggle.textContent = collapsed ? "+" : "−";
      });
      panel.appendChild(toggle);
    });
  }

  function showProfile(profile) {
    const detail = document.querySelector("[data-profile-detail]");
    const title = document.querySelector("[data-profile-title]");
    const text = document.querySelector("[data-profile-text]");
    if (!detail || !title || !text) return;
    title.textContent = profile.title;
    text.textContent = profile.description;
    detail.hidden = false;
    highlightProfiles(profile.id);
  }

  function hideProfileDetail() {
    const detail = document.querySelector("[data-profile-detail]");
    if (detail) detail.hidden = true;
    highlightProfiles("");
  }

  function highlightProfiles(match) {
    document.querySelectorAll(".profile-creature").forEach((creature) => {
      creature.classList.toggle("is-highlight", Boolean(match && creature.dataset.profileId === match));
    });
  }

  function renderProfiles() {
    const menu = document.querySelector("[data-profile-menu]");
    if (!menu) return;
    menu.innerHTML = "";

    profileItems.forEach((profile) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "menu-button has-icon";
      button.innerHTML = `<span class="item-icon">${escapeHtml(profile.icon)}</span><span><strong>${escapeHtml(profile.label)}</strong></span>`;
      button.addEventListener("mouseenter", () => showProfile(profile));
      button.addEventListener("focus", () => showProfile(profile));
      button.addEventListener("mouseleave", hideProfileDetail);
      button.addEventListener("blur", hideProfileDetail);
      button.addEventListener("click", () =>
        openModal({
          kicker: profile.title,
          title: profile.label,
          html: `<p>${escapeHtml(profile.description)}</p>`,
        }),
      );
      menu.appendChild(button);
    });
  }

  function renderProfileCreatures() {
    const field = document.querySelector("[data-profile-field]");
    if (!field) return;
    field.innerHTML = "";

    profileItems.forEach((profile, index) => {
      const creature = document.createElement("button");
      creature.type = "button";
      creature.className = `creature profile-creature ${profile.creature}`;
      creature.dataset.label = profile.title;
      creature.dataset.profileId = profile.id;
      creature.style.setProperty("--size", `${profile.size}px`);
      creature.style.setProperty("--creature-a", profile.colors[0]);
      creature.style.setProperty("--creature-b", profile.colors[1]);
      creature.style.setProperty("--swim-distance", `${18 + index * 3}px`);
      creature.style.setProperty("--swim-lift", `${10 + index * 2}px`);
      creature.style.left = `${profile.x}%`;
      creature.style.top = `${profile.y}%`;
      creature.style.animationDelay = `${index * -1.2}s`;
      creature.setAttribute("aria-label", `${profile.title}の詳細を表示`);
      creature.addEventListener("click", () =>
        openModal({
          kicker: profile.title,
          title: profile.label,
          html: `<p>${escapeHtml(profile.description)}</p>`,
        }),
      );
      creature.addEventListener("mouseenter", () => showProfile(profile));
      creature.addEventListener("focus", () => showProfile(profile));
      creature.addEventListener("mouseleave", hideProfileDetail);
      creature.addEventListener("blur", hideProfileDetail);
      field.appendChild(creature);
    });
  }

  function showProject(project) {
    const detail = document.querySelector("[data-project-detail]");
    const title = document.querySelector("[data-project-title]");
    const text = document.querySelector("[data-project-text]");
    if (!detail || !title || !text) return;
    title.textContent = project.title;
    text.textContent = project.description;
    detail.hidden = false;
    highlightProjects(project.id);
  }

  function hideProject() {
    const detail = document.querySelector("[data-project-detail]");
    if (detail) detail.hidden = true;
    highlightProjects("");
  }

  function highlightProjects(match) {
    document.querySelectorAll(".area-portfolio-panel .creature").forEach((creature) => {
      const matched = creature.dataset.projectId === match;
      creature.classList.toggle("is-highlight", Boolean(match && matched));
    });
  }

  function renderProjects() {
    const field = document.querySelector("[data-project-field]");
    const list = document.querySelector("[data-project-list]");
    if (!field || !list) return;
    field.innerHTML = "";
    list.innerHTML = "";

    projects.forEach((project, index) => {
      const creature = document.createElement("button");
      creature.type = "button";
      creature.className = `creature ${project.creature}`;
      creature.dataset.label = project.title;
      creature.dataset.projectId = project.id;
      creature.dataset.category = project.category;
      creature.style.setProperty("--size", `${project.size}px`);
      creature.style.setProperty("--creature-a", project.colors[0]);
      creature.style.setProperty("--creature-b", project.colors[1]);
      creature.style.setProperty("--swim-distance", `${22 + index * 4}px`);
      creature.style.setProperty("--swim-lift", `${12 + index * 2}px`);
      creature.style.left = `${project.x}%`;
      creature.style.top = `${project.y}%`;
      creature.style.animationDelay = `${index * -1.4}s`;
      creature.setAttribute("aria-label", `${project.title}を開く`);
      creature.addEventListener("click", () => goToHref(project.href));
      creature.addEventListener("mouseenter", () => showProject(project));
      creature.addEventListener("focus", () => showProject(project));
      creature.addEventListener("mouseleave", hideProject);
      creature.addEventListener("blur", hideProject);
      field.appendChild(creature);

      const item = document.createElement("button");
      item.type = "button";
      item.className = "project-item";
      item.innerHTML = `<strong>${escapeHtml(project.title)}</strong>`;
      item.addEventListener("click", () => goToHref(project.href));
      item.addEventListener("mouseenter", () => showProject(project));
      item.addEventListener("focus", () => showProject(project));
      item.addEventListener("mouseleave", hideProject);
      item.addEventListener("blur", hideProject);
      list.appendChild(item);
    });
  }

  function showContact(contact) {
    const detail = document.querySelector("[data-contact-detail]");
    const title = document.querySelector("[data-contact-title]");
    const text = document.querySelector("[data-contact-text]");
    if (!detail || !title || !text) return;
    title.textContent = contact.title;
    text.textContent = contact.note;
    detail.hidden = false;
    document.querySelectorAll(".contact-hotspot").forEach((hotspot) => {
      hotspot.classList.toggle("is-highlight", hotspot.dataset.contactId === contact.id);
    });
  }

  function hideContact() {
    const detail = document.querySelector("[data-contact-detail]");
    if (detail) detail.hidden = true;
    document.querySelectorAll(".contact-hotspot").forEach((hotspot) => hotspot.classList.remove("is-highlight"));
  }

  function renderContacts() {
    const hotspots = document.querySelector("[data-contact-hotspots]");
    const menu = document.querySelector("[data-contact-menu]");
    if (!hotspots || !menu) return;
    hotspots.innerHTML = "";
    menu.innerHTML = "";

    contacts.forEach((contact) => {
      const hotspot = document.createElement("button");
      hotspot.type = "button";
      hotspot.className = "contact-hotspot";
      hotspot.dataset.contactId = contact.id;
      hotspot.style.left = `${contact.x}%`;
      hotspot.style.top = `${contact.y}%`;
      hotspot.innerHTML = `<span class="hotspot-name">${escapeHtml(contact.title)}</span>`;
      hotspot.setAttribute("aria-label", contact.title);
      hotspot.addEventListener("mouseenter", () => showContact(contact));
      hotspot.addEventListener("focus", () => showContact(contact));
      hotspot.addEventListener("mouseleave", hideContact);
      hotspot.addEventListener("blur", hideContact);
      hotspot.addEventListener("click", () => goToHref(contact.href));
      hotspots.appendChild(hotspot);

      const item = document.createElement("button");
      item.type = "button";
      item.className = "contact-link-item has-icon";
      item.innerHTML = `${serviceLogo(contact.logo)}<span><strong>${escapeHtml(contact.title)}</strong></span>`;
      item.addEventListener("mouseenter", () => showContact(contact));
      item.addEventListener("focus", () => showContact(contact));
      item.addEventListener("mouseleave", hideContact);
      item.addEventListener("blur", hideContact);
      item.addEventListener("click", () => goToHref(contact.href));
      menu.appendChild(item);
    });
  }

  function setupDirectionalNavigation() {
    document.querySelector("[data-boat]")?.addEventListener("click", () => setArea("portfolio", { direction: "down" }));
    window.addEventListener(
      "wheel",
      (event) => {
        if (document.body.classList.contains("modal-open")) return;
        if (canPanelScroll(scrollablePanelFrom(event.target), event.deltaY)) return;
        event.preventDefault();
        navigateByDirection(event.deltaY);
      },
      { passive: false },
    );

    window.addEventListener("touchstart", (event) => {
      touchStartY = event.touches[0]?.clientY ?? null;
      touchStartTarget = event.target;
    });

    window.addEventListener(
      "touchmove",
      (event) => {
        if (touchStartY == null || document.body.classList.contains("modal-open")) return;
        const currentY = event.touches[0]?.clientY ?? touchStartY;
        const deltaY = touchStartY - currentY;
        if (canPanelScroll(scrollablePanelFrom(touchStartTarget), deltaY)) return;
        if (Math.abs(deltaY) > 42) {
          event.preventDefault();
          navigateByDirection(deltaY);
          touchStartY = null;
          touchStartTarget = null;
        }
      },
      { passive: false },
    );
  }

  document.body.classList.add("is-js-ready");
  setupHeader();
  setupPanelToggles();
  renderProfiles();
  renderProfileCreatures();
  renderProjects();
  renderContacts();
  setupDirectionalNavigation();
  setArea(areaFromHash(), { skipHash: true, replace: true, skipAnimation: true });
})();
