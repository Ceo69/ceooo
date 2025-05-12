import { Transaction, IncomeTransaction, ExpenseTransaction } from '../types';
import { startOfMonth, endOfMonth, format, subDays, subMonths, isSameDay, isWithinInterval } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

export const getCurrentMonth = (): string => {
  return format(new Date(), 'MMMM yyyy');
};

export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + (transaction as IncomeTransaction).totalAmount, 0);
};

export const calculateTotalExpense = (transactions: Transaction[]): number => {
  return transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + (transaction as ExpenseTransaction).amount, 0);
};

export const calculateBalance = (transactions: Transaction[]): number => {
  return calculateTotalIncome(transactions) - calculateTotalExpense(transactions);
};

export const getTransactionsForCurrentMonth = (transactions: Transaction[]): Transaction[] => {
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const lastDayOfMonth = endOfMonth(today);
  
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return isWithinInterval(transactionDate, {
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });
  });
};

export const calculateMonthlyAverage = (transactions: Transaction[]): number => {
  const monthlyTransactions = getTransactionsForCurrentMonth(transactions);
  return calculateTotalIncome(monthlyTransactions) / new Date().getDate();
};

export const calculateYearlyAverage = (transactions: Transaction[]): number => {
  const currentYear = new Date().getFullYear();
  const yearlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getFullYear() === currentYear;
  });
  
  const months = new Set(
    yearlyTransactions.map((transaction) => 
      format(new Date(transaction.date), 'MM-yyyy')
    )
  );
  
  return calculateTotalIncome(yearlyTransactions) / (months.size || 1);
};

export const getPreviousDayTurnover = (transactions: Transaction[]): number => {
  const yesterday = subDays(new Date(), 1);
  
  const yesterdayTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return isSameDay(transactionDate, yesterday);
  });
  
  return calculateTotalIncome(yesterdayTransactions);
};

export const getDailyAverage = (transactions: Transaction[]): number => {
  const monthlyTransactions = getTransactionsForCurrentMonth(transactions);
  const days = new Set(
    monthlyTransactions.map((transaction) => 
      format(new Date(transaction.date), 'dd-MM-yyyy')
    )
  );
  
  return calculateTotalIncome(monthlyTransactions) / (days.size || 1);
};

export const getExpenseByType = (transactions: Transaction[], expenseTypes: { id: string, name: string }[]): Record<string, number> => {
  const result: Record<string, number> = {};
  
  expenseTypes.forEach((type) => {
    result[type.name] = 0;
  });
  
  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const expenseTransaction = transaction as ExpenseTransaction;
      const expenseType = expenseTypes.find((type) => type.id === expenseTransaction.expenseType);
      
      if (expenseType) {
        result[expenseType.name] += expenseTransaction.amount;
      }
    });
  
  return result;
};

export const getLast7DaysData = (transactions: Transaction[]): { date: string; income: number; expense: number }[] => {
  const result: { date: string; income: number; expense: number }[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, 'dd/MM');
    
    const dayTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return isSameDay(transactionDate, date);
    });
    
    const income = calculateTotalIncome(dayTransactions);
    const expense = calculateTotalExpense(dayTransactions);
    
    result.push({
      date: formattedDate,
      income,
      expense,
    });
  }
  
  return result;
};

export const getLast12MonthsData = (transactions: Transaction[]): { month: string; income: number; expense: number }[] => {
  const result: { month: string; income: number; expense: number }[] = [];
  
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const month = format(date, 'MMM');
    const year = format(date, 'yyyy');
    
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, {
        start: monthStart,
        end: monthEnd,
      });
    });
    
    const income = calculateTotalIncome(monthTransactions);
    const expense = calculateTotalExpense(monthTransactions);
    
    result.push({
      month: `${month} ${year}`,
      income,
      expense,
    });
  }
  
  return result;
};