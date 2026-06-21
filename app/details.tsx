import React, { useEffect, useState, useMemo } from "react";
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
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToTrip, selectedPlaces, toggleLike, isLiked } = useTrip();
  const { colors, isDark } = useTheme();
  
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <ActivityIndicator size="large" color={colors.primary} />
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
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* --- HERO SECTION --- */}
        <View style={styles.heroContainer}>
            <Image source={getImgSource(place.image)} style={styles.heroImage} />
            <LinearGradient
                colors={["rgba(0,0,0,0.4)", "transparent", colors.background]}
                style={styles.heroOverlay}
            />
            
            <SafeAreaView style={styles.topHeader}>
                <TouchableOpacity style={styles.glassButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={isDark ? "#fff" : colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassButton}>
                    <Ionicons name="share-social-outline" size={22} color={isDark ? "#fff" : colors.text} />
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
                        <Ionicons name="location-sharp" size={16} color={colors.primary} />
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
                    <Feather name="clock" size={20} color={colors.primary} />
                    <Text style={styles.statGridLabel}>DURATION</Text>
                    <Text style={styles.statGridValue}>{place.avg_duration_mins}m</Text>
                </View>
                <View style={styles.statGridItem}>
                    <MaterialCommunityIcons name="ticket-outline" size={22} color={colors.primary} />
                    <Text style={styles.statGridLabel}>ENTRY</Text>
                    <Text style={styles.statGridValue}>{place.entry_fee || "Free"}</Text>
                </View>
                <View style={styles.statGridItem}>
                    <Ionicons name="sunny-outline" size={22} color={colors.primary} />
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
                        <Feather name="calendar" size={18} color={colors.textSecondary} />
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
                    <LinearGradient colors={[colors.primary, isDark ? "#008ba3" : "#0097a7"]} style={styles.navIcon}>
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
        <LinearGradient 
            colors={["transparent", isDark ? "rgba(6,6,6,0.9)" : "rgba(255,255,255,0.9)", colors.background]} 
            style={styles.footerGradient}
        >
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
                        color={isLiked(place.id) ? "#FF2D55" : (isDark ? "#fff" : colors.text)} 
                    />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.primaryBtn, isSelected && styles.addedBtn]}
                    onPress={() => addToTrip(place)}
                >
                    <Ionicons 
                        name={isSelected ? "checkmark-circle" : "add-circle"} 
                        size={22} 
                        color={isSelected ? colors.primary : (isDark ? "#000" : "#fff")} 
                    />
                    <Text style={[styles.primaryBtnText, isSelected && { color: colors.primary }]}>
                        {isSelected ? "IN YOUR TRIP" : "ADD TO PLAN"}
                    </Text>
                </TouchableOpacity>
           </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
    backgroundColor: colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.isDark ? "rgba(255,255,255,0.1)" : colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: colors.background,
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
  categoryLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 10 },
  statusBadge: (isOpen: any) => ({
    backgroundColor: isOpen === null ? colors.surface : (isOpen ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)"),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  }),
  statusText: (isOpen: any) => ({
    color: isOpen === null ? colors.textSecondary : (isOpen ? "#4CAF50" : "#F44336"),
    fontSize: 9,
    fontWeight: "900",
  }),
  titleText: { fontSize: 32, fontWeight: "900", color: colors.text, marginBottom: 8, letterSpacing: -0.5 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: { color: colors.textSecondary, fontSize: 13, marginLeft: 4, fontWeight: "600" },
  ratingCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingValue: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 2 },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    marginBottom: 35,
  },
  statGridItem: {
    width: (width - 68) / 3,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statGridLabel: { color: colors.textMuted, fontSize: 9, fontWeight: "800", marginTop: 8, marginBottom: 4 },
  statGridValue: { color: colors.text, fontSize: 13, fontWeight: "700" },
  section: { paddingHorizontal: 24, marginBottom: 35 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 15 },
  descriptionText: { color: colors.textSecondary, fontSize: 16, lineHeight: 28, fontWeight: "500", opacity: 0.8 },
  infoSection: { paddingHorizontal: 24, marginBottom: 35 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  infoIconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: colors.surface, 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 15, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  infoLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800", marginBottom: 4, letterSpacing: 0.5 },
  infoValue: { color: colors.text, fontSize: 16, fontWeight: "700" },
  navigationCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  navInfo: { flex: 1 },
  navTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 4 },
  navSubtitle: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  navIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  galleryContainer: { marginBottom: 40 },
  galleryScroll: { paddingHorizontal: 24 },
  galleryCard: { 
    width: 220, 
    height: 280, 
    borderRadius: 30, 
    overflow: "hidden", 
    marginRight: 15, 
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  galleryImg: { width: "100%", height: "100%", resizeMode: "cover" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, height: 120 },
  footerGradient: { flex: 1, justifyContent: "flex-end", paddingBottom: 30, paddingHorizontal: 24 },
  footerActions: { flexDirection: "row", alignItems: "center" },
  saveBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: colors.isDark ? "rgba(255,255,255,0.08)" : colors.surface, 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 15, 
    borderWidth: 1, 
    borderColor: colors.isDark ? "rgba(255,255,255,0.1)" : colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  likedBtn: { borderColor: "rgba(255, 45, 85, 0.3)", backgroundColor: "rgba(255, 45, 85, 0.1)" },
  primaryBtn: { 
    flex: 1, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: colors.primary, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 15, 
    elevation: 8 
  },
  addedBtn: { backgroundColor: "rgba(0,188,212,0.1)", borderWidth: 1, borderColor: colors.primary, shadowOpacity: 0 },
  primaryBtnText: { color: colors.isDark ? "#000" : "#fff", fontSize: 15, fontWeight: "900", marginLeft: 10 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  errorText: { color: colors.text, fontSize: 18 },
  backLink: { color: colors.primary, marginTop: 10 },
});
