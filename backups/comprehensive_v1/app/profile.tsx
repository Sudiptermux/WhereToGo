import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  const onLogout = () => {
    // TODO: clear auth session
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/50.jpg" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Ava Parker</Text>
          <Text style={styles.email}>ava.parker@example.com</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logout]}
            onPress={onLogout}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f7" },
  content: { padding: 20, alignItems: "center" },
  profileCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 15 },
  name: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  email: { color: "#6c8b8e", fontSize: 16 },
  actions: { width: "100%" },
  button: {
    backgroundColor: "#00bcd4",
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  logout: { backgroundColor: "#ff5a5f" },
});
