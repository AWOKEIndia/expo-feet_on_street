import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SessionReportScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Session ID: </Text>
      <Text>{id}</Text>
    </View>
  );
};

export default SessionReportScreen;
