import React, { useState, useEffect } from 'react';
import { Product, Category } from '../lib/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  product: Product | null;
  categories: Category[];
}

const units = ['pcs', 'kg', 'box', 'pack', 'bag', 'm'];

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState('pcs');
  const [unitPrice, setUnitPrice] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('');
  const [material, setMaterial] = useState('');
  const [grade, setGrade] = useState('');
  const [gstPercentage, setGstPercentage] = useState(18);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setCategoryId(product.categoryId || '');
      setDescription(product.description);
      setQuantity(product.quantity);
      setUnit(product.unit);
      setUnitPrice(product.unitPrice);
      setReorderLevel(product.reorderLevel);
      setSupplier(product.supplier);
      setLocation(product.location);
      setMaterial(product.material);
      setGrade(product.grade);
      setGstPercentage(product.gstPercentage);
    } else {
      setName('');
      setSku('');
      setCategoryId('');
      setDescription('');
      setQuantity(0);
      setUnit('pcs');
      setUnitPrice(0);
      setReorderLevel(0);
      setSupplier('');
      setLocation('');
      setMaterial('');
      setGrade('');
      setGstPercentage(18);
    }
  }, [product, isOpen]);

  const handleSave = () => {
    onSave({
      name,
      sku,
      categoryId: categoryId || null,
      description,
      quantity,
      unit,
      unitPrice,
      reorderLevel,
      supplier,
      location,
      material,
      grade,
      gstPercentage,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded w-96 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-amber-500 mb-4">
          {product ? 'Edit Product' : 'Add Product'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            >
              <option value="">No Category</option>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">
                Unit Price (INR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Reorder Level</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
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
                onChange={(e) => setGstPercentage(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
