import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const OrderSuccess: React.FC = () => {
  const { dispatch } = useApp();

  const handleBackToMenu = () => {
    dispatch({ type: 'SET_CURRENT_ORDER', payload: null });
    dispatch({ type: 'SHOW_ORDER_SUCCESS', payload: false });
    dispatch({ type: 'SET_VIEW', payload: 'menu' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pedido Recebido!
          </h1>
          <p className="text-gray-600">
            Obrigado pela preferência!
          </p>
        </div>

        {/* Simple message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">
            Seu pedido foi registrado com sucesso!
          </p>
          <p className="text-green-700 text-sm mt-1">
            Em breve entraremos em contato para confirmar os detalhes.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBackToMenu}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Cardápio</span>
        </button>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Dúvidas? Entre em contato:
          </p>
          <p className="text-sm font-medium text-gray-700">
            📞 (77) 99974-2491
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;