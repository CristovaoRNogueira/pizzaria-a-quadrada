import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { apiService } from '../services/api';

const AdminRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está logado
    const token = localStorage.getItem('admin_token');
    const isLoggedIn = localStorage.getItem('admin_authenticated') === 'true';
    
    if (token && isLoggedIn) {
      // Verificar se o token ainda é válido
      apiService.healthCheck()
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token inválido, limpar localStorage
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_authenticated');
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
      
      setIsAuthenticated(true);
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
    setIsAuthenticated(false);
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

  return <AdminPanel onLogout={handleLogout} />;
};

export default AdminRoute;