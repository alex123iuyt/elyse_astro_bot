"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  zodiac_sign: string;
  is_premium: boolean;
}

interface ChatUser {
  id: number;
  name: string;
  email: string;
  zodiac_sign: string;
  is_premium: boolean;
  last_active: string;
  unread_count: number;
  last_message_time: string;
  last_message: string;
}

interface Message {
  id: number;
  content: string;
  is_from_user: boolean;
  message_type: 'text' | 'system' | 'admin_reply';
  created_at: string;
  user_name?: string;
  admin_name?: string;
}

export default function AdminChatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    checkAuth();
    loadChats();
    // Subscribe to SSE for live updates
    const es = new EventSource('/api/admin/chats/sse');
    const onMsg = () => {
      // refresh chat list on any message event
      loadChats();
    };
    // @ts-ignore
    es.addEventListener('messages', onMsg);
    // @ts-ignore
    es.addEventListener('ping', () => {});
    return () => {
      try { es.close(); } catch {}
    };
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && (data.user.role === 'admin' || data.user.role === 'manager')) {
        setUser(data.user);
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      router.replace('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChats = async () => {
    try {
      const response = await fetch('/api/admin/chats');
      const data = await response.json();
      
      if (data.success) {
        setChats(data.data || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadChatMessages = async (chatUser: ChatUser) => {
    try {
      const response = await fetch(`/api/admin/chats?userId=${chatUser.id}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages || []);
        setSelectedChat(chatUser);
        
        // Mark as read by updating the chat list
        setChats(prev => prev.map(chat => 
          chat.id === chatUser.id 
            ? { ...chat, unread_count: 0 }
            : chat
        ));
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedChat || !replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/admin/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedChat.id,
          message: replyText
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Add the message to the local state
        const newMessage: Message = {
          id: Date.now(),
          content: replyText,
          is_from_user: false,
          message_type: 'admin_reply',
          created_at: new Date().toISOString(),
          admin_name: user?.name
        };
        
        setMessages(prev => [...prev, newMessage]);
        setReplyText('');
      } else {
        alert('Ошибка отправки сообщения');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Ошибка отправки сообщения');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'только что' : `${minutes} мин назад`;
    } else if (hours < 24) {
      return `${hours} ч назад`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} дн назад`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
            >
              ←
            </button>
            <h1 className="text-xl font-semibold">Управление чатами</h1>
          </div>
          <div className="text-sm text-zinc-400">
            Всего чатов: {chats.length}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Chat List */}
        <div className="w-1/3 border-r border-zinc-800 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Активные чаты</h2>
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChatMessages(chat)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedChat?.id === chat.id
                      ? 'bg-emerald-500/20 border-emerald-500/30'
                      : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500/30 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <div className="font-medium">{chat.name}</div>
                        <div className="text-sm text-zinc-400">{chat.zodiac_sign}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {chat.unread_count > 0 && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold mb-1">
                          {chat.unread_count > 9 ? '9+' : chat.unread_count}
                        </div>
                      )}
                      <div className="text-xs text-zinc-500">
                        {formatTime(chat.last_message_time)}
                      </div>
                    </div>
                  </div>
                  
                  {chat.last_message && (
                    <div className="text-sm text-zinc-400 truncate">
                      {chat.last_message}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-zinc-500">{chat.email}</span>
                    {chat.is_premium && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                        Premium
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/30 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <div className="font-medium">{selectedChat.name}</div>
                    <div className="text-sm text-zinc-400">
                      {selectedChat.zodiac_sign} • {selectedChat.is_premium ? 'Premium' : 'Free'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_from_user ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.is_from_user
                          ? 'bg-blue-600 text-white'
                          : message.message_type === 'admin_reply'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-zinc-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className={`text-xs mt-2 ${
                        message.is_from_user 
                          ? 'text-blue-200' 
                          : message.message_type === 'admin_reply'
                          ? 'text-emerald-200'
                          : 'text-zinc-400'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {message.admin_name && ` • ${message.admin_name}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-zinc-800">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                    placeholder="Ответить пользователю..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim() || isSending}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {isSending ? '...' : '→'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-zinc-400">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Выберите чат для просмотра сообщений</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

