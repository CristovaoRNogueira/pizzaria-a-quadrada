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
  description?: string;
  price: number;
  category: 'ingredient' | 'extra' | 'drink';
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
  selectedAdditionals?: Additional[];
}

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  address: string;
  neighborhood: string;
  reference?: string;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
  deliveryType: 'delivery' | 'pickup';
  isActive?: boolean;
}

export interface PaymentInfo {
  method: 'dinheiro' | 'pix' | 'cartao';
  needsChange?: boolean;
  changeAmount?: number;
  pixCode?: string;
  pixPaid?: boolean;
  pixCopied?: boolean;
  cardType?: 'credito' | 'debito';
  stripePaymentIntentId?: string;
  confirmed?: boolean;
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: 'new' | 'accepted' | 'production' | 'delivery' | 'completed';
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

export interface EstablishmentInfo {
  name: string;
  phone: string;
  instagram: string;
  address: string;
  email: string;
}

export interface PromotionBanner {
  active: boolean;
  title: string;
  message: string;
  color: string;
}

export interface BusinessSettings {
  businessHours: BusinessHours[];
  isOpen: boolean;
  closedMessage: string;
  payment: PaymentSettings;
  establishment: EstablishmentInfo;
  promotionBanner: PromotionBanner;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'delivery';
  permissions: {
    canDeleteOrders: boolean;
    canAccessSettings: boolean;
    canAccessDashboard: boolean;
    canAccessOrders: boolean;
    canAccessMenu: boolean;
    canAccessPromotions: boolean;
    canAccessUsers: boolean;
  };
  isActive: boolean;
  createdAt: Date;
}

export interface OrderTracking {
  orderId: string;
  customerPhone: string;
  status: OrderStatus;
  estimatedTime?: number;
  lastUpdate: Date;
}