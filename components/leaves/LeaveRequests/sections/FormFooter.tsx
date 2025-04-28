import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { sharedStyles } from "../styles";

interface FormFooterProps {
  hasEnoughBalance: boolean;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

const FormFooter: React.FC<FormFooterProps> = ({
  hasEnoughBalance,
  handleSubmit,
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const isDisabled = isSubmitting || (!hasEnoughBalance);

  return (
    <View
      style={[
        sharedStyles.saveButtonContainer,
        {
          backgroundColor: theme.colors.surfacePrimary,
          borderTopColor: theme.colors.divider,
          },
        ]}
    >
      <TouchableOpacity
        style={[
          sharedStyles.saveButton,
          {
            backgroundColor: hasEnoughBalance
              ? theme.colors.buttonPrimary
              : theme.colors.buttonDisabled,
          },
        ]}
        onPress={handleSubmit}
        disabled={isDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={theme.baseColors.white} />
        ) : (
          <Text
            style={[sharedStyles.saveButtonText, { color: theme.baseColors.white }]}
          >
            Save
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FormFooter;
