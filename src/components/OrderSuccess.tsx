import React, { useEffect } from 'react';
import { CheckCircle, MessageCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Order } from '../types';

interface OrderSuccessProps {
  order: Order;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order }) => {
  const { dispatch, state } = useApp();

  useEffect(() => {
    // Gerar mensagem do WhatsApp
    const generateWhatsAppMessage = () => {
      const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(date));
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

      const getPaymentMethodLabel = (method: string) => {
        switch (method) {
          case 'dinheiro': return 'Dinheiro';
          case 'pix': return 'PIX';
          case 'cartao': return 'Cartão de Crédito';
          default: return method;
        }
      };

      let message = `🍕 *NOVO PEDIDO - PIZZARIA A QUADRADA*\n\n`;
      message += `📋 *Pedido:* #${order.id.toString().slice(-8)}\n`;
      message += `🕐 *Data/Hora:* ${formatTime(order.createdAt)}\n\n`;

      // Dados do cliente
      message += `👤 *CLIENTE:*\n`;
      message += `Nome: ${order.customer.name}\n`;
      message += `Telefone: ${order.customer.phone}\n`;
      message += `Tipo: ${order.customer.deliveryType === 'delivery' ? 'ENTREGA' : 'RETIRADA'}\n`;

      if (order.customer.deliveryType === 'delivery') {
        message += `Endereço: ${order.customer.address}\n`;
        message += `Bairro: ${order.customer.neighborhood}\n`;
        if (order.customer.reference) {
          message += `Referência: ${order.customer.reference}\n`;
        }
      }
      message += `\n`;

      // Itens do pedido
      message += `🛒 *ITENS DO PEDIDO:*\n`;
      order.items.forEach((item, index) => {
        message += `${index + 1}. ${item.quantity}x ${item.name}\n`;
        message += `   Tamanho: ${getSizeLabel(item.selectedSize)}\n`;
        
        if (item.selectedFlavors && item.selectedFlavors.length > 1) {
          message += `   Sabores: ${item.selectedFlavors.map(f => f.name).join(', ')}\n`;
        }
        
        if (item.selectedAdditionals && item.selectedAdditionals.length > 0) {
          message += `   Adicionais: ${item.selectedAdditionals.map(add => add.name).join(', ')}\n`;
        }
        
        if (item.notes) {
          message += `   Obs: ${item.notes}\n`;
        }
        
        message += `   Valor: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
      });

      // Pagamento
      message += `💳 *PAGAMENTO:*\n`;
      message += `Método: ${getPaymentMethodLabel(order.payment.method)}\n`;
      
      if (order.payment.method === 'dinheiro' && order.payment.needsChange) {
        message += `Troco para: R$ ${order.payment.changeAmount?.toFixed(2)}\n`;
        message += `Troco: R$ ${(order.payment.changeAmount! - order.total).toFixed(2)}\n`;
      }
      
      if (order.payment.method === 'pix') {
        message += `Status PIX: ${order.payment.pixPaid ? 'PAGO' : 'PENDENTE'}\n`;
      }
      
      message += `\n💰 *TOTAL: R$ ${order.total.toFixed(2)}*\n\n`;
      message += `✅ Pedido confirmado e registrado no sistema!`;

      return message;
    };

    // Abrir WhatsApp automaticamente
    const openWhatsApp = () => {
      const whatsappNumber = state.businessSettings.businessInfo.whatsapp.replace(/\D/g, '');
      const message = generateWhatsAppMessage();
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Abrir em nova aba
      window.open(whatsappUrl, '_blank');
    };

    // Aguardar um pouco antes de abrir o WhatsApp para dar tempo da página carregar
    const timer = setTimeout(openWhatsApp, 1500);

    return () => clearTimeout(timer);
  }, [order, state.businessSettings]);

  const handleBackToMenu = () => {
    dispatch({ type: 'SET_CURRENT_ORDER', payload: null });
    dispatch({ type: 'SET_VIEW', payload: 'menu' });
  };

  const handleOpenWhatsAppAgain = () => {
    const whatsappNumber = state.businessSettings.businessInfo.whatsapp.replace(/\D/g, '');
    const message = `Olá! Gostaria de confirmar meu pedido #${order.id.toString().slice(-8)}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pedido Recebido!
          </h1>
          <p className="text-gray-600">
            Obrigado pela preferência!
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Número do Pedido</p>
          <p className="text-xl font-bold text-red-600">
            #{order.id.toString().slice(-8)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Total: R$ {order.total.toFixed(2)}
          </p>
        </div>

        {/* WhatsApp Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              WhatsApp Aberto Automaticamente
            </span>
          </div>
          <p className="text-xs text-green-700">
            O WhatsApp foi aberto com os detalhes do seu pedido. 
            Envie a mensagem para confirmar!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleOpenWhatsAppAgain}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Abrir WhatsApp Novamente</span>
          </button>

          <button
            onClick={handleBackToMenu}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Cardápio</span>
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Dúvidas? Entre em contato:
          </p>
          <p className="text-sm font-medium text-gray-700">
            📞 {state.businessSettings.businessInfo.whatsapp}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;