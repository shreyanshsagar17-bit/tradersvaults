import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Plus, Minus } from 'lucide-react';
import { brokerService, BROKERS } from '../../services/brokerService';
import { MarketData, BrokerConnection } from '../../types';
import toast from 'react-hot-toast';

interface LiveMarketDataProps {
  onSymbolSelect?: (symbol: string) => void;
}

const LiveMarketData: React.FC<LiveMarketDataProps> = ({ onSymbolSelect }) => {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<string>('');
  const [watchlist, setWatchlist] = useState<string[]>(['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK']);
  const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map());
  const [newSymbol, setNewSymbol] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (selectedBroker && watchlist.length > 0) {
      startStreaming();
    }
    return () => {
      if (selectedBroker) {
        brokerService.stopMarketDataStream(selectedBroker);
      }
    };
  }, [selectedBroker, watchlist]);

  const loadConnections = async () => {
    try {
      const userConnections = await brokerService.getUserConnections('1');
      const connectedBrokers = userConnections.filter(conn => conn.status === 'connected');
      setConnections(connectedBrokers);
      
      if (connectedBrokers.length > 0) {
        setSelectedBroker(connectedBrokers[0].brokerId);
      } else {
        console.warn('No connected brokers available for live data');
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      // Error handling is now done in the service layer
      // Just log the error and continue with empty connections
    }
  };

  const startStreaming = async () => {
    if (!selectedBroker || watchlist.length === 0) return;
    
    // Validate broker connection before starting stream
    if (!brokerService.hasValidCredentials(selectedBroker)) {
      toast.error('Please connect to the broker first in the Broker Connect page');
      return;
    }
    
    setIsStreaming(true);
    await brokerService.startMarketDataStream(
      selectedBroker,
      watchlist,
      (data: MarketData) => {
        setMarketData(prev => new Map(prev.set(data.symbol, data)));
      }
    );
    
    // Success message is handled in the service layer
  };

  const stopStreaming = () => {
    if (selectedBroker) {
      brokerService.stopMarketDataStream(selectedBroker);
      setIsStreaming(false);
      // Remove success message to reduce noise
    }
  };

  const addSymbol = () => {
    if (newSymbol && !watchlist.includes(newSymbol.toUpperCase())) {
      setWatchlist([...watchlist, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
    setMarketData(prev => {
      const newMap = new Map(prev);
      newMap.delete(symbol);
      return newMap;
    });
  };

  const handleSymbolClick = (symbol: string) => {
    onSymbolSelect?.(symbol);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return {
      change: `${isPositive ? '+' : ''}${change.toFixed(2)}`,
      changePercent: `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`,
      color: isPositive ? 'text-success-400' : 'text-danger-400',
      bgColor: isPositive ? 'bg-success-500/10' : 'bg-danger-500/10',
      icon: isPositive ? TrendingUp : TrendingDown,
    };
  };

  return (
    <div className="bg-primary-800 rounded-lg border border-primary-700">
      {/* Header */}
      <div className="p-4 border-b border-primary-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Live Market Data</h3>
              <p className="text-primary-400 text-sm">Real-time price updates</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Broker Selection */}
            <select
              value={selectedBroker}
              onChange={(e) => setSelectedBroker(e.target.value)}
              className="bg-primary-700 border border-primary-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Broker</option>
              {connections.map((connection) => (
                <option key={connection.id} value={connection.brokerId}>
                  {connection.brokerName}
                </option>
              ))}
            </select>
            
            {/* Streaming Controls */}
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="bg-danger-600 hover:bg-danger-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={startStreaming}
                disabled={!selectedBroker || watchlist.length === 0}
                className="bg-success-600 hover:bg-success-700 disabled:bg-primary-600 disabled:text-primary-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Start</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Add Symbol */}
        <div className="flex items-center space-x-2 mt-3">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
            placeholder="Add symbol (e.g., RELIANCE)"
            className="flex-1 bg-primary-700 border border-primary-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addSymbol}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="p-4">
        {watchlist.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <p className="text-primary-400">No symbols in watchlist</p>
            <p className="text-primary-500 text-sm">Add symbols to start streaming live data</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <p className="text-primary-400">No broker connections available</p>
            <p className="text-primary-500 text-sm">
              {BROKERS.some(broker => brokerService.hasStoredCredentials(broker.id))
                ? 'Broker credentials configured but no active connections'
                : 'Please configure broker credentials in the Broker Connect page'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((symbol) => {
              const data = marketData.get(symbol);
              const changeData = data ? formatChange(data.change, data.changePercent) : null;
              
              return (
                <div
                  key={symbol}
                  onClick={() => handleSymbolClick(symbol)}
                  className="bg-primary-700 rounded-lg p-4 cursor-pointer hover:bg-primary-600 transition-colors border border-primary-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{symbol}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSymbol(symbol);
                      }}
                      className="text-primary-400 hover:text-danger-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {data ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-xl font-bold">
                          ₹{formatPrice(data.price)}
                        </span>
                        {changeData && (
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded ${changeData.bgColor}`}>
                            <changeData.icon className={`w-3 h-3 ${changeData.color}`} />
                            <span className={`text-xs font-medium ${changeData.color}`}>
                              {changeData.changePercent}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {changeData && (
                        <div className={`text-sm ${changeData.color}`}>
                          {changeData.change} ({changeData.changePercent})
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div>
                          <span className="text-primary-400">High</span>
                          <p className="text-white font-medium">₹{formatPrice(data.high)}</p>
                        </div>
                        <div>
                          <span className="text-primary-400">Low</span>
                          <p className="text-white font-medium">₹{formatPrice(data.low)}</p>
                        </div>
                        <div>
                          <span className="text-primary-400">Vol</span>
                          <p className="text-white font-medium">{(data.volume / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-primary-400 mt-2">
                        Updated: {new Date(data.timestamp).toLocaleTimeString()}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      {isStreaming ? (
                        <div className="flex items-center space-x-2 text-primary-400">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Loading...</span>
                        </div>
                      ) : (
                        <span className="text-primary-400 text-sm">No data</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-primary-700 bg-primary-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-primary-400">
              Symbols: {watchlist.length}
            </span>
            <span className="text-primary-400">
              Updates: {marketData.size}
            </span>
            {selectedBroker && (
              <span className="text-primary-400">
                Broker: {connections.find(c => c.brokerId === selectedBroker)?.brokerName}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isStreaming && (
              <>
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                <span className="text-success-400">Live</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMarketData;