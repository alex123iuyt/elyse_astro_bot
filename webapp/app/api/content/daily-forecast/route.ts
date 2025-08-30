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

    // Построение запроса для daily forecast
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
        id: 'fallback_daily_forecast',
        title: 'Daily Forecast',
        summary: 'Today is a favorable day for new beginnings and creative projects',
        content: 'Your daily astrological insights and guidance for today.',
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
    let meta: any = {};
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
      summary: contentItems[0].summary || 'Your daily astrological insights',
      content: contentItems[0].body || meta.content || 'No content available',
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
    console.error('Error fetching daily forecast:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

