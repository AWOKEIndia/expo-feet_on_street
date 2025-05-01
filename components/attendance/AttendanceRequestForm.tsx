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
import { useAuthContext } from "@/contexts/AuthContext";
import useReasonOptions from "@/hooks/useAttendanceReason";
import useShift from "@/hooks/useShift";
import AlertDialog from "../AlertDialog";

interface AttendanceRequestFormProps {
  onSubmit: (data: AttendanceRequestData) => void;
  onCancel: () => void;
}

interface AttendanceRequestData {
  fromDate: Date | null;
  toDate: Date | null;
  isHalfDay: boolean;
  includeHolidays: boolean;
  shift: string;
  reason: string;
  explanation: string;
}

const AttendanceRequestForm: React.FC<AttendanceRequestFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { theme, isDark } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();

  const {
    data: reasonOptions,
    loading: reasonsLoading,
    error: reasonsError,
    refresh: refreshReasons
  } = useReasonOptions(accessToken as string);

  const {
    data: shiftTypes,
    loading: shiftsLoading,
    error: shiftsError,
    refresh: refreshShifts
  } = useShift(accessToken as string);

  const [formData, setFormData] = useState<AttendanceRequestData>({
    fromDate: null,
    toDate: null,
    isHalfDay: false,
    includeHolidays: false,
    shift: "",
    reason: "",
    explanation: "",
  });

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert dialog states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmText, setAlertConfirmText] = useState("OK");
  const [alertShowCancel, setAlertShowCancel] = useState(false);
  const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>(() => {});
  const [alertCancelAction, setAlertCancelAction] = useState<() => void>(() => {});

  // Show alert helper function
  const showAlert = (
    title: string,
    message: string,
    confirmText = "OK",
    onConfirm = () => setAlertVisible(false),
    showCancel = false,
    onCancel = () => setAlertVisible(false)
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmText(confirmText);
    setAlertShowCancel(showCancel);
    setAlertConfirmAction(() => onConfirm);
    setAlertCancelAction(() => onCancel);
    setAlertVisible(true);
  };

  useEffect(() => {
    if (reasonsError) {
      console.error("Error fetching reason options:", reasonsError);
      showAlert("Error", "Failed to load reason options. Please try again.");
    }
  }, [reasonsError]);

  useEffect(() => {
    if (shiftsError) {
      console.error("Error fetching shift types:", shiftsError);
      showAlert("Error", "Failed to load shift types. Please try again.");
    }
  }, [shiftsError]);

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

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const toggleCheckbox = (field: "isHalfDay" | "includeHolidays") => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const validateForm = (): boolean => {
    if (!formData.fromDate) {
      showAlert("Validation Error", "Please select a from date");
      return false;
    }

    if (!formData.toDate) {
      showAlert("Validation Error", "Please select a to date");
      return false;
    }

    if (formData.fromDate > formData.toDate) {
      showAlert("Validation Error", "To date cannot be before from date");
      return false;
    }

    if (!formData.reason) {
      showAlert("Validation Error", "Please select a reason");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Based on your sample response, we structure the payload to match expected format
      const payload = {
        data: {
          doctype: "Attendance Request",
          employee: employeeProfile?.name,
          employee_name: employeeProfile?.employee_name,
          department: employeeProfile?.department,
          company: employeeProfile?.company,
          from_date: formatDateForAPI(formData.fromDate),
          to_date: formatDateForAPI(formData.toDate),
          half_day: formData.isHalfDay ? 1 : 0,
          include_holidays: formData.includeHolidays ? 1 : 0,
          reason: formData.reason,
          explanation: formData.explanation || "",
          shift: formData.shift || "",
        }
      };

      console.log("Submitting attendance request:", JSON.stringify(payload));

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Attendance Request/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();
      console.log("API Response:", responseText);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP error! status: ${response.status}, Response: ${responseText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.warn("Failed to parse response as JSON:", e);
        result = { message: "Request successful but couldn't parse response" };
      }

      console.log("Attendance request submitted successfully:", result);

      // Show success alert
      showAlert(
        "Success",
        "Attendance request submitted successfully",
        "OK",
        () => {
          setAlertVisible(false);
          // Call the onSubmit callback with the form data
          onSubmit(formData);
        }
      );
    } catch (error) {
      console.error("Error submitting attendance request:", error);
      showAlert(
        "Error",
        `Failed to submit attendance request: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // For handling dropdown outside tap
  useEffect(() => {
    if (showShiftDropdown || showReasonDropdown) {
      // Create listener for touches outside the dropdown
      const handleOutsideTouch = () => {
        setShowShiftDropdown(false);
        setShowReasonDropdown(false);
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
          if (showShiftDropdown || showReasonDropdown) {
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
  }, [showShiftDropdown, showReasonDropdown]);

  // Handle back button with confirmation
  const handleBackPress = () => {
    if (
      formData.fromDate ||
      formData.toDate ||
      formData.isHalfDay ||
      formData.includeHolidays ||
      formData.shift ||
      formData.reason ||
      formData.explanation
    ) {
      // Show confirmation dialog if form has data
      showAlert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        "Discard",
        () => {
          setAlertVisible(false);
          onCancel();
        },
        true,
        () => setAlertVisible(false)
      );
    } else {
      onCancel();
    }
  };

  // Show Android date picker
  const showAndroidDatePicker = (field: "fromDate" | "toDate") => {
    // Close any open dropdown first
    setShowShiftDropdown(false);
    setShowReasonDropdown(false);

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
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.iconPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          New Attendance Request
        </Text>
      </View>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          Keyboard.dismiss();
          setShowShiftDropdown(false);
          setShowReasonDropdown(false);
        }}
      >
        <ScrollView
          style={[styles.form, { backgroundColor: theme.colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
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
                minimumDate={new Date(new Date().getTime() - 31 * 24 * 60 * 60 * 1000)}
              />
            )}
          </View>

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
                display="default"
                onChange={(event, date) =>
                  handleDateChange("toDate", event, date)
                }
                minimumDate={formData.fromDate || new Date()}
              />
            )}
          </View>

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

          <View style={styles.checkboxRow}>
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => toggleCheckbox("includeHolidays")}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 1,
                  borderColor: theme.colors.checkboxBorder,
                  backgroundColor: formData.includeHolidays
                    ? theme.colors.checkboxFill
                    : theme.colors.inputBackground,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: theme.borderRadius.xs,
                }}
              >
                {formData.includeHolidays && (
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
              Include Holidays
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
              Shift
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: showShiftDropdown
                    ? theme.colors.inputBorderFocus
                    : theme.colors.inputBorder,
                },
              ]}
              onPress={() => {
                setShowShiftDropdown(!showShiftDropdown);
                setShowReasonDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: formData.shift
                      ? theme.colors.textPrimary
                      : theme.colors.inputPlaceholder,
                  },
                ]}
              >
                {formData.shift || "Select Shift Type"}
              </Text>
              <Ionicons
                name={showShiftDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.iconSecondary}
              />
            </TouchableOpacity>

            {showShiftDropdown && (
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
                {shiftTypes.length > 0 ? (
                  shiftTypes.map((shift, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        {
                          borderBottomColor:
                            index < shiftTypes.length - 1
                              ? theme.colors.divider
                              : "transparent",
                          borderBottomWidth: index < shiftTypes.length - 1 ? 1 : 0,
                          backgroundColor:
                            formData.shift === shift.name
                              ? theme.colors.highlight
                              : theme.colors.surfacePrimary,
                        },
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, shift: shift.name });
                        setShowShiftDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {shift.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : shiftsLoading ? (
                  <View style={styles.emptyDropdownItem}>
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textSecondary }]}>
                      Loading shift types...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyDropdownItem}>
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textSecondary }]}>
                      No shift types available
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.reasonHeaderContainer}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Reason <Text style={{ color: theme.statusColors.error }}>*</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: showReasonDropdown
                    ? theme.colors.inputBorderFocus
                    : theme.colors.inputBorder,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setShowReasonDropdown(!showReasonDropdown);
                setShowShiftDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: formData.reason
                      ? theme.colors.textPrimary
                      : theme.colors.inputPlaceholder,
                  },
                ]}
              >
                {formData.reason || "Select Reason"}
              </Text>
              <Ionicons
                name={showReasonDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.iconSecondary}
              />
            </TouchableOpacity>

            {showReasonDropdown && (
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
                {reasonOptions.length > 0 ? (
                  reasonOptions.map((reason, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        {
                          borderBottomColor:
                            index < reasonOptions.length - 1
                              ? theme.colors.divider
                              : "transparent",
                          borderBottomWidth: index < reasonOptions.length - 1 ? 1 : 0,
                          backgroundColor:
                            formData.reason === reason
                              ? theme.colors.highlight
                              : theme.colors.surfacePrimary,
                        },
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, reason });
                        setShowReasonDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : reasonsLoading ? (
                  <View style={styles.emptyDropdownItem}>
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textSecondary }]}>
                      Loading reason options...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyDropdownItem}>
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textSecondary }]}>
                      No reason options available
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
              Explanation
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
              placeholder="Enter Explanation"
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={formData.explanation}
              onChangeText={(text) =>
                setFormData({ ...formData, explanation: text })
              }
            />
          </View>
        </ScrollView>
      </Pressable>

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
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text
            style={[styles.saveButtonText, { color: theme.baseColors.white }]}
          >
            {isSubmitting ? "Submitting..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Alert Dialog Component */}
      <AlertDialog
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText={alertConfirmText}
        cancelText="Cancel"
        showCancel={alertShowCancel}
        onConfirm={alertConfirmAction}
        onCancel={alertCancelAction}
        theme={theme}
      />
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
    marginBottom: 24,
    position: "relative",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  reasonHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reasonLoader: {
    marginLeft: 10,
  },
  refreshButton: {
    marginLeft: 10,
    padding: 4,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
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
  emptyDropdownItem: {
    padding: 16,
    alignItems: "center",
  },
  dropdownItemText: {
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

export default AttendanceRequestForm;
