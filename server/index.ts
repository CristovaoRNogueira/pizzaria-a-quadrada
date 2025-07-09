import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Tentativa de login para:", email);

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      console.log("Admin não encontrado ou inativo");
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      console.log("Senha inválida");
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    console.log("Login bem-sucedido para:", admin.email);

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin'
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/api/pizzas", async (req, res) => {
  try {
    console.log("Buscando pizzas...");
    const pizzas = await prisma.pizza.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    console.log(`Encontradas ${pizzas.length} pizzas`);

    const formattedPizzas = pizzas.map((pizza) => ({
      id: pizza.id,
      name: pizza.name,
      description: pizza.description,
      price: pizza.priceMedium,
      image: pizza.image,
      category: pizza.category,
      ingredients: pizza.ingredients,
      sizes: {
        ...(pizza.priceSmall && { small: pizza.priceSmall }),
        medium: pizza.priceMedium,
        large: pizza.priceLarge,
        family: pizza.priceFamily,
      },
    }));

    res.json(formattedPizzas);
  } catch (error) {
    console.error("Erro ao buscar pizzas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/api/pizzas", authenticateToken, async (req, res) => {
  try {
    const { name, description, image, category, ingredients, sizes } = req.body;

    console.log("Dados recebidos para criar pizza:", {
      name,
      description,
      image,
      category,
      ingredients,
      sizes,
    });

    const pizza = await prisma.pizza.create({
      data: {
        name,
        description,
        image,
        category,
        ingredients,
        priceSmall: sizes.small || null,
        priceMedium: sizes.medium,
        priceLarge: sizes.large,
        priceFamily: sizes.family,
      },
    });

    console.log("Pizza criada no banco:", pizza);

    const formattedPizza = {
      id: pizza.id,
      name: pizza.name,
      description: pizza.description,
      price: pizza.priceMedium,
      image: pizza.image,
      category: pizza.category,
      ingredients: pizza.ingredients,
      sizes: {
        ...(pizza.priceSmall && { small: pizza.priceSmall }),
        medium: pizza.priceMedium,
        large: pizza.priceLarge,
        family: pizza.priceFamily,
      },
    };

    res.json(formattedPizza);
  } catch (error) {
    console.error("Erro ao criar pizza:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.put("/api/pizzas/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, category, ingredients, sizes } = req.body;

    console.log("Dados recebidos para atualizar pizza:", {
      id,
      name,
      description,
      image,
      category,
      ingredients,
      sizes,
    });

    const pizza = await prisma.pizza.update({
      where: { id },
      data: {
        name,
        description,
        image,
        category,
        ingredients,
        priceSmall: sizes.small || null,
        priceMedium: sizes.medium,
        priceLarge: sizes.large,
        priceFamily: sizes.family,
      },
    });

    console.log("Pizza atualizada no banco:", pizza);

    const formattedPizza = {
      id: pizza.id,
      name: pizza.name,
      description: pizza.description,
      price: pizza.priceMedium,
      image: pizza.image,
      category: pizza.category,
      ingredients: pizza.ingredients,
      sizes: {
        ...(pizza.priceSmall && { small: pizza.priceSmall }),
        medium: pizza.priceMedium,
        large: pizza.priceLarge,
        family: pizza.priceFamily,
      },
    };

    res.json(formattedPizza);
  } catch (error) {
    console.error("Erro ao atualizar pizza:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.delete("/api/pizzas/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Removendo pizza:", id);

    await prisma.pizza.update({
      where: { id },
      data: { isActive: false },
    });

    console.log("Pizza removida com sucesso");

    res.json({ message: "Pizza removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover pizza:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/api/additionals", async (req, res) => {
  try {
    console.log("Buscando adicionais...");
    const additionals = await prisma.additional.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    console.log(`Encontrados ${additionals.length} adicionais`);
    res.json(additionals);
  } catch (error) {
    console.error("Erro ao buscar adicionais:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/api/additionals", authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    console.log("Dados recebidos para criar adicional:", {
      name,
      description,
      price,
      category,
    });

    const additional = await prisma.additional.create({
      data: {
        name,
        description,
        price,
        category,
      },
    });

    console.log("Adicional criado no banco:", additional);
    res.json(additional);
  } catch (error) {
    console.error("Erro ao criar adicional:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.put("/api/additionals/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isActive } = req.body;

    console.log("Dados recebidos para atualizar adicional:", {
      id,
      name,
      description,
      price,
      category,
      isActive,
    });

    const additional = await prisma.additional.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category,
        isActive,
      },
    });

    console.log("Adicional atualizado no banco:", additional);
    res.json(additional);
  } catch (error) {
    console.error("Erro ao atualizar adicional:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.delete("/api/additionals/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Removendo adicional:", id);

    await prisma.additional.update({
      where: { id },
      data: { isActive: false },
    });

    console.log("Adicional removido com sucesso");
    res.json({ message: "Adicional removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover adicional:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    console.log("Buscando pedidos...");
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: {
          include: {
            pizza: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Encontrados ${orders.length} pedidos`);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        address: order.customer.address,
        neighborhood: order.customer.neighborhood,
        reference: order.customer.reference,
        deliveryType: order.customer.deliveryType,
        location:
          order.customer.latitude && order.customer.longitude
            ? {
                lat: order.customer.latitude,
                lng: order.customer.longitude,
              }
            : undefined,
      },
      items: order.orderItems.map((item) => ({
        id: item.pizza.id,
        name: item.pizza.name,
        description: item.pizza.description,
        image: item.pizza.image,
        category: item.pizza.category,
        ingredients: item.pizza.ingredients,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedFlavors: item.selectedFlavors.map((flavorId) => ({
          id: flavorId,
          name: "Sabor"
        })),
        selectedAdditionals: item.selectedAdditionals.map((additionalId) => ({
          id: additionalId,
          name: "Adicional"
        })),
        notes: item.notes,
        price: item.unitPrice,
      })),
      total: order.total,
      status: order.status.toLowerCase(),
      createdAt: order.createdAt,
      payment: {
        method: order.paymentMethod,
        needsChange: order.paymentNeedsChange,
        changeAmount: order.paymentChangeAmount,
        pixCode: order.paymentPixCode,
        stripePaymentIntentId: order.paymentStripeId,
      },
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total, payment } = req.body;

    console.log("📝 Dados recebidos para criar pedido:");
    console.log("Customer:", JSON.stringify(customer, null, 2));
    console.log("Items:", JSON.stringify(items, null, 2));
    console.log("Total:", total);
    console.log("Payment:", JSON.stringify(payment, null, 2));

    if (!customer || !customer.name || !customer.phone) {
      console.log("❌ Dados do cliente inválidos");
      return res
        .status(400)
        .json({ error: "Dados do cliente são obrigatórios" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("❌ Itens do pedido inválidos");
      return res
        .status(400)
        .json({ error: "Itens do pedido são obrigatórios" });
    }

    if (!total || total <= 0) {
      console.log("❌ Total do pedido inválido");
      return res
        .status(400)
        .json({ error: "Total do pedido deve ser maior que zero" });
    }

    if (!payment || !payment.method) {
      console.log("❌ Método de pagamento inválido");
      return res
        .status(400)
        .json({ error: "Método de pagamento é obrigatório" });
    }

    console.log("✅ Validação dos dados concluída");

    console.log("🔍 Buscando/criando cliente...");
    const customerData = await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: {
        name: customer.name,
        address: customer.address || "",
        neighborhood: customer.neighborhood || "",
        reference: customer.reference || "",
        deliveryType: customer.deliveryType,
        latitude: customer.location?.lat,
        longitude: customer.location?.lng,
      },
      create: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address || "",
        neighborhood: customer.neighborhood || "",
        reference: customer.reference || "",
        deliveryType: customer.deliveryType,
        latitude: customer.location?.lat,
        longitude: customer.location?.lng,
      },
    });

    console.log("✅ Cliente criado/atualizado:", customerData.id);

    console.log("📦 Preparando itens do pedido...");
    const orderItemsData = items.map((item: any) => {
      console.log("Processando item:", item.name);
      return {
        pizzaId: item.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedFlavors: item.selectedFlavors?.map((f: any) => f.id) || [item.id],
        selectedAdditionals: item.selectedAdditionals?.map((a: any) => a.id) || [],
        notes: item.notes || "",
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      };
    });

    console.log("✅ Itens preparados:", orderItemsData.length);

    console.log("🛒 Criando pedido no banco de dados...");
    const order = await prisma.order.create({
      data: {
        customerId: customerData.id,
        total,
        status: "NEW",
        paymentMethod: payment.method,
        paymentNeedsChange: payment.needsChange || false,
        paymentChangeAmount: payment.changeAmount,
        paymentPixCode: payment.pixCode,
        paymentStripeId: payment.stripePaymentIntentId,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            pizza: true,
          },
        },
      },
    });

    console.log("✅ Pedido criado com sucesso no banco:", order.id);

    res.json({
      id: order.id,
      message: "Pedido criado com sucesso",
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    console.error("Stack trace:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

app.put("/api/orders/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Atualizando status do pedido:", { id, status });

    const order = await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    console.log("Status do pedido atualizado:", order);

    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.delete("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Removendo pedido:", id);

    await prisma.order.delete({
      where: { id },
    });

    console.log("Pedido removido com sucesso");
    res.json({ message: "Pedido removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover pedido:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/api/business-settings", async (req, res) => {
  try {
    console.log("Buscando configurações de negócio...");
    const settings = await prisma.businessSettings.findUnique({
      where: { id: "default" },
      include: { businessHours: true },
    });

    if (!settings) {
      console.log("Configurações não encontradas, criando padrão...");
      const defaultSettings = await prisma.businessSettings.create({
        data: {
          id: "default",
          isOpen: true,
          closedMessage:
            "Estamos fechados no momento. Nosso horário de funcionamento é das 18:00 às 23:00.",
          pixKey: "77999742491",
          pixName: "Pizzaria a Quadrada",
          acceptCash: true,
          acceptPix: true,
          acceptCard: false,
          businessHours: {
            create: [
              {
                day: "Domingo",
                isOpen: true,
                openTime: "18:00",
                closeTime: "23:00",
              },
              {
                day: "Segunda-feira",
                isOpen: true,
                openTime: "18:00",
                closeTime: "23:00",
              },
              {
                day: "Terça-feira",
                isOpen: true,
                openTime: "18:00",
                closeTime: "23:00",
              },
              {
                day: "Quarta-feira",
                isOpen: true,
                openTime: "18:00",
                closeTime: "23:00",
              },
              {
                day: "Quinta-feira",
                isOpen: true,
                openTime: "18:00",
                closeTime: "23:00",
              },
              {
                day: "Sexta-feira",
                isOpen: true,
                openTime: "18:00",
                closeTime: "23:00",
              },
              {
                day: "Sábado",
                isOpen: true,
                openTime: "18:00",
                closeTime: "23:00",
              },
            ],
          },
        },
        include: { businessHours: true },
      });

      const formattedSettings = {
        isOpen: defaultSettings.isOpen,
        closedMessage: defaultSettings.closedMessage,
        businessHours: defaultSettings.businessHours.map((hour) => ({
          day: hour.day,
          isOpen: hour.isOpen,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        })),
        payment: {
          pixKey: defaultSettings.pixKey,
          pixName: defaultSettings.pixName,
          stripePublishableKey: defaultSettings.stripePublishableKey,
          stripeSecretKey: defaultSettings.stripeSecretKey,
          acceptCash: defaultSettings.acceptCash,
          acceptPix: defaultSettings.acceptPix,
          acceptCard: defaultSettings.acceptCard,
        },
        businessInfo: {
          name: "Pizzaria a Quadrada",
          whatsapp: "77999742491",
          instagram: "@pizzariaquadrada",
          address: "Rua das Pizzas, 123",
          city: "Vitória da Conquista",
          state: "BA",
          zipCode: "45000-000",
        },
      };

      return res.json(formattedSettings);
    }

    const formattedSettings = {
      isOpen: settings.isOpen,
      closedMessage: settings.closedMessage,
      businessHours: settings.businessHours.map((hour) => ({
        day: hour.day,
        isOpen: hour.isOpen,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      })),
      payment: {
        pixKey: settings.pixKey,
        pixName: settings.pixName,
        stripePublishableKey: settings.stripePublishableKey,
        stripeSecretKey: settings.stripeSecretKey,
        acceptCash: settings.acceptCash,
        acceptPix: settings.acceptPix,
        acceptCard: settings.acceptCard,
      },
      businessInfo: {
        name: "Pizzaria a Quadrada",
        whatsapp: "77999742491",
        instagram: "@pizzariaquadrada",
        address: "Rua das Pizzas, 123",
        city: "Vitória da Conquista",
        state: "BA",
        zipCode: "45000-000",
      },
    };

    res.json(formattedSettings);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.put("/api/business-settings", authenticateToken, async (req, res) => {
  try {
    const { isOpen, closedMessage, businessHours, payment, businessInfo } = req.body;

    console.log("Dados recebidos para atualizar configurações:", {
      isOpen,
      closedMessage,
      businessHours,
      payment,
      businessInfo,
    });

    const settings = await prisma.businessSettings.upsert({
      where: { id: "default" },
      update: {
        isOpen: isOpen !== undefined ? isOpen : undefined,
        closedMessage: closedMessage || undefined,
        pixKey: payment?.pixKey || undefined,
        pixName: payment?.pixName || undefined,
        stripePublishableKey: payment?.stripePublishableKey || undefined,
        stripeSecretKey: payment?.stripeSecretKey || undefined,
        acceptCash:
          payment?.acceptCash !== undefined ? payment.acceptCash : undefined,
        acceptPix:
          payment?.acceptPix !== undefined ? payment.acceptPix : undefined,
        acceptCard:
          payment?.acceptCard !== undefined ? payment.acceptCard : undefined,
      },
      create: {
        id: "default",
        isOpen: isOpen ?? true,
        closedMessage: closedMessage || "Estamos fechados no momento.",
        pixKey: payment?.pixKey || "77999742491",
        pixName: payment?.pixName || "Pizzaria a Quadrada",
        acceptCash: payment?.acceptCash ?? true,
        acceptPix: payment?.acceptPix ?? true,
        acceptCard: payment?.acceptCard ?? false,
      },
    });

    console.log("Configurações principais atualizadas:", settings);

    if (businessHours) {
      for (const hour of businessHours) {
        await prisma.businessHours.upsert({
          where: {
            businessSettingsId_day: {
              businessSettingsId: "default",
              day: hour.day,
            },
          },
          update: {
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
          create: {
            businessSettingsId: "default",
            day: hour.day,
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
        });
      }
      console.log("Horários de funcionamento atualizados");
    }

    res.json({ message: "Configurações atualizadas com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((error: any, req: any, res: any, next: any) => {
  console.error("Erro não tratado:", error);
  res.status(500).json({
    error: "Erro interno do servidor",
    details: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
  console.log(
    `🔗 CORS configurado para: http://localhost:5173, http://localhost:3000`
  );
});

process.on("SIGINT", async () => {
  console.log("🛑 Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});