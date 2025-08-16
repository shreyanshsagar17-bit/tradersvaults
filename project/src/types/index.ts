export interface User {
  id: string;
  email: string;
  name: string;
  gender?: 'male' | 'female';
  avatar?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  isApproved: boolean;
  isAdmin: boolean;
  subscription: Subscription;
  friends: string[];
  groups: string[];
  equityINR: number;
  equityUSD: number;
  bullBadgeINR?: {
    startedOn?: string;
    eligibleOn?: string;
    claimedOn?: string;
  };
  bullBadgeUSD?: {
    startedOn?: string;
    eligibleOn?: string;
    claimedOn?: string;
  };
  tradingStats: {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    bestTrade: number;
    worstTrade: number;
    optionsStats: {
      totalMarginUsed: number;
      totalReturns: number;
      successRate: number;
    };
  };
  privacy: {
    tradesPublic: boolean;
    profilePublic: boolean;
    statsPublic: boolean;
  };
  followers: number;
  following: number;
  joinedAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  baseCurrency: 'INR' | 'USD';
  timezone: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  totalValue: number;
  totalPnL: number;
  assets: PortfolioAsset[];
}

export interface PortfolioAsset {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'forex' | 'commodity' | 'option';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  addedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'trade_share';
  attachments?: string[];
  tradeId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: Pick<User, 'id' | 'name' | 'avatar'>;
  receiver: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Trade {
  id: string;
  userId: string;
  portfolioId?: string;
  symbol: string;
  side: 'long' | 'short';
  type: 'stock' | 'option' | 'multi-leg';
  marketType?: 'forex' | 'crypto' | 'stocks' | 'options';
  
  // Options specific fields
  optionType?: 'call' | 'put';
  optionAction?: 'buy' | 'sell';
  strikePrice?: number;
  expiryDate?: string;
  premium?: number;
  lotSize?: number;
  exchangeLotSize?: number;
  marginUsed?: number;
  marginRequired?: number;
  
  // Multi-leg support
  legs?: TradeLeg[];
  
  // Enhanced fields
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: string;
  exitDate?: string;
  tradeTime?: string;
  isSwing?: boolean;
  pnl?: number;
  pnlPercent?: number;
  returnOnMargin?: number;
  brokerCharges?: number;
  taxes?: number;
  netPnl?: number;
  status: 'open' | 'closed';
  tags: string[];
  tradeStrategy?: 'intraday' | 'swing' | 'hedge' | 'arbitrage' | 'scalping';
  notes?: string;
  images?: string[];
  isPublic: boolean;
  strategy?: string;
  riskReward?: number;
}

export interface TradeLeg {
  id: string;
  symbol: string;
  optionType: 'call' | 'put';
  optionAction: 'buy' | 'sell';
  strikePrice: number;
  expiryDate: string;
  premium: number;
  lotSize: number;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
}

export interface ExchangeLotSize {
  symbol: string;
  lotSize: number;
  tickSize: number;
}

export interface BrokerCharges {
  brokerage: number;
  stt: number;
  exchangeCharges: number;
  gst: number;
  sebiCharges: number;
  stampDuty: number;
  total: number;
}
export interface Strategy {
  id: string;
  userId: string;
  title: string;
  body: string;
  tags: string[];
  images: string[];
  visibility: 'private' | 'friends' | 'public';
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'trade_add' | 'trade_edit' | 'comment' | 'like' | 'follow' | 'badge_earned';
  refId?: string;
  createdAt: string;
  meta?: any;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface AIQuestion {
  id: string;
  userId: string;
  question: string;
  dateRange?: { from: string; to: string };
  ticker?: string;
  strategy?: string;
  answer: string;
  sources?: string[];
  limitations?: string[];
  createdAt: string;
}

export interface OptionsAnalytics {
  totalMarginUsed: number;
  totalReturns: number;
  averageReturn: number;
  successRate: number;
  marginUtilization: number;
  monthlyReturns: { month: string; returns: number; margin: number }[];
  strategyBreakdown: { strategy: string; returns: number; trades: number }[];
}

export interface DayAnalytics {
  dayOfWeek: string;
  totalTrades: number;
  winningTrades: number;
  totalPnL: number;
  averagePnL: number;
  winRate: number;
}

export interface CalendarDay {
  date: string;
  pnl: number;
  trades: number;
  status: 'profit' | 'loss' | 'neutral' | 'high-profit' | 'high-loss';
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
}

export interface TradingGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  isPrivate: boolean;
  createdAt: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  content: string;
  type: 'text' | 'image' | 'trade' | 'chart';
  attachments?: string[];
  createdAt: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  type: 'trade' | 'note' | 'milestone';
  content: string;
  tradeId?: string;
  trade?: Trade;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  content: string;
  createdAt: string;
}

export interface BrokerConnection {
  id: string;
  userId: string;
  brokerId: string;
  brokerName: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  lastSyncAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Broker {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  description: string;
  authType: 'oauth' | 'api_key' | 'credentials';
  features: {
    liveData: boolean;
    orderPlacement: boolean;
    portfolioSync: boolean;
    optionsTrading: boolean;
  };
  endpoints: {
    auth: string;
    orders: string;
    positions: string;
    liveData: string;
  };
  isActive: boolean;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: string;
}

export interface Order {
  id: string;
  userId: string;
  brokerId: string;
  brokerOrderId?: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_loss' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected' | 'partial';
  filledQuantity: number;
  averagePrice?: number;
  orderTime: string;
  updateTime?: string;
  validity: 'day' | 'ioc' | 'gtc';
  product: 'mis' | 'cnc' | 'nrml';
  exchange: 'NSE' | 'BSE' | 'MCX' | 'NCDEX';
}

export interface Position {
  id: string;
  userId: string;
  brokerId: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  product: 'mis' | 'cnc' | 'nrml';
  exchange: 'NSE' | 'BSE' | 'MCX' | 'NCDEX';
  lastUpdated: string;
}

export interface TradeFilter {
  symbol?: string;
  side?: 'long' | 'short' | 'all';
  status?: 'open' | 'closed' | 'all';
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  minPnL?: number;
  maxPnL?: number;
}

export interface Analytics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  bestTrade: number;
  worstTrade: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: { date: string; value: number }[];
  monthlyReturns: { month: string; pnl: number }[];
  symbolBreakdown: { symbol: string; pnl: number; trades: number }[];
}