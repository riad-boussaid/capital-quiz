import { Text, type TextStyle } from 'react-native';

export function Flag({
  emoji,
  size = 96,
  style,
}: {
  emoji: string;
  size?: number;
  style?: TextStyle;
}) {
  return <Text style={[{ fontSize: size, lineHeight: size * 1.15 }, style]}>{emoji}</Text>;
}