import React from "react";
import { View, Text, TextInput } from "react-native";
import { styles } from "@/components/attendance/attendanceRequest/styles";
import { useTheme } from "@/contexts/ThemeContext";

interface TextInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "",
  multiline = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline ? styles.textarea : {},
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.textPrimary,
          },
        ]}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inputPlaceholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};
