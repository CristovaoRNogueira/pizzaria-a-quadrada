import React, { useState } from 'react';
import { Save, CreditCard, QrCode, Banknote, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { defaultPaymentSettings } from '../contexts/AppContext';
import { PaymentSettings as PaymentSettingsType } from '../types';

const PaymentSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState<PaymentSettingsType>(
    state.businessSettings.payment || defaultPaymentSettings
  );

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PAYMENT_SETTINGS',
      payload: settings
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Configurações de pagamento atualizadas!'
    });
  };

  const togglePaymentMethod = (method: 'acceptCash' | 'acceptPix' | 'acceptCard') => {
    setSettings({
      ...settings,
      [method]: !settings[method]
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <CreditCard className="h-6 w-6 text-red-600" />
        <h3 className="text-xl font-semibold text-gray-800">Configurações de Pagamento</h3>
      </div>

      <div className="space-y-6">
        {/* Payment Methods */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-4">Métodos de Pagamento Aceitos</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Banknote className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">Dinheiro</p>
                  <p className="text-sm text-gray-600">Pagamento em espécie na entrega</p>
                </div>
              </div>
              <button
                onClick={() => togglePaymentMethod('acceptCash')}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                  settings.acceptCash ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {settings.acceptCash ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                <span className="text-sm font-medium">
                  {settings.acceptCash ? 'Ativo' : 'Inativo'}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <QrCode className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">PIX</p>
                  <p className="text-sm text-gray-600">Pagamento instantâneo via PIX</p>
                </div>
              </div>
              <button
                onClick={() => togglePaymentMethod('acceptPix')}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                  settings.acceptPix ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {settings.acceptPix ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                <span className="text-sm font-medium">
                  {settings.acceptPix ? 'Ativo' : 'Inativo'}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-800">Cartão de Crédito</p>
                  <p className="text-sm text-gray-600">Pagamento via Stripe</p>
                </div>
              </div>
              <button
                onClick={() => togglePaymentMethod('acceptCard')}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                  settings.acceptCard ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {settings.acceptCard ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                <span className="text-sm font-medium">
                  {settings.acceptCard ? 'Ativo' : 'Inativo'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* PIX Settings */}
        {settings.acceptPix && (
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-4">Configurações PIX</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={settings.pixKey}
                  onChange={(e) => setSettings({ ...settings, pixKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="CPF, CNPJ, email ou telefone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Beneficiário
                </label>
                <input
                  type="text"
                  value={settings.pixName}
                  onChange={(e) => setSettings({ ...settings, pixName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nome ou razão social"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stripe Settings */}
        {settings.acceptCard && (
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-4">Configurações Stripe</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave Pública (Publishable Key)
                </label>
                <input
                  type="text"
                  value={settings.stripePublishableKey}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave Secreta (Secret Key)
                </label>
                <input
                  type="password"
                  value={settings.stripeSecretKey}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="sk_test_..."
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Para usar pagamentos com cartão, você precisa configurar uma conta no Stripe e obter suas chaves de API.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;