import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface CFLSession {
  employee: string;
  name: string;
  trainer_name?: string;
  date?: string;
  participant_count?: number;
  feedback?: string;
  village?: string;
  block?: string;
  cfl_center?: string;
  district?: string;
  region?: string;
  state?: string;
}

export default function ReportScreen() {
  const { theme } = useTheme();

  // State for reports data
  const [reports, setReports] = useState<CFLSession[]>([]);
  const [filteredReports, setFilteredReports] = useState<CFLSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  // Filter states
  const [activeFilter, setActiveFilter] = useState("All");
  const [activePeriod, setActivePeriod] = useState("Daily");

  // For sticky header
  const scrollY = useRef(new Animated.Value(0)).current;
  const filterTabsHeight = 60; // Approximate height of filter tabs
  const headerHeight = useRef(0);
  const [isFilterTabsSticky, setIsFilterTabsSticky] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Authorization token
  const { accessToken } = useAuthContext();

  // Function to fetch reports from Frappe backend
  const fetchReports = async (pageNumber = 0) => {
    if (!hasMore && pageNumber > 0) return;

    try {
      setLoading(true);

      const fields = [
        "name",
        "employee",
        "cfl_center",
        "trainer_name",
        "date",
        "participant_count",
        "village",
        "district",
        "feedback",
      ];

      const params = new URLSearchParams({
        fields: JSON.stringify(fields),
        limit_start: (pageNumber * PAGE_SIZE).toString(),
        limit_page_length: PAGE_SIZE.toString(),
      });

      const response = await fetch(
        `${`${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/CFL Session`}?${params}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Server response: ${response.status} ${response.statusText}`
        );
        console.error(`Error details: ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "Response data:",
        JSON.stringify(data).substring(0, 200) + "..."
      );
      const newReports = data.data || [];

      if (pageNumber === 0) {
        setReports(newReports);
      } else {
        setReports((prevReports) => [...prevReports, ...newReports]);
      }

      // Check if we have more items to load
      setHasMore(newReports.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert(
        "Error",
        "Failed to load session reports. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, []);

  // Apply period filtering when period or reports change
  useEffect(() => {
    applyFilters();
  }, [activePeriod, activeFilter, reports]);

  // Function to handle end reached (pagination)
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReports(nextPage);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const isDateInRange = (
    dateString?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    if (!dateString || !startDate || !endDate) return false;

    try {
      const date = new Date(dateString);
      return date >= startDate && date <= endDate;
    } catch (e) {
      console.error("Date parsing error:", e);
      return false;
    }
  };

  // Apply both period and type filters
  const applyFilters = () => {
    let periodFiltered: CFLSession[] = [];

    // Get current date at the beginning of the day (midnight)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (activePeriod === "Daily") {
      // Filter for today's reports
      periodFiltered = reports.filter((report) => {
        if (!report.date) return false;
        const reportDate = new Date(report.date);
        return (
          reportDate.getFullYear() === today.getFullYear() &&
          reportDate.getMonth() === today.getMonth() &&
          reportDate.getDate() === today.getDate()
        );
      });
    } else if (activePeriod === "Weekly") {
      // Calculate the start of the current week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      // End of week is 6 days after start (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      periodFiltered = reports.filter((report) =>
        isDateInRange(report.date, startOfWeek, endOfWeek)
      );
    } else if (activePeriod === "Monthly") {
      // Start of the current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // End of the current month
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      periodFiltered = reports.filter((report) =>
        isDateInRange(report.date, startOfMonth, endOfMonth)
      );
    }

    // Then apply the type filter (All, Sessions, Reports)
    let typeFiltered: CFLSession[] = [];

    if (activeFilter === "All") {
      typeFiltered = periodFiltered;
    } else if (activeFilter === "Sessions") {
      typeFiltered = periodFiltered.filter(
        (r) => r.participant_count && r.participant_count > 0
      );
    } else if (activeFilter === "Reports") {
      typeFiltered = periodFiltered.filter(
        (r) => r.feedback && r.feedback.length > 0
      );
    }

    setFilteredReports(typeFiltered);
  };

  const navigateToReportDetails = (report: CFLSession) => {
    router.push(`/session/${report.name}`);
  };

  // Aggregate data for insights based on filtered data
  const getAggregatedData = () => {
    return {
      totalReports: filteredReports.length,
      totalParticipants: filteredReports.reduce(
        (sum, r) => sum + (r.participant_count || 0),
        0
      ),
      uniqueVillages: new Set(
        filteredReports.map((r) => r.village).filter(Boolean)
      ).size,
      completedReports: filteredReports.filter(
        (r) => r.feedback && r.feedback.length > 0
      ).length,
    };
  };

  // Handle period filter change
  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    // Reset pagination when changing filters
    setPage(0);
  };

  // Handle type filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    // Reset pagination when changing filters
    setPage(0);
  };

  // Render report item in the SessionListScreen style
  const renderReportItem = (item: CFLSession) => (
    <TouchableOpacity
      key={item.name}
      style={[
        styles.reportCard,
        {
          backgroundColor: theme.colors.surfacePrimary,
          borderColor: theme.colors.border,
          ...theme.shadows.sm
        },
      ]}
      onPress={() => navigateToReportDetails(item)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportTypeContainer}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.brandColors.primary}
            style={styles.reportIcon}
          />
          <Text style={[styles.reportType, { color: theme.colors.textPrimary }]}>
            {item.trainer_name
              ? `Session by ${item.trainer_name}`
              : "CFL Session"}
          </Text>
        </View>
        {item.cfl_center && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: theme.brandColors.primary + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: theme.brandColors.primary }]}>
              {item.cfl_center}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.reportInfo}>
        <View style={styles.reportInfoItem}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.reportInfoText, { color: theme.colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <View style={styles.reportInfoItem}>
          <Ionicons
            name="location-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.reportInfoText, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.village
              ? `${item.village}${item.district ? `, ${item.district}` : ""}`
              : "Location not specified"}
          </Text>
        </View>
        <View style={styles.reportInfoItem}>
          <Ionicons
            name="people-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.reportInfoText, { color: theme.colors.textSecondary }]}>
            {item.participant_count || 0} participants
          </Text>
        </View>
      </View>

      {item.feedback && (
        <>
          <View
            style={[styles.insightsDivider, { backgroundColor: theme.colors.divider }]}
          />
          <Text
            style={[styles.feedbackText, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.feedback}
          </Text>
        </>
      )}

      <View style={styles.reportActionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.statusColors.success + "15" },
          ]}
        >
          <Ionicons
            name="cloud-download-outline"
            size={16}
            color={theme.statusColors.success}
          />
          <Text style={[styles.actionButtonText, { color: theme.statusColors.success }]}>
            Download PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.brandColors.primary + "15" },
          ]}
          onPress={() => navigateToReportDetails(item)}
        >
          <Ionicons name="eye-outline" size={16} color={theme.brandColors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.brandColors.primary }]}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render loading footer
  const renderFooter = () => {
    if (!loading || page === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.brandColors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading more sessions...
        </Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading && page === 0) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={theme.colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No session reports found for the selected period
        </Text>
      </View>
    );
  };

  // @ts-expect-error
  const onHeaderLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    headerHeight.current = height;
  };

  // Load more when reaching end of scroll
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (
          offsetY + event.nativeEvent.layoutMeasurement.height >=
            event.nativeEvent.contentSize.height - 20 &&
          !loading &&
          hasMore
        ) {
          handleLoadMore();
        }
        setIsFilterTabsSticky(offsetY > headerHeight.current);
      },
    }
  );

  // Pull to refresh
  const handleRefresh = () => {
    setPage(0);
    fetchReports(0);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={theme.colors.background === "#000000" ? "light-content" : "dark-content"} />

      <View
        style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}
      >
        {/* Sticky Filter Tabs (shown when scrolled past the header) */}
        {isFilterTabsSticky && (
          <Animated.View
            style={[
              styles.stickyFilterTabs,
              {
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.border,
                zIndex: 10,
              },
            ]}
          >
            <View style={styles.filterTabs}>
              {["All", "Sessions", "Reports"].map((filter) => (
                <TouchableOpacity
                  key={`sticky-${filter}`}
                  style={[
                    styles.filterTab,
                    activeFilter === filter && styles.activeFilterTab,
                    {
                      borderColor:
                        activeFilter === filter ? theme.brandColors.primary : "transparent",
                    },
                  ]}
                  onPress={() => handleFilterChange(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color:
                          activeFilter === filter
                            ? theme.brandColors.primary
                            : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Main Scrollable Content */}
        <ScrollView
          ref={scrollViewRef}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          refreshControl={
            <RefreshControl
              refreshing={loading && page === 0}
              onRefresh={handleRefresh}
              tintColor={theme.brandColors.primary}
            />
          }
          contentContainerStyle={
            filteredReports.length === 0
              ? { flexGrow: 1 }
              : { paddingBottom: 80 }
          }
        >
          {/* Header Section (will be measured for sticky detection) */}
          <View onLayout={onHeaderLayout}>
            {/* Period Toggle */}
            <View
              style={[
                styles.periodToggleContainer,
                {
                  backgroundColor: theme.colors.surfacePrimary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.periodToggleLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Report Period:
              </Text>
              <View style={styles.periodToggleButtons}>
                {["Daily", "Weekly", "Monthly"].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodToggleButton,
                      activePeriod === period &&
                        styles.activePeriodToggleButton,
                      {
                        backgroundColor:
                          activePeriod === period ? theme.brandColors.primary : theme.colors.surfacePrimary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => handlePeriodChange(period)}
                  >
                    <Text
                      style={[
                        styles.periodToggleText,
                        {
                          color:
                            activePeriod === period
                              ? theme.colors.textInverted
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Insights Summary Card */}
            <View style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.surfacePrimary,
                ...theme.shadows.sm
              }
            ]}>
              <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>
                CFL Sessions Overview ({activePeriod})
              </Text>

              <View style={styles.summaryGrid}>
                <View
                  style={[
                    styles.summaryItem,
                    {
                      borderRightColor: theme.colors.divider,
                      borderBottomColor: theme.colors.divider,
                    },
                  ]}
                >
                  <Text style={[styles.summaryValue, { color: theme.brandColors.primary }]}>
                    {getAggregatedData().totalReports}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Total Sessions
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryItem,
                    { borderBottomColor: theme.colors.divider },
                  ]}
                >
                  <Text style={[styles.summaryValue, { color: theme.brandColors.primary }]}>
                    {getAggregatedData().totalParticipants}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Participants
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryItem,
                    { borderRightColor: theme.colors.divider },
                  ]}
                >
                  <Text style={[styles.summaryValue, { color: theme.brandColors.primary }]}>
                    {getAggregatedData().uniqueVillages}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Villages
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: theme.statusColors.success }]}>
                    {getAggregatedData().completedReports}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Completed
                  </Text>
                </View>
              </View>

              <View style={styles.summaryFooter}>
                <TouchableOpacity style={styles.downloadButton}>
                  <Ionicons
                    name="download-outline"
                    size={16}
                    color={theme.brandColors.primary}
                  />
                  <Text style={[styles.downloadText, { color: theme.brandColors.primary }]}>
                    Export Reports Data
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Non-sticky Filter Tabs */}
            <View style={styles.filterTabs}>
              {["All", "Sessions", "Reports"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    activeFilter === filter && styles.activeFilterTab,
                    {
                      borderColor:
                        activeFilter === filter ? theme.brandColors.primary : "transparent",
                    },
                  ]}
                  onPress={() => handleFilterChange(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color:
                          activeFilter === filter
                            ? theme.brandColors.primary
                            : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Report List Items */}
          <View style={styles.reportsList}>
            {filteredReports.length > 0
              ? filteredReports.map((item) => renderReportItem(item))
              : renderEmpty()}
            {renderFooter()}
          </View>
        </ScrollView>
      </View>

      {/* Create Report Button */}
      <TouchableOpacity
        style={[
          styles.fabButton,
          {
            backgroundColor: theme.brandColors.primary,
            ...theme.shadows.md
          }
        ]}
      >
        <Ionicons name="add" size={24} color={theme.colors.textInverted} />
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  filterButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
  },
  periodToggleContainer: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  periodToggleLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  periodToggleButtons: {
    flexDirection: "row",
  },
  periodToggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
  },
  activePeriodToggleButton: {
    borderWidth: 0,
  },
  periodToggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  summaryItem: {
    width: "50%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 0.5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  summaryFooter: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  downloadText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  stickyFilterTabs: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 5,
  },
  filterTabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 4,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFilterTab: {
    backgroundColor: "rgba(65, 105, 225, 0.1)",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  reportsList: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  reportCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reportTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportIcon: {
    marginRight: 6,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  reportInfo: {
    marginBottom: 12,
  },
  reportInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  reportInfoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  insightsDivider: {
    height: 1,
    marginVertical: 12,
  },
  feedbackText: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 12,
  },
  reportActionButtons: {
    flexDirection: "row",
    marginTop: 8,
    gap: 6,
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  fabButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerItemActive: {
    borderTopWidth: 2,
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
