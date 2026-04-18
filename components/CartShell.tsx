'use client';

import React from 'react';
import { CartProvider } from '../lib/CartContext';
import CartDrawer from './CartDrawer';
import CartFAB from './CartFAB';
import InvoiceGenerator from './InvoiceGenerator';

export default function CartShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartFAB />
      <CartDrawer />
      <InvoiceGenerator />
    </CartProvider>
  );
}
