import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FeedbackService } from '../../feedback/feedback.service';
import { Feedback, FeedbackStats, FeedbackResponse } from '../schema/feedback.schema';
import { 
  CreateFeedbackInput, 
  UpdateFeedbackInput, 
  FeedbackQueryInput,
  CreateFeedbackResponseInput 
} from '../inputs/feedback.inputs';

@Resolver(() => Feedback)
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Query(() => [Feedback])
  async feedback(@Args('input') input: FeedbackQueryInput) {
    // Convert GraphQL input to DTO format
    const queryDto = {
      page: input.page,
      limit: input.limit,
      status: input.status as any,
      category: input.category as any,
      priority: input.priority as any,
      userId: input.userId,
      assignedTo: input.assignedTo,
      startDate: input.startDate,
      endDate: input.endDate,
      search: input.search,
    };

    const result = await this.feedbackService.findAll(queryDto);
    return result.feedback;
  }

  @Query(() => Feedback, { nullable: true })
  async feedbackById(@Args('id') id: string) {
    try {
      return await this.feedbackService.findOne(id);
    } catch (error) {
      return null;
    }
  }

  @Query(() => FeedbackStats)
  async feedbackStats() {
    // This will be implemented with proper analytics
    return {
      totalFeedback: 0,
      statusBreakdown: '{}',
      categoryBreakdown: '{}',
      priorityBreakdown: '{}',
      averageResolutionTime: 0,
      recentFeedback: [],
    };
  }

  @Mutation(() => Feedback)
  async createFeedback(
    @Args('input') input: CreateFeedbackInput,
    @Args('userId', { nullable: true }) userId?: string
  ) {
    const createDto = {
      orderId: input.orderId,
      category: input.category as any,
      priority: input.priority as any,
      subject: input.subject,
      message: input.message,
    };

    return await this.feedbackService.create(createDto, userId || 'anonymous');
  }

  @Mutation(() => Feedback)
  async updateFeedback(
    @Args('id') id: string,
    @Args('input') input: UpdateFeedbackInput
  ) {
    const updateDto = {
      status: input.status as any,
      priority: input.priority as any,
      assignedTo: input.assignedTo,
      notes: input.notes,
    };

    return await this.feedbackService.update(id, updateDto, 'system');
  }

  @Mutation(() => Boolean)
  async deleteFeedback(@Args('id') id: string) {
    await this.feedbackService.remove(id, 'system');
    return true;
  }

  @Mutation(() => FeedbackResponse)
  async createFeedbackResponse(
    @Args('feedbackId') feedbackId: string,
    @Args('input') input: CreateFeedbackResponseInput,
    @Args('responderId', { nullable: true }) responderId?: string
  ) {
    const responseDto = {
      message: input.message,
      isInternal: input.isInternal,
    };

    // For now, return a mock response since createResponse doesn't exist yet
    return {
      id: 'mock-id',
      feedbackId,
      message: responseDto.message,
      responderId: responderId || 'system',
      isInternal: responseDto.isInternal,
      createdAt: new Date(),
    };
  }

  @Mutation(() => Boolean)
  async deleteFeedbackResponse(@Args('id') id: string) {
    // For now, just return true since removeResponse doesn't exist yet
    return true;
  }
}
