import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import moment from "moment";
import {AttendanceRequest } from "@/hooks/useAttendanceRequest";

interface AttendanceDetailsModalProps {
  attendanceId: string | null;
  visible: boolean;
  attendanceDetails: AttendanceRequest | null;
  onClose: () => void;
  theme: any;
  calculateDays: (fromDate: string, toDate: string) => number;
  loading?: boolean;
}

const AttendanceDetailsModal: React.FC<AttendanceDetailsModalProps> = ({
  visible,
  attendanceDetails,
  onClose,
  theme,
  calculateDays,
  loading = false,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = moment(dateString);
    return date.format("D MMM YYYY");
  };

  const formatDateRange = (fromDate?: string, toDate?: string) => {
    if (!fromDate || !toDate) return "N/A";
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  const getTotalDays = () => {
    if (!attendanceDetails?.from_date || !attendanceDetails?.to_date) return "N/A";
    return `${calculateDays(attendanceDetails.from_date, attendanceDetails.to_date)} days`;
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
              Attendance Request
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.brandColors.primary}
              />
            </View>
          ) : !attendanceDetails ? (
            <View style={styles.errorContainer}>
              <Text
                style={[styles.errorText, { color: theme.statusColors.error }]}
              >
                Attendance details not available
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  ID
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {attendanceDetails.name || "N/A"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Type
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {attendanceDetails.reason || "N/A"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Request Dates
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {formatDateRange(
                    attendanceDetails.from_date,
                    attendanceDetails.to_date
                  )}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Total Days
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {getTotalDays()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Shift
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {attendanceDetails.shift || "N/A"}
                </Text>
              </View>

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
    fontWeight: "800",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  reasonContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  reasonBox: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 12,
  },
  reasonText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AttendanceDetailsModal;
