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

const STORAGE_KEY = 'capital-quiz/best-scores';

export function scoreKey(mode: string, difficulty: string, timedLabel: string): string {
  return `${mode}-${difficulty}-${timedLabel}`;
}

interface ScoresContextValue {
  bestScores: Record<string, number>;
  bestFor: (key: string) => number;
  recordResult: (key: string, score: number) => boolean;
  ready: boolean;
}

const ScoresContext = createContext<ScoresContextValue | null>(null);

export function ScoresProvider({ children }: { children: ReactNode }) {
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) setBestScores(JSON.parse(raw) as Record<string, number>);
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bestScores)).catch(() => {
      // ignore persistence errors
    });
  }, [bestScores, ready]);

  const bestFor = useCallback(
    (key: string) => bestScores[key] ?? 0,
    [bestScores],
  );

  const recordResult = useCallback(
    (key: string, score: number) => {
      const isNewBest = score > (bestScores[key] ?? 0);
      if (isNewBest) {
        setBestScores((prev) =>
          score > (prev[key] ?? 0) ? { ...prev, [key]: score } : prev,
        );
      }
      return isNewBest;
    },
    [bestScores],
  );

  const value = useMemo<ScoresContextValue>(
    () => ({ bestScores, bestFor, recordResult, ready }),
    [bestScores, bestFor, recordResult, ready],
  );

  return <ScoresContext.Provider value={value}>{children}</ScoresContext.Provider>;
}

export function useScores(): ScoresContextValue {
  const ctx = useContext(ScoresContext);
  if (!ctx) throw new Error('useScores must be used within a ScoresProvider');
  return ctx;
}