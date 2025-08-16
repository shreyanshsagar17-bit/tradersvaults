import React from 'react';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  User, 
  Shield, 
  Activity,
  DollarSign,
  Target,
  Brain,
  Briefcase,
  Calculator,
  Palette,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { brokerService } from '../../services/brokerService';
import { BrokerConnection } from '../../types';
import { BROKERS } from '../../services/brokerService';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [sidebarTheme, setSidebarTheme] = useState('green');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnection[]>([]);
  const [brokerStatus, setBrokerStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('sidebarTheme');
    if (savedTheme && ['green', 'purple', 'blue', 'white'].includes(savedTheme)) {
      setSidebarTheme(savedTheme);
    }
    
    // Load broker connections
    loadBrokerConnections();
  }, []);

  const loadBrokerConnections = async () => {
    try {
      setBrokerStatus('loading');
      setErrorMessage('');
      
      // Check if any brokers have credentials configured
      const hasAnyCredentials = BROKERS.some(broker => 
        brokerService.hasStoredCredentials(broker.id)
      );
      
      if (!hasAnyCredentials) {
        console.log('No broker credentials configured - showing empty state');
        setBrokerConnections([]);
        setBrokerStatus('loaded');
        setErrorMessage('No broker credentials configured');
        return;
      }
      
      const connections = await brokerService.getUserConnections('1');
      setBrokerConnections(connections);
      setBrokerStatus('loaded');
      
      if (connections.length === 0) {
        setErrorMessage('Broker credentials configured but no active connections');
      }
    } catch (error) {
      console.warn('Failed to load broker connections in sidebar:', error.message);
      setBrokerStatus('error');
      setBrokerConnections([]);
      
      // Set user-friendly error message based on error type
      if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        setErrorMessage('Network error or server unavailable');
      } else if (error.message?.includes('JSON')) {
        setErrorMessage('Server configuration error');
      } else {
        setErrorMessage('Unable to load broker connections');
      }
    }
  };

  // Save theme to localStorage when changed
  const handleThemeChange = (themeId: string) => {
    setSidebarTheme(themeId);
    localStorage.setItem('sidebarTheme', themeId);
  };

  const getConnectedBrokersCount = () => {
    if (brokerStatus === 'error' || brokerStatus === 'loading') {
      return 0;
    }
    return brokerConnections.filter(conn => conn.status === 'connected').length;
  };

  const getBrokerStatusIcon = () => {
    if (brokerStatus === 'error') {
      return <div className="w-2 h-2 bg-danger-400 rounded-full"></div>;
    }
    
    const connectedCount = getConnectedBrokersCount();
    
    if (brokerStatus === 'loading') {
      return <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>;
    }
    
    if (connectedCount > 0) {
      return <div className="w-2 h-2 bg-success-400 rounded-full"></div>;
    }
    
    return <div className="w-2 h-2 bg-primary-500 rounded-full"></div>;
  };

  const getBrokerStatusText = () => {
    if (brokerStatus === 'loading') return 'Loading...';
    if (brokerStatus === 'error') return errorMessage;
    
    const connectedCount = getConnectedBrokersCount();
    if (connectedCount === 0) {
      return errorMessage || 'No brokers connected';
    }
    
    return `${connectedCount} broker${connectedCount === 1 ? '' : 's'} connected`;
  };

  const getBrokerLogo = (brokerId: string) => {
    const broker = BROKERS.find(b => b.id === brokerId);
    return broker?.logo || `https://ui-avatars.com/api/?name=${broker?.displayName || 'Broker'}&background=1e293b&color=ffffff&size=24`;
  };
  const themeOptions = [
    { id: 'green', name: 'Green', color: '#28a745' },
    { id: 'purple', name: 'Purple', color: '#6f42c1' },
    { id: 'blue', name: 'Blue', color: '#007bff' },
    { id: 'white', name: 'White', color: '#ffffff' },
  ];

  const navItems = [
    { to: '/', icon: BarChart3, label: 'Dashboard' },
    { to: '/calculator', icon: Calculator, label: 'Calculator' },
    { 
      to: '/brokers', 
      icon: Wifi, 
      label: 'Broker Connect',
      badge: getConnectedBrokersCount() > 0 ? getConnectedBrokersCount().toString() : undefined,
      statusIcon: getBrokerStatusIcon()
    },
    { to: '/trades', icon: TrendingUp, label: 'Trades' },
    { to: '/analytics', icon: Activity, label: 'Analytics' },
    { to: '/strategies', icon: Target, label: 'Custom Strategy' },
    { to: '/ai-analytics', icon: Brain, label: 'AI Analytics' },
    { to: '/portfolio', icon: Briefcase, label: 'Custom Portfolio' },
    { to: '/social', icon: Users, label: 'Social Feed' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  if (user?.isAdmin) {
    navItems.push({ to: '/admin', icon: Shield, label: 'Admin Panel' });
  }

  return (
    <aside className={`sidebar ${sidebarTheme} w-64 bg-primary-900 border-r border-primary-700`}>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Traders Vault</h1>
            <p className="text-xs text-primary-400">by TWIQ</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ to, icon: Icon, label, badge, statusIcon, tooltip }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const baseClasses = 'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors';
                const activeClasses = isActive ? 'active' : 'text-primary-300 hover:text-white hover:bg-primary-700';
                return `${baseClasses} ${activeClasses}`;
              }}
            >
              <div className="flex items-center space-x-3 flex-1">
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {to === '/brokers' && brokerConnections.length > 0 && (
                  <div className="flex -space-x-1 ml-2">
                    {brokerConnections.slice(0, 3).map((connection, index) => (
                      <img
                        key={connection.id}
                        src={getBrokerLogo(connection.brokerId)}
                        alt={connection.brokerName}
                        className="w-4 h-4 rounded-full border border-primary-600 bg-white object-contain"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${connection.brokerName}&background=1e293b&color=ffffff&size=16`;
                        }}
                      />
                    ))}
                    {brokerConnections.length > 3 && (
                      <div className="w-4 h-4 rounded-full bg-primary-600 border border-primary-600 flex items-center justify-center">
                        <span className="text-xs text-white">+{brokerConnections.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {(badge || statusIcon) && (
                <div className="flex items-center space-x-2">
                  {statusIcon}
                  {badge && (
                    <span className="bg-success-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme Selector */}
        <div className="mt-8 pt-6 border-t border-primary-700">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-primary-300 hover:text-white hover:bg-primary-700 w-full"
          >
            <Palette className="w-5 h-5" />
            <span>Sidebar Themes</span>
          </button>
          
          {showThemeSelector && (
            <div className="mt-2 space-y-2 px-4">
              {themeOptions.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    sidebarTheme === theme.id
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-300 hover:text-white hover:bg-primary-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border border-primary-500"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-sm">{theme.name}</span>
                  </div>
                  {sidebarTheme === theme.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;