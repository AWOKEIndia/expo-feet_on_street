import { styles } from "@/components/expenseClaim/styles";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AlertDialog from "../AlertDialog";
import useExpenseClaimTypes from "@/hooks/useExpenseClaimTypes";

interface ExpenseClaimFormProps {
  onSubmit: (data: ExpenseClaimData) => void;
  onCancel: () => void;
}

interface ExpenseClaimData {
  date: Date | null;
  expenseType: string;
  description: string;
  amount: string;
  sanctionedAmount: string;
  costCenter: string;
  project: string;
}

const ExpenseClaimForm: React.FC<ExpenseClaimFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { theme, isDark } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();
  const { data: expenseClaimTypes, loading: loadingExpenseTypes, error: expenseTypesError } = useExpenseClaimTypes(accessToken as string);

  const [formData, setFormData] = useState<ExpenseClaimData>({
    date: new Date(),
    expenseType: "",
    description: "",
    amount: "",
    sanctionedAmount: "",
    costCenter: "BhavyaEventsAndCreatives Infomedia Private Limited",
    project: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExpenseTypeDropdown, setShowExpenseTypeDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseItems, setExpenseItems] = useState<ExpenseClaimData[]>([]);

  const projects = [
    "Corporate Website Redesign",
    "Mobile App Development",
    "Marketing Campaign Q2",
    "Product Launch Event",
  ];

  // Alert dialog states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmText, setAlertConfirmText] = useState("OK");
  const [alertShowCancel, setAlertShowCancel] = useState(false);
  const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>(
    () => {}
  );
  const [alertCancelAction, setAlertCancelAction] = useState<() => void>(
    () => {}
  );

  // Handle error from expense claim types
  useEffect(() => {
    if (expenseTypesError) {
      showAlert(
        "Error",
        `Failed to load expense claim types: ${expenseTypesError.message}`
      );
    }
  }, [expenseTypesError]);

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
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState === "active" && nextAppState.match(/inactive|background/)) {
        setShowDatePicker(false);
        setShowExpenseTypeDropdown(false);
        setShowProjectDropdown(false);
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  useEffect(() => {
    if (showExpenseTypeDropdown || showProjectDropdown) {
      const handleOutsideTouch = () => {
        setShowExpenseTypeDropdown(false);
        setShowProjectDropdown(false);
      };

      const keyboardListener = Keyboard.addListener(
        "keyboardDidHide",
        handleOutsideTouch
      );

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (showExpenseTypeDropdown || showProjectDropdown) {
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
  }, [showExpenseTypeDropdown, showProjectDropdown]);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const validateExpenseItem = (): boolean => {
    if (!formData.date) {
      showAlert("Validation Error", "Please select a date");
      return false;
    }

    if (!formData.expenseType) {
      showAlert("Validation Error", "Please select an expense type");
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showAlert("Validation Error", "Please enter a valid amount");
      return false;
    }

    return true;
  };

  const handleAddExpense = () => {
    if (!validateExpenseItem()) return;

    setExpenseItems([...expenseItems, { ...formData }]);

    setFormData({
      ...formData,
      expenseType: "",
      description: "",
      amount: "",
      sanctionedAmount: "",
      project: "",
    });

    showAlert("Success", "Expense item added successfully");
  };

  const handleSubmitClaim = async () => {
    if (expenseItems.length === 0 && !validateExpenseItem()) {
      showAlert("Validation Error", "Please add at least one expense item");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsToSubmit =
        expenseItems.length > 0 ? expenseItems : [{ ...formData }];

      const payload = {
        data: {
          doctype: "Expense Claim",
          employee: employeeProfile?.name,
          employee_name: employeeProfile?.employee_name,
          department: employeeProfile?.department,
          company: employeeProfile?.company,
          expense_items: itemsToSubmit.map((item) => ({
            expense_date: formatDateForAPI(item.date),
            expense_type: item.expenseType,
            description: item.description,
            amount: parseFloat(item.amount),
            sanctioned_amount: item.sanctionedAmount
              ? parseFloat(item.sanctionedAmount)
              : null,
            cost_center: item.costCenter,
            project: item.project || null,
          })),
        },
      };

      console.log("Submitting expense claim:", JSON.stringify(payload));

      // Mock API call
      setTimeout(() => {
        setIsSubmitting(false);
        showAlert(
          "Success",
          "Expense claim submitted successfully",
          "OK",
          () => {
            setAlertVisible(false);
            onSubmit(formData);
          }
        );
      }, 1000);
    } catch (error) {
      console.error("Error submitting expense claim:", error);
      showAlert(
        "Error",
        `Failed to submit expense claim: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsSubmitting(false);
    }
  };

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleBackPress = () => {
    if (
      formData.expenseType ||
      formData.description ||
      formData.amount ||
      expenseItems.length > 0
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
          New Expense Claim
        </Text>
      </View>

      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          Keyboard.dismiss();
          setShowExpenseTypeDropdown(false);
          setShowProjectDropdown(false);
        }}
      >
        <ScrollView
          style={[styles.form, { backgroundColor: theme.colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              New Expense Item
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Date
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
                {formatDate(formData.date)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={formData.date || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Expense Claim Type{" "}
              <Text style={{ color: theme.statusColors.error }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
              onPress={() => {
                setShowExpenseTypeDropdown(!showExpenseTypeDropdown);
                setShowProjectDropdown(false);
              }}
              disabled={loadingExpenseTypes}
            >
              {loadingExpenseTypes ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.iconPrimary} />
                  <Text style={[styles.inputText, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                    Loading...
                  </Text>
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.inputText,
                      {
                        color: formData.expenseType
                          ? theme.colors.textPrimary
                          : theme.colors.inputPlaceholder,
                      },
                    ]}
                  >
                    {formData.expenseType || "Select Expense Claim Type"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={theme.colors.iconSecondary}
                  />
                </>
              )}
            </TouchableOpacity>

            {showExpenseTypeDropdown && expenseClaimTypes.length > 0 && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                {expenseClaimTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor:
                          index < expenseClaimTypes.length - 1
                            ? theme.colors.divider
                            : "transparent",
                        borderBottomWidth:
                          index < expenseClaimTypes.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, expenseType: type.name });
                      setShowExpenseTypeDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Description
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
              placeholder="Enter Description"
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Amount <Text style={{ color: theme.statusColors.error }}>*</Text>
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
              keyboardType="numeric"
              value={formData.amount}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  amount: text.replace(/[^0-9.]/g, ""),
                })
              }
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Sanctioned Amount
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
              keyboardType="numeric"
              value={formData.sanctionedAmount}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  sanctionedAmount: text.replace(/[^0-9.]/g, ""),
                })
              }
            />
          </View>

          <View style={styles.divider}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Accounting Dimensions
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Cost Center
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
              disabled={true}
            >
              <Text
                style={[styles.inputText, { color: theme.colors.textPrimary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {formData.costCenter}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.iconSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Project
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
              onPress={() => {
                setShowProjectDropdown(!showProjectDropdown);
                setShowExpenseTypeDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: formData.project
                      ? theme.colors.textPrimary
                      : theme.colors.inputPlaceholder,
                  },
                ]}
              >
                {formData.project || "Select Project"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.iconSecondary}
              />
            </TouchableOpacity>

            {showProjectDropdown && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                {projects.map((project, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor:
                          index < projects.length - 1
                            ? theme.colors.divider
                            : "transparent",
                        borderBottomWidth: index < projects.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, project });
                      setShowProjectDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {project}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addExpenseButton,
              {
                backgroundColor: theme.colors.surfaceSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleAddExpense}
          >
            <Ionicons name="add" size={20} color={theme.colors.textPrimary} />
            <Text
              style={[
                styles.addExpenseText,
                { color: theme.colors.textPrimary },
              ]}
            >
              Add Expense
            </Text>
          </TouchableOpacity>

          {expenseItems.length > 0 && (
            <View style={styles.expenseItemsContainer}>
              <Text
                style={[
                  styles.itemsHeader,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Expense Items ({expenseItems.length})
              </Text>

              {expenseItems.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.expenseItemCard,
                    {
                      backgroundColor: theme.colors.surfacePrimary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.expenseItemHeader}>
                    <Text
                      style={[
                        styles.expenseItemType,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {item.expenseType}
                    </Text>
                    <Text
                      style={[
                        styles.expenseItemDate,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {formatDate(item.date)}
                    </Text>
                  </View>

                  {item.description && (
                    <Text
                      style={[
                        styles.expenseItemDesc,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {item.description}
                    </Text>
                  )}

                  <View style={styles.expenseItemAmount}>
                    <Text
                      style={[
                        styles.expenseItemAmountText,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      ₹{parseFloat(item.amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Pressable>

      <View
        style={[
          styles.buttonContainer,
          {
            backgroundColor: theme.colors.surfacePrimary,
            borderTopColor: theme.colors.surfaceAccent,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.cancelButton,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}
          onPress={handleBackPress}
          disabled={isSubmitting}
        >
          <Text
            style={[styles.buttonText, { color: theme.colors.textPrimary }]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isSubmitting
                ? theme.colors.buttonDisabled
                : theme.colors.buttonPrimary,
            },
          ]}
          onPress={handleSubmitClaim}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
              Submit Claim
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <AlertDialog
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText={alertConfirmText}
        onConfirm={alertConfirmAction}
        showCancel={alertShowCancel}
        onCancel={alertCancelAction}
        theme={theme}
      />
    </KeyboardAvoidingView>
  );
};

export default ExpenseClaimForm;
