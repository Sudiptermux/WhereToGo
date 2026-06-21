import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip, Place } from "../context/TripContext";
import { placeService } from "../services/placeService";
import { useVideoPlayer, VideoView } from "expo-video";
import * as Haptics from "expo-haptics";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

// HIGH-PERFORMANCE REEL v1.3 - THEME_READY
const ReelItem = memo(({ 
    item, 
    addToTrip, 
    removeFromTrip,
    isActive,
    isAlreadySelected,
    sharedPlayer,
    videoSource,
    isLiked,
    toggleLike,
    colors,
    isDark
}: { 
    item: Place; 
    addToTrip: (item: any) => void;
    removeFromTrip: (id: string) => void;
    isActive: boolean;
    isAlreadySelected: boolean;
    sharedPlayer: any;
    videoSource: any;
    isLiked: boolean;
    toggleLike: (item: any) => void;
    colors: any;
    isDark: boolean;
}) => {
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const getSource = (src: any) => typeof src === 'number' ? src : { uri: src };

  const handleAdd = () => {
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     if (isAlreadySelected) {
       removeFromTrip(item.id);
     } else {
       addToTrip(item);
     }
  };

  return (
    <View style={styles.reelContainer}>
      {/* Background Layer: High-Quality Thumbnail always present */}
      <Image 
        source={getSource(item.image)} 
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={isActive ? 25 : 0}
      />
      
      {/* Cinematic Tint Layer for Depth */}
      {isActive && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.1)' }]} />
      )}
      
      {/* Foreground Layer: ACTIVE Video View */}
      {isActive && videoSource ? (
        <VideoView 
          player={sharedPlayer} 
          style={styles.foregroundImage} 
          contentFit="contain"
          nativeControls={false}
        />
      ) : (
        <View style={styles.foregroundImage}>
            <Image 
                source={getSource(item.image)} 
                style={styles.fullImage}
                resizeMode="contain"
            />
        </View>
      )}

      <LinearGradient
        colors={isDark ? ["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.9)"] : ["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.7)"]}
        style={styles.gradient}
      />

      <View style={styles.contentOverlay}>
        <View style={styles.leftInfo}>
          <View style={styles.trendingBadge}>
            <View style={styles.dot} />
            <Text style={styles.trendingText}>EXPLORING {item.location_display?.toUpperCase()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.infoSection}
            onPress={() => router.push({ pathname: "/details", params: { id: item.slug } })}
          >
            <Text style={styles.placeTitle}>{item.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={18} color={colors.primary} />
              <Text style={styles.locationText}>{item.location_display}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.description} numberOfLines={2}>
            {item.description_short || item.description_full}
          </Text>
        </View>

        <View style={styles.sidebar}>
          <TouchableOpacity style={styles.premiumActionButton} onPress={handleAdd}>
            <View style={[styles.premiumIconCircle, isAlreadySelected && styles.premiumIconCircleActive]}>
              <Ionicons name={isAlreadySelected ? "checkmark" : "add"} size={26} color={isAlreadySelected ? colors.primary : "#fff"} />
            </View>
            <Text style={[styles.premiumActionLabel, isAlreadySelected && { color: colors.primary }]}>{isAlreadySelected ? "SAVED" : "ADD"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.premiumActionButton} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleLike(item);
          }}>
            <View style={styles.premiumIconCircle}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#FF2D55" : "#fff"} />
            </View>
            <Text style={[styles.premiumActionLabel, isLiked && { color: "#FF2D55" }]}>{isLiked ? "WISHLIST" : "LIKE"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.premiumActionButton}>
            <View style={styles.premiumIconCircle}>
                <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
            </View>
            <Text style={styles.premiumActionLabel}>SHARE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.premiumActionButton}>
            <View style={styles.premiumIconCircle}>
                <Ionicons name="bookmark" size={22} color="#fff" />
            </View>
            <Text style={styles.premiumActionLabel}>VAULT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default function DiscoveryScreen() {
  const router = useRouter();
  const { area, placeId } = useLocalSearchParams();
  const { addToTrip, removeFromTrip, selectedPlaces, isPlaceSelected, toggleLike, isLiked } = useTrip();
  const { colors, isDark } = useTheme();
  
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  // SHARED PLAYER POOL
  const sharedPlayer = useVideoPlayer(null, (p) => {
    p.loop = true;
    p.muted = false;
    console.log("[WhereToGo] High-Performance Player Engine Initialized");
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          if (sharedPlayer) {
            sharedPlayer.pause();
            sharedPlayer.muted = true;
          }
        } catch (error) {
          console.log("[Discovery] Player already released or invalid:", error);
        }
      };
    }, [sharedPlayer])
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const activeItem = viewableItems[0].item;
      setActiveId(activeItem.id);
      
      let vSource = activeItem.video || activeItem.place_media?.find((m: any) => m.media_type === 'video')?.url;
      if (vSource) {
          const normalizedSource = typeof vSource === 'string' ? { uri: vSource } : vSource;
          sharedPlayer.replace(normalizedSource);
          sharedPlayer.play();
      } else {
          try {
            if (sharedPlayer) sharedPlayer.pause();
          } catch (e) {
            console.log("[Discovery] Could not pause player:", e);
          }
      }
    }
  }).current;

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        let data: any[] = [];
        if (placeId) {
          data = await placeService.getPlaceWithAreaMates(placeId as string);
        } else if (area) {
          data = await placeService.searchPlaces(area as string);
        } else {
          data = await placeService.getPopular(10);
        }
        setPlaces(data);
        if (data.length > 0) setActiveId(data[0].id);
      } catch (error) {
        console.error("Discovery Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [area, placeId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.itineraryBadge} onPress={() => router.push("/map")}>
        <LinearGradient 
            colors={isDark ? ["rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"] : ["rgba(255,255,255,0.7)", "rgba(255,255,255,0.9)"]} 
            style={[styles.badgeGradient, !isDark && { borderColor: colors.border }]}
        >
            <Ionicons name="briefcase" size={20} color={colors.primary} />
            <View style={[styles.countBubble, { backgroundColor: colors.primary }]}>
                <Text style={[styles.countText, { color: isDark ? "#081a2e" : "#fff" }]}>{selectedPlaces.length}</Text>
            </View>
        </LinearGradient>
      </TouchableOpacity>

      <FlatList
        data={places}
        renderItem={({ item }) => (
          <ReelItem 
            item={item} 
            addToTrip={addToTrip} 
            removeFromTrip={removeFromTrip}
            isActive={item.id === activeId} 
            isAlreadySelected={isPlaceSelected(item.id)}
            sharedPlayer={sharedPlayer}
            videoSource={item.video || item.place_media?.find((m: any) => m.media_type === 'video')?.url}
            isLiked={isLiked(item.id)}
            toggleLike={toggleLike}
            colors={colors}
            isDark={isDark}
          />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  reelContainer: {
    width: width,
    height: height,
    position: "relative",
    backgroundColor: isDark ? "#000" : colors.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  foregroundImage: {
    position: "absolute",
    top: 60,
    bottom: 120,
    left: 10,
    right: 10,
    backgroundColor: "transparent",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 55,
    left: 20,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  itineraryBadge: {
    position: "absolute",
    top: 55,
    right: 20,
    zIndex: 100,
    borderRadius: 22,
    overflow: "hidden",
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0, 188, 212, 0.3)",
  },
  countBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  countText: {
    fontSize: 10,
    fontWeight: "900",
  },
  contentOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  leftInfo: {
    flex: 1,
    paddingRight: 60,
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 8,
  },
  trendingText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  infoSection: {
    marginBottom: 4,
  },
  placeTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
  description: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sidebar: {
    alignItems: "center",
    width: 70,
  },
  premiumActionButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  premiumIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  premiumIconCircleActive: {
    backgroundColor: "rgba(0, 188, 212, 0.2)",
    borderColor: "rgba(0, 188, 212, 0.5)",
    borderWidth: 1.5,
  },
  premiumActionLabel: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fullImage: { ...StyleSheet.absoluteFillObject },
});
