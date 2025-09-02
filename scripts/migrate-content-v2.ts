#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Content V2 migration...');
  
  try {
    // 1. Generate and apply Prisma migrations
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🗄️ Running database migrations...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    // 2. Create system user if not exists
    console.log('👤 Creating system user...');
    const systemUser = await prisma.user.upsert({
      where: { email: 'system@elyse.astro' },
      update: {},
      create: {
        email: 'system@elyse.astro',
        name: 'System User',
        role: 'ADMIN'
      }
    });
    
    console.log(`✅ System user: ${systemUser.id}`);
    
    // 3. Create sample content types
    console.log('📝 Creating sample content...');
    
    // Sample daily forecast
    const dailyForecast = await prisma.content.create({
      data: {
        type: 'DAILY_FORECAST',
        title: 'Прогноз на сегодня для Овна',
        summary: 'Сегодня благоприятный день для новых начинаний',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        locale: 'ru',
        sign: 'ARIES',
        effectiveDate: new Date(),
        authorId: systemUser.id,
        meta: {
          moonPhase: 'Растущая луна',
          bestTime: '09:00-12:00',
          avoidTime: '15:00-18:00'
        }
      }
    });
    
    console.log(`✅ Daily forecast: ${dailyForecast.id}`);
    
    // Sample story
    const story = await prisma.content.create({
      data: {
        type: 'STORIES',
        title: 'Совет дня: Очищение пространства',
        summary: 'Серия советов по очищению энергетики дома',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        locale: 'ru',
        sign: 'ARIES',
        effectiveDate: new Date(),
        authorId: systemUser.id,
        body: [
          {
            id: '1',
            type: 'text',
            content: 'Начните день с проветривания всех комнат',
            durationMs: 5000
          },
          {
            id: '2',
            type: 'text',
            content: 'Зажгите ароматическую свечу или благовония',
            durationMs: 5000
          },
          {
            id: '3',
            type: 'cta',
            content: 'Практикуйте медитацию 10 минут',
            durationMs: 8000
          }
        ],
        meta: {
          stepsCount: 3,
          totalDuration: 18000
        }
      }
    });
    
    console.log(`✅ Story: ${story.id}`);
    
    // Sample moon calendar
    const moonCalendar = await prisma.content.create({
      data: {
        type: 'MOON_CALENDAR',
        title: 'Лунный календарь на сегодня',
        summary: 'Благоприятные и неблагоприятные периоды дня',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        locale: 'ru',
        effectiveDate: new Date(),
        authorId: systemUser.id,
        meta: {
          moonPhase: 'Полнолуние',
          moonSign: 'Весы',
          bestTime: '06:00-09:00',
          avoidTime: '21:00-00:00'
        }
      }
    });
    
    console.log(`✅ Moon calendar: ${moonCalendar.id}`);
    
    // Sample compatibility
    const compatibility = await prisma.content.create({
      data: {
        type: 'COMPATIBILITY',
        title: 'Совместимость Овен и Телец',
        summary: 'Анализ совместимости знаков зодиака',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        locale: 'ru',
        sign: 'ARIES',
        signB: 'TAURUS',
        authorId: systemUser.id,
        meta: {
          score: 75,
          strengths: ['Энергия и стабильность', 'Смелость и надежность'],
          challenges: ['Импульсивность vs осторожность'],
          advice: 'Найдите баланс между активностью и спокойствием'
        }
      }
    });
    
    console.log(`✅ Compatibility: ${compatibility.id}`);
    
    // Sample domain forecast
    const domainForecast = await prisma.content.create({
      data: {
        type: 'DOMAIN_FORECAST',
        title: 'Прогноз по карьере для Овна',
        summary: 'Астрологический прогноз в профессиональной сфере',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        locale: 'ru',
        sign: 'ARIES',
        effectiveDate: new Date(),
        authorId: systemUser.id,
        meta: {
          domain: 'career',
          house: 10,
          opportunities: ['Новые проекты', 'Повышение'],
          challenges: ['Конфликты с коллегами'],
          advice: 'Проявляйте инициативу, но не забывайте о команде'
        }
      }
    });
    
    console.log(`✅ Domain forecast: ${domainForecast.id}`);
    
    // 4. Create sample templates
    console.log('📋 Creating sample templates...');
    
    const dailyForecastTemplate = await prisma.template.create({
      data: {
        type: 'DAILY_FORECAST',
        locale: 'ru',
        name: 'Стандартный ежедневный прогноз',
        bodyJson: {
          structure: [
            { type: 'greeting', text: 'Доброе утро, {{sign}}!' },
            { type: 'mood', text: 'Сегодня {{moonPhase}} создает атмосферу {{mood}}' },
            { type: 'advice', text: 'Рекомендуется: {{advice}}' },
            { type: 'warning', text: 'Избегайте: {{warning}}' },
            { type: 'closing', text: 'Удачного дня!' }
          ]
        },
        variables: ['sign', 'moonPhase', 'mood', 'advice', 'warning']
      }
    });
    
    console.log(`✅ Daily forecast template: ${dailyForecastTemplate.id}`);
    
    const storyTemplate = await prisma.template.create({
      data: {
        type: 'STORIES',
        locale: 'ru',
        name: 'Стандартная история-совет',
        bodyJson: {
          structure: [
            { type: 'intro', text: 'Сегодняшний совет для {{sign}}' },
            { type: 'main', text: '{{mainAdvice}}' },
            { type: 'action', text: 'Практическое действие: {{action}}' },
            { type: 'motivation', text: '{{motivation}}' }
          ]
        },
        variables: ['sign', 'mainAdvice', 'action', 'motivation']
      }
    });
    
    console.log(`✅ Story template: ${storyTemplate.id}`);
    
    // 5. Create audit logs
    console.log('📊 Creating audit logs...');
    
    await prisma.auditLog.createMany({
      data: [
        {
          entityType: 'CONTENT',
          entityId: dailyForecast.id,
          action: 'CREATE',
          userId: systemUser.id,
          details: { type: 'DAILY_FORECAST', sign: 'ARIES' }
        },
        {
          entityType: 'CONTENT',
          entityId: story.id,
          action: 'CREATE',
          userId: systemUser.id,
          details: { type: 'STORIES', stepsCount: 3 }
        },
        {
          entityType: 'CONTENT',
          entityId: moonCalendar.id,
          action: 'CREATE',
          userId: systemUser.id,
          details: { type: 'MOON_CALENDAR' }
        }
      ]
    });
    
    console.log('✅ Audit logs created');
    
    // 6. Summary
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Content items: 5`);
    console.log(`   - Templates: 2`);
    console.log(`   - Audit logs: 3`);
    console.log(`   - System user: ${systemUser.id}`);
    
    console.log('\n🔍 Next steps:');
    console.log('   1. Verify the content in the admin panel');
    console.log('   2. Test the story viewer component');
    console.log('   3. Check that all content types are working');
    console.log('   4. Test the generation and copy functionality');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();






