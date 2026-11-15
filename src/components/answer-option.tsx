import { Pressable, Text } from 'react-native';

export type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

export function AnswerOption({
  label,
  state,
  disabled,
  onPress,
}: {
  label: string;
  state: AnswerState;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isSelected = state === 'selected';
  const isDimmed = state === 'dimmed';

  const bgClass = isCorrect
    ? 'bg-correct'
    : isWrong
      ? 'bg-wrong'
      : isSelected
        ? 'bg-primary'
        : 'bg-card';
  const borderClass = isCorrect
    ? 'border-correct'
    : isWrong
      ? 'border-wrong'
      : isSelected
        ? 'border-primary'
        : 'border-edge';
  const textClass = isCorrect
    ? 'text-correctText'
    : isWrong
      ? 'text-wrongText'
      : isSelected
        ? 'text-primaryText'
        : 'text-content';

  return (
    <Pressable
      disabled={disabled || isDimmed}
      onPress={onPress}
      className={`items-center justify-center rounded-2xl border-[1.5px] px-5 py-4 ${bgClass} ${borderClass} ${
        isDimmed ? 'opacity-40' : 'active:opacity-80'
      }`}>
      <Text className={`text-center font-semibold ${textClass}`}>{label}</Text>
    </Pressable>
  );
}