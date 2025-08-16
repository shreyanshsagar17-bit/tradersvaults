import React, { useState } from 'react';
import { Edit3, MapPin, Calendar, TrendingUp, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const handleSave = () => {
    // In production, this would call an API to update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    });
    setIsEditing(false);
  };

  const stats = [
    { label: 'Total Trades', value: user?.tradingStats.totalTrades },
    { label: 'Win Rate', value: `${user?.tradingStats.winRate}%` },
    { label: 'Total P&L', value: `$${user?.tradingStats.totalPnL.toLocaleString()}` },
    { label: 'Best Trade', value: `$${user?.tradingStats.bestTrade}` },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-primary-800 rounded-lg border border-primary-700 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-gold-500 to-gold-600"></div>
        
        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-20 h-20 rounded-full border-4 border-primary-800 -mt-10"
              />
              <div className="pt-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-2xl font-bold bg-primary-700 border border-primary-600 rounded px-2 py-1 text-white"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                    <p className="text-primary-300">Professional Trader</p>
                  </>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm text-primary-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {user?.joinedAt}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>New York, NY</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full bg-primary-700 border border-primary-600 rounded px-3 py-2 text-primary-200 resize-none"
                placeholder="Tell us about your trading journey..."
              />
            ) : (
              <p className="text-primary-200">{user?.bio}</p>
            )}
          </div>
          </div>

          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-primary-400" />
              <span className="text-white font-medium">{user?.followers}</span>
              <span className="text-primary-400">followers</span>
            </div>
            <div className="flex items-center space-x-1">
              <UserPlus className="w-4 h-4 text-primary-400" />
              <span className="text-white font-medium">{user?.following}</span>
              <span className="text-primary-400">following</span>
            </div>
          </div>
        </div>

      {/* Privacy Settings */}
      <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
        <h2 className="text-lg font-semibold text-white mb-4">Privacy Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Public Profile</h3>
              <p className="text-primary-400 text-sm">Allow others to view your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={user?.privacy.profilePublic} />
              <div className="w-11 h-6 bg-primary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Public Trades</h3>
              <p className="text-primary-400 text-sm">Show your trades in the social feed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={user?.privacy.tradesPublic} />
              <div className="w-11 h-6 bg-primary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Public Statistics</h3>
              <p className="text-primary-400 text-sm">Display your trading stats publicly</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={user?.privacy.statsPublic} />
              <div className="w-11 h-6 bg-primary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;