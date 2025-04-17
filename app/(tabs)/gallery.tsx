import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  isThisMonth,
  isThisWeek,
  isToday,
  isYesterday,
} from "date-fns";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Dimensions,
  Alert,
  Share,
} from "react-native";

type PhotoItem = MediaLibrary.Asset;

type GallerySection = {
  title: string;
  data: PhotoItem[][];
};

const NUM_COLUMNS = 3;
const SPACING = 2;
const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - (NUM_COLUMNS + 1) * SPACING * 2) / NUM_COLUMNS;

export default function GalleryScreen() {
  const { theme } = useTheme();
  const [sections, setSections] = useState<GallerySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const loadPhotos = useCallback(async () => {
    try {
      setError(null);
      const album = await MediaLibrary.getAlbumAsync("Feet On Street");
      if (!album) {
        setSections([]);
        return;
      }
      const assetsResponse = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: "photo",
        sortBy: [["modificationTime", false]],
      });
      const photoItems = assetsResponse.assets;

      if (photoItems.length === 0) {
        setSections([]);
        return;
      }

      // Sort by creation time (newest first)
      const sortedPhotos = photoItems.sort(
        (a, b) => (b.creationTime ?? 0) - (a.creationTime ?? 0)
      );

      const categorizedPhotos = categorizePhotos(sortedPhotos);
      setSections(categorizedPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
      setError("Failed to load photos. Pull down to retry.");
    }
  }, []);

  useEffect(() => {
    loadPhotos().finally(() => setLoading(false));
  }, [loadPhotos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  }, [loadPhotos]);

  const categorizePhotos = (photos: PhotoItem[]): GallerySection[] => {
    const photosMap: Record<string, PhotoItem[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
    };
    const olderPhotos: Record<string, PhotoItem[]> = {};

    photos.forEach((photo) => {
      const date = new Date(photo.modificationTime);

      if (isToday(date)) {
        photosMap.today.push(photo);
      } else if (isYesterday(date)) {
        photosMap.yesterday.push(photo);
      } else if (isThisWeek(date)) {
        photosMap.thisWeek.push(photo);
      } else if (isThisMonth(date)) {
        photosMap.thisMonth.push(photo);
      } else {
        const monthYear = format(date, "MMMM yyyy");
        if (!olderPhotos[monthYear]) {
          olderPhotos[monthYear] = [];
        }
        olderPhotos[monthYear].push(photo);
      }
    });

    const sections: GallerySection[] = [];

    // Helper to chunk array into rows of NUM_COLUMNS
    const chunkIntoRows = (photos: PhotoItem[]): PhotoItem[][] => {
      const rows: PhotoItem[][] = [];
      for (let i = 0; i < photos.length; i += NUM_COLUMNS) {
        rows.push(photos.slice(i, i + NUM_COLUMNS));
      }
      return rows;
    };

    // Add recent sections
    if (photosMap.today.length)
      sections.push({ title: "Today", data: chunkIntoRows(photosMap.today) });

    if (photosMap.yesterday.length)
      sections.push({
        title: "Yesterday",
        data: chunkIntoRows(photosMap.yesterday),
      });

    if (photosMap.thisWeek.length)
      sections.push({
        title: "This Week",
        data: chunkIntoRows(photosMap.thisWeek),
      });

    if (photosMap.thisMonth.length)
      sections.push({
        title: "This Month",
        data: chunkIntoRows(photosMap.thisMonth),
      });

    // Add older months sorted chronologically
    Object.keys(olderPhotos)
      .sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB.getTime() - dateA.getTime();
      })
      .forEach((monthYear) => {
        sections.push({
          title: monthYear,
          data: chunkIntoRows(olderPhotos[monthYear]),
        });
      });

    return sections;
  };

  const toggleSelectionMode = useCallback((initialPhoto?: PhotoItem) => {
    setSelectionMode(true);
    if (initialPhoto) {
      setSelectedPhotos(new Set([initialPhoto.id]));
    } else {
      setSelectedPhotos(new Set());
    }
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedPhotos(new Set());
  }, []);

  const togglePhotoSelection = useCallback((photo: PhotoItem) => {
    setSelectedPhotos((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(photo.id)) {
        newSelection.delete(photo.id);
      } else {
        newSelection.add(photo.id);
      }
      return newSelection;
    });
  }, []);

  const handlePhotoPress = useCallback((photo: PhotoItem) => {
    if (selectionMode) {
      togglePhotoSelection(photo);
    } else {
      router.push({
        pathname: `/session/photo-review`,
        params: { path: encodeURIComponent(photo.uri) },
      });
    }
  }, [selectionMode, togglePhotoSelection]);

  const handlePhotoLongPress = useCallback((photo: PhotoItem) => {
    if (!selectionMode) {
      toggleSelectionMode(photo);
    }
  }, [selectionMode, toggleSelectionMode]);

  const handleBulkDelete = useCallback(() => {
    if (selectedPhotos.size === 0) return;

    Alert.alert(
      "Delete Photos",
      `Are you sure you want to delete ${selectedPhotos.size} photo${selectedPhotos.size > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await MediaLibrary.deleteAssetsAsync(Array.from(selectedPhotos));
              exitSelectionMode();
              onRefresh();
            } catch (error) {
              console.error("Failed to delete photos:", error);
              Alert.alert("Error", "Failed to delete the selected photos");
            }
          },
        },
      ]
    );
  }, [selectedPhotos, exitSelectionMode, onRefresh]);

  const renderPhotoRow = ({ item }: { item: PhotoItem[] }) => (
    <View style={styles.row}>
      {item.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          style={[
            styles.imageContainer,
            selectedPhotos.has(photo.id) && styles.selectedImageContainer,
          ]}
          onPress={() => handlePhotoPress(photo)}
          onLongPress={() => handlePhotoLongPress(photo)}
          activeOpacity={0.7}
          delayLongPress={300}
        >
          <Image
            source={{ uri: photo.uri }}
            style={styles.image}
            resizeMode="cover"
          />
          {selectionMode && (
            <View
              style={[
                styles.selectionOverlay,
                selectedPhotos.has(photo.id) ? styles.selectedOverlay : null,
              ]}
            >
              {selectedPhotos.has(photo.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
      {Array(NUM_COLUMNS - item.length)
        .fill(0)
        .map((_, index) => (
          <View
            key={`empty-${index}`}
            style={[styles.imageContainer, styles.emptyImageSpace]}
          />
        ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {selectionMode && (
        <View
          style={[
            styles.selectionBar,
            { backgroundColor: theme.colors.buttonSecondary },
          ]}
        >
          <TouchableOpacity
            style={styles.selectionBarButton}
            onPress={exitSelectionMode}
          >
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text
            style={[
              styles.selectionCount,
              { color: theme.colors.textPrimary },
            ]}
          >
            {selectedPhotos.size} selected
          </Text>

          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={[
                styles.actionIcon,
                { opacity: selectedPhotos.size > 0 ? 1 : 0.5 },
              ]}
              onPress={handleBulkDelete}
              disabled={selectedPhotos.size === 0}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={theme.colors.buttonError}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error ? (
        <View style={styles.messageContainer}>
          <Text style={{ color: theme.colors.chartError }}>{error}</Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.buttonPrimary },
            ]}
            onPress={onRefresh}
          >
            <Text style={{ color: theme.colors.textPrimary }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.messageContainer}>
          <Ionicons
            name="images-outline"
            size={64}
            color={theme.colors.textSecondary}
            style={styles.emptyIcon}
          />
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No photos yet
          </Text>
          <Text
            style={{ color: theme.colors.textSecondary, textAlign: "center" }}
          >
            Photos you take will appear here
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.buttonPrimary },
            ]}
            onPress={onRefresh}
          >
            <Text style={{ color: theme.colors.textPrimary }}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderSectionHeader={({ section }) => (
            <Text
              style={[
                styles.sectionHeader,
                {
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              {section.title}
            </Text>
          )}
          renderItem={renderPhotoRow}
          keyExtractor={(item, index) => `section-${index}`}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.buttonPrimary]}
              tintColor={theme.colors.buttonPrimary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: SPACING,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    margin: SPACING,
    borderRadius: 4,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyImageSpace: {
    backgroundColor: "transparent",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  selectedImageContainer: {
    borderWidth: 2,
    borderColor: "#3498db",
  },
  selectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  selectedOverlay: {
    backgroundColor: "rgba(52, 152, 219, 0.4)",
  },
  checkmark: {
    margin: 6,
  },
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  selectionBarButton: {
    padding: 8,
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectionActions: {
    flexDirection: "row",
  },
  actionIcon: {
    padding: 8,
    marginLeft: 16,
  },
});
