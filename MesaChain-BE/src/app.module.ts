import { Module } from "@nestjs/common";
import { APP_FILTER } from '@nestjs/core';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { SharedModule } from "./shared/shared.module";
import { ConfigModule } from "./config/config.module";
import { OrdersModule } from "./orders/orders.module";
import { MenuModule } from "./menu/menu.module";
import { ReservationsModule } from "./reservations/reservations.module";
import { HealthModule } from './health/health.module';
// import { MetricsModule } from './metrics/metrics.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PrismaModule } from './shared/prisma.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { GraphQLAppModule } from './graphql/graphql.module';
import { WebSocketModule } from './websockets/websocket.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SharedModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    MenuModule,
    ReservationsModule,
    HealthModule,
    // MetricsModule,
    ReviewsModule,
    FeedbackModule,
    GraphQLAppModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule { }