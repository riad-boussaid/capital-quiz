import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Flag } from '@/components/flag';
import type { Difficulty, QuizMode } from '@/lib/quiz';
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

const MODES: { value: QuizMode; title: string; subtitle: string; emoji: string }[] = [
  { value: 'capital', title: 'Capital Quiz', subtitle: 'Country → capital', emoji: '🏛️' },
  { value: 'flag', title: 'Flag Quiz', subtitle: 'Flag → country', emoji: '🚩' },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row gap-0.5 rounded-xl bg-element p-0.5">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-[10px] py-2 ${
              selected ? 'bg-primary' : ''
            }`}>
            <Text
              className={`text-xs font-bold ${
                selected ? 'text-primaryText' : 'text-muted'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { bestFor } = useScores();

  const [mode, setMode] = useState<QuizMode>('capital');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timed, setTimed] = useState<TimedOption>('off');

  const best = bestFor(scoreKey(mode, difficulty, timed));

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
      <SafeAreaView className="flex-1 w-full max-w-[800px] self-center gap-4 px-6 pt-8">
        <View className="items-center gap-2">
          <Flag emoji="🌍" size={44} />
          <Text className="text-center text-[32px] font-semibold leading-[44px] text-content">
            Capital Quiz
          </Text>
          <Text className="text-sm text-muted">Test your world knowledge</Text>
        </View>

        <View className="gap-2">
          <Text className="text-xs font-bold text-muted">Game mode</Text>
          <View className="flex-row gap-4">
            {MODES.map((m) => {
              const selected = m.value === mode;
              return (
                <Pressable
                  key={m.value}
                  onPress={() => setMode(m.value)}
                  className={`flex-1 items-center gap-1 rounded-2xl border-[1.5px] p-4 ${
                    selected ? 'border-primary bg-primary' : 'border-edge bg-card'
                  }`}>
                  <Flag emoji={m.emoji} size={36} />
                  <Text
                    className={`text-xs font-bold ${
                      selected ? 'text-primaryText' : 'text-content'
                    }`}>
                    {m.title}
                  </Text>
                  <Text
                    className={`text-sm ${selected ? 'text-primaryText' : 'text-muted'}`}>
                    {m.subtitle}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-xs font-bold text-muted">Difficulty</Text>
          <Segmented options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
        </View>

        <View className="gap-2">
          <Text className="text-xs font-bold text-muted">Timer per question</Text>
          <Segmented options={TIMED_OPTIONS} value={timed} onChange={setTimed} />
        </View>

        <View className="mt-auto gap-3 pb-4">
          <Text className="text-sm text-muted">
            {best > 0 ? `Best score: ${best}` : 'No best score yet'}
          </Text>
          <Pressable
            onPress={start}
            className="items-center rounded-2xl bg-primary py-4 active:opacity-80">
            <Text className="font-bold text-primaryText">Start Quiz</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}