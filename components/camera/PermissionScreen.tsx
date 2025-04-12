import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PermissionScreenProps = {
  onRequestPermission: () => void;
  theme: any; // Replace with proper theme type
};

export const PermissionScreen = ({ onRequestPermission, theme }: PermissionScreenProps) => (
  <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <Text style={[styles.permissionText, { color: theme.colors.textPrimary }]}>
      Camera access is required
    </Text>
    <TouchableOpacity
      style={[styles.permissionButton, { backgroundColor: theme.colors.buttonPrimary }]}
      onPress={onRequestPermission}
    >
      <Text style={[styles.permissionButtonText, { color: theme.colors.textInverted }]}>
        Grant Permission
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
