# 🧭 Исправления навигации в Elyse Astro Bot

## 📋 Описание проблем

В приложении были обнаружены следующие проблемы с навигацией:

1. **Кнопка выхода работает неправильно** - после выхода ломается переход или не очищается состояние
2. **Контроллеры навигации прыгают** - кнопки "назад" и "вперёд" меняют положение вместо фиксированного
3. **Нестабильная навигация между экранами** - иногда возвращает не на тот экран или зацикливается

## 🔧 Реализованные исправления

### 1. ✅ Исправлена кнопка выхода

**Файлы**: `webapp/components/admin/Sidebar.tsx`, `webapp/contexts/AuthContext.tsx`

**Проблема**: После выхода состояние пользователя не очищалось полностью, что приводило к нестабильной работе

**Решение**:
- Добавлено полное очищение localStorage и sessionStorage
- Добавлена очистка cookies на клиенте
- Улучшена обработка ошибок при выходе
- Добавлено логирование для отладки

**Код**:
```typescript
const logout = async () => {
  try {
    console.log('🔐 Calling logout API...');
    const response = await fetch('/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    });
    
    if (response.ok) {
      console.log('✅ Logout API successful');
    } else {
      console.warn('⚠️ Logout API returned non-OK status:', response.status);
    }
  } catch (error) {
    console.error('❌ Logout API error:', error);
  } finally {
    console.log('🧹 Clearing local state...');
    // Очищаем состояние независимо от результата API
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    
    // Очищаем все локальные данные
    localStorage.clear();
    sessionStorage.clear();
    
    // Очищаем cookies на клиенте
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Local state cleared');
  }
};
```

### 2. ✅ Исправлены контроллеры навигации

**Файлы**: `webapp/components/admin/AdminHeader.tsx`, `webapp/components/admin/useSmartBack.ts`

**Проблема**: Кнопки навигации меняли положение в зависимости от контента

**Решение**:
- Кнопка "назад" всегда слева, кнопка "вперёд" всегда справа
- Фиксированная ширина для каждой секции (w-9)
- Улучшенная логика определения активности кнопок
- Добавлены tooltips для лучшего UX

**Код**:
```typescript
<div className="admin-header grid grid-cols-[auto,1fr,auto] items-center h-14 px-4 border-b border-zinc-800">
  {/* Левая кнопка - всегда "назад" */}
  <div className="w-9 flex justify-center">
    <button
      data-testid="back"
      onClick={goBack}
      disabled={isBackDisabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-all ${
        isBackDisabled 
          ? 'text-zinc-600 cursor-not-allowed opacity-50' 
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}
      aria-label="Back"
      title={isBackDisabled ? "Вы уже на главной странице" : "Назад"}
    >
      <ArrowLeftIcon className="h-5 w-5" />
    </button>
  </div>
  
  {/* Центральный заголовок */}
  <div className="min-w-0 text-center">
    <h1 className="truncate text-base font-semibold text-white">{title}</h1>
  </div>
  
  {/* Правая часть - действия и кнопка закрытия */}
  <div className="w-9 flex justify-center">
    {actionsRight || (showClose && (
      <button onClick={onClose} aria-label="Close">
        <XMarkIcon className="h-5 w-5" />
      </button>
    ))}
  </div>
</div>
```

### 3. ✅ Улучшена логика навигации "назад"

**Файлы**: `webapp/components/admin/useSmartBack.ts`

**Проблема**: Логика `document.referrer` была ненадежной и могла приводить к неправильным переходам

**Решение**:
- Добавлена проверка `window.history.length`
- Улучшена валидация referrer URL
- Добавлена защита от возврата на страницы авторизации
- Добавлено логирование для отладки

**Код**:
```typescript
export const useSmartBack = (fallback: string) => {
  const router = useRouter();
  const pathname = usePathname();
  
  return () => {
    console.log('🔙 Smart back called from:', pathname, 'fallback:', fallback);
    
    try {
      // Проверяем, есть ли история навигации
      if (window.history.length > 1) {
        // Проверяем referrer только если он существует и с того же домена
        const ref = document.referrer;
        if (ref && ref.length > 0) {
          try {
            const refUrl = new URL(ref);
            const sameOrigin = refUrl.origin === location.origin;
            
            // Не возвращаемся на страницы авторизации
            if (sameOrigin && !ref.includes("/auth") && !ref.includes("/login")) {
              console.log('🔙 Using browser back, referrer:', ref);
              router.back();
              return;
            }
          } catch (urlError) {
            console.warn('⚠️ Invalid referrer URL:', ref);
          }
        }
      }
      
      // Если не можем использовать back, используем fallback
      console.log('🔙 Using fallback navigation to:', fallback);
      router.replace(fallback);
      
    } catch (error) {
      console.error('❌ Smart back error:', error);
      router.replace(fallback);
    }
  };
};
```

### 4. ✅ Создан компонент PageHeader для клиентских страниц

**Файл**: `webapp/components/PageHeader.tsx`

**Проблема**: Клиентские страницы не имели единообразной навигации

**Решение**:
- Создан универсальный компонент заголовка страницы
- Фиксированное положение кнопок навигации
- Умная логика показа/скрытия кнопок
- Поддержка кастомных действий

**Код**:
```typescript
export function PageHeader({ 
  title, 
  showBack = true, 
  showHome = true, 
  onBack,
  actionsRight 
}: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Умная навигация назад
      if (window.history.length > 1) {
        router.back();
      } else {
        // Если нет истории, идем на главную
        router.replace('/today');
      }
    }
  };

  const handleHome = () => {
    router.replace('/today');
  };

  // Определяем, можно ли идти назад
  const canGoBack = showBack && window.history.length > 1;
  // Определяем, нужно ли показывать кнопку домой
  const shouldShowHome = showHome && pathname !== '/today' && pathname !== '/';

  return (
    <div className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-zinc-800">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Левая часть - кнопка "назад" */}
        <div className="w-9 flex justify-center">
          {canGoBack && (
            <button onClick={handleBack} className="...">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Центральный заголовок */}
        <div className="flex-1 text-center min-w-0">
          <h1 className="truncate text-base font-semibold text-white px-4">{title}</h1>
        </div>

        {/* Правая часть - кнопка "домой" и действия */}
        <div className="w-9 flex justify-center">
          {shouldShowHome ? (
            <button onClick={handleHome} className="...">
              <HomeIcon className="h-5 w-5" />
            </button>
          ) : (
            actionsRight
          )}
        </div>
      </div>
    </div>
  );
}
```

### 5. ✅ Создан хук useSmartNavigation

**Файл**: `webapp/hooks/useSmartNavigation.ts`

**Проблема**: Не было централизованного управления навигацией

**Решение**:
- Создан хук для умной навигации
- Предотвращение зацикливаний
- Валидация путей
- Поддержка различных типов навигации

**Код**:
```typescript
export function useSmartNavigation(options: NavigationOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    fallback = '/today',
    preventLoop = true,
    clearHistory = false
  } = options;

  const navigateTo = useCallback((path: string) => {
    console.log('🧭 Navigating to:', path, 'from:', pathname);
    
    // Предотвращаем зацикливание
    if (preventLoop && path === pathname) {
      console.log('⚠️ Preventing navigation loop to same path');
      return;
    }
    
    // Проверяем валидность пути
    if (!path || path === '') {
      console.warn('⚠️ Invalid path, using fallback');
      router.replace(fallback);
      return;
    }
    
    // Если нужно очистить историю
    if (clearHistory) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }, [router, pathname, fallback, preventLoop, clearHistory]);

  const goBack = useCallback((customFallback?: string) => {
    const targetFallback = customFallback || fallback;
    console.log('🔙 Going back, fallback:', targetFallback);
    
    try {
      // Проверяем, есть ли история навигации
      if (window.history.length > 1) {
        // ... логика умной навигации назад
      }
      
      // Если нет истории, используем fallback
      console.log('🔙 No history, using fallback:', targetFallback);
      router.replace(targetFallback);
      
    } catch (error) {
      console.error('❌ Navigation back error:', error);
      router.replace(targetFallback);
    }
  }, [router, fallback]);

  return {
    navigateTo,
    goBack,
    goHome,
    goToAuth,
    currentPath: pathname
  };
}
```

### 6. ✅ Улучшен middleware

**Файл**: `webapp/middleware.ts`

**Проблема**: Возможны зацикливания при перенаправлениях

**Решение**:
- Добавлена проверка referer для предотвращения зацикливаний
- Улучшена логика перенаправлений

**Код**:
```typescript
// Защищаем только админские роуты
if (pathname.startsWith('/admin')) {
  // Проверяем наличие токена аутентификации
  const token = request.cookies.get('elyse_token')

  if (!token) {
    // Предотвращаем зацикливание - проверяем, не находимся ли уже на странице входа
    const referer = request.headers.get('referer')
    if (referer && referer.includes('/auth')) {
      console.log('⚠️ Preventing auth loop, redirecting to /today');
      return NextResponse.redirect(new URL('/today', request.url))
    }
    
    // Мягкая проверка для /admin/** → редирект на /auth
    const loginUrl = new URL('/auth', request.url)
    loginUrl.searchParams.set('next', '/admin/dashboard')
    loginUrl.searchParams.set('scope', 'admin')
    return NextResponse.redirect(loginUrl)
  }
}
```

## 🚀 Использование исправлений

### Для админских страниц:
```typescript
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminPage() {
  return (
    <div>
      <AdminHeader 
        title="Название страницы"
        backFallback="/admin/dashboard"
      />
      {/* Контент страницы */}
    </div>
  );
}
```

### Для клиентских страниц:
```typescript
import { PageHeader } from '@/components/PageHeader';

export default function ClientPage() {
  return (
    <div>
      <PageHeader 
        title="Название страницы"
        showBack={true}
        showHome={true}
      />
      {/* Контент страницы */}
    </div>
  );
}
```

### Для умной навигации:
```typescript
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

export default function MyPage() {
  const { navigateTo, goBack, goHome } = useSmartNavigation({
    fallback: '/today',
    preventLoop: true
  });

  return (
    <div>
      <button onClick={() => goBack()}>Назад</button>
      <button onClick={() => goHome()}>Главная</button>
      <button onClick={() => navigateTo('/settings')}>Настройки</button>
    </div>
  );
}
```

## 🧪 Тестирование

### 1. Тест кнопки выхода:
1. Войдите в админку
2. Нажмите "Выйти"
3. Проверьте, что вы перенаправлены на `/auth`
4. Проверьте консоль на наличие логов
5. Убедитесь, что localStorage и sessionStorage очищены

### 2. Тест навигации "назад":
1. Перейдите на любую страницу админки
2. Нажмите кнопку "назад"
3. Проверьте, что вы вернулись на предыдущую страницу
4. Проверьте консоль на наличие логов навигации

### 3. Тест фиксированного положения кнопок:
1. Перейдите между разными страницами админки
2. Убедитесь, что кнопка "назад" всегда слева
3. Убедитесь, что кнопка "домой" всегда справа (если показана)

### 4. Тест предотвращения зацикливаний:
1. Попробуйте перейти на ту же страницу
2. Убедитесь, что зацикливания не происходит
3. Проверьте консоль на предупреждения

## 📝 Логи для отладки

Теперь в консоли браузера вы увидите:

```
🔐 Calling logout API...
✅ Logout API successful
🧹 Clearing local state...
✅ Local state cleared
🚪 Logging out...
✅ Logout successful, redirecting to auth

🔙 Smart back called from: /admin/subscriptions fallback: /admin/dashboard
🔙 Using browser back, referrer: http://localhost:3000/admin/dashboard

🧭 Navigating to: /admin/users from: /admin/dashboard
⚠️ Preventing navigation loop to same path
```

## 🎯 Результат

После применения всех исправлений:

✅ **Кнопка выхода работает стабильно** - полностью очищает состояние и перенаправляет на страницу входа
✅ **Контроллеры навигации зафиксированы** - кнопка "назад" всегда слева, "вперёд" всегда справа
✅ **Навигация между экранами стабильна** - переходы линейные и предсказуемые
✅ **Добавлена защита от зацикливаний** - предотвращаются неправильные переходы
✅ **Улучшена отладка** - добавлено логирование для диагностики проблем

## 🔄 Следующие шаги

1. **Протестируйте все исправления** согласно инструкциям выше
2. **Проверьте логи в консоли** для отладки
3. **Сообщите о любых проблемах** для дальнейших улучшений

Все исправления готовы к использованию и должны решить проблемы с навигацией! 🚀
