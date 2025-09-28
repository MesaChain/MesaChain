import { InputType, Field, Int, ID } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field(() => ID, { nullable: true })
  menuItemId?: string;

  @Field(() => Int)
  rating: number;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => Boolean, { defaultValue: false })
  isAnonymous?: boolean;
}

@InputType()
export class UpdateReviewInput {
  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  moderationNotes?: string;
}

@InputType()
export class ReviewQueryInput {
  @Field(() => Int, { defaultValue: 1 })
  page?: number;

  @Field(() => Int, { defaultValue: 10 })
  limit?: number;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field(() => ID, { nullable: true })
  menuItemId?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field(() => String, { nullable: true })
  startDate?: string;

  @Field(() => String, { nullable: true })
  endDate?: string;

  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => String, { defaultValue: 'createdAt' })
  sortBy?: string;

  @Field(() => String, { defaultValue: 'desc' })
  sortOrder?: string;
}

@InputType()
export class VoteReviewInput {
  @Field(() => Boolean)
  isHelpful: boolean;
}

@InputType()
export class ReportReviewInput {
  @Field(() => String)
  reason: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

