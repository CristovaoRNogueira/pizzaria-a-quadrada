import React, { useState } from 'react';
import { X, Check, Pizza as PizzaIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Pizza, Additional } from '../types';

interface FlavorSelectionModalProps {
  pizza: Pizza;
  selectedSize: 'small' | 'medium' | 'large' | 'family';
  onClose: () => void;
  onConfirm: (selectedFlavors: Pizza[], additionals: Additional[], notes: string) => void;
}

const FlavorSelectionModal: React.FC<FlavorSelectionModalProps> = ({
  pizza,
  selectedSize,
  onClose,
  onConfirm
}) => {
  const { state } = useApp();
  const [selectedFlavors, setSelectedFlavors] = useState<Pizza[]>([pizza]);
  const [selectedAdditionals, setSelectedAdditionals] = useState<Additional[]>([]);
  const [notes, setNotes] = useState('');

  // Definir regras de sabores por categoria e tamanho
  const getMaxFlavors = () => {
    if (pizza.category === 'quadrada') {
      switch (selectedSize) {
        case 'small': return 2;
        case 'medium': return 2;
        case 'large': return 2;
        case 'family': return 4;
        default: return 1;
      }
    } else if (pizza.category === 'redonda') {
      switch (selectedSize) {
        case 'small': return 1;
        case 'medium': return 3;
        case 'large': return 3;
        case 'family': return 3;
        default: return 1;
      }
    }
    return 1; // Para doces e bebidas
  };

  const maxFlavors = getMaxFlavors();

  // Filtrar pizzas da mesma categoria (exceto bebidas e doces)
  const availableFlavors = state.pizzas.filter(p => 
    p.category === pizza.category && 
    p.category !== 'bebida' && 
    p.category !== 'doce'
  );

  // Mock additionals data - em uma aplicação real viria do backend
  const availableAdditionals: Additional[] = [
    { id: '1', name: 'Queijo Extra', price: 3.00, category: 'queijo', description: 'Porção extra de mussarela', isActive: true },
    { id: '2', name: 'Ovo', price: 2.50, category: 'outros', description: 'Ovo frito', isActive: true },
    { id: '3', name: 'Bacon', price: 4.00, category: 'carne', description: 'Fatias de bacon crocante', isActive: true },
    { id: '4', name: 'Tomate', price: 1.50, category: 'vegetal', description: 'Fatias de tomate fresco', isActive: true },
    { id: '5', name: 'Cebola Extra', price: 2.00, category: 'vegetal', description: 'Porção extra de cebola', isActive: true },
    { id: '6', name: 'Azeitona', price: 4.00, category: 'vegetal', description: 'Azeitonas pretas', isActive: true },
  ];

  const categories = ['queijo', 'carne', 'vegetal', 'outros'];

  const handleFlavorToggle = (flavor: Pizza) => {
    const isSelected = selectedFlavors.some(f => f.id === flavor.id);
    
    if (isSelected) {
      // Não permitir remover se for o único sabor
      if (selectedFlavors.length > 1) {
        setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavor.id));
      }
    } else {
      // Adicionar apenas se não exceder o limite
      if (selectedFlavors.length < maxFlavors) {
        setSelectedFlavors([...selectedFlavors, flavor]);
      }
    }
  };

  const handleAdditionalToggle = (additional: Additional) => {
    const isSelected = selectedAdditionals.some(a => a.id === additional.id);
    
    if (isSelected) {
      setSelectedAdditionals(selectedAdditionals.filter(a => a.id !== additional.id));
    } else {
      setSelectedAdditionals([...selectedAdditionals, additional]);
    }
  };

  const getTotalAdditionalPrice = () => {
    return selectedAdditionals.reduce((sum, additional) => sum + additional.price, 0);
  };

  const getSizeLabel = (size: string) => {
    const labels = {
      small: 'Pequena',
      medium: 'Média',
      large: 'Grande',
      family: 'Família'
    };
    return labels[size as keyof typeof labels] || size;
  };

  const handleConfirm = () => {
    onConfirm(selectedFlavors, selectedAdditionals, notes);
  };

  // Se for bebida ou doce, ou se só permite 1 sabor, pular modal
  if (pizza.category === 'bebida' || pizza.category === 'doce' || maxFlavors === 1) {
    // Para bebidas, doces ou pizzas de 1 sabor, ainda mostrar opções de adicionais
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Personalizar Pedido</h3>
              <p className="text-gray-600 text-sm">{pizza.name} - {getSizeLabel(selectedSize)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Adicionais apenas para pizzas */}
            {(pizza.category === 'quadrada' || pizza.category === 'redonda') && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Adicionais</h4>
                
                {categories.map(category => {
                  const categoryAdditionals = availableAdditionals.filter(a => a.category === category);
                  
                  if (categoryAdditionals.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2 capitalize">{category}s</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryAdditionals.map(additional => {
                          const isSelected = selectedAdditionals.some(a => a.id === additional.id);
                          
                          return (
                            <button
                              key={additional.id}
                              onClick={() => handleAdditionalToggle(additional)}
                              className={`p-3 rounded-lg border-2 transition-colors text-left ${
                                isSelected
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{additional.name}</span>
                                <span className="text-sm">+R$ {additional.price.toFixed(2)}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                maxLength={200}
                placeholder="Ex: sem borda, retirar cebola, massa fina..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {notes.length}/200 caracteres
              </p>
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{pizza.name} - {getSizeLabel(selectedSize)}</span>
                <span>R$ {pizza.price.toFixed(2)}</span>
              </div>
              
              {selectedAdditionals.map(additional => (
                <div key={additional.id} className="flex justify-between items-center text-sm text-gray-600">
                  <span>+ {additional.name}</span>
                  <span>R$ {additional.price.toFixed(2)}</span>
                </div>
              ))}
              
              <div className="border-t pt-2 mt-2 flex justify-between items-center font-bold">
                <span>Total</span>
                <span className="text-red-600">
                  R$ {(pizza.price + getTotalAdditionalPrice()).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Escolher Sabores</h3>
            <p className="text-gray-600 text-sm">
              Pizza {getSizeLabel(selectedSize)} - Escolha até {maxFlavors} sabor{maxFlavors > 1 ? 'es' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seleção de Sabores */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Sabores Disponíveis</h4>
              <div className="text-sm text-gray-600">
                {selectedFlavors.length}/{maxFlavors} selecionados
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableFlavors.map(flavor => {
                const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                const canSelect = selectedFlavors.length < maxFlavors || isSelected;
                
                return (
                  <button
                    key={flavor.id}
                    onClick={() => handleFlavorToggle(flavor)}
                    disabled={!canSelect}
                    className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : canSelect
                        ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <img
                        src={flavor.image}
                        alt={flavor.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{flavor.name}</h5>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {flavor.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Adicionais */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Adicionais</h4>
            
            {categories.map(category => {
              const categoryAdditionals = availableAdditionals.filter(a => a.category === category);
              
              if (categoryAdditionals.length === 0) return null;
              
              return (
                <div key={category} className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2 capitalize">{category}s</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryAdditionals.map(additional => {
                      const isSelected = selectedAdditionals.some(a => a.id === additional.id);
                      
                      return (
                        <button
                          key={additional.id}
                          onClick={() => handleAdditionalToggle(additional)}
                          className={`p-3 rounded-lg border-2 transition-colors text-left ${
                            isSelected
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{additional.name}</span>
                            <span className="text-sm">+R$ {additional.price.toFixed(2)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
              maxLength={200}
              placeholder="Ex: sem borda, retirar cebola, massa fina..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/200 caracteres
            </p>
          </div>

          {/* Resumo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Pizza {getSizeLabel(selectedSize)}</span>
              <span>R$ {pizza.price.toFixed(2)}</span>
            </div>
            
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-700 mb-1">Sabores:</p>
              {selectedFlavors.map((flavor, index) => (
                <p key={flavor.id} className="text-sm text-gray-600">
                  {index + 1}. {flavor.name}
                </p>
              ))}
            </div>
            
            {selectedAdditionals.map(additional => (
              <div key={additional.id} className="flex justify-between items-center text-sm text-gray-600">
                <span>+ {additional.name}</span>
                <span>R$ {additional.price.toFixed(2)}</span>
              </div>
            ))}
            
            <div className="border-t pt-2 mt-2 flex justify-between items-center font-bold">
              <span>Total</span>
              <span className="text-red-600">
                R$ {(pizza.price + getTotalAdditionalPrice()).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedFlavors.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlavorSelectionModal;