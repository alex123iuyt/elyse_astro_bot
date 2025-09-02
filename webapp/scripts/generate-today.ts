import { PrismaClient } from '@prisma/client'
import { contentGenerator } from '../lib/content-generator'

const prisma = new PrismaClient()

async function generateToday() {
  try {
    console.log('🚀 Генерируем контент на сегодня...')

    const today = new Date().toISOString().split('T')[0]
    const tz = 'Europe/Amsterdam'

    console.log(`📅 Дата: ${today}`)
    console.log(`⏰ Часовой пояс: ${tz}`)

    // Генерируем контент
    const [dailyTips, dailyForecasts, lunarToday] = await Promise.all([
      contentGenerator.draftDailyTips(today, tz),
      contentGenerator.draftDailyForecast(today, tz, ['general', 'love', 'career']),
      contentGenerator.draftLunarToday(today, tz),
    ])

    console.log(`✅ Сгенерировано:`)
    console.log(`   - ${dailyTips.length} советов дня`)
    console.log(`   - ${Object.keys(dailyForecasts).length} прогнозов`)
    console.log(`   - 1 лунный календарь`)

    // Создаем записи в базе данных
    const createdItems = []

    // Создаем советы дня
    for (const tip of dailyTips) {
      const createdTip = await prisma.contentItem.create({
        data: {
          type: 'DAILY_TIP_DOMAIN',
          title: tip.title,
          status: 'DRAFT',
          version: 1,
          payload: tip.payload,
          targeting: tip.targeting,
          schedule: tip.schedule,
          updatedById: 'system',
        },
      })
      createdItems.push({ type: 'DAILY_TIP_DOMAIN', id: createdTip.id, title: createdTip.title })
      console.log(`   📝 Создан совет: ${createdTip.title}`)
    }

    // Создаем прогнозы по доменам
    for (const [domain, text] of Object.entries(dailyForecasts)) {
      const createdForecast = await prisma.contentItem.create({
        data: {
          type: 'DAILY_FORECAST_DOMAIN',
          title: `Прогноз ${domain} на ${today}`,
          status: 'DRAFT',
          version: 1,
          payload: {
            domain,
            text,
            mood: 'neutral',
            priority: 'medium',
          },
          targeting: {},
          schedule: { timezone: tz },
          updatedById: 'system',
        },
      })
      createdItems.push({ type: 'DAILY_FORECAST_DOMAIN', id: createdForecast.id, title: createdForecast.title })
      console.log(`   📝 Создан прогноз: ${createdForecast.title}`)
    }

    // Создаем лунный календарь
    const createdLunar = await prisma.contentItem.create({
      data: {
        type: 'LUNAR_TODAY',
        title: lunarToday.title,
        status: 'DRAFT',
        version: 1,
        payload: lunarToday.payload,
        targeting: lunarToday.targeting,
        schedule: lunarToday.schedule,
        updatedById: 'system',
      },
    })
    createdItems.push({ type: 'LUNAR_TODAY', id: createdLunar.id, title: createdLunar.title })
    console.log(`   📝 Создан лунный календарь: ${createdLunar.title}`)

    // Логируем действие
    await prisma.auditLog.create({
      data: {
        action: 'GENERATE_DAILY_CONTENT_SCRIPT',
        entity: 'ContentItem',
        details: {
          date: today,
          timezone: tz,
          generatedItems: createdItems.length,
          types: createdItems.map(item => item.type),
        },
        userId: 'system',
      },
    })

    console.log('\n🎉 Генерация завершена успешно!')
    console.log(`📊 Всего создано: ${createdItems.length} элементов`)
    console.log('\n📋 Созданные элементы:')
    createdItems.forEach((item, index) => {
      console.log(`   ${index + 1}. [${item.type}] ${item.title}`)
    })

    console.log('\n💡 Следующие шаги:')
    console.log('   1. Откройте админку: http://localhost:3000/admin/content')
    console.log('   2. Просмотрите созданные черновики')
    console.log('   3. Отредактируйте и опубликуйте нужный контент')
    console.log('   4. Проверьте страницу "Сегодня" для отображения')

  } catch (error) {
    console.error('❌ Ошибка при генерации контента:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем генерацию
generateToday()
  .then(() => {
    console.log('\n✨ Скрипт завершен!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Критическая ошибка:', error)
    process.exit(1)
  })







