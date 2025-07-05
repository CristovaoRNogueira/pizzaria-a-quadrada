import React, { useState } from 'react';
import { Save, Store, Phone, Instagram, MapPin, Mail } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { EstablishmentInfo } from '../types';

const EstablishmentSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState<EstablishmentInfo>(
    state.businessSettings.establishment || {
      name: 'Pizzaria a Quadrada',
      phone: '+55 77 99974-2491',
      instagram: '@pizzariaquadrada',
      address: 'Rua das Pizzas, 123 - Centro, Vitória da Conquista - BA',
      email: 'contato@pizzariaquadrada.com'
    }
  );

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_ESTABLISHMENT_SETTINGS',
      payload: settings
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Informações do estabelecimento atualizadas!'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Store className="h-6 w-6 text-red-600" />
        <h3 className="text-xl font-semibold text-gray-800">Informações do Estabelecimento</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Store className="h-4 w-4 inline mr-1" />
              Nome do Estabelecimento
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Nome da sua pizzaria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-1" />
              Telefone/WhatsApp
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="+55 77 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              E-mail
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="contato@pizzaria.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Instagram className="h-4 w-4 inline mr-1" />
              Instagram
            </label>
            <input
              type="text"
              value={settings.instagram}
              onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="@pizzaria"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Endereço Completo
          </label>
          <textarea
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Rua, número, bairro, cidade - estado, CEP"
          />
        </div>

        {/* Preview das Informações */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Preview das Informações:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-gray-600" />
              <span className="font-medium">{settings.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-600" />
              <span>{settings.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-600" />
              <span>{settings.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Instagram className="h-4 w-4 text-gray-600" />
              <span>{settings.instagram}</span>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
              <span>{settings.address}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Informações</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentSettings;