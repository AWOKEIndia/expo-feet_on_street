import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

export default function CallbackLoadingScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: "https://erp.awokeindia.com/files/logo-sq.png" }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <ActivityIndicator size={"large"} color={theme.brandColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 24,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});
