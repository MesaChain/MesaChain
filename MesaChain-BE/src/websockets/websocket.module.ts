import { Module } from '@nestjs/common';
import { ReviewsFeedbackGateway } from './reviews-feedback.gateway';
import { WebSocketService } from './websocket.service';

@Module({
  providers: [ReviewsFeedbackGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}

