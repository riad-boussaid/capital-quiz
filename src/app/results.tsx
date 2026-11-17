import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Flame, House, RotateCcw, Target, Trophy, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccuracyRing } from '@/components/accuracy-ring';
import { useUiColors } from '@/lib/theme';

function tierFor(accuracy: number): string {
  if (accuracy >= 90) return 'Outstanding — you know your world!';
  if (accuracy >= 70) return 'Great job — almost perfect!';
  if (accuracy >= 50) return 'Good effort — keep practicing!';
  return 'Keep practicing — you’ll get there!';
}

function StatCard({
  icon: Icon,
  tint,
  label,
  value,
}: {
  icon: LucideIcon;
  tint: 'correct' | 'primary' | 'amber';
  label: string;
  value: string;
}) {
  const colors = useUiColors();
  const tintBg =
    tint === 'correct' ? 'bg-correctSoft' : tint === 'amber' ? 'bg-amberSoft' : 'bg-primarySoft';
  const tintFg =
    tint === 'correct' ? colors.correct : tint === 'amber' ? colors.amber : colors.primary;

  return (
    <View className="flex-1 items-center gap-1.5 rounded-2xl border border-edge bg-card p-3">
      <View className={`h-7 w-7 items-center justify-center rounded-[9px] ${tintBg}`}>
        <Icon size={15} color={tintFg} strokeWidth={2.5} />
      </View>
      <Text className="text-lg font-bold text-content tabular-nums">{value}</Text>
      <Text className="text-[11px] text-muted">{label}</Text>
    </View>
  );
}

function ConfigPill({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-element px-2.5 py-1">
      <Text className="text-[11px] font-semibold text-muted">{label}</Text>
    </View>
  );
}

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    score?: string;
    correct?: string;
    total?: string;
    bestStreak?: string;
    isNewBest?: string;
    mode?: string;
    difficulty?: string;
    timed?: string;
    time?: string;
  }>();
  const router = useRouter();
  const colors = useUiColors();

  const score = Number(params.score ?? 0);
  const correct = Number(params.correct ?? 0);
  const total = Number(params.total ?? 0);
  const bestStreak = Number(params.bestStreak ?? 0);
  const isNewBest = params.isNewBest === '1';
  const mode = params.mode ?? 'capital';
  const difficulty = params.difficulty ?? 'easy';
  const timed = params.timed === '1';
  const time = params.time ?? '0';
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const playAgain = () => {
    router.replace({
      pathname: '/quiz',
      params: {
        mode,
        difficulty,
        timed: timed ? '1' : '0',
        time,
        count: String(total),
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 w-full max-w-[800px] self-center">
        <View className="flex-1 px-6 pt-10 pb-5">
        <View className="items-center">
          <Text className="text-sm text-muted">Quiz complete</Text>
          <View className="mt-3">
            <AccuracyRing accuracy={accuracy} score={score} caption="points" />
          </View>
          <Text className="mt-3 text-center text-sm font-bold text-content">
            {tierFor(accuracy)}
          </Text>
          {isNewBest && (
            <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-correctSoft px-3 py-1.5">
              <Trophy size={13} color={colors.correct} />
              <Text className="text-xs font-bold text-correct">New best score!</Text>
            </View>
          )}
        </View>

        <View className="mt-6 flex-row gap-2.5">
          <StatCard icon={Check} tint="correct" label="Correct" value={`${correct}/${total}`} />
          <StatCard icon={Target} tint="primary" label="Accuracy" value={`${accuracy}%`} />
          <StatCard icon={Flame} tint="amber" label="Best streak" value={String(bestStreak)} />
        </View>

        <View className="mt-4 flex-row justify-center gap-1.5">
          <ConfigPill label={mode === 'capital' ? 'Capital Quiz' : 'Flag Quiz'} />
          <ConfigPill label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} />
          <ConfigPill label={timed ? `${time}s timer` : 'Untimed'} />
        </View>

        <View className="mt-auto gap-3 pt-5">
          <Pressable
            onPress={playAgain}
            className="h-[54px] flex-row items-center justify-center gap-2 rounded-2xl bg-primary active:opacity-80">
            <RotateCcw size={16} color="#ffffff" strokeWidth={2.5} />
            <Text className="font-bold text-primaryText">Play Again</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/')}
            className="h-[54px] flex-row items-center justify-center gap-2 rounded-2xl bg-element active:opacity-80">
            <House size={16} color={colors.content} strokeWidth={2.5} />
            <Text className="font-semibold text-content">Back to Home</Text>
          </Pressable>
        </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
