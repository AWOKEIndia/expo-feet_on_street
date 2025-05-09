import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";
import { TaxItem } from "../types";

interface TaxItemCardProps {
  item: TaxItem;
  index: number;
}

const TaxItemCard: React.FC<TaxItemCardProps> = ({ item, index }) => {
  const { theme } = useTheme();

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
          {item.account_head}
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
        Rate: {item.rate || "0"}% · {item.description}
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

export default TaxItemCard;
