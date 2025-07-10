import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  CreditCard,
  Banknote,
  QrCode,
  Package,
  Navigation
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Order } from '../types';

const DeliveryPanel: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filtrar apenas pedidos para entrega
  const deliveryOrders = state.orders.filter(order => 
    order.customer.deliveryType === 'delivery' && 
    ['accepted', 'production', 'delivery'].includes(order.status)
  );

  const handleConfirmPayment = (orderId: string) => {
    if (confirm('Confirmar que o pagamento foi recebido?')) {
      // Aqui você pode adicionar lógica específica para confirmar pagamento
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pagamento confirmado!'
      });
    }
  };

  const handleConfirmDelivery = (orderId: string) => {
    if (confirm('Confirmar que o pedido foi entregue?')) {
      dispatch({
        type: 'UPDATE_ORDER_STATUS',
        payload: { id: orderId, status: 'completed' }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Entrega confirmada com sucesso!'
      });
    }
  };

  const openMaps = (address: string, neighborhood: string) => {
    const fullAddress = `${address}, ${neighborhood}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'production': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'delivery': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Aceito';
      case 'production': return 'Preparando';
      case 'delivery': return 'Saiu para Entrega';
      default: return status;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'dinheiro': return <Banknote className="h-4 w-4" />;
      case 'pix': return <QrCode className="h-4 w-4" />;
      case 'cartao': return <CreditCard className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro';
      case 'pix': return 'PIX';
      case 'cartao': return 'Cartão';
      default: return method;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Truck className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-xl font-bold text-red-600">PAINEL DE ENTREGA</h1>
                <p className="text-sm text-gray-600">Pizzaria a Quadrada</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Entregador</p>
              <p className="text-xs text-gray-600">{deliveryOrders.length} entregas pendentes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {deliveryOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhuma entrega pendente
            </h2>
            <p className="text-gray-600">
              Todas as entregas foram concluídas!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {deliveryOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className={`p-4 border-b ${getStatusColor(order.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">#{order.id.toString().slice(-8)}</span>
                    </div>
                    <span className="text-xs font-medium">{formatTime(order.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium mt-1">{getStatusLabel(order.status)}</p>
                </div>

                {/* Customer Info */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800 mb-2">{order.customer.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{order.customer.phone}</span>
                      <button
                        onClick={() => callCustomer(order.customer.phone)}
                        className="ml-auto bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Ligar
                      </button>
                    </div>
                    
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <div className="flex-1">
                        <p>{order.customer.address}</p>
                        <p>{order.customer.neighborhood}</p>
                        {order.customer.reference && (
                          <p className="text-xs text-gray-500">Ref: {order.customer.reference}</p>
                        )}
                      </div>
                      <button
                        onClick={() => openMaps(order.customer.address, order.customer.neighborhood)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Maps</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 border-b">
                  <h4 className="font-medium text-gray-800 mb-2">Itens do Pedido</h4>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-gray-600">{item.selectedSize}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{order.items.length - 3} mais...
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPaymentIcon(order.payment.method)}
                      <span className="text-sm font-medium">{getPaymentLabel(order.payment.method)}</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                  
                  {order.payment.method === 'dinheiro' && order.payment.needsChange && (
                    <p className="text-xs text-gray-600">
                      Troco para: R$ {order.payment.changeAmount?.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 space-y-2">
                  {order.payment.method === 'dinheiro' && (
                    <button
                      onClick={() => handleConfirmPayment(order.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Confirmar Pagamento</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleConfirmDelivery(order.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Confirmar Entrega</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryPanel;