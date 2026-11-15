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

export const POINTS_PER_CORRECT = 10;

export function shuffle<T>(input: readonly T[]): T[] {
  const copy = [...input];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function answerFor(mode: QuizMode, country: Country): string {
  return mode === 'capital' ? country.capital : country.name;
}

function buildOptions(mode: QuizMode, subject: Country, count: number): string[] {
  const correct = answerFor(mode, subject);
  const candidates = shuffle(COUNTRIES.filter((c) => answerFor(mode, c) !== correct));
  const decoys = new Set<string>();
  for (const c of candidates) {
    if (decoys.size >= count - 1) break;
    decoys.add(answerFor(mode, c));
  }
  return shuffle([correct, ...decoys]);
}

export function generateQuestions(settings: QuizSettings): Question[] {
  const optionCount = DIFFICULTY_OPTIONS[settings.difficulty];
  const pool = shuffle(COUNTRIES).slice(0, settings.questionCount);
  return pool.map((country) => {
    const correctAnswer = answerFor(settings.mode, country);
    return {
      country,
      correctAnswer,
      mode: settings.mode,
      options: buildOptions(settings.mode, country, optionCount),
    };
  });
}