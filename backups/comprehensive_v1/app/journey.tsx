import React, { useState } from "react";
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

const { width } = Dimensions.get("window");

export default function JourneyScreen() {
  const router = useRouter();
  const { optimizedJourney, visitedPlaces, toggleVisited, stayLocation, saveActiveTrip } = useTrip();
  const [activeDay, setActiveDay] = useState(1);

  const currentDayPlan = optimizedJourney.find(d => d.day === activeDay) || { day: 1, places: [] };
  const totalStops = optimizedJourney.reduce((acc, d) => acc + d.places.length, 0);
  const progressPercent = (visitedPlaces.length / totalStops) * 100;

  const handleNavigate = (place: Place) => {
    const { latitude, longitude } = place.coordinates || { latitude: 20.2450, longitude: 85.8200 };
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
    saveActiveTrip();
    router.replace("/(tabs)/saved");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#060606", "#101010"]} style={styles.background}>
        
        {/* Progress Header */}
        <SafeAreaView style={styles.header}>
            <View style={styles.topRow}>
                <TouchableOpacity onPress={() => router.replace("/planner")}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Journey</Text>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: "https://i.pravatar.cc/100?u=unik" }} style={styles.avatar} />
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                    <Text style={styles.progressLabel}>Overall Progress</Text>
                    <Text style={styles.progressValue}>{visitedPlaces.length}/{totalStops} STOPS</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
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
                        <Ionicons name="home" size={14} color="#000" />
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
            {currentDayPlan.places.map((place: any, index: number) => {
                const isVisited = visitedPlaces.includes(place.id);
                return (
                    <View key={`${place.id}-${index}`} style={styles.waypointContainer}>
                        <View style={styles.connectorContainer}>
                            {/* Transit Time indicator */}
                            {place.travelTimeMinutes > 0 && (
                                <View style={styles.transitIndicator}>
                                    <View style={styles.transitLine} />
                                    <View style={styles.transitLabel}>
                                        <Feather name="trending-up" size={8} color="#00bcd4" />
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
                                    <Ionicons name="checkmark" size={14} color="#000" />
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
                                    <Feather name="clock" size={12} color="#00bcd4" />
                                    <Text style={styles.metaLabel}>{place.avg_duration_mins || 120} min visit</Text>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity 
                                        style={styles.navButton}
                                        onPress={() => handleNavigate(place)}
                                    >
                                        <MaterialCommunityIcons name="google-maps" size={16} color="#000" />
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
                        <Ionicons name="flag" size={14} color="#000" />
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
                <Ionicons name="bookmark" size={18} color="#000" />
            </TouchableOpacity>
        </View>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  progressContainer: {
    backgroundColor: "#121212",
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "700",
  },
  progressValue: {
    color: "#00bcd4",
    fontSize: 12,
    fontWeight: "900",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00bcd4",
    shadowColor: "#00bcd4",
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
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  activeTab: {
    backgroundColor: "#00bcd4",
  },
  tabText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  activeTabText: {
    color: "#000",
  },
  journeyScroll: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  waypointContainer: {
    flexDirection: "row",
    minHeight: 110,
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
    backgroundColor: "#060606",
    borderColor: "#222",
  },
  visitedNode: {
    backgroundColor: "#00bcd4",
    borderColor: "rgba(0,188,212,0.2)",
  },
  endNode: {
    backgroundColor: "#fff",
    borderColor: "rgba(255,255,255,0.2)",
  },
  nodeIndex: {
    color: "#444",
    fontSize: 12,
    fontWeight: "900",
  },
  routeLine: {
    position: "absolute",
    top: 28,
    width: 2,
    bottom: 0,
    backgroundColor: "#222",
  },
  visitedLine: {
    backgroundColor: "#00bcd4",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  waypointSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  destinationCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#121212",
    marginLeft: 15,
    borderRadius: 24,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  visitedCard: {
    opacity: 0.5,
    borderColor: "#00bcd4",
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
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  destTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    flex: 1,
  },
  transitIndicator: {
    position: 'absolute',
    top: -45,
    left: 0,
    right: 0,
    alignItems: 'center',
    height: 40,
    zIndex: 1,
  },
  transitLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  transitLabel: {
    position: 'absolute',
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#060606',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  transitText: {
    color: '#00bcd4',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  timeBadge: {
    backgroundColor: "rgba(0,188,212,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    color: "#00bcd4",
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
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  navButtonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },
  checkInButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  checkedInButton: {
    borderColor: "#00bcd4",
    backgroundColor: "rgba(0,188,212,0.1)",
  },
  checkInText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  checkedInText: {
    color: "#00bcd4",
  },
  endCard: {
    flex: 1,
    marginLeft: 15,
    paddingTop: 2,
  },
  endTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  endSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
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
    backgroundColor: "#00bcd4",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "900",
    marginRight: 10,
    letterSpacing: 0.5,
  },
});
