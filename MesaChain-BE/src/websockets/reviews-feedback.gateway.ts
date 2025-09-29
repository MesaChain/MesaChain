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
import { Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
  private connectedClients = new Map<string, { socket: Socket; userId?: string; role?: string }>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new UnauthorizedException('No authentication token provided');
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId;
      const role = payload.role;

      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      if (!role) {
        throw new UnauthorizedException('Invalid token payload - missing role');
      }

      this.logger.log(`Client connected: ${client.id} (User: ${userId}, Role: ${role})`);
      this.connectedClients.set(client.id, { socket: client, userId, role });
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.emit('auth-error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const clientData = this.connectedClients.get(client.id);
    if (!clientData?.userId) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    const { room } = data;
    
    // Restrict global feedback room to staff roles only
    const allowedStaffRoles = ['STAFF', 'ADMIN', 'MODERATOR'];
    if (room === 'feedback' && !allowedStaffRoles.includes(clientData.role)) {
      client.emit('error', { message: 'Unauthorized: Feedback stream restricted to staff' });
      return;
    }
    
    // Validate room access based on authenticated user
    if (room.startsWith('reviews:user:') && !room.endsWith(`:${clientData.userId}`)) {
      client.emit('error', { message: 'Unauthorized: Cannot join other users\' review rooms' });
      return;
    }
    
    if (room.startsWith('feedback:user:') && !room.endsWith(`:${clientData.userId}`)) {
      client.emit('error', { message: 'Unauthorized: Cannot join other users\' feedback rooms' });
      return;
    }
    
    if (room.startsWith('feedback:assigned:') && !room.endsWith(`:${clientData.userId}`)) {
      client.emit('error', { message: 'Unauthorized: Cannot join feedback rooms assigned to others' });
      return;
    }

    client.join(room);
    this.logger.log(`Client ${client.id} (User: ${clientData.userId}) joined room: ${room}`);
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
    const clientData = this.connectedClients.get(client.id);
    if (!clientData?.userId) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    const { menuItemId, userId } = data;
    let room = 'reviews';
    
    if (menuItemId) {
      room = `reviews:menu:${menuItemId}`;
    } else if (userId) {
      // Only allow users to subscribe to their own reviews
      if (userId !== clientData.userId) {
        client.emit('error', { message: 'Unauthorized: Cannot subscribe to other users\' reviews' });
        return;
      }
      room = `reviews:user:${userId}`;
    }
    
    client.join(room);
    this.logger.log(`Client ${client.id} (User: ${clientData.userId}) subscribed to reviews: ${room}`);
    client.emit('subscribed-reviews', { room, success: true });
  }

  @SubscribeMessage('subscribe-feedback')
  handleSubscribeFeedback(
    @MessageBody() data: { userId?: string; assignedTo?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const clientData = this.connectedClients.get(client.id);
    if (!clientData?.userId) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    const { userId, assignedTo } = data;
    let room = 'feedback';
    
    // Restrict global feedback room to staff roles only
    const allowedStaffRoles = ['STAFF', 'ADMIN', 'MODERATOR'];
    if (!userId && !assignedTo && !allowedStaffRoles.includes(clientData.role)) {
      client.emit('error', { message: 'Unauthorized: Feedback stream restricted to staff' });
      return;
    }
    
    if (userId) {
      // Only allow users to subscribe to their own feedback
      if (userId !== clientData.userId) {
        client.emit('error', { message: 'Unauthorized: Cannot subscribe to other users\' feedback' });
        return;
      }
      room = `feedback:user:${userId}`;
    } else if (assignedTo) {
      // Only allow users to subscribe to feedback assigned to them
      if (assignedTo !== clientData.userId) {
        client.emit('error', { message: 'Unauthorized: Cannot subscribe to feedback assigned to others' });
        return;
      }
      room = `feedback:assigned:${assignedTo}`;
    }
    
    client.join(room);
    this.logger.log(`Client ${client.id} (User: ${clientData.userId}) subscribed to feedback: ${room}`);
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
    const payload = { reviewId, ...voteData };
    this.server.to('reviews').emit('review-voted', payload);

    const menuItemId = voteData.menuItemId ?? voteData.review?.menuItemId;
    if (menuItemId) {
      this.server.to(`reviews:menu:${menuItemId}`).emit('review-voted', payload);
    }

    const userId = voteData.userId ?? voteData.review?.userId;
    if (userId) {
      this.server.to(`reviews:user:${userId}`).emit('review-voted', payload);
    }
  }

  emitReviewReport(reviewId: string, reportData: any) {
    this.logger.log(`Emitting review report: ${reviewId}`);
    const payload = { reviewId, ...reportData };
    this.server.to('reviews').emit('review-reported', payload);

    const menuItemId = reportData.menuItemId ?? reportData.review?.menuItemId;
    if (menuItemId) {
      this.server.to(`reviews:menu:${menuItemId}`).emit('review-reported', payload);
    }

    const userId = reportData.userId ?? reportData.review?.userId;
    if (userId) {
      this.server.to(`reviews:user:${userId}`).emit('review-reported', payload);
    }
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
    const payload = { feedbackId, response };
    this.server.to('feedback').emit('feedback-response', payload);

    const feedbackUserId = response.feedbackUserId ?? response.feedback?.userId;
    if (feedbackUserId && response.isInternal !== true) {
      this.server.to(`feedback:user:${feedbackUserId}`).emit('feedback-response', payload);
    }

    const assignedTo = response.assignedTo ?? response.feedback?.assignedTo;
    if (assignedTo) {
      this.server.to(`feedback:assigned:${assignedTo}`).emit('feedback-response', payload);
    }
  }

  // Admin/Moderator events
  emitModerationUpdate(reviewId: string, moderationData: any) {
    this.logger.log(`Emitting moderation update: ${reviewId}`);
    this.server.to('reviews').emit('review-moderated', { reviewId, ...moderationData });
  }

  emitFeedbackAssignment(feedbackId: string, assignmentData: any) {
    this.logger.log(`Emitting feedback assignment: ${feedbackId}`);
    const payload = { feedbackId, ...assignmentData };
    this.server.to('feedback').emit('feedback-assigned', payload);

    const assignedTo = assignmentData.assignedTo ?? assignmentData.userId;
    if (assignedTo) {
      this.server.to(`feedback:assigned:${assignedTo}`).emit('feedback-assigned', payload);
    }
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

