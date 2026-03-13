import React from 'react';
import { Product } from '../lib/types';

interface DetailPanelProps {
  product: Product | null;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  product,
  onEditProduct,
  onDeleteProduct,
}) => {
  if (!product) return null;

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg border border-gray-700">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-amber-500 mb-1">
            {product.name}
          </h2>
          <p className="text-gray-400 text-sm">{product.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEditProduct(product)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDeleteProduct(product.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            SKU
          </div>
          <div className="font-mono text-white text-lg">{product.sku}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Stock
          </div>
          <div className="font-mono text-white text-lg">
            {product.quantity}{' '}
            <span className="text-sm text-gray-400">{product.unit}</span>
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Unit Price
          </div>
          <div className="font-mono text-amber-500 text-lg">
            ₹{product.unitPrice.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Reorder Level
          </div>
          <div className="font-mono text-white text-lg">
            {product.reorderLevel}
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            GST
          </div>
          <div className="font-mono text-white text-lg">
            {product.gstPercentage}%
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg sm:col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Supplier
          </div>
          <div className="text-white">{product.supplier}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Location
          </div>
          <div className="text-white">{product.location}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Material
          </div>
          <div className="text-white">{product.material}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Grade
          </div>
          <div className="text-white">{product.grade}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Created
          </div>
          <div className="text-white text-sm">
            {product.createdAt.toLocaleDateString()}
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Updated
          </div>
          <div className="text-white text-sm">
            {product.updatedAt.toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
