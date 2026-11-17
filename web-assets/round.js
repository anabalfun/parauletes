export const WORDS_PER_ROUND = 8;

function shuffle(items, random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function baseVowel(letter) {
  const base = letter.normalize('NFD').replace(/\p{M}/gu, '');
  return /^[AEIOU]$/.test(base) ? base : '';
}

function chooseBlanks(letters, level, random) {
  const positions = letters.map((_, position) => position);
  if (level === 4) return positions;
  if (level === 3) return positions.slice(1);

  const vowels = shuffle(positions.filter(position => baseVowel(letters[position])), random);
  if (level === 1) {
    const count = random() < 0.5 ? 1 : 2;
    return vowels.slice(0, Math.min(count, letters.length - 1));
  }

  const consonants = shuffle(positions.filter(position => !baseVowel(letters[position])), random);
  return [vowels[0], consonants[0]];
}

export function scoreRound(level, mistakes, penalizedWords) {
  // On levels 3–4, count quarter stars first, then round to the nearest half.
  const halfStars = level <= 2
    ? 10 - Math.floor(mistakes / 4)
    : Math.round((20 - penalizedWords) / 2);
  return { halfStars: Math.max(5, halfStars), perfect: mistakes === 0 };
}

export function createRound(deck, level, random = Math.random) {
  const cards = deck.map(card => ({ ...card, letters: Array.from(card.word) }));
  const eligible = cards.filter(({ letters }) => {
    if (level === 1) return letters.some(baseVowel);
    if (level === 2) return letters.some(baseVowel) && letters.some(letter => !baseVowel(letter));
    return true;
  });
  const selected = shuffle(eligible, random).slice(0, WORDS_PER_ROUND);
  if (selected.length < WORDS_PER_ROUND) {
    throw new Error('The deck must contain at least eight eligible words.');
  }

  let index = -1;
  let blanks;
  let solved;
  let mistakes = 0;
  let wordMistakes = 0;
  let penalizedWords = 0;

  function advance() {
    index++;
    if (index === selected.length) return false;
    blanks = new Set(chooseBlanks(selected[index].letters, level, random));
    solved = new Set();
    wordMistakes = 0;
    return true;
  }

  advance();

  return {
    level,
    get number() {
      return index + 1;
    },
    get card() {
      return selected[index];
    },
    isBlank(position) {
      return blanks.has(position);
    },
    retry() {
      solved.clear();
    },
    submit(position, value) {
      if (!blanks.has(position) || solved.has(position)) return null;

      const typed = value.normalize('NFC').toUpperCase().match(/\p{L}/gu)?.at(-1) ?? '';
      if (!typed) return { letter: '', correct: false, complete: false };

      const expected = selected[index].letters[position];
      if (typed !== expected && typed !== baseVowel(expected)) {
        mistakes++;
        wordMistakes++;
        return { letter: typed, correct: false, complete: false };
      }

      solved.add(position);
      const complete = solved.size === blanks.size;
      if (complete && level >= 3 && wordMistakes >= blanks.size) penalizedWords++;
      return { letter: expected, correct: true, complete };
    },
    advance,
    results() {
      return scoreRound(level, mistakes, penalizedWords);
    },
  };
}
