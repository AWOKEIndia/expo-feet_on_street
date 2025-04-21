import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  BackHandler,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppState } from "react-native";

interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestData) => void;
  onCancel: () => void;
}

interface LeaveRequestData {
  leaveType: string;
  fromDate: Date | null;
  toDate: Date | null;
  isHalfDay: boolean;
  reason: string;
  leaveApprover: string;
  leaveApproverName: string;
  attachments: any[];
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { theme, isDark } = useTheme();

  const [formData, setFormData] = useState<LeaveRequestData>({
    leaveType: "",
    fromDate: null,
    toDate: null,
    isHalfDay: false,
    reason: "",
    leaveApprover: "",
    leaveApproverName: "",
    attachments: [],
  });

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = useState(false);
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  // Handle app state changes to properly close date pickers if app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState === "active" && nextAppState.match(/inactive|background/)) {
        setShowFromDatePicker(false);
        setShowToDatePicker(false);
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Sample data for dropdowns
  const leaveTypes = ["Annual Leave", "Sick Leave", "Work From Home", "Casual Leave"];
  const approvers = [
    { email: "it@awokeindia.com", name: "Apavayan Sinha" },
    { email: "hr@awokeindia.com", name: "HR Department" },
  ];

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDateChange = (
    field: "fromDate" | "toDate",
    event: any,
    selectedDate?: Date
  ) => {
    // Always close picker on Android after selection (or cancel)
    if (Platform.OS === "android") {
      setShowFromDatePicker(false);
      setShowToDatePicker(false);
    }

    // Don't update the date if user canceled (Android returns undefined on cancel)
    if (event.type === "set" && selectedDate) {
      setFormData({ ...formData, [field]: selectedDate });
    }
  };

  const toggleCheckbox = (field: "isHalfDay") => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  // For handling dropdown outside tap
  useEffect(() => {
    if (showLeaveTypeDropdown || showApproverDropdown) {
      // Create listener for touches outside the dropdown
      const handleOutsideTouch = () => {
        setShowLeaveTypeDropdown(false);
        setShowApproverDropdown(false);
      };

      // Use Keyboard API to detect touches outside our components
      const keyboardListener = Keyboard.addListener(
        "keyboardDidHide",
        handleOutsideTouch
      );

      // Set up touch handler on the entire screen
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (showLeaveTypeDropdown || showApproverDropdown) {
            handleOutsideTouch();
            return true;
          }
          return false;
        }
      );

      return () => {
        keyboardListener.remove();
        backHandler.remove();
      };
    }
  }, [showLeaveTypeDropdown, showApproverDropdown]);

  // Show Android date picker
  const showAndroidDatePicker = (field: "fromDate" | "toDate") => {
    // Close any open dropdown first
    setShowLeaveTypeDropdown(false);
    setShowApproverDropdown(false);

    if (field === "fromDate") {
      setShowFromDatePicker(true);
      setShowToDatePicker(false);
    } else {
      setShowToDatePicker(true);
      setShowFromDatePicker(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.divider,
            backgroundColor: theme.colors.surfacePrimary,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.iconPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          New Leave Application
        </Text>
      </View>
      <ScrollView
        style={[styles.form, { backgroundColor: theme.colors.background }]}
      >
        {/* Leave Type Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Leave Type <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownContainer,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: showLeaveTypeDropdown
                  ? theme.colors.inputBorderFocus
                  : theme.colors.inputBorder,
              },
            ]}
            onPress={() => {
              setShowLeaveTypeDropdown(!showLeaveTypeDropdown);
              setShowApproverDropdown(false);
            }}
          >
            <Text
              style={[
                styles.inputText,
                {
                  color: formData.leaveType
                    ? theme.colors.textPrimary
                    : theme.colors.inputPlaceholder,
                },
              ]}
            >
              {formData.leaveType || "Select Leave Type"}
            </Text>
            <Ionicons
              name={showLeaveTypeDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.iconSecondary}
            />
          </TouchableOpacity>

          {showLeaveTypeDropdown && (
            <View
              style={[
                styles.dropdown,
                {
                  backgroundColor: theme.colors.surfacePrimary,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                  elevation: 4,
                },
              ]}
            >
              {leaveTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    {
                      borderBottomColor:
                        index < leaveTypes.length - 1
                          ? theme.colors.divider
                          : "transparent",
                      borderBottomWidth: index < leaveTypes.length - 1 ? 1 : 0,
                      backgroundColor:
                        formData.leaveType === type
                          ? theme.colors.highlight
                          : theme.colors.surfacePrimary,
                    },
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, leaveType: type });
                    setShowLeaveTypeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Section Divider */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Dates & Reason
          </Text>
        </View>

        {/* From Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            From Date <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
              },
            ]}
            onPress={() => showAndroidDatePicker("fromDate")}
          >
            <Text
              style={[
                styles.inputText,
                {
                  color: formData.fromDate
                    ? theme.colors.textPrimary
                    : theme.colors.inputPlaceholder,
                },
              ]}
            >
              {formData.fromDate
                ? formatDate(formData.fromDate)
                : "Select Date"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.iconSecondary}
              style={styles.calendarIcon}
            />
          </TouchableOpacity>

          {showFromDatePicker && (
            <DateTimePicker
              testID="fromDatePicker"
              value={formData.fromDate || new Date()}
              mode="date"
              display="default" // Use default for Android (calendar)
              onChange={(event, date) =>
                handleDateChange("fromDate", event, date)
              }
              minimumDate={new Date()}
              // Android styling props
              themeVariant={isDark ? "dark" : "light"}
              positiveButtonLabel="OK"
              negativeButtonLabel="Cancel"
              // These colors will be used for the calendar header and selected date
              accentColor={
                isDark ? theme.colors.textAccent : theme.brandColors.primary
              }
            />
          )}
        </View>

        {/* To Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            To Date <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
              },
            ]}
            onPress={() => showAndroidDatePicker("toDate")}
          >
            <Text
              style={[
                styles.inputText,
                {
                  color: formData.toDate
                    ? theme.colors.textPrimary
                    : theme.colors.inputPlaceholder,
                },
              ]}
            >
              {formData.toDate ? formatDate(formData.toDate) : "Select Date"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.iconSecondary}
              style={styles.calendarIcon}
            />
          </TouchableOpacity>

          {showToDatePicker && (
            <DateTimePicker
              testID="toDatePicker"
              value={formData.toDate || formData.fromDate || new Date()}
              mode="date"
              display="default" // Use default for Android (calendar)
              onChange={(event, date) =>
                handleDateChange("toDate", event, date)
              }
              minimumDate={formData.fromDate || new Date()}
              // Android styling props
              themeVariant={isDark ? "dark" : "light"}
              positiveButtonLabel="OK"
              negativeButtonLabel="Cancel"
              // These colors will be used for the calendar header and selected date
              accentColor={
                isDark ? theme.colors.textAccent : theme.brandColors.primary
              }
            />
          )}
        </View>

        {/* Half Day Checkbox */}
        <View style={styles.checkboxRow}>
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => toggleCheckbox("isHalfDay")}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderWidth: 1,
                borderColor: theme.colors.checkboxBorder,
                backgroundColor: formData.isHalfDay
                  ? theme.colors.checkboxFill
                  : theme.colors.inputBackground,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.borderRadius.xs,
              }}
            >
              {formData.isHalfDay && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={theme.baseColors.white}
                />
              )}
            </View>
          </Pressable>
          <Text
            style={[styles.checkboxLabel, { color: theme.colors.textPrimary }]}
          >
            Half Day
          </Text>
        </View>

        {/* Reason Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Reason
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.textPrimary,
              },
            ]}
            multiline
            placeholder="Enter Reason"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={formData.reason}
            onChangeText={(text) =>
              setFormData({ ...formData, reason: text })
            }
          />
        </View>

        {/* Section Divider */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Approval
          </Text>
        </View>

        {/* Leave Approver Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Leave Approver <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownContainer,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: showApproverDropdown
                  ? theme.colors.inputBorderFocus
                  : theme.colors.inputBorder,
              },
            ]}
            onPress={() => {
              setShowApproverDropdown(!showApproverDropdown);
              setShowLeaveTypeDropdown(false);
            }}
          >
            <Text
              style={[
                styles.inputText,
                {
                  color: formData.leaveApprover
                    ? theme.colors.textPrimary
                    : theme.colors.inputPlaceholder,
                },
              ]}
            >
              {formData.leaveApprover
                ? `${formData.leaveApprover} : ${formData.leaveApproverName}`
                : "Select Approver"}
            </Text>
            <Ionicons
              name={showApproverDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.iconSecondary}
            />
          </TouchableOpacity>

          {showApproverDropdown && (
            <View
              style={[
                styles.dropdown,
                {
                  backgroundColor: theme.colors.surfacePrimary,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                  elevation: 4,
                },
              ]}
            >
              {approvers.map((approver, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    {
                      borderBottomColor:
                        index < approvers.length - 1
                          ? theme.colors.divider
                          : "transparent",
                      borderBottomWidth: index < approvers.length - 1 ? 1 : 0,
                      backgroundColor:
                        formData.leaveApprover === approver.email
                          ? theme.colors.highlight
                          : theme.colors.surfacePrimary,
                    },
                  ]}
                  onPress={() => {
                    setFormData({
                      ...formData,
                      leaveApprover: approver.email,
                      leaveApproverName: approver.name,
                    });
                    setShowApproverDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {`${approver.email} : ${approver.name}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Leave Approver Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Leave Approver Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.textPrimary,
              },
            ]}
            value={formData.leaveApproverName}
            editable={false}
            placeholderTextColor={theme.colors.inputPlaceholder}
          />
        </View>

        {/* Section Divider */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Attachments
          </Text>
        </View>

        {/* Attachments Field */}
        <View style={styles.fieldContainer}>
          <TouchableOpacity
            style={[
              styles.attachmentContainer,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
              },
            ]}
            // Implement attachment handling logic here
          >
            <View style={styles.attachmentContent}>
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color={theme.colors.iconSecondary}
              />
              <Text
                style={[
                  styles.attachmentText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Upload images or documents
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={[
          styles.saveButtonContainer,
          {
            backgroundColor: theme.colors.surfacePrimary,
            borderTopColor: theme.colors.divider,
            borderTopWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.colors.buttonPrimary,
            },
          ]}
          onPress={handleSubmit}
        >
          <Text
            style={[styles.saveButtonText, { color: theme.baseColors.white }]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
  },
  form: {
    padding: 16,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
    position: "relative",
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    fontSize: 14,
    flex: 1,
  },
  calendarIcon: {
    marginLeft: 8,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkboxContainer: {
    padding: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 16,
    zIndex: 1000,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 16,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  attachmentContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentText: {
    marginTop: 8,
    fontSize: 14,
  },
  saveButtonContainer: {
    padding: 12,
  },
  saveButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LeaveRequestForm;
