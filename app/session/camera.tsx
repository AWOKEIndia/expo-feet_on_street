import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PermissionScreen from "@/components/camera/PermissionScreen";
import CameraControls from "@/components/camera/CameraControls";

// Main camera screen component
export default function CameraScreen() {
  // Camera state
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");

  // Permission states
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  // Location state
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [isLocationReady, setIsLocationReady] = useState(false);

  const { theme, isDark } = useTheme();
  const windowDimensions = Dimensions.get("window");

  // Check all required permissions on component mount
  useEffect(() => {
    const checkAllPermissions = async () => {
      setIsCheckingPermissions(true);

      // Check storage permission
      const mediaLibraryPermission = await MediaLibrary.getPermissionsAsync();
      setStoragePermission(mediaLibraryPermission.granted);

      // Check location permission
      const locationPermissionResponse =
        await Location.getForegroundPermissionsAsync();
      setLocationPermission(locationPermissionResponse.granted);

      // If location permission is granted, start location updates
      if (locationPermissionResponse.granted) {
        initLocationUpdates();
      }

      setIsCheckingPermissions(false);
    };

    checkAllPermissions();
  }, []);

  // Start location updates if permission is granted
  const initLocationUpdates = async () => {
    let locationSubscription: Location.LocationSubscription | null = null;

    try {
      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(initialLocation);
      await updateAddress(
        initialLocation.coords.latitude,
        initialLocation.coords.longitude
      );
      setIsLocationReady(true);

      // Subscribe to location updates
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (newLocation) => {
          setLocation(newLocation);
          await updateAddress(
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );
          setIsLocationReady(true);
        }
      );
    } catch (error) {
      console.error("Error setting up location:", error);
      setIsLocationReady(false);
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  };

  // Update address from coordinates
  const updateAddress = async (latitude: number, longitude: number) => {
    try {
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResult) {
        const formattedAddress = `${addressResult.street || ""} ${
          addressResult.name || ""
        }, ${addressResult.city || ""}, ${addressResult.region || ""}, ${
          addressResult.country || ""
        }`.trim();

        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  // Handle camera permission request
  const handleCameraPermission = useCallback(async () => {
    const result = await requestCameraPermission();

    if (!result.granted) {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera access in your device settings to use this feature.",
        [{ text: "OK" }]
      );
    }
  }, [requestCameraPermission]);

  // Handle storage permission request
  const handleStoragePermission = useCallback(async () => {
    const result = await MediaLibrary.requestPermissionsAsync();
    setStoragePermission(result.granted);

    if (!result.granted) {
      Alert.alert(
        "Storage Permission Required",
        "Please enable storage access in your device settings to save photos.",
        [{ text: "OK" }]
      );
    }
  }, []);

  // Handle location permission request
  const handleLocationPermission = useCallback(async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(result.granted);

    if (result.granted) {
      initLocationUpdates();
    } else {
      Alert.alert(
        "Location Permission Required",
        "Please enable location access in your device settings to tag photos with location.",
        [{ text: "OK" }]
      );
    }
  }, []);

  // Toggle camera facing direction
  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  // Toggle flash mode
  const toggleFlashMode = useCallback(() => {
    setFlashMode((current) => {
      if (current === "off") return "on";
      if (current === "on") return "auto";
      return "off";
    });
  }, []);

  // Take picture function
  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      // Take the photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      // Create a unique filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `photo_${timestamp}.jpg`;
      const directory = `${FileSystem.documentDirectory}photos/`;

      // Ensure the directory exists
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      // Save the photo
      const filePath = `${directory}${filename}`;
      await FileSystem.writeAsStringAsync(filePath, photo.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare location data if available
      let locationData = null;
      if (location) {
        locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address || null,
        };
      }

      console.log(`Photo saved to: ${filePath}`);

      // Navigate to review screen with the photo path and location data
      router.push({
        pathname: `/session/photo-review`,
        params: {
          path: encodeURIComponent(filePath),
          location: locationData ? JSON.stringify(locationData) : undefined,
        },
      });
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, location, address]);

  // Show loading indicator while checking permissions
  if (isCheckingPermissions) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.brandColors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Initializing camera...
        </Text>
      </View>
    );
  }

  // Show camera permission screen if not granted
  if (!cameraPermission?.granted) {
    return (
      <PermissionScreen
        title="Camera Access Required"
        message="We need camera access to take photos. Your photos will remain on your device unless you choose to share them."
        onRequestPermission={handleCameraPermission}
        theme={theme}
      />
    );
  }

  // Show storage permission screen if not granted
  if (!storagePermission) {
    return (
      <PermissionScreen
        title="Storage Access Required"
        message="We need storage access to save photos to your device."
        onRequestPermission={handleStoragePermission}
        theme={theme}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        flash={flashMode}
      >
        <CameraControls
          onClose={() => router.back()}
          onFlip={toggleCameraFacing}
          onCapture={takePicture}
          onFlashToggle={toggleFlashMode}
          isCapturing={isCapturing}
          flashMode={flashMode}
        />

        {/* Location permission request banner if needed */}
        {!locationPermission && (
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionBannerText}>
              Enable location to tag photos with your current position
            </Text>
            <TouchableOpacity
              style={styles.permissionBannerButton}
              onPress={handleLocationPermission}
            >
              <Text style={styles.permissionBannerButtonText}>Enable</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Location info display */}
        {isLocationReady && location && (
          <View style={styles.locationPreview}>
            <View style={styles.locationContent}>
              <Ionicons name="location" size={20} color="white" />
              <View style={styles.locationTextContainer}>
                <Text style={styles.coordinatesText}>
                  {location.coords.latitude.toFixed(6)},{" "}
                  {location.coords.longitude.toFixed(6)}
                </Text>
                {address && (
                  <Text style={styles.addressText} numberOfLines={1}>
                    {address}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </CameraView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
  },
  locationPreview: {
    position: "absolute",
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 12,
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  coordinatesText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  addressText: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  // Permission request banner
  permissionBanner: {
    position: "absolute",
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  permissionBannerText: {
    color: "white",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  permissionBannerButton: {
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  permissionBannerButtonText: {
    color: "black",
    fontWeight: "600",
    fontSize: 12,
  },
});
