import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { confirmSignUp, resendConfirmationCode } from "../services/authService";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-open" size={32} color={isDark ? "#081a2e" : "#fff"} />
        </View>

        <Text style={styles.heading}>Email Verification</Text>
        <Text style={styles.subheading}>
          Enter the verification code we sent to your email address.
        </Text>

        <View style={styles.inputWrapper}>
            <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="00000000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={8}
            />
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.primaryButtonDisabled,
          ]}
          onPress={onVerify}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading ? "VERIFYING..." : "VERIFY CODE"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={onResend}>
          <Text style={styles.linkText}>Didn't receive code? <Text style={styles.cta}>Resend</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>Back to Signup</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  content: { 
    padding: 30, 
    alignItems: "center" 
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  heading: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: colors.text,
    marginBottom: 8 
  },
  subheading: { 
    color: colors.textSecondary, 
    marginBottom: 40,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 30,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    height: 65,
    paddingHorizontal: 20,
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryText: { 
    color: isDark ? "#081a2e" : "#fff", 
    fontWeight: "800", 
    fontSize: 16, 
    letterSpacing: 1 
  },
  linkButton: { 
    alignItems: "center", 
    marginTop: 20 
  },
  linkText: { 
    color: colors.textSecondary, 
    fontWeight: "500", 
    fontSize: 14 
  },
  cta: { 
    color: colors.primary, 
    fontWeight: "800" 
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
  },
  backText: {
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: "600",
  }
});
