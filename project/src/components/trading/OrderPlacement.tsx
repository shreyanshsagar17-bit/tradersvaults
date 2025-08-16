import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { brokerService, BROKERS } from '../../services/brokerService';
import { BrokerConnection, Order, MarketData } from '../../types';
import toast from 'react-hot-toast';

interface OrderPlacementProps {
  symbol?: string;
  onClose: () => void;
  onOrderPlaced?: (order: Order) => void;
}

const OrderPlacement: React.FC<OrderPlacementProps> = ({ 
  symbol = '', 
  onClose, 
  onOrderPlaced 
}) => {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<string>('');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [orderData, setOrderData] = useState({
    symbol: symbol,
    side: 'buy' as 'buy' | 'sell',
    type: 'market' as 'market' | 'limit' | 'stop_loss' | 'stop_limit',
    quantity: '',
    price: '',
    stopPrice: '',
    validity: 'day' as 'day' | 'ioc' | 'gtc',
    product: 'mis' as 'mis' | 'cnc' | 'nrml',
    exchange: 'NSE' as 'NSE' | 'BSE' | 'MCX' | 'NCDEX',
  });
  const [placing, setPlacing] = useState(false);
  const [estimatedCharges, setEstimatedCharges] = useState(0);

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (selectedBroker && orderData.symbol) {
      startLiveData();
    }
    return () => {
      if (selectedBroker) {
        brokerService.stopMarketDataStream(selectedBroker);
      }
    };
  }, [selectedBroker, orderData.symbol]);

  useEffect(() => {
    calculateEstimatedCharges();
  }, [orderData.quantity, orderData.price, marketData]);

  const loadConnections = async () => {
    try {
      // Check if any brokers have credentials before attempting to load
      const hasAnyCredentials = BROKERS.some(broker => 
        brokerService.hasStoredCredentials(broker.id)
      );
      
      if (!hasAnyCredentials) {
        console.log('No broker credentials configured for order placement');
        setConnections([]);
        return;
      }
      
      const userConnections = await brokerService.getUserConnections('1');
      const connectedBrokers = userConnections.filter(conn => conn.status === 'connected');
      setConnections(connectedBrokers);
      
      if (connectedBrokers.length > 0) {
        setSelectedBroker(connectedBrokers[0].brokerId);
      } else {
        console.log('Broker credentials configured but no active connections for order placement');
      }
    } catch (error) {
      console.warn('Failed to load connections for order placement:', error.message);
      setConnections([]);
      
      // Show user-friendly error message
      if (error.message?.includes('Network') || error.message?.includes('server')) {
        toast.error('Network error or server unavailable for order placement');
      }
    }
  };

  const startLiveData = () => {
    if (!selectedBroker || !orderData.symbol) return;
    
    brokerService.startMarketDataStream(
      selectedBroker,
      [orderData.symbol],
      (data: MarketData) => {
        setMarketData(data);
        // Auto-fill price for limit orders
        if (orderData.type === 'limit' && !orderData.price) {
          setOrderData(prev => ({ ...prev, price: data.price.toString() }));
        }
      }
    );
  };

  const calculateEstimatedCharges = () => {
    if (!orderData.quantity || !marketData) return;
    
    const quantity = parseInt(orderData.quantity);
    const price = orderData.type === 'market' ? marketData.price : parseFloat(orderData.price || '0');
    const value = quantity * price;
    
    // Simplified charge calculation
    const brokerage = Math.min(20, value * 0.0003);
    const stt = value * 0.001;
    const exchangeCharges = value * 0.0000345;
    const gst = (brokerage + exchangeCharges) * 0.18;
    
    setEstimatedCharges(brokerage + stt + exchangeCharges + gst);
  };

  const handlePlaceOrder = async () => {
    if (!selectedBroker) {
      toast.error('Please select a broker');
      return;
    }

    if (!orderData.symbol || !orderData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (orderData.type !== 'market' && !orderData.price) {
      toast.error('Please enter price for limit/stop orders');
      return;
    }

    setPlacing(true);
    
    try {
      const order = await brokerService.placeOrder(selectedBroker, {
        ...orderData,
        quantity: parseInt(orderData.quantity),
        price: orderData.price ? parseFloat(orderData.price) : undefined,
        stopPrice: orderData.stopPrice ? parseFloat(orderData.stopPrice) : undefined,
      });

      if (order) {
        toast.success('Order placed successfully!');
        onOrderPlaced?.(order);
        onClose();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const getBrokerName = (brokerId: string) => {
    return BROKERS.find(b => b.id === brokerId)?.displayName || brokerId;
  };

  const getEstimatedTotal = () => {
    if (!orderData.quantity || !marketData) return 0;
    
    const quantity = parseInt(orderData.quantity);
    const price = orderData.type === 'market' ? marketData.price : parseFloat(orderData.price || '0');
    const value = quantity * price;
    
    return orderData.side === 'buy' ? value + estimatedCharges : value - estimatedCharges;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-primary-800 rounded-lg border border-primary-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Place Order</h2>
          <button
            onClick={onClose}
            className="text-primary-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Broker Selection */}
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Select Broker *
            </label>
            <select
              value={selectedBroker}
              onChange={(e) => setSelectedBroker(e.target.value)}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              required
            >
              <option value="">Choose Broker</option>
              {connections.map((connection) => (
                <option key={connection.id} value={connection.brokerId}>
                  {getBrokerName(connection.brokerId)} - {connection.status}
                </option>
              ))}
            </select>
            {connections.length === 0 && (
              <p className="text-danger-400 text-sm mt-1">
                No connected brokers. Please connect a broker first.
              </p>
            )}
          </div>

          {/* Market Data Display */}
          {marketData && (
            <div className="bg-primary-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{marketData.symbol}</h3>
                  <p className="text-primary-400 text-sm">Live Price</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-xl font-bold">₹{marketData.price.toFixed(2)}</p>
                  <p className={`text-sm ${marketData.change >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                    {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)} ({marketData.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Symbol *
              </label>
              <input
                type="text"
                value={orderData.symbol}
                onChange={(e) => setOrderData({ ...orderData, symbol: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="e.g., RELIANCE"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Exchange *
              </label>
              <select
                value={orderData.exchange}
                onChange={(e) => setOrderData({ ...orderData, exchange: e.target.value as any })}
                className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="MCX">MCX</option>
                <option value="NCDEX">NCDEX</option>
              </select>
            </div>
          </div>

          {/* Side Selection */}
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Side *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderData({ ...orderData, side: 'buy' })}
                className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                  orderData.side === 'buy'
                    ? 'border-success-500 bg-success-500/10 text-success-400'
                    : 'border-primary-600 bg-primary-700 text-primary-300 hover:border-primary-500'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>BUY</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderData({ ...orderData, side: 'sell' })}
                className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                  orderData.side === 'sell'
                    ? 'border-danger-500 bg-danger-500/10 text-danger-400'
                    : 'border-primary-600 bg-primary-700 text-primary-300 hover:border-primary-500'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>SELL</span>
              </button>
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Order Type *
            </label>
            <select
              value={orderData.type}
              onChange={(e) => setOrderData({ ...orderData, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop_loss">Stop Loss</option>
              <option value="stop_limit">Stop Limit</option>
            </select>
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={orderData.quantity}
                onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="100"
                min="1"
                required
              />
            </div>

            {orderData.type !== 'market' && (
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={orderData.price}
                  onChange={(e) => setOrderData({ ...orderData, price: e.target.value })}
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="0.00"
                  required
                />
              </div>
            )}
          </div>

          {/* Stop Price for Stop Orders */}
          {(orderData.type === 'stop_loss' || orderData.type === 'stop_limit') && (
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Stop Price *
              </label>
              <input
                type="number"
                step="0.05"
                value={orderData.stopPrice}
                onChange={(e) => setOrderData({ ...orderData, stopPrice: e.target.value })}
                className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="0.00"
                required
              />
            </div>
          )}

          {/* Product and Validity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Product *
              </label>
              <select
                value={orderData.product}
                onChange={(e) => setOrderData({ ...orderData, product: e.target.value as any })}
                className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="mis">MIS (Intraday)</option>
                <option value="cnc">CNC (Delivery)</option>
                <option value="nrml">NRML (Normal)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Validity *
              </label>
              <select
                value={orderData.validity}
                onChange={(e) => setOrderData({ ...orderData, validity: e.target.value as any })}
                className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="day">Day</option>
                <option value="ioc">IOC (Immediate or Cancel)</option>
                <option value="gtc">GTC (Good Till Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Order Summary */}
          {orderData.quantity && (marketData || orderData.price) && (
            <div className="bg-primary-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-300">Order Value:</span>
                  <span className="text-white">
                    ₹{(parseInt(orderData.quantity) * (orderData.type === 'market' ? marketData?.price || 0 : parseFloat(orderData.price || '0'))).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-300">Est. Charges:</span>
                  <span className="text-danger-400">₹{estimatedCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-primary-600 pt-2">
                  <span className="text-primary-300 font-medium">Est. Total:</span>
                  <span className="text-white font-medium">₹{getEstimatedTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedBroker || !orderData.symbol || !orderData.quantity}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                orderData.side === 'buy'
                  ? 'bg-success-600 hover:bg-success-700 text-white'
                  : 'bg-danger-600 hover:bg-danger-700 text-white'
              } disabled:bg-primary-600 disabled:text-primary-400`}
            >
              {placing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  {orderData.side === 'buy' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{orderData.side.toUpperCase()} {orderData.symbol}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPlacement;