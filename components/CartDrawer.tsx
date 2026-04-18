'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingCart, FileText, AlertTriangle } from 'lucide-react';
import { useCart } from '../lib/CartContext';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openInvoice,
    totals,
  } = useCart();

  const [quantityErrors, setQuantityErrors] = useState<Record<string, string>>({});

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);

  const handleQuantityChange = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;

    const result = updateQuantity(productId, num);
    if (!result.success) {
      setQuantityErrors(prev => ({ ...prev, [productId]: result.message }));
      setTimeout(() => {
        setQuantityErrors(prev => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }, 3000);
    } else {
      setQuantityErrors(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const handleIncrement = (productId: string, currentQty: number) => {
    const result = updateQuantity(productId, currentQty + 1);
    if (!result.success) {
      setQuantityErrors(prev => ({ ...prev, [productId]: result.message }));
      setTimeout(() => {
        setQuantityErrors(prev => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }, 3000);
    }
  };

  const handleDecrement = (productId: string, currentQty: number) => {
    updateQuantity(productId, currentQty - 1);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-950 border-l border-gray-800 shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Cart</h2>
                  <p className="text-xs text-gray-500">
                    {items.length} item{items.length !== 1 ? 's' : ''} · {totals.itemCount} units
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Table */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Cart is empty</p>
                  <p className="text-sm mt-1">Add products from the inventory</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-3 text-center">Qty</div>
                    <div className="col-span-3 text-right">Amount</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Items */}
                  {items.map((item) => {
                    const lineTotal = item.product.unitPrice * item.quantity;
                    const gstRate = item.product.gstPercentage ?? 18;
                    const gstAmount = lineTotal * (gstRate / 100);
                    const error = quantityErrors[item.product.id];

                    return (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="group"
                      >
                        <div className="grid grid-cols-12 gap-2 items-center bg-gray-900/60 border border-gray-800/60 rounded-xl px-3 py-3 hover:border-gray-700 transition-colors">
                          {/* Product Info */}
                          <div className="col-span-5 min-w-0">
                            <p className="font-medium text-gray-100 text-sm truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatCurrency(item.product.unitPrice)} · GST {gstRate}%
                            </p>
                            <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                              Stock: {item.product.quantity} {item.product.unit}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-span-3 flex items-center justify-center">
                            <div className="flex items-center gap-0.5 bg-gray-800 rounded-lg border border-gray-700">
                              <button
                                onClick={() => handleDecrement(item.product.id, item.quantity)}
                                className="p-1.5 hover:bg-gray-700 rounded-l-lg text-gray-400 hover:text-white transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.product.id, e.target.value)}
                                className="w-12 text-center bg-transparent text-white text-sm font-medium outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min="1"
                                max={item.product.quantity}
                              />
                              <button
                                onClick={() => handleIncrement(item.product.id, item.quantity)}
                                className="p-1.5 hover:bg-gray-700 rounded-r-lg text-gray-400 hover:text-white transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="col-span-3 text-right">
                            <p className="text-sm font-semibold text-white">{formatCurrency(lineTotal)}</p>
                            <p className="text-[10px] text-amber-500/70">+{formatCurrency(gstAmount)} GST</p>
                          </div>

                          {/* Remove */}
                          <div className="col-span-1 flex justify-end">
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1 rounded-md hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Quantity Error */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-1.5 mt-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg"
                          >
                            <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                            <span className="text-xs text-red-400">{error}</span>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Totals */}
            {items.length > 0 && (
              <div className="border-t border-gray-800 p-5 space-y-4 bg-gray-950/80 backdrop-blur-md">
                {/* Totals breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>CGST</span>
                    <span>{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>SGST</span>
                    <span>{formatCurrency(totals.sgst)}</span>
                  </div>
                  <div className="h-px bg-gray-800 my-1"></div>
                  <div className="flex justify-between text-white font-bold text-base">
                    <span>Grand Total</span>
                    <span className="text-amber-500">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={openInvoice}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Invoice
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
