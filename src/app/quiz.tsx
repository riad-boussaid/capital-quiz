import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption, type AnswerState } from '@/components/answer-option';
import { Flag } from '@/components/flag';
import { ProgressBar } from '@/components/progress-bar';
import { TimerBar } from '@/components/timer-bar';
import { generateQuestions, POINTS_PER_CORRECT, type Difficulty, type QuizMode } from '@/lib/quiz';
import { scoreKey, useScores } from '@/store/ScoresContext';

const QUESTION_COUNT = 10;

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
    if (!settings.timed) return;
    const id = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [settings.timed, index]);

  const timeoutFired = useRef(false);
  useEffect(() => {
    if (!settings.timed || revealed) {
      timeoutFired.current = false;
      return;
    }
    if (timeLeft === 0 && !timeoutFired.current) {
      timeoutFired.current = true;
      selectAnswer(null);
    }
  }, [settings.timed, revealed, timeLeft, selectAnswer]);

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
      feedback = { text: `Correct! +${POINTS_PER_CORRECT}`, ok: true };
    } else if (selected === null) {
      feedback = { text: `Time's up! Answer: ${question.correctAnswer}`, ok: false };
    } else {
      feedback = { text: `Wrong. Answer: ${question.correctAnswer}`, ok: false };
    }
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 w-full max-w-[800px] self-center px-6 pt-8 pb-4">
        <View className="flex-row items-center justify-between gap-3">
          <ProgressBar current={index + 1} total={questions.length} />
          <View className="flex-row gap-3">
            <Text className="text-xs font-bold text-content">⭐ {score}</Text>
            {streak >= 2 && (
              <Text className="text-xs font-bold text-primary">🔥 {streak}</Text>
            )}
          </View>
        </View>

        {settings.timed && !revealed && (
          <View className="mt-3 flex-row items-center gap-3">
            <TimerBar total={settings.timePerQuestion} remaining={timeLeft} />
            <Text className="text-xs font-bold text-content">{timeLeft}s</Text>
          </View>
        )}

        <View className="my-8 items-center gap-2">
          <Flag emoji={question.country.flag} size={88} />
          {question.mode === 'capital' ? (
            <>
              <Text className="text-center text-[28px] font-semibold leading-9 text-content">
                {question.country.name}
              </Text>
              <Text className="text-sm text-muted">What is its capital?</Text>
            </>
          ) : (
            <>
              <Text className="text-center text-[28px] font-semibold leading-9 text-content">
                Which country?
              </Text>
              <Text className="text-sm text-muted">Identify the flag above</Text>
            </>
          )}
        </View>

        <View className="gap-3">
          {question.options.map((option) => (
            <AnswerOption
              key={option}
              label={option}
              state={optionStateFor(option, question.correctAnswer, selected, revealed)}
              disabled={revealed}
              onPress={() => selectAnswer(option)}
            />
          ))}
        </View>

        <View className="mt-auto gap-3 pt-3">
          {revealed ? (
            <>
              <Text
                className={`text-center text-xs font-bold ${
                  feedback?.ok ? 'text-correct' : 'text-wrong'
                }`}>
                {feedback?.text}
              </Text>
              <Pressable
                onPress={goNext}
                className="items-center rounded-2xl bg-primary py-4 active:opacity-80">
                <Text className="font-bold text-primaryText">
                  {isLast ? 'See Results' : 'Next Question'}
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => router.back()}
              className="self-center active:opacity-60">
              <Text className="text-sm text-muted">Quit quiz</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}