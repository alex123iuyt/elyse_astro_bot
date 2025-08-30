import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - обновление подписки
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { name, duration, price, discount, savings, features, isActive, isPopular } = body;

    // Валидация
    if (!name || !duration || !price || !features) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name,
        duration,
        price: parseFloat(price),
        discount: parseFloat(discount || 0),
        savings: savings ? parseInt(savings) : null,
        features: features, // features уже JSON строка
        isActive: isActive ?? true,
        isPopular: isPopular ?? false
      }
    });

    return NextResponse.json({ plan, message: 'Тариф обновлен успешно' });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления тарифа' },
      { status: 500 }
    );
  }
}

// DELETE - удаление подписки
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.subscriptionPlan.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Тариф удален успешно' });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления тарифа' },
      { status: 500 }
    );
  }
}

