import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PrismaModule } from '../shared/prisma.module';
import { WebSocketModule } from '../websockets/websocket.module';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
  imports: [PrismaModule, WebSocketModule, FeedbackModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

