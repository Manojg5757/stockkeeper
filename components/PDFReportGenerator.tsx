'use client';

import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Category } from '../lib/types';
import { Download } from 'lucide-react';

interface PDFReportGeneratorProps {
  products: Product[];
  categories: Category[];
}

export default function PDFReportGenerator({ products, categories }: PDFReportGeneratorProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('Inventory Snapshot', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Summary
    const totalValue = products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
    doc.text(`Total Items: ${products.length}`, 14, 40);
    doc.text(`Total Capital: ₹${totalValue.toLocaleString('en-IN')}`, 14, 46);

    // Table
    const tableData = products.map(p => {
      const category = categories.find(c => c.id === p.categoryId);
      return [
        p.sku,
        p.name,
        category ? category.name : 'Uncategorized',
        p.quantity.toString(),
        `₹${p.unitPrice.toLocaleString('en-IN')}`,
        `₹${(p.quantity * p.unitPrice).toLocaleString('en-IN')}`
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [['SKU', 'Name', 'Category', 'Stock', 'Unit Price', 'Total Value']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] }, // amber-500
      styles: { fontSize: 9 },
    });

    doc.save(`Inventory_Snapshot_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      <span>Snapshot Report</span>
    </button>
  );
}
