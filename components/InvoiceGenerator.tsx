'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Loader2, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { doc, runTransaction, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../lib/CartContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type InvoiceStatus = 'idle' | 'processing' | 'success' | 'error';

const BUSINESS = {
  name: 'R.K PUMPS',
  address: 'Tamil Nadu, India',
  gstin: '33AABCU9603R1ZM',
  phone: '+91 98765 43210',
};

export default function InvoiceGenerator() {
  const { items, isInvoiceOpen, closeInvoice, clearCart, totals } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v);

  const generateInvoiceNumber = () => {
    const d = new Date();
    const prefix = 'RKP';
    const ts = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `${prefix}-${ts}-${rand}`;
  };

  const handleGenerateInvoice = async () => {
    if (!customerName.trim()) { setErrorMsg('Customer name is required.'); return; }
    if (items.length === 0) { setErrorMsg('Cart is empty.'); return; }

    setStatus('processing');
    setErrorMsg('');
    const invNum = generateInvoiceNumber();

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Read all product docs inside the transaction
        const productRefs = items.map(item => doc(db, 'products', item.product.id));
        const snapshots = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        // 2. Validate stock for every item
        for (let i = 0; i < items.length; i++) {
          const snap = snapshots[i];
          if (!snap.exists()) throw new Error(`Product "${items[i].product.name}" no longer exists.`);
          const currentStock = snap.data().quantity as number;
          if (currentStock < items[i].quantity) {
            throw new Error(`Insufficient stock for "${items[i].product.name}". Available: ${currentStock}, Requested: ${items[i].quantity}`);
          }
        }

        // 3. Decrement stock atomically
        for (let i = 0; i < items.length; i++) {
          const snap = snapshots[i];
          const currentStock = snap.data()!.quantity as number;
          transaction.update(productRefs[i], {
            quantity: currentStock - items[i].quantity,
            updatedAt: new Date(),
          });
        }
      });

      // 4. Save invoice record to Firestore
      const invoiceItems = items.map(item => {
        const gst = item.product.gstPercentage ?? 18;
        const lineTotal = item.product.unitPrice * item.quantity;
        return {
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: item.product.unitPrice,
          gstPercentage: gst,
          lineTotal,
          gstAmount: lineTotal * (gst / 100),
        };
      });

      await addDoc(collection(db, 'invoices'), {
        invoiceNumber: invNum,
        customerName,
        customerAddress,
        customerPhone,
        items: invoiceItems,
        subtotal: totals.subtotal,
        totalGST: totals.totalGST,
        grandTotal: totals.grandTotal,
        paymentStatus: 'pending',
        amountPaid: 0,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setInvoiceNumber(invNum);
      setStatus('success');
      generatePDF(invNum);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Transaction failed. Stock was not deducted.');
    }
  };

  const generatePDF = (invNum: string) => {
    const d = new jsPDF();
    const pageW = d.internal.pageSize.getWidth();

    // Header background
    d.setFillColor(15, 15, 20);
    d.rect(0, 0, pageW, 50, 'F');
    d.setFillColor(245, 158, 11);
    d.rect(0, 48, pageW, 2, 'F');

    // Business name
    d.setTextColor(245, 158, 11);
    d.setFontSize(24);
    d.setFont('helvetica', 'bold');
    d.text(BUSINESS.name, 14, 22);
    d.setFontSize(9);
    d.setTextColor(180, 180, 180);
    d.setFont('helvetica', 'normal');
    d.text(BUSINESS.address, 14, 30);
    d.text(`GSTIN: ${BUSINESS.gstin}`, 14, 36);
    d.text(`Phone: ${BUSINESS.phone}`, 14, 42);

    // Invoice label
    d.setTextColor(245, 158, 11);
    d.setFontSize(14);
    d.setFont('helvetica', 'bold');
    d.text('TAX INVOICE', pageW - 14, 22, { align: 'right' });
    d.setFontSize(9);
    d.setTextColor(180, 180, 180);
    d.setFont('helvetica', 'normal');
    d.text(`Invoice #: ${invNum}`, pageW - 14, 30, { align: 'right' });
    d.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageW - 14, 36, { align: 'right' });

    // Customer info
    d.setFontSize(10);
    d.setTextColor(60, 60, 60);
    d.setFont('helvetica', 'bold');
    d.text('Bill To:', 14, 60);
    d.setFont('helvetica', 'normal');
    d.setTextColor(40, 40, 40);
    d.text(customerName, 14, 67);
    if (customerAddress) d.text(customerAddress, 14, 73);
    if (customerPhone) d.text(`Phone: ${customerPhone}`, 14, customerAddress ? 79 : 73);

    // Items table
    const tableData = items.map(item => {
      const gst = item.product.gstPercentage ?? 18;
      const lineTotal = item.product.unitPrice * item.quantity;
      const gstAmt = lineTotal * (gst / 100);
      return [
        item.product.name,
        item.product.sku,
        item.quantity.toString(),
        fmt(item.product.unitPrice),
        `${gst}%`,
        fmt(gstAmt),
        fmt(lineTotal + gstAmt),
      ];
    });

    autoTable(d, {
      startY: 88,
      head: [['Product', 'SKU', 'Qty', 'Rate', 'GST%', 'GST Amt', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { cellWidth: 45 },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'center' },
        5: { halign: 'right' },
        6: { halign: 'right' },
      },
    });

    const finalY = (d as any).lastAutoTable.finalY + 10;

    // Totals
    const totalsX = pageW - 80;
    d.setFontSize(9);
    d.setTextColor(80, 80, 80);
    d.text('Subtotal:', totalsX, finalY);
    d.text(fmt(totals.subtotal), pageW - 14, finalY, { align: 'right' });
    d.text('CGST:', totalsX, finalY + 7);
    d.text(fmt(totals.cgst), pageW - 14, finalY + 7, { align: 'right' });
    d.text('SGST:', totalsX, finalY + 14);
    d.text(fmt(totals.sgst), pageW - 14, finalY + 14, { align: 'right' });

    d.setFillColor(245, 158, 11);
    d.rect(totalsX - 4, finalY + 18, pageW - totalsX + 8, 10, 'F');
    d.setTextColor(0, 0, 0);
    d.setFontSize(11);
    d.setFont('helvetica', 'bold');
    d.text('Grand Total:', totalsX, finalY + 25);
    d.text(fmt(totals.grandTotal), pageW - 14, finalY + 25, { align: 'right' });

    // Notes
    if (notes) {
      d.setFontSize(8);
      d.setTextColor(120, 120, 120);
      d.setFont('helvetica', 'italic');
      d.text(`Notes: ${notes}`, 14, finalY + 40);
    }

    // Footer
    d.setFontSize(7);
    d.setTextColor(160, 160, 160);
    d.text('This is a computer-generated invoice.', pageW / 2, d.internal.pageSize.getHeight() - 10, { align: 'center' });

    d.save(`Invoice_${invNum}.pdf`);
  };

  const handleClose = () => {
    if (status === 'success') { clearCart(); }
    setStatus('idle');
    setErrorMsg('');
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setNotes('');
    closeInvoice();
  };

  if (!isInvoiceOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 sticky top-0 bg-gray-950/95 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl"><FileText className="w-5 h-5 text-amber-500" /></div>
              <h2 className="text-lg font-bold text-white">Generate Invoice</h2>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6 space-y-6">
            {/* Success State */}
            {status === 'success' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-8 space-y-4">
                <div className="p-4 bg-green-500/10 rounded-full"><CheckCircle className="w-12 h-12 text-green-500" /></div>
                <h3 className="text-xl font-bold text-white">Invoice Generated!</h3>
                <p className="text-gray-400">Invoice <span className="text-amber-500 font-mono font-bold">{invoiceNumber}</span> created. Stock has been updated and the PDF has been downloaded.</p>
                <button onClick={handleClose} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">Done</button>
              </motion.div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-400">Invoice Failed</p>
                  <p className="text-sm text-red-400/80 mt-1">{errorMsg}</p>
                  <p className="text-xs text-gray-500 mt-2">No stock was deducted. Please verify quantities and try again.</p>
                </div>
              </motion.div>
            )}

            {status !== 'success' && (
              <>
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Customer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Name *</label>
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name" className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Phone</label>
                      <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone number" className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Address</label>
                    <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Customer address" className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm" />
                  </div>
                </div>

                {/* Item Preview Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Items ({items.length})</h3>
                  <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                        <th className="text-left px-4 py-3">Product</th>
                        <th className="text-center px-2 py-3">Qty</th>
                        <th className="text-right px-2 py-3">Rate</th>
                        <th className="text-center px-2 py-3">GST</th>
                        <th className="text-right px-4 py-3">Total</th>
                      </tr></thead>
                      <tbody>
                        {items.map(item => {
                          const gst = item.product.gstPercentage ?? 18;
                          const line = item.product.unitPrice * item.quantity;
                          const gstAmt = line * (gst / 100);
                          return (
                            <tr key={item.product.id} className="border-b border-gray-800/50 last:border-0">
                              <td className="px-4 py-3"><p className="text-gray-200 font-medium">{item.product.name}</p><p className="text-[10px] text-gray-600 font-mono">{item.product.sku}</p></td>
                              <td className="text-center px-2 py-3 text-gray-300">{item.quantity}</td>
                              <td className="text-right px-2 py-3 text-gray-400">{fmt(item.product.unitPrice)}</td>
                              <td className="text-center px-2 py-3 text-gray-500">{gst}%</td>
                              <td className="text-right px-4 py-3 text-white font-medium">{fmt(line + gstAmt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>CGST</span><span>{fmt(totals.cgst)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>SGST</span><span>{fmt(totals.sgst)}</span></div>
                  <div className="h-px bg-gray-800 my-1"></div>
                  <div className="flex justify-between text-white font-bold text-lg"><span>Grand Total</span><span className="text-amber-500">{fmt(totals.grandTotal)}</span></div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Notes (optional)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any additional notes..." className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm resize-none" />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={handleClose} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all">Cancel</button>
                  <button onClick={handleGenerateInvoice} disabled={status === 'processing'} className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20">
                    {status === 'processing' ? (<><Loader2 className="w-4 h-4 animate-spin" />Processing...</>) : (<><Download className="w-4 h-4" />Generate Invoice & PDF</>)}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
