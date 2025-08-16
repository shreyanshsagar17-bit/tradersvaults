import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Shield, TrendingUp, Users, Brain, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Plan {
  id: number;
  code: string;
  price_cents: number;
  currency: string;
  interval_type: string;
  active: boolean;
}

const PricingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  useEffect(() => {
    loadPlans();
    calculateTrialDays();
  }, [user]);

  const loadPlans = async () => {
    try {
      // Mock plans data since backend server may not be running
      const mockPlans = [
        {
          id: 1,
          code: 'monthly',
          price_cents: 99900,
          currency: 'INR',
          interval_type: 'month',
          active: true
        },
        {
          id: 2,
          code: 'yearly',
          price_cents: 999900,
          currency: 'INR',
          interval_type: 'year',
          active: true
        }
      ];
      
      setPlans(mockPlans);
      /*
      // Uncomment when backend is running
      const response = await fetch('http://localhost:3002/api/plans');
      const plansData = await response.json();
      setPlans(plansData);
      */
    } catch (error) {
      console.error('Failed to load plans:', error);
      // Set fallback plans if API fails
      setPlans([
        {
          id: 1,
          code: 'monthly',
          price_cents: 99900,
          currency: 'INR',
          interval_type: 'month',
          active: true
        },
        {
          id: 2,
          code: 'yearly',
          price_cents: 999900,
          currency: 'INR',
          interval_type: 'year',
          active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrialDays = () => {
    if (user?.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(user.trialEndsAt);
      const days = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      setTrialDaysLeft(days);
    }
  };

  const handleSubscribe = (planCode: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/pay?plan=${planCode}`);
  };

  const getMonthlyPrice = (plan: Plan) => {
    if (plan.interval_type === 'month') {
      return plan.price_cents / 100;
    }
    return (plan.price_cents / 100) / 12;
  };

  const getSavings = () => {
    const monthlyPlan = plans.find(p => p.code === 'monthly');
    const yearlyPlan = plans.find(p => p.code === 'yearly');
    
    if (monthlyPlan && yearlyPlan) {
      const monthlyTotal = (monthlyPlan.price_cents * 12);
      const yearlySavings = monthlyTotal - yearlyPlan.price_cents;
      const savingsPercent = Math.round((yearlySavings / monthlyTotal) * 100);
      return { amount: yearlySavings / 100, percent: savingsPercent };
    }
    return { amount: 0, percent: 0 };
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Comprehensive trading performance analysis with detailed charts and metrics'
    },
    {
      icon: Calculator,
      title: 'Trading Calculator',
      description: 'Position sizing, risk management, and P&L calculators for all markets'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Machine learning analysis of your trading patterns and optimization suggestions'
    },
    {
      icon: Users,
      title: 'Social Trading',
      description: 'Connect with traders, share strategies, and learn from the community'
    },
    {
      icon: Shield,
      title: 'Broker Integration',
      description: 'Connect multiple brokers for live data and seamless order execution'
    },
    {
      icon: Zap,
      title: 'Real-time Data',
      description: 'Live market data, instant notifications, and real-time portfolio tracking'
    },
  ];

  const savings = getSavings();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your Trading Plan
          </h1>
          <p className="text-xl text-primary-300 max-w-3xl mx-auto">
            Unlock the full potential of your trading with our professional-grade tools and analytics
          </p>
          
          {/* Trial Banner */}
          {isAuthenticated && user?.subscriptionStatus === 'trial' && (
            <div className="mt-8 bg-gold-500/20 border border-gold-500/30 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5 text-gold-400" />
                <span className="text-gold-400 font-medium">
                  {trialDaysLeft > 0 
                    ? `${trialDaysLeft} days left in your free trial`
                    : 'Your trial has ended'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan) => {
            const isYearly = plan.code === 'yearly';
            const monthlyPrice = getMonthlyPrice(plan);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-primary-800 rounded-2xl border-2 p-8 ${
                  isYearly 
                    ? 'border-gold-500 ring-4 ring-gold-500/20' 
                    : 'border-primary-600 hover:border-primary-500'
                } transition-all duration-300`}
              >
                {isYearly && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gold-500 text-primary-900 px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-1">
                      <Crown className="w-4 h-4" />
                      <span>MOST POPULAR</span>
                    </div>
                  </div>
                )}

                {isYearly && savings.percent > 0 && (
                  <div className="absolute -top-4 -right-4">
                    <div className="bg-success-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {savings.percent}% OFF
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.code.charAt(0).toUpperCase() + plan.code.slice(1)}
                  </h3>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-4xl font-bold text-gold-400">
                      ₹{Math.floor(plan.price_cents / 100).toLocaleString()}
                    </span>
                    <span className="text-primary-400">/{plan.interval_type}</span>
                  </div>
                  
                  {isYearly && (
                    <div className="text-primary-300 text-sm">
                      ₹{monthlyPrice.toFixed(0)}/month when billed annually
                    </div>
                  )}
                  
                  {isYearly && savings.amount > 0 && (
                    <div className="text-success-400 text-sm font-medium mt-1">
                      Save ₹{savings.amount.toLocaleString()} per year
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-1 bg-gold-500/20 rounded">
                        <Check className="w-4 h-4 text-gold-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{feature.title}</h4>
                        <p className="text-primary-300 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.code)}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                    isYearly
                      ? 'bg-gold-500 hover:bg-gold-600 text-primary-900 shadow-lg hover:shadow-xl'
                      : 'bg-primary-700 hover:bg-primary-600 text-white border border-primary-600'
                  }`}
                >
                  {isAuthenticated && user?.subscriptionStatus === 'trial' 
                    ? 'Upgrade Now' 
                    : 'Start Free Trial'
                  }
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything You Need to Trade Like a Pro
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <div className="p-3 bg-gold-500/20 rounded-lg w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-primary-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "What's included in the free trial?",
                answer: "Full access to all features for 7 days. No credit card required to start."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay."
              },
              {
                question: "Is my trading data secure?",
                answer: "Absolutely. We use enterprise-grade encryption and never store your broker passwords. Your data is always private and secure."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-primary-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-primary-800 mb-6">
              Join thousands of traders who trust Traders Vault for their trading journey
            </p>
            <button
              onClick={() => handleSubscribe('yearly')}
              className="bg-primary-900 hover:bg-primary-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;