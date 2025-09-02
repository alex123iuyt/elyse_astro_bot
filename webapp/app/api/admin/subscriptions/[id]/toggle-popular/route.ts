import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH - переключение статуса популярности
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Получаем текущий статус
    const currentPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      select: { isPopular: true }
    });

    if (!currentPlan) {
      return NextResponse.json(
        { error: 'Тариф не найден' },
        { status: 404 }
      );
    }

    // Переключаем статус
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isPopular: !currentPlan.isPopular }
    });

    return NextResponse.json({ 
      plan, 
      message: `Тариф ${plan.isPopular ? 'отмечен как популярный' : 'убрана отметка популярности'} успешно` 
    });
  } catch (error) {
    console.error('Error toggling plan popular status:', error);
    return NextResponse.json(
      { error: 'Ошибка изменения статуса популярности тарифа' },
      { status: 500 }
    );
  }
}




