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

  const shifts = ["Day", "CFL Day"];
  const reasons = ["Work From Home", "On Duty"];

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

  const toggleCheckbox = (field: "isHalfDay" | "includeHolidays") => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const handleSubmit = () => {
    onSubmit(formData);
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
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
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
      <ScrollView
        style={[styles.form, { backgroundColor: theme.colors.background }]}
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
              minimumDate={new Date()}
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

        {/* Rest of the form remains the same */}
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
              {shifts.map((shift, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    {
                      borderBottomColor:
                        index < shifts.length - 1
                          ? theme.colors.divider
                          : "transparent",
                      borderBottomWidth: index < shifts.length - 1 ? 1 : 0,
                      backgroundColor:
                        formData.shift === shift
                          ? theme.colors.highlight
                          : theme.colors.surfacePrimary,
                    },
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, shift });
                    setShowShiftDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {shift}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Reason
          </Text>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Reason <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
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
              {reasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    {
                      borderBottomColor:
                        index < reasons.length - 1
                          ? theme.colors.divider
                          : "transparent",
                      borderBottomWidth: index < reasons.length - 1 ? 1 : 0,
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
              ))}
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
    marginBottom: 24,
    position: "relative",
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
