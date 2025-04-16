import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PhotoReviewScreen() {
  const { theme } = useTheme();
  const { path } = useLocalSearchParams<{ path: string }>();

  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fileInfo, setFileInfo] = useState<FileSystem.FileInfo | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const directory = `${FileSystem.documentDirectory}photos/`;
        const files = await FileSystem.readDirectoryAsync(directory);

        const photoPaths = files.map((file) => `${directory}${file}`);
        setPhotoPaths(photoPaths);

        // Set the initial photo index if a specific path is provided
        if (path) {
          const initialIndex = photoPaths.findIndex(
            (photo) => photo === decodeURIComponent(path)
          );
          setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
        }
      } catch (error) {
        console.error("Failed to load photos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
  }, [path]);

  useEffect(() => {
    const getFileInformation = async () => {
      if (photoPaths.length > 0) {
        const info = await FileSystem.getInfoAsync(photoPaths[currentIndex]);
        setFileInfo(info);
      }
    };

    getFileInformation();
  }, [photoPaths, currentIndex]);

  const getFileName = (filePath: string) => {
    return filePath.split("/").pop() || "Unknown";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleClose = () => router.back();

  const handleGoToGallery = () => router.push("/gallery");

  const handleShare = async () => {
    try {
      await Share.share({
        url: photoPaths[currentIndex],
      });
    } catch (error) {
      console.error("Error sharing photo:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(photoPaths[currentIndex]);

            // Update photo array
            const updatedPaths = photoPaths.filter(
              (_, index) => index !== currentIndex
            );
            setPhotoPaths(updatedPaths);

            if (updatedPaths.length === 0) {
              // No more photos, go back
              handleClose();
            } else {
              // Move to the next photo, or previous if we're at the end
              setCurrentIndex((prev) =>
                prev >= updatedPaths.length ? updatedPaths.length - 1 : prev
              );
            }
          } catch (error) {
            console.error("Failed to delete photo:", error);
            Alert.alert("Error", "Failed to delete this photo");
          }
        },
      },
    ]);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photoPaths.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
      </SafeAreaView>
    );
  }

  if (photoPaths.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.textPrimary }}>
          No photos available
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          accessibilityLabel="Close preview"
        >
          <View style={styles.closeButtonInner}>
            <Ionicons name="close" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photoPaths[currentIndex] }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Captured photo"
        />

        {/* Navigation controls */}
        <View style={styles.navigationControls}>
          <TouchableOpacity
            style={[styles.navButton, { opacity: currentIndex > 0 ? 1 : 0.5 }]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={30}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              { opacity: currentIndex < photoPaths.length - 1 ? 1 : 0.5 },
            ]}
            onPress={handleNext}
            disabled={currentIndex === photoPaths.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={30}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* File information overlay */}
        <View style={styles.infoOverlay}>
          <Text style={[styles.infoTitle, { color: "white" }]}>
            Details
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: "white" }]}>
              Name:
            </Text>
            <Text style={[styles.infoValue, { color: "white" }]}>
              {getFileName(photoPaths[currentIndex])}
            </Text>
          </View>

          {fileInfo && (
            <>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: "white" }]}>
                  Size:
                </Text>
                <Text style={[styles.infoValue, { color: "white" }]}>
                  {/* @ts-ignore */}
                  {formatFileSize(fileInfo.size)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: "white" }]}>
                  Modified:
                </Text>
                <Text style={[styles.infoValue, { color: "white" }]}>
                  {/* @ts-ignore */}
                  {formatDate(fileInfo.modificationTime * 1000)}
                </Text>
              </View>
            </>
          )}

          <Text style={[styles.infoCounter, { color: "rgba(255,255,255,0.7)" }]}>
            {currentIndex + 1} of {photoPaths.length}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.buttonSecondary },
          ]}
          onPress={handleGoToGallery}
        >
          <Ionicons name="grid" size={22} color={theme.colors.textPrimary} />
          <Text
            style={[styles.actionText, { color: theme.colors.textPrimary }]}
          >
            Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.buttonSecondary },
          ]}
          onPress={handleShare}
        >
          <Ionicons
            name="share-outline"
            size={22}
            color={theme.colors.textPrimary}
          />
          <Text
            style={[styles.actionText, { color: theme.colors.textPrimary }]}
          >
            Share
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.buttonError },
          ]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={22} color="white" />
          <Text style={[styles.actionText, { color: "white" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  closeButton: {
    alignSelf: "flex-start",
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  image: {
    flex: 1,
    width: "100%",
  },
  navigationControls: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    top: "50%",
    paddingHorizontal: 10,
    transform: [{ translateY: -25 }],
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
  },
  infoCounter: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  actionText: {
    marginLeft: 8,
    fontWeight: "500",
  },
});
