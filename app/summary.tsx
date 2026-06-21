import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip, Place } from "../context/TripContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function TripSummaryScreen() {
  const router = useRouter();
  const { optimizedJourney, stayLocation } = useTrip();
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const stats = useMemo(() => {
    let totalKm = 0;
    let totalMins = 0;
    let totalPlaces = 0;
    
    optimizedJourney.forEach(day => {
        totalPlaces += day.places.length;
        totalKm += day.totalDistanceKm || 0;
        totalMins += day.estimatedDurationMins || 0;
    });

    return {
        dist: Math.round(totalKm),
        time: Math.round(totalMins / 60),
        places: totalPlaces
    };
  }, [optimizedJourney]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {!isDark && <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />}
      {isDark && <LinearGradient colors={["#060606", "#0a1a2e"]} style={StyleSheet.absoluteFill} />}

      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/discovery");
          }
        }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Summary</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Executive Stats Dashboard */}
        <View style={styles.dashboard}>
            <LinearGradient
                colors={isDark ? ["rgba(0, 188, 212, 0.15)", "rgba(0,0,0,0)"] : ["rgba(0, 188, 212, 0.05)", "rgba(255,255,255,0)"]}
                style={styles.dashGradient}
            >
                <View style={styles.statBox}>
                    <Text style={styles.statVal}>{stats.dist}</Text>
                    <Text style={styles.statLab}>TOTAL KM</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statVal}>{stats.time}h</Text>
                    <Text style={styles.statLab}>EST. TRAVEL</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statVal}>{stats.places}</Text>
                    <Text style={styles.statLab}>STOPS</Text>
                </View>
            </LinearGradient>
        </View>

        {/* Stay Location Card */}
        {stayLocation && (
            <View style={styles.baseCampCard}>
                <Ionicons name="home" size={20} color="#ff9800" />
                <View style={styles.baseCampInfo}>
                    <Text style={styles.baseLabel}>DEPARTING FROM HOTEL</Text>
                    <Text style={styles.baseTitle}>{stayLocation.title}</Text>
                </View>
            </View>
        )}

        {/* Itinerary Timeline */}
        {optimizedJourney.map((day, dIdx) => (
            <View key={`day-${day.day}`} style={styles.daySection}>
                <View style={styles.dayHeader}>
                    <View style={styles.dayLine} />
                    <View style={styles.dayTitleContainer}>
                      <Text style={styles.dayTitle}>DAY {day.day}</Text>
                      {day.startTime && (
                        <Text style={styles.dayTimeRange}>{day.startTime} - {day.endTime}</Text>
                      )}
                    </View>
                    <View style={styles.dayLine} />
                </View>

                {day.places.map((place: Place, pIdx) => (
                    <View key={`place-${place.id}`} style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                            <View style={[styles.timelineDot, pIdx === 0 && styles.activeDot]} />
                            {pIdx !== day.places.length - 1 && <View style={styles.timelineConnector} />}
                        </View>
                        
                        <View style={styles.placeCard}>
                            <Image 
                                source={typeof place.image === 'number' ? place.image : { uri: place.image }} 
                                style={styles.placeImg} 
                            />
                            <View style={styles.placeDetails}>
                                <View style={styles.placeHeaderRow}>
                                  <Text style={styles.placeName}>{place.title}</Text>
                                  {place.arrivalTime && (
                                    <Text style={styles.arrivalBadge}>{place.arrivalTime}</Text>
                                  )}
                                </View>
                                <View style={styles.metaRow}>
                                    <View style={styles.metaItem}>
                                        <Feather name="clock" size={12} color={colors.primary} />
                                        <Text style={styles.metaText}>{place.avg_duration_mins || 120}m visit</Text>
                                    </View>
                                    <View style={[styles.metaItem, { marginLeft: 15 }]}>
                                        <Ionicons name="star" size={12} color="#ff9800" />
                                        <Text style={styles.metaText}>{place.rating || '4.8'}/5</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.detailsIcon}>
                                <Ionicons name="arrow-forward" size={18} color={colors.border} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Start Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push("/journey")}
        >
            <LinearGradient
                colors={isDark ? ["#00bcd4", "#008ba3"] : [colors.primary, "#81ecec"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startGradient}
            >
                <Text style={styles.startText}>START YOUR ADVENTURE</Text>
                <View style={styles.startIcon}>
                    <Ionicons name="rocket" size={20} color={isDark ? colors.primary : "#fff"} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  scrollContent: {
    padding: 20,
  },
  dashboard: {
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  dashGradient: {
    flexDirection: "row",
    paddingVertical: 35,
    paddingHorizontal: 15,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  statLab: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 5,
    letterSpacing: 1.5,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: colors.border,
    alignSelf: "center",
  },
  baseCampCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "rgba(255,152,0,0.05)" : "rgba(255,152,0,0.03)",
    padding: 20,
    borderRadius: 24,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "rgba(255,152,0,0.1)",
  },
  baseCampInfo: {
    marginLeft: 15,
  },
  baseLabel: {
    color: "#ff9800",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  baseTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  daySection: {
    marginTop: 40,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dayTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
    opacity: 0.7,
  },
  dayTitleContainer: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  dayTimeRange: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 1,
  },
  placeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  arrivalBadge: {
    backgroundColor: isDark ? 'rgba(0, 188, 212, 0.1)' : 'rgba(0, 188, 212, 0.05)',
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    width: 30,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: 25,
  },
  activeDot: {
    backgroundColor: colors.primary,
    borderColor: isDark ? "rgba(0,188,212,0.3)" : "rgba(0,188,212,0.1)",
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 5,
    marginBottom: -25,
  },
  placeCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 12,
    marginLeft: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  placeImg: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  placeDetails: {
    flex: 1,
    marginLeft: 15,
  },
  placeName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 5,
    opacity: 0.6,
  },
  detailsIcon: {
    padding: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  startButton: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  startGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
  },
  startText: {
    color: isDark ? "#000" : "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  startIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
});
