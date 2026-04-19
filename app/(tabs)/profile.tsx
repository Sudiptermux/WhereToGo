import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getUserAttributes } from "../../services/authService";

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const attrs = await getUserAttributes();
        setUserData(attrs);
      } catch (error) {
        console.log("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const onLogout = () => {
    // TODO: clear auth session
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity>
                <Feather name="menu" size={24} color="#00bcd4" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>WhereToGo</Text>
            <TouchableOpacity>
                <Ionicons name="settings-sharp" size={24} color="#8e9e9f" />
            </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarNeonBorder}>
                <Image
                    source={{ uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" }}
                    style={styles.avatar}
                />
                <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#00bcd4" />
                </View>
            </View>
          </View>
          <Text style={styles.name}>{loading ? "..." : (userData?.name || "Explorer")}</Text>
          
          <View style={styles.proBadge}>
             <Ionicons name="star" size={14} color="#c27d14" />
             <Text style={styles.proBadgeText}>PRO EXPLORER</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>TRIPS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>PLACES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>Lvl 8</Text>
            <Text style={styles.statLabel}>STATUS</Text>
          </View>
        </View>

        {/* Account Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT MANAGEMENT</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <Ionicons name="settings-sharp" size={20} color="#fff" />
            </View>
            <Text style={styles.menuText}>Settings</Text>
            <Feather name="chevron-right" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <MaterialCommunityIcons name="tune-variant" size={20} color="#fff" />
            </View>
            <Text style={styles.menuText}>Preferences</Text>
            <Feather name="chevron-right" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <Ionicons name="card-sharp" size={20} color="#fff" />
            </View>
            <Text style={styles.menuText}>Payment Methods</Text>
            <Feather name="chevron-right" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <Ionicons name="help-circle" size={20} color="#fff" />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <Feather name="chevron-right" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={onLogout}
        >
          <Ionicons name="log-out" size={22} color="#c27d14" />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060606" },
  content: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#00bcd4",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarWrapper: {
    marginBottom: 20,
  },
  avatarNeonBorder: {
    width: 140,
    height: 140,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(0, 188, 212, 0.4)",
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#060606",
    borderRadius: 10,
  },
  name: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(194, 125, 20, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(194, 125, 20, 0.2)",
  },
  proBadgeText: {
    color: "#c27d14",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 50,
  },
  statBox: {
    backgroundColor: "#121212",
    borderRadius: 16,
    paddingVertical: 20,
    width: "31%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "#8e9e9f",
    fontWeight: "700",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8e9e9f",
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoutText: {
    color: "#c27d14",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 10,
    letterSpacing: 1,
  },
});
