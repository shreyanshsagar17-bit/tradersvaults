import React, { useState } from 'react';
import { Eye, Edit3, Trash2, ExternalLink, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface TradeListProps {
  trades: any[];
}

const TradeList: React.FC<TradeListProps> = ({ trades }) => {
  const [sortBy, setSortBy] = useState('entryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'entryDate' || sortBy === 'exitDate') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="bg-primary-800 rounded-lg border border-primary-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary-700 bg-primary-700/50">
              <th className="text-left text-primary-300 text-sm font-medium p-4">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Symbol</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left text-primary-300 text-sm font-medium p-4">Side</th>
              <th className="text-left text-primary-300 text-sm font-medium p-4">
                <button
                  onClick={() => handleSort('entryPrice')}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Entry</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left text-primary-300 text-sm font-medium p-4">Exit</th>
              <th className="text-left text-primary-300 text-sm font-medium p-4">
                <button
                  onClick={() => handleSort('quantity')}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Size</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left text-primary-300 text-sm font-medium p-4">
                <button
                  onClick={() => handleSort('pnl')}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>P&L</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left text-primary-300 text-sm font-medium p-4">
                <button
                  onClick={() => handleSort('entryDate')}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left text-primary-300 text-sm font-medium p-4">Status</th>
              <th className="text-left text-primary-300 text-sm font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade, index) => (
              <tr key={trade.id} className="border-b border-primary-700 hover:bg-primary-700/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">{trade.symbol}</span>
                    {trade.type === 'option' && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                        {trade.optionType?.toUpperCase()} {trade.strikePrice}
                      </span>
                    )}
                    {trade.type === 'multi-leg' && (
                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                        {trade.legs?.length || 0} LEGS
                      </span>
                    )}
                    {trade.tags.length > 0 && (
                      <div className="flex space-x-1">
                        {trade.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="px-1.5 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trade.side === 'long' ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'
                  }`}>
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-primary-200 font-mono">{trade.entryPrice.toFixed(5)}</td>
                <td className="p-4 text-primary-200 font-mono">
                  {trade.exitPrice ? trade.exitPrice.toFixed(5) : '-'}
                </td>
                <td className="p-4 text-primary-200">
                  {trade.type === 'option' ? 
                    `${trade.lotSize || 1} lots (${(trade.lotSize || 1) * (trade.exchangeLotSize || 50)})` :
                    trade.quantity.toLocaleString()
                  }
                </td>
                <td className="p-4">
                  {trade.pnl !== undefined ? (
                    <div className="flex flex-col">
                      <span className={`font-medium ${
                        trade.pnl >= 0 ? 'text-success-400' : 'text-danger-400'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toFixed(2)}
                      </span>
                      {trade.netPnl !== undefined && (
                        <span className={`text-xs ${
                          trade.netPnl >= 0 ? 'text-success-500' : 'text-danger-500'
                        }`}>
                          Net: ₹{trade.netPnl.toFixed(2)}
                        </span>
                      )}
                      <span className={`text-xs ${
                        trade.pnl >= 0 ? 'text-success-500' : 'text-danger-500'
                      }`}>
                        {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent?.toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-primary-400">-</span>
                  )}
                </td>
                <td className="p-4 text-primary-200 text-sm">
                  <div className="flex flex-col">
                    <span>{format(new Date(trade.entryDate), 'MMM dd')}</span>
                    <span className="text-primary-400 text-xs">
                      {format(new Date(trade.entryDate), 'HH:mm')}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trade.status === 'closed' 
                      ? 'bg-primary-600 text-primary-200' 
                      : 'bg-gold-500/20 text-gold-400'
                  }`}>
                    {trade.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-primary-400 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-primary-400 hover:text-white transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-primary-400 hover:text-danger-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {trade.isPublic && (
                      <button className="p-1 text-primary-400 hover:text-gold-400 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {trades.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-primary-400">No trades found. Add your first trade to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TradeList;