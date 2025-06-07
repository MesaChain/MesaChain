import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderStatus, Order, OrderItem } from '../interfaces/order.interface';
import { User } from '../interfaces/user.interface';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  private readonly TAX_RATE = 0.0825; // 8.25% tax rate

  constructor(private readonly prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    // Validate menu items exist and are available
    const menuItemIds = createOrderDto.items.map(item => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        available: true
      }
    });

    if (menuItems.length !== menuItemIds.length) {
      const foundIds = menuItems.map(item => item.id);
      const missingIds = menuItemIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Menu items not found or unavailable: ${missingIds.join(', ')}`);
    }

    // Calculate totals using helper method
    const { orderItemsData, subtotal } = this.calculateOrderItems(createOrderDto.items, menuItems);

    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order with items in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          staffId: user.id,
          customerName: createOrderDto.customerName,
          customerPhone: createOrderDto.customerPhone,
          customerEmail: createOrderDto.customerEmail,
          notes: createOrderDto.notes,
          subtotal: new Decimal(subtotal),
          tax: new Decimal(tax),
          total: new Decimal(total),
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          staff: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.PENDING,
          notes: 'Order created',
          changedBy: user.id
        }
      });

      return newOrder;
    });

    return this.formatOrder(order);
  }

  async findAll(query: OrderQueryDto): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, startDate, endDate, staffId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (staffId) {
      where.staffId = staffId;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          staff: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.order.count({ where })
    ]);

    return {
      orders: orders.map(order => this.formatOrder(order)),
      total,
      page,
      limit
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        statusHistory: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        transaction: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.formatOrder(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, user: User): Promise<Order> {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Only allow updates for PENDING orders
    if (existingOrder.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot modify order in current status');
    }

    let updateData: any = {
      customerName: updateOrderDto.customerName,
      customerPhone: updateOrderDto.customerPhone,
      customerEmail: updateOrderDto.customerEmail,
      notes: updateOrderDto.notes
    };

    let menuItems: any[] = [];

    // If items are being updated, recalculate totals
    if (updateOrderDto.items) {
      const menuItemIds = updateOrderDto.items.map(item => item.menuItemId);
      menuItems = await this.prisma.menuItem.findMany({
        where: {
          id: { in: menuItemIds },
          available: true
        }
      });

      if (menuItems.length !== menuItemIds.length) {
        const foundIds = menuItems.map(item => item.id);
        const missingIds = menuItemIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Menu items not found or unavailable: ${missingIds.join(', ')}`);
      }

      // Calculate totals using helper method
      const { subtotal } = this.calculateOrderItems(updateOrderDto.items, menuItems);

      const tax = subtotal * this.TAX_RATE;
      const total = subtotal + tax;

      updateData.subtotal = new Decimal(subtotal);
      updateData.tax = new Decimal(tax);
      updateData.total = new Decimal(total);
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // If items are being updated, delete existing items and create new ones
      if (updateOrderDto.items) {
        await tx.orderItem.deleteMany({
          where: { orderId: id }
        });

        // Calculate order items data using helper method
        const { orderItemsData } = this.calculateOrderItems(updateOrderDto.items, menuItems);

        const orderItemsDataWithOrderId = orderItemsData.map(item => ({
          ...item,
          orderId: id
        }));

        await tx.orderItem.createMany({
          data: orderItemsDataWithOrderId
        });
      }

      return await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          staff: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    });

    return this.formatOrder(updatedOrder);
  }

  async updateStatus(id: string, status: OrderStatus, user: User, notes?: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate status transition
    this.validateStatusTransition(order.status as OrderStatus, status);

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          staff: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          notes,
          changedBy: user.id
        }
      });

      return updated;
    });

    return this.formatOrder(updatedOrder);
  }

  async remove(id: string, user: User): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Only allow deletion of PENDING orders
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot delete order that is not in PENDING status');
    }

    await this.prisma.order.delete({
      where: { id }
    });
  }

  async processPayment(id: string, user: User): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        staff: {
          include: {
            wallets: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order must be in PENDING status for payment processing');
    }

    if (!order.staff.wallets || order.staff.wallets.length === 0) {
      throw new BadRequestException('Staff member has no wallet configured for payment processing');
    }

    // Here you would integrate with your Stellar payment processing
    // For now, we'll create a placeholder transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: order.staff.wallets[0].id, // Use staff's wallet
        stellarTxHash: `mock-tx-${Date.now()}`, // In real implementation, this would be from Stellar
        amount: order.total,
        assetCode: 'USD',
        status: 'confirmed'
      }
    });

    // Update order with transaction and mark as completed
    const updatedOrder = await this.updateStatus(id, OrderStatus.COMPLETED, user, 'Payment processed');

    await this.prisma.order.update({
      where: { id },
      data: { transactionId: transaction.id }
    });

    return updatedOrder;
  }

  private calculateOrderItems(
    items: Array<{ menuItemId: string; quantity: number; notes?: string }>,
    menuItems: Array<{ id: string; price: Decimal }>
  ): { orderItemsData: any[]; subtotal: number } {
    let subtotal = 0;
    const orderItemsData = items.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      const unitPrice = Number(menuItem.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: new Decimal(unitPrice),
        totalPrice: new Decimal(totalPrice),
        notes: item.notes
      };
    });

    return { orderItemsData, subtotal };
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    return `ORD-${today}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private formatOrder(order: any): Order {
    return {
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items?.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        menuItem: item.menuItem ? {
          ...item.menuItem,
          price: Number(item.menuItem.price)
        } : undefined
      }))
    };
  }
} 