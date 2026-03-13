import React, { useState, useMemo } from 'react';
import { Product, Category } from '../lib/types';
import jsPDF from 'jspdf';

interface InvoiceItem {
  product: Product;
  quantity: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onSave?: (items: InvoiceItem[]) => Promise<void>;
  onError?: (message: string) => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  onSave,
}) => {
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchSupplier, setSearchSupplier] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryName =
        categories.find((c) => c.id === product.categoryId)?.name || '';
      return (
        product.name.toLowerCase().includes(searchName.toLowerCase()) &&
        categoryName.toLowerCase().includes(searchCategory.toLowerCase()) &&
        product.supplier.toLowerCase().includes(searchSupplier.toLowerCase())
      );
    });
  }, [products, categories, searchName, searchCategory, searchSupplier]);

  const addProduct = (product: Product) => {
    if (!selectedItems.find((item) => item.product.id === product.id)) {
      setSelectedItems([...selectedItems, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setSelectedItems(
      selectedItems.filter((item) => item.product.id !== productId)
    );
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGST = 0;
    selectedItems.forEach((item) => {
      const amount = item.product.unitPrice * item.quantity;
      subtotal += amount;
      totalGST += amount * (item.product.gstPercentage / 100);
    });
    const grandTotal = subtotal + totalGST;
    return { subtotal, totalGST, grandTotal };
  };

  const generatePDF = async () => {
    if (!customerName.trim()) {
      // Instead of alert, we'll handle this in the parent component
      return;
    }

    const { subtotal, totalGST, grandTotal } = calculateTotals();
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('R.K PUMPS - Invoice', 20, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${customerName}`, 20, 40);
    doc.text(`Address: ${customerAddress}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

    let y = 80;
    doc.text('Item', 20, y);
    doc.text('Qty', 80, y);
    doc.text('Rate', 100, y);
    doc.text('GST', 130, y);
    doc.text('Amount', 150, y);
    y += 10;

    selectedItems.forEach((item) => {
      doc.text(item.product.name, 20, y);
      doc.text(item.quantity.toString(), 80, y);
      doc.text(`INR ${item.product.unitPrice.toFixed(2)}`, 100, y);
      doc.text(`${item.product.gstPercentage}%`, 130, y);
      doc.text(
        `INR ${(item.product.unitPrice * item.quantity).toFixed(2)}`,
        150,
        y
      );
      y += 10;
    });

    y += 10;
    doc.text(`Subtotal: INR ${subtotal.toFixed(2)}`, 120, y);
    y += 10;
    doc.text(`GST: INR ${totalGST.toFixed(2)}`, 120, y);
    y += 10;
    doc.text(`Grand Total: INR ${grandTotal.toFixed(2)}`, 120, y);

    doc.save('invoice.pdf');

    // Update stock quantities after generating PDF
    if (onSave) {
      await onSave(selectedItems);
    }

    // Reset form
    setSelectedItems([]);
    setCustomerName('');
    setCustomerAddress('');
    onClose();
  };

  if (!isOpen) return null;

  const { subtotal, totalGST, grandTotal } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded w-full max-w-4xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-amber-500 mb-4">
          Create Invoice
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Customer Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 mb-1">Search by Name</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">
              Search by Category
            </label>
            <input
              type="text"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">
              Search by Supplier
            </label>
            <input
              type="text"
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              placeholder="Supplier name"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-amber-500 mb-2">
              Available Products
            </h3>
            <div className="max-h-64 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center mb-2 p-2 bg-gray-700 rounded"
                >
                  <div>
                    <span className="block font-semibold">{product.name}</span>
                    <span className="text-sm text-gray-400">
                      SKU: {product.sku} | GST: {product.gstPercentage}% | INR{' '}
                      {product.unitPrice}
                    </span>
                  </div>
                  <button
                    onClick={() => addProduct(product)}
                    className="bg-amber-500 text-black px-2 py-1 rounded hover:bg-amber-600"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-500 mb-2">
              Selected Items
            </h3>
            <div className="max-h-64 overflow-y-auto">
              {selectedItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{item.product.name}</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.product.id, Number(e.target.value))
                    }
                    className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                  />
                  <span>
                    INR {(item.product.unitPrice * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p>Subtotal: INR {subtotal.toFixed(2)}</p>
              <p>GST: INR {totalGST.toFixed(2)}</p>
              <p className="font-bold">
                Grand Total: INR {grandTotal.toFixed(2)}
              </p>
            </div>
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
            onClick={generatePDF}
            className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-600"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
