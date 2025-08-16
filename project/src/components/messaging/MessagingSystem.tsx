import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Image, 
  X,
  Check,
  CheckCheck,
  Circle,
  Phone,
  Video
} from 'lucide-react';
import { messageService } from '../../services/api';
import { Message, Conversation } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface MessagingSystemProps {
  onClose: () => void;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({ onClose }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = '1'; // In production, get from auth context

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const conversationsData = await messageService.getConversations();
      setConversations(conversationsData);
      if (conversationsData.length > 0) {
        setSelectedConversation(conversationsData[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await messageService.getMessages(conversationId);
      setMessages(messagesData);
      
      // Mark messages as read
      const unreadMessages = messagesData.filter(m => !m.isRead && m.receiverId === currentUserId);
      for (const message of unreadMessages) {
        await messageService.markAsRead(message.id);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const searchUsers = async () => {
    try {
      const users = await messageService.searchUsers(searchQuery);
      setSearchResults(users);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const otherParticipant = selectedConversation.participants.find(p => p !== currentUserId);
      if (!otherParticipant) return;

      const message = await messageService.sendMessage(otherParticipant, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Update conversation's last message
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
          : conv
      ));
      
      toast.success('Message sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = async (userId: string) => {
    try {
      // In a real app, this would create a new conversation
      const message = await messageService.sendMessage(userId, 'Hello!');
      
      // Create a mock conversation for demo
      const newConversation: Conversation = {
        id: Date.now().toString(),
        participants: [currentUserId, userId],
        lastMessage: message,
        unreadCount: 0,
        updatedAt: message.createdAt,
      };
      
      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
      
      toast.success('New conversation started!');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.lastMessage.senderId === currentUserId 
      ? conversation.lastMessage.receiver 
      : conversation.lastMessage.sender;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-primary-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto"></div>
          <p className="text-white mt-4">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-primary-800 rounded-lg border border-primary-700 w-full max-w-6xl h-[80vh] mx-4 flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-primary-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-primary-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-accent-400" />
              <h2 className="text-lg font-semibold text-white">Messages</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="p-2 text-primary-400 hover:text-white transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-primary-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Chat Search */}
          {showNewChat && (
            <div className="p-4 border-b border-primary-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startNewConversation(user.id)}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      <div className="relative">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-400 rounded-full border-2 border-primary-800"></div>
                        )}
                      </div>
                      <span className="text-white text-sm">{user.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 flex items-start space-x-3 hover:bg-primary-700 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-primary-700' : ''
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={otherParticipant.avatar} 
                      alt={otherParticipant.name} 
                      className="w-12 h-12 rounded-full" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-400 rounded-full border-2 border-primary-800"></div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-medium">{otherParticipant.name}</h3>
                      <span className="text-xs text-primary-400">
                        {format(new Date(conversation.lastMessage.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-primary-300 text-sm truncate">
                      {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <div className="mt-1">
                        <span className="bg-accent-500 text-primary-900 text-xs px-2 py-0.5 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-primary-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={getOtherParticipant(selectedConversation).avatar} 
                    alt={getOtherParticipant(selectedConversation).name}
                    className="w-10 h-10 rounded-full" 
                  />
                  <div>
                    <h3 className="text-white font-medium">
                      {getOtherParticipant(selectedConversation).name}
                    </h3>
                    <p className="text-primary-400 text-sm">Online</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-primary-400 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-primary-400 hover:text-white transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-primary-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.senderId === currentUserId ? 'order-2' : 'order-1'
                    }`}>
                      <div className={`p-3 rounded-lg ${
                        message.senderId === currentUserId
                          ? 'bg-accent-500 text-primary-900'
                          : 'bg-primary-700 text-white'
                      }`}>
                        <p>{message.content}</p>
                      </div>
                      <div className={`flex items-center mt-1 space-x-1 ${
                        message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-primary-400">
                          {format(new Date(message.createdAt), 'HH:mm')}
                        </span>
                        {message.senderId === currentUserId && (
                          <div className="text-primary-400">
                            {message.isRead ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-primary-700">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 text-primary-400 hover:text-white transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-primary-400 hover:text-white transition-colors"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-2 bg-accent-500 hover:bg-accent-600 disabled:bg-primary-600 disabled:text-primary-400 text-primary-900 rounded-lg transition-colors"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-900"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-primary-400">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;