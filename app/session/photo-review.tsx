import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
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
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { path, fromCreate, imageType, imageIndex } = useLocalSearchParams<{
    path: string;
    fromCreate?: string;
    imageType?: string;
    imageIndex?: string;
  }>();

  const [photoAssets, setPhotoAssets] = useState<MediaLibrary.Asset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isFromCreateForm = fromCreate === "true";

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true);
      try {
        const album = await MediaLibrary.getAlbumAsync("Feet On Street");
        if (!album) {
          setPhotoAssets([]);
          return;
        }
        const assetsResponse = await MediaLibrary.getAssetsAsync({
          album: album.id,
          mediaType: "photo",
          sortBy: [["modificationTime", true]],
        });
        const assets = assetsResponse.assets;
        setPhotoAssets(assets);

        // Set the initial photo index if a specific path is provided
        if (path) {
          const initialIndex = assets.findIndex(
            (asset) => asset.uri === decodeURIComponent(path)
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

  const getFileName = (asset: MediaLibrary.Asset) => asset.filename || "Unknown";

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleClose = () => router.back();

  const handleGoToGallery = () => router.push("/gallery");

  const handleAccept = () => {
    if (isFromCreateForm && currentIndex >= 0 && currentIndex < photoAssets.length) {
      // Return to the create form with the photo URI
      if (navigation.canGoBack()) {
        navigation.goBack();

        // Pass the result back to the previous screen
        // @ts-ignore - TypeScript doesn't know about the setParams method
        navigation.getParent()?.setParams({
          capturedPhotoUri: photoAssets[currentIndex].uri,
          imageType: imageType || "session",
          imageIndex: imageIndex || "0"
        });
      }
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        url: photoAssets[currentIndex].uri,
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
            await MediaLibrary.deleteAssetsAsync([photoAssets[currentIndex].id]);
            const updatedAssets = photoAssets.filter(
              (_, index) => index !== currentIndex
            );
            setPhotoAssets(updatedAssets);

            if (updatedAssets.length === 0) {
              handleClose();
            } else {
              setCurrentIndex((prev) =>
                prev >= updatedAssets.length ? updatedAssets.length - 1 : prev
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
    if (currentIndex < photoAssets.length - 1) {
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

  if (photoAssets.length === 0) {
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

  const currentAsset = photoAssets[currentIndex];

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

        {isFromCreateForm && (
          <View style={styles.headerPrompt}>
            <Text style={styles.promptText}>
              Use this photo for your session?
            </Text>
          </View>
        )}
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentAsset.uri }}
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
            <Ionicons name="chevron-back" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              { opacity: currentIndex < photoAssets.length - 1 ? 1 : 0.5 },
            ]}
            onPress={handleNext}
            disabled={currentIndex === photoAssets.length - 1}
          >
            <Ionicons name="chevron-forward" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* File information overlay */}
        <View style={styles.infoOverlay}>
          <Text style={[styles.infoTitle, { color: "white" }]}>Details</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: "white" }]}>Name:</Text>
            <Text style={[styles.infoValue, { color: "white" }]}>
              {getFileName(currentAsset)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: "white" }]}>
              Modified:
            </Text>
            <Text style={[styles.infoValue, { color: "white" }]}>
              {formatDate(currentAsset.modificationTime)}
            </Text>
          </View>

          <Text style={[styles.infoCounter, { color: "rgba(255,255,255,0.7)" }]}>
            {currentIndex + 1} of {photoAssets.length}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionContainer}>
        {isFromCreateForm ? (
          <>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.buttonError },
              ]}
              onPress={handleClose}
            >
              <Ionicons name="close-circle-outline" size={22} color="white" />
              <Text style={[styles.actionText, { color: "white" }]}>
                Reject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.buttonSuccess || "#4CAF50" },
              ]}
              onPress={handleAccept}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color="white" />
              <Text style={[styles.actionText, { color: "white" }]}>
                Accept
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.buttonSecondary },
              ]}
              onPress={handleGoToGallery}
            >
              <Ionicons name="grid" size={22} color={theme.colors.textPrimary} />
              <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>
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
              <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>
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
          </>
        )}
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
    flexDirection: "row",
    alignItems: "center",
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
  headerPrompt: {
    flex: 1,
    alignItems: "center",
    marginRight: 40, // Balance with close button width
  },
  promptText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
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
