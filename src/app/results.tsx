import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Check,
  Flame,
  House,
  RotateCcw,
  Share2,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react-native';
import { Platform, Pressable, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccuracyRing } from '@/components/accuracy-ring';
import { useUiColors } from '@/lib/theme';

function tierFor(accuracy: number): string {
  if (accuracy >= 90) return 'Outstanding — you know your world!';
  if (accuracy >= 70) return 'Great job — almost perfect!';
  if (accuracy >= 50) return 'Good effort — keep practicing!';
  return 'Keep practicing — you’ll get there!';
}

// Day-streak milestones worth calling out on the results screen.
function streakCelebration(streak: number): string | null {
  if (streak >= 100) return '💯 100-day streak — legendary!';
  if (streak >= 30) return '🌟 30-day streak — unstoppable!';
  if (streak >= 14) return '⭐ Two-week streak — 14 days!';
  if (streak >= 7) return '🎉 One week strong — 7 days!';
  if (streak >= 3) return '🔥 3 days in a row!';
  return null;
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
    prevBest?: string;
    mode?: string;
    difficulty?: string;
    timed?: string;
    time?: string;
    daily?: string;
    date?: string;
    dayStreak?: string;
    pattern?: string;
    endless?: string;
  }>();
  const router = useRouter();
  const colors = useUiColors();

  const score = Number(params.score ?? 0);
  const correct = Number(params.correct ?? 0);
  const total = Number(params.total ?? 0);
  const bestStreak = Number(params.bestStreak ?? 0);
  const isNewBest = params.isNewBest === '1';
  const prevBest = Number(params.prevBest ?? 0);
  const gap = prevBest - score;
  const isDaily = params.daily === '1';
  const isEndless = params.endless === '1';
  const date = params.date ?? '';
  const dayStreak = Number(params.dayStreak ?? 0);
  const pattern = params.pattern ?? '';
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const onShare = () => {
    const squares = pattern
      .split('')
      .map((c) => (c === '1' ? '🟩' : '🟥'))
      .join('');
    const [y, m, d] = date.split('-').map(Number);
    const dateLabel =
      y && m && d
        ? new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : '';
    const lines = [
      isDaily ? `🌍 Capital Quiz Daily${dateLabel ? ` — ${dateLabel}` : ''}` : '🌍 Capital Quiz',
      squares,
      `${score} pts · ${correct}/${total} (${accuracy}%)`,
    ];
    if (isDaily && dayStreak > 0) lines.push(`🔥 ${dayStreak}-day streak`);
    lines.push('Can you beat my score?');
    Share.share({ message: lines.join('\n') }).catch(() => {
      // sharing is best-effort
    });
  };
  const mode = params.mode ?? 'capital';
  const difficulty = params.difficulty ?? 'easy';
  const timed = params.timed === '1';
  const time = params.time ?? '0';

  const playAgain = () => {
    router.replace({
      pathname: '/quiz',
      params: {
        mode,
        difficulty,
        timed: timed ? '1' : '0',
        time,
        count: String(total),
        ...(isDaily ? { daily: '1', date } : {}),
        ...(isEndless ? { endless: '1' } : {}),
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
          {!isNewBest && prevBest > 0 && (
            <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-amberSoft px-3 py-1.5">
              <Target size={13} color={colors.amber} />
              <Text className="text-xs font-bold text-amber">
                {prevBest === score
                  ? 'Matched your best — beat it next run!'
                  : gap <= 30
                    ? `So close — only ${gap} pts from your best!`
                    : `Your best is ${prevBest} pts — beat it next run!`}
              </Text>
            </View>
          )}
          {isDaily && dayStreak > 0 && (
            <View className="mt-2 flex-row items-center gap-1.5 rounded-full bg-amberSoft px-3 py-1.5">
              <Flame size={13} color={colors.amber} />
              <Text className="text-xs font-bold text-amber">
                {streakCelebration(dayStreak) ?? `${dayStreak}-day streak`}
              </Text>
            </View>
          )}
          {pattern.length > 0 && (
            <View className="mt-4 flex-row justify-center gap-1">
              {pattern.split('').map((c, i) => (
                <View
                  key={i}
                  className={`h-[18px] w-[18px] rounded-[5px] ${
                    c === '1' ? 'bg-correct' : 'bg-wrong'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        <View className="mt-6 flex-row gap-2.5">
          <StatCard icon={Check} tint="correct" label="Correct" value={`${correct}/${total}`} />
          <StatCard icon={Target} tint="primary" label="Accuracy" value={`${accuracy}%`} />
          <StatCard icon={Flame} tint="amber" label="Best streak" value={String(bestStreak)} />
        </View>

        <View className="mt-4 flex-row justify-center gap-1.5">
          <ConfigPill
            label={mode === 'capital' ? 'Capital Quiz' : mode === 'flag' ? 'Flag Quiz' : 'Endless'}
          />
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
          {Platform.OS === 'web' ? (
            <Pressable
              onPress={() => router.replace('/')}
              className="h-[54px] flex-row items-center justify-center gap-2 rounded-2xl bg-element active:opacity-80">
              <House size={16} color={colors.content} strokeWidth={2.5} />
              <Text className="font-semibold text-content">Back to Home</Text>
            </Pressable>
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                onPress={onShare}
                className="h-[54px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-element active:opacity-80">
                <Share2 size={16} color={colors.content} strokeWidth={2.5} />
                <Text className="font-semibold text-content">Share</Text>
              </Pressable>
              <Pressable
                onPress={() => router.replace('/')}
                className="h-[54px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-element active:opacity-80">
                <House size={16} color={colors.content} strokeWidth={2.5} />
                <Text className="font-semibold text-content">Home</Text>
              </Pressable>
            </View>
          )}
        </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
