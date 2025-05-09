import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";

interface TotalsTabProps {
  costCenter: string;
  totalAmount: number;
  totalSanctionedAmount: number;
}

const TotalsTab: React.FC<TotalsTabProps> = ({
  costCenter,
  totalAmount,
  totalSanctionedAmount
}) => {
  const { theme } = useTheme();

  const formatDate = (date: Date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <ScrollView style={styles.tabContent}>
      {/* Totals Section */}
      <View style={styles.sectionDivider}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Totals
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Total Sanctioned Amount
        </Text>
        <View style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
          }
        ]}>
          <Text style={[styles.inputText, { color: theme.colors.textPrimary }]}>
            ₹ {totalSanctionedAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Total Claimed Amount
        </Text>
        <View style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
          }
        ]}>
          <Text style={[styles.inputText, { color: theme.colors.textPrimary }]}>
            ₹ {totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Grand Total
        </Text>
        <View style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
          }
        ]}>
          <Text style={[styles.inputText, {
            color: theme.colors.textPrimary,
            fontWeight: "bold",
            fontSize: 16
          }]}>
            ₹ {totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>


      {/* Accounting Details Section */}
      <View style={styles.sectionDivider}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Accounting Details
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Posting Date <Text style={{ color: theme.statusColors.error }}>*</Text>
        </Text>
        <View
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <Text style={[styles.inputText, { color: theme.colors.textPrimary }]}>
            {formatDate(new Date())}
          </Text>
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Payable Account
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownContainer,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.inputText,
              { color: theme.colors.inputPlaceholder },
            ]}
          >
            Select Account
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.colors.iconSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Accounting Dimensions Section */}
      <View style={styles.sectionDivider}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Accounting Dimensions
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Project
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownContainer,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.inputText,
              { color: theme.colors.inputPlaceholder },
            ]}
          >
            Select Project
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.colors.iconSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Cost Center
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownContainer,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <Text
            style={[styles.inputText, { color: theme.colors.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {costCenter}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.colors.iconSecondary}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TotalsTab;
