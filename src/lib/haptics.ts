import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const HAPTICS_KEY = 'capital-quiz/haptics';

let enabled = true;
let initialized = false;

// Called once from the root layout; safe to call again (no-ops).
export async function initHaptics(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const raw = await AsyncStorage.getItem(HAPTICS_KEY);
    enabled = raw !== '0';
  } catch {
    // keep the default
  }
}

export function isHapticsEnabled(): boolean {
  return enabled;
}

export async function setHapticsEnabled(next: boolean): Promise<void> {
  enabled = next;
  await AsyncStorage.setItem(HAPTICS_KEY, next ? '1' : '0').catch(() => {
    // ignore persistence errors
  });
}

export function playFeedbackHaptic(ok: boolean): void {
  if (Platform.OS === 'web' || !enabled) return;
  Haptics.notificationAsync(
    ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  ).catch(() => {
    // haptics are best-effort
  });
}
