import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getAvailability: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createReservationDto = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      tableId: '123e4567-e89b-12d3-a456-426614174001',
      startTime: '2024-03-20T19:00:00Z',
      endTime: '2024-03-20T20:00:00Z',
      partySize: 4,
    };

    it('should create a reservation', async () => {
      const expectedResult = {
        ...createReservationDto,
        id: '123e4567-e89b-12d3-a456-426614174002',
        status: ReservationStatus.PENDING,
      };

      mockReservationsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createReservationDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createReservationDto);
    });

    it('should throw BadRequestException for invalid input', async () => {
      const invalidDto = {
        ...createReservationDto,
        partySize: -1,
      };

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAvailability', () => {
    const startTime = '2024-03-20T19:00:00Z';
    const endTime = '2024-03-20T20:00:00Z';
    const partySize = 4;

    it('should return available tables', async () => {
      const expectedResult = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Table 1',
          capacity: 4,
          location: 'Window',
          available: true,
        },
      ];

      mockReservationsService.getAvailability.mockResolvedValue(expectedResult);

      const result = await controller.getAvailability(startTime, endTime, partySize);

      expect(result).toEqual(expectedResult);
      expect(service.getAvailability).toHaveBeenCalledWith(
        new Date(startTime),
        new Date(endTime),
        partySize,
      );
    });
  });

  describe('cancel', () => {
    const reservationId = '123e4567-e89b-12d3-a456-426614174000';

    it('should cancel a reservation', async () => {
      const expectedResult = {
        id: reservationId,
        status: ReservationStatus.CANCELLED,
      };

      mockReservationsService.cancel.mockResolvedValue(expectedResult);

      const result = await controller.cancel(reservationId);

      expect(result).toEqual(expectedResult);
      expect(service.cancel).toHaveBeenCalledWith(reservationId);
    });
  });
}); 