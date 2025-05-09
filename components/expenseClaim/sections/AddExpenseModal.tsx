import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";
import useExpenseClaimTypes from "@/hooks/useExpenseClaimTypes";
import { useAuthContext } from "@/contexts/AuthContext";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpense: (expense: any) => void;
  costCenter?: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  onAddExpense,
  costCenter,
}) => {
  const { theme } = useTheme();
  const { accessToken } = useAuthContext();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expenseType, setExpenseType] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [sanctionedAmount, setSanctionedAmount] = useState("");
  const [showExpenseTypeDropdown, setShowExpenseTypeDropdown] = useState(false);
  const { data: expenseClaimTypes, loading: loadingExpenseTypes } = useExpenseClaimTypes(accessToken as string);

  const formatDate = (date: Date) => {
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
      setDate(selectedDate);
    }
  };

  const handleAdd = () => {
    if (!expenseType || !amount) {
      return;
    }

    const expense = {
      expense_date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      expense_type: expenseType,
      description,
      amount: parseFloat(amount),
      sanctioned_amount: sanctionedAmount ? parseFloat(sanctionedAmount) : parseFloat(amount),
      cost_center: costCenter,
    };

    onAddExpense(expense);
    onClose();

    // Reset form
    setDate(new Date());
    setExpenseType("");
    setDescription("");
    setAmount("");
    setSanctionedAmount("");
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
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
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
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
              <Text style={[styles.inputText, { color: theme.colors.textPrimary }]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={date}
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
                        color: expenseType
                          ? theme.colors.textPrimary
                          : theme.colors.inputPlaceholder,
                      },
                    ]}
                  >
                    {expenseType || "Select Expense Claim Type"}
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
                      setExpenseType(type.name);
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
              value={description}
              onChangeText={setDescription}
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
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
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
              value={sanctionedAmount}
              onChangeText={(text) => setSanctionedAmount(text.replace(/[^0-9.]/g, ""))}
            />
          </View>

          <View style={styles.divider}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
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
                {costCenter || "Not specified"}
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
            onPress={handleAdd}
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

export default AddExpenseModal;
