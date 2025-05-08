import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, createReservationSchema } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    const result = createReservationSchema.safeParse(createReservationDto);
    if (!result.success) {
      throw new BadRequestException(result.error.errors);
    }
    return this.reservationsService.create(result.data);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('availability')
  getAvailability(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('partySize') partySize: number,
  ) {
    return this.reservationsService.getAvailability(
      new Date(startTime),
      new Date(endTime),
      partySize,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
} 