'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Product, Category, Invoice } from '../../../lib/types';
import { useCart } from '../../../lib/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, FileText, Clock, CheckCircle, AlertCircle, IndianRupee } from 'lucide-react';

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, openCart, totals, items } = useCart();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'products'), (snap) => {
      const prods: Product[] = [];
      snap.forEach(doc => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    });
    const unsub2 = onSnapshot(collection(db, 'categories'), (snap) => {
      const cats: Category[] = [];
      snap.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });
    const unsub3 = onSnapshot(query(collection(db, 'invoices'), orderBy('createdAt', 'desc'), limit(10)), (snap) => {
      const invs: Invoice[] = [];
      snap.forEach(doc => invs.push({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(invs);
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const filtered = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, searchQuery]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v);

  const handleAdd = (product: Product) => {
    const result = addToCart(product);
    setToast({ message: result.message, type: result.success ? 'success' : 'error' });
    setTimeout(() => setToast(null), 3000);
  };

  const statusColor: Record<string, string> = {
    paid: 'text-green-400 bg-green-500/10',
    pending: 'text-amber-400 bg-amber-500/10',
    partial: 'text-blue-400 bg-blue-500/10',
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 mb-2">Billing</h1>
          <p className="text-gray-400">Create invoices and manage billing</p>
        </div>
        <button onClick={openCart} className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition-transform hover:scale-105 active:scale-95">
          <ShoppingCart className="w-5 h-5" />
          <span>View Cart ({items.length})</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg"><IndianRupee className="w-4 h-4 text-amber-500" /></div>
            <span className="text-sm text-gray-400">Cart Value</span>
          </div>
          <p className="text-2xl font-bold text-white">{fmt(totals.grandTotal)}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg"><ShoppingCart className="w-4 h-4 text-green-500" /></div>
            <span className="text-sm text-gray-400">Items in Cart</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.itemCount}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg"><FileText className="w-4 h-4 text-blue-500" /></div>
            <span className="text-sm text-gray-400">Recent Invoices</span>
          </div>
          <p className="text-2xl font-bold text-white">{invoices.length}</p>
        </div>
      </div>

      {/* Product Search & Quick Add */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Add to Cart</h2>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-gray-200 placeholder:text-gray-600"
          />
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-3 py-3">SKU</th>
                <th className="text-center px-3 py-3">Stock</th>
                <th className="text-right px-3 py-3">Price</th>
                <th className="text-center px-3 py-3">GST</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map(product => {
                const inCart = items.find(i => i.product.id === product.id);
                return (
                  <tr key={product.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-200 font-medium">{product.name}</td>
                    <td className="px-3 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
                    <td className="text-center px-3 py-3">
                      <span className={`font-medium ${product.quantity <= product.reorderLevel ? 'text-red-400' : 'text-gray-300'}`}>
                        {product.quantity} {product.unit}
                      </span>
                    </td>
                    <td className="text-right px-3 py-3 text-gray-300">{fmt(product.unitPrice)}</td>
                    <td className="text-center px-3 py-3 text-gray-500">{product.gstPercentage ?? 18}%</td>
                    <td className="text-right px-4 py-3">
                      <button
                        onClick={() => handleAdd(product)}
                        disabled={product.quantity <= 0}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {inCart ? `In Cart (${inCart.quantity})` : '+ Add'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Invoices */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" /> Recent Invoices
        </h2>
        {invoices.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No invoices yet. Generate your first invoice from the cart.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-800 rounded-lg"><FileText className="w-4 h-4 text-amber-500" /></div>
                  <div>
                    <p className="font-medium text-white font-mono text-sm">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{inv.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor[inv.paymentStatus] || 'text-gray-400 bg-gray-800'}`}>
                    {inv.paymentStatus}
                  </span>
                  <span className="text-white font-semibold">{fmt(inv.grandTotal)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-20 right-6 z-[90] px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
