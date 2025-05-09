import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";

const AdvancesTab: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.emptyContainer}>
        <Text style={{ color: theme.colors.textSecondary }}>
          No advances added
        </Text>
      </View>
    </ScrollView>
  );
};

export default AdvancesTab;
