import React, { useState, useEffect } from 'react';
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
  Package,
  ArrowRight,
  DollarSign,
  CreditCard
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
  userRole?: string | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, userRole }) => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'settings'>('dashboard');
  const [menuSubTab, setMenuSubTab] = useState<'pizzas' | 'additionals'>('pizzas');
  const [settingsSubTab, setSettingsSubTab] = useState<'business' | 'hours' | 'payment' | 'users'>('business');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatusTab, setOrderStatusTab] = useState<'new' | 'accepted' | 'production' | 'delivery' | 'completed' | 'all'>('all');

  // Estado para controlar pagamentos confirmados
  const [confirmedPayments, setConfirmedPayments] = useState<Set<string>>(new Set());

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
      case 'new': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'production': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'delivery': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'completed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'new': return 'Novo';
      case 'accepted': return 'Aceito';
      case 'production': return 'Produção';
      case 'delivery': return 'Entrega';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'new': return 'accepted';
      case 'accepted': return 'production';
      case 'production': return 'delivery';
      case 'delivery': return 'completed';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: OrderStatus): string => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return '';
    
    switch (nextStatus) {
      case 'accepted': return 'Aceitar Pedido';
      case 'production': return 'Iniciar Produção';
      case 'delivery': return 'Enviar para Entrega';
      case 'completed': return 'Marcar como Concluído';
      default: return '';
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    apiService.updateOrderStatus(orderId, newStatus.toUpperCase())
      .then(() => {
        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: { id: orderId, status: newStatus }
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: `Status do pedido atualizado para ${getStatusLabel(newStatus)}`
        });
      })
      .catch(error => {
        console.error('Erro ao atualizar status:', error);
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: 'Erro ao atualizar status do pedido'
        });
      });
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      // Atualizar no backend
      apiService.updateOrderStatus(orderId, nextStatus.toUpperCase())
        .then(() => {
          dispatch({
            type: 'UPDATE_ORDER_STATUS',
            payload: { id: orderId, status: nextStatus }
          });
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: `Status do pedido atualizado para ${getStatusLabel(nextStatus)}`
          });
        })
        .catch(error => {
          console.error('Erro ao atualizar status:', error);
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: 'Erro ao atualizar status do pedido'
          });
        });
    }
  };

  const handleConfirmPayment = (orderId: string) => {
    setConfirmedPayments(prev => new Set(prev).add(orderId));
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Pagamento confirmado!'
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      apiService.deleteOrder(orderId)
        .then(() => {
          dispatch({
            type: 'REMOVE_ORDER',
            payload: orderId
          });
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: 'Pedido excluído com sucesso!'
          });
        })
        .catch(error => {
          console.error('Erro ao excluir pedido:', error);
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: 'Erro ao excluir pedido'
          });
        });
    }
  };

  const handlePrintOrder = (order: Order) => {
    // Criar conteúdo HTML para impressão
    const printContent = generatePrintHTML(order);
    
    // Criar nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Aguardar carregamento e imprimir
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Fechar janela após impressão (opcional)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Pedido enviado para impressão!'
    });
  };

  // Função para gerar HTML de impressão
  const generatePrintHTML = (order: Order) => {
    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case 'dinheiro': return 'Dinheiro';
        case 'pix': return 'PIX';
        case 'cartao': return 'Cartão de Crédito';
        default: return method;
      }
    };

    const getSizeLabel = (size: string) => {
      const labels = {
        small: 'Pequena',
        medium: 'Média',
        large: 'Grande',
        family: 'Família'
      };
      return labels[size as keyof typeof labels] || size;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${order.id.slice(-8)} - Pizzaria a Quadrada</title>
        <style>
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          
          .header p {
            margin: 0;
            font-size: 10px;
          }
          
          .order-info {
            margin-bottom: 15px;
          }
          
          .order-info h2 {
            font-size: 14px;
            margin: 0 0 8px 0;
            text-decoration: underline;
          }
          
          .customer-info, .payment-info {
            margin-bottom: 15px;
          }
          
          .customer-info h3, .payment-info h3 {
            font-size: 12px;
            margin: 0 0 5px 0;
            font-weight: bold;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .items-table th,
          .items-table td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
            font-size: 11px;
          }
          
          .items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          
          .total-section {
            border-top: 2px solid #000;
            padding-top: 10px;
            text-align: right;
          }
          
          .total-section .total {
            font-size: 14px;
            font-weight: bold;
          }
          
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border: 1px solid #000;
            font-size: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PIZZARIA A QUADRADA</h1>
          <p>A qualidade é nossa diferença!</p>
          <p>Telefone: (77) 99974-2491</p>
        </div>
        
        <div class="order-info">
          <h2>PEDIDO #${order.id.slice(-8)}</h2>
          <p><strong>Data/Hora:</strong> ${formatTime(order.createdAt)}</p>
          <p><strong>Status:</strong> <span class="status-badge">${getStatusLabel(order.status).toUpperCase()}</span></p>
        </div>
        
        <div class="customer-info">
          <h3>DADOS DO CLIENTE:</h3>
          <p><strong>Nome:</strong> ${order.customer.name}</p>
          <p><strong>Telefone:</strong> ${order.customer.phone}</p>
          <p><strong>Tipo:</strong> ${order.customer.deliveryType === 'delivery' ? 'ENTREGA' : 'RETIRADA'}</p>
          ${order.customer.deliveryType === 'delivery' ? `
            <p><strong>Endereço:</strong> ${order.customer.address}</p>
            <p><strong>Bairro:</strong> ${order.customer.neighborhood}</p>
            ${order.customer.reference ? `<p><strong>Referência:</strong> ${order.customer.reference}</p>` : ''}
          ` : `
            <p><strong>Endereço para Retirada:</strong></p>
            <p>Rua das Pizzas, 123 - Centro</p>
            <p>Vitória da Conquista - BA</p>
          `}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>QTD</th>
              <th>ITEM</th>
              <th>TAMANHO</th>
              <th>VALOR UNIT.</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.quantity}</td>
                <td>
                  ${item.name}
                  ${item.selectedFlavors && item.selectedFlavors.length > 1 ? `
                    <br><small>Sabores: ${item.selectedFlavors.map(f => f.name).join(', ')}</small>
                  ` : ''}
                  ${item.selectedAdditionals && item.selectedAdditionals.length > 0 ? `
                    <br><small>Adicionais: ${item.selectedAdditionals.map(add => add.name).join(', ')}</small>
                  ` : ''}
                  ${item.notes ? `<br><small>Obs: ${item.notes}</small>` : ''}
                </td>
                <td>${getSizeLabel(item.selectedSize)}</td>
                <td>R$ ${item.price.toFixed(2)}</td>
                <td>R$ ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="payment-info">
          <h3>PAGAMENTO:</h3>
          <p><strong>Método:</strong> ${getPaymentMethodLabel(order.payment.method)}</p>
          ${order.payment.method === 'dinheiro' && order.payment.needsChange ? `
            <p><strong>Troco para:</strong> R$ ${order.payment.changeAmount?.toFixed(2)}</p>
            <p><strong>Troco:</strong> R$ ${(order.payment.changeAmount! - order.total).toFixed(2)}</p>
          ` : ''}
          ${order.payment.method === 'pix' ? `
            <p><strong>Status PIX:</strong> ${order.payment.pixPaid ? 'PAGO' : 'PENDENTE'}</p>
          ` : ''}
        </div>
        
        <div class="total-section">
          <p class="total">TOTAL: R$ ${order.total.toFixed(2)}</p>
        </div>
        
        <div class="footer">
          <p>Obrigado pela preferência!</p>
          <p>Pizzaria a Quadrada - A qualidade é nossa diferença!</p>
          <p>Impresso em: ${formatTime(new Date())}</p>
        </div>
      </body>
      </html>
    `;
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

  // Filtrar pedidos por status
  const getFilteredOrders = () => {
    if (orderStatusTab === 'all') {
      return state.orders;
    }
    return state.orders.filter(order => order.status === orderStatusTab);
  };

  // Contar pedidos por status
  const getOrderCountByStatus = (status: OrderStatus | 'all') => {
    if (status === 'all') return state.orders.length;
    return state.orders.filter(order => order.status === status).length;
  };

  // Verificar permissões do usuário
  const hasPermission = React.useCallback(
    (section: string, action?: string) => {
      if (!state.currentUser || !state.currentUser.permissions) {
        return userRole === 'admin'; // Fallback para admin
      }
      
      const permissions = state.currentUser.permissions;
      
      switch (section) {
        case 'dashboard':
          return permissions.dashboard;
        case 'orders':
          if (!action) return permissions.orders.view;
          return permissions.orders[action as keyof typeof permissions.orders];
        case 'menu':
          if (!action) return permissions.menu.view;
          return permissions.menu[action as keyof typeof permissions.menu];
        case 'settings':
          if (!action) return permissions.settings.view;
          return permissions.settings[action as keyof typeof permissions.settings];
        case 'delivery':
          if (!action) return permissions.delivery.view;
          return permissions.delivery[action as keyof typeof permissions.delivery];
        default:
          return false;
      }
    },
    [state.currentUser, userRole]
  );

  // Definir aba inicial baseada nas permissões
  useEffect(() => {
    if (!hasPermission('dashboard') && hasPermission('orders')) {
      setActiveTab('orders');
    }
  }, [state.currentUser, hasPermission]);

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
                <div className={`p-2 rounded-full border ${getStatusColor(order.status)}`}>
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

      {/* Abas de Status */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex overflow-x-auto">
          {[
            { key: 'all', label: 'Todos', icon: ShoppingBag },
            { key: 'new', label: 'Novo', icon: Clock },
            { key: 'accepted', label: 'Aceito', icon: CheckCircle },
            { key: 'production', label: 'Produção', icon: ChefHat },
            { key: 'delivery', label: 'Entrega', icon: Truck },
            { key: 'completed', label: 'Concluído', icon: Package }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setOrderStatusTab(key as 'all' | 'new' | 'accepted' | 'production' | 'delivery' | 'completed')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                orderStatusTab === key
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                orderStatusTab === key
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getOrderCountByStatus(key as 'all' | 'new' | 'accepted' | 'production' | 'delivery' | 'completed')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getFilteredOrders().map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className={`p-3 border-b ${getStatusColor(order.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className="text-xs font-medium">#{order.id.slice(-8)}</span>
                  {confirmedPayments.has(order.id) && (
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-xs font-medium">Pago</span>
                    </div>
                  )}
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
                <p className="text-xs text-gray-600 flex items-center">
                  <CreditCard className="h-3 w-3 mr-1" />
                  {order.payment.method === 'dinheiro' && 'Dinheiro'}
                  {order.payment.method === 'pix' && 'PIX'}
                  {order.payment.method === 'cartao' && 'Cartão'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2 bg-gray-50 border-t">
              <div className="grid grid-cols-2 gap-1 mb-2">
                <button
                  onClick={() => showOrderDetails(order)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors text-xs flex items-center justify-center"
                  title="Detalhes"
                >
                  <Info className="h-3 w-3 mr-1" />
                  Detalhes
                </button>
                <button
                  onClick={() => handlePrintOrder(order)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors text-xs flex items-center justify-center"
                  title="Imprimir"
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Imprimir
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1 mb-2">
                <button
                  onClick={() => handleWhatsAppContact(order)}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors text-xs flex items-center justify-center"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors text-xs flex items-center justify-center"
                  title="Excluir"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Excluir
                </button>
              </div>

              {/* Botão de Confirmar Pagamento */}
              {order.payment.method === 'dinheiro' && !confirmedPayments.has(order.id) && hasPermission('delivery', 'confirmPayment') && (
                <button
                  onClick={() => handleConfirmPayment(order.id)}
                  className="w-full p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-xs flex items-center justify-center mb-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Confirmar Pagamento
                </button>
              )}

              {/* Botão de Avançar Status */}
              {getNextStatus(order.status) && hasPermission('orders', 'updateStatus') && (
                <button
                  onClick={() => handleAdvanceStatus(order.id, order.status)}
                  className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-xs flex items-center justify-center"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  {getNextStatusLabel(order.status)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {getFilteredOrders().length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-500">
            {orderStatusTab === 'all' 
              ? 'Os pedidos aparecerão aqui quando forem realizados.'
              : `Nenhum pedido com status "${getStatusLabel(orderStatusTab as OrderStatus)}" encontrado.`
            }
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
            {hasPermission('dashboard') && (
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
            )}

            {hasPermission('orders') && (
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
            )}

            {hasPermission('menu') && (
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
            )}

            {hasPermission('settings') && (
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
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && hasPermission('dashboard') && renderDashboard()}
        {activeTab === 'orders' && hasPermission('orders') && renderOrders()}
        {activeTab === 'menu' && hasPermission('menu') && renderMenu()}
        {activeTab === 'settings' && hasPermission('settings') && renderSettings()}
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
              <div className={`p-4 rounded-lg border ${getStatusColor(selectedOrder.status)}`}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-medium">Status: {getStatusLabel(selectedOrder.status)}</span>
                  {confirmedPayments.has(selectedOrder.id) && (
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full ml-auto">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Pagamento Confirmado</span>
                    </div>
                  )}
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