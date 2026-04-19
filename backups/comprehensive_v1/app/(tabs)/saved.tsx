import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip } from "../../context/TripContext";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function SavedScreen() {
  const { savedTrips, loadSavedTrip } = useTrip();
  const router = useRouter();

  const getSource = (src: any) => typeof src === 'number' ? src : { uri: src };

  const handleLoadTrip = (trip: any) => {
    loadSavedTrip(trip);
    router.push("/journey");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="menu" size={24} color="#00bcd4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Trips</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="search" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.eyebrow}>YOUR CURATION</Text>
          <Text style={styles.mainTitle}>Upcoming & Past Journeys</Text>
        </View>

        {/* Trips List */}
        <View style={styles.tripsList}>
          {savedTrips.length > 0 ? (
            savedTrips.map((trip) => (
              <TouchableOpacity key={trip.id} style={styles.tripCard} onPress={() => handleLoadTrip(trip)}>
                <Image source={getSource(trip.image)} style={styles.tripImage} />
                <LinearGradient
                  colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
                  style={styles.cardGradient}
                />
                
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: trip.statusColor }]}>
                    <Text style={styles.statusText}>{trip.status}</Text>
                  </View>
                  <TouchableOpacity style={styles.editBtn}>
                     <Feather name="edit-2" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <View style={styles.dateRow}>
                    <Feather name="calendar" size={14} color="#8e9e9f" />
                    <Text style={styles.dateText}>{trip.dates}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
                <Ionicons name="map-outline" size={60} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>No journeys saved yet</Text>
            </View>
          )}
        </View>

        {/* Plan a new escape CTA */}
        <View style={styles.ctaContainer}>
            <View style={styles.ctaBoundary}>
                <View style={styles.plusIconBox}>
                    <Ionicons name="add" size={30} color="#fff" />
                </View>
                <Text style={styles.ctaTitle}>Plan a new escape</Text>
                <Text style={styles.ctaSubtitle}>
                    Save flights, hotels, and sights in one place.
                </Text>
                <TouchableOpacity 
                    style={styles.planningBtn}
                    onPress={() => router.replace("/planner")}
                >
                    <LinearGradient
                        colors={["#00F2FE", "#4FACFE"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBtn}
                    >
                        <Text style={styles.planningBtnText}>Start Planning</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060606" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 5,
    marginLeft: 10,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  eyebrow: {
    color: "#c27d14",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  mainTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  tripsList: {
    paddingHorizontal: 20,
  },
  tripCard: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#1a1a1a",
  },
  tripImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  cardHeader: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardFooter: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  tripTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#8e9e9f",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "500",
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  ctaBoundary: {
    borderWidth: 1.5,
    borderColor: "#1a1a1a",
    borderStyle: "dashed",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.01)",
  },
  plusIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  ctaTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: "#8e9e9f",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  planningBtn: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
  },
  gradientBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  planningBtnText: {
    color: "#081a2e",
    fontWeight: "800",
    fontSize: 16,
  },
});
