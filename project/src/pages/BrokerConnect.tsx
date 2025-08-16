import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Settings, 
  RefreshCw, 
  Plus, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { brokerService, BROKERS } from '../services/brokerService';
import { BrokerConnection, Broker } from '../types';
import toast from 'react-hot-toast';

const BrokerConnect: React.FC = () => {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [credentials, setCredentials] = useState<Record<string, any>>({});

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const userConnections = await brokerService.getUserConnections('1');
      setConnections(userConnections);
      
      if (userConnections.length === 0) {
        console.log('No active broker connections found');
      }
    } catch (error) {
      console.warn('Failed to load connections in BrokerConnect page:', error.message);
      setConnections([]);
      
      // Show user-friendly error based on error type
      if (error.message?.includes('Network') || error.message?.includes('server')) {
        toast.error('Network error or server unavailable. Please check your connection.');
      } else if (error.message?.includes('JSON')) {
        toast.error('Server configuration error. Please contact support.');
      } else {
        toast.error('Unable to load broker connections. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (broker: Broker) => {
    setConnecting(broker.id);
    
    try {
      let success = false;
      
      if (broker.authType === 'oauth') {
        // Store OAuth attempt for tracking
        brokerService.storeCredentials(broker.id, { type: 'oauth', timestamp: Date.now() });
        success = await brokerService.connectBroker(broker.id);
      } else {
        const brokerCredentials = credentials[broker.id];
        if (!brokerCredentials) {
          const credType = broker.authType === 'api_key' ? 'API credentials' : 'login credentials';
          toast.error(`Please enter ${credType} for ${broker.displayName} first`);
          setConnecting(null);
          return;
        }
        // Store credentials before attempting connection
        brokerService.storeCredentials(broker.id, brokerCredentials);
        success = await brokerService.connectBroker(broker.id, brokerCredentials);
      }
      
      if (success) {
        await loadConnections();
      }
    } catch (error) {
      console.warn('Connection error for', broker.displayName, ':', error.message);
      toast.error(`Failed to connect to ${broker.displayName}: ${error.message}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (brokerId: string) => {
    const broker = BROKERS.find(b => b.id === brokerId);
    if (window.confirm(`Are you sure you want to disconnect from ${broker?.displayName}?`)) {
      const success = await brokerService.disconnectBroker(brokerId);
      if (success) {
        await loadConnections();
      }
    }
  };

  const handleCredentialChange = (brokerId: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [brokerId]: {
        ...prev[brokerId],
        [field]: value,
      },
    }));
  };

  const toggleCredentialsVisibility = (brokerId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [brokerId]: !prev[brokerId],
    }));
  };

  const getConnectionStatus = (brokerId: string): BrokerConnection | null => {
    return connections.find(conn => conn.brokerId === brokerId) || null;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-success-400" />;
      case 'connecting':
        return <RefreshCw className="w-5 h-5 text-gold-400 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-danger-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-primary-400" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Not Connected';
    }
  };

  const renderCredentialFields = (broker: Broker) => {
    const isVisible = showCredentials[broker.id];
    
    if (broker.authType === 'oauth') {
      return (
        <div className="text-sm text-primary-400">
          OAuth authentication - Click connect to authorize
        </div>
      );
    }

    if (broker.authType === 'api_key') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">
              API Key
            </label>
            <input
              type={isVisible ? 'text' : 'password'}
              value={credentials[broker.id]?.apiKey || ''}
              onChange={(e) => handleCredentialChange(broker.id, 'apiKey', e.target.value)}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Enter API Key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">
              API Secret
            </label>
            <input
              type={isVisible ? 'text' : 'password'}
              value={credentials[broker.id]?.apiSecret || ''}
              onChange={(e) => handleCredentialChange(broker.id, 'apiSecret', e.target.value)}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Enter API Secret"
            />
          </div>
        </div>
      );
    }

    if (broker.authType === 'credentials') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">
              Username/Client ID
            </label>
            <input
              type="text"
              value={credentials[broker.id]?.username || ''}
              onChange={(e) => handleCredentialChange(broker.id, 'username', e.target.value)}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Enter Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">
              Password/PIN
            </label>
            <input
              type={isVisible ? 'text' : 'password'}
              value={credentials[broker.id]?.password || ''}
              onChange={(e) => handleCredentialChange(broker.id, 'password', e.target.value)}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Enter Password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">
              TOTP (if enabled)
            </label>
            <input
              type="text"
              value={credentials[broker.id]?.totp || ''}
              onChange={(e) => handleCredentialChange(broker.id, 'totp', e.target.value)}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Enter TOTP (optional)"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Wifi className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Broker Connections</h1>
            <p className="text-primary-300">Connect your trading accounts for live data and order execution</p>
          </div>
        </div>
        <button
          onClick={loadConnections}
          className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Connection Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Connected</p>
            <p className="text-success-400 text-2xl font-bold">
              {connections.filter(c => c.status === 'connected').length}
            </p>
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gold-500/20 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gold-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Connecting</p>
            <p className="text-gold-400 text-2xl font-bold">
              {connections.filter(c => c.status === 'connecting').length}
            </p>
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-danger-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-danger-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Errors</p>
            <p className="text-danger-400 text-2xl font-bold">
              {connections.filter(c => c.status === 'error').length}
            </p>
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <WifiOff className="w-5 h-5 text-primary-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Available</p>
            <p className="text-white text-2xl font-bold">{BROKERS.length}</p>
          </div>
        </div>
      </div>

      {/* Broker Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {BROKERS.map((broker) => {
          const connection = getConnectionStatus(broker.id);
          const isConnected = connection?.status === 'connected';
          const isConnecting = connecting === broker.id || connection?.status === 'connecting';

          return (
            <div key={broker.id} className="bg-primary-800 rounded-lg border border-primary-700 p-6">
              {/* Broker Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={broker.logo}
                    alt={broker.displayName}
                    className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${broker.displayName}&background=1e293b&color=ffffff&size=48`;
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{broker.displayName}</h3>
                    <p className="text-primary-400 text-sm">{broker.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(connection?.status)}
                  <span className={`text-sm font-medium ${
                    isConnected ? 'text-success-400' : 
                    connection?.status === 'error' ? 'text-danger-400' : 
                    'text-primary-400'
                  }`}>
                    {getStatusText(connection?.status)}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {broker.features.liveData && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                    Live Data
                  </span>
                )}
                {broker.features.orderPlacement && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    Order Placement
                  </span>
                )}
                {broker.features.portfolioSync && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                    Portfolio Sync
                  </span>
                )}
                {broker.features.optionsTrading && (
                  <span className="px-2 py-1 bg-gold-500/20 text-gold-400 text-xs rounded">
                    Options Trading
                  </span>
                )}
              </div>

              {/* Credentials Section */}
              {!isConnected && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-primary-300">
                      {broker.authType === 'oauth' ? 'Authentication' : 'Credentials'}
                    </h4>
                    {broker.authType !== 'oauth' && (
                      <button
                        onClick={() => toggleCredentialsVisibility(broker.id)}
                        className="p-1 text-primary-400 hover:text-white transition-colors"
                      >
                        {showCredentials[broker.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {renderCredentialFields(broker)}
                </div>
              )}

              {/* Connection Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleDisconnect(broker.id)}
                        className="bg-danger-600 hover:bg-danger-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center space-x-2"
                      >
                        <WifiOff className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                      <button className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(broker)}
                      disabled={isConnecting}
                      className="bg-success-600 hover:bg-success-700 disabled:bg-primary-600 disabled:text-primary-400 text-white px-4 py-2 rounded font-medium transition-colors flex items-center space-x-2"
                    >
                      {isConnecting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
                    </button>
                  )}
                </div>

                {connection?.lastSyncAt && (
                  <div className="text-xs text-primary-400">
                    Last sync: {new Date(connection.lastSyncAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Connection Info */}
              {isConnected && connection && (
                <div className="mt-4 p-3 bg-success-500/10 border border-success-500/30 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                    <span className="text-success-400 text-sm font-medium">Live Connection Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success-400">Connected since:</span>
                    <span className="text-white">{new Date(connection.createdAt).toLocaleDateString()}</span>
                  </div>
                  {connection.expiresAt && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-success-400">Token expires:</span>
                      <span className="text-white">{new Date(connection.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* No Connection Info */}
              {!isConnected && (
                <div className="mt-4 p-3 bg-primary-700/50 border border-primary-600 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <WifiOff className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-400 text-sm">
                      {brokerService.hasStoredCredentials(broker.id) ? 'Credentials Configured' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-primary-500 text-xs">
                    {brokerService.hasStoredCredentials(broker.id)
                      ? 'Credentials are configured. Click Connect to establish connection.'
                      : broker.authType === 'oauth' 
                        ? 'Click Connect to authorize via OAuth'
                        : `Enter your ${broker.authType === 'api_key' ? 'API credentials' : 'login credentials'} above`
                    }
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-primary-800 rounded-lg border border-primary-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-primary-300 font-medium mb-2">OAuth Brokers</h4>
            <p className="text-primary-400">
              For OAuth brokers (Zerodha, Fyers, etc.), click "Connect" to open the broker's login page. 
              After successful login, you'll be redirected back automatically.
            </p>
          </div>
          <div>
            <h4 className="text-primary-300 font-medium mb-2">API Key Brokers</h4>
            <p className="text-primary-400">
              For API key brokers, you'll need to generate API credentials from your broker's developer portal. 
              Enter the API key and secret to establish connection.
            </p>
          </div>
          <div>
            <h4 className="text-primary-300 font-medium mb-2">Security</h4>
            <p className="text-primary-400">
              All credentials are encrypted and stored securely. We never store your trading passwords. 
              You can disconnect anytime to revoke access.
            </p>
          </div>
          <div>
            <h4 className="text-primary-300 font-medium mb-2">Support</h4>
            <p className="text-primary-400">
              Having trouble connecting? Check our documentation or contact support for broker-specific setup guides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerConnect;