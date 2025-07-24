import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';

@Injectable()
export class MetricsRateLimitGuard extends ThrottlerGuard {
  constructor(
    options: any,
    storageService: ThrottlerStorage,
    reflector: Reflector
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id || req.ip;
  }
}