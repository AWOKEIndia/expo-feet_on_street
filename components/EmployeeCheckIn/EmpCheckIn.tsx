import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as Location from "expo-location";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import CheckInConfirmationModal from "./CheckInConfirmationModal";
import HistoryModal from "./HistoryModal";
import DetailsModal from "./DetailsModal";

const EmployeeCheckInCheckOut = () => {
  const [lastLog, setLastLog] = useState<{
    name?: string;
    log_type: string;
    time: string;
  } | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [employee_field_value, setEmployeeFieldValue] = useState<string>("");

  // Confirmation modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // History modal state
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Details modal state
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const { accessToken, isAuthenticated } = useAuthContext();
  const { theme } = useTheme();

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
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Employee Checkin?fields=["name","log_type","time"]&filters=[["employee","=","${employeeId}"]]&order_by=creation desc&limit=1`,
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

  const getCurrentLocation = async () => {
    setFetchingLocation(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({});
      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
    } catch (error: any) {
      console.error("Failed to get location", error);
      setLocationError(`Unable to fetch location: ${error.message}`);
      return null;
    } finally {
      setFetchingLocation(false);
    }
  };

  const initiateCheckInOut = async () => {
    if (isCheckedIn) {
      // For check-out, get location immediately
      setLoading(true);
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        handleCheckInOut();
      } else {
        setLoading(false);
      }
    } else {
      // For check-in, open modal to confirm
      setConfirmModalVisible(true);
    }
  };

  const handleCheckInOut = async () => {
    setLoading(true);
    const logType = isCheckedIn ? "OUT" : "IN";

    try {
      // If we're checking in, use the location from the modal
      // If we're checking out, use the location we just fetched
      const currentLocation = location || await getCurrentLocation();

      if (!currentLocation) {
        throw new Error("Location data is missing");
      }

      const payload = {
        employee_field_value: employee_field_value,
        employee_fieldname: "employee",
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        device_id: "feet-on-street",
        log_type: logType,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
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
      setConfirmModalVisible(false);
    } catch (error: any) {
      console.error("Check-in/out failed", error);
      setStatus(`Failed to log time: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLog = (logId: string) => {
    setSelectedLogId(logId);
    setDetailsModalVisible(true);
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserProfile();
    }
  }, [isAuthenticated, accessToken]);

  const nextAction = isCheckedIn ? "Check Out" : "Check In";

  return (
    <SafeAreaView>
      <View
        style={[
          styles.welcomeCard,
          { backgroundColor: theme.colors.surfacePrimary },
        ]}
      >
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
            <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
              <Text
                style={[styles.linkText, { color: theme.colors.buttonPrimary }]}
              >
                View List
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={initiateCheckInOut}
          disabled={isCheckedIn ? fetchingLocation || loading : false}
          style={[
            styles.button,
            { backgroundColor: theme.colors.buttonPrimary },
          ]}
        >
          {isCheckedIn && (fetchingLocation || loading) ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.colors.textInverted },
                ]}
              >
                {nextAction}
              </Text>
              <Ionicons
                name={isCheckedIn ? "log-out-outline" : "log-in-outline"}
                size={18}
                color={theme.colors.textInverted}
              />
            </View>
          )}
        </TouchableOpacity>

        {locationError && (
          <Text style={[styles.errorText, { color: theme.statusColors.error }]}>
            {locationError}
          </Text>
        )}

        {status !== "" && (
          <Text
            style={[styles.statusText, { color: theme.colors.textTertiary }]}
          >
            {status}
          </Text>
        )}
      </View>

      {/* Check-in Confirmation Modal */}
      <CheckInConfirmationModal
        visible={confirmModalVisible}
        loading={loading}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={(loc) => {
          setLocation(loc);
          handleCheckInOut();
        }}
        theme={theme}
      />

      {/* History Modal */}
      <HistoryModal
        visible={historyModalVisible}
        employee_id={employee_field_value}
        accessToken={accessToken || ""}
        onClose={() => setHistoryModalVisible(false)}
        theme={theme}
        onSelectLog={handleSelectLog}
      />

      {/* Details Modal */}
      <DetailsModal
        visible={detailsModalVisible}
        logId={selectedLogId}
        accessToken={accessToken || ""}
        onClose={() => setDetailsModalVisible(false)}
        theme={theme}
      />
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
});

export default EmployeeCheckInCheckOut;
