"use client"
import React, { useEffect } from 'react'
import { useNotificationContext } from '@/contexts/NotificationContext';
import { setGlobalNotificationContext } from '@/hooks/useNotification';
import NotificationHub from '@/components/notification/NotificationHub';

function ContextSetup() {
    const context = useNotificationContext();

    useEffect(() => {
        setGlobalNotificationContext(context);
    }, [context]);

    return null;
}

import type { NotificationPosition } from '@/types/notification';

interface NotificatonUIProps {
    position?: NotificationPosition;
}

const NotificatonUI = ({ position = "bottom-right" }: NotificatonUIProps) => {
    return (
        <>
            <ContextSetup />
            <NotificationHub
                position={position}
                maxVisible={5}
            />
        </>
    );
}

export default NotificatonUI