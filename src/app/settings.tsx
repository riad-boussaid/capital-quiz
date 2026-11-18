import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info, RotateCcw, Vibrate, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isHapticsEnabled, setHapticsEnabled } from '@/lib/haptics';
import { isMuted, setMuted } from '@/lib/sound';
import { useUiColors } from '@/lib/theme';
import { useDaily } from '@/store/DailyContext';
import { useMissed } from '@/store/MissedContext';
import { useScores } from '@/store/ScoresContext';

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-muted">
      {children}
    </Text>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useUiColors();
  const { resetScores } = useScores();
  const { resetMissed } = useMissed();
  const { resetDaily } = useDaily();

  const [muted, setMutedState] = useState(isMuted());
  const [haptics, setHapticsState] = useState(isHapticsEnabled());
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const isWeb = Platform.OS === 'web';
  const version = Constants.expoConfig?.version ?? '1.2.1';

  useEffect(() => {
    if (!confirmReset) return;
    const id = setTimeout(() => setConfirmReset(false), 3000);
    return () => clearTimeout(id);
  }, [confirmReset]);

  const onSoundChange = (on: boolean) => {
    setMutedState(!on);
    void setMuted(!on);
  };

  const onHapticsChange = (on: boolean) => {
    setHapticsState(on);
    void setHapticsEnabled(on);
  };

  const onResetPress = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetScores();
    resetMissed();
    resetDaily();
    setConfirmReset(false);
    setResetDone(true);
  };

  useEffect(() => {
    if (!resetDone) return;
    const id = setTimeout(() => setResetDone(false), 2500);
    return () => clearTimeout(id);
  }, [resetDone]);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 w-full max-w-[800px] self-center">
        <View className="flex-1 px-5 pt-4">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Back"
              className="h-9 w-9 items-center justify-center rounded-full bg-element active:opacity-70">
              <ChevronLeft size={19} color={colors.content} strokeWidth={2.5} />
            </Pressable>
            <Text className="text-[20px] font-bold text-content">Settings</Text>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}>
            <SectionLabel>Feedback</SectionLabel>
            <View className="gap-2">
              <View className="flex-row items-center gap-3 rounded-2xl border border-edge bg-card p-4">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-primarySoft">
                  <Volume2 size={17} color={colors.primary} strokeWidth={2.5} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-[14px] font-bold text-content">Sound effects</Text>
                  <Text className="text-xs text-muted">
                    {isWeb ? 'Not available in the browser' : 'Answer, streak, and finish cues'}
                  </Text>
                </View>
                <Switch
                  value={!muted}
                  onValueChange={onSoundChange}
                  disabled={isWeb}
                  accessibilityLabel="Sound effects"
                  trackColor={{ false: colors.edge, true: colors.primary }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={colors.edge}
                />
              </View>

              <View className="flex-row items-center gap-3 rounded-2xl border border-edge bg-card p-4">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-primarySoft">
                  <Vibrate size={17} color={colors.primary} strokeWidth={2.5} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-[14px] font-bold text-content">Haptics</Text>
                  <Text className="text-xs text-muted">
                    {isWeb ? 'Not available in the browser' : 'A tap on correct and wrong answers'}
                  </Text>
                </View>
                <Switch
                  value={haptics}
                  onValueChange={onHapticsChange}
                  disabled={isWeb}
                  accessibilityLabel="Haptics"
                  trackColor={{ false: colors.edge, true: colors.primary }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={colors.edge}
                />
              </View>
            </View>

            <SectionLabel>Progress</SectionLabel>
            <Pressable
              onPress={onResetPress}
              accessibilityLabel="Reset progress"
              className={`flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-80 ${
                confirmReset ? 'border-wrong bg-wrongSoft' : 'border-edge bg-card'
              }`}>
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-wrongSoft">
                <RotateCcw size={17} color={colors.wrong} strokeWidth={2.5} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className={`text-[14px] font-bold ${confirmReset ? 'text-wrong' : 'text-content'}`}>
                  {resetDone ? 'Progress cleared' : confirmReset ? 'Tap again to confirm' : 'Reset progress'}
                </Text>
                <Text className="text-xs text-muted">
                  Best scores, weak spots, and the daily streak
                </Text>
              </View>
            </Pressable>

            <SectionLabel>About</SectionLabel>
            <View className="flex-row items-center gap-3 rounded-2xl border border-edge bg-card p-4">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primarySoft">
                <Info size={17} color={colors.primary} strokeWidth={2.5} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-[14px] font-bold text-content">Capital Quiz</Text>
                <Text className="text-xs text-muted">Version {version}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
