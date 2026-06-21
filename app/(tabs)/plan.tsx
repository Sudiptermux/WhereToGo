import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { placeService } from "../../services/placeService";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function PlanScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await placeService.getPopular(5);
        setSuggestions(data);
      } catch (err) {
        console.error("Plan Suggestions Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({ pathname: "/discovery", params: { area: searchText } });
    }
  };

  const renderCard = (item: any) => {
    const primaryImg = item.place_media?.find((m: any) => m.media_type === 'image')?.url || 
                     item.place_media?.[0]?.url;

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/details", params: { id: item.id } })}
      >
        <Image 
          source={typeof primaryImg === 'number' ? primaryImg : { uri: primaryImg }} 
          style={styles.cardImage} 
        />
        <LinearGradient
          colors={["transparent", isDark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.7)"]}
          style={styles.cardGradient}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardCategory}>{item.category?.toUpperCase()}</Text>
          <Text style={styles.cardName}>{item.title}</Text>
          <Text style={styles.cardArea}>{item.location_display}</Text>
          
          <TouchableOpacity 
            style={styles.exploreBtn}
            onPress={() => router.push({ pathname: "/discovery", params: { placeId: item.id } })}
          >
            <Text style={styles.exploreBtnText}>EXPLORE AREA</Text>
            <Feather name="arrow-up-right" size={16} color={isDark ? "#081a2e" : "#fff"} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleMain}>PLAN <Text style={styles.titleAccent}>TRIPS</Text></Text>
          <Text style={styles.subtitle}>CURATE YOUR EXPERIENCE</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="compass" size={24} color={colors.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Area (e.g. Sambalpur)"
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity 
              style={styles.searchAction}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={20} color={isDark ? "#081a2e" : "#fff"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Suggestions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>POPULAR SUGGESTIONS</Text>
        </View>

        {loading ? (
          <View style={{ height: 300, justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {suggestions.map(renderCard)}
            {suggestions.length === 0 && (
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 20 }}>No suggestions found.</Text>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  titleMain: {
    fontSize: 40,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 1.5,
  },
  titleAccent: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 8,
    opacity: 0.8,
  },
  searchSection: {
    paddingHorizontal: 25,
    marginBottom: 50,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: 70,
    paddingLeft: 20,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  searchAction: {
    backgroundColor: colors.primary,
    width: 55,
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  listContainer: {
    paddingHorizontal: 25,
  },
  card: {
    width: "100%",
    height: 500,
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 25,
    backgroundColor: colors.surface,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  cardContent: {
    position: "absolute",
    bottom: 35,
    left: 35,
    right: 35,
  },
  cardCategory: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  cardName: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardArea: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: colors.isDark ? "#fff" : colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  exploreBtnText: {
    color: colors.isDark ? "#081a2e" : "#fff",
    fontWeight: "900",
    fontSize: 14,
    marginRight: 8,
    letterSpacing: 0.5,
  },
});
