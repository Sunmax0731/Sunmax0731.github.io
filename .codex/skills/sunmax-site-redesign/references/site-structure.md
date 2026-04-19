# Site Structure

## Shared Shell

- `style.css`: main shared stylesheet for root pages
- `detail-template.css`: shared namespaced template styles for root detail pages that keep their own family CSS
- `nav.js`: shared navigation behavior and dropdown augmentation
- `analytics.js` and `analytics-config.js`: analytics loader inputs used by the Pages workflow
- `serve.py`: local static server for browser checks

## Root Hub Pages

- `index.html`: profile and top entry page
- `vehicle-physics.html`: vehicle physics hub
- `mathematics.html`: mathematics hub
- `games.html`: games hub
- `fluid-simulation.html`: entry page into the fluid simulation microsite
- `contact.html`: contact page

## Detail Page Families

- Vehicle physics pages live mostly in root HTML files such as `vehicle.html`, `dynamics.html`, `engine3d.html`, `thermal.html`, and related pages.
- Mathematics pages live mostly in root HTML files such as `quantity.html`, `change.html`, `space.html`, `structure.html`, `finite-math.html`, and `math-sciences.html`.
- Game pages live mostly in root HTML files such as `2048.html`, `breakout-2d.html`, `life-game.html`, `merge-game.html`, `mine-sweeper.html`, `othello.html`, `crowd-runner.html`, `same-game-3d.html`, and `color-sort.html`.

## Standalone Apps Or Microsites

- `blog/`: blog index, post template, local CSS and JS
- `face-tracking/`: standalone face tracking app
- `fluid-simulation/`: dedicated microsite with multiple app entries
- `gungi/`: standalone game
- `i2i-lab/`: standalone I2I workflow support app
- `moto-catalog/`: standalone catalog app

## Redirect And Compatibility Paths

- `3DGames/`, `mathematics/`, and `vehicle-physics/` contain redirect or compatibility pages.
- Several PascalCase root files such as `Breakout2D.html` and `LifeGame.html` are also redirects.
- `redirect-compatibility.md` is the current old-to-new URL mapping reference.
- Keep these paths working unless the user explicitly approves a URL migration.

## Fragile Or Out-Of-Scope Areas For General Redesign

- `fluid-simulation/assets/`: generated build artifacts
- `fluid-simulation/pbmpm/`: third-party or externally sourced project material
- `.codex-app-schema/` and `.codex-app-ts/`: Codex-generated schema artifacts
- `vscode-codex-usage-status/`: separate tool project with its own dependencies

## Editing Notes

- Many root pages share the same structural shell and benefit from common CSS improvements.
- The repository contains Japanese copy. Verify text rendering after any manual edits.
