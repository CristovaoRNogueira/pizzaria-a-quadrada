import React, { useState } from 'react';
import { Send, Users, MessageCircle, Plus, X, Calendar, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { whatsappService } from '../services/whatsapp';

interface Promotion {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'recent' | 'frequent';
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'sent';
  sentCount?: number;
  createdAt: Date;
}

const PromotionManager: React.FC = () => {
  const { state, dispatch } = useApp();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all' as 'all' | 'recent' | 'frequent',
    scheduleType: 'now' as 'now' | 'later',
    scheduledDate: '',
    scheduledTime: ''
  });
  const [isSending, setIsSending] = useState(false);

  // Obter lista de clientes únicos dos pedidos
  const getCustomers = () => {
    const customerMap = new Map();
    
    state.orders.forEach(order => {
      const phone = order.customer.phone;
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          name: order.customer.name,
          phone: phone,
          lastOrder: order.createdAt,
          orderCount: 1,
          totalSpent: order.total
        });
      } else {
        const customer = customerMap.get(phone);
        customer.orderCount += 1;
        customer.totalSpent += order.total;
        if (order.createdAt > customer.lastOrder) {
          customer.lastOrder = order.createdAt;
        }
      }
    });

    return Array.from(customerMap.values());
  };

  const getTargetCustomers = (audience: string) => {
    const customers = getCustomers();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (audience) {
      case 'recent':
        return customers.filter(customer => 
          new Date(customer.lastOrder) >= thirtyDaysAgo
        );
      case 'frequent':
        return customers.filter(customer => customer.orderCount >= 3);
      case 'all':
      default:
        return customers;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'recent': return 'Clientes Recentes (últimos 30 dias)';
      case 'frequent': return 'Clientes Frequentes (3+ pedidos)';
      case 'all': return 'Todos os Clientes';
      default: return audience;
    }
  };

  const handleCreatePromotion = () => {
    if (!formData.title || !formData.message) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Preencha título e mensagem da promoção!'
      });
      return;
    }

    const newPromotion: Promotion = {
      id: Date.now().toString(),
      title: formData.title,
      message: formData.message,
      targetAudience: formData.targetAudience,
      scheduledDate: formData.scheduleType === 'later' && formData.scheduledDate && formData.scheduledTime
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        : undefined,
      status: formData.scheduleType === 'later' ? 'scheduled' : 'draft',
      createdAt: new Date()
    };

    setPromotions([...promotions, newPromotion]);
    setShowCreateForm(false);
    setFormData({
      title: '',
      message: '',
      targetAudience: 'all',
      scheduleType: 'now',
      scheduledDate: '',
      scheduledTime: ''
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Promoção criada com sucesso!'
    });
  };

  const handleSendPromotion = async (promotion: Promotion) => {
    setIsSending(true);
    
    try {
      const targetCustomers = getTargetCustomers(promotion.targetAudience);
      
      if (targetCustomers.length === 0) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: 'Nenhum cliente encontrado para o público-alvo selecionado!'
        });
        return;
      }

      let successCount = 0;
      
      // Enviar mensagem para cada cliente
      for (const customer of targetCustomers) {
        try {
          const personalizedMessage = promotion.message
            .replace('{nome}', customer.name)
            .replace('{total_pedidos}', customer.orderCount.toString())
            .replace('{total_gasto}', `R$ ${customer.totalSpent.toFixed(2)}`);

          const success = await whatsappService.sendMessage(
            customer.phone,
            `🍕 *PIZZARIA A QUADRADA*\n_A qualidade é nossa diferença!_\n\n${personalizedMessage}\n\n📱 Faça seu pedido: https://pizzariaquadrada.com`
          );

          if (success) {
            successCount++;
          }

          // Aguardar 2 segundos entre envios para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Erro ao enviar para ${customer.phone}:`, error);
        }
      }

      // Atualizar status da promoção
      setPromotions(promotions.map(p => 
        p.id === promotion.id 
          ? { ...p, status: 'sent', sentCount: successCount }
          : p
      ));

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: `Promoção enviada para ${successCount} de ${targetCustomers.length} clientes!`
      });

    } catch (error) {
      console.error('Erro ao enviar promoção:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Erro ao enviar promoção. Tente novamente.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeletePromotion = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta promoção?')) {
      setPromotions(promotions.filter(p => p.id !== id));
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Promoção excluída com sucesso!'
      });
    }
  };

  const customers = getCustomers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Send className="h-6 w-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Gerenciar Promoções</h3>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nova Promoção</span>
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
                <p className="text-sm text-blue-700">Total de Clientes</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {getTargetCustomers('recent').length}
                </p>
                <p className="text-sm text-green-700">Clientes Recentes</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {getTargetCustomers('frequent').length}
                </p>
                <p className="text-sm text-purple-700">Clientes Frequentes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Criação */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Nova Promoção</h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Promoção
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Promoção Pizza em Dobro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Público-Alvo
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  targetAudience: e.target.value as 'all' | 'recent' | 'frequent' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Todos os Clientes ({customers.length})</option>
                <option value="recent">Clientes Recentes ({getTargetCustomers('recent').length})</option>
                <option value="frequent">Clientes Frequentes ({getTargetCustomers('frequent').length})</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem da Promoção
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Digite sua mensagem promocional aqui...&#10;&#10;Você pode usar:&#10;{nome} - Nome do cliente&#10;{total_pedidos} - Número de pedidos&#10;{total_gasto} - Total gasto pelo cliente"
              />
              <p className="text-xs text-gray-500 mt-1">
                Variáveis disponíveis: {'{nome}'}, {'{total_pedidos}'}, {'{total_gasto}'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quando Enviar
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="now"
                    name="scheduleType"
                    value="now"
                    checked={formData.scheduleType === 'now'}
                    onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as 'now' | 'later' })}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="now" className="text-sm text-gray-700">Enviar agora</label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="later"
                    name="scheduleType"
                    value="later"
                    checked={formData.scheduleType === 'later'}
                    onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as 'now' | 'later' })}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="later" className="text-sm text-gray-700">Agendar para depois</label>
                </div>

                {formData.scheduleType === 'later' && (
                  <div className="ml-6 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePromotion}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Criar Promoção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Promoções */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Promoções Criadas</h4>
        
        {promotions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma promoção criada ainda</p>
            <p className="text-gray-400 text-sm">Clique em "Nova Promoção" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-800">{promotion.title}</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      promotion.status === 'sent' 
                        ? 'bg-green-100 text-green-800'
                        : promotion.status === 'scheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {promotion.status === 'sent' ? 'Enviada' : 
                       promotion.status === 'scheduled' ? 'Agendada' : 'Rascunho'}
                    </span>
                    
                    {promotion.status !== 'sent' && (
                      <button
                        onClick={() => handleSendPromotion(promotion)}
                        disabled={isSending}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        {isSending ? 'Enviando...' : 'Enviar'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{promotion.message}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{getAudienceLabel(promotion.targetAudience)}</span>
                  <div className="flex items-center space-x-4">
                    {promotion.scheduledDate && (
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{promotion.scheduledDate.toLocaleString('pt-BR')}</span>
                      </span>
                    )}
                    {promotion.sentCount !== undefined && (
                      <span>{promotion.sentCount} enviadas</span>
                    )}
                    <span>Criada em {promotion.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionManager;