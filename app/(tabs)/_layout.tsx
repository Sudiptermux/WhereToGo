import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const tabScreens = [
  { name: "home", title: "Home", icon: "home" },
  { name: "inbox", title: "Inbox", icon: "mail" },
  { name: "planner", title: "Planner", icon: "calendar" },
  { name: "saved", title: "Saved", icon: "bookmark" },
  { name: "settings", title: "Settings", icon: "settings" },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0d0d0d",
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#00bcd4",
        tabBarInactiveTintColor: "#8e9e9f",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "HOME",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "PLAN",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "SAVED",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "PROFILE",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
