import React from 'react';

interface StatisticCardProps {
  title: string;
  value: string;
  isPositive?: boolean;
  className?: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ 
  title, 
  value, 
  isPositive = true,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
      <p className={`text-xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {value}
      </p>
    </div>
  );
};

export default StatisticCard;