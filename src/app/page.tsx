'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Category, Product } from '../../lib/types';
import StatsHeader from '../../components/StatsHeader';
import ProductTable from '../../components/ProductTable';
import DetailPanel from '../../components/DetailPanel';
import CategoryModal from '../../components/CategoryModal';
import ProductModal from '../../components/ProductModal';
import InvoiceModal from '../../components/InvoiceModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

const defaultCategories: Omit<Category, 'id'>[] = [
  {
    name: 'Bolts',
    description: 'Various types of bolts',
    colorHex: '#ff0000',
    createdAt: new Date(),
  },
  {
    name: 'Nuts',
    description: 'Various types of nuts',
    colorHex: '#00ff00',
    createdAt: new Date(),
  },
  {
    name: 'Pipes',
    description: 'Various types of pipes',
    colorHex: '#0000ff',
    createdAt: new Date(),
  },
];

const defaultProducts: Omit<Product, 'id'>[] = [
  {
    name: 'Bolt M10',
    sku: 'BOLT001',
    categoryId: null, // will set after adding categories
    description: 'M10 bolt',
    quantity: 100,
    unit: 'pcs',
    unitPrice: 10,
    reorderLevel: 20,
    supplier: 'Supplier A',
    location: 'Warehouse 1',
    material: 'Stainless A2',
    grade: 'Grade 8.8',
    gstPercentage: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Nut M10',
    sku: 'NUT001',
    categoryId: null,
    description: 'M10 nut',
    quantity: 150,
    unit: 'pcs',
    unitPrice: 5,
    reorderLevel: 30,
    supplier: 'Supplier B',
    location: 'Warehouse 1',
    material: 'Stainless A4',
    grade: 'Grade 8.8',
    gstPercentage: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Pipe 1 inch',
    sku: 'PIPE001',
    categoryId: null,
    description: '1 inch pipe',
    quantity: 50,
    unit: 'm',
    unitPrice: 50,
    reorderLevel: 10,
    supplier: 'Supplier C',
    location: 'Warehouse 2',
    material: 'Carbon Steel',
    grade: 'Grade A',
    gstPercentage: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Bolt M12',
    sku: 'BOLT002',
    categoryId: null,
    description: 'M12 bolt',
    quantity: 80,
    unit: 'pcs',
    unitPrice: 12,
    reorderLevel: 15,
    supplier: 'Supplier A',
    location: 'Warehouse 1',
    material: 'Zinc Plated',
    grade: 'Grade 10.9',
    gstPercentage: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Nut M12',
    sku: 'NUT002',
    categoryId: null,
    description: 'M12 nut',
    quantity: 120,
    unit: 'pcs',
    unitPrice: 6,
    reorderLevel: 25,
    supplier: 'Supplier B',
    location: 'Warehouse 1',
    material: 'Galvanized',
    grade: 'Grade 8.8',
    gstPercentage: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [selectedCategoryIdForDeletion, setSelectedCategoryIdForDeletion] = useState<string>('');
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [selectedCategoryIdForEdit, setSelectedCategoryIdForEdit] = useState<string>('');

  useEffect(() => {
    // Seed data if empty
    const seedData = async () => {
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      if (categoriesSnap.empty) {
        const catRefs = [];
        for (const cat of defaultCategories) {
          const docRef = await addDoc(collection(db, 'categories'), cat);
          catRefs.push(docRef.id);
        }
        const productsSnap = await getDocs(collection(db, 'products'));
        if (productsSnap.empty) {
          for (let i = 0; i < defaultProducts.length; i++) {
            const prod = { ...defaultProducts[i] };
            if (i < catRefs.length) prod.categoryId = catRefs[i];
            await addDoc(collection(db, 'products'), prod);
          }
        }
      }
    };
    seedData();

    // Listeners
    const categoriesUnsub = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const cats: Category[] = [];
        snapshot.forEach((doc) => {
          cats.push({ id: doc.id, ...doc.data() } as Category);
        });
        setCategories(cats);
      }
    );

    const productsUnsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
    });

    return () => {
      categoriesUnsub();
      productsUnsub();
    };
  }, []);

  const productCounts = products.reduce(
    (acc, prod) => {
      const catId = prod.categoryId || 'uncategorized';
      acc[catId] = (acc[catId] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number }
  );

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : products;

  const lowStockProducts = products.filter((p) => p.quantity <= p.reorderLevel);

  const totalValue = products.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setInvoiceModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleSaveCategory = async (
    cat: Omit<Category, 'id' | 'createdAt'>
  ) => {
    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          ...cat,
          createdAt: editingCategory.createdAt,
        });
        setToast({ message: 'Category updated', type: 'success' });
      } else {
        await addDoc(collection(db, 'categories'), {
          ...cat,
          createdAt: new Date(),
        });
        setToast({ message: 'Category added', type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Error saving category', type: 'error' });
    }
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find((c) => c.id === id);
    setCategoryToDelete(category || null);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      // Set categoryId to null on products
      const prodsToUpdate = products.filter((p) => p.categoryId === categoryToDelete.id);
      for (const prod of prodsToUpdate) {
        await updateDoc(doc(db, 'products', prod.id), {
          categoryId: null,
          updatedAt: new Date(),
        });
      }
      await deleteDoc(doc(db, 'categories', categoryToDelete.id));
      setToast({ message: 'Category deleted', type: 'success' });
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      setToast({ message: 'Error deleting category', type: 'error' });
    }
  };

  const handleDeleteCategoryFromModal = async () => {
    if (!selectedCategoryIdForDeletion) return;
    const category = categories.find((c) => c.id === selectedCategoryIdForDeletion);
    setCategoryToDelete(category || null);
    setDeleteCategoryModalOpen(false);
    setDeleteConfirmOpen(true);
  };

  const handleEditCategoryFromModal = () => {
    if (!selectedCategoryIdForEdit) return;
    const category = categories.find((c) => c.id === selectedCategoryIdForEdit);
    if (category) {
      handleEditCategory(category);
      setEditCategoryModalOpen(false);
    }
  };

  const handleSaveProduct = async (
    prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...prod,
          updatedAt: new Date(),
        });
        setToast({ message: 'Product updated', type: 'success' });
      } else {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setToast({ message: 'Product added', type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Error saving product', type: 'error' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?'))
      return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setToast({ message: 'Product deleted', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error deleting product', type: 'error' });
    }
  };

  const handleSaveInvoice = async (items: { product: Product; quantity: number }[]) => {
    try {
      // Update stock quantities
      for (const item of items) {
        const newQuantity = item.product.quantity - item.quantity;
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for ${item.product.name}`);
        }
        await updateDoc(doc(db, 'products', item.product.id), {
          quantity: newQuantity,
          updatedAt: new Date(),
        });
      }
      setToast({ message: 'Invoice generated and stock updated', type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Error updating stock', type: 'error' });
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleExportCSV = () => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <StatsHeader
        totalCategories={categories.length}
        totalProducts={products.length}
        onCreateInvoice={handleCreateInvoice}
      />
      <div className="p-4 md:p-6 space-y-6">
        <DetailPanel
          product={selectedProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />

        {/* Category Selection */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <label
                htmlFor="category-select"
                className="text-sm font-medium text-gray-300"
              >
                Filter by Category:
              </label>
              <select
                id="category-select"
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({productCounts[category.id] || 0} products)
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddCategory}
              className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Add Category</span>
            </button>
          </div>
          {/* Category Management Buttons */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedCategoryIdForEdit('');
                  setEditCategoryModalOpen(true);
                }}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
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
                <span>Edit Category</span>
              </button>
              <button
                onClick={() => {
                  setSelectedCategoryIdForDeletion('');
                  setDeleteCategoryModalOpen(true);
                }}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
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
                <span>Delete Category</span>
              </button>
            </div>
          </div>
        </div>

        <ProductTable
          products={filteredProducts}
          categories={categories}
          onSelectProduct={setSelectedProduct}
          selectedProductId={selectedProduct?.id || null}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </div>
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
        onError={(message) => setToast({ message, type: 'error' })}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        products={products}
        categories={categories}
        onSave={handleSaveInvoice}
      />
      {/* Edit Category Modal */}
      {editCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-amber-500 mb-4">Edit Category</h2>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Select Category to Edit:</label>
              <select
                value={selectedCategoryIdForEdit}
                onChange={(e) => setSelectedCategoryIdForEdit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose a category --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedCategoryIdForEdit && (
              <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded text-blue-300 text-sm">
                ℹ️ You will be able to edit the name, description, and color of this category.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditCategoryModalOpen(false);
                  setSelectedCategoryIdForEdit('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategoryFromModal}
                disabled={!selectedCategoryIdForEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Category Modal */}
      {deleteCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-amber-500 mb-4">Delete Category</h2>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Select Category to Delete:</label>
              <select
                value={selectedCategoryIdForDeletion}
                onChange={(e) => setSelectedCategoryIdForDeletion(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose a category --</option>
                {categories.map((category) => {
                  const productCount = products.filter((p) => p.categoryId === category.id).length;
                  return (
                    <option key={category.id} value={category.id}>
                      {category.name} ({productCount} products)
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedCategoryIdForDeletion && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
                ⚠️ Warning: All {products.filter((p) => p.categoryId === selectedCategoryIdForDeletion).length} product(s) in this category will be uncategorized.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteCategoryModalOpen(false);
                  setSelectedCategoryIdForDeletion('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategoryFromModal}
                disabled={!selectedCategoryIdForDeletion}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? ${categoryToDelete ? products.filter((p) => p.categoryId === categoryToDelete.id).length : 0} product(s) will be uncategorized.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        }}
        isDangerous
      />
    </div>
  );
}
