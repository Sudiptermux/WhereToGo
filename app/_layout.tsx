import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplash from "../components/AnimatedSplash";
import { StatusBar } from "expo-status-bar";
import { TripProvider } from "../context/TripContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function LayoutContent() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const { theme, colors, isDark } = useTheme();

  useEffect(() => {
    const hideNativeSplash = async () => {
      try {
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 300);
      } catch (e) {
        console.warn(e);
      }
    };
    hideNativeSplash();
  }, []);

  const handleAnimationComplete = () => {
    setIsSplashComplete(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {!isSplashComplete ? (
        <AnimatedSplash onAnimationComplete={handleAnimationComplete} />
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </View>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <TripProvider>
        <LayoutContent />
      </TripProvider>
    </ThemeProvider>
  );
}
