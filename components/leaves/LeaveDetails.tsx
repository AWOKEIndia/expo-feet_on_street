import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import moment from "moment";

interface LeaveDetails {
  name?: string;
  leave_application_id?: string;
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  total_leave_days?: number;
  employee?: string;
  employee_name?: string;
  leave_balance?: number;
  status?: string;
  reason?: string;
}

interface LeaveDetailsModalProps {
  visible: boolean;
  leaveId: string | null;
  accessToken: string;
  onClose: () => void;
  theme: any;
}

const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({
  visible,
  leaveId,
  accessToken,
  onClose,
  theme,
}) => {
  const [leaveDetails, setLeaveDetails] = useState<LeaveDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && leaveId) {
      fetchLeaveDetails(leaveId);
    } else if (!visible) {
      setLeaveDetails(null);
      setError(null);
    }
  }, [visible, leaveId]);

  const fetchLeaveDetails = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_leave_applications/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee: "HR-EMP-00001",
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch leave details: ${response.status}`);
      }
      const data = await response.json();

      console.log(data.message);

      setLeaveDetails(data.message[0]);
    } catch (error: any) {
      console.error("Error fetching leave details:", error);
      setError(error.message || "Failed to load leave details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = moment(dateString);
    return date.format("D MMM YYYY");
  };

  const formatDateRange = (fromDate?: string, toDate?: string) => {
    if (!fromDate || !toDate) return "N/A";

    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
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
              Leave Application
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.brandColors.primary}
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
                onPress={() => leaveId && fetchLeaveDetails(leaveId)}
              >
                <Text
                  style={[
                    styles.retryButtonText,
                    { color: theme.colors.textInverted },
                  ]}
                >
                  Retry
                </Text>
              </TouchableOpacity>
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
                  {leaveDetails?.name || "N/A"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Leave Type
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {leaveDetails?.leave_type || "N/A"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Leave Dates
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {formatDateRange(
                    leaveDetails?.from_date,
                    leaveDetails?.to_date
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
                  Total Leave Days
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {leaveDetails?.total_leave_days || "0"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Employee
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {leaveDetails?.employee_name || "N/A"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Leave Balance
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {leaveDetails?.leave_balance || "0"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Status
                </Text>
                <View style={styles.statusContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: theme.colors.textInverted,
                        backgroundColor:
                          leaveDetails?.status === "Open"
                            ? theme.statusColors.pending
                            : leaveDetails?.status === "Approved"
                            ? theme.statusColors.success
                            : theme.statusColors.error,
                      },
                    ]}
                  >
                    {leaveDetails?.status || "Pending"}
                  </Text>
                </View>
              </View>

              <View style={styles.reasonContainer}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Reason
                </Text>
                <View style={styles.reasonBox}>
                  <Text
                    style={[
                      styles.reasonText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {leaveDetails?.reason || "No reason provided"}
                  </Text>
                </View>
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

export default LeaveDetailsModal;
