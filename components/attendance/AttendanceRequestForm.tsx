import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AttendanceRequestFormProps {
  onSubmit: (data: AttendanceRequestData) => void;
  onCancel: () => void;
}

interface AttendanceRequestData {
  fromDate: Date | null;
  toDate: Date | null;
  isHalfDay: boolean;
  includeHolidays: boolean;
  shift: string;
  reason: string;
  explanation: string;
}

const AttendanceRequestForm: React.FC<AttendanceRequestFormProps> = ({ onSubmit, onCancel }) => {
  const { theme, isDark } = useTheme();

  const [formData, setFormData] = useState<AttendanceRequestData>({
    fromDate: null,
    toDate: null,
    isHalfDay: false,
    includeHolidays: false,
    shift: '',
    reason: '',
    explanation: ''
  });

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  const shifts = ['Day', "CFL Day"];
  const reasons = ['Work From Home', 'On Duty'];

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleDateChange = (field: 'fromDate' | 'toDate', selectedDate?: Date) => {
    if (field === 'fromDate') {
      setShowFromDatePicker(false);
    } else {
      setShowToDatePicker(false);
    }

    if (selectedDate) {
      setFormData({ ...formData, [field]: selectedDate });
    }
  };

  const toggleCheckbox = (field: 'isHalfDay' | 'includeHolidays') => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, {
        borderBottomColor: theme.colors.divider,
        backgroundColor: theme.colors.surfacePrimary
      }]}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.iconPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          New Attendance Request
        </Text>
      </View>

      <ScrollView style={[styles.form, { backgroundColor: theme.colors.background }]}>
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            From Date <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.input, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            }]}
            onPress={() => setShowFromDatePicker(true)}
          >
            <Text
              style={[
                styles.inputText,
                { color: theme.colors.textPrimary },
                !formData.fromDate && { color: theme.colors.inputPlaceholder }
              ]}
            >
              {formData.fromDate ? formatDate(formData.fromDate) : 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showFromDatePicker && (
            <DateTimePicker
              value={formData.fromDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => handleDateChange('fromDate', date)}
              minimumDate={new Date()}
              themeVariant={isDark ? 'dark' : 'light'}
            />
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            To Date <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.input, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            }]}
            onPress={() => setShowToDatePicker(true)}
          >
            <Text
              style={[
                styles.inputText,
                { color: theme.colors.textPrimary },
                !formData.toDate && { color: theme.colors.inputPlaceholder }
              ]}
            >
              {formData.toDate ? formatDate(formData.toDate) : 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showToDatePicker && (
            <DateTimePicker
              value={formData.toDate || (formData.fromDate || new Date())}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => handleDateChange('toDate', date)}
              minimumDate={formData.fromDate || new Date()}
              themeVariant={isDark ? 'dark' : 'light'}
            />
          )}
        </View>

        <View style={styles.checkboxRow}>
          <Pressable onPress={() => toggleCheckbox('isHalfDay')}>
            <View style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: theme.colors.checkboxBorder,
              backgroundColor: formData.isHalfDay
                ? theme.colors.checkboxFill
                : theme.colors.inputBackground,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.xs,
            }}>
              {formData.isHalfDay && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={theme.baseColors.white}
                />
              )}
            </View>
          </Pressable>
          <Text style={[styles.checkboxLabel, { color: theme.colors.textPrimary }]}>
            Half Day
          </Text>
        </View>

        <View style={styles.checkboxRow}>
          <Pressable onPress={() => toggleCheckbox('includeHolidays')}>
            <View style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: theme.colors.checkboxBorder,
              backgroundColor: formData.includeHolidays
                ? theme.colors.checkboxFill
                : theme.colors.inputBackground,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.xs,
            }}>
              {formData.includeHolidays && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={theme.baseColors.white}
                />
              )}
            </View>
          </Pressable>
          <Text style={[styles.checkboxLabel, { color: theme.colors.textPrimary }]}>
            Include Holidays
          </Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Shift</Text>
          <TouchableOpacity
            style={[styles.dropdownContainer, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            }]}
            onPress={() => setShowShiftDropdown(!showShiftDropdown)}
          >
            <Text
              style={[
                styles.inputText,
                { color: theme.colors.textPrimary },
                !formData.shift && { color: theme.colors.inputPlaceholder }
              ]}
            >
              {formData.shift || 'Select Shift Type'}
            </Text>
            <Ionicons
              name={showShiftDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.iconSecondary}
            />
          </TouchableOpacity>

          {showShiftDropdown && (
            <View style={[styles.dropdown, {
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            }]}>
              {shifts.map((shift, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dropdownItem, {
                    borderBottomColor: theme.colors.divider,
                    backgroundColor: theme.colors.surfacePrimary,
                  }]}
                  onPress={() => {
                    setFormData({ ...formData, shift });
                    setShowShiftDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: theme.colors.textPrimary }]}>
                    {shift}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Reason</Text>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Reason <Text style={{ color: theme.statusColors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdownContainer, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            }]}
            onPress={() => setShowReasonDropdown(!showReasonDropdown)}
          >
            <Text
              style={[
                styles.inputText,
                { color: theme.colors.textPrimary },
                !formData.reason && { color: theme.colors.inputPlaceholder }
              ]}
            >
              {formData.reason || 'Select Reason'}
            </Text>
            <Ionicons
              name={showReasonDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.iconSecondary}
            />
          </TouchableOpacity>

          {showReasonDropdown && (
            <View style={[styles.dropdown, {
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            }]}>
              {reasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dropdownItem, {
                    borderBottomColor: theme.colors.divider,
                    backgroundColor: theme.colors.surfacePrimary,
                  }]}
                  onPress={() => {
                    setFormData({ ...formData, reason });
                    setShowReasonDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: theme.colors.textPrimary }]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Explanation</Text>
          <TextInput
            style={[styles.input, styles.textarea, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.textPrimary
            }]}
            multiline
            placeholder="Enter Explanation"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={formData.explanation}
            onChangeText={(text) => setFormData({ ...formData, explanation: text })}
          />
        </View>
      </ScrollView>

      <View style={[styles.saveButtonContainer, {
        backgroundColor: theme.colors.surfacePrimary,
        borderTopColor: theme.colors.divider
      }]}>
        <TouchableOpacity
          style={[styles.saveButton, {
            backgroundColor: theme.colors.buttonPrimary
          }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.saveButtonText, { color: theme.baseColors.white }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
  },
  form: {
    padding: 16,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    fontSize: 14,
  },
  inputText: {
    fontSize: 14,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 4,
    zIndex: 1000,
    marginTop: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  saveButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AttendanceRequestForm;
