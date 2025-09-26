import React, { useState, useMemo } from 'react';
import { X, Filter, Trash2, CheckCircle2, Clock, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { NotificationType } from '@/types/notification';

const typeIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const typeColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export default function NotificationHistory() {
  const { history, toggleHistory, clearHistory, markAllAsRead } = useNotificationContext();
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');

  const filteredHistory = useMemo(() => {
    let filtered = history;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    // Filter by date
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    if (dateFilter === 'today') {
      filtered = filtered.filter(n => n.timestamp >= oneDayAgo);
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(n => n.timestamp >= oneWeekAgo);
    }

    return filtered;
  }, [history, filter, dateFilter]);

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50  flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Notification History</h2>
          <button
            onClick={toggleHistory}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <label htmlFor="type-filter" className="text-sm font-medium text-gray-700">
                Type:
              </label>
              <select
                id="type-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as NotificationType | 'all')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <label htmlFor="date-filter" className="text-sm font-medium text-gray-700">
                Date:
              </label>
              <select
                id="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
            </div>

            <div className="flex space-x-2 ml-auto">
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Mark All Read
              </button>
              <button
                onClick={clearHistory}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1 inline" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium mb-2">No notifications found</p>
              <p className="text-sm">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((notification) => {
                const Icon = typeIcons[notification.type];
                const colorClass = typeColors[notification.type];
                
                return (
                  <div
                    key={notification.id}
                    className={`
                      p-4 rounded-lg border transition-all hover:shadow-md
                      ${notification.read 
                        ? 'bg-white border-gray-200' 
                        : 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 ${colorClass} mt-0.5 flex-shrink-0`} />
                      
                      <div className="flex-1 min-w-0">
                        {notification.title && (
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                        )}
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                          
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 text-center">
          <p className="text-sm text-gray-500">
            {filteredHistory.length} of {history.length} notifications shown
          </p>
        </div>
      </div>
    </div>
  );
}