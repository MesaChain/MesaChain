"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FeedbackStatusTracker from "./FeedbackStatusTracker";
import type { FeedbackItem } from "@/types/feedback";

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onRespond?: (id: string, message: string) => Promise<void> | void;
}

export default function FeedbackCard({ feedback, onRespond }: FeedbackCardProps) {
  const [response, setResponse] = useState("");

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{feedback.subject}</p>
          <p className="text-xs text-gray-500">{new Date(feedback.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{feedback.category.replace("_", " ")}</Badge>
          <Badge variant={feedback.priority === "urgent" ? "destructive" : "secondary"}>
            {feedback.priority}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-gray-700">{feedback.message}</p>

      <FeedbackStatusTracker status={feedback.status} />

      {feedback.attachments && (
        <p className="text-xs text-gray-500">Attachments: {feedback.attachments}</p>
      )}

      {feedback.responses && feedback.responses.length > 0 && (
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-600">Responses</p>
          <div className="mt-2 space-y-2">
            {feedback.responses.map((entry) => (
              <div key={entry.id} className="text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.responderName || "Staff"}</span>
                  <span className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700">{entry.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.history && feedback.history.length > 0 && (
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs font-semibold text-gray-600">Status history</p>
          <div className="mt-2 space-y-2">
            {feedback.history.map((entry) => (
              <div key={entry.id} className="text-xs text-gray-600">
                <span className="font-semibold">{entry.field}</span>{" "}
                {entry.oldValue ? `${entry.oldValue} → ${entry.newValue || ""}` : entry.newValue}
                <span className="ml-2 text-gray-400">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onRespond && (
        <div className="space-y-2">
          <Textarea
            placeholder="Write a follow-up or response..."
            value={response}
            onChange={(event) => setResponse(event.target.value)}
          />
          <Button
            variant="outline"
            onClick={async () => {
              if (!response.trim()) return;
              await onRespond(feedback.id, response);
              setResponse("");
            }}
          >
            Send response
          </Button>
        </div>
      )}
    </div>
  );
}
