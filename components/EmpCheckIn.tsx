import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";
import * as Location from "expo-location";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const EmployeeCheckInCheckOut = () => {
  // Types
  interface Log {
    name?: string;
    log_type: string;
    time: string;
  }

  interface LogDetails {
    name: string;
    time: string;
    log_type: string;
    latitude?: string;
    longitude?: string;
    employee?: string;
  }

  // Check-in/out state
  const [lastLog, setLastLog] = useState<Log | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [employee_field_value, setEmployeeFieldValue] = useState<string>("");

  // History state
  const [logList, setLogList] = useState<Log[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const { accessToken, isAuthenticated } = useAuthContext();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const isCheckedIn = lastLog?.log_type === "IN";

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/frappe.auth.get_logged_user`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      const userId = data.message;

      const userResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/User/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user details: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      setUserName(
        userData.data.full_name || userData.data.first_name || userId
      );

      const employeeResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Employee?filters=[["user_id","=","${userId}"]]`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!employeeResponse.ok) {
        throw new Error(
          `Failed to fetch employee data: ${employeeResponse.status}`
        );
      }

      const employeeData = await employeeResponse.json();
      const employeeId = employeeData.data?.[0]?.name;

      if (employeeId) {
        setEmployeeFieldValue(employeeId);
        fetchLastLog(employeeId);
        fetchLogList(employeeId);
      } else {
        console.warn("No linked employee found for this user.");
      }

      return userId;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileError("Failed to load user profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchLastLog = async (empId?: string) => {
    try {
      const employeeId = empId || employee_field_value;

      if (!employeeId) {
        console.error("Employee ID is missing while fetching last log.");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Employee Checkin?fields=["log_type","time"]&filters=[["employee","=","${employeeId}"]]&order_by=creation desc&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch last log: ${response.status}`);
      }

      const data = await response.json();
      setLastLog(data.data[0] || null);
    } catch (error) {
      console.error("Failed to fetch last log", error);
    }
  };

  const fetchLogList = async (empId?: string) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const employeeId = empId || employee_field_value;

      if (!employeeId) {
        console.error("Employee ID is missing while fetching logs.");
        setHistoryError("Employee ID is missing");
        setHistoryLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Employee Checkin?fields=["name","log_type","time"]&filters=[["employee","=","${employeeId}"]]&order_by=creation desc&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch log list: ${response.status}`);
      }

      const data = await response.json();
      setLogList(data.data || []);
    } catch (error) {
      console.error("Error fetching log list:", error);
      setHistoryError("Failed to load check-in history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchLogDetails = async (logId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Employee Checkin/${logId}`,
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
      setSelectedLog(data.data);
      setDetailsModalVisible(true);
    } catch (error) {
      console.error("Error fetching log details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Check-in/out functions
  const handleCheckInOut = async () => {
    setLoading(true);
    const logType = isCheckedIn ? "OUT" : "IN";

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setStatus("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const payload = {
        employee_field_value: employee_field_value,
        employee_fieldname: "employee",
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        device_id: "feet-on-street",
        log_type: logType,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        skip_auto_attendance: 0,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/hrms.hr.doctype.employee_checkin.employee_checkin.add_log_based_on_employee_field`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error (${response.status}): ${errorData}`);
      }

      setStatus(`${logType === "IN" ? "Check-in" : "Check-out"} successful!`);
      fetchLastLog();
      fetchLogList();
    } catch (error: any) {
      console.error("Check-in/out failed", error);
      setStatus(`Failed to log time: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // History view functions
  const renderLogItem = ({ item }: { item: Log }) => {
    const formattedDate = moment(item.time);
    const isToday = formattedDate.isSame(moment(), "day");
    const isYesterday = formattedDate.isSame(
      moment().subtract(1, "day"),
      "day"
    );

    let dateDisplay;
    if (isToday) {
      dateDisplay = formattedDate.format("hh:mm a");
    } else if (isYesterday) {
      dateDisplay = formattedDate.format("hh:mm a") + " yesterday";
    } else {
      dateDisplay =
        formattedDate.format("hh:mm a") +
        " on " +
        formattedDate.format("D MMM");
    }

    return (
      <TouchableOpacity
        style={[
          styles.logItem,
          { backgroundColor: theme.colors.surfacePrimary },
        ]}
        onPress={() => fetchLogDetails(item.name || "")}
      >
        <View style={styles.logItemContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.logDetails}>
            <Text
              style={[styles.logTypeText, { color: theme.colors.textPrimary }]}
            >
              Log Type: {item.log_type}
            </Text>
            <Text
              style={[
                styles.logTimeText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {dateDisplay}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textTertiary}
          />
        </View>
      </TouchableOpacity>
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

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserProfile();
    }
  }, [isAuthenticated, accessToken]);

  const nextAction = isCheckedIn ? "Check Out" : "Check In";

  return (
    <SafeAreaView>
      <View style={[styles.welcomeCard, { backgroundColor: theme.colors.surfacePrimary }]}>
        <View style={styles.welcomeContent}>
          {isLoadingProfile ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.buttonPrimary}
            />
          ) : profileError ? (
            <Text
              style={[styles.errorText, { color: theme.statusColors.error }]}
            >
              {profileError}
            </Text>
          ) : (
            <Text
              style={[styles.welcomeText, { color: theme.colors.textPrimary }]}
            >
              Hey, {userName || "User"} <Text style={styles.waveEmoji}>👋</Text>
            </Text>
          )}
          <View style={styles.lastLogContainer}>
            <Text
              style={[styles.lastText, { color: theme.colors.textSecondary }]}
            >
              {lastLog?.time
                ? isCheckedIn
                  ? `Last check-in was at ${moment(lastLog?.time).format(
                      "hh:mm a"
                    )} today`
                  : `Last check-out was at ${moment(lastLog?.time).format(
                      "hh:mm a"
                    )}`
                : "No check-in/out history found."}
            </Text>
            <Text
              style={[styles.lastText, { color: theme.colors.textSecondary }]}
            >
              {" "}
              ·{" "}
            </Text>
            <TouchableOpacity
              onPress={() => setHistoryModalVisible(true)}
            >
              <Text
                style={[styles.linkText, { color: theme.colors.buttonPrimary }]}
              >
                View List
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {location && (
          <Text
            style={[styles.locationText, { color: theme.colors.textSecondary }]}
          >
            Lat: {location.latitude.toFixed(5)}, Lng:{" "}
            {location.longitude.toFixed(5)}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleCheckInOut}
          disabled={loading}
          style={[
            styles.button,
            { backgroundColor: theme.colors.buttonPrimary },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={[styles.buttonText, { color: theme.colors.textInverted }]}>{nextAction}</Text>
              <Ionicons name={isCheckedIn ? "log-out-outline" : "log-in-outline"} size={18} color={theme.colors.textInverted} />
            </View>
          )}
        </TouchableOpacity>

        {status !== "" && (
          <Text
            style={[styles.statusText, { color: theme.colors.textTertiary }]}
          >
            {status}
          </Text>
        )}
      </View>

      {/* History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => {
          setHistoryModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.surfacePrimary },
            ]}
          >
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalHandleBar}
                onPress={() => setHistoryModalVisible(false)}
              />
              <Text
                style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
              >
                Check-in History
              </Text>
            </View>

            {historyLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
              </View>
            ) : historyError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: theme.statusColors.error }]}>
                  {historyError}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.retryButton,
                    { backgroundColor: theme.colors.buttonPrimary },
                  ]}
                  onPress={() => {
                    setHistoryLoading(true);
                    setHistoryError(null);
                    fetchLogList();
                  }}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={logList}
                renderItem={renderLogItem}
                keyExtractor={(item, index) => item.name || index.toString()}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: theme.colors.border },
                    ]}
                  />
                )}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text
                      style={[
                        styles.emptyText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      No check-in records found
                    </Text>
                  </View>
                )}
                refreshing={historyLoading}
                onRefresh={() => {
                  setHistoryLoading(true);
                  fetchLogList();
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Employee Checkin Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => {
          setDetailsModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.surfacePrimary },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHandleBar} />
              <Text
                style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
              >
                Employee Checkin
              </Text>
            </View>

            {loadingDetails ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.buttonPrimary}
                />
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
                    {selectedLog?.name || ""}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Date
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {selectedLog?.time ? formatDate(selectedLog.time) : ""}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Time
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {selectedLog?.time ? formatTime(selectedLog.time) : ""}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Latitude
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {selectedLog?.latitude || "N/A"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Longitude
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {selectedLog?.longitude || "N/A"}
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.bottomHandle}>
              <Pressable
                style={styles.bottomHandleBar}
                onPress={() => setDetailsModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  welcomeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeContent: {
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
  },
  waveEmoji: {
    fontSize: 20,
  },
  lastLogContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  lastText: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
  },
  statusText: {
    marginTop: 12,
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  // List styles
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logItem: {
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 6,
  },
  logItemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  logDetails: {
    flex: 1,
  },
  logTypeText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  logTimeText: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginLeft: 48,
    opacity: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  // Modal styles
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
  bottomHandle: {
    alignItems: "center",
    paddingVertical: 16,
  },
  bottomHandleBar: {
    width: 120,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
  },
});

export default EmployeeCheckInCheckOut;