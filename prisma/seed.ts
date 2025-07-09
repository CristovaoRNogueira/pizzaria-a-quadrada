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
      name: "Margherita",
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
      name: "Frango com Catupiry",
      description: "Molho de tomate, mussarela, frango desfiado e catupiry",
      image:
        "https://images.pexels.com/photos/4193513/pexels-photo-4193513.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "quadrada",
      ingredients: ["Molho de tomate", "Mussarela", "Frango desfiado", "Catupiry"],
      priceSmall: 35.0,
      priceMedium: 35.0,
      priceLarge: 55.0,
      priceFamily: 65.0,
    },
    {
      name: "Portuguesa",
      description: "Molho de tomate, mussarela, presunto, ovos, cebola e azeitonas",
      image:
        "https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "quadrada",
      ingredients: ["Molho de tomate", "Mussarela", "Presunto", "Ovos", "Cebola", "Azeitonas"],
      priceSmall: 35.0,
      priceMedium: 35.0,
      priceLarge: 55.0,
      priceFamily: 65.0,
    },
    {
      name: "Calabresa",
      description: "Molho de tomate, mussarela, calabresa e cebola",
      image:
        "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "quadrada",
      ingredients: ["Molho de tomate", "Mussarela", "Calabresa", "Cebola"],
      priceSmall: 35.0,
      priceMedium: 35.0,
      priceLarge: 55.0,
      priceFamily: 65.0,
    },
    {
      name: "Brigadeiro",
      description: "Chocolate, leite condensado e granulado",
      image:
        "https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "doce",
      ingredients: ["Chocolate", "Leite condensado", "Granulado"],
      priceSmall: 35.0,
      priceMedium: 45.0,
      priceLarge: 55.0,
      priceFamily: 65.0,
    },
    {
      name: "Nutella com Morango",
      description: "Nutella, morangos frescos e açúcar de confeiteiro",
      image:
        "https://images.pexels.com/photos/7525161/pexels-photo-7525161.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "doce",
      ingredients: ["Nutella", "Morangos frescos", "Açúcar de confeiteiro"],
      priceSmall: 35.0,
      priceMedium: 45.0,
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
    {
      name: "Guaraná Antarctica 350ml",
      description: "Refrigerante Guaraná Antarctica gelado",
      image:
        "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "bebida",
      ingredients: ["Refrigerante"],
      priceSmall: null,
      priceMedium: 5.5,
      priceLarge: 5.5,
      priceFamily: 5.5,
    },
    {
      name: "Água Mineral 500ml",
      description: "Água mineral natural gelada",
      image:
        "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "bebida",
      ingredients: ["Água mineral"],
      priceSmall: null,
      priceMedium: 3.5,
      priceLarge: 3.5,
      priceFamily: 3.5,
    },
  ];

  for (const pizzaData of pizzasData) {
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

  // Criar adicionais padrão
  const additionalsData = [
    {
      name: "Queijo Extra",
      description: "Porção extra de mussarela",
      price: 5.0,
      category: "queijo",
      isActive: true,
    },
    {
      name: "Catupiry Extra",
      description: "Porção extra de catupiry",
      price: 6.0,
      category: "queijo",
      isActive: true,
    },
    {
      name: "Ovo",
      description: "Ovo frito",
      price: 3.0,
      category: "outros",
      isActive: true,
    },
    {
      name: "Bacon",
      description: "Fatias de bacon crocante",
      price: 8.0,
      category: "carne",
      isActive: true,
    },
    {
      name: "Calabresa Extra",
      description: "Porção extra de calabresa",
      price: 7.0,
      category: "carne",
      isActive: true,
    },
    {
      name: "Cebola Extra",
      description: "Porção extra de cebola",
      price: 2.0,
      category: "vegetal",
      isActive: true,
    },
    {
      name: "Azeitona",
      description: "Azeitonas pretas",
      price: 4.0,
      category: "vegetal",
      isActive: true,
    },
    {
      name: "Tomate",
      description: "Fatias de tomate fresco",
      price: 3.0,
      category: "vegetal",
      isActive: true,
    },
  ];

  for (const additionalData of additionalsData) {
    const existingAdditional = await prisma.additional.findFirst({
      where: { name: additionalData.name },
    });

    if (existingAdditional) {
      await prisma.additional.update({
        where: { id: existingAdditional.id },
        data: additionalData,
      });
    } else {
      await prisma.additional.create({
        data: additionalData,
      });
    }
  }

  console.log("✅ Adicionais padrão criados");
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