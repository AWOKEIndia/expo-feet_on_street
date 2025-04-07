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
import axios from "axios";
import moment from "moment";

const API_BASE_URL = "http://172.25.13.25:8000";
const EMPLOYEE_NAME = "John Doe";

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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [userName, setUserName] = useState(EMPLOYEE_NAME);

  // Determine if the user is checked in based on last log
  const isCheckedIn = lastLog?.log_type === "IN";

  const theme = {
    card: "#ffffff",
    text: "#000000",
    textSecondary: "#6b7280",
    primary: "#3b82f6",
  };

  const fetchLastLog = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/checkins?employee=${userName}`
      );
      setLastLog(response.data[0]);
    } catch (error) {
      console.error("Failed to fetch last log", error);
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
        employee: userName,
        log_type: logType,
        time: moment().format("YYYY-MM-DD HH:mm:ss"),
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      await axios.post(`${API_BASE_URL}/api/checkins`, payload);
      setStatus(`${logType === "IN" ? "Check-in" : "Check-out"} successful!`);
      fetchLastLog();
    } catch (error) {
      console.error("Check-in/out failed", error);
      setStatus("Failed to log time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastLog();
  }, []);

  const nextAction = isCheckedIn ? "Check Out" : "Check In";

  return (
    <View style={[styles.welcomeCard, { backgroundColor: theme.card }]}>
      <View style={styles.welcomeContent}>
        {isLoadingProfile ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : profileError ? (
          <Text style={[styles.errorText, { color: "#FF3B30" }]}>
            {profileError}
          </Text>
        ) : (
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            Hey, {userName || "User"} <Text style={styles.waveEmoji}>👋</Text>
          </Text>
        )}
        <Text style={[styles.lastText, { color: theme.textSecondary }]}>
          {isCheckedIn
            ? `Last check-in was at ${moment(lastLog?.time).format(
                "hh:mm a"
              )} today`
            : `Last check-out was at ${moment(lastLog?.time).format(
                "hh:mm a"
              )} ${
                moment(lastLog?.time).isSame(moment(), "day")
                  ? "today"
                  : "yesterday"
              }`}
        </Text>
      </View>

      {location && (
        <Text style={[styles.locationText, { color: theme.textSecondary }]}>
          Lat: {location.latitude.toFixed(5)}, Lng:{" "}
          {location.longitude.toFixed(5)}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleCheckInOut}
        disabled={loading}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{nextAction}</Text>
        )}
      </TouchableOpacity>

      {status !== "" && <Text style={styles.statusText}>{status}</Text>}

      <TouchableOpacity
        onPress={() => Linking.openURL(`${API_BASE_URL}/employee-checkin-list`)}
      >
        <Text style={styles.linkText}>View Check-In List</Text>
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
    backgroundColor: "#3b82f6",
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
    color: "#6b7280",
  },
  linkText: {
    marginTop: 16,
    fontSize: 14,
    color: "#3b82f6",
    textDecorationLine: "underline",
  },
});

export default CheckInCheckOut;
