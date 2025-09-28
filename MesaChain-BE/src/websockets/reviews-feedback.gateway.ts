import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/reviews-feedback',
})
export class ReviewsFeedbackGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ReviewsFeedbackGateway.name);
  private connectedClients = new Map<string, { socket: Socket; userId?: string }>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { room: string; userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, userId } = data;
    client.join(room);
    
    // Store user ID for this client
    if (userId) {
      const clientData = this.connectedClients.get(client.id);
      if (clientData) {
        clientData.userId = userId;
      }
    }

    this.logger.log(`Client ${client.id} joined room: ${room}`);
    client.emit('joined-room', { room, success: true });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    client.emit('left-room', { room, success: true });
  }

  @SubscribeMessage('subscribe-reviews')
  handleSubscribeReviews(
    @MessageBody() data: { menuItemId?: string; userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { menuItemId, userId } = data;
    let room = 'reviews';
    
    if (menuItemId) {
      room = `reviews:menu:${menuItemId}`;
    } else if (userId) {
      room = `reviews:user:${userId}`;
    }
    
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to reviews: ${room}`);
    client.emit('subscribed-reviews', { room, success: true });
  }

  @SubscribeMessage('subscribe-feedback')
  handleSubscribeFeedback(
    @MessageBody() data: { userId?: string; assignedTo?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, assignedTo } = data;
    let room = 'feedback';
    
    if (userId) {
      room = `feedback:user:${userId}`;
    } else if (assignedTo) {
      room = `feedback:assigned:${assignedTo}`;
    }
    
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to feedback: ${room}`);
    client.emit('subscribed-feedback', { room, success: true });
  }

  // Review event emitters
  emitNewReview(review: any) {
    this.logger.log(`Emitting new review: ${review.id}`);
    
    // Emit to general reviews room
    this.server.to('reviews').emit('new-review', review);
    
    // Emit to specific menu item room
    if (review.menuItemId) {
      this.server.to(`reviews:menu:${review.menuItemId}`).emit('new-review', review);
    }
    
    // Emit to user's reviews room
    if (review.userId) {
      this.server.to(`reviews:user:${review.userId}`).emit('new-review', review);
    }
  }

  emitReviewUpdate(review: any) {
    this.logger.log(`Emitting review update: ${review.id}`);
    
    // Emit to general reviews room
    this.server.to('reviews').emit('review-updated', review);
    
    // Emit to specific menu item room
    if (review.menuItemId) {
      this.server.to(`reviews:menu:${review.menuItemId}`).emit('review-updated', review);
    }
    
    // Emit to user's reviews room
    if (review.userId) {
      this.server.to(`reviews:user:${review.userId}`).emit('review-updated', review);
    }
  }

  emitReviewVote(reviewId: string, voteData: any) {
    this.logger.log(`Emitting review vote: ${reviewId}`);
    this.server.to('reviews').emit('review-voted', { reviewId, ...voteData });
  }

  emitReviewReport(reviewId: string, reportData: any) {
    this.logger.log(`Emitting review report: ${reviewId}`);
    this.server.to('reviews').emit('review-reported', { reviewId, ...reportData });
  }

  // Feedback event emitters
  emitNewFeedback(feedback: any) {
    this.logger.log(`Emitting new feedback: ${feedback.id}`);
    
    // Emit to general feedback room
    this.server.to('feedback').emit('new-feedback', feedback);
    
    // Emit to user's feedback room
    if (feedback.userId) {
      this.server.to(`feedback:user:${feedback.userId}`).emit('new-feedback', feedback);
    }
    
    // Emit to assigned user's room
    if (feedback.assignedTo) {
      this.server.to(`feedback:assigned:${feedback.assignedTo}`).emit('new-feedback', feedback);
    }
  }

  emitFeedbackUpdate(feedback: any) {
    this.logger.log(`Emitting feedback update: ${feedback.id}`);
    
    // Emit to general feedback room
    this.server.to('feedback').emit('feedback-updated', feedback);
    
    // Emit to user's feedback room
    if (feedback.userId) {
      this.server.to(`feedback:user:${feedback.userId}`).emit('feedback-updated', feedback);
    }
    
    // Emit to assigned user's room
    if (feedback.assignedTo) {
      this.server.to(`feedback:assigned:${feedback.assignedTo}`).emit('feedback-updated', feedback);
    }
  }

  emitFeedbackResponse(feedbackId: string, response: any) {
    this.logger.log(`Emitting feedback response: ${feedbackId}`);
    this.server.to('feedback').emit('feedback-response', { feedbackId, response });
  }

  // Admin/Moderator events
  emitModerationUpdate(reviewId: string, moderationData: any) {
    this.logger.log(`Emitting moderation update: ${reviewId}`);
    this.server.to('reviews').emit('review-moderated', { reviewId, ...moderationData });
  }

  emitFeedbackAssignment(feedbackId: string, assignmentData: any) {
    this.logger.log(`Emitting feedback assignment: ${feedbackId}`);
    this.server.to('feedback').emit('feedback-assigned', { feedbackId, ...assignmentData });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get clients in a specific room
  getClientsInRoom(room: string): number {
    const roomData = this.server.sockets.adapter.rooms.get(room);
    return roomData ? roomData.size : 0;
  }
}

