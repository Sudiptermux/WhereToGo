import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { forgotPassword, confirmPassword as authConfirmPassword } from "../services/authService";
import { useTheme } from "../context/ThemeContext";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const sendReset = async () => {
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email });
      alert("A reset code has been sent to your email.");
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
      alert("Please complete all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authConfirmPassword({ email, code, newPassword: password });
      alert("Password reset successfully. You can now log in.");
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Feather name="lock" size={32} color={isDark ? "#081a2e" : "#fff"} />
        </View>

        <Text style={styles.heading}>Forgot Password</Text>
        
        {step === 1 ? (
          <>
            <Text style={styles.subheading}>
              Enter your email address and we'll send you a 6-digit code to reset your password.
            </Text>
            
            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabledBtn]} 
              onPress={sendReset}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "SENDING..." : "SEND RESET CODE"}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subheading}>
              We've sent a code to {email}. Enter it below along with your new password.
            </Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="keypad" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Verification code"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="New password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)}>
                <Feather
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!confirmPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setConfirmPasswordVisible((v) => !v)}
              >
                <Feather
                  name={confirmPasswordVisible ? "eye-off" : "eye"}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledBtn]}
              onPress={resetPassword}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "RESETTING..." : "RESET PASSWORD"}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Back to Login</Text>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 60,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: colors.text,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  primaryText: { 
    color: isDark ? "#081a2e" : "#fff", 
    fontWeight: "800", 
    fontSize: 16, 
    letterSpacing: 1 
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 30,
  },
  backText: {
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: "600",
  }
});
