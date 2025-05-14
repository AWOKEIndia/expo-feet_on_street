import ExpenseClaimForm from "@/components/expenseClaim/ExpenseClaimForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import EmployeeAdvanceForm from "@/components/expenseClaim/EmployeeAdvanceForm";
// import { EmployeeAdvanceFormData } from "@/components/expenseClaim/EmployeeAdvanceForm";

export interface ExpenseClaim {
  name: string;
  employee: string;
  employee_name: string;
  department: string;
  company: string;
  approval_status: string;
  total_sanctioned_amount: number;
  grand_total: number;
  posting_date: string;
  status: string;
  expenses: ExpenseItem[];
}

export interface ExpenseItem {
  expense_date: string;
  expense_type: string;
  amount: number;
  sanctioned_amount: number;
  purpose?: string;
}

const useExpenseClaims = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseClaim | null>(null);
  const { accessToken, employeeProfile } = useAuthContext();

  const fetchExpenseClaimDetails = async (claimId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Expense Claim/${claimId}`,
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
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();
      console.log(`Details for expense claim ${claimId} retrieved`);

      if (result?.data) {
        return {
          ...result.data,
          status: result.data.approval_status,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching details for expense claim ${claimId}:`, error);
      return null;
    }
  };

  const fetchExpenseClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Expense Claim/`,
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
        throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();
      console.log("Expense claims list retrieved");

      if (result?.data) {
        const claimsList = Array.isArray(result.data) ? result.data : [];
        const detailPromises = claimsList.map((claim: { name: string }) =>
          fetchExpenseClaimDetails(claim.name)
        );

        const detailResults = await Promise.all(detailPromises);
        const formattedClaims = detailResults.filter(Boolean) as ExpenseClaim[];

        // Filter claims for the current employee
        const filteredClaims = employeeProfile?.name
          ? formattedClaims.filter((claim) => claim.employee === employeeProfile.name)
          : formattedClaims;

        setExpenseClaims(filteredClaims);
      } else {
        console.warn("No expense claims found in response");
        setExpenseClaims([]);
      }
    } catch (error) {
      console.error("Error fetching expense claims:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, employeeProfile?.name]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenseClaims();
  }, [fetchExpenseClaims]);

  React.useEffect(() => {
    fetchExpenseClaims();
  }, [fetchExpenseClaims]);

  const selectExpenseById = useCallback(
    (id: string) => {
      const expense = expenseClaims.find((claim) => claim.name === id) || null;
      setSelectedExpense(expense);
      return expense;
    },
    [expenseClaims]
  );

  const clearSelectedExpense = useCallback(() => {
    setSelectedExpense(null);
  }, []);

  return {
    data: expenseClaims,
    loading,
    error,
    refreshing,
    refresh,
    selectedExpense,
    selectExpenseById,
    clearSelectedExpense,
  };
};

export default function ExpenseClaimScreen() {
  const { theme, isDark } = useTheme();
  const [showFormModal, setShowFormModal] = useState(false);
  // Add state for employee advance form modal
  const [showAdvanceFormModal, setShowAdvanceFormModal] = useState(false);
  const {
    data: expenseClaims,
    loading,
    error,
    refreshing,
    refresh,
  } = useExpenseClaims();

  const handleFormSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    setShowFormModal(false);
    refresh();
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
  };

  // Handle employee advance form submission
  const handleAdvanceFormSubmit = (data: any) => {
    console.log("Advance form submitted with data:", data);
    setShowAdvanceFormModal(false);
    refresh();
  };

  // Handle employee advance form cancellation
  const handleAdvanceFormCancel = () => {
    setShowAdvanceFormModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return theme.statusColors.success;
      case "Pending":
        return theme.statusColors.warning;
      case "Rejected":
        return theme.statusColors.error;
      case "Draft":
        return theme.colors.textSecondary;
      default:
        return theme.colors.textTertiary;
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
      case "Draft":
        return "document-outline";
      default:
        return "help-circle-outline";
    }
  };

  const expenseSummary = React.useMemo(() => {
    return expenseClaims.reduce(
      (acc, claim) => {
        acc.total += claim.grand_total || 0;

        if (claim.approval_status === "Draft") {
          acc.pending += claim.grand_total || 0;
        } else if (claim.approval_status === "Approved") {
          acc.approved += claim.grand_total || 0;
        } else if (claim.approval_status === "Rejected") {
          acc.rejected += claim.grand_total || 0;
        }

        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [expenseClaims]);

  const advanceBalance = 0;

  const renderExpenseItem = (expense: ExpenseClaim) => {
    const primaryExpense = expense.expenses?.[0];
    const purpose = primaryExpense?.expense_type || "Expense Claim";
    const amount = expense.grand_total || 0;
    const date = expense.posting_date || "";

    return (
      <TouchableOpacity
        key={expense.name}
        style={[
          styles.expenseItem,
          {
            backgroundColor: theme.colors.surfacePrimary,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.expenseHeader}>
          <View style={styles.expenseIdContainer}>
            <Text style={[styles.expenseId, { color: theme.colors.textPrimary }]}>
              {expense.name}
            </Text>
            <Text style={[styles.expenseDate, { color: theme.colors.textTertiary }]}>
              {date}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(expense.approval_status) + "20" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(expense.approval_status)}
              size={16}
              color={getStatusColor(expense.approval_status)}
              style={styles.statusIcon}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(expense.approval_status) },
              ]}
            >
              {expense.approval_status}
            </Text>
          </View>
        </View>
        <Text style={[styles.expensePurpose, { color: theme.colors.textPrimary }]}>
          {purpose}
        </Text>
        <View style={styles.expenseFooter}>
          <Text style={[styles.expenseAmount, { color: theme.colors.textPrimary }]}>
            ₹{amount.toFixed(2)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textTertiary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[theme.colors.buttonPrimary]}
            tintColor={theme.colors.buttonPrimary}
          />
        }
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
                ₹{expenseSummary.total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: theme.statusColors.warning }]}>
                  <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.statusItemContent}>
                  <Text style={[styles.statusValue, { color: theme.colors.textPrimary }]}>
                    ₹{expenseSummary.pending.toFixed(2)}
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
                    ₹{expenseSummary.approved.toFixed(2)}
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
                    ₹{expenseSummary.rejected.toFixed(2)}
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
            onPress={() => setShowFormModal(true)}
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
            {expenseClaims.length > 0 && (
              <TouchableOpacity>
                <Text style={[styles.viewAllLink, { color: theme.colors.buttonPrimary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
            </View>
          ) : error ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons
                name="warning-outline"
                size={48}
                color={theme.colors.textTertiary}
              />
              <Text style={[styles.emptyStateText, { color: theme.colors.textPrimary }]}>
                Error loading expense claims
              </Text>
              <Text
                style={[
                  styles.emptyStateSubText,
                  { color: theme.colors.textTertiary },
                ]}
              >
                {error.message}
              </Text>
              <TouchableOpacity onPress={refresh}>
                <Text style={{ color: theme.colors.buttonPrimary, marginTop: 8 }}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : expenseClaims.length > 0 ? (
            <View style={styles.expensesList}>
              {expenseClaims.map(renderExpenseItem)}
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
            <TouchableOpacity>
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
            {/* Update the Request Advance button to open the employee advance form modal */}
            <TouchableOpacity
              style={[
                styles.requestAdvanceButton,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setShowAdvanceFormModal(true)}
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

      {/* Expense Claim Form Modal */}
      <Modal
        visible={showFormModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowFormModal(false)}
      >
        <ExpenseClaimForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Employee Advance Form Modal */}
      <Modal
        visible={showAdvanceFormModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAdvanceFormModal(false)}
      >
        <EmployeeAdvanceForm
          onSubmit={handleAdvanceFormSubmit}
          onCancel={handleAdvanceFormCancel}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
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
});
