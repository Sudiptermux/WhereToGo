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
    ActivityIndicator,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signIn } from "../services/authService";
import { useTrip } from "../context/TripContext";
import { supabase } from "../services/supabaseClient";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { updateProfile } = useTrip();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/(tabs)/home");
        } else {
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
      
      const inferredName = email.split('@')[0].split('.')[0];
      const capitalized = inferredName.charAt(0).toUpperCase() + inferredName.slice(1);
      updateProfile({ name: capitalized });

      router.replace("/(tabs)/home");
    } catch (error) {
      const message = (error as any)?.message || JSON.stringify(error);
      alert(`Login error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.logoCircle}>
          <Image 
            source={require("../assets/images/logo.png")} 
            style={styles.logoImage} 
            resizeMode="cover" 
          />
        </View>

        <Text style={styles.title}>WhereToGo</Text>
        <Text style={styles.subtitle}>Your premium journey starts here.</Text>

        <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color={colors.textSecondary} />
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                />
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
            <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={colors.textSecondary} />
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!passwordVisible}
                    style={styles.input}
                />
                <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                >
                    <Feather
                        name={passwordVisible ? "eye-off" : "eye"}
                        size={20}
                        color={colors.textSecondary}
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
                    {rememberMe && <Ionicons name="checkmark" size={14} color={isDark ? "#081a2e" : "#fff"} />}
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
                    <Ionicons name="logo-google" size={20} color={colors.text} />
                    <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-apple" size={22} color={colors.text} />
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
    width: 90,
    height: 90,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 40,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
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
    marginBottom: 10,
    letterSpacing: 1,
    opacity: 0.6,
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
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: colors.text,
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
  forgot: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 35,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 15,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    opacity: 0.5,
  },
  socialRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  socialButton: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    width: "48%",
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  socialText: {
    color: colors.text,
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 15,
  },
  createAccount: {
    alignItems: "center",
    marginBottom: 40,
  },
  createAccountText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  cta: {
    color: colors.primary,
    fontWeight: "800",
  },
});
