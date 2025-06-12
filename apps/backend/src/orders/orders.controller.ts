import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../users/users.controller';
import { UserRole } from '../interfaces/user.interface';
import { User } from '../interfaces/user.interface';
import { OrderStatus } from '../interfaces/order.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiTags('orders')
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        orderNumber: { type: 'string' },
        status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] },
        total: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
  @ApiQuery({ name: 'staffId', required: false, type: String, description: 'Filter by staff ID' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in order number or customer name' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        orders: { type: 'array' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' }
      }
    }
  })
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        orderNumber: { type: 'string' },
        status: { type: 'string' },
        items: { type: 'array' },
        total: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order (only PENDING orders can be modified)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot modify order in current status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @GetUser() user: User) {
    return this.ordersService.update(id, updateOrderDto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] },
        notes: { type: 'string', nullable: true }
      },
      required: ['status']
    }
  })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; notes?: string },
    @GetUser() user: User
  ) {
    return this.ordersService.updateStatus(id, body.status, user, body.notes);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Process payment for order using Stellar integration' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Order not in correct status for payment' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  processPayment(@Param('id') id: string, @GetUser() user: User) {
    return this.ordersService.processPayment(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete order (only PENDING orders can be deleted)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete order in current status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.ordersService.remove(id, user);
  }
} 