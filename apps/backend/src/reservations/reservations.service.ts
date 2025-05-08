import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto) {
    const { userId, tableId, startTime, endTime, partySize } = createReservationDto;

    // Verificar disponibilidad
    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        tableId,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    if (existingReservation) {
      throw new ConflictException('La mesa no está disponible en el horario seleccionado');
    }

    return this.prisma.reservation.create({
      data: {
        userId,
        tableId,
        startTime,
        endTime,
        partySize,
        status: ReservationStatus.PENDING,
      },
      include: {
        user: true,
        table: true,
      },
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: {
        user: true,
        table: true,
      },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        user: true,
        table: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.findOne(id);

    return this.prisma.reservation.update({
      where: { id },
      data: updateReservationDto,
      include: {
        user: true,
        table: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.reservation.delete({
      where: { id },
    });
  }

  async getAvailability(startTime: Date, endTime: Date, partySize: number) {
    const tables = await this.prisma.table.findMany({
      where: {
        capacity: {
          gte: partySize,
        },
      },
      include: {
        reservations: {
          where: {
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } },
                ],
              },
            ],
          },
        },
      },
    });

    return tables.map(table => ({
      ...table,
      available: table.reservations.length === 0,
    }));
  }

  async cancel(id: string) {
    const reservation = await this.findOne(id);
    
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('La reserva ya está cancelada');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
      },
      include: {
        user: true,
        table: true,
      },
    });
  }
} 