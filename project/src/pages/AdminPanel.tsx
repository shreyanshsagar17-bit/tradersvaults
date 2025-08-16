import React, { useState } from 'react';
import { Users, UserCheck, UserX, Shield, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      joinedAt: '2024-01-20T10:30:00Z',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      joinedAt: '2024-01-19T15:45:00Z',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
  ];

  const approvedUsers = [
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      joinedAt: '2024-01-15T09:20:00Z',
      isAdmin: false,
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
  ];

  const handleApprove = (userId: string) => {
    console.log('Approving user:', userId);
    toast.success('User approved successfully!');
    // In production, this would call the API and update state
  };

  const handleReject = (userId: string) => {
    console.log('Rejecting user:', userId);
    toast.success('User rejected successfully!');
    // In production, this would call the API and update state
  };

  const handleToggleAdmin = (userId: string) => {
    console.log('Toggling admin status for user:', userId);
    toast.success('Admin status updated successfully!');
    // In production, this would call the API and update state
  };

  const tabs = [
    { id: 'pending', label: 'Pending Approval', icon: UserCheck, count: pendingUsers.length },
    { id: 'approved', label: 'Approved Users', icon: Users, count: approvedUsers.length },
    { id: 'analytics', label: 'Platform Analytics', icon: Activity, count: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gold-500/20 rounded-lg">
          <Shield className="w-6 h-6 text-gold-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-primary-300">Manage users and platform settings</p>
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
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-primary-900 text-gold-400'
                  : 'bg-gold-500 text-primary-900'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <div className="bg-primary-800 rounded-lg border border-primary-700">
          <div className="p-6 border-b border-primary-700">
            <h2 className="text-lg font-semibold text-white">Users Pending Approval</h2>
          </div>
          <div className="divide-y divide-primary-700">
            {pendingUsers.map((user) => (
              <div key={user.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-white font-medium">{user.name}</h3>
                    <p className="text-primary-400 text-sm">{user.email}</p>
                    <p className="text-primary-500 text-xs">
                      Requested: {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="bg-danger-600 hover:bg-danger-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
            {pendingUsers.length === 0 && (
              <div className="p-12 text-center">
                <UserCheck className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <p className="text-primary-400">No users pending approval</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'approved' && (
        <div className="bg-primary-800 rounded-lg border border-primary-700">
          <div className="p-6 border-b border-primary-700">
            <h2 className="text-lg font-semibold text-white">Approved Users</h2>
          </div>
          <div className="divide-y divide-primary-700">
            {approvedUsers.map((user) => (
              <div key={user.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-medium">{user.name}</h3>
                      {user.isAdmin && (
                        <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded text-xs font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-primary-400 text-sm">{user.email}</p>
                    <p className="text-primary-500 text-xs">
                      Joined: {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleAdmin(user.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      user.isAdmin
                        ? 'bg-danger-600 hover:bg-danger-700 text-white'
                        : 'bg-gold-600 hover:bg-gold-700 text-primary-900'
                    }`}
                  >
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Users', value: '1,234', change: '+12%' },
            { title: 'Active Users', value: '892', change: '+8%' },
            { title: 'Total Trades', value: '45,678', change: '+15%' },
            { title: 'Platform Revenue', value: '$12,500', change: '+22%' },
          ].map((stat, index) => (
            <div key={index} className="bg-primary-800 rounded-lg p-6 border border-primary-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-primary-300 text-sm">{stat.title}</h3>
                <span className="text-success-400 text-sm font-medium">{stat.change}</span>
              </div>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;