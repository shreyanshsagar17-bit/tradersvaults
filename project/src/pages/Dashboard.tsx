import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Award, Calendar, Plus, Users, MessageCircle, Filter, Clock, Trophy } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { tradeService, groupService, activityService } from '../services/api';
import { brokerService, BROKERS } from '../services/brokerService';
import TradingCalendar from '../components/calendar/TradingCalendar';
import SubscriptionModal from '../components/subscription/SubscriptionModal';
import TradeModal from '../components/trades/TradeModal';
import LiveMarketData from '../components/trading/LiveMarketData';
import OrderPlacement from '../components/trading/OrderPlacement';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import TrialBanner from '../components/subscription/TrialBanner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [groupTrades, setGroupTrades] = useState([]);
  const [brokerConnections, setBrokerConnections] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupFilters, setGroupFilters] = useState({
    instrument: '',
    dateFrom: '',
    dateTo: '',
  });
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showOrderPlacement, setShowOrderPlacement] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [trialDaysLeft] = useState(3); // Mock trial days

  useEffect(() => {
    loadTrades();
    loadGroups();
    loadActivities();
    loadBrokerConnections();
    
    // Check subscription status
    if (trialDaysLeft <= 0) {
      setShowSubscriptionModal(true);
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupTrades();
    }
  }, [selectedGroup, groupFilters]);

  const loadTrades = async () => {
    try {
      const tradesData = await tradeService.getTrades();
      setTrades(tradesData);
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await groupService.getUserGroups();
      setGroups(groupsData);
      if (groupsData.length > 0) {
        setSelectedGroup(groupsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const activitiesData = await activityService.getRecentActivity();
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const loadBrokerConnections = async () => {
    try {
      const connections = await brokerService.getUserConnections();
      setBrokerConnections(connections);
    } catch (error) {
      console.error('Failed to load broker connections:', error);
      setBrokerConnections([]);
    }
  };

  const loadGroupTrades = async () => {
    if (!selectedGroup) return;
    
    try {
      const tradesData = await groupService.getGroupTrades(selectedGroup, groupFilters);
      setGroupTrades(tradesData);
    } catch (error) {
      console.error('Failed to load group trades:', error);
    }
  };

  const handleSubscribe = (plan: string) => {
    console.log('Subscribing to plan:', plan);
    // Implement subscription logic
    setShowSubscriptionModal(false);
  };

  const handleAddTrade = async (tradeData: any) => {
    try {
      const newTrade = await tradeService.addTrade(tradeData);
      setTrades([newTrade, ...trades]);
      setShowTradeModal(false);
    } catch (error) {
      console.error('Failed to add trade:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await groupService.joinGroup(groupId);
      // Refresh groups after joining
      loadGroups();
    } catch (error) {
      console.error('Failed to join group:', error);
      toast.error('Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await groupService.leaveGroup(groupId);
      // Refresh groups after leaving
      loadGroups();
    } catch (error) {
      console.error('Failed to leave group:', error);
      toast.error('Failed to leave group');
    }
  };

  // Calculate today's performance
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter((trade: any) => 
    trade.entryDate.startsWith(today) || trade.exitDate?.startsWith(today)
  );
  const todayPnL = todayTrades.reduce((sum: number, trade: any) => sum + (trade.pnl || 0), 0);
  const todayWinRate = todayTrades.length > 0 
    ? (todayTrades.filter((trade: any) => (trade.pnl || 0) > 0).length / todayTrades.length) * 100 
    : 0;

  // Bull Badge Progress Calculation
  const calculateBullProgress = (badge: any, equity: number, threshold: number) => {
    if (!badge?.startedOn) return { progress: 0, daysCompleted: 0, eligible: false };
    
    const startDate = new Date(badge.startedOn);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysCompleted = Math.min(daysElapsed, 365);
    const progress = (daysCompleted / 365) * 100;
    const eligible = equity >= threshold && daysCompleted >= 365 && !badge.claimedOn;
    
    return { progress, daysCompleted, eligible };
  };

  const bullINRProgress = calculateBullProgress(user?.bullBadgeINR, user?.equityINR || 0, 100000);
  const bullUSDProgress = calculateBullProgress(user?.bullBadgeUSD, user?.equityUSD || 0, 100000);

  const stats = [
    {
      title: 'Total P&L',
      value: `$${user?.tradingStats.totalPnL.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Win Rate',
      value: `${user?.tradingStats.winRate}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: Target,
    },
    {
      title: 'Total Trades',
      value: user?.tradingStats.totalTrades.toString(),
      change: '+8',
      changeType: 'neutral' as const,
      icon: Award,
    },
    {
      title: 'This Month',
      value: '$3,250',
      change: '+18.2%',
      changeType: 'positive' as const,
      icon: Calendar,
    },
  ];

  const optionsStats = [
    {
      title: 'Options P&L',
      value: '₹45,600',
      change: '+22.3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Margin Used',
      value: '₹2,45,000',
      change: 'Current',
      changeType: 'neutral' as const,
      icon: Target,
    },
  ];

  const equityChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Account Balance',
        data: [10000, 12500, 11800, 15200, 18900, 24500],
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const profitLossData = {
    labels: ['Winning Trades', 'Losing Trades'],
    datasets: [
      {
        data: [68.5, 31.5],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderColor: ['#16a34a', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      <TrialBanner />

      {/* Trial Warning */}
      {trialDaysLeft <= 3 && trialDaysLeft > 0 && (
        <div className="bg-gold-500/20 border border-gold-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gold-400 font-medium">
                {trialDaysLeft} days left in your free trial
              </h3>
              <p className="text-gold-300 text-sm">
                Subscribe now to continue accessing all features
              </p>
            </div>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Bull Badge Progress */}
      {(bullINRProgress.progress > 0 || bullUSDProgress.progress > 0) && (
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-6 h-6 text-gold-400" />
            <h3 className="text-gold-400 font-medium">Bull Trader Badge Progress</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bullINRProgress.progress > 0 && (
              <div className="bg-primary-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">INR Segment</span>
                  <span className="text-gold-400">₹{user?.equityINR?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-primary-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gold-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(bullINRProgress.progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-primary-300 text-sm">
                  {bullINRProgress.daysCompleted}/365 days • {bullINRProgress.progress.toFixed(1)}% complete
                </p>
                {bullINRProgress.eligible && (
                  <button className="mt-2 bg-gold-500 hover:bg-gold-600 text-primary-900 px-3 py-1 rounded text-sm font-medium">
                    Claim {user?.gender === 'female' ? 'Ms' : 'Mr'} Bull Badge
                  </button>
                )}
              </div>
            )}
            
            {bullUSDProgress.progress > 0 && (
              <div className="bg-primary-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">USD Segment</span>
                  <span className="text-gold-400">${user?.equityUSD?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-primary-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gold-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(bullUSDProgress.progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-primary-300 text-sm">
                  {bullUSDProgress.daysCompleted}/365 days • {bullUSDProgress.progress.toFixed(1)}% complete
                </p>
                {bullUSDProgress.eligible && (
                  <button className="mt-2 bg-gold-500 hover:bg-gold-600 text-primary-900 px-3 py-1 rounded text-sm font-medium">
                    Claim {user?.gender === 'female' ? 'Ms' : 'Mr'} Bull Badge
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-primary-300">Welcome back, {user?.name}</p>
        </div>
        <button 
          onClick={() => setShowTradeModal(true)}
          className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gold-500/20 rounded-lg">
                <stat.icon className="w-5 h-5 text-gold-400" />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-success-400' :
                stat.changeType === 'negative' ? 'text-danger-400' :
                'text-primary-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-primary-300 text-sm">{stat.title}</p>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
        
        {/* Options Stats */}
        {optionsStats.map((stat, index) => (
          <div key={`options-${index}`} className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gold-500/20 rounded-lg">
                <stat.icon className="w-5 h-5 text-gold-400" />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-success-400' :
                stat.changeType === 'negative' ? 'text-danger-400' :
                'text-primary-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-primary-300 text-sm">{stat.title}</p>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connected Brokers */}
        {brokerConnections.length > 0 && (
          <div className="bg-primary-800 rounded-lg border border-primary-700">
            <div className="p-4 border-b border-primary-700">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-success-400" />
                <h3 className="text-white font-medium">Connected Brokers</h3>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {brokerConnections.slice(0, 3).map((connection: any) => {
                  const broker = BROKERS.find(b => b.id === connection.brokerId);
                  return (
                    <div key={connection.id} className="flex items-center space-x-3 p-2 bg-primary-700 rounded">
                      <img
                        src={broker?.logo}
                        alt={broker?.displayName}
                        className="w-8 h-8 rounded object-contain bg-white p-1"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${broker?.displayName}&background=1e293b&color=ffffff&size=32`;
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{broker?.displayName}</p>
                        <p className="text-success-400 text-xs">Connected</p>
                      </div>
                      <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                    </div>
                  );
                })}
                {brokerConnections.length > 3 && (
                  <div className="text-center">
                    <span className="text-primary-400 text-sm">+{brokerConnections.length - 3} more</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trading Groups */}
        <div className="bg-primary-800 rounded-lg border border-primary-700">
          <div className="p-4 border-b border-primary-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-medium">Trading Groups</h3>
              </div>
              <select
                value={selectedGroup || ''}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-primary-700 border border-primary-600 rounded px-2 py-1 text-white text-sm"
              >
                {groups.map((group: any) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="p-4">
            {/* Group Filters */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <input
                type="text"
                placeholder="Instrument"
                value={groupFilters.instrument}
                onChange={(e) => setGroupFilters({...groupFilters, instrument: e.target.value})}
                className="bg-primary-700 border border-primary-600 rounded px-2 py-1 text-white text-xs"
              />
              <input
                type="date"
                value={groupFilters.dateFrom}
                onChange={(e) => setGroupFilters({...groupFilters, dateFrom: e.target.value})}
                className="bg-primary-700 border border-primary-600 rounded px-2 py-1 text-white text-xs"
              />
              <input
                type="date"
                value={groupFilters.dateTo}
                onChange={(e) => setGroupFilters({...groupFilters, dateTo: e.target.value})}
                className="bg-primary-700 border border-primary-600 rounded px-2 py-1 text-white text-xs"
              />
            </div>
            
            {/* Group Trades */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {groupTrades.map((trade: any) => (
                <div key={trade.id} className="flex items-center justify-between p-2 bg-primary-700 rounded">
                  <div className="flex items-center space-x-2">
                    <img src={trade.user.avatar} alt={trade.user.name} className="w-6 h-6 rounded-full" />
                    <span className="text-white text-sm">{trade.symbol}</span>
                  </div>
                  <span className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${trade.pnl.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-primary-800 rounded-lg border border-primary-700">
          <div className="p-4 border-b border-primary-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-medium">Recent Activity</h3>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {activities.map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-2">
                  <img src={activity.user.avatar} alt={activity.user.name} className="w-6 h-6 rounded-full" />
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.user.name}</span>
                      {activity.type === 'trade_add' && ' added a trade'}
                      {activity.type === 'follow' && ' started following you'}
                      {activity.type === 'like' && ' liked your post'}
                    </p>
                    <p className="text-primary-400 text-xs">
                      {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Performance */}
        <div className="bg-primary-800 rounded-lg border border-primary-700">
          <div className="p-4 border-b border-primary-700">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium">Today's Performance</h3>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-primary-400 text-xs">P&L</p>
                <p className={`text-lg font-bold ${todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-primary-400 text-xs">Win Rate</p>
                <p className="text-white text-lg font-bold">{todayWinRate.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-primary-400 text-xs">Trades</p>
                <p className="text-white text-lg font-bold">{todayTrades.length}</p>
              </div>
              <div>
                <p className="text-primary-400 text-xs">Timezone</p>
                <p className="text-white text-sm">{user?.timezone || 'UTC'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Market Data */}
        <div className="lg:col-span-3">
          <LiveMarketData 
            onSymbolSelect={(symbol) => {
              setSelectedSymbol(symbol);
              setShowOrderPlacement(true);
            }}
          />
        </div>
        
        {/* Equity Curve */}
        <div className="lg:col-span-2 bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
          <div className="h-64">
            <Line 
              data={equityChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: '#334155',
                    },
                    ticks: {
                      color: '#94a3b8',
                    },
                  },
                  y: {
                    grid: {
                      color: '#334155',
                    },
                    ticks: {
                      color: '#94a3b8',
                      callback: function(value) {
                        return '$' + value.toLocaleString();
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Win/Loss Ratio */}
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Win/Loss Ratio</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={profitLossData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#94a3b8',
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Trading Calendar */}
      <TradingCalendar />

      {/* Recent Trades */}
      <div className="bg-primary-800 rounded-lg border border-primary-700">
        <div className="p-6 border-b border-primary-700">
          <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-700">
                <th className="text-left text-primary-300 text-sm font-medium p-4">Symbol</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Type</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Side</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Entry</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Exit</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">P&L</th>
                <th className="text-left text-primary-300 text-sm font-medium p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 5).map((trade: any, index) => (
                <tr key={trade.id} className="border-b border-primary-700 hover:bg-primary-700/30 transition-colors">
                  <td className="p-4 font-medium text-white">{trade.symbol}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.type === 'option' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {trade.type === 'option' ? 'Option' : 'Stock'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.side === 'long' ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'
                    }`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-primary-200">{trade.entryPrice}</td>
                  <td className="p-4 text-primary-200">{trade.exitPrice || '-'}</td>
                  <td className="p-4">
                    <span className={`font-medium ${
                      trade.pnl >= 0 ? 'text-success-400' : 'text-danger-400'
                    }`}>
                      ${trade.pnl?.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.status === 'closed' ? 'bg-primary-600 text-primary-200' : 'bg-gold-500/20 text-gold-400'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handleSubscribe}
          trialDaysLeft={trialDaysLeft}
        />
      )}

      {/* Trade Modal */}
      {showTradeModal && (
        <TradeModal
          onClose={() => setShowTradeModal(false)}
          onSave={handleAddTrade}
        />
      )}
    </div>
  );
};

export default Dashboard;