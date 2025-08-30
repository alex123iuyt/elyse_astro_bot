'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Chat {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  status: string;
  messageCount: number;
  unreadCount: number;
  lastMessage: any;
  createdAt: string;
  lastActivity: string;
}

export default function ChatsTab() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/admin/chats');
      const data = await response.json();
      
      if (data.success) {
        setChats(data.data);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatAction = async (action: string, chatId: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, chatId, data })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadChats();
        if (action === 'deleteChat') {
          setShowChatModal(false);
          setSelectedChat(null);
        }
      }
    } catch (error) {
      console.error('Error performing chat action:', error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.status.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-2xl font-bold">Управление чатами</h2>
        <div className="text-sm text-zinc-400">
          Всего чатов: {chats.length} | Активных: {chats.filter(c => c.status === 'active').length}
        </div>
      </div>

      {/* Поиск */}
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск по имени пользователя или статусу..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <span className="absolute right-3 top-3 text-zinc-400">🔍</span>
      </div>

      {/* Список чатов */}
      <div className="grid gap-4">
        {filteredChats.map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{chat.userName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    chat.userRole === 'admin' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    chat.userRole === 'manager' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-green-500/20 text-green-300 border border-green-500/30'
                  }`}>
                    {chat.userRole === 'admin' ? 'Админ' : chat.userRole === 'manager' ? 'Менеджер' : 'Пользователь'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    chat.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {chat.status === 'active' ? 'Активен' : 'Решен'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm text-zinc-400">
                  <div>
                    <span className="font-medium">Сообщений:</span> {chat.messageCount}
                  </div>
                  <div>
                    <span className="font-medium">Непрочитанных:</span> 
                    <span className={`ml-1 ${chat.unreadCount > 0 ? 'text-red-400 font-bold' : ''}`}>
                      {chat.unreadCount}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Создан:</span> {new Date(chat.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                
                {chat.lastMessage && (
                  <div className="mt-3 p-3 bg-zinc-800 rounded-xl">
                    <div className="text-xs text-zinc-500 mb-1">Последнее сообщение:</div>
                    <div className="text-sm text-zinc-300">{chat.lastMessage.content}</div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowChatModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  💬 Ответить
                </button>
                
                <button
                  onClick={() => handleChatAction('markAsRead', chat.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  ✅ Прочитано
                </button>
                
                <button
                  onClick={() => handleChatAction('deleteChat', chat.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Модальное окно чата */}
      {showChatModal && selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Чат с {selectedChat.userName}</h3>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-2">Информация о чате:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-zinc-500">Статус:</span> {selectedChat.status}</div>
                  <div><span className="text-zinc-500">Сообщений:</span> {selectedChat.messageCount}</div>
                  <div><span className="text-zinc-500">Непрочитанных:</span> {selectedChat.unreadCount}</div>
                  <div><span className="text-zinc-500">Создан:</span> {new Date(selectedChat.createdAt).toLocaleDateString('ru-RU')}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Ваш ответ:</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  placeholder="Введите ваш ответ пользователю..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  if (newMessage.trim()) {
                    handleChatAction('addMessage', selectedChat.id, { content: newMessage.trim() });
                    setNewMessage('');
                  }
                }}
                disabled={!newMessage.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white py-2 rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                Отправить ответ
              </button>
              <button
                onClick={() => setShowChatModal(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-xl transition-colors"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}








