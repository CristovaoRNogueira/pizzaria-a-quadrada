import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface Additional {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface AdditionalsModalProps {
  item: any;
  onClose: () => void;
  onSave: (additionals: Additional[], notes: string) => void;
}

const AdditionalsModal: React.FC<AdditionalsModalProps> = ({ item, onClose, onSave }) => {
  const [selectedAdditionals, setSelectedAdditionals] = useState<Additional[]>([]);
  const [notes, setNotes] = useState('');

  // Mock additionals data - in a real app this would come from the backend
  const availableAdditionals: Additional[] = [
    { id: '1', name: 'Queijo Extra', price: 3.00, category: 'Queijos' },
    { id: '2', name: 'Ovo', price: 2.50, category: 'Outros' },
    { id: '3', name: 'Bacon', price: 4.00, category: 'Carnes' },
    { id: '4', name: 'Tomate', price: 1.50, category: 'Vegetais' },
  ];

  const categories = ['Queijos', 'Carnes', 'Vegetais', 'Outros'];

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

  const handleSave = () => {
    onSave(selectedAdditionals, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Personalizar Pizza</h3>
            <p className="text-gray-600 text-sm">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Adicionais */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Adicionais</h4>
            
            {categories.map(category => {
              const categoryAdditionals = availableAdditionals.filter(a => a.category === category);
              
              if (categoryAdditionals.length === 0) return null;
              
              return (
                <div key={category} className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">{category}</h5>
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
              <span className="font-medium">Pizza {item.name}</span>
              <span>R$ {item.price.toFixed(2)}</span>
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
                R$ {(item.price + getTotalAdditionalPrice()).toFixed(2)}
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
              onClick={handleSave}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalsModal;