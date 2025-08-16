import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const planCode = searchParams.get('plan') || 'monthly';

  useEffect(() => {
    // Wait a moment for webhook to process, then check status
    const timer = setTimeout(() => {
      checkSubscriptionStatus();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const status = await response.json();
        setSubscriptionStatus(status);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanDisplayName = (code: string) => {
    return code.charAt(0).toUpperCase() + code.slice(1);
  };

  const getPlanPrice = (code: string) => {
    const prices = {
      monthly: 999,
      yearly: 9999,
    };
    return prices[code as keyof typeof prices] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-white">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-primary-800 rounded-2xl border border-primary-700 overflow-hidden text-center">
          {/* Success Icon */}
          <div className="bg-gradient-to-r from-success-500 to-success-600 p-8">
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-success-100">
              Welcome to Traders Vault Pro
            </p>
          </div>

          {/* Subscription Details */}
          <div className="p-6">
            <div className="bg-primary-700 rounded-lg p-4 mb-6">
              <h2 className="text-white font-semibold mb-4">Subscription Details</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-300">Plan</span>
                  <span className="text-white font-medium">{getPlanDisplayName(planCode)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-primary-300">Amount Paid</span>
                  <span className="text-white font-medium">₹{getPlanPrice(planCode).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-primary-300">Billing Cycle</span>
                  <span className="text-white font-medium">
                    {planCode === 'monthly' ? 'Monthly' : 'Yearly'}
                  </span>
                </div>
                
                {subscriptionStatus?.planRenewsAt && (
                  <div className="flex justify-between">
                    <span className="text-primary-300">Next Billing</span>
                    <span className="text-white font-medium">
                      {new Date(subscriptionStatus.planRenewsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* What's Next */}
            <div className="text-left mb-6">
              <h3 className="text-white font-semibold mb-3">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-900 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Access Your Dashboard</p>
                    <p className="text-primary-400 text-xs">Start tracking your trades with full access</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-900 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Connect Your Brokers</p>
                    <p className="text-primary-400 text-xs">Link your trading accounts for live data</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-900 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Join the Community</p>
                    <p className="text-primary-400 text-xs">Connect with other traders and share insights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gold-500 hover:bg-gold-600 text-primary-900 py-3 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => navigate('/brokers')}
                className="w-full bg-primary-700 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Connect Brokers
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-primary-700/50 p-4">
            <div className="flex items-center justify-center space-x-2 text-primary-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Payment processed securely by Razorpay</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-6">
          <p className="text-primary-400 text-sm">
            Need help? Contact us at{' '}
            <a href="mailto:support@tradersvaul.com" className="text-gold-400 hover:text-gold-300">
              support@tradersvaul.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;