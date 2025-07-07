import React, { useState } from 'react';
import { 
  LogOut, 
  BarChart3, 
  ShoppingBag, 
  Pizza, 
  Settings,
  Info,
  Printer,
  Check,
  MessageCircle,
  Trash2,
  Clock,
  ChefHat,
  Truck,
  CheckCircle,
  X,
  Phone,
  MapPin,
  Package
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import PizzaManager from './PizzaManager';
import BusinessHoursManager from './BusinessHoursManager';
import PaymentSettings from './PaymentSettings';
import BusinessInfoManager from './BusinessInfoManager';
import UserManager from './UserManager';
import AdditionalsManager from './AdditionalsManager';
import { Order, OrderStatus } from '../types';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'settings'>('dashboard');
  const [menuSubTab, setMenuSubTab] = useState<'pizzas' | 'additionals'>('pizzas');
  const [settingsSubTab, setSettingsSubTab] = useState<'business' | 'hours' | 'payment' | 'users'>('business');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'production': return <ChefHat className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'completed': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-50';
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'production': return 'text-orange-600 bg-orange-50';
      case 'delivery': return 'text-purple-600 bg-purple-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'new': return 'Novo';
      case 'accepted': return 'Aceito';
      case 'production': return 'Preparando';
      case 'delivery': return 'Entregando';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { id: orderId, status: newStatus }
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: `Status do pedido atualizado para ${getStatusLabel(newStatus)}`
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      // Add delete order action to context
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pedido excluído com sucesso!'
      });
    }
  };

  const handlePrintOrder = (order: Order) => {
    // Simulate printing
    const printContent = `
      PIZZARIA A QUADRADA
      Pedido #${order.id.slice(-8)}
      
      Cliente: ${order.customer.name}
      Telefone: ${order.customer.phone}
      ${order.customer.deliveryType === 'delivery' ? 
        `Endereço: ${order.customer.address}, ${order.customer.neighborhood}` : 
        'RETIRADA NO LOCAL'
      }
      
      ITENS:
      ${order.items.map(item => 
        `${item.quantity}x ${item.name} (${item.selectedSize})`
      ).join('\n')}
      
      TOTAL: R$ ${order.total.toFixed(2)}
      
      Pagamento: ${order.payment.method}
    `;
    
    console.log('Printing order:', printContent);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Pedido enviado para impressão!'
    });
  };

  const handleWhatsAppContact = (order: Order) => {
    const message = `Olá ${order.customer.name}! Sobre seu pedido #${order.id.slice(-8)}...`;
    const whatsappUrl = `https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getOrderTotal = (order: Order) => {
    return order.items.reduce((sum, item) => {
      const additionalsTotal = item.selectedAdditionals?.reduce(
        (addSum, additional) => addSum + additional.price,
        0
      ) || 0;
      return sum + (item.price + additionalsTotal) * item.quantity;
    }, 0);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
              <p className="text-2xl font-semibold text-gray-900">
                {state.orders.filter(order => {
                  const today = new Date();
                  const orderDate = new Date(order.createdAt);
                  return orderDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-2xl font-semibold text-gray-900">
                R$ {state.orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {state.orders.filter(order => 
                  ['new', 'accepted', 'production'].includes(order.status)
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Pizza className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pizzas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {state.pizzas.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
        </div>
        <div className="p-6">
          {state.orders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">#{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">{order.customer.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">R$ {order.total.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{formatTime(order.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Gerenciar Pedidos</h3>
        <div className="text-sm text-gray-600">
          {state.orders.length} pedidos total
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {state.orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className={`p-3 ${getStatusColor(order.status)} border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className="text-xs font-medium">#{order.id.slice(-8)}</span>
                </div>
                <span className="text-xs font-medium">{formatTime(order.createdAt)}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              <div>
                <p className="font-medium text-sm text-gray-900 truncate">{order.customer.name}</p>
                <p className="text-xs text-gray-600 flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {order.customer.phone}
                </p>
                {order.customer.deliveryType === 'delivery' && (
                  <p className="text-xs text-gray-600 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {order.customer.neighborhood}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                {order.items.slice(0, 2).map((item, index) => (
                  <p key={index} className="text-xs text-gray-700">
                    {item.quantity}x {item.name}
                  </p>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{order.items.length - 2} mais...
                  </p>
                )}
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm font-bold text-red-600">
                  R$ {getOrderTotal(order).toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">
                  {order.payment.method === 'dinheiro' && 'Dinheiro'}
                  {order.payment.method === 'pix' && 'PIX'}
                  {order.payment.method === 'cartao' && 'Cartão'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2 bg-gray-50 border-t">
              <div className="grid grid-cols-5 gap-1">
                <button
                  onClick={() => showOrderDetails(order)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Detalhes"
                >
                  <Info className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handlePrintOrder(order)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Imprimir"
                >
                  <Printer className="h-3 w-3" />
                </button>
                <button
                  onClick={() => {
                    const nextStatus = order.status === 'new' ? 'accepted' : 
                                     order.status === 'accepted' ? 'production' :
                                     order.status === 'production' ? 'delivery' :
                                     order.status === 'delivery' ? 'completed' : order.status;
                    if (nextStatus !== order.status) {
                      handleStatusChange(order.id, nextStatus);
                    }
                  }}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                  title="Avançar Status"
                  disabled={order.status === 'completed'}
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleWhatsAppContact(order)}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-500">
            Os pedidos aparecerão aqui quando forem realizados.
          </p>
        </div>
      )}
    </div>
  );

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Gerenciar Cardápio</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setMenuSubTab('pizzas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              menuSubTab === 'pizzas'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pizzas
          </button>
          <button
            onClick={() => setMenuSubTab('additionals')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              menuSubTab === 'additionals'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Adicionais
          </button>
        </div>
      </div>

      {menuSubTab === 'pizzas' && <PizzaManager />}
      {menuSubTab === 'additionals' && <AdditionalsManager />}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Configurações</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSettingsSubTab('business')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settingsSubTab === 'business'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Negócio
          </button>
          <button
            onClick={() => setSettingsSubTab('hours')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settingsSubTab === 'hours'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Horários
          </button>
          <button
            onClick={() => setSettingsSubTab('payment')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settingsSubTab === 'payment'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pagamento
          </button>
          <button
            onClick={() => setSettingsSubTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settingsSubTab === 'users'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Usuários
          </button>
        </div>
      </div>

      {settingsSubTab === 'business' && <BusinessInfoManager />}
      {settingsSubTab === 'hours' && <BusinessHoursManager />}
      {settingsSubTab === 'payment' && <PaymentSettings />}
      {settingsSubTab === 'users' && <UserManager />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-red-600">PIZZARIA QUADRADA</h1>
                <p className="text-sm text-gray-600">Painel Administrativo</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Administrador</p>
                <p className="text-xs text-gray-600">admin@pizzariaquadrada.com</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Pedidos</span>
                {state.orders.filter(order => ['new', 'accepted'].includes(order.status)).length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {state.orders.filter(order => ['new', 'accepted'].includes(order.status)).length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'menu'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Pizza className="h-4 w-4" />
                <span>Cardápio</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'menu' && renderMenu()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Detalhes do Pedido #{selectedOrder.id.slice(-8)}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-medium">Status: {getStatusLabel(selectedOrder.status)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Informações do Cliente</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><strong>Nome:</strong> {selectedOrder.customer.name}</p>
                  <p><strong>Telefone:</strong> {selectedOrder.customer.phone}</p>
                  <p><strong>Tipo:</strong> {selectedOrder.customer.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}</p>
                  {selectedOrder.customer.deliveryType === 'delivery' && (
                    <>
                      <p><strong>Endereço:</strong> {selectedOrder.customer.address}</p>
                      <p><strong>Bairro:</strong> {selectedOrder.customer.neighborhood}</p>
                      {selectedOrder.customer.reference && (
                        <p><strong>Referência:</strong> {selectedOrder.customer.reference}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Itens do Pedido</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <p className="text-sm text-gray-600">
                            Quantidade: {item.quantity} • Tamanho: {item.selectedSize}
                          </p>
                          {item.selectedFlavors && item.selectedFlavors.length > 1 && (
                            <p className="text-sm text-gray-600">
                              Sabores: {item.selectedFlavors.map(f => f.name).join(', ')}
                            </p>
                          )}
                          {item.selectedAdditionals && item.selectedAdditionals.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Adicionais: {item.selectedAdditionals.map(add => add.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-sm text-gray-600 italic">
                              Obs: {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Pagamento</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span>Método:</span>
                    <span className="font-medium">
                      {selectedOrder.payment.method === 'dinheiro' && 'Dinheiro'}
                      {selectedOrder.payment.method === 'pix' && 'PIX'}
                      {selectedOrder.payment.method === 'cartao' && 'Cartão de Crédito'}
                    </span>
                  </div>
                  {selectedOrder.payment.method === 'dinheiro' && selectedOrder.payment.needsChange && (
                    <div className="flex justify-between items-center mt-2">
                      <span>Troco para:</span>
                      <span className="font-medium">R$ {selectedOrder.payment.changeAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-red-600">
                      R$ {getOrderTotal(selectedOrder).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => handlePrintOrder(selectedOrder)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => handleWhatsAppContact(selectedOrder)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;