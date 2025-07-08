import React, { useState } from 'react';
import { Plus, ShoppingCart, Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Pizza, Additional } from '../types';
import AdditionalsModal from './AdditionalsModal';

interface PizzaCardProps {
  pizza: Pizza;
  businessOpen: boolean;
}

const PizzaCard: React.FC<PizzaCardProps> = ({ pizza, businessOpen }) => {
  const { dispatch } = useApp();
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | 'family'>('medium');
  const [showAdditionals, setShowAdditionals] = useState(false);

  const getSizeLabel = (size: string) => {
    const labels = {
      small: 'Pequena',
      medium: 'Média',
      large: 'Grande',
      family: 'Família'
    };
    return labels[size as keyof typeof labels] || size;
  };

  const getSizePrice = (size: string) => {
    switch (size) {
      case 'small': return pizza.sizes.small || pizza.sizes.medium;
      case 'medium': return pizza.sizes.medium;
      case 'large': return pizza.sizes.large;
      case 'family': return pizza.sizes.family;
      default: return pizza.sizes.medium;
    }
  };

  const handleAddToCart = (additionals: Additional[] = [], notes: string = '') => {
    if (!businessOpen) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pizzaria fechada no momento!'
      });
      return;
    }

    const cartItem = {
      ...pizza,
      quantity: 1,
      selectedSize,
      selectedFlavors: [pizza],
      selectedAdditionals: additionals,
      notes,
      price: getSizePrice(selectedSize)
    };

    dispatch({
      type: 'ADD_TO_CART',
      payload: cartItem
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: `${pizza.name} adicionada ao carrinho!`
    });

    setShowAdditionals(false);
  };

  const handleQuickAdd = () => {
    if (pizza.category === 'bebida') {
      handleAddToCart();
    } else {
      setShowAdditionals(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={pizza.image}
            alt={pizza.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute top-3 right-3">
            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {pizza.category === 'quadrada' && '🟨'}
              {pizza.category === 'redonda' && '🔴'}
              {pizza.category === 'doce' && '🍰'}
              {pizza.category === 'bebida' && '🥤'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
            {pizza.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {pizza.description}
          </p>

          {/* Ingredients */}
          {pizza.ingredients.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {pizza.ingredients.slice(0, 3).map((ingredient, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {ingredient}
                  </span>
                ))}
                {pizza.ingredients.length > 3 && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                    +{pizza.ingredients.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

{/* Size Selection for non-beverages */}
{pizza.category !== 'bebida' && (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-700 mb-1">
      Tamanho:
    </label>
    <div className="flex gap-1 flex-wrap">
      {(['small', 'medium', 'large', 'family'] as const).map((sizeKey) => {
        const price = pizza.sizes[sizeKey];
        if (!price) return null;

        return (
          <button
            key={sizeKey}
            type="button"
            onClick={() => setSelectedSize(sizeKey)}
            className={`w-8 h-8 text-sm flex items-center justify-center rounded-lg border font-semibold ${
              selectedSize === sizeKey
                ? 'bg-red-500 text-white border-red-500'
                : 'border-red-300 text-gray-700 hover:bg-red-100'
            }`}
            title={getSizeLabel(sizeKey)}
          >
            {getSizeLabel(sizeKey)[0]}
          </button>
        );
      })}
    </div>
  </div>
)}



          {/* Price and Add Button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-red-600">
                R$ {getSizePrice(selectedSize).toFixed(2)}
              </span>
              {pizza.category !== 'bebida' && (
                <p className="text-xs text-gray-500">
                  {getSizeLabel(selectedSize)}
                </p>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={!businessOpen}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                businessOpen
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">
                {pizza.category === 'bebida' ? 'Adicionar' : 'Adicionar'}
              </span>
            </button>
          </div>

          {!businessOpen && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Pizzaria fechada
            </p>
          )}
        </div>
      </div>

      {/* Additionals Modal */}
      {showAdditionals && (
        <AdditionalsModal
          item={{
            ...pizza,
            selectedSize,
            price: getSizePrice(selectedSize)
          }}
          onClose={() => setShowAdditionals(false)}
          onSave={handleAddToCart}
        />
      )}
    </>
  );
};

export default PizzaCard;