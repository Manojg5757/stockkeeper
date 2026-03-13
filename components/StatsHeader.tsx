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
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-b border-amber-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                R.K PUMPS
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end space-x-4">
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-4 bg-gray-800/50 rounded-xl px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-300">Categories:</span>
                  <span className="text-sm font-bold text-amber-400">{totalCategories}</span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-300">Products:</span>
                  <span className="text-sm font-bold text-green-400">{totalProducts}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onCreateInvoice}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Create Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StatsHeader;
