import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { differenceInDays } from 'date-fns';

interface SubscriptionGuardProps {
  children: ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No need to fetch subscription status separately since it's in user object
    setLoading(false);
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has active trial or subscription
  const now = new Date();
  const hasActiveTrial = user?.trialEndsAt && new Date(user.trialEndsAt) > now;
  const hasActiveSubscription = user?.subscriptionStatus === 'active' && 
    user?.subscription?.endDate && new Date(user.subscription.endDate) > now;

  // Allow access if user has active subscription or trial
  if (hasActiveTrial || hasActiveSubscription) {
    return <>{children}</>;
  }

  // Redirect to pricing if trial/subscription expired
  return <Navigate to="/pricing" replace />;
};

export default SubscriptionGuard;