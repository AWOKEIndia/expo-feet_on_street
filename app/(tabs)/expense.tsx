import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ExpenseClaimScreen() {
  const { theme, isDark } = useTheme();
  const { accessToken } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  type Expense = {
    id: string;
    date: string;
    purpose: string;
    amount: number;
    status: string;
  };
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSummary, setExpenseSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [advanceBalance, setAdvanceBalance] = useState(0);

  useEffect(() => {
    // Simulate fetch expenses data
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call to fetch expenses
        // Example:
        // const response = await fetch(
        //   `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Expense Claim`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );
        // const data = await response.json();

        // Simulated data
        setTimeout(() => {
          setExpenses([

          ]);

          setExpenseSummary({
            total: 5500,
            pending: 3500,
            approved: 1250,
            rejected: 750,
          });

          setAdvanceBalance(0);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [accessToken]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return theme.statusColors.success;
      case "Pending":
        return theme.statusColors.warning;
      case "Rejected":
        return theme.statusColors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return "checkmark-circle-outline";
      case "Pending":
        return "time-outline";
      case "Rejected":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const renderExpenseItem = (expense: any) => (
    <TouchableOpacity
      key={expense.id}
      style={[
        styles.expenseItem,
        {
          backgroundColor: theme.colors.surfacePrimary,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => router.push(`/expense/${expense.id}`)}
    >
      <View style={styles.expenseHeader}>
        <View style={styles.expenseIdContainer}>
          <Text style={[styles.expenseId, { color: theme.colors.textPrimary }]}>
            {expense.id}
          </Text>
          <Text style={[styles.expenseDate, { color: theme.colors.textTertiary }]}>
            {expense.date}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(expense.status) + "20" },
          ]}
        >
          <Ionicons
            name={getStatusIcon(expense.status)}
            size={16}
            color={getStatusColor(expense.status)}
            style={styles.statusIcon}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(expense.status) },
            ]}
          >
            {expense.status}
          </Text>
        </View>
      </View>
      <Text style={[styles.expensePurpose, { color: theme.colors.textPrimary }]}>
        {expense.purpose}
      </Text>
      <View style={styles.expenseFooter}>
        <Text style={[styles.expenseAmount, { color: theme.colors.textPrimary }]}>
          ₹{expense.amount.toFixed(2)}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textTertiary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Expense Claim Summary
          </Text>

          <View style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.border
            }
          ]}>
            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
                Total Expense Amount
              </Text>
              <Text style={[styles.totalAmount, { color: theme.colors.textPrimary }]}>
                ₹{expenseSummary.total.toFixed(0)}
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: theme.statusColors.warning }]}>
                  <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.statusItemContent}>
                  <Text style={[styles.statusValue, { color: theme.colors.textPrimary }]}>
                    ₹{expenseSummary.pending.toFixed(0)}
                  </Text>
                  <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                    Pending
                  </Text>
                </View>
              </View>

              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: theme.statusColors.success }]}>
                  <Ionicons name="checkmark-outline" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.statusItemContent}>
                  <Text style={[styles.statusValue, { color: theme.colors.textPrimary }]}>
                    ₹{expenseSummary.approved.toFixed(0)}
                  </Text>
                  <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                    Approved
                  </Text>
                </View>
              </View>

              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: theme.statusColors.error }]}>
                  <Ionicons name="close-outline" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.statusItemContent}>
                  <Text style={[styles.statusValue, { color: theme.colors.textPrimary }]}>
                    ₹{expenseSummary.rejected.toFixed(0)}
                  </Text>
                  <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                    Rejected
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.claimButton,
              { backgroundColor: theme.colors.buttonPrimary },
            ]}
            onPress={() => router.push("/expense/new")}
          >
            <Text style={[styles.claimButtonText, { color: "#FFFFFF" }]}>
              Claim an Expense
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Recent Expenses
            </Text>
            {expenses.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/expense/all")}>
                <Text style={[styles.viewAllLink, { color: theme.colors.buttonPrimary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
            </View>
          ) : expenses.length > 0 ? (
            <View style={styles.expensesList}>
              {expenses.map(renderExpenseItem)}
            </View>
          ) : (
            <View
              style={[
                styles.emptyStateContainer,
                { backgroundColor: theme.colors.surfacePrimary },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={48}
                color={theme.colors.textTertiary}
              />
              <Text style={[styles.emptyStateText, { color: theme.colors.textPrimary }]}>
                No expense claims found
              </Text>
              <Text
                style={[
                  styles.emptyStateSubText,
                  { color: theme.colors.textTertiary },
                ]}
              >
                Create a new expense claim to get started
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Employee Advance Balance
            </Text>
            <TouchableOpacity onPress={() => router.push("/advance/all")}>
              <Text style={[styles.viewAllLink, { color: theme.colors.buttonPrimary }]}>
                View List
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.advanceCard,
              {
                backgroundColor: theme.colors.surfacePrimary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.advanceInfo}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color={theme.colors.textPrimary}
                style={styles.advanceIcon}
              />
              <View>
                <Text
                  style={[
                    styles.advanceLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Available Balance
                </Text>
                <Text style={[styles.advanceAmount, { color: theme.colors.textPrimary }]}>
                  ₹{advanceBalance.toFixed(2)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.requestAdvanceButton,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push('/advance/new')}
            >
              <Text
                style={[
                  styles.requestAdvanceText,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Request Advance
              </Text>
            </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
    justifyContent: "flex-end",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
    marginRight: 6,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  totalContainer: {
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusItemContent: {
    flexDirection: "column",
  },
  statusLabel: {
    fontSize: 12,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  claimButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  expensesList: {
    marginBottom: 8,
  },
  expenseItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  expenseIdContainer: {
    flexDirection: "column",
  },
  expenseId: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  expensePurpose: {
    fontSize: 14,
    marginBottom: 8,
  },
  expenseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyStateContainer: {
    height: 180,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubText: {
    fontSize: 14,
    textAlign: "center",
  },
  advanceCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  advanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  advanceIcon: {
    marginRight: 12,
  },
  advanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  advanceAmount: {
    fontSize: 22,
    fontWeight: "bold",
  },
  requestAdvanceButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  requestAdvanceText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    height: 64,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
