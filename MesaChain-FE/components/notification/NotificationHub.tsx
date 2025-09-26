import React from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellRing } from 'lucide-react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { NotificationHubProps } from '@/types/notification';
import Notification from './Notification';
import NotificationHistory from './NotificationHistory';
import { usePathname } from 'next/navigation';

const positionClasses = {
    'top-right': 'top-4 right-0',
    'top-left': 'top-4 left-0',
    'bottom-right': 'bottom-4 right-0',
    'bottom-left': 'bottom-4 left-0',
};

export default function NotificationHub({
    position = 'top-right',
    maxVisible = 5,
}: NotificationHubProps) {
    const {
        notifications,
        unreadCount,
        showHistory,
        removeNotification,
        markAsRead,
        toggleHistory,
    } = useNotificationContext();

    const visibleNotifications = notifications.slice(0, maxVisible);
    const positionClass = positionClasses[position];
    const pathname = usePathname()
    return (
        <>
            {pathname.startsWith("/dashboard")
                && (
                    <div className="fixed top-4 right-4 z-[999]">
                        <button
                            onClick={toggleHistory}
                            className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border"
                            aria-label={`Open notification history. ${unreadCount} unread notifications`}
                        >
                            {unreadCount > 0 ? (
                                <BellRing className="w-6 h-6 text-blue-600" />
                            ) : (
                                <Bell className="w-6 h-6 text-gray-600" />
                            )}

                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center min-w-[24px]">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                )
            }


            {/* Notifications Container */}
            {createPortal(
                <div
                    className={`
            fixed ${positionClass} z-30 pointer-events-none
            flex ${position.includes('bottom') ? 'flex-col-reverse' : 'flex-col'}
          `}
                    aria-live="polite"
                    aria-label="Notifications"
                >
                    {visibleNotifications.map((notification) => (
                        <div key={notification.id} className="pointer-events-auto">
                            <Notification
                                notification={notification}
                                onDismiss={removeNotification}
                                onRead={markAsRead}
                                position={position}
                            />
                        </div>
                    ))}

                    {notifications.length > maxVisible && (
                        <div className="pointer-events-auto mx-4 mb-3">
                            <button
                                onClick={toggleHistory}
                                className="w-full px-4 py-2 bg-gray-800 bg-opacity-90 text-white text-sm rounded-lg hover:bg-opacity-100 transition-all backdrop-blur-sm"
                            >
                                +{notifications.length - maxVisible} more notifications
                            </button>
                        </div>
                    )}
                </div>,
                document.body
            )}

            {/* History Modal */}
            {showHistory && <NotificationHistory />}
        </>
    );
}