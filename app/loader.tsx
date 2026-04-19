import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useTrip, Place } from "../context/TripContext";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function OptimizationLoaderScreen() {
  const router = useRouter();
  const { selectedPlaces, numberOfDays, setOptimizedJourney } = useTrip();
  
  const [statusIndex, setStatusIndex] = useState(0);
  const [percent, setPercent] = useState(0);

  const sparkleScale = useSharedValue(0.8);
  const orbitRotation = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const cardOpacity = useSharedValue(0);

  const statuses = [
    "Analyzing local transit patterns",
    "Consolidating global travel data",
    "Optimizing multi-day clusters",
    "Weighting destination proximity",
    "Refining pathfinding algorithms",
    "Perfecting your itinerary",
  ];

  useEffect(() => {
    // 1. Initial Animations
    sparkleScale.value = withRepeat(withTiming(1.2, { duration: 1200 }), -1, true);
    orbitRotation.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1);
    progressWidth.value = withTiming(100, { duration: 5000 });
    cardOpacity.value = withTiming(1, { duration: 800 });

    // 2. Percentage Ticker logic to match image
    const interval = setInterval(() => {
        setPercent(prev => {
            if (prev < 100) return prev + 1;
            return 100;
        });
    }, 50);

    // 3. Status Rotator matches the speed of optimization
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 850);

    // 4. Logic: Simulate the AI processing
    // 4. Logic: Simulate the AI processing with clustering
    const performOptimization = () => {
      if (selectedPlaces.length === 0) {
        // Handle empty case in navigation timer
        return;
      }

      const placesCopy = [...selectedPlaces];
      
      // Better Clustering Logic: Group by location if possible
      const groups: { [key: string]: Place[] } = {};
      placesCopy.forEach(p => {
        const city = p.location || p.location_display || "Other";
        if (!groups[city]) groups[city] = [];
        groups[city].push(p);
      });

      const dayList = Object.values(groups);
      const journey = [];

      // If we have more locations than days, we merge or split.
      // For demo, we just map cities to days.
      for (let i = 0; i < (numberOfDays || 1); i++) {
          const dayPlaces = dayList[i % dayList.length] || [];
          journey.push({ day: i + 1, places: dayPlaces });
      }
      
      setOptimizedJourney(journey);
    };
    performOptimization();

    // 5. Navigate
    const timer = setTimeout(() => {
      if (selectedPlaces.length === 0) {
        alert("Please select at least one place to optimize!");
        router.back();
        return;
      }
      router.replace("/summary");
    }, 5500);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
      clearTimeout(timer);
    };
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: interpolate(cardOpacity.value, [0, 1], [20, 0]) }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.header}>
            <View style={styles.logoRow}>
                <Ionicons name="search" size={20} color="#00bcd4" />
                <Text style={styles.logoText}>WHERETOGO</Text>
            </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Animated Central Core */}
        <View style={styles.widgetContainer}>
            <View style={styles.widgetGlow} />
            <View style={styles.widgetBorder}>
                <View style={styles.widgetInner}>
                    <Animated.View style={sparkleStyle}>
                        <Ionicons name="sparkles" size={54} color="#00bcd4" />
                    </Animated.View>
                    <Animated.View style={[styles.orbitContainer, orbitStyle]}>
                        <View style={styles.orbitDot} />
                    </Animated.View>
                </View>
            </View>
        </View>

        <Text style={styles.mainTitle}>Optimizing your{"\n"}journey...</Text>
        <Text style={styles.subTitle}>
            Calculating the best routes and times{"\n"}for your exploration.
        </Text>

        {/* System Status Dashboard Card */}
        <Animated.View style={[styles.statusCard, cardStyle]}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLabelRow}>
                    <View style={styles.statusLiveDot} />
                    <Text style={styles.statusLabelText}>SYSTEM STATUS</Text>
                </View>
                <Text style={styles.percentText}>{percent}%</Text>
            </View>

            <Text style={styles.statusMessage}>{statuses[statusIndex]}</Text>

            <View style={styles.progressContainer}>
                <Animated.View style={[styles.progressIndicator, progressStyle]} />
            </View>

            <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>DATA SOURCES</Text>
                    <Text style={styles.metricValue}>14 Global APIs</Text>
                </View>
                <View style={[styles.metricItem, { alignItems: 'flex-end' }]}>
                    <Text style={styles.metricLabel}>LATENT SPACE</Text>
                    <Text style={styles.metricValue}>0.042ms Delta</Text>
                </View>
            </View>
        </Animated.View>
      </View>

      {/* Global intelligence active footer */}
      <View style={styles.footer}>
          <View style={styles.intelBadge}>
              <View style={styles.intelDot} />
              <Text style={styles.intelText}>GLOBAL INTELLIGENCE ACTIVE</Text>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060606",
  },
  header: {
    paddingTop: 10,
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  widgetContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  widgetGlow: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 40,
      backgroundColor: 'rgba(0, 188, 212, 0.1)',
      shadowColor: '#00bcd4',
      shadowRadius: 50,
      shadowOpacity: 0.5,
  },
  widgetBorder: {
      width: 154,
      height: 154,
      borderRadius: 40,
      padding: 2,
      backgroundColor: 'rgba(0, 188, 212, 0.5)',
      overflow: 'hidden',
  },
  widgetInner: {
      flex: 1,
      backgroundColor: '#121212',
      borderRadius: 38,
      justifyContent: "center",
      alignItems: "center",
      overflow: 'hidden',
  },
  orbitContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
  orbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff9800',
    position: 'absolute',
    top: 5,
    right: 5,
    shadowColor: '#ff9800',
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  mainTitle: {
    color: "#00bcd4",
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 52,
    marginBottom: 20,
  },
  subTitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  statusCard: {
    width: width - 40,
    backgroundColor: "#0d0d0d",
    borderRadius: 30,
    padding: 30,
    marginTop: 80,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusLiveDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#ff9800',
      marginRight: 10,
      shadowColor: '#ff9800',
      shadowRadius: 4,
      shadowOpacity: 0.8,
  },
  statusLabelText: {
    color: "#ff9800",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  percentText: {
    color: "#00bcd4",
    fontSize: 16,
    fontWeight: "900",
  },
  statusMessage: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 25,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 35,
  },
  progressIndicator: {
    height: "100%",
    backgroundColor: "#00bcd4",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: 1,
  },
  metricValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: 'monospace',
  },
  footer: {
      position: 'absolute',
      bottom: 40,
      alignSelf: 'center',
  },
  intelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
  },
  intelDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#00bcd4',
      marginRight: 10,
      shadowColor: '#00bcd4',
      shadowRadius: 10,
      shadowOpacity: 1,
  },
  intelText: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
  },
});
