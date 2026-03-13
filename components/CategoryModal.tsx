import React, { useState, useEffect } from 'react';
import { Category } from '../lib/types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  category: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorHex, setColorHex] = useState('#ffffff');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setColorHex(category.colorHex);
    } else {
      setName('');
      setDescription('');
      setColorHex('#ffffff');
    }
  }, [category, isOpen]);

  const handleSave = () => {
    onSave({ name, description, colorHex });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded w-96">
        <h2 className="text-xl font-bold text-amber-500 mb-4">
          {category ? 'Edit Category' : 'Add Category'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Color</label>
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-full h-10 bg-gray-700 rounded"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
