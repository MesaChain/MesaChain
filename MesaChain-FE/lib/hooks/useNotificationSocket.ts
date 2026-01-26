import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { NotificationInput } from "../../types/notifications";
import { useNotificationStore } from "../../store/useNotificationStore";

const SOCKET_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_URL ||
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      `${window.location.protocol}//${window.location.hostname}:3000`
    : "";

interface NotificationSocketOptions {
  enabled?: boolean;
  room?: string;
  eventName?: string;
}

export function useNotificationSocket({
  enabled = true,
  room,
  eventName = "notification",
}: NotificationSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  useEffect(() => {
    if (!enabled) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      if (room) {
        socket.emit("joinNotifications", { room });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err: Error) => {
      setError(err.message);
      setIsConnected(false);
    });

    socket.on(eventName, (payload: NotificationInput) => {
      addNotification({
        ...payload,
        source: payload.source ?? "realtime",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, room, eventName, addNotification]);

  return { isConnected, error };
}
