import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import '@/global.css';

import { ScoresProvider } from '@/store/ScoresContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ScoresProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="results" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ScoresProvider>
  );
}