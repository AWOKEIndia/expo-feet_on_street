import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import useAccountingData from "@/hooks/useAccountingData";
import { styles } from "../styles";

interface AddTaxModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTax: (tax: any) => void;
  accessToken: string;
  companyId?: string;
  baseAmount?: number;
}

const AddTaxModal: React.FC<AddTaxModalProps> = ({
  visible,
  onClose,
  onAddTax,
  accessToken,
  companyId,
  baseAmount = 0,
}) => {
  const { theme } = useTheme();
  const [accountHead, setAccountHead] = useState("");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [project, setProject] = useState("");

  // Dropdown state
  const [showAccountHeadDropdown, setShowAccountHeadDropdown] = useState(false);
  const [showCostCenterDropdown, setShowCostCenterDropdown] = useState(false);

  // Use the accounting data hook
  const {
    accounts,
    costCenters,
    loading,
    error,
    refresh,
    selectAccountByName,
    selectCostCenterByName,
  } = useAccountingData(accessToken, companyId);

    const handleRateChange = (text: string) => {
  // Allow only numbers and one decimal point
  const sanitizedText = text.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  if ((sanitizedText.match(/\./g) || []).length <= 1) {
    setRate(sanitizedText);

    // Auto-calculate amount if base amount exists
    if (baseAmount > 0 && sanitizedText) {
      const taxAmount = (baseAmount * parseFloat(sanitizedText)) / 100;
      setAmount(taxAmount.toFixed(2));
    }
  }
};

  const handleAdd = () => {
    if (!accountHead || !amount) {
      return;
    }

    const tax = {
      account_head: accountHead,
      rate: rate ? parseFloat(rate) : undefined,
      amount: parseFloat(amount),
      description,
      cost_center: costCenter,
      project,
      base_amount: baseAmount,
    };

    onAddTax(tax);
    onClose();

    // Reset form
    setAccountHead("");
    setRate("");
    setAmount("");
    setDescription("");
    setCostCenter("");
    setProject("");
  };

  const selectAccount = (name: string) => {
    setAccountHead(name);
    selectAccountByName(name);
    setShowAccountHeadDropdown(false);
  };

  const selectCostCenterItem = (name: string) => {
    setCostCenter(name);
    selectCostCenterByName(name);
    setShowCostCenterDropdown(false);
  };

  useEffect(() => {
    if (baseAmount > 0 && rate) {
      const taxAmount = (baseAmount * parseFloat(rate)) / 100;
      const finalAmount = baseAmount + taxAmount;
      setAmount(finalAmount.toFixed(2));
    }
  }, [rate, baseAmount]);

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
            Add Tax
          </Text>
        </View>

        <ScrollView
          style={styles.tabContent}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
              onPress={() => {
                setShowAccountHeadDropdown(!showAccountHeadDropdown);
                setShowCostCenterDropdown(false);
                if (!accounts.length) refresh();
              }}
              disabled={loading}
            >
              {loading ? (
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
                        color: accountHead
                          ? theme.colors.textPrimary
                          : theme.colors.inputPlaceholder,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {accountHead || "Select Account"}
                  </Text>
                  <Ionicons
                    name={showAccountHeadDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.colors.iconSecondary}
                  />
                </>
              )}
            </TouchableOpacity>

            {showAccountHeadDropdown && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <ScrollView
                  style={styles.dropdownScroll}
                  nestedScrollEnabled={true}
                >
                  {accounts.map((account, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        {
                          borderBottomColor:
                            index < accounts.length - 1
                              ? theme.colors.divider
                              : "transparent",
                        },
                      ]}
                      onPress={() => selectAccount(account.name)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {account.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
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
              value={rate}
              onChangeText={handleRateChange}
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
              editable={false}
            />
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
              onPress={() => {
                setShowCostCenterDropdown(!showCostCenterDropdown);
                setShowAccountHeadDropdown(false);
                if (!costCenters.length) refresh();
              }}
              disabled={loading}
            >
              {loading ? (
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
                        color: costCenter
                          ? theme.colors.textPrimary
                          : theme.colors.inputPlaceholder,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {costCenter || "Select Cost Center"}
                  </Text>
                  <Ionicons
                    name={showCostCenterDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.colors.iconSecondary}
                  />
                </>
              )}
            </TouchableOpacity>

            {showCostCenterDropdown && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surfacePrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <ScrollView
                  style={styles.dropdownScroll}
                  nestedScrollEnabled={true}
                >
                  {costCenters.map((center, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        {
                          borderBottomColor:
                            index < costCenters.length - 1
                              ? theme.colors.divider
                              : "transparent",
                        },
                      ]}
                      onPress={() => selectCostCenterItem(center.name)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {center.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
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
              Add Tax
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AddTaxModal;
