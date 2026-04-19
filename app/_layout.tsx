import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
// import AnimatedSplash from "../components/AnimatedSplash";
import { StatusBar } from "expo-status-bar";
import { TripProvider } from "../context/TripContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    // Hide the native splash screen as soon as our Layout is ready
    // This allows the AnimatedSplash component to be visible
    const hideNativeSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideNativeSplash();
  }, []);

  const handleAnimationComplete = () => {
    setIsSplashComplete(true);
  };

  return (
    <TripProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </TripProvider>
  );
}
