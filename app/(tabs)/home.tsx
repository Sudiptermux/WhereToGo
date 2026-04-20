import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { placeService } from "../../services/placeService";
import { useTrip } from "../../context/TripContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useTrip();
  const [searchText, setSearchText] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [trendingPlaces, setTrendingPlaces] = useState<any[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch Trending Places (Random)
    const fetchTrending = async () => {
      try {
        const data = await placeService.getRandomPlaces(4);
        setTrendingPlaces(data);
      } catch (err) {
        console.error("Home Trending Error:", err);
      } finally {
        setLoadingTrending(false);
        setLoadingNearby(false); // Disable nearby loader in safe mode
      }
    };

    fetchTrending();
  }, []);

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({ pathname: "/discovery", params: { area: searchText } });
    }
  };

  const calculateDistanceStr = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Basic Haversine for display
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d < 1 ? `${(d * 1000).toFixed(0)} m away` : `${d.toFixed(1)} km away`;
  };

  const renderExploreItem = ({ item }: { item: any }) => {
    const getImgSource = (src: any) => typeof src === 'number' ? src : { uri: src };

    return (
      <TouchableOpacity 
        style={styles.exploreCard}
        onPress={() => router.push({ pathname: "/discovery", params: { placeId: item.id } })}
      >
        <Image source={getImgSource(item.image)} style={styles.exploreImage} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.exploreGradient}
        />
        
        {item.isMissingMedia && (
          <View style={styles.comingSoonBadgeHome}>
             <Text style={styles.comingSoonTextHome}>COMING SOON</Text>
          </View>
        )}

        <View style={styles.exploreContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>
          </View>
          <Text style={styles.exploreTitle}>{item.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color="#00bcd4" />
            <Text style={styles.exploreDistance}>{item.location_display}</Text>
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
        onPress={() => router.push({ pathname: "/details", params: { id: item.id } })}
      >
        <View style={styles.trendingImageWrapper}>
            <Image source={getImgSource(item.image)} style={styles.trendingImage} />
            {item.isMissingMedia && (
                <View style={styles.trendingComingSoonPatch}>
                    <Text style={styles.comingSoonTextSmall}>NEW</Text>
                </View>
            )}
        </View>
        <View style={styles.trendingInfo}>
          <View>
            <Text style={styles.trendingTitle}>{item.title}</Text>
            <Text style={styles.trendingCountry}>{item.location_display}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#fbc02d" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>WhereToGo</Text>
            <Text style={styles.welcomeText}>Hi, {userProfile.name.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            {userProfile.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={20} color="rgba(255,255,255,0.3)" />
                </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <TouchableOpacity onPress={handleSearch}>
              <Feather name="search" size={20} color="#8e9e9f" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Area (e.g. Sambalpur)"
              placeholderTextColor="#8e9e9f"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        {/* Explore Nearby with Recommendation Fallback */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {nearbyPlaces.length === 0 ? "Handpicked for You" : "Explore Nearby"}
          </Text>
        </View>
        {loadingNearby ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#00bcd4" />
          </View>
        ) : (
          <FlatList
            data={nearbyPlaces.length > 0 ? nearbyPlaces : trendingPlaces}
            renderItem={renderExploreItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreList}
            snapToInterval={width * 0.72}
            decelerationRate="fast"
          />
        )}

        {/* Journey Card (CTA) */}
        <TouchableOpacity 
          style={styles.journeyWrapper}
          onPress={() => router.push("/(tabs)/plan")}
        >
          <LinearGradient
            colors={["#00F2FE", "#4FACFE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.journeyCard}
          >
            <View style={styles.journeyContent}>
              <Text style={styles.journeyTitle}>Craft Your{"\n"}Next Journey</Text>
              <Text style={styles.journeySubtitle}>
                AI-curated itineraries tailored for you.
              </Text>
              
              <View style={styles.startPlanningBtn}>
                <Text style={styles.startPlanningText}>Start Planning</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Trending Now */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
        </View>
        <View style={styles.listContainer}>
          {loadingTrending ? (
            <ActivityIndicator color="#00bcd4" />
          ) : (
            trendingPlaces.map(renderTrendingItem)
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
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
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  welcomeText: {
    color: "#00bcd4",
    fontSize: 14,
    fontWeight: "600",
    marginTop: -2,
    opacity: 0.8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1a1a1a",
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
    backgroundColor: "#121212",
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: "#fff",
    fontSize: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  loaderContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#444',
    paddingLeft: 20,
    fontStyle: 'italic',
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
    backgroundColor: "#1a1a1a",
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
    height: "100%",
  },
  exploreContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  categoryText: {
    color: "#8e9e9f",
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
    color: "#8e9e9f",
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
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  trendingCountry: {
    color: "#8e9e9f",
    fontSize: 13,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: "#fff",
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
    borderColor: "#121212",
  },
  comingSoonTextSmall: {
    color: "#000",
    fontSize: 6,
    fontWeight: "900",
  },
});
