import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, DollarSign, Calendar, PieChart, BarChart3 } from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('6M');
  const [activeTab, setActiveTab] = useState('overview');
  
  const metrics = [
    {
      title: 'Profit Factor',
      value: '2.14',
      description: 'Gross profit / Gross loss',
      icon: TrendingUp,
      color: 'text-success-400',
    },
    {
      title: 'Sharpe Ratio',
      value: '1.82',
      description: 'Risk-adjusted return',
      icon: Target,
      color: 'text-gold-400',
    },
    {
      title: 'Max Drawdown',
      value: '8.5%',
      description: 'Maximum peak-to-trough decline',
      icon: DollarSign,
      color: 'text-danger-400',
    },
    {
      title: 'Average R:R',
      value: '1.9:1',
      description: 'Risk to reward ratio',
      icon: Calendar,
      color: 'text-primary-300',
    },
  ];

  const optionsMetrics = [
    {
      title: 'Total Margin Used',
      value: '₹2,45,000',
      description: 'Cumulative margin utilized',
      icon: DollarSign,
      color: 'text-gold-400',
    },
    {
      title: 'Options Returns',
      value: '₹45,600',
      description: 'Total returns from options',
      icon: TrendingUp,
      color: 'text-success-400',
    },
    {
      title: 'Return on Margin',
      value: '18.6%',
      description: 'Average return on margin',
      icon: Target,
      color: 'text-gold-400',
    },
    {
      title: 'Success Rate',
      value: '72%',
      description: 'Profitable options trades',
      icon: Calendar,
      color: 'text-success-400',
    },
  ];

  // Day of week performance data
  const dayOfWeekData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    datasets: [
      {
        label: 'Average P&L',
        data: [1250, -450, 2100, 850, 1650],
        backgroundColor: [
          '#22c55e', '#ef4444', '#22c55e', '#22c55e', '#22c55e'
        ],
        borderColor: [
          '#16a34a', '#dc2626', '#16a34a', '#16a34a', '#16a34a'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Strategy performance radar chart
  const strategyRadarData = {
    labels: ['Scalping', 'Swing Trading', 'Iron Condor', 'Straddle', 'Covered Call'],
    datasets: [
      {
        label: 'Win Rate %',
        data: [65, 78, 85, 62, 90],
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: '#f59e0b',
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#d97706',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f59e0b'
      }
    ]
  };

  // Trade distribution by day
  const tradeDistributionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Number of Trades',
        data: [12, 8, 15, 10, 18],
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  const equityChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Cumulative P&L',
        data: [0, 2500, 1800, 5200, 8900, 14500],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Drawdown',
        data: [0, -500, -1200, -800, -300, 0],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const monthlyReturnsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Returns',
        data: [2500, -700, 3400, 3700, -600, 5600],
        backgroundColor: [
          '#22c55e', '#ef4444', '#22c55e', '#22c55e', '#ef4444', '#22c55e'
        ],
        borderColor: [
          '#16a34a', '#dc2626', '#16a34a', '#16a34a', '#dc2626', '#16a34a'
        ],
        borderWidth: 1,
      },
    ],
  };

  const symbolBreakdownData = {
    labels: ['EURUSD', 'GBPUSD', 'BTCUSD', 'AAPL', 'TSLA'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          '#f59e0b',
          '#3b82f6',
          '#ef4444',
          '#22c55e',
          '#8b5cf6'
        ],
        borderColor: [
          '#d97706',
          '#2563eb',
          '#dc2626',
          '#16a34a',
          '#7c3aed'
        ],
        borderWidth: 2,
      },
    ],
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'options', label: 'Options Analytics', icon: PieChart },
    { id: 'performance', label: 'Day Performance', icon: Calendar },
    { id: 'strategies', label: 'Strategy Analysis', icon: Target },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-primary-300">Deep dive into your trading performance</p>
        </div>
        <div className="flex items-center space-x-2">
          {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-gold-500 text-primary-900'
                  : 'bg-primary-700 hover:bg-primary-600 text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="flex space-x-1 bg-primary-800 p-1 rounded-lg border border-primary-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gold-500 text-primary-900'
                : 'text-primary-300 hover:text-white hover:bg-primary-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-700 rounded-lg">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <div>
              <p className="text-primary-300 text-sm">{metric.title}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-primary-400 text-xs mt-1">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve with Drawdown */}
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Equity Curve & Drawdown</h3>
          <div className="h-64">
            <Line 
              data={equityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: '#94a3b8',
                      padding: 20,
                    },
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

        {/* Monthly Returns */}
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Returns</h3>
          <div className="h-64">
            <Bar 
              data={monthlyReturnsData}
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

        {/* Trading by Symbol */}
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Trading by Symbol</h3>
          <div className="h-64">
            <Doughnut 
              data={symbolBreakdownData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: '#94a3b8',
                      padding: 15,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Total Trades</span>
              <span className="text-white font-medium">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Winning Trades</span>
              <span className="text-success-400 font-medium">107 (68.6%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Losing Trades</span>
              <span className="text-danger-400 font-medium">49 (31.4%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Average Win</span>
              <span className="text-success-400 font-medium">$485</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Average Loss</span>
              <span className="text-danger-400 font-medium">-$225</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Largest Win</span>
              <span className="text-success-400 font-medium">$2,850</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Largest Loss</span>
              <span className="text-danger-400 font-medium">-$1,200</span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'options' && (
        <>
          {/* Options Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {optionsMetrics.map((metric, index) => (
              <div key={index} className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary-700 rounded-lg">
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-primary-300 text-sm">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                  <p className="text-primary-400 text-xs mt-1">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Options Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Margin Utilization Trend</h3>
              <div className="h-64">
                <Line 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Margin Used',
                        data: [180000, 220000, 195000, 245000, 210000, 235000],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4,
                      },
                    ],
                  }}
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
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                      },
                      y: {
                        grid: { color: '#334155' },
                        ticks: {
                          color: '#94a3b8',
                          callback: function(value) {
                            return '₹' + (value / 1000) + 'K';
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Options Strategy Breakdown</h3>
              <div className="h-64">
                <Doughnut 
                  data={{
                    labels: ['Iron Condor', 'Straddle', 'Covered Call', 'Cash Secured Put', 'Naked Put'],
                    datasets: [
                      {
                        data: [40, 25, 20, 10, 5],
                        backgroundColor: [
                          '#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444'
                        ],
                        borderColor: [
                          '#d97706', '#2563eb', '#16a34a', '#7c3aed', '#dc2626'
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: '#94a3b8',
                          padding: 15,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'performance' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Day of Week Performance */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Performance by Day of Week</h3>
              <div className="h-64">
                <Bar 
                  data={dayOfWeekData}
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
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                      },
                      y: {
                        grid: { color: '#334155' },
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

            {/* Trade Distribution */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Trade Distribution by Day</h3>
              <div className="h-64">
                <Bar 
                  data={tradeDistributionData}
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
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                      },
                      y: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Day Performance Summary */}
          <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-700">
                    <th className="text-left text-primary-300 text-sm font-medium p-3">Day</th>
                    <th className="text-left text-primary-300 text-sm font-medium p-3">Total Trades</th>
                    <th className="text-left text-primary-300 text-sm font-medium p-3">Win Rate</th>
                    <th className="text-left text-primary-300 text-sm font-medium p-3">Avg P&L</th>
                    <th className="text-left text-primary-300 text-sm font-medium p-3">Best Day</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { day: 'Monday', trades: 32, winRate: 68, avgPnL: 1250, best: 3500 },
                    { day: 'Tuesday', trades: 28, winRate: 45, avgPnL: -450, best: 1200 },
                    { day: 'Wednesday', trades: 35, winRate: 78, avgPnL: 2100, best: 4200 },
                    { day: 'Thursday', trades: 30, winRate: 62, avgPnL: 850, best: 2800 },
                    { day: 'Friday', trades: 31, winRate: 71, avgPnL: 1650, best: 3900 },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-primary-700">
                      <td className="p-3 text-white font-medium">{row.day}</td>
                      <td className="p-3 text-primary-200">{row.trades}</td>
                      <td className="p-3">
                        <span className={`font-medium ${row.winRate >= 60 ? 'text-success-400' : 'text-danger-400'}`}>
                          {row.winRate}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${row.avgPnL >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                          ${row.avgPnL.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-success-400 font-medium">${row.best.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'strategies' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Performance Radar */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Strategy Win Rate Analysis</h3>
              <div className="h-64">
                <Radar 
                  data={strategyRadarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      r: {
                        angleLines: {
                          color: '#334155',
                        },
                        grid: {
                          color: '#334155',
                        },
                        pointLabels: {
                          color: '#94a3b8',
                        },
                        ticks: {
                          color: '#94a3b8',
                          backdropColor: 'transparent',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Strategy P&L Breakdown */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Strategy P&L Breakdown</h3>
              <div className="space-y-4">
                {[
                  { strategy: 'Iron Condor', pnl: 15600, trades: 24, winRate: 85 },
                  { strategy: 'Scalping', pnl: 8900, trades: 45, winRate: 65 },
                  { strategy: 'Swing Trading', pnl: 12400, trades: 18, winRate: 78 },
                  { strategy: 'Straddle', pnl: -2100, trades: 12, winRate: 42 },
                  { strategy: 'Covered Call', pnl: 6800, trades: 15, winRate: 90 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-primary-700 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{item.strategy}</h4>
                      <p className="text-primary-400 text-sm">{item.trades} trades • {item.winRate}% win rate</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${item.pnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                        {item.pnl >= 0 ? '+' : ''}${item.pnl.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;