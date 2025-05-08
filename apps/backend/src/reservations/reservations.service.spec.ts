import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    reservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    table: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createReservationDto = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      tableId: '123e4567-e89b-12d3-a456-426614174001',
      startTime: new Date('2024-03-20T19:00:00Z'),
      endTime: new Date('2024-03-20T20:00:00Z'),
      partySize: 4,
    };

    it('should create a reservation when table is available', async () => {
      mockPrismaService.reservation.findFirst.mockResolvedValue(null);
      mockPrismaService.reservation.create.mockResolvedValue({
        ...createReservationDto,
        id: '123e4567-e89b-12d3-a456-426614174002',
        status: ReservationStatus.PENDING,
      });

      const result = await service.create(createReservationDto);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe(ReservationStatus.PENDING);
      expect(mockPrismaService.reservation.create).toHaveBeenCalledWith({
        data: {
          ...createReservationDto,
          status: ReservationStatus.PENDING,
        },
        include: {
          user: true,
          table: true,
        },
      });
    });

    it('should throw ConflictException when table is not available', async () => {
      mockPrismaService.reservation.findFirst.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174003',
      });

      await expect(service.create(createReservationDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getAvailability', () => {
    const startTime = new Date('2024-03-20T19:00:00Z');
    const endTime = new Date('2024-03-20T20:00:00Z');
    const partySize = 4;

    it('should return available tables', async () => {
      const mockTables = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Table 1',
          capacity: 4,
          location: 'Window',
          reservations: [],
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Table 2',
          capacity: 6,
          location: 'Center',
          reservations: [
            {
              id: '123e4567-e89b-12d3-a456-426614174003',
              startTime: new Date('2024-03-20T19:00:00Z'),
              endTime: new Date('2024-03-20T20:00:00Z'),
            },
          ],
        },
      ];

      mockPrismaService.table.findMany.mockResolvedValue(mockTables);

      const result = await service.getAvailability(startTime, endTime, partySize);

      expect(result).toHaveLength(2);
      expect(result[0].available).toBe(true);
      expect(result[1].available).toBe(false);
    });
  });

  describe('cancel', () => {
    const reservationId = '123e4567-e89b-12d3-a456-426614174000';

    it('should cancel a reservation', async () => {
      const mockReservation = {
        id: reservationId,
        status: ReservationStatus.PENDING,
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrismaService.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      });

      const result = await service.cancel(reservationId);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(mockPrismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
        include: {
          user: true,
          table: true,
        },
      });
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      await expect(service.cancel(reservationId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when reservation is already cancelled', async () => {
      const mockReservation = {
        id: reservationId,
        status: ReservationStatus.CANCELLED,
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);

      await expect(service.cancel(reservationId)).rejects.toThrow(
        ConflictException,
      );
    });
  });
}); 