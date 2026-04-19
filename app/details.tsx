import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip } from "../context/TripContext";
import { placeService } from "../services/placeService";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToTrip, selectedPlaces } = useTrip();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await placeService.getPlaceById(id as string);
        
        if (!data) throw new Error("Place not found");
        setPlace(data);
      } catch (err) {
        console.error("Details Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bcd4" />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Place not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSelected = selectedPlaces.some((p) => p.id === place.id);

  // Get primary video/image URL
  const primaryMedia = place.place_media?.find((m: any) => m.is_primary) || place.place_media?.[0];
  const gallery = place.place_media?.filter((m: any) => m.media_type === 'image') || [];

  const openInMaps = () => {
    const latitude = place.lat;
    const longitude = place.lng;
    const label = place.title;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
            <Image 
                source={typeof primaryMedia?.url === 'number' ? primaryMedia.url : { uri: primaryMedia?.url }} 
                style={styles.heroImage}
            />
            <LinearGradient
                colors={["rgba(0,0,0,0.4)", "transparent", "transparent", "black"]}
                style={styles.heroOverlay}
            />
            
            {/* Custom Header */}
            <SafeAreaView style={styles.topHeader}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="share-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
        </View>

        {/* Info Content Card */}
        <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{place.category?.toUpperCase() || "ICONIC LANDMARK"}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{place.rating || "5.0"}</Text>
                </View>
            </View>

            <Text style={styles.title}>{place.title}</Text>
            <View style={styles.locationRow}>
                <Ionicons name="location" size={18} color="#00bcd4" />
                <Text style={styles.locationText}>{place.location_display}</Text>
            </View>

            <Text style={styles.description}>
                {place.description_full || place.description_short}
            </Text>

            <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
                <MaterialCommunityIcons name="map-marker-path" size={20} color="#fff" />
                <Text style={styles.mapButtonText}>Explore Route in Maps</Text>
            </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
            <View style={styles.statBox}>
                <View style={[styles.statIcon, { backgroundColor: "rgba(255, 152, 0, 0.1)" }]}>
                    <Feather name="clock" size={18} color="#ff9800" />
                </View>
                <View>
                    <Text style={styles.statLabel}>MAGIC HOUR</Text>
                    <Text style={styles.statValue}>{place.best_visit_time || "Morning"}</Text>
                </View>
            </View>

            <View style={styles.statBox}>
                <View style={[styles.statIcon, { backgroundColor: "rgba(0, 188, 212, 0.1)" }]}>
                    <Ionicons name="ticket" size={18} color="#00bcd4" />
                </View>
                <View>
                    <Text style={styles.statLabel}>ENTRY FEE</Text>
                    <Text style={styles.statValue}>{place.entry_fee || "Free"}</Text>
                </View>
            </View>
        </View>

        {/* Gallery Section */}
        {gallery.length > 0 && (
            <View style={styles.gallerySection}>
                <View style={styles.galleryHeader}>
                    <Text style={styles.galleryTitle}>Visual Journey</Text>
                    <View style={styles.galleryBadge}>
                        <Text style={styles.galleryBadgeText}>{gallery.length} PHOTOS</Text>
                    </View>
                </View>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.galleryScroll}
                >
                    {gallery.map((img: any, idx: number) => (
                        <TouchableOpacity key={idx} style={styles.galleryItem}>
                            <Image source={typeof img.url === 'number' ? img.url : { uri: img.url }} style={styles.galleryImage} />
                            <LinearGradient
                                colors={["transparent", "rgba(0,0,0,0.4)"]}
                                style={styles.galleryOverlay}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer Add to Trip */}
      <View style={styles.footer}>
        <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)", "#000"]}
            style={styles.footerGradient}
        >
            <View style={styles.footerRow}>
                <View style={styles.priceSection}>
                    <Text style={styles.entryLabel}>Avg. Visit Duration</Text>
                    <Text style={styles.priceText}>{Math.floor(place.avg_duration_mins / 60)} <Text style={styles.hoursSuffix}>hours</Text></Text>
                </View>

                <TouchableOpacity 
                    style={[styles.addButton, isSelected && styles.addedButton]}
                    onPress={() => addToTrip(place)}
                >
                    <Ionicons 
                        name={isSelected ? "checkmark-circle" : "add-circle"} 
                        size={20} 
                        color={isSelected ? "#00bcd4" : "#121212"} 
                    />
                    <Text style={[styles.addButtonText, isSelected && styles.addedButtonText]}>
                        {isSelected ? "Saved" : "Add to Trip"}
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060606",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#060606',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    height: height * 0.45,
    width: width,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topHeader: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  contentCard: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    padding: 30,
    paddingTop: 35,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: "#ff9800",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  locationText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 26,
    marginBottom: 30,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 25,
    justifyContent: "space-between",
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    width: (width - 55) / 2,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 2,
  },
  statValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  footerGradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceSection: {
    flex: 1,
  },
  entryLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  priceText: {
    color: "#00bcd4",
    fontSize: 22,
    fontWeight: "900",
  },
  hoursSuffix: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  addButton: {
    flex: 1.2,
    flexDirection: "row",
    backgroundColor: "#00bcd4",
    paddingVertical: 18,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  addedButton: {
    backgroundColor: "rgba(0, 188, 212, 0.1)",
    borderWidth: 1,
    borderColor: "#00bcd4",
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },
  addedButtonText: {
    color: "#00bcd4",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
  },
  backLink: {
    color: "#00bcd4",
    marginTop: 10,
  },
  gallerySection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  galleryTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  galleryBadge: {
    backgroundColor: "rgba(0, 188, 212, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 188, 212, 0.2)",
  },
  galleryBadgeText: {
    color: "#00bcd4",
    fontSize: 10,
    fontWeight: "900",
  },
  galleryScroll: {
    paddingRight: 40,
  },
  galleryItem: {
    width: 140,
    height: 180,
    marginRight: 15,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
