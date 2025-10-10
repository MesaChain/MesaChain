import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { FeedbackModule } from '../feedback/feedback.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { ReviewResolver } from './resolvers/review.resolver';
import { FeedbackResolver } from './resolvers/feedback.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),
    FeedbackModule,
    ReviewsModule,
  ],
  providers: [ReviewResolver, FeedbackResolver],
  exports: [GraphQLModule],
})
export class GraphQLAppModule {}
