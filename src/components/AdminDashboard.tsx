import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  Package,
  Calendar,
  Pizza as PizzaIcon,
  Coffee,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";

const AdminDashboard: React.FC = () => {
  const { state } = useApp();

  // Calcular estatísticas
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Pedidos de hoje
  const todayOrders = state.orders.filter(
    (order) => new Date(order.createdAt) >= startOfDay
  );

  // Pedidos do mês
  const monthOrders = state.orders.filter(
    (order) => new Date(order.createdAt) >= startOfMonth
  );

  // Receita de hoje
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

  // Receita do mês
  const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

  // Pedidos por status
  const ordersByStatus = {
    new: state.orders.filter((order) => order.status === "new").length,
    accepted: state.orders.filter((order) => order.status === "accepted")
      .length,
    production: state.orders.filter((order) => order.status === "production")
      .length,
    delivery: state.orders.filter((order) => order.status === "delivery")
      .length,
    completed: state.orders.filter((order) => order.status === "completed")
      .length,
  };

  // Clientes únicos
  const uniqueCustomers = new Set(
    state.orders.map((order) => order.customer.phone)
  ).size;

  // Pizzas mais vendidas
  const pizzaSales = state.orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      if (item.category !== "bebida") {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const topPizzas = Object.entries(pizzaSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Bebidas mais vendidas
  const beverageSales = state.orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      if (item.category === "bebida") {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const topBeverages = Object.entries(beverageSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Métodos de pagamento
  const paymentMethods = state.orders.reduce((acc, order) => {
    acc[order.payment.method] = (acc[order.payment.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tipos de entrega
  const deliveryTypes = state.orders.reduce((acc, order) => {
    acc[order.customer.deliveryType] =
      (acc[order.customer.deliveryType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Horários de pico (por hora)
  const hourlyOrders = state.orders.reduce((acc, order) => {
    const hour = new Date(order.createdAt).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const peakHours = Object.entries(hourlyOrders)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      cartao: "Cartão",
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getDeliveryTypeLabel = (type: string) => {
    const labels = {
      delivery: "Entrega",
      pickup: "Retirada",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
              <p className="text-3xl font-bold text-gray-900">
                {todayOrders.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Total: {state.orders.length} pedidos
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Hoje</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(todayRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Mês: {formatCurrency(monthRevenue)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Clientes Únicos
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {uniqueCustomers}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Total de clientes cadastrados
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(
                  state.orders.length > 0
                    ? monthRevenue / monthOrders.length
                    : 0
                )}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Baseado no mês atual</span>
          </div>
        </div>
      </div>

      {/* Status dos Pedidos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Status dos Pedidos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">
              {ordersByStatus.new}
            </p>
            <p className="text-sm text-gray-600">Novos</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {ordersByStatus.accepted}
            </p>
            <p className="text-sm text-gray-600">Aceitos</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <ChefHat className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">
              {ordersByStatus.production}
            </p>
            <p className="text-sm text-gray-600">Produção</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Truck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {ordersByStatus.delivery}
            </p>
            <p className="text-sm text-gray-600">Entrega</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {ordersByStatus.completed}
            </p>
            <p className="text-sm text-gray-600">Concluídos</p>
          </div>
        </div>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizzas Mais Vendidas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PizzaIcon className="h-6 w-6 text-red-600" />
            <h3 className="text-xl font-bold text-gray-800">
              Pizzas Mais Vendidas
            </h3>
          </div>
          <div className="space-y-3">
            {topPizzas.length > 0 ? (
              topPizzas.map(([pizza, quantity], index) => (
                <div key={pizza} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-800">{pizza}</span>
                  </div>
                  <span className="text-gray-600">{quantity} vendidas</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhuma pizza vendida ainda
              </p>
            )}
          </div>
        </div>

        {/* Bebidas Mais Vendidas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Coffee className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">
              Bebidas Mais Vendidas
            </h3>
          </div>
          <div className="space-y-3">
            {topBeverages.length > 0 ? (
              topBeverages.map(([beverage, quantity], index) => (
                <div
                  key={beverage}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-800">
                      {beverage}
                    </span>
                  </div>
                  <span className="text-gray-600">{quantity} vendidas</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhuma bebida vendida ainda
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Análises Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métodos de Pagamento */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Métodos de Pagamento
          </h3>
          <div className="space-y-3">
            {Object.entries(paymentMethods).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="font-medium text-gray-800">
                  {getPaymentMethodLabel(method)}
                </span>
                <span className="text-gray-600">{count} pedidos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Entrega */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Tipos de Entrega
          </h3>
          <div className="space-y-3">
            {Object.entries(deliveryTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="font-medium text-gray-800">
                  {getDeliveryTypeLabel(type)}
                </span>
                <span className="text-gray-600">{count} pedidos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Horários de Pico */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Horários de Pico
          </h3>
          <div className="space-y-3">
            {peakHours.length > 0 ? (
              peakHours.map(({ hour, count }) => (
                <div key={hour} className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    {hour}:00 - {hour + 1}:00
                  </span>
                  <span className="text-gray-600">{count} pedidos</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Dados insuficientes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resumo Mensal */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">Resumo Mensal</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {monthOrders.length}
            </p>
            <p className="text-sm text-gray-600">Pedidos este mês</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(monthRevenue)}
            </p>
            <p className="text-sm text-gray-600">Receita este mês</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(
                monthOrders.length > 0 ? monthRevenue / monthOrders.length : 0
              )}
            </p>
            <p className="text-sm text-gray-600">Ticket médio mensal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;