import React, { useState, useEffect } from 'react';
import { Clock, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { BusinessHours } from '../types';

const BusinessHoursManager: React.FC = () => {
  const { state, dispatch } = useApp();
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(state.businessSettings.businessHours);
  const [closedMessage, setClosedMessage] = useState(state.businessSettings.closedMessage);
  const [isOpen, setIsOpen] = useState(state.businessSettings.isOpen);

  // Sincronizar com o estado global quando ele mudar
  useEffect(() => {
    setBusinessHours(state.businessSettings.businessHours);
    setClosedMessage(state.businessSettings.closedMessage);
    setIsOpen(state.businessSettings.isOpen);
  }, [state.businessSettings]);

  const handleDayToggle = (index: number) => {
    const updated = [...businessHours];
    updated[index].isOpen = !updated[index].isOpen;
    setBusinessHours(updated);
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const updated = [...businessHours];
    updated[index][field] = value;
    setBusinessHours(updated);
  };

  const handleSave = () => {
    const settingsToSave = {
      businessHours,
      isOpen,
      closedMessage
    };
    
    dispatch({
      type: 'UPDATE_BUSINESS_SETTINGS',
      payload: settingsToSave
    });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Configurações de horário salvas com sucesso!'
    });
    
    console.log('Configurações salvas:', settingsToSave);
  };

  const isCurrentlyOpen = () => {
    if (!isOpen) return false;
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Mapear dia da semana para nome
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const todayName = dayNames[currentDay];
    
    const todaySettings = businessHours.find(day => day.day === todayName);
    
    if (!todaySettings || !todaySettings.isOpen) return false;
    
    // Verificar se o horário atual está dentro do horário de funcionamento
    const openTime = todaySettings.openTime;
    const closeTime = todaySettings.closeTime;
    
    // Converter horários para minutos para comparação mais fácil
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const currentMinutes = timeToMinutes(currentTime);
    const openMinutes = timeToMinutes(openTime);
    const closeMinutes = timeToMinutes(closeTime);
    
    // Se o horário de fechamento é menor que o de abertura, significa que fecha no dia seguinte
    if (closeMinutes < openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    } else {
      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }
  };

  const getCurrentStatus = () => {
    if (!isOpen) {
      return { status: 'Fechado (Desabilitado)', color: 'text-red-800', bgColor: 'bg-red-50', borderColor: 'border-red-400' };
    }
    
    if (isCurrentlyOpen()) {
      return { status: '🟢 Aberto para pedidos', color: 'text-green-800', bgColor: 'bg-green-50', borderColor: 'border-green-400' };
    } else {
      return { status: '🔴 Fechado (Fora do horário)', color: 'text-red-800', bgColor: 'bg-red-50', borderColor: 'border-red-400' };
    }
  };

  const currentStatus = getCurrentStatus();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Horários de Funcionamento</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Pizzaria:</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isOpen ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              <span className="text-sm font-medium">
                {isOpen ? 'Habilitada' : 'Desabilitada'}
              </span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className={`p-4 rounded-lg border-l-4 ${currentStatus.bgColor} ${currentStatus.borderColor}`}>
            <p className={`font-medium ${currentStatus.color}`}>
              Status Atual: {currentStatus.status}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Configurações salvas: {state.businessSettings.isOpen ? 'Habilitada' : 'Desabilitada'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {businessHours.map((day, index) => (
            <div key={day.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleDayToggle(index)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                    day.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {day.isOpen ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <span className="font-medium text-gray-800 w-32">{day.day}</span>
              </div>
              
              {day.isOpen ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Abre:</label>
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Fecha:</label>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-gray-500 italic">Fechado</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem quando fechado:
          </label>
          <textarea
            value={closedMessage}
            onChange={(e) => setClosedMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Digite a mensagem que será exibida quando a pizzaria estiver fechada..."
          />
        </div>

        <div className="mt-6 flex justify-end">
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

export default BusinessHoursManager;