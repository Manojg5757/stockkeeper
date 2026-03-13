import React from 'react';

interface StatsHeaderProps {
  totalCategories: number;
  totalProducts: number;
  onCreateInvoice: () => void;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({
  totalCategories,
  totalProducts,
  onCreateInvoice,
}) => {
  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-500">R.K PUMPS</h1>
        <div className="flex items-center space-x-6">
          <div className="flex space-x-6 text-sm">
            <div>
              <span className="font-mono text-gray-400">Categories:</span>{' '}
              <span className="font-mono text-white">{totalCategories}</span>
            </div>
            <div>
              <span className="font-mono text-gray-400">Products:</span>{' '}
              <span className="font-mono text-white">{totalProducts}</span>
            </div>
          </div>
          <button
            onClick={onCreateInvoice}
            className="bg-amber-500 text-black px-4 py-2 rounded hover:bg-amber-600"
          >
            Create Invoice
          </button>
        </div>
      </div>
    </header>
  );
};

export default StatsHeader;
