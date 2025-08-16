import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // For demo purposes, if token exists, set mock user
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
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<boolean> => {
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user data
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
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
      
      // Set mock token and user data
      localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
      setUser(mockUser);
      toast.success('Welcome to Traders Vault!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};