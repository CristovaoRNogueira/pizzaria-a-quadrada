import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import Menu from './components/Menu';
import Cart from './components/Cart';
import AdminRoute from './components/AdminRoute';
import Notifications from './components/Notifications';
import OrderTracking from './components/OrderTracking';

const AppContent: React.FC = () => {
  const { state } = useApp();
  
  // Check if we're on admin route
  const isAdminRoute = window.location.pathname === '/admin' || state.currentView === 'admin';
  
  const renderCurrentView = () => {
    if (state.showOrderTracking) {
      return <OrderTracking />;
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
      {!isAdminRoute && !state.showOrderTracking && <Header />}
      <main>
        {renderCurrentView()}
      </main>
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