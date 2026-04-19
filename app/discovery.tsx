import React, { useEffect, useState, useRef } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip, Place } from "../context/TripContext";
import { placeService } from "../services/placeService";
import { useVideoPlayer, VideoView } from "expo-video";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

// SAFE MODE REEL (Static Image for Demo Stability)
const ReelItem = ({ 
    item, 
    addToTrip, 
    isActive,
    isAlreadySelected
}: { 
    item: any; 
    addToTrip: (item: any) => void;
    isActive: boolean;
    isAlreadySelected: boolean;
}) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  
  const primaryMedia = item.place_media?.find((m: any) => m.is_primary) || item.place_media?.[0];
  const videoSource = item.video || item.place_media?.find((m: any) => m.media_type === 'video')?.url;
  
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (isActive && videoSource) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, videoSource]);

  const getSource = (src: any) => typeof src === 'number' ? src : { uri: src };

  const handleAdd = () => {
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     addToTrip(item);
  };

  return (
    <View style={styles.reelContainer}>
      {/* Background Layer: Blurred Full Bleed */}
      <Image 
        source={getSource(primaryMedia?.url)} 
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={25}
      />
      
      {/* Foreground Layer: Video if active, else Static Image */}
      {videoSource && isActive ? (
        <VideoView 
          player={player} 
          style={styles.foregroundImage} 
          contentFit="contain"
          nativeControls={false}
        />
      ) : (
        <Image 
          source={getSource(primaryMedia?.url)} 
          style={styles.foregroundImage}
          resizeMode="contain"
        />
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.95)"]}
        style={styles.gradient}
      />

      <View style={styles.contentOverlay}>
        {/* Left Side: Info */}
        <View style={styles.leftInfo}>
          <View style={styles.trendingBadge}>
            <View style={styles.dot} />
            <Text style={styles.trendingText}>EXPLORING {item.location_display?.toUpperCase()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.infoSection}
            onPress={() => router.push({ pathname: "/details", params: { id: item.id } })}
          >
            <Text style={styles.placeTitle}>{item.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={18} color="#00bcd4" />
              <Text style={styles.locationText}>{item.location_display}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.description} numberOfLines={2}>
            {item.description_short || item.description_full}
          </Text>
        </View>

        {/* Right Side: Sidebar */}
        <View style={styles.sidebar}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAdd}
          >
            <View style={[styles.addIconContainer, isAlreadySelected && styles.addedIconContainer]}>
              <Ionicons 
                name={isAlreadySelected ? "checkmark" : "add"} 
                size={28} 
                color="#fff" 
              />
            </View>
            <Text style={styles.actionLabel}>{isAlreadySelected ? "SAVED" : "ADD"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsLiked(!isLiked);
          }}>
            <Ionicons name="heart" size={32} color={isLiked ? "#FF2D55" : "#fff"} />
            <Text style={[styles.actionLabel, isLiked && { color: "#FF2D55" }]}>{item.likes_count || (isLiked ? 1 : 0)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="share" size={30} color="#fff" />
            <Text style={styles.actionLabel}>SHARE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark" size={28} color="#fff" />
            <Text style={styles.actionLabel}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function DiscoveryScreen() {
  const router = useRouter();
  const { area, placeId } = useLocalSearchParams();
  const { addToTrip, selectedPlaces, isPlaceSelected } = useTrip();
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveId(viewableItems[0].item.id);
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
          data = await placeService.getRandomPlaces(10);
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
        <ActivityIndicator size="large" color="#00bcd4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.itineraryBadge}
        onPress={() => router.push("/map")}
      >
        <LinearGradient colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"]} style={styles.badgeGradient}>
            <Ionicons name="briefcase" size={20} color="#00bcd4" />
            <View style={styles.countBubble}>
                <Text style={styles.countText}>{selectedPlaces.length}</Text>
            </View>
        </LinearGradient>
      </TouchableOpacity>

      {places.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <Text style={{ color: '#fff' }}>No places found here yet.</Text>
        </View>
      ) : (
        <FlatList
          data={places}
          renderItem={({ item }) => (
              <ReelItem 
                  item={item} 
                  addToTrip={addToTrip} 
                  isActive={item.id === activeId} 
                  isAlreadySelected={isPlaceSelected(item.id)}
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  reelContainer: {
    width: width,
    height: height,
    position: "relative",
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
    backgroundColor: "#00bcd4",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  countText: {
    color: "#081a2e",
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
    backgroundColor: "#ff9800",
    marginRight: 8,
  },
  trendingText: {
    color: "#ff9800",
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
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    color: "#00bcd4",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
  description: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  sidebar: {
    alignItems: "center",
    width: 60,
  },
  actionButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  addIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00bcd4",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    marginBottom: 5,
  },
  addedIconContainer: {
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  actionLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
});
