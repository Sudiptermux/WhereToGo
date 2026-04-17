import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { confirmSignUp, resendConfirmationCode } from "../services/authService";

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    if (!code.trim()) {
      alert("Enter the verification code");
      return;
    }

    if (!email) {
      alert("Email is not available. Please go back and signup again.");
      return;
    }

    setLoading(true);
    try {
      await confirmSignUp({ email, code });
      alert("Email confirmed. You are now logged in.");
      router.replace("/(tabs)/home");
    } catch (error) {
      const message = (error as any)?.message || JSON.stringify(error);
      alert(`Verification error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email) {
      alert("Email is not available. Please go back and signup again.");
      return;
    }

    setLoading(true);
    try {
      await resendConfirmationCode({ email });
      alert("Verification code resent to your email.");
    } catch (error) {
      const message = (error as any)?.message || JSON.stringify(error);
      alert(`Resend error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Email Verification</Text>
        <Text style={styles.subheading}>
          Enter the code we sent to your email
        </Text>

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.primaryButtonDisabled,
          ]}
          onPress={onVerify}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={onResend}>
          <Text style={styles.linkText}>Resend code</Text>
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 15,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: "#00bcd4",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkButton: { alignItems: "center", marginTop: 12 },
  linkText: { color: "#00bcd4", fontWeight: "600" },
});
