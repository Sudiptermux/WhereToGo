import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { signIn } from "../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
      router.replace("/(tabs)/home");
    } catch (error) {
      const message = (error as any)?.message || JSON.stringify(error);
      alert(`Login error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="compass" size={32} color="#fff" />
        </View>

        <Text style={styles.title}>WhereToGo</Text>
        <Text style={styles.subtitle}>Your journey starts here.</Text>

        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#6c8b8e" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#8e9e9f"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#6c8b8e" />
          <TextInput
            value={password}
            onChangeText={setPassword}
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

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRememberMe((value) => !value)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/forgot-password")}>
            <Text style={styles.forgot}>Forgot?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.primaryButtonDisabled,
          ]}
          onPress={onLogin}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading ? "Signing in..." : "Log In"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or sign in with</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          {[{ text: "Google" }, { text: " Apple" }].map((button, index) => (
            <TouchableOpacity key={index} style={styles.socialButton}>
              <Text style={styles.socialText}>{button.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/signup")}
          style={styles.createAccount}
        >
          <Text style={styles.createAccountText}>
            New traveler? <Text style={styles.cta}>Create Account</Text>
          </Text>
        </TouchableOpacity>
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
  optionsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: -2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#6c8b8e",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#00bcd4",
    borderColor: "#00bcd4",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
  },
  checkboxText: {
    color: "#6c8b8e",
    fontSize: 14,
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
    marginTop: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
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
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d2d8db",
    width: "48%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  socialText: {
    color: "#1e3947",
    fontWeight: "600",
  },
  createAccount: {
    marginTop: 22,
  },
  createAccountText: {
    color: "#6c8b8e",
    fontSize: 14,
  },
  cta: {
    color: "#00bcd4",
    fontWeight: "700",
  },
});
