import { useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7', '#14b8a6'];

interface Piece {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
}

// One-shot celebratory confetti burst, rendered with the built-in Animated API
// so it works on native and web without extra dependencies.
export function Confetti({ count = 26 }: { count?: number }) {
  const { height, width } = Dimensions.get('window');
  // Pieces are randomized once per mount; kept in state so the impure
  // generation never re-runs during renders.
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random(),
      size: 6 + Math.random() * 7,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 400,
      duration: 2200 + Math.random() * 1400,
      drift: (Math.random() - 0.5) * 90,
      spin: Math.random() * 720 - 360,
    })),
  );
  const [anims] = useState(() =>
    Array.from({ length: count }, () => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      rot: new Animated.Value(0),
    })),
  );

  useEffect(() => {
    const animations = pieces.map((piece, i) =>
      Animated.parallel([
        Animated.timing(anims[i].y, {
          toValue: height * 0.9,
          duration: piece.duration,
          delay: piece.delay,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anims[i].x, {
          toValue: piece.drift,
          duration: piece.duration,
          delay: piece.delay,
          useNativeDriver: true,
        }),
        Animated.timing(anims[i].rot, {
          toValue: piece.spin,
          duration: piece.duration,
          delay: piece.delay,
          useNativeDriver: true,
        }),
      ]),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [pieces, anims, height]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -30,
            left: piece.left * width,
            width: piece.size,
            height: piece.size * 1.4,
            borderRadius: 2,
            backgroundColor: piece.color,
            transform: [
              { translateX: anims[i].x },
              { translateY: anims[i].y },
              {
                rotate: anims[i].rot.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
