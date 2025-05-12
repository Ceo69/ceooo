import React, { useState } from 'react';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import AnalyticalReports from './pages/AnalyticalReports';
import DetailedReports from './pages/DetailedReports';
import AdminPanel from './pages/AdminPanel';
import { TransactionProvider } from './context/TransactionContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Tab type definition
type TabType = 'main' | 'analytical' | 'detailed' | 'admin';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('main');

  return (
    <ThemeProvider>
      <TransactionProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="container mx-auto px-4 py-6">
            {activeTab === 'main' && <MainPage />}
            {activeTab === 'analytical' && <AnalyticalReports />}
            {activeTab === 'detailed' && <DetailedReports />}
            {activeTab === 'admin' && <AdminPanel />}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-background)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              },
            }}
          />
        </div>
      </TransactionProvider>
    </ThemeProvider>
  );
}

export default App;