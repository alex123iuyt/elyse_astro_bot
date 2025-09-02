import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { contentGenerator } from '@/lib/content-generator'
import { generateContentSchema } from '@/lib/schemas/content'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const token = request.cookies.get('elyse_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверяем токен
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Проверяем роль пользователя
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    })

    if (!user || (user.role !== 'EDITOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Получаем параметры запроса
    const body = await request.json()
    const { date, tz = 'Europe/Amsterdam' } = generateContentSchema.parse(body)

    const userId = decoded.id

    // Генерируем контент для всех типов
    const [dailyTips, dailyForecasts, lunarToday] = await Promise.all([
      contentGenerator.draftDailyTips(date, tz),
      contentGenerator.draftDailyForecast(date, tz, ['general', 'love', 'career']),
      contentGenerator.draftLunarToday(date, tz),
    ])

    // Создаем записи в базе данных
    const createdItems = []

    // Создаем советы дня
    for (const tip of dailyTips) {
      const createdTip = await prisma.content.create({
        data: {
          type: 'DAILY_TIP_DOMAIN',
          title: tip.title,
          status: 'DRAFT',
          body: JSON.stringify(tip.payload),
          meta: JSON.stringify({
            targeting: tip.targeting,
            schedule: tip.schedule,
          }),
          authorId: userId as string,
        },
      })
      createdItems.push({ type: 'DAILY_TIP_DOMAIN', id: createdTip.id, title: createdTip.title })
    }

    // Создаем прогнозы по доменам
    for (const [domain, text] of Object.entries(dailyForecasts)) {
      const createdForecast = await prisma.content.create({
        data: {
          type: 'DAILY_FORECAST_DOMAIN',
          title: `Прогноз ${domain} на ${date}`,
          status: 'DRAFT',
          body: text,
          meta: JSON.stringify({
            domain,
            mood: 'neutral',
            priority: 'medium',
            targeting: {},
            schedule: { timezone: tz },
          }),
          authorId: userId as string,
        },
      })
      createdItems.push({ type: 'DAILY_FORECAST_DOMAIN', id: createdForecast.id, title: createdForecast.title })
    }

    // Создаем лунный календарь
    const createdLunar = await prisma.content.create({
      data: {
        type: 'LUNAR_TODAY',
        title: lunarToday.title,
        status: 'DRAFT',
        body: JSON.stringify(lunarToday.payload),
        meta: JSON.stringify({
          targeting: lunarToday.targeting,
          schedule: lunarToday.schedule,
        }),
        authorId: userId as string,
      },
    })
    createdItems.push({ type: 'LUNAR_TODAY', id: createdLunar.id, title: createdLunar.title })

    // Логируем действие
    await prisma.auditLog.create({
      data: {
        action: 'GENERATE_DAILY_CONTENT',
        entityType: 'Content',
        entityId: 'bulk_generation',
        details: JSON.stringify({
          date,
          timezone: tz,
          generatedItems: createdItems.length,
          types: createdItems.map(item => item.type),
        }),
        userId: userId as string,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Generated ${createdItems.length} content items for ${date}`,
      data: {
        createdItems,
        date,
        timezone: tz,
      },
    })

  } catch (error) {
    console.error('Error generating daily content:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

