import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar admin padrão
  const hashedPassword = await bcrypt.hash("pizzaria2024", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@pizzariaquadrada.com" },
    update: {},
    create: {
      email: "admin@pizzariaquadrada.com",
      password: hashedPassword,
      name: "Administrador",
      isActive: true,
    },
  });

  console.log("✅ Admin criado:", admin.email);

  // Criar configurações de negócio padrão
  await prisma.businessSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      isOpen: true,
      closedMessage:
        "Estamos fechados no momento. Nosso horário de funcionamento é das 18:00 às 23:00.",
      pixKey: "77999742491",
      pixName: "Pizzaria a Quadrada",
      acceptCash: true,
      acceptPix: true,
      acceptCard: false,
    },
  });

  console.log("✅ Configurações de negócio criadas");

  // Criar horários de funcionamento padrão
  const daysOfWeek = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  for (const day of daysOfWeek) {
    await prisma.businessHours.upsert({
      where: {
        businessSettingsId_day: {
          businessSettingsId: "default",
          day: day,
        },
      },
      update: {},
      create: {
        businessSettingsId: "default",
        day: day,
        isOpen: true,
        openTime: "18:00",
        closeTime: "23:00",
      },
    });
  }

  console.log("✅ Horários de funcionamento criados");

  // Criar pizzas padrão
  const pizzasData = [
    {
      name: "Margheritaaaa",
      description: "Molho de tomate, mussarela, manjericão fresco e azeite",
      image:
        "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "quadrada",
      ingredients: ["Molho de tomate", "Mussarela", "Manjericão", "Azeite"],
      priceSmall: 35.0,
      priceMedium: 35.0,
      priceLarge: 55.0,
      priceFamily: 65.0,
    },
    {
      name: "Pepperoni",
      description: "Molho de tomate, mussarela e fatias de pepperoni",
      image:
        "https://images.pexels.com/photos/845798/pexels-photo-845798.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "quadrada",
      ingredients: ["Molho de tomate", "Mussarela", "Pepperoni"],
      priceSmall: 35.0,
      priceMedium: 35.0,
      priceLarge: 55.0,
      priceFamily: 65.0,
    },
    {
      name: "Coca-Cola 350ml",
      description: "Refrigerante Coca-Cola gelado",
      image:
        "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "bebida",
      ingredients: ["Refrigerante"],
      priceSmall: null,
      priceMedium: 5.5,
      priceLarge: 5.5,
      priceFamily: 5.5,
    },
  ];

  for (const pizzaData of pizzasData) {
    // Try to upsert by name using updateMany or create if not exists
    const existingPizza = await prisma.pizza.findFirst({
      where: { name: pizzaData.name },
    });

    if (existingPizza) {
      await prisma.pizza.update({
        where: { id: existingPizza.id },
        data: pizzaData,
      });
    } else {
      await prisma.pizza.create({
        data: pizzaData,
      });
    }
  }

  console.log("✅ Pizzas padrão criadas");
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
