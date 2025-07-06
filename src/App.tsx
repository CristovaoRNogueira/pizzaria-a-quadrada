import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import Menu from './components/Menu';
import Cart from './components/Cart';
import OrderTracking from './components/OrderTracking';
import CustomerArea from './components/CustomerArea';
import AdminRoute from './components/AdminRoute';
import Notifications from './components/Notifications';

const AppContent: React.FC = () => {
  const { state } = useApp();
  
  // Check if we're on admin route
  const isAdminRoute = window.location.pathname === '/admin' || state.currentView === 'admin';
  
  // PWA Install Prompt
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install notification after 3 seconds
      setTimeout(() => {
        if (deferredPrompt && state.currentView === 'menu') {
          const shouldInstall = confirm(
            '🍕 Instalar Pizzaria a Quadrada como aplicativo?\n\nTenha acesso rápido ao cardápio direto da sua tela inicial!'
          );
          
          if (shouldInstall) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('PWA instalado');
              }
              deferredPrompt = null;
            });
          }
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [state.currentView]);
  
  const renderCurrentView = () => {
    if (isAdminRoute) {
      return <AdminRoute />;
    }
    
    switch (state.currentView) {
      case 'menu':
        return <Menu />;
      case 'cart':
        return <Cart />;
      case 'tracking':
        return <OrderTracking />;
      case 'customer':
        return <CustomerArea />;
      default:
        return <Menu />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && state.currentView !== 'tracking' && state.currentView !== 'customer' && <Header />}
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