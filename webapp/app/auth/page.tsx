"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

type Step = 'login' | 'register' | 'natal-chart' | 'goals';

function toast(message: string, type: 'success'|'error'|'info' = 'info') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }));
  }
}

export default function AuthPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<'login' | 'register' | 'natal-chart' | 'goals'>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Получаем callback URL из параметров
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');
      
      if (user.role === 'admin') {
        // Для админов перенаправляем на админку или callback URL
        if (callbackUrl && callbackUrl.startsWith('/admin')) {
          router.replace(callbackUrl);
        } else {
          router.replace('/admin');
        }
      } else {
        // Для обычных пользователей перенаправляем на главную или callback URL
        if (callbackUrl && !callbackUrl.startsWith('/admin')) {
          router.replace(callbackUrl);
        } else {
          router.replace('/');
        }
      }
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Natal chart state
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthCountry, setBirthCountry] = useState('Россия');
  
  // Goals state
  const [goals, setGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');

  useEffect(() => {
    // Префилл email, если пользователь выбрал "Запомни меня"
    const saved = localStorage.getItem('elyse.savedEmail');
    if (saved) {
      setLoginEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Показываем loading пока проверяем аутентификацию
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  const availableGoals = [
    'Любовь и отношения',
    'Карьера и бизнес',
    'Здоровье и благополучие',
    'Духовное развитие',
    'Финансы и богатство',
    'Семья и дети',
    'Путешествия и приключения',
    'Образование и знания'
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, rememberMe })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (rememberMe) {
          localStorage.setItem('elyse.savedEmail', loginEmail);
        } else {
          localStorage.removeItem('elyse.savedEmail');
        }
        
        // Обновляем контекст аутентификации
        login(data.user);
        
        toast('Вход выполнен', 'success');
        
        // Успешный вход - перенаправляем в зависимости от роли
        if (data.user.role === 'admin') {
          // Получаем callback URL из параметров
          const urlParams = new URLSearchParams(window.location.search);
          const callbackUrl = urlParams.get('callbackUrl');
          
          if (callbackUrl && callbackUrl.startsWith('/admin')) {
            router.replace(callbackUrl);
          } else {
            router.replace('/admin');
          }
        } else {
          router.replace('/');
        }
        return;
      } else {
        toast(data.error || 'Ошибка входа', 'error');
      }
    } catch (error) {
      toast('Ошибка сети', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== confirmPassword) {
      toast('Пароли не совпадают', 'error');
      return;
    }
    
    setStep('natal-chart');
  };

  const handleNatalChart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate || !birthTime || !birthCity) {
      toast('Заполните все поля натальной карты', 'error');
      return;
    }
    
    setStep('goals');
  };

  const handleGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (goals.length === 0) {
      toast('Выберите хотя бы одну цель', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Регистрируем пользователя с полными данными
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          birthDate,
          birthTime,
          birthCity,
          birthCountry,
          goals: goals.join(', '),
          customGoal: customGoal || undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast('Регистрация успешна! Добро пожаловать в Elyse Astro!', 'success');
        // Успешная регистрация - перенаправляем на главную
        router.push('/');
        return;
      } else {
        toast(data.error || 'Ошибка регистрации', 'error');
      }
    } catch (error) {
      toast('Ошибка сети', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !goals.includes(customGoal.trim())) {
      setGoals(prev => [...prev, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  const removeGoal = (goal: string) => {
    setGoals(prev => prev.filter(g => g !== goal));
  };

  if (step === 'natal-chart') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Натальная карта</h1>
            <p className="text-zinc-400">Расскажите о своем рождении</p>
          </div>
          
          <form onSubmit={handleNatalChart} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Дата рождения</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Время рождения</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Город рождения</label>
              <input
                type="text"
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                placeholder="Москва"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Страна рождения</label>
              <select
                value={birthCountry}
                onChange={(e) => setBirthCountry(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Россия">Россия</option>
                <option value="Украина">Украина</option>
                <option value="Беларусь">Беларусь</option>
                <option value="Казахстан">Казахстан</option>
                <option value="Узбекистан">Узбекистан</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl transition-colors"
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors"
              >
                Далее
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'goals') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Ваши цели</h1>
            <p className="text-zinc-400">Что вы ищете в астрологии?</p>
          </div>
          
          <form onSubmit={handleGoals} className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-3">Выберите цели:</label>
              <div className="grid grid-cols-2 gap-2">
                {availableGoals.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-lg text-sm transition-colors ${
                      goals.includes(goal)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Добавить свою цель:</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Введите свою цель"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomGoal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            {goals.length > 0 && (
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Выбранные цели:</label>
                <div className="flex flex-wrap gap-2">
                  {goals.map(goal => (
                    <span
                      key={goal}
                      className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{goal}</span>
                      <button
                        type="button"
                        onClick={() => removeGoal(goal)}
                        className="text-emerald-200 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('natal-chart')}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl transition-colors"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={isLoading || goals.length === 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white py-3 rounded-xl transition-colors"
              >
                {isLoading ? 'Регистрация...' : 'Завершить регистрацию'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Elyse Astro</h1>
          <p className="text-zinc-400">Войдите или зарегистрируйтесь</p>
        </div>
        
        <div className="flex bg-zinc-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setStep('login')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              step === 'login'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Вход
          </button>
          <button
            onClick={() => setStep('register')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              step === 'register'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Регистрация
          </button>
        </div>
        
        {step === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                name="username"
                autoComplete="username email"
                inputMode="email"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Пароль</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                name="current-password"
                autoComplete="current-password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-zinc-400">
                Запомни меня
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white py-3 rounded-xl transition-colors"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4" autoComplete="on">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                name="email"
                autoComplete="email"
                inputMode="email"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Пароль</label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                name="new-password"
                autoComplete="new-password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Подтвердите пароль</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                name="confirm-password"
                autoComplete="new-password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors"
            >
              Далее - Натальная карта
            </button>
          </form>
        )}
      </div>
    </div>
  );
}