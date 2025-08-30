import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH - переключение статуса активности
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Получаем текущий статус
    const currentPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      select: { isActive: true }
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
      data: { isActive: !currentPlan.isActive }
    });

    return NextResponse.json({ 
      plan, 
      message: `Тариф ${plan.isActive ? 'активирован' : 'деактивирован'} успешно` 
    });
  } catch (error) {
    console.error('Error toggling plan active status:', error);
    return NextResponse.json(
      { error: 'Ошибка изменения статуса тарифа' },
      { status: 500 }
    );
  }
}

