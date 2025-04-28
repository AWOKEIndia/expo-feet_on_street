import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { sharedStyles } from "../styles";

interface FormHeaderProps {
  onCancel: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ onCancel }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        sharedStyles.header,
        {
          borderBottomColor: theme.colors.divider,
          backgroundColor: theme.colors.surfacePrimary,
        },
      ]}
    >
      <TouchableOpacity style={sharedStyles.backButton} onPress={onCancel}>
        <Ionicons
          name="chevron-back"
          size={24}
          color={theme.colors.iconPrimary}
        />
      </TouchableOpacity>
      <Text style={[sharedStyles.title, { color: theme.colors.textPrimary }]}>
        New Leave Application
      </Text>
    </View>
  );
};

export default FormHeader;
