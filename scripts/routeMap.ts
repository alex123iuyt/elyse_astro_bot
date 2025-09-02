#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface RouteInfo {
  path: string;
  type: 'page' | 'layout' | 'loading' | 'error' | 'not-found';
  file: string;
  isDynamic: boolean;
  isCatchAll: boolean;
  isAdmin: boolean;
}

function scanRoutes(dir: string, basePath: string = ''): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  if (!fs.existsSync(dir)) return routes;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Пропускаем служебные папки
      if (item.startsWith('.') || item === 'node_modules' || item === '.next') {
        continue;
      }
      
      // Обрабатываем динамические папки
      if (item.startsWith('[') && item.endsWith(']')) {
        const paramName = item.slice(1, -1);
        const isCatchAll = paramName.startsWith('...');
        
        routes.push({
          path: `${basePath}/[${paramName}]`,
          type: 'page',
          file: fullPath,
          isDynamic: true,
          isCatchAll,
          isAdmin: basePath.startsWith('/admin')
        });
        
        // Сканируем содержимое динамической папки
        routes.push(...scanRoutes(fullPath, `${basePath}/[${paramName}]`));
      } else {
        // Обычная папка
        const newBasePath = basePath ? `${basePath}/${item}` : `/${item}`;
        routes.push(...scanRoutes(fullPath, newBasePath));
      }
    } else if (stat.isFile()) {
      // Обрабатываем файлы страниц
      const ext = path.extname(item);
      if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
        const name = path.basename(item, ext);
        let routePath = basePath;
        let type: RouteInfo['type'] = 'page';
        let isDynamic = false;
        let isCatchAll = false;
        
        // Определяем тип файла
        if (name === 'layout') type = 'layout';
        else if (name === 'loading') type = 'loading';
        else if (name === 'error') type = 'error';
        else if (name === 'not-found') type = 'not-found';
        else if (name === 'page') {
          // Обычная страница
          if (basePath === '') routePath = '/';
        } else if (name.startsWith('[') && name.endsWith(']')) {
          // Динамическая страница
          const paramName = name.slice(1, -1);
          isDynamic = true;
          isCatchAll = paramName.startsWith('...');
          routePath = `${basePath}/[${paramName}]`;
        } else {
          // Именованная страница
          routePath = `${basePath}/${name}`;
        }
        
        routes.push({
          path: routePath,
          type,
          file: fullPath,
          isDynamic,
          isCatchAll,
          isAdmin: basePath.startsWith('/admin')
        });
      }
    }
  }
  
  return routes;
}

function main() {
  console.log('🔍 Сканирование маршрутов Next.js App Router...');
  
  const appDir = path.join(process.cwd(), 'webapp', 'app');
  const routes = scanRoutes(appDir);
  
  // Сортируем по пути
  routes.sort((a, b) => a.path.localeCompare(b.path));
  
  // Группируем по типам
  const grouped = {
    pages: routes.filter(r => r.type === 'page'),
    layouts: routes.filter(r => r.type === 'layout'),
    loading: routes.filter(r => r.type === 'loading'),
    error: routes.filter(r => r.type === 'error'),
    notFound: routes.filter(r => r.type === 'not-found')
  };
  
  console.log('\n📊 Результаты сканирования:');
  console.log(`Всего маршрутов: ${routes.length}`);
  console.log(`Страниц: ${grouped.pages.length}`);
  console.log(`Layouts: ${grouped.layouts.length}`);
  console.log(`Loading: ${grouped.loading.length}`);
  console.log(`Error: ${grouped.error.length}`);
  console.log(`Not Found: ${grouped.notFound.length}`);
  
  console.log('\n🚨 КРИТИЧЕСКИЕ МАРШРУТЫ:');
  const critical = routes.filter(r => r.isCatchAll || r.path.includes('[...'));
  if (critical.length > 0) {
    critical.forEach(r => {
      console.log(`⚠️  CATCH-ALL: ${r.path} -> ${r.file}`);
    });
  } else {
    console.log('✅ Catch-all маршруты не найдены');
  }
  
  console.log('\n🔐 АДМИНСКИЕ МАРШРУТЫ:');
  const adminRoutes = routes.filter(r => r.isAdmin);
  adminRoutes.forEach(r => {
    console.log(`👑 ${r.path} -> ${r.file}`);
  });
  
  console.log('\n📄 ПУБЛИЧНЫЕ СТРАНИЦЫ:');
  const publicPages = grouped.pages.filter(r => !r.isAdmin);
  publicPages.forEach(r => {
    console.log(`🌐 ${r.path} -> ${r.file}`);
  });
  
  // Сохраняем в JSON
  const outputPath = path.join(process.cwd(), 'route-map-before.json');
  const output = {
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    critical: critical.map(r => ({ path: r.path, file: r.file })),
    admin: adminRoutes.map(r => ({ path: r.path, file: r.file, type: r.type })),
    public: publicPages.map(r => ({ path: r.path, file: r.file, type: r.type })),
    allRoutes: routes.map(r => ({
      path: r.path,
      type: r.type,
      file: r.file,
      isDynamic: r.isDynamic,
      isCatchAll: r.isCatchAll,
      isAdmin: r.isAdmin
    }))
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Карта маршрутов сохранена в: ${outputPath}`);
  
  // Проверяем потенциальные проблемы
  console.log('\n🔍 АНАЛИЗ БЕЗОПАСНОСТИ:');
  
  const hasGlobalCatchAll = critical.some(r => r.path === '/' || r.path === '/[...slug]');
  if (hasGlobalCatchAll) {
    console.log('❌ НАЙДЕН ГЛОБАЛЬНЫЙ CATCH-ALL! Это может перехватывать все маршруты!');
  } else {
    console.log('✅ Глобальные catch-all маршруты не найдены');
  }
  
  const hasAdminInRoot = routes.some(r => r.path === '/' && r.isAdmin);
  if (hasAdminInRoot) {
    console.log('❌ АДМИНСКИЙ LAYOUT В КОРНЕ! Это может влиять на все страницы!');
  } else {
    console.log('✅ Админский layout не найден в корне');
  }
  
  const hasDynamicAdmin = adminRoutes.some(r => r.isDynamic);
  if (hasDynamicAdmin) {
    console.log('⚠️  Админские маршруты содержат динамические параметры');
  }
  
  return output;
}

if (require.main === module) {
  main();
}

export { main, scanRoutes };






