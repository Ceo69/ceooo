import React from 'react';
import MonthlyBarChart from '../components/MonthlyBarChart';
import { useTransactions } from '../context/TransactionContext';
import { ExpenseTransaction } from '../types';
import { formatCurrency } from '../utils/calculations';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const AnalyticalReports: React.FC = () => {
  const { transactions, expenseTypes } = useTransactions();
  
  // En yüksek 10 gider hesaplama
  const topExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .sort((a, b) => 
      (b as ExpenseTransaction).amount - (a as ExpenseTransaction).amount
    )
    .slice(0, 10);
  
  // Gider türü adını getir
  const getExpenseTypeName = (expenseTypeId: string) => {
    return expenseTypes.find((type) => type.id === expenseTypeId)?.name || 'Bilinmeyen';
  };
  
  // Ödeme yöntemi dağılımı
  const incomeDistribution = {
    cash: 0,
    creditCard: 0,
    iban: 0,
  };
  
  transactions
    .filter((transaction) => transaction.type === 'income')
    .forEach((transaction) => {
      const income = transaction as any;
      incomeDistribution.cash += income.cashAmount || 0;
      incomeDistribution.creditCard += income.creditCardAmount || 0;
      incomeDistribution.iban += income.ibanAmount || 0;
    });
  
  // Toplam gelir ve yüzdeleri hesapla
  const totalIncome = incomeDistribution.cash + incomeDistribution.creditCard + incomeDistribution.iban;
  
  const calculatePercentage = (amount: number) => {
    if (totalIncome === 0) return 0;
    return Math.round((amount / totalIncome) * 100);
  };

  // Aylık Büyüme Analizi
  const calculateMonthlyGrowth = () => {
    const today = new Date();
    const currentMonth = startOfMonth(today);
    const lastMonth = startOfMonth(endOfMonth(new Date(today.getFullYear(), today.getMonth() - 1)));
    
    const currentMonthTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start: currentMonth, end: today })
    );
    
    const lastMonthTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start: lastMonth, end: endOfMonth(lastMonth) })
    );
    
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t as any).totalAmount, 0);
    
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t as any).totalAmount, 0);
    
    const growthRate = lastMonthIncome ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
    
    return {
      currentMonth: currentMonthIncome,
      lastMonth: lastMonthIncome,
      growthRate: growthRate
    };
  };

  // KDV Analizi
  const vatAnalysis = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t: any) => acc + (t.vatAmount || 0), 0);

  // Ortalama İşlem Tutarı
  const averageTransactionAmount = {
    income: transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t: any) => sum + t.totalAmount, 0) / 
      (transactions.filter(t => t.type === 'income').length || 1),
    expense: transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t: any) => sum + t.amount, 0) / 
      (transactions.filter(t => t.type === 'expense').length || 1)
  };

  // Gider Kategorisi Trend Analizi
  const expenseTrends = expenseTypes.map(type => {
    const expenses = transactions
      .filter(t => t.type === 'expense' && (t as ExpenseTransaction).expenseType === type.id);
    
    const total = expenses.reduce((sum, t) => sum + (t as ExpenseTransaction).amount, 0);
    const average = total / (expenses.length || 1);
    
    return {
      name: type.name,
      total,
      average,
      count: expenses.length
    };
  });

  const monthlyGrowth = calculateMonthlyGrowth();
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Analiz Raporları</h2>
      
      {/* Yeni Raporlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Aylık Büyüme Analizi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Aylık Büyüme Analizi</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Bu Ay</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(monthlyGrowth.currentMonth)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Geçen Ay</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(monthlyGrowth.lastMonth)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Büyüme Oranı</span>
              <span className={`font-bold ${monthlyGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyGrowth.growthRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* KDV Analizi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">KDV Analizi</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Toplam KDV</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(vatAnalysis)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Toplam Gelire Oranı</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {totalIncome ? ((vatAnalysis / totalIncome) * 100).toFixed(2) : '0'}%
              </span>
            </div>
          </div>
        </div>

        {/* Ortalama İşlem Tutarı */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Ortalama İşlem Tutarı</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Ortalama Gelir</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(averageTransactionAmount.income)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Ortalama Gider</span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {formatCurrency(averageTransactionAmount.expense)}
              </span>
            </div>
          </div>
        </div>

        {/* Gider Kategorisi Trend Analizi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Gider Kategorisi Analizi</h3>
          <div className="space-y-4">
            {expenseTrends.map(trend => (
              <div key={trend.name} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{trend.name}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {formatCurrency(trend.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Ortalama: {formatCurrency(trend.average)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    İşlem: {trend.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mevcut Raporlar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Son 12 Ayın Gelir/Gider Analizi</h3>
        <MonthlyBarChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">En Yüksek 10 Gider</h3>
          
          {topExpenses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Henüz gider kaydı bulunmamaktadır.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Gider Türü
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tutar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topExpenses.map((expense) => {
                    const expenseData = expense as ExpenseTransaction;
                    
                    return (
                      <tr 
                        key={expense.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(expense.date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {getExpenseTypeName(expenseData.expenseType)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {expenseData.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-red-600 dark:text-red-400">
                          {formatCurrency(expenseData.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Gelir Dağılımı</h3>
          
          {totalIncome === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Henüz gelir kaydı bulunmamaktadır.</p>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nakit</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {calculatePercentage(incomeDistribution.cash)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2.5 bg-green-600 rounded-full" 
                      style={{ width: `${calculatePercentage(incomeDistribution.cash)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-right text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(incomeDistribution.cash)}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kredi Kartı</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {calculatePercentage(incomeDistribution.creditCard)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2.5 bg-blue-600 rounded-full" 
                      style={{ width: `${calculatePercentage(incomeDistribution.creditCard)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-right text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(incomeDistribution.creditCard)}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IBAN</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {calculatePercentage(incomeDistribution.iban)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2.5 bg-purple-600 rounded-full" 
                      style={{ width: `${calculatePercentage(incomeDistribution.iban)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-right text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(incomeDistribution.iban)}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Toplam Gelir</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticalReports;