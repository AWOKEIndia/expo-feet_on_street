import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";
import { TabType } from "../types";

interface TabBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.tabBar}>
      {Object.values(TabType).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && {
              borderBottomWidth: 2,
              borderBottomColor: theme.colors.buttonPrimary,
            },
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === tab
                    ? theme.colors.textPrimary
                    : theme.colors.textSecondary,
                fontWeight: activeTab === tab ? "600" : "normal",
              },
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabBar;
