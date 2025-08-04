import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

/**
 * PrismaModule provides database connectivity across the application
 * through the PrismaService
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
