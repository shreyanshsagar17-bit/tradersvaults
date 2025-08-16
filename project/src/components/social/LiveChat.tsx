import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'trade';
  timestamp: string;
}

interface LiveChatProps {
  groupId: string;
  groupName: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ groupId, groupName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '2',
      user: {
        id: '2',
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      content: 'Just closed my NIFTY 18500 CE position for a nice profit! 🚀',
      type: 'text',
      timestamp: '2024-01-20T10:30:00Z',
    },
    {
      id: '2',
      userId: '3',
      user: {
        id: '3',
        name: 'Mike Rodriguez',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      content: 'Nice trade! What was your entry and exit?',
      type: 'text',
      timestamp: '2024-01-20T10:32:00Z',
    },
    {
      id: '3',
      userId: '2',
      user: {
        id: '2',
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      content: 'Entry at 150, exit at 185. Held for about 2 hours.',
      type: 'text',
      timestamp: '2024-01-20T10:33:00Z',
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers] = useState([
    { id: '2', name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: '3', name: 'Mike Rodriguez', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: '4', name: 'Alex Thompson', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = '1'; // In production, get from auth context

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUserId,
      user: {
        id: currentUserId,
        name: 'John Trader',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="bg-primary-800 rounded-lg border border-primary-700 h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-primary-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{groupName}</h3>
          <p className="text-primary-400 text-sm">{onlineUsers.length} members online</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 3).map((user) => (
              <img
                key={user.id}
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-primary-800"
              />
            ))}
            {onlineUsers.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-primary-600 border-2 border-primary-800 flex items-center justify-center">
                <span className="text-xs text-white">+{onlineUsers.length - 3}</span>
              </div>
            )}
          </div>
          
          <button className="p-2 text-primary-400 hover:text-white transition-colors">
            <Users className="w-4 h-4" />
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
            className={`flex items-start space-x-3 ${
              message.userId === currentUserId ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <img
              src={message.user.avatar}
              alt={message.user.name}
              className="w-8 h-8 rounded-full"
            />
            
            <div className={`flex-1 max-w-xs ${message.userId === currentUserId ? 'text-right' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-white">{message.user.name}</span>
                <span className="text-xs text-primary-400">
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
              </div>
              
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.userId === currentUserId
                    ? 'bg-gold-500 text-primary-900'
                    : 'bg-primary-700 text-white'
                }`}
              >
                {message.content}
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
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-400 hover:text-white transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-gold-500 hover:bg-gold-600 disabled:bg-primary-600 disabled:text-primary-400 text-primary-900 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default LiveChat;