import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
    const processImage = async () => {
      if (path) {
        const decodedPath = decodeURIComponent(path);
        let locationInfo: LocationData | null = null;

        if (location) {
          try {
            locationInfo = JSON.parse(location) as LocationData;
            setLocationData(locationInfo);
          } catch (error) {
            console.error("Error parsing location data:", error);
          }
        }
        setImageUri(decodedPath);
        setIsLoading(false);
      }
    };

    processImage();
  }, [path, location]);

  const handleClose = () => {
    router.back();
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {imageUri && (
          <>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
            {locationData && (
              <View
                style={[
                  styles.locationOverlay,
                  { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                ]}
              >
                <View style={styles.locationContent}>
                  <Ionicons name="location" size={20} color="white" />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.coordinatesText}>
                      {locationData.latitude.toFixed(6)},{" "}
                      {locationData.longitude.toFixed(6)}
                    </Text>
                    {locationData.address && (
                      <Text style={styles.addressText} numberOfLines={2}>
                        {locationData.address}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
  },
  closeButton: {
    padding: 8,
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
