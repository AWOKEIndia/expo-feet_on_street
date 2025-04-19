import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import AttendanceRequestForm from "./AttendanceRequestForm";
import Modal from "react-native-modal";

interface CalendarEventData {
  [date: string]: string;
}

type ActivityType = {
  id: string;
  type: "attendance" | "leave";
  category: string;
  date: string;
  duration: string;
  status: string;
};

interface AttendanceRequestData {
  fromDate: Date | null;
  toDate: Date | null;
  isHalfDay: boolean;
  includeHolidays: boolean;
  shift: string;
  reason: string;
  explanation: string;
}

interface AttendanceViewProps {
  theme: any;
  isDark: boolean;
  attendanceResource: {
    data: CalendarEventData;
    loading: boolean;
    refreshing: boolean;
    refresh: () => void;
    currentMonth: dayjs.Dayjs;
    previousMonth: () => void;
    nextMonth: () => void;
    setCurrentMonth: (month: dayjs.Dayjs) => void;
  };
}

const AttendanceView = ({
  theme,
  isDark,
  attendanceResource,
}: AttendanceViewProps) => {
  const [showRequestForm, setShowRequestForm] = useState(false);

  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    Object.entries(attendanceResource.data).forEach(([date, status]) => {
      let backgroundColor;
      if (status === "Present" || status === "Work From Home") {
        backgroundColor = theme.statusColors.success + "80";
      } else if (status === "Absent") {
        backgroundColor = theme.statusColors.error + "80";
      } else if (status === "Half Day") {
        backgroundColor = theme.statusColors.warning + "80";
      } else if (status === "On Leave") {
        backgroundColor = theme.brandColors.primary + "80";
      } else if (status === "Holiday") {
        backgroundColor = theme.colors.textDisabled + "80";
      }

      marked[date] = {
        customStyles: {
          container: { backgroundColor },
          text: { color: theme.colors.textPrimary },
        },
      };
    });

    return marked;
  }, [attendanceResource.data, theme]);

  const attendanceSummary = useMemo(() => {
    const summary = {
      present: 0,
      absent: 0,
      halfDay: 0,
      onLeave: 0,
    };

    Object.values(attendanceResource.data).forEach((status) => {
      if (status === "Present" || status === "Work From Home") {
        summary.present++;
      } else if (status === "Absent") {
        summary.absent++;
      } else if (status === "Half Day") {
        summary.halfDay++;
      } else if (status === "On Leave") {
        summary.onLeave++;
      }
    });

    return summary;
  }, [attendanceResource.data]);

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

  const AttendanceCalendar = () => (
    <View
      style={[
        styles.calendarContainer,
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
              elevation: 3,
            },
          }),
        },
      ]}
    >
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={attendanceResource.previousMonth}>
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.brandColors.primary}
          />
        </TouchableOpacity>

        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          {attendanceResource.currentMonth.format("MMMM YYYY")}
        </Text>

        <TouchableOpacity onPress={attendanceResource.nextMonth}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.brandColors.primary}
          />
        </TouchableOpacity>

        {attendanceResource.loading && (
          <ActivityIndicator size="small" color={theme.brandColors.primary} />
        )}
      </View>

      <Calendar
        current={attendanceResource.currentMonth.format("YYYY-MM-DD")}
        markingType={"custom"}
        markedDates={markedDates}
        onMonthChange={(month: { dateString: string }) => {
          attendanceResource.setCurrentMonth(dayjs(month.dateString).date(1));
        }}
        theme={{
          calendarBackground: theme.colors.surfacePrimary,
          textSectionTitleColor: theme.colors.textPrimary,
          selectedDayBackgroundColor: theme.brandColors.primary,
          selectedDayTextColor: theme.colors.textSecondary,
          todayTextColor: theme.brandColors.primary,
          dayTextColor: theme.colors.textPrimary,
          textDisabledColor: theme.colors.textDisabled,
          monthTextColor: theme.colors.textPrimary,
          arrowColor: theme.brandColors.primary,
          "stylesheet.calendar.header": {
            header: {
              flexDirection: "row",
              justifyContent: "center",
              paddingLeft: 10,
              paddingRight: 10,
              marginTop: 6,
              alignItems: "center",
              height: 0,
              opacity: 0,
            },
          },
        }}
        hideArrows={true}
        hideExtraDays={true}
        disableMonthChange={false}
        renderHeader={() => null}
      />

      <View
        style={[
          styles.attendanceSummary,
          { borderTopColor: isDark ? theme.colors.divider : "#e5e5e5" },
        ]}
      >
        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryDot,
              { backgroundColor: theme.statusColors.success + "80" },
            ]}
          >
            <Text
              style={[styles.summaryValue, { color: theme.colors.textPrimary }]}
            >
              {attendanceSummary.present}
            </Text>
          </View>
          <Text
            style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
          >
            Present
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryDot,
              { backgroundColor: theme.statusColors.warning + "80" },
            ]}
          >
            <Text
              style={[styles.summaryValue, { color: theme.colors.textPrimary }]}
            >
              {attendanceSummary.halfDay}
            </Text>
          </View>
          <Text
            style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
          >
            Half Day
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryDot,
              { backgroundColor: theme.statusColors.error + "80" },
            ]}
          >
            <Text
              style={[styles.summaryValue, { color: theme.colors.textPrimary }]}
            >
              {attendanceSummary.absent}
            </Text>
          </View>
          <Text
            style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
          >
            Absent
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryDot,
              { backgroundColor: theme.brandColors.primary + "80" },
            ]}
          >
            <Text
              style={[styles.summaryValue, { color: theme.colors.textPrimary }]}
            >
              {attendanceSummary.onLeave}
            </Text>
          </View>
          <Text
            style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
          >
            On Leave
          </Text>
        </View>
      </View>
    </View>
  );

  // Handler for form submission
  const handleAttendanceRequestSubmit = (data: AttendanceRequestData) => {
    // Process the form data here (e.g., send it to the API)
    console.log("Attendance request submitted:", data);

    // Close the form modal
    setShowRequestForm(false);

    // Optionally refresh the calendar data
    attendanceResource.refresh();
  };

  const RequestButton = () => (
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
        // Open the form modal when the button is clicked
        onPress={() => setShowRequestForm(true)}
      >
        <Ionicons
          name="briefcase-outline"
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
          Request Attendance
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <ScrollView
        style={styles.mainContainer}
        refreshControl={
          <RefreshControl
            refreshing={attendanceResource.refreshing}
            onRefresh={attendanceResource.refresh}
            colors={[theme.brandColors.primary]}
            tintColor={theme.brandColors.primary}
          />
        }
      >
        <AttendanceCalendar />
        <RequestButton />
      </ScrollView>

      {/* Modal for the Attendance Request Form */}
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
    </>
  );
};

// Import Platform for platform-specific styling
import { Platform } from "react-native";

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  calendarContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  attendanceSummary: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    marginTop: 8,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryLabel: {
    fontSize: 12,
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
    backgroundColor: "#f2f2f2",
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
});

export default AttendanceView;
