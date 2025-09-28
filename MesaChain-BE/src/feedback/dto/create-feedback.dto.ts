import { IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength, IsBoolean, IsEmail } from 'class-validator';

export enum FeedbackCategory {
  SERVICE = 'service',
  FOOD_QUALITY = 'food_quality',
  AMBIANCE = 'ambiance',
  PRICING = 'pricing',
  STAFF = 'staff',
  GENERAL = 'general'
}

export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export class CreateFeedbackDto {
  @IsUUID()
  orderId: string;

  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @IsEnum(FeedbackPriority)
  priority: FeedbackPriority;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachments?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;
}