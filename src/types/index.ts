export interface Pizza {
  id: string;
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
}

export interface Additional {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'queijo' | 'carne' | 'vegetal' | 'outros';
  isActive: boolean;
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
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  reference?: string;
  location?: {
    lat: number;
    lng: number;
  };
  deliveryType: 'delivery' | 'pickup';
}

export interface PaymentInfo {
  method: 'dinheiro' | 'pix' | 'cartao';
  needsChange?: boolean;
  changeAmount?: number;
  pixCode?: string;
  stripePaymentIntentId?: string;
  pixPaid?: boolean;
  pixTransactionId?: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: 'new' | 'accepted' | 'production' | 'delivery' | 'completed' | 'cancelled';
  createdAt: Date;
  notes?: string;
  payment: PaymentInfo;
}

export type OrderStatus = Order['status'];

export interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface PaymentSettings {
  pixKey: string;
  pixName: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  acceptCash: boolean;
  acceptPix: boolean;
  acceptCard: boolean;
}

export interface BusinessSettings {
  businessHours: BusinessHours[];
  isOpen: boolean;
  closedMessage: string;
  payment: PaymentSettings;
  businessInfo: BusinessInfo;
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

export interface User {
  id: string;
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