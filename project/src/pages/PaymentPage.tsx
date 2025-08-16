import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Building, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  code: string;
  price_cents: number;
  currency: string;
  interval_type: string;
}

const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const planCode = searchParams.get('plan') || 'monthly';

  useEffect(() => {
    loadPlan();
    loadRazorpayScript();
  }, [planCode]);

  const loadPlan = async () => {
    try {
      // Mock plans data since backend server may not be running
      const mockPlans = [
        {
          code: 'monthly',
          price_cents: 99900,
          currency: 'INR',
          interval_type: 'month'
        },
        {
          code: 'yearly',
          price_cents: 999900,
          currency: 'INR',
          interval_type: 'year'
        }
      ];
      
      const selectedPlan = plans.find((p: Plan) => p.code === planCode);
      
      /*
      // Uncomment when backend is running
      const response = await fetch('http://localhost:3002/api/plans');
      const plans = await response.json();
      const selectedPlan = plans.find((p: Plan) => p.code === planCode);
      */
      
      if (!selectedPlan) {
        toast.error('Invalid plan selected');
        navigate('/pricing');
        return;
      }
      
      setPlan(selectedPlan);
    } catch (error) {
      console.error('Failed to load plan:', error);
      toast.error('Failed to load plan details');
      navigate('/pricing');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!plan || !user) return;

    setProcessing(true);
    
    try {
      // Create checkout session
      const response = await fetch('http://localhost:3002/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          plan_code: plan.code,
          provider: 'razorpay',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { orderId, amount, currency, razorpayKeyId, userEmail, userName } = await response.json();

      // Open Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: amount,
        currency: currency,
        name: 'Traders Vault',
        description: `${plan.code.charAt(0).toUpperCase() + plan.code.slice(1)} Subscription`,
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#f59e0b',
        },
        method: {
          card: true,
          netbanking: true,
          wallet: true,
          upi: true,
        },
        handler: function (response: any) {
          console.log('Payment successful:', response);
          toast.success('Payment successful! Activating your subscription...');
          
          // Redirect to success page
          setTimeout(() => {
            navigate('/pay/success?plan=' + plan.code);
          }, 2000);
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Plan not found</h1>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-primary-800 rounded-2xl border border-primary-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              Complete Your Subscription
            </h1>
            <p className="text-primary-800">
              {plan.code.charAt(0).toUpperCase() + plan.code.slice(1)} Plan
            </p>
          </div>

          {/* Plan Details */}
          <div className="p-6 border-b border-primary-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-primary-300">Plan</span>
              <span className="text-white font-medium">
                {plan.code.charAt(0).toUpperCase() + plan.code.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-primary-300">Billing</span>
              <span className="text-white font-medium">
                {plan.interval_type === 'month' ? 'Monthly' : 'Yearly'}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-primary-300">Amount</span>
              <span className="text-white font-bold text-xl">
                ₹{(plan.price_cents / 100).toLocaleString()}
              </span>
            </div>

            {plan.code === 'yearly' && savings.amount > 0 && (
              <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-success-400 text-sm">You save</span>
                  <span className="text-success-400 font-bold">
                    ₹{savings.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="p-6 border-b border-primary-700">
            <h3 className="text-white font-medium mb-4">Payment Methods</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary-700 rounded-lg p-3 text-center">
                <CreditCard className="w-6 h-6 text-primary-300 mx-auto mb-1" />
                <span className="text-primary-300 text-xs">Cards</span>
              </div>
              <div className="bg-primary-700 rounded-lg p-3 text-center">
                <Smartphone className="w-6 h-6 text-primary-300 mx-auto mb-1" />
                <span className="text-primary-300 text-xs">UPI</span>
              </div>
              <div className="bg-primary-700 rounded-lg p-3 text-center">
                <Building className="w-6 h-6 text-primary-300 mx-auto mb-1" />
                <span className="text-primary-300 text-xs">Net Banking</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-6 border-b border-primary-700">
            <div className="flex items-center space-x-2 text-primary-300">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Secured by Razorpay • 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6">
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-primary-600 disabled:text-primary-400 text-primary-900 py-4 rounded-lg font-bold text-lg transition-colors mb-4 flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-900"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{(plan.price_cents / 100).toLocaleString()}</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/pricing')}
              className="w-full text-primary-400 hover:text-white transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Pricing</span>
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center mt-6">
          <p className="text-primary-400 text-sm">
            By subscribing, you agree to our{' '}
            <a href="/terms" className="text-gold-400 hover:text-gold-300">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-gold-400 hover:text-gold-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;