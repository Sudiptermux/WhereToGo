import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Dimensions,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTrip } from "../../context/TripContext";
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, updateProfile, savedTrips, visitedPlaces, likedPlaces } = useTrip();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(userProfile.name);

  const stats = {
    trips: savedTrips.length,
    stops: visitedPlaces.length,
    wishlist: likedPlaces.length,
    distance: savedTrips.reduce((acc, t) => acc + (t.days.reduce((dAcc, d) => dAcc + (d.totalDistanceKm || 0), 0)), 0).toFixed(0)
  };

  const getPersona = () => {
    if (likedPlaces.length === 0) return "New Explorer";
    const keywords = likedPlaces.map(p => (p.description_full || '') + p.title).join(' ').toLowerCase();
    if (keywords.includes('temple') || keywords.includes('heritage')) return "Cultural Custodian";
    if (keywords.includes('park') || keywords.includes('wildlife') || keywords.includes('forest')) return "Nature Nomad";
    return "Voyager";
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      updateProfile({ avatar: result.assets[0].uri });
    }
  };

  const onLogout = () => {
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cinematic Header Card */}
        <View style={styles.heroSection}>
            <LinearGradient
                colors={["#00bcd4", "#4facfe"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
            />
            <SafeAreaView style={styles.safeHeader}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                        <Feather name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerLabel}>DIGITAL IDENTITY</Text>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Ionicons name="settings-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileMain}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                        <View style={styles.avatarRing}>
                            {userProfile.avatar ? (
                                <Image source={{ uri: userProfile.avatar }} style={styles.avatarImg} />
                            ) : (
                                <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
                                    <Ionicons name="person" size={40} color="rgba(255,255,255,0.3)" />
                                </View>
                            )}
                            <View style={styles.editPicBtn}>
                                <Ionicons name="camera" size={14} color="#fff" />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.nameSection}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{userProfile.name}</Text>
                            <TouchableOpacity style={styles.miniEditBtn} onPress={() => {
                                Alert.prompt("Edit Name", "Enter your new explorer name", (text) => {
                                    if (text) updateProfile({ name: text });
                                });
                            }}>
                                <Feather name="edit-3" size={16} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.personaBadge}>
                            <Text style={styles.personaText}>{getPersona().toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>

        {/* Curator Dashboard */}
        <View style={styles.dashboard}>
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{stats.trips}</Text>
                    <Text style={styles.statDesc}>JOURNEYS</Text>
                </View>
                <View style={[styles.statItem, styles.statBorder]}>
                    <Text style={styles.statNum}>{stats.stops}</Text>
                    <Text style={styles.statDesc}>STOPS</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{stats.wishlist}</Text>
                    <Text style={styles.statDesc}>WISHES</Text>
                </View>
            </View>

            <LinearGradient colors={["#121212", "#080808"]} style={styles.mileageCard}>
                <View style={styles.mileageInfo}>
                    <Text style={styles.mileageLabel}>TOTAL AIRTIME</Text>
                    <Text style={styles.mileageValue}>{stats.distance} <Text style={styles.kmUnit}>KM</Text></Text>
                </View>
                <View style={styles.mileageIcon}>
                    <MaterialCommunityIcons name="map-marker-distance" size={32} color="#00bcd4" />
                </View>
            </LinearGradient>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>CURATOR MILESTONES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
                <View style={styles.badgeCard}>
                    <View style={[styles.badgeIcon, { backgroundColor: 'rgba(0,188,212,0.1)' }]}>
                        <Ionicons name="flash" size={24} color="#00bcd4" />
                    </View>
                    <Text style={styles.badgeName}>First Spark</Text>
                </View>
                <View style={styles.badgeCard}>
                    <View style={[styles.badgeIcon, { backgroundColor: 'rgba(255,152,0,0.1)' }]}>
                        <Ionicons name="shield-checkmark" size={24} color="#ff9800" />
                    </View>
                    <Text style={styles.badgeName}>City Legend</Text>
                </View>
                <View style={styles.badgeCard}>
                    <View style={[styles.badgeIcon, { backgroundColor: 'rgba(156,39,176,0.1)' }]}>
                        <Ionicons name="heart" size={24} color="#9c27b0" />
                    </View>
                    <Text style={styles.badgeName}>Heart Seeker</Text>
                </View>
            </ScrollView>
        </View>

        {/* Account Options */}
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>PREFERENCES</Text>
            <TouchableOpacity style={styles.actionRow}>
                <View style={styles.actionLeft}>
                    <View style={styles.actionIconBox}>
                        <Feather name="bell" size={18} color="#8e9e9f" />
                    </View>
                    <Text style={styles.actionText}>Notifications</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow}>
                <View style={styles.actionLeft}>
                    <View style={styles.actionIconBox}>
                        <Feather name="globe" size={18} color="#8e9e9f" />
                    </View>
                    <Text style={styles.actionText}>Language</Text>
                </View>
                <Text style={styles.actionValue}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionRow, styles.logoutAction]} onPress={onLogout}>
                <View style={styles.actionLeft}>
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(255,45,85,0.1)' }]}>
                        <Ionicons name="log-out" size={18} color="#FF2D55" />
                    </View>
                    <Text style={[styles.actionText, { color: '#FF2D55' }]}>Logout Session</Text>
                </View>
            </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060606" },
  content: { flexGrow: 1 },
  heroSection: {
    height: 380,
    position: 'relative',
    backgroundColor: '#000',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  safeHeader: {
    flex: 1,
    paddingHorizontal: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.6,
  },
  profileMain: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    padding: 5,
    backgroundColor: 'rgba(0,188,212,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 115,
    height: 115,
    borderRadius: 57.5,
    backgroundColor: '#1a1a1a',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPicBtn: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00bcd4',
    borderWidth: 3,
    borderColor: '#060606',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSection: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginRight: 10,
  },
  miniEditBtn: {
    padding: 5,
  },
  personaBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  personaText: {
    color: '#00bcd4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  dashboard: {
    paddingHorizontal: 25,
    marginTop: -40,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#161616',
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  statDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
  mileageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,188,212,0.15)',
  },
  mileageLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  mileageValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
  },
  kmUnit: {
    fontSize: 14,
    color: '#00bcd4',
    opacity: 0.8,
  },
  section: {
    marginTop: 40,
    paddingHorizontal: 25,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
    opacity: 0.6,
  },
  badgesScroll: {
    paddingRight: 20,
  },
  badgeCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 20,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  badgeName: {
    color: '#8e9e9f',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionValue: {
    color: '#8e9e9f',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutAction: {
    marginTop: 10,
    borderColor: 'rgba(255,45,85,0.1)',
  },
});

