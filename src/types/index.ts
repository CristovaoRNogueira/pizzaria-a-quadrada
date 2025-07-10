export interface Pizza {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'quadrada' | 'redonda' | 'doce' | 'bebida';
  ingredients: string[];
  sizes: {
    small?: number;
    medium: number;
    large: number;
    family: number;
  };
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Additional {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'queijo' | 'carne' | 'vegetal' | 'outros';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PizzaSize {
  name: string;
  slices: number;
  maxFlavors: number;
  price: number;
}

export interface CartItem extends Pizza {
  quantity: number;
  selectedSize: 'small' | 'medium' | 'large' | 'family';
  selectedFlavors: Pizza[];
  selectedAdditionals: Additional[];
  notes?: string;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address?: string;
  neighborhood?: string;
  reference?: string;
  location?: {
    lat: number;
    lng: number;
  };
  deliveryType: 'delivery' | 'pickup';
  latitude?: number;
  longitude?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentInfo {
  method: 'dinheiro' | 'pix';
  needsChange?: boolean;
  changeAmount?: number;
  pixCode?: string;
  pixPaid?: boolean;
  pixTransactionId?: string;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  pizzaId: number;
  quantity: number;
  selectedSize: string;
  selectedFlavors: string[];
  selectedAdditionals: string[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  customerId?: number;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  payment: PaymentInfo;
  // Campos do schema Prisma
  paymentMethod: string;
  paymentNeedsChange: boolean;
  paymentChangeAmount?: number;
  paymentPixCode?: string;
  orderItems?: OrderItem[];
}

export type OrderStatus = 'new' | 'accepted' | 'production' | 'delivery' | 'completed' | 'cancelled';

export interface BusinessHours {
  id?: number;
  businessSettingsId?: string;
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface PaymentSettings {
  pixKey: string;
  pixName: string;
  acceptCash: boolean;
  acceptPix: boolean;
}

export interface BusinessSettings {
  id?: string;
  isOpen: boolean;
  closedMessage: string;
  businessHours: BusinessHours[];
  payment: PaymentSettings;
  businessInfo: BusinessInfo;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusinessInfo {
  name: string;
  whatsapp: string;
  instagram: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Admin {
  id: number;
  email: string;
  password: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  permissions: UserPermissions;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'delivery';

export interface UserPermissions {
  dashboard: boolean;
  orders: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    updateStatus: boolean;
  };
  menu: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  settings: {
    view: boolean;
    update: boolean;
    users: boolean;
  };
  delivery: {
    view: boolean;
    confirmPayment: boolean;
    confirmDelivery: boolean;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  token: string;
  admin: {
    id: number;
    email: string;
    name: string;
    role?: UserRole;
    permissions?: UserPermissions;
  };
}

export interface CreateOrderRequest {
  customer: {
    name: string;
    phone: string;
    address?: string;
    neighborhood?: string;
    reference?: string;
    deliveryType: 'delivery' | 'pickup';
    location?: {
      lat: number;
      lng: number;
    };
  };
  items: Array<{
    id: number;
    name: string;
    description: string;
    image: string;
    category: string;
    ingredients: string[];
    quantity: number;
    selectedSize: string;
    selectedFlavors: Array<{ id: number; name: string }>;
    selectedAdditionals?: Array<{ id: number; name: string; price: number }>;
    notes?: string;
    price: number;
  }>;
  total: number;
  payment: {
    method: string;
    needsChange?: boolean;
    changeAmount?: number;
    pixCode?: string;
  };
}

export interface CreatePizzaRequest {
  name: string;
  description: string;
  image: string;
  category: Pizza['category'];
  ingredients: string[];
  sizes: {
    small?: number;
    medium: number;
    large: number;
    family: number;
  };
}

export interface CreateAdditionalRequest {
  name: string;
  description: string;
  price: number;
  category: Additional['category'];
}

export interface UpdateBusinessSettingsRequest {
  isOpen?: boolean;
  closedMessage?: string;
  businessHours?: BusinessHours[];
  payment?: PaymentSettings;
  businessInfo?: BusinessInfo;
}