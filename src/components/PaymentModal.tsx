import React, { useState } from 'react';
import { X, QrCode, Copy, Check } from 'lucide-react';
import { PaymentInfo } from '../types';
import { useApp } from '../contexts/AppContext';

interface PaymentModalProps {
  amount: number;
  onSuccess: (paymentData: PaymentInfo) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, onSuccess, onClose }) => {
  const { state, dispatch } = useApp();
  const [pixCopied, setPixCopied] = useState(false);
  const [pixPaid, setPixPaid] = useState(false);

  const generatePixCode = () => {
    // Simulated PIX code generation
    const pixKey = state.businessSettings.payment.pixKey;
    const pixName = state.businessSettings.payment.pixName;
    return `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865802BR5925${pixName}6009SAO PAULO62070503***6304`;
  };

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(generatePixCode());
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
    }
  };

  const handlePixConfirm = () => {
    setPixPaid(true);
    onSuccess({
      method: 'pix',
      pixCode: generatePixCode(),
      pixPaid: true,
      pixTransactionId: `pix_manual_${Date.now()}`
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Pagamento PIX</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-red-600">R$ {amount.toFixed(2)}</p>
            <p className="text-gray-600">Total do pedido</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">QR Code PIX</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-600 mb-2">Código PIX:</p>
                <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                  {generatePixCode()}
                </p>
              </div>
              
              <button
                onClick={copyPixCode}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mb-4"
              >
                {pixCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{pixCopied ? 'Copiado!' : 'Copiar Código PIX'}</span>
              </button>
              
              <p className="text-sm text-gray-600 mb-4">
                Após realizar o pagamento, clique em "Confirmar Pagamento"
              </p>
              
              {!pixPaid ? (
                <button
                  onClick={handlePixConfirm}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Confirmar Pagamento PIX
                </button>
              ) : (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">✅ Pagamento PIX Confirmado!</p>
                    <p className="text-green-600 text-sm">Processando pedido...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;