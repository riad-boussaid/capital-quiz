import { View } from 'react-native';

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-1 flex-row flex-wrap items-center justify-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={`h-1.5 rounded-full ${
            i === current ? 'w-4 bg-primary' : i < current ? 'w-1.5 bg-primary' : 'w-1.5 bg-edge'
          }`}
        />
      ))}
    </View>
  );
}
