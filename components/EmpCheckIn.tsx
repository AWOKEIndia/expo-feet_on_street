import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import moment from "moment";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const CheckInCheckOut = () => {
  interface Log {
    log_type: string;
    time: string;
  }

  const [lastLog, setLastLog] = useState<Log | null>(null);
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [employee_field_value, setEmployeeFieldValue] = useState<string>("");
  const { accessToken, isAuthenticated } = useAuthContext();
  const { theme } = useTheme();

  const isCheckedIn = lastLog?.log_type === "IN";

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
        fetchLastLog(employeeId); // ✅ Trigger after setting employee ID
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
    } catch (error: any) {
      console.error("Check-in/out failed", error);
      setStatus(`Failed to log time: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserProfile();
    }
  }, [isAuthenticated, accessToken]);

  const nextAction = isCheckedIn ? "Check Out" : "Check In";

  return (
    <View
      style={[
        styles.welcomeCard,
        { backgroundColor: theme.colors.surfacePrimary },
      ]}
    >
      <View style={styles.welcomeContent}>
        {isLoadingProfile ? (
          <ActivityIndicator size="small" color={theme.colors.buttonPrimary} />
        ) : profileError ? (
          <Text style={[styles.errorText, { color: theme.statusColors.error }]}>
            {profileError}
          </Text>
        ) : (
          <Text
            style={[styles.welcomeText, { color: theme.colors.textPrimary }]}
          >
            Hey, {userName || "User"} <Text style={styles.waveEmoji}>👋</Text>
          </Text>
        )}
        <Text style={[styles.lastText, { color: theme.colors.textSecondary }]}>
          {lastLog?.time
            ? isCheckedIn
              ? `Last check-in was at ${moment(lastLog?.time).format(
                  "hh:mm a"
                )} today`
              : `Last check-out was at ${moment(lastLog?.time).format(
                  "hh:mm a"
                )} ${
                  moment(lastLog?.time).isSame(moment(), "day")
                    ? "today"
                    : "yesterday"
                }`
            : "No check-in/out history found."}
        </Text>
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
        style={[styles.button, { backgroundColor: theme.colors.buttonPrimary }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{nextAction}</Text>
        )}
      </TouchableOpacity>

      {status !== "" && (
        <Text style={[styles.statusText, { color: theme.colors.textTertiary }]}>
          {status}
        </Text>
      )}

      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            `${process.env.EXPO_PUBLIC_BASE_URL}/employee-checkin-list`
          )
        }
      >
        <Text style={[styles.linkText, { color: theme.colors.buttonPrimary }]}>
          View Check-In List
        </Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
  },
  waveEmoji: {
    fontSize: 20,
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
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusText: {
    marginTop: 12,
    fontSize: 14,
  },
  linkText: {
    marginTop: 16,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default CheckInCheckOut;
