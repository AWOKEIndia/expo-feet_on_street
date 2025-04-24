import React, { useState, useEffect, useMemo } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppState } from "react-native";
import useLeaveApprovers from "@/hooks/useLeaveApprover";
import useLeaveTypes from "@/hooks/useLeaveTypes";
import { useAuthContext } from "@/contexts/AuthContext";

interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestData) => void;
  onCancel: () => void;
}

interface LeaveRequestData {
  leaveType: string;
  leaveTypeName: string;
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
  const { accessToken, employeeProfile } = useAuthContext();

  const [formData, setFormData] = useState<LeaveRequestData>({
    leaveType: "",
    leaveTypeName: "",
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
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [requestedDays, setRequestedDays] = useState<number>(0);
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);

  // Use the leave approvers hook
  const {
    approvalDetails,
    loading: loadingApprovers,
    error: approversError,
    refresh: refreshApprovers,
  } = useLeaveApprovers(accessToken as string, employeeProfile?.name as string);

  // Use the leave types hook
  const {
    data: leaveTypes,
    loading: loadingLeaveTypes,
    error: leaveTypesError,
    refresh: refreshLeaveTypes,
    getBalanceForLeaveType,
    calculateDaysBetween,
  } = useLeaveTypes(accessToken as string, employeeProfile?.name as string);

  useEffect(() => {
    const days = calculateDaysBetween(
      formData.fromDate,
      formData.toDate,
      formData.isHalfDay
    );
    setRequestedDays(days);
  }, [
    formData.fromDate,
    formData.toDate,
    formData.isHalfDay,
    calculateDaysBetween,
  ]);

  useEffect(() => {
    if (formData.leaveType) {
      const balance = getBalanceForLeaveType(formData.leaveType);
      setCurrentBalance(balance);
      setRemainingBalance(balance - requestedDays);
    } else {
      setCurrentBalance(null);
      setRemainingBalance(null);
    }
  }, [formData.leaveType, requestedDays, getBalanceForLeaveType]);

  // Determine if the form can be submitted based on available balance
  const hasEnoughBalance = useMemo(() => {
    if (remainingBalance === null) return false;
    return remainingBalance >= 0;
  }, [remainingBalance]);

  // Add this function to get the balance status color
  const getBalanceStatusColor = () => {
    if (remainingBalance === null) return theme.colors.textSecondary;
    return remainingBalance >= 0
      ? theme.statusColors.success
      : theme.statusColors.error;
  };

  // Update the handleSubmit function to check balance before submitting
  const handleSubmitt = () => {
    if (!hasEnoughBalance) {
      // Handle not enough balance - could show an alert or error message
      Alert.alert(
        "Insufficient Leave Balance",
        "You don't have enough leave balance for this request.",
        [{ text: "OK" }]
      );
      return;
    }
    onSubmit(formData);
  };

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

  // Format the approvers from the hook response
  const getFormattedApprovers = () => {
    if (!approvalDetails) return [];

    const formattedApprovers = [];

    // Add leave approvers if available
    if (
      approvalDetails.leave_approvers &&
      approvalDetails.leave_approvers.length > 0
    ) {
      formattedApprovers.push(
        ...approvalDetails.leave_approvers.map((approver) => ({
          email: approver.user,
          name: approver.name,
        }))
      );
    }

    // Add department approvers if available
    if (
      approvalDetails.department_approvers &&
      approvalDetails.department_approvers.length > 0
    ) {
      formattedApprovers.push(
        ...approvalDetails.department_approvers.map((approver) => ({
          email: approver.user,
          name: approver.name,
        }))
      );
    }

    return formattedApprovers;
  };

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

  // Get the formatted approvers list
  const approvers = getFormattedApprovers();

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
            Leave Type{" "}
            <Text style={{ color: theme.statusColors.error }}>*</Text>
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
            {loadingLeaveTypes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.textPrimary}
                />
                <Text
                  style={[
                    styles.inputText,
                    { color: theme.colors.inputPlaceholder },
                  ]}
                >
                  Loading leave types...
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={[
                    styles.inputText,
                    {
                      color: formData.leaveTypeName
                        ? theme.colors.textPrimary
                        : theme.colors.inputPlaceholder,
                    },
                  ]}
                >
                  {formData.leaveTypeName || "Select Leave Type"}
                </Text>
                <Ionicons
                  name={showLeaveTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.iconSecondary}
                />
              </>
            )}
          </TouchableOpacity>

          {showLeaveTypeDropdown && !loadingLeaveTypes && (
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
              {leaveTypesError ? (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={refreshLeaveTypes}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.statusColors.error },
                    ]}
                  >
                    Error loading leave types. Tap to retry.
                  </Text>
                </TouchableOpacity>
              ) : leaveTypes.length === 0 ? (
                <View style={styles.dropdownItem}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    No leave types found
                  </Text>
                </View>
              ) : (
                leaveTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor:
                          index < leaveTypes.length - 1
                            ? theme.colors.divider
                            : "transparent",
                        borderBottomWidth:
                          index < leaveTypes.length - 1 ? 1 : 0,
                        backgroundColor:
                          formData.leaveType === type.name
                            ? theme.colors.highlight
                            : theme.colors.surfacePrimary,
                      },
                    ]}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        leaveType: type.name,
                        leaveTypeName: type.leave_type_name,
                      });
                      setShowLeaveTypeDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {type.leave_type_name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
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
              display="default"
              onChange={(event, date) =>
                handleDateChange("fromDate", event, date)
              }
              minimumDate={new Date()}
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
              display="default"
              onChange={(event, date) =>
                handleDateChange("toDate", event, date)
              }
              minimumDate={formData.fromDate || new Date()}
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

        {formData.leaveType && currentBalance !== null && (
          <View
            style={[
              styles.balanceInfoContainer,
              {
                backgroundColor: isDark
                  ? theme.colors.surfaceSecondary
                  : "rgba(0, 0, 0, 0.03)",
                borderColor: isDark
                  ? theme.colors.border
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <View style={styles.balanceRow}>
              <Text
                style={[
                  styles.balanceLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Current Balance:
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {currentBalance.toFixed(1)} days
              </Text>
            </View>

            <View style={styles.balanceRow}>
              <Text
                style={[
                  styles.balanceLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Requested:
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {requestedDays.toFixed(1)} days
              </Text>
            </View>

            <View
              style={[
                styles.balanceDivider,
                { backgroundColor: theme.colors.divider },
              ]}
            />

            <View style={styles.balanceRow}>
              <Text
                style={[
                  styles.balanceLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Remaining Balance:
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  styles.remainingBalance,
                  { color: getBalanceStatusColor() },
                ]}
              >
                {remainingBalance !== null ? remainingBalance.toFixed(1) : "0"}{" "}
                days
              </Text>
            </View>
          </View>
        )}

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
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
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
            Leave Approver{" "}
            <Text style={{ color: theme.statusColors.error }}>*</Text>
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
            {loadingApprovers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.textPrimary}
                />
                <Text
                  style={[
                    styles.inputText,
                    { color: theme.colors.inputPlaceholder },
                  ]}
                >
                  Loading approvers...
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={[
                    styles.inputText,
                    {
                      color: formData.leaveApproverName
                        ? theme.colors.textPrimary
                        : theme.colors.inputPlaceholder,
                    },
                  ]}
                >
                  {formData.leaveApproverName || "Select Approver"}
                </Text>
                <Ionicons
                  name={showApproverDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.iconSecondary}
                />
              </>
            )}
          </TouchableOpacity>

          {showApproverDropdown && !loadingApprovers && (
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
              {approversError ? (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={refreshApprovers}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.statusColors.error },
                    ]}
                  >
                    Error loading approvers. Tap to retry.
                  </Text>
                </TouchableOpacity>
              ) : approvers.length === 0 ? (
                <View style={styles.dropdownItem}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    No approvers found
                  </Text>
                </View>
              ) : (
                approvers.map((approver, index) => (
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
                      {approver.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
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
              backgroundColor: hasEnoughBalance
                ? theme.colors.buttonPrimary
                : theme.colors.buttonDisabled,
            },
          ]}
          onPress={handleSubmit}
          disabled={!hasEnoughBalance}
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceInfoContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  balanceDivider: {
    height: 1,
    marginVertical: 8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  remainingBalance: {
    fontWeight: "700",
  },
});

export default LeaveRequestForm;
