import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const BeverageSuggestions: React.FC = () => {
  const { state, dispatch } = useApp();
  
  if (!state.showBeverageSuggestions) return null;
  
  const beverages = state.pizzas.filter(item => item.category === 'bebida');
  
  const handleAddBeverage = (beverage: any) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        ...beverage,
        quantity: 1,
        selectedSize: 'medium' as const,
        price: beverage.sizes.medium
      }
    });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: `${beverage.name} adicionada ao carrinho!`
    });
  };
  
  const handleClose = () => {
    dispatch({ type: 'HIDE_BEVERAGE_SUGGESTIONS' });
  };
  
  const handleFinishOrder = () => {
    dispatch({ type: 'HIDE_BEVERAGE_SUGGESTIONS' });
    dispatch({ type: 'SET_VIEW', payload: 'cart' });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Que tal uma bebida?</h3>
            <p className="text-gray-600">Complemente seu pedido com uma bebida gelada!</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {beverages.map(beverage => (
              <div key={beverage.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <img 
                    src={beverage.image} 
                    alt={beverage.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{beverage.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{beverage.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-red-600">
                        R$ {beverage.sizes.medium.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddBeverage(beverage)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Não, obrigado
            </button>
            <button
              onClick={handleFinishOrder}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors rounded-lg"
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeverageSuggestions;