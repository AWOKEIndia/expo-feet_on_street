import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { sharedStyles } from "../styles";
import { ApproverDetails } from "../types";

interface ApproverSectionProps {
  formData: {
    leaveApprover: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showApproverDropdown: boolean;
  setShowApproverDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLeaveTypeDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  loadingApprovers: boolean;
  approversError: boolean;
  approvalDetails: ApproverDetails | null;
  refreshApprovers: () => void;
}

const ApproverSection: React.FC<ApproverSectionProps> = ({
  formData,
  setFormData,
  showApproverDropdown,
  setShowApproverDropdown,
  setShowLeaveTypeDropdown,
  loadingApprovers,
  approversError,
  approvalDetails,
  refreshApprovers,
}) => {
  const { theme } = useTheme();

  const getFormattedApprovers = () => {
    if (!approvalDetails) return [];
    const formattedApprovers: string[] = [];

    if (
      approvalDetails.leave_approvers &&
      approvalDetails.leave_approvers.length > 0
    ) {
      approvalDetails.leave_approvers.forEach((approver) => {
        if (approver.name && !formattedApprovers.includes(approver.name)) {
          formattedApprovers.push(approver.name);
        }
      });
    }

    if (
      approvalDetails.department_approvers &&
      approvalDetails.department_approvers.length > 0
    ) {
      approvalDetails.department_approvers.forEach((approver) => {
        if (approver.name && !formattedApprovers.includes(approver.name)) {
          formattedApprovers.push(approver.name);
        }
      });
    }

    return formattedApprovers;
  };

  const approvers = getFormattedApprovers();

  return (
    <>
      {/* Section Divider */}
      <View style={sharedStyles.sectionContainer}>
        <Text
          style={[sharedStyles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          Approval
        </Text>
      </View>

      {/* Leave Approver Field */}
      <View style={sharedStyles.fieldContainer}>
        <Text style={[sharedStyles.label, { color: theme.colors.textPrimary }]}>
          Leave Approver{" "}
          <Text style={{ color: theme.statusColors.error }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            sharedStyles.dropdownContainer,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: showApproverDropdown
                ? theme.colors.inputBorderFocus
                : theme.colors.inputBorder,
            },
          ]}
          onPress={() => {
            setShowApproverDropdown(!showApproverDropdown);
            setShowLeaveTypeDropdown(false);
          }}
        >
          {loadingApprovers ? (
            <View style={sharedStyles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme.colors.textPrimary}
              />
              <Text
                style={[
                  sharedStyles.inputText,
                  { color: theme.colors.inputPlaceholder },
                ]}
              >
                Loading approvers...
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={[
                  sharedStyles.inputText,
                  {
                    color: formData.leaveApprover
                      ? theme.colors.textPrimary
                      : theme.colors.inputPlaceholder,
                  },
                ]}
              >
                {formData.leaveApprover || "Select Approver"}
              </Text>
              <Ionicons
                name={showApproverDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.iconSecondary}
              />
            </>
          )}
        </TouchableOpacity>

        {showApproverDropdown && !loadingApprovers && (
          <View
            style={[
              sharedStyles.dropdown,
              {
                backgroundColor: theme.colors.surfacePrimary,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
                elevation: 4,
              },
            ]}
          >
            {approversError ? (
              <TouchableOpacity
                style={sharedStyles.dropdownItem}
                onPress={refreshApprovers}
              >
                <Text
                  style={[
                    sharedStyles.dropdownItemText,
                    { color: theme.statusColors.error },
                  ]}
                >
                  Error loading approvers. Tap to retry.
                </Text>
              </TouchableOpacity>
            ) : approvers.length === 0 ? (
              <View style={sharedStyles.dropdownItem}>
                <Text
                  style={[
                    sharedStyles.dropdownItemText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  No approvers found
                </Text>
              </View>
            ) : (
              approvers.map((approver, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    sharedStyles.dropdownItem,
                    {
                      borderBottomColor:
                        index < approvers.length - 1
                          ? theme.colors.divider
                          : "transparent",
                      borderBottomWidth: index < approvers.length - 1 ? 1 : 0,
                      backgroundColor:
                        formData.leaveApprover === approver
                          ? theme.colors.highlight
                          : theme.colors.surfacePrimary,
                    },
                  ]}
                  onPress={() => {
                    setFormData({
                      ...formData,
                      leaveApprover: approver,
                    });
                    setShowApproverDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      sharedStyles.dropdownItemText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {approver}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    </>
  );
};

export default ApproverSection;
