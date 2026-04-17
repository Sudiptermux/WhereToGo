import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
            style={styles.avatar}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Johnson</Text>
            <Text style={styles.profileEmail}>alex.j@example.com</Text>

            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.sectionBox}>
          <SettingsItem icon="👤" label="Personal Information" />
          <SettingsItem icon="🔔" label="Notifications" />
          <SettingsItem icon="🛡️" label="Security & Privacy" />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.sectionBox}>
          <SettingsItem icon="🌐" label="Language" subLabel="English (US)" />
          <SettingsItem icon="💵" label="Currency" subLabel="USD ($)" />

          <SettingsSwitch
            icon="🌙"
            label="Dark Mode"
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.sectionBox}>
          <SettingsItem icon="❓" label="Help Center" />
          <SettingsItem icon="📄" label="Terms of Service" />
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsItem({ icon, label, subLabel }) {
  return (
    <TouchableOpacity style={styles.itemRow}>
      <Text style={styles.itemIcon}>{icon}</Text>

      <View style={styles.itemTextBox}>
        <Text style={styles.itemLabel}>{label}</Text>
        {subLabel && <Text style={styles.itemSubLabel}>{subLabel}</Text>}
      </View>

      <Text style={styles.itemArrow}>›</Text>
    </TouchableOpacity>
  );
}

function SettingsSwitch({ icon, label, value, onValueChange }) {
  return (
    <View style={styles.itemRow}>
      <Text style={styles.itemIcon}>{icon}</Text>

      <View style={{ flex: 1 }}>
        <Text style={styles.itemLabel}>{label}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#ccc", true: "#ff7a00" }}
        thumbColor={value ? "#ff7a00" : "#fff"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f7",
  },

  scrollContent: {
    paddingBottom: 100,
  },

  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "#faf8f7",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#181c2e",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 10,
    elevation: 2,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#ff7a00",
    marginRight: 16,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#181c2e",
  },

  profileEmail: {
    fontSize: 16,
    color: "#7c8592",
    marginBottom: 8,
  },

  editProfileBtn: {
    backgroundColor: "#ffe5d1",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  editProfileText: {
    color: "#ff7a00",
    fontWeight: "bold",
    fontSize: 15,
  },

  sectionLabel: {
    marginLeft: 24,
    marginTop: 18,
    marginBottom: 6,
    color: "#b2b8c6",
    fontWeight: "bold",
    letterSpacing: 1,
  },

  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 2,
    elevation: 1,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },

  itemIcon: {
    fontSize: 22,
    marginRight: 16,
  },

  itemTextBox: {
    flex: 1,
  },

  itemLabel: {
    fontSize: 18,
    color: "#181c2e",
    fontWeight: "500",
  },

  itemSubLabel: {
    fontSize: 14,
    color: "#b2b8c6",
    marginTop: 2,
  },

  itemArrow: {
    fontSize: 22,
    color: "#b2b8c6",
  },
});
