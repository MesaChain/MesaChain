import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReviewsFeedbackGateway } from './reviews-feedback.gateway';
import { WebSocketService } from './websocket.service';

@Module({
  imports: [JwtModule],
  providers: [ReviewsFeedbackGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}

