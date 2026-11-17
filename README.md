# Parauletes

A small Catalan word game for beginning readers. Choose one of four levels, fill in the missing letters, and complete an eight-word round.

## Play locally

The game uses JavaScript modules, so serve the project over HTTP rather than opening `index.html` directly. From this folder, run:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000> in a browser.

## Run the tests

The focused tests cover level rules, Catalan accent handling, mistakes and retries, scoring boundaries, and round progression. They use Node's built-in test runner and require no installed packages:

```sh
node --test tests/*.test.js
```

GitHub Actions runs the same test suite on every push and pull request.

## Deploy

This is a static site. The repository root contains `index.html`; no build command is needed. It can be deployed with the repository root as the build output directory and no build step.

## Contents

- `index.html`: game page and accessible controls
- `web-assets/`: game logic, word deck, styles, and local SVG clues
- `tests/`: rule-focused tests

The Godot/Steam Deck builds, editor caches, logs, and old standalone HTML export are not included in this web repository.
