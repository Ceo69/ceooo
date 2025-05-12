import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useTransactions } from '../context/TransactionContext';
import { getLast7DaysData, getExpenseByType } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MiniCharts: React.FC = () => {
  const { transactions, expenseTypes } = useTransactions();
  const { theme } = useTheme();
  
  const last7DaysData = getLast7DaysData(transactions);
  const expenseByTypeData = getExpenseByType(transactions, expenseTypes);
  
  const chartTextColor = theme === 'dark' ? '#f3f4f6' : '#1f2937';
  
  // Daily Income/Expense Chart
  const dailyChartData = {
    labels: last7DaysData.map(day => day.date),
    datasets: [
      {
        label: 'Gelir',
        data: last7DaysData.map(day => day.income),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Gider',
        data: last7DaysData.map(day => day.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ],
  };
  
  const dailyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: theme === 'dark' ? 'rgba(243, 244, 246, 0.1)' : 'rgba(31, 41, 55, 0.1)',
        },
      },
      x: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: theme === 'dark' ? 'rgba(243, 244, 246, 0.1)' : 'rgba(31, 41, 55, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: chartTextColor,
        },
      },
      title: {
        display: true,
        text: 'Son 7 Günün Gelir/Gider Grafiği',
        color: chartTextColor,
      },
    },
  };
  
  // Expense by Type Pie Chart
  const expenseTypeColors = [
    'rgba(53, 162, 235, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(255, 99, 132, 0.6)',
  ];
  
  const expenseTypeBorderColors = expenseTypeColors.map(color => 
    color.replace('0.6', '1')
  );
  
  // Remove expense types with zero value
  const filteredExpenseTypes = Object.entries(expenseByTypeData)
    .filter(([_, value]) => value > 0);
  
  const pieChartData = {
    labels: filteredExpenseTypes.map(([label]) => label),
    datasets: [
      {
        label: 'Gider Tutarı',
        data: filteredExpenseTypes.map(([_, value]) => value),
        backgroundColor: expenseTypeColors.slice(0, filteredExpenseTypes.length),
        borderColor: expenseTypeBorderColors.slice(0, filteredExpenseTypes.length),
        borderWidth: 1,
      },
    ],
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: chartTextColor,
        },
      },
      title: {
        display: true,
        text: 'Gider Türleri Dağılımı',
        color: chartTextColor,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="h-64">
          <Bar data={dailyChartData} options={dailyChartOptions} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="h-64">
          {filteredExpenseTypes.length > 0 ? (
            <Pie data={pieChartData} options={pieChartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Gider verisi bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCharts;