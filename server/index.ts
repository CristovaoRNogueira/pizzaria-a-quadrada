import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de pizzas
app.get('/api/pizzas', async (req, res) => {
  try {
    const pizzas = await prisma.pizza.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    // Converter para o formato esperado pelo frontend
    const formattedPizzas = pizzas.map(pizza => ({
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
    console.error('Erro ao buscar pizzas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/pizzas', authenticateToken, async (req, res) => {
  try {
    const { name, description, image, category, ingredients, sizes } = req.body;

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

    res.json(pizza);
  } catch (error) {
    console.error('Erro ao criar pizza:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/pizzas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, category, ingredients, sizes } = req.body;

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

    res.json(pizza);
  } catch (error) {
    console.error('Erro ao atualizar pizza:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/pizzas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.pizza.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Pizza removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover pizza:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de pedidos
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: {
          include: {
            pizza: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Converter para o formato esperado pelo frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        address: order.customer.address,
        neighborhood: order.customer.neighborhood,
        reference: order.customer.reference,
        deliveryType: order.customer.deliveryType,
        location: order.customer.latitude && order.customer.longitude ? {
          lat: order.customer.latitude,
          lng: order.customer.longitude,
        } : undefined,
      },
      items: order.orderItems.map(item => ({
        id: item.pizza.id,
        name: item.pizza.name,
        description: item.pizza.description,
        image: item.pizza.image,
        category: item.pizza.category,
        ingredients: item.pizza.ingredients,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedFlavors: item.selectedFlavors.map(flavorId => {
          // Aqui você pode buscar os detalhes dos sabores se necessário
          return { id: flavorId, name: 'Sabor' };
        }),
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
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, total, payment } = req.body;

    // Criar ou encontrar cliente
    const customerData = await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: {
        name: customer.name,
        address: customer.address,
        neighborhood: customer.neighborhood,
        reference: customer.reference,
        deliveryType: customer.deliveryType,
        latitude: customer.location?.lat,
        longitude: customer.location?.lng,
      },
      create: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        neighborhood: customer.neighborhood || '',
        reference: customer.reference,
        deliveryType: customer.deliveryType,
        latitude: customer.location?.lat,
        longitude: customer.location?.lng,
      },
    });

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        customerId: customerData.id,
        total,
        status: 'NEW',
        paymentMethod: payment.method,
        paymentNeedsChange: payment.needsChange || false,
        paymentChangeAmount: payment.changeAmount,
        paymentPixCode: payment.pixCode,
        paymentStripeId: payment.stripePaymentIntentId,
        orderItems: {
          create: items.map((item: any) => ({
            pizzaId: item.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedFlavors: item.selectedFlavors?.map((f: any) => f.id) || [item.id],
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
          })),
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

    res.json({ id: order.id, message: 'Pedido criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    res.json(order);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de configurações de negócio
app.get('/api/business-settings', async (req, res) => {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: 'default' },
      include: { businessHours: true },
    });

    if (!settings) {
      return res.status(404).json({ error: 'Configurações não encontradas' });
    }

    const formattedSettings = {
      isOpen: settings.isOpen,
      closedMessage: settings.closedMessage,
      businessHours: settings.businessHours.map(hour => ({
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
    };

    res.json(formattedSettings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/business-settings', authenticateToken, async (req, res) => {
  try {
    const { isOpen, closedMessage, businessHours, payment } = req.body;

    // Atualizar configurações principais
    const settings = await prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: {
        isOpen: isOpen !== undefined ? isOpen : undefined,
        closedMessage: closedMessage || undefined,
        pixKey: payment?.pixKey || undefined,
        pixName: payment?.pixName || undefined,
        stripePublishableKey: payment?.stripePublishableKey || undefined,
        stripeSecretKey: payment?.stripeSecretKey || undefined,
        acceptCash: payment?.acceptCash !== undefined ? payment.acceptCash : undefined,
        acceptPix: payment?.acceptPix !== undefined ? payment.acceptPix : undefined,
        acceptCard: payment?.acceptCard !== undefined ? payment.acceptCard : undefined,
      },
      create: {
        id: 'default',
        isOpen: isOpen ?? true,
        closedMessage: closedMessage || 'Estamos fechados no momento.',
        pixKey: payment?.pixKey || '77999742491',
        pixName: payment?.pixName || 'Pizzaria a Quadrada',
        acceptCash: payment?.acceptCash ?? true,
        acceptPix: payment?.acceptPix ?? true,
        acceptCard: payment?.acceptCard ?? false,
      },
    });

    // Atualizar horários de funcionamento se fornecidos
    if (businessHours) {
      for (const hour of businessHours) {
        await prisma.businessHours.upsert({
          where: {
            businessSettingsId_day: {
              businessSettingsId: 'default',
              day: hour.day,
            },
          },
          update: {
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
          create: {
            businessSettingsId: 'default',
            day: hour.day,
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
        });
      }
    }

    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});