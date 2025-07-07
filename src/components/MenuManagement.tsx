import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Pizza, PizzaSize, PizzaCategory } from '../types';
import { Plus, Edit2, Trash2, Save, X, Upload } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  image: string;
  category: PizzaCategory;
  ingredients: string[];
  sizes: PizzaSize;
}

const MenuManagement: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    image: '',
    category: 'tradicional',
    ingredients: [],
    sizes: { small: 0, medium: 0, large: 0 }
  });
  const [newIngredient, setNewIngredient] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      category: 'tradicional',
      ingredients: [],
      sizes: { small: 0, medium: 0, large: 0 }
    });
    setEditingPizza(null);
    setShowForm(false);
    setNewIngredient('');
  };

  const handleAddPizza = () => {
    if (!formData.name || !formData.description || !formData.image || !formData.category) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Preencha todos os campos obrigatórios!'
      });
      return;
    }

    // Verificar se já existe uma pizza com o mesmo nome
    const existingPizza = state.pizzas.find(pizza => 
      pizza.name.toLowerCase() === formData.name.toLowerCase() && pizza.id !== editingPizza?.id
    );

    if (existingPizza) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Já existe uma pizza com este nome no cardápio!'
      });
      return;
    }

    const newPizza: Pizza = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: formData.sizes.medium,
      image: formData.image,
      category: formData.category,
      ingredients: formData.ingredients,
      sizes: formData.sizes
    };

    dispatch({
      type: 'ADD_PIZZA',
      payload: newPizza
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Pizza adicionada com sucesso!'
    });

    resetForm();
  };

  const handleUpdatePizza = () => {
    if (!editingPizza || !formData.name || !formData.description || !formData.image || !formData.category) {
      return;
    }

    // Verificar se já existe uma pizza com o mesmo nome
    const existingPizza = state.pizzas.find(pizza => 
      pizza.name.toLowerCase() === formData.name.toLowerCase() && pizza.id !== editingPizza.id
    );

    if (existingPizza) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Já existe uma pizza com este nome no cardápio!'
      });
      return;
    }

    const updatedPizza: Pizza = {
      ...editingPizza,
      name: formData.name,
      description: formData.description,
      price: formData.sizes.medium,
      image: formData.image,
      category: formData.category,
      ingredients: formData.ingredients,
      sizes: formData.sizes
    };

    dispatch({
      type: 'UPDATE_PIZZA',
      payload: updatedPizza
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Pizza atualizada com sucesso!'
    });

    resetForm();
  };

  const handleEditPizza = (pizza: Pizza) => {
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

  const handleDeletePizza = (pizzaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pizza?')) {
      dispatch({
        type: 'DELETE_PIZZA',
        payload: pizzaId
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Pizza removida com sucesso!'
      });
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients.includes(newIngredient.trim())) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing !== ingredient)
    });
  };

  const categories: { value: PizzaCategory; label: string }[] = [
    { value: 'tradicional', label: 'Tradicional' },
    { value: 'especial', label: 'Especial' },
    { value: 'premium', label: 'Premium' },
    { value: 'doce', label: 'Doce' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Cardápio</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Pizza
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingPizza ? 'Editar Pizza' : 'Nova Pizza'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Pizza *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Margherita"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as PizzaCategory })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Descreva os ingredientes e características da pizza"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Imagem *
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://exemplo.com/imagem-pizza.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredientes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Digite um ingrediente"
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Pequena (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sizes.small}
                onChange={(e) => setFormData({
                  ...formData,
                  sizes: { ...formData.sizes, small: parseFloat(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Média (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sizes.medium}
                onChange={(e) => setFormData({
                  ...formData,
                  sizes: { ...formData.sizes, medium: parseFloat(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Grande (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sizes.large}
                onChange={(e) => setFormData({
                  ...formData,
                  sizes: { ...formData.sizes, large: parseFloat(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={editingPizza ? handleUpdatePizza : handleAddPizza}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingPizza ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pizza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preços
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.pizzas.map((pizza) => (
                <tr key={pizza.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={pizza.image}
                        alt={pizza.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {pizza.name}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {pizza.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      {categories.find(cat => cat.value === pizza.category)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      {pizza.sizes.small > 0 && (
                        <div>P: R$ {pizza.sizes.small.toFixed(2)}</div>
                      )}
                      <div>M: R$ {pizza.sizes.medium.toFixed(2)}</div>
                      {pizza.sizes.large > 0 && (
                        <div>G: R$ {pizza.sizes.large.toFixed(2)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPizza(pizza)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePizza(pizza.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;