import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import Menu from './components/Menu';
import Cart from './components/Cart';
import AdminRoute from './components/AdminRoute';
import DeliveryPanel from './components/DeliveryPanel';
import Footer from './components/Footer';
import Notifications from './components/Notifications';
import OrderSuccess from './components/OrderSuccess';

const AppContent: React.FC = () => {
  const { state } = useApp();
  
  // Check if we're on admin route
  const isAdminRoute = window.location.pathname === '/admin' || state.currentView === 'admin';
  
  // Check if we're on delivery route
  const isDeliveryRoute = window.location.pathname === '/delivery';
  
  const renderCurrentView = () => {
    if (state.showOrderSuccess && state.currentOrder) {
      return <OrderSuccess order={state.currentOrder} />;
    }
    
    if (isDeliveryRoute) {
      return <DeliveryPanel />;
    }
    
    if (isAdminRoute) {
      return <AdminRoute />;
    }
    
    switch (state.currentView) {
      case 'menu':
        return <Menu />;
      case 'cart':
        return <Cart />;
      default:
        return <Menu />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && !isDeliveryRoute && !state.showOrderSuccess && <Header />}
      <main>
        {renderCurrentView()}
      </main>
      {!isAdminRoute && !isDeliveryRoute && !state.showOrderSuccess && <Footer />}
      <Notifications />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;