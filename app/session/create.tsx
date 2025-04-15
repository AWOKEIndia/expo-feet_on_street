import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigation } from 'expo-router';

const CreateSessionReport = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme()

  const [sessionImages, setSessionImages] = useState<Array<{ uri: string } | null>>([null, null, null, null]);
  const [participantImages, setParticipantImages] = useState<Array<{ uri: string } | null>>([null, null]);
  const [formData, setFormData] = useState({
    state: 'To be auto-filled',
    region: 'To be auto-filled',
    district: 'To be auto-filled',
    cflCenter: 'To be auto-filled',
    block: 'To be auto-filled',
    village: '',
    sessionDate: new Date().toISOString().split('T')[0],
    participantCount: '',
    sessionNotes: '',
  });

  // Function to handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Function to add session image
  const addSessionImage = (index: number) => {
    navigation.navigate('session/camera', {
      onCapture: (uri: string) => {
        const updatedImages = [...sessionImages];
        updatedImages[index] = { uri };
        setSessionImages(updatedImages);

        if (sessionImages.filter(img => img !== null).length === 0) {
          setFormData({
            ...formData,
            state: 'To be auto-filled',
            district: 'To be auto-filled',
            cflCenter: 'To be auto-filled',
            block: 'To be auto-filled',
            region: 'To be auto-filled',
          });
        }
      }
    });
  };

  // Function to add participant list image
  const addParticipantImage = (index: number) => {
    navigation.navigate('session/camera', {
      onCapture: (uri: string) => {
        const updatedImages = [...participantImages];
        updatedImages[index] = { uri };
        setParticipantImages(updatedImages);
      }
    });
  };

  // Function to submit the report
  const submitReport = () => {
    // Validation check
    if (sessionImages.some(img => img === null)) {
      Alert.alert('Missing Images', 'Please upload all 4 session images');
      return;
    }

    if (participantImages.some(img => img === null)) {
      Alert.alert('Missing Images', 'Please upload both participant list images');
      return;
    }

    if (!formData.village) {
      Alert.alert('Missing Information', 'Please enter the village name');
      return;
    }

    // Handle submission
    Alert.alert('Success', 'Session report submitted successfully');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Session Images Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Session Images <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Upload at least 4 images of the session
          </Text>

          <View style={styles.imagesGridContainer}>
            {sessionImages.map((image, index) => (
              <TouchableOpacity
                key={`session-img-${index}`}
                style={[styles.imageUploadContainer, {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfacePrimary
                }]}
                onPress={() => addSessionImage(index)}
              >
                {image ? (
                  <Image source={image} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <Ionicons name="camera" size={30} color={theme.brandColors.primary} />
                    <Text style={[styles.imageUploadText, { color: theme.brandColors.primary }]}>
                      Image {index + 1}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form Fields Section */}
        <View style={[styles.formCard, {
          backgroundColor: theme.colors.surfacePrimary,
          ...theme.shadows.sm
        }]}>
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>Session Details</Text>

          {/* Auto-filled geo data fields */}
          <View style={styles.formSection}>
            <Text style={[styles.formSectionTitle, { color: theme.colors.textSecondary }]}>
              Location Data (Auto-extracted)
            </Text>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>State</Text>
                <View style={[styles.fieldValueContainer, {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
                    {formData.state}
                  </Text>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Region</Text>
                <View style={[styles.fieldValueContainer, {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
                    {formData.region}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>District</Text>
                <View style={[styles.fieldValueContainer, {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
                    {formData.district}
                  </Text>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>CFL Center</Text>
                <View style={[styles.fieldValueContainer, {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
                    {formData.cflCenter}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Block</Text>
                <View style={[styles.fieldValueContainer, {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }]}>
                  <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
                    {formData.block}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* User input fields */}
          <View style={styles.formSection}>
            <Text style={[styles.formSectionTitle, { color: theme.colors.textSecondary }]}>
              Additional Information
            </Text>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                  Village <Text style={{ color: theme.statusColors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfacePrimary
                  }]}
                  placeholder="Enter village name"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.village}
                  onChangeText={(text) => handleInputChange('village', text)}
                />
              </View>
                            <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                  Participant Count
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfacePrimary
                  }]}
                  placeholder="No. of participants"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="numeric"
                  value={formData.participantCount}
                  onChangeText={(text) => handleInputChange('participantCount', text)}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                  Session Date
                </Text>
                <View style={[styles.datePickerContainer, {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfacePrimary
                }]}>
                  <Text style={{ color: theme.colors.textPrimary }}>{formData.sessionDate}</Text>
                  <Ionicons name="calendar" size={20} color={theme.brandColors.primary} />
                </View>
              </View>
            </View>

            <View style={styles.fullWidthField}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Session Notes
              </Text>
              <TextInput
                style={[styles.textAreaInput, {
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surfacePrimary,
                  textAlignVertical: 'top'
                }]}
                placeholder="Enter session notes or observations..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline={true}
                numberOfLines={4}
                value={formData.sessionNotes}
                onChangeText={(text) => handleInputChange('sessionNotes', text)}
              />
            </View>
          </View>
        </View>

        {/* Participant List Images */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Participant List <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Upload 2 images of the participant list
          </Text>

          <View style={styles.participantImagesContainer}>
            {participantImages.map((image, index) => (
              <TouchableOpacity
                key={`participant-img-${index}`}
                style={[styles.participantImageUpload, {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfacePrimary
                }]}
                onPress={() => addParticipantImage(index)}
              >
                {image ? (
                  <Image source={image} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <Ionicons name="camera" size={30} color={theme.brandColors.primary} />
                    <Text style={[styles.imageUploadText, { color: theme.brandColors.primary }]}>
                      List {index + 1}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, {
            backgroundColor: theme.brandColors.primary,
            ...theme.shadows.md
          }]}
          onPress={submitReport}
        >
          <Text style={[styles.submitButtonText, { color: theme.colors.textInverted }]}>
            Submit Session Report
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  imagesGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageUploadContainer: {
    width: '48%',
    aspectRatio: 4/3,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageUploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  formField: {
    width: '48%',
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  fieldValueContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldValue: {
    fontSize: 14,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  datePickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullWidthField: {
    width: '100%',
    marginBottom: 12,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 100,
  },
  participantImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  participantImageUpload: {
    width: '48%',
    aspectRatio: 4/3,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerItemActive: {
    borderTopWidth: 2,
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default CreateSessionReport;
