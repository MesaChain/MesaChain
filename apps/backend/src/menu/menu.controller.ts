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
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user.interface';

@Controller('menu')
@ApiTags('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiBody({ type: CreateMenuItemDto })
  @ApiResponse({
    status: 201,
    description: 'Menu item created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        imageUrl: { type: 'string' },
        available: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid menu item data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.create(createMenuItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiQuery({ name: 'available', required: false, type: Boolean, description: 'Filter by availability' })
  @ApiResponse({
    status: 200,
    description: 'Menu items retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          imageUrl: { type: 'string' },
          available: { type: 'boolean' }
        }
      }
    }
  })
  findAll(@Query('available') available?: boolean) {
    return this.menuService.findAll(available);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Menu item ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        imageUrl: { type: 'string' },
        available: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item' })
  @ApiParam({ name: 'id', type: 'string', description: 'Menu item ID' })
  @ApiBody({ type: UpdateMenuItemDto })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid menu item data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  update(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    return this.menuService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiParam({ name: 'id', type: 'string', description: 'Menu item ID' })
  @ApiResponse({ status: 204, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
} 