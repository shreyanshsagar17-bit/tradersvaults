import React from 'react';
import { X } from 'lucide-react';

interface TradeFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

const TradeFilters: React.FC<TradeFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-primary-400 hover:text-white transition-colors flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Symbol
          </label>
          <input
            type="text"
            value={filters.symbol || ''}
            onChange={(e) => handleFilterChange('symbol', e.target.value)}
            placeholder="e.g., EURUSD"
            className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Side
          </label>
          <select
            value={filters.side || 'all'}
            onChange={(e) => handleFilterChange('side', e.target.value)}
            className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={filters.tags || ''}
            onChange={(e) => handleFilterChange('tags', e.target.value)}
            placeholder="e.g., scalp, news"
            className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Min P&L
          </label>
          <input
            type="number"
            value={filters.minPnL || ''}
            onChange={(e) => handleFilterChange('minPnL', e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Max P&L
          </label>
          <input
            type="number"
            value={filters.maxPnL || ''}
            onChange={(e) => handleFilterChange('maxPnL', e.target.value)}
            placeholder="1000"
            className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default TradeFilters;