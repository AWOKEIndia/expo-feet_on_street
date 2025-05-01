import AlertDialog from "@/components/AlertDialog";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

interface Attachment {
  name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  is_private: boolean;
}

interface LeaveDetailsModalProps {
  visible: boolean;
  leaveId: string | null;
  accessToken: string;
  employee: string;
  onClose: () => void;
  theme: any;
}

const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({
  visible,
  leaveId,
  accessToken,
  employee,
  onClose,
  theme,
}) => {
  const [leaveDetails, setLeaveDetails] = useState<LeaveDetails | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for custom alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertCallback, setAlertCallback] = useState<() => void>(() => {});

  // Custom alert function
  const showAlert = (title: string, message: string, callback?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    if (callback) {
      setAlertCallback(() => callback);
    } else {
      setAlertCallback(() => () => {});
    }
    setAlertVisible(true);
  };

  useEffect(() => {
    if (visible && leaveId) {
      fetchLeaveDetails(leaveId);
    } else if (!visible) {
      setLeaveDetails(null);
      setAttachments([]);
      setError(null);
    }
  }, [visible, leaveId]);

  const fetchLeaveDetails = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.api.get_leave_applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee: employee,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leave details: ${response.status}`);
      }

      const data = await response.json();
      const selectedLeave = data.message.find((leave: LeaveDetails) => leave.name === id);

      if (selectedLeave) {
        setLeaveDetails(selectedLeave);
        fetchAttachments(id);
      } else {
        setError("Leave details not found");
      }
    } catch (error: any) {
      console.error("Error fetching leave details:", error);
      setError(error.message || "Failed to load leave details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttachments = async (leaveId: string) => {
    setLoadingAttachments(true);
    try {
      // First, try to fetch using the Frappe client.get_list method
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/frappe.client.get_list`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctype: "File",
            fields: ["name", "file_name", "file_url", "file_size", "is_private", "file_type"],
            filters: [
              ["attached_to_doctype", "=", "Leave Application"],
              ["attached_to_name", "=", leaveId],
            ],
          }),
        }
      );

      if (!response.ok) {
        // If the primary method fails, try the alternative API endpoint
        return await fetchAttachmentsAlternative(leaveId);
      }

      const data = await response.json();
      if (data && data.message) {
        setAttachments(data.message.map((file: any) => ({
          name: file.file_name || "Unknown file",
          file_url: file.file_url,
          file_size: file.file_size,
          is_private: file.is_private === 1 || file.is_private === true,
          file_type: file.file_type,
        })));
      }
    } catch (error: any) {
      console.error("Error fetching attachments:", error);
      // Try alternative method if primary fails
      try {
        await fetchAttachmentsAlternative(leaveId);
      } catch (alternativeError) {
        console.error("Both attachment fetch methods failed:", alternativeError);
      }
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Alternative method to fetch attachments if the primary method fails
  const fetchAttachmentsAlternative = async (leaveId: string) => {
    try {
      // Try using the custom method or direct doc method
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/frappe.desk.form.load.get_attachments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctype: "Leave Application",
            name: leaveId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch attachments using alternative method: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.message) {
        setAttachments(data.message.map((file: any) => ({
          name: file.file_name || file.title || "Unknown file",
          file_url: file.file_url,
          file_size: file.file_size,
          is_private: file.is_private === 1 || file.is_private === true,
          file_type: file.file_type,
        })));
      }
    } catch (error: any) {
      console.error("Error fetching attachments with alternative method:", error);
      return [];
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

  // Format file size for display
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const openAttachment = async (url: string, isPrivate: boolean) => {
    try {
      // Show loading or alert user that download is starting
      showAlert("Download Started", "Downloading attachment...");

      // For both private and public files, construct the proper URL
      let downloadUrl;
      const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

      if (isPrivate) {
        // For private files, use the correct Frappe file download endpoint
        // Use the standard file download endpoint which requires authentication
        downloadUrl = `${baseUrl}/api/method/frappe.utils.file_manager.download_file?file_url=${encodeURIComponent(url)}`;
      } else {
        // For public files, we can open them directly
        downloadUrl = url.startsWith('http')
          ? url
          : `${baseUrl}${url}`;
      }

      // Try to open the URL
      const canOpen = await Linking.canOpenURL(downloadUrl);
      if (canOpen) {
        // For private files, we need to include the auth token in the request
        // This is typically done by setting headers in the fetch request
        if (isPrivate) {
          // Use fetch to download the file with authorization headers
          const response = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to download file: ${response.status}`);
          }

          // After successful fetch, open the URL (in a real app, you would handle the blob data)
          await Linking.openURL(downloadUrl);
        } else {
          // For public files, just open the URL directly
          await Linking.openURL(downloadUrl);
        }
      } else {
        showAlert("Error", "Cannot open this file type on your device");
      }
    } catch (error) {
      console.error("Error opening attachment:", error);
      showAlert("Error", "Failed to open or download attachment. Please try again.");
    }
  };

  return (
    <>
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

                {/* Reason Section - Fix for dark mode */}
                <View style={styles.reasonContainer}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Reason
                  </Text>
                  <View
                    style={[
                      styles.reasonBox,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: theme.colors.inputBorder,
                        borderWidth: 1,
                      },
                    ]}
                  >
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

                {/* Attachments Section */}
                <View style={styles.attachmentsContainer}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Attachments
                  </Text>

                  {loadingAttachments ? (
                    <View style={styles.loadingAttachmentsContainer}>
                      <ActivityIndicator
                        size="small"
                        color={theme.brandColors.primary}
                      />
                      <Text style={{ color: theme.colors.textSecondary, marginLeft: 8 }}>
                        Loading attachments...
                      </Text>
                    </View>
                  ) : attachments.length === 0 ? (
                    <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
                      No attachments found
                    </Text>
                  ) : (
                    <View style={styles.attachmentsList}>
                      {attachments.map((attachment, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.attachmentItem,
                            {
                              backgroundColor: theme.colors.surfaceSecondary,
                              borderColor: theme.colors.inputBorder,
                            },
                          ]}
                          onPress={() => openAttachment(attachment.file_url, attachment.is_private)}
                        >
                          <View style={styles.attachmentContent}>
                            <Ionicons
                              name={
                                attachment.file_type?.startsWith("image/")
                                  ? "image-outline"
                                  : "document-outline"
                              }
                              size={20}
                              color={theme.colors.iconSecondary}
                              style={{ marginRight: 10 }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{ color: theme.colors.textPrimary }}
                                numberOfLines={1}
                                ellipsizeMode="middle"
                              >
                                {attachment.name}
                              </Text>
                              {attachment.file_size && (
                                <Text
                                  style={{
                                    color: theme.colors.textSecondary,
                                    fontSize: 12,
                                    marginTop: 2,
                                  }}
                                >
                                  {formatFileSize(attachment.file_size)}
                                </Text>
                              )}
                            </View>
                            <Ionicons
                              name="open-outline"
                              size={20}
                              color={theme.brandColors.primary}
                            />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>

      <AlertDialog
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => {
          setAlertVisible(false);
          alertCallback();
        }}
        onDismiss={() => setAlertVisible(false)}
        theme={theme}
      />
    </>
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
    borderRadius: 12,
  },
  reasonText: {
    fontSize: 16,
    lineHeight: 24,
  },
  attachmentsContainer: {
    marginBottom: 24,
  },
  loadingAttachmentsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  attachmentsList: {
    marginTop: 8,
    gap: 8,
  },
  attachmentItem: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  attachmentContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default LeaveDetailsModal;
