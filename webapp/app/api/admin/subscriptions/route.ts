import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - получение всех подписок
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Ошибка получения тарифов' },
      { status: 500 }
    );
  }
}

// POST - создание новой подписки
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, duration, price, pricePerWeek, savings, features, isActive, isPopular } = body;

    // Валидация
    if (!name || !duration || !price || !pricePerWeek || !features) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        duration,
        price: parseFloat(price),
        pricePerWeek: parseFloat(pricePerWeek),
        savings: savings ? parseInt(savings) : null,
        features: features.filter((f: string) => f.trim()),
        isActive: isActive ?? true,
        isPopular: isPopular ?? false
      }
    });

    return NextResponse.json({ plan, message: 'Тариф создан успешно' });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { error: 'Ошибка создания тарифа' },
      { status: 500 }
    );
  }
}

