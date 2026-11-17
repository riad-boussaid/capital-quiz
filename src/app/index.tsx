import { useRouter } from 'expo-router';
import { Check, Flag as FlagIcon, Globe, Landmark, Play, Trophy } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Segmented } from '@/components/segmented';
import type { Difficulty, QuizMode } from '@/lib/quiz';
import { useUiColors } from '@/lib/theme';
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

export default function HomeScreen() {
  const router = useRouter();
  const { bestFor } = useScores();
  const colors = useUiColors();

  const [mode, setMode] = useState<QuizMode>('capital');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timed, setTimed] = useState<TimedOption>('off');

  const timedLabel = timed === 'off' ? 'off' : timed;
  const best = bestFor(scoreKey(mode, difficulty, timedLabel));

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

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 w-full max-w-[800px] self-center">
        {/* Padding lives on an inner View: className padding on SafeAreaView
            doesn't apply on web through the cssInterop mapping. */}
        <View className="flex-1 px-6 pt-8">
        <View className="items-center gap-3">
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

        <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-edge bg-card p-4">
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

        <View className="mt-auto gap-2.5 pb-4 pt-6">
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
