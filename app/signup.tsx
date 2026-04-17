import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { signUp } from "../services/authService";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);

  const onSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!agreed) {
      alert("Please accept Terms & Conditions.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ name, email, password, phone });
      alert(
        "Signup successful. Please check your email for a verification code.",
      );
      router.push({
        pathname: "/verify",
        params: { email },
      });
    } catch (error) {
      const message = (error as any)?.message || JSON.stringify(error);
      alert(`Signup error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subheading}>Sign up to get started</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
        />

        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)}>
            <Feather
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="#6c8b8e"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible((v) => !v)}
          >
            <Feather
              name={confirmPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color="#6c8b8e"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Phone number (optional)</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />

        <View style={styles.inlineRow}>
          <Switch
            value={agreed}
            onValueChange={setAgreed}
            trackColor={{ true: "#00bcd4" }}
          />
          <Text style={styles.checkboxLabel}>Accept Terms & Conditions</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.primaryButtonDisabled,
          ]}
          onPress={onSignup}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading ? "Signing up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => router.push("/")}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e8f1f2" },
  content: { padding: 20 },
  heading: { fontSize: 28, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  subheading: { color: "#6c8b8e", marginBottom: 20 },
  label: { marginTop: 10, marginBottom: 5, fontWeight: "600" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 2,
    height: 50,
  },
  input: {
    backgroundColor: "transparent",
    color: "#000",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 0,
    marginBottom: 0,
    elevation: 0,
  },
  inlineRow: { flexDirection: "row", alignItems: "center", marginVertical: 15 },
  checkboxLabel: { marginLeft: 10, color: "#555" },
  primaryButton: {
    backgroundColor: "#00bcd4",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#00bcd4", fontWeight: "600" },
});
