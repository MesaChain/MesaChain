import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReviewsService } from '../../reviews/reviews.service';
import { Review, ReviewStats } from '../schema/review.schema';
import { 
  CreateReviewInput, 
  UpdateReviewInput, 
  ReviewQueryInput,
  VoteReviewInput,
  ReportReviewInput 
} from '../inputs/review.inputs';
import { CreateReviewDto } from '../../reviews/dto/create-review.dto';
import { UpdateReviewDto } from '../../reviews/dto/create-review.dto';
import { ReviewQueryDto } from '../../reviews/dto/create-review.dto';
import { VoteReviewDto } from '../../reviews/dto/create-review.dto';
import { ReportReviewDto } from '../../reviews/dto/create-review.dto';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Query(() => [Review])
  async reviews(@Args('input') input: ReviewQueryInput) {
    // Convert GraphQL input to DTO format
    const queryDto: ReviewQueryDto = {
      page: input.page,
      limit: input.limit,
      status: input.status as any,
      rating: input.rating,
      menuItemId: input.menuItemId,
      userId: input.userId,
      orderId: input.orderId,
      startDate: input.startDate,
      endDate: input.endDate,
      search: input.search,
      sortBy: input.sortBy as any,
      sortOrder: input.sortOrder as any,
    };

    const result = await this.reviewsService.findAll(queryDto);
    return result.reviews;
  }

  @Query(() => Review, { nullable: true })
  async review(@Args('id') id: string) {
    try {
      return await this.reviewsService.findOne(id);
    } catch (error) {
      return null;
    }
  }

  @Query(() => ReviewStats)
  async reviewStats(@Args('menuItemId', { nullable: true }) menuItemId?: string) {
    if (menuItemId) {
      const stats = await this.reviewsService.getMenuItemsStats(menuItemId);
      return {
        totalReviews: stats.totalReviews,
        averageRating: stats.averageRating,
        ratingDistribution: JSON.stringify(stats.ratingDistribution),
        statusBreakdown: '{}',
        recentReviews: [],
        moderationStats: JSON.stringify({ helpfulnessScore: stats.helpfulnessScore }),
      };
    } else {
      const stats = await this.reviewsService.getStats();
      return {
        totalReviews: stats.total,
        averageRating: stats.averageRating,
        ratingDistribution: '{}',
        statusBreakdown: JSON.stringify({
          approved: stats.approved,
          pending: stats.pending,
          rejected: stats.rejected,
          flagged: stats.flagged
        }),
        recentReviews: [],
        moderationStats: '{}',
      };
    }
  }

  @Mutation(() => Review)
  async createReview(
    @Args('input') input: CreateReviewInput,
    @Args('userId', { nullable: true }) userId?: string
  ) {
    const createDto: CreateReviewDto = {
      orderId: input.orderId,
      menuItemId: input.menuItemId,
      rating: input.rating,
      content: input.content,
      isAnonymous: input.isAnonymous,
    };
    return await this.reviewsService.create(createDto, userId || 'anonymous');
  }

  @Mutation(() => Review)
  async updateReview(
    @Args('id') id: string,
    @Args('input') input: UpdateReviewInput,
    @Args('userId', { nullable: true }) userId?: string
  ) {
    const updateDto: UpdateReviewDto = {
      rating: input.rating,
      content: input.content,
      status: input.status as any,
      moderationNotes: input.moderationNotes,
    };
    return await this.reviewsService.update(id, updateDto, userId || 'system');
  }

  @Mutation(() => Boolean)
  async deleteReview(@Args('id') id: string, @Args('userId', { nullable: true }) userId?: string) {
    await this.reviewsService.remove(id, userId || 'system');
    return true;
  }

  @Mutation(() => Boolean)
  async voteReview(
    @Args('id') id: string,
    @Args('input') input: VoteReviewInput,
    @Args('userId') userId: string
  ) {
    const voteDto: VoteReviewDto = {
      isHelpful: input.isHelpful,
    };
    await this.reviewsService.vote(id, voteDto, userId);
    return true;
  }

  @Mutation(() => Boolean)
  async reportReview(
    @Args('id') id: string,
    @Args('input') input: ReportReviewInput,
    @Args('userId') userId: string
  ) {
    const reportDto: ReportReviewDto = {
      reason: input.reason,
      description: input.description,
    };
    await this.reviewsService.report(id, reportDto, userId);
    return true;
  }
}
