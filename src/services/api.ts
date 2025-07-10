import axios, { AxiosResponse } from 'axios';
import { 
  Pizza, 
  Additional, 
  Order, 
  BusinessSettings, 
  LoginResponse, 
  CreateOrderRequest, 
  CreatePizzaRequest, 
  CreateAdditionalRequest,
  ApiResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('user_role');
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/admin';
      }
    }
    
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url,
    });
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  // Pizzas
  getPizzas: async (): Promise<Pizza[]> => {
    const response = await api.get<Pizza[]>('/pizzas');
    return response.data;
  },

  createPizza: async (pizzaData: CreatePizzaRequest): Promise<Pizza> => {
    const response = await api.post<Pizza>('/pizzas', pizzaData);
    return response.data;
  },

  updatePizza: async (id: number, pizzaData: CreatePizzaRequest): Promise<Pizza> => {
    const response = await api.put<Pizza>(`/pizzas/${id}`, pizzaData);
    return response.data;
  },

  deletePizza: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/pizzas/${id}`);
    return response.data;
  },

  // Additionals
  getAdditionals: async (): Promise<Additional[]> => {
    const response = await api.get<Additional[]>('/additionals');
    return response.data;
  },

  createAdditional: async (additionalData: CreateAdditionalRequest): Promise<Additional> => {
    const response = await api.post<Additional>('/additionals', additionalData);
    return response.data;
  },

  updateAdditional: async (id: number, additionalData: Partial<Additional>): Promise<Additional> => {
    const response = await api.put<Additional>(`/additionals/${id}`, additionalData);
    return response.data;
  },

  deleteAdditional: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/additionals/${id}`);
    return response.data;
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  deleteOrder: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/orders/${id}`);
    return response.data;
  },

  // Business Settings
  getBusinessSettings: async (): Promise<BusinessSettings> => {
    const response = await api.get<BusinessSettings>('/business-settings');
    return response.data;
  },

  updateBusinessSettings: async (settings: Partial<BusinessSettings>): Promise<BusinessSettings> => {
    const response = await api.put<BusinessSettings>('/business-settings', settings);
    return response.data;
  },

  // Health Check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  },
};

export default api;