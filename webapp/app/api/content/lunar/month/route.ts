import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const tz = searchParams.get('tz') || 'Europe/Amsterdam'
    
    // Валидация параметров
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Построение запроса для lunar calendar
    const where: any = {
      type: 'MOON_CALENDAR',
      status: 'PUBLISHED'
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

    // Если нет lunar data в CMS, возвращаем fallback
    if (contentItems.length === 0) {
      const fallbackLunar = {
        currentPhase: {
          name: 'Waxing Crescent',
          percentage: 25,
          sign: 'SCORPIO',
          date: new Date().toISOString()
        },
        monthRange: {
          start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString()
        },
        phases: [
          {
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            phase: 'NEW_MOON',
            sign: 'CAPRICORN',
            icon: '🌑'
          },
          {
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            phase: 'FIRST_QUARTER',
            sign: 'ARIES',
            icon: '🌓'
          },
          {
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            phase: 'FULL_MOON',
            sign: 'LEO',
            icon: '🌕'
          },
          {
            date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
            phase: 'LAST_QUARTER',
            sign: 'SCORPIO',
            icon: '🌗'
          }
        ]
      };
      
      return NextResponse.json({
        success: true,
        data: fallbackLunar,
        meta: {
          date,
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

    const lunarData = {
      currentPhase: meta.currentPhase || {
        name: 'Unknown',
        percentage: 0,
        sign: 'Unknown',
        date: new Date().toISOString()
      },
      monthRange: meta.monthRange || {
        start: new Date().toISOString(),
        end: new Date().toISOString()
      },
      phases: meta.phases || []
    };

    return NextResponse.json({
      success: true,
      data: lunarData,
      meta: {
        date,
        timezone: tz,
        source: 'cms',
        currentTime: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Error fetching lunar data:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

