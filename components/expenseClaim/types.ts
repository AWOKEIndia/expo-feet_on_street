// types.ts
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
  // Define your advance item properties here
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
  advanceItems: AdvanceItem[];
}

export interface TotalsTabProps {
  costCenter: string;
  totalAmount: number;
  totalSanctionedAmount: number;
  grandTotal: number;
}
