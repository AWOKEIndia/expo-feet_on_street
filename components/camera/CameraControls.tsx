import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FlashMode } from "expo-camera";

type CameraControlsProps = {
  onClose: () => void;
  onFlip: () => void;
  onCapture: () => void;
  onFlashToggle: () => void;
  isCapturing: boolean;
  flashMode: FlashMode;
};

export default function CameraControls({
  onClose,
  onFlip,
  onCapture,
  onFlashToggle,
  isCapturing,
  flashMode,
}: CameraControlsProps) {
  // Flash icon based on current mode
  const getFlashIcon = () => {
    switch (flashMode) {
      case "on":
        return "flash";
      case "auto":
        return "flash-outline";
      default:
        return "flash-off";
    }
  };

  return (
    <>
      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onFlashToggle}>
          <Ionicons name={getFlashIcon()} size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.flipButton} onPress={onFlip}>
          <Ionicons name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.capturingButton]}
          onPress={onCapture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  capturingButton: {
    opacity: 0.7,
  },
});
