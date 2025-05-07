import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { sharedStyles } from "../styles";
import { months } from "moment";
import { useState } from "react";

interface DatesSectionProps {
  formData: {
    fromDate: Date | null;
    toDate: Date | null;
    isHalfDay: boolean;
    halfDayDate?: Date | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showFromDatePicker: boolean;
  showToDatePicker: boolean;
  setShowFromDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  setShowToDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  handleDateChange: (
    field: "fromDate" | "toDate",
    event: any,
    selectedDate?: Date
  ) => void;
  showAndroidDatePicker: (field: "fromDate" | "toDate") => void;
  toggleCheckbox: (field: "isHalfDay") => void;
}

const DatesSection: React.FC<DatesSectionProps> = ({
  formData,
  setFormData,
  showFromDatePicker,
  showToDatePicker,
  setShowFromDatePicker,
  setShowToDatePicker,
  handleDateChange,
  showAndroidDatePicker,
  toggleCheckbox,
}) => {
  const { theme } = useTheme();
  const [showHalfDayDatePicker, setShowHalfDayDatePicker] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleHalfDayDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowHalfDayDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setFormData({ ...formData, halfDayDate: selectedDate });
    }
  };

  const showAndroidHalfDayDatePicker = () => {
    setShowFromDatePicker(false);
    setShowToDatePicker(false);
    setShowHalfDayDatePicker(true);
  };

  const toggleHalfDay = () => {
    const newIsHalfDay = !formData.isHalfDay;
    setFormData({
      ...formData,
      isHalfDay: newIsHalfDay,
      halfDayDate: newIsHalfDay ? formData.fromDate : null
    });
  };

  return (
    <>
      {/* Section Divider */}
      <View style={sharedStyles.sectionContainer}>
        <Text style={[sharedStyles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Dates & Reason
        </Text>
      </View>

      {/* From Date Field */}
      <View style={sharedStyles.fieldContainer}>
        <Text style={[sharedStyles.label, { color: theme.colors.textPrimary }]}>
          From Date <Text style={{ color: theme.statusColors.error }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            sharedStyles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          onPress={() => showAndroidDatePicker("fromDate")}
        >
          <Text
            style={[
              sharedStyles.inputText,
              {
                color: formData.fromDate
                  ? theme.colors.textPrimary
                  : theme.colors.inputPlaceholder,
              },
            ]}
          >
            {formData.fromDate ? formatDate(formData.fromDate) : "Select Date"}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.iconSecondary}
            style={sharedStyles.calendarIcon}
          />
        </TouchableOpacity>

        {showFromDatePicker && (
          <DateTimePicker
            testID="fromDatePicker"
            value={formData.fromDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange("fromDate", event, date)
            }
            minimumDate={new Date(new Date().getTime() - 31 * 24 * 60 * 60 * 1000)} // 31 days ago
          />
        )}
      </View>

      {/* To Date Field */}
      <View style={sharedStyles.fieldContainer}>
        <Text style={[sharedStyles.label, { color: theme.colors.textPrimary }]}>
          To Date <Text style={{ color: theme.statusColors.error }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            sharedStyles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          onPress={() => showAndroidDatePicker("toDate")}
        >
          <Text
            style={[
              sharedStyles.inputText,
              {
                color: formData.toDate
                  ? theme.colors.textPrimary
                  : theme.colors.inputPlaceholder,
              },
            ]}
          >
            {formData.toDate ? formatDate(formData.toDate) : "Select Date"}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.iconSecondary}
            style={sharedStyles.calendarIcon}
          />
        </TouchableOpacity>

        {showToDatePicker && (
          <DateTimePicker
            testID="toDatePicker"
            value={formData.toDate || formData.fromDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange("toDate", event, date)
            }
            minimumDate={formData.fromDate || new Date()}
          />
        )}
      </View>

      {/* Half Day Checkbox */}
      <View style={sharedStyles.checkboxRow}>
        <TouchableOpacity
          style={sharedStyles.checkboxContainer}
          onPress={toggleHalfDay}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: theme.colors.checkboxBorder,
              backgroundColor: formData.isHalfDay
                ? theme.colors.checkboxFill
                : theme.colors.inputBackground,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: theme.borderRadius.xs,
            }}
          >
            {formData.isHalfDay && (
              <Ionicons
                name="checkmark"
                size={16}
                color={theme.baseColors.white}
              />
            )}
          </View>
        </TouchableOpacity>
        <Text
          style={[
            sharedStyles.checkboxLabel,
            { color: theme.colors.textPrimary },
          ]}
        >
          Half Day
        </Text>
      </View>

      {/* Half Day Date Picker (only shown when isHalfDay is true) */}
      {formData.isHalfDay && (
        <View style={sharedStyles.fieldContainer}>
          <Text style={[sharedStyles.label, { color: theme.colors.textPrimary }]}>
            Half Day Date <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              sharedStyles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
              },
            ]}
            onPress={showAndroidHalfDayDatePicker}
          >
            <Text
              style={[
                sharedStyles.inputText,
                {
                  color: formData.halfDayDate
                    ? theme.colors.textPrimary
                    : theme.colors.inputPlaceholder,
                },
              ]}
            >
              {formData.halfDayDate ? formatDate(formData.halfDayDate) : "Select Half Day Date"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.iconSecondary}
              style={sharedStyles.calendarIcon}
            />
          </TouchableOpacity>

          {showHalfDayDatePicker && (
            <DateTimePicker
              testID="halfDayDatePicker"
              value={formData.halfDayDate || formData.fromDate || new Date()}
              mode="date"
              display="default"
              onChange={handleHalfDayDateChange}
              minimumDate={formData.fromDate || new Date()}
              maximumDate={formData.toDate || undefined}
            />
          )}
        </View>
      )}
    </>
  );
};


export default DatesSection;
