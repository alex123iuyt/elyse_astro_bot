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

    // Построение запроса для daily tips
    const where: any = {
      type: 'DAILY_TIPS',
      status: 'PUBLISHED',
      OR: [
        { sign: sign },
        { sign: null } // Общие tips для всех знаков
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
      take: 5,
    })

    // Если нет tips в CMS, возвращаем fallback
    if (contentItems.length === 0) {
      const fallbackTips = [
        {
          id: 'fallback_tip_001',
          title: 'Love Tip',
          category: 'LOVE',
          text: "Don't keep track of errors. Instead, thank the people you love.",
          icon: '💕',
          publishedAt: new Date().toISOString()
        },
        {
          id: 'fallback_tip_002',
          title: 'Balance Tip',
          category: 'BALANCE',
          text: 'Practice mindfulness and avoid rushing decisions.',
          icon: '⚖️',
          publishedAt: new Date().toISOString()
        },
        {
          id: 'fallback_tip_003',
          title: 'Fortune Tip',
          category: 'FORTUNE',
          text: 'Your lucky number is 7. Focus on new beginnings.',
          icon: '🍀',
          publishedAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackTips,
        meta: {
          date,
          sign,
          timezone: tz,
          source: 'fallback',
          currentTime: new Date().toISOString(),
        },
      })
    }

    // Преобразуем в нужный формат
    const tips = contentItems.map(item => {
      // Парсим meta как JSON строку
      let meta: any = {};
      try {
        if (item.meta) {
          meta = JSON.parse(item.meta);
        }
      } catch (e) {
        console.warn('Failed to parse meta JSON:', e);
      }

      return {
        id: item.id,
        title: item.title || 'Daily Tip',
        category: meta.category || 'GENERAL',
        text: item.summary || meta.text || 'No tip content available',
        icon: meta.icon || '💡',
        publishedAt: item.effectiveDate || item.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      data: tips,
      meta: {
        date,
        sign,
        timezone: tz,
        total: tips.length,
        source: 'cms',
        currentTime: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Error fetching daily tips:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

