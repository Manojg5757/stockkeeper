'use client';

import React, { useState } from 'react';
import { Product, Category } from '../lib/types';
import HUDQuickActions from './HUDQuickActions';
import ImageGalleryModal from './ImageGalleryModal';
import { Package, Image as ImageIcon } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductGrid({ products, categories, onIncrement, onDecrement, onEdit, onDelete, onAddToCart }: ProductGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {products.map((product) => {
        const category = categories.find(c => c.id === product.categoryId);
        const isHovered = hoveredId === product.id;
        
        return (
          <div
            key={product.id}
            className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-amber-500/10 hover:border-amber-500/30 group"
            onMouseEnter={() => setHoveredId(product.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Image Section */}
            <div 
              className="h-48 bg-gray-800/50 flex items-center justify-center relative cursor-pointer overflow-hidden"
              onClick={() => product.imageUrl && setSelectedImage(product.imageUrl)}
            >
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="text-gray-600 flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs font-medium">No Image</span>
                </div>
              )}
              
              {/* Category Badge */}
              <div 
                className="absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-md"
                style={{ backgroundColor: category ? `${category.colorHex}dd` : '#4b5563dd' }}
              >
                {category ? category.name : 'Uncategorized'}
              </div>

              {/* Stock Badge */}
              <div className="absolute top-3 left-3 flex gap-1">
                {product.quantity <= product.reorderLevel && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="p-4">
              <div className="text-xs text-gray-500 font-mono mb-1">{product.sku}</div>
              <h3 className="text-lg font-semibold text-gray-100 truncate mb-2">{product.name}</h3>
              
              <div className="flex justify-between items-end mt-4">
                <div>
                  <div className="text-xs text-gray-500">Stock</div>
                  <div className="text-xl font-bold text-amber-500">
                    {product.quantity} <span className="text-sm font-normal text-gray-400">{product.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="font-medium text-gray-300">{formatCurrency(product.unitPrice)}</div>
                </div>
              </div>
            </div>

            <HUDQuickActions
              isVisible={isHovered}
              onIncrement={() => onIncrement(product)}
              onDecrement={() => onDecrement(product)}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product)}
              onAddToCart={onAddToCart ? () => onAddToCart(product) : undefined}
            />
          </div>
        );
      })}

      <ImageGalleryModal 
        isOpen={!!selectedImage} 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}
