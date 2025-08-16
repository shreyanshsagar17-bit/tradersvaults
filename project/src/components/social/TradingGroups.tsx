import React, { useState } from 'react';
import { Users, Plus, Lock, Globe, MessageCircle, Settings, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface TradingGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  isPrivate: boolean;
  avatar: string;
  lastActivity: string;
  isJoined: boolean;
}

const TradingGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-groups');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const myGroups: TradingGroup[] = [
    {
      id: '1',
      name: 'Options Masters',
      description: 'Advanced options trading strategies and discussions',
      members: 156,
      isPrivate: false,
      avatar: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400',
      lastActivity: '2 hours ago',
      isJoined: true,
    },
    {
      id: '2',
      name: 'Forex Elite',
      description: 'Professional forex traders sharing insights',
      members: 89,
      isPrivate: true,
      avatar: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400',
      lastActivity: '5 minutes ago',
      isJoined: true,
    },
  ];

  const discoverGroups: TradingGroup[] = [
    {
      id: '3',
      name: 'Crypto Traders Hub',
      description: 'Cryptocurrency trading community',
      members: 234,
      isPrivate: false,
      avatar: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
      lastActivity: '1 hour ago',
      isJoined: false,
    },
    {
      id: '4',
      name: 'Day Trading Pros',
      description: 'Fast-paced day trading strategies',
      members: 178,
      isPrivate: false,
      avatar: 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=400',
      lastActivity: '30 minutes ago',
      isJoined: false,
    },
  ];

  const handleJoinGroup = (groupId: string) => {
    console.log('Joining group:', groupId);
    toast.success('Successfully joined the group!');
    // In production, this would call the API and update state
  };

  const tabs = [
    { id: 'my-groups', label: 'My Groups', count: myGroups.length },
    { id: 'discover', label: 'Discover', count: discoverGroups.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gold-500/20 rounded-lg">
            <Users className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Trading Groups</h1>
            <p className="text-primary-300">Connect with like-minded traders</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-primary-800 p-1 rounded-lg border border-primary-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gold-500 text-primary-900'
                : 'text-primary-300 hover:text-white hover:bg-primary-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id
                ? 'bg-primary-900 text-gold-400'
                : 'bg-gold-500 text-primary-900'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'my-groups' ? myGroups : discoverGroups).map((group) => (
          <div key={group.id} className="bg-primary-800 rounded-lg border border-primary-700 overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-gold-500/20 to-primary-700">
              <img
                src={group.avatar}
                alt={group.name}
                className="w-16 h-16 rounded-full border-4 border-primary-800 absolute bottom-0 left-4 transform translate-y-1/2"
              />
              <div className="absolute top-4 right-4">
                {group.isPrivate ? (
                  <Lock className="w-4 h-4 text-primary-300" />
                ) : (
                  <Globe className="w-4 h-4 text-primary-300" />
                )}
              </div>
            </div>
            
            <div className="p-6 pt-10">
              <h3 className="text-lg font-semibold text-white mb-2">{group.name}</h3>
              <p className="text-primary-300 text-sm mb-4">{group.description}</p>
              
              <div className="flex items-center justify-between text-sm text-primary-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{group.members} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{group.lastActivity}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {group.isJoined ? (
                  <>
                    <button className="flex-1 bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Open Chat</span>
                    </button>
                    <button className="p-2 text-primary-400 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Join Group</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-800 rounded-lg border border-primary-700 w-full max-w-md mx-4">
            <div className="p-6 border-b border-primary-700">
              <h3 className="text-lg font-semibold text-white">Create New Group</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your group"
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private-group"
                  className="w-4 h-4 text-gold-500 bg-primary-700 border-primary-600 rounded focus:ring-gold-500 focus:ring-2"
                />
                <label htmlFor="private-group" className="text-sm text-primary-300">
                  Make this group private
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-primary-700 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors">
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingGroups;