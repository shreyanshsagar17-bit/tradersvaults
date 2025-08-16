import React, { useState } from 'react';
import { Calculator as CalculatorIcon, TrendingUp, DollarSign, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CalculationResult {
  positionSize: number;
  riskAmount: number;
  potentialProfit: number;
  riskRewardRatio: string;
  totalInvestment: number;
  stopLossDistance: number;
  takeProfitDistance: number;
}

const Calculator: React.FC = () => {
  const [calculationType, setCalculationType] = useState('forex');
  const [formData, setFormData] = useState({
    accountBalance: '',
    riskPercentage: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    pipValue: '10',
    contractSize: '100',
  });
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.accountBalance || parseFloat(formData.accountBalance) <= 0) {
      newErrors.accountBalance = 'Account balance must be greater than 0';
    }
    
    if (!formData.riskPercentage || parseFloat(formData.riskPercentage) <= 0 || parseFloat(formData.riskPercentage) > 100) {
      newErrors.riskPercentage = 'Risk percentage must be between 0 and 100';
    }
    
    if (!formData.entryPrice || parseFloat(formData.entryPrice) <= 0) {
      newErrors.entryPrice = 'Entry price must be greater than 0';
    }
    
    if (!formData.stopLoss || parseFloat(formData.stopLoss) <= 0) {
      newErrors.stopLoss = 'Stop loss must be greater than 0';
    }
    
    if (formData.takeProfit && parseFloat(formData.takeProfit) <= 0) {
      newErrors.takeProfit = 'Take profit must be greater than 0';
    }

    // Market-specific validations
    if (calculationType === 'forex' && (!formData.pipValue || parseFloat(formData.pipValue) <= 0)) {
      newErrors.pipValue = 'Pip value must be greater than 0';
    }
    
    if (calculationType === 'options' && (!formData.contractSize || parseFloat(formData.contractSize) <= 0)) {
      newErrors.contractSize = 'Contract size must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePosition = () => {
    if (!validateInputs()) return;

    const balance = parseFloat(formData.accountBalance);
    const risk = parseFloat(formData.riskPercentage);
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit) || 0;

    let positionSize = 0;
    let riskAmount = (balance * risk) / 100;
    let potentialProfit = 0;
    let totalInvestment = 0;
    let stopLossDistance = 0;
    let takeProfitDistance = 0;

    switch (calculationType) {
      case 'forex':
        const pipValue = parseFloat(formData.pipValue);
        const pips = Math.abs(entry - sl) * 10000; // Convert to pips
        stopLossDistance = pips;
        positionSize = riskAmount / (pips * pipValue / 10000);
        
        if (tp > 0) {
          takeProfitDistance = Math.abs(tp - entry) * 10000;
          potentialProfit = takeProfitDistance * (pipValue / 10000) * positionSize;
        }
        
        totalInvestment = positionSize * entry;
        break;

      case 'crypto':
        const cryptoPriceDiff = Math.abs(entry - sl);
        stopLossDistance = cryptoPriceDiff;
        positionSize = riskAmount / cryptoPriceDiff;
        
        if (tp > 0) {
          takeProfitDistance = Math.abs(tp - entry);
          potentialProfit = takeProfitDistance * positionSize;
        }
        
        totalInvestment = positionSize * entry;
        break;

      case 'stocks':
        const stockPriceDiff = Math.abs(entry - sl);
        stopLossDistance = stockPriceDiff;
        positionSize = Math.floor(riskAmount / stockPriceDiff);
        
        if (tp > 0) {
          takeProfitDistance = Math.abs(tp - entry);
          potentialProfit = takeProfitDistance * positionSize;
        }
        
        totalInvestment = positionSize * entry;
        break;

      case 'options':
        const premium = entry;
        const contractSize = parseFloat(formData.contractSize);
        const contracts = Math.floor(riskAmount / (premium * contractSize));
        positionSize = contracts;
        stopLossDistance = Math.abs(entry - sl);
        
        if (tp > 0) {
          takeProfitDistance = Math.abs(tp - entry);
          potentialProfit = takeProfitDistance * contracts * contractSize;
        }
        
        totalInvestment = contracts * premium * contractSize;
        break;
    }

    const riskRewardRatio = potentialProfit > 0 ? `1:${(potentialProfit / riskAmount).toFixed(2)}` : '1:0';

    setResult({
      positionSize: Math.round(positionSize * 100) / 100,
      riskAmount,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
      riskRewardRatio,
      totalInvestment: Math.round(totalInvestment * 100) / 100,
      stopLossDistance: Math.round(stopLossDistance * 100) / 100,
      takeProfitDistance: Math.round(takeProfitDistance * 100) / 100,
    });
  };

  const copyToClipboard = () => {
    if (!result) return;
    
    const text = `
Position Size: ${result.positionSize.toLocaleString()}
Risk Amount: $${result.riskAmount.toLocaleString()}
Potential Profit: $${result.potentialProfit.toLocaleString()}
Risk:Reward Ratio: ${result.riskRewardRatio}
Total Investment: $${result.totalInvestment.toLocaleString()}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Results copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getFieldsForType = () => {
    const commonFields = (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Account Balance *
          </label>
          <input
            type="number"
            value={formData.accountBalance}
            onChange={(e) => handleInputChange('accountBalance', e.target.value)}
            placeholder="10000"
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.accountBalance ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.accountBalance && <p className="text-red-400 text-xs mt-1">{errors.accountBalance}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Risk Percentage (%) *
          </label>
          <input
            type="number"
            value={formData.riskPercentage}
            onChange={(e) => handleInputChange('riskPercentage', e.target.value)}
            placeholder="2"
            max="100"
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.riskPercentage ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.riskPercentage && <p className="text-red-400 text-xs mt-1">{errors.riskPercentage}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Entry Price *
          </label>
          <input
            type="number"
            value={formData.entryPrice}
            onChange={(e) => handleInputChange('entryPrice', e.target.value)}
            placeholder="100.00"
            step="0.00001"
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.entryPrice ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.entryPrice && <p className="text-red-400 text-xs mt-1">{errors.entryPrice}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Stop Loss *
          </label>
          <input
            type="number"
            value={formData.stopLoss}
            onChange={(e) => handleInputChange('stopLoss', e.target.value)}
            placeholder="95.00"
            step="0.00001"
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.stopLoss ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.stopLoss && <p className="text-red-400 text-xs mt-1">{errors.stopLoss}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Take Profit (Optional)
          </label>
          <input
            type="number"
            value={formData.takeProfit}
            onChange={(e) => handleInputChange('takeProfit', e.target.value)}
            placeholder="110.00"
            step="0.00001"
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.takeProfit ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {errors.takeProfit && <p className="text-red-400 text-xs mt-1">{errors.takeProfit}</p>}
        </div>
      </>
    );

    switch (calculationType) {
      case 'forex':
        return (
          <>
            {commonFields}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pip Value *
              </label>
              <input
                type="number"
                value={formData.pipValue}
                onChange={(e) => handleInputChange('pipValue', e.target.value)}
                placeholder="10"
                step="0.01"
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.pipValue ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.pipValue && <p className="text-red-400 text-xs mt-1">{errors.pipValue}</p>}
              <p className="text-gray-400 text-xs mt-1">Standard lot = $10, Mini lot = $1, Micro lot = $0.1</p>
            </div>
          </>
        );

      case 'options':
        return (
          <>
            {commonFields}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contract Size (shares per contract) *
              </label>
              <input
                type="number"
                value={formData.contractSize}
                onChange={(e) => handleInputChange('contractSize', e.target.value)}
                placeholder="100"
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.contractSize ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.contractSize && <p className="text-red-400 text-xs mt-1">{errors.contractSize}</p>}
              <p className="text-gray-400 text-xs mt-1">Standard options contract = 100 shares</p>
            </div>
          </>
        );

      default:
        return commonFields;
    }
  };

  const getPositionSizeLabel = () => {
    switch (calculationType) {
      case 'forex': return 'Lot Size';
      case 'crypto': return 'Coin Amount';
      case 'stocks': return 'Shares';
      case 'options': return 'Contracts';
      default: return 'Position Size';
    }
  };

  const getDistanceLabel = () => {
    switch (calculationType) {
      case 'forex': return 'Pips';
      case 'crypto': return 'Price Points';
      case 'stocks': return 'Price Points';
      case 'options': return 'Premium Points';
      default: return 'Points';
    }
  };

  return (
    <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gold-500/20 rounded-lg">
                <CalculatorIcon className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Trading Calculator</h1>
                <p className="text-primary-300">Calculate position sizes and risk-reward ratios</p>
              </div>
            </div>
          </div>

          {/* Market Type Selector */}
          <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <label className="block text-sm font-medium text-primary-300 mb-3">
              Select Market Type *
            </label>
            <select
              value={calculationType}
              onChange={(e) => {
                setCalculationType(e.target.value);
                setResult(null);
                setErrors({});
                setFormData({
                  accountBalance: formData.accountBalance,
                  riskPercentage: formData.riskPercentage,
                  entryPrice: '',
                  stopLoss: '',
                  takeProfit: '',
                  pipValue: '10',
                  contractSize: '100',
                });
              }}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="forex">Forex</option>
              <option value="crypto">Crypto</option>
              <option value="stocks">Stocks</option>
              <option value="options">Options</option>
            </select>
            
            {/* Market Type Info */}
            <div className="mt-3 p-3 bg-primary-700 rounded-lg">
              <p className="text-primary-300 text-sm">
                {calculationType === 'forex' && 'Calculate position sizes for currency pairs using pip values and lot sizes.'}
                {calculationType === 'crypto' && 'Calculate position sizes for cryptocurrency trading with direct price differences.'}
                {calculationType === 'stocks' && 'Calculate share quantities for stock trading based on price movements.'}
                {calculationType === 'options' && 'Calculate option contracts based on premium and contract specifications.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Fields */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-gold-400" />
                <span>Trade Parameters</span>
              </h2>
              
              <div className="space-y-4">
                {getFieldsForType()}
                
                <button
                  onClick={calculatePosition}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <CalculatorIcon className="w-4 h-4" />
                  <span>Calculate Position</span>
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gold-400" />
                  <span>Calculation Results</span>
                </h2>
                
                {result && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-700 rounded-lg p-3">
                      <p className="text-primary-400 text-sm">{getPositionSizeLabel()}</p>
                      <p className="text-white text-xl font-bold">{result.positionSize.toLocaleString()}</p>
                    </div>
                    <div className="bg-primary-700 rounded-lg p-3">
                      <p className="text-primary-400 text-sm">Risk Amount</p>
                      <p className="text-red-400 text-xl font-bold">${result.riskAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-700 rounded-lg p-3">
                      <p className="text-primary-400 text-sm">Potential Profit</p>
                      <p className="text-green-400 text-xl font-bold">${result.potentialProfit.toLocaleString()}</p>
                    </div>
                    <div className="bg-primary-700 rounded-lg p-3">
                      <p className="text-primary-400 text-sm">Risk:Reward</p>
                      <p className="text-gold-400 text-xl font-bold">{result.riskRewardRatio}</p>
                    </div>
                  </div>
                  
                  <div className="bg-primary-700 rounded-lg p-3">
                    <p className="text-primary-400 text-sm">Total Investment</p>
                    <p className="text-white text-xl font-bold">${result.totalInvestment.toLocaleString()}</p>
                  </div>
                  
                  {/* Distance Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-700 rounded-lg p-3">
                      <p className="text-primary-400 text-sm">SL Distance ({getDistanceLabel()})</p>
                      <p className="text-red-400 font-medium">{result.stopLossDistance.toLocaleString()}</p>
                    </div>
                    {result.takeProfitDistance > 0 && (
                      <div className="bg-primary-700 rounded-lg p-3">
                        <p className="text-primary-400 text-sm">TP Distance ({getDistanceLabel()})</p>
                        <p className="text-green-400 font-medium">{result.takeProfitDistance.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalculatorIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <p className="text-primary-400">Enter trade parameters and click calculate</p>
                  <p className="text-primary-500 text-sm mt-2">All required fields must be filled</p>
                </div>
              )}
            </div>
          </div>

          {/* Market-Specific Tips */}
          <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              {calculationType.charAt(0).toUpperCase() + calculationType.slice(1)} Trading Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-300">
              {calculationType === 'forex' && (
                <>
                  <div>• Standard lot = 100,000 units, pip value ≈ $10</div>
                  <div>• Mini lot = 10,000 units, pip value ≈ $1</div>
                  <div>• Micro lot = 1,000 units, pip value ≈ $0.1</div>
                  <div>• Consider spread and swap costs</div>
                </>
              )}
              {calculationType === 'crypto' && (
                <>
                  <div>• High volatility requires smaller position sizes</div>
                  <div>• Consider exchange fees and slippage</div>
                  <div>• Use tight stop losses due to price swings</div>
                  <div>• Monitor funding rates for perpetual contracts</div>
                </>
              )}
              {calculationType === 'stocks' && (
                <>
                  <div>• Consider commission costs per share</div>
                  <div>• Account for bid-ask spreads</div>
                  <div>• Use round lots (100 shares) when possible</div>
                  <div>• Factor in dividend dates for swing trades</div>
                </>
              )}
              {calculationType === 'options' && (
                <>
                  <div>• One contract = 100 shares of underlying</div>
                  <div>• Consider time decay (theta)</div>
                  <div>• Monitor implied volatility changes</div>
                  <div>• Account for bid-ask spreads on options</div>
                </>
              )}
            </div>
          </div>
    </div>
  );
};

export default Calculator;