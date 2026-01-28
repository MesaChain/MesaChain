import { Badge } from "@/components/ui/badge";
import type { FeedbackStatus } from "@/types/feedback";

const statusSteps: FeedbackStatus[] = ["open", "in_progress", "resolved", "closed"];

interface FeedbackStatusTrackerProps {
  status: FeedbackStatus;
}

export default function FeedbackStatusTracker({ status }: FeedbackStatusTrackerProps) {
  const currentIndex = statusSteps.indexOf(status);

  return (
    <div className="flex flex-wrap gap-2">
      {statusSteps.map((step, index) => (
        <Badge
          key={step}
          variant={index <= currentIndex ? "default" : "outline"}
        >
          {step.replace("_", " ")}
        </Badge>
      ))}
    </div>
  );
}
