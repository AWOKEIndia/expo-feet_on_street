import { CameraControls } from "@/components/camera/CameraControls";
import { PermissionScreen } from "@/components/camera/PermissionScreen";
import { useTheme } from "@/contexts/ThemeContext";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");

  const { theme, isDark } = useTheme();
  const { height, width } = Dimensions.get("window");

  const handleRequestPermission = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const toggleFlashMode = useCallback(() => {
    setFlashMode((current) => {
      if (current === "off") return "on";
      if (current === "on") return "auto";
      return "off";
    });
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      const timestamp = new Date().getTime();
      const filename = `photo_${timestamp}.jpg`;
      const directory = `${FileSystem.documentDirectory}photos/`;

      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      const filePath = `${directory}${filename}`;
      await FileSystem.writeAsStringAsync(filePath, photo.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`Photo saved to: ${filePath}`);
      // router.push(`/session/photo-review?path=${encodeURIComponent(filePath)}`);
    } catch (error) {
      console.error("Error taking picture:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  if (!permission) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.brandColors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <PermissionScreen
        onRequestPermission={handleRequestPermission}
        theme={theme}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        flash={flashMode}
      >
        <CameraControls
          onClose={() => router.back()}
          onFlip={toggleCameraFacing}
          onCapture={takePicture}
          onFlashToggle={toggleFlashMode}
          isCapturing={isCapturing}
          flashMode={flashMode}
        />
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
  },
});
