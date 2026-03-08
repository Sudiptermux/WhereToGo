import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";

const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY'; // Replace with your Google Maps API key

export default function HomeScreen() {
  const router = useRouter(); // ✅ router added
  const [searchText, setSearchText] = useState("");
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (searchText.trim()) {
      geocodePlace(searchText);
    }
  }, [searchText]);

  const geocodePlace = async (place) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setMapRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Ionicons name="compass" size={20} color="#fff" />
            </View>
            <Text style={styles.title}>WhereToGo</Text>
          </View>

          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color="#00bcd4" />
          <TextInput
            style={styles.searchInput}
            placeholder="Where are you heading next?"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Explore Map Card */}
        <View style={styles.card}>
          <MapView
            style={styles.mapImage}
            region={mapRegion}
            provider={MapView.PROVIDER_GOOGLE}
          >
            {searchText ? (
              <Marker
                coordinate={mapRegion}
                title={searchText}
              />
            ) : null}
          </MapView>
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardTitle}>Explore Map</Text>
              <Text style={styles.cardSubtitle}>
                Discover hidden gems nearby
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => setIsMapExpanded(true)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                View
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Planning */}
        <View style={styles.planningCard}>
          <View style={styles.planningHeader}>
            <View style={styles.calendarIcon}>
              <Ionicons name="calendar" size={20} color="#00bcd4" />
            </View>
            <View>
              <Text style={styles.cardTitle}>My Planning</Text>
              <Text style={styles.cardSubtitle}>
                Your upcoming itineraries
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ACTIVE TRIPS</Text>
              <Text style={styles.statNumber}>03</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DRAFTS</Text>
              <Text style={styles.statNumberDark}>12</Text>
            </View>
          </View>

          {/* ✅ THIS BUTTON NOW NAVIGATES */}
        <TouchableOpacity
  style={styles.plannerBtn}
  onPress={() => router.push("/planner")}
>
  <Text style={styles.plannerText}>Open Planner ✏️</Text>
</TouchableOpacity>

        </View>

        {/* Ready To Go */}
        <View style={styles.readyCard}>
          <Ionicons name="paper-plane" size={40} color="#fff" />
          <Text style={styles.readyTitle}>Ready to Go?</Text>
          <Text style={styles.readySubtitle}>
            Start your navigation for "Weekend in Kyoto"
          </Text>

          <TouchableOpacity style={styles.routeBtn}>
            <Text style={styles.routeText}>START ROUTE →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Map Modal */}
      <Modal
        visible={isMapExpanded}
        animationType="slide"
        onRequestClose={() => setIsMapExpanded(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setIsMapExpanded(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <MapView
            style={styles.fullMap}
            region={mapRegion}
            provider={MapView.PROVIDER_GOOGLE}
          >
            {searchText ? (
              <Marker
                coordinate={mapRegion}
                title={searchText}
              />
            ) : null}
          </MapView>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Home" active />
        <NavItem icon="bookmark" label="Saved" />
        <NavItem icon="notifications" label="Inbox" />
        <NavItem icon="settings" label="Settings" />
      </View>
    </View>
  );
}

const NavItem = ({ icon, label, active }) => (
  <View style={{ alignItems: "center" }}>
    <Ionicons
      name={icon}
      size={22}
      color={active ? "#00bcd4" : "#8e9e9f"}
    />
    <Text
      style={{
        fontSize: 12,
        color: active ? "#00bcd4" : "#8e9e9f",
      }}
    >
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f5f6" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoCircle: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#00bcd4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  title: { fontSize: 20, fontWeight: "700" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  searchBox: {
    backgroundColor: "#e3eaec",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchText: { marginLeft: 10, color: "#8e9e9f" },
  searchInput: { marginLeft: 10, flex: 1, color: "#000" },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  mapImage: { width: "100%", height: 150 },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  cardSubtitle: { color: "#8e9e9f" },
  viewBtn: {
    backgroundColor: "#00bcd4",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  planningCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  planningHeader: { flexDirection: "row", alignItems: "center" },
  calendarIcon: {
    backgroundColor: "#dff3f5",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  statBox: {
    backgroundColor: "#eef2f3",
    padding: 15,
    borderRadius: 15,
    width: "48%",
  },
  statLabel: { fontSize: 12, color: "#8e9e9f" },
  statNumber: { fontSize: 20, fontWeight: "700", color: "#00bcd4" },
  statNumberDark: { fontSize: 20, fontWeight: "700" },
  plannerBtn: {
    backgroundColor: "#0f172a",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  plannerText: { color: "#fff", fontWeight: "600" },
  readyCard: {
    marginHorizontal: 20,
    backgroundColor: "#00bcd4",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    marginBottom: 100,
  },
  readyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },
  readySubtitle: {
    color: "#e0f7fa",
    textAlign: "center",
    marginVertical: 10,
  },
  routeBtn: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginTop: 10,
  },
  routeText: { fontWeight: "700" },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },
  modalContainer: { flex: 1, backgroundColor: "#000" },
  fullMap: { flex: 1 },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 10,
  },
});
