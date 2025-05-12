import React from 'react';
import StatisticCard from '../components/StatisticCard';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import MiniCharts from '../components/MiniCharts';
import { useTransactions } from '../context/TransactionContext';
import {
  formatCurrency,
  calculateMonthlyAverage,
  calculateYearlyAverage,
  getPreviousDayTurnover,
  calculateTotalIncome,
  getDailyAverage,
  calculateBalance,
  getTransactionsForCurrentMonth,
  getCurrentMonth
} from '../utils/calculations';

const MainPage: React.FC = () => {
  const { transactions } = useTransactions();
  
  const monthlyTransactions = getTransactionsForCurrentMonth(transactions);
  
  const monthlyAverage = calculateMonthlyAverage(transactions);
  const yearlyAverage = calculateYearlyAverage(transactions);
  const previousDayTurnover = getPreviousDayTurnover(transactions);
  const monthlyTotal = calculateTotalIncome(monthlyTransactions);
  const dailyAverage = getDailyAverage(transactions);
  const balance = calculateBalance(transactions);
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{getCurrentMonth()} Özet</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatisticCard
            title="Aylık Ortalama"
            value={formatCurrency(monthlyAverage)}
          />
          <StatisticCard
            title="Önceki Gün Cirosu"
            value={formatCurrency(previousDayTurnover)}
            isPositive={previousDayTurnover >= 0}
          />
          <StatisticCard
            title="Yıllık Ortalama"
            value={formatCurrency(yearlyAverage)}
          />
          <StatisticCard
            title="Aylık Toplam"
            value={formatCurrency(monthlyTotal)}
          />
          <StatisticCard
            title="Ortalama Günlük"
            value={formatCurrency(dailyAverage)}
          />
          <StatisticCard
            title="Genel Bakiye"
            value={formatCurrency(balance)}
            isPositive={balance >= 0}
          />
        </div>
      </div>
      
      <div id="transaction-form">
        <TransactionForm />
      </div>
      
      <TransactionList />
      
      <MiniCharts />
    </div>
  );
};

export default MainPage;