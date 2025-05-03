import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/components/attendance/attendanceRequest/styles";
import { useTheme } from "@/contexts/ThemeContext";

interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  value,
  onToggle,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.checkboxRow}>
      <Pressable
        style={styles.checkboxContainer}
        onPress={onToggle}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: theme.colors.checkboxBorder,
            backgroundColor: value
              ? theme.colors.checkboxFill
              : theme.colors.inputBackground,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.borderRadius.xs,
          }}
        >
          {value && (
            <Ionicons
              name="checkmark"
              size={16}
              color={theme.baseColors.white}
            />
          )}
        </View>
      </Pressable>
      <Text
        style={[styles.checkboxLabel, { color: theme.colors.textPrimary }]}
      >
        {label}
      </Text>
    </View>
  );
};
