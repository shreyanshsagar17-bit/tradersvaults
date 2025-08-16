import React, { useState, useEffect } from 'react';
import { Users, Crown, AlertTriangle, CheckCircle, DollarSign, Edit3, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface SubscriptionUser {
  id: string;
  email: string;
  name: string;
  subscription_status: string;
  current_plan: string;
  trial_ends_at: string;
  plan_renews_at: string;
  created_at: string;
}

const AdminSubscriptions: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<SubscriptionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricing, setPricing] = useState({
    monthly_price: 999,
    yearly_price: 9999,
  });

  useEffect(() => {
    if (user?.isAdmin) {
      loadSubscriptions();
    }
  }, [filter, page, user]);

  const loadSubscriptions = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`http://localhost:3002/api/admin/subscriptions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePricing = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/admin/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(pricing),
      });

      if (response.ok) {
        toast.success('Pricing updated successfully');
        setShowPricingModal(false);
      } else {
        throw new Error('Failed to update pricing');
      }
    } catch (error) {
      console.error('Pricing update error:', error);
      toast.error('Failed to update pricing');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      trial: { bg: 'bg-gold-500/20', text: 'text-gold-400', label: 'Trial' },
      active: { bg: 'bg-success-500/20', text: 'text-success-400', label: 'Active' },
      past_due: { bg: 'bg-danger-500/20', text: 'text-danger-400', label: 'Past Due' },
      canceled: { bg: 'bg-primary-500/20', text: 'text-primary-400', label: 'Canceled' },
      none: { bg: 'bg-primary-500/20', text: 'text-primary-400', label: 'No Plan' },
    };
    
    const config = configs[status as keyof typeof configs] || configs.none;
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const stats = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      icon: Users,
      color: 'text-blue-400',
    },
    {
      title: 'Active Subscriptions',
      value: users.filter(u => u.subscription_status === 'active').length.toString(),
      icon: CheckCircle,
      color: 'text-success-400',
    },
    {
      title: 'Trial Users',
      value: users.filter(u => u.subscription_status === 'trial').length.toString(),
      icon: Crown,
      color: 'text-gold-400',
    },
    {
      title: 'Past Due',
      value: users.filter(u => u.subscription_status === 'past_due').length.toString(),
      icon: AlertTriangle,
      color: 'text-danger-400',
    },
  ];

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-primary-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
          <p className="text-primary-300">Manage user subscriptions and pricing</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPricingModal(true)}
            className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Update Pricing</span>
          </button>
          <button
            onClick={loadSubscriptions}
            className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-700 rounded-lg">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-primary-300 text-sm">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
        <div className="flex items-center space-x-4">
          <span className="text-primary-300 font-medium">Filter by status:</span>
          {['all', 'trial', 'active', 'past_due', 'canceled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-gold-500 text-primary-900'
                  : 'bg-primary-700 hover:bg-primary-600 text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-primary-800 rounded-lg border border-primary-700">
        <div className="p-6 border-b border-primary-700">
          <h2 className="text-lg font-semibold text-white">Users ({total})</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-700">
                  <th className="text-left text-primary-300 text-sm font-medium p-4">User</th>
                  <th className="text-left text-primary-300 text-sm font-medium p-4">Status</th>
                  <th className="text-left text-primary-300 text-sm font-medium p-4">Plan</th>
                  <th className="text-left text-primary-300 text-sm font-medium p-4">Trial/Renewal</th>
                  <th className="text-left text-primary-300 text-sm font-medium p-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-primary-700 hover:bg-primary-700/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-primary-400 text-sm">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.subscription_status)}
                    </td>
                    <td className="p-4">
                      <span className="text-white">
                        {user.current_plan ? user.current_plan.charAt(0).toUpperCase() + user.current_plan.slice(1) : '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {user.subscription_status === 'trial' && user.trial_ends_at && (
                          <p className="text-gold-400">
                            Trial ends: {new Date(user.trial_ends_at).toLocaleDateString()}
                          </p>
                        )}
                        {user.subscription_status === 'active' && user.plan_renews_at && (
                          <p className="text-success-400">
                            Renews: {new Date(user.plan_renews_at).toLocaleDateString()}
                          </p>
                        )}
                        {user.subscription_status === 'past_due' && user.plan_renews_at && (
                          <p className="text-danger-400">
                            Due: {new Date(user.plan_renews_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-primary-200 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pricing Update Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-800 rounded-lg border border-primary-700 w-full max-w-md mx-4">
            <div className="p-6 border-b border-primary-700">
              <h3 className="text-lg font-semibold text-white">Update Pricing</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Monthly Price (₹)
                </label>
                <input
                  type="number"
                  value={pricing.monthly_price}
                  onChange={(e) => setPricing({ ...pricing, monthly_price: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Yearly Price (₹)
                </label>
                <input
                  type="number"
                  value={pricing.yearly_price}
                  onChange={(e) => setPricing({ ...pricing, yearly_price: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              
              <div className="bg-primary-700 rounded-lg p-3">
                <p className="text-primary-300 text-sm">
                  Yearly savings: ₹{((pricing.monthly_price * 12) - pricing.yearly_price).toLocaleString()}
                  ({Math.round(((pricing.monthly_price * 12 - pricing.yearly_price) / (pricing.monthly_price * 12)) * 100)}% off)
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-primary-700 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowPricingModal(false)}
                className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePricing}
                className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Update Pricing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;