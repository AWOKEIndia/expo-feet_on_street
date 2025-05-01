import React, { useEffect, useState } from "react";
import {
  AppState,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import AlertDialog from "@/components/AlertDialog";
import { styles } from "@/components/attendance/attendanceRequest/styles";
import { AttendanceRequestData, AttendanceRequestFormProps } from "@/components/attendance/attendanceRequest/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import useReasonOptions from "@/hooks/useAttendanceReason";
import useShift from "@/hooks/useShift";
import { HeaderSection } from "@/components/attendance/attendanceRequest/sections/FormHeader";
import { DatePickerField } from "@/components/attendance/attendanceRequest/sections/DatePickerField";
import { CheckboxField } from "@/components/attendance/attendanceRequest/sections/CheckBoxField";
import { DropdownField } from "@/components/attendance/attendanceRequest/sections/DropdownField";
import { TextInputField } from "@/components/attendance/attendanceRequest/sections/TextInputField";
import { FooterSection } from "@/components/attendance/attendanceRequest/sections/FormFooter";

const AttendanceRequestForm: React.FC<AttendanceRequestFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { theme } = useTheme();
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
    if (Platform.OS === "android") {
      setShowFromDatePicker(false);
      setShowToDatePicker(false);
    }

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

      showAlert(
        "Success",
        "Attendance request submitted successfully",
        "OK",
        () => {
          setAlertVisible(false);
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

  useEffect(() => {
    if (showShiftDropdown || showReasonDropdown) {
      const handleOutsideTouch = () => {
        setShowShiftDropdown(false);
        setShowReasonDropdown(false);
      };

      const keyboardListener = Keyboard.addListener(
        "keyboardDidHide",
        handleOutsideTouch
      );

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

  const showAndroidDatePicker = (field: "fromDate" | "toDate") => {
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
      <HeaderSection
        onBackPress={handleBackPress}
        title="New Attendance Request"
      />

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
          <DatePickerField
            label="From Date"
            value={formData.fromDate}
            onChange={(event, date) => handleDateChange("fromDate", event, date)}
            showPicker={showFromDatePicker}
            onPress={() => showAndroidDatePicker("fromDate")}
            required
            minimumDate={new Date(new Date().getTime() - 31 * 24 * 60 * 60 * 1000)}
          />

          <DatePickerField
            label="To Date"
            value={formData.toDate}
            onChange={(event, date) => handleDateChange("toDate", event, date)}
            showPicker={showToDatePicker}
            onPress={() => showAndroidDatePicker("toDate")}
            required
            minimumDate={formData.fromDate || new Date()}
          />

          <CheckboxField
            label="Half Day"
            value={formData.isHalfDay}
            onToggle={() => toggleCheckbox("isHalfDay")}
          />

          <CheckboxField
            label="Include Holidays"
            value={formData.includeHolidays}
            onToggle={() => toggleCheckbox("includeHolidays")}
          />

          <DropdownField
            label="Shift"
            value={formData.shift}
            options={shiftTypes.map(shift => shift.name)}
            loading={shiftsLoading}
            error={shiftsError}
            onSelect={(value) => setFormData({ ...formData, shift: value })}
            isOpen={showShiftDropdown}
            onToggle={() => {
              setShowShiftDropdown(!showShiftDropdown);
              setShowReasonDropdown(false);
            }}
          />

          <DropdownField
            label="Reason"
            value={formData.reason}
            options={reasonOptions}
            loading={reasonsLoading}
            error={reasonsError}
            onSelect={(value) => setFormData({ ...formData, reason: value })}
            isOpen={showReasonDropdown}
            onToggle={() => {
              setShowReasonDropdown(!showReasonDropdown);
              setShowShiftDropdown(false);
            }}
            required
          />

          <TextInputField
            label="Explanation"
            value={formData.explanation}
            onChangeText={(text) => setFormData({ ...formData, explanation: text })}
            placeholder="Enter Explanation"
            multiline
          />
        </ScrollView>
      </Pressable>

      <FooterSection
        onPress={handleSubmit}
        isSubmitting={isSubmitting}
      />

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

export default AttendanceRequestForm;
