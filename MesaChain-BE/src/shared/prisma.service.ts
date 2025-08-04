import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Successfully connected to the database');
    } catch (error) {
      console.error('Failed to connect to the database', error);
      throw error; 
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
