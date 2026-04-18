---
name: sunmax-site-redesign
description: Plan and execute redesign work for the Sunmax static portfolio site. Use when Codex is asked to redesign, refresh, restyle, reorganize, or document the UI, navigation, component system, information architecture, or rollout plan for pages in this repository, including full redesign, design refresh, UI cleanup, layout updates, navigation improvements, or Design.md updates.
---

# Sunmax Site Redesign

Read `Design.md` first. Treat it as the source of truth for visual direction, information architecture, component rules, and rollout order.
If a task explicitly references a file under `design-references/`, treat that file as supplemental input. Reuse durable patterns from it, but keep `Design.md` authoritative for this repository unless the user says otherwise.

## Quick Start

1. Confirm the task is tied to a GitHub Issue. If it is a new request, create or update the Issue first and wait for the prioritized go-ahead before implementation.
2. Read `Design.md`.
3. Read `references/site-structure.md` to identify the affected page family and shared files.
4. Read `references/redesign-workflow.md` before planning or editing.
5. Read `references/issue-workflow.md` when the task includes backlog refinement, priority handling, scope changes, or GitHub updates.
6. Update shared shell patterns before cloning changes page by page.
7. Preserve stable public URLs unless the user explicitly asks to change them.

## Route The Work

- For top-level hubs such as `index.html`, `vehicle-physics.html`, `mathematics.html`, `games.html`, `fluid-simulation.html`, and `contact.html`, prioritize navigation, hero structure, featured work blocks, and shared card patterns.
- For detailed article pages in the repo root, improve hierarchy, readability, and related-navigation patterns without rewriting technical copy unless the user asks for copy changes.
- For standalone app or microsite directories such as `blog/`, `face-tracking/`, `fluid-simulation/`, `gungi/`, and `moto-catalog/`, inspect local CSS and JS before reusing root styles.
- For redirect and alias pages, preserve compatibility unless the task explicitly includes migration or cleanup.

## Shared Constraints

- Keep the site deployable as plain static files on GitHub Pages.
- Prefer HTML, CSS, JavaScript, and CSS custom properties over introducing build tools.
- Use shared files such as `style.css` and `nav.js` as the first extension points when the request spans multiple pages.
- Keep desktop and mobile quality aligned from the first implementation pass.
- Preserve analytics behavior and relative links.
- When editing Japanese copy, confirm that the visible text is still readable and encoded correctly.
- Avoid touching generated or external-style areas unless the task explicitly targets them: `fluid-simulation/assets/`, `fluid-simulation/pbmpm/`, `vscode-codex-usage-status/`.

## Keep Docs In Sync

- If the user changes the design direction, update `Design.md` before or alongside code changes.
- If the redesign workflow or repository boundaries change, update the reference files in this skill.
- If the user request conflicts with `Design.md`, follow the user request and then reconcile the documentation.
- Treat the prioritized Issue as the scope boundary for the current work.
- If implementation changes the accepted scope, update the Issue and the docs together.

## References

- `Design.md`
- `references/site-structure.md`
- `references/redesign-workflow.md`
- `references/issue-workflow.md`
