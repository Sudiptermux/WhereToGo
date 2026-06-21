import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import { signUp } from "../services/authService";
import { useTrip } from "../context/TripContext";
import { useTheme } from "../context/ThemeContext";

export default function SignupScreen() {
  const router = useRouter();
  const { updateProfile } = useTrip();
  const { colors, isDark } = useTheme();
  
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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
      
      updateProfile({ name });

      alert("Signup successful! User identity created.");
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
      <ScrollView contentContainerStyle={styles.innerContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.logoCircle}>
          <Ionicons name="compass" size={32} color={isDark ? "#081a2e" : "#fff"} />
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started your journey.</Text>

        <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
                <Feather name="user" size={18} color={colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textSecondary}
                />
            </View>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={18} color={colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
                <Feather name="lock" size={18} color={colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
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

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
                <Feather name="lock" size={18} color={colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
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
                style={styles.checkboxRow}
                onPress={() => setAgreed((v) => !v)}
            >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                    {agreed && <Ionicons name="checkmark" size={14} color={isDark ? "#081a2e" : "#fff"} />}
                </View>
                <Text style={styles.checkboxText}>Accept Terms & Conditions</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.primaryButton,
                    loading && styles.primaryButtonDisabled,
                ]}
                onPress={onSignup}
                disabled={loading}
            >
                <Text style={styles.primaryText}>
                    {loading ? "CREATING..." : "CREATE ACCOUNT"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push("/")}
                style={styles.loginLink}
            >
                <Text style={styles.loginLinkText}>
                    Already have an account? <Text style={styles.cta}>Log In</Text>
                </Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    padding: 24,
    alignItems: "center",
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 30,
    fontWeight: "500",
    opacity: 0.7,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 15,
    letterSpacing: 1,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 11,
    fontSize: 15,
    color: colors.text,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginVertical: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    width: "100%",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  loginLinkText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  cta: {
    color: colors.primary,
    fontWeight: "800",
  },
});
