// Small dependency-free tests for the rules shared by all web game levels.
// Run with: node --test tests/round.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound, scoreRound, WORDS_PER_ROUND } from '../web-assets/round.js';

const makeDeck = (word, size = WORDS_PER_ROUND) =>
  Array.from({ length: size }, (_, index) => ({ word, id: index }));

test('creates eight words and applies the right missing-letter pattern per level', () => {
  assert.equal(WORDS_PER_ROUND, 8);

  const level1 = createRound(makeDeck('GAT'), 1, () => 0.99);
  assert.equal(Array.from({ length: 3 }, (_, i) => level1.isBlank(i)).filter(Boolean).length, 1);

  const level2 = createRound(makeDeck('GAT'), 2, () => 0.99);
  assert.deepEqual(Array.from({ length: 3 }, (_, i) => level2.isBlank(i)), [true, true, false]);
  const hiddenLevel2Letters = level2.card.letters.filter((_, i) => level2.isBlank(i));
  assert.equal(hiddenLevel2Letters.filter(letter => 'AEIOUÀÈÉÍÏÒÓÚÜ'.includes(letter)).length, 1);
  assert.equal(hiddenLevel2Letters.filter(letter => !'AEIOUÀÈÉÍÏÒÓÚÜ'.includes(letter)).length, 1);

  const level3 = createRound(makeDeck('GAT'), 3, () => 0.99);
  assert.deepEqual(Array.from({ length: 3 }, (_, i) => level3.isBlank(i)), [false, true, true]);

  const level4 = createRound(makeDeck('GAT'), 4, () => 0.99);
  assert.deepEqual(Array.from({ length: 3 }, (_, i) => level4.isBlank(i)), [true, true, true]);
});

test('accepts an unaccented vowel and returns the accented Catalan letter', () => {
  const round = createRound(makeDeck('ÓS'), 1, () => 0.99);
  assert.equal(round.isBlank(0), true);
  assert.deepEqual(round.submit(0, 'o'), { letter: 'Ó', correct: true, complete: true });
});

test('rejects incorrect answers, ignores non-letter input, and retry clears solved letters', () => {
  const round = createRound(makeDeck('GAT'), 2, () => 0.99);
  assert.deepEqual(round.submit(0, '1'), { letter: '', correct: false, complete: false });
  assert.deepEqual(round.submit(0, 'X'), { letter: 'X', correct: false, complete: false });
  assert.equal(round.submit(0, 'G').correct, true);
  round.retry();
  assert.equal(round.submit(0, 'G').correct, true);
  assert.equal(round.results().halfStars, 10); // one mistake: still five stars
});

test('applies level 1–2 mistake thresholds and the minimum score', () => {
  assert.deepEqual(scoreRound(1, 0, 0), { halfStars: 10, perfect: true });
  assert.equal(scoreRound(2, 3, 0).halfStars, 10);
  assert.equal(scoreRound(2, 4, 0).halfStars, 9);
  assert.equal(scoreRound(1, 7, 0).halfStars, 9);
  assert.equal(scoreRound(1, 8, 0).halfStars, 8);
  assert.equal(scoreRound(2, 100, 0).halfStars, 5);
});

test('rounds level 3–4 quarter-star penalties to half stars', () => {
  assert.equal(scoreRound(3, 0, 0).halfStars, 10);
  assert.equal(scoreRound(3, 1, 0).perfect, false);
  assert.equal(scoreRound(3, 0, 1).halfStars, 10); // 4.75 stars rounds to five
  assert.equal(scoreRound(4, 0, 2).halfStars, 9); // 4.5 stars
  assert.equal(scoreRound(3, 0, 3).halfStars, 9); // 4.25 stars rounds to 4.5
  assert.equal(scoreRound(4, 1, 2).halfStars, 9);
  assert.equal(scoreRound(4, 0, 4).halfStars, 8); // 4 stars
  assert.equal(scoreRound(4, 1, 40).halfStars, 5);
});

test('penalizes each level 3 word at most once and advances through all eight words', () => {
  const round = createRound(makeDeck('GAT'), 3, () => 0.99);
  for (let word = 1; word <= WORDS_PER_ROUND; word++) {
    assert.equal(round.number, word);
    if (word === 1) {
      assert.equal(round.submit(1, 'X').correct, false);
      assert.equal(round.submit(1, 'A').correct, true);
      assert.equal(round.submit(2, 'T').correct, true);
      assert.equal(round.results().halfStars, 10); // one mistake is below two-hole threshold
    } else if (word === 2) {
      assert.equal(round.submit(1, 'X').correct, false);
      assert.equal(round.submit(1, 'X').correct, false);
      assert.equal(round.submit(1, 'A').correct, true);
      assert.equal(round.submit(2, 'T').correct, true);
      assert.equal(round.results().halfStars, 10); // one quarter-star rounds back to five stars
    } else if (word === 3) {
      assert.equal(round.submit(1, 'X').correct, false);
      assert.equal(round.submit(1, 'X').correct, false);
      assert.equal(round.submit(1, 'X').correct, false);
      assert.equal(round.submit(1, 'A').correct, true);
      assert.equal(round.submit(2, 'T').correct, true);
      assert.equal(round.results().halfStars, 9); // this word costs one quarter-star, once
    } else {
      assert.equal(round.submit(1, 'A').correct, true);
      assert.equal(round.submit(2, 'T').correct, true);
    }
    if (word < WORDS_PER_ROUND) assert.equal(round.advance(), true);
  }
  assert.equal(round.advance(), false);
});

test('requires at least eight words eligible for the selected level', () => {
  assert.throws(() => createRound(makeDeck('BCDF'), 1), /at least eight eligible words/);
  assert.throws(() => createRound(makeDeck('AEI'), 2), /at least eight eligible words/);
});
