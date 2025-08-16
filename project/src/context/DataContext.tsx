import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Trade, User, SocialPost } from '../types';

interface DataContextType {
  trades: Trade[];
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  socialPosts: SocialPost[];
  setSocialPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  following: string[];
  setFollowing: React.Dispatch<React.SetStateAction<string[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const value: DataContextType = {
    trades,
    setTrades,
    users,
    setUsers,
    socialPosts,
    setSocialPosts,
    following,
    setFollowing,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};