import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  CalendarDays,
  Check,
  ChevronRight,
  Flag as FlagIcon,
  Flame,
  Globe,
  Infinity as InfinityIcon,
  Landmark,
  Play,
  Settings2,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Segmented } from '@/components/segmented';
import { todayKey } from '@/lib/daily';
import {
  dailyMode,
  DAILY_DIFFICULTY,
  DAILY_QUESTION_COUNT,
  ENDLESS_SCORE_KEY,
} from '@/lib/quiz';
import { isMuted, setMuted } from '@/lib/sound';
import type { Difficulty, QuizMode } from '@/lib/quiz';
import { useUiColors } from '@/lib/theme';
import { useDaily } from '@/store/DailyContext';
import { scoreKey, useScores } from '@/store/ScoresContext';

type TimedOption = 'off' | '10' | '20' | '30';

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const TIMED_OPTIONS: { value: TimedOption; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: '10', label: '10s' },
  { value: '20', label: '20s' },
  { value: '30', label: '30s' },
];

const MODES: { value: QuizMode; title: string; subtitle: string; icon: typeof Landmark }[] = [
  { value: 'capital', title: 'Capital Quiz', subtitle: 'Country → capital', icon: Landmark },
  { value: 'flag', title: 'Flag Quiz', subtitle: 'Flag → country', icon: FlagIcon },
];

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const SETTINGS_KEY = 'capital-quiz/last-settings';

interface LastSettings {
  mode: QuizMode;
  difficulty: Difficulty;
  timed: TimedOption;
}

// Tolerant parse: anything unexpected in storage falls back to defaults
// instead of breaking the home screen.
function parseLastSettings(raw: string | null): LastSettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LastSettings>;
    const validMode = parsed.mode === 'capital' || parsed.mode === 'flag';
    const validDifficulty =
      parsed.difficulty === 'easy' || parsed.difficulty === 'medium' || parsed.difficulty === 'hard';
    const validTimed = ['off', '10', '20', '30'].includes(parsed.timed as TimedOption);
    if (!validMode || !validDifficulty || !validTimed) return null;
    return {
      mode: parsed.mode as QuizMode,
      difficulty: parsed.difficulty as Difficulty,
      timed: parsed.timed as TimedOption,
    };
  } catch {
    return null;
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { bestFor } = useScores();
  const { dayStreak, isCompletedToday, todayResult } = useDaily();
  const colors = useUiColors();

  const [mode, setMode] = useState<QuizMode>('capital');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timed, setTimed] = useState<TimedOption>('off');
  const [muted, setMutedState] = useState(isMuted());
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Quick Play starts with the last configuration the player chose, so a
  // returning player never has to re-pick settings.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = parseLastSettings(await AsyncStorage.getItem(SETTINGS_KEY));
        if (saved && !cancelled) {
          setMode(saved.mode);
          setDifficulty(saved.difficulty);
          setTimed(saved.timed);
        }
      } catch {
        // ignore read errors — defaults are fine
      } finally {
        if (!cancelled) setSettingsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Only persist once the saved settings have loaded, otherwise mount
    // defaults would overwrite the player's real preferences.
    if (!settingsLoaded) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode, difficulty, timed })).catch(() => {
      // ignore persistence errors
    });
  }, [mode, difficulty, timed, settingsLoaded]);

  // Sound can also be changed in Settings, so refresh the toggle on return.
  useFocusEffect(
    useCallback(() => {
      setMutedState(isMuted());
    }, []),
  );

  const onToggleMute = () => {
    const next = !muted;
    setMutedState(next);
    void setMuted(next);
  };

  const timedLabel = timed === 'off' ? 'off' : timed;
  const best = bestFor(scoreKey(mode, difficulty, timedLabel));
  const endlessBest = bestFor(ENDLESS_SCORE_KEY);

  // The daily challenge is fixed per day: seeded questions, medium difficulty,
  // untimed, and the focus (capitals vs flags) alternates with the date.
  const dailyDate = todayKey();
  const dailyQuizMode = dailyMode(dailyDate);

  // Wide screens (tablets, web, landscape) get the two side cards in a row;
  // phones keep the single-column stack.
  const { width } = useWindowDimensions();
  const wide = width >= 600;

  const start = () => {
    const timedOn = timed !== 'off';
    router.push({
      pathname: '/quiz',
      params: {
        mode,
        difficulty,
        timed: timedOn ? '1' : '0',
        time: timedOn ? timed : '0',
        count: '10',
      },
    });
  };

  const startEndless = () => {
    router.push({ pathname: '/quiz', params: { endless: '1' } });
  };

  const startDaily = () => {
    router.push({
      pathname: '/quiz',
      params: {
        daily: '1',
        date: dailyDate,
        mode: dailyQuizMode,
        difficulty: DAILY_DIFFICULTY,
        timed: '0',
        time: '0',
        count: String(DAILY_QUESTION_COUNT),
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 w-full max-w-[800px] self-center">
        {/* Padding lives on an inner View: className padding on SafeAreaView
            doesn't apply on web through the cssInterop mapping. */}
        <View className="flex-1 px-6 pt-8">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 4 }}
          showsVerticalScrollIndicator={false}>
        <View className="items-center gap-3">
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
            className="absolute left-0 top-0 h-9 w-9 items-center justify-center rounded-full bg-element active:opacity-70">
            <Settings2 size={17} color={colors.content} strokeWidth={2.5} />
          </Pressable>
          <Pressable
            onPress={onToggleMute}
            accessibilityLabel={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="absolute right-0 top-0 h-9 w-9 items-center justify-center rounded-full bg-element active:opacity-70">
            {muted ? (
              <VolumeX size={17} color={colors.muted} strokeWidth={2.5} />
            ) : (
              <Volume2 size={17} color={colors.content} strokeWidth={2.5} />
            )}
          </Pressable>
          <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-primary">
            <Globe size={28} color="#ffffff" strokeWidth={2} />
          </View>
          <View className="items-center gap-1">
            <Text className="text-center text-[26px] font-bold leading-8 text-content">
              Capital Quiz
            </Text>
            <Text className="text-sm text-muted">Test your world knowledge</Text>
          </View>
        </View>

        <Pressable
          onPress={start}
          accessibilityLabel="Quick play"
          className="mt-5 flex-row items-center gap-3 rounded-2xl bg-primary p-4 active:opacity-80">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Play size={18} color="#ffffff" fill="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-primaryText">Quick Play</Text>
            <Text className="mt-0.5 text-xs text-primaryText opacity-80" numberOfLines={1}>
              {mode === 'capital' ? 'Capital' : 'Flag'} · {DIFFICULTY_LABELS[difficulty]} ·{' '}
              {timed === 'off' ? 'Untimed' : `${timed}s timer`}
            </Text>
          </View>
          <ChevronRight size={18} color="#ffffff" strokeWidth={2.5} />
        </Pressable>

        <View className={`mt-3 ${wide ? 'flex-row gap-3' : 'gap-3'}`}>
        <Pressable
          onPress={startDaily}
          accessibilityLabel="Play the daily challenge"
          className={`flex-row items-center gap-3 rounded-2xl border border-edge bg-card p-4 active:opacity-80 ${
            wide ? 'flex-1' : ''
          }`}>
          <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-amberSoft">
            <CalendarDays size={18} color={colors.amber} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-[13px] font-bold text-content">Daily Challenge</Text>
              {dayStreak > 0 && (
                <View className="flex-row items-center gap-1 rounded-full bg-amberSoft px-2 py-0.5">
                  <Flame size={11} color={colors.amber} />
                  <Text className="text-[11px] font-bold text-amber tabular-nums">
                    {dayStreak}
                  </Text>
                </View>
              )}
            </View>
            <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
              {isCompletedToday && todayResult
                ? `Done — ${todayResult.score} pts today · replay`
                : `Today: ${dailyQuizMode === 'capital' ? 'capitals' : 'flags'} · ${DAILY_QUESTION_COUNT} questions`}
            </Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Play size={14} color="#ffffff" fill="#ffffff" />
          </View>
        </Pressable>

        <Pressable
          onPress={startEndless}
          accessibilityLabel="Play endless mode"
          className={`flex-row items-center gap-3 rounded-2xl border border-edge bg-card p-4 active:opacity-80 ${
            wide ? 'flex-1' : ''
          }`}>
          <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-primarySoft">
            <InfinityIcon size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-bold text-content">Endless</Text>
            <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
              Mixed · 3 lives{endlessBest > 0 ? ` · Best ${endlessBest}` : ''}
            </Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Play size={14} color="#ffffff" fill="#ffffff" />
          </View>
        </Pressable>
        </View>

        <View className="mt-3 flex-row items-center gap-3 rounded-2xl border border-edge bg-card p-4">
          <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-primarySoft">
            <Trophy size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-bold text-content">Personal best</Text>
            <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
              {best > 0
                ? `${mode === 'capital' ? 'Capital' : 'Flag'} Quiz · ${DIFFICULTY_LABELS[difficulty]} · ${
                    timed === 'off' ? 'Untimed' : `${timed}s timer`
                  }`
                : 'No record yet — play a round to set one!'}
            </Text>
          </View>
          {best > 0 && (
            <Text className="text-xl font-bold text-content tabular-nums">
              {best}
              <Text className="text-xs font-semibold text-muted"> pts</Text>
            </Text>
          )}
        </View>

        <Text className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-muted">
          Game mode
        </Text>
        <View className="flex-row gap-3">
          {MODES.map((m) => {
            const selected = m.value === mode;
            const Icon = m.icon;
            return (
              <Pressable
                key={m.value}
                onPress={() => setMode(m.value)}
                className={`relative flex-1 items-center gap-1.5 rounded-2xl border-[1.5px] px-3 pb-3 pt-4 ${
                  selected ? 'border-primary bg-primarySoft' : 'border-edge bg-card'
                } active:opacity-80`}>
                {selected && (
                  <View className="absolute right-2 top-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check size={12} color="#ffffff" strokeWidth={3} />
                  </View>
                )}
                <View
                  className={`h-11 w-11 items-center justify-center rounded-[14px] ${
                    selected ? 'bg-primary' : 'bg-element'
                  }`}>
                  <Icon size={22} color={selected ? '#ffffff' : colors.muted} />
                </View>
                <Text
                  className={`text-[13px] font-bold ${selected ? 'text-primary' : 'text-content'}`}>
                  {m.title}
                </Text>
                <Text className="text-[11px] text-muted">{m.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-muted">
          Difficulty
        </Text>
        <Segmented options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />

        <Text className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-muted">
          Timer per question
        </Text>
        <Segmented options={TIMED_OPTIONS} value={timed} onChange={setTimed} />

        </ScrollView>
        <View className="gap-2.5 pb-4 pt-3">
          <Pressable
            onPress={start}
            className="h-[54px] flex-row items-center justify-center gap-2 rounded-2xl bg-primary active:opacity-80">
            <Play size={17} color="#ffffff" fill="#ffffff" />
            <Text className="font-bold text-primaryText">Start Quiz</Text>
          </Pressable>
          <Text className="text-center text-xs text-muted">
            10 questions · {DIFFICULTY_LABELS[difficulty]} ·{' '}
            {timed === 'off' ? 'Untimed' : `${timed}s timer`}
          </Text>
        </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
