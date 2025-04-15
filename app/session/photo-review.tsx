import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string | null;
}

export default function PhotoReviewScreen() {
  const { theme } = useTheme();
  const { path, location } = useLocalSearchParams<{
    path: string;
    location?: string;
  }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImageData = async () => {
      try {
        if (!path) return;

        const decodedPath = decodeURIComponent(path);
        setImageUri(decodedPath);

        if (location) {
          try {
            const parsedLocation = JSON.parse(location) as LocationData;
            setLocationData(parsedLocation);
          } catch (error) {
            console.error("Failed to parse location data:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load image:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImageData();
  }, [path, location]);

  const handleClose = () => router.back();

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
      </SafeAreaView>
    );
  }

  if (!imageUri) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.textPrimary }}>
          Failed to load image
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          accessibilityLabel="Close preview"
        >
          <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Captured photo"
        />

        {locationData && (
          <View style={styles.locationOverlay}>
            <View style={styles.locationContent}>
              <Ionicons
                name="location"
                size={20}
                color="white"
                accessibilityLabel="Location icon"
              />
              <View style={styles.locationTextContainer}>
                <Text style={styles.coordinatesText}>
                  {locationData.latitude.toFixed(6)},{" "}
                  {locationData.longitude.toFixed(6)}
                </Text>
                {locationData.address && (
                  <Text
                    style={styles.addressText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {locationData.address}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: "flex-end",
  },
  closeButton: {
    padding: 4,
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  image: {
    flex: 1,
    width: "100%",
  },
  locationOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
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
});
