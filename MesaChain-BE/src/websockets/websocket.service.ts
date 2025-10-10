import { Injectable, Logger } from '@nestjs/common';
import { ReviewsFeedbackGateway } from './reviews-feedback.gateway';

export interface ReviewEvent {
  id: string;
  userId: string;
  menuItemId?: string;
  orderId?: string;
  rating: number;
  content?: string;
  status: string;
  isVerified: boolean;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackEvent {
  id: string;
  userId: string;
  orderId?: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  message: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoteEvent {
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  timestamp: Date;
}

export interface ReportEvent {
  reviewId: string;
  userId: string;
  reason: string;
  description?: string;
  timestamp: Date;
}

export interface ModerationEvent {
  reviewId: string;
  moderatorId: string;
  action: string;
  reason?: string;
  notes?: string;
  timestamp: Date;
}

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);

  constructor(private readonly reviewsFeedbackGateway: ReviewsFeedbackGateway) {}

  // Review events
  async emitNewReview(review: ReviewEvent) {
    try {
      this.reviewsFeedbackGateway.emitNewReview(review);
      this.logger.log(`Emitted new review event: ${review.id}`);
    } catch (error) {
      this.logger.error(`Failed to emit new review event: ${error.message}`);
    }
  }

  async emitReviewUpdate(review: ReviewEvent) {
    try {
      this.reviewsFeedbackGateway.emitReviewUpdate(review);
      this.logger.log(`Emitted review update event: ${review.id}`);
    } catch (error) {
      this.logger.error(`Failed to emit review update event: ${error.message}`);
    }
  }

  async emitReviewVote(vote: VoteEvent) {
    try {
      this.reviewsFeedbackGateway.emitReviewVote(vote.reviewId, vote);
      this.logger.log(`Emitted review vote event: ${vote.reviewId}`);
    } catch (error) {
      this.logger.error(`Failed to emit review vote event: ${error.message}`);
    }
  }

  async emitReviewReport(report: ReportEvent) {
    try {
      this.reviewsFeedbackGateway.emitReviewReport(report.reviewId, report);
      this.logger.log(`Emitted review report event: ${report.reviewId}`);
    } catch (error) {
      this.logger.error(`Failed to emit review report event: ${error.message}`);
    }
  }

  async emitReviewModeration(moderation: ModerationEvent) {
    try {
      this.reviewsFeedbackGateway.emitModerationUpdate(moderation.reviewId, moderation);
      this.logger.log(`Emitted review moderation event: ${moderation.reviewId}`);
    } catch (error) {
      this.logger.error(`Failed to emit review moderation event: ${error.message}`);
    }
  }

  // Feedback events
  async emitNewFeedback(feedback: FeedbackEvent) {
    try {
      this.reviewsFeedbackGateway.emitNewFeedback(feedback);
      this.logger.log(`Emitted new feedback event: ${feedback.id}`);
    } catch (error) {
      this.logger.error(`Failed to emit new feedback event: ${error.message}`);
    }
  }

  async emitFeedbackUpdate(feedback: FeedbackEvent) {
    try {
      this.reviewsFeedbackGateway.emitFeedbackUpdate(feedback);
      this.logger.log(`Emitted feedback update event: ${feedback.id}`);
    } catch (error) {
      this.logger.error(`Failed to emit feedback update event: ${error.message}`);
    }
  }

  async emitFeedbackResponse(feedbackId: string, response: any) {
    try {
      this.reviewsFeedbackGateway.emitFeedbackResponse(feedbackId, response);
      this.logger.log(`Emitted feedback response event: ${feedbackId}`);
    } catch (error) {
      this.logger.error(`Failed to emit feedback response event: ${error.message}`);
    }
  }

  async emitFeedbackAssignment(feedbackId: string, assignmentData: any) {
    try {
      this.reviewsFeedbackGateway.emitFeedbackAssignment(feedbackId, assignmentData);
      this.logger.log(`Emitted feedback assignment event: ${feedbackId}`);
    } catch (error) {
      this.logger.error(`Failed to emit feedback assignment event: ${error.message}`);
    }
  }

  // Analytics events
  async emitReviewStatsUpdate(menuItemId: string, stats: any) {
    try {
      this.reviewsFeedbackGateway.server
        .to(`reviews:menu:${menuItemId}`)
        .emit('review-stats-updated', { menuItemId, stats });
      this.logger.log(`Emitted review stats update: ${menuItemId}`);
    } catch (error) {
      this.logger.error(`Failed to emit review stats update: ${error.message}`);
    }
  }

  async emitFeedbackStatsUpdate(stats: any) {
    try {
      this.reviewsFeedbackGateway.server
        .to('feedback')
        .emit('feedback-stats-updated', stats);
      this.logger.log(`Emitted feedback stats update`);
    } catch (error) {
      this.logger.error(`Failed to emit feedback stats update: ${error.message}`);
    }
  }

  // System events
  async emitSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    try {
      this.reviewsFeedbackGateway.server
        .to('reviews')
        .to('feedback')
        .emit('system-notification', { message, type, timestamp: new Date() });
      this.logger.log(`Emitted system notification: ${message}`);
    } catch (error) {
      this.logger.error(`Failed to emit system notification: ${error.message}`);
    }
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      totalConnections: this.reviewsFeedbackGateway.getConnectedClientsCount(),
      reviewsRoomConnections: this.reviewsFeedbackGateway.getClientsInRoom('reviews'),
      feedbackRoomConnections: this.reviewsFeedbackGateway.getClientsInRoom('feedback'),
    };
  }
}

