import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

export default function PlannerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Map Background */}
        <View style={styles.mapHeader}>
          <Text style={styles.searchText}>Find your next quest...</Text>
        </View>

        {/* Quest Card */}
        <View style={styles.card}>

          <View style={styles.badgeRow}>
            <Text style={styles.discovery}>DISCOVERY QUEST</Text>
            <View style={styles.ratingBox}>
              <Text style={styles.rating}>4.9</Text>
              <Text style={styles.xp}>850 XP</Text>
            </View>
          </View>

          <Text style={styles.title}>Neon Cafe</Text>
          <Text style={styles.subtitle}>
            Cyberpunk style coffee & brunch
          </Text>

          {/* Images */}
          <View style={styles.imageRow}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1509042239860-f550ce710b93" }}
              style={styles.image}
            />
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085" }}
              style={styles.image}
            />
          </View>

          {/* Info Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="map-pin" size={20} color="#00bcd4" />
              <Text style={styles.infoText}>5 mins</Text>
              <Text style={styles.infoSub}>Distance</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="attach-money" size={20} color="#00bcd4" />
              <Text style={styles.infoText}>$$</Text>
              <Text style={styles.infoSub}>Price</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#00bcd4" />
              <Text style={styles.infoText}>Open</Text>
              <Text style={styles.infoSub}>Until 11 PM</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>The Vibe</Text>
          <Text style={styles.description}>
            Step into the future at Neon Cafe. Known for its immersive
            holographic displays and signature blue matcha lattes.
            A hidden gem perfect for digital nomads and quest seekers.
          </Text>

          {/* Button */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>START QUEST NAVIGATION</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f1f2",
  },
  mapHeader: {
    height: 150,
    backgroundColor: "#d9e3e6",
    justifyContent: "center",
    alignItems: "center",
  },
  searchText: {
    fontSize: 18,
    color: "#6c8b8e",
  },
  card: {
    backgroundColor: "#fff",
    marginTop: -40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discovery: {
    color: "#00bcd4",
    fontWeight: "600",
  },
  ratingBox: {
    backgroundColor: "#e0f7fa",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  rating: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00bcd4",
  },
  xp: {
    fontSize: 12,
    color: "#00bcd4",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c8b8e",
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  image: {
    width: "48%",
    height: 120,
    borderRadius: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  infoItem: {
    alignItems: "center",
  },
  infoText: {
    fontWeight: "700",
    marginTop: 5,
  },
  infoSub: {
    fontSize: 12,
    color: "#6c8b8e",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  description: {
    color: "#6c8b8e",
    lineHeight: 22,
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#00bcd4",
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
