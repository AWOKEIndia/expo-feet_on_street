import { StyleSheet } from "react-native";

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
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
    marginBottom: 20,
    position: "relative",
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    fontSize: 14,
    flex: 1,
  },
  calendarIcon: {
    marginLeft: 8,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkboxContainer: {
    padding: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 16,
    zIndex: 1000,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 16,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  attachmentContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  attachmentContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentText: {
    marginTop: 8,
    fontSize: 14,
  },
  saveButtonContainer: {
    padding: 12,
  },
  saveButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceInfoContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  balanceDivider: {
    height: 1,
    marginVertical: 8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  remainingBalance: {
    fontWeight: "700",
  },
});
