import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  
  const hashedPassword = await hash("password123", 10);
  
  // Create admin users
  const admin = await prisma.user.create({
    data: {
      email: "admin@mesachain.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@mesachain.com",
      password: hashedPassword,
      name: "Manager User",
      role: "STAFF",
    },
  });

  // Create staff users
  const staff1 = await prisma.user.create({
    data: {
      email: "staff1@mesachain.com",
      password: hashedPassword,
      name: "Staff User 1",
      role: "STAFF",
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: "staff2@mesachain.com",
      password: hashedPassword,
      name: "Staff User 2",
      role: "STAFF",
    },
  });

  // Create customer users
  const customer1 = await prisma.user.create({
    data: {
      email: "customer1@mesachain.com",
      password: hashedPassword,
      name: "Customer User 1",
      role: "USER",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "customer2@mesachain.com",
      password: hashedPassword,
      name: "Customer User 2",
      role: "USER",
    },
  });

  console.log("Creating menu items...");
  
  // Create menu items
  const menuItems = await prisma.menuItem.createMany({
    data: [
      {
        name: "Hamburguesa Clásica",
        description: "Hamburguesa con carne, lechuga, tomate y queso",
        price: 12.99,
        category: "FOOD",
        available: true,
      },
      {
        name: "Pizza Margherita",
        description: "Pizza con tomate, mozzarella y albahaca",
        price: 15.99,
        category: "FOOD",
        available: true,
      },
      {
        name: "Ensalada César",
        description: "Ensalada con lechuga, crutones y aderezo César",
        price: 8.99,
        category: "FOOD",
        available: true,
      },
      {
        name: "Pasta Carbonara",
        description: "Pasta con huevo, queso parmesano y panceta",
        price: 14.99,
        category: "FOOD",
        available: true,
      },
      {
        name: "Tiramisú",
        description: "Postre italiano con café y mascarpone",
        price: 6.99,
        category: "FOOD",
        available: true,
      },
      {
        name: "Cerveza Artesanal",
        description: "Cerveza local de la casa",
        price: 4.99,
        category: "DRINKS",
        available: true,
      },
      {
        name: "Café Americano",
        description: "Café negro tradicional",
        price: 2.99,
        category: "DRINKS",
        available: true,
      },
      {
        name: "Sopa del Día",
        description: "Sopa casera preparada diariamente",
        price: 5.99,
        category: "FOOD",
        available: true,
      },
    ],
  });

  console.log("Creating orders...");
  
  // Get menu items for orders
  const items = await prisma.menuItem.findMany();
  
  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      userId: staff1.id,
      total: 21.97,
      status: "PENDING",
      items: {
        create: [
          {
            menuItemId: items[0].id, // Hamburguesa
            quantity: 1,
            price: items[0].price,
          },
          {
            menuItemId: items[4].id, // Tiramisú
            quantity: 1,
            price: items[4].price,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: staff2.id,
      total: 23.07,
      status: "COMPLETED",
      items: {
        create: [
          {
            menuItemId: items[1].id, // Pizza
            quantity: 1,
            price: items[1].price,
          },
          {
            menuItemId: items[6].id, // Café
            quantity: 2,
            price: items[6].price,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      userId: staff1.id,
      total: 16.49,
      status: "PENDING",
      items: {
        create: [
          {
            menuItemId: items[3].id, // Pasta
            quantity: 1,
            price: items[3].price,
          },
        ],
      },
    },
  });

  console.log("Creating reservations...");
  
  // Create tables first
  const table1 = await prisma.table.create({
    data: {
      name: "Mesa 1",
      capacity: 4,
      location: "Patio",
    },
  });

  const table2 = await prisma.table.create({
    data: {
      name: "Mesa 2",
      capacity: 2,
      location: "Interior",
    },
  });

  const table3 = await prisma.table.create({
    data: {
      name: "Mesa 3",
      capacity: 6,
      location: "Terraza",
    },
  });

  // Create sample reservations
  await prisma.reservation.createMany({
    data: [
      {
        userId: customer1.id,
        tableId: table1.id,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        partySize: 4,
        status: "CONFIRMED",
      },
      {
        userId: customer2.id,
        tableId: table2.id,
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        partySize: 2,
        status: "PENDING",
      },
      {
        userId: customer1.id,
        tableId: table3.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000), // Tomorrow + 2 hours
        partySize: 6,
        status: "CONFIRMED",
      },
    ],
  });

  console.log("Creating sessions...");
  
  // Create sessions for users
  await prisma.session.createMany({
    data: [
      {
        token: "admin-session-1",
        userId: admin.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      {
        token: "manager-session-1",
        userId: manager.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        token: "staff-session-1",
        userId: staff1.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        token: "customer-session-1",
        userId: customer1.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Seeding completed successfully!");
  console.log(`📊 Created:`);
  console.log(`   - ${6} users (admin, manager, staff, customers)`);
  console.log(`   - ${8} menu items`);
  console.log(`   - ${3} orders`);
  console.log(`   - ${3} tables`);
  console.log(`   - ${3} reservations`);
  console.log(`   - ${4} sessions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
