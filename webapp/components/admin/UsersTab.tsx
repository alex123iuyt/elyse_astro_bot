'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  hasProfile: boolean;
  lastActivity: string;
  messageCount: number;
  isPremium: boolean;
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (action: string, userId: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, data })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadUsers(); // Перезагружаем список
        if (action === 'deleteUser') {
          setShowUserModal(false);
          setSelectedUser(null);
        }
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление пользователями</h2>
        <button
          onClick={() => {
            setSelectedUser({
              id: '',
              name: '',
              email: '',
              role: 'user',
              status: 'active',
              hasProfile: false,
              lastActivity: new Date().toISOString(),
              messageCount: 0,
              isPremium: false
            });
            setShowUserModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          + Добавить пользователя
        </button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <span className="absolute right-3 top-3 text-zinc-400">🔍</span>
      </div>

      {/* Список пользователей */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Пользователь</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Роль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Профиль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Сообщения</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-zinc-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      user.role === 'manager' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}>
                      {user.role === 'admin' ? 'Админ' : user.role === 'manager' ? 'Менеджер' : 'Пользователь'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {user.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.hasProfile ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {user.hasProfile ? 'Заполнен' : 'Не заполнен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {user.messageCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleUserAction('deleteUser', user.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно редактирования пользователя */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold mb-4">
              {selectedUser.id ? 'Редактировать пользователя' : 'Добавить пользователя'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Имя</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Роль</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="user">Пользователь</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Статус</label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  if (selectedUser.id) {
                    handleUserAction('updateRole', selectedUser.id, {
                      role: selectedUser.role,
                      status: selectedUser.status,
                      name: selectedUser.name,
                      email: selectedUser.email
                    });
                  } else {
                    handleUserAction('addUser', '', {
                      role: selectedUser.role,
                      status: selectedUser.status,
                      name: selectedUser.name,
                      email: selectedUser.email
                    });
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl transition-colors"
              >
                {selectedUser.id ? 'Сохранить' : 'Добавить'}
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-xl transition-colors"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}











