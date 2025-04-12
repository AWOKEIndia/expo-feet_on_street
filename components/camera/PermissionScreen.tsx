import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PermissionScreenProps = {
  title: string;
  message: string;
  onRequestPermission: () => void;
  theme: any; // Replace with proper theme type
};

export default function PermissionScreen({
  title,
  message,
  onRequestPermission,
  theme,
}: PermissionScreenProps) {
  return (
    <View
      style={[
        styles.permissionContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Ionicons
        name="lock-closed-outline"
        size={64}
        color={theme.colors.textPrimary}
        style={styles.permissionIcon}
      />
      <Text
        style={[styles.permissionTitle, { color: theme.colors.textPrimary }]}
      >
        {title}
      </Text>
      <Text
        style={[styles.permissionText, { color: theme.colors.textSecondary }]}
      >
        {message}
      </Text>
      <TouchableOpacity
        style={[
          styles.permissionButton,
          { backgroundColor: theme.brandColors.primary },
        ]}
        onPress={onRequestPermission}
      >
        <Text
          style={[
            styles.permissionButtonText,
            { color: theme.baseColors.white },
          ]}
        >
          Grant Permission
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Permission screens
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  }
});
