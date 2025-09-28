import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { PrismaClient } from '@prisma/client';
import { ExtendedPrismaClient } from '../types/prisma-client-extended';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto, VoteReviewDto, ReportReviewDto, ModerateReviewDto } from './dto/create-review.dto';
import { WebSocketService } from '../websockets/websocket.service';
import { AiModerationService } from '../feedback/services/ai-moderation.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webSocketService: WebSocketService,
    private readonly aiModerationService: AiModerationService,
  ) {}

  private get prismaClient(): ExtendedPrismaClient {
    return this.prisma as unknown as ExtendedPrismaClient;
  }

  async create(createReviewDto: CreateReviewDto, userId: string): Promise<any> {
    // Validate order if provided
    if (createReviewDto.orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: createReviewDto.orderId }
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Verify order ownership
      if (order.userId !== userId) {
        throw new ForbiddenException('You can only review your own orders');
      }

      // Check if user already reviewed this order
      const existingReview = await this.prismaClient.review.findFirst({
        where: {
          orderId: createReviewDto.orderId,
          userId: userId
        }
      });

      if (existingReview) {
        throw new BadRequestException('You have already reviewed this order');
      }
    }

    // Validate menu item if provided
    if (createReviewDto.menuItemId) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: createReviewDto.menuItemId }
      });

      if (!menuItem) {
        throw new NotFoundException('Menu item not found');
      }
    }

    // AI Content Moderation for review
    const moderationResult = await this.aiModerationService.moderateReview(
      createReviewDto.content || '',
      createReviewDto.rating
    );

    const review = await this.prismaClient.review.create({
      data: {
        userId,
        orderId: createReviewDto.orderId,
        menuItemId: createReviewDto.menuItemId,
        rating: createReviewDto.rating,
        content: createReviewDto.content,
        status: moderationResult.isApproved ? 'approved' : 'flagged',
        isVerified: !!createReviewDto.orderId,
        isAnonymous: createReviewDto.isAnonymous || false,
        moderationNotes: moderationResult.isApproved ? null : `AI Moderation: ${moderationResult.reasons.join(', ')}`
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
        },
        menuItem: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    // Emit WebSocket event for new review
    try {
      await this.webSocketService.emitNewReview({
        id: review.id,
        userId: review.userId,
        orderId: review.orderId,
        menuItemId: review.menuItemId,
        rating: review.rating,
        content: review.content,
        status: review.status,
        isVerified: review.isVerified,
        isAnonymous: review.isAnonymous,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      });
    } catch (error) {
      console.error('Failed to emit WebSocket event:', error);
    }

    return review;
  }

  async findAll(query: ReviewQueryDto): Promise<{ reviews: any[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.rating) {
      where.rating = filters.rating;
    }
    
    if (filters.menuItemId) {
      where.menuItemId = filters.menuItemId;
    }
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.orderId) {
      where.orderId = filters.orderId;
    }
    
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      };
    }
    
    if (filters.search) {
      where.OR = [
        { content: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [reviews, total] = await Promise.all([
      this.prismaClient.review.findMany({
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
          },
          menuItem: {
            select: {
              id: true,
              name: true,
              price: true
            }
          },
          helpfulVotes: {
            select: {
              id: true,
              userId: true,
              isHelpful: true,
              createdAt: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      this.prismaClient.review.count({ where })
    ]);

    return {
      reviews,
      total,
      page,
      limit
    };
  }

  async findOne(id: string): Promise<any> {
    const review = await this.prismaClient.review.findUnique({
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
        menuItem: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        helpfulVotes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        reports: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        moderationHistory: {
          include: {
            moderator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string): Promise<any> {
    const existingReview = await this.prismaClient.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      throw new NotFoundException('Review not found');
    }

    // Check permissions - users can only update their own reviews
    if (existingReview.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Remove status from user updates - only moderators can change status
    const { status, ...updateData } = updateReviewDto;
    
    const updated = await this.prismaClient.review.update({
      where: { id },
      data: updateData,
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
        menuItem: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    // Emit WebSocket event for review update
    try {
      await this.webSocketService.emitReviewUpdate({
        id: updated.id,
        userId: updated.userId,
        orderId: updated.orderId,
        menuItemId: updated.menuItemId,
        rating: updated.rating,
        content: updated.content,
        status: updated.status,
        isVerified: updated.isVerified,
        isAnonymous: updated.isAnonymous,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      console.error('Failed to emit WebSocket event:', error);
    }

    return updated;
  }

  async vote(id: string, voteReviewDto: VoteReviewDto, userId: string): Promise<any> {
    const review = await this.prismaClient.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user already voted
    const existingVote = await this.prismaClient.reviewHelpfulVote.findFirst({
      where: {
        reviewId: id,
        userId: userId
      }
    });

    if (existingVote) {
      // Update existing vote
      const updatedVote = await this.prismaClient.reviewHelpfulVote.update({
        where: { id: existingVote.id },
        data: { isHelpful: voteReviewDto.isHelpful }
      });

      // Update review vote counts
      await this.updateVoteCounts(id);
      
      // Emit WebSocket event
      try {
        await this.webSocketService.emitReviewVote({
          reviewId: id,
          userId: userId,
          isHelpful: voteReviewDto.isHelpful,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Failed to emit WebSocket event:', error);
      }

      return updatedVote;
    } else {
      // Create new vote
      const newVote = await this.prismaClient.reviewHelpfulVote.create({
        data: {
          reviewId: id,
          userId: userId,
          isHelpful: voteReviewDto.isHelpful
        }
      });

      // Update review vote counts
      await this.updateVoteCounts(id);
      
      // Emit WebSocket event
      try {
        await this.webSocketService.emitReviewVote({
          reviewId: id,
          userId: userId,
          isHelpful: voteReviewDto.isHelpful,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Failed to emit WebSocket event:', error);
      }

      return newVote;
    }
  }

  async report(id: string, reportReviewDto: ReportReviewDto, userId: string): Promise<any> {
    const review = await this.prismaClient.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user already reported this review
    const existingReport = await this.prismaClient.reviewReport.findFirst({
      where: {
        reviewId: id,
        userId: userId
      }
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this review');
    }

    const report = await this.prismaClient.reviewReport.create({
      data: {
        reviewId: id,
        userId: userId,
        reason: reportReviewDto.reason,
        description: reportReviewDto.description,
        status: 'pending'
      }
    });

    // Emit WebSocket event
    try {
      await this.webSocketService.emitReviewReport({
        reviewId: id,
        userId: userId,
        reason: reportReviewDto.reason,
        description: reportReviewDto.description,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to emit WebSocket event:', error);
    }

    return report;
  }

  async moderate(id: string, moderateReviewDto: ModerateReviewDto, moderatorId: string): Promise<any> {
    const review = await this.prismaClient.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Update review status based on action
    let newStatus: string;
    switch (moderateReviewDto.action) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'flag':
        newStatus = 'flagged';
        break;
      default:
        throw new BadRequestException('Invalid moderation action');
    }

    const updatedReview = await this.prismaClient.review.update({
      where: { id },
      data: {
        status: newStatus as any,
        moderationNotes: moderateReviewDto.notes
      }
    });

    // Create moderation history entry
    await this.prismaClient.reviewModerationHistory.create({
      data: {
        reviewId: id,
        moderatorId: moderatorId,
        action: moderateReviewDto.action,
        reason: moderateReviewDto.reason,
        notes: moderateReviewDto.notes
      }
    });

    // Emit WebSocket event
    try {
      await this.webSocketService.emitReviewModeration({
        reviewId: id,
        moderatorId: moderatorId,
        action: moderateReviewDto.action,
        reason: moderateReviewDto.reason,
        notes: moderateReviewDto.notes,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to emit WebSocket event:', error);
    }

    return updatedReview;
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.prismaClient.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check permissions
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prismaClient.review.delete({
      where: { id }
    });
  }

  async getStats(): Promise<any> {
    const [
      totalReviews,
      approvedReviews,
      pendingReviews,
      rejectedReviews,
      flaggedReviews,
      averageRating
    ] = await Promise.all([
      this.prismaClient.review.count(),
      this.prismaClient.review.count({ where: { status: 'approved' } }),
      this.prismaClient.review.count({ where: { status: 'pending' } }),
      this.prismaClient.review.count({ where: { status: 'rejected' } }),
      this.prismaClient.review.count({ where: { status: 'flagged' } }),
      this.prismaClient.review.aggregate({
        _avg: { rating: true }
      })
    ]);

    return {
      total: totalReviews,
      approved: approvedReviews,
      pending: pendingReviews,
      rejected: rejectedReviews,
      flagged: flaggedReviews,
      averageRating: averageRating._avg.rating || 0
    };
  }

  async getMenuItemsStats(menuItemId: string): Promise<any> {
    const reviews = await this.prismaClient.review.findMany({
      where: {
        menuItemId: menuItemId,
        status: 'approved'
      },
      select: {
        rating: true,
        helpfulVotesCount: true,
        totalVotesCount: true
      }
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
        helpfulnessScore: 0
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => 
      reviews.filter(review => review.rating === rating).length
    );

    const helpfulnessScore = reviews.reduce((sum, review) => {
      if (review.totalVotesCount > 0) {
        return sum + (review.helpfulVotesCount / review.totalVotesCount);
      }
      return sum;
    }, 0) / totalReviews;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      helpfulnessScore: Math.round(helpfulnessScore * 100) / 100
    };
  }

  private async updateVoteCounts(reviewId: string): Promise<void> {
    const votes = await this.prismaClient.reviewHelpfulVote.findMany({
      where: { reviewId }
    });

    const helpfulVotesCount = votes.filter(vote => vote.isHelpful).length;
    const totalVotesCount = votes.length;

    await this.prismaClient.review.update({
      where: { id: reviewId },
      data: {
        helpfulVotesCount,
        totalVotesCount
      }
    });
  }
}
