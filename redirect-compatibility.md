# Redirect Compatibility

## Purpose

This document tracks legacy public URLs that must keep working during the redesign.
Canonical pages live mostly at the repo root, while older paths continue to exist as static redirect pages for GitHub Pages safety.

## Canonical Hubs

| Canonical URL | Purpose |
| --- | --- |
| `/` | top page |
| `/games.html` | games hub |
| `/vehicle-physics.html` | vehicle physics hub |
| `/mathematics.html` | mathematics hub |
| `/fluid-simulation.html` | fluid simulation hub |
| `/blog/` | blog |
| `/contact.html` | contact |

## Legacy Hub Aliases

| Legacy URL | Canonical URL | Status |
| --- | --- | --- |
| `/3d-games.html` | `/games.html` | keep redirect |
| `/3DGames/` | `/games.html` | keep redirect |
| `/mathematics/` | `/mathematics.html` | keep redirect |
| `/mathematics/mathematics.html` | `/mathematics.html` | keep redirect |
| `/vehicle-physics/` | `/vehicle-physics.html` | keep redirect |
| `/vehicle-physics/vehicle-physics.html` | `/vehicle-physics.html` | keep redirect |
| `/works.html` | `/` | keep redirect |
| `/self_introduction.html` | `/` | keep redirect |

## Legacy Game Aliases

These PascalCase root aliases should continue to redirect to the canonical kebab-case pages:

| Legacy URL | Canonical URL |
| --- | --- |
| `/Breakout2D.html` | `/breakout-2d.html` |
| `/CrowdRunner.html` | `/crowd-runner.html` |
| `/ColorSort.html` | `/color-sort.html` |
| `/LifeGame.html` | `/life-game.html` |
| `/MergeGame.html` | `/merge-game.html` |
| `/Minesweeper.html` | `/mine-sweeper.html` |
| `/SameGame3D.html` | `/same-game-3d.html` |

## Legacy Section Aliases

The old directory-based article pages stay available as redirect HTML files that point at the current root pages.

Patterns kept in place:

- `/mathematics/sections/<name>/<name>.html` -> `/<name>.html`
- `/vehicle-physics/sections/mechanics/mechanics.html` -> `/mechanics.html`
- `/vehicle-physics/sections/thermodynamics/thermodynamics.html` -> `/thermodynamics.html`
- `/vehicle-physics/sections/vehicle/<name>.html` -> `/<name>.html`
- `/3DGames/<family>/<legacy-file>.html` -> current root game pages such as `/2048.html` and `/breakout-2d.html`

## Navigation Policy

- Shared navigation should point only at canonical URLs.
- Legacy URLs exist for backward compatibility, bookmarked links, and search results.
- When a canonical page is renamed, add a redirect page instead of deleting the old path outright.
- Prefer static HTML redirect pages or directory `index.html` redirects over JS-only routing for compatibility on GitHub Pages.
