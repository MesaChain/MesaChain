import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class MetricsCacheService {
  private readonly logger = new Logger(MetricsCacheService.name);
  private client: RedisClientType;
  private readonly defaultTTL = 300; // 5 minutes

  constructor(private configService: ConfigService) {
    this.initializeRedis();
  }

  private async initializeRedis() {
    this.client = createClient({
      url: this.configService.get('REDIS_URL', 'redis://localhost:6379'),
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    await this.client.connect();
    this.logger.log('Redis client connected successfully');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      this.logger.error(`Cache pattern invalidation error for ${pattern}:`, error);
    }
  }

  generateCacheKey(prefix: string, ...params: string[]): string {
    return `${prefix}:${params.join(':')}`;
  }
}