import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - получение промо видео
export async function GET() {
  try {
    const promoVideo = await prisma.promoVideo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ promoVideo });
  } catch (error) {
    console.error('Error fetching promo video:', error);
    return NextResponse.json(
      { error: 'Ошибка получения промо видео' },
      { status: 500 }
    );
  }
}

// POST - создание нового промо видео
export async function POST(request: NextRequest) {
  try {
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

    // Деактивируем все существующие промо видео
    if (isActive) {
      await prisma.promoVideo.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const video = await prisma.promoVideo.create({
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

    return NextResponse.json({ promoVideo: video, message: 'Промо видео создано успешно' });
  } catch (error) {
    console.error('Error creating promo video:', error);
    return NextResponse.json(
      { error: 'Ошибка создания промо видео' },
      { status: 500 }
    );
  }
}




