#!/usr/bin/env tsx

import fetch from 'node-fetch';

interface TestResult {
  url: string;
  status: number;
  success: boolean;
  error?: string;
}

async function testRoute(url: string, expectedStatus: number = 200): Promise<TestResult> {
  try {
    const response = await fetch(url);
    const success = response.status === expectedStatus;
    
    return {
      url,
      status: response.status,
      success,
      error: success ? undefined : `Expected ${expectedStatus}, got ${response.status}`
    };
  } catch (error) {
    return {
      url,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runSmokeTests() {
  console.log('🚀 Запуск smoke-тестов для Elyse Astro Bot...\n');
  
  const baseUrl = 'http://localhost:3000';
  const tests: Array<{ url: string; expectedStatus: number; description: string }> = [
    { url: '/', expectedStatus: 200, description: 'Главная страница' },
    { url: '/today', expectedStatus: 200, description: 'Страница "Сегодня"' },
    { url: '/chat', expectedStatus: 200, description: 'Страница чата' },
    { url: '/profile', expectedStatus: 200, description: 'Страница профиля' },
    { url: '/admin/content', expectedStatus: 302, description: 'Админ CMS (редирект на auth)' },
    { url: '/nonexistent', expectedStatus: 404, description: 'Несуществующий маршрут' },
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    console.log(`🔍 Тестирую: ${test.description} (${test.url})`);
    const result = await testRoute(`${baseUrl}${test.url}`, test.expectedStatus);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${test.url} -> ${result.status}`);
    } else {
      console.log(`❌ ${test.url} -> ${result.status} (${result.error})`);
    }
  }
  
  console.log('\n📊 Результаты тестов:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Пройдено: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 Все тесты пройдены успешно!');
  } else {
    console.log('⚠️  Некоторые тесты не пройдены:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   ❌ ${result.url}: ${result.error}`);
    });
  }
  
  return results;
}

if (require.main === module) {
  runSmokeTests().catch(console.error);
}

export { runSmokeTests, testRoute };



