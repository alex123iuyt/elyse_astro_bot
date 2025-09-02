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

    // Построение запроса для stories
    const where: any = {
      type: 'STORIES',
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
      take: 10,
    })

    // Преобразуем в нужный формат для stories и фильтруем по знаку
    const stories = contentItems.map(item => {
      // Парсим meta как JSON строку
      let meta: any = {};
      try {
        if (item.meta) {
          meta = JSON.parse(item.meta);
        }
      } catch (e) {
        console.warn('Failed to parse meta JSON:', e);
      }

      // Фильтруем по знаку зодиака (если указан конкретный знак)
      const itemSign = meta.sign;
      if (sign !== 'SAGITTARIUS' && itemSign && itemSign !== sign && itemSign !== null) {
        return null; // Пропускаем stories для других знаков
      }

      return {
        id: item.id,
        type: meta.type || 'DAILY_TIPS', // DAILY_TIPS, DO_DONT, TODAYS_LUCK
        title: item.title || 'Daily Story',
        category: meta.category || 'GENERAL',
        slides: meta.slides?.map((slide: any) => ({
          id: slide.id || `slide_${Math.random()}`,
          kind: slide.kind || 'text',
          title: slide.title,
          text: slide.text,
          backgroundImage: slide.backgroundImage,
          backgroundColor: slide.backgroundColor || '#1a1a2e',
          textColor: slide.textColor || '#ffffff',
          durationMs: slide.durationMs || 5000,
        })) || [
          {
            id: `slide_${item.id}`,
            kind: 'text',
            title: item.title,
            text: item.summary || 'Daily insight',
            backgroundImage: meta.backgroundImage,
            backgroundColor: meta.backgroundColor || '#1a1a2e',
            textColor: meta.textColor || '#ffffff',
            durationMs: 5000,
          }
        ],
        publishedAt: item.effectiveDate || item.createdAt,
      };
    }).filter(Boolean)

    // Если нет stories в CMS, возвращаем fallback
    if (stories.length === 0) {
      const fallbackStories = [
        {
          id: 'fallback_001',
          type: 'DAILY_TIPS',
          title: 'Daily Tips',
          category: 'LOVE',
          slides: [
            {
              id: 'slide_001',
              kind: 'text',
              title: 'Love',
              text: "Don't keep track of errors. Instead, thank the people you love.",
              backgroundImage: 'https://images.unsplash.com/photo-1519120944692-1a8d8cfc1056?q=80&w=1200&auto=format&fit=crop',
              backgroundColor: '#1a1a2e',
              textColor: '#ffffff',
              durationMs: 5000
            }
          ],
          publishedAt: new Date().toISOString()
        },
        {
          id: 'fallback_002',
          type: 'DO_DONT',
          title: 'Do / Don\'t',
          category: 'BALANCE',
          slides: [
            {
              id: 'slide_002',
              kind: 'text',
              title: 'Balance',
              text: 'Do: Practice mindfulness. Don\'t: Rush decisions.',
              backgroundImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
              backgroundColor: '#16213e',
              textColor: '#ffffff',
              durationMs: 5000
            }
          ],
          publishedAt: new Date().toISOString()
        },
        {
          id: 'fallback_003',
          type: 'TODAYS_LUCK',
          title: 'Today\'s Luck',
          category: 'FORTUNE',
          slides: [
            {
              id: 'slide_003',
              kind: 'text',
              title: 'Fortune',
              text: 'Your lucky number is 7. Focus on new beginnings.',
              backgroundImage: 'https://images.unsplash.com/photo-1520248730239-095647cc37f1?q=80&w=1200&auto=format&fit=crop',
              backgroundColor: '#0f3460',
              textColor: '#ffffff',
              durationMs: 5000
            }
          ],
          publishedAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackStories,
        meta: {
          date,
          sign,
          timezone: tz,
          total: fallbackStories.length,
          source: 'fallback',
          currentTime: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: stories,
      meta: {
        date,
        sign,
        timezone: tz,
        total: stories.length,
        source: 'cms',
        currentTime: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Error fetching stories:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

