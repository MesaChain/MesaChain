import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { ModerationController } from './controllers/moderation.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { ChartController } from './controllers/chart.controller';
import { AiModerationService } from './services/ai-moderation.service';
import { AnalyticsService } from './services/analytics.service';
import { ChartDataService } from './services/chart-data.service';
import { PrismaModule } from '../shared/prisma.module';
import { WebSocketModule } from '../websockets/websocket.module';

@Module({
  imports: [PrismaModule, WebSocketModule],
  controllers: [
    FeedbackController, 
    ModerationController, 
    AnalyticsController, 
    ChartController
  ],
  providers: [
    FeedbackService, 
    AiModerationService, 
    AnalyticsService, 
    ChartDataService
  ],
  exports: [
    FeedbackService, 
    AiModerationService, 
    AnalyticsService, 
    ChartDataService
  ],
})
export class FeedbackModule {}