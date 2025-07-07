import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_authenticated');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Autenticação
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Pizzas
  getPizzas: async () => {
    const response = await api.get('/pizzas');
    return response.data;
  },

  createPizza: async (pizzaData: any) => {
    const response = await api.post('/pizzas', pizzaData);
    return response.data;
  },

  updatePizza: async (id: string, pizzaData: any) => {
    const response = await api.put(`/pizzas/${id}`, pizzaData);
    return response.data;
  },

  deletePizza: async (id: string) => {
    const response = await api.delete(`/pizzas/${id}`);
    return response.data;
  },

  // Adicionais
  getAdditionals: async () => {
    const response = await api.get('/additionals');
    return response.data;
  },

  createAdditional: async (additionalData: any) => {
    const response = await api.post('/additionals', additionalData);
    return response.data;
  },

  updateAdditional: async (id: string, additionalData: any) => {
    const response = await api.put(`/additionals/${id}`, additionalData);
    return response.data;
  },

  deleteAdditional: async (id: string) => {
    const response = await api.delete(`/additionals/${id}`);
    return response.data;
  },

  // Pedidos
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Configurações de negócio
  getBusinessSettings: async () => {
    const response = await api.get('/business-settings');
    return response.data;
  },

  updateBusinessSettings: async (settings: any) => {
    const response = await api.put('/business-settings', settings);
    return response.data;
  },

  // Usuários
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;