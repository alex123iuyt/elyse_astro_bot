import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const sign = searchParams.get('sign') || 'SAGITTARIUS' // Default sign
    const tz = searchParams.get('tz') || 'Europe/Amsterdam'
    
    // Валидация параметров
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Построение запроса для forecast
    const where: any = {
      type: 'DAILY_FORECAST',
      status: 'PUBLISHED',
      OR: [
        { sign: sign },
        { sign: null } // Общий forecast для всех знаков
      ]
    }

    // Фильтруем по дате
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    where.AND = [
      {
        OR: [
          {
            effectiveDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        ],
      }
    ]

    // Получаем контент
    const contentItems = await prisma.content.findMany({
      where,
      orderBy: [
        { effectiveDate: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 1,
    })

    // Если нет forecast в CMS, возвращаем fallback
    if (contentItems.length === 0) {
      const fallbackForecast = {
        id: 'fallback_forecast',
        title: 'Navigating through change',
        transitsCount: 5,
        transits: [
          {
            planet: 'MARS',
            sign: 'LIBRA',
            house: 7,
            aspect: 'TRINE'
          },
          {
            planet: 'JUPITER',
            sign: 'TAURUS',
            house: 2,
            aspect: 'SQUARE'
          }
        ],
        focus: [
          {
            category: 'DETERMINATION',
            description: 'Your willpower is strong today'
          },
          {
            category: 'CREATIVITY',
            description: 'Artistic inspiration flows freely'
          },
          {
            category: 'COMMUNICATION',
            description: 'Express your thoughts clearly'
          }
        ],
        troubles: [
          {
            category: 'CONFLICT',
            description: 'Avoid unnecessary arguments'
          },
          {
            category: 'MISCOMMUNICATION',
            description: 'Double-check important messages'
          },
          {
            category: 'STRESS',
            description: 'Take breaks when needed'
          }
        ],
        emotionalShifts: {
          title: 'Emotional Shifts Ahead',
          description: 'Your emotions may feel intensified today as the moon aligns with Scorpio. It\'s a favorable time for introspection but be aware of potential disagreements, especially in personal relationships.'
        },
        careerDynamics: {
          title: 'Career Dynamics',
          description: 'Mars in Libra indicates potential conflicts at work. Stay calm and choose your battles wisely. Understanding different perspectives will be vital to avoid unnecessary tension.'
        },
        publishedAt: new Date().toISOString()
      };
      
      return NextResponse.json({
        success: true,
        data: fallbackForecast,
        meta: {
          date,
          sign,
          timezone: tz,
          source: 'fallback',
          currentTime: new Date().toISOString(),
        },
      })
    }

    // Парсим meta как JSON строку
    let meta = {};
    try {
      if (contentItems[0].meta) {
        meta = JSON.parse(contentItems[0].meta);
      }
    } catch (e) {
      console.warn('Failed to parse meta JSON:', e);
    }

    const forecast = {
      id: contentItems[0].id,
      title: contentItems[0].title || 'Daily Forecast',
      transitsCount: meta.transitsCount || 0,
      transits: meta.transits || [],
      focus: meta.focus || [],
      troubles: meta.troubles || [],
      emotionalShifts: meta.emotionalShifts || {
        title: 'Emotional Shifts',
        description: 'No emotional shifts data available'
      },
      careerDynamics: meta.careerDynamics || {
        title: 'Career Dynamics',
        description: 'No career dynamics data available'
      },
      publishedAt: contentItems[0].effectiveDate || contentItems[0].createdAt
    };

    return NextResponse.json({
      success: true,
      data: forecast,
      meta: {
        date,
        sign,
        timezone: tz,
        source: 'cms',
        currentTime: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Error fetching forecast:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

