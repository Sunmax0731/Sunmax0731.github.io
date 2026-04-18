# Redesign Workflow

## 1. Set Scope

- Read `Design.md` and identify which design decisions apply to the request.
- Map the task to one of four scopes: shared shell, hub page, detail page, or standalone app.
- Confirm whether the request is visual only, structural, or also includes copy and navigation changes.

## 2. Plan Shared Changes First

- When multiple pages are affected, define or update shared tokens, spacing rules, and reusable patterns before editing page-specific markup.
- Keep navigation, CTA hierarchy, and card behavior consistent across related pages.
- Avoid a one-pass full-site rewrite when the same result can be achieved in phases.

## 3. Implement In Phases

1. Shared shell and design tokens
2. Home page and primary hubs
3. Detail page templates and repeated sections
4. Standalone apps and microsites
5. Redirect cleanup only if explicitly requested

## 4. Validate

- Run `python serve.py` when markup, CSS, JS, or navigation changes affect browser behavior.
- Smoke-test affected pages at a desktop width and a mobile width.
- Check navigation, relative links, analytics injection assumptions, and redirect compatibility.
- Recheck Japanese text for mojibake or accidental encoding regressions.

## 5. Update The Docs

- If implementation changes the agreed design direction, update `Design.md`.
- If new repository-specific rules are discovered, update `references/site-structure.md`.
- Keep the skill concise. Move durable repository knowledge into references instead of expanding `SKILL.md`.
