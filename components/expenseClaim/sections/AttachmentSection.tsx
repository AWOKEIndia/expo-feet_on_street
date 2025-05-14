import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import MediaPicker from "@/components/MediaPicker";
import { MediaItem } from "@/components/expenseClaim/types";

interface AttachmentsSectionProps {
  attachments: MediaItem[];
  setAttachments: (attachments: MediaItem[]) => void;
  styles?: any;
  sectionTitle?: string;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  setAttachments,
  styles = {},
  sectionTitle = "Attachments"
}) => {
  const { theme } = useTheme();

  return (
    <>
      {/* Section Divider */}
      <View style={styles.sectionContainer || { marginVertical: 16 }}>
        <Text
          style={[
            styles.sectionTitle || { fontSize: 16, fontWeight: "bold" },
            { color: theme.colors.textPrimary }
          ]}
        >
          {sectionTitle}
        </Text>
      </View>

      {/* Attachments Field */}
      <View style={styles.fieldContainer || { marginBottom: 16 }}>
        <MediaPicker
          items={attachments}
          onItemsChange={setAttachments}
          maxFileSize={5 * 1024 * 1024}
          uploadText="Upload Images or Documents"
        />
      </View>
    </>
  );
};

export default AttachmentsSection;
