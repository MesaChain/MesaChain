import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedMenuItems() {
  console.log('Seeding menu items...');

  const menuItems = [
    // Food items
    {
      name: 'Classic Burger',
      description: 'Beef patty with lettuce, tomato, cheese, and special sauce',
      price: 12.99,
      category: 'FOOD',
      available: true
    },
    {
      name: 'Chicken Caesar Salad',
      description: 'Grilled chicken breast over fresh romaine with caesar dressing',
      price: 11.50,
      category: 'FOOD',
      available: true
    },
    {
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomato sauce, and basil',
      price: 14.99,
      category: 'FOOD',
      available: true
    },
    {
      name: 'Fish and Chips',
      description: 'Beer-battered cod with crispy fries and tartar sauce',
      price: 15.50,
      category: 'FOOD',
      available: true
    },
    {
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
      price: 13.75,
      category: 'FOOD',
      available: true
    },

    // Drinks
    {
      name: 'Coca Cola',
      description: 'Classic cola soft drink',
      price: 2.50,
      category: 'DRINKS',
      available: true
    },
    {
      name: 'Orange Juice',
      description: 'Fresh squeezed orange juice',
      price: 3.50,
      category: 'DRINKS',
      available: true
    },
    {
      name: 'Iced Coffee',
      description: 'Cold brew coffee served over ice',
      price: 4.00,
      category: 'DRINKS',
      available: true
    },
    {
      name: 'Sparkling Water',
      description: 'Premium sparkling mineral water',
      price: 2.00,
      category: 'DRINKS',
      available: true
    },
    {
      name: 'House Wine',
      description: 'Red or white wine by the glass',
      price: 8.00,
      category: 'DRINKS',
      available: true
    }
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { name: item.name },
      update: item,
      create: item
    });
  }

  console.log('Menu items seeded successfully!');
}

if (require.main === module) {
  seedMenuItems()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}