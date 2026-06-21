import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { TripProvider } from "../context/TripContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function LayoutContent() {
  const { theme, colors, isDark } = useTheme();

  useEffect(() => {
    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    };
    hideNativeSplash();
  }, []);

  const styles = useMemo(() => {
    return StyleSheet.create({
      outerContainer: {
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#eceff1',
        justifyContent: 'center',
        alignItems: 'center',
      },
      innerContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
        ...(Platform.OS === 'web' ? {
          maxWidth: 500,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 30,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: colors.border,
        } : {}),
      }
    });
  }, [colors, isDark]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
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
