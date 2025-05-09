import React, { useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Text
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

import type { ExpenseItem, TaxItem } from "./types";


const ExpenseClaimForm = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();

  const [activeTab, setActiveTab] = useState<TabType>(TabType.EXPENSES);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [taxItems, setTaxItems] = useState<TaxItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);

  // Alert dialog states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmText, setAlertConfirmText] = useState("OK");
  const [alertShowCancel, setAlertShowCancel] = useState(false);
  const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>(() => {});
  const [alertCancelAction, setAlertCancelAction] = useState<() => void>(() => {});

  // Modal states
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update totals when items change
  useEffect(() => {
    const expenseTotal = expenseItems.reduce(
      (sum, item) => sum + parseFloat(item.amount || "0"),
      0
    );
    setTotalAmount(expenseTotal);

    const taxTotal = taxItems.reduce(
      (sum, item) => sum + parseFloat(item.amount || "0"),
      0
    );
    setTotalTaxAmount(taxTotal);
  }, [expenseItems, taxItems]);

  const totalSanctionedAmount = expenseItems.reduce(
    (sum, item) => sum + parseFloat(item.sanctionedAmount || item.amount || "0"),
    0
  );

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
    if (expenseItems.length > 0 || taxItems.length > 0) {
      showAlert(
        "Discard Changes",
        "Are you sure you want to discard your expense claim?",
        "Discard",
        () => {
          setAlertVisible(false)
        },
        true,
        () => setAlertVisible(false)
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSubmitClaim = async () => {
    if (expenseItems.length === 0) {
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
        expense_items: expenseItems.map((item) => ({
          expense_date: formatDateForAPI(item.date),
          expense_type: item.expenseType,
          description: item.description,
          amount: parseFloat(item.amount),
          sanctioned_amount: item.sanctionedAmount
            ? parseFloat(item.sanctionedAmount)
            : null,
          cost_center: item.costCenter || "",
          project: item.project || null,
        })),
        taxes: taxItems.map((item) => ({
          account_head: item.accountHead,
          rate: item.rate ? parseFloat(item.rate) : null,
          amount: parseFloat(item.amount),
          description: item.description,
          cost_center: item.costCenter || "",
          project: item.project || null,
        })),
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Expense Claim/`,
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

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit expense claim");
      }

      setIsSubmitting(false);
      showAlert(
        "Success",
        "Expense claim submitted successfully",
        "OK",
        () => {
          setAlertVisible(false);
          setExpenseItems([]);
          setTaxItems([]);
          navigation.goBack();
        }
      );
    } catch (error) {
      console.error("Error submitting expense claim:", error);
      showAlert(
        "Error",
        `Failed to submit expense claim: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsSubmitting(false);
    }
  };

  const formatDateForAPI = (date: Date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case TabType.EXPENSES:
        return (
          <ExpensesTab
            expenseItems={expenseItems}
            taxItems={taxItems}
            totalAmount={totalAmount}
            totalTaxAmount={totalTaxAmount}
            setShowAddExpenseModal={setShowAddExpenseModal}
            setShowAddTaxModal={setShowAddTaxModal}
          />
        );
      case TabType.ADVANCES:
        return <AdvancesTab />;
        case TabType.TOTALS:
          return (
            <TotalsTab
              costCenter={expenseItems[0]?.costCenter || ""}
              totalAmount={totalAmount}
              totalSanctionedAmount={totalSanctionedAmount}
            />
          );
      default:
        return (
          <ExpensesTab
            expenseItems={expenseItems}
            taxItems={taxItems}
            totalAmount={totalAmount}
            totalTaxAmount={totalTaxAmount}
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
      <Header onBackPress={handleBackPress} title="New Expense Claim" />

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
            <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <AddExpenseModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        expenseItems={expenseItems}
        setExpenseItems={setExpenseItems}
      />

      <AddTaxModal
        visible={showAddTaxModal}
        onClose={() => setShowAddTaxModal(false)}
        taxItems={taxItems}
        setTaxItems={setTaxItems}
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
