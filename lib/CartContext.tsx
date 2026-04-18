'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Product } from './types';

// ─── Cart Item Shape ───────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  totalGST: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  itemCount: number;
}

// ─── Context Shape ─────────────────────────────────────────────
interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  isInvoiceOpen: boolean;

  // Cart Operations
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;

  // UI toggles
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openInvoice: () => void;
  closeInvoice: () => void;

  // Computed
  totals: CartTotals;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // ─ Add to Cart (validates against available stock) ─
  const addToCart = useCallback((product: Product, quantity: number = 1): { success: boolean; message: string } => {
    if (product.quantity <= 0) {
      return { success: false, message: `${product.name} is out of stock.` };
    }

    let result = { success: true, message: '' };

    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.quantity) {
          result = {
            success: false,
            message: `Cannot add more. Only ${product.quantity} ${product.unit} available for ${product.name}.`,
          };
          return prev;
        }
        result = { success: true, message: `${product.name} quantity updated to ${newQty}.` };
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }

      if (quantity > product.quantity) {
        result = {
          success: false,
          message: `Cannot add ${quantity}. Only ${product.quantity} ${product.unit} available for ${product.name}.`,
        };
        return prev;
      }

      result = { success: true, message: `${product.name} added to cart.` };
      return [...prev, { product, quantity }];
    });

    return result;
  }, []);

  // ─ Remove from Cart ─
  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  // ─ Update Quantity (validates against stock) ─
  const updateQuantity = useCallback((productId: string, quantity: number): { success: boolean; message: string } => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.product.id !== productId));
      return { success: true, message: 'Item removed from cart.' };
    }

    let result = { success: true, message: '' };

    setItems(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (!item) {
        result = { success: false, message: 'Item not found in cart.' };
        return prev;
      }

      if (quantity > item.product.quantity) {
        result = {
          success: false,
          message: `Only ${item.product.quantity} ${item.product.unit} available for ${item.product.name}.`,
        };
        return prev;
      }

      result = { success: true, message: `Quantity updated to ${quantity}.` };
      return prev.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      );
    });

    return result;
  }, []);

  // ─ Clear Cart ─
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // ─ UI Toggles ─
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  const openInvoice = useCallback(() => {
    setIsCartOpen(false);
    setIsInvoiceOpen(true);
  }, []);
  const closeInvoice = useCallback(() => setIsInvoiceOpen(false), []);

  // ─ Get item quantity in cart ─
  const getItemQuantity = useCallback((productId: string) => {
    const item = items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  }, [items]);

  // ─ Compute Totals ─
  const totals = useMemo<CartTotals>(() => {
    let subtotal = 0;
    let totalGST = 0;
    let itemCount = 0;

    items.forEach(item => {
      const lineAmount = item.product.unitPrice * item.quantity;
      const gstRate = item.product.gstPercentage ?? 18;
      const gstAmount = lineAmount * (gstRate / 100);

      subtotal += lineAmount;
      totalGST += gstAmount;
      itemCount += item.quantity;
    });

    return {
      subtotal,
      totalGST,
      cgst: totalGST / 2,
      sgst: totalGST / 2,
      grandTotal: subtotal + totalGST,
      itemCount,
    };
  }, [items]);

  const value: CartContextType = {
    items,
    isCartOpen,
    isInvoiceOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    openInvoice,
    closeInvoice,
    totals,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
