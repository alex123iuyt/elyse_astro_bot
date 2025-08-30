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

    // Построение запроса для lunar today
    const where: any = {
      type: 'MOON_TODAY',
      status: 'PUBLISHED',
      visibility: 'PUBLIC'
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
        phase: 'WAXING_CRESCENT',
        sign: 'SCORPIO',
        percentage: 25,
        description: 'The waxing crescent moon in Scorpio brings intensity and transformation. Focus on deep work and personal growth.',
        advice: 'Use this energy to set intentions and work on personal projects that require focus and determination.',
        activities: [
          'Meditation and reflection',
          'Setting new goals',
          'Deep work and study',
          'Personal transformation'
        ],
        avoid: [
          'Rushing decisions',
          'Superficial conversations',
          'Avoiding difficult emotions'
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
      phase: meta.phase || 'UNKNOWN',
      sign: meta.sign || 'UNKNOWN',
      percentage: meta.percentage || 0,
      description: contentItems[0].summary || meta.description || 'No lunar description available',
      advice: meta.advice || 'No lunar advice available',
      activities: meta.activities || [],
      avoid: meta.avoid || []
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
    console.error('Error fetching lunar today data:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

