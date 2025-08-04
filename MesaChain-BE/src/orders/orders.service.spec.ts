import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../shared/prisma.service';
import { OrderStatus } from '../interfaces/order.interface';
import { UserRole } from '../interfaces/user.interface';

const mockPrismaService = () => ({
  menuItem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  orderItem: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  orderStatusHistory: {
    create: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
});

type MockPrismaService = ReturnType<typeof mockPrismaService>;

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: MockPrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'staff@test.com',
    name: 'Test Staff',
    role: UserRole.STAFF,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockMenuItem = {
    id: 'menu-1',
    name: 'Test Burger',
    price: 12.99,
    category: 'FOOD',
    available: true
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-20241201-0001',
    staffId: 'user-1',
    customerName: 'John Doe',
    status: OrderStatus.PENDING,
    subtotal: 12.99,
    tax: 1.07,
    total: 14.06,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    staff: { id: 'user-1', name: 'Test Staff', email: 'staff@test.com' }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<MockPrismaService>(PrismaService);
  });

  describe('create', () => {
    const createOrderDto = {
      customerName: 'John Doe',
      items: [{ menuItemId: 'menu-1', quantity: 2, notes: 'Extra cheese' }]
    };

    it('should create an order successfully', async () => {
      prisma.menuItem.findMany.mockResolvedValue([mockMenuItem]);
      const mockTransaction = jest.fn().mockResolvedValue({
        ...mockOrder,
        items: [{
          id: 'item-1',
          menuItemId: 'menu-1',
          quantity: 2,
          unitPrice: 12.99,
          totalPrice: 25.98,
          menuItem: mockMenuItem
        }]
      });
      prisma.$transaction.mockImplementation(mockTransaction);

      const result = await service.create(createOrderDto, mockUser);

      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['menu-1'] }, available: true }
      });
      expect(mockTransaction).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.customerName).toBe('John Doe');
    });

    it('should throw BadRequestException for unavailable menu items', async () => {
      prisma.menuItem.findMany.mockResolvedValue([]);

      await expect(service.create(createOrderDto, mockUser))
        .rejects.toThrow(BadRequestException);

      expect(prisma.menuItem.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException for partial menu items found', async () => {
      const createOrderDtoMultiple = {
        customerName: 'John Doe',
        items: [
          { menuItemId: 'menu-1', quantity: 1 },
          { menuItemId: 'menu-2', quantity: 1 }
        ]
      };
      prisma.menuItem.findMany.mockResolvedValue([mockMenuItem]); // Only one item found

      await expect(service.create(createOrderDtoMultiple, mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return an order when found', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: expect.any(Object)
      });
      expect(result.id).toBe('order-1');
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateOrderDto = {
      customerName: 'Jane Doe',
      items: [{ menuItemId: 'menu-1', quantity: 1 }]
    };

    it('should update a PENDING order successfully', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.PENDING });
      prisma.menuItem.findMany.mockResolvedValue([mockMenuItem]);
      const mockTransaction = jest.fn().mockResolvedValue(mockOrder);
      prisma.$transaction.mockImplementation(mockTransaction);

      const result = await service.update('order-1', updateOrderDto, mockUser);

      expect(result).toBeDefined();
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateOrderDto, mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-PENDING order', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED
      });

      await expect(service.update('order-1', updateOrderDto, mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully with valid transition', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.PENDING });
      const mockTransaction = jest.fn().mockResolvedValue(mockOrder);
      prisma.$transaction.mockImplementation(mockTransaction);

      const result = await service.updateStatus('order-1', OrderStatus.COMPLETED, mockUser, 'Order ready');

      expect(mockTransaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException for non-existent order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('non-existent', OrderStatus.COMPLETED, mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.COMPLETED });

      await expect(service.updateStatus('order-1', OrderStatus.PENDING, mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a PENDING order successfully', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.PENDING });
      prisma.order.delete.mockResolvedValue(mockOrder);

      await service.remove('order-1', mockUser);

      expect(prisma.order.delete).toHaveBeenCalledWith({ where: { id: 'order-1' } });
    });

    it('should throw NotFoundException for non-existent order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-PENDING order', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.COMPLETED });

      await expect(service.remove('order-1', mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('processPayment', () => {
    it('should process payment for PENDING order', async () => {
      const orderWithWallet = {
        ...mockOrder,
        status: OrderStatus.PENDING,
        staff: { ...mockOrder.staff, wallets: [{ id: 'wallet-1' }] }
      };
      prisma.order.findUnique.mockResolvedValue(orderWithWallet);
      prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });

      // Mock the updateStatus method call
      jest.spyOn(service, 'updateStatus').mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue(mockOrder);

      const result = await service.processPayment('order-1', mockUser);

      expect(prisma.transaction.create).toHaveBeenCalled();
      expect(service.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.COMPLETED, mockUser, 'Payment processed');
    });

    it('should throw BadRequestException for non-PENDING order', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.COMPLETED });

      await expect(service.processPayment('order-1', mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid transitions', () => {
      // Test valid transitions - these should not throw
      expect(() => {
        (service as any).validateStatusTransition(OrderStatus.PENDING, OrderStatus.COMPLETED);
      }).not.toThrow();

      expect(() => {
        (service as any).validateStatusTransition(OrderStatus.PENDING, OrderStatus.CANCELLED);
      }).not.toThrow();
    });

    it('should reject invalid transitions', () => {
      expect(() => {
        (service as any).validateStatusTransition(OrderStatus.COMPLETED, OrderStatus.PENDING);
      }).toThrow(BadRequestException);

      expect(() => {
        (service as any).validateStatusTransition(OrderStatus.CANCELLED, OrderStatus.COMPLETED);
      }).toThrow(BadRequestException);
    });
  });
}); 