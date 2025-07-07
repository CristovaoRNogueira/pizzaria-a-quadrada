import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Shield, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@pizzariaquadrada.com',
      name: 'Administrador',
      role: 'admin',
      permissions: {
        canDeleteOrders: true,
        canAccessSettings: true,
        canAccessDashboard: true,
        canAccessOrders: true,
        canAccessMenu: true,
        canAccessPromotions: true,
        canAccessUsers: true,
      },
      isActive: true,
      createdAt: new Date(),
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'operator' | 'delivery',
    permissions: {
      canDeleteOrders: false,
      canAccessSettings: false,
      canAccessDashboard: false,
      canAccessOrders: true,
      canAccessMenu: false,
      canAccessPromotions: false,
      canAccessUsers: false,
    }
  });
  const [showPassword, setShowPassword] = useState(false);

  const roleLabels = {
    admin: 'Administrador',
    operator: 'Operador',
    delivery: 'Entregador'
  };

  const permissionLabels = {
    canDeleteOrders: 'Excluir pedidos',
    canAccessSettings: 'Acessar configurações',
    canAccessDashboard: 'Acessar dashboard',
    canAccessOrders: 'Acessar pedidos',
    canAccessMenu: 'Gerenciar cardápio',
    canAccessPromotions: 'Gerenciar promoções',
    canAccessUsers: 'Gerenciar usuários',
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se já existe um usuário com o mesmo email
    const existingUser = users.find(user => 
      user.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (existingUser) {
      alert('Já existe um usuário com este email');
      return;
    }
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: { ...formData.permissions },
      isActive: true,
      createdAt: new Date(),
    };

    // Enviar para o backend
    apiService.createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      permissions: formData.permissions
    }).then((response) => {
      setUsers([...users, response]);
      resetForm();
      alert('Usuário criado com sucesso!');
    }).catch((error) => {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário: ' + (error.response?.data?.error || error.message));
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser || !formData.name || !formData.email) {
      return;
    }

    // Verificar se já existe outro usuário com o mesmo email
    const existingUser = users.find(user => 
      user.email.toLowerCase() === formData.email.toLowerCase() && user.id !== editingUser.id
    );

    if (existingUser) {
      alert('Já existe um usuário com este email');
      return;
    }
    const updatedUser: User = {
      ...editingUser,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: { ...formData.permissions },
    };

    // Enviar para o backend
    const updateData: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    apiService.updateUser(editingUser.id, updateData)
      .then((response) => {
        setUsers(users.map(user => user.id === editingUser.id ? response : user));
        resetForm();
        alert('Usuário atualizado com sucesso!');
      }).catch((error) => {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário: ' + (error.response?.data?.error || error.message));
      });
  };

  const handleDeleteUser = (id: string) => {
    if (id === '1') {
      alert('Não é possível excluir o usuário administrador principal');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      apiService.deleteUser(id)
        .then(() => {
          setUsers(users.filter(user => user.id !== id));
          alert('Usuário excluído com sucesso!');
        }).catch((error) => {
          console.error('Erro ao excluir usuário:', error);
          alert('Erro ao excluir usuário: ' + (error.response?.data?.error || error.message));
        });
    }
  };

  const toggleUserStatus = (id: string) => {
    if (id === '1') {
      alert('Não é possível desativar o usuário administrador principal');
      return;
    }

    setUsers(users.map(user => 
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      permissions: { ...user.permissions }
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'operator',
      permissions: {
        canDeleteOrders: false,
        canAccessSettings: false,
        canAccessDashboard: false,
        canAccessOrders: true,
        canAccessMenu: false,
        canAccessPromotions: false,
        canAccessUsers: false,
      }
    });
    setEditingUser(null);
    setShowAddForm(false);
    setShowPassword(false);
  };

  // Carregar usuários do backend
  useEffect(() => {
    apiService.getUsers()
      .then((response) => {
        setUsers(response);
      })
      .catch((error) => {
        console.error('Erro ao carregar usuários:', error);
      });
  }, []);

  const handleRoleChange = (role: 'admin' | 'operator' | 'delivery') => {
    let permissions = { ...formData.permissions };

    switch (role) {
      case 'admin':
        permissions = {
          canDeleteOrders: true,
          canAccessSettings: true,
          canAccessDashboard: true,
          canAccessOrders: true,
          canAccessMenu: true,
          canAccessPromotions: true,
          canAccessUsers: true,
        };
        break;
      case 'operator':
        permissions = {
          canDeleteOrders: false,
          canAccessSettings: false,
          canAccessDashboard: false,
          canAccessOrders: true,
          canAccessMenu: true,
          canAccessPromotions: false,
          canAccessUsers: false,
        };
        break;
      case 'delivery':
        permissions = {
          canDeleteOrders: false,
          canAccessSettings: false,
          canAccessDashboard: false,
          canAccessOrders: true,
          canAccessMenu: false,
          canAccessPromotions: false,
          canAccessUsers: false,
        };
        break;
    }

    setFormData({ ...formData, role, permissions });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Gerenciar Usuários</h3>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Usuário</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-sm text-blue-700">Administradores</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.role === 'operator').length}
                </p>
                <p className="text-sm text-green-700">Operadores</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'delivery').length}
                </p>
                <p className="text-sm text-purple-700">Entregadores</p>
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
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha {editingUser ? '(deixe em branco para manter)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Senha do usuário"
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
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'operator' | 'delivery')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="operator">Operador</option>
                  <option value="delivery">Entregador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {/* Permissões */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissões
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={key}
                      checked={formData.permissions[key as keyof typeof formData.permissions]}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor={key} className="text-sm text-gray-700">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingUser ? 'Atualizar' : 'Criar'} Usuário</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Usuários Cadastrados</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">E-mail</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Função</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Criado em</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        user.role === 'admin' ? 'bg-red-600' :
                        user.role === 'operator' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'operator' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      disabled={user.id === '1'}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      } ${user.id === '1' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {user.createdAt.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Editar usuário"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.id !== '1' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          title="Excluir usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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

export default UserManagement;