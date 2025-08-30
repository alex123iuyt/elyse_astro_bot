#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface RouteMap {
  timestamp: string;
  totalRoutes: number;
  critical: Array<{ path: string; file: string }>;
  admin: Array<{ path: string; file: string; type: string }>;
  public: Array<{ path: string; file: string; type: string }>;
  allRoutes: Array<{
    path: string;
    type: string;
    file: string;
    isDynamic: boolean;
    isCatchAll: boolean;
    isAdmin: boolean;
  }>;
}

function compareRouteMaps() {
  console.log('🔍 Сравнение карт маршрутов до и после исправлений...\n');
  
  const beforePath = path.join(process.cwd(), 'route-map-before.json');
  const afterPath = path.join(process.cwd(), 'route-map-after.json');
  
  if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) {
    console.error('❌ Файлы карт маршрутов не найдены!');
    return;
  }
  
  const before: RouteMap = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
  const after: RouteMap = JSON.parse(fs.readFileSync(afterPath, 'utf8'));
  
  console.log('📊 Сравнение статистики:');
  console.log(`   До: ${before.totalRoutes} маршрутов`);
  console.log(`   После: ${after.totalRoutes} маршрутов`);
  console.log(`   Разница: ${after.totalRoutes - before.totalRoutes}`);
  
  console.log('\n🔐 Админские маршруты:');
  console.log(`   До: ${before.admin.length}`);
  console.log(`   После: ${after.admin.length}`);
  
  console.log('\n🌐 Публичные маршруты:');
  console.log(`   До: ${before.public.length}`);
  console.log(`   После: ${after.public.length}`);
  
  // Проверяем изменения в админских маршрутах
  const beforeAdminPaths = before.admin.map(r => r.path);
  const afterAdminPaths = after.admin.map(r => r.path);
  
  const addedAdmin = afterAdminPaths.filter(path => !beforeAdminPaths.includes(path));
  const removedAdmin = beforeAdminPaths.filter(path => !afterAdminPaths.includes(path));
  
  if (addedAdmin.length > 0) {
    console.log('\n➕ Добавленные админские маршруты:');
    addedAdmin.forEach(path => console.log(`   ${path}`));
  }
  
  if (removedAdmin.length > 0) {
    console.log('\n➖ Удаленные админские маршруты:');
    removedAdmin.forEach(path => console.log(`   ${path}`));
  }
  
  // Проверяем критические маршруты
  console.log('\n🚨 Критические маршруты:');
  if (before.critical.length === 0 && after.critical.length === 0) {
    console.log('✅ Catch-all маршруты не найдены ни до, ни после');
  } else {
    console.log(`   До: ${before.critical.length}`);
    console.log(`   После: ${after.critical.length}`);
  }
  
  // Проверяем, что публичные маршруты не изменились
  const beforePublicPaths = before.public.filter(r => !r.path.startsWith('/api/')).map(r => r.path);
  const afterPublicPaths = after.public.filter(r => !r.path.startsWith('/api/')).map(r => r.path);
  
  const removedPublic = beforePublicPaths.filter(path => !afterPublicPaths.includes(path));
  const addedPublic = afterPublicPaths.filter(path => !beforePublicPaths.includes(path));
  
  if (removedPublic.length > 0) {
    console.log('\n❌ УДАЛЕНЫ ПУБЛИЧНЫЕ МАРШРУТЫ:');
    removedPublic.forEach(path => console.log(`   ${path}`));
  }
  
  if (addedPublic.length > 0) {
    console.log('\n➕ Добавленные публичные маршруты:');
    addedPublic.forEach(path => console.log(`   ${path}`));
  }
  
  // Финальная проверка
  console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА:');
  
  const hasCriticalIssues = after.critical.length > 0;
  const hasRemovedPublic = removedPublic.length > 0;
  const hasAdminInRoot = after.allRoutes.some(r => r.path === '/' && r.isAdmin);
  
  if (hasCriticalIssues) {
    console.log('❌ НАЙДЕНЫ КРИТИЧЕСКИЕ ПРОБЛЕМЫ: catch-all маршруты');
  } else {
    console.log('✅ Catch-all маршруты не найдены');
  }
  
  if (hasRemovedPublic) {
    console.log('❌ НАЙДЕНЫ КРИТИЧЕСКИЕ ПРОБЛЕМЫ: удалены публичные маршруты');
  } else {
    console.log('✅ Публичные маршруты сохранены');
  }
  
  if (hasAdminInRoot) {
    console.log('❌ НАЙДЕНЫ КРИТИЧЕСКИЕ ПРОБЛЕМЫ: админский layout в корне');
  } else {
    console.log('✅ Админский layout изолирован');
  }
  
  if (!hasCriticalIssues && !hasRemovedPublic && !hasAdminInRoot) {
    console.log('\n🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! Маршруты исправлены корректно.');
  } else {
    console.log('\n⚠️  НАЙДЕНЫ ПРОБЛЕМЫ! Требуется дополнительное исправление.');
  }
}

if (require.main === module) {
  compareRouteMaps();
}

export { compareRouteMaps };



