import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { MediaItem , MediaPickerProps } from "./expenseClaim/types"

const MediaPicker: React.FC<MediaPickerProps> = ({
  items,
  onItemsChange,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  maxFiles,
  allowedTypes,
  containerStyle = {},
  uploadText = "Upload Images or Documents",
  processingText = "Processing...",
  fileSizeExceededMessage = "Please select a file smaller than",
  maxFilesExceededMessage = "Maximum number of files reached",
  uploadErrorMessage = "Failed to pick document. Please try again.",
  uploadIcon = "cloud-upload-outline",
}) => {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    // Check if max files limit reached
    if (maxFiles && items.length >= maxFiles) {
      Alert.alert("Limit Reached", maxFilesExceededMessage);
      return;
    }

    try {
      setUploading(true);

      // Request permissions and pick document
      if (Platform.OS !== 'web') {
        const permissionResult = await DocumentPicker.getDocumentAsync({
          type: allowedTypes || "*/*",
          copyToCacheDirectory: true,
        });

        if (!permissionResult.canceled && permissionResult.assets && permissionResult.assets.length > 0) {
          const asset = permissionResult.assets[0];

          // Validate file size
          if (asset.size && asset.size > maxFileSize) {
            Alert.alert(
              "File too large",
              `${fileSizeExceededMessage} ${formatFileSize(maxFileSize)}`
            );
            return;
          }

          console.log("Document picked:", asset);

          const newItem: MediaItem = {
            uri: asset.uri,
            name: asset.name || `Document_${Date.now()}`,
            type: asset.mimeType || "application/octet-stream",
            size: asset.size || 0,
          };

          onItemsChange([...items, newItem]);
        }
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", uploadErrorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onItemsChange(newItems);
  };

  // Format file size for display
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get the appropriate icon for the file type
  const getFileIcon = (type: string): string => {
    if (type.startsWith("image/")) return "image-outline";
    if (type.startsWith("video/")) return "videocam-outline";
    if (type.startsWith("audio/")) return "musical-notes-outline";
    if (type.startsWith("application/pdf")) return "document-text-outline";
    if (type.startsWith("application/vnd.ms-excel") ||
        type.startsWith("application/vnd.openxmlformats-officedocument.spreadsheetml"))
      return "grid-outline";
    if (type.startsWith("application/vnd.ms-powerpoint") ||
        type.startsWith("application/vnd.openxmlformats-officedocument.presentationml"))
      return "easel-outline";
    if (type.startsWith("application/msword") ||
        type.startsWith("application/vnd.openxmlformats-officedocument.wordprocessingml"))
      return "document-outline";
    return "document-outline";
  };

  return (
    <View style={containerStyle}>
      {/* Upload Button */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
            borderWidth: 1,
            borderRadius: 16,
            borderStyle: "dashed",
            flex: 1,
            padding: 12,
            opacity: uploading ? 0.7 : 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={pickDocument}
          disabled={uploading}
        >
          <View style={{ alignItems: "center" }}>
            {uploading ? (
              <ActivityIndicator color={theme.colors.textPrimary} />
            ) : (
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color={theme.colors.iconSecondary}
              />
            )}
            <Text
              style={{
                marginTop: 8,
                textAlign: "center",
                color: theme.colors.textSecondary,
                fontSize: 14,
              }}
            >
              {uploading ? processingText : uploadText}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* File List */}
      {items.length > 0 && (
        <View style={{ marginTop: 8 }}>
          {items.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 10,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 16,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons
                  name={getFileIcon(item.type) as any}
                  size={20}
                  color={theme.colors.iconSecondary}
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.colors.textPrimary,
                      flexShrink: 1,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {formatFileSize(item.size)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(index)}>
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color={theme.colors.iconError}
                />
              </TouchableOpacity>
            </View>
          ))}
          {maxFileSize && (
            <Text style={{ marginTop: 4, color: theme.colors.textSecondary, fontSize: 12 }}>
              Note: File uploads are limited to {formatFileSize(maxFileSize)} each
              {maxFiles ? ` (${items.length}/${maxFiles})` : ''}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default MediaPicker;
