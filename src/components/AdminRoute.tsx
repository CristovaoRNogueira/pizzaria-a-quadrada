import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import DeliveryPanel from './DeliveryPanel';
import { apiService } from '../services/api';
import { useApp } from '../contexts/AppContext';

const AdminRoute: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se já está logado
    const token = localStorage.getItem('admin_token');
    const isLoggedIn = localStorage.getItem('admin_authenticated') === 'true';
    const savedRole = localStorage.getItem('user_role');
    
    if (token && isLoggedIn) {
      // Verificar se o token ainda é válido
      apiService.healthCheck()
        .then(() => {
          setIsAuthenticated(true);
          setUserRole(savedRole);
        })
        .catch(() => {
          // Token inválido, limpar localStorage
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('user_role');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await apiService.login(email, password);
      
      // Salvar token e estado de autenticação
      localStorage.setItem('admin_token', response.token);
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('user_role', response.admin.role || 'admin');
      
      setIsAuthenticated(true);
      setUserRole(response.admin.role || 'admin');
      
      // Definir usuário atual no contexto
      dispatch({
        type: 'SET_CURRENT_USER',
        payload: {
          id: response.admin.id,
          name: response.admin.name,
          email: response.admin.email,
          role: response.admin.role || 'admin',
          permissions: response.admin.permissions || getDefaultPermissions(response.admin.role || 'admin'),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      setLoginError(
        error.response?.data?.error || 
        'Erro ao fazer login. Verifique suas credenciais.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setUserRole(null);
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const getDefaultPermissions = (role: string) => {
    switch (role) {
      case 'delivery':
        return {
          dashboard: false,
          orders: { view: true, create: false, update: false, delete: false, updateStatus: false },
          menu: { view: false, create: false, update: false, delete: false },
          settings: { view: false, update: false, users: false },
          delivery: { view: true, confirmPayment: true, confirmDelivery: true },
        };
      case 'operator':
        return {
          dashboard: false,
          orders: { view: true, create: false, update: false, delete: false, updateStatus: true },
          menu: { view: false, create: false, update: false, delete: false },
          settings: { view: false, update: false, users: false },
          delivery: { view: false, confirmPayment: false, confirmDelivery: false },
        };
      default:
        return {
          dashboard: true,
          orders: { view: true, create: true, update: true, delete: true, updateStatus: true },
          menu: { view: true, create: true, update: true, delete: true },
          settings: { view: true, update: true, users: true },
          delivery: { view: true, confirmPayment: true, confirmDelivery: true },
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />;
  }

  // Redirecionar entregadores para o painel de entrega
  if (userRole === 'delivery') {
    return <DeliveryPanel />;
  }

  return <AdminPanel onLogout={handleLogout} userRole={userRole} />;
};

export default AdminRoute;