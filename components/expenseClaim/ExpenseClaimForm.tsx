import React, { useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import Header from "./sections/Header";
import TabBar from "./sections/TabBar";
import ExpensesTab from "./sections/ExpensesTab";
import AdvancesTab from "./sections/AdvanceTab";
import TotalsTab from "./sections/TotalsTab";
import AddExpenseModal from "./sections/AddExpenseModal";
import AddTaxModal from "./sections/AddTaxModal";
import AlertDialog from "../AlertDialog";
import { TabType } from "./types";
import { styles } from "./styles";

interface ExpenseClaimData {
  name?: string;
  expenses: Array<{
    expense_date: string;
    expense_type: string;
    description?: string;
    amount: number;
    sanctioned_amount?: number;
    cost_center?: string;
    project?: string;
  }>;
  taxes: Array<{
    account_head: string;
    rate?: number;
    amount: number;
    description?: string;
    cost_center?: string;
    project?: string;
  }>;
  advances: Array<any>;
  total_sanctioned_amount: number;
  grand_total: number;
  total_claimed_amount: number;
  cost_center?: string;
}

const ExpenseClaimForm = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();

  const [activeTab, setActiveTab] = useState<TabType>(TabType.EXPENSES);
  const [expenseClaimData, setExpenseClaimData] = useState<ExpenseClaimData>({
    expenses: [],
    taxes: [],
    advances: [],
    total_sanctioned_amount: 0,
    grand_total: 0,
    total_claimed_amount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);

  // Alert dialog states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmText, setAlertConfirmText] = useState("OK");
  const [alertShowCancel, setAlertShowCancel] = useState(false);
  const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>(
    () => {}
  );
  const [alertCancelAction, setAlertCancelAction] = useState<() => void>(
    () => {}
  );

  const fetchExpenseClaim = async (name: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Expense Claim/${name}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setExpenseClaimData(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch expense claim");
      }
    } catch (error) {
      console.error("Error fetching expense claim:", error);
      showAlert("Error", "Failed to load expense claim");
    }
  };

  const handleSubmitClaim = async () => {
    if (expenseClaimData.expenses.length === 0) {
      showAlert("Validation Error", "Please add at least one expense item");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        doctype: "Expense Claim",
        employee: employeeProfile?.name,
        employee_name: employeeProfile?.employee_name,
        department: employeeProfile?.department,
        company: employeeProfile?.company,
        expenses: expenseClaimData.expenses.map((expense) => ({
          expense_date: expense.expense_date,
          expense_type: expense.expense_type,
          description: expense.description || "",
          amount: expense.amount,
          sanctioned_amount: expense.sanctioned_amount || expense.amount,
          cost_center:
            expense.cost_center || expenseClaimData.cost_center || "",
          project: expense.project || null,
        })),
        taxes: expenseClaimData.taxes.map((tax) => ({
          account_head: tax.account_head,
          rate: tax.rate || null,
          amount: tax.amount,
          description: tax.description || "",
          cost_center: tax.cost_center || expenseClaimData.cost_center || "",
          project: tax.project || null,
        })),
        advances: expenseClaimData.advances,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Expense Claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      console.log(responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to submit expense claim"
        );
      }

      // Fetch the created expense claim to get all fields
      await fetchExpenseClaim(responseData.data.name);

      showAlert("Success", "Expense claim submitted successfully", "OK", () =>
        navigation.goBack()
      );
    } catch (error) {
      console.error("Error submitting expense claim:", error);
      showAlert(
        "Error",
        `Failed to submit expense claim: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = (expense: any) => {
    setExpenseClaimData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, expense],
      total_sanctioned_amount:
        prev.total_sanctioned_amount +
        (expense.sanctioned_amount || expense.amount),
      total_claimed_amount: prev.total_claimed_amount + expense.amount,
      grand_total: prev.grand_total + expense.amount,
    }));
    setShowAddExpenseModal(false);
  };

  const handleAddTax = (tax: any) => {
    setExpenseClaimData((prev) => ({
      ...prev,
      taxes: [...prev.taxes, tax],
      grand_total: prev.grand_total + tax.amount,
    }));
    setShowAddTaxModal(false);
  };

  const showAlert = (
    title: string,
    message: string,
    confirmText: string = "OK",
    onConfirm: () => void = () => setAlertVisible(false),
    showCancel: boolean = false,
    onCancel: () => void = () => setAlertVisible(false)
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmText(confirmText);
    setAlertShowCancel(showCancel);
    setAlertConfirmAction(() => onConfirm);
    setAlertCancelAction(() => onCancel);
    setAlertVisible(true);
  };

  const handleBackPress = () => {
    if (
      expenseClaimData.expenses.length > 0 ||
      expenseClaimData.taxes.length > 0
    ) {
      showAlert(
        "Discard Changes",
        "Are you sure you want to discard your expense claim?",
        "Discard",
        () => {
          setAlertVisible(false);
          navigation.goBack("Expense");
        },
        true,
        () => setAlertVisible(false)
      );
    } else {
      navigation.popTo("expense");
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case TabType.EXPENSES:
        return (
          <ExpensesTab
            expenseItems={expenseClaimData.expenses.map((expense) => ({
              ...expense,
              date: new Date(expense.expense_date),
            }))}
            taxItems={expenseClaimData.taxes}
            totalAmount={expenseClaimData.total_claimed_amount}
            totalTaxAmount={expenseClaimData.taxes.reduce(
              (sum, tax) => sum + tax.amount,
              0
            )}
            setShowAddExpenseModal={setShowAddExpenseModal}
            setShowAddTaxModal={setShowAddTaxModal}
          />
        );
      case TabType.ADVANCES:
        return <AdvancesTab advanceItems={expenseClaimData.advances} />;
      case TabType.TOTALS:
        return (
          <TotalsTab
            costCenter={expenseClaimData.cost_center || ""}
            totalAmount={expenseClaimData.total_claimed_amount}
            totalSanctionedAmount={expenseClaimData.total_sanctioned_amount}
            grandTotal={expenseClaimData.grand_total}
          />
        );
      default:
        return (
          <ExpensesTab
            expenseItems={expenseClaimData.expenses.map((expense) => ({
              ...expense,
              date: new Date(expense.expense_date),
            }))}
            taxItems={expenseClaimData.taxes}
            totalAmount={expenseClaimData.total_claimed_amount}
            totalTaxAmount={expenseClaimData.taxes.reduce(
              (sum, tax) => sum + tax.amount,
              0
            )}
            setShowAddExpenseModal={setShowAddExpenseModal}
            setShowAddTaxModal={setShowAddTaxModal}
          />
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header
        onBackPress={handleBackPress}
        title={
          expenseClaimData.name
            ? `Expense Claim ${expenseClaimData.name}`
            : "New Expense Claim"
        }
      />

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <Pressable style={{ flex: 1 }}>{renderActiveTab()}</Pressable>

      <View
        style={[
          styles.buttonContainer,
          {
            backgroundColor: theme.colors.surfacePrimary,
            borderTopColor: theme.colors.surfaceAccent,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isSubmitting
                ? theme.colors.buttonDisabled
                : theme.colors.buttonPrimary,
              flex: 1,
            },
          ]}
          onPress={handleSubmitClaim}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
              {expenseClaimData.name ? "Update" : "Submit"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <AddExpenseModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onAddExpense={handleAddExpense}
        costCenter={expenseClaimData.cost_center}
      />

      <AddTaxModal
        visible={showAddTaxModal}
        onClose={() => setShowAddTaxModal(false)}
        onAddTax={handleAddTax}
        accessToken={accessToken as string}
      />

      <AlertDialog
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText={alertConfirmText}
        onConfirm={alertConfirmAction}
        showCancel={alertShowCancel}
        onCancel={alertCancelAction}
        theme={theme}
      />
    </KeyboardAvoidingView>
  );
};

export default ExpenseClaimForm;
