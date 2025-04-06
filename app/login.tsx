import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuthContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f5f5f5" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? "#ffffff" : "#000000" }]}>
          Welcome to Feet on Street
        </Text>

        <Text
          style={[styles.subtitle, { color: isDark ? "#cccccc" : "#666666" }]}
        >
          Sign in with your Frappe account to continue
        </Text>

        {error && (
          <Text style={styles.errorText}>
            {error.message || "Authentication failed. Please try again."}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#4CAF50" }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign in with Frappe</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 20,
    textAlign: "center",
  },
});
