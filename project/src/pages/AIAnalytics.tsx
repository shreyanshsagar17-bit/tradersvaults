import React, { useState } from 'react';
import { Brain, TrendingUp, AlertCircle, Lightbulb, BarChart3, Target, Send, Clock, Filter } from 'lucide-react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { aiService } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AIAnalytics: React.FC = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState('performance');
  const [question, setQuestion] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    ticker: '',
    strategy: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [questionHistory, setQuestionHistory] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  React.useEffect(() => {
    loadQuestionHistory();
  }, []);

  const loadQuestionHistory = async () => {
    try {
      const history = await aiService.getQuestionHistory();
      setQuestionHistory(history);
    } catch (error) {
      console.error('Failed to load question history:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const answer = await aiService.askQuestion(question, filters);
      setCurrentAnswer(answer);
      setQuestionHistory([answer, ...questionHistory]);
      setQuestion('');
      toast.success('AI analysis completed!');
    } catch (error) {
      console.error('Failed to ask question:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const performanceInsights = [
    {
      type: 'success',
      title: 'Strong Performance on Wednesdays',
      description: 'Your win rate on Wednesdays is 78%, significantly higher than other days.',
      recommendation: 'Consider increasing position sizes on Wednesday trades.',
      confidence: 92,
    },
    {
      type: 'warning',
      title: 'Overtrading Pattern Detected',
      description: 'You tend to make 40% more trades after losing days, with lower success rates.',
      recommendation: 'Implement a cooling-off period after significant losses.',
      confidence: 87,
    },
    {
      type: 'info',
      title: 'Options Strategy Optimization',
      description: 'Your Iron Condor strategy shows 15% better performance in low volatility environments.',
      recommendation: 'Focus on Iron Condors when VIX is below 20.',
      confidence: 84,
    },
  ];

  const riskAnalysis = {
    labels: ['Position Sizing', 'Risk Management', 'Diversification', 'Timing', 'Strategy Selection'],
    datasets: [
      {
        label: 'Current Score',
        data: [85, 72, 68, 91, 79],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: '#22c55e',
        pointBackgroundColor: '#22c55e',
      },
      {
        label: 'Optimal Score',
        data: [90, 85, 80, 95, 88],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6',
      }
    ]
  };

  const predictionData = {
    labels: ['Next Week', 'Next 2 Weeks', 'Next Month', 'Next Quarter'],
    datasets: [
      {
        label: 'Predicted P&L',
        data: [2500, 4800, 9200, 28500],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
      },
      {
        label: 'Conservative Estimate',
        data: [1800, 3200, 6500, 19000],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: '#9ca3af',
      }
    ]
  };

  const analysisTypes = [
    { id: 'ask-ai', label: 'Ask AI', icon: Brain },
    { id: 'performance', label: 'Performance Analysis', icon: TrendingUp },
    { id: 'risk', label: 'Risk Assessment', icon: AlertCircle },
    { id: 'predictions', label: 'AI Predictions', icon: Brain },
    { id: 'optimization', label: 'Strategy Optimization', icon: Target },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Analytics</h1>
              <p className="text-primary-300">Advanced insights powered by machine learning</p>
            </div>
          </div>
        </div>

        {/* Analysis Type Selector */}
        <div className="flex space-x-1 bg-primary-800 p-1 rounded-lg border border-primary-700">
          {analysisTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedAnalysis(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAnalysis === type.id
                  ? 'bg-green-500 text-white'
                  : 'text-primary-300 hover:text-white hover:bg-primary-700'
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {selectedAnalysis === 'ask-ai' && (
          <div className="space-y-6">
            {/* Ask AI Question */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-green-400" />
                <span>Ask AI a Question</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about your trading performance, strategies, or get insights..."
                      rows={3}
                      className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 rounded-lg transition-colors ${
                        showFilters ? 'bg-green-500 text-white' : 'bg-primary-700 text-primary-300 hover:text-white'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAskQuestion}
                      disabled={!question.trim() || isLoading}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-primary-600 disabled:text-primary-400 text-white p-2 rounded-lg transition-colors"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-primary-700 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-primary-300 mb-1">Date From</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                        className="w-full px-2 py-1 bg-primary-600 border border-primary-500 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-300 mb-1">Date To</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                        className="w-full px-2 py-1 bg-primary-600 border border-primary-500 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-300 mb-1">Ticker</label>
                      <input
                        type="text"
                        value={filters.ticker}
                        onChange={(e) => setFilters({...filters, ticker: e.target.value})}
                        placeholder="AAPL, EURUSD..."
                        className="w-full px-2 py-1 bg-primary-600 border border-primary-500 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-300 mb-1">Strategy</label>
                      <input
                        type="text"
                        value={filters.strategy}
                        onChange={(e) => setFilters({...filters, strategy: e.target.value})}
                        placeholder="Scalping, Swing..."
                        className="w-full px-2 py-1 bg-primary-600 border border-primary-500 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Current Answer */}
            {currentAnswer && (
              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">AI Response</h3>
                  <span className="text-xs text-primary-400">
                    {format(new Date(currentAnswer.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-green-400 font-medium mb-2">Question:</h4>
                    <p className="text-primary-200 bg-primary-700 p-3 rounded">{currentAnswer.question}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-green-400 font-medium mb-2">Answer:</h4>
                    <p className="text-white leading-relaxed">{currentAnswer.answer}</p>
                  </div>
                  
                  {currentAnswer.sources && currentAnswer.sources.length > 0 && (
                    <div>
                      <h4 className="text-green-400 font-medium mb-2">Sources:</h4>
                      <ul className="list-disc list-inside text-primary-200 space-y-1">
                        {currentAnswer.sources.map((source: string, index: number) => (
                          <li key={index}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentAnswer.limitations && currentAnswer.limitations.length > 0 && (
                    <div>
                      <h4 className="text-yellow-400 font-medium mb-2">Limitations:</h4>
                      <ul className="list-disc list-inside text-primary-300 space-y-1 text-sm">
                        {currentAnswer.limitations.map((limitation: string, index: number) => (
                          <li key={index}>{limitation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Question History */}
            {questionHistory.length > 0 && (
              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Question History</h3>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questionHistory.map((item: any) => (
                    <div key={item.id} className="border-l-2 border-green-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium text-sm">{item.question}</p>
                        <span className="text-xs text-primary-400">
                          {format(new Date(item.createdAt), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-primary-300 text-sm line-clamp-2">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedAnalysis === 'performance' && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-green-400" />
                <span>AI-Generated Insights</span>
              </h2>
              
              <div className="space-y-4">
                {performanceInsights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    insight.type === 'success' ? 'bg-success-500/10 border-success-500/30' :
                    insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-medium ${
                        insight.type === 'success' ? 'text-success-400' :
                        insight.type === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>
                        {insight.title}
                      </h3>
                      <span className="text-xs text-primary-400 bg-primary-700 px-2 py-1 rounded">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-primary-200 text-sm mb-2">{insight.description}</p>
                    <p className="text-primary-300 text-sm font-medium">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Trends */}
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Trend Analysis</h3>
              <div className="h-64">
                <Line 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Actual Performance',
                        data: [2500, 1800, 5200, 8900, 6500, 14500],
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true,
                      },
                      {
                        label: 'AI Predicted',
                        data: [2200, 2100, 4800, 8200, 7100, 13800],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderDash: [5, 5],
                        fill: false,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: '#94a3b8' }
                      }
                    },
                    scales: {
                      x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                      y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {selectedAnalysis === 'risk' && (
          <div className="space-y-6">
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment Radar</h3>
              <div className="h-64">
                <Radar 
                  data={riskAnalysis}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: '#94a3b8' }
                      }
                    },
                    scales: {
                      r: {
                        angleLines: { color: '#334155' },
                        grid: { color: '#334155' },
                        pointLabels: { color: '#94a3b8' },
                        ticks: { color: '#94a3b8', backdropColor: 'transparent' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <h4 className="text-white font-medium mb-3">Risk Recommendations</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-danger-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-primary-200 text-sm">Reduce position size by 15% to optimize risk-reward ratio</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-primary-200 text-sm">Diversify across more asset classes to reduce correlation risk</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-success-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-primary-200 text-sm">Your stop-loss discipline is excellent - maintain current approach</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <h4 className="text-white font-medium mb-3">Risk Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-primary-300">Sharpe Ratio</span>
                    <span className="text-success-400 font-medium">1.82</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Max Drawdown</span>
                    <span className="text-danger-400 font-medium">8.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">VaR (95%)</span>
                    <span className="text-yellow-400 font-medium">$2,150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Risk Score</span>
                    <span className="text-green-400 font-medium">7.2/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedAnalysis === 'predictions' && (
          <div className="space-y-6">
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">AI Performance Predictions</h3>
              <div className="h-64">
                <Bar 
                  data={predictionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: '#94a3b8' }
                      }
                    },
                    scales: {
                      x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                      y: { 
                        ticks: { 
                          color: '#94a3b8',
                          callback: function(value) {
                            return '$' + value.toLocaleString();
                          }
                        }, 
                        grid: { color: '#334155' } 
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <h4 className="text-white font-medium mb-2">Prediction Accuracy</h4>
                <p className="text-3xl font-bold text-green-400">87.3%</p>
                <p className="text-primary-400 text-sm">Based on last 6 months</p>
              </div>
              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <h4 className="text-white font-medium mb-2">Next Trade Success</h4>
                <p className="text-3xl font-bold text-success-400">74%</p>
                <p className="text-primary-400 text-sm">Probability of profit</p>
              </div>
              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <h4 className="text-white font-medium mb-2">Optimal Trade Size</h4>
                <p className="text-3xl font-bold text-green-400">$2,850</p>
                <p className="text-primary-400 text-sm">For next position</p>
              </div>
            </div>
          </div>
        )}

        {selectedAnalysis === 'optimization' && (
          <div className="space-y-6">
            <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <h3 className="text-lg font-semibold text-white mb-4">Strategy Optimization Suggestions</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2">Entry Timing Optimization</h4>
                  <p className="text-primary-200 text-sm mb-2">
                    Analysis shows 23% better performance when entering trades between 10:30-11:30 AM EST.
                  </p>
                  <p className="text-primary-300 text-sm">
                    <strong>Recommendation:</strong> Focus major position entries during this window.
                  </p>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">Position Sizing Enhancement</h4>
                  <p className="text-primary-200 text-sm mb-2">
                    Your current position sizing could be optimized using Kelly Criterion for 18% better returns.
                  </p>
                  <p className="text-primary-300 text-sm">
                    <strong>Recommendation:</strong> Implement dynamic position sizing based on win probability.
                  </p>
                </div>

                <div className="p-4 bg-success-500/10 border border-success-500/30 rounded-lg">
                  <h4 className="text-success-400 font-medium mb-2">Strategy Mix Rebalancing</h4>
                  <p className="text-primary-200 text-sm mb-2">
                    Increasing Iron Condor allocation to 35% and reducing scalping to 25% could improve overall returns.
                  </p>
                  <p className="text-primary-300 text-sm">
                    <strong>Recommendation:</strong> Gradually shift strategy allocation over next month.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <h4 className="text-white font-medium mb-4">Current vs Optimized Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-primary-300">Win Rate</span>
                    <div className="text-right">
                      <span className="text-primary-200">68.5%</span>
                      <span className="text-success-400 ml-2">→ 74.2%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Avg Return</span>
                    <div className="text-right">
                      <span className="text-primary-200">2.3%</span>
                      <span className="text-success-400 ml-2">→ 2.8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Sharpe Ratio</span>
                    <div className="text-right">
                      <span className="text-primary-200">1.82</span>
                      <span className="text-success-400 ml-2">→ 2.15</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
                <h4 className="text-white font-medium mb-4">Implementation Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-primary-200 text-sm">Week 1: Adjust entry timing</p>
                      <p className="text-primary-400 text-xs">Expected impact: +5% returns</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="text-primary-200 text-sm">Week 2-3: Implement Kelly sizing</p>
                      <p className="text-primary-400 text-xs">Expected impact: +8% returns</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                    <div>
                      <p className="text-primary-200 text-sm">Week 4: Rebalance strategies</p>
                      <p className="text-primary-400 text-xs">Expected impact: +12% returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AIAnalytics;