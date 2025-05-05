import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 16
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginVertical: 16,
  },
  fieldContainer: {
    marginBottom: 16,
    position: "relative",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
  },
  dropdownContainer: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdown: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  addExpenseButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  addExpenseText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  expenseItemsContainer: {
    marginTop: 16,
  },
  itemsHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  expenseItemCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  expenseItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  expenseItemType: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseItemDate: {
    fontSize: 14,
  },
  expenseItemDesc: {
    fontSize: 14,
    marginBottom: 8,
  },
  expenseItemAmount: {
    alignItems: "flex-end",
  },
  expenseItemAmountText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

