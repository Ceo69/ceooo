import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Search } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { Transaction, IncomeTransaction, ExpenseTransaction, TransactionFilters } from '../types';
import { formatCurrency } from '../utils/calculations';

const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction, setEditingTransaction, expenseTypes } = useTransactions();
  
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    category: 'all'
  });

  // Filter transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      // Filter by category
      if (filters.category !== 'all' && transaction.type !== filters.category) {
        return false;
      }
      
      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        
        if (transaction.type === 'income') {
          return transaction.description?.toLowerCase().includes(searchLower) || 
                 'gelir'.includes(searchLower);
        } else {
          const expense = transaction as ExpenseTransaction;
          const expenseTypeName = expenseTypes.find(type => type.id === expense.expenseType)?.name || '';
          
          return expense.description?.toLowerCase().includes(searchLower) || 
                 expenseTypeName.toLowerCase().includes(searchLower);
        }
      }
      
      return true;
    })
    .slice(0, 7); // Only show the last 7 transactions

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    // Scroll to transaction form
    document.getElementById('transaction-form')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      deleteTransaction(id);
    }
  };

  const getPaymentTypeDisplay = (transaction: Transaction): string => {
    if (transaction.type === 'income') {
      const income = transaction as IncomeTransaction;
      const parts = [];
      
      if (income.cashAmount > 0) {
        parts.push(`Nakit: ${formatCurrency(income.cashAmount)}`);
      }
      
      if (income.creditCardAmount > 0) {
        parts.push(`K.K.: ${formatCurrency(income.creditCardAmount)}`);
      }
      
      if (income.ibanAmount > 0) {
        parts.push(`IBAN: ${formatCurrency(income.ibanAmount)}`);
      }
      
      return parts.join(', ');
    } else {
      return 'N/A';
    }
  };

  const getDescriptionDisplay = (transaction: Transaction): string => {
    if (transaction.type === 'income') {
      return 'Gelir Kaydı';
    } else {
      const expense = transaction as ExpenseTransaction;
      const expenseTypeName = expenseTypes.find(type => type.id === expense.expenseType)?.name || '';
      return expense.description || expenseTypeName;
    }
  };

  const getRowClassName = (transaction: Transaction): string => {
    return transaction.type === 'income'
      ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
      : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20';
  };

  const getAmountDisplay = (transaction: Transaction): { amount: string; isPositive: boolean } => {
    if (transaction.type === 'income') {
      const income = transaction as IncomeTransaction;
      return {
        amount: formatCurrency(income.totalAmount),
        isPositive: true
      };
    } else {
      const expense = transaction as ExpenseTransaction;
      return {
        amount: `-${formatCurrency(expense.amount)}`,
        isPositive: false
      };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Son İşlemler</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ara..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value as 'all' | 'income' | 'expense' })}
            className="py-2 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tümü</option>
            <option value="income">Gelir</option>
            <option value="expense">Gider</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tarih
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Kategori
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Açıklama
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ödeme Türü
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tutar
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                  Henüz işlem bulunmamaktadır.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => {
                const { amount, isPositive } = getAmountDisplay(transaction);
                
                return (
                  <tr 
                    key={transaction.id} 
                    className={`${getRowClassName(transaction)} hover:bg-opacity-80 dark:hover:bg-opacity-30 transition-colors duration-200`}
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {format(new Date(transaction.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {getDescriptionDisplay(transaction)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {getPaymentTypeDisplay(transaction)}
                    </td>
                    <td className={`py-3 px-4 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {amount}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          aria-label="Düzenle"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          aria-label="Sil"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;