import { NextRequest, NextResponse } from 'next/server'
import { GeneratorFactory, validateGenerationInput } from '../../generators'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { type, input, generationType } = await req.json()

    // Валидация входных данных
    if (!input || !validateGenerationInput(input)) {
      return NextResponse.json(
        { success: false, error: 'Invalid input provided' },
        { status: 400 }
      )
    }

    // Определяем тип генератора
    const generatorType = type || 'manual'
    const apiKey = process.env.OPENAI_API_KEY

    // Создаем генератор
    const generator = GeneratorFactory.create(generatorType, { apiKey })

    let result: string

    // Выполняем генерацию в зависимости от типа
    switch (generationType) {
      case 'title':
        result = await generator.suggestTitle(input)
        break
      
      case 'seo':
        const seoResult = await generator.suggestSEO(input)
        result = JSON.stringify(seoResult)
        break
      
      case 'body':
        result = await generator.draftBody(input)
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
      generator: generatorType,
      metadata: {
        inputLength: input.length,
        outputLength: result.length,
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

// GET endpoint для проверки доступности генераторов
export async function GET() {
  const availableGenerators = ['manual']
  
  if (process.env.OPENAI_API_KEY) {
    availableGenerators.push('openai')
  }

  return NextResponse.json({
    success: true,
    availableGenerators,
    defaultGenerator: 'manual',
    features: {
      title: true,
      seo: true,
      body: true
    }
  })
}









