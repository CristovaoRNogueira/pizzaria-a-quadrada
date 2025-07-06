import React, { useState } from 'react';
import { User, Phone, Lock, Eye, EyeOff, ShoppingBag, Clock, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const CustomerArea: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    email: '',
    confirmPassword: ''
  });
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular login - em produção, fazer chamada para API
    const customer = state.orders.find(order => 
      order.customer.phone === formData.phone
    );

    if (customer) {
      setIsLoggedIn(true);
      // Buscar pedidos do cliente
      const orders = state.orders.filter(order => 
        order.customer.phone === formData.phone
      );
      setCustomerOrders(orders);
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Login realizado com sucesso!'
      });
    } else {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Cliente não encontrado. Verifique seu telefone.'
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'As senhas não coincidem!'
      });
      return;
    }

    // Simular cadastro - em produção, fazer chamada para API
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Cadastro realizado com sucesso! Faça login para continuar.'
    });
    setShowLogin(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCustomerOrders([]);
    setFormData({
      phone: '',
      password: '',
      name: '',
      email: '',
      confirmPassword: ''
    });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      new: 'Novo Pedido',
      accepted: 'Aceito',
      production: 'Em Produção',
      delivery: 'Saiu para Entrega',
      completed: 'Entregue'
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

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Minha Conta</h1>
                  <p className="text-gray-600">{formData.phone}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{customerOrders.length}</p>
                  <p className="text-sm text-gray-600">Total de Pedidos</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {customerOrders.filter(o => o.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Pedidos Entregues</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {customerOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total Gasto</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Meus Pedidos</h2>
            
            {customerOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Você ainda não fez nenhum pedido</p>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'menu' })}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Fazer Primeiro Pedido
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">Pedido #{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <p className="text-lg font-bold text-gray-800 mt-1">
                          R$ {order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium text-gray-700 mb-2">Itens:</h4>
                      <div className="space-y-1">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name} ({item.selectedSize})
                            </span>
                            <span className="text-gray-800">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.status !== 'completed' && (
                      <div className="mt-3 pt-3 border-t">
                        <button
                          onClick={() => {
                            dispatch({ type: 'SET_ORDER_TRACKING', payload: order.id });
                            dispatch({ type: 'SET_VIEW', payload: 'tracking' });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Acompanhar Pedido
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-red-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {showLogin ? 'Entrar' : 'Cadastrar'}
          </h1>
          <p className="text-gray-600">Área do Cliente</p>
        </div>

        {showLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="(77) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Entrar
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Não tem conta? Cadastre-se
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="(77) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cadastrar
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Já tem conta? Faça login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerArea;