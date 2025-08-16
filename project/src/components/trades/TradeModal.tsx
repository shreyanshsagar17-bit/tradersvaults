import React, { useState, useEffect } from 'react';
import { X, Upload, TrendingUp, TrendingDown, Plus, Minus, Calculator, Wifi } from 'lucide-react';
import { optionsService } from '../../services/api';
import { brokerService } from '../../services/brokerService';
import { TradeLeg, ExchangeLotSize, BrokerCharges } from '../../types';
import OrderPlacement from '../trading/OrderPlacement';
import toast from 'react-hot-toast';

interface TradeModalProps {
  onClose: () => void;
  onSave: (trade: any) => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ onClose, onSave }) => {
  const [tradeType, setTradeType] = useState<'stock' | 'option' | 'multi-leg'>('stock');
  const [exchangeLotSizes, setExchangeLotSizes] = useState<ExchangeLotSize[]>([]);
  const [brokerCharges, setBrokerCharges] = useState<BrokerCharges | null>(null);
  const [calculatedPnL, setCalculatedPnL] = useState<any>(null);
  const [showOrderPlacement, setShowOrderPlacement] = useState(false);
  
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'stock' as 'stock' | 'option' | 'multi-leg',
    side: 'long' as 'long' | 'short',
    
    // Stock fields
    quantity: '',
    entryPrice: '',
    exitPrice: '',
    
    // Options fields
    optionType: 'call' as 'call' | 'put',
    optionAction: 'buy' as 'buy' | 'sell',
    strikePrice: '',
    expiryDate: '',
    premium: '',
    lotSize: '',
    exchangeLotSize: 50,
    
    // Common fields
    date: new Date().toISOString().split('T')[0],
    tradeStrategy: 'intraday' as 'intraday' | 'swing' | 'hedge' | 'arbitrage' | 'scalping',
    notes: '',
    image: null as File | null
  });

  const [legs, setLegs] = useState<TradeLeg[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadExchangeLotSizes();
  }, []);

  useEffect(() => {
    if (tradeType === 'option' && formData.premium && formData.lotSize) {
      calculateCharges();
    }
  }, [formData.premium, formData.lotSize, formData.quantity, tradeType]);

  useEffect(() => {
    if (tradeType === 'multi-leg' && legs.length > 0) {
      calculateMultiLegPnL();
    }
  }, [legs, tradeType]);

  const loadExchangeLotSizes = async () => {
    try {
      const lotSizes = await optionsService.getExchangeLotSizes();
      setExchangeLotSizes(lotSizes);
    } catch (error) {
      console.error('Failed to load lot sizes:', error);
    }
  };

  const calculateCharges = () => {
    const premium = parseFloat(formData.premium) || 0;
    const lotSize = formData.exchangeLotSize || 50;
    const quantity = parseFloat(formData.lotSize) || 1;
    
    if (premium > 0 && quantity > 0) {
      const charges = optionsService.calculateBrokerCharges(premium, lotSize, quantity, true);
      setBrokerCharges(charges);
      
      // Calculate P&L if exit price is available
      if (formData.exitPrice) {
        const exitPremium = parseFloat(formData.exitPrice);
        const entryValue = premium * lotSize * quantity;
        const exitValue = exitPremium * lotSize * quantity;
        
        let grossPnl = 0;
        if (formData.optionAction === 'buy') {
          grossPnl = exitValue - entryValue;
        } else {
          grossPnl = entryValue - exitValue;
        }
        
        const netPnl = grossPnl - charges.total;
        
        setCalculatedPnL({
          grossPnl: Math.round(grossPnl * 100) / 100,
          brokerCharges: charges.total,
          netPnl: Math.round(netPnl * 100) / 100,
        });
      }
    }
  };

  const calculateMultiLegPnL = () => {
    if (legs.length === 0) return;
    
    const exitPremiums = legs.map(leg => parseFloat(leg.exitPrice?.toString() || '0'));
    const pnlData = optionsService.calculateOptionsPnL(legs, exitPremiums);
    setCalculatedPnL(pnlData);
  };

  const handleSymbolChange = (symbol: string) => {
    const lotSizeData = exchangeLotSizes.find(item => item.symbol === symbol);
    setFormData({
      ...formData,
      symbol,
      exchangeLotSize: lotSizeData?.lotSize || 50
    });
  };

  const addLeg = () => {
    const newLeg: TradeLeg = {
      id: Date.now().toString(),
      symbol: formData.symbol,
      optionType: formData.optionType,
      optionAction: formData.optionAction,
      strikePrice: parseFloat(formData.strikePrice) || 0,
      expiryDate: formData.expiryDate,
      premium: parseFloat(formData.premium) || 0,
      lotSize: formData.exchangeLotSize,
      quantity: parseFloat(formData.lotSize) || 1,
      entryPrice: parseFloat(formData.premium) || 0,
    };
    
    setLegs([...legs, newLeg]);
    
    // Reset form for next leg
    setFormData({
      ...formData,
      optionType: 'call',
      optionAction: 'buy',
      strikePrice: '',
      premium: '',
      lotSize: '',
    });
  };

  const removeLeg = (legId: string) => {
    setLegs(legs.filter(leg => leg.id !== legId));
  };

  const updateLegExitPrice = (legId: string, exitPrice: string) => {
    setLegs(legs.map(leg => 
      leg.id === legId 
        ? { ...leg, exitPrice: parseFloat(exitPrice) || 0 }
        : leg
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.symbol) {
      toast.error('Please enter a symbol');
      return;
    }
    
    if (tradeType === 'stock' && (!formData.quantity || !formData.entryPrice)) {
      toast.error('Please fill in quantity and entry price for stock trades');
      return;
    }
    
    if (tradeType === 'option' && (!formData.premium || !formData.strikePrice || !formData.expiryDate)) {
      toast.error('Please fill in all required option fields');
      return;
    }
    
    if (tradeType === 'multi-leg' && legs.length === 0) {
      toast.error('Please add at least one leg for multi-leg trades');
      return;
    }
    
    const tradeData = {
      ...formData,
      type: tradeType,
      legs: tradeType === 'multi-leg' ? legs : undefined,
      brokerCharges: brokerCharges?.total || 0,
      netPnl: calculatedPnL?.netPnl || 0,
      pnl: calculatedPnL?.grossPnl || 0,
    };
    
    onSave(tradeData);
    toast.success('Trade added successfully!');
  };

  const getTradeTypeOptions = () => {
    if (tradeType === 'option') {
      return [
        { value: 'buy-call', label: 'Buy Call', optionType: 'call', optionAction: 'buy' },
        { value: 'sell-call', label: 'Sell Call', optionType: 'call', optionAction: 'sell' },
        { value: 'buy-put', label: 'Buy Put', optionType: 'put', optionAction: 'buy' },
        { value: 'sell-put', label: 'Sell Put', optionType: 'put', optionAction: 'sell' },
      ];
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-primary-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Trade</h2>
          <button
            onClick={onClose}
            className="text-primary-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trade Type Selector */}
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setTradeType('stock')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                tradeType === 'stock'
                  ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                  : 'border-primary-600 bg-primary-700 text-primary-300 hover:border-primary-500'
              }`}
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Stock Trade</span>
            </button>
            
            <button
              type="button"
              onClick={() => setTradeType('option')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                tradeType === 'option'
                  ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                  : 'border-primary-600 bg-primary-700 text-primary-300 hover:border-primary-500'
              }`}
            >
              <Calculator className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Options Trade</span>
            </button>
            
            <button
              type="button"
              onClick={() => setTradeType('multi-leg')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                tradeType === 'multi-leg'
                  ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                  : 'border-primary-600 bg-primary-700 text-primary-300 hover:border-primary-500'
              }`}
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Multi-Leg</span>
            </button>
          </div>

          {/* Symbol and Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Symbol *
              </label>
              {tradeType === 'option' || tradeType === 'multi-leg' ? (
                <select
                  value={formData.symbol}
                  onChange={(e) => handleSymbolChange(e.target.value)}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                >
                  <option value="">Select Symbol</option>
                  {exchangeLotSizes.map((item) => (
                    <option key={item.symbol} value={item.symbol}>
                      {item.symbol} (Lot: {item.lotSize})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="e.g., AAPL, RELIANCE"
                  required
                />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Trade Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                required
              />
            </div>
          </div>

          {/* Stock Trade Fields */}
          {tradeType === 'stock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Side *
                  </label>
                  <select
                    value={formData.side}
                    onChange={(e) => setFormData({ ...formData, side: e.target.value as 'long' | 'short' })}
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="long">Long (Buy)</option>
                    <option value="short">Short (Sell)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Entry Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="150.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Exit Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.exitPrice}
                  onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="155.00"
                />
              </div>
            </div>
          )}

          {/* Options Trade Fields */}
          {tradeType === 'option' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Option Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {getTradeTypeOptions().map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          optionType: option.optionType as 'call' | 'put',
                          optionAction: option.optionAction as 'buy' | 'sell'
                        })}
                        className={`p-3 rounded-lg border transition-colors ${
                          formData.optionType === option.optionType && formData.optionAction === option.optionAction
                            ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                            : 'border-primary-600 bg-primary-700 text-primary-300 hover:border-primary-500'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Strike Price *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.strikePrice}
                    onChange={(e) => setFormData({ ...formData, strikePrice: e.target.value })}
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="18500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Premium (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.premium}
                    onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="150.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Lot Size *
                  </label>
                  <input
                    type="number"
                    value={formData.lotSize}
                    onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="1"
                    required
                  />
                  <p className="text-xs text-primary-400 mt-1">
                    Exchange lot size: {formData.exchangeLotSize} units
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Exit Premium (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.exitPrice}
                  onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="75.00"
                />
              </div>
            </div>
          )}

          {/* Multi-Leg Trade Fields */}
          {tradeType === 'multi-leg' && (
            <div className="space-y-4">
              <div className="bg-primary-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Add Leg</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-2">
                      Option Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {getTradeTypeOptions().map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            optionType: option.optionType as 'call' | 'put',
                            optionAction: option.optionAction as 'buy' | 'sell'
                          })}
                          className={`p-2 rounded border text-sm transition-colors ${
                            formData.optionType === option.optionType && formData.optionAction === option.optionAction
                              ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                              : 'border-primary-600 bg-primary-800 text-primary-300 hover:border-primary-500'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full bg-primary-800 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-2">
                      Strike Price
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.strikePrice}
                      onChange={(e) => setFormData({ ...formData, strikePrice: e.target.value })}
                      className="w-full bg-primary-800 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="18500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-2">
                      Premium (₹)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.premium}
                      onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                      className="w-full bg-primary-800 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="150.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-2">
                      Lot Size
                    </label>
                    <input
                      type="number"
                      value={formData.lotSize}
                      onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                      className="w-full bg-primary-800 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addLeg}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-primary-900 py-2 px-4 rounded font-medium transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Leg
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Display Added Legs */}
              {legs.length > 0 && (
                <div className="bg-primary-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4">Trade Legs ({legs.length})</h3>
                  <div className="space-y-3">
                    {legs.map((leg, index) => (
                      <div key={leg.id} className="bg-primary-800 rounded p-3 flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-6 gap-4 text-sm">
                          <div>
                            <span className="text-primary-400">Type:</span>
                            <p className="text-white font-medium">
                              {leg.optionAction.toUpperCase()} {leg.optionType.toUpperCase()}
                            </p>
                          </div>
                          <div>
                            <span className="text-primary-400">Strike:</span>
                            <p className="text-white">{leg.strikePrice}</p>
                          </div>
                          <div>
                            <span className="text-primary-400">Premium:</span>
                            <p className="text-white">₹{leg.premium}</p>
                          </div>
                          <div>
                            <span className="text-primary-400">Lots:</span>
                            <p className="text-white">{leg.quantity}</p>
                          </div>
                          <div>
                            <span className="text-primary-400">Exit Premium:</span>
                            <input
                              type="number"
                              step="0.05"
                              value={leg.exitPrice || ''}
                              onChange={(e) => updateLegExitPrice(leg.id, e.target.value)}
                              className="w-full bg-primary-700 border border-primary-600 rounded px-2 py-1 text-white text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => removeLeg(leg.id)}
                              className="text-danger-400 hover:text-danger-300 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trade Strategy and Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Trade Strategy
              </label>
              <select
                value={formData.tradeStrategy}
                onChange={(e) => setFormData({ ...formData, tradeStrategy: e.target.value as any })}
                className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="intraday">Intraday</option>
                <option value="swing">Swing Trading</option>
                <option value="hedge">Hedge</option>
                <option value="arbitrage">Arbitrage</option>
                <option value="scalping">Scalping</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Screenshot
              </label>
              <div className="border-2 border-dashed border-primary-600 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="w-6 h-6 text-primary-400" />
                  <span className="text-primary-400 text-sm">Upload Screenshot</span>
                </label>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
              placeholder="Trade notes and observations..."
            />
          </div>

          {/* P&L Calculator Display */}
          {(brokerCharges || calculatedPnL) && (
            <div className="bg-primary-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-4 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                Auto P&L Calculator
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {calculatedPnL && (
                  <>
                    <div>
                      <span className="text-primary-400 text-sm">Gross P&L:</span>
                      <p className={`font-bold ${calculatedPnL.grossPnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                        ₹{calculatedPnL.grossPnl?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-primary-400 text-sm">Net P&L:</span>
                      <p className={`font-bold ${calculatedPnL.netPnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                        ₹{calculatedPnL.netPnl?.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
                
                {brokerCharges && (
                  <>
                    <div>
                      <span className="text-primary-400 text-sm">Brokerage:</span>
                      <p className="text-white">₹{brokerCharges.brokerage}</p>
                    </div>
                    <div>
                      <span className="text-primary-400 text-sm">Total Charges:</span>
                      <p className="text-danger-400 font-medium">₹{brokerCharges.total}</p>
                    </div>
                  </>
                )}
              </div>
              
              {brokerCharges && (
                <div className="mt-3 text-xs text-primary-400">
                  <p>Breakdown: Brokerage ₹{brokerCharges.brokerage} + STT ₹{brokerCharges.stt} + Exchange ₹{brokerCharges.exchangeCharges} + GST ₹{brokerCharges.gst} + SEBI ₹{brokerCharges.sebiCharges} + Stamp ₹{brokerCharges.stampDuty}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowOrderPlacement(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Wifi className="w-4 h-4" />
              <span>Place Order</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-primary-900 rounded-lg font-medium transition-colors"
            >
              Save Trade
            </button>
          </div>
        </form>
        
        {/* Order Placement Modal */}
        {showOrderPlacement && (
          <OrderPlacement
            symbol={formData.symbol}
            onClose={() => setShowOrderPlacement(false)}
            onOrderPlaced={(order) => {
              console.log('Order placed:', order);
              setShowOrderPlacement(false);
              toast.success('Order placed successfully!');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TradeModal;