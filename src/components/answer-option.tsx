import { Check, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'dimmed';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function AnswerOption({
  label,
  index,
  state,
  disabled,
  onPress,
}: {
  label: string;
  index: number;
  state: AnswerState;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isDimmed = state === 'dimmed';

  return (
    <Pressable
      disabled={disabled || isDimmed}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 ${
        isCorrect
          ? 'border-correct bg-correctSoft'
          : isWrong
            ? 'border-wrong bg-wrongSoft'
            : 'border-edge bg-card'
      } ${isDimmed ? 'opacity-40' : 'active:opacity-80'}`}>
      <View
        className={`h-7 w-7 items-center justify-center rounded-[9px] ${
          isCorrect ? 'bg-correct' : isWrong ? 'bg-wrong' : 'bg-element'
        }`}>
        <Text
          className={`text-xs font-bold ${
            isCorrect ? 'text-correctText' : isWrong ? 'text-wrongText' : 'text-muted'
          }`}>
          {LETTERS[index] ?? ''}
        </Text>
      </View>
      <Text className="flex-1 text-[15px] font-semibold text-content">{label}</Text>
      {isCorrect && (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-correct">
          <Check size={14} color="#ffffff" strokeWidth={3} />
        </View>
      )}
      {isWrong && (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-wrong">
          <X size={14} color="#ffffff" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}
