import AlertDialog from "@/components/AlertDialog";
import { MediaItem } from "@/components/expenseClaim/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AttachmentsSection from "./sections/AttachmentSection";
import Header from "./sections/Header";

interface EmployeeAdvanceFormProps {
  onSubmit: (data: EmployeeAdvanceFormData) => void;
  onCancel: () => void;
}

interface DropdownItem {
  value: string;
  label: string;
}

export interface EmployeeAdvanceFormData {
  postingDate: Date;
  currency: string;
  purpose: string;
  advanceAmount: string;
  advanceAccount: string;
  modeOfPayment: string;
  repayUnclaimed: boolean;
  attachments: MediaItem[];
}

interface AlertDialogConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const EmployeeAdvanceForm: React.FC<EmployeeAdvanceFormProps> = ({ onSubmit, onCancel }) => {
  const { theme } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();

  // State for form data
  const [formData, setFormData] = useState<EmployeeAdvanceFormData>({
    postingDate: new Date(),
    currency: "INR",
    purpose: "",
    advanceAmount: "",
    advanceAccount: "",
    modeOfPayment: "",
    repayUnclaimed: false,
    attachments: [],
  });

  // UI state
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState<boolean>(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState<boolean>(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Alert dialog state
  const [alertDialogVisible, setAlertDialogVisible] = useState<boolean>(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState<AlertDialogConfig>({
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Mock data for dropdowns
  const currencies: DropdownItem[] = [
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
  ];

  const accounts: DropdownItem[] = [
    { value: "1310-001", label: "Employee Advances - Operations" },
    { value: "1310-002", label: "Employee Advances - Sales" },
    { value: "1310-003", label: "Employee Advances - Administration" },
  ];

  const paymentModes: DropdownItem[] = [
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Cash", label: "Cash" },
    { value: "Check", label: "Check" },
    { value: "Credit Card", label: "Credit Card" },
  ];

  // Close dropdowns when tapping outside
  useEffect(() => {
    const hideDropdowns = () => {
      setShowCurrencyDropdown(false);
      setShowAccountDropdown(false);
      setShowPaymentDropdown(false);
    };

    const keyboardDidHideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      hideDropdowns
    );

    return () => {
      keyboardDidHideSubscription.remove();
    };
  }, []);

  // Format date for display
  const formatDate = (date: Date): string => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date): void => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, postingDate: selectedDate });
    }
  };

  // Show alert dialog with customizable content
  const showAlertDialog = (config: Partial<AlertDialogConfig>): void => {
    setAlertDialogConfig({
      ...alertDialogConfig,
      ...config,
    });
    setAlertDialogVisible(true);
  };

  // Hide alert dialog
  const hideAlertDialog = (): void => {
    setAlertDialogVisible(false);
  };

  // Handle form validation
  const validateForm = (): boolean => {
    if (!formData.purpose.trim()) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please enter a purpose for the advance",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    if (!formData.advanceAmount || isNaN(Number(formData.advanceAmount))) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please enter a valid advance amount",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    if (!formData.advanceAccount) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please select an advance account",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    if (!formData.modeOfPayment) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please select a mode of payment",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = (): void => {
    if (!validateForm()) return;

    showAlertDialog({
      title: "Confirm Submission",
      message: "Are you sure you want to submit this advance request?",
      confirmText: "Submit",
      cancelText: "Cancel",
      showCancel: true,
      onConfirm: () => {
        hideAlertDialog();
        submitAdvanceRequest();
      },
      onCancel: hideAlertDialog,
    });
  };

  // Submit advance request to API
  const submitAdvanceRequest = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Format the payload according to your API requirements
      const payload = {
        employee: employeeProfile?.name,
        posting_date: formatDateForAPI(formData.postingDate),
        currency: formData.currency,
        purpose: formData.purpose,
        advance_amount: parseFloat(formData.advanceAmount),
        advance_account: formData.advanceAccount,
        mode_of_payment: formData.modeOfPayment,
        repay_unclaimed: formData.repayUnclaimed ? 1 : 0,
        status: "Draft",
      };

      // For now, just pass the data to the parent component
      onSubmit(formData);

      showAlertDialog({
        title: "Success",
        message: "Employee advance request submitted successfully",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
    } catch (error) {
      console.error("Error submitting advance request:", error);
      showAlertDialog({
        title: "Error",
        message: error instanceof Error && error.message
          ? error.message
          : "Failed to submit advance request. Please try again.",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for API
  const formatDateForAPI = (date: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle attachments
  const handleAttachmentsChange = (attachments: MediaItem[]): void => {
    setFormData({ ...formData, attachments });
  };

  // Handle cancel request
  const handleCancelRequest = (): void => {
    showAlertDialog({
      title: "Cancel Request",
      message: "Are you sure you want to cancel this advance request? All entered data will be lost.",
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Alert Dialog */}
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

      {/* Form Header */}
      <Header onBackPress={handleCancelRequest} title="New Employee Advance" />

      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          Keyboard.dismiss();
          setShowCurrencyDropdown(false);
          setShowAccountDropdown(false);
          setShowPaymentDropdown(false);
        }}
      >
        <ScrollView
          style={[styles.form, { backgroundColor: theme.colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Posting Date Section */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Posting Date <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, { color: theme.colors.textPrimary }]}>
                {formatDate(formData.postingDate)}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.postingDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Currency Section */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Currency <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownContainer,
                { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder },
              ]}
              onPress={() => {
                setShowCurrencyDropdown(!showCurrencyDropdown);
                setShowAccountDropdown(false);
                setShowPaymentDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  { color: formData.currency ? theme.colors.textPrimary : theme.colors.inputPlaceholder },
                ]}
              >
                {formData.currency || "Select Currency"}
              </Text>
              <Ionicons
                name={showCurrencyDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.iconSecondary}
              />
            </TouchableOpacity>

            {showCurrencyDropdown && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                {currencies.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: index < currencies.length - 1 ? theme.colors.divider : "transparent",
                        borderBottomWidth: index < currencies.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, currency: item.value });
                      setShowCurrencyDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textPrimary }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Purpose & Amount Section */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Purpose <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.textPrimary,
                },
              ]}
              placeholder="Enter Purpose"
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={formData.purpose}
              onChangeText={(text) => setFormData({ ...formData, purpose: text })}
              multiline
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Advance Amount <Text style={{ color: theme.colors.textError }}>*</Text>
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
              placeholder="0.00"
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={formData.advanceAmount}
              onChangeText={(text) => setFormData({ ...formData, advanceAmount: text })}
              keyboardType="numeric"
            />
          </View>

          {/* Accounting Section */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Advance Account <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownContainer,
                { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder },
              ]}
              onPress={() => {
                setShowAccountDropdown(!showAccountDropdown);
                setShowCurrencyDropdown(false);
                setShowPaymentDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  { color: formData.advanceAccount ? theme.colors.textPrimary : theme.colors.inputPlaceholder },
                ]}
              >
                {formData.advanceAccount ? accounts.find(acc => acc.value === formData.advanceAccount)?.label : "Select Account"}
              </Text>
              <Ionicons
                name={showAccountDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.iconSecondary}
              />
            </TouchableOpacity>

            {showAccountDropdown && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                {accounts.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: index < accounts.length - 1 ? theme.colors.divider : "transparent",
                        borderBottomWidth: index < accounts.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, advanceAccount: item.value });
                      setShowAccountDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textPrimary }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Mode of Payment <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownContainer,
                { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder },
              ]}
              onPress={() => {
                setShowPaymentDropdown(!showPaymentDropdown);
                setShowCurrencyDropdown(false);
                setShowAccountDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  { color: formData.modeOfPayment ? theme.colors.textPrimary : theme.colors.inputPlaceholder },
                ]}
              >
                {formData.modeOfPayment || "Select Mode of Payment"}
              </Text>
              <Ionicons
                name={showPaymentDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.iconSecondary}
              />
            </TouchableOpacity>

            {showPaymentDropdown && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                {paymentModes.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: index < paymentModes.length - 1 ? theme.colors.divider : "transparent",
                        borderBottomWidth: index < paymentModes.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, modeOfPayment: item.value });
                      setShowPaymentDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.textPrimary }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.checkboxContainer}>
              <Switch
                value={formData.repayUnclaimed}
                onValueChange={(value) => setFormData({ ...formData, repayUnclaimed: value })}
                trackColor={{
                  false: theme.colors.switchTrackOff,
                  true: theme.colors.switchTrackOn
                }}
                thumbColor={
                  formData.repayUnclaimed ? theme.colors.switchThumbOn : theme.colors.switchThumbOff
                }
              />
              <Text style={[styles.checkboxLabel, { color: theme.colors.textPrimary }]}>
                Repay Unclaimed Amount from Salary
              </Text>
            </View>
          </View>

          {/* Attachments Section */}
          <AttachmentsSection
            attachments={formData.attachments}
            setAttachments={handleAttachmentsChange}
            styles={styles}
          />
        </ScrollView>
      </Pressable>

      {/* Footer with Save Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surfacePrimary }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.buttonPrimary },
            isSubmitting && { opacity: 0.7 }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.submitButtonText, { color: theme.colors.textInverted }]}>
            {isSubmitting ? "Saving..." : "Save"}
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
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
  },
  textArea: {
    height: 96,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  dropdownContainer: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E8EC",
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EmployeeAdvanceForm;
