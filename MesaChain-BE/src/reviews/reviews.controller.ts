import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto, VoteReviewDto, ReportReviewDto, ModerateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user.interface';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: ReviewQueryDto) {
    return this.reviewsService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.reviewsService.getStats();
  }

  @Get('menu-item/:menuItemId/stats')
  getMenuItemsStats(@Param('menuItemId') menuItemId: string) {
    return this.reviewsService.getMenuItemsStats(menuItemId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Request() req) {
    return this.reviewsService.update(id, updateReviewDto, req.user.id);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  vote(@Param('id') id: string, @Body() voteReviewDto: VoteReviewDto, @Request() req) {
    return this.reviewsService.vote(id, voteReviewDto, req.user.id);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  report(@Param('id') id: string, @Body() reportReviewDto: ReportReviewDto, @Request() req) {
    return this.reviewsService.report(id, reportReviewDto, req.user.id);
  }

  @Post(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  moderate(@Param('id') id: string, @Body() moderateReviewDto: ModerateReviewDto, @Request() req) {
    return this.reviewsService.moderate(id, moderateReviewDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.id);
  }
}

