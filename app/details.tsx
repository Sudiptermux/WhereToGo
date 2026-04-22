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
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToTrip, selectedPlaces, toggleLike, isLiked } = useTrip();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await placeService.getPlaceByIdentifier(id as string);
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

  const getIsOpen = () => {
    if (!place?.opening_time || !place?.closing_time) return null;
    const now = new Date();
    const currTime = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = place.opening_time.split(':').map(Number);
    const [closeH, closeM] = place.closing_time.split(':').map(Number);
    
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    
    return currTime >= openTime && currTime <= closeTime;
  };

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
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/discovery");
          }
        }}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSelected = selectedPlaces.some((p) => p.id === place.id);
  const isOpen = getIsOpen();
  const gallery = place.place_media?.filter((m: any) => !m.isPlaceholder && m.media_type === 'image') || [];

  const openInMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${place.title}@${place.lat},${place.lng}`,
      android: `geo:0,0?q=${place.lat},${place.lng}(${place.title})`,
    });
    if (url) {
      Linking.canOpenURL(url).then(supp => supp ? Linking.openURL(url) : Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`));
    }
  };

  const getImgSource = (src: any) => typeof src === 'number' ? src : { uri: src };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* --- HERO SECTION --- */}
        <View style={styles.heroContainer}>
            <Image source={getImgSource(place.image)} style={styles.heroImage} />
            <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent", "rgba(6,6,6,1)"]}
                style={styles.heroOverlay}
            />
            
            <SafeAreaView style={styles.topHeader}>
                <TouchableOpacity style={styles.glassButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassButton}>
                    <Ionicons name="share-social-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>

            {place.isMissingMedia && (
                <View style={styles.comingSoonBadge}>
                    <MaterialCommunityIcons name="image-off" size={16} color="#ff9800" />
                    <Text style={styles.comingSoonText}>VISUALS COMING SOON</Text>
                </View>
            )}
        </View>

        {/* --- CONTENT SECTION --- */}
        <View style={styles.mainContent}>
            {/* Header / Title Area */}
            <View style={styles.headerRow}>
                <View style={styles.titleInfo}>
                    <View style={styles.categoryRow}>
                        <Text style={styles.categoryLabel}>{place.category?.toUpperCase()}</Text>
                        <View style={styles.dot} />
                        <View style={styles.statusBadge(isOpen)}>
                            <Text style={styles.statusText(isOpen)}>
                                {isOpen === null ? "HOURS VARIES" : (isOpen ? "OPEN NOW" : "CLOSED")}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.titleText}>{place.title}</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={16} color="#00bcd4" />
                        <Text style={styles.locationText}>{place.location_display}</Text>
                    </View>
                </View>
                <View style={styles.ratingCircle}>
                    <Text style={styles.ratingValue}>{place.rating}</Text>
                    <Ionicons name="star" size={12} color="#FFD700" />
                </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statGridItem}>
                    <Feather name="clock" size={20} color="#00bcd4" />
                    <Text style={styles.statGridLabel}>DURATION</Text>
                    <Text style={styles.statGridValue}>{place.avg_duration_mins}m</Text>
                </View>
                <View style={styles.statGridItem}>
                    <MaterialCommunityIcons name="ticket-outline" size={22} color="#00bcd4" />
                    <Text style={styles.statGridLabel}>ENTRY</Text>
                    <Text style={styles.statGridValue}>{place.entry_fee || "Free"}</Text>
                </View>
                <View style={styles.statGridItem}>
                    <Ionicons name="sunny-outline" size={22} color="#00bcd4" />
                    <Text style={styles.statGridLabel}>BEST TIME</Text>
                    <Text style={styles.statGridValue}>{place.best_visit_time || "Daylight"}</Text>
                </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About this place</Text>
                <Text style={styles.descriptionText}>
                    {place.description_full}
                </Text>
            </View>

            {/* Operating Hours & Location Section */}
            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                        <Feather name="calendar" size={18} color="#8e9e9f" />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>OPERATING HOURS</Text>
                        <Text style={styles.infoValue}>
                            {place.opening_time} - {place.closing_time}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.navigationCard} onPress={openInMaps}>
                    <View style={styles.navInfo}>
                        <Text style={styles.navTitle}>Ready to explore?</Text>
                        <Text style={styles.navSubtitle}>Get precise turn-by-turn directions</Text>
                    </View>
                    <LinearGradient colors={["#00bcd4", "#008ba3"]} style={styles.navIcon}>
                        <MaterialCommunityIcons name="directions" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Gallery Section */}
            {gallery.length > 1 && (
                <View style={styles.galleryContainer}>
                    <Text style={styles.sectionTitle}>Visual Journey</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                        {gallery.slice(1).map((img: any, i: number) => (
                            <View key={i} style={styles.galleryCard}>
                                <Image source={getImgSource(img.url)} style={styles.galleryImg} />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.footer}>
        <LinearGradient colors={["transparent", "rgba(6,6,6,0.9)", "#060606"]} style={styles.footerGradient}>
           <View style={styles.footerActions}>
                <TouchableOpacity 
                    style={[styles.saveBtn, isLiked(place.id) && styles.likedBtn]} 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleLike(place);
                    }}
                >
                    <Ionicons 
                        name={isLiked(place.id) ? "heart" : "heart-outline"} 
                        size={24} 
                        color={isLiked(place.id) ? "#FF2D55" : "#fff"} 
                    />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.primaryBtn, isSelected && styles.addedBtn]}
                    onPress={() => addToTrip(place)}
                >
                    <Ionicons name={isSelected ? "checkmark-circle" : "add-circle"} size={22} color={isSelected ? "#00bcd4" : "#000"} />
                    <Text style={[styles.primaryBtnText, isSelected && { color: "#00bcd4" }]}>
                        {isSelected ? "IN YOUR TRIP" : "ADD TO PLAN"}
                    </Text>
                </TouchableOpacity>
           </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060606" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060606' },
  scrollContent: { flexGrow: 1 },
  heroContainer: { height: height * 0.5, width: width },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  topHeader: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  glassButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  comingSoonBadge: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ff9800",
  },
  comingSoonText: {
    color: "#ff9800",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 8,
    letterSpacing: 1,
  },
  mainContent: {
    marginTop: -30,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: "#060606",
    paddingTop: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  titleInfo: { flex: 1, marginRight: 20 },
  categoryRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  categoryLabel: { color: "#8e9e9f", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#333", marginHorizontal: 10 },
  statusBadge: (isOpen: any) => ({
    backgroundColor: isOpen === null ? "#1a1a1a" : (isOpen ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)"),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  }),
  statusText: (isOpen: any) => ({
    color: isOpen === null ? "#8e9e9f" : (isOpen ? "#4CAF50" : "#F44336"),
    fontSize: 9,
    fontWeight: "900",
  }),
  titleText: { fontSize: 32, fontWeight: "900", color: "#fff", marginBottom: 8, letterSpacing: -0.5 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: { color: "#8e9e9f", fontSize: 13, marginLeft: 4, fontWeight: "600" },
  ratingCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  ratingValue: { color: "#fff", fontSize: 18, fontWeight: "900", marginBottom: 2 },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    marginBottom: 35,
  },
  statGridItem: {
    width: (width - 68) / 3,
    backgroundColor: "#121212",
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  statGridLabel: { color: "#555", fontSize: 9, fontWeight: "800", marginTop: 8, marginBottom: 4 },
  statGridValue: { color: "#fff", fontSize: 13, fontWeight: "700" },
  section: { paddingHorizontal: 24, marginBottom: 35 },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 15 },
  descriptionText: { color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 28, fontWeight: "500" },
  infoSection: { paddingHorizontal: 24, marginBottom: 35 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  infoIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#121212", justifyContent: "center", alignItems: "center", marginRight: 15, borderWidth: 1, borderColor: "#1a1a1a" },
  infoLabel: { color: "#555", fontSize: 10, fontWeight: "800", marginBottom: 4, letterSpacing: 0.5 },
  infoValue: { color: "#fff", fontSize: 16, fontWeight: "700" },
  navigationCard: {
    flexDirection: "row",
    backgroundColor: "#121212",
    padding: 20,
    borderRadius: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  navInfo: { flex: 1 },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 4 },
  navSubtitle: { color: "#555", fontSize: 12, fontWeight: "600" },
  navIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  galleryContainer: { marginBottom: 40 },
  galleryScroll: { paddingHorizontal: 24 },
  galleryCard: { width: 220, height: 280, borderRadius: 30, overflow: "hidden", marginRight: 15, backgroundColor: "#121212" },
  galleryImg: { width: "100%", height: "100%", resizeMode: "cover" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, height: 120 },
  footerGradient: { flex: 1, justifyContent: "flex-end", paddingBottom: 30, paddingHorizontal: 24 },
  footerActions: { flexDirection: "row", alignItems: "center" },
  saveBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", marginRight: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  likedBtn: { borderColor: "rgba(255, 45, 85, 0.3)", backgroundColor: "rgba(255, 45, 85, 0.1)" },
  primaryBtn: { flex: 1, height: 60, borderRadius: 30, backgroundColor: "#00bcd4", flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#00bcd4", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  addedBtn: { backgroundColor: "rgba(0,188,212,0.1)", borderWidth: 1, borderColor: "#00bcd4", shadowOpacity: 0 },
  primaryBtnText: { color: "#000", fontSize: 15, fontWeight: "900", marginLeft: 10 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  errorText: { color: "#fff", fontSize: 18 },
  backLink: { color: "#00bcd4", marginTop: 10 },
});
