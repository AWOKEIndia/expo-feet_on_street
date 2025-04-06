import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { Camera, useCameraPermissions } from "expo-camera";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const { theme, isDark, themeType, setThemeType } = useTheme();
  const { logout } = useAuthContext();
  const router = useRouter();

  // Permission states
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [storagePermission, setStoragePermission] = useState<boolean | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [cameraPermissionStatus, requestCameraPermission] = useCameraPermissions();

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Update camera permission state when it changes
  useEffect(() => {
    if (cameraPermissionStatus) {
      setCameraPermission(cameraPermissionStatus.granted);
    }
  }, [cameraPermissionStatus]);

  const checkPermissions = async () => {
    // Check location permission
    const locationStatus = await Location.getForegroundPermissionsAsync();
    setLocationPermission(locationStatus.granted);

    // Check storage permission
    const storageStatus = await MediaLibrary.getPermissionsAsync();
    setStoragePermission(storageStatus.granted);

    // Camera permission is handled by the useCameraPermissions hook
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderPermissionStatus = (granted: boolean | null) => {
    if (granted === null) {
      return <ActivityIndicator size="small" color={theme.colors.buttonPrimary} />;
    }
    return (
      <Ionicons
        name={granted ? "checkmark-circle" : "close-circle"}
        size={24}
        color={granted ? "#4CAF50" : "#FF3B30"}
      />
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.surfacePrimary }]}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              themeType === "light" && styles.selectedTheme,
            ]}
            onPress={() => setThemeType("light")}
          >
            <Ionicons
              name="sunny-outline"
              size={24}
              color={theme.colors.textPrimary}
            />
            <ThemedText style={styles.themeText}>Light</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeOption,
              themeType === "dark" && styles.selectedTheme,
            ]}
            onPress={() => setThemeType("dark")}
          >
            <Ionicons
              name="moon-outline"
              size={24}
              color={theme.colors.textPrimary}
            />
            <ThemedText style={styles.themeText}>Dark</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeOption,
              themeType === "system" && styles.selectedTheme,
            ]}
            onPress={() => setThemeType("system")}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={theme.colors.textPrimary}
            />
            <ThemedText style={styles.themeText}>System</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Permissions</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.surfacePrimary }]}>
          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Ionicons
                name="location-outline"
                size={24}
                color={theme.colors.textPrimary}
                style={styles.permissionIcon}
              />
              <ThemedText>Location</ThemedText>
            </View>
            {renderPermissionStatus(locationPermission)}
          </View>
          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Ionicons
                name="images-outline"
                size={24}
                color={theme.colors.textPrimary}
                style={styles.permissionIcon}
              />
              <ThemedText>Storage</ThemedText>
            </View>
            {renderPermissionStatus(storagePermission)}
          </View>
          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Ionicons
                name="camera-outline"
                size={24}
                color={theme.colors.textPrimary}
                style={styles.permissionIcon}
              />
              <ThemedText>Camera</ThemedText>
            </View>
            {renderPermissionStatus(cameraPermission)}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.surfacePrimary }]}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: "#FF3B30" }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
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
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedTheme: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  themeText: {
    marginLeft: 12,
    fontSize: 16,
  },
  permissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  permissionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  permissionIcon: {
    marginRight: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
