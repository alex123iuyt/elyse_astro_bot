import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - обновление промо видео
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { 
      title, 
      description, 
      videoUrl, 
      thumbnailUrl, 
      isActive, 
      showOnMainPage, 
      autoPlay, 
      showOnMobile 
    } = body;

    // Валидация
    if (!title || !description || !videoUrl) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }

    // Если активируем это видео, деактивируем все остальные
    if (isActive) {
      await prisma.promoVideo.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      });
    }

    const video = await prisma.promoVideo.update({
      where: { id },
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        isActive: isActive ?? true,
        showOnMainPage: showOnMainPage ?? true,
        autoPlay: autoPlay ?? true,
        showOnMobile: showOnMobile ?? true
      }
    });

    return NextResponse.json({ promoVideo: video, message: 'Промо видео обновлено успешно' });
  } catch (error) {
    console.error('Error updating promo video:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления промо видео' },
      { status: 500 }
    );
  }
}

