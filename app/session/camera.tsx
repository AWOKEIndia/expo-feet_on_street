import CameraControls from "@/components/camera/CameraControls";
import PermissionScreen from "@/components/camera/PermissionScreen";
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
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type LocationData = {
  latitude: number;
  longitude: number;
  address: string | null;
};

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLocationReady, setIsLocationReady] = useState(false);

  const { theme, isDark } = useTheme();

  useEffect(() => {
    const checkAllPermissions = async () => {
      setIsCheckingPermissions(true);

      const [mediaLibraryPermission, locationPermissionResponse] = await Promise.all([
        MediaLibrary.getPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
      ]);

      setStoragePermission(mediaLibraryPermission.granted);
      setLocationPermission(locationPermissionResponse.granted);

      if (locationPermissionResponse.granted) {
        await initLocationUpdates();
      }

      setIsCheckingPermissions(false);
    };

    checkAllPermissions();
  }, []);

  const initLocationUpdates = async () => {
    try {
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(initialLocation);
      await updateAddress(
        initialLocation.coords.latitude,
        initialLocation.coords.longitude
      );
      setIsLocationReady(true);

      const locationSubscription = await Location.watchPositionAsync(
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
        }
      );

      return () => locationSubscription.remove();
    } catch (error) {
      console.error("Location error:", error);
      setIsLocationReady(false);
    }
  };

  const updateAddress = async (latitude: number, longitude: number) => {
    try {
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResult) {
        const formattedAddress = [
          addressResult.street,
          addressResult.name,
          addressResult.city,
          addressResult.region,
          addressResult.country
        ].filter(Boolean).join(", ");

        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handlePermissionRequest = async (
    requestFn: () => Promise<any>,
    permissionName: string,
    setPermission?: (value: boolean) => void
  ) => {
    const result = await requestFn();
    if (setPermission) setPermission(result.granted);

    if (!result.granted) {
      Alert.alert(
        `${permissionName} Permission Required`,
        `Please enable ${permissionName.toLowerCase()} access in your device settings.`,
        [{ text: "OK" }]
      );
    }
  };

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const toggleFlashMode = useCallback(() => {
    setFlashMode((current) => {
      switch (current) {
        case "off": return "on";
        case "on": return "auto";
        default: return "off";
      }
    });
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      const timestamp = Date.now();
      const filename = `photo_${timestamp}.jpg`;
      const directory = `${FileSystem.documentDirectory}photos/`;

      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

      const filePath = `${directory}${filename}`;
      await FileSystem.writeAsStringAsync(filePath, photo.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const locationData: LocationData | null = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      } : null;

      router.push({
        pathname: `/session/photo-review`,
        params: {
          path: encodeURIComponent(filePath),
          location: locationData ? JSON.stringify(locationData) : undefined,
        },
      });
    } catch (error) {
      console.error("Capture error:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, location, address]);

  if (isCheckingPermissions) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={theme.brandColors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Initializing camera...
        </Text>
      </View>
    );
  }

  if (!cameraPermission?.granted) {
    return (
      <PermissionScreen
        title="Camera Access Required"
        message="We need camera access to take photos. Your photos will remain on your device unless you choose to share them."
        onRequestPermission={() => handlePermissionRequest(
          requestCameraPermission,
          "Camera"
        )}
        theme={theme}
      />
    );
  }

  if (!storagePermission) {
    return (
      <PermissionScreen
        title="Storage Access Required"
        message="We need storage access to save photos to your device."
        onRequestPermission={() => handlePermissionRequest(
          MediaLibrary.requestPermissionsAsync,
          "Storage",
          setStoragePermission
        )}
        theme={theme}
      />
    );
  }

  if (!locationPermission) {
    return (
      <PermissionScreen
        title="Location Access Required"
        message="We need location access to tag photos with your current position."
        onRequestPermission={() => handlePermissionRequest(
          Location.requestForegroundPermissionsAsync,
          "Location",
          setLocationPermission
        )}
        theme={theme}
      />
    );
  }

  if (!location) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={theme.brandColors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Getting location...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
