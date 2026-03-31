# Blog Posting Guide

## Folder structure

Each post lives in its own folder.
Folder names should use `yyyymmdd_nn`.
Use `_nn` when posting multiple articles on the same day.

```text
docs/blog/
  posts.json
  posts/
    20260401_01/
      post.md
      image.png
```

## Required steps

1. Create `docs/blog/posts/<yyyymmdd_nn>/`
2. Add `post.md`
3. Put any images for the article in the same folder
4. Append the folder name to `docs/blog/posts.json`

## Front matter example

```md
---
title: "記事タイトル"
date: 2026-04-01
tags: [学習, 日記]
summary: "一覧ページに出す短い説明"
cover: cover.png
---
```

## Supported markdown

- Headings
- Paragraphs
- Unordered and ordered lists
- Blockquotes
- Code fences
- Links
- Images via `![alt](image.png)`

Images are resolved relative to the post folder, so `cover.png` works if the file sits next to `post.md`.
