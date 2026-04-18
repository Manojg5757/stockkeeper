'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useInventoryStore } from '../lib/store';

export default function InventoryHealth() {
  const { products } = useInventoryStore();

  const totalValue = products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const lowStockCount = products.filter((p) => p.quantity <= p.reorderLevel).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  // Mocked turnover data (in real life, this would come from sales history)
  const hotItemsCount = products.filter((p) => p.quantity > 50).length; // Just a mock condition

  const valueData = [
    { name: 'Total Value', value: totalValue, fill: '#f59e0b' } // amber-500
  ];

  const stockData = [
    { name: 'In Stock', value: products.length - lowStockCount, fill: '#10b981' }, // emerald-500
    { name: 'Low Stock', value: lowStockCount - outOfStockCount, fill: '#f59e0b' }, // amber-500
    { name: 'Out of Stock', value: outOfStockCount, fill: '#ef4444' } // red-500
  ];

  const turnoverData = [
    { name: 'High Turnover', value: hotItemsCount, fill: '#8b5cf6' }, // violet-500
    { name: 'Low Turnover', value: products.length - hotItemsCount, fill: '#6b7280' } // gray-500
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const ChartCard = ({ title, value, data, innerRadius, subtitle }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="h-24 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius={innerRadius} outerRadius="100%" barSize={10} data={data}>
            <RadialBar background dataKey="value" cornerRadius={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <ChartCard 
        title="Value Distribution" 
        value={formatCurrency(totalValue)} 
        data={valueData} 
        innerRadius="80%" 
        subtitle="Total inventory capital"
      />
      <ChartCard 
        title="Stock Alerts" 
        value={lowStockCount.toString()} 
        data={stockData} 
        innerRadius="60%"
        subtitle="Items requiring reorder"
      />
      <ChartCard 
        title="Turnover Rate" 
        value={`${Math.round((hotItemsCount / (products.length || 1)) * 100)}%`} 
        data={turnoverData} 
        innerRadius="70%"
        subtitle="Active moving items"
      />
    </div>
  );
}
