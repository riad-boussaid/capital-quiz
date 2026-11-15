import { COUNTRIES } from '@/data/countries';
import {
  DIFFICULTY_OPTIONS,
  POINTS_PER_CORRECT,
  generateQuestions,
  shuffle,
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

describe('constants', () => {
  it('awards 10 points per correct answer', () => {
    expect(POINTS_PER_CORRECT).toBe(10);
  });
});
