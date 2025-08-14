import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
    ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import {
  UpdateReservationDto,
  updateReservationSchema,
 } from "./dto/update-reservation.dto";
 
 // Try importing ReservationStatus from generated Prisma client, fallback to string union if not available
 let ReservationStatus: any;
 type ReservationStatusType =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "READY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";
 try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ReservationStatus = require("@prisma/client").ReservationStatus;
 } catch {
  ReservationStatus = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    IN_PREPARATION: "IN_PREPARATION",
    READY: "READY",
    DELIVERED: "DELIVERED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  };
 }
 
 @Injectable()
 export class ReservationsService {
  constructor(
    private prisma: PrismaService
  ) {}
 
  async findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
   
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ReservationsGateway))
    private gateway: ReservationsGateway
  ) { }
   
  async create(createReservationDto: CreateReservationDto) {
    const { userId, tableId, startTime, endTime, partySize } =
      createReservationDto;
 
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
      throw new ConflictException(
        "La mesa no está disponible en el horario seleccionado"
      );
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
      throw new NotFoundException("Reserva no encontrada");
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
 
    return tables.map((table) => ({
      ...table,
      available: table.reservations.length === 0,
    }));
  }
 
  async cancel(id: string) {
    const reservation = await this.findOne(id);
 
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException("La reserva ya está cancelada");
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
 
  async updateStatus(
    id: string,
    status:
      | "PENDING"
      | "CONFIRMED"
      | "IN_PREPARATION"
      | "READY"
      | "DELIVERED"
      | "COMPLETED"
      | "CANCELLED",
    changedById: string
  ) {
    const reservation = await this.findOne(id);
    if (!reservation) throw new NotFoundException("Reserva no encontrada");
    // Only update if status is different
    if (reservation.status === status) return reservation;
    // Update reservation status
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status },
      include: { user: true, table: true },
    });
    // Log status change
    await this.prisma.reservationStatusHistory.create({
      data: {
        reservationId: id,
        status,
        changedById,
      },
    });
    // TODO: Implement WebSocket broadcast without circular dependency
    return updated;
  }
 
  async getStatusHistory(id: string) {
    return this.prisma.reservationStatusHistory.findMany({
      where: { reservationId: id },
      orderBy: { changedAt: "asc" },
      include: { changedBy: true },
    });
  }
 
  async filterAndSearch({
    status,
    customer,
    orderId,
  }: {
    status?:
    | "PENDING"
    | "CONFIRMED"
    | "IN_PREPARATION"
    | "READY"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED";
    customer?: string;
    orderId?: string;
  }) {
    return this.prisma.reservation.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(orderId ? { id: orderId } : {}),
        ...(customer
          ? { user: { name: { contains: customer, mode: "insensitive" } } }
          : {}),
      },
      include: { user: true, table: true },
    });
  }
 }