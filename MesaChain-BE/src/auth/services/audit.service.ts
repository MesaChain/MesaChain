import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../interfaces/user.interface';

export interface AuditLogEntry {
  action: string;
  userId: string;
  targetUserId?: string;
  oldValue?: any;
  newValue?: any;
  performedBy: string;
  timestamp: Date;
  details?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) { }

  async logRoleChange(
    targetUserId: string,
    oldRole: UserRole,
    newRole: UserRole,
    performedBy: string,
    details?: string
  ): Promise<void> {
    try {
      // For now, we'll use the existing OrderStatusHistory as a reference
      // In a real implementation, you'd want a dedicated audit_logs table
      console.log('AUDIT LOG - Role Change:', {
        action: 'ROLE_CHANGE',
        targetUserId,
        oldValue: oldRole,
        newValue: newRole,
        performedBy,
        timestamp: new Date(),
        details
      });

      // TODO: Store in dedicated audit_logs table when created
      // await this.prisma.auditLog.create({
      //   data: {
      //     action: 'ROLE_CHANGE',
      //     userId: targetUserId,
      //     oldValue: oldRole,
      //     newValue: newRole,
      //     performedBy,
      //     details,
      //   }
      // });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging shouldn't break the main operation
    }
  }

  async logUserAction(
    action: string,
    userId: string,
    performedBy: string,
    details?: string,
    additionalData?: any
  ): Promise<void> {
    try {
      console.log('AUDIT LOG - User Action:', {
        action,
        userId,
        performedBy,
        timestamp: new Date(),
        details,
        additionalData
      });

      // TODO: Store in dedicated audit_logs table when created
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }
}