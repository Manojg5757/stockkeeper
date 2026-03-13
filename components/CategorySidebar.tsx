import React from 'react';
import { Category, Product } from '../lib/types';

interface CategorySidebarProps {
  categories: Category[];
  products: Product[];
  productCounts: { [key: string]: number };
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  lowStockProducts: Product[];
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  products,
  productCounts,
  selectedCategoryId,
  onSelectCategory,
  lowStockProducts,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isOpen,
  onClose,
}) => {
  const getLowStockCount = (categoryId: string) => {
    return lowStockProducts.filter((product) => product.categoryId === categoryId).length;
  };

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 md:z-auto w-80 sm:w-64 md:w-64 h-full bg-gray-800 border-r border-gray-700 transition-transform duration-300 overflow-y-auto`}>
      <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-amber-500">Categories</h2>
          <div className="flex space-x-2">
            <button
              onClick={onAddCategory}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add</span>
            </button>
            <button
              onClick={onClose}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            selectedCategoryId === null ? 'bg-amber-600 text-black font-semibold' : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>All Categories</span>
            <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-sm font-medium">
              {products.length}
            </span>
          </div>
        </button>
        {categories.map((category) => {
          const productCount = productCounts[category.id] || 0;
          const lowStockCount = getLowStockCount(category.id);
          return (
            <div
              key={category.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedCategoryId === category.id ? 'bg-amber-600 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              onClick={() => onSelectCategory(category.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.colorHex }}
                  ></div>
                  <span className="font-medium truncate">{category.name}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(category);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                    title="Edit category"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCategory(category.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete category"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{productCount} products</span>
                {lowStockCount > 0 && (
                  <span className="text-red-400 font-medium">⚠️ {lowStockCount} low</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySidebar;