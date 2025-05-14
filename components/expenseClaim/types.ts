export enum TabType {
  EXPENSES = "Expenses",
  ADVANCES = "Advances",
  TOTALS = "Totals",
}

export interface ExpenseItem {
  expense_date: string;
  expense_type: string;
  description?: string;
  date: Date;
  amount: number;
  sanctioned_amount?: number;
  cost_center?: string;
  project?: string;
}

export interface TaxItem {
  account_head: string;
  rate?: number;
  amount: number;
  description?: string;
  cost_center?: string;
  project?: string;
}

export interface AdvanceItem {
  [key: string]: any;
}

export interface ExpensesTabProps {
  expenseItems: ExpenseItem[];
  taxItems: TaxItem[];
  totalAmount: number;
  totalTaxAmount: number;
  setShowAddExpenseModal: (show: boolean) => void;
  setShowAddTaxModal: (show: boolean) => void;
}

export interface AdvancesTabProps {
  advanceItems: any[];
}

export interface TotalsTabProps {
  costCenter: string;
  totalAmount: number;
  totalSanctionedAmount: number;
  grandTotal: number;
}
export interface MediaItem {
  uri: string;
  name: string;
  type: string;
  size: number;
}
export interface MediaPickerProps {
  items: MediaItem[];
  onItemsChange: (items: MediaItem[]) => void;
  maxFileSize?: number;
  maxFiles?: number;
  allowedTypes?: string[];
  containerStyle?: object;
  uploadText?: string;
  processingText?: string;
  fileSizeExceededMessage?: string;
  maxFilesExceededMessage?: string;
  uploadErrorMessage?: string;
  uploadIcon?: string;
}
