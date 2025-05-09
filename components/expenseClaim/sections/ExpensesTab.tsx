import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";
import ExpenseItemCard from "./ExpenseItemCard";
import TaxItemCard from "./TaxItemCard";
import { ExpenseItem, TaxItem } from "../types";

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
          <ExpenseItemCard key={index} item={item} index={index} />
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
          <TaxItemCard key={index} item={item} index={index} />
        ))
      )}

      <View style={styles.sectionDivider}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Attachments
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.uploadContainer,
          { borderColor: theme.colors.border }
        ]}
      >
        <Ionicons name="arrow-up" size={24} color={theme.colors.iconSecondary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
          Upload images or documents
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ExpensesTab;
