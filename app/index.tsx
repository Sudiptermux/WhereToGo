import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      <ScrollView contentContainerStyle={styles.innerContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.logoCircle}>
          <Ionicons name="compass" size={40} color="#081a2e" />
        </View>

        <Text style={styles.title}>WhereToGo</Text>
        <Text style={styles.subtitle}>Your premium journey starts here.</Text>

        <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#8e9e9f" />
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#444"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                />
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
            <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#8e9e9f" />
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#444"
                    secureTextEntry={!passwordVisible}
                    style={styles.input}
                />
                <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                >
                    <Feather
                        name={passwordVisible ? "eye-off" : "eye"}
                        size={20}
                        color="#8e9e9f"
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
                    {rememberMe && <Ionicons name="checkmark" size={14} color="#081a2e" />}
                    </View>
                    <Text style={styles.checkboxText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                    <Text style={styles.forgot}>Forgot Password?</Text>
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
                    {loading ? "AUTHENTICATING..." : "LOG IN"}
                </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
                <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-google" size={20} color="#fff" />
                    <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-apple" size={22} color="#fff" />
                    <Text style={styles.socialText}>Apple</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() => router.push("/signup")}
                style={styles.createAccount}
            >
                <Text style={styles.createAccountText}>
                    New traveler? <Text style={styles.cta}>Create Account</Text>
                </Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060606",
  },
  innerContainer: {
    padding: 24,
    alignItems: "center",
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#00bcd4",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "#8e9e9f",
    marginBottom: 40,
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8e9e9f",
    marginBottom: 10,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 60,
    width: "100%",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: "#fff",
    fontSize: 16,
  },
  optionsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#1a1a1a",
    backgroundColor: "#121212",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#00bcd4",
    borderColor: "#00bcd4",
  },
  checkboxText: {
    color: "#8e9e9f",
    fontSize: 14,
    fontWeight: "500",
  },
  forgot: {
    color: "#00bcd4",
    fontWeight: "700",
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: "#00bcd4",
    width: "100%",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: "#081a2e",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 35,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#1a1a1a",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#444",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  socialRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  socialButton: {
    backgroundColor: "#121212",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    width: "48%",
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  socialText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 15,
  },
  createAccount: {
    alignItems: "center",
    marginBottom: 40,
  },
  createAccountText: {
    color: "#8e9e9f",
    fontSize: 14,
    fontWeight: "500",
  },
  cta: {
    color: "#00bcd4",
    fontWeight: "800",
  },
});
