import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Transaction, ExpenseTransaction } from '../types';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';
import { Download, Filter, SortAsc, SortDesc } from 'lucide-react';

type SortField = 'date' | 'type' | 'amount' | 'description';
type SortOrder = 'asc' | 'desc';

const DetailedReports: React.FC = () => {
  const { transactions, expenseTypes } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  
  // Filtreler
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    minAmount: '',
    maxAmount: '',
    expenseType: 'all',
    searchTerm: ''
  });
  
  // Sıralama
  const [sortConfig, setSortConfig] = useState<{field: SortField; order: SortOrder}>({
    field: 'date',
    order: 'desc'
  });

  // Filtreleme fonksiyonu
  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Tarih filtresi
    if (filters.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate);
    }
    
    // İşlem tipi filtresi
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    // Tutar filtresi
    if (filters.minAmount) {
      filtered = filtered.filter(t => {
        const amount = t.type === 'income' 
          ? (t as any).totalAmount 
          : (t as ExpenseTransaction).amount;
        return amount >= Number(filters.minAmount);
      });
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => {
        const amount = t.type === 'income' 
          ? (t as any).totalAmount 
          : (t as ExpenseTransaction).amount;
        return amount <= Number(filters.maxAmount);
      });
    }
    
    // Gider türü filtresi
    if (filters.expenseType !== 'all') {
      filtered = filtered.filter(t => 
        t.type === 'expense' && 
        (t as ExpenseTransaction).expenseType === filters.expenseType
      );
    }
    
    // Arama filtresi
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchLower) ||
        t.type.toLowerCase().includes(searchLower)
      );
    }
    
    // Sıralama
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.field) {
        case 'date':
          return sortConfig.order === 'asc' 
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date);
        
        case 'type':
          return sortConfig.order === 'asc'
            ? a.type.localeCompare(b.type)
            : b.type.localeCompare(a.type);
        
        case 'amount':
          aValue = a.type === 'income' ? (a as any).totalAmount : (a as ExpenseTransaction).amount;
          bValue = b.type === 'income' ? (b as any).totalAmount : (b as ExpenseTransaction).amount;
          return sortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;
        
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          return sortConfig.order === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        
        default:
          return 0;
      }
    });
    
    setFilteredTransactions(filtered);
  };

  // Excel'e aktarma
  const exportToExcel = () => {
    const headers = [
      'Tarih',
      'İşlem Tipi',
      'Açıklama',
      'Tutar',
      'Ödeme Türü',
      'KDV'
    ].join(',');

    const rows = filteredTransactions.map(t => {
      const amount = t.type === 'income' 
        ? (t as any).totalAmount 
        : (t as ExpenseTransaction).amount;
      
      const paymentType = t.type === 'income'
        ? `Nakit: ${(t as any).cashAmount}, KK: ${(t as any).creditCardAmount}, IBAN: ${(t as any).ibanAmount}`
        : '-';
      
      const vat = t.type === 'income' ? (t as any).vatAmount : '-';
      
      return [
        format(new Date(t.date), 'dd.MM.yyyy'),
        t.type === 'income' ? 'Gelir' : 'Gider',
        t.description || '-',
        amount.toFixed(2),
        paymentType,
        vat
      ].join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapor_${format(new Date(), 'dd_MM_yyyy')}.csv`;
    link.click();
  };

  // PDF'e aktarma
  const exportToPDF = () => {
    window.print(); // Basit bir PDF çözümü için tarayıcının yazdırma özelliğini kullanıyoruz
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detaylı Raporlar</h2>
      
      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters({...filters, startDate: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters({...filters, endDate: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İşlem Tipi
            </label>
            <select
              value={filters.type}
              onChange={e => setFilters({...filters, type: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value="all">Tümü</option>
              <option value="income">Gelir</option>
              <option value="expense">Gider</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min. Tutar
            </label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={e => setFilters({...filters, minAmount: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max. Tutar
            </label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={e => setFilters({...filters, maxAmount: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gider Türü
            </label>
            <select
              value={filters.expenseType}
              onChange={e => setFilters({...filters, expenseType: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value="all">Tümü</option>
              {expenseTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex gap-4">
          <input
            type="text"
            placeholder="Ara..."
            value={filters.searchTerm}
            onChange={e => setFilters({...filters, searchTerm: e.target.value})}
            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
          />
          
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
        </div>
      </div>
      
      {/* Tablo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtrelenmiş İşlemler
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th 
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => setSortConfig({
                    field: 'date',
                    order: sortConfig.field === 'date' && sortConfig.order === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  <div className="flex items-center gap-2">
                    Tarih
                    {sortConfig.field === 'date' && (
                      sortConfig.order === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => setSortConfig({
                    field: 'type',
                    order: sortConfig.field === 'type' && sortConfig.order === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  <div className="flex items-center gap-2">
                    Tür
                    {sortConfig.field === 'type' && (
                      sortConfig.order === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => setSortConfig({
                    field: 'description',
                    order: sortConfig.field === 'description' && sortConfig.order === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  <div className="flex items-center gap-2">
                    Açıklama
                    {sortConfig.field === 'description' && (
                      sortConfig.order === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => setSortConfig({
                    field: 'amount',
                    order: sortConfig.field === 'amount' && sortConfig.order === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  <div className="flex items-center gap-2">
                    Tutar
                    {sortConfig.field === 'amount' && (
                      sortConfig.order === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr 
                  key={transaction.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    {format(new Date(transaction.date), 'dd.MM.yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                  </td>
                  <td className="px-6 py-4">
                    {transaction.description || '-'}
                  </td>
                  <td className={`px-6 py-4 font-medium ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(
                      transaction.type === 'income'
                        ? (transaction as any).totalAmount
                        : (transaction as ExpenseTransaction).amount
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailedReports;