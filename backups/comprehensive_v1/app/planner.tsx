import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  TextInput,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip, Place } from "../context/TripContext";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export default function RoutePlannerScreen() {
  const router = useRouter();
  const { selectedPlaces, removeFromTrip, stayLocation, setStayLocation, numberOfDays, setNumberOfDays } = useTrip();
  
  const [showStayHub, setShowStayHub] = useState(false);
  const [isMapPicking, setIsMapPicking] = useState(false);
  const [staySearch, setStaySearch] = useState("");
  const [hotelResults, setHotelResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<any>(null);
  const [tempCoords, setTempCoords] = useState({ latitude: 20.2450, longitude: 85.8200 });
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const INITIAL_REGION = {
    latitude: 20.2450,
    longitude: 85.8200,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // Real-time Nominatim Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (staySearch.length > 2) {
        performHotelSearch();
      } else {
        setHotelResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [staySearch]);

  const performHotelSearch = async () => {
    setIsSearching(true);
    try {
      // Searching for hotels in/near Bhubaneswar
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=hotel+in+bhubaneswar+${staySearch}&limit=5&addressdetails=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'WhereToGo_App' } });
      const data = await response.json();
      setHotelResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectHotel = (hotel: any) => {
    setStayLocation({
      id: hotel.place_id,
      title: hotel.display_name.split(",")[0],
      location: hotel.display_name,
      description: "Selected Hotel",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500", // Generic hotel image
      likes: "N/A",
      lat: parseFloat(hotel.lat),
      lng: parseFloat(hotel.lon)
    });
    setStaySearch("");
    setShowStayHub(false);
  };

  const handleMapConfirm = async () => {
    setIsSearching(true);
    try {
      // Reverse geocode to get an address for the picked point
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempCoords.latitude}&lon=${tempCoords.longitude}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'WhereToGo_App' } });
      const data = await response.json();
      
      setStayLocation({
        id: `custom-${Date.now()}`,
        title: data.name || data.address.road || "Custom Location",
        location: data.display_name,
        description: "Custom Picked Location",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500", // City/Home feel image
        likes: "N/A",
        lat: tempCoords.latitude,
        lng: tempCoords.longitude
      });
      setIsMapPicking(false);
      setShowStayHub(false);
    } catch (error) {
        console.error("Map confirm error:", error);
    } finally {
        setIsSearching(false);
    }
  };

  if (isMapPicking) {
    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.fullMap}
                initialRegion={INITIAL_REGION}
                customMapStyle={DARK_MAP_STYLE}
                onRegionChangeComplete={(r: any) => setTempCoords({ latitude: r.latitude, longitude: r.longitude })}
            />
            {/* Crosshair Overlay */}
            <View style={styles.crosshairContainer} pointerEvents="none">
                <View style={styles.crosshairCircle}>
                    <View style={styles.crosshairDot} />
                </View>
                <View style={styles.pinTip} />
            </View>

            <SafeAreaView style={styles.mapControls}>
                <TouchableOpacity style={styles.mapCancel} onPress={() => setIsMapPicking(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapConfirm} onPress={handleMapConfirm}>
                    <Text style={styles.mapConfirmText}>Pick This Location</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.mapHint}>
                <Text style={styles.mapHintText}>Drag the map to place the pin on your stay</Text>
            </View>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Your Trip Plan</Text>
            <View style={styles.subHeaderRow}>
                <View style={[styles.statusDot, { backgroundColor: "#FF9800" }]} />
                <Text style={styles.headerSubtitle}>Bhubaneswar, India • Oct 12 - Oct 15</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <Image 
                source={{ uri: "https://i.pravatar.cc/100?u=unik" }} 
                style={styles.avatar}
            />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Destination List */}
        <View style={styles.destinationList}>
          {selectedPlaces.map((place, index) => (
            <View key={place.id} style={styles.destinationCardContainer}>
                 <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color="#444" />
                    <View style={styles.placeCard}>
                        <Image 
                            source={typeof place.image === 'string' ? { uri: place.image } : place.image} 
                            style={styles.placeImage}
                        />
                        <View style={styles.placeInfo}>
                            <Text style={styles.placeTitle}>{place.title}</Text>
                            <View style={styles.durationRow}>
                                <Feather name="clock" size={14} color="#aaa" />
                                <Text style={styles.durationText}>2 HOURS</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => removeFromTrip(place.id)}>
                            <Feather name="trash-2" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                 </View>
                 {index !== selectedPlaces.length - 1 && <View style={styles.connector} />}
            </View>
          ))}

          {/* Add Destination Loop */}
          <TouchableOpacity 
            style={styles.addDestinationCard}
            onPress={() => router.push("/discovery")}
          >
            <View style={styles.addIconContainer}>
                <Ionicons name="add" size={24} color="#fff" />
            </View>
            <Text style={styles.addText}>ADD DESTINATION</Text>
          </TouchableOpacity>
        </View>

        {/* The Stay Hub Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stay & Constraints</Text>
        </View>

        <TouchableOpacity 
            style={[styles.staySelectorCard, stayLocation && styles.activeStayCard]}
            onPress={() => setShowStayHub(!showStayHub)}
        >
            <View style={[styles.stayIconContainer, { backgroundColor: stayLocation ? "#00bcd4" : "#1a1a1a" }]}>
                <MaterialCommunityIcons name="home-city-outline" size={24} color={stayLocation ? "#000" : "#555"} />
            </View>
            <View style={styles.stayInfo}>
                <Text style={styles.stayLabel}>Stay Location</Text>
                <Text style={styles.stayValue} numberOfLines={1}>{stayLocation?.title || "Not selected yet"}</Text>
            </View>
            <Ionicons name={showStayHub ? "chevron-up" : "chevron-forward"} size={20} color="#555" />
        </TouchableOpacity>

        {showStayHub && (
            <View style={styles.stayHubContent}>
                <Text style={styles.hubSubTitle}>Where are you staying?</Text>
                
                {/* 1. Near Selection */}
                <Text style={styles.hubCategory}>STAY NEAR YOUR SPOTS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proximityList}>
                    {selectedPlaces.map((p) => (
                        <TouchableOpacity 
                            key={`near-${p.id}`} 
                            style={styles.proximityItem}
                            onPress={() => setStayLocation({ ...p, title: `Near ${p.title}` })}
                        >
                            <Image source={typeof p.image === 'string' ? { uri: p.image } : p.image} style={styles.proximityImage} />
                            <Text style={styles.proximityText} numberOfLines={1}>{p.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* 2. Map Pick */}
                <TouchableOpacity style={styles.hubActionItem} onPress={() => setIsMapPicking(true)}>
                    <Ionicons name="map-outline" size={20} color="#00bcd4" />
                    <Text style={styles.hubActionText}>Pick from Map (Home)</Text>
                </TouchableOpacity>

                {/* 3. Search */}
                <View style={styles.searchContainer}>
                    {isSearching ? <ActivityIndicator size="small" color="#00bcd4" /> : <Ionicons name="search" size={20} color="#555" />}
                    <TextInput 
                        style={styles.staySearchInput}
                        placeholder="Search Bhubaneswar Hotels..."
                        placeholderTextColor="#444"
                        value={staySearch}
                        onChangeText={setStaySearch}
                    />
                </View>

                {hotelResults.length > 0 && (
                    <View style={styles.searchResultsContainer}>
                        {hotelResults.map((hotel) => (
                            <TouchableOpacity 
                                key={hotel.place_id} 
                                style={styles.searchResultItem}
                                onPress={() => handleSelectHotel(hotel)}
                            >
                                <Ionicons name="business-outline" size={18} color="#00bcd4" />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.resultTitle} numberOfLines={1}>{hotel.display_name.split(",")[0]}</Text>
                                    <Text style={styles.resultAddress} numberOfLines={1}>{hotel.display_name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        )}

        {/* Day count constraint */}
        <View style={styles.daySelector}>
            <Text style={styles.dayLabel}>Trip Duration (Days)</Text>
            <View style={styles.dayButtons}>
                {[1, 2, 3, 4, 5].map((day) => (
                    <TouchableOpacity 
                        key={day}
                        style={[styles.dayButton, numberOfDays === day && styles.activeDayButton]}
                        onPress={() => setNumberOfDays(day)}
                    >
                        <Text style={[styles.dayButtonText, numberOfDays === day && styles.activeDayButtonText]}>
                            {day}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* Map Preview Thumbnail */}
        <View style={[styles.mapPreviewContainer, isMapExpanded && { padding: 10 }]}>
            <View style={styles.previewHeader}>
                 <Text style={styles.previewTitle}>Route Preview</Text>
                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.previewBadge}>
                        <Text style={styles.previewBadgeText}>LIVE ROUTE PREVIEW</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.expandButton} 
                        onPress={() => setIsMapExpanded(!isMapExpanded)}
                    >
                        <Ionicons name={isMapExpanded ? "contract" : "expand"} size={20} color="#00bcd4" />
                    </TouchableOpacity>
                 </View>
            </View>
            <View style={[styles.mapFrame, { height: isMapExpanded ? 450 : 150 }]}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.miniMap}
                    initialRegion={INITIAL_REGION}
                    customMapStyle={DARK_MAP_STYLE}
                    scrollEnabled={isMapExpanded}
                    zoomEnabled={isMapExpanded}
                >
                    {stayLocation && (
                        <Marker 
                            coordinate={{ 
                              latitude: stayLocation.lat || stayLocation.coordinates?.latitude || INITIAL_REGION.latitude, 
                              longitude: stayLocation.lng || stayLocation.coordinates?.longitude || INITIAL_REGION.longitude 
                            }} 
                            pinColor="#ff9800" 
                        />
                    )}
                    {selectedPlaces.map(p => (
                        <Marker 
                          key={`mini-${p.id}`} 
                          coordinate={{ 
                            latitude: p.lat || p.coordinates?.latitude || INITIAL_REGION.latitude, 
                            longitude: p.lng || p.coordinates?.longitude || INITIAL_REGION.longitude 
                          }} 
                        />
                    ))}
                </MapView>
            </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.optimizeButton}
            onPress={() => router.push("/loader")}
        >
            <LinearGradient
                colors={["#00F2FE", "#4FACFE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.optimizeGradient}
            >
                <MaterialCommunityIcons name="auto-fix" size={24} color="#000" />
                <Text style={styles.optimizeText}>OPTIMIZE ROUTE</Text>
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060606",
  },
  header: {
    backgroundColor: "#060606",
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },
  subHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
  },
  headerIcon: {
    marginRight: 15,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  destinationList: {
    marginTop: 20,
    marginBottom: 30,
  },
  destinationCardContainer: {
    alignItems: "flex-start",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
    borderColor: "rgba(255,255,255,0.05)",
  },
  placeImage: {
    width: 70,
    height: 70,
    borderRadius: 18,
  },
  placeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  placeTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  deleteButton: {
    padding: 10,
  },
  connector: {
    width: 2,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 11,
    marginVertical: -5,
  },
  addDestinationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    paddingVertical: 25,
    marginTop: 15,
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  staySelectorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 15,
  },
  activeStayCard: {
    borderColor: "#00bcd4",
    backgroundColor: "rgba(0, 188, 212, 0.05)",
  },
  stayIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  stayInfo: {
    flex: 1,
    marginLeft: 15,
  },
  stayLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  stayValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  stayHubContent: {
    backgroundColor: "#0d0d0d",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 188, 212, 0.4)",
  },
  hubSubTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
  },
  hubCategory: {
    color: "#444",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 15,
  },
  proximityList: {
    marginBottom: 20,
  },
  proximityItem: {
    width: 90,
    marginRight: 15,
    alignItems: "center",
  },
  proximityImage: {
    width: 55,
    height: 55,
    borderRadius: 15,
    marginBottom: 8,
  },
  proximityText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  hubActionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 188, 212, 0.05)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 188, 212, 0.1)",
  },
  hubActionText: {
    color: "#00bcd4",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50,
  },
  staySearchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#fff",
    fontSize: 14,
  },
  searchResultsContainer: {
    maxHeight: 200,
    marginTop: 10,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  resultTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  resultAddress: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    marginTop: 2,
  },
  daySelector: {
    marginTop: 10,
    marginBottom: 30,
  },
  dayLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
  },
  dayButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: (width - 80) / 5,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  activeDayButton: {
    backgroundColor: "#00bcd410",
    borderColor: "#00bcd4",
  },
  dayButtonText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
    fontWeight: "800",
  },
  activeDayButtonText: {
    color: "#00bcd4",
  },
  mapPreviewContainer: {
    backgroundColor: "#121212",
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  previewTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  previewBadge: {
    backgroundColor: "#00bcd4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
  },
  mapFrame: {
    borderRadius: 20,
    overflow: "hidden",
  },
  expandButton: {
    marginLeft: 10,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  fullMap: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  mapCancel: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapConfirm: {
    backgroundColor: "#00bcd4",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  mapConfirmText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 14,
  },
  crosshairContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: "#00bcd4",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 188, 212, 0.1)",
  },
  crosshairDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#00bcd4",
  },
  pinTip: {
    width: 2,
    height: 30,
    backgroundColor: "#00bcd4",
    marginTop: -2,
  },
  mapHint: {
      position: "absolute",
      bottom: 100,
      alignSelf: "center",
      backgroundColor: "rgba(0,0,0,0.8)",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 30,
  },
  mapHintText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 35,
    backgroundColor: "transparent",
  },
  optimizeButton: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  optimizeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
  },
  optimizeText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 12,
    letterSpacing: 1,
  },
});
