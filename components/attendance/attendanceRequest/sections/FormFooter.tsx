import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "@/components/attendance/attendanceRequest/styles";
import { useTheme } from "@/contexts/ThemeContext";

interface FooterSectionProps {
  onPress: () => void;
  isSubmitting: boolean;
  buttonText?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onPress,
  isSubmitting,
  buttonText = "Save",
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.saveButtonContainer,
        {
          backgroundColor: theme.colors.surfacePrimary,
          borderTopColor: theme.colors.divider,
          borderTopWidth: 1,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: theme.colors.buttonPrimary,
            opacity: isSubmitting ? 0.7 : 1,
          },
        ]}
        onPress={onPress}
        disabled={isSubmitting}
      >
        <Text
          style={[styles.saveButtonText, { color: theme.baseColors.white }]}
        >
          {isSubmitting ? "Submitting..." : buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
