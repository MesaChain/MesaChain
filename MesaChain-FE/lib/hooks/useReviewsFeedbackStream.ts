import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { apiBaseUrlBackend } from "../config";

type ReviewFeedbackEvent =
  | "new-review"
  | "review-updated"
  | "review-voted"
  | "review-reported"
  | "review-moderated"
  | "new-feedback"
  | "feedback-updated"
  | "feedback-response"
  | "feedback-assigned";

interface StreamHandlers {
  onEvent?: (event: ReviewFeedbackEvent, payload: any) => void;
}

export function useReviewsFeedbackStream(token?: string, handlers: StreamHandlers = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(`${apiBaseUrlBackend}/reviews-feedback`, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const events: ReviewFeedbackEvent[] = [
      "new-review",
      "review-updated",
      "review-voted",
      "review-reported",
      "review-moderated",
      "new-feedback",
      "feedback-updated",
      "feedback-response",
      "feedback-assigned",
    ];

    events.forEach((event) => {
      socket.on(event, (payload) => handlers.onEvent?.(event, payload));
    });

    return () => {
      events.forEach((event) => socket.off(event));
      socket.disconnect();
    };
  }, [token, handlers.onEvent]);
}
