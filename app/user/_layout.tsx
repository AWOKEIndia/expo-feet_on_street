import { Stack } from "expo-router";
import React from "react";

export default function _layout() {
  return (
    <React.Fragment>
      <Stack options={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "My Profile" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </React.Fragment>
  );
}
