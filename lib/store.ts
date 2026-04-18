import { create } from 'zustand';
import { Product, Category } from './types';

interface InventoryState {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  categoryFilter: string;
  stockFilter: 'all' | 'low' | 'out';
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (categoryId: string) => void;
  setStockFilter: (filter: 'all' | 'low' | 'out') => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: [],
  categories: [],
  searchQuery: '',
  categoryFilter: '',
  stockFilter: 'all',
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setStockFilter: (stockFilter) => set({ stockFilter }),
}));
