import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface CalendarDay {
  date: Date;
  pnl: number;
  trades: number;
  status: 'profit' | 'loss' | 'neutral' | 'high-profit' | 'high-loss';
}

const TradingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock data - in production, this would come from your trades
  const mockCalendarData: CalendarDay[] = [
    { date: new Date(2024, 0, 15), pnl: 1250, trades: 3, status: 'profit' },
    { date: new Date(2024, 0, 16), pnl: -850, trades: 2, status: 'loss' },
    { date: new Date(2024, 0, 17), pnl: 3500, trades: 5, status: 'high-profit' },
    { date: new Date(2024, 0, 18), pnl: -2100, trades: 4, status: 'high-loss' },
    { date: new Date(2024, 0, 19), pnl: 750, trades: 2, status: 'profit' },
    { date: new Date(2024, 0, 22), pnl: 0, trades: 0, status: 'neutral' },
    { date: new Date(2024, 0, 23), pnl: 1800, trades: 4, status: 'profit' },
  ];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getCalendarData = (date: Date): CalendarDay | undefined => {
    return mockCalendarData.find(day => 
      day.date.toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high-profit':
        return 'bg-success-600 text-white';
      case 'profit':
        return 'bg-success-400 text-white';
      case 'loss':
        return 'bg-danger-400 text-white';
      case 'high-loss':
        return 'bg-danger-600 text-white';
      case 'neutral':
        return 'bg-primary-600 text-primary-200';
      default:
        return 'bg-primary-700 text-primary-300 hover:bg-primary-600';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const totalPnL = mockCalendarData.reduce((sum, day) => sum + day.pnl, 0);
  const totalTrades = mockCalendarData.reduce((sum, day) => sum + day.trades, 0);
  const profitableDays = mockCalendarData.filter(day => day.pnl > 0).length;

  return (
    <div className="bg-primary-800 rounded-lg border border-primary-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gold-500/20 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Trading Calendar</h2>
            <p className="text-primary-300 text-sm">Track your daily performance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success-600 rounded"></div>
              <span className="text-primary-300">High Profit</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success-400 rounded"></div>
              <span className="text-primary-300">Profit</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-danger-400 rounded"></div>
              <span className="text-primary-300">Loss</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-danger-600 rounded"></div>
              <span className="text-primary-300">High Loss</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 text-primary-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 text-primary-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-primary-400 text-sm font-medium">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => {
          const dayData = getCalendarData(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={index}
              className={`
                relative p-2 min-h-[60px] border border-primary-600 rounded cursor-pointer transition-colors
                ${isCurrentMonth ? 'opacity-100' : 'opacity-30'}
                ${isCurrentDay ? 'ring-2 ring-gold-500' : ''}
                ${dayData ? getStatusColor(dayData.status) : 'bg-primary-700 text-primary-300 hover:bg-primary-600'}
              `}
            >
              <div className="text-sm font-medium">
                {format(day, 'd')}
              </div>
              
              {dayData && (
                <div className="mt-1">
                  <div className="text-xs font-medium">
                    {dayData.pnl >= 0 ? '+' : ''}${dayData.pnl}
                  </div>
                  <div className="text-xs opacity-75">
                    {dayData.trades} trades
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-700">
        <div className="text-center">
          <p className="text-primary-400 text-sm">Total P&L</p>
          <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-primary-400 text-sm">Total Trades</p>
          <p className="text-lg font-bold text-white">{totalTrades}</p>
        </div>
        <div className="text-center">
          <p className="text-primary-400 text-sm">Profitable Days</p>
          <p className="text-lg font-bold text-success-400">{profitableDays}</p>
        </div>
      </div>
    </div>
  );
};

export default TradingCalendar;