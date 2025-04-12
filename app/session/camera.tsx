import { CameraControls } from "@/components/camera/CameraControls";
import { PermissionScreen } from "@/components/camera/PermissionScreen";
import { useTheme } from "@/contexts/ThemeContext";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLocationReady, setIsLocationReady] = useState(false);

  const { theme, isDark } = useTheme();
  const { height, width } = Dimensions.get("window");

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationUpdates = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          setIsLocationReady(false);
          return;
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(initialLocation);
        await updateAddress(initialLocation.coords.latitude, initialLocation.coords.longitude);
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
            await updateAddress(newLocation.coords.latitude, newLocation.coords.longitude);
            setIsLocationReady(true);
          }
        );
      } catch (error) {
        console.error("Error setting up location:", error);
        setIsLocationReady(false);
      }
    };

    startLocationUpdates();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const updateAddress = async (latitude: number, longitude: number) => {
    try {
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addressResult) {
        const formattedAddress = `${addressResult.street || ''} ${addressResult.name || ''}, ${addressResult.city || ''}, ${addressResult.region || ''}, ${addressResult.country || ''}`.trim();
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  const handleRequestPermission = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const toggleFlashMode = useCallback(() => {
    setFlashMode((current) => {
      if (current === "off") return "on";
      if (current === "on") return "auto";
      return "off";
    });
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      return address;
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  };

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      const timestamp = new Date().getTime();
      const filename = `photo_${timestamp}.jpg`;
      const directory = `${FileSystem.documentDirectory}photos/`;

      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      const filePath = `${directory}${filename}`;
      await FileSystem.writeAsStringAsync(filePath, photo.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get address if location is available
      let locationData = null;
      if (currentLocation) {
        const address = await getAddressFromCoordinates(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
        locationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: address ? `${address.street || ''} ${address.name || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim() : null
        };
      }

      console.log(`Photo saved to: ${filePath}`);
      router.push({
        pathname: `/session/photo-review`,
        params: {
          path: encodeURIComponent(filePath),
          location: locationData ? JSON.stringify(locationData) : undefined
        }
      });
    } catch (error) {
      console.error("Error taking picture:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  if (!permission) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.brandColors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <PermissionScreen
        onRequestPermission={handleRequestPermission}
        theme={theme}
      />
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
          <View style={[styles.locationPreview, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
            <View style={styles.locationContent}>
              <Ionicons name="location" size={20} color="white" />
              <View style={styles.locationTextContainer}>
                <Text style={styles.coordinatesText}>
                  {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
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
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
  },
  locationPreview: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    borderRadius: 8,
    padding: 12,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  coordinatesText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  addressText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
});
