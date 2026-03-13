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
    <div className="bg-gray-700 p-4 rounded mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-amber-500">{product.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onEditProduct(product)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDeleteProduct(product.id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-mono text-gray-400">SKU:</span>{' '}
          <span className="font-mono text-white">{product.sku}</span>
        </div>
        <div>
          <span className="text-gray-400">Description:</span>{' '}
          <span className="text-white">{product.description}</span>
        </div>
        <div>
          <span className="font-mono text-gray-400">Quantity:</span>{' '}
          <span className="font-mono text-white">
            {product.quantity} {product.unit}
          </span>
        </div>
        <div>
          <span className="font-mono text-gray-400">Unit Price:</span>{' '}
          <span className="font-mono text-amber-500">
            INR {product.unitPrice.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="font-mono text-gray-400">Total Value:</span>{' '}
          <span className="font-mono text-amber-500">
            INR {(product.quantity * product.unitPrice).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="font-mono text-gray-400">Reorder Level:</span>{' '}
          <span className="font-mono text-white">{product.reorderLevel}</span>
        </div>
        <div>
          <span className="text-gray-400">Supplier:</span>{' '}
          <span className="text-white">{product.supplier}</span>
        </div>
        <div>
          <span className="text-gray-400">Location:</span>{' '}
          <span className="text-white">{product.location}</span>
        </div>
        <div>
          <span className="text-gray-400">Material:</span>{' '}
          <span className="text-white">{product.material}</span>
        </div>
        <div>
          <span className="text-gray-400">Grade:</span>{' '}
          <span className="text-white">{product.grade}</span>
        </div>
        <div>
          <span className="font-mono text-gray-400">GST %:</span>{' '}
          <span className="font-mono text-white">{product.gstPercentage}%</span>
        </div>
        <div>
          <span className="text-gray-400">Created At:</span>{' '}
          <span className="text-white">
            {product.createdAt.toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Updated At:</span>{' '}
          <span className="text-white">
            {product.updatedAt.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
