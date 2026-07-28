import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Tab group: index + todo */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Full-screen note modal */}
          <Stack.Screen
            name="note-modal"
            // Keyed by note id so repeat taps collapse into one screen while
            // distinct notes still get their own.
            dangerouslySingular={(name, params) =>
              `${name}-${params.id ?? "new"}`
            }
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
