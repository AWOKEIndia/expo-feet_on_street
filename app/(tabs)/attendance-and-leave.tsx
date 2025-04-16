import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

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

  // Calendar marked dates for attendance - condensed
  const markedDates = {
    '2025-04-01': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textPrimary } } },
    '2025-04-04': { customStyles: { container: { backgroundColor: theme.statusColors.error + '80' }, text: { color: theme.colors.textPrimary } } },
    '2025-04-07': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textPrimary } } },
    '2025-04-10': { customStyles: { container: { backgroundColor: theme.statusColors.error + '80' }, text: { color: theme.colors.textPrimary } } },
    '2025-04-14': { customStyles: { container: { backgroundColor: theme.statusColors.success + '80' }, text: { color: theme.colors.textPrimary } } },
    '2025-04-16': { customStyles: { container: { backgroundColor: theme.statusColors.error + '80' }, text: { color: theme.colors.textPrimary } } },
  };

  // Leave balances - kept the same as it's already minimal
  const leaveBalances = [
    { type: 'Casual Leave', used: 1, total: 12, color: theme.statusColors.error },
    { type: 'Privilege Leave', used: 6.806, total: 15, color: theme.brandColors.primary },
    { type: 'Sick Leave', used: 7, total: 10, color: theme.statusColors.warning },
    { type: 'Compensatory Off', used: 4, total: 5, color: theme.colors.textPrimary },
  ];

  // Recent activity data - condensed but kept essential variety
  const recentActivity: ActivityType[] = [
    { id: '1', type: 'leave', category: 'Casual Leave', date: '11 Mar', duration: '1d', status: 'Approved' },
    { id: '2', type: 'attendance', category: 'Work From Home', date: '4 Mar', duration: '1d', status: 'Submitted' },
    { id: '3', type: 'leave', category: 'Privilege Leave', date: '6 Feb - 7 Feb', duration: '2d', status: 'Approved' },
    { id: '4', type: 'attendance', category: 'On Duty', date: '6 Jan', duration: '1d', status: 'Submitted' },
  ];

  // Tab buttons for switching between attendance and leaves
  const TabButtons = () => (
    <View style={styles.tabButtonContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          { backgroundColor: isDark ? theme.colors.surfaceSecondary : '#f2f2f2' },
          activeTab === 'attendance' && { backgroundColor: theme.brandColors.primary },
          { borderRadius: 8, marginRight: 8 }
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
          activeTab === 'leaves' && { backgroundColor: theme.brandColors.primary },
          { borderRadius: 8, marginLeft: 8 }
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

  // Leave balance cards with gauge charts - UPDATED to include min/max labels
  const LeaveBalanceCards = () => (
    <View style={[styles.leaveBalanceContainer, { paddingBottom: 8 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
        contentContainerStyle={{ paddingVertical: 6 }}
      >
        {leaveBalances.map((leave, index) => {
          // Calculate fill percentage for the gauge
          const fillPercentage = leave.total > 0 ? ((leave.total - leave.used) / leave.total) * 100 : 0;
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
                    }
                  })
                }
              ]}
            >
              <View style={styles.leaveBalanceProgress}>
                {/* Container to position min/max labels */}
                <View style={styles.gaugeContainer}>
                  {/* Start label (0) */}
                  <View style={[styles.gaugeLabel, styles.startLabel]}>
                    <Text style={[styles.gaugeLabelText, { color: theme.colors.textSecondary }]}>0</Text>
                  </View>

                  {/* Circular progress */}
                  <AnimatedCircularProgress
                    size={100}
                    width={8}
                    fill={fillPercentage}
                    tintColor={leave.color}
                    backgroundColor={isDark ? theme.colors.surfaceSecondary : '#f0f0f0'}
                    arcSweepAngle={240}
                    rotation={240}
                    lineCap="round"
                  >
                    {() => (
                      <View style={styles.gaugeTextContainer}>
                        <Text style={[styles.gaugeValueText, { color: theme.colors.textPrimary }]}>
                          {remainingLeaves.toFixed(remainingLeaves % 1 === 0 ? 0 : 1)}
                        </Text>
                        <Text style={[styles.gaugeUnitText, { color: theme.colors.textSecondary }]}>
                          left
                        </Text>
                      </View>
                    )}
                  </AnimatedCircularProgress>

                  {/* End label (total) */}
                  <View style={[styles.gaugeLabel, styles.endLabel]}>
                    <Text style={[styles.gaugeLabelText, { color: theme.colors.textSecondary }]}>
                      {leave.total}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.leaveBalanceType, { color: theme.colors.textPrimary, marginTop: 12 }]}>
                {leave.type}
              </Text>
              <Text style={[styles.leaveBalanceDetails, { color: theme.colors.textSecondary }]}>
                {leave.used.toFixed(leave.used % 1 === 0 ? 0 : 1)}/{leave.total.toFixed(leave.total % 1 === 0 ? 0 : 1)} used
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  // Attendance calendar component - with colored circles in summary
  const AttendanceCalendar = () => (
    <View style={[
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
          }
        })
      }
    ]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Attendance Calendar</Text>
      <Calendar
        current={'2025-04-16'}
        markingType={'custom'}
        markedDates={markedDates}
        theme={{
          calendarBackground: theme.colors.surfacePrimary,
          textSectionTitleColor: theme.colors.textPrimary,
          selectedDayBackgroundColor: theme.brandColors.primary,
          selectedDayTextColor: theme.colors.textPrimary,
          todayTextColor: theme.brandColors.primary,
          dayTextColor: theme.colors.textPrimary,
          textDisabledColor: theme.colors.textDisabled,
          monthTextColor: theme.colors.textPrimary,
          arrowColor: theme.brandColors.primary,
        }}
      />

      {/* Attendance summary with colored circles */}
      <View style={[styles.attendanceSummary, { borderTopColor: isDark ? theme.colors.divider : '#e5e5e5' }]}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: theme.statusColors.success + '80' }]}>
            <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>10</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: theme.statusColors.warning + '80' }]}>
            <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>0</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Half Day</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: theme.statusColors.error + '80' }]}>
            <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>3</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: theme.brandColors.primary + '80' }]}>
            <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>0</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>On Leave</Text>
        </View>
      </View>
    </View>
  );

  // Request buttons
  const RequestButtons = () => (
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
              }
            })
          }
        ]}
      >
        <Ionicons name={activeTab === 'attendance' ? "time-outline" : "calendar-outline"} size={20} color={theme.colors.textInverted} style={styles.requestButtonIcon} />
        <Text style={[styles.requestButtonText, { color: theme.colors.textInverted }]}>
          {activeTab === 'attendance' ? 'Request Attendance' : 'Request a Leave'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render activity item
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
              }
            })
          }
        ]}
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
        <ScrollView style={styles.mainContainer}>
          <AttendanceCalendar />
          <RequestButtons />

          {/* Recent Attendance Requests section */}
          <View style={styles.recentActivitySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, paddingHorizontal: 16 }]}>
              Recent Attendance Requests
            </Text>
            <View style={styles.activityListContent}>
              {filteredActivities.length > 0 ? (
                filteredActivities.map(item => (
                  <View key={item.id}>
                    {renderActivityItem({ item })}
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyListText, { color: theme.colors.textSecondary }]}>
                  No recent attendance requests found
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.mainContainer}>
          <LeaveBalanceCards />
          <RequestButtons />

          {/* Recent Leaves section */}
          <View style={styles.recentActivitySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, paddingHorizontal: 16 }]}>
              Recent Leaves
            </Text>
            <View style={styles.activityListContent}>
              {filteredActivities.length > 0 ? (
                filteredActivities.map(item => (
                  <View key={item.id}>
                    {renderActivityItem({ item })}
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyListText, { color: theme.colors.textSecondary }]}>
                  No recent leaves found
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  tabButtonContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    elevation: 1,
  },
  tabButtonText: {
    fontWeight: '500',
  },
  leaveBalanceContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    minHeight: 200,
  },
  leaveBalanceCard: {
    width: 150,
    height: 190, // Increased height to accommodate labels
    borderRadius: 16,
    marginRight: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  leaveBalanceProgress: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // New container for gauge and labels
  gaugeContainer: {
    position: 'relative',
    width: 120,  // Width larger than the gauge to accommodate labels
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValueText: {
    fontSize: 24,
    fontWeight: '700',
  },
  gaugeUnitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // New styles for min/max labels
  gaugeLabel: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  startLabel: {
    left: 0,
    bottom: 0,
  },
  endLabel: {
    right: 0,
    bottom: 0,
  },
  gaugeLabelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  leaveBalanceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  leaveBalanceType: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  leaveBalanceDetails: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  calendarContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  attendanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginTop: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryLabel: {
    fontSize: 12,
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
  recentActivitySection: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  activityListContent: {
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
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
});

export default AttendanceAndLeavesScreen;
