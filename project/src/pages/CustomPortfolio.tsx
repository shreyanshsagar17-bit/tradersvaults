import React, { useState } from 'react';
import { Briefcase, Plus, TrendingUp, TrendingDown, DollarSign, Percent, Edit3, Trash2, Settings } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import { portfolioService } from '../services/api';
import toast from 'react-hot-toast';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  baseCurrency: 'INR' | 'USD';
  timezone: string;
  totalValue: number;
  totalPnL: number;
  isDefault: boolean;
  createdAt: string;
}

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'forex' | 'commodity' | 'option';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

const CustomPortfolio: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    {
      id: '1',
      name: 'Main Trading Portfolio',
      description: 'Primary portfolio for day trading',
      baseCurrency: 'INR',
      timezone: 'Asia/Kolkata',
      totalValue: 50000,
      totalPnL: 12500,
      isDefault: true,
      createdAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      name: 'Long-term Investments',
      description: 'Portfolio for long-term holdings',
      baseCurrency: 'USD',
      timezone: 'America/New_York',
      totalValue: 25000,
      totalPnL: 3500,
      isDefault: false,
      createdAt: '2024-02-01T00:00:00Z',
    },
  ]);

  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio>(portfolios[0]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      quantity: 50,
      avgPrice: 150.25,
      currentPrice: 175.80,
      value: 8790,
      pnl: 1277.50,
      pnlPercent: 17.02,
      allocation: 35.2,
    },
    {
      id: '2',
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      quantity: 0.5,
      avgPrice: 42000,
      currentPrice: 45500,
      value: 22750,
      pnl: 1750,
      pnlPercent: 8.33,
      allocation: 45.5,
    },
    {
      id: '3',
      symbol: 'EURUSD',
      name: 'Euro/US Dollar',
      type: 'forex',
      quantity: 100000,
      avgPrice: 1.0850,
      currentPrice: 1.0920,
      value: 4830,
      pnl: 700,
      pnlPercent: 6.45,
      allocation: 19.3,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [newPortfolio, setNewPortfolio] = useState({
    name: '',
    description: '',
    baseCurrency: 'INR' as const,
    timezone: 'Asia/Kolkata',
  });
  const [newItem, setNewItem] = useState({
    symbol: '',
    name: '',
    type: 'stock' as const,
    quantity: '',
    avgPrice: '',
    currentPrice: '',
  });

  const totalValue = portfolioItems.reduce((sum, item) => sum + item.value, 0);
  const totalPnL = portfolioItems.reduce((sum, item) => sum + item.pnl, 0);
  const totalPnLPercent = (totalPnL / (totalValue - totalPnL)) * 100;

  const allocationData = {
    labels: portfolioItems.map(item => item.symbol),
    datasets: [
      {
        data: portfolioItems.map(item => item.allocation),
        backgroundColor: [
          '#f59e0b',
          '#3b82f6',
          '#22c55e',
          '#8b5cf6',
          '#ef4444',
        ],
        borderColor: [
          '#d97706',
          '#2563eb',
          '#16a34a',
          '#7c3aed',
          '#dc2626',
        ],
        borderWidth: 2,
      },
    ],
  };

  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [45000, 47500, 44200, 52000, 48900, totalValue],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const handleCreatePortfolio = async () => {
    try {
      const portfolio = await portfolioService.createPortfolio({
        ...newPortfolio,
        userId: '1', // In production, get from auth context
      });
      setPortfolios([...portfolios, portfolio]);
      setShowCreatePortfolioModal(false);
      setNewPortfolio({
        name: '',
        description: '',
        baseCurrency: 'INR',
        timezone: 'Asia/Kolkata',
      });
      toast.success('Portfolio created successfully!');
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      toast.error('Failed to create portfolio');
    }
  };

  const handleEditPortfolio = async () => {
    if (!editingPortfolio) return;
    
    try {
      const updatedPortfolio = await portfolioService.updatePortfolio(editingPortfolio.id, newPortfolio);
      setPortfolios(portfolios.map(p => p.id === editingPortfolio.id ? { ...p, ...updatedPortfolio } : p));
      setShowCreatePortfolioModal(false);
      setEditingPortfolio(null);
      setNewPortfolio({
        name: '',
        description: '',
        baseCurrency: 'INR',
        timezone: 'Asia/Kolkata',
      });
      toast.success('Portfolio updated successfully!');
    } catch (error) {
      console.error('Failed to update portfolio:', error);
      toast.error('Failed to update portfolio');
    }
  };

  const handleDeletePortfolio = async (portfolio: Portfolio) => {
    if (portfolio.isDefault) {
      toast.error('Cannot delete default portfolio');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${portfolio.name}"?`)) {
      try {
        await portfolioService.deletePortfolio(portfolio.id);
        const updatedPortfolios = portfolios.filter(p => p.id !== portfolio.id);
        setPortfolios(updatedPortfolios);
        
        if (selectedPortfolio.id === portfolio.id) {
          setSelectedPortfolio(updatedPortfolios[0]);
        }
        
        toast.success('Portfolio deleted successfully!');
      } catch (error) {
        console.error('Failed to delete portfolio:', error);
        toast.error('Failed to delete portfolio');
      }
    }
  };

  const handleAddItem = () => {
    const item: PortfolioItem = {
      id: Date.now().toString(),
      symbol: newItem.symbol,
      name: newItem.name,
      type: newItem.type,
      quantity: parseFloat(newItem.quantity),
      avgPrice: parseFloat(newItem.avgPrice),
      currentPrice: parseFloat(newItem.currentPrice),
      value: parseFloat(newItem.quantity) * parseFloat(newItem.currentPrice),
      pnl: (parseFloat(newItem.currentPrice) - parseFloat(newItem.avgPrice)) * parseFloat(newItem.quantity),
      pnlPercent: ((parseFloat(newItem.currentPrice) - parseFloat(newItem.avgPrice)) / parseFloat(newItem.avgPrice)) * 100,
      allocation: 0, // Will be calculated after adding
    };

    const newTotal = totalValue + item.value;
    const updatedItems = [...portfolioItems, item].map(i => ({
      ...i,
      allocation: (i.value / newTotal) * 100,
    }));

    setPortfolioItems(updatedItems);
    setShowAddModal(false);
    toast.success('Asset added successfully!');
    setNewItem({
      symbol: '',
      name: '',
      type: 'stock',
      quantity: '',
      avgPrice: '',
      currentPrice: '',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stock': return 'bg-blue-500/20 text-blue-400';
      case 'crypto': return 'bg-orange-500/20 text-orange-400';
      case 'forex': return 'bg-green-500/20 text-green-400';
      case 'commodity': return 'bg-yellow-500/20 text-yellow-400';
      case 'option': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-primary-500/20 text-primary-400';
    }
  };

  const openEditModal = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setNewPortfolio({
      name: portfolio.name,
      description: portfolio.description,
      baseCurrency: portfolio.baseCurrency,
      timezone: portfolio.timezone,
    });
    setShowCreatePortfolioModal(true);
  };

  const openCreateModal = () => {
    setEditingPortfolio(null);
    setNewPortfolio({
      name: '',
      description: '',
      baseCurrency: 'INR',
      timezone: 'Asia/Kolkata',
    });
    setShowCreatePortfolioModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent-500/20 rounded-lg">
            <Briefcase className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Custom Portfolio</h1>
            <p className="text-primary-300">Track your investments across all asset classes</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={openCreateModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Portfolio</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Portfolio Selector */}
      <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
        <h2 className="text-lg font-semibold text-white mb-4">Your Portfolios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPortfolio.id === portfolio.id
                  ? 'border-accent-500 bg-accent-500/10'
                  : 'border-primary-600 bg-primary-700 hover:border-primary-500'
              }`}
              onClick={() => setSelectedPortfolio(portfolio)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-medium">{portfolio.name}</h3>
                  <p className="text-primary-400 text-sm">{portfolio.description}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(portfolio);
                    }}
                    className="p-1 text-primary-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  {!portfolio.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePortfolio(portfolio);
                      }}
                      className="p-1 text-primary-400 hover:text-danger-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-primary-400">Value</p>
                  <p className="text-white font-medium">{portfolio.baseCurrency} {portfolio.totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-primary-400">P&L</p>
                  <p className={`font-medium ${portfolio.totalPnL >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {portfolio.totalPnL >= 0 ? '+' : ''}{portfolio.baseCurrency} {portfolio.totalPnL.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {portfolio.isDefault && (
                <div className="mt-2">
                  <span className="px-2 py-1 bg-accent-500/20 text-accent-400 text-xs rounded">
                    Default
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-accent-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Total Value</p>
            <p className="text-white text-2xl font-bold">{selectedPortfolio.baseCurrency} {totalValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{selectedPortfolio.baseCurrency} {totalPnL.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent-500/20 rounded-lg">
              <Percent className="w-5 h-5 text-accent-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Total Return</p>
            <p className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Assets</p>
            <p className="text-white text-2xl font-bold">{portfolioItems.length}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
          <div className="h-64">
            <Doughnut 
              data={allocationData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: '#94a3b8',
                      padding: 15,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Performance</h3>
          <div className="h-64">
            <Line 
              data={performanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' },
                  },
                  y: {
                    grid: { color: '#334155' },
                    ticks: {
                      color: '#94a3b8',
                      callback: function(value) {
                        return selectedPortfolio.baseCurrency + ' ' + value.toLocaleString();
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Portfolio Holdings */}
      <div className="bg-primary-800 rounded-lg border border-primary-700">
        <div className="p-6 border-b border-primary-700">
          <h2 className="text-lg font-semibold text-white">Holdings - {selectedPortfolio.name}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-700">
                <th className="text-left text-primary-300 text-sm font-medium p-4">Asset</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Type</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Quantity</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Avg Price</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Current Price</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Value</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">P&L</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {portfolioItems.map((item) => (
                <tr key={item.id} className="border-b border-primary-700 hover:bg-primary-700/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-white">{item.symbol}</p>
                      <p className="text-primary-400 text-sm">{item.name}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}>
                      {item.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-primary-200">{item.quantity.toLocaleString()}</td>
                  <td className="p-4 text-primary-200 font-mono">{selectedPortfolio.baseCurrency} {item.avgPrice.toFixed(2)}</td>
                  <td className="p-4 text-primary-200 font-mono">{selectedPortfolio.baseCurrency} {item.currentPrice.toFixed(2)}</td>
                  <td className="p-4 text-white font-medium">{selectedPortfolio.baseCurrency} {item.value.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className={`font-medium ${item.pnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                        {item.pnl >= 0 ? '+' : ''}{selectedPortfolio.baseCurrency} {item.pnl.toFixed(2)}
                      </span>
                      <span className={`text-xs ${item.pnl >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                        {item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-primary-200">{item.allocation.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Portfolio Modal */}
      {showCreatePortfolioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-800 rounded-lg border border-primary-700 w-full max-w-md mx-4">
            <div className="p-6 border-b border-primary-700">
              <h3 className="text-lg font-semibold text-white">
                {editingPortfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Portfolio Name *
                </label>
                <input
                  type="text"
                  value={newPortfolio.name}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                  placeholder="My Trading Portfolio"
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                  placeholder="Portfolio description..."
                  rows={3}
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Base Currency *
                  </label>
                  <select
                    value={newPortfolio.baseCurrency}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, baseCurrency: e.target.value as 'INR' | 'USD' })}
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Timezone *
                  </label>
                  <select
                    value={newPortfolio.timezone}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                    <option value="Australia/Sydney">Australia/Sydney</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-primary-700 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreatePortfolioModal(false);
                  setEditingPortfolio(null);
                }}
                className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingPortfolio ? handleEditPortfolio : handleCreatePortfolio}
                className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {editingPortfolio ? 'Update' : 'Create'} Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-800 rounded-lg border border-primary-700 w-full max-w-md mx-4">
            <div className="p-6 border-b border-primary-700">
              <h3 className="text-lg font-semibold text-white">Add New Asset</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    value={newItem.symbol}
                    onChange={(e) => setNewItem({ ...newItem, symbol: e.target.value })}
                    placeholder="AAPL, BTC, etc."
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    <option value="stock">Stock</option>
                    <option value="crypto">Crypto</option>
                    <option value="forex">Forex</option>
                    <option value="commodity">Commodity</option>
                    <option value="option">Option</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Apple Inc., Bitcoin, etc."
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="100"
                    step="0.01"
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Avg Price *
                  </label>
                  <input
                    type="number"
                    value={newItem.avgPrice}
                    onChange={(e) => setNewItem({ ...newItem, avgPrice: e.target.value })}
                    placeholder="150.00"
                    step="0.01"
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Current Price *
                  </label>
                  <input
                    type="number"
                    value={newItem.currentPrice}
                    onChange={(e) => setNewItem({ ...newItem, currentPrice: e.target.value })}
                    placeholder="175.00"
                    step="0.01"
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-primary-700 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPortfolio;