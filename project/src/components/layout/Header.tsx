import React, { useState } from 'react';
import { Bell, Search, User, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MessagingSystem from '../messaging/MessagingSystem';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMessaging, setShowMessaging] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  const [unreadMessages] = useState(5); // In production, get from context/API
  return (
    <>
      <header className="bg-primary-900 border-b border-primary-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Search trades, users..."
              className="pl-10 pr-4 py-2 bg-primary-800 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-primary-300 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full text-xs flex items-center justify-center text-primary-900 font-medium">
              3
            </span>
          </button>

          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full border-2 border-gold-500"
            />
            <span className="font-medium text-white">{user?.name}</span>
          </div>

          <button 
              onClick={() => setShowMessaging(true)}
              className="relative p-2 text-primary-300 hover:text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full text-xs flex items-center justify-center text-primary-900 font-medium">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>

          <button
            onClick={handleLogout}
            className="p-2 text-primary-300 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      </header>

      {/* Messaging System Modal */}
      {showMessaging && (
        <MessagingSystem onClose={() => setShowMessaging(false)} />
      )}
    </>
  );
};

export default Header;