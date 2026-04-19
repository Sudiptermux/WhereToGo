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

const { width } = Dimensions.get("window");

// Utility to calculate Distance (Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export default function TripSummaryScreen() {
  const router = useRouter();
  const { optimizedJourney, stayLocation } = useTrip();

  // Calculate Metrics
  const stats = useMemo(() => {
    let totalKm = 0;
    let totalPlaces = 0;
    
    optimizedJourney.forEach(day => {
        totalPlaces += day.places.length;
        // Calculate distance between points in each day
        for (let i = 0; i < day.places.length - 1; i++) {
            const p1 = day.places[i];
            const p2 = day.places[i+1];
            const lat1 = p1.lat || p1.coordinates?.latitude;
            const lon1 = p1.lng || p1.coordinates?.longitude;
            const lat2 = p2.lat || p2.coordinates?.latitude;
            const lon2 = p2.lng || p2.coordinates?.longitude;

            if (lat1 && lon1 && lat2 && lon2) {
                totalKm += calculateDistance(lat1, lon1, lat2, lon2);
            }
        }
    });

    return {
        dist: Math.round(totalKm * 1.3), // 1.3x multiplier for road factor
        time: Math.round((totalKm * 1.3) / 30 + (totalPlaces * 2)), // 30km/h avg + 2h per stop
        places: totalPlaces
    };
  }, [optimizedJourney]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#060606", "#0a1a2e"]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Summary</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Executive Stats Dashboard */}
        <View style={styles.dashboard}>
            <LinearGradient
                colors={["rgba(0, 188, 212, 0.15)", "rgba(0,0,0,0)"]}
                style={styles.dashGradient}
            >
                <View style={styles.statBox}>
                    <Text style={styles.statVal}>{stats.dist}</Text>
                    <Text style={styles.statLab}>TOTAL KM</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statVal}>{stats.time}h</Text>
                    <Text style={styles.statLab}>EST. TIME</Text>
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
                    <Text style={styles.baseLabel}>BASE CAMP</Text>
                    <Text style={styles.baseTitle}>{stayLocation.title}</Text>
                </View>
            </View>
        )}

        {/* Itinerary Timeline */}
        {optimizedJourney.map((day, dIdx) => (
            <View key={`day-${day.day}`} style={styles.daySection}>
                <View style={styles.dayHeader}>
                    <View style={styles.dayLine} />
                    <Text style={styles.dayTitle}>DAY {day.day}</Text>
                    <View style={styles.dayLine} />
                </View>

                {day.places.map((place, pIdx) => (
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
                                <Text style={styles.placeName}>{place.title}</Text>
                                <View style={styles.metaRow}>
                                    <View style={styles.metaItem}>
                                        <Feather name="clock" size={12} color="#00bcd4" />
                                        <Text style={styles.metaText}>2h approx</Text>
                                    </View>
                                    <View style={[styles.metaItem, { marginLeft: 15 }]}>
                                        <Ionicons name="star" size={12} color="#ff9800" />
                                        <Text style={styles.metaText}>4.9/5</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.detailsIcon}>
                                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.2)" />
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
                colors={["#00bcd4", "#008ba3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startGradient}
            >
                <Text style={styles.startText}>START YOUR ADVENTURE</Text>
                <View style={styles.startIcon}>
                    <Ionicons name="rocket" size={20} color="#00bcd4" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
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
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
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
    backgroundColor: "#0d0d0d",
    borderWidth: 1,
    borderColor: "rgba(0, 188, 212, 0.1)",
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
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
  },
  statLab: {
    color: "#00bcd4",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 5,
    letterSpacing: 1.5,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignSelf: "center",
  },
  baseCampCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,152,0,0.05)",
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
    color: "#fff",
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
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  dayTitle: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    fontWeight: "900",
    marginHorizontal: 20,
    letterSpacing: 3,
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
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#333",
    marginTop: 25,
  },
  activeDot: {
    backgroundColor: "#00bcd4",
    borderColor: "rgba(0,188,212,0.3)",
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginTop: 5,
    marginBottom: -25,
  },
  placeCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#121212",
    borderRadius: 24,
    padding: 12,
    marginLeft: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
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
    color: "#fff",
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
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 5,
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
    shadowColor: "#00bcd4",
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
    color: "#000",
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
