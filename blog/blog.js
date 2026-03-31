const MANIFEST_PATH = "./posts.json";

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page === "blog-index") {
    await initBlogIndex();
  } else if (page === "blog-post") {
    await initBlogPost();
  }
});

async function initBlogIndex() {
  const status = document.getElementById("blog-status");
  const list = document.getElementById("blog-list");
  const filterBar = document.getElementById("tag-filters");

  if (window.location.protocol === "file:") {
    status.textContent =
      "ローカルファイルを直接開いた状態では記事を読み込めません。HTTP サーバー経由で確認してください。";
    return;
  }

  try {
    const slugs = await fetchManifest();
    const posts = await Promise.all(slugs.map((slug) => loadPost(slug)));
    const sortedPosts = posts.sort(comparePostsByDate);

    if (sortedPosts.length === 0) {
      status.textContent = "まだ記事はありません。最初の投稿を追加してください。";
      return;
    }

    const activeTag = new URLSearchParams(window.location.search).get("tag") || "all";
    const handleTagSelect = (tag) => {
      const params = new URLSearchParams(window.location.search);
      if (tag === "all") {
        params.delete("tag");
      } else {
        params.set("tag", tag);
      }
      const nextUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, "", nextUrl);
      renderPostList(list, status, sortedPosts, tag);
      renderTagFilters(filterBar, sortedPosts, tag, handleTagSelect);
    };

    renderTagFilters(filterBar, sortedPosts, activeTag, handleTagSelect);

    renderPostList(list, status, sortedPosts, activeTag);
  } catch (error) {
    status.textContent =
      "記事の読み込みに失敗しました。HTTP サーバー経由で公開されているか確認してください。";
    console.error(error);
  }
}

async function initBlogPost() {
  const status = document.getElementById("post-status");
  const view = document.getElementById("post-view");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (window.location.protocol === "file:") {
    status.textContent =
      "ローカルファイルを直接開いた状態では記事を読み込めません。HTTP サーバー経由で確認してください。";
    return;
  }

  if (!slug) {
    status.textContent = "記事が指定されていません。ブログ一覧から選択してください。";
    return;
  }

  try {
    const post = await loadPost(slug);
    document.title = `${post.meta.title} | ブログ | Sunmax`;

    const heroTitle = document.getElementById("post-hero-title");
    const heroTagline = document.getElementById("post-hero-tagline");
    heroTitle.textContent = post.meta.title;
    heroTagline.textContent = post.summary;

    view.innerHTML = renderPostPage(post);
    view.hidden = false;
    status.hidden = true;
  } catch (error) {
    status.textContent = "記事の読み込みに失敗しました。記事フォルダと slug を確認してください。";
    console.error(error);
  }
}

async function fetchManifest() {
  const response = await fetch(MANIFEST_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.status}`);
  }

  const manifest = await response.json();
  if (!Array.isArray(manifest)) {
    throw new Error("posts.json must be an array of slugs.");
  }

  return manifest;
}

async function loadPost(slug) {
  const markdownPath = `./posts/${slug}/post.md`;
  const response = await fetch(markdownPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${markdownPath}: ${response.status}`);
  }

  const raw = await response.text();
  const { meta, body } = parseFrontMatter(raw);
  const baseUrl = new URL(`./posts/${slug}/`, window.location.href);
  const normalizedMeta = normalizeMeta(meta, body, baseUrl, slug);

  return {
    slug,
    meta: normalizedMeta,
    body,
    summary: normalizedMeta.summary || deriveExcerpt(body),
    html: renderMarkdown(body, baseUrl),
  };
}

function parseFrontMatter(markdown) {
  const normalized = markdown.replace(/\r\n?/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    return { meta: {}, body: normalized.trim() };
  }

  const meta = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf(":");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    meta[key] = parseMetaValue(rawValue);
  }

  return { meta, body: normalized.slice(match[0].length).trim() };
}

function parseMetaValue(rawValue) {
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    return rawValue
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  if (rawValue.includes(",") && /[^\d]/.test(rawValue)) {
    return rawValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return rawValue;
}

function normalizeMeta(meta, body, baseUrl, slug) {
  const tags = Array.isArray(meta.tags)
    ? meta.tags
    : typeof meta.tags === "string"
      ? meta.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  const title = typeof meta.title === "string" && meta.title.trim() ? meta.title.trim() : slug;
  const summary =
    typeof meta.summary === "string" && meta.summary.trim() ? meta.summary.trim() : deriveExcerpt(body);
  const date = typeof meta.date === "string" ? meta.date.trim() : "";
  const cover =
    typeof meta.cover === "string" && meta.cover.trim() ? resolveUrl(meta.cover.trim(), baseUrl) : "";

  return {
    title,
    summary,
    date,
    dateLabel: formatDate(date),
    tags,
    cover,
  };
}

function formatDate(dateString) {
  if (!dateString) return "日付未設定";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function comparePostsByDate(left, right) {
  const leftValue = toComparableDate(left.meta.date);
  const rightValue = toComparableDate(right.meta.date);
  if (rightValue !== leftValue) {
    return rightValue - leftValue;
  }

  const leftSlugOrder = parseSlugOrder(left.slug);
  const rightSlugOrder = parseSlugOrder(right.slug);

  if (leftSlugOrder.dateValue !== rightSlugOrder.dateValue) {
    return rightSlugOrder.dateValue - leftSlugOrder.dateValue;
  }

  if (leftSlugOrder.sequence !== rightSlugOrder.sequence) {
    return rightSlugOrder.sequence - leftSlugOrder.sequence;
  }

  return right.slug.localeCompare(left.slug, "ja");
}

function toComparableDate(dateString) {
  const parsed = Date.parse(`${dateString || ""}T00:00:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseSlugOrder(slug) {
  const match = slug.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})$/);
  if (!match) {
    return { dateValue: 0, sequence: 0 };
  }

  const [, year, month, day, sequence] = match;
  const dateValue = Date.parse(`${year}-${month}-${day}T00:00:00`);

  return {
    dateValue: Number.isNaN(dateValue) ? 0 : dateValue,
    sequence: Number.parseInt(sequence, 10) || 0,
  };
}

function renderTagFilters(container, posts, activeTag, onSelect) {
  const tags = Array.from(new Set(posts.flatMap((post) => post.meta.tags))).sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
  const entries = ["all", ...tags];

  container.innerHTML = "";
  for (const entry of entries) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tag-filter-button${entry === activeTag ? " is-active" : ""}`;
    button.textContent = entry === "all" ? "すべて" : `#${entry}`;
    button.addEventListener("click", () => onSelect(entry));
    container.append(button);
  }
}

function renderPostList(container, status, posts, activeTag) {
  const filteredPosts =
    activeTag === "all" ? posts : posts.filter((post) => post.meta.tags.includes(activeTag));

  if (filteredPosts.length === 0) {
    container.hidden = true;
    status.hidden = false;
    status.textContent = "該当するタグの記事はまだありません。";
    return;
  }

  status.hidden = true;
  container.hidden = false;
  container.innerHTML = filteredPosts
    .map(
      (post) => `
        <article class="blog-card${post.meta.cover ? "" : " blog-card-no-cover"}">
          ${post.meta.cover ? `<img class="blog-card-cover" src="${escapeAttribute(post.meta.cover)}" alt="${escapeAttribute(post.meta.title)}" />` : ""}
          <div class="blog-card-body">
            <p class="blog-card-date">${escapeHtml(post.meta.dateLabel)}</p>
            <h3 class="blog-card-title">${escapeHtml(post.meta.title)}</h3>
            <p class="blog-summary">${escapeHtml(post.summary)}</p>
            <div class="blog-tag-list">
              ${post.meta.tags.map((tag) => `<span class="blog-tag">#${escapeHtml(tag)}</span>`).join("")}
            </div>
            <a class="blog-card-link" href="./post.html?slug=${encodeURIComponent(post.slug)}">記事を読む →</a>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderPostPage(post) {
  return `
    <header class="blog-post-header">
      <p class="blog-post-date">${escapeHtml(post.meta.dateLabel)}</p>
      <h2 class="blog-post-title">${escapeHtml(post.meta.title)}</h2>
      <div class="blog-tag-list">
        ${post.meta.tags.map((tag) => `<span class="blog-tag">#${escapeHtml(tag)}</span>`).join("")}
      </div>
      ${post.meta.cover ? `<img class="blog-post-cover" src="${escapeAttribute(post.meta.cover)}" alt="${escapeAttribute(post.meta.title)}" />` : ""}
    </header>
    <div class="blog-article">${post.html}</div>
  `;
}

function renderMarkdown(markdown, baseUrl) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const language = line.trim().slice(3).trim();
      const buffer = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        buffer.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      html.push(
        `<pre><code${language ? ` class="language-${escapeAttribute(language)}"` : ""}>${escapeHtml(
          buffer.join("\n"),
        )}</code></pre>`,
      );
      continue;
    }

    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      html.push(renderImage(imageMatch[1], imageMatch[2], baseUrl));
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2], baseUrl)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      html.push("<hr />");
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buffer = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        buffer.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${renderMarkdown(buffer.join("\n"), baseUrl)}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(`<li>${renderInline(lines[index].trim().replace(/^[-*]\s+/, ""), baseUrl)}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(`<li>${renderInline(lines[index].trim().replace(/^\d+\.\s+/, ""), baseUrl)}</li>`);
        index += 1;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const buffer = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim()) &&
      !/^```/.test(lines[index].trim()) &&
      !/^(-{3,}|\*{3,})$/.test(lines[index].trim()) &&
      !/^!\[([^\]]*)\]\(([^)]+)\)$/.test(lines[index].trim())
    ) {
      buffer.push(lines[index].trim());
      index += 1;
    }

    html.push(`<p>${renderInline(buffer.join(" "), baseUrl)}</p>`);
  }

  return html.join("");
}

function renderInline(text, baseUrl) {
  const codeSpans = [];
  const placeholderText = text.replace(/`([^`]+)`/g, (_, code) => {
    const placeholder = `@@CODE${codeSpans.length}@@`;
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return placeholder;
  });

  let rendered = escapeHtml(placeholderText);

  rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const href = resolveUrl(url, baseUrl);
    const target = isExternalReference(url) ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${escapeAttribute(href)}"${target}>${label}</a>`;
  });
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  for (let index = 0; index < codeSpans.length; index += 1) {
    rendered = rendered.replace(`@@CODE${index}@@`, codeSpans[index]);
  }

  return rendered;
}

function renderImage(alt, url, baseUrl) {
  const src = resolveUrl(url, baseUrl);
  return `
    <figure class="markdown-image">
      <img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" />
      ${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ""}
    </figure>
  `;
}

function deriveExcerpt(markdown) {
  const firstParagraph = markdown
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith("#") && !block.startsWith("```") && !block.startsWith("!"));

  if (!firstParagraph) {
    return "本文は記事ページで確認できます。";
  }

  return firstParagraph
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .trim()
    .slice(0, 110);
}

function resolveUrl(url, baseUrl) {
  if (/^(https?:|mailto:|tel:|#|\/)/.test(url)) {
    return url;
  }

  return new URL(url, baseUrl).href;
}

function isExternalReference(url) {
  return /^(https?:|mailto:|tel:)/.test(url);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
