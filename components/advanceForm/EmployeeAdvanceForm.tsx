import AlertDialog from "@/components/AlertDialog";
import { MediaItem } from "@/components/expenseClaim/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import useAccountingData from "@/hooks/useAccountingData";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AttachmentsSection from "../expenseClaim/sections/AttachmentSection";
import Header from "../expenseClaim/sections/Header";
import { styles } from "./styles";

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
  exchangeRate?: number;
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

const EmployeeAdvanceForm: React.FC<EmployeeAdvanceFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();

  // Use the accounting data hook to get currencies, accounts, and payment modes
  const {
    companyCurrency,
    accounts: accountingAccounts,
    paymentModes,
    loading: loadingAccounting,
    error: accountingError,
  } = useAccountingData(accessToken as string);

  // State for form data
  const [formData, setFormData] = useState<EmployeeAdvanceFormData>({
    postingDate: new Date(),
    currency: "", // Start with empty string, will be populated with company currency
    purpose: "",
    advanceAmount: "",
    advanceAccount: "",
    modeOfPayment: "",
    repayUnclaimed: false,
    attachments: [],
    exchangeRate: 1.0,
  });

  // UI state
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] =
    useState<boolean>(false);
  const [showAccountDropdown, setShowAccountDropdown] =
    useState<boolean>(false);
  const [showPaymentDropdown, setShowPaymentDropdown] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Alert dialog state
  const [alertDialogVisible, setAlertDialogVisible] = useState<boolean>(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState<AlertDialogConfig>(
    {
      title: "",
      message: "",
      confirmText: "OK",
      cancelText: "Cancel",
      showCancel: false,
      onConfirm: () => {},
      onCancel: () => {},
    }
  );

  // Currencies state
  const [currencies, setCurrencies] = useState<DropdownItem[]>([]);

  // Set the company currency as default when it loads
  useEffect(() => {
    if (companyCurrency && companyCurrency.code) {
      // Set the company currency as the default in the form
      setFormData((prevData) => ({
        ...prevData,
        currency: companyCurrency.code,
      }));

      // Update the currencies list to include the company currency if not already present
      setCurrencies((prevCurrencies) => {
        // Check if company currency is already in the list
        const exists = prevCurrencies.some(
          (curr) => curr.value === companyCurrency.code
        );
        if (!exists) {
          return [
            {
              value: companyCurrency.code,
              label: `${companyCurrency.code} - ${
                companyCurrency.symbol || "Company Currency"
              }`,
            },
            ...prevCurrencies,
          ];
        }
        return prevCurrencies;
      });
    }
  }, [companyCurrency]);

  // Format accounts from hook for dropdown (filter for advance accounts)
  const formattedAccounts: DropdownItem[] = accountingAccounts.map(
    (account) => ({
      value: account.name,
      label: account.name,
    })
  );

  // Format payment modes from hook for dropdown
  const formattedPaymentModes: DropdownItem[] = paymentModes.map((mode) => ({
    value: mode.name,
    label: mode.name,
  }));

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

    if (
      !formData.advanceAmount ||
      isNaN(Number(formData.advanceAmount)) ||
      Number(formData.advanceAmount) <= 0
    ) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please enter a valid advance amount greater than zero",
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

    if (!formData.currency) {
      showAlertDialog({
        title: "Validation Error",
        message: "Please select a currency",
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

  // Format date for API
  const formatDateForAPI = (date: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Submit advance request to API
  const submitAdvanceRequest = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Format the payload according to the API requirements
      const payload = {
        employee: employeeProfile?.name,
        posting_date: formatDateForAPI(formData.postingDate),
        currency: formData.currency,
        purpose: formData.purpose,
        advance_amount: parseFloat(formData.advanceAmount),
        advance_account: formData.advanceAccount,
        mode_of_payment: formData.modeOfPayment,
        repay_unclaimed_amount: formData.repayUnclaimed ? 1 : 0,
        status: "Draft",
        exchange_rate: formData.exchangeRate,
      };

      console.log(
        "Submitting employee advance with payload:",
        JSON.stringify(payload)
      );

      // Make the API request
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Employee Advance`,
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
          `Employee advance submission failed: ${response.status}`,
          errorData
        );
        throw new Error(
          `Employee advance submission failed with status ${response.status}`
        );
      }

      const result = await response.json();
      const advanceDocName = result.data.name;
      console.log("Employee advance created with ID:", advanceDocName);

      // Upload attachments if any
      let uploadErrors = [];
      for (const attachment of formData.attachments) {
        try {
          console.log(
            `Uploading attachment for ${advanceDocName}: ${attachment.name}`
          );

          // Create FormData for file upload
          const fileFormData = new FormData();

          // Add file to FormData
          const fileInfo = {
            uri: attachment.uri,
            name: attachment.name,
            type: attachment.type,
          };
          fileFormData.append("file", fileInfo as any);

          // Add required metadata
          fileFormData.append("doctype", "Employee Advance");
          fileFormData.append("docname", advanceDocName);
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
            const errorText = await uploadResponse.text();
            console.error(`File upload error: ${errorText}`);
            uploadErrors.push(attachment.name);
          }
        } catch (error) {
          console.error(`Error uploading ${attachment.name}:`, error);
          uploadErrors.push(attachment.name);
        }
      }

      // Call the onSubmit callback with the form data
      onSubmit(formData);

      // Show success or partial success message
      if (uploadErrors.length > 0) {
        showAlertDialog({
          title: "Partial Success",
          message: `Employee advance submitted successfully, but ${uploadErrors.length} attachment(s) could not be uploaded.`,
          showCancel: false,
          onConfirm: hideAlertDialog,
        });
      } else {
        showAlertDialog({
          title: "Success",
          message: "Employee advance submitted successfully.",
          showCancel: false,
          onConfirm: hideAlertDialog,
        });
      }
    } catch (error) {
      console.error("Error in submission process:", error);
      showAlertDialog({
        title: "Error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "Failed to submit employee advance. Please try again.",
        showCancel: false,
        onConfirm: hideAlertDialog,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle attachments
  const handleAttachmentsChange = (attachments: MediaItem[]): void => {
    setFormData({ ...formData, attachments });
  };

  // Handle cancel request
  const handleCancelRequest = (): void => {
    showAlertDialog({
      title: "Cancel Request",
      message:
        "Are you sure you want to cancel this advance request? All entered data will be lost.",
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

  // Show currency label based on selection
  const getCurrencyLabel = (code: string) => {
    const currency = currencies.find((curr) => curr.value === code);
    return currency ? currency.label : code;
  };

  // Reusable Dropdown Component
  interface CustomDropdownProps {
    isOpen: boolean;
    onPress: () => void;
    selectedValue: string;
    placeholder: string;
    items: DropdownItem[];
    onSelect: (value: string) => void;
    isLoading: boolean;
    loadingText?: string;
    emptyText?: string;
    keyExtractor?: (item: DropdownItem, index: number) => string;
    specialLabel?: string | null;
    showSpecialLabel?: (item: DropdownItem) => boolean;
  }

  const CustomDropdown: React.FC<CustomDropdownProps> = ({
    isOpen,
    onPress,
    selectedValue,
    placeholder,
    items,
    onSelect,
    isLoading,
    loadingText = "Loading...",
    emptyText = "No items found",
    keyExtractor = (item, index) => index.toString(),
    specialLabel = null,
    showSpecialLabel = (item) => false,
  }) => {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.dropdownContainer,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          onPress={onPress}
        >
          {isLoading ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator
                size="small"
                color={theme.colors.iconPrimary}
              />
              <Text
                style={[
                  styles.inputText,
                  { marginLeft: 8, color: theme.colors.inputPlaceholder },
                ]}
              >
                {loadingText}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.inputText,
                {
                  color: selectedValue
                    ? theme.colors.textPrimary
                    : theme.colors.inputPlaceholder,
                },
              ]}
            >
              {selectedValue || placeholder}
            </Text>
          )}
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.iconSecondary}
          />
        </TouchableOpacity>

        {isOpen && !isLoading && (
          <View
            style={[
              styles.dropdownWrapper,
              {
                backgroundColor: theme.colors.surfacePrimary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ScrollView
              style={styles.dropdownScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {items.length > 0 ? (
                items.map((item: any, index: number) => (
                  <TouchableOpacity
                    key={keyExtractor(item, index)}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor:
                          index < items.length - 1
                            ? theme.colors.divider
                            : "transparent",
                        borderBottomWidth: index < items.length - 1 ? 1 : 0,
                        backgroundColor:
                          selectedValue === item.value
                            ? theme.colors.surfaceSecondary
                            : "transparent",
                      },
                    ]}
                    onPress={() => onSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        {
                          color: theme.colors.textPrimary,
                          fontWeight:
                            selectedValue === item.value ? "600" : "normal",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {specialLabel && showSpecialLabel(item) && (
                      <Text
                        style={{
                          color: theme.colors.textSecondary,
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {specialLabel}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.dropdownItem}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {emptyText}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </>
    );
  };

  // Display error if accounting data failed to load
  if (accountingError) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: theme.colors.textError }}>
          Error loading accounting data: {accountingError.message}
        </Text>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: theme.colors.buttonPrimary,
              marginTop: 20,
              width: 200,
            },
          ]}
          onPress={() => window.location.reload()}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: theme.colors.textInverted },
            ]}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              Posting Date{" "}
              <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[styles.inputText, { color: theme.colors.textPrimary }]}
              >
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
            <CustomDropdown
              isOpen={showCurrencyDropdown}
              onPress={() => {
                setShowCurrencyDropdown(!showCurrencyDropdown);
                setShowAccountDropdown(false);
                setShowPaymentDropdown(false);
              }}
              selectedValue={
                formData.currency ? getCurrencyLabel(formData.currency) : ""
              }
              placeholder="Select Currency"
              items={currencies}
              onSelect={(value: string) => {
                setFormData({ ...formData, currency: value });
                setShowCurrencyDropdown(false);
              }}
              isLoading={loadingAccounting}
              loadingText="Loading currencies..."
              keyExtractor={(item) => item.value}
              showSpecialLabel={(item) => item.value === companyCurrency?.code}
            />
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
              onChangeText={(text) =>
                setFormData({ ...formData, purpose: text })
              }
              multiline
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Advance Amount{" "}
              <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {formData.currency &&
                companyCurrency &&
                formData.currency === companyCurrency.code && (
                  <Text
                    style={[
                      styles.currencySymbol,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {companyCurrency.symbol || ""}
                  </Text>
                )}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.textPrimary,
                    flex: 1,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={formData.advanceAmount}
                onChangeText={(text) =>
                  setFormData({ ...formData, advanceAmount: text })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Accounting Section */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Advance Account{" "}
              <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <CustomDropdown
              isOpen={showAccountDropdown}
              onPress={() => {
                setShowAccountDropdown(!showAccountDropdown);
                setShowCurrencyDropdown(false);
                setShowPaymentDropdown(false);
              }}
              selectedValue={formData.advanceAccount}
              placeholder="Select Account"
              items={formattedAccounts}
              onSelect={(value) => {
                setFormData({ ...formData, advanceAccount: value });
                setShowAccountDropdown(false);
              }}
              isLoading={loadingAccounting}
              loadingText="Loading accounts..."
              emptyText="No advance accounts found"
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Mode of Payment{" "}
              <Text style={{ color: theme.colors.textError }}>*</Text>
            </Text>
            <CustomDropdown
              isOpen={showPaymentDropdown}
              onPress={() => {
                setShowPaymentDropdown(!showPaymentDropdown);
                setShowCurrencyDropdown(false);
                setShowAccountDropdown(false);
              }}
              selectedValue={formData.modeOfPayment}
              placeholder="Select Mode of Payment"
              items={formattedPaymentModes}
              onSelect={(value) => {
                setFormData({ ...formData, modeOfPayment: value });
                setShowPaymentDropdown(false);
              }}
              isLoading={loadingAccounting}
              loadingText="Loading payment modes..."
            />

            <View style={styles.checkboxContainer}>
              <Switch
                value={formData.repayUnclaimed}
                onValueChange={(value) =>
                  setFormData({ ...formData, repayUnclaimed: value })
                }
                trackColor={{
                  false: theme.colors.switchTrackOff,
                  true: theme.colors.switchTrackOn,
                }}
                thumbColor={
                  formData.repayUnclaimed
                    ? theme.colors.switchThumbOn
                    : theme.colors.switchThumbOff
                }
              />
              <Text
                style={[
                  styles.checkboxLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
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
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.surfacePrimary },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.buttonPrimary },
            isSubmitting && { opacity: 0.7 },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: theme.colors.textInverted },
            ]}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EmployeeAdvanceForm;
