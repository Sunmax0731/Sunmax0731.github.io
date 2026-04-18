# Sunmax Docs Guidance

## Scope

This repository is a static GitHub Pages site. Treat redesign work as static HTML/CSS/JS work unless the user explicitly asks for a stack migration.

## Source Of Truth

- Read [Design.md](Design.md) before planning or editing any user-facing page.
- Treat files under `design-references/` as supplemental references unless the user explicitly promotes one into the main source of truth.
- Use the local skill at `.codex/skills/sunmax-site-redesign/` for redesign, navigation, component, information architecture, rollout, backlog refinement, or Issue-based execution tasks for this site.
- If the user intentionally overrides `Design.md`, follow the user and then update `Design.md` so the repo stays internally consistent.

## Site Architecture

- Shared shell files: `style.css`, `detail-template.css`, `nav.js`, `analytics.js`, `analytics-config.js`
- Root hub pages: `index.html`, `vehicle-physics.html`, `mathematics.html`, `games.html`, `fluid-simulation.html`, `contact.html`
- Standalone app or microsite directories: `blog/`, `face-tracking/`, `fluid-simulation/`, `gungi/`, `moto-catalog/`
- Legacy redirect and alias paths exist under `3DGames/`, `mathematics/`, `vehicle-physics/`, and several PascalCase root HTML files. Preserve public URL compatibility unless the user asks to break it.
- Use `redirect-compatibility.md` when a task changes aliases, redirects, canonical URLs, or navigation cleanup.

## Working Rules

- Prefer shared design tokens, layout primitives, and navigation updates before duplicating changes page by page.
- Keep desktop and mobile quality aligned from the first pass.
- Do not rewrite educational or portfolio copy unless the task explicitly includes copy changes.
- Preserve analytics loader behavior and relative links.
- Do not touch generated or third-party-like areas for general redesign work: `fluid-simulation/assets/`, `fluid-simulation/pbmpm/`, `vscode-codex-usage-status/`.
- Assume Japanese text should remain readable. Verify encoding and rendered text whenever a file with Japanese copy is edited.

## Issue-Driven Workflow

- Default to Issue-driven execution for redesign work.
- When the user requests a new redesign task, first create or update a GitHub Issue that captures the scope.
- Do not treat intake alone as implementation-ready. After the Issue is reviewed, prioritized, or otherwise confirmed by the user, use that Issue as the scope boundary for execution.
- Treat one Issue as the planning unit for the work currently in progress.
- If scope changes materially while implementing, update the Issue before or together with the code and document changes.
- Close or update the Issue only after the related local changes are reflected in the repository state the user wants to keep.

## GitHub CLI Encoding

- On Windows PowerShell 5.1, do not pipe Japanese or other non-ASCII multi-line text to `gh` through stdin.
- Prefer UTF-8 files with `gh issue edit --body-file <path>`, `gh issue comment --body-file <path>`, or `gh api --input <utf8-json>`.
- For short one-line text, direct command arguments are acceptable.
- After creating or editing a Japanese GitHub Issue or comment, read it back to confirm there is no mojibake.

## Validation

- For documentation-only changes, review file paths and cross-references.
- For UI changes, run `python serve.py` and smoke-test the affected pages on desktop and mobile widths.
