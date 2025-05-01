import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  theme: any;
}

/**
 * A reusable themed alert dialog component
 */
const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
  onConfirm,
  onCancel,
  onDismiss,
  theme,
}) => {
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else if (showCancel && onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleDismiss}
    >
      <Pressable
        style={styles.alertOverlay}
        onPress={handleDismiss}
      >
        <View
          style={[
            styles.alertContainer,
            { backgroundColor: theme.colors.surfacePrimary },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <Text
            style={[styles.alertTitle, { color: theme.colors.textPrimary }]}
          >
            {title}
          </Text>
          <Text
            style={[styles.alertMessage, { color: theme.colors.textSecondary }]}
          >
            {message}
          </Text>
          <View style={[
            styles.alertButtonsContainer,
            showCancel ? { justifyContent: 'space-between' } : { justifyContent: 'flex-end' }
          ]}>
            {showCancel && (
              <TouchableOpacity
                style={[
                  styles.alertButton,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.colors.buttonBorder || theme.colors.inputBorder,
                  },
                ]}
                onPress={onCancel}
              >
                <Text
                  style={[styles.alertButtonText, { color: theme.colors.textPrimary }]}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.alertButton,
                { backgroundColor: theme.brandColors.primary },
              ]}
              onPress={onConfirm}
            >
              <Text
                style={[
                  styles.alertButtonText,
                  { color: theme.colors.textInverted },
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    width: "80%",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  alertButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AlertDialog;
