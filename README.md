# Parauletes

Parauletes is a simple Catalan word game for children aged 4–6. It helps them explore words and take early steps toward reading. It’s designed for short, occasional play: clear activities, minimal animation, and no features that encourage children to keep playing longer than they intend. 
Choose one of four levels, fill in the missing letters, and complete an eight-word round.
Level 1: Fill in one or two missing vowels.
Level 2: Fill in one missing vowel and one missing consonant.
Level 3: The first letter is shown and you need to fill in the rest of the word.
Level 4: All letters are hidden and you need to write the whole word.

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
