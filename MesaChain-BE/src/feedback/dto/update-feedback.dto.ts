import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedbackDto } from './create-feedback.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum FeedbackStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;
}