const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a proper database)
const brokerConnections = new Map();
const orders = new Map();
const positions = new Map();
const marketDataClients = new Map();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-secret-key';

// Broker configurations
const BROKER_CONFIGS = {
  exness: {
    name: 'Exness',
    authUrl: 'https://my.exness.com/oauth/authorize',
    tokenUrl: 'https://my.exness.com/oauth/token',
    apiUrl: 'https://api.exness.com/v1',
  },
  delta_exchange: {
    name: 'Delta Exchange',
    authUrl: 'https://api.delta.exchange/v2/auth',
    apiUrl: 'https://api.delta.exchange/v2',
  },
  zerodha: {
    name: 'Zerodha Kite',
    authUrl: 'https://kite.trade/connect/login',
    tokenUrl: 'https://api.kite.trade/session/token',
    apiUrl: 'https://api.kite.trade',
  },
  fyers: {
    name: 'Fyers',
    authUrl: 'https://api.fyers.in/api/v2/generate-authcode',
    tokenUrl: 'https://api.fyers.in/api/v2/validate-authcode',
    apiUrl: 'https://api.fyers.in/api/v2',
  },
  angel_one: {
    name: 'Angel One',
    authUrl: 'https://smartapi.angelbroking.com/publisher-login',
    apiUrl: 'https://apiconnect.angelbroking.com/rest',
  },
  kotak_neo: {
    name: 'Kotak Neo',
    authUrl: 'https://napi.kotaksecurities.com/oauth/authorize',
    tokenUrl: 'https://napi.kotaksecurities.com/oauth/token',
    apiUrl: 'https://napi.kotaksecurities.com/rest',
  },
  dhan: {
    name: 'Dhan',
    authUrl: 'https://api.dhan.co/v2/auth',
    apiUrl: 'https://api.dhan.co/v2',
  },
  upstox: {
    name: 'Upstox',
    authUrl: 'https://api.upstox.com/v2/login/authorization/dialog',
    tokenUrl: 'https://api.upstox.com/v2/login/authorization/token',
    apiUrl: 'https://api.upstox.com/v2',
  },
};

// Utility functions
const encryptData = (data) => {
  return crypto.AES.encrypt(JSON.stringify(data), JWT_SECRET).toString();
};

const decryptData = (encryptedData) => {
  const bytes = crypto.AES.decrypt(encryptedData, JWT_SECRET);
  return JSON.parse(bytes.toString(crypto.enc.Utf8));
};

const generateMockMarketData = (symbol) => {
  const basePrice = Math.random() * 1000 + 100;
  const change = (Math.random() - 0.5) * 20;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    price: basePrice,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 1000000),
    high: basePrice + Math.random() * 10,
    low: basePrice - Math.random() * 10,
    open: basePrice + (Math.random() - 0.5) * 5,
    timestamp: new Date().toISOString(),
  };
};

// API Routes

// Get user broker connections
app.get('/api/brokers/connections/:userId', (req, res) => {
  const { userId } = req.params;
  const userConnections = Array.from(brokerConnections.values())
    .filter(conn => conn.userId === userId);
  
  res.json(userConnections);
});

// OAuth initialization
app.post('/api/brokers/:brokerId/oauth/init', (req, res) => {
  const { brokerId } = req.params;
  const { userId } = req.body;
  
  const config = BROKER_CONFIGS[brokerId];
  if (!config) {
    return res.status(404).json({ error: 'Broker not found' });
  }
  
  // Generate state parameter for OAuth security
  const state = crypto.lib.WordArray.random(128/8).toString();
  const authUrl = `${config.authUrl}?client_id=demo&redirect_uri=http://localhost:3000/callback&state=${state}&response_type=code`;
  
  res.json({ authUrl, state });
});

// Connect broker with API key
app.post('/api/brokers/:brokerId/connect', async (req, res) => {
  const { brokerId } = req.params;
  const { userId, apiKey, apiSecret, username, password, totp } = req.body;
  
  try {
    const connectionId = `${userId}-${brokerId}`;
    
    // Encrypt sensitive data
    const encryptedCredentials = encryptData({
      apiKey,
      apiSecret,
      username,
      password,
      totp,
    });
    
    const connection = {
      id: connectionId,
      userId,
      brokerId,
      brokerName: BROKER_CONFIGS[brokerId]?.name || brokerId,
      status: 'connected',
      encryptedCredentials,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lastSyncAt: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    brokerConnections.set(connectionId, connection);
    
    res.json({ success: true, connection });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Failed to connect broker' });
  }
});

// Disconnect broker
app.post('/api/brokers/:brokerId/disconnect', (req, res) => {
  const { brokerId } = req.params;
  const { userId } = req.body;
  
  const connectionId = `${userId}-${brokerId}`;
  const connection = brokerConnections.get(connectionId);
  
  if (connection) {
    connection.status = 'disconnected';
    connection.isActive = false;
    connection.updatedAt = new Date().toISOString();
    brokerConnections.set(connectionId, connection);
  }
  
  res.json({ success: true });
});

// Place order
app.post('/api/brokers/:brokerId/orders', async (req, res) => {
  const { brokerId } = req.params;
  const orderData = req.body;
  
  try {
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const order = {
      id: orderId,
      userId: orderData.userId,
      brokerId,
      brokerOrderId: `broker-${orderId}`,
      symbol: orderData.symbol,
      side: orderData.side,
      type: orderData.type,
      quantity: orderData.quantity,
      price: orderData.price,
      stopPrice: orderData.stopPrice,
      status: 'filled', // Mock as filled immediately
      filledQuantity: orderData.quantity,
      averagePrice: orderData.price || generateMockMarketData(orderData.symbol).price,
      orderTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      validity: orderData.validity,
      product: orderData.product,
      exchange: orderData.exchange,
    };
    
    orders.set(orderId, order);
    
    // Update positions
    const positionId = `${orderData.userId}-${brokerId}-${orderData.symbol}`;
    let position = positions.get(positionId);
    
    if (!position) {
      position = {
        id: positionId,
        userId: orderData.userId,
        brokerId,
        symbol: orderData.symbol,
        quantity: 0,
        averagePrice: 0,
        currentPrice: order.averagePrice,
        pnl: 0,
        pnlPercent: 0,
        product: orderData.product,
        exchange: orderData.exchange,
        lastUpdated: new Date().toISOString(),
      };
    }
    
    // Update position based on order
    const orderQuantity = orderData.side === 'buy' ? orderData.quantity : -orderData.quantity;
    const newQuantity = position.quantity + orderQuantity;
    
    if (newQuantity !== 0) {
      position.averagePrice = ((position.averagePrice * position.quantity) + (order.averagePrice * orderQuantity)) / newQuantity;
    }
    
    position.quantity = newQuantity;
    position.pnl = (position.currentPrice - position.averagePrice) * position.quantity;
    position.pnlPercent = position.averagePrice !== 0 ? (position.pnl / (position.averagePrice * Math.abs(position.quantity))) * 100 : 0;
    position.lastUpdated = new Date().toISOString();
    
    positions.set(positionId, position);
    
    res.json(order);
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get orders
app.get('/api/brokers/:brokerId/orders', (req, res) => {
  const { brokerId } = req.params;
  const { userId } = req.query;
  
  const brokerOrders = Array.from(orders.values())
    .filter(order => order.brokerId === brokerId && order.userId === userId)
    .sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());
  
  res.json(brokerOrders);
});

// Get positions
app.get('/api/brokers/:brokerId/positions', (req, res) => {
  const { brokerId } = req.params;
  const { userId } = req.query;
  
  const brokerPositions = Array.from(positions.values())
    .filter(position => position.brokerId === brokerId && position.userId === userId && position.quantity !== 0);
  
  res.json(brokerPositions);
});

// Sync broker data
app.post('/api/brokers/:brokerId/sync', (req, res) => {
  try {
    const { brokerId } = req.params;
    const { userId } = req.body;
    
    const connectionId = `${userId}-${brokerId}`;
    const connection = brokerConnections.get(connectionId);
    
    if (connection) {
      connection.lastSyncAt = new Date().toISOString();
      brokerConnections.set(connectionId, connection);
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, lastSyncAt: new Date().toISOString() });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync broker data' });
  }
});

// WebSocket handling for live market data
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  if (pathname.includes('/stream')) {
    const symbols = url.searchParams.get('symbols')?.split(',') || [];
    const userId = url.searchParams.get('userId');
    const brokerId = pathname.split('/')[3]; // Extract broker ID from path
    
    const clientId = `${userId}-${brokerId}-${Date.now()}`;
    marketDataClients.set(clientId, { ws, symbols, userId, brokerId });
    
    console.log(`Market data client connected: ${clientId}, symbols: ${symbols.join(',')}`);
    
    // Send initial data
    symbols.forEach(symbol => {
      const data = generateMockMarketData(symbol);
      ws.send(JSON.stringify(data));
    });
    
    // Send periodic updates
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        symbols.forEach(symbol => {
          const data = generateMockMarketData(symbol);
          ws.send(JSON.stringify(data));
        });
      } else {
        clearInterval(interval);
        marketDataClients.delete(clientId);
      }
    }, 2000); // Update every 2 seconds
    
    ws.on('close', () => {
      clearInterval(interval);
      marketDataClients.delete(clientId);
      console.log(`Market data client disconnected: ${clientId}`);
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clearInterval(interval);
      marketDataClients.delete(clientId);
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connections: brokerConnections.size,
    orders: orders.size,
    positions: positions.size,
    marketDataClients: marketDataClients.size,
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Broker API server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready for market data streaming`);
  console.log(`🔗 Supported brokers: ${Object.keys(BROKER_CONFIGS).join(', ')}`);
});