import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { sharedStyles } from "../styles";
import { LeaveType } from "../types";

interface LeaveTypeSectionProps {
  formData: {
    leaveType: string;
    leaveTypeName: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showLeaveTypeDropdown: boolean;
  setShowLeaveTypeDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setShowApproverDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  loadingLeaveTypes: boolean;
  leaveTypesError: boolean;
  leaveTypes: LeaveType[];
  refreshLeaveTypes: () => void;

}

const LeaveTypeSection: React.FC<LeaveTypeSectionProps> = ({
  formData,
  setFormData,
  showLeaveTypeDropdown,
  setShowLeaveTypeDropdown,
  setShowApproverDropdown,
  loadingLeaveTypes,
  leaveTypesError,
  leaveTypes,
  refreshLeaveTypes,
}) => {
  const { theme } = useTheme();

  return (
    <View style={sharedStyles.fieldContainer}>
      <Text style={[sharedStyles.label, { color: theme.colors.textPrimary }]}>
        Leave Type <Text style={{ color: theme.statusColors.error }}>*</Text>
      </Text>
      <TouchableOpacity
        style={[
          sharedStyles.dropdownContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: showLeaveTypeDropdown
              ? theme.colors.inputBorderFocus
              : theme.colors.inputBorder,
          },
        ]}
        onPress={() => {
          setShowLeaveTypeDropdown(!showLeaveTypeDropdown);
          setShowApproverDropdown(false);
        }}
      >
        {loadingLeaveTypes ? (
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
              Loading leave types...
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={[
                sharedStyles.inputText,
                {
                  color: formData.leaveTypeName
                    ? theme.colors.textPrimary
                    : theme.colors.inputPlaceholder,
                },
              ]}
            >
              {formData.leaveTypeName || "Select Leave Type"}
            </Text>
            <Ionicons
              name={showLeaveTypeDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.iconSecondary}
            />
          </>
        )}
      </TouchableOpacity>

      {showLeaveTypeDropdown && !loadingLeaveTypes && (
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
          {leaveTypesError ? (
            <TouchableOpacity
              style={sharedStyles.dropdownItem}
              onPress={refreshLeaveTypes}
            >
              <Text
                style={[
                  sharedStyles.dropdownItemText,
                  { color: theme.statusColors.error },
                ]}
              >
                Error loading leave types. Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : leaveTypes.length === 0 ? (
            <View style={sharedStyles.dropdownItem}>
              <Text
                style={[
                  sharedStyles.dropdownItemText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No leave types found
              </Text>
            </View>
          ) : (
            leaveTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  sharedStyles.dropdownItem,
                  {
                    borderBottomColor:
                      index < leaveTypes.length - 1
                        ? theme.colors.divider
                        : "transparent",
                    borderBottomWidth: index < leaveTypes.length - 1 ? 1 : 0,
                    backgroundColor:
                      formData.leaveType === type.name
                        ? theme.colors.highlight
                        : theme.colors.surfacePrimary,
                  },
                ]}
                onPress={() => {
                  setFormData({
                    ...formData,
                    leaveType: type.name,
                    leaveTypeName: type.leave_type_name,
                    isLeaveWithoutPay: type.is_leave_without_pay,
                  });
                  setShowLeaveTypeDropdown(false);
                }}
              >
                <Text
                  style={[
                    sharedStyles.dropdownItemText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {type.leave_type_name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
};

export default LeaveTypeSection;
