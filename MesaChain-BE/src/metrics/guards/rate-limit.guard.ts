import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerModuleOptions } from "@nestjs/throttler";
import { Reflector } from "@nestjs/core";

@Injectable()
export class MetricsRateLimitGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: any,
    reflector: Reflector
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Custom tracking logic for metrics endpoints
    const userId = req.user?.id;
    const ip = req.ip || req.connection?.remoteAddress;

    // Use user ID if authenticated, otherwise fall back to IP
    return userId ? `user:${userId}` : `ip:${ip}`;
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    // Different limits for different user types
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role === "admin") {
      return 1000; // Higher limit for admins
    } else if (user?.role === "staff") {
      return 500; // Medium limit for staff
    }

    return 100; // Default limit for regular users
  }

  protected async getTtl(context: ExecutionContext): Promise<number> {
    // 1 minute window
    return 60;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await super.canActivate(context);
    } catch (error) {
      // Log rate limit violations for monitoring
      const request = context.switchToHttp().getRequest();
      const tracker = await this.getTracker(request);

      console.warn(`Rate limit exceeded for ${tracker} on metrics endpoint`);
      throw error;
    }
  }
}
