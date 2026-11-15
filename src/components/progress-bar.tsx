import { Text, View } from 'react-native';

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const ratio = total > 0 ? current / total : 0;

  return (
    <View className="flex-1 flex-row items-center gap-3">
      <Text className="text-xs font-bold text-muted">
        Q {current} / {total}
      </Text>
      <View className="h-2 flex-1 overflow-hidden rounded-full bg-edge">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${ratio * 100}%` }}
        />
      </View>
    </View>
  );
}