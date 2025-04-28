import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { sharedStyles } from "../styles";

const AttachmentsSection: React.FC = () => {
  const { theme } = useTheme();

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
        <TouchableOpacity
          style={[
            sharedStyles.attachmentContainer,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <View style={sharedStyles.attachmentContent}>
            <Ionicons
              name="cloud-upload-outline"
              size={24}
              color={theme.colors.iconSecondary}
            />
            <Text
              style={[
                sharedStyles.attachmentText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Upload images or documents
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AttachmentsSection;
