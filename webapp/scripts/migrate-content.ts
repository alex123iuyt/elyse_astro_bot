import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateContent() {
  try {
    console.log('🚀 Начинаем миграцию контента...')

    // 1. Мигрируем существующие DAILY_FORECAST в новые типы
    const dailyForecasts = await prisma.contentItem.findMany({
      where: { type: 'DAILY_FORECAST' }
    })

    console.log(`📊 Найдено ${dailyForecasts.length} записей типа DAILY_FORECAST`)

    for (const forecast of dailyForecasts) {
      const payload = forecast.payload as any
      
      // Создаем DAILY_TIP_DOMAIN для каждого домена
      if (payload.general) {
        await prisma.contentItem.create({
          data: {
            type: 'DAILY_TIP_DOMAIN',
            title: `Совет дня: Общий (${forecast.title})`,
            status: 'DRAFT',
            version: 1,
            payload: {
              domain: 'balance',
              title: 'Совет дня: Общий',
              subtitle: 'На основе ежедневного прогноза',
              icon: '⚖️',
              text: payload.general,
            },
            targeting: forecast.targeting || {},
            schedule: forecast.schedule || {},
            updatedById: forecast.updatedById,
          },
        })
      }

      // Создаем DAILY_FORECAST_DOMAIN для общего прогноза
      if (payload.general) {
        await prisma.contentItem.create({
          data: {
            type: 'DAILY_FORECAST_DOMAIN',
            title: `Прогноз general (${forecast.title})`,
            status: 'DRAFT',
            version: 1,
            payload: {
              domain: 'general',
              text: payload.general,
              mood: 'neutral',
              priority: 'medium',
            },
            targeting: forecast.targeting || {},
            schedule: forecast.schedule || {},
            updatedById: forecast.updatedById,
          },
        })
      }

      // Создаем LUNAR_TODAY на основе даты
      const createdDate = new Date(forecast.createdAt)
      await prisma.contentItem.create({
        data: {
          type: 'LUNAR_TODAY',
          title: `Лунный календарь на ${createdDate.toLocaleDateString('ru-RU')}`,
          status: 'DRAFT',
          version: 1,
          payload: {
            phaseName: 'Растущая Луна',
            phasePct: 75,
            bestTime: { from: '09:00', to: '12:00' },
            avoidDate: createdDate.getDate(),
            advice: 'Благоприятное время для новых начинаний и планирования.',
            moonSign: 'Скорпион',
          },
          targeting: forecast.targeting || {},
          schedule: { timezone: 'Europe/Amsterdam' },
          updatedById: forecast.updatedById,
        },
      })
    }

    // 2. Создаем сторис-шаблон для today
    const existingStories = await prisma.contentItem.findMany({
      where: { type: 'STORYLINE' }
    })

    if (existingStories.length === 0) {
      await prisma.contentItem.create({
        data: {
          type: 'STORYLINE',
          title: 'Сторис для страницы "Сегодня"',
          status: 'PUBLISHED',
          version: 1,
          payload: {
            placement: 'today',
            slides: [
              {
                kind: 'text',
                text: "Don't be afraid to open up and be vulnerable. Vulnerability can bring you closer together and strengthen your love.",
                durationMs: 5000,
                backgroundColor: '#1f2937',
                textColor: '#ffffff',
              },
              {
                kind: 'text',
                text: 'Center yourself with simple rituals: mindful breathing, short walks, and journaling will keep your energy balanced.',
                durationMs: 5000,
                backgroundColor: '#1f2937',
                textColor: '#ffffff',
              },
              {
                kind: 'text',
                text: 'Fortune favors calm persistence. Choose one important task — and gently move it forward today.',
                durationMs: 5000,
                backgroundColor: '#1f2937',
                textColor: '#ffffff',
              },
            ],
            autoPlay: true,
            loop: false,
          },
          targeting: {},
          schedule: { timezone: 'Europe/Amsterdam' },
          updatedById: 'system', // Заглушка для системного пользователя
        },
      })
    }

    // 3. Создаем сид на сегодня и завтра
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayStr = today.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Создаем советы дня на сегодня
    const domains = ['love', 'balance', 'luck']
    for (const domain of domains) {
      await prisma.contentItem.create({
        data: {
          type: 'DAILY_TIP_DOMAIN',
          title: `Совет дня: ${domain === 'love' ? 'Любовь' : domain === 'balance' ? 'Баланс' : 'Удача'}`,
          status: 'PUBLISHED',
          version: 1,
          payload: {
            domain,
            title: `Совет дня: ${domain === 'love' ? 'Любовь' : domain === 'balance' ? 'Баланс' : 'Удача'}`,
            subtitle: `На ${today.toLocaleDateString('ru-RU')}`,
            icon: domain === 'love' ? '❤️' : domain === 'balance' ? '⚖️' : '🍀',
            text: domain === 'love' 
              ? "Don't be afraid to open up and be vulnerable. Vulnerability can bring you closer together and strengthen your love."
              : domain === 'balance'
              ? 'Center yourself with simple rituals: mindful breathing, short walks, and journaling will keep your energy balanced.'
              : 'Fortune favors calm persistence. Choose one important task — and gently move it forward today.',
          },
          targeting: {},
          schedule: { timezone: 'Europe/Amsterdam' },
          updatedById: 'system',
          publishedAt: today,
        },
      })
    }

    // Создаем прогнозы на сегодня
    const forecastDomains = ['general', 'love', 'career']
    for (const domain of forecastDomains) {
      await prisma.contentItem.create({
        data: {
          type: 'DAILY_FORECAST_DOMAIN',
          title: `Прогноз ${domain} на ${todayStr}`,
          status: 'PUBLISHED',
          version: 1,
          payload: {
            domain,
            text: domain === 'general'
              ? 'Stay grounded during this time. Expect misunderstandings due to conflicting energies. Practice clear communication.'
              : domain === 'love'
              ? 'Creative outlets will help you release stress and find balance in relationships.'
              : 'Focus on communication and building strong foundations for future success.',
            mood: 'neutral',
            priority: 'medium',
          },
          targeting: {},
          schedule: { timezone: 'Europe/Amsterdam' },
          updatedById: 'system',
          publishedAt: today,
        },
      })
    }

    // Создаем лунный календарь на сегодня
    await prisma.contentItem.create({
      data: {
        type: 'LUNAR_TODAY',
        title: `Лунный календарь на ${today.toLocaleDateString('ru-RU')}`,
        status: 'PUBLISHED',
        version: 1,
        payload: {
          phaseName: 'Растущая Луна',
          phasePct: 75,
          bestTime: { from: '09:00', to: '12:00' },
          avoidTime: { from: '15:00', to: '18:00' },
          monthDay: today.getDate(),
          advice: 'Благоприятное время для новых начинаний и планирования.',
          moonSign: 'Скорпион',
        },
        targeting: {},
        schedule: { timezone: 'Europe/Amsterdam' },
        updatedById: 'system',
        publishedAt: today,
      },
    })

    // Создаем черновики на завтра
    for (const domain of domains) {
      await prisma.contentItem.create({
        data: {
          type: 'DAILY_TIP_DOMAIN',
          title: `Совет дня: ${domain === 'love' ? 'Любовь' : domain === 'balance' ? 'Баланс' : 'Удача'} (завтра)`,
          status: 'DRAFT',
          version: 1,
          payload: {
            domain,
            title: `Совет дня: ${domain === 'love' ? 'Любовь' : domain === 'balance' ? 'Баланс' : 'Удача'}`,
            subtitle: `На ${tomorrow.toLocaleDateString('ru-RU')}`,
            icon: domain === 'love' ? '❤️' : domain === 'balance' ? '⚖️' : '🍀',
            text: `Введите совет для ${domain === 'love' ? 'любви' : domain === 'balance' ? 'баланса' : 'удачи'} на ${tomorrow.toLocaleDateString('ru-RU')}`,
          },
          targeting: {},
          schedule: { timezone: 'Europe/Amsterdam' },
          updatedById: 'system',
        },
      })
    }

    for (const domain of forecastDomains) {
      await prisma.contentItem.create({
        data: {
          type: 'DAILY_FORECAST_DOMAIN',
          title: `Прогноз ${domain} на ${tomorrowStr} (черновик)`,
          status: 'DRAFT',
          version: 1,
          payload: {
            domain,
            text: `Введите прогноз для ${domain === 'general' ? 'общей сферы' : domain === 'love' ? 'любви' : 'карьеры'} на ${tomorrow.toLocaleDateString('ru-RU')}`,
            mood: 'neutral',
            priority: 'medium',
          },
          targeting: {},
          schedule: { timezone: 'Europe/Amsterdam' },
          updatedById: 'system',
        },
      })
    }

    await prisma.contentItem.create({
      data: {
        type: 'LUNAR_TODAY',
        title: `Лунный календарь на ${tomorrow.toLocaleDateString('ru-RU')} (черновик)`,
        status: 'DRAFT',
        version: 1,
        payload: {
          phaseName: 'Растущая Луна',
          phasePct: 75,
          bestTime: { from: '09:00', to: '12:00' },
          avoidTime: { from: '15:00', to: '18:00' },
          monthDay: tomorrow.getDate(),
          advice: 'Введите совет по лунному календарю на этот день',
          moonSign: 'Скорпион',
        },
        targeting: {},
        schedule: { timezone: 'Europe/Amsterdam' },
        updatedById: 'system',
      },
    })

    console.log('✅ Миграция контента завершена успешно!')
    console.log(`📝 Создано записей на сегодня: ${domains.length + forecastDomains.length + 1}`)
    console.log(`📝 Создано черновиков на завтра: ${domains.length + forecastDomains.length + 1}`)

  } catch (error) {
    console.error('❌ Ошибка при миграции контента:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем миграцию
migrateContent()
  .then(() => {
    console.log('🎉 Миграция завершена!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })

