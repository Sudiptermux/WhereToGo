import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
 Image,
 ScrollView,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View,
} from "react-native";

const savedPlaces = [
  {
    id: 1,
    title: "Golden Sands of Puri Beach",
    location: "Puri, Odisha",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    details: "View details",
    favorite: true,
  },
  {
    id: 2,
    title: "Konark Sun Temple Carvings",
    location: "Konark, Odisha",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800",
    details: "View details",
    favorite: false,
  },
  {
    id: 3,
    title: "Historic Lingaraj Temple",
    location: "Bhubaneswar, Odisha",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
    details: "View details",
    favorite: true,
  },
  {
    id: 4,
    title: "Chilika Lake Irrawaddy Dolphins",
    location: "Ganjam/Puri, Odisha",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800",
    details: "View details",
    favorite: true,
  },
];

export default function SavedScreen() {
  const [tab, setTab] = React.useState("PLACES");
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Gems</Text>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />
      </View>
      <View style={styles.searchBox}>
        <Feather name="search" size={20} color="#00bcd4" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved places & trips..."
        />
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "PLACES" && styles.tabActive]}
          onPress={() => setTab("PLACES")}
        >
          <Text
            style={[styles.tabText, tab === "PLACES" && styles.tabTextActive]}
          >
            PLACES
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "TRIPS" && styles.tabActive]}
          onPress={() => setTab("TRIPS")}
        >
          <Text
            style={[styles.tabText, tab === "TRIPS" && styles.tabTextActive]}
          >
            TRIPS
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {tab === "PLACES" &&
          savedPlaces.map((place) => (
            <View key={place.id} style={styles.card}>
              <Image source={{ uri: place.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{place.title}</Text>
                  <Text style={styles.cardSubtitle}>{place.location}</Text>
                  <TouchableOpacity>
                    <Text style={styles.detailsText}>{place.details}</Text>
                  </TouchableOpacity>
                </View>
                <Ionicons
                  name={place.favorite ? "heart" : "bookmark"}
                  size={24}
                  color="#00bcd4"
                  style={{ marginLeft: 10 }}
                />
              </View>
            </View>
          ))}
        {tab === "TRIPS" && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: "#8e9e9f" }}>No trips saved yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f5f6", paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  searchBox: {
    backgroundColor: "#e3eaec",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: { marginLeft: 10, flex: 1, color: "#000" },
  tabRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 10 },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#dff3f5" },
  tabText: { color: "#8e9e9f", fontWeight: "600" },
  tabTextActive: { color: "#00bcd4" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 120 },
  cardContent: { flexDirection: "row", alignItems: "center", padding: 15 },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  cardSubtitle: { color: "#8e9e9f", marginBottom: 5 },
  detailsText: { color: "#00bcd4", fontWeight: "600", marginTop: 5 },
});
