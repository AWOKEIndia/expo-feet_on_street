import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";
import { ExpenseItem } from "../types";

interface ExpenseItemCardProps {
  item: ExpenseItem;
  index: number;
}

const ExpenseItemCard: React.FC<ExpenseItemCardProps> = ({ item, index }) => {
  const { theme } = useTheme();

  const formatDate = (date: Date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
          {item.expense_type}
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
        Sanctioned: ₹{" "}
        {item.sanctioned_amount ? item.sanctioned_amount.toFixed(0) : item.amount.toFixed(0)} · {formatDate(item.date)}
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

export default ExpenseItemCard;
