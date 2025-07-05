import React from 'react';
import { X, MapPin, Phone, MessageCircle, Clock, User, Package } from 'lucide-react';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const getSizeLabel = (size: string) => {
    const labels = {
      small: "Pequena",
      medium: "Média",
      large: "Grande",
      family: "Família",
    };
    return labels[size as keyof typeof labels] || size;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      new: "Novo Pedido",
      accepted: "Aceito",
      production: "Em Produção",
      delivery: "Saiu para Entrega",
      completed: "Entregue",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            Detalhes do Pedido #{order.id}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Informações Gerais */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Data/Hora</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-red-600">{getStatusLabel(order.status)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-bold text-lg text-red-600">R$ {order.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pagamento</p>
                <p className="font-medium">
                  {order.payment.method.toUpperCase()}
                  {order.payment.confirmed && (
                    <span className="text-green-600 ml-1">✓ Confirmado</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações do Cliente
            </h4>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{order.customer.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span>{order.customer.phone}</span>
              </div>
              
              {order.customer.deliveryType === 'delivery' ? (
                <>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-600 mt-1" />
                    <div>
                      <p>{order.customer.address}</p>
                      <p className="text-sm text-gray-600">{order.customer.neighborhood}</p>
                      {order.customer.reference && (
                        <p className="text-sm text-gray-600">Ref: {order.customer.reference}</p>
                      )}
                    </div>
                  </div>
                  {order.customer.location && (
                    <div className="text-sm text-green-600">
                      📍 Localização: {order.customer.location.lat.toFixed(6)}, {order.customer.location.lng.toFixed(6)}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-600 font-medium">Retirada no Local</span>
                </div>
              )}

              {order.customer.notes && (
                <div className="flex items-start space-x-2 mt-3 pt-3 border-t border-blue-200">
                  <MessageCircle className="h-4 w-4 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Observações:</p>
                    <p className="text-sm text-gray-600">{order.customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Itens do Pedido</h4>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800">{item.name}</h5>
                      <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Quantidade: {item.quantity}x
                          </p>
                          <p className="text-sm text-gray-600">
                            Tamanho: {getSizeLabel(item.selectedSize)}
                          </p>
                          {item.selectedFlavors && item.selectedFlavors.length > 1 && (
                            <p className="text-sm text-gray-600">
                              Sabores: {item.selectedFlavors.map((f: any) => f.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Unit: R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informações de Pagamento */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Informações de Pagamento</h4>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Método</p>
                  <p className="font-medium">{order.payment.method.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-medium ${order.payment.confirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.payment.confirmed ? '✓ Confirmado' : '⏳ Pendente'}
                  </p>
                </div>
                {order.payment.needsChange && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Troco para</p>
                      <p className="font-medium">R$ {order.payment.changeAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Troco</p>
                      <p className="font-medium">R$ {(order.payment.changeAmount! - order.total).toFixed(2)}</p>
                    </div>
                  </>
                )}
                {order.payment.pixCode && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Código PIX</p>
                    <p className="font-mono text-xs bg-white p-2 rounded border break-all">
                      {order.payment.pixCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo para Impressão */}
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
            <h4 className="font-bold text-center mb-2">PIZZARIA A QUADRADA</h4>
            <p className="text-center text-xs mb-3">A qualidade é nossa diferença</p>
            <div className="border-t border-gray-300 pt-2">
              <p>PEDIDO #{order.id}</p>
              <p>{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
              <div className="border-t border-gray-300 my-2"></div>
              <p>CLIENTE: {order.customer.name}</p>
              <p>TELEFONE: {order.customer.phone}</p>
              {order.customer.deliveryType === 'delivery' ? (
                <>
                  <p>ENDEREÇO: {order.customer.address}</p>
                  <p>BAIRRO: {order.customer.neighborhood}</p>
                  {order.customer.reference && <p>REF: {order.customer.reference}</p>}
                </>
              ) : (
                <p>RETIRADA NO LOCAL</p>
              )}
              {order.customer.notes && <p>OBS: {order.customer.notes}</p>}
              <div className="border-t border-gray-300 my-2"></div>
              <p>ITENS:</p>
              {order.items.map((item: any, index: number) => (
                <div key={index} className="ml-2">
                  <p>{index + 1}. {item.quantity}x {item.name} ({getSizeLabel(item.selectedSize)})</p>
                  {item.selectedFlavors && item.selectedFlavors.length > 1 && (
                    <p className="ml-2">Sabores: {item.selectedFlavors.map((f: any) => f.name).join(', ')}</p>
                  )}
                </div>
              ))}
              <div className="border-t border-gray-300 my-2"></div>
              <p>TOTAL: R$ {order.total.toFixed(2)}</p>
              <p>PAGAMENTO: {order.payment.method.toUpperCase()}</p>
              {order.payment.needsChange && (
                <p>TROCO PARA: R$ {order.payment.changeAmount?.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;