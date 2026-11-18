export interface DailyResult {
  score: number;
  correct: number;
  total: number;
}

export function todayKey(now: Date = new Date()): string {
  // Local date, deliberately not toISOString(): UTC would flip the day near
  // midnight for timezones ahead of UTC.
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function previousDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return todayKey(dt);
}

// A replay of an already-completed day never changes the streak; otherwise a
// completion the day after the last one extends it, and any later restarts it.
export function nextStreak(
  lastCompletedDate: string | null,
  currentStreak: number,
  date: string,
): number {
  if (lastCompletedDate === date) return currentStreak;
  return lastCompletedDate === previousDay(date) ? currentStreak + 1 : 1;
}
