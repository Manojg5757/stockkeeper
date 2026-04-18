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
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  gstPercentage: number;
  lineTotal: number;
  gstAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  totalGST: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  amountPaid: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
