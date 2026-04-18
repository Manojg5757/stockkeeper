'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Category } from '../../lib/types';
import { useInventoryStore } from '../../lib/store';
import { useCart } from '../../lib/CartContext';
import InventoryHealth from '../../components/InventoryHealth';
import ProductGrid from '../../components/ProductGrid';
import ProductModal from '../../components/ProductModal';
import CategoryManagerModal from '../../components/CategoryManagerModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import PDFReportGenerator from '../../components/PDFReportGenerator';
import { Search, Plus } from 'lucide-react';

export default function CommandCenter() {
  const { 
    products, 
    categories, 
    setProducts, 
    setCategories, 
    searchQuery, 
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter
  } = useInventoryStore();

  const { addToCart } = useCart();
  
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach(doc => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });

    const handleOpenNewProduct = () => {
      setEditingProduct(null);
      setProductModalOpen(true);
    };

    window.addEventListener('open-new-product', handleOpenNewProduct);

    return () => {
      unsubProducts();
      unsubCategories();
      window.removeEventListener('open-new-product', handleOpenNewProduct);
    };
  }, [setProducts, setCategories]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || p.categoryId === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = p.quantity > 0 && p.quantity <= p.reorderLevel;
    } else if (stockFilter === 'out') {
      matchesStock = p.quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleIncrement = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        quantity: product.quantity + 1,
        updatedAt: new Date(),
      });
    } catch (e) {
      setToast({ message: 'Error updating stock', type: 'error' });
    }
  };

  const handleDecrement = async (product: Product) => {
    if (product.quantity > 0) {
      try {
        await updateDoc(doc(db, 'products', product.id), {
          quantity: product.quantity - 1,
          updatedAt: new Date(),
        });
      } catch (e) {
        setToast({ message: 'Error updating stock', type: 'error' });
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, 'products', productToDelete.id));
        setToast({ message: 'Product deleted', type: 'success' });
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
      } catch (e) {
        setToast({ message: 'Error deleting product', type: 'error' });
      }
    }
  };

  const handleSaveProduct = async (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const handleAddToCart = (product: Product) => {
    const result = addToCart(product);
    if (result.success) {
      setToast({ message: result.message, type: 'success' });
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 mb-2">Command Center</h1>
          <p className="text-gray-400">Inventory Management & Resource Planning</p>
        </div>
        
        <div className="flex items-center gap-4">
          <PDFReportGenerator products={filteredProducts} categories={categories} />
          <button 
            onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Item (N)</span>
          </button>
        </div>
      </div>

      <InventoryHealth />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800 backdrop-blur-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            id="global-search"
            type="text"
            placeholder="Search items... (Press S)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-gray-200 transition-all placeholder:text-gray-600"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            <option value="all">All Stock Status</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <button 
            onClick={() => setCategoryManagerOpen(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Manage Categories
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <ProductGrid 
        products={filteredProducts} 
        categories={categories}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onEdit={handleEditProduct}
        onDelete={handleDeleteClick}
        onAddToCart={handleAddToCart}
      />

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
        onError={(message) => setToast({ message, type: 'error' })}
      />

      <CategoryManagerModal
        isOpen={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Item"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setProductToDelete(null); }}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
