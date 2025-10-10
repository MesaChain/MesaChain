import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class CreateFeedbackInput {
  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field(() => String)
  category: string;

  @Field(() => String)
  priority: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  message: string;
}

@InputType()
export class UpdateFeedbackInput {
  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  priority?: string;

  @Field(() => ID, { nullable: true })
  assignedTo?: string;

  @Field(() => String, { nullable: true })
  notes?: string;
}

@InputType()
export class FeedbackQueryInput {
  @Field(() => Int, { defaultValue: 1 })
  page?: number;

  @Field(() => Int, { defaultValue: 10 })
  limit?: number;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => String, { nullable: true })
  priority?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => ID, { nullable: true })
  assignedTo?: string;

  @Field(() => String, { nullable: true })
  startDate?: string;

  @Field(() => String, { nullable: true })
  endDate?: string;

  @Field(() => String, { nullable: true })
  search?: string;
}

@InputType()
export class CreateFeedbackResponseInput {
  @Field(() => String)
  message: string;

  @Field(() => Boolean, { defaultValue: false })
  isInternal?: boolean;
}
