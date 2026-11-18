import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const MUTE_KEY = 'capital-quiz/muted';

const SOURCES = {
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  streak: require('../../assets/sounds/streak.wav'),
  finish: require('../../assets/sounds/finish.wav'),
  tick: require('../../assets/sounds/tick.wav'),
} as const;

export type SfxName = keyof typeof SOURCES;

let players: Partial<Record<SfxName, AudioPlayer>> = {};
let muted = false;
let initialized = false;

// Called once from the root layout; safe to call again (no-ops).
export async function initAudio(): Promise<void> {
  if (initialized || Platform.OS === 'web') return;
  initialized = true;
  try {
    const raw = await AsyncStorage.getItem(MUTE_KEY);
    muted = raw === '1';
    await setAudioModeAsync({ playsInSilentMode: true });
    players = Object.fromEntries(
      (Object.keys(SOURCES) as SfxName[]).map((name) => [name, createAudioPlayer(SOURCES[name])]),
    );
  } catch {
    // Audio is best-effort: a failed init just means silent feedback.
    players = {};
  }
}

export function isMuted(): boolean {
  return muted;
}

export async function setMuted(next: boolean): Promise<void> {
  muted = next;
  await AsyncStorage.setItem(MUTE_KEY, next ? '1' : '0').catch(() => {
    // ignore persistence errors
  });
}

export function playSfx(name: SfxName): void {
  if (Platform.OS === 'web' || muted) return;
  const player = players[name];
  if (!player) return;
  void player.seekTo(0);
  player.play();
}
