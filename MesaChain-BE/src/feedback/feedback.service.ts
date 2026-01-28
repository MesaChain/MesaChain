import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { PrismaClient } from '@prisma/client';
import { ExtendedPrismaClient } from '../types/prisma-client-extended';
// Force IDE refresh
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackQueryDto } from './dto/feedback-query.dto';
import { CreateFeedbackResponseDto } from './dto/create-feedback-response.dto';
import { WebSocketService } from '../websockets/websocket.service';
import { AiModerationService } from './services/ai-moderation.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webSocketService: WebSocketService,
    private readonly aiModerationService: AiModerationService,
  ) {}

  // Type assertion to help IDE understand the types
  private get prismaClient(): ExtendedPrismaClient {
    return this.prisma as unknown as ExtendedPrismaClient;
  }

  async create(createFeedbackDto: CreateFeedbackDto, userId?: string): Promise<any> {
    // Validate order if provided
    if (createFeedbackDto.orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: createFeedbackDto.orderId }
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }
    }

    // AI Content Moderation
    const moderationResult = await this.aiModerationService.moderateFeedback(
      createFeedbackDto.message,
      createFeedbackDto.subject
    );

    // Auto-categorize based on AI suggestion if not provided
    const category = createFeedbackDto.category || this.mapSuggestedCategory(moderationResult.category.suggested);

    // Auto-adjust priority based on moderation results
    let priority = createFeedbackDto.priority;
    if (moderationResult.toxicity.isToxic && moderationResult.toxicity.level === 'high') {
      priority = 'urgent' as any;
    } else if (moderationResult.spam.isSpam) {
      priority = 'low' as any;
    }

    const feedback = await this.prismaClient.feedback.create({
      data: {
        userId: userId || 'anonymous',
        orderId: createFeedbackDto.orderId,
        category: category as any,
        priority: priority as any,
        subject: createFeedbackDto.subject,
        message: createFeedbackDto.message,
        status: moderationResult.isApproved ? 'open' : 'flagged',
        notes: moderationResult.isApproved ? null : `AI Moderation: ${moderationResult.reasons.join(', ')}`
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            status: true,
            total: true
          }
        }
      }
    });

    // Emit WebSocket event for new feedback
    try {
      await this.webSocketService.emitNewFeedback({
        id: feedback.id,
        userId: feedback.userId,
        orderId: feedback.orderId,
        category: feedback.category,
        priority: feedback.priority,
        status: feedback.status,
        subject: feedback.subject,
        message: feedback.message,
        assignedTo: feedback.assignedTo,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to emit WebSocket event:', error);
    }

    return feedback;
  }

  async findAll(query: FeedbackQueryDto): Promise<{ feedback: any[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, ...filters } = query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.search) {
      where.OR = [
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [feedback, total] = await Promise.all([
      this.prismaClient.feedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          order: {
            select: {
              id: true,
              status: true,
              total: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNumber
      }),
      this.prismaClient.feedback.count({ where })
    ]);

    return {
      feedback,
      total,
      page: pageNumber,
      limit: limitNumber
    };
  }

  async findOne(id: string): Promise<any> {
    const feedback = await this.prismaClient.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            status: true,
            total: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto, userId: string): Promise<any> {
    const existingFeedback = await this.prismaClient.feedback.findUnique({
      where: { id }
    });

    if (!existingFeedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Check permissions
    if (existingFeedback.userId !== userId) {
      throw new ForbiddenException('You can only update your own feedback');
    }

    const updated = await this.prismaClient.feedback.update({
      where: { id },
      data: updateFeedbackDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            status: true,
            total: true
          }
        }
      }
    });

    // Emit WebSocket event for feedback update
    try {
      await this.webSocketService.emitFeedbackUpdate({
        id: updated.id,
        userId: updated.userId,
        orderId: updated.orderId,
        category: updated.category,
        priority: updated.priority,
        status: updated.status,
        subject: updated.subject,
        message: updated.message,
        assignedTo: updated.assignedTo,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to emit WebSocket event:', error);
    }

    return updated;
  }

  async addResponse(id: string, responseDto: CreateFeedbackResponseDto, userId: string): Promise<any> {
    const feedback = await this.prismaClient.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    const response = await this.prismaClient.feedbackResponse.create({
      data: {
        feedbackId: id,
        userId,
        message: responseDto.message,
        isInternal: responseDto.isInternal || false
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    return response;
  }

  async remove(id: string, userId: string): Promise<void> {
    const feedback = await this.prismaClient.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Check permissions
    if (feedback.userId !== userId) {
      throw new ForbiddenException('You can only delete your own feedback');
    }

    await this.prismaClient.feedback.delete({
      where: { id }
    });
  }

  async getStats(): Promise<any> {
    const [
      totalFeedback,
      openFeedback,
      inProgressFeedback,
      resolvedFeedback,
      closedFeedback
    ] = await Promise.all([
      this.prismaClient.feedback.count(),
      this.prismaClient.feedback.count({ where: { status: 'open' } }),
      this.prismaClient.feedback.count({ where: { status: 'in_progress' } }),
      this.prismaClient.feedback.count({ where: { status: 'resolved' } }),
      this.prismaClient.feedback.count({ where: { status: 'closed' } })
    ]);

    return {
      total: totalFeedback,
      open: openFeedback,
      inProgress: inProgressFeedback,
      resolved: resolvedFeedback,
      closed: closedFeedback
    };
  }

  private mapSuggestedCategory(suggested: string): string {
    const categoryMap: Record<string, string> = {
      'bug_report': 'BUG_REPORT',
      'feature_request': 'FEATURE_REQUEST',
      'complaint': 'COMPLAINT',
      'compliment': 'COMPLIMENT',
      'general': 'GENERAL'
    };
    
    return categoryMap[suggested] || 'GENERAL';
  }

  async moderateContent(content: string, type: 'review' | 'feedback', subject?: string, rating?: number) {
    if (type === 'review') {
      return await this.aiModerationService.moderateReview(content, rating || 3);
    } else {
      return await this.aiModerationService.moderateFeedback(content, subject || '');
    }
  }
}