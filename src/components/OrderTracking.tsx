import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, ChefHat, Truck, Package, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const OrderTracking: React.FC = () => {
  const { state, dispatch } = useApp();
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [estimatedTime, setEstimatedTime] = useState(35); // minutos

  useEffect(() => {
    if (state.trackingOrderId) {
      const order = state.orders.find(o => o.id === state.trackingOrderId);
      setCurrentOrder(order);
    }
  }, [state.trackingOrderId, state.orders]);

  useEffect(() => {
    // Simular atualização de tempo estimado baseado no status
    if (currentOrder) {
      switch (currentOrder.status) {
        case 'new':
          setEstimatedTime(35);
          break;
        case 'accepted':
          setEstimatedTime(30);
          break;
        case 'production':
          setEstimatedTime(20);
          break;
        case 'delivery':
          setEstimatedTime(15);
          break;
        case 'completed':
          setEstimatedTime(0);
          break;
      }
    }
  }, [currentOrder?.status]);

  const getStatusInfo = (status: string) => {
    const statusMap = {
      new: {
        icon: Clock,
        title: 'Pedido Recebido',
        description: 'Seu pedido foi recebido e está sendo analisado',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300'
      },
      accepted: {
        icon: CheckCircle,
        title: 'Pedido Confirmado',
        description: 'Seu pedido foi aceito e está sendo preparado',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300'
      },
      production: {
        icon: ChefHat,
        title: 'Em Preparação',
        description: 'Sua pizza está sendo preparada com carinho',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300'
      },
      delivery: {
        icon: Truck,
        title: 'Saiu para Entrega',
        description: 'Seu pedido está a caminho!',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300'
      },
      completed: {
        icon: Package,
        title: 'Entregue',
        description: 'Pedido entregue com sucesso!',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300'
      }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.new;
  };

  const getStatusSteps = () => {
    const steps = ['new', 'accepted', 'production', 'delivery', 'completed'];
    const currentIndex = steps.indexOf(currentOrder?.status || 'new');
    
    return steps.map((step, index) => ({
      ...getStatusInfo(step),
      isActive: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  const getSizeLabel = (size: string) => {
    const labels = {
      small: "Pequena",
      medium: "Média", 
      large: "Grande",
      family: "Família",
    };
    return labels[size as keyof typeof labels] || size;
  };

  const handleBackToMenu = () => {
    dispatch({ type: 'SET_ORDER_TRACKING', payload: null });
    dispatch({ type: 'SET_VIEW', payload: 'menu' });
  };

  const openWhatsApp = () => {
    const phone = '5577999742491';
    const message = `Olá! Gostaria de saber sobre meu pedido #${currentOrder?.id}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pedido não encontrado</h2>
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

  const statusInfo = getStatusInfo(currentOrder.status);
  const StatusIcon = statusInfo.icon;
  const steps = getStatusSteps();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBackToMenu}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Acompanhar Pedido</h1>
          <p className="text-gray-600">Pedido #{currentOrder.id}</p>
        </div>
      </div>

      {/* Status Atual */}
      <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-l-4 p-6 rounded-lg mb-6`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
            <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.title}</h2>
            <p className="text-gray-700">{statusInfo.description}</p>
            {estimatedTime > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Tempo estimado: {estimatedTime} minutos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline de Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status do Pedido</h3>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  step.isActive ? step.bgColor : 'bg-gray-100'
                }`}>
                  <StepIcon className={`h-5 w-5 ${
                    step.isActive ? step.color : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    step.isActive ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-sm ${
                    step.isActive ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {step.isCurrent && (
                  <div className="animate-pulse">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalhes do Pedido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Informações do Cliente */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações de Entrega</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">👤</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{currentOrder.customer.name}</p>
                <p className="text-sm text-gray-600">{currentOrder.customer.phone}</p>
              </div>
            </div>
            
            {currentOrder.customer.deliveryType === 'delivery' ? (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Endereço de Entrega</p>
                  <p className="text-sm text-gray-600">
                    {currentOrder.customer.address}, {currentOrder.customer.neighborhood}
                  </p>
                  {currentOrder.customer.reference && (
                    <p className="text-sm text-gray-500">
                      Ref: {currentOrder.customer.reference}
                    </p>
                  )}
                  {currentOrder.customer.location && (
                    <p className="text-sm text-green-600">📍 Localização compartilhada</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Retirada no Local</p>
                  <p className="text-sm text-gray-600">Rua das Pizzas, 123 - Centro</p>
                </div>
              </div>
            )}

            {currentOrder.customer.notes && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                  <MessageCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Observações</p>
                  <p className="text-sm text-gray-600">{currentOrder.customer.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Itens do Pedido */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Itens do Pedido</h3>
          <div className="space-y-3">
            {currentOrder.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity}x {getSizeLabel(item.selectedSize)}
                  </p>
                  {item.selectedFlavors && item.selectedFlavors.length > 1 && (
                    <p className="text-xs text-gray-500">
                      {item.selectedFlavors.map((f: any) => f.name).join(', ')}
                    </p>
                  )}
                </div>
                <p className="font-medium text-gray-800">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-xl font-bold text-red-600">
                R$ {currentOrder.total.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Pagamento: {currentOrder.payment.method.toUpperCase()}
              {currentOrder.payment.needsChange && (
                <span> (Troco: R$ {currentOrder.payment.changeAmount?.toFixed(2)})</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Precisa de Ajuda?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={openWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Falar no WhatsApp</span>
          </button>
          
          <button
            onClick={() => window.location.href = 'tel:+5577999742491'}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Phone className="h-5 w-5" />
            <span>Ligar para Pizzaria</span>
          </button>
        </div>
      </div>

      {/* Auto-refresh */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Esta página é atualizada automaticamente a cada 30 segundos
        </p>
      </div>
    </div>
  );
};

export default OrderTracking;