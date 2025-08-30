import { NextRequest, NextResponse } from 'next/server';
import { getBotUsers } from '../../../../lib/bot-users';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const segment = searchParams.get('segment') || 'all';
    const inactiveDays = parseInt(searchParams.get('inactive_days') || '7');
    const zodiac = searchParams.get('zodiac') || '';
    const sort = searchParams.get('sort') || 'last_active';
    const order = searchParams.get('order') || 'DESC';

    // Получаем всех пользователей
    let users = await getBotUsers();

    // Применяем поиск
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        user.telegram_id.includes(search) ||
        (user.zodiac_sign && user.zodiac_sign.toLowerCase().includes(searchLower))
      );
    }

    // Применяем сегментацию
    if (segment === 'premium') {
      users = users.filter(user => user.is_premium);
    } else if (segment === 'inactive') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - inactiveDays);
      users = users.filter(user => new Date(user.last_active) < cutoff);
    } else if (segment === 'zodiac' && zodiac) {
      users = users.filter(user => user.zodiac_sign === zodiac);
    }

    // Применяем сортировку
    users.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'message_count':
          aValue = a.message_count;
          bValue = b.message_count;
          break;
        case 'last_active':
        default:
          aValue = new Date(a.last_active);
          bValue = new Date(b.last_active);
          break;
      }

      if (order === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Применяем пагинацию
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching bot users:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка получения пользователей' 
    }, { status: 500 });
  }
}
