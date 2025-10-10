import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackQueryDto } from './dto/feedback-query.dto';
import { CreateFeedbackResponseDto } from './dto/create-feedback-response.dto';
import { ModerateContentDto } from './dto/moderate-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user.interface';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    return this.feedbackService.create(createFeedbackDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: FeedbackQueryDto) {
    return this.feedbackService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.feedbackService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto, @Request() req) {
    return this.feedbackService.update(id, updateFeedbackDto, req.user.id);
  }

  @Post(':id/responses')
  @UseGuards(JwtAuthGuard)
  addResponse(@Param('id') id: string, @Body() responseDto: CreateFeedbackResponseDto, @Request() req) {
    return this.feedbackService.addResponse(id, responseDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.feedbackService.remove(id, req.user.id);
  }

  @Post('moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  moderateContent(@Body() moderateContentDto: ModerateContentDto) {
    return this.feedbackService.moderateContent(
      moderateContentDto.content,
      moderateContentDto.type,
      moderateContentDto.subject,
      moderateContentDto.rating
    );
  }
}