import React, { useState, useEffect } from 'react';
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const status = await response.json();
        setSubscriptionStatus(status);
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You\'ll lose access at the end of your current billing period.')) {
      return;
    }

    setCanceling(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        toast.success('Subscription canceled successfully');
        await loadSubscriptionStatus();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-400';
      case 'trial': return 'text-gold-400';
      case 'past_due': return 'text-danger-400';
      case 'canceled': return 'text-primary-400';
      default: return 'text-primary-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-success-400" />;
      case 'trial': return <Crown className="w-5 h-5 text-gold-400" />;
      case 'past_due': return <AlertTriangle className="w-5 h-5 text-danger-400" />;
      case 'canceled': return <AlertTriangle className="w-5 h-5 text-primary-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-primary-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
          <p className="text-primary-300">Manage your Traders Vault subscription</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="lg:col-span-2 bg-primary-800 rounded-lg border border-primary-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              {getStatusIcon(subscriptionStatus?.status)}
              <div>
                <h2 className="text-xl font-semibold text-white">Current Plan</h2>
                <p className={`text-sm ${getStatusColor(subscriptionStatus?.status)}`}>
                  {subscriptionStatus?.status?.charAt(0).toUpperCase() + subscriptionStatus?.status?.slice(1)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {subscriptionStatus?.status === 'trial' && (
                <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-gold-400" />
                    <span className="text-gold-400 font-medium">Free Trial</span>
                  </div>
                  <p className="text-white">
                    {subscriptionStatus.daysLeft > 0 
                      ? `${subscriptionStatus.daysLeft} days remaining`
                      : 'Trial has ended'
                    }
                  </p>
                  {subscriptionStatus.trialEndsAt && (
                    <p className="text-primary-300 text-sm">
                      Ends: {new Date(subscriptionStatus.trialEndsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {subscriptionStatus?.status === 'active' && (
                <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success-400" />
                    <span className="text-success-400 font-medium">
                      {subscriptionStatus.currentPlan?.charAt(0).toUpperCase() + subscriptionStatus.currentPlan?.slice(1)} Plan
                    </span>
                  </div>
                  <p className="text-white">
                    Active subscription with full access
                  </p>
                  {subscriptionStatus.planRenewsAt && (
                    <p className="text-primary-300 text-sm">
                      Renews: {new Date(subscriptionStatus.planRenewsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {subscriptionStatus?.status === 'canceled' && (
                <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-danger-400" />
                    <span className="text-danger-400 font-medium">Subscription Canceled</span>
                  </div>
                  <p className="text-white">
                    Access until {subscriptionStatus.planRenewsAt ? new Date(subscriptionStatus.planRenewsAt).toLocaleDateString() : 'end of period'}
                  </p>
                </div>
              )}

              {subscriptionStatus?.status === 'past_due' && (
                <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-danger-400" />
                    <span className="text-danger-400 font-medium">Payment Past Due</span>
                  </div>
                  <p className="text-white">
                    Please update your payment method to continue service
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-primary-700">
              <div className="flex items-center space-x-4">
                {subscriptionStatus?.status === 'trial' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Upgrade Now
                  </button>
                )}

                {subscriptionStatus?.status === 'active' && (
                  <>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="bg-primary-700 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Change Plan
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      className="bg-danger-600 hover:bg-danger-700 disabled:bg-primary-600 disabled:text-primary-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      {canceling ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  </>
                )}

                {(subscriptionStatus?.status === 'past_due' || subscriptionStatus?.status === 'canceled') && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Resubscribe
                  </button>
                )}

                <button
                  onClick={loadSubscriptionStatus}
                  className="p-3 text-primary-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-primary-800 rounded-lg border border-primary-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-700 rounded">
                <div>
                  <p className="text-white font-medium">Monthly Plan</p>
                  <p className="text-primary-400 text-sm">Jan 20, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-success-400 font-medium">₹999</p>
                  <p className="text-primary-400 text-sm">Paid</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary-700 rounded">
                <div>
                  <p className="text-white font-medium">Free Trial</p>
                  <p className="text-primary-400 text-sm">Jan 13, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-gold-400 font-medium">₹0</p>
                  <p className="text-primary-400 text-sm">Trial</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-primary-700 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-colors">
              View All Invoices
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 bg-primary-800 rounded-lg border border-primary-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-primary-300 font-medium mb-2">Billing Questions</h4>
              <p className="text-primary-400 text-sm mb-3">
                Have questions about your subscription or billing? We're here to help.
              </p>
              <a
                href="mailto:billing@tradersvaul.com"
                className="text-gold-400 hover:text-gold-300 text-sm"
              >
                billing@tradersvaul.com
              </a>
            </div>
            <div>
              <h4 className="text-primary-300 font-medium mb-2">Technical Support</h4>
              <p className="text-primary-400 text-sm mb-3">
                Need help with features or having technical issues?
              </p>
              <a
                href="mailto:support@tradersvaul.com"
                className="text-gold-400 hover:text-gold-300 text-sm"
              >
                support@tradersvaul.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;