import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";


import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
export default function LoginScreen() {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();   

  return (

    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        
        {/* Logo Circle */}
        <View style={styles.logoCircle}>
          <Ionicons name="compass" size={32} color="#fff" />
        </View>

        {/* Title */}
        <Text style={styles.title}>WhereToGo</Text>
        <Text style={styles.subtitle}>Your journey starts here.</Text>

        {/* Email */}
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#6c8b8e" />
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#8e9e9f"
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.passwordHeader}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#6c8b8e" />
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#8e9e9f"
            secureTextEntry={!passwordVisible}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Feather
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="#6c8b8e"
            />
          </TouchableOpacity>
        </View>

        {/* Start Journey Button */}
        <TouchableOpacity 
   style={styles.primaryButton}
   onPress={() => router.push("/home")}
>
   <Text style={styles.primaryText}>Start Journey →</Text>
</TouchableOpacity>


        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or sign in with</Text>
          <View style={styles.line} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}> Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Guest */}
        <TouchableOpacity>
          <Text style={styles.guest}>Continue as Guest</Text>
        </TouchableOpacity>

        {/* Create Account */}
        <View style={styles.bottomText}>
          <Text style={{ color: "#6c8b8e" }}>
            New traveler?{" "}
            <Text style={{ color: "#00bcd4", fontWeight: "600" }}>
              Create Account
            </Text>
          </Text>
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
  innerContainer: {
    padding: 24,
    alignItems: "center",
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#00bcd4",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c8b8e",
    marginBottom: 30,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 55,
    width: "100%",
    marginBottom: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  forgot: {
    color: "#00bcd4",
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#00bcd4",
    width: "100%",
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    elevation: 4,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#6c8b8e",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  socialText: {
    fontWeight: "600",
  },
  guest: {
    marginTop: 25,
    color: "#00bcd4",
    fontWeight: "600",
  },
  bottomText: {
    marginTop: 20,
  },
});

