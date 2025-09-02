import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Простой генератор контента (заглушка)
class SimpleContentGenerator {
  async generateTitle(topic: string, type: string): Promise<string> {
    const typeLabels = {
      'daily-tips': 'Совет дня',
      'weekly-forecasts': 'Прогноз на неделю',
      'compatibility': 'Совместимость',
      'natal-chart': 'Натальная карта',
      'onboarding': 'Приветствие',
      'push-notifications': 'Уведомление'
    }
    
    const label = typeLabels[type as keyof typeof typeLabels] || 'Контент'
    return `${label}: ${topic}`
  }

  async generateContent(topic: string, type: string): Promise<string> {
    const templates = {
      'daily-tips': `Сегодня ${topic}. Это время для размышлений и планирования.`,
      'weekly-forecasts': `На этой неделе ${topic}. Будьте внимательны к знакам судьбы.`,
      'compatibility': `Анализ совместимости: ${topic}. Рассмотрите все аспекты отношений.`,
      'natal-chart': `Интерпретация натальной карты: ${topic}. Узнайте больше о себе.`,
      'onboarding': `Добро пожаловать! ${topic}. Мы рады помочь вам на этом пути.`,
      'push-notifications': `Важное уведомление: ${topic}. Не упустите эту возможность.`
    }
    
    return templates[type as keyof typeof templates] || `Контент о ${topic}`
  }

  async generateTags(topic: string, type: string): Promise<string[]> {
    const baseTags = ['астрология', 'прогноз', 'совет']
    const typeTags = {
      'daily-tips': ['ежедневно', 'луна', 'совет'],
      'weekly-forecasts': ['неделя', 'планеты', 'транзиты'],
      'compatibility': ['отношения', 'совместимость', 'знаки'],
      'natal-chart': ['натальная карта', 'личность', 'характер'],
      'onboarding': ['приветствие', 'знакомство', 'начало'],
      'push-notifications': ['уведомление', 'важно', 'срочно']
    }
    
    return [...baseTags, ...(typeTags[type as keyof typeof typeTags] || [])]
  }
}

const generator = new SimpleContentGenerator()

export async function POST(req: NextRequest) {
  try {
    const { type, input, generationType } = await req.json()

    if (!input || !generationType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result: any

    switch (generationType) {
      case 'title':
        result = await generator.generateTitle(input, type)
        break
      
      case 'content':
        result = await generator.generateContent(input, type)
        break
      
      case 'tags':
        result = await generator.generateTags(input, type)
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid generation type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      content: result,
      generator: 'simple',
      metadata: {
        inputLength: input.length,
        outputLength: typeof result === 'string' ? result.length : result.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Generation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint для проверки доступности генератора
export async function GET() {
  return NextResponse.json({
    success: true,
    availableGenerators: ['simple'],
    defaultGenerator: 'simple',
    features: {
      title: true,
      content: true,
      tags: true
    }
  })
}









