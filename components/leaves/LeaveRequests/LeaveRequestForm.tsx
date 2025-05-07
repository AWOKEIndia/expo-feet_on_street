import AlertDialog from "@/components/AlertDialog";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import useLeaveApprovers from "@/hooks/useLeaveApprover";
import useLeaveTypes from "@/hooks/useLeaveTypes";
import React, { useEffect, useMemo, useState } from "react";
import {
  AppState,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import ApproverSection from "./sections/ApproverSection";
import AttachmentsSection from "./sections/AttachmentSection";
import BalanceInfo from "./sections/BalanceInfo";
import DatesSection from "./sections/DatesSection";
import FormFooter from "./sections/FormFooter";
import FormHeader from "./sections/FormHeader";
import LeaveTypeSection from "./sections/LeaveTypeSection";
import ReasonSection from "./sections/ReasonSection";
import { sharedStyles } from "./styles";
import { Attachment, LeaveRequestData, LeaveRequestFormProps } from "./types";

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const { theme, isDark } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();

  // State for AlertDialog
  const [alertDialogVisible, setAlertDialogVisible] = useState(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const [formData, setFormData] = useState<LeaveRequestData>({
    leaveType: "",
    leaveTypeName: "",
    fromDate: null,
    toDate: null,
    isHalfDay: false,
    halfDayDate: null,
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
      formData.isHalfDay,
      formData.halfDayDate
    );
    setRequestedDays(days);
  }, [
    formData.fromDate,
    formData.toDate,
    formData.isHalfDay,
    formData.halfDayDate,
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
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
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

  const handleAttachmentsChange = (attachments: Attachment[]) => {
    setFormData({ ...formData, attachments });
  };

  // Show alert dialog with customizable content
  const showAlertDialog = (config : any) => {
    setAlertDialogConfig({
      ...alertDialogConfig,
      ...config,
    });
    setAlertDialogVisible(true);
  };

  // Hide alert dialog
  const hideAlertDialog = () => {
    setAlertDialogVisible(false);
  };

  const validateForm = (): boolean => {
    if (!formData.leaveType) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please select a leave type",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    if (!formData.fromDate) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please select a from date",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    if (!formData.toDate) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please select a to date",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    if (formData.fromDate > formData.toDate) {
      showAlertDialog({
        title: "Validation Error",
        message: "To date cannot be before from date",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    if (formData.isHalfDay && !formData.halfDayDate) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please select a half day date",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    if (formData.isHalfDay && formData.halfDayDate) {
      if (formData.fromDate && formData.halfDayDate < formData.fromDate) {
        showAlertDialog({
          title: "Validation Error",
          message: "Half day date cannot be before from date",
          showCancel: false,
          onConfirm: hideAlertDialog,
        });
        return false;
      }

      if (formData.toDate && formData.halfDayDate > formData.toDate) {
        showAlertDialog({
          title: "Validation Error",
          message: "Half day date cannot be after to date",
          showCancel: false,
          onConfirm: hideAlertDialog,
        });
        return false;
      }
    }

    if (!formData.leaveApprover) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please select a leave approver",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    // Find the selected leave type to check if it's LWP
    const selectedLeaveType = leaveTypes.find(
      (type) => type.name === formData.leaveType
    );
    const isLeaveWithoutPay = selectedLeaveType?.is_lwp || false;

    // Only check balance if it's not a Leave Without Pay type
    if (!isLeaveWithoutPay && !hasEnoughBalance) {
      showAlertDialog({
        title: "Insufficient Leave Balance",
        message: "You don't have enough leave balance for this request.",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    return true;
  };

  const confirmSubmit = () => {
    if (!validateForm()) return;

    // Show confirmation dialog before submission
    showAlertDialog({
      title: "Confirm Submission",
      message: "Are you sure you want to submit this leave request?",
      confirmText: "Submit",
      cancelText: "Cancel",
      showCancel: true,
      onConfirm: () => {
        hideAlertDialog();
        handleSubmitWithDirectUpload();
      },
      onCancel: hideAlertDialog,
    });
  };

  const handleSubmitWithDirectUpload = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        employee: employeeProfile?.name,
        leave_type: formData.leaveType,
        from_date: formatDateForAPI(formData.fromDate),
        to_date: formatDateForAPI(formData.toDate),
        half_day: formData.isHalfDay ? 1 : 0,
        half_day_date: formData.isHalfDay && formData.halfDayDate
        ? formatDateForAPI(formData.halfDayDate)
        : null,
        description: formData.reason,
        leave_approver: formData.leaveApprover,
        status: "Open",
      };

      console.log(
        "Submitting leave application with payload:",
        JSON.stringify(payload)
      );

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Leave Application`,
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
        const errorData = await response.text();
        console.error(
          `Leave application submission failed: ${response.status}`,
          errorData
        );
        throw new Error(
          `Leave application submission failed with status ${response.status}`
        );
      }

      const result = await response.json();
      const leaveDocName = result.data.name;
      console.log("Leave application created with ID:", leaveDocName);

      // Now upload each attachment directly to the created document
      let uploadErrors = [];
      for (const attachment of formData.attachments) {
        try {
          console.log(
            `Uploading attachment for ${leaveDocName}: ${attachment.name}`
          );

          // Create FormData for this file
          const fileFormData = new FormData();

          // Add file
          const fileInfo = {
            uri: attachment.uri,
            name: attachment.name,
            type: attachment.type,
          };
          fileFormData.append("file", fileInfo as any);

          // Add required metadata - with a valid docname this time
          fileFormData.append("doctype", "Leave Application");
          fileFormData.append("docname", leaveDocName);
          fileFormData.append("is_private", "1");
          fileFormData.append("folder", "Home/Attachments");

          // Upload the file
          const uploadResponse = await fetch(
            `${process.env.EXPO_PUBLIC_BASE_URL}/api/method/upload_file`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
              },
              body: fileFormData,
            }
          );

          if (!uploadResponse.ok) {
            uploadErrors.push(attachment.name);
          }
        } catch (error) {
          console.error(`Error uploading ${attachment.name}:`, error);
          uploadErrors.push(attachment.name);
        }
      }

      onSubmit(formData);

      if (uploadErrors.length > 0) {
        showAlertDialog({
          title: "Partial Success",
          message: `Leave application submitted successfully, but ${uploadErrors.length} attachment(s) could not be uploaded.`,
          showCancel: false,
          onConfirm: hideAlertDialog,
        });
      } else {
        showAlertDialog({
          title: "Success",
          message: "Leave application submitted successfully",
          showCancel: false,
          onConfirm: hideAlertDialog,
        });
      }
    } catch (error) {
      console.error("Error in submission process:", error);
      showAlertDialog({
        title: "Error",
        message: error instanceof Error && error.message
          ? error.message
          : "Failed to submit leave application. Please try again.",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = () => {
    showAlertDialog({
      title: "Cancel Request",
      message: "Are you sure you want to cancel this leave request? All entered data will be lost.",
      confirmText: "Yes, Cancel",
      cancelText: "No, Keep Editing",
      showCancel: true,
      onConfirm: () => {
        hideAlertDialog();
        onCancel();
      },
      onCancel: hideAlertDialog,
    });
  };

  return (
    <KeyboardAvoidingView
      style={[
        sharedStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* AlertDialog Component */}
      <AlertDialog
        visible={alertDialogVisible}
        title={alertDialogConfig.title}
        message={alertDialogConfig.message}
        confirmText={alertDialogConfig.confirmText}
        cancelText={alertDialogConfig.cancelText}
        showCancel={alertDialogConfig.showCancel}
        onConfirm={alertDialogConfig.onConfirm}
        onCancel={alertDialogConfig.onCancel}
        onDismiss={hideAlertDialog}
        theme={theme}
      />

      <FormHeader onCancel={handleCancelRequest} />

      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          Keyboard.dismiss();
          setShowLeaveTypeDropdown(false);
          setShowApproverDropdown(false);
        }}
      >
        <ScrollView
          style={[
            sharedStyles.form,
            { backgroundColor: theme.colors.background },
          ]}
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

          <ReasonSection formData={formData} setFormData={setFormData} />

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

          <AttachmentsSection
            attachments={formData.attachments}
            setAttachments={handleAttachmentsChange}
          />
        </ScrollView>
      </Pressable>

      <FormFooter
        hasEnoughBalance={hasEnoughBalance}
        handleSubmit={confirmSubmit} // Updated to use confirmation dialog
        isSubmitting={isSubmitting}
        isLeaveWithoutPay={
          !!leaveTypes.find((type) => type.name === formData.leaveType)?.is_lwp
        }
      />
    </KeyboardAvoidingView>
  );
};

export default LeaveRequestForm;
