import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Truck, 
  Package, 
  Eye, 
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import OrderDetailsModal from './OrderDetailsModal';
import WhatsAppStatus from './WhatsAppStatus';
import { whatsappService } from '../services/whatsapp';

const OrderManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { id: orderId, status: newStatus as any }
    });

    // Enviar notificação WhatsApp
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
      try {
        await whatsappService.sendStatusUpdate(order.customer.phone, newStatus, order);
      } catch (error) {
        console.error('Erro ao enviar notificação WhatsApp:', error);
      }
    }

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Status do pedido atualizado!'
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      dispatch({
        type: 'DELETE_ORDER',
        payload: orderId
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pedido excluído com sucesso!'
      });
    }
  };

  const handleConfirmPayment = (orderId: string) => {
    dispatch({
      type: 'CONFIRM_PAYMENT',
      payload: orderId
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Pagamento confirmado!'
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simular refresh dos dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pedidos atualizados!'
      });
    } catch (error) {
      console.error('Erro ao atualizar pedidos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const openWhatsApp = (phone: string, orderId: string) => {
    const message = `Olá! Sobre seu pedido #${orderId} na Pizzaria a Quadrada...`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return Clock;
      case 'accepted': return CheckCircle;
      case 'production': return ChefHat;
      case 'delivery': return Truck;
      case 'completed': return Package;
      default: return Clock;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      new: 'Novo',
      accepted: 'Aceito',
      production: 'Produção',
      delivery: 'Entrega',
      completed: 'Concluído'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      production: 'bg-orange-100 text-orange-800',
      delivery: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = state.orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm) ||
      order.id.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  const ordersByStatus = {
    new: state.orders.filter(o => o.status === 'new').length,
    accepted: state.orders.filter(o => o.status === 'accepted').length,
    production: state.orders.filter(o => o.status === 'production').length,
    delivery: state.orders.filter(o => o.status === 'delivery').length,
    completed: state.orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Status */}
      <WhatsAppStatus />

      {/* Header com Estatísticas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Gerenciar Pedidos</h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{ordersByStatus.new}</p>
            <p className="text-sm text-gray-600">Novos</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{ordersByStatus.accepted}</p>
            <p className="text-sm text-gray-600">Aceitos</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <ChefHat className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{ordersByStatus.production}</p>
            <p className="text-sm text-gray-600">Produção</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Truck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{ordersByStatus.delivery}</p>
            <p className="text-sm text-gray-600">Entrega</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{ordersByStatus.completed}</p>
            <p className="text-sm text-gray-600">Concluídos</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou ID do pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="new">Novos</option>
              <option value="accepted">Aceitos</option>
              <option value="production">Em Produção</option>
              <option value="delivery">Saiu para Entrega</option>
              <option value="completed">Concluídos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Pedidos ({filteredOrders.length})
        </h4>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhum pedido encontrado com os filtros aplicados' 
                : 'Nenhum pedido encontrado'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              
              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h5 className="font-semibold text-gray-800">Pedido #{order.id}</h5>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        R$ {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h6 className="font-medium text-gray-700 mb-1">Cliente:</h6>
                      <p className="text-sm text-gray-600">{order.customer.name}</p>
                      <p className="text-sm text-gray-600">{order.customer.phone}</p>
                      {order.customer.deliveryType === 'delivery' && (
                        <div className="flex items-start space-x-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                          <p className="text-xs text-gray-500">
                            {order.customer.address}, {order.customer.neighborhood}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-gray-700 mb-1">Itens:</h6>
                      <div className="text-sm text-gray-600">
                        {order.items.slice(0, 2).map((item, index) => (
                          <p key={index}>
                            {item.quantity}x {item.name} ({item.selectedSize})
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-gray-500">+{order.items.length - 2} itens...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="new">Novo</option>
                        <option value="accepted">Aceito</option>
                        <option value="production">Em Produção</option>
                        <option value="delivery">Saiu para Entrega</option>
                        <option value="completed">Concluído</option>
                      </select>

                      {order.payment.method === 'pix' && !order.payment.confirmed && (
                        <button
                          onClick={() => handleConfirmPayment(order.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Confirmar PIX
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openWhatsApp(order.customer.phone, order.id)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => window.location.href = `tel:${order.customer.phone}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                        title="Ligar"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                        title="Excluir pedido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderManagement;