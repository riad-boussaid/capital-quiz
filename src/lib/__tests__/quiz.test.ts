import { COUNTRIES } from '@/data/countries';
import {
  DIFFICULTY_OPTIONS,
  endlessDifficulty,
  endlessMode,
  generateQuestion,
  generateQuestions,
  mulberry32,
  POINTS_BASE,
  scoreAnswer,
  seedFromDate,
  shuffle,
  speedBonus,
  streakMultiplier,
  type Difficulty,
  type QuizSettings,
} from '@/lib/quiz';

function settings(overrides: Partial<QuizSettings> = {}): QuizSettings {
  return {
    mode: 'capital',
    difficulty: 'easy',
    timed: false,
    timePerQuestion: 30,
    questionCount: 10,
    ...overrides,
  };
}

describe('shuffle', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('keeps every element exactly once', () => {
    const output = shuffle(input);
    expect(output).toHaveLength(input.length);
    expect([...output].sort((a, b) => a - b)).toEqual(input);
  });

  it('does not mutate the input', () => {
    const before = [...input];
    shuffle(input);
    expect(input).toEqual(before);
  });

  it('produces different orders across runs', () => {
    const orders = new Set<string>();
    for (let i = 0; i < 20; i++) {
      orders.add(shuffle(input).join(','));
    }
    // Identity shuffle across 20 runs has probability ~1/10!^19 — effectively zero
    expect(orders.size).toBeGreaterThan(1);
  });

  it('handles a single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe('generateQuestions', () => {
  it('returns the requested number of questions', () => {
    expect(generateQuestions(settings({ questionCount: 12 }))).toHaveLength(12);
  });

  it('caps at the size of the country pool', () => {
    const questions = generateQuestions(settings({ questionCount: 500 }));
    expect(questions).toHaveLength(COUNTRIES.length);
  });

  it('never repeats a country within one run', () => {
    const questions = generateQuestions(settings({ questionCount: COUNTRIES.length }));
    const names = questions.map((q) => q.country.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('matches each difficulty to its option count', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as Difficulty[]) {
      const [question] = generateQuestions(settings({ difficulty, questionCount: 1 }));
      expect(question.options).toHaveLength(DIFFICULTY_OPTIONS[difficulty]);
    }
  });

  it('always includes the correct answer among unique options', () => {
    const questions = generateQuestions(settings({ questionCount: 30 }));
    for (const question of questions) {
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(question.options).toContain(question.correctAnswer);
    }
  });

  it('uses capitals as answers in capital mode', () => {
    const [question] = generateQuestions(settings({ mode: 'capital', questionCount: 1 }));
    expect(question.mode).toBe('capital');
    expect(question.correctAnswer).toBe(question.country.capital);
  });

  it('uses country names as answers in flag mode', () => {
    const [question] = generateQuestions(settings({ mode: 'flag', questionCount: 1 }));
    expect(question.mode).toBe('flag');
    expect(question.correctAnswer).toBe(question.country.name);
  });

  it('draws decoys only from valid answers of the same mode', () => {
    const capitals = new Set(COUNTRIES.map((c) => c.capital));
    const questions = generateQuestions(settings({ mode: 'capital', questionCount: 20 }));
    for (const question of questions) {
      for (const option of question.options) {
        expect(capitals.has(option)).toBe(true);
      }
    }
  });
});

describe('region decoys', () => {
  const countryForCapital = (capital: string) =>
    COUNTRIES.find((c) => c.capital === capital)!;
  const regionmatesOf = (country: { name: string; continent: string }) =>
    COUNTRIES.filter((c) => c.continent === country.continent && c.name !== country.name).length;

  it('draws every hard-mode decoy from the subject continent when possible', () => {
    const questions = generateQuestions(settings({ difficulty: 'hard', questionCount: 40 }));
    for (const question of questions) {
      if (regionmatesOf(question.country) < DIFFICULTY_OPTIONS.hard - 1) continue;
      for (const decoy of question.options) {
        if (decoy === question.correctAnswer) continue;
        expect(countryForCapital(decoy).continent).toBe(question.country.continent);
      }
    }
  });

  it('keeps easy mode solvable with a mix of regions', () => {
    // easy quota: round(3 × 0.5) = 2 same-region decoys, 1 from elsewhere
    const questions = generateQuestions(settings({ difficulty: 'easy', questionCount: 20 }));
    for (const question of questions) {
      if (regionmatesOf(question.country) < 2) continue;
      const decoys = question.options.filter((o) => o !== question.correctAnswer);
      const sameRegion = decoys.filter(
        (o) => countryForCapital(o).continent === question.country.continent,
      ).length;
      expect(sameRegion).toBe(2);
    }
  });
});

describe('missed-country weighting', () => {
  it('reserves part of a regular quiz for previously missed countries', () => {
    const missed = new Set(['Kenya', 'France', 'Brazil']);
    const questions = generateQuestions(settings({ questionCount: 10 }), Math.random, missed);
    const names = questions.map((q) => q.country.name);
    for (const name of missed) expect(names).toContain(name);
    expect(new Set(names).size).toBe(10);
  });

  it('stays deterministic for a given seed and missed set', () => {
    const missed = new Set(['Kenya', 'France', 'Brazil']);
    const a = generateQuestions(
      settings({ questionCount: 10 }),
      mulberry32(seedFromDate('2026-11-18')),
      missed,
    );
    const b = generateQuestions(
      settings({ questionCount: 10 }),
      mulberry32(seedFromDate('2026-11-18')),
      missed,
    );
    expect(a).toEqual(b);
  });

  it('uses an empty missed set by default (the daily path)', () => {
    const a = generateQuestions(settings({ questionCount: 10 }), mulberry32(seedFromDate('2026-11-18')));
    const b = generateQuestions(
      settings({ questionCount: 10 }),
      mulberry32(seedFromDate('2026-11-18')),
      new Set(),
    );
    expect(a).toEqual(b);
  });
});

describe('speedBonus', () => {
  it('pays the full bonus within 5 seconds', () => {
    expect(speedBonus(0)).toBe(5);
    expect(speedBonus(5)).toBe(5);
  });

  it('pays a reduced bonus within 10 seconds', () => {
    expect(speedBonus(5.01)).toBe(3);
    expect(speedBonus(10)).toBe(3);
  });

  it('pays nothing after 10 seconds', () => {
    expect(speedBonus(10.01)).toBe(0);
    expect(speedBonus(60)).toBe(0);
  });
});

describe('streakMultiplier', () => {
  it('pays 1× below three in a row', () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(2)).toBe(1);
  });

  it('pays 1.5× from three in a row', () => {
    expect(streakMultiplier(3)).toBe(1.5);
    expect(streakMultiplier(4)).toBe(1.5);
  });

  it('pays 2× from five in a row', () => {
    expect(streakMultiplier(5)).toBe(2);
    expect(streakMultiplier(12)).toBe(2);
  });
});

describe('scoreAnswer', () => {
  it('pays the base points for a slow first answer', () => {
    expect(scoreAnswer(20, 1).points).toBe(POINTS_BASE);
  });

  it('stacks speed bonus and streak multiplier', () => {
    // (10 + 5) × 2 — fastest answer on a 5+ streak
    expect(scoreAnswer(3, 5).points).toBe(30);
    // (10 + 3) × 1.5 = 19.5, rounded up
    expect(scoreAnswer(8, 3).points).toBe(20);
  });

  it('reports the breakdown for feedback display', () => {
    const award = scoreAnswer(12, 3);
    expect(award).toEqual({ points: 15, speedBonus: 0, multiplier: 1.5 });
  });
});

describe('endless mode', () => {
  it('ramps difficulty as the run gets longer', () => {
    expect(endlessDifficulty(0)).toBe('easy');
    expect(endlessDifficulty(4)).toBe('easy');
    expect(endlessDifficulty(5)).toBe('medium');
    expect(endlessDifficulty(9)).toBe('medium');
    expect(endlessDifficulty(10)).toBe('hard');
    expect(endlessDifficulty(50)).toBe('hard');
  });

  it('alternates question focus', () => {
    expect(endlessMode(0)).toBe('capital');
    expect(endlessMode(1)).toBe('flag');
    expect(endlessMode(2)).toBe('capital');
  });

  it('generates a valid single question', () => {
    for (const mode of ['capital', 'flag'] as const) {
      const question = generateQuestion(mode, 'easy');
      expect(question.mode).toBe(mode);
      expect(question.options).toHaveLength(DIFFICULTY_OPTIONS.easy);
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(question.options).toContain(question.correctAnswer);
      expect(question.correctAnswer).toBe(
        mode === 'capital' ? question.country.capital : question.country.name,
      );
    }
  });

  it('avoids countries already played in the run', () => {
    const exclude = new Set(COUNTRIES.slice(0, 20).map((c) => c.name));
    for (let i = 0; i < 20; i++) {
      const question = generateQuestion('capital', 'easy', exclude);
      expect(exclude.has(question.country.name)).toBe(false);
    }
  });

  it('falls back to the full pool when everything is excluded', () => {
    const exclude = new Set(COUNTRIES.map((c) => c.name));
    const question = generateQuestion('capital', 'easy', exclude);
    expect(COUNTRIES.some((c) => c.name === question.country.name)).toBe(true);
  });
});
