import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotification';
import { NotificationOptions, NotificationType } from '@/types/notification';

export default function NotificationDemo() {
  const { success, error, warning, info } = useNotifications();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [duration, setDuration] = useState(5000);
  const [persistent, setPersistent] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [withActions, setWithActions] = useState(false);

  const handleSendNotification = () => {
    const options: NotificationOptions = {
      duration: persistent ? 0 : duration,
      persistent,
      progress: showProgress,
      actions: withActions ? [
        {
          label: 'Undo',
          onClick: () => console.log('Undo clicked'),
          variant: 'primary' as const,
        },
        {
          label: 'View Details',
          onClick: () => console.log('View details clicked'),
          variant: 'secondary' as const,
        },
      ] : undefined,
    };

    const messageText = message || `This is a ${type} notification message!`;

    switch (type) {
      case 'success':
        success(messageText, options);
        break;
      case 'error':
        error(messageText, options);
        break;
      case 'warning':
        warning(messageText, options);
        break;
      case 'info':
        info(messageText, options);
        break;
    }

    // Reset message after sending
    if (message) setMessage('');
  };

  const sendBulkNotifications = () => {
    const messages = [
      { type: 'success', message: 'File uploaded successfully!' },
      { type: 'info', message: 'New update available' },
      { type: 'warning', message: 'Storage is almost full' },
      { type: 'error', message: 'Failed to sync data' },
      { type: 'info', message: 'Background process completed' },
    ] as const;

    messages.forEach((msg, index) => {
      setTimeout(() => {
        switch (msg.type) {
          case 'success':
            success(msg.message);
            break;
          case 'error':
            error(msg.message);
            break;
          case 'warning':
            warning(msg.message);
            break;
          case 'info':
            info(msg.message);
            break;
        }
      }, index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            NotificationHub Demo
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Send Custom Notification
              </h2>

              {/* Message Input */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter custom message (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Type Selection */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>

              {/* Duration */}
              {!persistent && (
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (ms)
                  </label>
                  <input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1000"
                    max="30000"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={persistent}
                    onChange={(e) => setPersistent(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Persistent</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showProgress}
                    onChange={(e) => setShowProgress(e.target.checked)}
                    className="mr-2"
                    disabled={persistent}
                  />
                  <span className="text-sm font-medium text-gray-700">Show Progress Bar</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={withActions}
                    onChange={(e) => setWithActions(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Include Actions</span>
                </label>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendNotification}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Send Notification
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => success('Operation completed successfully!')}
                  className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Success
                </button>

                <button
                  onClick={() => error('Something went wrong!')}
                  className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Error
                </button>

                <button
                  onClick={() => warning('Please review your settings')}
                  className="px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors font-medium"
                >
                  Warning
                </button>

                <button
                  onClick={() => info('New features are available!')}
                  className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Info
                </button>
              </div>

              <button
                onClick={sendBulkNotifications}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                Send Bulk Notifications
              </button>

              {/* Feature Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-800 mb-2">Features Demonstrated:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Auto-dismissal with timers</li>
                  <li>• Manual dismissal</li>
                  <li>• Hover to pause/resume</li>
                  <li>• Progress indicators</li>
                  <li>• Action buttons</li>
                  <li>• Persistent notifications</li>
                  <li>• Notification history</li>
                  <li>• Badge counter</li>
                  <li>• Keyboard navigation</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}