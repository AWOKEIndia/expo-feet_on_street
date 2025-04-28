import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { sharedStyles } from "../styles";

interface BalanceInfoProps {
  formData: {
    leaveType: string;
  };
  currentBalance: number | null;
  requestedDays: number;
  remainingBalance: number | null;
  isDark: boolean;
}

const BalanceInfo: React.FC<BalanceInfoProps> = ({
  formData,
  currentBalance,
  requestedDays,
  remainingBalance,
  isDark,
}) => {
  const { theme } = useTheme();

  const getBalanceStatusColor = () => {
    if (remainingBalance === null) return theme.colors.textSecondary;
    return remainingBalance >= 0
      ? theme.statusColors.success
      : theme.statusColors.error;
  };

  if (!formData.leaveType || currentBalance === null) return null;

  return (
    <View
      style={[
        sharedStyles.balanceInfoContainer,
        {
          backgroundColor: isDark
            ? theme.colors.surfaceSecondary
            : "rgba(0, 0, 0, 0.03)",
          borderColor: isDark
            ? theme.colors.border
            : "rgba(0, 0, 0, 0.1)",
        },
      ]}
    >
      <View style={sharedStyles.balanceRow}>
        <Text
          style={[
            sharedStyles.balanceLabel,
            { color: theme.colors.textSecondary },
          ]}
        >
          Current Balance:
        </Text>
        <Text
          style={[
            sharedStyles.balanceValue,
            { color: theme.colors.textPrimary },
          ]}
        >
          {currentBalance.toFixed(1)} days
        </Text>
      </View>

      <View style={sharedStyles.balanceRow}>
        <Text
          style={[
            sharedStyles.balanceLabel,
            { color: theme.colors.textSecondary },
          ]}
        >
          Requested:
        </Text>
        <Text
          style={[
            sharedStyles.balanceValue,
            { color: theme.colors.textError },
          ]}
        >
          {`- ${requestedDays.toFixed(1)}`} days
        </Text>
      </View>

      <View
        style={[
          sharedStyles.balanceDivider,
          { backgroundColor: theme.colors.divider },
        ]}
      />

      <View style={sharedStyles.balanceRow}>
        <Text
          style={[
            sharedStyles.balanceLabel,
            { color: theme.colors.textSecondary },
          ]}
        >
          Remaining Balance:
        </Text>
        <Text
          style={[
            sharedStyles.balanceValue,
            sharedStyles.remainingBalance,
            { color: getBalanceStatusColor() },
          ]}
        >
          {remainingBalance !== null
            ? remainingBalance.toFixed(1)
            : "0"}{" "}
          days
        </Text>
      </View>
    </View>
  );
};

export default BalanceInfo;
