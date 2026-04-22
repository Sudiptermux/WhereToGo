import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip, Place } from "../context/TripContext";
import { SafeAreaView } from "react-native-safe-area-context";

import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

export default function SelectedMapScreen() {
  const router = useRouter();
  const { selectedPlaces } = useTrip();
  const mapRef = useRef<any>(null);
  
  const [routePath, setRoutePath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isRoadMapping, setIsRoadMapping] = useState(false);

  // Initial region centered on Bhubaneswar
  const INITIAL_REGION = {
    latitude: 20.2450,
    longitude: 85.8200,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  useEffect(() => {
    if (selectedPlaces && selectedPlaces.length > 0) {
      const validCoords = selectedPlaces
        .map(p => ({
          latitude: p.lat || p.coordinates?.latitude,
          longitude: p.lng || p.coordinates?.longitude,
        }))
        .filter((c): c is { latitude: number; longitude: number } => !!c.latitude && !!c.longitude);

      if (validCoords.length > 1) {
        // Show straight lines initially
        setRoutePath(validCoords);
        // Try road-path in background
        fetchRoadPath(validCoords);
      } else {
        const p = selectedPlaces[0];
        const lat = p.lat || p.coordinates?.latitude;
        const lng = p.lng || p.coordinates?.longitude;
        if (lat && lng) {
          setRoutePath([]);
          mapRef.current?.animateToRegion({
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
          }, 1000);
        }
      }
    } else {
      setRoutePath([]);
    }
  }, [selectedPlaces]);

  const fetchRoadPath = async (coords: { latitude: number, longitude: number }[]) => {
    setIsRoadMapping(true);
    
    // Create a timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second limit

    try {
      const coordString = coords.map(c => `${c.longitude},${c.latitude}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        setIsRoadMapping(false);
        return; 
      }
      
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const geojson = data.routes[0].geometry.coordinates;
        const formatted = geojson.map((c: [number, number]) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRoutePath(formatted);
      }
    } catch (e) {
      // If it times out or fails, we just keep the straight lines
    } finally {
      setIsRoadMapping(false);
    }
  };

  const getMarkerObject = (title: string) => {
    const name = title.toLowerCase();
    if (name.includes("temple")) return { icon: "castle", color: "#FFD700" }; // Golden for temples
    if (name.includes("zoo") || name.includes("kanan")) return { icon: "paw", color: "#4CAF50" }; // Green for nature/zoo
    if (name.includes("caves")) return { icon: "mountain", color: "#9E9E9E" }; // Grey for rocks/caves
    if (name.includes("giri") || name.includes("stupa")) return { icon: "sunny", color: "#FF9800" }; // Orange for pagodas
    return { icon: "location", color: "#00bcd4" }; // Default Cyan
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {Platform.OS === 'web' ? (
        <View style={styles.webFallbackContainer}>
            <LinearGradient
                colors={["#0c0c0c", "#1a1a1a"]}
                style={StyleSheet.absoluteFill}
            />
            <Ionicons name="map-outline" size={80} color="rgba(0, 188, 212, 0.2)" />
            <Text style={styles.webFallbackTitle}>LIVE NAVIGATOR</Text>
            <Text style={styles.webFallbackSubtitle}>
                Map visualization is active on mobile. On web, you are viewing the curated sequence for {selectedPlaces[0]?.location || "your trip"}.
            </Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          customMapStyle={DARK_MAP_STYLE}
        >
          {/* Render Route */}
          {routePath.length > 0 && (
            <>
              {/* Hybrid Visualization: Simple line while loading, Glow path when ready */}
              {isRoadMapping ? (
                // LOADING STATE: Dotted/Simple line
                <Polyline
                  coordinates={routePath}
                  strokeColor="rgba(0, 188, 212, 0.4)"
                  strokeWidth={3}
                  lineDashPattern={[5, 5]}
                />
              ) : (
                // READY STATE: Neon Glow
                <>
                  <Polyline
                    coordinates={routePath}
                    strokeColor="rgba(0, 188, 212, 0.2)"
                    strokeWidth={12}
                  />
                  <Polyline
                    coordinates={routePath}
                    strokeColor="rgba(0, 188, 212, 0.4)"
                    strokeWidth={6}
                  />
                  <Polyline
                    coordinates={routePath}
                    strokeColor="#00bcd4"
                    strokeWidth={3}
                  />
                </>
              )}
            </>
          )}

          {selectedPlaces.map((place, index) => {
            const object = getMarkerObject(place.title);
            const lat = place.lat || place.coordinates?.latitude || INITIAL_REGION.latitude;
            const lng = place.lng || place.coordinates?.longitude || INITIAL_REGION.longitude;

            return (
              <Marker
                key={place.id}
                coordinate={{ latitude: lat, longitude: lng }}
                tracksViewChanges={false}
              >
                <View style={styles.markerContainer}>
                    <View style={[
                       styles.markerBody, 
                       { backgroundColor: object.color, borderColor: "#fff", borderWidth: 2 }
                    ]}>
                        <Text style={styles.markerNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.markerLabel}>
                        <Text style={styles.markerLabelText}>{place.title}</Text>
                    </View>
                </View>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* Top Header Controls */}
      <SafeAreaView style={styles.topHeader}>
        <View style={styles.headerRow}>
            <TouchableOpacity style={styles.circleIcon} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { 
                backgroundColor: isRoadMapping ? "#FFC107" : (routePath.length > 0 ? "#00E676" : "#FFC107"),
                shadowColor: isRoadMapping ? "#FFC107" : "#00E676",
                shadowOpacity: 0.5,
                shadowRadius: 5,
              }]} />
              <Text style={styles.statusText}>
                {isRoadMapping ? "MAPPING ROADS..." : (routePath.length > 0 ? "LIVE NAVIGATOR" : "PLAN YOUR ROUTE")}
              </Text>
            </View>
        </View>
      </SafeAreaView>

      {/* Bottom Summary Card */}
      <View style={styles.bottomCardContainer}>
        <LinearGradient
            colors={["rgba(30, 30, 30, 1)", "rgba(10, 10, 10, 1)"]}
            style={styles.bottomCard}
        >
            <View style={styles.dragIndicator} />
            
            <View style={styles.selectionInfo}>
                <Text style={styles.selectionTitle}>
                    <Text style={styles.selectionCount}>{selectedPlaces.length}</Text> Places Selected
                </Text>
                <Text style={styles.selectionSubtitle}>
                    {selectedPlaces.length > 1 
                        ? "Curating the fastest road sequence through Bhubaneswar." 
                        : "Select more places to generate a smart route."}
                </Text>
            </View>

            <TouchableOpacity 
                style={styles.planButton}
                onPress={() => router.push("/planner")}
            >
                <LinearGradient
                    colors={["#00F2FE", "#4FACFE"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.planButtonGradient}
                >
                    <Text style={styles.planButtonText}>Create Smart Plan</Text>
                    <View style={styles.planActionIcon}>
                        <Ionicons name="arrow-forward" size={18} color="#00bcd4" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailList}>
                {selectedPlaces.map((place) => (
                    <Image 
                        key={place.id}
                        source={typeof place.image === 'string' ? { uri: place.image } : place.image}
                        style={styles.thumbnail}
                    />
                ))}
                
                <TouchableOpacity 
                  style={styles.addMoreThumbnail}
                  onPress={() => router.push("/discovery")}
                >
                    <Ionicons name="add" size={24} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topHeader: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 10, 0.85)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  markerContainer: {
    alignItems: "center",
  },
  markerBody: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerIndex: {
    color: "#081a2e",
    fontSize: 14,
    fontWeight: "900",
  },
  markerLabel: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  markerNumber: {
    color: "#000",
    fontSize: 14,
    fontWeight: "900",
  },
  markerLabelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  bottomCardContainer: {
    position: "absolute",
    bottom: 25,
    left: 15,
    right: 15,
  },
  bottomCard: {
    borderRadius: 35,
    padding: 25,
    paddingTop: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  dragIndicator: {
    width: 35,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  selectionInfo: {
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 5,
  },
  selectionCount: {
    color: "#00bcd4",
  },
  selectionSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
    lineHeight: 18,
  },
  planButton: {
    marginBottom: 25,
    borderRadius: 18,
    overflow: "hidden",
  },
  planButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  planButtonText: {
    color: "#011627",
    fontSize: 17,
    fontWeight: "900",
    marginRight: 10,
  },
  planActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(2, 28, 50, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailList: {
    width: "100%",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  addMoreThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.2)",
  },
  webFallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  webFallbackTitle: {
    color: "#00bcd4",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 20,
    letterSpacing: 4,
  },
  webFallbackSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 15,
    lineHeight: 22,
    maxWidth: 400,
  },
});
