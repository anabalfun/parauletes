# Parauletes

Parauletes is a simple Catalan word game for children aged 4–6. It helps them explore words and take early steps toward reading. It’s designed for short, occasional play, with clear activities, minimal animation, and no features that encourage children to keep playing longer than they intend.

Each round has eight words. Choose a level:

- **Level 1:** Fill in one or two missing vowels.
- **Level 2:** Fill in one missing vowel and one missing consonant.
- **Level 3:** The first letter is shown; fill in the rest of the word.
- **Level 4:** All letters are hidden; write the whole word.

## Why keep the game in one HTML file?

The `main` branch keeps the game self-contained in `index.html`: the page, styles, word list, game rules, and illustrations are all in that file. This makes the game easy to share and lets a family open it directly in a browser without installing tools, starting a local web server, or building the project. It also makes the deployed game a single asset.

There are trade-offs. The HTML file is longer and less convenient to scan or edit; styles, data, artwork, and behavior are less clearly separated, and future features could make the file harder to maintain. The tests stay in `tests/` and extract the marked rules block from `index.html`, so they check the rules used by the actual game. The [`separated` branch](https://github.com/anabalfun/parauletes/tree/separated) keeps the multi-file implementation for comparison.

## Play locally

Open `index.html` directly in a browser. No local server is required.

## Run the tests

The focused tests cover level rules, Catalan accent handling, mistakes and retries, scoring boundaries, and round progression. They use Node's built-in test runner and require no installed packages:

```sh
node --test tests/*.test.js
```

GitHub Actions runs the same test suite on every push and pull request.

## Deploy

This is a static site. The repository root contains `index.html`; no build command is needed. It can be deployed with the repository root as the build output directory and no build step.

## Contents

- `index.html`: self-contained game page, styles, word deck, rules, and illustrations
- `tests/`: rule-focused tests
- `.github/workflows/tests.yml`: runs the tests on pushes and pull requests

The Godot/Steam Deck builds, editor caches, logs, and old standalone HTML export are not included in this web repository.
