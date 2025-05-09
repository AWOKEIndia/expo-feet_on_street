import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { styles } from "../styles";
import { TaxItem } from "../types";

interface AddTaxModalProps {
  visible: boolean;
  onClose: () => void;
  taxItems: TaxItem[];
  setTaxItems: (items: TaxItem[]) => void;
}

const AddTaxModal: React.FC<AddTaxModalProps> = ({
  visible,
  onClose,
  taxItems,
  setTaxItems,
}) => {
  const { theme } = useTheme();
  const [taxFormData, setTaxFormData] = useState<TaxItem>({
    accountHead: "",
    rate: "",
    amount: "",
    description: "",
    costCenter: "",
    project: "",
  });

  const validateTaxItem = () => {
    if (!taxFormData.accountHead) {
      return false;
    }

    if (!taxFormData.description) {
      return false;
    }

    if (!taxFormData.amount || parseFloat(taxFormData.amount) <= 0) {
      return false;
    }

    return true;
  };

  const handleAddTax = () => {
    if (!validateTaxItem()) return;

    const newTaxItem = { ...taxFormData };
    setTaxItems([...taxItems, newTaxItem]);

    setTaxFormData({
      accountHead: "",
      rate: "",
      amount: "",
      description: "",
      costCenter: "",
      project: "",
    });

    onClose();
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

export default AddTaxModal;
