import { BrokerConnection, Broker, MarketData, Order, Position } from '../types';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3001';

// Broker configurations
export const BROKERS: Broker[] = [
  {
    id: 'exness',
    name: 'exness',
    displayName: 'Exness',
    logo: 'https://cdn.worldvectorlogo.com/logos/exness.svg',
    description: 'Global forex and CFD broker with competitive spreads',
    authType: 'oauth',
    features: {
      liveData: true,
      orderPlacement: true,
      portfolioSync: true,
      optionsTrading: false,
    },
    endpoints: {
      auth: '/api/brokers/exness/auth',
      orders: '/api/brokers/exness/orders',
      positions: '/api/brokers/exness/positions',
      liveData: '/api/brokers/exness/stream',
    },
    isActive: true,
  },
  {
    id: 'delta_exchange',
    name: 'delta_exchange',
    displayName: 'Delta Exchange',
    logo: 'https://delta.exchange/static/media/delta-logo.svg',
    description: 'Crypto derivatives trading platform',
    authType: 'api_key',
    features: {
      liveData: true,
      orderPlacement: true,
      portfolioSync: true,
      optionsTrading: true,
    },
    endpoints: {
      auth: '/api/brokers/delta/auth',
      orders: '/api/brokers/delta/orders',
      positions: '/api/brokers/delta/positions',
      liveData: '/api/brokers/delta/stream',
    },
    isActive: true,
  },
  {
    id: 'zerodha',
    name: 'zerodha',
    displayName: 'Zerodha Kite',
    logo: 'https://zerodha.com/static/images/logo.svg',
    description: 'India\'s largest stock broker',
    authType: 'oauth',
    features: {
      liveData: true,
      orderPlacement: true,
      portfolioSync: true,
      optionsTrading: true,
    },
    endpoints: {
      auth: '/api/brokers/zerodha/auth',
      orders: '/api/brokers/zerodha/orders',
      positions: '/api/brokers/zerodha/positions',
      liveData: '/api/brokers/zerodha/stream',
    },
    isActive: true,
  },
  {
    id: 'fyers',
    name: 'fyers',
    displayName: 'Fyers',
    logo: 'https://fyers.in/img/fyers-logo.svg',
    description: 'Technology-driven stock broker',
    authType: 'oauth',
    features: {
      liveData: true,
      orderPlacement: true,
      portfolioSync: true,
      optionsTrading: true,
    },
    endpoints: {
      auth: '/api/brokers/fyers/auth',
      orders: '/api/brokers/fyers/orders',
      positions: '/api/brokers/fyers/positions',
      liveData: '/api/brokers/fyers/stream',
    },
    isActive: true,
  },
  {
    id: 'angel_one',
    name: 'angel_one',
    displayName: 'Angel One SmartAPI',
    logo: 'https://www.angelone.in/images/logo.svg',
    description: 'Full-service stock broker with SmartAPI',
    authType: 'credentials',
    features: {
      liveData: true,
      orderPlacement: true,
      portfolioSync: true,
      optionsTrading: true,
    },
    endpoints: {
      auth: '/api/brokers/angel/auth',
      orders: '/api/brokers/angel/orders',
      positions: '/api/brokers/angel/positions',
      liveData: '/api/brokers/angel/stream',
    },
    isActive: true,
  },
  {
    id: 'kotak_neo',
    name: 'kotak_neo',
    displayName: 'Kotak Securities Neo',
    logo: 'https://neo.kotaksecurities.com/static/media/kotak-logo.svg',
    description: 'Kotak Securities Neo API platform',
    authType: 'oauth',
    features: {
      liveData: true,
      orderPlacement: true,
      portfolioSync: true,
      optionsTrading: true,
    },
    endpoints: {
      auth: '/api/brokers/kotak/auth',
      orders: '/api/brokers/kotak/orders',
      positions: '/api/brokers/kotak/positions',
      liveData: '/api/brokers/kotak/stream',
    },
    isActive: true,
  },
  {
    id: 'dhan',
    name: 'dhan',
    displayName: 'Dhan',
    logo: 'https://dhan.co/static/media/dhan-logo.svg',
    description: 'Modern trading platform with advanced features',
    authType: 'api_key',
    features: {
      liveData: true,
      orderPlacement: true,
      portfolioSync: true,
      optionsTrading: true,
    },
    endpoints: {
      auth: '/api/brokers/dhan/auth',
      orders: '/api/brokers/dhan/orders',
      positions: '/api/brokers/dhan/positions',
      liveData: '/api/brokers/dhan/stream',
    },
    isActive: true,
  },
  {
    id: 'upstox',
    name: 'upstox',
    displayName: 'Upstox',
    logo: 'https://upstox.com/app/themes/upstox/dist/img/logo.svg',
    description: 'Technology-first stock broker',
    authType: 'oauth',
    features: {
      liveData: true,
      orderPlacement: true,
      portfolioSync: true,
      optionsTrading: true,
    },
    endpoints: {
      auth: '/api/brokers/upstox/auth',
      orders: '/api/brokers/upstox/orders',
      positions: '/api/brokers/upstox/positions',
      liveData: '/api/brokers/upstox/stream',
    },
    isActive: true,
  },
];

class BrokerService {
  private connections: Map<string, BrokerConnection> = new Map();
  private marketDataStreams: Map<string, WebSocket> = new Map();
  private orderStreams: Map<string, WebSocket> = new Map();
  private credentialsStore: Map<string, any> = new Map();
  private connectionAttempts: Map<string, number> = new Map();

  // Get all available brokers
  getBrokers(): Broker[] {
    return BROKERS.filter(broker => broker.isActive);
  }

  // Get user's broker connections
  async getUserConnections(userId: string): Promise<BrokerConnection[]> {
    try {
      // First check if we have any configured credentials
      const configuredBrokers = this.getConfiguredBrokers();
      if (configuredBrokers.length === 0) {
        console.log('No broker credentials configured yet');
        return [];
      }

      // Check if backend server is running
      const isServerAvailable = await this.checkServerHealth();
      if (!isServerAvailable) {
        console.warn('Backend server not available - returning empty connections');
        return [];
      }
      
      const response = await fetch(`${API_BASE_URL}/api/brokers/connections/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No connections found - this is normal for new users
          console.log('No existing broker connections found');
          return [];
        }
        if (response.status >= 500) {
          console.warn('Server error - returning empty connections');
          return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.warn('Server returned non-JSON response - likely server configuration issue');
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Error fetching broker connections:', error.message);
      
      if (error instanceof SyntaxError) {
        console.warn('Invalid JSON response from server - returning empty connections');
        return [];
      } else if (error instanceof TypeError) {
        console.warn('Network error or server unavailable - returning empty connections');
        return [];
      }
      
      console.warn('Unknown error fetching connections - returning empty connections');
      return [];
    }
  }

  // Check if server is available
  private async checkServerHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Server health check timed out');
      } else {
        console.warn('Server health check failed:', error.message);
      }
      return false;
    }
  }

  // Get brokers with configured credentials
  private getConfiguredBrokers(): string[] {
    return Array.from(this.credentialsStore.keys());
  }

  // Store credentials for a broker
  storeCredentials(brokerId: string, credentials: any): void {
    if (this.validateCredentialsFormat(brokerId, credentials)) {
      this.credentialsStore.set(brokerId, credentials);
      console.log(`Credentials stored for ${brokerId}`);
    }
  }

  // Check if broker has valid credentials stored
  hasStoredCredentials(brokerId: string): boolean {
    return this.credentialsStore.has(brokerId);
  }

  // Validate credential format for a broker
  private validateCredentialsFormat(brokerId: string, credentials: any): boolean {
    const broker = BROKERS.find(b => b.id === brokerId);
    if (!broker) return false;

    switch (broker.authType) {
      case 'oauth':
        return true; // OAuth doesn't require pre-stored credentials
      case 'api_key':
        return !!(credentials?.apiKey && credentials?.apiSecret);
      case 'credentials':
        return !!(credentials?.username && credentials?.password);
      default:
        return false;
    }
  }

  // Connect to a broker
  async connectBroker(brokerId: string, credentials?: any): Promise<boolean> {
    try {
      const broker = BROKERS.find(b => b.id === brokerId);
      if (!broker) throw new Error('Broker not found');

      // Validate credentials before attempting connection
      if (broker.authType !== 'oauth' && !this.validateCredentials(broker, credentials)) {
        return false;
      }

      // Store credentials for future use
      if (credentials) {
        this.storeCredentials(brokerId, credentials);
      }

      // Check server availability before attempting connection
      const isServerAvailable = await this.checkServerHealth();
      if (!isServerAvailable) {
        toast.error('Backend server is not available. Please try again later.');
        return false;
      }

      let authUrl = '';
      let success = false;
      
      switch (broker.authType) {
        case 'oauth':
          try {
            authUrl = await this.initiateOAuth(brokerId);
            window.open(authUrl, '_blank', 'width=600,height=700');
            success = true;
          } catch (oauthError) {
            console.error('OAuth initialization failed:', oauthError);
            throw new Error('Failed to initialize OAuth flow');
          }
          break;
          
        case 'api_key':
          if (!credentials?.apiKey || !credentials?.apiSecret) {
            throw new Error('API Key and Secret are required');
          }
          await this.connectWithApiKey(brokerId, credentials);
          success = true;
          break;
          
        case 'credentials':
          if (!credentials?.username || !credentials?.password) {
            throw new Error('Username and Password are required');
          }
          await this.connectWithCredentials(brokerId, credentials);
          success = true;
          break;
      }

      if (success) {
        toast.success(`Successfully connected to ${broker.displayName}!`);
      }

      toast.success(`Connecting to ${broker.displayName}...`);
      return true;
    } catch (error) {
      console.error('Error connecting to broker:', error);
      toast.error(error.message || 'Failed to connect to broker');
      return false;
    }
  }

  // Initiate OAuth flow
  private async initiateOAuth(brokerId: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/oauth/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '1' }), // In production, get from auth context
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OAuth init failed: ${response.status} ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from OAuth service');
      }
      
      const data = await response.json();
      if (!data.authUrl) {
        throw new Error('No authorization URL received from server');
      }
      
      return data.authUrl;
    } catch (error) {
      console.error('OAuth initialization error:', error);
      throw error;
    }
  }

  // Connect with API key
  private async connectWithApiKey(brokerId: string, credentials: any): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API connection failed: ${response.status} ${errorData}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from broker API');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('API key connection error:', error);
      throw error;
    }
  }

  // Connect with credentials
  private async connectWithCredentials(brokerId: string, credentials: any): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          username: credentials.username,
          password: credentials.password,
          totp: credentials.totp,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Credential authentication failed: ${response.status} ${errorData}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from authentication service');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Credential connection error:', error);
      throw error;
    }
  }

  // Disconnect from broker
  async disconnectBroker(brokerId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '1' }),
      });
      
      if (!response.ok) throw new Error('Failed to disconnect');
      
      // Close any open streams
      this.closeStreams(brokerId);
      
      const broker = BROKERS.find(b => b.id === brokerId);
      toast.success(`Disconnected from ${broker?.displayName}`);
      return true;
    } catch (error) {
      console.error('Error disconnecting from broker:', error);
      toast.error('Failed to disconnect from broker');
      return false;
    }
  }

  // Place order through broker
  async placeOrder(brokerId: string, orderData: Partial<Order>): Promise<Order | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          ...orderData,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to place order');
      
      const order = await response.json();
      toast.success(`Order placed successfully via ${BROKERS.find(b => b.id === brokerId)?.displayName}`);
      return order;
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
      return null;
    }
  }

  // Get positions from broker
  async getPositions(brokerId: string): Promise<Position[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/positions?userId=1`);
      if (!response.ok) throw new Error('Failed to fetch positions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  // Get orders from broker
  async getOrders(brokerId: string): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/orders?userId=1`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // Validate credentials based on broker auth type
  private validateCredentials(broker: Broker, credentials?: any): boolean {
    if (broker.authType === 'oauth') {
      // OAuth doesn't require pre-validation
      return true;
    }
    
    if (broker.authType === 'api_key') {
      if (!credentials?.apiKey || !credentials?.apiSecret) {
        toast.error('API Key and Secret are required for ' + broker.displayName);
        return false;
      }
      return true;
    }
    
    if (broker.authType === 'credentials') {
      if (!credentials?.username || !credentials?.password) {
        toast.error('Username and Password are required for ' + broker.displayName);
        return false;
      }
      return true;
    }
    
    return false;
  }

  // Check if broker has valid credentials
  hasValidCredentials(brokerId: string): boolean {
    const connection = this.connections.get(brokerId);
    return connection?.status === 'connected' && !!connection.accessToken;
  }

  // Get connection status for a specific broker
  getConnectionStatus(brokerId: string): 'connected' | 'disconnected' | 'error' | 'connecting' {
    const connection = this.connections.get(brokerId);
    return connection?.status || 'disconnected';
  }

  // Start live market data stream
  async startMarketDataStream(brokerId: string, symbols: string[], onData: (data: MarketData) => void): Promise<void> {
    // Check if broker is connected before starting stream
    if (!this.hasStoredCredentials(brokerId)) {
      const broker = BROKERS.find(b => b.id === brokerId);
      toast.error(`Please configure credentials for ${broker?.displayName || 'the broker'} in the Broker Connect page first`);
      return;
    }
    
    try {
      const broker = BROKERS.find(b => b.id === brokerId);
      if (!broker) throw new Error('Broker not found');

      // Check server availability before starting WebSocket
      const isServerAvailable = await this.checkServerHealth();
      if (!isServerAvailable) {
        toast.error('Backend server is not available for live data streaming');
        return;
      }

      const wsUrl = `ws://localhost:3001${broker.endpoints.liveData}?symbols=${symbols.join(',')}&userId=1`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`Market data stream connected for ${broker.displayName}`);
        toast.success(`Live market data streaming started for ${broker.displayName}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onData(data);
        } catch (error) {
          console.error('Error parsing market data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Market data stream error:', error);
        toast.error(`Market data connection error for ${broker.displayName}. Please check your connection.`);
      };

      ws.onclose = () => {
        console.log(`Market data stream closed for ${broker.displayName}`);
        this.marketDataStreams.delete(brokerId);
      };

      this.marketDataStreams.set(brokerId, ws);
    } catch (error) {
      console.error('Error starting market data stream:', error);
      toast.error('Failed to start live data stream');
    }
  }

  // Stop market data stream
  stopMarketDataStream(brokerId: string): void {
    const ws = this.marketDataStreams.get(brokerId);
    if (ws) {
      ws.close();
      this.marketDataStreams.delete(brokerId);
    }
  }

  // Close all streams for a broker
  private closeStreams(brokerId: string): void {
    this.stopMarketDataStream(brokerId);
    
    const orderWs = this.orderStreams.get(brokerId);
    if (orderWs) {
      orderWs.close();
      this.orderStreams.delete(brokerId);
    }
  }

  // Sync all broker data
  async syncAllBrokers(): Promise<void> {
    const connections = await this.getUserConnections('1');
    const connectedBrokers = connections.filter(conn => conn.status === 'connected');
    
    for (const connection of connectedBrokers) {
      try {
        await this.syncBrokerData(connection.brokerId);
      } catch (error) {
        console.error(`Error syncing ${connection.brokerName}:`, error);
      }
    }
  }

  // Sync individual broker data
  private async syncBrokerData(brokerId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '1' }),
      });
      
      if (!response.ok) throw new Error('Sync failed');
      
      const broker = BROKERS.find(b => b.id === brokerId);
      console.log(`Synced data for ${broker?.displayName}`);
    } catch (error) {
      console.error(`Error syncing ${brokerId}:`, error);
    }
  }
}

export const brokerService = new BrokerService();