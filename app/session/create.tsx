import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "expo-router";
import React, { useEffect, useState, useRef } from "react"; // 1. Import useRef
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-virtualized-view";
import { useAuth } from "@/hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import VillageSearchInput from "@/components/VillageSearchInput";

type Village = {
  name: string;
  village_name?: string;
  village_code?: string;
  [key: string]: any;
};

const CreateSessionReport = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { employeeProfile, accessToken } = useAuth();

  const [disableOnFetch, setDisableOnFetch] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [sessionImages, setSessionImages] = useState<
    Array<{ uri: string } | null>
  >([null, null, null, null]);
  const [participantImages, setParticipantImages] = useState<
    Array<{ uri: string } | null>
  >([null, null, null]);

  const [formData, setFormData] = useState({
    trainer_name: "",
    date: new Date(),
    participants: "",
    head_count: "",
    no_of_males: "",
    no_of_females: "",
    feedback: "",
    employee: "",
    employee_id: "",
    village_name: "",
    village: "",
    block: "",
    cfl_center: "",
    district: "",
    region: "",
    state: "",
  });

  // 2. Create a ref to hold temporary form data
  const tempFormData = useRef(formData);

  // Sync ref when formData is updated by something other than user input
  useEffect(() => {
    tempFormData.current = formData;
  }, [formData]);

  useEffect(() => {
    if (employeeProfile) {
      setFormData((prevData) => ({
        ...prevData,
        employee: employeeProfile.employee_name,
        employee_id: employeeProfile.name || "",
        trainer_name: employeeProfile.employee_name,
      }));
      setDisableOnFetch(true);
    }
  }, [employeeProfile]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const params = navigation?.getParent()?.getParams?.() || {};

      if (
        params.capturedPhotoUri &&
        params.imageType &&
        params.imageIndex !== undefined
      ) {
        const type = params.imageType as "session" | "participant";
        const index = params.imageIndex as number;
        const uri = params.capturedPhotoUri as string;

        if (uri && uri.startsWith("file://")) {
          if (type === "session") {
            const updatedImages = [...sessionImages];
            updatedImages[index] = { uri };
            setSessionImages(updatedImages);
          } else {
            const updatedImages = [...participantImages];
            updatedImages[index] = { uri };
            setParticipantImages(updatedImages);
          }

          navigation.getParent()?.setParams({
            capturedPhotoUri: undefined,
            imageType: undefined,
            imageIndex: undefined,
          });
        }
      }
    });

    return unsubscribe;
  }, [navigation, sessionImages, participantImages]);

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleInputChange("date", selectedDate);
    }
  };

  const handleVillageSelect = (village: Village) => {
    setFormData((prev) => ({
      ...prev,
      village: village.name,
      village_name: village.village_name || village.name,
      block: village.block || "",
      cfl_center: village.cfl_center || "",
      district: village.district || "",
      region: village.region || "",
      state: village.state || "",
    }));
  };

  const openMediaPicker = async (
    type: "session" | "participant",
    index: number
  ) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need gallery access to select photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        if (type === "session") {
          const updatedImages = [...sessionImages];
          updatedImages[index] = { uri: selectedAsset.uri };
          setSessionImages(updatedImages);
        } else {
          const updatedImages = [...participantImages];
          updatedImages[index] = { uri: selectedAsset.uri };
          setParticipantImages(updatedImages);
        }
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Failed to open photo picker");
    }
  };

  const takePhoto = (type: "session" | "participant", index: number) => {
    navigation.navigate("session/camera", {
      returnToCreate: "true",
      type: type,
      index: index.toString(),
    });
  };

  const addSessionImage = (index: number) => {
    Alert.alert("Add Session Image", "Choose an option", [
      { text: "Take Photo", onPress: () => takePhoto("session", index) },
      {
        text: "Choose from Gallery",
        onPress: () => openMediaPicker("session", index),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const addParticipantImage = (index: number) => {
    Alert.alert("Add Participant List Image", "Choose an option", [
      { text: "Take Photo", onPress: () => takePhoto("participant", index) },
      {
        text: "Choose from Gallery",
        onPress: () => openMediaPicker("participant", index),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const submitReport = async () => {
    if (
      !formData.date ||
      !formData.participants ||
      !formData.head_count ||
      !formData.no_of_males ||
      !formData.no_of_females ||
      !formData.employee ||
      !formData.village
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill all required (*) fields."
      );
      return;
    }
    if (!sessionImages[0] || !sessionImages[1]) {
      Alert.alert(
        "Missing Images",
        "Please upload at least the first two training photos."
      );
      return;
    }
    if (!participantImages[0]) {
      Alert.alert(
        "Missing Images",
        "Please upload at least one participant list page."
      );
      return;
    }
    if (
      isNaN(Number(formData.participants)) ||
      isNaN(Number(formData.head_count)) ||
      isNaN(Number(formData.no_of_males)) ||
      isNaN(Number(formData.no_of_females))
    ) {
      Alert.alert("Invalid Input", "Participant counts must be valid numbers.");
      return;
    }

    Alert.alert("Submitting", "Please wait while we process your report...");

    try {
      const uploadFile = async (uri: string, filename: string) => {
        const formData = new FormData();
        formData.append("file", {
          uri,
          name: filename,
          type: "image/jpeg",
        } as any);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/upload_file`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData,
          }
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to upload file");
        }
        return result.message.file_url;
      };

      const fileUrls: Record<string, string> = {};

      for (let i = 0; i < sessionImages.length; i++) {
        const image = sessionImages[i];
        if (image?.uri) {
          fileUrls[`session_image_${i + 1}`] = await uploadFile(
            image.uri,
            `session_${Date.now()}_${i + 1}.jpg`
          );
        }
      }
      for (let i = 0; i < participantImages.length; i++) {
        const image = participantImages[i];
        if (image?.uri) {
          fileUrls[`participant_list_image_${i + 1}`] = await uploadFile(
            image.uri,
            `participant_${Date.now()}_${i + 1}.jpg`
          );
        }
      }

      const sessionData = {
        doctype: "CFL Session",
        trainer_name: String(formData.trainer_name),
        date: formData.date.toISOString().split("T")[0],
        participants: String(formData.participants),
        head_count: String(formData.head_count),
        no_of_males: String(formData.no_of_males),
        no_of_females: String(formData.no_of_females),
        feedback: String(formData.feedback || ""),
        employee: String(formData.employee),
        employee_id: String(formData.employee_id),
        village: String(formData.village),
        village_name: String(formData.village_name || formData.village),
        block: String(formData.block || ""),
        cfl_center: String(formData.cfl_center || ""),
        district: String(formData.district || ""),
        region: String(formData.region || ""),
        state: String(formData.state || ""),
        ...fileUrls,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/CFL Session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(sessionData),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        let errorMsg = result._server_messages
          ? JSON.parse(result._server_messages)
              .map((m: any) => JSON.parse(m).message)
              .join("\n")
          : "Submission failed";
        throw new Error(errorMsg);
      }

      Alert.alert("Success", "Session report submitted successfully");
      setFormData({
        trainer_name: "",
        date: new Date(),
        participants: "",
        head_count: "",
        no_of_males: "",
        no_of_females: "",
        feedback: "",
        employee: "",
        employee_id: "",
        village_name: "",
        village: "",
        block: "",
        cfl_center: "",
        district: "",
        region: "",
        state: "",
      });
      setSessionImages([null, null, null, null]);
      setParticipantImages([null, null, null]);
    } catch (error: any) {
      console.error("Submission error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit report. Please try again."
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.colors.surfacePrimary },
          ]}
        >
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
            Employee Information
          </Text>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Employee Name
              </Text>
              {/* --- MODIFIED INPUT --- */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: !disableOnFetch
                      ? theme.colors.surfacePrimary
                      : theme.colors.backgroundAlt,
                  },
                ]}
                placeholder="Employee name"
                placeholderTextColor={theme.colors.textTertiary}
                defaultValue={formData.employee}
                editable={!disableOnFetch}
                onChangeText={(text) => {
                  tempFormData.current.employee = text;
                }}
                onEndEditing={() =>
                  handleInputChange("employee", tempFormData.current.employee)
                }
              />
            </View>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Employee ID
              </Text>
              {/* --- MODIFIED INPUT --- */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: !disableOnFetch
                      ? theme.colors.surfacePrimary
                      : theme.colors.backgroundAlt,
                  },
                ]}
                placeholder="Employee ID"
                placeholderTextColor={theme.colors.textTertiary}
                defaultValue={formData.employee_id}
                editable={!disableOnFetch}
                onChangeText={(text) => {
                  tempFormData.current.employee_id = text;
                }}
                onEndEditing={() =>
                  handleInputChange(
                    "employee_id",
                    tempFormData.current.employee_id
                  )
                }
              />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Trainer Name
              </Text>
              {/* --- MODIFIED INPUT --- */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: !disableOnFetch
                      ? theme.colors.surfacePrimary
                      : theme.colors.backgroundAlt,
                  },
                ]}
                placeholder="Trainer name"
                placeholderTextColor={theme.colors.textTertiary}
                defaultValue={formData.trainer_name}
                editable={!disableOnFetch}
                onChangeText={(text) => {
                  tempFormData.current.trainer_name = text;
                }}
                onEndEditing={() =>
                  handleInputChange(
                    "trainer_name",
                    tempFormData.current.trainer_name
                  )
                }
              />
            </View>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Training Date{" "}
                <Text style={{ color: theme.statusColors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.datePickerContainer,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfacePrimary,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: theme.colors.textPrimary }}>
                  {formData.date.toLocaleDateString()}
                </Text>
                <Ionicons
                  name="calendar"
                  size={20}
                  color={theme.brandColors.primary}
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>
          </View>
        </View>

        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.colors.surfacePrimary },
          ]}
        >
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
            Session Information
          </Text>
          <Text
            style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}
          >
            Village <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <View style={styles.componentWrapper}>
            <VillageSearchInput
              accessToken={accessToken ?? ""}
              onVillageSelect={handleVillageSelect}
              initialValue={formData.village_name}
            />
          </View>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No of Participants{" "}
                <Text style={{ color: theme.statusColors.error }}>*</Text>
              </Text>
              {/* --- MODIFIED INPUT --- */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfacePrimary,
                  },
                ]}
                placeholder="No. of participants"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
                defaultValue={formData.participants}
                onChangeText={(text) => {
                  tempFormData.current.participants = text;
                }}
                onEndEditing={() =>
                  handleInputChange(
                    "participants",
                    tempFormData.current.participants
                  )
                }
              />
            </View>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Head Count{" "}
                <Text style={{ color: theme.statusColors.error }}>*</Text>
              </Text>
              {/* --- MODIFIED INPUT --- */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfacePrimary,
                  },
                ]}
                placeholder="Enter head count"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
                defaultValue={formData.head_count}
                onChangeText={(text) => {
                  tempFormData.current.head_count = text;
                }}
                onEndEditing={() =>
                  handleInputChange(
                    "head_count",
                    tempFormData.current.head_count
                  )
                }
              />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No. of Males{" "}
                <Text style={{ color: theme.statusColors.error }}>*</Text>
              </Text>
              {/* --- MODIFIED INPUT --- */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfacePrimary,
                  },
                ]}
                placeholder="Enter male count"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
                defaultValue={formData.no_of_males}
                onChangeText={(text) => {
                  tempFormData.current.no_of_males = text;
                }}
                onEndEditing={() =>
                  handleInputChange(
                    "no_of_males",
                    tempFormData.current.no_of_males
                  )
                }
              />
            </View>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No. of Females{" "}
                <Text style={{ color: theme.statusColors.error }}>*</Text>
              </Text>
              {/* --- MODIFIED INPUT --- */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.surfacePrimary,
                  },
                ]}
                placeholder="Enter female count"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
                defaultValue={formData.no_of_females}
                onChangeText={(text) => {
                  tempFormData.current.no_of_females = text;
                }}
                onEndEditing={() =>
                  handleInputChange(
                    "no_of_females",
                    tempFormData.current.no_of_females
                  )
                }
              />
            </View>
          </View>
          <View style={styles.fullWidthField}>
            <Text
              style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}
            >
              Feedback
            </Text>
            {/* --- MODIFIED INPUT --- */}
            <TextInput
              style={[
                styles.textAreaInput,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  backgroundColor: theme.colors.surfacePrimary,
                  textAlignVertical: "top",
                },
              ]}
              placeholder="Enter session feedback or observations..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline={true}
              numberOfLines={4}
              defaultValue={formData.feedback}
              onChangeText={(text) => {
                tempFormData.current.feedback = text;
              }}
              onEndEditing={() =>
                handleInputChange("feedback", tempFormData.current.feedback)
              }
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Session Images{" "}
            <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Upload 4 images of the session (first 2 required)
          </Text>
          <View style={styles.imagesGridContainer}>
            {sessionImages.map((image, index) => (
              <TouchableOpacity
                key={`session-img-${index}`}
                style={[
                  styles.imageUploadContainer,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderWidth: index < 2 ? 2 : 1,
                    borderColor:
                      index < 2 && !image
                        ? theme.statusColors.error
                        : theme.colors.border,
                  },
                ]}
                onPress={() => addSessionImage(index)}
              >
                {image ? (
                  <Image source={image} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <Ionicons
                      name="camera"
                      size={30}
                      color={theme.brandColors.primary}
                    />
                    <Text
                      style={[
                        styles.imageUploadText,
                        { color: theme.brandColors.primary },
                      ]}
                    >
                      Image {index + 1}
                      {index < 2 && (
                        <Text style={{ color: theme.statusColors.error }}>
                          {" "}
                          *
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Participant List{" "}
            <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Upload participant list pages (first page required)
          </Text>
          <View style={styles.participantImagesContainer}>
            {participantImages.map((image, index) => (
              <TouchableOpacity
                key={`participant-img-${index}`}
                style={[
                  styles.participantImageUpload,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderWidth: index === 0 ? 2 : 1,
                    borderColor:
                      index === 0 && !image
                        ? theme.statusColors.error
                        : theme.colors.border,
                  },
                ]}
                onPress={() => addParticipantImage(index)}
              >
                {image ? (
                  <Image source={image} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <Ionicons
                      name="camera"
                      size={30}
                      color={theme.brandColors.primary}
                    />
                    <Text
                      style={[
                        styles.imageUploadText,
                        { color: theme.brandColors.primary },
                      ]}
                    >
                      Page {index + 1}
                      {index === 0 && (
                        <Text style={{ color: theme.statusColors.error }}>
                          {" "}
                          *
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.colors.surfacePrimary },
          ]}
        >
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
            Geographical Information
          </Text>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                CFL Center
              </Text>
              <View
                style={[
                  styles.fieldValueContainer,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fieldValue,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {formData.cfl_center || "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                District
              </Text>
              <View
                style={[
                  styles.fieldValueContainer,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fieldValue,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {formData.district || "N/A"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Region
              </Text>
              <View
                style={[
                  styles.fieldValueContainer,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fieldValue,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {formData.region || "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                State
              </Text>
              <View
                style={[
                  styles.fieldValueContainer,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fieldValue,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {formData.state || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.brandColors.primary },
          ]}
          onPress={submitReport}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: theme.colors.textInverted },
            ]}
          >
            Submit Session Report
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  componentWrapper: {
    zIndex: 10,
    marginBottom: 20,
  },
  container: { flex: 1 },
  contentContainer: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  formCard: { borderRadius: 12, padding: 16, marginBottom: 20 },
  formTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    width: "100%",
  },
  formField: { width: "48%" },
  fieldLabel: { fontSize: 14, marginBottom: 6, fontWeight: "500" },
  textInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 44,
  },
  datePickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fullWidthField: { width: "100%", marginBottom: 12 },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 100,
  },
  fieldValueContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  fieldValue: { fontSize: 14 },
  sectionContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  sectionDescription: { fontSize: 14, marginBottom: 16 },
  imagesGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageUploadContainer: {
    width: "48%",
    aspectRatio: 4 / 3,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageUploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageUploadText: { marginTop: 10, fontSize: 14, fontWeight: "500" },
  uploadedImage: { width: "100%", height: "100%", resizeMode: "cover" },
  participantImagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  participantImageUpload: {
    width: "31%",
    aspectRatio: 4 / 3,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: { fontSize: 16, fontWeight: "600" },
});

export default CreateSessionReport;
