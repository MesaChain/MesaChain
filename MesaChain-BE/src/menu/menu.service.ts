import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { MenuItem, MenuCategory } from '../interfaces/order.interface';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItem = await this.prisma.menuItem.create({
      data: {
        ...createMenuItemDto,
        price: new Decimal(createMenuItemDto.price),
        available: createMenuItemDto.available ?? true
      }
    });

    return this.formatMenuItem(menuItem);
  }

  async findAll(available?: boolean): Promise<MenuItem[]> {
    const where = available !== undefined ? { available } : {};

    const menuItems = await this.prisma.menuItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    return menuItems.map(item => this.formatMenuItem(item));
  }

  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id }
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return this.formatMenuItem(menuItem);
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    const existingItem = await this.prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    const updateData: any = { ...updateMenuItemDto };
    if (updateMenuItemDto.price !== undefined) {
      updateData.price = new Decimal(updateMenuItemDto.price);
    }

    const updatedItem = await this.prisma.menuItem.update({
      where: { id },
      data: updateData
    });

    return this.formatMenuItem(updatedItem);
  }

  async remove(id: string): Promise<void> {
    const existingItem = await this.prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    await this.prisma.menuItem.delete({
      where: { id }
    });
  }

  private formatMenuItem(item: any): MenuItem {
    return {
      ...item,
      price: Number(item.price)
    };
  }
} 