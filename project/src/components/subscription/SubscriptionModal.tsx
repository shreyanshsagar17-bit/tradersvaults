import React, { useState } from 'react';
import { X, Check, Crown, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: (plan: string) => void;
  trialDaysLeft: number;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  onClose, 
  onSubscribe, 
  trialDaysLeft 
}) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 999,
      period: 'month',
      features: [
        'Unlimited trade entries',
        'Advanced analytics',
        'Social features',
        'Trading calendar',
        'Options trading tools',
        'Export data',
        'Email support',
      ],
      popular: false,
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 9999,
      originalPrice: 11988,
      period: 'year',
      features: [
        'Everything in Monthly',
        'Priority support',
        'Advanced reporting',
        'API access',
        'Custom indicators',
        'Broker integrations',
        'Group management',
      ],
      popular: true,
      savings: '17% OFF',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-primary-800 rounded-lg border border-primary-700 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
            <p className="text-primary-300">
              {trialDaysLeft > 0 
                ? `${trialDaysLeft} days left in your free trial`
                : 'Your free trial has ended'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-primary-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Trial Warning */}
          {trialDaysLeft <= 3 && (
            <div className="bg-gold-500/20 border border-gold-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-gold-400" />
                <h3 className="text-gold-400 font-medium">
                  {trialDaysLeft > 0 
                    ? `Trial ending in ${trialDaysLeft} days!`
                    : 'Trial has ended!'
                  }
                </h3>
              </div>
              <p className="text-gold-300 text-sm mt-1">
                Subscribe now to continue accessing all features and your trading data.
              </p>
            </div>
          )}

          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-primary-600 bg-primary-700 hover:border-primary-500'
                } ${plan.popular ? 'ring-2 ring-gold-500/50' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gold-500 text-primary-900 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Crown className="w-3 h-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-success-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {plan.savings}
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-bold text-gold-400">₹{plan.price}</span>
                    <span className="text-primary-400">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-primary-400 text-sm line-through">
                      ₹{plan.originalPrice}/{plan.period}
                    </div>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-success-400 flex-shrink-0" />
                      <span className="text-primary-200 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
                    selectedPlan === plan.id
                      ? 'border-gold-500 bg-gold-500'
                      : 'border-primary-400'
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className="w-2 h-2 bg-primary-900 rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="bg-primary-700 rounded-lg p-4 mb-6">
            <h4 className="text-white font-medium mb-3">Payment Methods</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Visa', 'Mastercard', 'UPI', 'Net Banking'].map((method) => (
                <div key={method} className="bg-primary-600 rounded p-2 text-center">
                  <span className="text-primary-200 text-sm">{method}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="text-center mb-6">
            <p className="text-primary-300 text-sm">
              🛡️ 30-day money-back guarantee • Cancel anytime • Secure payment
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-primary-300 hover:text-white transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => onSubscribe(selectedPlan)}
              className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              onClick={() => {
                onSubscribe(selectedPlan);
                toast.success('Subscription process initiated!');
              }}
            >
              <Crown className="w-4 h-4" />
              <span>
                Subscribe Now - ₹{plans.find(p => p.id === selectedPlan)?.price}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;