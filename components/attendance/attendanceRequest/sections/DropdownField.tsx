import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/components/attendance/attendanceRequest/styles";
import { useTheme } from "@/contexts/ThemeContext";

interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  loading: boolean;
  error: any;
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  required?: boolean;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  value,
  options,
  loading,
  error,
  onSelect,
  isOpen,
  onToggle,
  required = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {label} {required && <Text style={{ color: theme.statusColors.error }}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.dropdownContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: isOpen
              ? theme.colors.inputBorderFocus
              : theme.colors.inputBorder,
          },
        ]}
        onPress={onToggle}
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
          {value || `Select ${label}`}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.iconSecondary}
        />
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
              elevation: 4,
            },
          ]}
        >
          {options.length > 0 ? (
            options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  {
                    borderBottomColor:
                      index < options.length - 1
                        ? theme.colors.divider
                        : "transparent",
                    borderBottomWidth: index < options.length - 1 ? 1 : 0,
                    backgroundColor:
                      value === option
                        ? theme.colors.highlight
                        : theme.colors.surfacePrimary,
                  },
                ]}
                onPress={() => {
                  onSelect(option);
                  onToggle();
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))
          ) : loading ? (
            <View style={styles.emptyDropdownItem}>
              <Text style={[styles.dropdownItemText, { color: theme.colors.textSecondary }]}>
                Loading {label.toLowerCase()} options...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyDropdownItem}>
              <Text style={[styles.dropdownItemText, { color: theme.colors.textSecondary }]}>
                No {label.toLowerCase()} options available
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
