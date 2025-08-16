import React, { useState, useEffect } from 'react';
import { Clock, Crown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TrialBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
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
      console.error('Failed to check subscription status:', error);
    }
  };

  // Don't show banner if dismissed, not in trial, or subscription is active
  if (dismissed || !subscriptionStatus || subscriptionStatus.status !== 'trial') {
    return null;
  }

  const daysLeft = subscriptionStatus.daysLeft || 0;
  const isUrgent = daysLeft <= 2;

  return (
    <div className={`relative rounded-lg p-4 mb-6 ${
      isUrgent 
        ? 'bg-danger-500/20 border border-danger-500/30' 
        : 'bg-gold-500/20 border border-gold-500/30'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isUrgent ? 'bg-danger-500/20' : 'bg-gold-500/20'
          }`}>
            {isUrgent ? (
              <Clock className="w-5 h-5 text-danger-400" />
            ) : (
              <Crown className="w-5 h-5 text-gold-400" />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${
              isUrgent ? 'text-danger-400' : 'text-gold-400'
            }`}>
              {daysLeft > 0 
                ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial`
                : 'Your free trial has ended'
              }
            </h3>
            <p className={`text-sm ${
              isUrgent ? 'text-danger-300' : 'text-gold-300'
            }`}>
              {daysLeft > 0 
                ? 'Subscribe now to continue accessing all features'
                : 'Subscribe to regain access to your trading data'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/pricing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isUrgent
                ? 'bg-danger-500 hover:bg-danger-600 text-white'
                : 'bg-gold-500 hover:bg-gold-600 text-primary-900'
            }`}
          >
            {daysLeft > 0 ? 'Upgrade Now' : 'Subscribe'}
          </button>
          
          {daysLeft > 2 && (
            <button
              onClick={() => setDismissed(true)}
              className="p-2 text-primary-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;