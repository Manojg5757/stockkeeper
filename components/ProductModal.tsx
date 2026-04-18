import React, { useState, useEffect } from 'react';
import { Product, Category } from '../lib/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  product: Product | null;
  categories: Category[];
  onError?: (message: string) => void;
}

const units = ['pcs', 'kg', 'box', 'pack', 'bag', 'm'];

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  onError,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [autoSku, setAutoSku] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [unitPrice, setUnitPrice] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('');
  const [material, setMaterial] = useState('');
  const [grade, setGrade] = useState('');
  const [gstPercentage, setGstPercentage] = useState('18');
  const [imageUrl, setImageUrl] = useState('');

  const generateSkuFromName = (value: string) => {
    const clean = value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((word) => word.slice(0, 3))
      .join('');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${clean || 'PRD'}-${random}`;
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setCategoryId(product.categoryId || '');
      setDescription(product.description);
      setQuantity(String(product.quantity));
      setUnit(product.unit);
      setUnitPrice(String(product.unitPrice));
      setReorderLevel(String(product.reorderLevel));
      setSupplier(product.supplier);
      setLocation(product.location);
      setMaterial(product.material);
      setGrade(product.grade);
      setGstPercentage(String(product.gstPercentage));
      setImageUrl(product.imageUrl || '');
    } else {
      setName('');
      setSku('');
      setCategoryId('');
      setDescription('');
      setQuantity('');
      setUnit('pcs');
      setUnitPrice('');
      setReorderLevel('');
      setSupplier('');
      setLocation('');
      setMaterial('');
      setGrade('');
      setGstPercentage('18');
      setImageUrl('');
    }
  }, [product, isOpen]);

  // Auto-generate SKU when name changes (only for new products)
  useEffect(() => {
    if (!product && name.trim() && autoSku) {
      setSku(generateSkuFromName(name));
    }
  }, [name, product, autoSku]);

  const handleSave = () => {
    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);
    const parsedReorder = Number(reorderLevel);
    const parsedGst = Number(gstPercentage);

    if (!name.trim()) {
      onError?.('Product name is required.');
      return;
    }

    if (!sku.trim()) {
      onError?.('SKU is required.');
      return;
    }

    if (!categoryId) {
      onError?.('Please select a category.');
      return;
    }

    if (!quantity || isNaN(parsedQuantity) || parsedQuantity < 0) {
      onError?.('Please enter a valid stock quantity.');
      return;
    }

    if (!unitPrice || isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
      onError?.('Please enter a valid unit price.');
      return;
    }

    if (!reorderLevel || isNaN(parsedReorder) || parsedReorder < 0) {
      onError?.('Please enter a valid reorder level.');
      return;
    }

    onSave({
      name,
      sku,
      categoryId: categoryId || null,
      description,
      quantity: parsedQuantity,
      unit,
      unitPrice: parsedUnitPrice,
      reorderLevel: parsedReorder,
      supplier,
      location,
      material,
      grade,
      gstPercentage: isNaN(parsedGst) ? 0 : parsedGst,
      imageUrl: imageUrl.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-4 md:p-6 rounded-lg w-full max-w-md md:max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-amber-500 mb-4">
          {product ? 'Edit Product' : 'Add Product'}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">SKU</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    setAutoSku(false);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded font-mono border border-gray-600 focus:border-amber-500 focus:outline-none"
                  required
                />
                {!product && (
                  <label className="flex items-center space-x-1 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={autoSku}
                      onChange={(e) => setAutoSku(e.target.checked)}
                      className="rounded"
                    />
                    <span>Auto</span>
                  </label>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Stock</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">
                Unit Price (INR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
                placeholder="e.g. 19.99"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Reorder Level</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
                placeholder="e.g. 20"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Supplier</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">GST %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
                placeholder="e.g. 18"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-amber-500 text-black py-3 px-4 rounded-lg hover:bg-amber-600 font-medium transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-500 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
