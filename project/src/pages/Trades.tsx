import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Upload } from 'lucide-react';
import { tradeService } from '../services/api';
import TradeModal from '../components/trades/TradeModal';
import TradeFilters from '../components/trades/TradeFilters';
import TradeList from '../components/trades/TradeList';
import toast from 'react-hot-toast';

const Trades: React.FC = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const tradesData = await tradeService.getTrades();
      setTrades(tradesData);
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrade = async (tradeData: any) => {
    try {
      const newTrade = await tradeService.addTrade(tradeData);
      setTrades([newTrade, ...trades]);
      setShowTradeModal(false);
      toast.success('Trade added successfully!');
      
      // Show additional success message for options trades
      if (tradeData.type === 'option' || tradeData.type === 'multi-leg') {
        setTimeout(() => {
          toast.success(`${tradeData.type === 'multi-leg' ? 'Multi-leg' : 'Options'} trade processed with auto P&L calculation!`);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to add trade:', error);
      toast.error('Failed to add trade. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Journal</h1>
          <p className="text-primary-300">Track and analyze your trading performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              showFilters 
                ? 'bg-gold-500 text-primary-900' 
                : 'bg-primary-700 hover:bg-primary-600 text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowTradeModal(true)}
            className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <TradeFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      <TradeList trades={trades} />

      {showTradeModal && (
        <TradeModal
          onClose={() => setShowTradeModal(false)}
          onSave={handleAddTrade}
        />
      )}
    </div>
  );
};

export default Trades;