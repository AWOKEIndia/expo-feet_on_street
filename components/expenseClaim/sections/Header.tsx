import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";

interface HeaderProps {
  onBackPress: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onBackPress, title }) => {
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

export default Header;
