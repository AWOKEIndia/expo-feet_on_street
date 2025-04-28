import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Text, TextInput, View } from "react-native";
import { sharedStyles } from "../styles";

interface ReasonSectionProps {
  formData: {
    reason: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const ReasonSection: React.FC<ReasonSectionProps> = ({ formData, setFormData }) => {
  const { theme } = useTheme();

  return (
    <View style={sharedStyles.fieldContainer}>
      <Text style={[sharedStyles.label, { color: theme.colors.textPrimary }]}>
        Reason
      </Text>
      <TextInput
        style={[
          sharedStyles.input,
          sharedStyles.textarea,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.textPrimary,
          },
        ]}
        multiline
        placeholder="Enter Reason"
        placeholderTextColor={theme.colors.inputPlaceholder}
        value={formData.reason}
        onChangeText={(text) =>
          setFormData({ ...formData, reason: text })
        }
      />
    </View>
  );
};

export default ReasonSection;
