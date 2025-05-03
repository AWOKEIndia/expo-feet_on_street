import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/components/attendance/attendanceRequest/styles";
import { useTheme } from "@/contexts/ThemeContext";

interface FormHeader {
  onBackPress: () => void;
  title: string;
}

export const HeaderSection: React.FC<FormHeader> = ({ onBackPress, title }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: theme.colors.divider,
          backgroundColor: theme.colors.surfacePrimary,
        },
      ]}
    >
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons
          name="chevron-back"
          size={24}
          color={theme.colors.iconPrimary}
        />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
    </View>
  );
};
