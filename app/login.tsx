import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuthContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Theme colors
  const colors = {
    background: isDark ? "#121212" : "#ffffff",
    primary: isDark ? "#ffffff" : "#000000",
    secondary: isDark ? "#a0a0a0" : "#666666",
    accent: "#3C5CA4", // AWOKE brand blue color
    surface: isDark ? "#1e1e1e" : "#f7f7f7",
    error: "#ff3b30",
  };

  // Redirect to tabs if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.content}>
        {/* AWOKE India Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: "https://erp.awokeindia.com/files/logo-sq.png" }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: colors.primary }]}>
          Feet On Street
        </Text>

        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Survey Management for MoneyWise CFL
        </Text>

        <View style={[styles.projectInfoContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.projectInfoText, { color: colors.secondary }]}>
            A project by RBI & NABARD
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error.message || "Authentication failed. Please try again."}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Sign in with Frappe</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.appVersionText, { color: colors.secondary }]}>
          AWOKE India Foundation
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  projectInfoContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 32,
  },
  projectInfoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
  },
  appVersionText: {
    fontSize: 12,
    marginTop: 32,
    textAlign: "center",
  },
});
