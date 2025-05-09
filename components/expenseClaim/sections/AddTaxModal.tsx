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

interface AddTaxModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTax: (tax: any) => void;
}

const AddTaxModal: React.FC<AddTaxModalProps> = ({
  visible,
  onClose,
  onAddTax,
}) => {
  const { theme } = useTheme();
  const [accountHead, setAccountHead] = useState("");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [project, setProject] = useState("");

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
                    color: accountHead
                      ? theme.colors.textPrimary
                      : theme.colors.inputPlaceholder,
                  },
                ]}
              >
                {accountHead || "Select Account"}
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
              value={rate}
              onChangeText={(text) => setRate(text.replace(/[^0-9.]/g, ""))}
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
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: costCenter
                      ? theme.colors.textPrimary
                      : theme.colors.inputPlaceholder,
                  },
                ]}
              >
                {costCenter || "Select Cost Center"}
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
                    color: project
                      ? theme.colors.textPrimary
                      : theme.colors.inputPlaceholder,
                  },
                ]}
              >
                {project || "Select Project"}
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
              Add Tax
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AddTaxModal;
