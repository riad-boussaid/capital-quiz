import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cssInterop } from 'nativewind';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import '@/global.css';

import { initAudio } from '@/lib/sound';
import { DailyProvider } from '@/store/DailyContext';
import { MissedProvider } from '@/store/MissedContext';
import { ScoresProvider } from '@/store/ScoresContext';

// SafeAreaView is a third-party component, so NativeWind needs an explicit
// mapping for its className to reach the underlying view.
cssInterop(SafeAreaView, { className: 'style' });

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void initAudio();
  }, []);

  return (
    <ScoresProvider>
      <DailyProvider>
        <MissedProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="quiz" />
              <Stack.Screen name="results" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </MissedProvider>
      </DailyProvider>
    </ScoresProvider>
  );
}