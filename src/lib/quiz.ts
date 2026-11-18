import { COUNTRIES, type Country } from '@/data/countries';

export type QuizMode = 'capital' | 'flag';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizSettings {
  mode: QuizMode;
  difficulty: Difficulty;
  timed: boolean;
  timePerQuestion: number;
  questionCount: number;
}

export interface Question {
  country: Country;
  options: string[];
  correctAnswer: string;
  mode: QuizMode;
}

export const DIFFICULTY_OPTIONS: Record<Difficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
};

export const POINTS_BASE = 10;

export interface Award {
  points: number;
  speedBonus: number;
  multiplier: number;
}

// Fast answers earn a bonus on top of the base: <=5s is +5, <=10s is +3.
export function speedBonus(elapsedSeconds: number): number {
  if (elapsedSeconds <= 5) return 5;
  if (elapsedSeconds <= 10) return 3;
  return 0;
}

// Consecutive correct answers ramp up: 3+ in a row pays 1.5×, 5+ pays 2×.
export function streakMultiplier(streak: number): number {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

// Points for one correct answer answered after `elapsedSeconds`, counting the
// streak *including* this answer. Max is (10 + 5) × 2 = 30 per question.
export function scoreAnswer(elapsedSeconds: number, streak: number): Award {
  const speed = speedBonus(elapsedSeconds);
  const multiplier = streakMultiplier(streak);
  return {
    points: Math.round((POINTS_BASE + speed) * multiplier),
    speedBonus: speed,
    multiplier,
  };
}

export function shuffle<T>(input: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...input];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Deterministic PRNG so a given date always produces the same daily quiz.
// https://en.wikipedia.org/wiki/Mulberry32
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromDate(date: string): number {
  // "2026-11-18" -> 20261118
  return Number(date.replace(/-/g, '')) || 0;
}

export const DAILY_QUESTION_COUNT = 10;
export const DAILY_DIFFICULTY: Difficulty = 'medium';

// The daily quiz alternates focus so the same players aren't always drilling
// capitals: even days quiz country -> capital, odd days flag -> country.
export function dailyMode(date: string): QuizMode {
  const day = Number(date.slice(-2));
  return Number.isNaN(day) || day % 2 === 0 ? 'capital' : 'flag';
}

export const ENDLESS_LIVES = 3;
export const ENDLESS_SCORE_KEY = 'endless-mixed';

// Endless ramps the option count as the run gets longer.
export function endlessDifficulty(index: number): Difficulty {
  if (index < 5) return 'easy';
  if (index < 10) return 'medium';
  return 'hard';
}

// Endless alternates capitals and flags so no two consecutive questions drill
// the same skill.
export function endlessMode(index: number): QuizMode {
  return index % 2 === 0 ? 'capital' : 'flag';
}

// One question for endless mode, avoiding countries already used in the run
// (falling back to the full pool only when everything has been played).
export function generateQuestion(
  mode: QuizMode,
  difficulty: Difficulty,
  exclude: ReadonlySet<string> = new Set(),
): Question {
  const optionCount = DIFFICULTY_OPTIONS[difficulty];
  const pool = COUNTRIES.filter((c) => !exclude.has(c.name));
  const source = pool.length > 0 ? pool : COUNTRIES;
  const country = source[Math.floor(Math.random() * source.length)];
  return {
    country,
    correctAnswer: answerFor(mode, country),
    mode,
    options: buildOptions(mode, country, difficulty, optionCount),
  };
}

function answerFor(mode: QuizMode, country: Country): string {
  return mode === 'capital' ? country.capital : country.name;
}

// Share of decoys drawn from the subject's own continent, per difficulty:
// random decoys are free answers, same-region ones make mistakes feel fair.
const REGION_SHARE: Record<Difficulty, number> = { easy: 0.5, medium: 0.75, hard: 1 };

function buildOptions(
  mode: QuizMode,
  subject: Country,
  difficulty: Difficulty,
  count: number,
  rng: () => number = Math.random,
): string[] {
  const correct = answerFor(mode, subject);
  const others = COUNTRIES.filter((c) => answerFor(mode, c) !== correct);
  const sameRegion = shuffle(
    others.filter((c) => c.continent === subject.continent),
    rng,
  );
  const elsewhere = shuffle(
    others.filter((c) => c.continent !== subject.continent),
    rng,
  );
  const quota = Math.min(sameRegion.length, Math.round((count - 1) * REGION_SHARE[difficulty]));
  const decoys = new Set([
    ...sameRegion.slice(0, quota).map((c) => answerFor(mode, c)),
    ...elsewhere.slice(0, count - 1 - quota).map((c) => answerFor(mode, c)),
  ]);
  return shuffle([correct, ...decoys], rng);
}

// Share of a regular quiz's questions reserved for previously missed
// countries, so the quiz quietly drills what the player struggles with.
export const MISSED_SHARE = 0.4;

// The optional rng makes generation reproducible: callers pass mulberry32(seed)
// for the daily challenge so everyone gets the same questions on a given day.
// `missed` is a set of country names to prioritize (regular quizzes only —
// the daily quiz must stay identical for everyone).
export function generateQuestions(
  settings: QuizSettings,
  rng: () => number = Math.random,
  missed: ReadonlySet<string> = new Set(),
): Question[] {
  const optionCount = DIFFICULTY_OPTIONS[settings.difficulty];
  const shuffled = shuffle(COUNTRIES, rng);
  const missedPool = shuffled.filter((c) => missed.has(c.name));
  const freshPool = shuffled.filter((c) => !missed.has(c.name));
  const missedCount = Math.min(missedPool.length, Math.floor(settings.questionCount * MISSED_SHARE));
  const pool = [...missedPool.slice(0, missedCount), ...freshPool].slice(0, settings.questionCount);
  return pool.map((country) => {
    const correctAnswer = answerFor(settings.mode, country);
    return {
      country,
      correctAnswer,
      mode: settings.mode,
      options: buildOptions(settings.mode, country, settings.difficulty, optionCount, rng),
    };
  });
}