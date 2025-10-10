// Extended Prisma Client types
import { PrismaClient } from '@prisma/client';

export interface ExtendedPrismaClient extends PrismaClient {
  feedback: any;
  feedbackResponse: any;
  feedbackHistory: any;
  feedbackAnalytics: any;
  review: any;
  reviewHelpfulVote: any;
  reviewReport: any;
  reviewModerationHistory: any;
  reviewAnalytics: any;
}
