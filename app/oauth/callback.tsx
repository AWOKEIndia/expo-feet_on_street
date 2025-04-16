import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function CallbackLoadingScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size={"large"} color={theme.brandColors.primary} />
    </View>
  );
}
