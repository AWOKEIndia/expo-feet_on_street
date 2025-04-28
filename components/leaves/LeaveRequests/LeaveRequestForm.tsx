import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView
} from "react-native";
import { LeaveRequestData, LeaveRequestFormProps } from "./types";
import React, { useEffect, useMemo, useState } from "react";

import { AppState } from "react-native";
import ApproverSection from "./sections/ApproverSection";
import AttachmentsSection from "./sections/AttachmentSection";
import BalanceInfo from "./sections/BalanceInfo";
import DatesSection from "./sections/DatesSection";
import FormFooter from "./sections/FormFooter";
import FormHeader from "./sections/FormHeader";
import LeaveTypeSection from "./sections/LeaveTypeSection";
import ReasonSection from "./sections/ReasonSection";
import { sharedStyles } from "./styles";
import { useAuthContext } from "@/contexts/AuthContext";
import useLeaveApprovers from "@/hooks/useLeaveApprover";
import useLeaveTypes from "@/hooks/useLeaveTypes";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // For handling dropdown outside tap
  useEffect(() => {
    if (showLeaveTypeDropdown || showApproverDropdown) {
      const handleOutsideTouch = () => {
        setShowLeaveTypeDropdown(false);
        setShowApproverDropdown(false);
      };

      const keyboardListener = Keyboard.addListener(
        "keyboardDidHide",
        handleOutsideTouch
      );

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

  const toggleCheckbox = (field: "isHalfDay") => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const validateForm = (): boolean => {
    if (!formData.leaveType) {
      Alert.alert("Validation Error", "Please select a leave type");
      return false;
    }

    if (!formData.fromDate) {
      Alert.alert("Validation Error", "Please select a from date");
      return false;
    }

    if (!formData.toDate) {
      Alert.alert("Validation Error", "Please select a to date");
      return false;
    }

    if (formData.fromDate > formData.toDate) {
      Alert.alert("Validation Error", "To date cannot be before from date");
      return false;
    }

    if (!formData.leaveApprover) {
      Alert.alert("Validation Error", "Please select a leave approver");
      return false;
    }

    if (!hasEnoughBalance) {
      Alert.alert(
        "Insufficient Leave Balance",
        "You don't have enough leave balance for this request."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        company: employeeProfile?.company,
        doctype: "Leave Application",
        employee: employeeProfile?.name,
        from_date: formatDateForAPI(formData.fromDate),
        to_date: formatDateForAPI(formData.toDate),
        description: formData.reason,
        leave_type: formData.leaveType,
        leave_approver: formData.leaveApprover,
        half_day: formData.isHalfDay,
        posting_date: formatDateForAPI(new Date()),
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Leave Application/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      onSubmit(formData);
      Alert.alert("Success", "Leave application submitted successfully");
    } catch (error) {
      console.error("Error submitting leave application:", error);
      Alert.alert(
        "Error",
        "Failed to submit leave application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[sharedStyles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FormHeader onCancel={onCancel} />

      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          Keyboard.dismiss();
          setShowLeaveTypeDropdown(false);
          setShowApproverDropdown(false);
        }}
      >
        <ScrollView
          style={[sharedStyles.form, { backgroundColor: theme.colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
          <LeaveTypeSection
            formData={formData}
            setFormData={setFormData}
            showLeaveTypeDropdown={showLeaveTypeDropdown}
            setShowLeaveTypeDropdown={setShowLeaveTypeDropdown}
            setShowApproverDropdown={setShowApproverDropdown}
            loadingLeaveTypes={loadingLeaveTypes}
            leaveTypesError={!!leaveTypesError}
            leaveTypes={leaveTypes}
            refreshLeaveTypes={refreshLeaveTypes}
          />

          <DatesSection
            formData={formData}
            setFormData={setFormData}
            showFromDatePicker={showFromDatePicker}
            showToDatePicker={showToDatePicker}
            setShowFromDatePicker={setShowFromDatePicker}
            setShowToDatePicker={setShowToDatePicker}
            handleDateChange={handleDateChange}
            showAndroidDatePicker={showAndroidDatePicker}
            toggleCheckbox={toggleCheckbox}
          />

          <BalanceInfo
            formData={formData}
            currentBalance={currentBalance}
            requestedDays={requestedDays}
            remainingBalance={remainingBalance}
            isDark={isDark}
          />

          <ReasonSection
            formData={formData}
            setFormData={setFormData}
          />

          <ApproverSection
            formData={formData}
            setFormData={setFormData}
            showApproverDropdown={showApproverDropdown}
            setShowApproverDropdown={setShowApproverDropdown}
            setShowLeaveTypeDropdown={setShowLeaveTypeDropdown}
            loadingApprovers={loadingApprovers}
            approversError={!!approversError}
            approvalDetails={approvalDetails}
            refreshApprovers={refreshApprovers}
          />

          <AttachmentsSection />
        </ScrollView>
      </Pressable>

      <FormFooter
        hasEnoughBalance={hasEnoughBalance}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </KeyboardAvoidingView>
  );
};

export default LeaveRequestForm;
