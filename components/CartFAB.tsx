'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../lib/CartContext';

export default function CartFAB() {
  const { toggleCart, totals } = useCart();
  const count = totals.itemCount;

  return (
    <motion.button
      onClick={toggleCart}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-gray-950 rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
    >
      <ShoppingCart className="w-6 h-6" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
