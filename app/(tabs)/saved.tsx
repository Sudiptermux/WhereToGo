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
  const { savedTrips, loadSavedTrip, likedPlaces, toggleLike, deleteTrip } = useTrip();
  const router = useRouter();

  const getSource = (src: any) => typeof src === 'number' ? src : { uri: src };

  const handleLoadTrip = (trip: any) => {
    loadSavedTrip(trip);
    router.push("/journey");
  };

  const handleDeleteTrip = (id: string) => {
    deleteTrip(id);
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

        {/* My Wishlist Section */}
        {likedPlaces.length > 0 && (
          <View style={styles.wishlistSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>MY WISHLIST</Text>
              <Text style={styles.sectionCount}>{likedPlaces.length} locations</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.wishlistScroll}
            >
              {likedPlaces.map((place) => (
                <TouchableOpacity 
                  key={place.id} 
                  style={styles.wishlistCard}
                  onPress={() => router.push({ pathname: "/details", params: { id: place.id } })}
                >
                  <Image source={getSource(place.image)} style={styles.wishlistImage} />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.wishlistGradient}
                  />
                  <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => toggleLike(place)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.wishlistTitle} numberOfLines={1}>{place.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
                  <TouchableOpacity style={styles.editBtn} onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(trip.id);
                  }}>
                     <Feather name="trash-2" size={18} color="#ff4444" />
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
  wishlistSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionEyebrow: {
    color: "#00bcd4",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  sectionCount: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
  },
  wishlistScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  wishlistCard: {
    width: 140,
    height: 180,
    borderRadius: 20,
    marginRight: 15,
    backgroundColor: "#121212",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  wishlistImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  wishlistGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  wishlistTitle: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
