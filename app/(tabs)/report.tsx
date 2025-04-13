import { useAuthContext } from "@/contexts/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  const theme = {
    background: "#f5f7fa",
    card: "#ffffff",
    text: "#333333",
    textSecondary: "#757575",
    border: "#e0e0e0",
    primary: "#4169e1",
    buttonText: "#ffffff",
    iconGray: "#8a8a8a",
    error: "#f44336",
    success: "#4caf50",
    warning: "#ff9800",
  };

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

  // Helper to check if a date is within a specific range
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
    // First filter by date period
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

  // TODO: Implement the logic to navigate to the report details screen
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
  const renderReportItem = ({ item }: { item: CFLSession }) => (
    <TouchableOpacity
      style={[
        styles.reportCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={() => navigateToReportDetails(item)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportTypeContainer}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.primary}
            style={styles.reportIcon}
          />
          <Text style={[styles.reportType, { color: theme.text }]}>
            {item.trainer_name
              ? `Session by ${item.trainer_name}`
              : "CFL Session"}
          </Text>
        </View>
        {item.cfl_center && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: theme.primary + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: theme.primary }]}>
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
            color={theme.textSecondary}
          />
          <Text style={[styles.reportInfoText, { color: theme.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <View style={styles.reportInfoItem}>
          <Ionicons
            name="location-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text
            style={[styles.reportInfoText, { color: theme.textSecondary }]}
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
            color={theme.textSecondary}
          />
          <Text style={[styles.reportInfoText, { color: theme.textSecondary }]}>
            {item.participant_count || 0} participants
          </Text>
        </View>
      </View>

      {item.feedback && (
        <>
          <View
            style={[styles.insightsDivider, { backgroundColor: theme.border }]}
          />
          <Text
            style={[styles.feedbackText, { color: theme.textSecondary }]}
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
            { backgroundColor: theme.success + "15" },
          ]}
        >
          <Ionicons
            name="cloud-download-outline"
            size={16}
            color={theme.success}
          />
          <Text style={[styles.actionButtonText, { color: theme.success }]}>
            Download PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.primary + "15" },
          ]}
          onPress={() => navigateToReportDetails(item)}
        >
          <Ionicons name="eye-outline" size={16} color={theme.primary} />
          <Text style={[styles.actionButtonText, { color: theme.primary }]}>
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
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
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
          color={theme.textSecondary}
        />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No session reports found for the selected period
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="dark-content" />

      <View
        style={[styles.contentContainer, { backgroundColor: theme.background }]}
      >
        {/* Period Toggle */}
        <View
          style={[
            styles.periodToggleContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text
            style={[styles.periodToggleLabel, { color: theme.textSecondary }]}
          >
            Report Period:
          </Text>
          <View style={styles.periodToggleButtons}>
            {["Daily", "Weekly", "Monthly"].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodToggleButton,
                  activePeriod === period && styles.activePeriodToggleButton,
                  {
                    backgroundColor:
                      activePeriod === period ? theme.primary : theme.card,
                    borderColor: theme.border,
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
                          ? theme.buttonText
                          : theme.textSecondary,
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
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>
            CFL Sessions Overview ({activePeriod})
          </Text>

          <View style={styles.summaryGrid}>
            <View
              style={[
                styles.summaryItem,
                {
                  borderRightColor: theme.border,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                {getAggregatedData().totalReports}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: theme.textSecondary }]}
              >
                Total Sessions
              </Text>
            </View>

            <View
              style={[styles.summaryItem, { borderBottomColor: theme.border }]}
            >
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                {getAggregatedData().totalParticipants}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: theme.textSecondary }]}
              >
                Participants
              </Text>
            </View>

            <View
              style={[styles.summaryItem, { borderRightColor: theme.border }]}
            >
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                {getAggregatedData().uniqueVillages}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: theme.textSecondary }]}
              >
                Villages
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.success }]}>
                {getAggregatedData().completedReports}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: theme.textSecondary }]}
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
                color={theme.primary}
              />
              <Text style={[styles.downloadText, { color: theme.primary }]}>
                Export Reports Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {["All", "Sessions", "Reports"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.activeFilterTab,
                {
                  borderColor:
                    activeFilter === filter ? theme.primary : "transparent",
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
                        ? theme.primary
                        : theme.textSecondary,
                  },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reports List */}
        <FlatList
          data={filteredReports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={[
            styles.reportsList,
            filteredReports.length === 0 && styles.emptyListContainer,
          ]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshing={loading && page === 0}
          onRefresh={() => {
            setPage(0);
            fetchReports(0);
          }}
        />
      </View>

      {/* Create Report Button */}
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: theme.primary }]}
      >
        <Ionicons name="add" size={24} color={theme.buttonText} />
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
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
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: "#e0e0e0",
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
  filterTabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
    borderTopColor: "#4169e1",
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
