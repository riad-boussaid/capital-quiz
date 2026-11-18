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

const STORAGE_KEY = 'capital-quiz/missed';

interface MissedContextValue {
  // Country name -> times missed. A correct answer clears the entry, so the
  // map always reflects what the player is struggling with right now.
  missed: Record<string, number>;
  recordMiss: (country: string) => void;
  recordHit: (country: string) => void;
  ready: boolean;
}

const MissedContext = createContext<MissedContextValue | null>(null);

export function MissedProvider({ children }: { children: ReactNode }) {
  const [missed, setMissed] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) setMissed(JSON.parse(raw) as Record<string, number>);
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(missed)).catch(() => {
      // ignore persistence errors
    });
  }, [missed, ready]);

  const recordMiss = useCallback((country: string) => {
    setMissed((prev) => ({ ...prev, [country]: (prev[country] ?? 0) + 1 }));
  }, []);

  const recordHit = useCallback((country: string) => {
    setMissed((prev) => {
      if (!(country in prev)) return prev;
      const next = { ...prev };
      delete next[country];
      return next;
    });
  }, []);

  const value = useMemo<MissedContextValue>(
    () => ({ missed, recordMiss, recordHit, ready }),
    [missed, recordMiss, recordHit, ready],
  );

  return <MissedContext.Provider value={value}>{children}</MissedContext.Provider>;
}

export function useMissed(): MissedContextValue {
  const ctx = useContext(MissedContext);
  if (!ctx) throw new Error('useMissed must be used within a MissedProvider');
  return ctx;
}
