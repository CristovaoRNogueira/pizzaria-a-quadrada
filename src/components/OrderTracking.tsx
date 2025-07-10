import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, Truck, ChefHat, Package, Phone, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { OrderStatus } from '../types';

const OrderTracking: React.FC = () => {
  const { state, dispatch } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBackToMenu = () => {
    dispatch({ type: 'SHOW_ORDER_TRACKING', payload: false });
    dispatch({ type: 'SET_CURRENT_ORDER', payload: null });
    dispatch({ type: 'SET_VIEW', payload: 'menu' });
  };

  if (!state.currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Nenhum pedido encontrado
          </h2>
          <button
            onClick={handleBackToMenu}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  const order = state.currentOrder;

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return {
          icon: Clock,
          title: 'Pedido Recebido',
          description: 'Seu pedido foi recebido e está sendo analisado',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          title: 'Pedido Confirmado',
          description: 'Seu pedido foi aceito e está sendo preparado',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'production':
        return {
          icon: ChefHat,
          title: 'Em Preparação',
          description: 'Sua pizza está sendo preparada com carinho',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'delivery':
        return {
          icon: Truck,
          title: 'Saiu para Entrega',
          description: 'Sua pizza está a caminho!',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'completed':
        return {
          icon: Package,
          title: 'Entregue',
          description: 'Pedido entregue com sucesso! Bom apetite!',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'cancelled':
        return {
          icon: Clock,
          title: 'Cancelado',
          description: 'Pedido foi cancelado',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: Clock,
          title: 'Status Desconhecido',
          description: '',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  const getEstimatedTime = () => {
    const orderTime = new Date(order.createdAt);
    const estimatedDelivery = new Date(orderTime.getTime() + 40 * 60 * 1000); // 40 minutos
    
    if (order.status === 'completed') {
      return 'Entregue';
    }
    
    if (currentTime > estimatedDelivery) {
      return 'Em breve';
    }
    
    const diffMs = estimatedDelivery.getTime() - currentTime.getTime();
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    
    return `${diffMins} min`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getProgressPercentage = () => {
    switch (order.status) {
      case 'new': return 20;
      case 'accepted': return 40;
      case 'production': return 60;
      case 'delivery': return 80;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToMenu}
              className="p-2 hover:bg-red-700 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Acompanhar Pedido</h1>
            <div></div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Pedido #{order.id.toString().slice(-8)}</h2>
            <p className="text-red-100">
              Feito às {formatTime(new Date(order.createdAt))}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-6 border-b">
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Recebido</span>
              <span>Confirmado</span>
              <span>Preparando</span>
              <span>Entregando</span>
              <span>Concluído</span>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="p-6 border-b">
          <div className={`flex items-center space-x-4 p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
            <div>
              <h3 className={`font-bold text-lg ${statusInfo.color}`}>
                {statusInfo.title}
              </h3>
              <p className="text-gray-700">{statusInfo.description}</p>
              <p className="text-sm text-gray-600 mt-1">
                Tempo estimado: {getEstimatedTime()}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-6 border-b">
          <h3 className="font-bold text-gray-800 mb-4">Detalhes do Pedido</h3>
          
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.quantity}x • Tamanho: {item.selectedSize}
                  </p>
                  {item.selectedFlavors && item.selectedFlavors.length > 1 && (
                    <p className="text-xs text-gray-600">
                      Sabores: {item.selectedFlavors.map(f => f.name).join(', ')}
                    </p>
                  )}
                  {item.selectedAdditionals && item.selectedAdditionals.length > 0 && (
                    <p className="text-xs text-gray-600">
                      Adicionais: {item.selectedAdditionals.map(add => add.name).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-gray-600 italic">
                      Obs: {item.notes}
                    </p>
                  )}
                </div>
                <span className="font-bold text-red-600">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-red-600">
                R$ {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b">
          <h3 className="font-bold text-gray-800 mb-4">Informações de Entrega</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-600" />
              <span>{order.customer.phone}</span>
            </div>
            
            {order.customer.deliveryType === 'delivery' && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p>{order.customer.address}</p>
                  <p className="text-sm text-gray-600">{order.customer.neighborhood}</p>
                  {order.customer.reference && (
                    <p className="text-sm text-gray-600">
                      Ref: {order.customer.reference}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {order.customer.deliveryType === 'pickup' && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium">Retirada no Local</p>
                  <p className="text-sm text-gray-600">
                    Rua das Pizzas, 123 - Centro<br />
                    Vitória da Conquista - BA
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">Pagamento</h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span>Método:</span>
              <span className="font-medium">
                {order.payment.method === 'dinheiro' && 'Dinheiro'}
                {order.payment.method === 'pix' && 'PIX'}
                {order.payment.method === 'cartao' && 'Cartão de Crédito'}
              </span>
            </div>
            
            {order.payment.method === 'dinheiro' && order.payment.needsChange && (
              <div className="flex justify-between items-center mt-2">
                <span>Troco para:</span>
                <span className="font-medium">
                  R$ {order.payment.changeAmount?.toFixed(2)}
                </span>
              </div>
            )}
            
            {order.payment.method === 'pix' && (
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <span>Status PIX:</span>
                  <span className={`font-medium ${
                    order.payment.pixPaid ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {order.payment.pixPaid ? 'Pago' : 'Aguardando Pagamento'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 p-6 text-center">
          <p className="text-gray-600 mb-2">
            Dúvidas sobre seu pedido?
          </p>
          <a
            href={`https://wa.me/5577999742491?text=Olá! Tenho uma dúvida sobre meu pedido ${order.id.toString().slice(-8)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;