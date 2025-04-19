import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme, THEME_STORAGE_KEY } from "@/contexts/ThemeContext";

export default function SettingsScreen() {
  const { theme, themeType, setThemeType } = useTheme();

  // Permission states
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [storagePermission, setStoragePermission] = useState<boolean | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  // Save theme preference to storage when it changes
  const saveThemePreference = async () => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeType);
    } catch (error) {
      console.error("Failed to save theme preference", error);
    }
  };

  useEffect(() => {
    saveThemePreference();
  }, [themeType]);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check location permission
    const locationStatus = await Location.getForegroundPermissionsAsync();
    setLocationPermission(locationStatus.granted);

    // Check storage permission
    const storageStatus = await MediaLibrary.getPermissionsAsync();
    setStoragePermission(storageStatus.granted);

    // Check camera permission
    const cameraStatus = await Camera.getCameraPermissionsAsync();
    setCameraPermission(cameraStatus.granted);
  };

  const requestPermission = async (type: 'location' | 'storage' | 'camera') => {
    try {
      switch (type) {
        case 'location':
          if (locationPermission) {
            Alert.alert("Permission Already Granted", "Location permission is already granted.");
            return;
          }
          const locationResult = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(locationResult.granted);
          break;

        case 'storage':
          if (storagePermission) {
            Alert.alert("Permission Already Granted", "Storage permission is already granted.");
            return;
          }
          const storageResult = await MediaLibrary.requestPermissionsAsync();
          setStoragePermission(storageResult.granted);
          break;

        case 'camera':
          if (cameraPermission) {
            Alert.alert("Permission Already Granted", "Camera permission is already granted.");
            return;
          }
          const cameraResult = await Camera.requestCameraPermissionsAsync();
          setCameraPermission(cameraResult.granted);
          break;
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      Alert.alert("Permission Error", `Failed to request ${type} permission.`);
    }
  };

  const renderPermissionStatus = (granted: boolean | null, permissionType: 'location' | 'storage' | 'camera') => {
    if (granted === null) {
      return <ActivityIndicator size="small" color={theme.colors.buttonPrimary} />;
    }

    return (
      <View style={styles.permissionActions}>
        <Ionicons
          name={granted ? "checkmark-circle" : "close-circle"}
          size={24}
          color={granted ? theme.colors.iconSuccess : theme.colors.iconError}
          style={styles.statusIcon}
        />
        <TouchableOpacity
          style={[
            styles.permissionButton,
            { backgroundColor: granted ? theme.colors.surfaceSecondary : theme.colors.buttonPrimary }
          ]}
          onPress={() => requestPermission(permissionType)}
          disabled={granted}
        >
          <ThemedText style={{
            color: granted ? theme.colors.textSecondary : theme.colors.textInverted,
            fontSize: theme.typography.fontSizes.sm,
          }}>
            {granted ? "Granted" : "Request"}
          </ThemedText>
        </TouchableOpacity>
      </View>
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
              themeType === "light" && [styles.selectedTheme, { backgroundColor: theme.colors.highlight }],
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
              themeType === "dark" && [styles.selectedTheme, { backgroundColor: theme.colors.highlight }],
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
              themeType === "system" && [styles.selectedTheme, { backgroundColor: theme.colors.highlight }],
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
          <View style={[styles.permissionRow, { borderBottomColor: theme.colors.divider }]}>
            <View style={styles.permissionInfo}>
              <Ionicons
                name="location-outline"
                size={24}
                color={theme.colors.textPrimary}
                style={styles.permissionIcon}
              />
              <ThemedText>Location</ThemedText>
            </View>
            {renderPermissionStatus(locationPermission, 'location')}
          </View>
          <View style={[styles.permissionRow, { borderBottomColor: theme.colors.divider }]}>
            <View style={styles.permissionInfo}>
              <Ionicons
                name="images-outline"
                size={24}
                color={theme.colors.textPrimary}
                style={styles.permissionIcon}
              />
              <ThemedText>Storage</ThemedText>
            </View>
            {renderPermissionStatus(storagePermission, 'storage')}
          </View>
          <View style={[styles.permissionRow, { borderBottomColor: theme.colors.divider }]}>
            <View style={styles.permissionInfo}>
              <Ionicons
                name="camera-outline"
                size={24}
                color={theme.colors.textPrimary}
                style={styles.permissionIcon}
              />
              <ThemedText>Camera</ThemedText>
            </View>
            {renderPermissionStatus(cameraPermission, 'camera')}
          </View>
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
    paddingBottom: 32,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedTheme: {
    borderRadius: 8,
  },
  themeText: {
    marginLeft: 12,
    fontSize: 16,
  },
  permissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  permissionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  permissionIcon: {
    marginRight: 12,
  },
  statusIcon: {
    marginRight: 8,
  },
  permissionActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  permissionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  preferenceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  preferenceIcon: {
    marginRight: 12,
  },
});
