import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BarChart, LineChart } from "react-native-chart-kit";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import EmpCheckIn from "@/components/EmpCheckIn";

export default function HomeScreen() {
  const { logout, accessToken, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [userName, setUserName] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Theme colors>
  const theme = {
    background: "#f5f7fa",
    card: "#ffffff",
    text: "#333333",
    textSecondary: "#757575",
    border: "#e0e0e0",
    primary: "#4169e1", // Royal blue
    buttonText: "#ffffff",
    iconGray: "#8a8a8a",
    chartGreen: "#4caf50",
    chartOrange: "#ff9800",
  };

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserProfile();
    }
  }, [isAuthenticated, accessToken]);

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

      if (data.message) {
        // Now fetch the user details
        const userResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/User/${data.message}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error(
            `Failed to fetch user details: ${userResponse.status}`
          );
        }

        const userData = await userResponse.json();
        setUserName(
          userData.data.full_name || userData.data.first_name || data.message
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileError("Failed to load user profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleCheckInOut = () => {
    setIsCheckedIn(!isCheckedIn);
  };

  // Static chart data for session reports
  const sessionReportData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        data: [3, 2, 4, 1, 3],
      },
    ],
  };

  // Static chart data for outcomes
  const outcomeData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [5, 8, 6, 9],
        color: () => theme.chartGreen,
      },
    ],
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: () => theme.primary,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  };

  const screenWidth = Dimensions.get("window").width - 40;

  // Function to truncate the token for display
  // @ts-expect-error
  const truncateToken = (token) => {
    if (!token) return "Not available";
    if (token.length <= 20) return token;
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >


        <View>
          <EmpCheckIn />
        </View>

        {/* Main Action Buttons - Session Report & Camera */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[
              styles.sessionReportButton,
              { backgroundColor: theme.primary }
            ]}
          >
            <Text style={[styles.sessionReportText, { color: theme.buttonText }]}>
              Session Report
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cameraButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.border
              }
            ]}
          >
            <Icon name="camera-alt" size={20} color={theme.text} />
            <Text style={[styles.cameraButtonText, { color: theme.text }]}>Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Create Outcome Report Button */}
        <TouchableOpacity
          style={[
            styles.outcomeReportButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border
            }
          ]}
        >
          <Text style={[styles.outcomeReportText, { color: theme.text }]}>
            Create Outcome Report
          </Text>
        </TouchableOpacity>

        {/* Authentication Status Card */}
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <View style={styles.statsHeader}>
            <Icon name="security" size={22} color={theme.primary} />
            <Text style={styles.statsHeaderText}>Authentication Status</Text>
          </View>

          <View style={styles.authDataContainer}>
            <View style={styles.authDataRow}>
              <Text style={[styles.statLabel, { fontWeight: '600' }]}>Status:</Text>
              <Text
                style={{
                  color: isAuthenticated ? theme.chartGreen : "#FF3B30",
                  fontWeight: "bold",
                }}
              >
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Text>
            </View>

            <View style={styles.authDataRow}>
              <Text style={[styles.statLabel, { fontWeight: '600' }]}>Access Token:</Text>
              <Text style={styles.tokenText}>{truncateToken(accessToken)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
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
    fontWeight: '600',
    marginBottom: 6,
  },
  waveEmoji: {
    fontSize: 18,
  },
  lastText: {
    fontSize: 14,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
  },
  checkIcon: {
    marginRight: 8,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sessionReportButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionReportText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cameraButton: {
    width: '30%',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  outcomeReportButton: {
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  outcomeReportText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333333',
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333333',
  },
  authDataContainer: {
    paddingHorizontal: 8,
  },
  authDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  tokenText: {
    fontFamily: "SpaceMono",
    fontSize: 12,
    color: "#333333",
  },
  attendanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceStats: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
  },
  completionContainer: {
    flex: 1,
    alignItems: 'center',
  },
  completionOuterCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 8,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftColor: '#4169e1',
    transform: [{ rotate: '45deg' }],
  },
  completionInnerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  completionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  completionLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  chartContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  chartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  activityCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  activityTime: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  logoutContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#4169e1',
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
