import { Feather } from "@expo/vector-icons";
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
import { forgotPassword, confirmPassword as authConfirmPassword } from "../services/authService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const sendReset = async () => {
    if (!email.trim()) {
      alert("Enter your email.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email });
      alert("Reset code sent to email.");
      setStep(2);
    } catch (error: any) {
      const message = error.message || JSON.stringify(error);
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!code || !password || !confirmPassword) {
      alert("Complete all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authConfirmPassword({ email, code, newPassword: password });
      alert("Password reset successfully.");
      router.replace("/");
    } catch (error: any) {
      const message = error.message || JSON.stringify(error);
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Forgot Password</Text>
        {step === 1 ? (
          <>
            <Text style={styles.subheading}>
              Enter your email to receive a reset code
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={[styles.primaryButton, loading && { opacity: 0.65 }]} 
              onPress={sendReset}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "Sending..." : "Send reset code"}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subheading}>
              Enter code and set a new password
            </Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Verification code"
              keyboardType="number-pad"
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="New password"
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
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
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
            <TouchableOpacity
              style={[styles.primaryButton, loading && { opacity: 0.65 }]}
              onPress={resetPassword}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "Resetting..." : "Reset password"}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.linkText}>Back to login</Text>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  primaryButton: {
    backgroundColor: "#00bcd4",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkButton: { alignItems: "center", marginTop: 12 },
  linkText: { color: "#00bcd4", textDecorationLine: "underline" },
});
