export type TransactionType = 'income' | 'expense';

export interface BaseTransaction {
  id: string;
  date: string;
  type: TransactionType;
  description?: string;
}

export interface IncomeTransaction extends BaseTransaction {
  type: 'income';
  cashAmount: number;
  creditCardAmount: number;
  ibanAmount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface ExpenseTransaction extends BaseTransaction {
  type: 'expense';
  expenseType: string;
  amount: number;
  description?: string;
}

export type Transaction = IncomeTransaction | ExpenseTransaction;

export interface ExpenseType {
  id: string;
  name: string;
}

export interface ExcelExportSettings {
  filePath: string;
}

export interface TransactionFilters {
  search: string;
  category: 'all' | 'income' | 'expense';
}