import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { PrismaService } from '../prisma/prisma.service';
import { MenuCategory } from '../interfaces/order.interface';

const mockPrismaService = () => ({
  menuItem: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

type MockPrismaService = ReturnType<typeof mockPrismaService>;

describe('MenuService', () => {
  let service: MenuService;
  let prisma: MockPrismaService;

  const mockMenuItem = {
    id: 'menu-1',
    name: 'Test Burger',
    description: 'A delicious test burger',
    price: 12.99,
    category: MenuCategory.FOOD,
    imageUrl: 'https://example.com/burger.jpg',
    available: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    prisma = module.get<MockPrismaService>(PrismaService);
  });

  describe('create', () => {
    const createMenuItemDto = {
      name: 'Test Burger',
      description: 'A delicious test burger',
      price: 12.99,
      category: MenuCategory.FOOD,
      imageUrl: 'https://example.com/burger.jpg',
      available: true
    };

    it('should create a menu item successfully', async () => {
      prisma.menuItem.create.mockResolvedValue(mockMenuItem);

      const result = await service.create(createMenuItemDto);

      expect(prisma.menuItem.create).toHaveBeenCalledWith({
        data: {
          ...createMenuItemDto,
          price: expect.any(Object), // Decimal object
          available: true
        }
      });
      expect(result.name).toBe('Test Burger');
      expect(result.price).toBe(12.99);
    });

    it('should create a menu item with default available true', async () => {
      const createDtoWithoutAvailable = {
        name: 'Test Burger',
        price: 12.99,
        category: MenuCategory.FOOD
      };
      prisma.menuItem.create.mockResolvedValue(mockMenuItem);

      await service.create(createDtoWithoutAvailable);

      expect(prisma.menuItem.create).toHaveBeenCalledWith({
        data: {
          ...createDtoWithoutAvailable,
          price: expect.any(Object),
          available: true
        }
      });
    });

    it('should create a menu item with specified availability', async () => {
      const createDtoUnavailable = {
        ...createMenuItemDto,
        available: false
      };
      prisma.menuItem.create.mockResolvedValue({ ...mockMenuItem, available: false });

      await service.create(createDtoUnavailable);

      expect(prisma.menuItem.create).toHaveBeenCalledWith({
        data: {
          ...createDtoUnavailable,
          price: expect.any(Object),
          available: false
        }
      });
    });
  });

  describe('findAll', () => {
    const mockMenuItems = [
      mockMenuItem,
      {
        ...mockMenuItem,
        id: 'menu-2',
        name: 'Test Drink',
        category: MenuCategory.DRINKS,
        available: false
      }
    ];

    it('should return all menu items when no filter provided', async () => {
      prisma.menuItem.findMany.mockResolvedValue(mockMenuItems);

      const result = await service.findAll();

      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ category: 'asc' }, { name: 'asc' }]
      });
      expect(result).toHaveLength(2);
    });

    it('should return only available menu items when available=true', async () => {
      const availableItems = [mockMenuItem];
      prisma.menuItem.findMany.mockResolvedValue(availableItems);

      const result = await service.findAll(true);

      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { available: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }]
      });
      expect(result).toHaveLength(1);
      expect(result[0].available).toBe(true);
    });

    it('should return only unavailable menu items when available=false', async () => {
      const unavailableItems = [{ ...mockMenuItem, available: false }];
      prisma.menuItem.findMany.mockResolvedValue(unavailableItems);

      const result = await service.findAll(false);

      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { available: false },
        orderBy: [{ category: 'asc' }, { name: 'asc' }]
      });
      expect(result).toHaveLength(1);
      expect(result[0].available).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return a menu item when found', async () => {
      prisma.menuItem.findUnique.mockResolvedValue(mockMenuItem);

      const result = await service.findOne('menu-1');

      expect(prisma.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'menu-1' }
      });
      expect(result.id).toBe('menu-1');
      expect(result.name).toBe('Test Burger');
    });

    it('should throw NotFoundException when menu item not found', async () => {
      prisma.menuItem.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent'))
        .rejects.toThrow(NotFoundException);

      expect(prisma.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
    });
  });

  describe('update', () => {
    const updateMenuItemDto = {
      name: 'Updated Burger',
      price: 15.99,
      available: false
    };

    it('should update a menu item successfully', async () => {
      prisma.menuItem.findUnique.mockResolvedValue(mockMenuItem);
      const updatedMenuItem = { ...mockMenuItem, ...updateMenuItemDto };
      prisma.menuItem.update.mockResolvedValue(updatedMenuItem);

      const result = await service.update('menu-1', updateMenuItemDto);

      expect(prisma.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'menu-1' }
      });
      expect(prisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: 'menu-1' },
        data: {
          ...updateMenuItemDto,
          price: expect.any(Object) // Decimal object
        }
      });
      expect(result.name).toBe('Updated Burger');
    });

    it('should throw NotFoundException for non-existent menu item', async () => {
      prisma.menuItem.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateMenuItemDto))
        .rejects.toThrow(NotFoundException);

      expect(prisma.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
      expect(prisma.menuItem.update).not.toHaveBeenCalled();
    });

    it('should update without price field', async () => {
      const updateDtoWithoutPrice = {
        name: 'Updated Burger Name',
        available: false
      };
      prisma.menuItem.findUnique.mockResolvedValue(mockMenuItem);
      const updatedMenuItem = { ...mockMenuItem, ...updateDtoWithoutPrice };
      prisma.menuItem.update.mockResolvedValue(updatedMenuItem);

      await service.update('menu-1', updateDtoWithoutPrice);

      expect(prisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: 'menu-1' },
        data: updateDtoWithoutPrice
      });
    });
  });

  describe('remove', () => {
    it('should delete a menu item successfully', async () => {
      prisma.menuItem.findUnique.mockResolvedValue(mockMenuItem);
      prisma.menuItem.delete.mockResolvedValue(mockMenuItem);

      await service.remove('menu-1');

      expect(prisma.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'menu-1' }
      });
      expect(prisma.menuItem.delete).toHaveBeenCalledWith({
        where: { id: 'menu-1' }
      });
    });

    it('should throw NotFoundException for non-existent menu item', async () => {
      prisma.menuItem.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent'))
        .rejects.toThrow(NotFoundException);

      expect(prisma.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
      expect(prisma.menuItem.delete).not.toHaveBeenCalled();
    });
  });

  describe('formatMenuItem', () => {
    it('should format price as number', () => {
      const rawMenuItem = {
        ...mockMenuItem,
        price: {
          valueOf: () => 12.99,
          toString: () => '12.99',
          toNumber: () => 12.99
        } // Mock Decimal object that works with Number()
      };

      const result = (service as any).formatMenuItem(rawMenuItem);

      expect(result.price).toBe(12.99);
      expect(typeof result.price).toBe('number');
    });
  });
}); 