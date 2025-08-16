import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, UserPlus, Users, Plus } from 'lucide-react';
import { socialService } from '../services/api';
import { format } from 'date-fns';
import TradingGroups from '../components/social/TradingGroups';
import LiveChat from '../components/social/LiveChat';
import toast from 'react-hot-toast';

const Social: React.FC = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const feedData = await socialService.getFeed();
      setPosts(feedData);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts((prevPosts: any[]) => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
    toast.success(posts.find(p => p.id === postId)?.isLiked ? 'Unliked post' : 'Liked post');
  };

  const tabs = [
    { id: 'feed', label: 'Social Feed', icon: Heart },
    { id: 'groups', label: 'Trading Groups', icon: Users },
    { id: 'friends', label: 'Friends', icon: UserPlus },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedGroup(null)}
            className="text-primary-400 hover:text-white transition-colors"
          >
            ← Back to Groups
          </button>
        </div>
        <LiveChat groupId={selectedGroup} groupName="Options Masters" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Trading</h1>
          <p className="text-primary-300">Connect with traders and share insights</p>
        </div>
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
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'groups' && <TradingGroups />}

      {activeTab === 'friends' && (
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Friends</h2>
            <button className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Friend</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Sarah Chen', handle: '@sarahtrader', status: 'online', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Mike Rodriguez', handle: '@mikeforex', status: 'offline', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Alex Thompson', handle: '@alexcrypto', status: 'online', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' },
            ].map((friend, index) => (
              <div key={index} className="bg-primary-700 rounded-lg p-4 flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-primary-700 ${
                    friend.status === 'online' ? 'bg-success-400' : 'bg-primary-500'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{friend.name}</h4>
                  <p className="text-primary-400 text-sm">{friend.handle}</p>
                </div>
                <button className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded text-sm transition-colors">
                  Message
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feed' && (
        <div className="max-w-4xl mx-auto space-y-6">
      {/* Suggested Traders */}
      <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
        <h3 className="text-lg font-semibold text-white mb-4">Suggested Traders</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Alex Chen', handle: '@alextrader', followers: '2.1k', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400' },
            { name: 'Mike Rodriguez', handle: '@mikeforex', followers: '1.8k', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400' },
            { name: 'Sarah Johnson', handle: '@sarahcrypto', followers: '3.2k', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' },
          ].map((trader, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-primary-700 rounded-lg">
              <img
                src={trader.avatar}
                alt={trader.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h4 className="text-white font-medium">{trader.name}</h4>
                <p className="text-primary-400 text-sm">{trader.followers} followers</p>
              </div>
              <button className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1">
                <UserPlus className="w-3 h-3" />
                <span>Follow</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post: any) => (
          <div key={post.id} className="bg-primary-800 rounded-lg border border-primary-700">
            {/* Post Header */}
            <div className="p-6 border-b border-primary-700">
              <div className="flex items-center space-x-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{post.user.name}</h4>
                  <p className="text-primary-400 text-sm">
                    {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  post.type === 'trade' ? 'bg-gold-500/20 text-gold-400' :
                  post.type === 'note' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {post.type}
                </span>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-6">
              <p className="text-primary-200 text-lg">{post.content}</p>
              
              {post.trade && (
                <div className="mt-4 p-4 bg-primary-700 rounded-lg border border-primary-600">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-primary-400">Symbol</p>
                      <p className="text-white font-medium">{post.trade.symbol}</p>
                    </div>
                    <div>
                      <p className="text-primary-400">Side</p>
                      <p className={`font-medium ${
                        post.trade.side === 'long' ? 'text-success-400' : 'text-danger-400'
                      }`}>
                        {post.trade.side.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-400">P&L</p>
                      <p className={`font-medium ${
                        post.trade.pnl >= 0 ? 'text-success-400' : 'text-danger-400'
                      }`}>
                        ${post.trade.pnl}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-400">R:R</p>
                      <p className="text-white font-medium">{post.trade.riskReward}:1</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-6 py-4 border-t border-primary-700 flex items-center space-x-6">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-2 transition-colors ${
                  post.isLiked ? 'text-danger-400' : 'text-primary-400 hover:text-danger-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-2 text-primary-400 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </button>
              <button className="flex items-center space-x-2 text-primary-400 hover:text-white transition-colors">
                <Share className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
        </div>
      )}
    </div>
  );
};

export default Social;