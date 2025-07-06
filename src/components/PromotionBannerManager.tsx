import React, { useState } from 'react';
import { Save, Eye, EyeOff, Megaphone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const PromotionBannerManager: React.FC = () => {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState({
    active: state.businessSettings.promotionBanner?.active || false,
    title: state.businessSettings.promotionBanner?.title || '',
    message: state.businessSettings.promotionBanner?.message || '',
    color: state.businessSettings.promotionBanner?.color || '#dc2626'
  });

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PROMOTION_BANNER',
      payload: settings
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Banner de promoção atualizado com sucesso!'
    });
  };

  const presetColors = [
    { name: 'Vermelho', value: '#dc2626' },
    { name: 'Azul', value: '#2563eb' },
    { name: 'Verde', value: '#16a34a' },
    { name: 'Laranja', value: '#ea580c' },
    { name: 'Roxo', value: '#9333ea' },
    { name: 'Rosa', value: '#e11d48' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Megaphone className="h-6 w-6 text-red-600" />
        <h3 className="text-xl font-semibold text-gray-800">Banner de Promoção</h3>
      </div>

      <div className="space-y-6">
        {/* Toggle Ativo/Inativo */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">Status do Banner</h4>
            <p className="text-sm text-gray-600">Exibir banner no topo do cardápio</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, active: !settings.active })}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
              settings.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {settings.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {settings.active ? 'Ativo' : 'Inativo'}
            </span>
          </button>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título da Promoção
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Ex: Promoção Especial!"
          />
        </div>

        {/* Mensagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem da Promoção
          </label>
          <textarea
            value={settings.message}
            onChange={(e) => setSettings({ ...settings, message: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Ex: Compre 2 pizzas grandes e ganhe 1 refrigerante grátis!"
          />
        </div>

        {/* Cor do Banner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cor do Banner
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSettings({ ...settings, color: color.value })}
                className={`w-full h-10 rounded-lg border-2 transition-all ${
                  settings.color === color.value ? 'border-gray-800 scale-105' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <input
            type="color"
            value={settings.color}
            onChange={(e) => setSettings({ ...settings, color: e.target.value })}
            className="w-full h-10 rounded-lg border border-gray-300"
          />
        </div>

        {/* Preview */}
        {(settings.title || settings.message) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pré-visualização
            </label>
            <div 
              className="p-4 rounded-lg text-white"
              style={{ backgroundColor: settings.color }}
            >
              {settings.title && (
                <h4 className="text-lg font-bold mb-2">{settings.title}</h4>
              )}
              {settings.message && (
                <p className="text-sm opacity-90">{settings.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Banner</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionBannerManager;