import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AiModerationService } from '../services/ai-moderation.service';
import { ModerateContentDto, ModerationResultDto } from '../dto/moderate-content.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../interfaces/user.interface';

@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModerationController {
  constructor(private readonly aiModerationService: AiModerationService) {}

  @Post('analyze')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async analyzeContent(@Body() moderateContentDto: ModerateContentDto): Promise<ModerationResultDto> {
    if (moderateContentDto.type === 'review') {
      return await this.aiModerationService.moderateReview(
        moderateContentDto.content,
        moderateContentDto.rating || 3
      );
    } else {
      return await this.aiModerationService.moderateFeedback(
        moderateContentDto.content,
        moderateContentDto.subject || ''
      );
    }
  }

  @Post('review')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async moderateReview(
    @Body() body: { content: string; rating: number }
  ): Promise<ModerationResultDto> {
    return await this.aiModerationService.moderateReview(body.content, body.rating);
  }

  @Post('feedback')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async moderateFeedback(
    @Body() body: { content: string; subject: string }
  ): Promise<ModerationResultDto> {
    return await this.aiModerationService.moderateFeedback(body.content, body.subject);
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'AI Moderation Service',
      timestamp: new Date().toISOString()
    };
  }
}

