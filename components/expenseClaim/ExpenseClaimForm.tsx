import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "./styles";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import AlertDialog from "../AlertDialog";
import useExpenseClaimTypes from "@/hooks/useExpenseClaimTypes";

// Tab enum for better readability
const TabType = {
  EXPENSES: "Expenses",
  ADVANCES: "Advances",
  TOTALS: "Totals",
};

const ExpenseClaimForm = ({ navigation } : any) => {
  const { theme, isDark } = useTheme();
  const { accessToken, employeeProfile } = useAuthContext();
  const [activeTab, setActiveTab] = useState(TabType.EXPENSES);
  type ExpenseItem = {
    date: Date;
    expenseType: string;
    description: string;
    amount: string;
    sanctionedAmount: string;
    costCenter: string;
    project: string;
  };

  type TaxItem = {
    accountHead: string;
    rate: string;
    amount: string;
    description: string;
    costCenter: string;
    project: string;
  };

  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [taxItems, setTaxItems] = useState<TaxItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
  const { data: expenseClaimTypes, loading: loadingExpenseTypes, error: expenseTypesError } =
    useExpenseClaimTypes(accessToken as string);

  // Form data states
  const [expenseFormData, setExpenseFormData] = useState({
    date: new Date(),
    expenseType: "",
    description: "",
    amount: "",
    sanctionedAmount: "",
    costCenter: "BhavyaEventsAndCreatives Infomedia Privat...",
    project: "",
  });

  const [taxFormData, setTaxFormData] = useState({
    accountHead: "",
    rate: "",
    amount: "",
    description: "",
    costCenter: "",
    project: "",
  });

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExpenseTypeDropdown, setShowExpenseTypeDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);

  // Alert dialog states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertConfirmText, setAlertConfirmText] = useState("OK");
  const [alertShowCancel, setAlertShowCancel] = useState(false);
  const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>(() => {});
  const [alertCancelAction, setAlertCancelAction] = useState<() => void>(() => {});

  // Update totals when items change
  useEffect(() => {
    // Calculate expense total
    const expenseTotal = expenseItems.reduce(
      (sum, item) => sum + parseFloat(item.amount || "0"),
      0
    );
    setTotalAmount(expenseTotal);

    // Calculate tax total
    const taxTotal = taxItems.reduce(
      (sum, item) => sum + parseFloat(item.amount || "0"),
      0
    );
    setTotalTaxAmount(taxTotal);
  }, [expenseItems, taxItems]);

  // Handle expense type error
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
    confirmText: string = "OK",
    onConfirm: () => void = () => setAlertVisible(false),
    showCancel: boolean = false,
    onCancel: () => void = () => setAlertVisible(false)
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmText(confirmText);
    setAlertShowCancel(showCancel);
    setAlertConfirmAction(() => onConfirm);
    setAlertCancelAction(() => onCancel);
    setAlertVisible(true);
  };

  const formatDate = (date :Date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event:any, selectedDate: any) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setExpenseFormData({ ...expenseFormData, date: selectedDate });
    }
  };

  const validateExpenseItem = () => {
    if (!expenseFormData.date) {
      showAlert("Validation Error", "Please select a date");
      return false;
    }

    if (!expenseFormData.expenseType) {
      showAlert("Validation Error", "Please select an expense type");
      return false;
    }

    if (!expenseFormData.amount || parseFloat(expenseFormData.amount) <= 0) {
      showAlert("Validation Error", "Please enter a valid amount");
      return false;
    }

    return true;
  };

  const validateTaxItem = () => {
    if (!taxFormData.accountHead) {
      showAlert("Validation Error", "Please select an account head");
      return false;
    }

    if (!taxFormData.description) {
      showAlert("Validation Error", "Please enter a description");
      return false;
    }

    if (!taxFormData.amount || parseFloat(taxFormData.amount) <= 0) {
      showAlert("Validation Error", "Please enter a valid amount");
      return false;
    }

    return true;
  };

  const handleAddExpense = async () => {
    if (!validateExpenseItem()) return;

    // Add the current item to expense items list
    const newExpenseItem = { ...expenseFormData };
    setExpenseItems([...expenseItems, newExpenseItem]);

    // Reset form after adding item
    setExpenseFormData({
      date: new Date(),
      expenseType: "",
      description: "",
      amount: "",
      sanctionedAmount: "",
      costCenter: "BhavyaEventsAndCreatives Infomedia Privat...",
      project: "",
    });

    // Close the modal
    setShowAddExpenseModal(false);
  };

  const handleAddTax = async () => {
    if (!validateTaxItem()) return;

    // Add the current item to tax items list
    const newTaxItem = { ...taxFormData };
    setTaxItems([...taxItems, newTaxItem]);

    // Reset form after adding item
    setTaxFormData({
      accountHead: "",
      rate: "",
      amount: "",
      description: "",
      costCenter: "",
      project: "",
    });

    // Close the modal
    setShowAddTaxModal(false);
  };

  const formatDateForAPI = (date: any) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmitClaim = async () => {
    if (expenseItems.length === 0) {
      showAlert("Validation Error", "Please add at least one expense item");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        doctype: "Expense Claim",
        employee: employeeProfile?.name,
        employee_name: employeeProfile?.employee_name,
        department: employeeProfile?.department,
        company: employeeProfile?.company,
        expense_items: expenseItems.map((item) => ({
          expense_date: formatDateForAPI(item.date),
          expense_type: item.expenseType,
          description: item.description,
          amount: parseFloat(item.amount),
          sanctioned_amount: item.sanctionedAmount
            ? parseFloat(item.sanctionedAmount)
            : null,
          cost_center: item.costCenter || "",
          project: item.project || null,
        })),
        taxes: taxItems.map((item) => ({
          account_head: item.accountHead,
          rate: item.rate ? parseFloat(item.rate) : null,
          amount: parseFloat(item.amount),
          description: item.description,
          cost_center: item.costCenter || "",
          project: item.project || null,
        })),
      };

      console.log("Submitting expense claim:", JSON.stringify(payload));

      // Send actual API request to the endpoint
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/resource/Expense Claim/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit expense claim");
      }

      setIsSubmitting(false);
      showAlert(
        "Success",
        "Expense claim submitted successfully",
        "OK",
        () => {
          setAlertVisible(false);
          // Reset the form and navigate back
          setExpenseItems([]);
          setTaxItems([]);
          navigation.goBack();
        }
      );
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

  const handleBackPress = () => {
    if (expenseItems.length > 0 || taxItems.length > 0) {
      showAlert(
        "Discard Changes",
        "Are you sure you want to discard your expense claim?",
        "Discard",
        () => {
          setAlertVisible(false);
          navigation.goBack();
        },
        true,
        () => setAlertVisible(false)
      );
    } else {
      navigation.goBack();
    }
  };

  const renderTabBar = () => {
    return (
      <View style={styles.tabBar}>
        {Object.values(TabType).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomWidth: 2,
                borderBottomColor: theme.colors.buttonPrimary,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                  fontWeight: activeTab === tab ? "600" : "normal",
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderExpensesTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.approverSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Expense Approver <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
              },
            ]}
          >
            <View style={styles.approverContainer}>
              <Text
                style={[styles.inputText, { color: theme.colors.textPrimary }]}
                numberOfLines={1}
              >
                it@awokeindia.com : Apavayan Sinha
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.iconSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.expenseListHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Expenses
          </Text>
          <View style={styles.amountSection}>
            <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
              ₹ {totalAmount.toFixed(0)}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddExpenseModal(true)}
            >
              <Ionicons name="add" size={24} color={theme.colors.iconPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {expenseItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.textSecondary }}>
              No expenses added
            </Text>
          </View>
        ) : (
          expenseItems.map((item, index) => (
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
                <TouchableOpacity>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.iconSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.expenseItemDate,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Sanctioned: ₹{" "}
                {item.sanctionedAmount ? parseFloat(item.sanctionedAmount).toFixed(0) : parseFloat(item.amount).toFixed(0)} · {formatDate(item.date)}
              </Text>
              <View style={styles.expenseItemAmount}>
                <Text
                  style={[
                    styles.expenseItemAmountText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  ₹ {parseFloat(item.amount).toFixed(0)}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Taxes & Charges
          </Text>
          <View style={styles.amountSection}>
            <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
              ₹ {totalTaxAmount.toFixed(0)}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddTaxModal(true)}
            >
              <Ionicons name="add" size={24} color={theme.colors.iconPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {taxItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.textSecondary }}>
              No taxes added
            </Text>
          </View>
        ) : (
          taxItems.map((item, index) => (
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
                  {item.accountHead}
                </Text>
                <TouchableOpacity>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.iconSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.expenseItemDate,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Rate: {item.rate || "0"}% · {item.description}
              </Text>
              <View style={styles.expenseItemAmount}>
                <Text
                  style={[
                    styles.expenseItemAmountText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  ₹ {parseFloat(item.amount).toFixed(0)}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.sectionDivider}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Attachments
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.uploadContainer,
            { borderColor: theme.colors.border }
          ]}
        >
          <Ionicons name="arrow-up" size={24} color={theme.colors.iconSecondary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
            Upload images or documents
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderAdvancesTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>
            No advances added
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderTotalsTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.textPrimary, marginTop: 16 },
          ]}
        >
          Totals
        </Text>

        <View style={styles.sectionDivider}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Accounting Details
          </Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Posting Date <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <View
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
              },
            ]}
          >
            <Text
              style={[styles.inputText, { color: theme.colors.textPrimary }]}
            >
              {formatDate(new Date())}
            </Text>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Payable Account
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownContainer,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.inputText,
                { color: theme.colors.inputPlaceholder },
              ]}
            >
              Select Account
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.iconSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Accounting Dimensions
          </Text>
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
          >
            <Text
              style={[
                styles.inputText,
                { color: theme.colors.inputPlaceholder },
              ]}
            >
              Select Project
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
          >
            <Text
              style={[styles.inputText, { color: theme.colors.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {expenseFormData.costCenter}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.iconSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderAddExpenseModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAddExpenseModal}
        onRequestClose={() => setShowAddExpenseModal(false)}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.divider,
                backgroundColor: theme.colors.surfacePrimary,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowAddExpenseModal(false)}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={theme.colors.iconPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Add Expense Item
            </Text>
          </View>

          <ScrollView style={styles.tabContent}>
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
                  {formatDate(expenseFormData.date)}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={expenseFormData.date || new Date()}
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
                onPress={() => setShowExpenseTypeDropdown(!showExpenseTypeDropdown)}
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
                          color: expenseFormData.expenseType
                            ? theme.colors.textPrimary
                            : theme.colors.inputPlaceholder,
                        },
                      ]}
                    >
                      {expenseFormData.expenseType || "Select Expense Claim Type"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={theme.colors.iconSecondary}
                    />
                  </>
                )}
              </TouchableOpacity>

              {showExpenseTypeDropdown && expenseClaimTypes && expenseClaimTypes.length > 0 && (
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
                        setExpenseFormData({ ...expenseFormData, expenseType: type.name });
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
                value={expenseFormData.description}
                onChangeText={(text) =>
                  setExpenseFormData({ ...expenseFormData, description: text })
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
                value={expenseFormData.amount}
                onChangeText={(text) =>
                  setExpenseFormData({
                    ...expenseFormData,
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
                value={expenseFormData.sanctionedAmount}
                onChangeText={(text) =>
                  setExpenseFormData({
                    ...expenseFormData,
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
                  {expenseFormData.costCenter}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.iconSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.addExpenseButton,
                {
                  backgroundColor: theme.colors.buttonPrimary,
                },
              ]}
              onPress={handleAddExpense}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={[styles.addExpenseText, { color: "#FFFFFF" }]}>
                Add Expense
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderAddTaxModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAddTaxModal}
        onRequestClose={() => setShowAddTaxModal(false)}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.divider,
                backgroundColor: theme.colors.surfacePrimary,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowAddTaxModal(false)}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={theme.colors.iconPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Add Tax
            </Text>
          </View>

          <ScrollView style={styles.tabContent}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Account Head <Text style={{ color: theme.statusColors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.inputText,
                    {
                      color: taxFormData.accountHead
                        ? theme.colors.textPrimary
                        : theme.colors.inputPlaceholder,
                    },
                  ]}
                >
                  {taxFormData.accountHead || "Select Account"}
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
                Rate
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
                value={taxFormData.rate}
                onChangeText={(text) =>
                  setTaxFormData({
                    ...taxFormData,
                    rate: text.replace(/[^0-9.]/g, ""),
                  })
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
                value={taxFormData.amount}
                onChangeText={(text) =>
                  setTaxFormData({
                    ...taxFormData,
                    amount: text.replace(/[^0-9.]/g, ""),
                  })
                }
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Description <Text style={{ color: theme.statusColors.error }}>*</Text>
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
                value={taxFormData.description}
                onChangeText={(text) =>
                  setTaxFormData({ ...taxFormData, description: text })
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
              >
                <Text
                  style={[
                    styles.inputText,
                    {
                      color: taxFormData.costCenter
                        ? theme.colors.textPrimary
                        : theme.colors.inputPlaceholder,
                    },
                  ]}
                >
                  {taxFormData.costCenter || "Select Cost Center"}
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
              >
                <Text
                  style={[
                    styles.inputText,
                    {
                      color: taxFormData.project
                        ? theme.colors.textPrimary
                        : theme.colors.inputPlaceholder,
                    },
                  ]}
                >
                  {taxFormData.project || "Select Project"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.iconSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.addExpenseButton,
                {
                  backgroundColor: theme.colors.buttonPrimary,
                },
              ]}
              onPress={handleAddTax}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={[styles.addExpenseText, { color: "#FFFFFF" }]}>
                Add Tax
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case TabType.EXPENSES:
        return renderExpensesTab();
      case TabType.ADVANCES:
        return renderAdvancesTab();
      case TabType.TOTALS:
        return renderTotalsTab();
      default:
        return renderExpensesTab();
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

      {renderTabBar()}

      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          setShowExpenseTypeDropdown(false);
        }}
      >
        {renderActiveTab()}
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
            styles.submitButton,
            {
              backgroundColor: isSubmitting
                ? theme.colors.buttonDisabled
                : theme.colors.buttonPrimary,
              flex: 1,
            },
          ]}
          onPress={handleSubmitClaim}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {renderAddExpenseModal()}
      {renderAddTaxModal()}

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
