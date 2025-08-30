import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - получение настроек платежей
export async function GET() {
  try {
    // В реальном приложении здесь будет получение настроек из базы данных
    // Пока возвращаем базовые настройки
    const settings = {
      tbank: {
        enabled: false,
        merchantId: '',
        secretKey: '',
        testMode: true,
        webhookUrl: ''
      },
      general: {
        currency: 'RUB',
        autoRenewal: true,
        gracePeriod: 3,
        refundPolicy: '7 дней'
      }
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Ошибка получения настроек платежей' },
      { status: 500 }
    );
  }
}

// POST - сохранение настроек платежей
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // В реальном приложении здесь будет сохранение в базу данных
    console.log('Saving payment settings:', body);
    
    // Имитируем задержку сохранения
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ 
      message: 'Настройки платежей сохранены успешно',
      settings: body
    });
  } catch (error) {
    console.error('Error saving payment settings:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения настроек платежей' },
      { status: 500 }
    );
  }
}

