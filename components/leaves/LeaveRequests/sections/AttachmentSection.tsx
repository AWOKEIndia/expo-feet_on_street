import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { sharedStyles } from "../styles";
import { Attachment } from "../types";

interface AttachmentsSectionProps {
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  setAttachments,
}) => {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      setUploading(true);

      // Request permissions first (for Android)
      if (Platform.OS !== 'web') {
        const permissionResult = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: true, // Changed to true for better reliability
        });

        if (!permissionResult.canceled && permissionResult.assets && permissionResult.assets.length > 0) {
          const asset = permissionResult.assets[0];

          // Validate file size (limit to 5MB)
          if (asset.size && asset.size > 5 * 1024 * 1024) {
            Alert.alert("File too large", "Please select a file smaller than 5MB");
            return;
          }

          console.log("Document picked:", asset);

          const newAttachment: Attachment = {
            uri: asset.uri,
            name: asset.name || `Document_${Date.now()}`,
            type: asset.mimeType || "application/octet-stream",
            size: asset.size || 0,
          };

          setAttachments([...attachments, newAttachment]);
        }
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Format file size for display
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      {/* Section Divider */}
      <View style={sharedStyles.sectionContainer}>
        <Text
          style={[sharedStyles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          Attachments
        </Text>
      </View>

      {/* Attachments Field */}
      <View style={sharedStyles.fieldContainer}>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
          <TouchableOpacity
            style={[
              sharedStyles.attachmentContainer,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                flex: 1,
                padding: 12,
                opacity: uploading ? 0.7 : 1,
              },
            ]}
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
                style={[
                  sharedStyles.attachmentText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {uploading ? "Processing..." : "Upload Images or Documents"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* List of attachments */}
        {attachments.length > 0 ? (
          attachments.map((attachment, index) => (
            <View
              key={index}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 10,
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderRadius: 16,
                  marginBottom: 8,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons
                  name={
                    attachment.type.startsWith("image/")
                      ? "image-outline"
                      : "document-outline"
                  }
                  size={20}
                  color={theme.colors.iconSecondary}
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      { color: theme.colors.textPrimary },
                      { flexShrink: 1 },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {attachment.name}
                  </Text>
                  <Text
                    style={[
                      { color: theme.colors.textSecondary, fontSize: 12 },
                    ]}
                  >
                    {formatFileSize(attachment.size)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeAttachment(index)}>
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color={theme.colors.iconError}
                />
              </TouchableOpacity>
            </View>
          ))
        ) : null}
        {attachments.length > 0 && (
          <Text style={{ marginVertical: 10, color: theme.colors.textSecondary, fontSize: 12 }}>
            Note: File uploads are limited to 5MB each
          </Text>
        )}
      </View>
    </>
  );
};

export default AttachmentsSection;
