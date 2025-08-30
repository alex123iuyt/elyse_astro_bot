import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'video' или 'thumbnail'

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'Файл не найден' 
      }, { status: 400 });
    }

    if (!type || !['video', 'thumbnail'].includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Неверный тип файла' 
      }, { status: 400 });
    }

    // Проверяем размер файла (максимум 100MB для видео, 10MB для превью)
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: `Файл слишком большой. Максимум: ${type === 'video' ? '100MB' : '10MB'}` 
      }, { status: 400 });
    }

    // Проверяем тип файла
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    const allowedTypes = type === 'video' ? allowedVideoTypes : allowedImageTypes;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: `Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Создаем директорию для загрузок, если её нет
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Возвращаем URL файла
    const fileUrl = `/uploads/${type}/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'Файл загружен успешно',
      fileUrl,
      fileName,
      fileSize: file.size,
      fileType: file.type
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка загрузки файла' 
    }, { status: 500 });
  }
}
