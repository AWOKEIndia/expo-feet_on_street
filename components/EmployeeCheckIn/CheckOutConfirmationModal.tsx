import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

interface CheckOutConfirmationModalProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (location: { latitude: number; longitude: number }) => void;
  theme: any;
}

const INDIA_VIEW = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 15,
  longitudeDelta: 15,
};

const CheckOutConfirmationModal: React.FC<CheckOutConfirmationModalProps> = ({
  visible,
  loading,
  onClose,
  onConfirm,
  theme,
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (visible) {
      setInitialLoad(true);
      getLocation();
    } else {
      setLocation(null);
      setInitialLoad(true);
    }
  }, [visible]);

  const animateToLocation = (newLocation: { latitude: number; longitude: number }) => {
    if (mapRef.current) {
      if (initialLoad) {
        mapRef.current.animateToRegion(INDIA_VIEW, 500);

        setTimeout(() => {
          mapRef.current?.animateToRegion({
            ...newLocation,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }, 500);

          setTimeout(() => {
            mapRef.current?.animateToRegion({
              ...newLocation,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }, 500);
          }, 500);
        }, 500);

        setInitialLoad(false);
      } else {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 500);
      }
    }
  };

  const getLocation = async () => {
    setFetchingLocation(true);
    setLocationError(null);
    setLocation(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(newLocation);
      animateToLocation(newLocation);
    } catch (error: any) {
      console.error("Failed to get location", error);
      setLocationError(`Unable to fetch location: ${error.message}`);
      Alert.alert(
        "Location Error",
        "Unable to fetch your current location. Please try again."
      );
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleConfirm = () => {
    if (location) {
      onConfirm(location);
    } else {
      setLocationError("Location data is missing");
    }
  };

  const handleRetry = () => {
    getLocation();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surfacePrimary },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalHandleBar} onPress={onClose} />
            <Text
              style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
            >
              Confirm Check Out
            </Text>
          </View>

          <View style={styles.modalContent}>
            <Text
              style={[styles.confirmText, { color: theme.colors.textPrimary }]}
            >
              {fetchingLocation
                ? "Fetching your current location..."
                : location
                ? "You are about to check out from your current location:"
                : "Could not determine your location"}
            </Text>

            {location && !fetchingLocation && (
              <Text
                style={[
                  styles.locationInfoText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Latitude: {location.latitude.toFixed(6)}
                {"\t"}
                Longitude: {location.longitude.toFixed(6)}
              </Text>
            )}

            <View style={styles.confirmMapContainer}>
              <MapView
                ref={mapRef}
                style={styles.confirmMap}
                initialRegion={INDIA_VIEW}
                provider={PROVIDER_GOOGLE}
              >
                {location && (
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    title="Your Location"
                  />
                )}
              </MapView>

              {fetchingLocation && (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.buttonPrimary}
                  />
                  <Text style={[styles.loadingText, { color: theme.colors.textInverted }]}>
                    Locating you...
                  </Text>
                </View>
              )}

              {locationError && !fetchingLocation && (
                <View style={styles.mapErrorOverlay}>
                  <Text style={[styles.errorText, { color: theme.colors.textInverted }]}>
                    {locationError}
                  </Text>
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.colors.buttonPrimary }]}
                    onPress={handleRetry}
                  >
                    <Text style={[styles.retryButtonText, { color: theme.colors.textInverted }]}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.confirmButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: theme.colors.buttonPrimary },
                  (fetchingLocation || !location) && { opacity: 0.6 },
                ]}
                onPress={handleConfirm}
                disabled={loading || fetchingLocation || !location}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: theme.colors.textInverted },
                    ]}
                  >
                    Confirm Check Out
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 4,
  },
  modalContent: {
    padding: 16,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  locationInfoText: {
    fontSize: 14,
    marginVertical: 12,
    textAlign: "center",
  },
  confirmMapContainer: {
    position: "relative",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    height: 200,
  },
  confirmMap: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  mapLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  mapErrorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  confirmButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CheckOutConfirmationModal;
