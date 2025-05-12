import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

const AdminPanel: React.FC = () => {
  const { 
    expenseTypes, 
    addExpenseType, 
    updateExpenseType, 
    deleteExpenseType, 
    excelSettings, 
    updateExcelSettings 
  } = useTransactions();
  
  const [newExpenseType, setNewExpenseType] = useState('');
  const [editingExpenseType, setEditingExpenseType] = useState<{ id: string; name: string } | null>(null);
  const [excelFilePath, setExcelFilePath] = useState(excelSettings.filePath);
  
  const handleAddExpenseType = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newExpenseType.trim()) {
      alert('Lütfen geçerli bir gider türü girin!');
      return;
    }
    
    // Check if expense type already exists
    if (expenseTypes.some((type) => type.name.toLowerCase() === newExpenseType.trim().toLowerCase())) {
      alert('Bu gider türü zaten var!');
      return;
    }
    
    addExpenseType(newExpenseType.trim());
    setNewExpenseType('');
  };

  const handleUpdateExpenseType = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingExpenseType || !editingExpenseType.name.trim()) {
      alert('Lütfen geçerli bir gider türü girin!');
      return;
    }
    
    // Check if expense type already exists and is not the current one
    if (
      expenseTypes.some(
        (type) => 
          type.id !== editingExpenseType.id && 
          type.name.toLowerCase() === editingExpenseType.name.trim().toLowerCase()
      )
    ) {
      alert('Bu gider türü zaten var!');
      return;
    }
    
    updateExpenseType(editingExpenseType.id, editingExpenseType.name.trim());
    setEditingExpenseType(null);
  };

  const handleUpdateExcelSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateExcelSettings({ filePath: excelFilePath.trim() });
  };

  const handleExportToExcel = () => {
    if (!excelSettings.filePath) {
      alert('Lütfen önce Excel veri yolu belirleyin!');
      return;
    }
    
    alert(`Veriler "${excelSettings.filePath}" dosyasına aktarılacak.\n\nBu bir demo uygulama olduğu için gerçek bir Excel aktarımı yapılmamaktadır.`);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Yönetici Paneli</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Gider Türlerini Yönet</h3>
          
          <form onSubmit={handleAddExpenseType} className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={newExpenseType}
                onChange={(e) => setNewExpenseType(e.target.value)}
                placeholder="Yeni gider türü"
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-md flex items-center transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ekle
              </button>
            </div>
          </form>
          
          <div className="space-y-2">
            {expenseTypes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Henüz gider türü eklenmemiş.</p>
            ) : (
              expenseTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  {editingExpenseType?.id === type.id ? (
                    <form onSubmit={handleUpdateExpenseType} className="flex-1 flex">
                      <input
                        type="text"
                        value={editingExpenseType.name}
                        onChange={(e) => setEditingExpenseType({ ...editingExpenseType, name: e.target.value })}
                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-2 ml-2">
                        <button
                          type="submit"
                          className="p-1 rounded-md bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingExpenseType(null)}
                          className="p-1 rounded-md bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span className="text-gray-700 dark:text-gray-300">{type.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingExpenseType(type)}
                          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 transition-colors duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteExpenseType(type.id)}
                          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Excel Veri Yönetimi</h3>
          
          <form onSubmit={handleUpdateExcelSettings} className="mb-6">
            <div className="mb-4">
              <label htmlFor="excelPath" className="block text-gray-700 dark:text-gray-300 mb-2">
                Excel Dosya Yolu
              </label>
              <input
                type="text"
                id="excelPath"
                value={excelFilePath}
                onChange={(e) => setExcelFilePath(e.target.value)}
                placeholder="C:\Finansal Veriler\veri.xlsx"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Verilerin aktarılacağı Excel dosyasının yolunu belirtin. Demo uygulamada gerçek bir Excel aktarımı yapılmamaktadır.
              </p>
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
            >
              Kaydet
            </button>
          </form>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={handleExportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
            >
              Verileri Excel'e Aktar
            </button>
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Uygulama kapandığında veya tarayıcı sekmesi kapatıldığında veriler otomatik olarak Excel'e aktarılacaktır. Demo uygulamada gerçek bir Excel aktarımı yapılmamaktadır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;