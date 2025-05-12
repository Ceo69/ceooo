import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { 
  Transaction, 
  IncomeTransaction, 
  ExpenseTransaction, 
  ExpenseType,
  ExcelExportSettings
} from '../types';

interface TransactionContextType {
  transactions: Transaction[];
  expenseTypes: ExpenseType[];
  excelSettings: ExcelExportSettings;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addExpenseType: (name: string) => void;
  updateExpenseType: (id: string, name: string) => void;
  deleteExpenseType: (id: string) => void;
  updateExcelSettings: (settings: ExcelExportSettings) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

const DEFAULT_EXPENSE_TYPES: ExpenseType[] = [
  { id: uuidv4(), name: 'Faturalar' },
  { id: uuidv4(), name: 'Kira' },
  { id: uuidv4(), name: 'Maaşlar' },
  { id: uuidv4(), name: 'Diğer' }
];

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>(() => {
    const savedExpenseTypes = localStorage.getItem('expenseTypes');
    return savedExpenseTypes ? JSON.parse(savedExpenseTypes) : DEFAULT_EXPENSE_TYPES;
  });
  
  const [excelSettings, setExcelSettings] = useState<ExcelExportSettings>(() => {
    const savedSettings = localStorage.getItem('excelSettings');
    return savedSettings ? JSON.parse(savedSettings) : { filePath: '' };
  });
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('expenseTypes', JSON.stringify(expenseTypes));
  }, [expenseTypes]);
  
  useEffect(() => {
    localStorage.setItem('excelSettings', JSON.stringify(excelSettings));
  }, [excelSettings]);

  // Add beforeunload event listener to export data to Excel
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (excelSettings.filePath && transactions.length > 0) {
        console.log('Exporting data to Excel...', excelSettings.filePath);
        // In a real application, this would be implemented to export data to Excel
        // For this demo, we'll just log that it's happening
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [excelSettings, transactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transactionData,
      id: uuidv4(),
    };
    
    setTransactions([newTransaction, ...transactions]);
    toast.success('İşlem başarıyla kaydedildi!');
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
    setEditingTransaction(null);
    toast.success('İşlem başarıyla güncellendi!');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
    toast.success('İşlem başarıyla silindi!');
  };

  const addExpenseType = (name: string) => {
    const newExpenseType = {
      id: uuidv4(),
      name,
    };
    
    setExpenseTypes([...expenseTypes, newExpenseType]);
    toast.success('Gider türü başarıyla eklendi!');
  };

  const updateExpenseType = (id: string, name: string) => {
    setExpenseTypes(
      expenseTypes.map((expenseType) =>
        expenseType.id === id ? { ...expenseType, name } : expenseType
      )
    );
    toast.success('Gider türü başarıyla güncellendi!');
  };

  const deleteExpenseType = (id: string) => {
    // Check if this expense type is used in any transactions
    const isUsed = transactions.some(
      (transaction) => 
        transaction.type === 'expense' && 
        (transaction as ExpenseTransaction).expenseType === id
    );
    
    if (isUsed) {
      toast.error('Bu gider türü kullanımda olduğu için silinemez!');
      return;
    }
    
    setExpenseTypes(expenseTypes.filter((expenseType) => expenseType.id !== id));
    toast.success('Gider türü başarıyla silindi!');
  };

  const updateExcelSettings = (settings: ExcelExportSettings) => {
    setExcelSettings(settings);
    toast.success('Excel ayarları başarıyla güncellendi!');
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        expenseTypes,
        excelSettings,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addExpenseType,
        updateExpenseType,
        deleteExpenseType,
        updateExcelSettings,
        editingTransaction,
        setEditingTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};