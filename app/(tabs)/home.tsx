import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import * as Location from 'expo-location';
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { placeService } from "../../services/placeService";
import { useTrip } from "../../context/TripContext";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useTrip();
  const { colors, isDark } = useTheme();
  
  const [searchText, setSearchText] = useState("");
  const [nearestPlaces, setNearestPlaces] = useState<any[]>([]);
  const [handpickedPlaces, setHandpickedPlaces] = useState<any[]>([]);
  const [popularPlaces, setPopularPlaces] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const fetchSections = async () => {
    try {
      if (refreshing) {
        placeService.clearPopularCache();
      }

      // Get User Location
      let userLat = 21.4669; // Default Sambalpur
      let userLng = 83.9812;
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        userLat = location.coords.latitude;
        userLng = location.coords.longitude;
      }

      // Fetching all sections in parallel for performance
      const [np, hp, pp] = await Promise.all([
        placeService.getNearestPlaces(userLat, userLng, 5),
        placeService.getHandpicked(6),
        placeService.getPopular(8)
      ]);
      
      setNearestPlaces(np);
      setHandpickedPlaces(hp);
      setPopularPlaces(pp);
    } catch (err) {
      console.error("Home Data Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSections();
  }, []);

  const handleSearch = () => {
    if (searchText.trim()) {
      // Search logic handles vibrations/vibes in placeService
      router.push({ pathname: "/discovery", params: { area: searchText } });
    }
  };

  const renderExploreItem = ({ item }: { item: any }) => {
    const getImgSource = (src: any) => typeof src === 'number' ? src : { uri: src };

    return (
      <TouchableOpacity 
        style={styles.exploreCard}
        onPress={() => router.push({ pathname: "/details", params: { id: item.slug } })}
      >
        <Image source={getImgSource(item.image)} style={styles.exploreImage} />
        <LinearGradient
          colors={["transparent", isDark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.65)"]}
          style={styles.exploreGradient}
        />
        
        {item.distance && (
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={10} color="#fff" />
            <Text style={styles.distanceText}>{item.distance.toFixed(1)} km away</Text>
          </View>
        )}

        <View style={styles.exploreContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category?.toUpperCase() || "DISCOVER"}</Text>
          </View>
          <Text style={styles.exploreTitle}>{item.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color={colors.primary} />
            <Text style={styles.exploreDistance}>{item.location_display}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHorizontalItem = (item: any) => {
    const getImgSource = (src: any) => typeof src === 'number' ? src : { uri: src };

    return (
      <TouchableOpacity 
        key={item.id}
        style={styles.popularCard}
        onPress={() => router.push({ pathname: "/details", params: { id: item.slug } })}
      >
        <Image source={getImgSource(item.image)} style={styles.popularImage} />
        <View style={styles.popularInfo}>
            <Text style={styles.popularTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.popularMeta}>
                <Ionicons name="star" size={10} color="#fbc02d" />
                <Text style={styles.popularRating}>{item.rating || '4.8'}</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTrendingItem = (item: any) => {
    const getImgSource = (src: any) => typeof src === 'number' ? src : { uri: src };

    return (
      <TouchableOpacity 
        key={item.id}
        style={styles.trendingCard}
        onPress={() => router.push({ pathname: "/details", params: { id: item.slug } })}
      >
        <View style={styles.trendingImageWrapper}>
            <Image source={getImgSource(item.image)} style={styles.trendingImage} />
        </View>
        <View style={styles.trendingInfo}>
          <View>
            <Text style={styles.trendingTitle}>{item.title}</Text>
            <Text style={styles.trendingCountry}>{item.location_display}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#fbc02d" />
            <Text style={styles.ratingText}>{item.rating || '4.8'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
            />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandContainer}>
                <Text style={styles.brandTitleWhere}>Where</Text>
                <Text style={styles.brandTitleToGo}>ToGo</Text>
            </View>
            <Text style={styles.welcomeText}>Hi, {userProfile?.name?.split(' ')[0] || "Explorer"}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            {userProfile?.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={20} color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"} />
                </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <TouchableOpacity onPress={handleSearch}>
              <Feather name="search" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Vibe, Category, or Area..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        {/* Nearest Destinations (Top - Big Cards) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearest Destinations</Text>
        </View>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={nearestPlaces}
            renderItem={renderExploreItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreList}
            snapToInterval={width * 0.72}
            decelerationRate="fast"
          />
        )}

        {/* Popular Suggestions (Horizontal Mini) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Suggestions</Text>
        </View>
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.popularList}
        >
            {popularPlaces.map(renderHorizontalItem)}
        </ScrollView>

        {/* Handpicked for You (Bottom - List Cards) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Handpicked for You</Text>
        </View>
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            handpickedPlaces.map(renderTrendingItem)
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  distanceBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  distanceText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },
  popularList: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 35,
  },
  popularCard: {
    width: 140,
    marginRight: 12,
  },
  popularImage: {
    width: 140,
    height: 100,
    borderRadius: 20,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  popularInfo: {
    paddingHorizontal: 4,
  },
  popularTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  popularMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  popularRating: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
    opacity: 0.8,
  },
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleWhere: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  brandTitleToGo: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: -0.5,
  },
  welcomeText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: -2,
    opacity: 0.8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  searchBox: {
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: colors.text,
    fontSize: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  loaderContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreList: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 35,
  },
  exploreCard: {
    width: width * 0.68,
    height: 320,
    marginRight: 15,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: colors.surface,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  exploreImage: {
    width: "100%",
    height: "100%",
  },
  exploreGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  exploreContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: "rgba(0,0,0,0.4)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  categoryText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  exploreTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exploreDistance: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginLeft: 4,
  },
  journeyWrapper: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  journeyCard: {
    borderRadius: 30,
    padding: 30,
    minHeight: 220,
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  journeyContent: {
    flex: 1,
  },
  journeyTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#081a2e",
    lineHeight: 38,
    marginBottom: 10,
  },
  journeySubtitle: {
    fontSize: 15,
    color: "#081a2e",
    opacity: 0.8,
    fontWeight: "500",
    marginBottom: 25,
    width: "80%",
  },
  startPlanningBtn: {
    backgroundColor: "#121212",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startPlanningText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  trendingCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  trendingImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendingTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  trendingCountry: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 4,
  },
  comingSoonBadgeHome: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff9800",
  },
  comingSoonTextHome: {
    color: "#ff9800",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  trendingImageWrapper: {
    position: 'relative',
  },
  trendingComingSoonPatch: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff9800",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  comingSoonTextSmall: {
    color: "#000",
    fontSize: 6,
    fontWeight: "900",
  },
});
