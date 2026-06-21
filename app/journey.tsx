import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip, Place } from "../context/TripContext";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function JourneyScreen() {
  const router = useRouter();
  const { optimizedJourney, visitedPlaces, toggleVisited, stayLocation, saveActiveTrip, userProfile, clearTrip } = useTrip();
  const { colors, isDark } = useTheme();
  const [activeDay, setActiveDay] = useState(1);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const currentDayPlan = optimizedJourney.find(d => d.day === activeDay) || { day: 1, places: [] };
  const totalStops = optimizedJourney.reduce((acc, d) => acc + d.places.length, 0);
  
  const allTripPlaceIds = optimizedJourney.flatMap(d => d.places.map(p => p.id));
  const visitedStopsCount = visitedPlaces.filter(id => allTripPlaceIds.includes(id)).length;
  const progressPercent = totalStops > 0 ? (visitedStopsCount / totalStops) * 100 : 0;

  const handleNavigate = (place: Place) => {
    const { latitude, longitude } = place.coordinates || { latitude: 20.2450, longitude: 85.8200 };
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
    await saveActiveTrip();
    clearTrip(); 
    router.replace("/(tabs)/saved");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.background}>
        
        {/* Progress Header */}
        <SafeAreaView style={styles.header}>
            <View style={styles.topRow}>
                <TouchableOpacity onPress={() => router.replace("/planner")}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Journey</Text>
                <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push("/(tabs)/profile")}>
                    {userProfile.avatar ? (
                        <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="person" size={20} color={colors.textSecondary} />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                    <Text style={styles.progressLabel}>Overall Progress</Text>
                    <Text style={styles.progressValue}>{visitedStopsCount}/{totalStops} STOPS</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
                </View>
            </View>
        </SafeAreaView>

        {/* Day Tabs */}
        <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                {optimizedJourney.map((d) => (
                    <TouchableOpacity 
                        key={`tab-${d.day}`}
                        style={[styles.tab, activeDay === d.day && styles.activeTab]}
                        onPress={() => setActiveDay(d.day)}
                    >
                        <Text style={[styles.tabText, activeDay === d.day && styles.activeTabText]}>
                            DAY {d.day}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.journeyScroll}>
            
            {/* Start Point (Stay) */}
            <View style={styles.waypointContainer}>
                <View style={styles.connectorContainer}>
                    <View style={[styles.node, { backgroundColor: "#ff9800", borderColor: "rgba(255,152,0,0.2)" }]}>
                        <Ionicons name="home" size={14} color="#fff" />
                    </View>
                    <View style={styles.routeLine} />
                </View>
                <View style={styles.infoCard}>
                    <Text style={styles.waypointTime}>Departure • {currentDayPlan.startTime || "9:00 AM"}</Text>
                    <Text style={styles.waypointTitle}>{stayLocation?.title || "Your Stay"}</Text>
                    <Text style={styles.waypointSub}>{stayLocation?.location_display || stayLocation?.location?.split(',')[0] || "Bhubaneswar"}</Text>
                </View>
            </View>

            {/* Destinations */}
            {currentDayPlan.places.map((place: Place, index: number) => {
                const isVisited = visitedPlaces.includes(place.id);
                return (
                    <View key={`${place.id}-${index}`} style={styles.waypointContainer}>
                        <View style={styles.connectorContainer}>
                            {/* Transit Time indicator */}
                            {(place.travelTimeMinutes ?? 0) > 0 && (
                                <View style={styles.transitIndicator}>
                                    <View style={styles.transitLine} />
                                    <View style={styles.transitLabel}>
                                        <Feather name="trending-up" size={8} color={colors.primary} />
                                        <Text style={styles.transitText}>{place.travelTimeMinutes}m drive</Text>
                                    </View>
                                </View>
                            )}
                            <View style={[
                                styles.node, 
                                isVisited && styles.visitedNode,
                                !isVisited && styles.upcomingNode
                            ]}>
                                {isVisited ? (
                                    <Ionicons name="checkmark" size={14} color={isDark ? "#000" : "#fff"} />
                                ) : (
                                    <Text style={styles.nodeIndex}>{index + 1}</Text>
                                )}
                            </View>
                            <View style={[styles.routeLine, isVisited && styles.visitedLine]} />
                        </View>
                        
                        <View style={[styles.destinationCard, isVisited && styles.visitedCard]}>
                            <Image 
                                source={typeof place.image === 'string' ? { uri: place.image } : place.image} 
                                style={styles.destImage} 
                            />
                            <View style={styles.destInfo}>
                                <View style={styles.destHeader}>
                                    <Text style={styles.destTitle}>{place.title}</Text>
                                    <View style={styles.timeBadge}>
                                        <Text style={styles.timeText}>{place.arrivalTime || "10:30 AM"}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.metaRow}>
                                    <Feather name="clock" size={12} color={colors.primary} />
                                    <Text style={styles.metaLabel}>{place.avg_duration_mins || 120} min visit</Text>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity 
                                        style={styles.navButton}
                                        onPress={() => handleNavigate(place)}
                                    >
                                        <MaterialCommunityIcons name="google-maps" size={16} color={isDark ? "#000" : "#fff"} />
                                        <Text style={styles.navButtonText}>Let's Go</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.checkInButton, isVisited && styles.checkedInButton]}
                                        onPress={() => toggleVisited(place.id)}
                                    >
                                        <Text style={[styles.checkInText, isVisited && styles.checkedInText]}>
                                            {isVisited ? "Done" : "Check-in"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            })}

            {/* End of Day Marker */}
            <View style={styles.waypointContainer}>
                <View style={styles.connectorContainer}>
                    {currentDayPlan.finalTransitMinutes > 0 && (
                        <View style={styles.transitIndicator}>
                            <View style={styles.transitLine} />
                            <View style={styles.transitLabel}>
                                <Ionicons name="car" size={8} color="#ff9800" />
                                <Text style={[styles.transitText, { color: "#ff9800" }]}>{currentDayPlan.finalTransitMinutes}m return</Text>
                            </View>
                        </View>
                    )}
                    <View style={[styles.node, styles.endNode]}>
                        <Ionicons name="flag" size={14} color={isDark ? "#000" : "#fff"} />
                    </View>
                </View>
                <View style={styles.endCard}>
                    <Text style={styles.endTitle}>End • {currentDayPlan.endTime || "6:00 PM"}</Text>
                    <Text style={styles.endSub}>Day {activeDay} iteration complete. Rest well!</Text>
                </View>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>

        {/* Global Action Footer */}
        <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Trip to Curation</Text>
                <Ionicons name="bookmark" size={18} color={isDark ? "#000" : "#fff"} />
            </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  progressContainer: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.6,
  },
  progressValue: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    shadowColor: colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  tabContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  tabScroll: {
    paddingHorizontal: 10,
  },
  tab: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  activeTabText: {
    color: isDark ? "#000" : "#fff",
  },
  journeyScroll: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  waypointContainer: {
    flexDirection: "row",
    minHeight: 140, 
  },
  connectorContainer: {
    width: 40,
    alignItems: "center",
  },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  upcomingNode: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  visitedNode: {
    backgroundColor: colors.primary,
    borderColor: isDark ? "rgba(0,188,212,0.2)" : "rgba(0,188,212,0.1)",
  },
  endNode: {
    backgroundColor: isDark ? "#fff" : colors.text,
    borderColor: "rgba(255,152,0,0.2)",
  },
  nodeIndex: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
  },
  routeLine: {
    position: "absolute",
    top: 28,
    width: 2,
    bottom: 0,
    backgroundColor: colors.border,
  },
  visitedLine: {
    backgroundColor: colors.primary,
  },
  infoCard: {
    flex: 1,
    marginLeft: 15,
    paddingTop: 2,
  },
  waypointTime: {
    color: "#ff9800",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  waypointTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  waypointSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  destinationCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.surface,
    marginLeft: 15,
    borderRadius: 24,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  visitedCard: {
    opacity: 0.5,
    borderColor: colors.primary,
  },
  destImage: {
    width: 80,
    height: 100,
    borderRadius: 18,
  },
  destInfo: {
    flex: 1,
    marginLeft: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  destTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    flex: 1,
  },
  destHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transitIndicator: {
    position: 'absolute',
    top: -95, 
    left: 0,
    right: 0,
    alignItems: 'center',
    height: 40,
    zIndex: 5, 
    justifyContent: 'center',
  },
  transitLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'transparent',
  },
  transitLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transitText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  timeBadge: {
    backgroundColor: isDark ? "rgba(0,188,212,0.1)" : "rgba(0,188,212,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "#fff" : colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  navButtonText: {
    color: isDark ? "#000" : "#fff",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },
  checkInButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkedInButton: {
    borderColor: colors.primary,
    backgroundColor: isDark ? "rgba(0,188,212,0.1)" : "rgba(0,188,212,0.05)",
  },
  checkInText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  checkedInText: {
    color: colors.primary,
  },
  endCard: {
    flex: 1,
    marginLeft: 15,
    paddingTop: 2,
  },
  endTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  endSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    width: width,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveBtnText: {
    color: isDark ? "#000" : "#fff",
    fontSize: 14,
    fontWeight: "900",
    marginRight: 10,
    letterSpacing: 0.5,
  },
});
