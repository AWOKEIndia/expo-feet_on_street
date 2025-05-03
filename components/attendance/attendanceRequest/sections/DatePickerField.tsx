import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "@/components/attendance/attendanceRequest/styles";
import { useTheme } from "@/contexts/ThemeContext";

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (event: any, selectedDate?: Date) => void;
  showPicker: boolean;
  onPress: () => void;
  required?: boolean;
  minimumDate?: Date;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  showPicker,
  onPress,
  required = false,
  minimumDate,
}) => {
  const { theme } = useTheme();

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {label} {required && <Text style={{ color: theme.statusColors.error }}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
          },
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.inputText,
            {
              color: value
                ? theme.colors.textPrimary
                : theme.colors.inputPlaceholder,
            },
          ]}
        >
          {value ? formatDate(value) : "Select Date"}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={theme.colors.iconSecondary}
          style={styles.calendarIcon}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={onChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
};
