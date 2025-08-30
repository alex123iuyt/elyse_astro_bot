import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🚀 Создаем тестового пользователя с ролью ADMIN...')

    const email = 'admin@elyse.com'
    const password = 'admin123'
    const name = 'Администратор'

    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(`⚠️ Пользователь с email ${email} уже существует`)
      console.log(`📊 ID: ${existingUser.id}`)
      console.log(`👤 Роль: ${existingUser.role}`)
      
      // Обновляем роль на ADMIN если нужно
      if (existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'ADMIN' }
        })
        console.log('✅ Роль обновлена на ADMIN')
      }
      
      return
    }

    // Создаем пользователя с новой упрощенной схемой
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'ADMIN'
      }
    })

    console.log('✅ Тестовый пользователь создан успешно!')
    console.log(`📊 ID: ${user.id}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Имя: ${user.name}`)
    console.log(`🔑 Роль: ${user.role}`)
    console.log(`🔐 Пароль: ${password}`)
    console.log('\n💡 Теперь вы можете войти в админку:')
    console.log(`   1. Откройте http://localhost:3000/auth`)
    console.log(`   2. Введите email: ${email}`)
    console.log(`   3. Введите пароль: ${password}`)
    console.log(`   4. После входа перейдите в http://localhost:3000/admin/content`)

  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем создание пользователя
createAdminUser()
  .then(() => {
    console.log('\n✨ Скрипт завершен!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Критическая ошибка:', error)
    process.exit(1)
  })



