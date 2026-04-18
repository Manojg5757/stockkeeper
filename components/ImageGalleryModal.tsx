'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageGalleryModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  altText?: string;
}

export default function ImageGalleryModal({ isOpen, imageUrl, onClose, altText = 'Product Image' }: ImageGalleryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
          
          <motion.img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
