#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  content: string;
  source: {
    file: string;
    component?: string;
    line?: number;
    context?: string;
  };
  metadata?: Record<string, any>;
}

interface ContentInventory {
  timestamp: string;
  totalItems: number;
  items: ContentItem[];
  summary: {
    byType: Record<string, number>;
    byFile: Record<string, number>;
  };
}

class ContentInventoryScanner {
  private items: ContentItem[] = [];
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async scan(): Promise<ContentInventory> {
    console.log('🔍 Сканирую проект на предмет контента...');
    
    // Сканируем основные директории
    await this.scanWebappContent();
    await this.scanBotContent();
    await this.scanStaticContent();
    
    return this.generateReport();
  }

  private async scanWebappContent() {
    console.log('📱 Сканирую webapp...');
    
    // Сканируем компоненты
    const componentFiles = await glob('webapp/components/**/*.{tsx,ts}', { cwd: this.projectRoot });
    for (const file of componentFiles) {
      await this.scanFile(file, 'component');
    }

    // Сканируем страницы
    const pageFiles = await glob('webapp/app/**/*.{tsx,ts}', { cwd: this.projectRoot });
    for (const file of pageFiles) {
      await this.scanFile(file, 'page');
    }

    // Сканируем данные
    const dataFiles = await glob('webapp/data/**/*.{ts,js,json}', { cwd: this.projectRoot });
    for (const file of dataFiles) {
      await this.scanFile(file, 'data');
    }
  }

  private async scanBotContent() {
    console.log('🤖 Сканирую бота...');
    
    const botFiles = await glob('bot/**/*.{py,json}', { cwd: this.projectRoot });
    for (const file of botFiles) {
      await this.scanFile(file, 'bot');
    }
  }

  private async scanStaticContent() {
    console.log('📄 Сканирую статический контент...');
    
    // Сканируем README и документацию
    const docFiles = await glob('**/*.md', { cwd: this.projectRoot });
    for (const file of docFiles) {
      await this.scanFile(file, 'documentation');
    }
  }

  private async scanFile(filePath: string, context: string) {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Ищем русский текст (базовый паттерн)
      const russianTextPattern = /[а-яё]+/gi;
      const matches = content.match(russianTextPattern);
      
      if (matches && matches.length > 0) {
        // Анализируем строки с русским текстом
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (russianTextPattern.test(line)) {
            await this.analyzeLine(line.trim(), filePath, context, i + 1);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Ошибка при сканировании ${filePath}:`, error);
    }
  }

  private async analyzeLine(line: string, filePath: string, context: string, lineNumber: number) {
    // Пропускаем комментарии и пустые строки
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('#') || !line.trim()) {
      return;
    }

    // Определяем тип контента по паттернам
    const contentType = this.detectContentType(line, filePath);
    
    if (contentType) {
      const item: ContentItem = {
        id: `${filePath}:${lineNumber}`,
        type: contentType,
        title: this.extractTitle(line),
        content: line,
        source: {
          file: filePath,
          component: context,
          line: lineNumber,
          context: this.extractContext(line, filePath)
        },
        metadata: this.extractMetadata(line, contentType)
      };
      
      this.items.push(item);
    }
  }

  private detectContentType(line: string, filePath: string): string | null {
    const lowerLine = line.toLowerCase();
    const lowerFile = filePath.toLowerCase();

    // Ежедневные прогнозы
    if (lowerLine.includes('прогноз') || lowerLine.includes('совет дня') || lowerLine.includes('луна в')) {
      return 'DAILY_FORECAST';
    }

    // Сторисы
    if (lowerLine.includes('сторис') || lowerLine.includes('story') || lowerFile.includes('stories')) {
      return 'STORYLINE';
    }

    // Совместимость
    if (lowerLine.includes('совместимость') || lowerLine.includes('compatibility') || lowerFile.includes('compat')) {
      return 'COMPATIBILITY';
    }

    // Натальная карта
    if (lowerLine.includes('натальная') || lowerLine.includes('natal') || lowerLine.includes('дом') || lowerLine.includes('аспект')) {
      return 'NATAL_TEMPLATE';
    }

    // Онбординг
    if (lowerLine.includes('онбординг') || lowerLine.includes('onboarding') || lowerLine.includes('добро пожаловать')) {
      return 'ONBOARDING_STEP';
    }

    // Push уведомления
    if (lowerLine.includes('уведомление') || lowerLine.includes('push') || lowerLine.includes('notification')) {
      return 'PUSH_TEMPLATE';
    }

    // Астро события
    if (lowerLine.includes('ретроград') || lowerLine.includes('новолуние') || lowerLine.includes('полнолуние') || lowerLine.includes('ингрессия')) {
      return 'ASTRO_EVENT';
    }

    // UI копирайт
    if (lowerLine.includes('кнопка') || lowerLine.includes('подсказка') || lowerLine.includes('заголовок') || lowerLine.includes('описание')) {
      return 'UI_COPY';
    }

    // Маркетинг
    if (lowerLine.includes('баннер') || lowerLine.includes('акция') || lowerLine.includes('промо')) {
      return 'MARKETING_BANNER';
    }

    // Статьи/FAQ
    if (lowerLine.includes('статья') || lowerLine.includes('гайд') || lowerLine.includes('faq') || lowerLine.includes('вопрос')) {
      return 'ARTICLE';
    }

    return null;
  }

  private extractTitle(line: string): string {
    // Извлекаем заголовок из строки
    const cleanLine = line.replace(/['"`]/g, '').trim();
    return cleanLine.length > 100 ? cleanLine.substring(0, 100) + '...' : cleanLine;
  }

  private extractContext(line: string, filePath: string): string {
    // Определяем контекст по имени файла
    if (filePath.includes('stories')) return 'stories';
    if (filePath.includes('forecast')) return 'forecast';
    if (filePath.includes('natal')) return 'natal';
    if (filePath.includes('compat')) return 'compatibility';
    if (filePath.includes('onboarding')) return 'onboarding';
    if (filePath.includes('admin')) return 'admin';
    return 'general';
  }

  private extractMetadata(line: string, contentType: string): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    // Извлекаем знаки зодиака
    const zodiacSigns = ['овен', 'телец', 'близнецы', 'рак', 'лев', 'дева', 'весы', 'скорпион', 'стрелец', 'козерог', 'водолей', 'рыбы'];
    const foundSigns = zodiacSigns.filter(sign => line.toLowerCase().includes(sign));
    if (foundSigns.length > 0) {
      metadata.zodiac = foundSigns;
    }

    // Извлекаем сферы жизни
    const domains = ['любовь', 'работа', 'деньги', 'здоровье', 'семья', 'карьера'];
    const foundDomains = domains.filter(domain => line.toLowerCase().includes(domain));
    if (foundDomains.length > 0) {
      metadata.domains = foundDomains;
    }

    // Извлекаем даты
    const datePattern = /\d{1,2}\.\d{1,2}\.\d{4}/g;
    const dates = line.match(datePattern);
    if (dates) {
      metadata.dates = dates;
    }

    return metadata;
  }

  private generateReport(): ContentInventory {
    const byType: Record<string, number> = {};
    const byFile: Record<string, number> = {};

    // Подсчитываем статистику
    for (const item of this.items) {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byFile[item.source.file] = (byFile[item.source.file] || 0) + 1;
    }

    return {
      timestamp: new Date().toISOString(),
      totalItems: this.items.length,
      items: this.items,
      summary: {
        byType,
        byFile
      }
    };
  }
}

async function main() {
  const projectRoot = process.cwd();
  const scanner = new ContentInventoryScanner(projectRoot);
  
  try {
    const inventory = await scanner.scan();
    
    // Создаем директорию .cache если её нет
    const cacheDir = path.join(projectRoot, '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Сохраняем отчет
    const outputPath = path.join(cacheDir, 'content-inventory.json');
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2), 'utf-8');
    
    console.log('\n✅ Инвентаризация завершена!');
    console.log(`📊 Найдено ${inventory.totalItems} элементов контента`);
    console.log('\n📈 Статистика по типам:');
    Object.entries(inventory.summary.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log(`\n💾 Отчет сохранен в: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Ошибка при инвентаризации:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}





