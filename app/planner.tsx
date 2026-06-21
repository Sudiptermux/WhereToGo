import React, { useState, useEffect, useRef, useMemo } from "react";
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
import MapView, { Marker, Polyline, UrlTile, PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

const LIGHT_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e3f2fd" }] }
];

export default function RoutePlannerScreen() {
  const router = useRouter();
  const { 
    selectedPlaces, 
    removeFromTrip, 
    stayLocation, 
    setStayLocation, 
    numberOfDays, 
    setNumberOfDays, 
    startDate,
    setStartDate,
    userProfile 
  } = useTrip();
  const { colors, isDark } = useTheme();
  
  const [showStayHub, setShowStayHub] = useState(false);
  const [isMapPicking, setIsMapPicking] = useState(false);
  const [staySearch, setStaySearch] = useState("");
  const [hotelResults, setHotelResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<any>(null);
  const [tempCoords, setTempCoords] = useState({ latitude: 20.2450, longitude: 85.8200 });
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const dateRangeDisplay = useMemo(() => {
    const end = new Date(startDate);
    end.setDate(startDate.getDate() + (numberOfDays - 1));
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }, [startDate, numberOfDays]);

  const dateOptions = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });
  }, []);

  const INITIAL_REGION = {
    latitude: 20.2450,
    longitude: 85.8200,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const [roadPath, setRoadPath] = useState<any[]>([]);

  useEffect(() => {
    if (selectedPlaces.length < 2) {
      setRoadPath([]);
      return;
    }

    const fetchRoadPath = async () => {
      try {
        const coords = selectedPlaces.map(p => 
          `${p.lng || p.coordinates?.longitude},${p.lat || p.coordinates?.latitude}`
        ).join(';');
        
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const points = data.routes[0].geometry.coordinates.map((coord: any) => ({
            latitude: coord[1],
            longitude: coord[0]
          }));
          setRoadPath(points);
        }
      } catch (e) {
        console.error("Routing error:", e);
        const fallback = selectedPlaces.map(p => ({
            latitude: p.lat || p.coordinates?.latitude || 0,
            longitude: p.lng || p.coordinates?.longitude || 0
        }));
        setRoadPath(fallback);
      }
    };

    fetchRoadPath();
  }, [selectedPlaces]);

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

  useEffect(() => {
    if (mapRef.current && (selectedPlaces.length > 0 || stayLocation)) {
      const coords = [
        ...(stayLocation ? [{ 
          latitude: stayLocation.lat || stayLocation.coordinates?.latitude || INITIAL_REGION.latitude,
          longitude: stayLocation.lng || stayLocation.coordinates?.longitude || INITIAL_REGION.longitude 
        }] : []),
        ...selectedPlaces.map(p => ({
          latitude: p.lat || p.coordinates?.latitude || INITIAL_REGION.latitude,
          longitude: p.lng || p.coordinates?.longitude || INITIAL_REGION.longitude
        }))
      ];
      if (coords.length > 0) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true,
          });
        }, 500);
      }
    }
  }, [selectedPlaces, stayLocation, isMapExpanded]);


  const handleSelectHotel = (hotel: any) => {
    setStayLocation({
      id: hotel.place_id,
      title: hotel.display_name.split(",")[0],
      location: hotel.display_name,
      description: "Selected Hotel",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500", 
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
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempCoords.latitude}&lon=${tempCoords.longitude}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'WhereToGo_App' } });
      const data = await response.json();
      
      setStayLocation({
        id: `custom-${Date.now()}`,
        title: data.name || data.address.road || "Custom Location",
        location: data.display_name,
        description: "Custom Picked Location",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500", 
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
                style={styles.fullMap}
                provider={PROVIDER_GOOGLE}
                customMapStyle={isDark ? DARK_MAP_STYLE : LIGHT_MAP_STYLE}
                initialRegion={INITIAL_REGION}
                onRegionChangeComplete={(r: any) => setTempCoords({ latitude: r.latitude, longitude: r.longitude })}
            >
                {roadPath.length > 0 && (
                    <Polyline
                        coordinates={roadPath}
                        strokeColor={colors.primary}
                        strokeWidth={4}
                        lineDashPattern={[5, 5]}
                    />
                )}

                {selectedPlaces.map(p => (
                    <Marker 
                        key={`pick-${p.id}`} 
                        coordinate={{ 
                            latitude: p.lat || p.coordinates?.latitude || INITIAL_REGION.latitude, 
                            longitude: p.lng || p.coordinates?.longitude || INITIAL_REGION.longitude 
                        }} 
                    />
                ))}
            </MapView>
            <View style={styles.crosshairContainer} pointerEvents="none">
                <View style={styles.crosshairCircle}>
                    <View style={styles.crosshairDot} />
                </View>
                <View style={styles.pinTip} />
            </View>

            <SafeAreaView style={styles.mapControls}>
                <TouchableOpacity style={styles.mapCancel} onPress={() => setIsMapPicking(false)}>
                    <Ionicons name="close" size={24} color={isDark ? "#fff" : colors.text} />
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
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/discovery");
            }
          }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Your Trip Plan</Text>
            <View style={styles.subHeaderRow}>
                <View style={[styles.statusDot, { backgroundColor: "#FF9800" }]} />
                <Text style={styles.headerSubtitle}>{stayLocation?.location_display?.split(',')[0] || "Destination"} • {dateRangeDisplay}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
                {userProfile.avatar ? (
                    <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={20} color={colors.textSecondary} />
                    </View>
                )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Destination List */}
        <View style={styles.destinationList}>
          {selectedPlaces.map((place, index) => (
            <View key={place.id} style={styles.destinationCardContainer}>
                 <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.border} />
                    <View style={styles.placeCard}>
                        <Image 
                            source={typeof place.image === 'string' ? { uri: place.image } : place.image} 
                            style={styles.placeImage}
                        />
                        <View style={styles.placeInfo}>
                            <Text style={styles.placeTitle}>{place.title}</Text>
                            <View style={styles.durationRow}>
                                <Feather name="clock" size={14} color={colors.textSecondary} />
                                <Text style={styles.durationText}>2 HOURS</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => removeFromTrip(place.id)}>
                            <Feather name="trash-2" size={20} color={colors.textSecondary} />
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
            <View style={[styles.stayIconContainer, { backgroundColor: stayLocation ? colors.primary : colors.surface }]}>
                <MaterialCommunityIcons name="home-city-outline" size={24} color={stayLocation ? (isDark ? "#000" : "#fff") : colors.textSecondary} />
            </View>
            <View style={styles.stayInfo}>
                <Text style={styles.stayLabel}>Stay Location</Text>
                <Text style={styles.stayValue} numberOfLines={1}>{stayLocation?.title || "Not selected yet"}</Text>
            </View>
            <Ionicons name={showStayHub ? "chevron-up" : "chevron-forward"} size={20} color={colors.textSecondary} />
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
                    <Ionicons name="map-outline" size={20} color={colors.primary} />
                    <Text style={styles.hubActionText}>Pick from Map (Home)</Text>
                </TouchableOpacity>

                {/* 3. Search */}
                <View style={styles.searchContainer}>
                    {isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="search" size={20} color={colors.textSecondary} />}
                    <TextInput 
                        style={styles.staySearchInput}
                        placeholder="Search Bhubaneswar Hotels..."
                        placeholderTextColor={colors.textSecondary}
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
                                <Ionicons name="business-outline" size={18} color={colors.primary} />
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

        {/* Starting Date Selector */}
        <View style={styles.dateSelector}>
            <Text style={styles.sectionLabel}>Starting Date</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={dateOptions}
                keyExtractor={(item) => item.toISOString()}
                contentContainerStyle={styles.dateList}
                renderItem={({ item }) => {
                    const isSelected = item.toDateString() === startDate.toDateString();
                    return (
                        <TouchableOpacity 
                            style={[styles.dateItem, isSelected && styles.activeDateItem]}
                            onPress={() => setStartDate(item)}
                        >
                            <Text style={[styles.dateDay, isSelected && styles.activeDateText]}>{item.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                            <Text style={[styles.dateNum, isSelected && styles.activeDateText]}>{item.getDate()}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>

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
                        <Ionicons name={isMapExpanded ? "contract" : "expand"} size={20} color={colors.primary} />
                    </TouchableOpacity>
                 </View>
            </View>
            <View style={[styles.mapFrame, { height: isMapExpanded ? 450 : 150 }]}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    customMapStyle={isDark ? DARK_MAP_STYLE : LIGHT_MAP_STYLE}
                    style={styles.miniMap}
                    initialRegion={INITIAL_REGION}
                    scrollEnabled={isMapExpanded}
                    zoomEnabled={isMapExpanded}
                >
                    {roadPath.length > 0 && (
                        <Polyline
                            coordinates={roadPath}
                            strokeColor={colors.primary}
                            strokeWidth={3}
                        />
                    )}
                    {stayLocation && (
                        <Marker 
                            coordinate={{ 
                              latitude: stayLocation.lat || stayLocation.coordinates?.latitude || INITIAL_REGION.latitude, 
                              longitude: stayLocation.lng || stayLocation.coordinates?.longitude || INITIAL_REGION.longitude 
                            }} 
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
                colors={isDark ? ["#00F2FE", "#4FACFE"] : [colors.primary, "#81ecec"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.optimizeGradient}
            >
                <MaterialCommunityIcons name="auto-fix" size={24} color={isDark ? "#000" : "#fff"} />
                <Text style={styles.optimizeText}>OPTIMIZE ROUTE</Text>
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
    backgroundColor: colors.background,
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
    color: colors.text,
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
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.6,
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
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: colors.textSecondary,
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
    backgroundColor: colors.border,
    marginLeft: 11,
    marginVertical: -5,
  },
  addDestinationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 25,
    marginTop: 15,
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  staySelectorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
  activeStayCard: {
    borderColor: colors.primary,
    backgroundColor: isDark ? "rgba(0, 188, 212, 0.05)" : "rgba(0, 188, 212, 0.02)",
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
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
    opacity: 0.6,
  },
  stayValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  stayHubContent: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  hubSubTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
  },
  hubCategory: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 15,
    opacity: 0.5,
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
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  hubActionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? "rgba(0, 188, 212, 0.05)" : "rgba(0, 188, 212, 0.03)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? "rgba(0, 188, 212, 0.1)" : "rgba(0, 188, 212, 0.05)",
  },
  hubActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  staySearchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.text,
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
    borderBottomColor: colors.border,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  resultAddress: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    opacity: 0.6,
  },
  dateSelector: {
    marginTop: 10,
    marginBottom: 30,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
  },
  dateList: {
    paddingRight: 20,
  },
  dateItem: {
    width: 65,
    height: 85,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeDateItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateDay: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  dateNum: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  activeDateText: {
    color: isDark ? "#000" : "#fff",
  },
  daySelector: {
    marginTop: 10,
    marginBottom: 30,
  },
  dayLabel: {
    color: colors.text,
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
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeDayButton: {
    backgroundColor: isDark ? "rgba(0, 188, 212, 0.1)" : "rgba(0, 188, 212, 0.05)",
    borderColor: colors.primary,
  },
  dayButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "800",
  },
  activeDayButtonText: {
    color: colors.primary,
  },
  mapPreviewContainer: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  previewBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewBadgeText: {
    color: isDark ? "#000" : "#fff",
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
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mapConfirm: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  mapConfirmText: {
    color: isDark ? "#000" : "#fff",
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
      borderColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(0, 188, 212, 0.1)" : "rgba(0, 188, 212, 0.05)",
  },
  crosshairDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
  },
  pinTip: {
    width: 2,
    height: 30,
    backgroundColor: colors.primary,
    marginTop: -2,
  },
  mapHint: {
      position: "absolute",
      bottom: 100,
      alignSelf: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
  },
  mapHintText: {
      color: colors.text,
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
    shadowColor: colors.primary,
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
    color: isDark ? "#000" : "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 12,
    letterSpacing: 1,
  },
});
;
