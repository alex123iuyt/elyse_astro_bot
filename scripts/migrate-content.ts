#!/usr/bin/env tsx

import { PrismaClient, ContentType, PublishStatus, Visibility } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateContent() {
  console.log('🚀 Начинаем миграцию контента...');

  try {
    // Создаем системного пользователя если его нет
    let systemUser = await prisma.user.findUnique({
      where: { email: 'system@elyse.local' },
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@elyse.local',
          name: 'System',
          role: 'ADMIN',
        },
      });
      console.log('✅ Создан системный пользователь');
    }

    // Мигрируем существующие данные из старых таблиц
    // Здесь нужно адаптировать под вашу текущую структуру БД
    
    console.log('📊 Анализируем существующие данные...');

    // Пример миграции для daily-forecast
    const dailyForecasts = [
      {
        type: ContentType.DAILY_FORECAST,
        title: 'Ежедневный прогноз: Луна в Раке',
        effectiveDate: new Date('2025-01-15'),
        sign: 'CANCER',
        status: PublishStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        locale: 'ru',
        body: {
          blocks: [
            {
              type: 'text',
              content: 'Сегодня Луна в Раке создает благоприятную атмосферу для...',
            },
          ],
        },
        summary: 'Ежедневный астрологический прогноз',
        tags: ['ежедневный', 'прогноз', 'луна'],
        meta: {
          moonPhase: 'растущая',
          moonSign: 'CANCER',
          house: 4,
        },
      },
      {
        type: ContentType.DAILY_ADVICE_HOME,
        title: 'Совет дня по дому: Овен',
        effectiveDate: new Date('2025-01-15'),
        sign: 'ARIES',
        status: PublishStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        locale: 'ru',
        body: {
          blocks: [
            {
              type: 'text',
              content: 'Сегодня Овнам рекомендуется заняться...',
            },
          ],
        },
        summary: 'Совет дня для Овнов',
        tags: ['совет', 'дом', 'овен'],
        meta: {
          house: 1,
          domain: 'home',
        },
      },
    ];

    console.log('📝 Создаем базовый контент...');

    for (const forecast of dailyForecasts) {
      try {
        await prisma.content.create({
          data: {
            ...forecast,
            authorId: systemUser.id,
            version: 1,
          },
        });
        console.log(`✅ Создан: ${forecast.title}`);
      } catch (error) {
        console.error(`❌ Ошибка создания ${forecast.title}:`, error.message);
      }
    }

    // Создаем UI тексты
    const uiTexts = [
      {
        type: ContentType.UI_TEXT,
        slug: 'home.title',
        title: 'Заголовок главной страницы',
        body: 'Elyse Astro - Ваш астрологический помощник',
        status: PublishStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        locale: 'ru',
        meta: {
          category: 'navigation',
          placement: 'home',
        },
      },
      {
        type: ContentType.UI_TEXT,
        slug: 'cta.orderNow',
        title: 'Кнопка заказа',
        body: 'Заказать сейчас',
        status: PublishStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        locale: 'ru',
        meta: {
          category: 'button',
          placement: 'cta',
        },
      },
    ];

    console.log('🔤 Создаем UI тексты...');

    for (const text of uiTexts) {
      try {
        await prisma.content.create({
          data: {
            ...text,
            authorId: systemUser.id,
            version: 1,
          },
        });
        console.log(`✅ Создан UI текст: ${text.slug}`);
      } catch (error) {
        console.error(`❌ Ошибка создания UI текста ${text.slug}:`, error.message);
      }
    }

    // Создаем шаблоны для генерации
    const templates = [
      {
        type: ContentType.DAILY_FORECAST,
        locale: 'ru',
        name: 'default',
        bodyJson: {
          blocks: [
            {
              type: 'text',
              content: 'Сегодня {sign} может ожидать {prediction}. {advice}',
            },
          ],
        },
        variables: ['sign', 'prediction', 'advice'],
        isActive: true,
      },
      {
        type: ContentType.DAILY_ADVICE_HOME,
        locale: 'ru',
        name: 'default',
        bodyJson: {
          blocks: [
            {
              type: 'text',
              content: 'Для {sign} сегодня хороший день для {activity}',
            },
          ],
        },
        variables: ['sign', 'activity'],
        isActive: true,
      },
    ];

    console.log('📋 Создаем шаблоны...');

    for (const template of templates) {
      try {
        await prisma.template.create({
          data: template,
        });
        console.log(`✅ Создан шаблон: ${template.type} - ${template.name}`);
      } catch (error) {
        console.error(`❌ Ошибка создания шаблона ${template.type}:`, error.message);
      }
      }
    }

    console.log('🎉 Миграция завершена успешно!');
    console.log('📊 Статистика:');
    console.log(`- Создано контента: ${dailyForecasts.length + uiTexts.length}`);
    console.log(`- Создано шаблонов: ${templates.length}`);

  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем миграцию
migrateContent();


