import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuCategory } from '../../interfaces/order.interface';

export class CreateMenuItemDto {
  @ApiProperty({ description: 'Menu item name', example: 'Classic Burger' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Menu item description', example: 'Beef patty with lettuce, tomato, and cheese' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Price in dollars', example: 12.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Menu category', enum: MenuCategory, example: MenuCategory.FOOD })
  @IsEnum(MenuCategory)
  category: MenuCategory;

  @ApiPropertyOptional({ description: 'Image URL', example: 'https://example.com/burger.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Whether the item is available', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
} 