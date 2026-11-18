import {
  dailyMode,
  DAILY_QUESTION_COUNT,
  generateQuestions,
  mulberry32,
  seedFromDate,
  shuffle,
} from '@/lib/quiz';
import { nextStreak, previousDay, todayKey } from '@/lib/daily';
import type { QuizSettings } from '@/lib/quiz';

function dailySettings(date: string): QuizSettings {
  return {
    mode: dailyMode(date),
    difficulty: 'medium',
    timed: false,
    timePerQuestion: 0,
    questionCount: DAILY_QUESTION_COUNT,
  };
}

describe('seeded rng', () => {
  it('derives a stable numeric seed from the date', () => {
    expect(seedFromDate('2026-11-18')).toBe(20261118);
    expect(seedFromDate('2026-11-18')).toBe(seedFromDate('2026-11-18'));
  });

  it('is deterministic and bounded', () => {
    const draw = () => {
      const rng = mulberry32(42);
      return [rng(), rng(), rng()];
    };
    const a = draw();
    const b = draw();
    expect(b).toEqual(a);
    expect(a.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it('makes shuffle reproducible and complete', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffle(input, mulberry32(7));
    const b = shuffle(input, mulberry32(7));
    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(input);
  });
});

describe('daily challenge', () => {
  it('alternates focus with the day of month', () => {
    expect(dailyMode('2026-11-18')).toBe('capital'); // even day
    expect(dailyMode('2026-11-19')).toBe('flag'); // odd day
  });

  it('returns the same questions for the same date', () => {
    const seed = seedFromDate('2026-11-18');
    const a = generateQuestions(dailySettings('2026-11-18'), mulberry32(seed));
    const b = generateQuestions(dailySettings('2026-11-18'), mulberry32(seed));
    expect(a).toEqual(b);
    expect(a).toHaveLength(DAILY_QUESTION_COUNT);
  });

  it('returns different questions on a different day', () => {
    const a = generateQuestions(
      dailySettings('2026-11-18'),
      mulberry32(seedFromDate('2026-11-18')),
    );
    const b = generateQuestions(
      dailySettings('2026-11-19'),
      mulberry32(seedFromDate('2026-11-19')),
    );
    expect(a).not.toEqual(b);
  });
});

describe('day streak', () => {
  const local = (y: number, m: number, d: number) => new Date(y, m - 1, d);

  it('formats the local date as YYYY-MM-DD', () => {
    expect(todayKey(local(2026, 1, 5))).toBe('2026-01-05');
    expect(todayKey(local(2026, 11, 18))).toBe('2026-11-18');
  });

  it('computes the previous day across month boundaries', () => {
    expect(previousDay('2026-11-01')).toBe('2026-10-31');
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
    expect(previousDay('2026-11-18')).toBe('2026-11-17');
  });

  it('starts at 1 on the first completed day', () => {
    expect(nextStreak(null, 0, '2026-11-18')).toBe(1);
    expect(nextStreak('2026-11-01', 4, '2026-11-18')).toBe(1);
  });

  it('extends when played on consecutive days', () => {
    expect(nextStreak('2026-11-17', 4, '2026-11-18')).toBe(5);
    expect(nextStreak('2026-10-31', 9, '2026-11-01')).toBe(10);
  });

  it('never changes on a same-day replay', () => {
    expect(nextStreak('2026-11-18', 5, '2026-11-18')).toBe(5);
    expect(nextStreak('2026-11-18', 0, '2026-11-18')).toBe(0);
  });
});
