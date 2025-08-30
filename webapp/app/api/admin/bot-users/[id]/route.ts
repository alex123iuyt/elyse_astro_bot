import { NextRequest, NextResponse } from 'next/server';
import { getBotUsers, saveBotUsers } from '../../../../../lib/bot-users';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = id;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID пользователя не указан' 
      }, { status: 400 });
    }

    // Получаем всех пользователей
    const users = await getBotUsers();
    
    // Находим пользователя для удаления
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Пользователь не найден' 
      }, { status: 404 });
    }

    // Удаляем пользователя
    users.splice(userIndex, 1);
    
    // Сохраняем обновленный список
    await saveBotUsers(users);

    return NextResponse.json({ 
      success: true, 
      message: 'Пользователь успешно удален' 
    });

  } catch (error) {
    console.error('Error deleting bot user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка удаления пользователя' 
    }, { status: 500 });
  }
}

