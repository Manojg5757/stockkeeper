'use client';

import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useInventoryStore } from '../lib/store';
import { Category, Product } from '../lib/types';
import CategoryModal from './CategoryModal';
import ConfirmModal from './ConfirmModal';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
  const { categories, products } = useInventoryStore();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleAddClick = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteClick = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteConfirmOpen(true);
  };

  const handleSaveCategory = async (cat: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          ...cat,
        });
      } else {
        await addDoc(collection(db, 'categories'), {
          ...cat,
          createdAt: new Date(),
        });
      }
      setIsCategoryModalOpen(false);
    } catch (e) {
      console.error('Error saving category', e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      // Unlink products
      const linkedProducts = products.filter(p => p.categoryId === categoryToDelete.id);
      for (const p of linkedProducts) {
        await updateDoc(doc(db, 'products', p.id), { categoryId: null, updatedAt: new Date() });
      }
      
      await deleteDoc(doc(db, 'categories', categoryToDelete.id));
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (e) {
      console.error('Error deleting category', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Manage Categories</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-400">Organize your inventory with color-coded categories.</p>
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition-transform hover:scale-105 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {categories.map(cat => {
            const productCount = products.filter(p => p.categoryId === cat.id).length;
            return (
              <div key={cat.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full shadow-sm border border-gray-600" style={{ backgroundColor: cat.colorHex }}></div>
                  <div>
                    <h3 className="font-semibold text-gray-100">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{productCount} items linked</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(cat)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(cat)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {categories.length === 0 && (
            <div className="text-center text-gray-500 py-10">No categories found. Create one to get started.</div>
          )}
        </div>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? ${products.filter(p => p.categoryId === categoryToDelete?.id).length} items will become uncategorized.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
