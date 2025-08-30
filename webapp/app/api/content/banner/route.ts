import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'CHAT_ASTROLOGER'
    
    // Построение запроса для banner
    const where: any = {
      type: 'BANNER',
      status: 'PUBLISHED',
      visibility: 'PUBLIC'
    }

    // Получаем контент
    const contentItems = await prisma.content.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: 1,
    })

    // Если нет banner в CMS, возвращаем fallback
    if (contentItems.length === 0) {
      const fallbackBanner = {
        id: 'fallback_banner',
        type: 'CHAT_ASTROLOGER',
        title: 'Astrocartography',
        subtitle: 'Where on Earth will I find love, money, and career success?',
        backgroundImage: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop',
        ctaText: 'Get the Answer',
        ctaAction: 'CHAT_ADVISOR',
        ctaLink: '/chat'
      };
      
      return NextResponse.json({
        success: true,
        data: fallbackBanner,
        meta: {
          type,
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

    const banner = {
      id: contentItems[0].id,
      type: meta.type || 'CHAT_ASTROLOGER',
      title: contentItems[0].title || 'Daily Banner',
      subtitle: meta.subtitle || 'Get your daily insights',
      backgroundImage: meta.backgroundImage || 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop',
      ctaText: meta.ctaText || 'Learn More',
      ctaAction: meta.ctaAction || 'CHAT_ADVISOR',
      ctaLink: meta.ctaLink || '/chat'
    };

    return NextResponse.json({
      success: true,
      data: banner,
      meta: {
        type,
        source: 'cms',
        currentTime: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Error fetching banner:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

