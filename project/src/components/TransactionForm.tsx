import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTransactions } from '../context/TransactionContext';
import { TransactionType, Transaction, IncomeTransaction, ExpenseTransaction } from '../types';

const TransactionForm: React.FC = () => {
  const {
    addTransaction,
    updateTransaction,
    expenseTypes,
    editingTransaction,
    setEditingTransaction,
  } = useTransactions();

  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Income fields
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [creditCardAmount, setCreditCardAmount] = useState<number>(0);
  const [ibanAmount, setIbanAmount] = useState<number>(0);
  const [vatAmount, setVatAmount] = useState<number>(0);
  
  // Expense fields
  const [expenseType, setExpenseType] = useState<string>(expenseTypes[0]?.id || '');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');

  // Total income calculation
  const totalIncome = cashAmount + creditCardAmount + ibanAmount;

  // Reset form
  const resetForm = () => {
    setTransactionType('income');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCashAmount(0);
    setCreditCardAmount(0);
    setIbanAmount(0);
    setVatAmount(0);
    setExpenseType(expenseTypes[0]?.id || '');
    setExpenseAmount(0);
    setDescription('');
    setEditingTransaction(null);
  };

  // Load data when editing transaction
  useEffect(() => {
    if (editingTransaction) {
      setTransactionType(editingTransaction.type);
      setDate(editingTransaction.date);
      
      if (editingTransaction.type === 'income') {
        const income = editingTransaction as IncomeTransaction;
        setCashAmount(income.cashAmount);
        setCreditCardAmount(income.creditCardAmount);
        setIbanAmount(income.ibanAmount);
        setVatAmount(income.vatAmount);
      } else {
        const expense = editingTransaction as ExpenseTransaction;
        setExpenseType(expense.expenseType);
        setExpenseAmount(expense.amount);
        setDescription(expense.description || '');
      }
    }
  }, [editingTransaction]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (transactionType === 'income') {
      if (cashAmount <= 0 && creditCardAmount <= 0 && ibanAmount <= 0) {
        alert('En az bir ödeme yöntemi için tutar giriniz!');
        return;
      }
      
      if (vatAmount < 0) {
        alert('KDV tutarı negatif olamaz!');
        return;
      }
    } else {
      if (!expenseType) {
        alert('Lütfen bir gider türü seçin!');
        return;
      }
      
      if (expenseAmount <= 0) {
        alert('Gider tutarı sıfırdan büyük olmalıdır!');
        return;
      }
    }
    
    // Create transaction object
    if (transactionType === 'income') {
      const incomeTransaction: Omit<IncomeTransaction, 'id'> = {
        type: 'income',
        date,
        cashAmount,
        creditCardAmount,
        ibanAmount,
        vatAmount,
        totalAmount: totalIncome,
        description: 'Gelir Kaydı',
      };
      
      if (editingTransaction) {
        updateTransaction({ ...incomeTransaction, id: editingTransaction.id });
      } else {
        addTransaction(incomeTransaction);
      }
    } else {
      const expenseTransaction: Omit<ExpenseTransaction, 'id'> = {
        type: 'expense',
        date,
        expenseType,
        amount: expenseAmount,
        description: description || expenseTypes.find(type => type.id === expenseType)?.name || 'Gider',
      };
      
      if (editingTransaction) {
        updateTransaction({ ...expenseTransaction, id: editingTransaction.id });
      } else {
        addTransaction(expenseTransaction);
      }
    }
    
    // Reset form
    resetForm();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Yeni İşlem</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">İşlem Türü</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTransactionType('income')}
              className={`py-2 px-4 rounded-md transition-colors duration-200 ${
                transactionType === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Gelir
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('expense')}
              className={`py-2 px-4 rounded-md transition-colors duration-200 ${
                transactionType === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Gider
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 dark:text-gray-300 mb-2">
            Tarih
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {transactionType === 'income' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cashAmount" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Nakit
                </label>
                <input
                  type="number"
                  id="cashAmount"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="creditCardAmount" className="block text-gray-700 dark:text-gray-300 mb-2">
                  K.K. Tutar
                </label>
                <input
                  type="number"
                  id="creditCardAmount"
                  value={creditCardAmount}
                  onChange={(e) => setCreditCardAmount(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ibanAmount" className="block text-gray-700 dark:text-gray-300 mb-2">
                  IBAN Tutar
                </label>
                <input
                  type="number"
                  id="ibanAmount"
                  value={ibanAmount}
                  onChange={(e) => setIbanAmount(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="vatAmount" className="block text-gray-700 dark:text-gray-300 mb-2">
                  KDV Tutar
                </label>
                <input
                  type="number"
                  id="vatAmount"
                  value={vatAmount}
                  onChange={(e) => setVatAmount(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Toplam Gelir:</span>
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalIncome)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="expenseType" className="block text-gray-700 dark:text-gray-300 mb-2">
                Gider Türü
              </label>
              <select
                id="expenseType"
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Gider türü seçin</option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="expenseAmount" className="block text-gray-700 dark:text-gray-300 mb-2">
                Gider Tutarı
              </label>
              <input
                type="number"
                id="expenseAmount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        )}
        
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
          >
            {editingTransaction ? 'Güncelle' : 'Kaydet'}
          </button>
          
          {editingTransaction && (
            <button
              type="button"
              onClick={resetForm}
              className="py-2 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
            >
              İptal
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;