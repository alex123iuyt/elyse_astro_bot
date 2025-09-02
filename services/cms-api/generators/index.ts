// ===== INTERFACES =====
export interface IGenerator {
  suggestTitle(input: string): Promise<string>
  suggestSEO(input: string): Promise<{ title: string; description: string }>
  draftBody(input: string): Promise<string>
}

export interface GenerationInput {
  topic: string
  context?: string
  tone?: 'professional' | 'casual' | 'friendly'
  length?: 'short' | 'medium' | 'long'
}

export interface GenerationResult {
  success: boolean
  content: string
  error?: string
  metadata?: {
    tokens?: number
    model?: string
    duration?: number
  }
}

// ===== MANUAL GENERATOR (DEFAULT) =====
export class ManualGenerator implements IGenerator {
  async suggestTitle(input: string): Promise<string> {
    // Простая логика без ИИ
    const words = input.split(' ').slice(0, 5)
    return words.join(' ') + ' - Elyse Astro Bot'
  }

  async suggestSEO(input: string): Promise<{ title: string; description: string }> {
    const title = await this.suggestTitle(input)
    const description = `Узнайте больше о ${input.toLowerCase()}. ${title}`
    
    return { title, description }
  }

  async draftBody(input: string): Promise<string> {
    return `# ${input}

Здесь будет размещен контент о ${input.toLowerCase()}.

## Основные разделы

- Введение в тему
- Основные принципы
- Практическое применение
- Заключение

Для получения полного контента используйте генератор ИИ или напишите вручную.`
  }
}

// ===== OPENAI GENERATOR (PLACEHOLDER) =====
export class OpenAIGenerator implements IGenerator {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async suggestTitle(input: string): Promise<string> {
    // Заглушка - в реальности здесь будет вызов OpenAI API
    console.log('OpenAI Generator: suggestTitle called with:', input)
    return `[AI] ${input} - Генерация заголовка`
  }

  async suggestSEO(input: string): Promise<{ title: string; description: string }> {
    console.log('OpenAI Generator: suggestSEO called with:', input)
    return {
      title: `[AI] ${input} - SEO заголовок`,
      description: `[AI] SEO описание для ${input}`
    }
  }

  async draftBody(input: string): Promise<string> {
    console.log('OpenAI Generator: draftBody called with:', input)
    return `# [AI] ${input}

Это заглушка для OpenAI генератора. В реальности здесь будет сгенерированный контент.

Для активации:
1. Установите OPENAI_API_KEY в .env
2. Замените ManualGenerator на OpenAIGenerator в конфигурации`
  }
}

// ===== GENERATOR FACTORY =====
export class GeneratorFactory {
  static create(type: 'manual' | 'openai', config?: { apiKey?: string }): IGenerator {
    switch (type) {
      case 'openai':
        if (!config?.apiKey) {
          console.warn('OpenAI API key not provided, falling back to ManualGenerator')
          return new ManualGenerator()
        }
        return new OpenAIGenerator(config.apiKey)
      
      case 'manual':
      default:
        return new ManualGenerator()
    }
  }
}

// ===== UTILITY FUNCTIONS =====
export function validateGenerationInput(input: string): boolean {
  return input.trim().length > 0 && input.trim().length < 1000
}

export function sanitizeGeneratedContent(content: string): string {
  // Базовая очистка сгенерированного контента
  return content
    .replace(/\[AI\]/g, '') // Убираем маркеры ИИ
    .trim()
}









