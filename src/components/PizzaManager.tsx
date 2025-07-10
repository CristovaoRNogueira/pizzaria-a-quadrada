import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Pizza as PizzaIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Pizza } from '../types';

const PizzaManager: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: 'quadrada' as Pizza['category'],
    ingredients: [] as string[],
    sizes: {
      small: 0,
      medium: 0,
      large: 0,
      family: 0
    }
  });
  const [ingredientInput, setIngredientInput] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      category: 'quadrada',
      ingredients: [],
      sizes: {
        small: 0,
        medium: 0,
        large: 0,
        family: 0
      }
    });
    setIngredientInput('');
    setEditingPizza(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPizza) {
      dispatch({
        type: 'UPDATE_PIZZA',
        payload: {
          ...editingPizza,
          ...formData,
          price: formData.sizes.medium
        }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pizza atualizada com sucesso!'
      });
    } else {
      const newPizza: Pizza = {
        id: Date.now(),
        ...formData,
        price: formData.sizes.medium
      };
      dispatch({
        type: 'ADD_PIZZA',
        payload: newPizza
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pizza criada com sucesso!'
      });
    }
    
    resetForm();
  };

  const handleEdit = (pizza: Pizza) => {
    setEditingPizza(pizza);
    setFormData({
      name: pizza.name,
      description: pizza.description,
      image: pizza.image,
      category: pizza.category,
      ingredients: pizza.ingredients,
      sizes: pizza.sizes
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta pizza?')) {
      dispatch({
        type: 'DELETE_PIZZA',
        payload: id
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pizza excluída com sucesso!'
      });
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && !formData.ingredients.includes(ingredientInput.trim())) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()]
      });
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing !== ingredient)
    });
  };

  const getCategoryLabel = (category: Pizza['category']) => {
    const labels = {
      quadrada: 'Quadrada',
      redonda: 'Redonda',
      doce: 'Doce',
      bebida: 'Bebida'
    };
    return labels[category];
  };

  const getCategoryColor = (category: Pizza['category']) => {
    const colors = {
      quadrada: 'bg-yellow-100 text-yellow-800',
      redonda: 'bg-red-100 text-red-800',
      doce: 'bg-pink-100 text-pink-800',
      bebida: 'bg-blue-100 text-blue-800'
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <PizzaIcon className="h-6 w-6 text-red-600" />
          <h3 className="text-xl font-semibold text-gray-800">Gerenciar Pizzas</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Pizza</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h4 className="text-lg font-semibold text-gray-800">
                {editingPizza ? 'Editar Pizza' : 'Nova Pizza'}
              </h4>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Margherita"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Pizza['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="quadrada">Pizza Quadrada</option>
                    <option value="redonda">Pizza Redonda</option>
                    <option value="doce">Pizza Doce</option>
                    <option value="bebida">Bebida</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva os ingredientes e características da pizza..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredientes
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Digite um ingrediente"
                  />
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{ingredient}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preços (R$) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Pequena</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.sizes.small || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        sizes: { ...formData.sizes, small: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Média *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.sizes.medium}
                      onChange={(e) => setFormData({
                        ...formData,
                        sizes: { ...formData.sizes, medium: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Grande *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.sizes.large}
                      onChange={(e) => setFormData({
                        ...formData,
                        sizes: { ...formData.sizes, large: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Família *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.sizes.family}
                      onChange={(e) => setFormData({
                        ...formData,
                        sizes: { ...formData.sizes, family: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingPizza ? 'Atualizar' : 'Criar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pizzas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.pizzas.map((pizza) => (
          <div key={pizza.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img
                src={pizza.image}
                alt={pizza.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(pizza.category)}`}>
                  {getCategoryLabel(pizza.category)}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{pizza.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pizza.description}</p>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Preços:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {pizza.sizes.small && <span>P: R$ {pizza.sizes.small.toFixed(2)}</span>}
                  <span>M: R$ {pizza.sizes.medium.toFixed(2)}</span>
                  <span>G: R$ {pizza.sizes.large.toFixed(2)}</span>
                  <span>F: R$ {pizza.sizes.family.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleEdit(pizza)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(pizza.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.pizzas.length === 0 && (
        <div className="text-center py-12">
          <PizzaIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma pizza cadastrada
          </h3>
          <p className="text-gray-500 mb-4">
            Comece criando sua primeira pizza para o cardápio.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Criar Primeira Pizza
          </button>
        </div>
      )}
    </div>
  );
};

export default PizzaManager;