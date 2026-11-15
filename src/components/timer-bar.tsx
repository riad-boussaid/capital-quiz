import { View } from 'react-native';

export function TimerBar({ total, remaining }: { total: number; remaining: number }) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const colorClass =
    ratio > 0.5 ? 'bg-correct' : ratio > 0.25 ? 'bg-amber-500' : 'bg-wrong';

  return (
    <View className="h-2.5 flex-1 overflow-hidden rounded-full bg-edge">
      <View
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${ratio * 100}%` }}
      />
    </View>
  );
}