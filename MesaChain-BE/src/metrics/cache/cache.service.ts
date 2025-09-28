import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MetricsCacheService {
  private readonly logger = new Logger(MetricsCacheService.name);
  private cache = new Map<string, any>();

  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value);
    
    if (ttl) {
      setTimeout(() => {
        this.cache.delete(key);
      }, ttl * 1000);
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  generateCacheKey(...parts: string[]): string {
    return parts.join(':');
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Simple pattern matching for cache invalidation
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern.replace('*', ''))
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}