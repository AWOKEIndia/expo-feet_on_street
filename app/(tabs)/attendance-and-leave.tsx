import AttendanceDetailsModal from "@/components/attendance/AttendanceDetails";
import AttendanceView from "@/components/attendance/AttendanceView";
import LeaveBalance from "@/components/leaves/LeaveBalance";
import LeaveDetailsModal from "@/components/leaves/LeaveDetails";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import useAttendance from "@/hooks/useAttendance";
import useAttendanceRequests from "@/hooks/useAttendanceRequest";
import useHolidays from "@/hooks/useHolidays";
import useLeaveBalance from "@/hooks/useLeaveBalance";
import useLeaveApplications from "@/hooks/useLeaves";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type ActivityType = {
  name: string;
  type: "attendance" | "leave";
  category: string;
  date: string;
  duration: string;
  status: string;
  id: string;
};

type Holiday = {
  description: string;
  holiday_date: string;
};

const AttendanceAndLeavesScreen = () => {
  const { theme, isDark } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedAttendanceId, setSelectedAttendanceId] = useState<
    string | null
  >(null);
  const [isAttendanceModalVisible, setIsAttendanceModalVisible] =
    useState(false);

  // State for holiday modal
  const [isHolidayModalVisible, setIsHolidayModalVisible] = useState(false);
  const [employeeId, setEmployeeId] = useState("");

  useEffect(() => {
    setEmployeeId(employeeProfile?.name as string);
  }, [employeeProfile]);

  const attendanceResource = useAttendance(accessToken ?? "", employeeId);
  const leaveResource = useLeaveApplications(accessToken ?? "", employeeId);
  const attendanceRequestResource = useAttendanceRequests(
    accessToken ?? "",
    employeeId
  );
  const leaveBalanceResource = useLeaveBalance(accessToken ?? "", employeeId);
  const holidaysResource = useHolidays(accessToken ?? "", employeeId);

  const leaveBalances = useMemo(() => {
    const leaveTypeColors = {
      "Casual Leave": theme.statusColors.success,
      "Privilege Leave": theme.brandColors.primary,
      "Sick Leave": theme.statusColors.error,
      "Compensatory Off": theme.colors.textPrimary,
    };

    return leaveBalanceResource.data.map((balance) => ({
      type: balance.leave_type,
      used: balance.used_leaves,
      total: balance.total_leaves,
      color:
        leaveTypeColors[balance.leave_type as keyof typeof leaveTypeColors] ||
        theme.colors.textPrimary,
    }));
  }, [leaveBalanceResource.data, theme]);

  // Convert leave application data to activity format
  const leaveActivities = leaveResource.data.map((leave) => ({
    name: leave.name,
    id: leave.name,
    type: "leave" as const,
    category: leave.leave_type,
    date: formatDateRange(leave.from_date, leave.to_date),
    duration: `${leave.total_leave_days}d`,
    status: leave.status,
  }));

  // Convert attendance request data to activity format
  const attendanceActivities: ActivityType[] =
    attendanceRequestResource.data.map((request) => ({
      name: request.name,
      id: request.name,
      type: "attendance" as const,
      category: request.reason,
      date: formatDateRange(request.from_date, request.to_date),
      duration: `${attendanceRequestResource.calculateDays(
        request.from_date,
        request.to_date
      )}d`,
      status: request.status,
    }));

  // Function to format date range in a readable format
  function formatDateRange(fromDate: string, toDate: string): string {
    const from = dayjs(fromDate);
    const to = dayjs(toDate);

    if (from.isSame(to, "day")) {
      return from.format("D MMM");
    }

    if (from.isSame(to, "month")) {
      return `${from.format("D")} - ${to.format("D MMM")}`;
    }

    return `${from.format("D MMM")} - ${to.format("D MMM")}`;
  }

  // Function to handle the activity item click
  const handleActivityItemClick = (item: ActivityType) => {
    if (item.type === "leave") {
      setSelectedLeaveId(item.id);
      setIsModalVisible(true);
    } else if (item.type === "attendance") {
      setSelectedAttendanceId(item.id);
      attendanceRequestResource.selectAttendanceById?.(item.id);
      setIsAttendanceModalVisible(true);
    }
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedLeaveId(null);
  };

  const handleCloseAttendanceModal = () => {
    setIsAttendanceModalVisible(false);
    setSelectedAttendanceId(null);
    attendanceRequestResource.clearSelectedAttendance?.();
  };

  // Function to open the holiday modal
  const handleOpenHolidayModal = () => {
    setIsHolidayModalVisible(true);
  };

  // Function to close the holiday modal
  const handleCloseHolidayModal = () => {
    setIsHolidayModalVisible(false);
  };

  const TabButtons = () => (
    <View style={styles.tabButtonContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          {
            backgroundColor: isDark ? theme.colors.surfaceSecondary : "#f2f2f2",
          },
          activeTab === "attendance" && {
            backgroundColor: theme.brandColors.primary,
          },
          { borderRadius: 8, marginRight: 8 },
        ]}
        onPress={() => setActiveTab("attendance")}
      >
        <Text
          style={[
            styles.tabButtonText,
            {
              color: isDark
                ? theme.colors.textPrimary
                : theme.colors.textSecondary,
            },
            activeTab === "attendance" && { color: theme.colors.textInverted },
          ]}
        >
          Attendance
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          {
            backgroundColor: isDark ? theme.colors.surfaceSecondary : "#f2f2f2",
          },
          activeTab === "leaves" && {
            backgroundColor: theme.brandColors.primary,
          },
          { borderRadius: 8, marginLeft: 8 },
        ]}
        onPress={() => setActiveTab("leaves")}
      >
        <Text
          style={[
            styles.tabButtonText,
            {
              color: isDark
                ? theme.colors.textPrimary
                : theme.colors.textSecondary,
            },
            activeTab === "leaves" && { color: theme.colors.textInverted },
          ]}
        >
          Leaves
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderActivityItem = ({ item }: { item: ActivityType }) => {
    const getIconName = (type: string, category: string) => {
      if (type === "leave") {
        return "calendar-outline";
      } else if (category === "Work From Home") {
        return "home-outline";
      } else {
        return "briefcase-outline";
      }
    };

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "approved":
          return theme.statusColors.success;
        case "rejected":
          return theme.statusColors.error;
        case "pending":
          return theme.statusColors.warning;
        case "submitted":
          return theme.statusColors.success;
        case "draft":
          return theme.colors.textInfo;
        case "cancelled":
          return theme.statusColors.error;
        default:
          return theme.statusColors.info;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.activityItem,
          {
            backgroundColor: theme.colors.surfacePrimary,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.22 : 0.15,
                shadowRadius: 2,
              },
              android: {
                elevation: 2,
              },
            }),
          },
        ]}
        onPress={() => handleActivityItemClick(item)}
      >
        <View
          style={[
            styles.activityIconContainer,
            {
              backgroundColor: isDark
                ? theme.colors.surfaceSecondary
                : "#f2f2f2",
            },
          ]}
        >
          <Ionicons
            name={getIconName(item.type, item.category)}
            size={20}
            color={theme.colors.iconSecondary}
          />
        </View>
        <View style={styles.activityDetails}>
          <Text
            style={[
              styles.activityCategory,
              { color: theme.colors.textPrimary },
            ]}
          >
            {item.category}
          </Text>
          <Text
            style={[styles.activityDate, { color: theme.colors.textSecondary }]}
          >
            {item.date} · {item.duration}
          </Text>
        </View>
        <View
          style={[
            styles.activityStatus,
            {
              backgroundColor: getStatusColor(item.status) + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.activityStatusText,
              {
                color: getStatusColor(item.status),
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.iconSecondary}
        />
      </TouchableOpacity>
    );
  };

  const RecentActivitySection = () => {
    const currentActivities =
      activeTab === "attendance" ? attendanceActivities : leaveActivities;

    const isLoading =
      activeTab === "leaves"
        ? leaveResource.loading
        : activeTab === "attendance"
        ? attendanceRequestResource.loading
        : false;

    return (
      <View style={styles.recentActivitySection}>
        <View style={styles.sectionTitleContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Recent {activeTab === "attendance" ? "Attendance" : "Leave"}{" "}
            Requests
          </Text>

          {/* Only show the holiday button when on the leaves tab */}
          {activeTab === "leaves" && (
            <TouchableOpacity
              style={[
                styles.holidayButton,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.1)",
                },
              ]}
              onPress={handleOpenHolidayModal}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.holidayButtonText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                View Holidays
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.brandColors.primary} />
          </View>
        ) : (
          <View style={styles.activityListContent}>
            {currentActivities.length > 0 ? (
              currentActivities.map((item) => (
                <View key={`${item.type}-${item.id}`}>
                  {renderActivityItem({ item })}
                </View>
              ))
            ) : (
              <Text
                style={[
                  styles.emptyListText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No recent {activeTab} requests found
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  // Holiday list item renderer
  const renderHolidayItem = ({ item }: { item: Holiday }) => {
    const holidayDate = dayjs(item.holiday_date);
    const formattedDate = `${holidayDate.format("ddd")}, ${holidayDate.format(
      "D MMM YYYY"
    )}`;

    return (
      <View
        style={[
          styles.holidayItem,
          {
            borderBottomColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={24}
          color={isDark ? theme.colors.textSecondary : "#888"}
        />
        <View style={styles.holidayDetails}>
          <Text
            style={[styles.holidayName, { color: theme.colors.textPrimary }]}
          >
            {item.description}
          </Text>
        </View>
        <Text
          style={[styles.holidayDate, { color: theme.colors.textSecondary }]}
        >
          {formattedDate}
        </Text>
      </View>
    );
  };

  // Holiday Modal Component
  const HolidayModal = () => (
    <Modal
      visible={isHolidayModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseHolidayModal}
    >
      <TouchableWithoutFeedback onPress={handleCloseHolidayModal}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surfacePrimary },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
                >
                  Holiday List
                </Text>
              </View>

              <View style={styles.modalDragIndicator} />

              {holidaysResource.loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={theme.brandColors.primary}
                  />
                </View>
              ) : holidaysResource.data.length > 0 ? (
                <FlatList
                  data={holidaysResource.data.sort(
                    (a, b) =>
                      dayjs(a.holiday_date).valueOf() -
                      dayjs(b.holiday_date).valueOf()
                  )}
                  renderItem={renderHolidayItem}
                  keyExtractor={(item) => item.name}
                  contentContainerStyle={styles.holidayListContent}
                  refreshControl={
                    <RefreshControl
                      refreshing={holidaysResource.refreshing}
                      onRefresh={holidaysResource.refresh}
                      colors={[theme.brandColors.primary]}
                      tintColor={theme.brandColors.primary}
                    />
                  }
                />
              ) : (
                <Text
                  style={[
                    styles.emptyListText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  No holidays found
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TabButtons />

      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={
              activeTab === "attendance"
                ? attendanceRequestResource.refreshing
                : leaveResource.refreshing || leaveBalanceResource.refreshing
            }
            onRefresh={
              activeTab === "attendance"
                ? attendanceRequestResource.refresh
                : () => {
                    leaveResource.refresh();
                    leaveBalanceResource.refresh();
                  }
            }
            colors={[theme.brandColors.primary]}
            tintColor={theme.brandColors.primary}
          />
        }
      >
        {activeTab === "attendance" ? (
          <>
            <AttendanceView
              theme={theme}
              isDark={isDark}
              attendanceResource={attendanceResource}
            />
            <RecentActivitySection />
          </>
        ) : (
          <>
            <LeaveBalance
              theme={theme}
              isDark={isDark}
              leaveBalances={leaveBalances}
              loading={leaveBalanceResource.loading}
              refreshing={leaveBalanceResource.refreshing}
              refresh={leaveBalanceResource.refresh}
            />
            <RecentActivitySection />
          </>
        )}
      </ScrollView>

      <AttendanceDetailsModal
        visible={isAttendanceModalVisible}
        attendanceId={selectedAttendanceId}
        attendanceDetails={attendanceRequestResource.selectedAttendance}
        onClose={handleCloseAttendanceModal}
        theme={theme}
        loading={attendanceRequestResource.loading}
        calculateDays={attendanceRequestResource.calculateDays}
      />

      <LeaveDetailsModal
        visible={isModalVisible}
        leaveId={selectedLeaveId}
        employee={employeeId}
        accessToken={accessToken ?? ""}
        onClose={handleCloseModal}
        theme={theme}
      />

      {/* Holiday Modal */}
      <HolidayModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  tabButtonContainer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  recentActivitySection: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 8,
  },
  holidayButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 2,
    borderRadius: 6,
  },
  holidayButtonText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  activityListContent: {
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  activityIconContainer: {
    padding: 10,
    borderRadius: 8,
  },
  activityDetails: {
    flex: 1,
    marginLeft: 12,
  },
  activityCategory: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
  },
  activityStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyListText: {
    textAlign: "center",
    padding: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 6,
    maxHeight: "60%",
  },
  modalHeader: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 6,
  },
  modalDragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D0D0",
    alignSelf: "center",
  },
  holidayListContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  holidayItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  holidayDetails: {
    flex: 1,
    marginLeft: 16,
  },
  holidayName: {
    fontSize: 15,
    fontWeight: "800",
  },
  holidayDate: {
    fontSize: 14,
    textAlign: "right",
  },
});

export default AttendanceAndLeavesScreen;
