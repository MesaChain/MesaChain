import { Module, forwardRef } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { ReservationsController } from "./reservations.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { ReservationsGateway } from "./reservations.gateway";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsGateway],
  exports: [ReservationsService],
})
export class ReservationsModule {}
