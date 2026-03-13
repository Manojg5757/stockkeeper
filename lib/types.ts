export interface Category {
  id: string;
  name: string;
  description: string;
  colorHex: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  reorderLevel: number;
  supplier: string;
  location: string;
  material: string;
  grade: string;
  gstPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}
