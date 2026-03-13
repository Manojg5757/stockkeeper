import React, { useState } from 'react';
import { Product, Category } from '../lib/types';
import ExportModal from './ExportModal';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onSelectProduct: (product: Product | null) => void;
  selectedProductId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: 'all' | 'low' | 'out';
  onFilterChange: (filter: 'all' | 'low' | 'out') => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  onSelectProduct,
  selectedProductId,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleExport = (filters: {
    type: 'all' | 'low' | 'out' | 'category';
    categoryId?: string;
  }) => {
    let filteredProducts = products;
    if (filters.type === 'low') {
      filteredProducts = products.filter((p) => p.quantity <= p.reorderLevel);
    } else if (filters.type === 'out') {
      filteredProducts = products.filter((p) => p.quantity === 0);
    } else if (filters.type === 'category' && filters.categoryId) {
      filteredProducts = products.filter((p) => p.categoryId === filters.categoryId);
    }
    // all is already all

    const csv = [
      ['SKU', 'Name', 'Category', 'Description', 'Quantity', 'Unit', 'Unit Price', 'Total Value', 'Reorder Level', 'Supplier', 'Location', 'Material', 'Grade', 'GST %', 'Created At', 'Updated At'],
      ...filteredProducts.map((p) => [
        p.sku,
        p.name,
        categories.find((c) => c.id === p.categoryId)?.name || '',
        p.description,
        p.quantity,
        p.unit,
        p.unitPrice,
        p.quantity * p.unitPrice,
        p.reorderLevel,
        p.supplier,
        p.location,
        p.material,
        p.grade,
        p.gstPercentage,
        p.createdAt.toISOString(),
        p.updatedAt.toISOString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'low' && product.quantity <= product.reorderLevel) ||
      (filter === 'out' && product.quantity === 0);
    return matchesSearch && matchesFilter;
  });

  const getQuantityBadge = (quantity: number, reorderLevel: number) => {
    if (quantity === 0) return 'bg-red-600 text-white';
    if (quantity <= reorderLevel) return 'bg-amber-600 text-black';
    return 'bg-green-600 text-white';
  };

  return (
    <div className="flex-1 p-4">
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search by name, SKU, or supplier..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-2 rounded ${
              filter === 'all'
                ? 'bg-amber-500 text-black'
                : 'bg-gray-700 text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('low')}
            className={`px-3 py-2 rounded ${
              filter === 'low'
                ? 'bg-amber-500 text-black'
                : 'bg-gray-700 text-white'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => onFilterChange('out')}
            className={`px-3 py-2 rounded ${
              filter === 'out'
                ? 'bg-amber-500 text-black'
                : 'bg-gray-700 text-white'
            }`}
          >
            Out of Stock
          </button>
        </div>
        <button
          onClick={onAddProduct}
          className="bg-amber-500 text-black px-4 py-2 rounded hover:bg-amber-600"
        >
          Add Product
        </button>
        <button
          onClick={() => setExportModalOpen(true)}
          className="bg-amber-500 text-black px-4 py-2 rounded hover:bg-amber-600"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 rounded">
          <thead className="bg-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-mono">SKU</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left font-mono">Unit Price</th>
              <th className="px-4 py-2 text-left font-mono">Total Value</th>
              <th className="px-4 py-2 text-left">Supplier</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={`cursor-pointer hover:bg-gray-700 ${
                  selectedProductId === product.id ? 'bg-gray-600' : ''
                }`}
              >
                <td className="px-4 py-2 font-mono">{product.sku}</td>
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-mono ${getQuantityBadge(
                      product.quantity,
                      product.reorderLevel
                    )}`}
                  >
                    {product.quantity} {product.unit}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono">
                  INR {product.unitPrice.toFixed(2)}
                </td>
                <td className="px-4 py-2 font-mono">
                  INR {(product.quantity * product.unitPrice).toFixed(2)}
                </td>
                <td className="px-4 py-2">{product.supplier}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProduct(product.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        categories={categories}
      />
    </div>
  );
};

export default ProductTable;
