import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

const notifications = [
  {
    id: 1,
    title: "New Saved Gem Added!",
    message: "The Historic Lingaraj Temple has been successfully saved to your list.",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=100",
    time: "2m ago",
    status: "New",
    button: "View",
  },
  {
    id: 2,
    title: "Tour Guide Message: Arjav P.",
    message: "Hi! Looking forward to your visit. The dolphin tour starts at 8 AM.",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=100",
    time: "12:35 PM",
    status: null,
    button: null,
  },
  {
    id: 3,
    title: "Booking Confirmed!",
    message: "Your guided tour of the Konark Sun Temple is confirmed for Tuesday.",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=100",
    time: "1d ago",
    status: "Confirmed",
    button: null,
  },
  {
    id: 4,
    title: "Ravi K. (Local Expert)",
    message: "Let me know if you need any other recommendations for Puri.",
    image: null,
    time: null,
    status: null,
    button: null,
  },
  {
    id: 5,
    title: "Welcome to Odisha!",
    message: "Explore our latest guide to regional cuisine.",
    image: null,
    time: null,
    status: null,
    button: null,
  },
];

export default function InboxScreen() {
  const [tab, setTab] = useState("NOTIFICATIONS");
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Gems</Text>
        <Image source={{ uri: "https://i.pravatar.cc/100" }} style={styles.avatar} />
      </View>
      <View style={styles.searchBox}>
        <Feather name="search" size={20} color="#00bcd4" />
        <TextInput style={styles.searchInput} placeholder="Search messages & bookings..." />
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === "NOTIFICATIONS" && styles.tabActive]} onPress={() => setTab("NOTIFICATIONS")}> 
          <Text style={[styles.tabText, tab === "NOTIFICATIONS" && styles.tabTextActive]}>NOTIFICATIONS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "MESSAGES" && styles.tabActive]} onPress={() => setTab("MESSAGES")}> 
          <Text style={[styles.tabText, tab === "MESSAGES" && styles.tabTextActive]}>MESSAGES</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {tab === "NOTIFICATIONS" && notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardRow}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
              ) : (
                <View style={styles.placeholderIcon}>
                  <Ionicons name="person" size={28} color="#8e9e9f" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <View style={styles.cardFooter}>
                  {item.status && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  )}
                  {item.time && <Text style={styles.timeText}>{item.time}</Text>}
                  {item.button && (
                    <TouchableOpacity style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>{item.button}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
        {tab === "MESSAGES" && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: "#8e9e9f" }}>No messages yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f5f6", paddingTop: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  searchBox: { backgroundColor: "#e3eaec", marginHorizontal: 20, borderRadius: 15, padding: 15, flexDirection: "row", alignItems: "center", marginBottom: 20 },
  searchInput: { marginLeft: 10, flex: 1, color: "#000" },
  tabRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 10 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: "#dff3f5" },
  tabText: { color: "#8e9e9f", fontWeight: "600" },
  tabTextActive: { color: "#00bcd4" },
  card: { backgroundColor: "#fff", borderRadius: 20, marginHorizontal: 20, marginBottom: 20, overflow: "hidden", padding: 15 },
  cardRow: { flexDirection: "row", alignItems: "flex-start" },
  cardImage: { width: 48, height: 48, borderRadius: 24, marginRight: 15 },
  placeholderIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#e3eaec", alignItems: "center", justifyContent: "center", marginRight: 15 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  cardMessage: { color: "#444", marginBottom: 8 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: { backgroundColor: "#e0f7fa", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  statusText: { color: "#00bcd4", fontWeight: "600", fontSize: 12 },
  timeText: { color: "#8e9e9f", fontSize: 12, marginRight: 8 },
  viewBtn: { backgroundColor: "#e0f7fa", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  viewBtnText: { color: "#00bcd4", fontWeight: "600" },
});
