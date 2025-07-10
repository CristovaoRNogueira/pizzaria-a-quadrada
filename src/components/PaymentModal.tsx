import React, { useState } from 'react';
import { X, CreditCard, QrCode, Copy, Check } from 'lucide-react';
import { PaymentInfo } from '../types';
import { useApp } from '../contexts/AppContext';

interface PaymentModalProps {
  amount: number;
  onSuccess: (paymentData: PaymentInfo) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, onSuccess, onClose }) => {
  const { state } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [pixCopied, setPixCopied] = useState(false);
  const [pixPaid, setPixPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [pixPaymentStatus, setPixPaymentStatus] = useState<'pending' | 'checking' | 'confirmed' | 'failed'>('pending');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

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

  const handlePixPayment = () => {
    setPixPaymentStatus('checking');
    setCheckingPayment(true);
    
    // Note: dispatch is not available in this component context
    // This would need to be passed as a prop or use a different notification method
    
    // Simular verificação automática de pagamento PIX
    setTimeout(() => {
      // Simular resposta da API de verificação PIX
      const paymentConfirmed = Math.random() > 0.3; // 70% de chance de sucesso
      
      if (paymentConfirmed) {
        setPixPaymentStatus('confirmed');
        setPixPaid(true);
        setCheckingPayment(false);
        
        // Note: dispatch is not available in this component context
        
        setTimeout(() => {
          onSuccess({
            method: 'pix',
            pixCode: generatePixCode(),
            pixPaid: true,
            pixTransactionId: `pix_${Date.now()}`
          });
        }, 1500);
      } else {
        setPixPaymentStatus('failed');
        setCheckingPayment(false);
        
        // Note: dispatch is not available in this component context
      }
    }, 4000); // Simular tempo de verificação
  };

  const handlePixConfirm = () => {
    setPixPaymentStatus('confirmed');
    onSuccess({
      method: 'pix',
      pixCode: generatePixCode(),
      pixPaid: true,
      pixTransactionId: `pix_manual_${Date.now()}`
    });
  };

  const handleCardPayment = async () => {
    // Simulate Stripe payment processing
    try {
      // In a real implementation, you would use Stripe's API here
      const paymentIntentId = `pi_${Date.now()}`;
      
      onSuccess({
        method: 'cartao',
        stripePaymentIntentId: paymentIntentId
      });
    } catch (error) {
      console.error('Erro no pagamento:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Pagamento</h3>
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

          {/* Payment Method Selection */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setPaymentMethod('pix')}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                paymentMethod === 'pix'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <QrCode className="h-5 w-5" />
              <span>PIX</span>
            </button>
            <button
              onClick={() => setPaymentMethod('cartao')}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                paymentMethod === 'cartao'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Cartão</span>
            </button>
          </div>

          {paymentMethod === 'pix' ? (
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
                  <div className="space-y-3">
                    <button
                      onClick={handlePixPayment}
                      disabled={checkingPayment}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      {checkingPayment ? 'Verificando Pagamento...' : 'Simular Pagamento PIX'}
                    </button>
                    
                    <button
                      onClick={handlePixConfirm}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Confirmar Pagamento Manual
                    </button>
                  </div>
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
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    placeholder="MM/AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardData.cvc}
                    onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  placeholder="Nome como está no cartão"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleCardPayment}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pagar R$ {amount.toFixed(2)}</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Seus dados estão protegidos com criptografia SSL
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;