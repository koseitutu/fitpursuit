import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { FontMap } from "@/constants/Typography";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppStore } from "@/store/useAppStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(FontMap);
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);
  const themeMode = useAppStore((state) => state.themeMode);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!loaded) return;
    const inOnboarding = segments[0] === "onboarding";
    if (!onboardingCompleted && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingCompleted && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [loaded, onboardingCompleted, segments, router]);

  if (!loaded && !error) {
    return null;
  }

  const bgColor = themeMode === "dark" ? "#0A0E1A" : "#F5F7FA";

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaProvider>
        <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: bgColor },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
