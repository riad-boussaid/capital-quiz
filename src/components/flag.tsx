import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

// Derives the ISO 3166-1 alpha-2 code from a flag emoji's regional indicator
// symbols (e.g. 🇻🇪 -> 've'), used to build the flag image URL.
function countryCode(flag: string): string {
  return [...flag]
    .map((c) => (c.codePointAt(0) ?? 0) - 0x1f1e6)
    .map((n) => String.fromCharCode(97 + n))
    .join('');
}

export function Flag({
  emoji,
  size = 96,
  style,
}: {
  emoji: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const code = countryCode(emoji);
  // Track the failed code rather than a boolean so a new emoji resets the
  // fallback automatically without an effect.
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const failed = failedCode === code;

  const aspect = { width: size, height: Math.round(size * 0.75) };

  if (failed || code.length !== 2) {
    // Offline / fallback rendering: the emoji the data ships with.
    return (
      <View
        className="items-center justify-center border border-edge rounded-xl bg-card"
        style={[aspect, style]}>
        <Text style={{ fontSize: size * 0.6 }}>{emoji}</Text>
      </View>
    );
  }

  return (
    <View
      className="overflow-hidden rounded-xl border border-edge bg-element"
      style={[aspect, style]}>
      <Image
        source={{ uri: `https://flagcdn.com/w320/${code}.png` }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        recyclingKey={code}
        onError={() => setFailedCode(code)}
      />
    </View>
  );
}
