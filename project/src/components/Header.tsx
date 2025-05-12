import React from 'react';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type HeaderProps = {
  activeTab: 'main' | 'analytical' | 'detailed' | 'admin';
  setActiveTab: (tab: 'main' | 'analytical' | 'detailed' | 'admin') => void;
};

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Financial Tracking System
          </h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonStar className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex mt-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('main')}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'main'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Ana Sayfa
          </button>
          <button
            onClick={() => setActiveTab('analytical')}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'analytical'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Analiz Raporları
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'detailed'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Detaylı Raporlar
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'admin'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Yönetici Paneli
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;