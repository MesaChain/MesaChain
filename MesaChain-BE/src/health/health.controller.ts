import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const startTime = Date.now();
    
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'connected',
          responseTime: `${responseTime}ms`
        },
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
        },
        environment: process.env.NODE_ENV || 'development'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'disconnected',
          responseTime: `${responseTime}ms`,
          error: error.message
        },
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
        },
        environment: process.env.NODE_ENV || 'development'
      };
    }
  }
}