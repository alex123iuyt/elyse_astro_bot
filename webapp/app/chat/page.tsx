"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ls } from '../../lib/storage';
import { PrivateContent } from '../../components/AuthContentGate';


type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function ChatPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkAuth();
    loadChatHistory();
  }, []);

  const checkAuth = async () => {
    try {
      // Проверяем роль в localStorage
      const role = ls.get('elyse.role', 'user');
      
      // Админ не нуждается в профиле
      if (role === 'admin') return;
      
      // Обычные пользователи могут быть без профиля
      // Но для чата лучше иметь профиль
      const natalChart = ls.get('elyse.natalChart', null);
      if (!natalChart) {
        // Показываем сообщение о необходимости заполнить профиль
        setMessages([{
          id: 'profile-required',
          text: 'Для использования чата с астрологом необходимо заполнить профиль. Перейдите в раздел "Профиль" и заполните натальную карту.',
          isUser: false,
          timestamp: new Date()
        }]);
        return;
      }
      
      setIsAdmin(role === 'admin');
      setIsPremium(false); // Пока без премиума
      
      // Load chat count from localStorage for free users
      const count = localStorage.getItem('elyse.chat.count') || '0';
      setChatCount(parseInt(count));
    } catch (error) {}
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/chat');
      const data = await response.json();
      
      if (data.success && data.data) {
        const formattedMessages = data.data.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.content,
          isUser: msg.is_from_user,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
      
      // Add welcome message if no messages exist
      if (!data.data || data.data.length === 0) {
        setMessages([{
          id: 'welcome',
          text: 'Привет! Я Моника, ваш персональный астролог. Задайте мне любой вопрос о любви, карьере или будущем, и я дам вам мудрый совет, основанный на звездах.',
          isUser: false,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Show welcome message on error
      setMessages([{
        id: 'welcome',
        text: 'Привет! Я Моника, ваш персональный астролог. Задайте мне любой вопрос о любви, карьере или будущем, и я дам вам мудрый совет, основанный на звездах.',
        isUser: false,
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Check if user has free messages left
    if (!isPremium && chatCount >= 3) {
      const limitMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'У вас закончились бесплатные сообщения. Активируйте премиум для неограниченного общения с астрологом!',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, limitMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: data.data.aiResponse,
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Increment chat count for free users
        if (!isPremium) {
          const newCount = chatCount + 1;
          setChatCount(newCount);
          localStorage.setItem('elyse.chat.count', newCount.toString());
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: data.error || 'Извините, произошла ошибка. Попробуйте позже.',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Извините, произошла ошибка сети. Попробуйте позже.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const activatePremium = () => {
    setIsPremium(true);
    localStorage.setItem('elyse.premium', 'true');
  };

  return (
    <PrivateContent
      title="Персональный астролог"
      description="Войдите в аккаунт, чтобы получить доступ к персональному ИИ-астрологу и задать свои вопросы"
    >
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-lg">👩</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">Моника</h1>
                <div className="text-sm text-emerald-400">Ваш астролог</div>
              </div>
            </div>
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
            >
              ←
            </button>
          </div>
        </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 pb-40">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.isUser
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <div className={`text-xs mt-2 ${
                message.isUser ? 'text-emerald-200' : 'text-zinc-400'
              }`}>
                {message.timestamp.toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 text-zinc-100 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="fixed bottom-20 left-4 right-4 p-4 bg-zinc-900 border-t border-zinc-800 z-40">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Задайте вопрос астрологу..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>

        {/* Chat Limits */}
        {!isPremium && (
          <div className="mt-3 text-center">
            <div className="text-sm text-zinc-400">
              Бесплатных сообщений: {Math.max(0, 3 - chatCount)} из 3
            </div>
            <button
              onClick={activatePremium}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Активировать премиум
            </button>
          </div>
        )}
      </div>

      {/* Premium Features */}
      {!isPremium && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 max-w-xs">
          <div className="text-center">
            <div className="text-2xl mb-2">🔮</div>
            <h3 className="text-sm font-semibold mb-2">Неограниченный чат</h3>
            <p className="text-xs text-zinc-300 mb-3">Получите доступ к неограниченному количеству вопросов астрологу</p>
            <button 
              onClick={activatePremium}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              Активировать
            </button>
          </div>
        </div>
      )}
      </div>
    </PrivateContent>
  );
}
