import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronRight, Flame, Star, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption, type AnswerState } from '@/components/answer-option';
import { Flag } from '@/components/flag';
import { ProgressDots } from '@/components/progress-dots';
import { TimerBar } from '@/components/timer-bar';
import {
  dailyMode,
  DAILY_DIFFICULTY,
  generateQuestions,
  mulberry32,
  scoreAnswer,
  seedFromDate,
  type Award,
  type Difficulty,
  type QuizMode,
} from '@/lib/quiz';
import { todayKey } from '@/lib/daily';
import { useUiColors } from '@/lib/theme';
import { useDaily } from '@/store/DailyContext';
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
    daily?: string;
    date?: string;
  }>();
  const router = useRouter();
  const { bestFor, recordResult } = useScores();
  const { recordDailyResult } = useDaily();
  const colors = useUiColors();

  const isDaily = params.daily === '1';
  const dailyDate = isDaily ? (params.date ?? todayKey()) : '';

  const settings = useMemo(
    () => ({
      mode: (params.mode as QuizMode) ?? (isDaily ? dailyMode(dailyDate) : 'capital'),
      difficulty: (params.difficulty as Difficulty) ?? (isDaily ? DAILY_DIFFICULTY : 'easy'),
      timed: params.timed === '1',
      timePerQuestion: Number(params.time) || 15,
      questionCount: Number(params.count) || QUESTION_COUNT,
    }),
    [params.mode, params.difficulty, params.timed, params.time, params.count, isDaily, dailyDate],
  );

  // Daily runs use a date-seeded PRNG so everyone gets the same quiz; regular
  // runs keep the default Math.random path.
  const questions = useMemo(
    () =>
      generateQuestions(
        settings,
        isDaily ? mulberry32(seedFromDate(dailyDate)) : Math.random,
      ),
    [settings, isDaily, dailyDate],
  );

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timePerQuestion);
  const [award, setAward] = useState<Award | null>(null);
  // Set on mount and on every question change by the effect below; 0 until then.
  const questionStartRef = useRef(0);
  // One "1"/"0" per answered question, in order — feeds the results share card.
  const outcomesRef = useRef<string[]>([]);

  useEffect(() => {
    // Each question restarts the clock that drives the speed bonus.
    questionStartRef.current = Date.now();
  }, [index]);

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
      outcomesRef.current.push(isCorrect ? '1' : '0');
      if (isCorrect) {
        const nextStreak = streak + 1;
        const elapsed = (Date.now() - questionStartRef.current) / 1000;
        const earned = scoreAnswer(elapsed, nextStreak);
        setCorrectCount((c) => c + 1);
        setScore((s) => s + earned.points);
        setStreak(nextStreak);
        setBestStreak((b) => Math.max(b, nextStreak));
        setAward(earned);
      } else {
        setStreak(0);
        setAward(null);
      }
    },
    [revealed, index, questions, streak],
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

  const finish = useCallback(() => {
    const baseParams = {
      score: String(score),
      correct: String(correctCount),
      total: String(questions.length),
      bestStreak: String(bestStreak),
      mode: settings.mode,
      difficulty: settings.difficulty,
      timed: settings.timed ? '1' : '0',
      time: String(settings.timePerQuestion),
      pattern: outcomesRef.current.join(''),
    };
    if (isDaily) {
      // The daily run's "best" is the best score across all prior days, and
      // completing today keeps the day streak alive (replays don't reset it).
      const outcome = recordDailyResult(dailyDate, {
        score,
        correct: correctCount,
        total: questions.length,
      });
      router.replace({
        pathname: '/results',
        params: {
          ...baseParams,
          daily: '1',
          date: dailyDate,
          isNewBest: outcome.isNewBest ? '1' : '0',
          prevBest: String(outcome.prevBest),
          dayStreak: String(outcome.dayStreak),
        },
      });
      return;
    }
    // Capture the old best before recordResult overwrites it, so results can
    // show how close a non-record run came.
    const prevBest = bestFor(key);
    const isNewBest = recordResult(key, score);
    router.replace({
      pathname: '/results',
      params: {
        ...baseParams,
        isNewBest: isNewBest ? '1' : '0',
        prevBest: String(prevBest),
      },
    });
  }, [
    isDaily,
    dailyDate,
    recordDailyResult,
    score,
    correctCount,
    questions.length,
    bestStreak,
    settings,
    bestFor,
    key,
    recordResult,
    router,
  ]);

  const goNext = useCallback(() => {
    if (index < questions.length - 1) {
      setTimeLeft(settings.timePerQuestion);
      setIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      finish();
    }
  }, [index, questions.length, settings.timePerQuestion, finish]);

  useEffect(() => {
    // Flow: correct answers auto-advance so a run never stalls on taps; wrong
    // and timed-out answers stay up so the correction can be read. Tapping
    // Next still works during the window (state change clears this timer).
    if (!revealed || selected === null || selected !== questions[index]?.correctAnswer) return;
    const id = setTimeout(goNext, index === questions.length - 1 ? 1400 : 900);
    return () => clearTimeout(id);
  }, [revealed, selected, index, questions, goNext]);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  let feedback: { text: string; ok: boolean } | null = null;
  if (revealed) {
    if (selected === question.correctAnswer) {
      feedback = { text: `Correct! +${award?.points ?? 0} points`, ok: true };
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
          {isDaily && (
            <View className="mb-1.5 rounded-full bg-primarySoft px-3 py-1">
              <Text className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Daily Challenge
              </Text>
            </View>
          )}
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
                <View className="flex-1 gap-1">
                  <Text
                    className={`text-[13px] font-bold ${
                      feedback.ok ? 'text-correct' : 'text-wrong'
                    }`}>
                    {feedback.text}
                  </Text>
                  {feedback.ok && award && (award.speedBonus > 0 || award.multiplier > 1) && (
                    <Text className="text-[11px] font-bold text-correct opacity-80">
                      {[
                        award.speedBonus > 0 ? `⚡ +${award.speedBonus} speed` : null,
                        award.multiplier > 1 ? `🔥 ×${award.multiplier} streak` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  )}
                </View>
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
              Answer fast for a speed bonus — streaks multiply your points
            </Text>
          )}
        </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
