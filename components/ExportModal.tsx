import React, { useState } from 'react';
import { Category } from '../lib/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: {
    type: 'all' | 'low' | 'out' | 'category';
    categoryId?: string;
  }) => void;
  categories: Category[];
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  categories,
}) => {
  const [exportType, setExportType] = useState<'all' | 'low' | 'out' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleExport = () => {
    onExport({
      type: exportType,
      categoryId: exportType === 'category' ? selectedCategory : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded w-96">
        <h2 className="text-xl font-bold text-amber-500 mb-4">Export CSV</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Export Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            >
              <option value="all">All Products</option>
              <option value="low">Low Stock Products</option>
              <option value="out">Out of Stock Products</option>
              <option value="category">Specific Category</option>
            </select>
          </div>
          {exportType === 'category' && (
            <div>
              <label className="block text-gray-400 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-600"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;