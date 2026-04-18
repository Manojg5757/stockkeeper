'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, HardDrive, Zap, Lock, Unlock, Server } from 'lucide-react';
import { useInventoryStore } from '../../../lib/store';

export default function FoundersPortal() {
  const { products, categories } = useInventoryStore();
  const [unlockedFeatures, setUnlockedFeatures] = useState<Record<string, boolean>>({
    aiScanning: false,
    autoOrdering: false,
    advancedAnalytics: false
  });

  const toggleFeature = (key: string) => {
    setUnlockedFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Simulated metrics based on current data
  const documentCount = products.length + categories.length;
  // Let's assume each doc is ~1KB and 1 image is ~500KB
  const estimatedFirestoreBytes = documentCount * 1024; 
  const imagesCount = products.filter(p => p.imageUrl).length;
  const estimatedStorageBytes = imagesCount * 500 * 1024;

  const FREE_FIRESTORE_LIMIT = 1024 * 1024 * 1024; // 1GB
  const FREE_STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5GB

  const firestorePercentage = (estimatedFirestoreBytes / FREE_FIRESTORE_LIMIT) * 100;
  const storagePercentage = (estimatedStorageBytes / FREE_STORAGE_LIMIT) * 100;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const ResourceBar = ({ title, icon: Icon, percentage, used, total, colorClass }: any) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gray-800 text-${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-xs text-gray-500">Spark (Free) Tier</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white">{percentage.toFixed(4)}%</div>
          <div className="text-xs text-gray-500">Usage</div>
        </div>
      </div>
      
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-2 shadow-inner">
        <motion.div 
          className={`h-full bg-${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(percentage, 1)}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 font-mono">
        <span>{formatBytes(used)} used</span>
        <span>{formatBytes(total)} limit</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen pb-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">Founder's Portal</h1>
        <p className="text-gray-400">Business Growth & Resource Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ResourceBar 
          title="Firestore Database" 
          icon={Database} 
          percentage={firestorePercentage} 
          used={estimatedFirestoreBytes} 
          total={FREE_FIRESTORE_LIMIT}
          colorClass="amber-500"
        />
        <ResourceBar 
          title="Cloud Storage" 
          icon={HardDrive} 
          percentage={storagePercentage} 
          used={estimatedStorageBytes} 
          total={FREE_STORAGE_LIMIT}
          colorClass="blue-500"
        />
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Zap className="w-6 h-6 text-amber-500" />
        Feature Lab
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'aiScanning', title: 'AI Barcode Scanning', desc: 'Scan any item with camera to automatically map to inventory.' },
          { id: 'autoOrdering', title: 'Automated Ordering', desc: 'Auto-send emails to suppliers when stock hits reorder level.' },
          { id: 'advancedAnalytics', title: 'Predictive Analytics', desc: 'Forecast stock depletion based on seasonal trends.' }
        ].map(feature => {
          const isUnlocked = unlockedFeatures[feature.id];
          return (
            <div 
              key={feature.id}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                isUnlocked ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-gray-900 border-gray-800'
              }`}
            >
              {isUnlocked && <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 blur-2xl rounded-full" />}
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
                  {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <button
                  onClick={() => toggleFeature(feature.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isUnlocked ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {isUnlocked ? 'Activated' : 'Unlock Beta'}
                </button>
              </div>
              
              <h3 className={`font-bold mb-2 relative z-10 ${isUnlocked ? 'text-indigo-300' : 'text-gray-300'}`}>{feature.title}</h3>
              <p className="text-sm text-gray-500 relative z-10">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
