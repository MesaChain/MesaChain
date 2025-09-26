import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X, Play, Pause } from 'lucide-react';
import { Notification as NotificationType, NotificationAction } from '@/types/notification';

interface NotificationProps {
    notification: NotificationType;
    onDismiss: (id: string) => void;
    onRead: (id: string) => void;
    position: string;
}

const typeConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50 border-green-200',
        iconColor: 'text-green-500',
        titleColor: 'text-green-800',
        textColor: 'text-green-700',
    },
    error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50 border-red-200',
        iconColor: 'text-red-500',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50 border-yellow-200',
        iconColor: 'text-yellow-500',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50 border-blue-200',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
    },
};

export default function Notification({ notification, onDismiss, onRead, position }: NotificationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);
    const [isExiting, setIsExiting] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    const config = typeConfig[notification.type];
    const Icon = config.icon;

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 50);
        setTimeout(() => onRead(notification.id), 1000);
        if (!notification.persistent && notification.duration > 0) {
            startAutoCloseTimer();
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    const startAutoCloseTimer = () => {
        startTimeRef.current = Date.now();

        // Progress bar animation
        if (notification.progress) {
            progressIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = Math.max(0, notification.duration - elapsed);
                setProgress((remaining / notification.duration) * 100);
            }, 50);
        }

        // Auto dismiss timer
        timeoutRef.current = setTimeout(() => {
            handleDismiss();
        }, notification.duration);
    };

    const pauseAutoClose = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        setIsPaused(true);
    };

    const resumeAutoClose = () => {
        if (!notification.persistent && notification.duration > 0) {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, notification.duration - elapsed);

            if (remaining > 0) {
                notification.duration = remaining;
                startTimeRef.current = Date.now();
                startAutoCloseTimer();
            } else {
                handleDismiss();
            }
        }
        setIsPaused(false);
    };

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss(notification.id);
        }, 300);
    };

    const handleClick = () => {
        if (notification.onClick) {
            notification.onClick();
        }
    };

    const handleActionClick = (action: NotificationAction) => {
        action.onClick();
        handleDismiss();
    };

    const getAnimationClasses = () => {
        const baseClasses = "transition-all duration-300 ease-out";

        if (!isVisible && !isExiting) {
            // Initial state - hidden
            if (position.includes('right')) {
                return `${baseClasses} translate-x-full opacity-0 scale-95`;
            } else if (position.includes('left')) {
                return `${baseClasses} -translate-x-full opacity-0 scale-95`;
            }
            return `${baseClasses} -translate-y-full opacity-0 scale-95`;
        } else if (isExiting) {
            // Exiting state
            if (position.includes('right')) {
                return `${baseClasses} translate-x-full opacity-0 scale-95`;
            } else if (position.includes('left')) {
                return `${baseClasses} -translate-x-full opacity-0 scale-95`;
            }
            return `${baseClasses} -translate-y-full opacity-0 scale-95`;
        } else {
            // Visible state
            return `${baseClasses} translate-x-0 translate-y-0 opacity-100 scale-100`;
        }
    };

    return (
        <div
            className={`
        relative max-w-sm w-full mx-4 mb-3 rounded-lg border shadow-lg backdrop-blur-sm
        ${config.bgColor}
        ${getAnimationClasses()}
        ${notification.onClick ? 'cursor-pointer' : ''}
      `}
            onClick={handleClick}
            onMouseEnter={pauseAutoClose}
            onMouseLeave={resumeAutoClose}
            role="alert"
            aria-live="polite"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleClick();
                } else if (e.key === 'Escape') {
                    handleDismiss();
                }
            }}
        >
            {/* Progress bar */}
            {notification.progress && !notification.persistent && (
                <div className="absolute top-0 left-0 h-1  bg-gray-200 rounded-t-lg overflow-hidden w-full">
                    <div
                        className={`h-full transition-all duration-100 ease-linear ${notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'error' ? 'bg-red-500' :
                                    notification.type === 'warning' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="flex items-start p-4">
                {/* Icon */}
                <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 mr-3 flex-shrink-0`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {notification.title && (
                        <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                            {notification.title}
                        </h4>
                    )}
                    <p className={`text-sm ${config.textColor}`}>
                        {notification.message}
                    </p>

                    {/* Actions */}
                    {notification.actions && notification.actions.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                            {notification.actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionClick(action);
                                    }}
                                    className={`
                    px-3 py-1 text-xs font-medium rounded transition-colors
                    ${action.variant === 'primary'
                                            ? `${config.titleColor} bg-white bg-opacity-70 hover:bg-opacity-100`
                                            : `${config.textColor} hover:${config.titleColor}`
                                        }
                  `}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pause/Resume button for non-persistent notifications */}
                {!notification.persistent && notification.duration > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            isPaused ? resumeAutoClose() : pauseAutoClose();
                        }}
                        className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors mr-2 ${config.iconColor}`}
                        aria-label={isPaused ? 'Resume auto-dismiss' : 'Pause auto-dismiss'}
                    >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                )}

                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                    }}
                    className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${config.iconColor}`}
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}