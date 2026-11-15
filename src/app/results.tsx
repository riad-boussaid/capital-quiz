import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl p-3">
      <Text className="text-2xl font-semibold leading-7 text-content">{value}</Text>
      <Text className="text-sm text-muted">{label}</Text>
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
      <SafeAreaView className="flex-1 w-full max-w-[800px] self-center px-6 pt-16 pb-4">
        <View className="items-center gap-1">
          <Text className="text-sm text-muted">Quiz complete</Text>
          <Text className="text-[72px] font-semibold leading-[80px] text-content">{score}</Text>
          <Text className="text-sm text-muted">points</Text>
          {isNewBest && (
            <Text className="text-xs font-bold text-correct">🏆 New best score!</Text>
          )}
        </View>

        <View className="mt-5 flex-row gap-3">
          <Stat label="Correct" value={`${correct}/${total}`} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Best streak" value={String(bestStreak)} />
        </View>

        <Text className="mt-4 text-center text-sm capitalize text-muted">
          {mode === 'capital' ? 'Capital Quiz' : 'Flag Quiz'} · {difficulty} ·{' '}
          {timed ? `${time}s timer` : 'untimed'}
        </Text>

        <View className="mt-auto gap-3 pt-4">
          <Pressable
            onPress={playAgain}
            className="items-center rounded-2xl bg-primary py-4 active:opacity-80">
            <Text className="font-bold text-primaryText">Play Again</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/')}
            className="items-center rounded-2xl bg-element py-4 active:opacity-80">
            <Text className="font-semibold text-content">Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}