import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Pizza, 
  Settings, 
  Users, 
  Clock, 
  CreditCard, 
  Store, 
  Megaphone,
  Plus,
  LogOut 
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import OrderManagement from './OrderManagement';
import MenuManagement from './MenuManagement';
import BusinessHoursManager from './BusinessHoursManager';
import PaymentSettings from './PaymentSettings';
import EstablishmentSettings from './EstablishmentSettings';
import PromotionManager from './PromotionManager';
import PromotionBannerManager from './PromotionBannerManager';
import UserManagement from './UserManagement';
import AdditionalManagement from './AdditionalManagement';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'menu', label: 'Cardápio', icon: Pizza },
    { id: 'additionals', label: 'Adicionais', icon: Plus },
    { id: 'hours', label: 'Horários', icon: Clock },
    { id: 'payment', label: 'Pagamentos', icon: CreditCard },
    { id: 'establishment', label: 'Estabelecimento', icon: Store },
    { id: 'banner', label: 'Banner Promoção', icon: Megaphone },
    { id: 'promotions', label: 'Promoções', icon: Megaphone },
    { id: 'users', label: 'Usuários', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'orders':
        return <OrderManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'additionals':
        return <AdditionalManagement />;
      case 'hours':
        return <BusinessHoursManager />;
      case 'payment':
        return <PaymentSettings />;
      case 'establishment':
        return <EstablishmentSettings />;
      case 'banner':
        return <PromotionBannerManager />;
      case 'promotions':
        return <PromotionManager />;
      case 'users':
        return <UserManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Painel Admin</h1>
          <p className="text-sm text-gray-600">Pizzaria a Quadrada</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;