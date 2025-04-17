import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  RefreshControl,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import AttendanceView from "@/components/attendance/AttendanceView";
import useAttendance from "@/hooks/useAttendance";

type ActivityType = {
  id: string;
  type: "attendance" | "leave";
  category: string;
  date: string;
  duration: string;
  status: string;
};

const AttendanceAndLeavesScreen = () => {
  const { theme, isDark } = useTheme();
  const { accessToken } = useAuthContext();
  const [activeTab, setActiveTab] = useState("attendance");
  const scrollViewRef = useRef(null);

  const employeeId = "HR-EMP-00001";

  const attendanceResource = useAttendance(
    accessToken ?? "",
    employeeId
  );

  const leaveBalances = [
    {
      type: "Casual Leave",
      used: 1,
      total: 12,
      color: theme.statusColors.error,
    },
    {
      type: "Privilege Leave",
      used: 6.806,
      total: 15,
      color: theme.brandColors.primary,
    },
    {
      type: "Sick Leave",
      used: 7,
      total: 10,
      color: theme.statusColors.warning,
    },
    {
      type: "Compensatory Off",
      used: 4,
      total: 5,
      color: theme.colors.textPrimary,
    },
  ];

  const recentActivity: ActivityType[] = [
    {
      id: "1",
      type: "leave",
      category: "Casual Leave",
      date: "11 Mar",
      duration: "1d",
      status: "Approved",
    },
    {
      id: "2",
      type: "attendance",
      category: "Work From Home",
      date: "4 Mar",
      duration: "1d",
      status: "Submitted",
    },
    {
      id: "3",
      type: "leave",
      category: "Privilege Leave",
      date: "6 Feb - 7 Feb",
      duration: "2d",
      status: "Approved",
    },
    {
      id: "4",
      type: "attendance",
      category: "On Duty",
      date: "6 Jan",
      duration: "1d",
      status: "Submitted",
    },
  ];

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

  const LeaveBalanceCards = () => (
    <View style={[styles.leaveBalanceContainer, { paddingBottom: 8 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
        contentContainerStyle={{ paddingVertical: 6 }}
      >
        {leaveBalances.map((leave, index) => {
          const fillPercentage =
            leave.total > 0
              ? ((leave.total - leave.used) / leave.total) * 100
              : 0;
          const remainingLeaves = leave.total - leave.used;

          return (
            <View
              key={index}
              style={[
                styles.leaveBalanceCard,
                {
                  backgroundColor: theme.colors.surfacePrimary,
                  ...Platform.select({
                    ios: {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isDark ? 0.22 : 0.15,
                      shadowRadius: 3,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                },
              ]}
            >
              <View style={styles.leaveBalanceProgress}>
                <View style={styles.gaugeContainer}>
                  <View style={[styles.gaugeLabel, styles.startLabel]}>
                    <Text
                      style={[
                        styles.gaugeLabelText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      0
                    </Text>
                  </View>

                  <AnimatedCircularProgress
                    size={100}
                    width={8}
                    fill={fillPercentage}
                    tintColor={leave.color}
                    backgroundColor={
                      isDark ? theme.colors.surfaceSecondary : "#f0f0f0"
                    }
                    arcSweepAngle={240}
                    rotation={240}
                    lineCap="round"
                  >
                    {() => (
                      <View style={styles.gaugeTextContainer}>
                        <Text
                          style={[
                            styles.gaugeValueText,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          {remainingLeaves.toFixed(
                            remainingLeaves % 1 === 0 ? 0 : 1
                          )}
                        </Text>
                        <Text
                          style={[
                            styles.gaugeUnitText,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          left
                        </Text>
                      </View>
                    )}
                  </AnimatedCircularProgress>

                  <View style={[styles.gaugeLabel, styles.endLabel]}>
                    <Text
                      style={[
                        styles.gaugeLabelText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {leave.total}
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  styles.leaveBalanceType,
                  { color: theme.colors.textPrimary, marginTop: 12 },
                ]}
              >
                {leave.type}
              </Text>
              <Text
                style={[
                  styles.leaveBalanceDetails,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {leave.used.toFixed(leave.used % 1 === 0 ? 0 : 1)}/
                {leave.total.toFixed(leave.total % 1 === 0 ? 0 : 1)} used
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const RequestLeaveButton = () => (
    <View style={styles.requestButtonsContainer}>
      <TouchableOpacity
        style={[
          styles.requestButton,
          {
            backgroundColor: theme.colors.buttonPrimary,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
              },
              android: {
                elevation: 5,
              },
            }),
          },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={theme.colors.textInverted}
          style={styles.requestButtonIcon}
        />
        <Text
          style={[
            styles.requestButtonText,
            { color: theme.colors.textInverted },
          ]}
        >
          Request a Leave
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
              backgroundColor:
                item.status === "Approved"
                  ? theme.statusColors.success + "20"
                  : theme.statusColors.info + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.activityStatusText,
              {
                color:
                  item.status === "Approved"
                    ? theme.statusColors.success
                    : theme.statusColors.info,
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

  const RecentActivitySection = () => (
    <View style={styles.recentActivitySection}>
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.textPrimary, paddingHorizontal: 16 },
        ]}
      >
        Recent {activeTab === "attendance" ? "Attendance" : "Leave"} Requests
      </Text>
      <View style={styles.activityListContent}>
        {recentActivity
          .filter((item) => item.type === activeTab)
          .map((item) => (
            <View key={item.id}>{renderActivityItem({ item })}</View>
          ))}
        {recentActivity.filter((item) => item.type === activeTab).length ===
          0 && (
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
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TabButtons />

      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={attendanceResource.refreshing}
            onRefresh={attendanceResource.refresh}
            colors={[theme.brandColors.primary]}
            tintColor={theme.brandColors.primary}
          />
        }
      >
        {activeTab === "attendance" ? (
          <AttendanceView
            theme={theme}
            isDark={isDark}
            attendanceResource={attendanceResource}
            recentActivities={recentActivity.filter(
              (item) => item.type === "attendance"
            )}
          />
        ) : (
          <>
            <LeaveBalanceCards />
            <RequestLeaveButton />
            <RecentActivitySection />
          </>
        )}
      </ScrollView>
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
  leaveBalanceContainer: {
    paddingLeft: 16,
  },
  leaveBalanceCard: {
    width: 170,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  leaveBalanceProgress: {
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeLabel: {
    position: "absolute",
    top: 40,
  },
  startLabel: {
    left: -5,
  },
  endLabel: {
    right: -5,
  },
  gaugeLabelText: {
    fontSize: 12,
    fontWeight: "500",
  },
  gaugeTextContainer: {
    alignItems: "center",
  },
  gaugeValueText: {
    fontSize: 24,
    fontWeight: "600",
  },
  gaugeUnitText: {
    fontSize: 12,
  },
  leaveBalanceType: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  leaveBalanceDetails: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  requestButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  requestButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  requestButtonIcon: {
    marginRight: 8,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  recentActivitySection: {
    paddingTop: 12,
    paddingBottom: 16,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
});

export default AttendanceAndLeavesScreen;
