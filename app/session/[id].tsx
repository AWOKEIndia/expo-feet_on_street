import { useTheme } from "@/contexts/ThemeContext";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, SafeAreaView, StatusBar } from "react-native";

const SessionReportScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  return (
    <SafeAreaView>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Text style={{ color: isDark ? 'white' : 'black' }}>Session ID: {id}</Text>
    </SafeAreaView>
  );
};

export default SessionReportScreen;
