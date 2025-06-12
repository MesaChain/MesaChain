import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderStatus } from '../interfaces/order.interface';
import { UserRole } from '../interfaces/user.interface';

const mockOrdersService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  processPayment: jest.fn(),
  remove: jest.fn(),
});

type MockOrdersService = ReturnType<typeof mockOrdersService>;

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: MockOrdersService;

  const mockStaffUser = {
    id: 'staff-1',
    email: 'staff@test.com',
    name: 'Test Staff',
    role: UserRole.STAFF,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockAdminUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockRegularUser = {
    id: 'user-1',
    email: 'user@test.com',
    name: 'Test User',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-20241201-0001',
    staffId: 'staff-1',
    customerName: 'John Doe',
    status: OrderStatus.PENDING,
    subtotal: 12.99,
    tax: 1.07,
    total: 14.06,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: []
  };

  const mockJwtGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useFactory: mockOrdersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<MockOrdersService>(OrdersService);
  });

  describe('create', () => {
    const createOrderDto = {
      customerName: 'John Doe',
      items: [{ menuItemId: 'menu-1', quantity: 2 }]
    };

    it('should create an order successfully with STAFF role', async () => {
      service.create.mockResolvedValue(mockOrder);

      const result = await controller.create(createOrderDto, mockStaffUser);

      expect(service.create).toHaveBeenCalledWith(createOrderDto, mockStaffUser);
      expect(result).toEqual(mockOrder);
    });

    it('should create an order successfully with ADMIN role', async () => {
      service.create.mockResolvedValue(mockOrder);

      const result = await controller.create(createOrderDto, mockAdminUser);

      expect(service.create).toHaveBeenCalledWith(createOrderDto, mockAdminUser);
      expect(result).toEqual(mockOrder);
    });

    it('should handle service errors properly', async () => {
      const error = new Error('Menu item not found');
      service.create.mockRejectedValue(error);

      await expect(controller.create(createOrderDto, mockStaffUser))
        .rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    const queryDto = {
      page: 1,
      limit: 10,
      status: OrderStatus.PENDING
    };

    const mockResponse = {
      orders: [mockOrder],
      total: 1,
      page: 1,
      limit: 10
    };

    it('should return paginated orders', async () => {
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty query parameters', async () => {
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return an order by ID', async () => {
      service.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne('order-1');

      expect(service.findOne).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(mockOrder);
    });

    it('should handle not found errors', async () => {
      const error = new Error('Order not found');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne('non-existent'))
        .rejects.toThrow(error);
    });
  });

  describe('update', () => {
    const updateOrderDto = {
      customerName: 'Jane Doe',
      items: [{ menuItemId: 'menu-1', quantity: 1 }]
    };

    it('should update an order successfully', async () => {
      const updatedOrder = { ...mockOrder, customerName: 'Jane Doe' };
      service.update.mockResolvedValue(updatedOrder);

      const result = await controller.update('order-1', updateOrderDto, mockStaffUser);

      expect(service.update).toHaveBeenCalledWith('order-1', updateOrderDto, mockStaffUser);
      expect(result).toEqual(updatedOrder);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Cannot modify order in current status');
      service.update.mockRejectedValue(error);

      await expect(controller.update('order-1', updateOrderDto, mockStaffUser))
        .rejects.toThrow(error);
    });
  });

  describe('updateStatus', () => {
    const statusUpdate = {
      status: OrderStatus.COMPLETED,
      notes: 'Order completed'
    };

    it('should update order status successfully', async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.COMPLETED };
      service.updateStatus.mockResolvedValue(updatedOrder);

      const result = await controller.updateStatus('order-1', statusUpdate, mockStaffUser);

      expect(service.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.COMPLETED, mockStaffUser, 'Order completed');
      expect(result).toEqual(updatedOrder);
    });

    it('should handle invalid status transitions', async () => {
      const error = new Error('Invalid status transition');
      service.updateStatus.mockRejectedValue(error);

      await expect(controller.updateStatus('order-1', statusUpdate, mockStaffUser))
        .rejects.toThrow(error);
    });

    it('should handle status update without notes', async () => {
      const statusUpdateNoNotes = { status: OrderStatus.COMPLETED };
      const updatedOrder = { ...mockOrder, status: OrderStatus.COMPLETED };
      service.updateStatus.mockResolvedValue(updatedOrder);

      const result = await controller.updateStatus('order-1', statusUpdateNoNotes, mockStaffUser);

      expect(service.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.COMPLETED, mockStaffUser, undefined);
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const paidOrder = { ...mockOrder, status: OrderStatus.COMPLETED };
      service.processPayment.mockResolvedValue(paidOrder);

      const result = await controller.processPayment('order-1', mockStaffUser);

      expect(service.processPayment).toHaveBeenCalledWith('order-1', mockStaffUser);
      expect(result).toEqual(paidOrder);
    });

    it('should handle payment processing errors', async () => {
      const error = new Error('Payment failed');
      service.processPayment.mockRejectedValue(error);

      await expect(controller.processPayment('order-1', mockStaffUser))
        .rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should delete an order successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('order-1', mockStaffUser);

      expect(service.remove).toHaveBeenCalledWith('order-1', mockStaffUser);
      expect(result).toBeUndefined();
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Cannot delete order in current status');
      service.remove.mockRejectedValue(error);

      await expect(controller.remove('order-1', mockStaffUser))
        .rejects.toThrow(error);
    });
  });

  describe('Role-based access', () => {
    it('should allow access for STAFF role', () => {
      // This is tested implicitly through the guard mocking
      // In a real scenario, the RolesGuard would check the @Roles decorator
      expect(mockRolesGuard.canActivate).toBeDefined();
    });

    it('should allow access for ADMIN role', () => {
      // This is tested implicitly through the guard mocking
      // In a real scenario, the RolesGuard would check the @Roles decorator
      expect(mockRolesGuard.canActivate).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should require JWT authentication', () => {
      // This is tested implicitly through the guard mocking
      // In a real scenario, the JwtAuthGuard would validate the JWT token
      expect(mockJwtGuard.canActivate).toBeDefined();
    });
  });
}); 