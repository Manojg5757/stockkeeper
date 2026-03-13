import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
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
    type: 'all' | 'low' | 'out' | 'category' | 'separate';
    categoryId?: string;
    format: 'csv' | 'pdf';
  }) => {
    if (filters.type === 'separate' && filters.format === 'pdf') {
      // Generate separate PDFs for low stock, out of stock, and all products
      const lowStockProducts = products.filter(
        (p) => p.quantity <= p.reorderLevel
      );
      const outOfStockProducts = products.filter((p) => p.quantity === 0);
      const allProducts = products;

      // Generate Low Stock PDF
      if (lowStockProducts.length > 0) {
        generatePDF(
          lowStockProducts,
          'Low Stock Products Report',
          'low_stock_products.pdf'
        );
      }

      // Generate Out of Stock PDF
      if (outOfStockProducts.length > 0) {
        generatePDF(
          outOfStockProducts,
          'Out of Stock Products Report',
          'out_of_stock_products.pdf'
        );
      }

      // Generate All Products PDF
      generatePDF(allProducts, 'All Products Report', 'all_products.pdf');
    } else {
      let filteredProducts = products;
      if (filters.type === 'low') {
        filteredProducts = products.filter((p) => p.quantity <= p.reorderLevel);
      } else if (filters.type === 'out') {
        filteredProducts = products.filter((p) => p.quantity === 0);
      } else if (filters.type === 'category' && filters.categoryId) {
        filteredProducts = products.filter(
          (p) => p.categoryId === filters.categoryId
        );
      }
      // all is already all

      if (filters.format === 'csv') {
        console.log('Generating CSV for', filteredProducts.length, 'products');
        const csv = [
          [
            'SKU',
            'Name',
            'Category',
            'Description',
            'Stock',
            'Unit',
            'Unit Price',
            'Reorder Level',
            'Supplier',
            'Location',
            'Material',
            'Grade',
            'GST %',
            'Created At',
            'Updated At',
          ],
          ...filteredProducts.map((p) => [
            p.sku,
            p.name,
            categories.find((c) => c.id === p.categoryId)?.name || '',
            p.description,
            p.quantity,
            p.unit,
            p.unitPrice,
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
        console.log('CSV download triggered');
      } else if (filters.format === 'pdf') {
        const title =
          filters.type === 'low'
            ? 'Low Stock Products Report'
            : filters.type === 'out'
              ? 'Out of Stock Products Report'
              : filters.type === 'category'
                ? `Category Products Report`
                : 'All Products Report';
        generatePDF(filteredProducts, title, 'products.pdf');
      }
    }
  };

  const generatePDF = (
    productList: Product[],
    title: string,
    filename: string
  ) => {
    console.log('Generating PDF for', productList.length, 'products');
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape, mm, A4
    doc.text(title, 14, 20);

    // Add generation timestamp
    const now = new Date();
    doc.text(`Generated on: ${now.toLocaleString()}`, 14, 30);

    const tableData = productList.map((p) => [
      p.sku,
      p.name,
      categories.find((c) => c.id === p.categoryId)?.name || '',
      p.quantity.toString(),
      p.unit,
      `$${p.unitPrice.toFixed(2)}`,
      p.reorderLevel.toString(),
      p.supplier,
    ]);

    console.log('Table data:', tableData);

    autoTable(doc, {
      head: [
        [
          'SKU',
          'Name',
          'Category',
          'Qty',
          'Unit',
          'Unit Price',
          'Reorder Level',
          'Supplier',
        ],
      ],
      body: tableData,
      startY: 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
        7: { cellWidth: 30 },
      },
    });

    console.log('Saving PDF...');
    doc.save(filename);
    console.log('PDF saved');
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
    <div className="flex-1 p-2 md:p-4">
      <div className="mb-4 flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('low')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'low'
                ? 'bg-amber-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => onFilterChange('out')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'out'
                ? 'bg-amber-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Out of Stock
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddProduct}
            className="bg-amber-500 text-black px-4 py-2 rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="bg-amber-500 text-black px-4 py-2 rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center gap-2"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto -mx-2 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Supplier
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className={`cursor-pointer hover:bg-gray-700 transition-colors ${
                    selectedProductId === product.id ? 'bg-gray-600' : ''
                  }`}
                >
                  <td className="px-2 md:px-4 py-3 text-sm font-mono text-gray-300">
                    {product.sku}
                  </td>
                  <td className="px-2 md:px-4 py-3 text-sm text-white font-medium">
                    {product.name}
                  </td>
                  <td className="px-2 md:px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getQuantityBadge(
                        product.quantity,
                        product.reorderLevel
                      )}`}
                    >
                      {product.quantity} {product.unit}
                    </span>
                  </td>
                  <td className="px-2 md:px-4 py-3 text-sm font-mono text-gray-300">
                    ₹{product.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-2 md:px-4 py-3 text-sm text-gray-300 hidden md:table-cell">
                    {product.supplier}
                  </td>
                  <td className="px-2 md:px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct(product);
                        }}
                        className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit"
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
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProduct(product.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
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
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
