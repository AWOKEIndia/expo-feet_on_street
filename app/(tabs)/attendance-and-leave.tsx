import { View, Text } from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";

export default function AttendanceScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ThemedText>Attendance & Leaves</ThemedText>
    </View>
  );
}
