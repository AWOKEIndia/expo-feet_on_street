import PermissionScreen from "@/components/camera/PermissionScreen";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  CameraRatio,
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
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import PhotoManipulator from "react-native-photo-manipulator/src/PhotoManipulator";

type LocationData = {
  latitude: number;
  longitude: number;
  address: string | null;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [cameraRatio, setCameraRatio] = useState<CameraRatio>("16:9");
  const [showGrid, setShowGrid] = useState(false);

  // Latest thumbnail for gallery preview
  const [latestPhoto, setLatestPhoto] = useState<string | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [isLocationReady, setIsLocationReady] = useState(false);

  const { theme, isDark } = useTheme();

  useEffect(() => {
    const checkAllPermissions = async () => {
      setIsCheckingPermissions(true);

      const [mediaLibraryPermission, locationPermissionResponse] =
        await Promise.all([
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
    loadLatestPhoto();
  }, []);

  // Load the latest photo for gallery preview
  const loadLatestPhoto = async () => {
    try {
      const album = await MediaLibrary.getAlbumAsync("Feet On Street");
      if (album) {
        const assets = await MediaLibrary.getAssetsAsync({
          album: album.id,
          first: 1,
          mediaType: "photo",
          sortBy: [["creationTime", false]],
        });

        if (assets.assets.length > 0) {
          setLatestPhoto(assets.assets[0].uri);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load latest photo:", error);
    }
  };

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
          addressResult.country,
        ]
          .filter(Boolean)
          .join(", ");

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
        case "off":
          return "on";
        case "on":
          return "auto";
        default:
          return "off";
      }
    });
  }, []);

  const toggleCameraRatio = useCallback(() => {
    setCameraRatio((current) => (current === "16:9" ? "4:3" : "16:9"));
  }, []);

  const toggleGrid = useCallback(() => {
    setShowGrid((current) => !current);
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    let photo;
    let manipulatedUri = null;
    let photoAsset = null;
    try {
      photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: true,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      // add location data to photo
      photo.exif.latitude = location?.coords.latitude;
      photo.exif.longitude = location?.coords.longitude;
      photo.exif.altitude = location?.coords.altitude || 0;

      const Album = await MediaLibrary.getAlbumAsync("Feet On Street");

      // Manipulate photo
      manipulatedUri = await PhotoManipulator.printText(photo.uri, [
        {
          text: `${address || "Unknown"} \n${location?.coords.latitude?.toFixed(
            6
          )}, ${location?.coords.longitude?.toFixed(6)} \n${
            photo.exif?.Make?.toUpperCase() || "Unknown"
          } ${photo.exif?.Model || "Unknown"}`,
          position: {
            x: 0,
            y: photo.height - photo.height * 0.1,
          },
          color: "white",
          textSize: 68,
          thickness: 5,
        },
      ]);

      photoAsset = await MediaLibrary.createAssetAsync(manipulatedUri);

      console.log("exif data", photo.exif);

      if (!Album) {
        await MediaLibrary.createAlbumAsync(
          "Feet On Street",
          photoAsset,
          false
        );
      } else {
        await MediaLibrary.addAssetsToAlbumAsync(photoAsset, Album, false);
      }

      setLatestPhoto(photoAsset.uri);

      // Delete manipulated file
      await FileSystem.deleteAsync(manipulatedUri, { idempotent: true });
      // Delete original photo
      await FileSystem.deleteAsync(photo.uri, { idempotent: true });

      // Navigate after state update
      router.push({
        pathname: `/session/photo-review`,
        params: {
          path: encodeURIComponent(photoAsset.uri),
        },
      });
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
      // Clean up original photo if manipulation failed
      if (photo?.uri) {
        await FileSystem.deleteAsync(photo.uri, { idempotent: true });
      }
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, location, address]);

  const navigateToGallery = useCallback(() => {
    router.push("/gallery");
  }, []);

  if (isCheckingPermissions) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
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

  if (!cameraPermission?.granted) {
    return (
      <PermissionScreen
        title="Camera Access Required"
        message="We need camera access to take photos. Your photos will remain on your device unless you choose to share them."
        onRequestPermission={() =>
          handlePermissionRequest(requestCameraPermission, "Camera")
        }
        theme={theme}
      />
    );
  }

  if (!storagePermission) {
    return (
      <PermissionScreen
        title="Storage Access Required"
        message="We need storage access to save photos to your device."
        onRequestPermission={() =>
          handlePermissionRequest(
            MediaLibrary.requestPermissionsAsync,
            "Storage",
            setStoragePermission
          )
        }
        theme={theme}
      />
    );
  }

  if (!locationPermission) {
    return (
      <PermissionScreen
        title="Location Access Required"
        message="We need location access to tag photos with your current position."
        onRequestPermission={() =>
          handlePermissionRequest(
            Location.requestForegroundPermissionsAsync,
            "Location",
            setLocationPermission
          )
        }
        theme={theme}
      />
    );
  }

  if (!location) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.brandColors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Getting location...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <CameraView
        style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
        facing={facing}
        ref={cameraRef}
        flash={flashMode}
        ratio={cameraRatio}
      >
        {showGrid && (
          <View style={styles.gridOverlay}>
            <View
              style={[styles.gridLine, styles.gridVertical, { left: "33.33%" }]}
            />
            <View
              style={[
                styles.gridLine,
                styles.gridVertical,
                { right: "33.33%" },
              ]}
            />
            <View
              style={[
                styles.gridLine,
                styles.gridHorizontal,
                { top: "33.33%" },
              ]}
            />
            <View
              style={[
                styles.gridLine,
                styles.gridHorizontal,
                { bottom: "33.33%" },
              ]}
            />
          </View>
        )}

        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.cameraOptionsContainer}>
            <TouchableOpacity
              style={styles.cameraOptionButton}
              onPress={toggleFlashMode}
            >
              <Ionicons
                name={
                  flashMode === "off"
                    ? "flash-off"
                    : flashMode === "on"
                    ? "flash"
                    : "flash-outline"
                }
                size={22}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraOptionButton}
              onPress={toggleCameraRatio}
            >
              <Text style={styles.ratioText}>{cameraRatio}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraOptionButton}
              onPress={toggleGrid}
            >
              <Ionicons
                name={showGrid ? "grid" : "grid-outline"}
                size={22}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>

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

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          {/* Gallery preview thumbnail */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={navigateToGallery}
          >
            {latestPhoto ? (
              <Image
                source={{ uri: latestPhoto }}
                resizeMode="cover"
                style={styles.galleryThumbnail}
              />
            ) : (
              <View style={[styles.galleryThumbnail, styles.emptyThumbnail]}>
                <Ionicons name="images-outline" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Camera capture button */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          {/* Flip camera button */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    zIndex: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOptionsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 4,
  },
  cameraOptionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  ratioText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  bottomControls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.3)",
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  galleryThumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  emptyThumbnail: {
    justifyContent: "center",
    alignItems: "center",
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
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  gridVertical: {
    width: 1,
    height: "100%",
  },
  gridHorizontal: {
    height: 1,
    width: "100%",
  },
  focusIndicator: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
  },
});
