import { useTheme } from "@/contexts/ThemeContext";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width / 3 - 16;

export default function GalleryScreen() {
  const { theme } = useTheme();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const directory = `${FileSystem.documentDirectory}photos/`;
        const dirInfo = await FileSystem.getInfoAsync(directory);

        if (dirInfo.exists) {
          const files = await FileSystem.readDirectoryAsync(directory);
          const photoPaths = files
            .filter((file) => file.endsWith(".jpg"))
            .map((file) => `${directory}${file}`);
          setPhotos(photoPaths.reverse()); // Newest first
        }
      } catch (error) {
        console.error("Error loading photos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `/session/photo-review`,
          params: { path: encodeURIComponent(item) },
        })
      }
    >
      <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
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
      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>
            No photos yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
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
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 8,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
