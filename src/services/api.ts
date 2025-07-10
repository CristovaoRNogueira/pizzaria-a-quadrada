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

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, config: RequestConfig = { method: 'GET' }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.body,
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('user_role');
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin';
        }
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', {
        url,
        method: config.method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Pizzas
  async getPizzas(): Promise<Pizza[]> {
    return this.request<Pizza[]>('/pizzas');
  }

  async createPizza(pizzaData: CreatePizzaRequest): Promise<Pizza> {
    return this.request<Pizza>('/pizzas', {
      method: 'POST',
      body: JSON.stringify(pizzaData),
    });
  }

  async updatePizza(id: number, pizzaData: CreatePizzaRequest): Promise<Pizza> {
    return this.request<Pizza>(`/pizzas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pizzaData),
    });
  }

  async deletePizza(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/pizzas/${id}`, {
      method: 'DELETE',
    });
  }

  // Additionals
  async getAdditionals(): Promise<Additional[]> {
    return this.request<Additional[]>('/additionals');
  }

  async createAdditional(additionalData: CreateAdditionalRequest): Promise<Additional> {
    return this.request<Additional>('/additionals', {
      method: 'POST',
      body: JSON.stringify(additionalData),
    });
  }

  async updateAdditional(id: number, additionalData: Partial<Additional>): Promise<Additional> {
    return this.request<Additional>(`/additionals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(additionalData),
    });
  }

  async deleteAdditional(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/additionals/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteOrder(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Business Settings
  async getBusinessSettings(): Promise<BusinessSettings> {
    return this.request<BusinessSettings>('/business-settings');
  }

  async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    return this.request<BusinessSettings>('/business-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;