import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { accessToken, isAuthenticated } = useAuthContext();
  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserProfile();
    }
  }, [isAuthenticated, accessToken]);

  const fetchUserProfile = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/frappe.auth.get_logged_user`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        // Now fetch the user details
        const userResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/User/${data.message}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error(
            `Failed to fetch user details: ${userResponse.status}`
          );
        }

        const userData = await userResponse.json();
        setUsername(userData.data.name);
        setFullName(userData.data.full_name);
        setEmail(userData.data.email);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.buttonPrimary },
          ]}
        >
          <ThemedText style={styles.avatarText}>
            {fullName ? fullName.charAt(0).toUpperCase() : "?"}
          </ThemedText>
        </View>
        <ThemedText style={styles.name}>
          {fullName || username || "User"}
        </ThemedText>
        <ThemedText style={styles.email}>
          {email || "No email provided"}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surfacePrimary },
          ]}
        >
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <ThemedText style={styles.value}>
              {username || "Not set"}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Full Name</ThemedText>
            <ThemedText style={styles.value}>
              {fullName || "Not set"}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{email || "Not set"}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account Actions</ThemedText>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surfacePrimary },
          ]}
        >
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="pencil-outline"
              size={20}
              color={theme.colors.textPrimary}
              style={styles.actionIcon}
            />
            <ThemedText>Edit Profile</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="key-outline"
              size={20}
              color={theme.colors.textPrimary}
              style={styles.actionIcon}
            />
            <ThemedText>Change Password</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/user/settings")}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={theme.colors.textPrimary}
              style={styles.actionIcon}
            />
            <ThemedText>Settings</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 42,
    lineHeight: 42,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  label: {
    fontSize: 16,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  actionIcon: {
    marginRight: 12,
  },
});
