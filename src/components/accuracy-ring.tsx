import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useUiColors } from '@/lib/theme';

const SIZE = 150;
const STROKE = 9;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DURATION_MS = 800;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AccuracyRing({
  accuracy,
  score,
  caption,
}: {
  accuracy: number;
  score: number;
  caption?: string;
}) {
  const colors = useUiColors();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Small rAF ease-in so the arc sweeps in on mount. Done in JS rather
    // than Reanimated so it also runs on web.
    let raf: number | null = null;
    const start = Date.now();
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / DURATION_MS);
      setProgress(easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  const clamped = Math.max(0, Math.min(100, accuracy));
  const offset = CIRCUMFERENCE * (1 - (clamped / 100) * progress);

  return (
    <View>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={colors.edge}
          strokeWidth={STROKE}
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={colors.primary}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-[40px] font-bold leading-10 text-content tabular-nums">
          {score}
        </Text>
        {caption ? <Text className="mt-1 text-[11px] text-muted">{caption}</Text> : null}
      </View>
    </View>
  );
}
