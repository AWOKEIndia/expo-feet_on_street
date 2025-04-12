import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Linking from "expo-linking";
import moment from "moment";

interface LogDetails {
  name?: string;
  time?: string;
  log_type?: string;
  latitude?: string;
  longitude?: string;
  employee?: string;
}

interface DetailsModalProps {
  visible: boolean;
  logId: string | null;
  accessToken: string;
  onClose: () => void;
  theme: any;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  visible,
  logId,
  accessToken,
  onClose,
  theme,
}) => {
  const [logDetails, setLogDetails] = useState<LogDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && logId) {
      fetchLogDetails(logId);
    } else if (!visible) {
      // Reset state when modal closes
      setLogDetails(null);
      setError(null);
    }
  }, [visible, logId]);

  const fetchLogDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Employee Checkin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch log details: ${response.status}`);
      }

      const data = await response.json();
      setLogDetails(data.data);
    } catch (error: any) {
      console.error("Error fetching log details:", error);
      setError(`Failed to load details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInMaps = () => {
    if (!logDetails?.latitude || !logDetails?.longitude) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${logDetails.latitude},${logDetails.longitude}`;
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open maps:", err)
    );
  };

  const formatDate = (dateString: string) => {
    const date = moment(dateString);
    return date.format("D MMM YYYY");
  };

  const formatTime = (dateString: string) => {
    const date = moment(dateString);
    return date.format("hh:mm a");
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
            <View style={styles.modalHandleBar} />
            <Text
              style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
            >
              Employee Checkin
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.buttonPrimary}
              />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text
                style={[styles.errorText, { color: theme.statusColors.error }]}
              >
                {error}
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: theme.colors.buttonPrimary },
                ]}
                onPress={() => logId && fetchLogDetails(logId)}
              >
                <Text style={[styles.retryButtonText, { color: theme.colors.textInverted }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  ID
                </Text>
                <Text
                  style={[styles.detailValue, { color: theme.colors.textPrimary }]}
                >
                  {logDetails?.name || ""}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  Date
                </Text>
                <Text
                  style={[styles.detailValue, { color: theme.colors.textPrimary }]}
                >
                  {logDetails?.time ? formatDate(logDetails.time) : ""}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  Time
                </Text>
                <Text
                  style={[styles.detailValue, { color: theme.colors.textPrimary }]}
                >
                  {logDetails?.time ? formatTime(logDetails.time) : ""}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  Latitude
                </Text>
                <Text
                  style={[styles.detailValue, { color: theme.colors.textPrimary }]}
                >
                  {logDetails?.latitude || "N/A"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  Longitude
                </Text>
                <Text
                  style={[styles.detailValue, { color: theme.colors.textPrimary }]}
                >
                  {logDetails?.longitude || "N/A"}
                </Text>
              </View>

              {logDetails?.latitude && logDetails?.longitude ? (
                <View style={styles.mapContainer}>
                  <Text
                    style={[styles.mapLabel, { color: theme.colors.textSecondary }]}
                  >
                    Location
                  </Text>
                  <View
                    style={styles.mapPressable}
                  >
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: parseFloat(logDetails.latitude),
                        longitude: parseFloat(logDetails.longitude),
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }}

                    >
                      <Marker
                        coordinate={{
                          latitude: parseFloat(logDetails.latitude),
                          longitude: parseFloat(logDetails.longitude),
                        }}
                        title="Check-in Location"
                      />
                    </MapView>
                  </View>
                </View>
              ) : (
                <Text
                  style={[styles.noLocationText, { color: theme.colors.textSecondary }]}
                >
                  No location data available
                </Text>
              )}
            </ScrollView>
          )}
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
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "400",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
  },
  mapContainer: {
    marginTop: 15,
    marginBottom: 16,
    borderRadius: 12,
  },
  mapPressable: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 12,
  },
  openMapsText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  noLocationText: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default DetailsModal;
