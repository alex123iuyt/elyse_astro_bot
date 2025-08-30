import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Пока возвращаем mock данные
    const mockContent = [
      {
        id: '1',
        type: 'DAILY_FORECAST',
        title: 'Совет дня: Луна в Раке',
        status: 'PUBLISHED',
        version: 1,
        payload: { general: 'Сегодня Луна находится в знаке Рака. Это время для заботы о близких и домашних делах.' },
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
        updatedBy: { name: 'Admin', email: 'admin@example.com' }
      },
      {
        id: '2',
        type: 'STORYLINE',
        title: 'Ежедневные астрологические советы',
        status: 'DRAFT',
        version: 1,
        payload: { 
          slides: [{ kind: 'text', text: 'Ваш ежедневный астрологический совет', durationMs: 5000 }],
          placement: 'home',
          autoPlay: true
        },
        createdAt: '2025-01-14T15:30:00Z',
        updatedAt: '2025-01-14T15:30:00Z',
        updatedBy: { name: 'Editor', email: 'editor@example.com' }
      }
    ]
    
    return NextResponse.json(mockContent)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Простое создание mock данных
    const newItem = {
      id: Date.now().toString(),
      ...body,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: { name: 'System', email: 'system@example.com' }
    }
    
    console.log('Created content item:', newItem)
    
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}