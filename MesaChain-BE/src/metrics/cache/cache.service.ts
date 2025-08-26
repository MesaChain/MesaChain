import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class MetricsCacheService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(MetricsCacheService.name);
  private client: Redis;
  private readonly defaultTTL = 300; // 5 minutes default TTL

  constructor(private configService: ConfigService) {
    // Remove async call from constructor
  }

  async onApplicationBootstrap() {
    await this.initializeRedis();
  }

  async onApplicationShutdown() {
    if (this.client) {
      await this.client.quit();
      this.logger.log("Redis connection closed");
    }
  }

  private async initializeRedis() {
    try {
      this.client = new Redis({
        host: this.configService.get("REDIS_HOST", "localhost"),
        port: this.configService.get("REDIS_PORT", 6379),
        password: this.configService.get("REDIS_PASSWORD"),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.client.on("connect", () => {
        this.logger.log("Connected to Redis");
      });

      this.client.on("error", (error) => {
        this.logger.error("Redis connection error:", error);
      });
    } catch (error) {
      this.logger.error("Failed to initialize Redis:", error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    this.ensureConnection();
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  // Fix method names and Redis API usage
  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    this.ensureConnection();
    try {
      await this.client.setex(key, ttl, JSON.stringify(value)); // Changed from setEx to setex
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    this.ensureConnection();
    try {
      const keys: string[] = [];
      const batchSize = 100;

      // Use SCAN with stream instead of scanIterator
      const stream = this.client.scanStream({
        match: pattern,
        count: 100,
      });

      stream.on("data", async (resultKeys: string[]) => {
        keys.push(...resultKeys);

        if (keys.length >= batchSize) {
          await this.client.del(...keys);
          this.logger.debug(
            `Deleted ${keys.length} cache keys matching pattern: ${pattern}`
          );
          keys.length = 0;
        }
      });

      stream.on("end", async () => {
        if (keys.length > 0) {
          await this.client.del(...keys);
          this.logger.debug(
            `Deleted final ${keys.length} cache keys matching pattern: ${pattern}`
          );
        }
        this.logger.log(`Cache pattern invalidation completed for: ${pattern}`);
      });
    } catch (error) {
      this.logger.error(
        `Cache pattern invalidation error for ${pattern}:`,
        error
      );
      throw error;
    }
  }

  generateCacheKey(prefix: string, ...params: string[]): string {
    return `${prefix}:${params.join(":")}`;
  }

  private ensureConnection() {
    if (!this.client) {
      throw new Error(
        "Redis client not initialized. Service may not be ready."
      );
    }
  }
}
