import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const { accessToken, isAuthenticated } = useAuthContext();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const insets = useSafeAreaInsets();

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserProfile();
    }
  }, [isAuthenticated, accessToken]);

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
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
        setUserName(
          userData.data.full_name || userData.data.first_name || data.message
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Get the first letter of the user's name for the avatar
  const getAvatarText = () => {
    if (!userName) return "-";
    return userName.charAt(0).toUpperCase();
  };

  // Render the avatar or loading skeleton
  const renderAvatar = () => {
    if (isLoadingProfile) {
      return (
        <View style={[styles.avatarContainer, styles.avatarSkeleton, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <ActivityIndicator size="small" color={theme.colors.buttonPrimary} />
        </View>
      );
    }

    return (
      <View style={[styles.avatarContainer, { backgroundColor: theme.colors.buttonPrimary }]}>
        <ThemedText style={styles.avatarText}>{getAvatarText()}</ThemedText>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.buttonPrimary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
            backgroundColor: isDark
              ? "rgba(30, 30, 30, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
          },
          default: {
            backgroundColor: isDark
              ? theme.colors.surfacePrimary
              : theme.colors.surfacePrimary,
          },
        }),
        header: () => (
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <ThemedText style={styles.headerTitle}>Feet On Street</ThemedText>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme.colors.textPrimary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                {renderAvatar()}
              </TouchableOpacity>
            </View>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    minHeight: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginTop: 10,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    width: 80, // Fixed width for the icons container
    justifyContent: "flex-end", // Align icons to the right
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSkeleton: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
});
