import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";
import AttachmentsSection from "./AttachmentSection";
import { MediaItem, ExpenseItem, TaxItem } from "@/components/expenseClaim/types";
import { ExpensesTabProps } from "../types";

const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenseItems,
  taxItems,
  totalAmount,
  totalTaxAmount,
  setShowAddExpenseModal,
  setShowAddTaxModal,
}) => {
  const { theme } = useTheme();
  const [attachments, setAttachments] = useState<MediaItem[]>([]);

  const formatDate = (date: Date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderItemCard = (item: ExpenseItem | TaxItem, isTaxItem: boolean) => {
    return (
      <View
        style={[
          styles.expenseItemCard,
          {
            backgroundColor: theme.colors.surfacePrimary,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.expenseItemHeader}>
          <Text
            style={[
              styles.expenseItemType,
              { color: theme.colors.textPrimary },
            ]}
          >
            {isTaxItem ? (item as TaxItem).account_head : (item as ExpenseItem).expense_type}
          </Text>
          <TouchableOpacity>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.iconSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.expenseItemDate,
            { color: theme.colors.textSecondary },
          ]}
        >
          {isTaxItem
            ? `Rate: ${(item as TaxItem).rate || "0"}% · ${(item as TaxItem).description}`
            : `Sanctioned: ₹ ${(item as ExpenseItem).sanctioned_amount
                ? ((item as ExpenseItem).sanctioned_amount ?? 0).toFixed(0)
                : (item as ExpenseItem).amount.toFixed(0)} · ${formatDate((item as ExpenseItem).date)}`}
        </Text>
        <View style={styles.expenseItemAmount}>
          <Text
            style={[
              styles.expenseItemAmountText,
              { color: theme.colors.textPrimary },
            ]}
          >
            ₹ {item.amount.toFixed(0)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.approverSection}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Expense Approver <Text style={{ color: theme.statusColors.error }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <View style={styles.approverContainer}>
            <Text
              style={[styles.inputText, { color: theme.colors.textPrimary }]}
              numberOfLines={1}
            >
              it@awokeindia.com : Apavayan Sinha
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.iconSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.expenseListHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Expenses
        </Text>
        <View style={styles.amountSection}>
          <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
            ₹ {totalAmount.toFixed(0)}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddExpenseModal(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.iconPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {expenseItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>
            No expenses added
          </Text>
        </View>
      ) : (
        expenseItems.map((item, index) => (
          <View key={index}>
            {renderItemCard(item, false)}
          </View>
        ))
      )}

      <View style={styles.sectionDivider}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Taxes & Charges
        </Text>
        <View style={styles.amountSection}>
          <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
            ₹ {totalTaxAmount.toFixed(0)}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddTaxModal(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.iconPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {taxItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>
            No taxes added
          </Text>
        </View>
      ) : (
        taxItems.map((item, index) => (
          <View key={index}>
            {renderItemCard(item, true)}
          </View>
        ))
      )}

      <AttachmentsSection
        attachments={attachments}
        setAttachments={setAttachments}
        styles={styles}
      />
    </ScrollView>
  );
};

export default ExpensesTab;
