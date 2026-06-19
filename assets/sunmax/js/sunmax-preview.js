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
      icon: "skills",
      creature: "ray",
      sprite: "sea-bass.png",
      size: 190,
      x: 58,
      y: 48,
      colors: ["#9fd8e3", "#4f7782"],
      description:
        "UnityおよびC#を学生の頃から含め10年ほど開発で使用しています。ここ数年にはBlenderを用いた3Dモデリングにも着手し、AI Agentsを活用したウェブアプリの開発にも挑戦しています。",
    },
    {
      id: "tools",
      title: "使用ツール",
      label: "使用ツール",
      icon: "tools",
      creature: "jelly",
      sprite: "seahorse.png",
      spriteHeight: 1.3,
      size: 128,
      x: 38,
      y: 58,
      colors: ["#b9e7d4", "#6fae9b"],
      description:
        "Codex、Tripo3D、Unity、Blender、VSCode",
    },
    {
      id: "hobbies",
      title: "趣味",
      label: "趣味",
      icon: "hobbies",
      creature: "fish",
      sprite: "horse-mackerel.png",
      size: 154,
      x: 50,
      y: 76,
      colors: ["#f0d492", "#7b8d64"],
      description:
        "休みの日はバイクで出かけ風景や動植物など自然のものを一眼レフで撮っています。インドア寄りの趣味では、SFやミステリを中心に読書したり、FPSなどのゲームをしたりしています。",
    },
  ];

  const projects = [
    {
      id: "gungi",
      title: "軍儀",
      category: "Unity",
      creature: "crustacean",
      sprite: "seasonal/autumn-11-kegani-horsehair-crab.png",
      motion: "crawl",
      spriteHeight: 0.68,
      size: 210,
      x: 42,
      y: 68,
      colors: ["#8ba9c2", "#274357"],
      year: "2026",
      tech: "Browser Game / 3D Board / CPU",
      href: `${assetRoot}gungi/`,
      description:
        "HxHの蟻編で出てきたテーブルゲームです。オートモードなどもあるのでルールを知らなくても楽しめます。",
    },
    {
      id: "moto-catalog",
      title: "バイク図鑑",
      category: "Web",
      creature: "fish",
      sprite: "seasonal/winter-01-buri-yellowtail.png",
      motion: "swim",
      spriteHeight: 0.42,
      size: 220,
      x: 24,
      y: 56,
      colors: ["#b9c984", "#557a5c"],
      year: "2026",
      tech: "React / Catalog UI / Data",
      href: `${assetRoot}moto-catalog/`,
      description:
        "世界中の様々なバイクを、メーカーはもちろんスペックや機能などの特徴で検索できます。",
    },
    {
      id: "texture-reviewer",
      title: "モデる？",
      category: "3D",
      creature: "shellfish",
      sprite: "seasonal/summer-14-awabi-abalone.png",
      motion: "bob",
      spriteHeight: 0.66,
      size: 150,
      x: 54,
      y: 20,
      colors: ["#9bcde0", "#3e6075"],
      year: "2026",
      tech: "Three.js / Web 3D / Review Tool",
      href: "https://sunmax0731.github.io/mobile-3d-texture-reviewer/",
      description:
        "3Dモデルに対してテクチャを適用し見栄えを確認できるレビューツールです。ライティングや背景など環境を変えながらレビューできます。",
    },
    {
      id: "thumbnail-generator",
      title: "サムネいる？",
      category: "Tool",
      creature: "crustacean",
      sprite: "seasonal/summer-07-kurumaebi-prawn.png",
      motion: "dart",
      spriteHeight: 0.58,
      size: 180,
      x: 56,
      y: 61,
      colors: ["#93b3be", "#2d5260"],
      year: "2026",
      tech: "Canvas / Editor UI / Animation",
      href: "https://sunmax0731.github.io/thumbnail-generator/",
      description:
        "配信活動者に必須の動画サムネやスケジュール画像を作成支援するためのツールです。テンプレートの登録やカラーパレットの登録など多様な機能が豊富です。画像だけでなく、待機画面用のアニメーションも作成できます。",
    },
    {
      id: "image-mosaic",
      title: "モザいく？",
      category: "UI/UX",
      creature: "seaweed",
      sprite: "seasonal/spring-13-wakame-seaweed.png",
      motion: "sway",
      spriteHeight: 1.18,
      size: 132,
      x: 35,
      y: 32,
      colors: ["#f2bad0", "#9272b8"],
      year: "2026",
      tech: "Image Processing / Preset UI",
      href: "https://sunmax0731.github.io/image-mosaic-effect/",
      description:
        "画像にモザイク加工を適用するツールです。Skebやfantia用のモザイクプリセットを用意しています。",
    },
    {
      id: "dog-translator",
      title: "犬語翻訳機",
      category: "AI",
      creature: "mollusk",
      sprite: "seasonal/summer-05-tako-octopus.png",
      motion: "pulse",
      spriteHeight: 0.86,
      size: 150,
      x: 76,
      y: 43,
      colors: ["#cfe9d8", "#4c7f68"],
      year: "2026",
      tech: "AI / Web Tool / Translation",
      href: "https://github.com/Sunmax0731/DogTranslator",
      description:
        "犬の気持ちを翻訳することをテーマにしたツールです。AIを使ったコミュニケーション体験として制作しています。",
    },
    {
      id: "movie-telop-transcriber",
      title: "動画テロップ読み取りツール",
      category: "AI",
      creature: "eel",
      sprite: "seasonal/autumn-08-tachiuo-cutlassfish.png",
      motion: "undulate",
      spriteHeight: 0.42,
      size: 190,
      x: 78,
      y: 72,
      colors: ["#b8d8f0", "#4c5f86"],
      year: "2026",
      tech: "OCR / Video / Transcription",
      href: "https://github.com/Sunmax0731/movie-telop-transcriber",
      description:
        "動画内のテロップを読み取り、文字情報として扱えるようにするためのツールです。動画確認や記録作業を支援します。",
    },
    {
      id: "blender-mcp",
      title: "BlenderMCP",
      category: "3D",
      creature: "crustacean",
      sprite: "seasonal/winter-12-iseebi-spiny-lobster.png",
      motion: "crawl",
      spriteHeight: 0.65,
      size: 175,
      x: 72,
      y: 23,
      colors: ["#d8c2f2", "#6a5c94"],
      year: "2026",
      tech: "Blender / MCP / Automation",
      href: "https://github.com/Sunmax0731/blender-mcp",
      description:
        "Blenderと外部ツールを連携させるためのMCP実装です。3D制作の操作や検証を自動化しやすくするために制作しています。",
    },
    {
      id: "m5stack-dashboard",
      title: "M5Stack-Dashboard",
      category: "IoT",
      creature: "mollusk",
      sprite: "seasonal/spring-07-hotaruika-firefly-squid.png",
      motion: "pulse",
      spriteHeight: 0.65,
      size: 146,
      x: 31,
      y: 81,
      colors: ["#f4d08f", "#8a7140"],
      year: "2026",
      tech: "M5Stack / Dashboard / LAN",
      href: "https://github.com/Sunmax0731/m5stack-lan-dashboard",
      description:
        "LAN内のM5Stack機器を扱うためのダッシュボードです。ローカル環境での状態確認や管理をしやすくします。",
    },
  ];

  const seasonalSeafood = {
    spring: [
      ["spring-01-madai-red-sea-bream.png", "swim", 126, 18, 22, 0.58],
      ["spring-02-sawara-spanish-mackerel.png", "swim", 138, 38, 18, 0.42],
      ["spring-03-katsuo-bonito.png", "dart", 132, 61, 24, 0.46],
      ["spring-04-shirasu-whitebait.png", "dart", 100, 82, 29, 0.46],
      ["spring-05-asari-clam.png", "bob", 86, 16, 51, 0.72],
      ["spring-06-hamaguri-clam.png", "bob", 96, 35, 72, 0.64],
      ["spring-07-hotaruika-firefly-squid.png", "pulse", 86, 50, 48, 0.65],
      ["spring-08-yariika-spear-squid.png", "pulse", 116, 70, 52, 0.48],
      ["spring-09-sakuraebi-shrimp.png", "dart", 92, 83, 63, 0.58],
      ["spring-10-mebaru-rockfish.png", "swim", 112, 58, 82, 0.6],
      ["spring-11-sayori-halfbeak.png", "dart", 118, 22, 86, 0.32],
      ["spring-12-ainame-greenling.png", "swim", 112, 42, 62, 0.52],
      ["spring-13-wakame-seaweed.png", "sway", 88, 74, 80, 1.18],
      ["spring-14-torigai-cockle.png", "bob", 90, 88, 45, 0.82],
      ["spring-15-konbu-kelp.png", "sway", 112, 66, 34, 0.72],
    ],
    summer: [
      ["summer-01-aji-horse-mackerel.png", "dart", 116, 16, 24, 0.48],
      ["summer-02-suzuki-sea-bass.png", "swim", 128, 39, 20, 0.42],
      ["summer-03-anago-conger-eel.png", "undulate", 120, 61, 26, 0.42],
      ["summer-04-hamo-pike-conger.png", "undulate", 122, 81, 30, 0.38],
      ["summer-05-tako-octopus.png", "pulse", 104, 29, 58, 0.86],
      ["summer-06-maika-squid.png", "pulse", 108, 52, 52, 0.56],
      ["summer-07-kurumaebi-prawn.png", "dart", 104, 76, 57, 0.58],
      ["summer-08-iwagaki-oyster.png", "bob", 94, 90, 72, 0.76],
      ["summer-09-sazae-turban-shell.png", "bob", 88, 18, 78, 0.72],
      ["summer-10-uni-sea-urchin.png", "bob", 84, 40, 86, 1],
      ["summer-11-tobiuo-flying-fish.png", "dart", 118, 62, 84, 0.56],
      ["summer-12-kisu-sillago.png", "swim", 106, 82, 88, 0.42],
      ["summer-13-isaki-grunt.png", "swim", 112, 23, 39, 0.52],
      ["summer-14-awabi-abalone.png", "bob", 86, 52, 75, 0.66],
      ["summer-15-mozuku-seaweed.png", "sway", 92, 73, 38, 0.72],
    ],
    autumn: [
      ["autumn-01-sanma-pacific-saury.png", "dart", 118, 14, 20, 0.28],
      ["autumn-02-saba-mackerel.png", "swim", 122, 34, 18, 0.44],
      ["autumn-03-sake-salmon.png", "swim", 132, 57, 24, 0.42],
      ["autumn-04-modorigatsuo-bonito.png", "dart", 124, 79, 26, 0.44],
      ["autumn-05-kanpachi-amberjack.png", "swim", 120, 27, 47, 0.42],
      ["autumn-06-shimaaji-striped-jack.png", "swim", 116, 48, 63, 0.5],
      ["autumn-07-kawahagi-filefish.png", "bob", 92, 69, 49, 0.8],
      ["autumn-08-tachiuo-cutlassfish.png", "undulate", 132, 86, 58, 0.34],
      ["autumn-09-surumeika-squid.png", "pulse", 104, 18, 78, 0.58],
      ["autumn-10-amaebi-sweet-shrimp.png", "dart", 94, 38, 86, 0.62],
      ["autumn-11-kegani-horsehair-crab.png", "crawl", 94, 58, 83, 0.68],
      ["autumn-12-zuwaigani-snow-crab.png", "crawl", 106, 77, 78, 0.52],
      ["autumn-13-ikura-salmon-roe.png", "bob", 76, 89, 42, 0.9],
      ["autumn-14-shijimi-clam.png", "bob", 80, 37, 34, 0.72],
      ["autumn-15-nori-seaweed.png", "sway", 82, 67, 86, 1],
    ],
    winter: [
      ["winter-01-buri-yellowtail.png", "swim", 128, 18, 24, 0.42],
      ["winter-02-tara-pacific-cod.png", "swim", 116, 39, 18, 0.5],
      ["winter-03-ankoh-monkfish.png", "bob", 118, 61, 29, 0.62],
      ["winter-04-fugu-pufferfish.png", "bob", 86, 82, 33, 0.7],
      ["winter-05-hirame-flounder.png", "hover", 118, 24, 58, 0.5],
      ["winter-06-kinki-thornyhead.png", "swim", 106, 44, 76, 0.58],
      ["winter-07-kinmedai-alfonsino.png", "swim", 110, 66, 70, 0.52],
      ["winter-08-winter-kawahagi-filefish.png", "bob", 88, 84, 58, 0.78],
      ["winter-09-kaki-oyster.png", "bob", 84, 18, 84, 0.78],
      ["winter-10-hotate-scallop.png", "bob", 90, 37, 42, 0.72],
      ["winter-11-botanebi-shrimp.png", "dart", 96, 57, 86, 0.58],
      ["winter-12-iseebi-spiny-lobster.png", "crawl", 110, 76, 83, 0.65],
      ["winter-13-winter-kegani-crab.png", "crawl", 94, 90, 74, 0.68],
      ["winter-14-namako-sea-cucumber.png", "undulate", 92, 53, 50, 0.38],
      ["winter-15-winter-mozuku-seaweed.png", "sway", 90, 72, 36, 0.8],
    ],
  };

  const contacts = [
    {
      id: "email",
      title: "Email",
      note: "仕事のご依頼、ご相談はこちらから。",
      logo: "mail",
      creature: "fish",
      sprite: "crucian.png",
      size: 150,
      href: "mailto:gkk.jhon@gmail.com",
      x: 58,
      y: 64,
    },
    {
      id: "github",
      title: "GitHub",
      note: "ソースコードと制作物の置き場です。",
      logo: "github",
      creature: "fish",
      sprite: "char.png",
      size: 170,
      href: "https://github.com/Sunmax0731",
      x: 32,
      y: 71,
    },
    {
      id: "x",
      title: "X (旧Twitter)",
      note: "日常のつぶやきです。",
      logo: "x",
      creature: "fish",
      sprite: "ayu.png",
      size: 166,
      href: "https://x.com/Sunmax0731",
      x: 45,
      y: 51,
    },
    {
      id: "zenn",
      title: "Zenn",
      note: "学習記録や技術メモをまとめています。",
      logo: "zenn",
      creature: "fish",
      sprite: "yamame.png",
      size: 160,
      href: "https://zenn.dev/sunmax",
      x: 56,
      y: 48,
    },
    {
      id: "booth",
      title: "BOOTH",
      note: "UnityのEditor拡張を出品しています。",
      logo: "booth",
      creature: "fish",
      sprite: "sea-bass.png",
      size: 178,
      href: "https://sunmax.booth.pm/",
      x: 62,
      y: 78,
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

  function logoPath(file) {
    return `${assetRoot}assets/sunmax/logos/${file}`;
  }

  function creaturePath(file) {
    return `${assetRoot}assets/sunmax/creatures/${file}`;
  }

  function creatureImage(item) {
    if (!item.sprite) return "";
    return `<img class="creature-image" src="${creaturePath(item.sprite)}" alt="" loading="eager" decoding="async" />`;
  }

  function creatureMotionClass(item) {
    return item.motion ? ` motion-${item.motion}` : "";
  }

  function setCreatureMetrics(creature, item) {
    creature.style.setProperty("--size", `${item.size}px`);
    if (item.spriteHeight) {
      const height = Math.round(item.size * item.spriteHeight);
      creature.style.setProperty("--creature-height", `${height}px`);
      creature.style.setProperty("--creature-aspect", `${item.size / height}`);
    }
  }

  function setCreatureMotion(creature, item, index, baseDistance, baseLift, energy = 1) {
    const motion = item.motion || "swim";
    const distance = item.motionDistance ?? (baseDistance + index * 4) * energy;
    const lift = item.motionLift ?? (baseLift + index * 2) * energy;
    const durationByMotion = {
      bob: 12,
      crawl: 16,
      dart: 7,
      hover: 13,
      pulse: 9,
      sway: 14,
      swim: 10,
      undulate: 12,
    };

    creature.style.setProperty("--swim-distance", `${distance}px`);
    creature.style.setProperty("--swim-lift", `${lift}px`);
    creature.style.setProperty("--motion-duration", `${item.motionDuration || (durationByMotion[motion] || 10) / Math.max(energy, 0.75)}s`);
    creature.style.setProperty("--motion-delay", `${index * -1.15}s`);
  }

  function currentPortfolioSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  }

  function seasonalCreatureFromEntry(entry, index, season) {
    const [sprite, motion, size, x, y, spriteHeight] = entry;
    return {
      id: `${season}-${index + 1}`,
      sprite: `seasonal/${sprite}`,
      motion,
      size,
      x,
      y,
      spriteHeight,
    };
  }

  function profileIcon(type) {
    const common = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
    const paths = {
      skills: '<path d="M7 14l-3 3 3 3M17 14l3 3-3 3M14 5l-4 14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
      tools: '<path d="M14.7 6.4l2.9-2.9 2.9 2.9-2.9 2.9M4 20l8.5-8.5M6.5 5.2l3.3 3.3M4.5 7.2l3.3-3.3 11.7 11.7-3.3 3.3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      hobbies: '<path d="M5 15c2.3-3.8 3.6-5 7-5s4.7 1.2 7 5M7 17h10M8.5 11.5l-2-3M15.5 11.5l2-3M9 6h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    };
    return `<span class="item-icon profile-logo"><svg ${common}>${paths[type] || paths.skills}</svg></span>`;
  }

  function serviceLogo(type) {
    if (type === "x") {
      return `<span class="item-icon service-logo"><img src="${logoPath("x-logo.svg")}" alt="" /></span>`;
    }
    if (type === "zenn") {
      return `<span class="item-icon service-logo"><img src="${logoPath("zenn-logo.svg")}" alt="" /></span>`;
    }

    const common = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
    const label = {
      mail: '<path d="M4 6h16v12H4z" fill="none"/><path d="M5 7l7 6 7-6M5 17h14V8H5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      github: '<path d="M12 3.2a8.7 8.7 0 0 0-2.8 17c.4.1.6-.2.6-.5v-1.7c-2.4.5-2.9-1-2.9-1-.4-.9-.9-1.2-.9-1.2-.7-.5 0-.5 0-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.6.7.1-.5.3-.9.5-1.1-1.9-.2-3.9-.9-3.9-4.2 0-.9.3-1.7.8-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.3.9.7-.2 1.4-.3 2.1-.3s1.5.1 2.1.3c1.6-1.1 2.3-.9 2.3-.9.5 1.2.2 2.1.1 2.3.5.6.8 1.4.8 2.3 0 3.3-2 4-3.9 4.2.3.3.6.8.6 1.6v2.4c0 .3.2.6.6.5A8.7 8.7 0 0 0 12 3.2z" fill="currentColor"/>',
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
      button.innerHTML = `${profileIcon(profile.icon)}<span><strong>${escapeHtml(profile.label)}</strong></span>`;
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
      creature.className = `creature profile-creature ${profile.creature}${profile.sprite ? " has-sprite" : ""}`;
      creature.dataset.label = profile.title;
      creature.dataset.profileId = profile.id;
      if (profile.sprite) {
        creature.dataset.sprite = profile.sprite.replace(".png", "");
      }
      creature.style.setProperty("--size", `${profile.size}px`);
      if (profile.spriteHeight) {
        creature.style.setProperty("--creature-height", `${Math.round(profile.size * profile.spriteHeight)}px`);
      }
      creature.style.setProperty("--creature-a", profile.colors[0]);
      creature.style.setProperty("--creature-b", profile.colors[1]);
      creature.style.setProperty("--swim-distance", `${28 + index * 5}px`);
      creature.style.setProperty("--swim-lift", `${14 + index * 3}px`);
      creature.style.left = `${profile.x}%`;
      creature.style.top = `${profile.y}%`;
      creature.style.animationDelay = `${index * -1.2}s`;
      creature.setAttribute("aria-label", `${profile.title}の詳細を表示`);
      creature.innerHTML = creatureImage(profile);
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

  function renderSeasonalPortfolioCreatures(field) {
    const season = currentPortfolioSeason();
    const entries = seasonalSeafood[season] || seasonalSeafood.spring;

    entries.forEach((entry, index) => {
      const item = seasonalCreatureFromEntry(entry, index, season);
      const creature = document.createElement("span");
      creature.className = `creature seasonal-creature has-sprite${creatureMotionClass(item)}`;
      creature.dataset.season = season;
      creature.dataset.sprite = item.sprite.replace(".png", "");
      setCreatureMetrics(creature, item);
      setCreatureMotion(creature, item, index, 14, 6, 0.62);
      creature.style.left = `${item.x}%`;
      creature.style.top = `${item.y}%`;
      creature.setAttribute("aria-hidden", "true");
      creature.innerHTML = creatureImage(item);
      field.appendChild(creature);
    });
  }

  function renderProjects() {
    const field = document.querySelector("[data-project-field]");
    const list = document.querySelector("[data-project-list]");
    if (!field || !list) return;
    field.innerHTML = "";
    list.innerHTML = "";
    renderSeasonalPortfolioCreatures(field);

    projects.forEach((project, index) => {
      const creature = document.createElement("button");
      creature.type = "button";
      creature.className = `creature project-creature ${project.creature}${project.sprite ? " has-sprite" : ""}${creatureMotionClass(project)}`;
      creature.dataset.label = project.title;
      creature.dataset.projectId = project.id;
      creature.dataset.category = project.category;
      if (project.sprite) {
        creature.dataset.sprite = project.sprite.replace(".png", "");
      }
      setCreatureMetrics(creature, project);
      creature.style.setProperty("--creature-a", project.colors[0]);
      creature.style.setProperty("--creature-b", project.colors[1]);
      setCreatureMotion(creature, project, index, 44, 22, 1.55);
      creature.style.left = `${project.x}%`;
      creature.style.top = `${project.y}%`;
      creature.style.animationDelay = `${index * -1.4}s`;
      creature.setAttribute("aria-label", `${project.title}を開く`);
      creature.innerHTML = creatureImage(project);
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

    contacts.forEach((contact, index) => {
      const hotspot = document.createElement("button");
      hotspot.type = "button";
      hotspot.className = `contact-hotspot creature contact-creature ${contact.creature || "fish"}${contact.sprite ? " has-sprite" : ""}`;
      hotspot.dataset.contactId = contact.id;
      hotspot.dataset.label = contact.title;
      if (contact.sprite) {
        hotspot.dataset.sprite = contact.sprite.replace(".png", "");
      }
      hotspot.style.setProperty("--size", `${contact.size || 150}px`);
      if (contact.spriteHeight) {
        hotspot.style.setProperty("--creature-height", `${Math.round((contact.size || 150) * contact.spriteHeight)}px`);
      }
      hotspot.style.setProperty("--creature-a", contact.colors?.[0] || "#9fd8e3");
      hotspot.style.setProperty("--creature-b", contact.colors?.[1] || "#4f7782");
      hotspot.style.setProperty("--swim-distance", `${30 + index * 5}px`);
      hotspot.style.setProperty("--swim-lift", `${14 + index * 3}px`);
      hotspot.style.left = `${contact.x}%`;
      hotspot.style.top = `${contact.y}%`;
      hotspot.style.animationDelay = `${index * -1.25}s`;
      hotspot.innerHTML = creatureImage(contact);
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
