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
import { MetricsModule } from './metrics/metrics.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule,
    SharedModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    MenuModule,
    ReservationsModule,
    HealthModule,
    MetricsModule,
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