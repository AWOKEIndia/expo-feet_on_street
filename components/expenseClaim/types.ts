export enum TabType {
  EXPENSES = "Expenses",
  ADVANCES = "Advances",
  TOTALS = "Totals",
}

export type ExpenseItem = {
  date: Date;
  expenseType: string;
  description: string;
  amount: string;
  sanctionedAmount: string;
  costCenter: string;
  project: string;
};

export type TaxItem = {
  accountHead: string;
  rate: string;
  amount: string;
  description: string;
  costCenter: string;
  project: string;
};
