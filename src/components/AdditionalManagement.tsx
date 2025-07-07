import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Package } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Additional } from '../types';

const AdditionalManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdditional, setEditingAdditional] = useState<Additional | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'ingredient' as 'ingredient' | 'extra' | 'drink'
  });

  const categoryLabels = {
    ingredient: 'Ingrediente',
    extra: 'Extra',
    drink: 'Bebida'
  };

  const handleAddAdditional = () => {
    if (!formData.name || formData.price <= 0) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Preencha todos os campos obrigatórios!'
      });
      return;
    }

    const newAdditional: Additional = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      isActive: true
    };

    dispatch({
      type: 'ADD_ADDITIONAL',
      payload: newAdditional
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Adicional criado com sucesso!'
    });

    resetForm();
  };

  const handleUpdateAdditional = () => {
    if (!editingAdditional || !formData.name || formData.price <= 0) {
      return;
    }

    const updatedAdditional: Additional = {
      ...editingAdditional,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category
    };

    dispatch({
      type: 'UPDATE_ADDITIONAL',
      payload: updatedAdditional
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: 'Adicional atualizado com sucesso!'
    });

    resetForm();
  };

  const handleDeleteAdditional = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este adicional?')) {
      dispatch({
        type: 'DELETE_ADDITIONAL',
        payload: id
      });

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Adicional excluído com sucesso!'
      });
    }
  };

  const startEdit = (additional: Additional) => {
    setEditingAdditional(additional);
    setFormData({
      name: additional.name,
      description: additional.description || '',
      price: additional.price,
      category: additional.category
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'ingredient'
    });
    setEditingAdditional(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Gerenciar Adicionais</h3>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Adicional</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {state.additionals.filter(a => a.category === 'ingredient').length}
                </p>
                <p className="text-sm text-blue-700">Ingredientes</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Plus className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {state.additionals.filter(a => a.category === 'extra').length}
                </p>
                <p className="text-sm text-green-700">Extras</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {state.additionals.filter(a => a.category === 'drink').length}
                </p>
                <p className="text-sm text-purple-700">Bebidas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Criação/Edição */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {editingAdditional ? 'Editar Adicional' : 'Novo Adicional'}
            </h4>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Adicional *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Bacon, Catupiry, Borda Recheada"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    category: e.target.value as 'ingredient' | 'extra' | 'drink' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="ingredient">Ingrediente</option>
                  <option value="extra">Extra</option>
                  <option value="drink">Bebida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Descrição opcional do adicional"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editingAdditional ? handleUpdateAdditional : handleAddAdditional}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingAdditional ? 'Atualizar' : 'Criar'} Adicional</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Adicionais */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Adicionais Cadastrados</h4>
        
        {state.additionals.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum adicional cadastrado</p>
            <p className="text-gray-400 text-sm">Clique em "Novo Adicional" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Preço</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {state.additionals.map((additional) => (
                  <tr key={additional.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{additional.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        additional.category === 'ingredient' ? 'bg-blue-100 text-blue-800' :
                        additional.category === 'extra' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {categoryLabels[additional.category]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">R$ {additional.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                      {additional.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEdit(additional)}
                          className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                          title="Editar adicional"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdditional(additional.id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          title="Excluir adicional"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalManagement;