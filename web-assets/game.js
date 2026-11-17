import { deck } from './deck.js';
import { createRound, WORDS_PER_ROUND } from './round.js';

const CELEBRATION_MS = 1500;
const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKLÇ', 'ZXCVBNM'];
const formatScore = new Intl.NumberFormat('ca');

const view = Object.fromEntries([
  'setup', 'round', 'finish', 'letters', 'progress', 'applause', 'feedback',
  'keyboard', 'retry', 'finished', 'stars', 'score', 'change', 'again', 'levels', 'choose',
].map(id => [id, document.getElementById(id)]));
view.picture = document.getElementById('game-picture');

let game;
let activeField;
let advanceTimer;

function showScreen(screen) {
  for (const name of ['setup', 'round', 'finish']) {
    view[name].hidden = name !== screen;
  }
}

function renderPicture(card) {
  if (!card.artwork) {
    view.picture.textContent = card.emoji;
    return;
  }

  const image = document.createElement('img');
  image.src = new URL(`./clues/${encodeURIComponent(card.artwork)}`, import.meta.url);
  image.alt = '';
  view.picture.replaceChildren(image);
}

function completeWord() {
  activeField = null;
  view.retry.disabled = true;
  view.applause.textContent = '👏 👏 👏 👏 👏 👏 👏';
  view.applause.classList.add('pop');
  view.feedback.textContent = 'Molt bé!';
  advanceTimer = setTimeout(() => {
    if (game.advance()) renderWord();
    else showResults(game.results());
  }, CELEBRATION_MS);
}

function createLetterField(position, length) {
  const field = document.createElement('input');
  field.type = 'text';
  field.inputMode = 'none';
  field.className = 'letter';
  field.autocomplete = 'off';
  field.autocapitalize = 'characters';
  field.spellcheck = false;
  field.setAttribute('aria-label', `Lletra ${position + 1} de ${length}`);

  function check() {
    // A pending composition event can outlive its word after a retry or level change.
    if (field.readOnly || view.round.hidden || !view.letters.contains(field)) return;
    const result = game.submit(position, field.value);
    if (!result) return;

    field.value = result.letter;
    field.setAttribute('aria-invalid', String(Boolean(result.letter) && !result.correct));
    if (!result.correct) {
      if (result.letter) field.select();
      return;
    }

    field.readOnly = true;
    field.classList.add('correct');
    if (result.complete) {
      completeWord();
    } else {
      const next = view.letters.querySelector('input:not([readonly])');
      next.focus({ preventScroll: true });
      next.select();
    }
  }

  let compositionTimer;
  field.addEventListener('input', event => {
    if (event.isComposing) return;
    clearTimeout(compositionTimer);
    check();
  });
  field.addEventListener('compositionend', () => {
    clearTimeout(compositionTimer);
    compositionTimer = setTimeout(check, 0);
  });
  field.addEventListener('focus', () => {
    if (!field.readOnly) activeField = field;
  });
  return field;
}

function renderWord() {
  const card = game.card;
  view.progress.textContent = `Nivell ${game.level} · Paraula ${game.number} de ${WORDS_PER_ROUND}`;
  view.retry.disabled = false;
  view.applause.textContent = '';
  view.applause.classList.remove('pop');
  view.feedback.textContent = '';
  renderPicture(card);

  const tiles = card.letters.map((letter, position) => {
    if (game.isBlank(position)) return createLetterField(position, card.letters.length);
    const tile = document.createElement('span');
    tile.className = 'letter given';
    tile.textContent = letter;
    return tile;
  });
  view.letters.replaceChildren(...tiles);
  activeField = view.letters.querySelector('input');
  activeField.focus({ preventScroll: true });
}

function renderKeyboard(level) {
  view.keyboard.classList.toggle('vowels', level === 1);
  const rows = (level === 1 ? ['AEIOU'] : KEY_ROWS).map(letters => {
    const row = document.createElement('div');
    row.className = 'key-row';
    for (const letter of letters) {
      const key = document.createElement('button');
      key.type = 'button';
      key.className = 'key';
      key.textContent = letter;
      row.append(key);
    }
    return row;
  });
  view.keyboard.replaceChildren(...rows);
}

function showResults({ halfStars, perfect }) {
  showScreen('finish');
  view.stars.classList.toggle('perfect', perfect);
  const stars = Array.from({ length: 5 }, (_, index) => {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '★';
    const fill = Math.max(0, Math.min(2, halfStars - index * 2)) * 50;
    star.style.setProperty('--fill', `${fill}%`);
    return star;
  });
  view.stars.replaceChildren(...stars);
  view.score.textContent = `${formatScore.format(halfStars / 2)} de 5 estrelles`;
  view.finished.textContent = perfect ? 'Partida perfecta!' : 'Molt bé! Has completat 8 paraules!';
  view.finished.focus();
}

function startRound(level) {
  clearTimeout(advanceTimer);
  game = createRound(deck, level);
  showScreen('round');
  renderKeyboard(level);
  renderWord();
}

function chooseLevel() {
  clearTimeout(advanceTimer);
  activeField = null;
  showScreen('setup');
  view.choose.focus();
}

view.setup.addEventListener('click', event => {
  const button = event.target.closest('button[data-level]');
  if (button) startRound(Number(button.dataset.level));
});
view.keyboard.addEventListener('click', event => {
  const key = event.target.closest('button.key');
  if (!key || !activeField) return;
  activeField.focus({ preventScroll: true });
  activeField.value = key.textContent;
  activeField.dispatchEvent(new Event('input'));
});
view.retry.addEventListener('click', () => {
  game.retry();
  renderWord();
});
view.change.addEventListener('click', chooseLevel);
view.again.addEventListener('click', () => startRound(game.level));
view.levels.addEventListener('click', chooseLevel);
