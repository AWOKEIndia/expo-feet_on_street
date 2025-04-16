import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  isThisMonth,
  isThisWeek,
  isToday,
  isYesterday,
} from "date-fns";
import * as FileSystem from "expo-file-system";
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
} from "react-native";

type PhotoItem = {
  uri: string;
  creationTime: Date;
};

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

  const loadPhotos = useCallback(async () => {
    try {
      setError(null);
      const directory = `${FileSystem.documentDirectory}photos/`;
      const dirInfo = await FileSystem.getInfoAsync(directory);

      if (!dirInfo.exists) {
        // Create directory if it doesn't exist
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        setSections([]);
        return;
      }

      const files = await FileSystem.readDirectoryAsync(directory);
      const photoFiles = files.filter((file) => file.endsWith(".jpg"));

      if (photoFiles.length === 0) {
        setSections([]);
        return;
      }

      const photoItems = await Promise.all(
        photoFiles.map(async (file) => {
          const uri = `${directory}${file}`;
          try {
            return {
              uri,
              creationTime: getCreationDateFromFilename(file),
            };
          } catch (e) {
            console.warn(`Could not get info for ${file}`, e);
            return {
              uri,
              creationTime: getCreationDateFromFilename(file),
              size: 0,
            };
          }
        })
      );

      // Sort by creation time (newest first)
      const sortedPhotos = photoItems.sort(
        (a, b) => b.creationTime.getTime() - a.creationTime.getTime()
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

  const getCreationDateFromFilename = (filename: string): Date => {
    // Extract timestamp from filename like "photo_123456789.jpg"
    const timestamp = parseInt(filename.split("_")[1]?.split(".")[0] || "0");
    return new Date(timestamp || Date.now());
  };

  const categorizePhotos = (photos: PhotoItem[]): GallerySection[] => {
    const photosMap: Record<string, PhotoItem[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
    };
    const olderPhotos: Record<string, PhotoItem[]> = {};

    photos.forEach((photo) => {
      const date = photo.creationTime;

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

  const renderPhotoRow = ({ item }: { item: PhotoItem[] }) => (
    <View style={styles.row}>
      {item.map((photo, index) => (
        <TouchableOpacity
          key={photo.uri}
          style={styles.imageContainer}
          onPress={() =>
            router.push({
              pathname: `/session/photo-review`,
              params: { path: encodeURIComponent(photo.uri) },
            })
          }
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: photo.uri }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ))}
      {/* Add empty placeholders to maintain grid layout */}
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
          {/* Refresh button */}
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
});
