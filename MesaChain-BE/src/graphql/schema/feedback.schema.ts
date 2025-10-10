import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum FeedbackStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum FeedbackCategory {
  GENERAL = 'general',
  BUG_REPORT = 'bug_report',
  FEATURE_REQUEST = 'feature_request',
  COMPLAINT = 'complaint',
  COMPLIMENT = 'compliment',
}

registerEnumType(FeedbackStatus, {
  name: 'FeedbackStatus',
});

registerEnumType(FeedbackPriority, {
  name: 'FeedbackPriority',
});

registerEnumType(FeedbackCategory, {
  name: 'FeedbackCategory',
});

@ObjectType()
export class FeedbackResponse {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  feedbackId: string;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  responderId?: string;

  @Field(() => Boolean)
  isInternal: boolean;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class Feedback {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  orderId?: string;

  @Field(() => String)
  category: string;

  @Field(() => String)
  priority: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  assignedTo?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [FeedbackResponse], { nullable: true })
  responses?: FeedbackResponse[];
}

@ObjectType()
export class FeedbackStats {
  @Field(() => Int)
  totalFeedback: number;

  @Field(() => String)
  statusBreakdown: string; // JSON string

  @Field(() => String)
  categoryBreakdown: string; // JSON string

  @Field(() => String)
  priorityBreakdown: string; // JSON string

  @Field(() => Float)
  averageResolutionTime: number; // in hours

  @Field(() => [Feedback])
  recentFeedback: Feedback[];
}
