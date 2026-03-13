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
}) => {
  const getLowStockCount = (categoryId: string) => {
    return lowStockProducts.filter((product) => product.categoryId === categoryId).length;
  };

  return (
    <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-amber-500">Categories</h2>
        <button
          onClick={onAddCategory}
          className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
        >
          Add
        </button>
      </div>
      <button
        onClick={() => onSelectCategory(null)}
        className={`w-full text-left p-2 rounded mb-2 ${
          selectedCategoryId === null ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        All Categories ({products.length})
      </button>
      {categories.map((category) => {
        const productCount = productCounts[category.id] || 0;
        const lowStockCount = getLowStockCount(category.id);
        return (
          <div
            key={category.id}
            className={`p-2 rounded mb-2 cursor-pointer ${
              selectedCategoryId === category.id ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.colorHex }}
                ></div>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(category);
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category.id);
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Del
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {productCount} products
              {lowStockCount > 0 && (
                <span className="text-red-400 ml-2">⚠️ {lowStockCount} low stock</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategorySidebar;