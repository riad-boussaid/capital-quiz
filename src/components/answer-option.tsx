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
  compact = false,
}: {
  label: string;
  index: number;
  state: AnswerState;
  disabled?: boolean;
  onPress?: () => void;
  // Compact renders the two-column grid variant: tighter padding, smaller
  // type, and the check/cross badge overlays the corner instead of sitting
  // inline (there is no horizontal room for it in a grid cell).
  compact?: boolean;
}) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isDimmed = state === 'dimmed';

  return (
    <Pressable
      disabled={disabled || isDimmed}
      onPress={onPress}
      className={`flex-row items-center rounded-2xl border-[1.5px] ${
        compact ? 'flex-1 gap-2 px-2.5 py-2.5' : 'gap-3 px-4 py-3'
      } ${
        isCorrect
          ? 'border-correct bg-correctSoft'
          : isWrong
            ? 'border-wrong bg-wrongSoft'
            : 'border-edge bg-card'
      } ${isDimmed ? 'opacity-40' : 'active:opacity-80'}`}>
      <View
        className={`items-center justify-center ${
          compact ? 'h-6 w-6 rounded-[8px]' : 'h-7 w-7 rounded-[9px]'
        } ${isCorrect ? 'bg-correct' : isWrong ? 'bg-wrong' : 'bg-element'}`}>
        <Text
          className={`font-bold ${compact ? 'text-[10px]' : 'text-xs'} ${
            isCorrect ? 'text-correctText' : isWrong ? 'text-wrongText' : 'text-muted'
          }`}>
          {LETTERS[index] ?? ''}
        </Text>
      </View>
      <Text
        numberOfLines={compact ? 2 : undefined}
        className={`flex-1 font-semibold text-content ${
          compact ? 'text-[13px] leading-4' : 'text-[15px]'
        }`}>
        {label}
      </Text>
      {!compact && isCorrect && (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-correct">
          <Check size={14} color="#ffffff" strokeWidth={3} />
        </View>
      )}
      {!compact && isWrong && (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-wrong">
          <X size={14} color="#ffffff" strokeWidth={3} />
        </View>
      )}
      {compact && (isCorrect || isWrong) && (
        <View
          className={`absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full ${
            isCorrect ? 'bg-correct' : 'bg-wrong'
          }`}>
          {isCorrect ? (
            <Check size={11} color="#ffffff" strokeWidth={3.5} />
          ) : (
            <X size={11} color="#ffffff" strokeWidth={3.5} />
          )}
        </View>
      )}
    </Pressable>
  );
}
