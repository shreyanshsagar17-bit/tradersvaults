// Mock API service - In production, this would connect to your backend
export const authService = {
  async loginWithGoogle(googleToken: string) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser = {
      id: '1',
      email: 'trader@example.com',
      name: 'John Trader',
      gender: 'male' as const,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Professional day trader focused on forex and crypto markets.',
      country: 'India',
      timezone: 'Asia/Kolkata',
      isApproved: true,
      isAdmin: false,
      equityINR: 150000,
      equityUSD: 95000,
      bullBadgeINR: {
        startedOn: '2024-01-15',
      },
      bullBadgeUSD: {
        startedOn: '2024-02-01',
      },
      subscription: {
        id: '1',
        userId: '1',
        plan: 'trial',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-01-29',
        trialEndsAt: '2024-01-29',
      },
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      friends: ['2', '3'],
      groups: ['1', '2'],
      tradingStats: {
        totalTrades: 156,
        winRate: 68.5,
        totalPnL: 24500,
        bestTrade: 2850,
        worstTrade: -1200,
        optionsStats: {
          totalMarginUsed: 245000,
          totalReturns: 45600,
          successRate: 72,
        },
      },
      privacy: {
        tradesPublic: true,
        profilePublic: true,
        statsPublic: true,
      },
      followers: 245,
      following: 89,
      joinedAt: '2024-01-15',
    };

    return {
      token: 'mock-jwt-token',
      user: mockUser,
      requiresApproval: !mockUser.isApproved,
    };
  },

  async verifyToken(token: string) {
    // Simulate token verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: '1',
      email: 'trader@example.com',
      name: 'John Trader',
      gender: 'male' as const,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Professional day trader focused on forex and crypto markets.',
      country: 'India',
      timezone: 'Asia/Kolkata',
      isApproved: true,
      isAdmin: false,
      equityINR: 150000,
      equityUSD: 95000,
      bullBadgeINR: {
        startedOn: '2024-01-15',
      },
      bullBadgeUSD: {
        startedOn: '2024-02-01',
      },
      subscription: {
        id: '1',
        userId: '1',
        plan: 'trial',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-01-29',
        trialEndsAt: '2024-01-29',
      },
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      friends: ['2', '3'],
      groups: ['1', '2'],
      tradingStats: {
        totalTrades: 156,
        winRate: 68.5,
        totalPnL: 24500,
        bestTrade: 2850,
        worstTrade: -1200,
        optionsStats: {
          totalMarginUsed: 245000,
          totalReturns: 45600,
          successRate: 72,
        },
      },
      privacy: {
        tradesPublic: true,
        profilePublic: true,
        statsPublic: true,
      },
      followers: 245,
      following: 89,
      joinedAt: '2024-01-15',
    };
  },
};

export const portfolioService = {
  async getPortfolios() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '1',
        name: 'Main Trading Portfolio',
        description: 'Primary portfolio for day trading and swing trades',
        baseCurrency: 'INR' as const,
        timezone: 'Asia/Kolkata',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        isDefault: true,
        totalValue: 50000,
        totalPnL: 12500,
        assets: [],
      },
      {
        id: '2',
        userId: '1',
        name: 'Long-term Investments',
        description: 'Portfolio for long-term stock and crypto investments',
        baseCurrency: 'USD' as const,
        timezone: 'America/New_York',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
        isDefault: false,
        totalValue: 25000,
        totalPnL: 3500,
        assets: [],
      },
    ];
  },

  async createPortfolio(portfolio: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      ...portfolio, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalValue: 0,
      totalPnL: 0,
      assets: [],
    };
  },

  async updatePortfolio(id: string, updates: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      ...updates, 
      id,
      updatedAt: new Date().toISOString(),
    };
  },

  async deletePortfolio(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async addAssetToPortfolio(portfolioId: string, asset: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      ...asset,
      id: Date.now().toString(),
      portfolioId,
      addedAt: new Date().toISOString(),
    };
  },

  async removeAssetFromPortfolio(portfolioId: string, assetId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
};

export const activityService = {
  async getRecentActivity() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '1',
        type: 'trade_add' as const,
        refId: 'trade-123',
        createdAt: '2024-01-20T10:30:00Z',
        meta: { symbol: 'EURUSD', pnl: 750 },
        user: {
          id: '1',
          name: 'John Trader',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
      },
      {
        id: '2',
        userId: '2',
        type: 'follow' as const,
        refId: '1',
        createdAt: '2024-01-20T09:15:00Z',
        meta: {},
        user: {
          id: '2',
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
      },
    ];
  },
};

export const friendshipService = {
  async sendFriendRequest(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async acceptFriendRequest(requestId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async rejectFriendRequest(requestId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async removeFriend(friendId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
};

export const aiService = {
  async askQuestion(question: string, filters?: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: Date.now().toString(),
      userId: '1',
      question,
      answer: `Based on your trading data analysis, here are the key insights: Your win rate has improved by 12% over the selected period. The EURUSD pair shows the strongest performance with consistent profits. Consider reducing position sizes on Friday trades as they show lower success rates.`,
      sources: ['Trade History Analysis', 'Market Correlation Data', 'Risk Metrics'],
      limitations: ['Analysis based on historical data only', 'Market conditions may change', 'Past performance does not guarantee future results'],
      createdAt: new Date().toISOString(),
      ...filters,
    };
  },

  async getQuestionHistory() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '1',
        question: 'What is my best performing trading strategy?',
        answer: 'Your momentum breakout strategy shows the highest win rate at 78% with an average profit of $485 per trade.',
        sources: ['Strategy Performance Data'],
        limitations: ['Based on last 6 months data'],
        createdAt: '2024-01-19T14:30:00Z',
      },
    ];
  },
};

export const strategyService = {
  async getStrategies() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '1',
        title: 'Momentum Breakout Strategy',
        body: 'This strategy focuses on identifying strong momentum breakouts with volume confirmation...',
        tags: ['momentum', 'breakout', 'volume'],
        images: [],
        visibility: 'public' as const,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      },
    ];
  },

  async createStrategy(strategy: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...strategy, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  },

  async updateStrategy(id: string, strategy: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...strategy, id, updatedAt: new Date().toISOString() };
  },
};

export const optionsService = {
  async getExchangeLotSizes() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { symbol: 'NIFTY', lotSize: 50, tickSize: 0.05 },
      { symbol: 'BANKNIFTY', lotSize: 15, tickSize: 0.05 },
      { symbol: 'FINNIFTY', lotSize: 40, tickSize: 0.05 },
      { symbol: 'MIDCPNIFTY', lotSize: 75, tickSize: 0.05 },
      { symbol: 'SENSEX', lotSize: 10, tickSize: 0.05 },
      { symbol: 'BANKEX', lotSize: 15, tickSize: 0.05 },
      { symbol: 'RELIANCE', lotSize: 250, tickSize: 0.05 },
      { symbol: 'TCS', lotSize: 150, tickSize: 0.05 },
      { symbol: 'HDFC', lotSize: 300, tickSize: 0.05 },
      { symbol: 'ICICIBANK', lotSize: 375, tickSize: 0.05 },
    ];
  },

  calculateBrokerCharges(premium: number, lotSize: number, quantity: number, isOptions: boolean = true) {
    const totalValue = premium * lotSize * quantity;
    
    // Standard brokerage charges for options
    const brokerage = isOptions ? Math.min(20 * quantity, totalValue * 0.0005) : totalValue * 0.0003;
    const stt = isOptions ? totalValue * 0.00125 : totalValue * 0.001; // STT on options
    const exchangeCharges = totalValue * 0.0000345;
    const sebiCharges = totalValue * 0.000001;
    const gst = (brokerage + exchangeCharges + sebiCharges) * 0.18;
    const stampDuty = totalValue * 0.00003;
    
    const total = brokerage + stt + exchangeCharges + gst + sebiCharges + stampDuty;
    
    return {
      brokerage: Math.round(brokerage * 100) / 100,
      stt: Math.round(stt * 100) / 100,
      exchangeCharges: Math.round(exchangeCharges * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      sebiCharges: Math.round(sebiCharges * 100) / 100,
      stampDuty: Math.round(stampDuty * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },

  calculateOptionsPnL(legs: any[], exitPremiums: number[] = []) {
    let totalPnl = 0;
    let totalBrokerCharges = 0;
    
    legs.forEach((leg, index) => {
      const entryValue = leg.premium * leg.lotSize * leg.quantity;
      const exitValue = exitPremiums[index] ? exitPremiums[index] * leg.lotSize * leg.quantity : 0;
      
      let legPnl = 0;
      if (leg.optionAction === 'buy') {
        legPnl = exitValue - entryValue;
      } else {
        legPnl = entryValue - exitValue;
      }
      
      const charges = this.calculateBrokerCharges(leg.premium, leg.lotSize, leg.quantity, true);
      totalBrokerCharges += charges.total;
      totalPnl += legPnl;
    });
    
    const netPnl = totalPnl - totalBrokerCharges;
    
    return {
      grossPnl: Math.round(totalPnl * 100) / 100,
      brokerCharges: Math.round(totalBrokerCharges * 100) / 100,
      netPnl: Math.round(netPnl * 100) / 100,
    };
  },
};

export const tradeService = {
  async getTrades() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '1',
        portfolioId: '1',
        symbol: 'EURUSD',
        type: 'stock',
        marketType: 'forex' as const,
        side: 'long' as const,
        entryPrice: 1.0850,
        exitPrice: 1.0920,
        quantity: 100000,
        entryDate: '2024-01-20T09:30:00Z',
        exitDate: '2024-01-20T14:45:00Z',
        tradeTime: '2024-01-20T09:30:00Z',
        isSwing: false,
        pnl: 700,
        pnlPercent: 6.45,
        status: 'closed' as const,
        tags: ['scalp', 'forex'],
        notes: 'Great momentum trade after ECB news',
        images: [],
        isPublic: true,
        strategy: 'News Trading',
        riskReward: 2.1,
      },
      {
        id: '2',
        userId: '1',
        portfolioId: '1',
        symbol: 'BTCUSD',
        type: 'stock',
        marketType: 'crypto' as const,
        side: 'short' as const,
        entryPrice: 42500,
        exitPrice: 41800,
        quantity: 0.5,
        entryDate: '2024-01-19T16:20:00Z',
        exitDate: '2024-01-19T18:30:00Z',
        tradeTime: '2024-01-19T16:20:00Z',
        isSwing: true,
        pnl: 350,
        pnlPercent: 1.65,
        status: 'closed' as const,
        tags: ['crypto', 'technical'],
        notes: 'Resistance rejection at key level',
        images: [],
        isPublic: true,
        strategy: 'Technical Analysis',
        riskReward: 1.8,
      },
      {
        id: '3',
        userId: '1',
        portfolioId: '1',
        symbol: 'NIFTY',
        type: 'option',
        marketType: 'options' as const,
        optionType: 'CE',
        optionAction: 'sell',
        strikePrice: 18500,
        expiryDate: '2024-01-25',
        premium: 150,
        marginUsed: 85000,
        marginRequired: 85000,
        side: 'short' as const,
        entryPrice: 150,
        exitPrice: 75,
        quantity: 2,
        entryDate: '2024-01-18T09:15:00Z',
        exitDate: '2024-01-18T15:30:00Z',
        tradeTime: '2024-01-18T09:15:00Z',
        isSwing: false,
        pnl: 150,
        pnlPercent: 50,
        returnOnMargin: 8.8,
        status: 'closed' as const,
        tags: ['options', 'selling'],
        notes: 'Sold at high IV, bought back at 50% profit',
        images: [],
        isPublic: true,
        strategy: 'Options Selling',
        riskReward: 1.5,
      },
    ];
  },

  async addTrade(trade: Partial<Trade>) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enhanced trade processing with options support
    const processedTrade = {
      ...trade,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Calculate additional fields for options trades
    if (trade.type === 'option' && trade.premium && trade.lotSize && trade.exchangeLotSize) {
      const totalValue = trade.premium * trade.exchangeLotSize * parseInt(trade.lotSize.toString());
      const charges = optionsService.calculateBrokerCharges(
        trade.premium, 
        trade.exchangeLotSize, 
        parseInt(trade.lotSize.toString()), 
        true
      );
      
      processedTrade.marginUsed = totalValue;
      processedTrade.brokerCharges = charges.total;
      
      // Calculate P&L if exit price is available
      if (trade.exitPrice) {
        const exitValue = trade.exitPrice * trade.exchangeLotSize * parseInt(trade.lotSize.toString());
        let grossPnl = 0;
        
        if (trade.optionAction === 'buy') {
          grossPnl = exitValue - totalValue;
        } else {
          grossPnl = totalValue - exitValue;
        }
        
        processedTrade.pnl = grossPnl;
        processedTrade.netPnl = grossPnl - charges.total;
        processedTrade.pnlPercent = (grossPnl / totalValue) * 100;
        processedTrade.returnOnMargin = (grossPnl / totalValue) * 100;
      }
    }
    
    // Process multi-leg trades
    if (trade.type === 'multi-leg' && trade.legs) {
      const exitPremiums = trade.legs.map(leg => leg.exitPrice || 0);
      const pnlData = optionsService.calculateOptionsPnL(trade.legs, exitPremiums);
      
      processedTrade.pnl = pnlData.grossPnl;
      processedTrade.netPnl = pnlData.netPnl;
      processedTrade.brokerCharges = pnlData.brokerCharges;
    }
    
    return processedTrade;
  },

  async updateTrade(id: string, updates: Partial<Trade>) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...updates, id, updatedAt: new Date().toISOString() };
  },

  async deleteTrade(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
};

export const groupService = {
  async getUserGroups() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        name: 'Options Masters',
        description: 'Advanced options trading strategies',
        createdBy: '1',
        members: ['1', '2', '3'],
        isPrivate: false,
        createdAt: '2024-01-10T00:00:00Z',
        avatar: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ];
  },

  async getGroupTrades(groupId: string, filters?: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '2',
        user: {
          id: '2',
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        symbol: 'AAPL',
        side: 'long' as const,
        entryPrice: 150.25,
        exitPrice: 175.80,
        pnl: 1277.50,
        createdAt: '2024-01-20T10:30:00Z',
      },
    ];
  },

  async createGroup(group: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...group, id: Date.now().toString() };
  },

  async joinGroup(groupId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async leaveGroup(groupId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
};

export const imageService = {
  async compressAndUpload(file: File): Promise<string> {
    // Simulate compression and upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would compress the image and upload to cloud storage
    return URL.createObjectURL(file);
  },
};

export const messageService = {
  async getConversations() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        participants: ['1', '2'],
        lastMessage: {
          id: '3',
          senderId: '2',
          receiverId: '1',
          content: 'Great trade on AAPL! How did you time the entry?',
          type: 'text' as const,
          isRead: false,
          createdAt: '2024-01-20T14:30:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
          sender: {
            id: '2',
            name: 'Sarah Chen',
            avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
          receiver: {
            id: '1',
            name: 'John Trader',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
        },
        unreadCount: 2,
        updatedAt: '2024-01-20T14:30:00Z',
      },
      {
        id: '2',
        participants: ['1', '3'],
        lastMessage: {
          id: '5',
          senderId: '1',
          receiverId: '3',
          content: 'Thanks for the market analysis!',
          type: 'text' as const,
          isRead: true,
          createdAt: '2024-01-19T16:45:00Z',
          updatedAt: '2024-01-19T16:45:00Z',
          sender: {
            id: '1',
            name: 'John Trader',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
          receiver: {
            id: '3',
            name: 'Mike Rodriguez',
            avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
        },
        unreadCount: 0,
        updatedAt: '2024-01-19T16:45:00Z',
      },
    ];
  },

  async getMessages(conversationId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        senderId: '1',
        receiverId: '2',
        content: 'Hey Sarah! Just saw your TSLA trade, impressive timing!',
        type: 'text' as const,
        isRead: true,
        createdAt: '2024-01-20T10:15:00Z',
        updatedAt: '2024-01-20T10:15:00Z',
        sender: {
          id: '1',
          name: 'John Trader',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        receiver: {
          id: '2',
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
      },
      {
        id: '2',
        senderId: '2',
        receiverId: '1',
        content: 'Thanks! I\'ve been watching the support levels for weeks. The breakout was textbook.',
        type: 'text' as const,
        isRead: true,
        createdAt: '2024-01-20T10:18:00Z',
        updatedAt: '2024-01-20T10:18:00Z',
        sender: {
          id: '2',
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        receiver: {
          id: '1',
          name: 'John Trader',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
      },
      {
        id: '3',
        senderId: '2',
        receiverId: '1',
        content: 'Great trade on AAPL! How did you time the entry?',
        type: 'text' as const,
        isRead: false,
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        sender: {
          id: '2',
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        receiver: {
          id: '1',
          name: 'John Trader',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
      },
    ];
  },

  async sendMessage(receiverId: string, content: string, type: string = 'text', attachments?: string[], tradeId?: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: Date.now().toString(),
      senderId: '1', // Current user
      receiverId,
      content,
      type,
      attachments,
      tradeId,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: '1',
        name: 'John Trader',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      receiver: {
        id: receiverId,
        name: 'User Name',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    };
  },

  async markAsRead(messageId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },

  async deleteMessage(messageId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },

  async searchUsers(query: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '2',
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        isOnline: true,
      },
      {
        id: '3',
        name: 'Mike Rodriguez',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
        isOnline: false,
      },
      {
        id: '4',
        name: 'Alex Thompson',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        isOnline: true,
      },
    ].filter(user => user.name.toLowerCase().includes(query.toLowerCase()));
  },
};

export const socialService = {
  async getFeed() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        userId: '2',
        user: {
          id: '2',
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        type: 'trade' as const,
        content: 'Just closed a beautiful swing trade on AAPL! +$1,250 profit 🚀',
        tradeId: '3',
        likes: 23,
        comments: [],
        isLiked: false,
        createdAt: '2024-01-20T10:30:00Z',
      },
      {
        id: '2',
        userId: '3',
        user: {
          id: '3',
          name: 'Mike Rodriguez',
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        type: 'note' as const,
        content: 'Market outlook: Expecting volatility ahead of Fed announcement. Playing it safe with smaller position sizes.',
        likes: 15,
        comments: [],
        isLiked: true,
        createdAt: '2024-01-20T08:15:00Z',
      },
    ];
  },
};