import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <header className="bg-red-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'menu' })}
          >
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">PIZZARIA</h1>
              <h2 className="text-2xl font-bold text-white">QUADRADA</h2>
              <p className="text-red-100 text-sm">A qualidade é nossa diferença</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'cart' })}
              className="relative bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-red-900 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;