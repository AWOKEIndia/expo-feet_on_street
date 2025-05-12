import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";

import { AdvancesTabProps } from "../types";

const AdvancesTab: React.FC<AdvancesTabProps> = ({
  advanceItems,
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.tabContent}>
      {advanceItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>
            No advances added
          </Text>
        </View>
      ) : (
        advanceItems.map((item, index) => (
          <View key={index} style={styles.container}>
            <Text style={{ color: theme.colors.textSecondary }}>
              {item.description}
            </Text>
            <Text style={{ color: theme.colors.textSecondary }}>
              {item.amount}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default AdvancesTab;
