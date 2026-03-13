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
import CategorySidebar from '../../components/CategorySidebar';
import ProductTable from '../../components/ProductTable';
import DetailPanel from '../../components/DetailPanel';
import CategoryModal from '../../components/CategoryModal';
import ProductModal from '../../components/ProductModal';
import InvoiceModal from '../../components/InvoiceModal';
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

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated products will be uncategorized.')) return;
    try {
      // Set categoryId to null on products
      const prodsToUpdate = products.filter((p) => p.categoryId === id);
      for (const prod of prodsToUpdate) {
        await updateDoc(doc(db, 'products', prod.id), {
          categoryId: null,
          updatedAt: new Date(),
        });
      }
      await deleteDoc(doc(db, 'categories', id));
      setToast({ message: 'Category deleted', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error deleting category', type: 'error' });
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
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setToast({ message: 'Product deleted', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error deleting product', type: 'error' });
    }
  };

  const handleExportCSV = () => {
    const csv = [
      [
        'SKU',
        'Name',
        'Category',
        'Description',
        'Quantity',
        'Unit',
        'Unit Price',
        'Total Value',
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
        p.quantity * p.unitPrice,
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
      <div className="flex flex-col md:flex-row min-h-screen">
        <CategorySidebar
          categories={categories}
          products={products}
          productCounts={productCounts}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          lowStockProducts={lowStockProducts}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
        <div className="flex-1">
          <DetailPanel
            product={selectedProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
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
      />
    </div>
  );
}
