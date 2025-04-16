import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

const SCREEN_WIDTH = Dimensions.get('window').width;

type ActivityType = {
  id: string;
  type: 'attendance' | 'leave';
  category: string;
  date: string;
  duration: string;
  status: string;
};

const AttendanceAndLeavesScreen = () => {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('attendance');
  const scrollViewRef = useRef(null);

  // Calendar marked dates for attendance
  const markedDates = {
    '2025-04-01': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-02': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-03': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-04': { customStyles: { container: { backgroundColor: theme.statusColors.error + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-05': { customStyles: { container: { backgroundColor: theme.statusColors.error + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-07': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-08': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-09': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-10': { customStyles: { container: { backgroundColor: theme.statusColors.error + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-11': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-12': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-14': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-15': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textInverted } } },
    '2025-04-16': { customStyles: { container: { backgroundColor: theme.statusColors.error + '80' }, text: { color: theme.colors.textPrimary } } },
  };

  // Leave balances
  const leaveBalances = [
    { type: 'Casual Leave', used: 1, total: 1, color: theme.statusColors.error },
    { type: 'Compensatory Off', used: 0, total: 0, color: theme.colors.divider },
    { type: 'Privilege Leave', used: 6.806, total: 6.806, color: theme.brandColors.primary },
    { type: 'Sick Leave', used: 7, total: 7, color: theme.statusColors.error },
  ];

  // Recent activity data (combined attendance and leave requests)
  const recentActivity: ActivityType[] = [
    { id: '1', type: 'leave', category: 'Casual Leave', date: '11 Mar', duration: '1d', status: 'Approved' },
    { id: '2', type: 'leave', category: 'Casual Leave', date: '6 Mar', duration: '1d', status: 'Approved' },
    { id: '3', type: 'attendance', category: 'Work From Home', date: '4 Mar', duration: '1d', status: 'Submitted' },
    { id: '4', type: 'leave', category: 'Casual Leave', date: '20 Feb', duration: '1d', status: 'Approved' },
    { id: '5', type: 'attendance', category: 'Work From Home', date: '14 Feb - 15 Feb', duration: '2d', status: 'Submitted' },
    { id: '6', type: 'leave', category: 'Privilege Leave', date: '6 Feb - 7 Feb', duration: '2d', status: 'Approved' },
    { id: '7', type: 'leave', category: 'Sick Leave', date: '27 Jan', duration: '1d', status: 'Approved' },
    { id: '8', type: 'attendance', category: 'Work From Home', date: '14 Jan', duration: '1d', status: 'Submitted' },
    { id: '9', type: 'leave', category: 'Casual Leave', date: '11 Jan', duration: '1d', status: 'Approved' },
    { id: '10', type: 'attendance', category: 'On Duty', date: '6 Jan', duration: '1d', status: 'Submitted' },
    { id: '11', type: 'attendance', category: 'On Duty', date: '2 Dec', duration: '1d', status: 'Submitted' },
  ];

  // Tab buttons for switching between attendance and leaves
  const TabButtons = () => (
    <View style={styles.tabButtonContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          { backgroundColor: isDark ? theme.colors.surfaceSecondary : '#f2f2f2' },
          activeTab === 'attendance' && { ...styles.activeTabButton, backgroundColor: theme.brandColors.primary }
        ]}
        onPress={() => setActiveTab('attendance')}
      >
        <Text style={[
          styles.tabButtonText,
          { color: isDark ? theme.colors.textPrimary : theme.colors.textSecondary },
          activeTab === 'attendance' && { color: theme.colors.textInverted }
        ]}>
          Attendance
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          { backgroundColor: isDark ? theme.colors.surfaceSecondary : '#f2f2f2' },
          activeTab === 'leaves' && { ...styles.activeTabButton, backgroundColor: theme.brandColors.primary }
        ]}
        onPress={() => setActiveTab('leaves')}
      >
        <Text style={[
          styles.tabButtonText,
          { color: isDark ? theme.colors.textPrimary : theme.colors.textSecondary },
          activeTab === 'leaves' && { color: theme.colors.textInverted }
        ]}>
          Leaves
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Leave balance cards
  const LeaveBalanceCards = () => (
    <View style={styles.leaveBalanceContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {leaveBalances.map((leave, index) => (
          <View
            key={index}
            style={[styles.leaveBalanceCard, { backgroundColor: theme.colors.surfacePrimary }]}
          >
            <View style={styles.leaveBalanceProgress}>
              <View style={[styles.leaveBalanceProgressArc, { borderColor: leave.color }]} />
            </View>
            <Text style={[styles.leaveBalanceText, { color: theme.colors.textPrimary }]}>
              {leave.used}/{leave.total}
            </Text>
            <Text style={[styles.leaveBalanceType, { color: theme.colors.textSecondary }]}>
              {leave.type}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Attendance calendar component
  const AttendanceCalendar = () => (
    <View style={[styles.calendarContainer, { backgroundColor: theme.colors.surfacePrimary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Attendance Calendar</Text>
      <Calendar
        current={'2025-04-16'}
        markingType={'custom'}
        markedDates={markedDates}
        theme={{
          calendarBackground: theme.colors.surfacePrimary,
          textSectionTitleColor: theme.colors.textPrimary,
          selectedDayBackgroundColor: theme.brandColors.primary,
          selectedDayTextColor: theme.colors.textInverted,
          todayTextColor: theme.brandColors.primary,
          dayTextColor: theme.colors.textPrimary,
          textDisabledColor: theme.colors.textDisabled,
          monthTextColor: theme.colors.textPrimary,
          arrowColor: theme.brandColors.primary,
        }}
      />
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.statusColors.success + '80' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.statusColors.warning + '80' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Half Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.statusColors.error + '80' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Absent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.brandColors.primary + '80' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>On Leave</Text>
        </View>
      </View>
      <View style={[styles.attendanceSummary, { borderTopColor: isDark ? theme.colors.divider : '#e5e5e5' }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>10</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>0</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Half Day</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>3</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>0</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>On Leave</Text>
        </View>
      </View>
    </View>
  );

  // Request buttons
  const RequestButtons = () => (
    <View style={styles.requestButtonsContainer}>
      <TouchableOpacity
        style={[styles.requestButton, { backgroundColor: theme.colors.buttonPrimary }]}
      >
        <Ionicons name={activeTab === 'attendance' ? "time-outline" : "calendar-outline"} size={20} color={theme.colors.textInverted} style={styles.requestButtonIcon} />
        <Text style={[styles.requestButtonText, { color: theme.colors.textInverted }]}>
          {activeTab === 'attendance' ? 'Request Attendance' : 'Request a Leave'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Recent activity list
  const renderActivityItem = ({ item }: { item: ActivityType }) => {
    const getIconName = (type: string, category: string) => {
      if (type === 'leave') {
        return "calendar-outline";
      } else if (category === 'Work From Home') {
        return "home-outline";
      } else {
        return "briefcase-outline";
      }
    };

    return (
      <TouchableOpacity
        style={[styles.activityItem, { backgroundColor: theme.colors.surfacePrimary }]}
      >
        <View style={[styles.activityIconContainer, { backgroundColor: isDark ? theme.colors.surfaceSecondary : '#f2f2f2' }]}>
          <Ionicons
            name={getIconName(item.type, item.category)}
            size={20}
            color={theme.colors.iconSecondary}
          />
        </View>
        <View style={styles.activityDetails}>
          <Text style={[styles.activityCategory, { color: theme.colors.textPrimary }]}>
            {item.category}
          </Text>
          <Text style={[styles.activityDate, { color: theme.colors.textSecondary }]}>
            {item.date} · {item.duration}
          </Text>
        </View>
        <View style={[
          styles.activityStatus,
          {
            backgroundColor: item.status === 'Approved'
              ? theme.statusColors.success + '20'
              : theme.statusColors.info + '20'
          }
        ]}>
          <Text style={[
            styles.activityStatusText,
            {
              color: item.status === 'Approved'
                ? theme.statusColors.success
                : theme.statusColors.info
            }
          ]}>
            {item.status}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.iconSecondary} />
      </TouchableOpacity>
    );
  };

  // Filter activities based on active tab
  const filteredActivities = recentActivity.filter(activity =>
    (activeTab === 'attendance' && activity.type === 'attendance') ||
    (activeTab === 'leaves' && activity.type === 'leave')
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TabButtons />

      {activeTab === 'attendance' ? (
        <View style={styles.mainContainer}>
          <View style={styles.upperContent}>
            <AttendanceCalendar />
            <RequestButtons />
          </View>

          <View style={styles.lowerContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, paddingHorizontal: 16 }]}>
              Recent Attendance Requests
            </Text>
            <FlatList
              data={filteredActivities}
              keyExtractor={item => item.id}
              renderItem={renderActivityItem}
              contentContainerStyle={styles.activityListContent}
              ListEmptyComponent={
                <Text style={[styles.emptyListText, { color: theme.colors.textSecondary }]}>
                  No recent attendance requests found
                </Text>
              }
            />
          </View>
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.upperContent}>
            <LeaveBalanceCards />
            <RequestButtons />
          </View>

          <View style={styles.lowerContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, paddingHorizontal: 16 }]}>
              Recent Leaves
            </Text>
            <FlatList
              data={filteredActivities}
              keyExtractor={item => item.id}
              renderItem={renderActivityItem}
              contentContainerStyle={styles.activityListContent}
              ListEmptyComponent={
                <Text style={[styles.emptyListText, { color: theme.colors.textSecondary }]}>
                  No recent leaves found
                </Text>
              }
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  upperContent: {
    paddingBottom: 8,
  },
  lowerContent: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    marginRight: 8,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabButtonContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  activeTabButton: {
    backgroundColor: '#3C5CA4',
  },
  tabButtonText: {
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  leaveBalanceContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leaveBalanceCard: {
    width: 150,
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    elevation: 1,
    alignItems: 'center',
  },
  leaveBalanceProgress: {
    width: 80,
    height: 40,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveBalanceProgressArc: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  leaveBalanceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  leaveBalanceType: {
    fontSize: 14,
    textAlign: 'center',
  },
  calendarContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  attendanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryLabel: {
    fontSize: 12,
  },
  chartContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  requestButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  requestButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  requestButtonIcon: {
    marginRight: 8,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  activityIconContainer: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  activityDetails: {
    flex: 1,
    marginLeft: 12,
  },
  activityCategory: {
    fontSize: 16,
    fontWeight: '500',
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
    fontWeight: '500',
  },
  emptyListText: {
    textAlign: 'center',
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default AttendanceAndLeavesScreen;
