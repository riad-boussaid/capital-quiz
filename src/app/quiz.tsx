import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronRight, Flame, Star, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption, type AnswerState } from '@/components/answer-option';
import { Flag } from '@/components/flag';
import { ProgressDots } from '@/components/progress-dots';
import { TimerBar } from '@/components/timer-bar';
import { generateQuestions, POINTS_PER_CORRECT, type Difficulty, type QuizMode } from '@/lib/quiz';
import { useUiColors } from '@/lib/theme';
import { scoreKey, useScores } from '@/store/ScoresContext';

const QUESTION_COUNT = 10;

function feedbackHaptic(ok: boolean) {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(
    ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  ).catch(() => {
    // haptics are best-effort
  });
}

function optionStateFor(
  option: string,
  correct: string,
  selected: string | null,
  revealed: boolean,
): AnswerState {
  if (!revealed) return 'idle';
  if (option === correct) return 'correct';
  if (option === selected) return 'wrong';
  return 'dimmed';
}

export default function QuizScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    difficulty?: string;
    timed?: string;
    time?: string;
    count?: string;
  }>();
  const router = useRouter();
  const { recordResult } = useScores();
  const colors = useUiColors();

  const settings = useMemo(
    () => ({
      mode: (params.mode as QuizMode) ?? 'capital',
      difficulty: (params.difficulty as Difficulty) ?? 'easy',
      timed: params.timed === '1',
      timePerQuestion: Number(params.time) || 15,
      questionCount: Number(params.count) || QUESTION_COUNT,
    }),
    [params.mode, params.difficulty, params.timed, params.time, params.count],
  );

  const questions = useMemo(() => generateQuestions(settings), [settings]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timePerQuestion);

  const timedLabel = settings.timed ? String(settings.timePerQuestion) : 'off';
  const key = scoreKey(settings.mode, settings.difficulty, timedLabel);

  const selectAnswer = useCallback(
    (option: string | null) => {
      if (revealed) return;
      const question = questions[index];
      const isCorrect = option !== null && option === question.correctAnswer;
      setSelected(option);
      setRevealed(true);
      feedbackHaptic(isCorrect);
      if (isCorrect) {
        setCorrectCount((c) => c + 1);
        setScore((s) => s + POINTS_PER_CORRECT);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStreak(0);
      }
    },
    [revealed, index, questions],
  );

  useEffect(() => {
    // The timer runs only while a question is unanswered; it freezes during
    // the reveal so the bar doesn't keep draining behind the feedback.
    if (!settings.timed || revealed) return;
    const id = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [settings.timed, revealed, index]);

  useEffect(() => {
    // Timeout is scheduled per question; the interval above only drives the
    // visible countdown so the two stay in sync but lint-safe.
    if (!settings.timed || revealed) return;
    const id = setTimeout(() => selectAnswer(null), settings.timePerQuestion * 1000);
    return () => clearTimeout(id);
  }, [settings.timed, revealed, index, settings.timePerQuestion, selectAnswer]);

  const finish = () => {
    const isNewBest = recordResult(key, score);
    router.replace({
      pathname: '/results',
      params: {
        score: String(score),
        correct: String(correctCount),
        total: String(questions.length),
        bestStreak: String(bestStreak),
        isNewBest: isNewBest ? '1' : '0',
        mode: settings.mode,
        difficulty: settings.difficulty,
        timed: settings.timed ? '1' : '0',
        time: String(settings.timePerQuestion),
      },
    });
  };

  const goNext = () => {
    if (index < questions.length - 1) {
      setTimeLeft(settings.timePerQuestion);
      setIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      finish();
    }
  };

  const question = questions[index];
  const isLast = index === questions.length - 1;

  let feedback: { text: string; ok: boolean } | null = null;
  if (revealed) {
    if (selected === question.correctAnswer) {
      feedback = { text: `Correct! +${POINTS_PER_CORRECT} points`, ok: true };
    } else if (selected === null) {
      feedback = { text: `Time's up — it's ${question.correctAnswer}`, ok: false };
    } else {
      feedback = { text: `Wrong — it's ${question.correctAnswer}`, ok: false };
    }
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 w-full max-w-[800px] self-center">
        <View className="flex-1 px-5 pt-4 pb-5">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Quit quiz"
            className="h-9 w-9 items-center justify-center rounded-full bg-element active:opacity-70">
            <X size={18} color={colors.content} strokeWidth={2.5} />
          </Pressable>
          <ProgressDots current={index} total={questions.length} />
          <View className="flex-row gap-1.5">
            <View className="flex-row items-center gap-1 rounded-full bg-element px-2.5 py-1">
              <Star size={13} color={colors.amber} fill={colors.amber} />
              <Text className="text-xs font-bold text-content tabular-nums">{score}</Text>
            </View>
            {streak >= 2 && (
              <View className="flex-row items-center gap-1 rounded-full bg-element px-2.5 py-1">
                <Flame size={13} color={colors.amber} />
                <Text className="text-xs font-bold text-content tabular-nums">{streak}</Text>
              </View>
            )}
          </View>
        </View>

        {settings.timed && (
          <View className="mt-3 flex-row items-center gap-2.5">
            <TimerBar total={settings.timePerQuestion} remaining={timeLeft} />
            <Text className="w-7 text-right text-xs font-bold text-content tabular-nums">
              {timeLeft}s
            </Text>
          </View>
        )}

        <View className="my-7 items-center gap-1.5">
          <Flag emoji={question.country.flag} size={104} />
          {question.mode === 'capital' ? (
            <>
              <Text className="mt-3 text-center text-[26px] font-bold leading-8 text-content">
                {question.country.name}
              </Text>
              <Text className="text-sm text-muted">What is its capital?</Text>
            </>
          ) : (
            <>
              <Text className="mt-3 text-center text-[26px] font-bold leading-8 text-content">
                Which country?
              </Text>
              <Text className="text-sm text-muted">Identify the flag above</Text>
            </>
          )}
        </View>

        <View className="gap-2.5">
          {question.options.map((option, i) => (
            <AnswerOption
              key={option}
              label={option}
              index={i}
              state={optionStateFor(option, question.correctAnswer, selected, revealed)}
              disabled={revealed}
              onPress={() => selectAnswer(option)}
            />
          ))}
        </View>

        <View className="mt-auto min-h-[104px] justify-end gap-3 pt-4">
          {revealed && feedback ? (
            <>
              <View
                className={`flex-row items-center gap-2.5 rounded-xl px-3.5 py-2.5 ${
                  feedback.ok ? 'bg-correctSoft' : 'bg-wrongSoft'
                }`}>
                <View
                  className={`h-[22px] w-[22px] items-center justify-center rounded-full ${
                    feedback.ok ? 'bg-correct' : 'bg-wrong'
                  }`}>
                  {feedback.ok ? (
                    <Check size={13} color="#ffffff" strokeWidth={3} />
                  ) : (
                    <X size={13} color="#ffffff" strokeWidth={3} />
                  )}
                </View>
                <Text
                  className={`flex-1 text-[13px] font-bold ${
                    feedback.ok ? 'text-correct' : 'text-wrong'
                  }`}>
                  {feedback.text}
                </Text>
              </View>
              <Pressable
                onPress={goNext}
                className="h-[54px] flex-row items-center justify-center gap-2 rounded-2xl bg-primary active:opacity-80">
                <Text className="font-bold text-primaryText">
                  {isLast ? 'See Results' : 'Next Question'}
                </Text>
                <ChevronRight size={17} color="#ffffff" strokeWidth={2.5} />
              </Pressable>
            </>
          ) : (
            <Text className="text-center text-xs text-muted">
              Select an answer — {POINTS_PER_CORRECT} points for every correct one
            </Text>
          )}
        </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
