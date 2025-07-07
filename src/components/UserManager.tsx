import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Users, Shield, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { User, UserRole, UserPermissions } from '../types';

const UserManager: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as UserRole,
    permissions: {
      dashboard: false,
      orders: {
        view: true,
        create: false,
        update: false,
        delete: false,
        updateStatus: false,
      },
      menu: {
        view: false,
        create: false,
        update: false,
        delete: false,
      },
      settings: {
        view: false,
        update: false,
        users: false,
      },
      delivery: {
        view: false,
        confirmPayment: false,
        confirmDelivery: false,
      },
    } as UserPermissions,
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'operator',
      permissions: {
        dashboard: false,
        orders: {
          view: true,
          create: false,
          update: false,
          delete: false,
          updateStatus: false,
        },
        menu: {
          view: false,
          create: false,
          update: false,
          delete: false,
        },
        settings: {
          view: false,
          update: false,
          users: false,
        },
        delivery: {
          view: false,
          confirmPayment: false,
          confirmDelivery: false,
        },
      },
      isActive: true
    });
    setEditingUser(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const updatedUser: User = {
        ...editingUser,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        isActive: formData.isActive,
        updatedAt: new Date(),
      };
      
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Usuário atualizado com sucesso!'
      });
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        isActive: formData.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({
        type: 'ADD_USER',
        payload: newUser
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Usuário criado com sucesso!'
      });
    }
    
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      dispatch({
        type: 'DELETE_USER',
        payload: id
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: 'Usuário excluído com sucesso!'
      });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    let permissions: UserPermissions;
    
    switch (role) {
      case 'admin':
        permissions = {
          dashboard: true,
          orders: { view: true, create: true, update: true, delete: true, updateStatus: true },
          menu: { view: true, create: true, update: true, delete: true },
          settings: { view: true, update: true, users: true },
          delivery: { view: true, confirmPayment: true, confirmDelivery: true },
        };
        break;
      case 'manager':
        permissions = {
          dashboard: true,
          orders: { view: true, create: true, update: true, delete: false, updateStatus: true },
          menu: { view: true, create: true, update: true, delete: false },
          settings: { view: true, update: true, users: false },
          delivery: { view: true, confirmPayment: true, confirmDelivery: true },
        };
        break;
      case 'delivery':
        permissions = {
          dashboard: false,
          orders: { view: true, create: false, update: false, delete: false, updateStatus: false },
          menu: { view: false, create: false, update: false, delete: false },
          settings: { view: false, update: false, users: false },
          delivery: { view: true, confirmPayment: true, confirmDelivery: true },
        };
        break;
      default: // operator
        permissions = {
          dashboard: false,
          orders: { view: true, create: false, update: false, delete: false, updateStatus: true },
          menu: { view: false, create: false, update: false, delete: false },
          settings: { view: false, update: false, users: false },
          delivery: { view: false, confirmPayment: false, confirmDelivery: false },
        };
    }
    
    setFormData({
      ...formData,
      role,
      permissions
    });
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: 'Administrador',
      manager: 'Gerente',
      operator: 'Operador',
      delivery: 'Entregador'
    };
    return labels[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      operator: 'bg-green-100 text-green-800',
      delivery: 'bg-orange-100 text-orange-800'
    };
    return colors[role];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-red-600" />
          <h3 className="text-xl font-semibold text-gray-800">Gerenciar Usuários</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h4 className="text-lg font-semibold text-gray-800">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: José Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="jose@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="operator">Operador</option>
                  <option value="delivery">Entregador</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissões
                </label>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  {/* Dashboard */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="dashboard"
                      checked={formData.permissions.dashboard}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, dashboard: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="dashboard" className="text-sm font-medium text-gray-700">
                      Dashboard
                    </label>
                  </div>

                  {/* Orders */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Pedidos</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.orders.view}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: { ...formData.permissions.orders, view: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Visualizar</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.orders.updateStatus}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: { ...formData.permissions.orders, updateStatus: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Atualizar Status</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.orders.delete}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: { ...formData.permissions.orders, delete: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Excluir</span>
                      </label>
                    </div>
                  </div>

                  {/* Menu */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Cardápio</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.menu.view}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              menu: { ...formData.permissions.menu, view: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Visualizar</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.menu.create}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              menu: { ...formData.permissions.menu, create: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Criar</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.menu.update}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              menu: { ...formData.permissions.menu, update: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Editar</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.menu.delete}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              menu: { ...formData.permissions.menu, delete: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Excluir</span>
                      </label>
                    </div>
                  </div>

                  {/* Settings */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Configurações</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.settings.view}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              settings: { ...formData.permissions.settings, view: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Visualizar</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.settings.update}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              settings: { ...formData.permissions.settings, update: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Editar</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.settings.users}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              settings: { ...formData.permissions.settings, users: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Usuários</span>
                      </label>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Entrega</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.delivery.view}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              delivery: { ...formData.permissions.delivery, view: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Visualizar</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.delivery.confirmPayment}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              delivery: { ...formData.permissions.delivery, confirmPayment: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Confirmar Pagamento</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.delivery.confirmDelivery}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              delivery: { ...formData.permissions.delivery, confirmDelivery: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs">Confirmar Entrega</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Usuário ativo
                </label>
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
                  <span>{editingUser ? 'Atualizar' : 'Criar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {state.users.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando seu primeiro usuário para o sistema.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Criar Primeiro Usuário
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;