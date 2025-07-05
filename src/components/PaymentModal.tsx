import React, { useState, useEffect } from 'react';
import { X, CreditCard, QrCode, Copy, Check, Clock, AlertCircle } from 'lucide-react';
import { PaymentInfo } from '../types';
import { useApp } from '../contexts/AppContext';

interface PaymentModalProps {
  amount: number;
  paymentMethod: 'pix' | 'cartao';
  onSuccess: (paymentData: PaymentInfo) => void;
  onClose: () => void;
  onPixCopied?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  amount, 
  paymentMethod, 
  onSuccess, 
  onClose,
  onPixCopied
}) => {
  const { state } = useApp();
  const [pixCopied, setPixCopied] = useState(false);
  const [pixPaid, setPixPaid] = useState(false);
  const [cardType, setCardType] = useState<'credito' | 'debito'>('credito');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [paymentTimer, setPaymentTimer] = useState(0);
  const [showPixInstructions, setShowPixInstructions] = useState(true);

  // Timer para simular verificação de pagamento PIX
  useEffect(() => {
    if (paymentMethod === 'pix' && paymentTimer > 0) {
      const interval = setInterval(() => {
        setPaymentTimer(prev => {
          if (prev <= 1) {
            // Simular confirmação automática do PIX após 30 segundos
            if (!pixPaid) {
              setPixPaid(true);
              setTimeout(() => {
                handlePixPayment();
              }, 1000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [paymentTimer, paymentMethod, pixPaid]);

  const generatePixCode = () => {
    const pixKey = state.businessSettings.payment.pixKey;
    const pixName = state.businessSettings.payment.pixName;
    const timestamp = Date.now().toString();
    return `00020126580014BR.GOV.BCB.PIX0136${pixKey}520400005303986540${amount.toFixed(2)}5802BR5925${pixName}6009SAO PAULO62070503${timestamp.slice(-3)}6304`;
  };

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(generatePixCode());
      setPixCopied(true);
      setPaymentTimer(30); // Iniciar timer de 30 segundos
      setShowPixInstructions(false);
      if (onPixCopied) {
        onPixCopied();
      }
      setTimeout(() => setPixCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
    }
  };

  const handlePixPayment = () => {
    onSuccess({
      method: 'pix',
      pixCode: generatePixCode(),
      pixPaid: true,
      pixCopied: true
    });
  };

  const handleCardPayment = async () => {
    // Validar dados do cartão
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
      alert('Preencha todos os dados do cartão');
      return;
    }

    try {
      // Simular processamento do cartão
      const paymentIntentId = `pi_${Date.now()}_${cardType}`;
      
      onSuccess({
        method: 'cartao',
        cardType: cardType,
        stripePaymentIntentId: paymentIntentId
      });
    } catch (error) {
      console.error('Erro no pagamento:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {paymentMethod === 'pix' ? 'Pagamento PIX' : 'Pagamento Cartão'}
          </h3>
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

          {paymentMethod === 'pix' ? (
            <div className="space-y-4">
              {showPixInstructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Como pagar com PIX:</h4>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Copie o código PIX abaixo</li>
                        <li>2. Abra o app do seu banco</li>
                        <li>3. Escolha a opção PIX Copia e Cola</li>
                        <li>4. Cole o código e confirme o pagamento</li>
                        <li>5. Aguarde a confirmação automática</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">QR Code PIX</p>
                  {paymentTimer > 0 && (
                    <div className="mt-2 flex items-center justify-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-600">
                        Aguardando pagamento: {formatTime(paymentTimer)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-gray-600 mb-2">Código PIX:</p>
                  <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                    {generatePixCode()}
                  </p>
                </div>
                
                {!pixPaid ? (
                  <>
                    <button
                      onClick={copyPixCode}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mb-4"
                    >
                      {pixCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{pixCopied ? 'Código Copiado!' : 'Copiar Código PIX'}</span>
                    </button>
                    
                    {pixCopied && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          ⚠️ <strong>Importante:</strong> Realize o pagamento PIX antes de finalizar o pedido. 
                          A confirmação será automática em alguns segundos após o pagamento.
                        </p>
                      </div>
                    )}
                    
                    <button
                      onClick={handlePixPayment}
                      disabled={!pixCopied}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      {pixCopied ? 'Já Paguei - Confirmar' : 'Copie o código PIX primeiro'}
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">Pagamento Confirmado!</p>
                      <p className="text-green-600 text-sm">PIX recebido com sucesso</p>
                    </div>
                    <button
                      onClick={handlePixPayment}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Finalizar Pedido
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tipo de Cartão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cartão
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardType('credito')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      cardType === 'credito'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('debito')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      cardType === 'debito'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Débito
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
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
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardData.cvc}
                    onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                    placeholder="123"
                    maxLength={4}
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
                <span>Pagar R$ {amount.toFixed(2)} no {cardType === 'credito' ? 'Crédito' : 'Débito'}</span>
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