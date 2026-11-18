import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { nextStreak, todayKey, type DailyResult } from '@/lib/daily';

const STORAGE_KEY = 'capital-quiz/daily';

interface DailyState {
  lastCompletedDate: string | null;
  dayStreak: number;
  history: Record<string, DailyResult>;
}

const EMPTY_STATE: DailyState = { lastCompletedDate: null, dayStreak: 0, history: {} };

export interface RecordOutcome {
  dayStreak: number;
  prevBest: number;
  isNewBest: boolean;
}

interface DailyContextValue {
  dayStreak: number;
  isCompletedToday: boolean;
  todayResult: DailyResult | null;
  recordDailyResult: (date: string, result: DailyResult) => RecordOutcome;
  ready: boolean;
}

const DailyContext = createContext<DailyContextValue | null>(null);

export function DailyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DailyState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) setState(JSON.parse(raw) as DailyState);
      } catch {
        // ignore corrupted storage
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // ignore persistence errors
    });
  }, [state, ready]);

  const recordDailyResult = useCallback(
    (date: string, result: DailyResult): RecordOutcome => {
      const prevBest = Math.max(0, ...Object.values(state.history).map((r) => r.score));
      const isNewBest = result.score > prevBest;
      const streak = nextStreak(state.lastCompletedDate, state.dayStreak, date);
      setState({
        lastCompletedDate: date,
        dayStreak: streak,
        history: { ...state.history, [date]: result },
      });
      return { dayStreak: streak, prevBest, isNewBest };
    },
    [state],
  );

  const value = useMemo<DailyContextValue>(
    () => ({
      dayStreak: state.dayStreak,
      isCompletedToday: state.lastCompletedDate === todayKey(),
      todayResult: state.history[todayKey()] ?? null,
      recordDailyResult,
      ready,
    }),
    [state, recordDailyResult, ready],
  );

  return <DailyContext.Provider value={value}>{children}</DailyContext.Provider>;
}

export function useDaily(): DailyContextValue {
  const ctx = useContext(DailyContext);
  if (!ctx) throw new Error('useDaily must be used within a DailyProvider');
  return ctx;
}
