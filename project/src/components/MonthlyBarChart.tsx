import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTransactions } from '../context/TransactionContext';
import { getLast12MonthsData } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyBarChart: React.FC = () => {
  const { transactions } = useTransactions();
  const { theme } = useTheme();
  
  const last12MonthsData = getLast12MonthsData(transactions);
  
  const chartTextColor = theme === 'dark' ? '#f3f4f6' : '#1f2937';
  
  const chartData = {
    labels: last12MonthsData.map(month => month.month),
    datasets: [
      {
        label: 'Gelir',
        data: last12MonthsData.map(month => month.income),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Gider',
        data: last12MonthsData.map(month => month.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ],
  };
  
  const chartOptions = {
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
        text: 'Son 12 Ayın Gelir/Gider Grafiği',
        color: chartTextColor,
      },
    },
  };

  return (
    <div className="h-96">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default MonthlyBarChart;