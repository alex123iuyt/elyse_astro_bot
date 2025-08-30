import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Исключаем статические файлы и публичные API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/content') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/ping')
  ) {
    return NextResponse.next()
  }

  // Перенаправляем главную страницу на /today для обычных пользователей
  if (pathname === '/') {
    // Проверяем, есть ли токен админа
    const token = request.cookies.get('elyse_token')
    
    // Если нет токена или это обычный пользователь, перенаправляем на /today
    if (!token) {
      return NextResponse.redirect(new URL('/today', request.url))
    }
    
    // Для админов перенаправляем сразу в админку
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

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
      
      // Мягкая проверка для /admin/** → редирект на /auth?next=/admin/dashboard&scope=admin
      const loginUrl = new URL('/auth', request.url)
      loginUrl.searchParams.set('next', '/admin/dashboard')
      loginUrl.searchParams.set('scope', 'admin')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Для других публичных страниц - пропускаем
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/content (публичные API)
     * - api/auth (авторизация)
     * - _next/static (статичные файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico (иконка сайта)
     * - uploads (загруженные файлы)
     */
    '/((?!api/content|api/auth|_next/static|_next/image|favicon.ico|uploads|images|ping).*)',
  ],
}
