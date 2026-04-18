'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Edit2, Trash2, ShoppingCart } from 'lucide-react';

interface HUDQuickActionsProps {
  isVisible: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCart?: () => void;
}

export default function HUDQuickActions({ isVisible, onIncrement, onDecrement, onEdit, onDelete, onAddToCart }: HUDQuickActionsProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute inset-x-0 bottom-4 flex justify-center z-20 pointer-events-none"
        >
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-full p-1 flex items-center gap-1 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); onDecrement(); }}
              className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Decrement Stock"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-700"></div>
            <button
              onClick={(e) => { e.stopPropagation(); onIncrement(); }}
              className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Increment Stock"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-700"></div>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-full hover:bg-gray-800 text-blue-400 hover:text-blue-300 transition-colors"
              title="Edit Product"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-700"></div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-full hover:bg-gray-800 text-red-400 hover:text-red-300 transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {onAddToCart && (
              <>
                <div className="w-px h-4 bg-gray-700"></div>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
                  className="p-2 rounded-full hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
