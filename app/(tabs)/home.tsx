import EmployeeAdvanceForm from "@/components/advanceForm/EmployeeAdvanceForm";
import AttendanceRequestForm from "@/components/attendance/attendanceRequest/AttendanceRequestForm";
import EmpCheckIn from "@/components/EmployeeCheckIn/EmpCheckIn";
import ExpenseClaimForm from "@/components/expenseClaim/ExpenseClaimForm";
import LeaveRequestForm from "@/components/leaves/LeaveRequests/LeaveRequestForm";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

const quickLinks = [
  { title: 'Request Attendance', path: '/app/attendance-request/new', icon: 'document-text-outline' },
  { title: 'Request a Shift', path: '/app/shift-request/new', icon: 'time-outline' },
  { title: 'Request Leave', path: '/app/leave-application/new', icon: 'calendar-outline' },
  { title: 'Claim an Expense', path: '/app/expense-claim/new', icon: 'cash-outline' },
  { title: 'Request an Advance', path: '/app/salary-advance/new', icon: 'cash-outline' },
  { title: 'View Salary Slips', path: '/app/salary-slip', icon: 'document-text-outline' },
];

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showLeaveRequestForm, setShowLeaveRequestForm] = useState(false);
  const [showExpenseClaimForm, setShowExpenseClaimForm] = useState(false);
  const [showEmployeeAdvanceForm, setShowEmployeeAdvanceForm] = useState(false);

  const openLink = async (path: string, title?: string) => {
    if (title === "Request Attendance") {
      setShowRequestForm(true);
      return;
    }
    if (title === "Request Leave") {
      setShowLeaveRequestForm(true);
      return;
    }
    if (title === "Claim an Expense") {
      setShowExpenseClaimForm(true);
      return;
    }
    if (title === "Request an Advance") {
      setShowEmployeeAdvanceForm(true);
      return;
    }
    // For other links, open in browser as before
    const fullUrl = `${process.env.EXPO_PUBLIC_BASE_URL}${path}`;
    try {
      const url = new URL(fullUrl);
      await WebBrowser.openBrowserAsync(url.toString(), {
        toolbarColor: theme.colors.background,
        controlsColor: theme.brandColors.primary,
        dismissButtonStyle: "cancel",
        showTitle: true,
        enableBarCollapsing: true,
        readerMode: false,
      });
    } catch {
      alert(`Don't know how to open this URL: ${fullUrl}`);
    }
  };

  const handleAttendanceRequestSubmit = (data: any) => {
    console.log("Attendance request submitted:", data);
    setShowRequestForm(false);
  };

  const handleLeaveRequestSubmit = (data: any) => {
    console.log("Leave request submitted:", data);
    setShowLeaveRequestForm(false);
  };

  const handleExpenseClaimSubmit = (data: any) => {
    console.log("Expense claim submitted:", data);
    setShowExpenseClaimForm(false);
  };

  const handleEmployeeAdvanceSubmit = (data: any) => {
    console.log("Employee advance submitted:", data);
    setShowEmployeeAdvanceForm(false);
  };

  // @ts-expect-error
  const QuickLinkItem = ({ icon, title, onPress }) => (
    <TouchableOpacity
      style={[styles.quickLinkItem, { borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.quickLinkContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={theme.colors.textPrimary} />
        </View>
        <Text
          style={[styles.quickLinkText, { color: theme.colors.textPrimary }]}
        >
          {title}
        </Text>
      </View>
      <View style={styles.chevronContainer}>
        <Ionicons
          name="chevron-forward-outline"
          size={18}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <EmpCheckIn />

        {/* Main Action Buttons - Session Report & Camera */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[
              styles.sessionReportButton,
              { backgroundColor: theme.colors.buttonPrimary },
            ]}
            onPress={() => router.push("/session/create")}
          >
            <Text
              style={[
                styles.sessionReportText,
                { color: theme.colors.textInverted },
              ]}
            >
              Session Report
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cameraButton,
              {
                backgroundColor: theme.colors.surfacePrimary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push("/session/camera")}
          >
            <Ionicons
              name="camera"
              size={20}
              color={theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.cameraButtonText,
                { color: theme.colors.textPrimary },
              ]}
            >
              Camera
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create Outcome Report Button */}
        <TouchableOpacity
          style={[
            styles.outcomeReportButton,
            {
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.outcomeReportText,
              { color: theme.colors.textPrimary },
            ]}
          >
            Create Outcome Report
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Quick Links
          </Text>
          {quickLinks.map((link) => (
            <QuickLinkItem
              key={link.title}
              icon={link.icon}
              title={link.title}
              onPress={() => openLink(link.path, link.title)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Attendance Request Form Modal */}
      <Modal
        isVisible={showRequestForm}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.5}
        style={{ margin: 0, justifyContent: "flex-end" }}
        onBackdropPress={() => setShowRequestForm(false)}
        onBackButtonPress={() => setShowRequestForm(false)}
      >
        <AttendanceRequestForm
          onSubmit={handleAttendanceRequestSubmit}
          onCancel={() => setShowRequestForm(false)}
        />
      </Modal>

      {/* Leave Request Form Modal */}
      <Modal
        isVisible={showLeaveRequestForm}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.5}
        style={{ margin: 0, justifyContent: "flex-end" }}
        onBackdropPress={() => setShowLeaveRequestForm(false)}
        onBackButtonPress={() => setShowLeaveRequestForm(false)}
      >
        <LeaveRequestForm
          onSubmit={handleLeaveRequestSubmit}
          onCancel={() => setShowLeaveRequestForm(false)}
        />
      </Modal>

      {/* Expense Claim Form Modal */}
      <Modal
        isVisible={showExpenseClaimForm}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.5}
        style={{ margin: 0, justifyContent: "flex-end" }}
        onBackdropPress={() => setShowExpenseClaimForm(false)}
        onBackButtonPress={() => setShowExpenseClaimForm(false)}
      >
        <ExpenseClaimForm
          onSubmit={handleExpenseClaimSubmit}
          onCancel={() => setShowExpenseClaimForm(false)}
        />
      </Modal>

      {/* Employee Advance Form Modal */}
      <Modal
        isVisible={showEmployeeAdvanceForm}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.5}
        style={{ margin: 0, justifyContent: "flex-end" }}
        onBackdropPress={() => setShowEmployeeAdvanceForm(false)}
        onBackButtonPress={() => setShowEmployeeAdvanceForm(false)}
      >
        <EmployeeAdvanceForm
          onSubmit={handleEmployeeAdvanceSubmit}
          onCancel={() => setShowEmployeeAdvanceForm(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
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
    fontWeight: "600",
    marginBottom: 6,
  },
  waveEmoji: {
    fontSize: 18,
  },
  lastText: {
    fontSize: 14,
  },
  checkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
  },
  checkIcon: {
    marginRight: 8,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sessionReportButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionReportText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cameraButton: {
    width: "30%",
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  outcomeReportButton: {
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: "#ffffff",
  },
  outcomeReportText: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333333",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statsHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333333",
  },
  authDataContainer: {
    paddingHorizontal: 8,
  },
  authDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  tokenText: {
    fontFamily: "SpaceMono",
    fontSize: 12,
    color: "#333333",
  },
  attendanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendanceStats: {
    flexDirection: "row",
    flex: 2,
    justifyContent: "space-between",
    paddingRight: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
  },
  completionContainer: {
    flex: 1,
    alignItems: "center",
  },
  completionOuterCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 8,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderLeftColor: "#4169e1",
    transform: [{ rotate: "45deg" }],
  },
  completionInnerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "-45deg" }],
  },
  completionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  completionLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  chartContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  chart: {
    borderRadius: 8,
  },
  chartSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  activityCard: {
    flexDirection: "row",
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
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    justifyContent: "center",
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  activityTime: {
    fontSize: 12,
    color: "#757575",
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
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerItemActive: {
    borderTopWidth: 2,
    borderTopColor: "#4169e1",
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  quickLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.2,
  },
  quickLinkContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickLinkText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: "500",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
