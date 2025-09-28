import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum ReviewType {
  PRODUCT = 'product',
  SERVICE = 'service',
  OVERALL = 'overall',
  RESTAURANT = 'restaurant',
}

registerEnumType(ReviewStatus, {
  name: 'ReviewStatus',
});

registerEnumType(ReviewType, {
  name: 'ReviewType',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String)
  email: string;
}

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  orderNumber: string;
}

@ObjectType()
export class MenuItem {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class Review {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  orderId?: string;

  @Field(() => String, { nullable: true })
  menuItemId?: string;

  @Field(() => Int)
  rating: number;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String)
  status: string;

  @Field(() => Int)
  helpfulVotesCount: number;

  @Field(() => Int)
  totalVotesCount: number;

  @Field(() => Boolean)
  isVerified: boolean;

  @Field(() => Boolean)
  isAnonymous: boolean;

  @Field(() => String, { nullable: true })
  moderationNotes?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Order, { nullable: true })
  order?: Order;

  @Field(() => MenuItem, { nullable: true })
  menuItem?: MenuItem;
}

@ObjectType()
export class ReviewStats {
  @Field(() => Int)
  totalReviews: number;

  @Field(() => Float)
  averageRating: number;

  @Field(() => String)
  ratingDistribution: string; // JSON string

  @Field(() => String)
  statusBreakdown: string; // JSON string

  @Field(() => [Review])
  recentReviews: Review[];

  @Field(() => String)
  moderationStats: string; // JSON string
}
